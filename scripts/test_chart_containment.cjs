'use strict';
/* No generated graphics: original Gxx JPGs and a separate Kobo data table.
 * Check six authentic charts, selector geometry and responsive layout. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const root=path.resolve(__dirname,'..');
const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.jpg':'image/jpeg','.b64':'text/plain'};
const server=http.createServer((req,res)=>{
 const url=decodeURIComponent((req.url||'/').split('?')[0]);
 const file=path.resolve(root,url==='/'?'index.html':url.replace(/^\/+/,''));
 if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
 fs.stat(file,(err,stat)=>{
  if(err||!stat.isFile())return res.writeHead(404).end();
  res.writeHead(200,{'Content-Type':MIME[path.extname(file)]||'application/octet-stream'});
  fs.createReadStream(file).pipe(res);
 });
});
const loc=async page=>page.evaluate(()=>{
 const box=sel=>{const n=document.querySelector(sel);if(!n)return null;const b=n.getBoundingClientRect();return {left:b.left,right:b.right,top:b.top,bottom:b.bottom,width:b.width,scroll:n.scrollWidth,client:n.clientWidth}};
 return {panel:box('.k23-chart-panel'),chart:box('#k23-chart'),right:box('.k23-insight-panel'),selector:box('#k23-metric-selector'),title:box('#k23-topic-title'),buttons:box('.atlas-switch'),img:box('#k23-atlas-image'),table:box('.kobo-results-table')};
});
(async()=>{
 let base=process.env.BASE_URL?.replace(/\/$/,'');
 if(!base){await new Promise(done=>server.listen(0,'127.0.0.1',done));base='http://127.0.0.1:'+server.address().port;}
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 let checked=0;
 try{
  for(const width of [1648,1100,780,390]){
   const page=await browser.newPage({viewport:{width,height:960}});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/#data?seccion=data-encuesta',{waitUntil:'domcontentloaded',timeout:45000});
   await page.locator('#data-encuesta[data-kobo-ready="true"]').waitFor({timeout:35000});
   assert.equal(await page.locator('#k23-topic-title').innerText(),'Aseguramiento');
   assert.equal(await page.locator('.atlas-switch-button').count(),6);
   const p=await loc(page);
   assert(p.selector.bottom<p.title.top,'Selector must be above title');
   assert(p.buttons.scroll<=p.buttons.client+3,'Six buttons must not scroll');
   assert(p.chart.right<=p.panel.right+3,'Chart fits left card');
   if(width>=1100)assert(p.panel.right<p.right.left,'Right cards never overlap');
   for(let v=0;v<6;v++){
    await page.locator('.atlas-switch-button').nth(v).click();
    const img=page.locator('#k23-atlas-image');
    await img.evaluate(n=>n.decode());
    const src=await img.getAttribute('src');
    assert(src.startsWith('assets/atlas-original/G13/G13_'),'Must be ORIGINAL G13 JPG');
    assert(src.endsWith('.jpg'));
    assert.equal(await page.locator('.atlas-switch-button.active').count(),1);
    const b=await loc(page);
    assert(b.img.right<=b.panel.right+3,'JPG fits left card');
    assert.equal(await page.locator('#k23-chart svg, #k23-chart canvas, #k23-chart .kobo-static-sprite').count(),0);
    checked++;
   }
   for(const [id,title,numeric] of [['1.1-1','Aseguramiento','899'],['1.1-4','Discapacidad','854']]){
    await page.locator('#k23-topics button[data-k23-topic="'+id+'"]').click();
    assert.equal(await page.locator('#k23-topic-title').innerText(),title);
    assert.equal(await page.locator('#k23-chart .kobo-results-table').count(),1);
    assert.match(await page.locator('#k23-chart').innerText(),new RegExp(numeric));
    assert.equal(await page.locator('.atlas-switch-button').count(),0,'No fabricated six types for Kobo');
    assert.equal(await page.locator('#k23-chart img, #k23-chart svg, #k23-chart canvas').count(),0,'No recreated graphs');
    const b=await loc(page);assert(b.table.right<=b.panel.right+3,'Table fits card');checked++;
   }
   assert.deepEqual(errors,[],'No client errors');
   if(width===1648){
    await page.locator('#k23-chart button[data-k23-topic="atlas-G13"]').count();
    await page.locator('#k23-topics button[data-k23-topic="atlas-G13"]').click();
    await page.screenshot({path:'/tmp/ti-original-jpg-check.png',fullPage:false});
   }
   await page.close();
  }
  console.log('PASS:',checked,'checks; 24 original G13 JPG decodes, 8 Kobo tables, 4 responsive widths; no synthesized graph.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e.stack||e);server.close();process.exit(1)});
