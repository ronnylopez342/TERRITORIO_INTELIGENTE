'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const crypto=require('node:crypto');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.b64':'text/plain'};
const server=http.createServer((req,res)=>{
 const clean=decodeURIComponent((req.url||'/').split('?')[0]);
 const f=path.resolve(root,clean==='/'?'index.html':clean.replace(/^\/+/,''));
 if(!f.startsWith(root+path.sep))return res.writeHead(403).end();
 fs.stat(f,(e,s)=>{
  if(e||!s.isFile())return res.writeHead(404).end();
  res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'});
  fs.createReadStream(f).pipe(res);
 });
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 const ids=['G01','G05','G07','G11','G13','G15','G20','G23','G28','G29','G30','G34'];
 const atlas=JSON.parse(fs.readFileSync('data/subachoque-atlas-41.json','utf8')).q;
 const manifest=JSON.parse(fs.readFileSync('data/atlas-original-manifest.json','utf8')).questions;
 for(const id of ids){
  const f=manifest[id].views[2];
  const bytes=fs.readFileSync(f);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),manifest[id].sha256[2]);
 }
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 let cases=0;
 try{
  for(const width of [1648,820,390]){
   const page=await browser.newPage({viewport:{width,height:900}});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   for(const id of ids){
    const q=atlas.find(q=>q[0]===id);
    await page.goto(base+'/#data?seccion=data-encuesta&dimension='+q[2]+'&area='+q[3]+'&tema=atlas-'+id,{waitUntil:'domcontentloaded',timeout:40000});
    await page.locator('#data-encuesta[data-kobo-ready="true"]').waitFor({timeout:30000});
    await page.locator('.atlas-switch-button').nth(2).click();
    await page.locator('#k23-atlas-image').evaluate(img=>img.decode());
    const img=await page.locator('#k23-atlas-image').getAttribute('src');
    assert.equal(img,manifest[id].views[2],id+' original JPG');
    assert.equal(await page.locator('.atlas-composition-mask').count(),2,'one in chart and one in dialog');
    assert.equal(await page.locator('#k23-chart .atlas-legible-legend').count(),1);
    const g=await page.evaluate(()=>{
      const rect=el=>{const b=el.getBoundingClientRect();return {left:b.left,right:b.right,top:b.top,bottom:b.bottom,width:b.width,height:b.height}};
      const img=document.querySelector('#k23-atlas-image'),mask=document.querySelector('#k23-chart .atlas-composition-mask'),card=document.querySelector('.k23-chart-panel'),legend=document.querySelector('#k23-chart .atlas-legible-legend');
      return {image:rect(img),mask:rect(mask),card:rect(card),legend:rect(legend),visible:legend.querySelectorAll('li').length};
    });
    assert(g.mask.left>=g.image.left-2&&g.mask.right<=g.image.right+2,'mask remains on the JPG');
    assert(g.mask.top>g.image.top&&g.mask.bottom<g.image.bottom,'mask in source image legend band');
    assert(g.legend.top>=g.image.bottom-3,'readable legend below JPG');
    assert(g.legend.right<=g.card.right+3,'no cards overlap');
    assert(g.visible>0,'legend categories available');
    if(id==='G13'){
      const t=await page.locator('#k23-chart .atlas-legible-legend').innerText();
      for(const term of ['905','33','93,2','3,4'])assert(t.includes(term),'Missing number '+term);
      if(width===1648){
       await page.screenshot({path:'/tmp/atlas-legend-corrected.png',fullPage:false});
       await page.locator('#k23-chart').screenshot({path:'/tmp/atlas-legend-corrected-chart.jpg',type:'jpeg',quality:60});
       await page.locator('.atlas-image-open').click();
       assert(await page.locator('#k23-atlas-dialog').evaluate(el=>el.open));
       assert.equal(await page.locator('#k23-atlas-dialog-mask').isVisible(),true);
       assert((await page.locator('#k23-atlas-dialog-legend').innerText()).includes('905'));
       await page.locator('[data-atlas-close]').click();
      }
    }
    cases++;
   }
   assert.deepEqual(errors,[],'No browser JS errors at width '+width);
   await page.close();
  }
  const page=await browser.newPage({viewport:{width:1260,height:900}});
  for(const id of ['G02','G42']){
    const q=atlas.find(q=>q[0]===id);
    await page.goto(base+'/#data?seccion=data-encuesta&dimension='+q[2]+'&area='+q[3]+'&tema=atlas-'+id,{waitUntil:'domcontentloaded'});
    await page.locator('#data-encuesta[data-kobo-ready="true"]').waitFor({timeout:30000});
    await page.locator('.atlas-switch-button').nth(2).click();
    assert.equal(await page.locator('#k23-chart .atlas-composition-mask').count(),0,'non-stacked charts unchanged');
  }
  await page.close();
  console.log('PASS',cases,'source-JPG legend repairs across 3 widths, G13 zoom, 2 nonstacked controls intact.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e.stack||e);server.close();process.exit(1)});
