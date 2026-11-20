'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const root=path.resolve(__dirname,'..');
const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.b64':'text/plain'};
const server=http.createServer((req,res)=>{
  const url=decodeURIComponent((req.url||'/').split('?')[0]);
  const dest=path.resolve(root,url==='/'?'index.html':url.replace(/^\/+/,''));
  if(!dest.startsWith(root+path.sep))return res.writeHead(403).end();
  fs.stat(dest,(err,stat)=>{
    if(err||!stat.isFile())return res.writeHead(404).end('Not found');
    res.writeHead(200,{'Content-Type':MIME[path.extname(dest)]||'application/octet-stream'});
    fs.createReadStream(dest).pipe(res);
  });
});
(async()=>{
  let base=process.env.BASE_URL?.replace(/\/$/,'');
  if(!base){await new Promise(done=>server.listen(0,'127.0.0.1',done));base='http://127.0.0.1:'+server.address().port;}
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const log=[];
  try{
    for(const width of [1648,1100,780,390]){
      const page=await browser.newPage({viewport:{width,height:960}});
      const errors=[];
      page.on('pageerror',err=>errors.push(err.message));
      await page.goto(base+'/#data?seccion=data-encuesta&dimension=social&area=1.1&tema=1.1-1',{waitUntil:'domcontentloaded',timeout:40000});
      await page.locator('#data-encuesta[data-kobo-ready="true"]').waitFor({timeout:35000});
      assert.equal(await page.locator('.atlas-switch-button').count(),6,'Six chart selectors');
      for(const caseName of ['Aseguramiento','Discapacidad']){
        if(caseName==='Discapacidad'){
          await page.locator('#k23-topics button[data-k23-topic="1.1-4"]').click();
          assert.equal(await page.locator('#k23-topic-title').innerText(),'Discapacidad');
        }
        for(let i=0;i<6;i++){
          await page.locator('.atlas-switch-button').nth(i).click();
          const geom=await page.evaluate(()=>{
            const bounds=selector=>{const n=document.querySelector(selector);if(!n)return null;const r=n.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,scrollWidth:n.scrollWidth,clientWidth:n.clientWidth}};
            return {panel:bounds('#data-encuesta .k23-chart-panel'),chart:bounds('#k23-chart'),shell:bounds('#k23-chart .kobo-static-viewport'),svg:bounds('#k23-chart img.kobo-static-sprite'),selector:bounds('#k23-metric-selector'),buttons:bounds('.atlas-switch'),title:bounds('#k23-topic-title'),insight:bounds('.k23-insight-panel')};
          });
          assert(geom.panel&&geom.chart&&geom.insight,'Chart panels must exist');
          assert(geom.selector.bottom<geom.title.top,'Selector must be above question');
          assert(geom.buttons.scrollWidth<=geom.buttons.clientWidth+3,'Six visible buttons without scroll');
          assert(geom.chart.left>=geom.panel.left-3&&geom.chart.right<=geom.panel.right+3,'Chart outside card '+width+' '+caseName+' '+i);
          assert(geom.shell&&geom.svg,'KoBo PNG image must be present');
          assert(geom.shell.width<=geom.chart.width+3,'Static PNG viewport fits card');
          assert(geom.shell.right<=geom.panel.right+3,'Static PNG must not overlap');
          assert.equal(await page.locator('#k23-chart svg').count(),0,'No SVG charts');
          assert.equal(await page.locator('#k23-chart .k23-bars').count(),0,'No HTML bars');
          if(width>=1100)assert(geom.panel.right<geom.insight.left,'Left and right panels do not overlap');
          log.push({width,caseName,view:i+1,spriteWidth:Math.round(geom.svg?.width||0),chartWidth:Math.round(geom.chart.width)});
        }
      }
      await page.locator('#k23-topics button[data-k23-topic="atlas-G13"]').click();
      await page.locator('#k23-atlas-image').waitFor();
      const img=await page.locator('#k23-atlas-image').evaluate(async image=>{
        await image.decode();
        const r=image.getBoundingClientRect();
        const card=document.querySelector('.k23-chart-panel').getBoundingClientRect();
        return {naturalWidth:image.naturalWidth,displayWidth:r.width,right:r.right,cardRight:card.right};
      });
      assert(img.naturalWidth>100,'Original JPG decoded');
      assert(img.right<=img.cardRight+3,'Original JPG fits left panel');
      assert.equal(await page.locator('#k23-chart svg').count(),0,'JPG must not be redrawn as SVG');
      if(width===1648)await page.screenshot({path:'/tmp/ti-chart-containment-after.png',fullPage:false});
      assert.deepEqual(errors,[],'Page console errors');
      await page.close();
    }
    console.log('STATIC PNG CONTAINMENT PASS',log.length,'static image switches, 4 widths, both KoBo metrics and original JPGs');
    console.log('RESULTS',JSON.stringify(log.filter(x=>x.view===2)));
  }finally{await browser.close();server.close();}
})().catch(err=>{console.error(err.stack||err);server.close();process.exit(1)});
