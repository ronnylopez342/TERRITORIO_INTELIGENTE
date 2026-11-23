'use strict';
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
 '.css':'text/css; charset=utf-8','.json':'application/json','.geojson':'application/geo+json',
 '.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp',
 '.mp4':'video/mp4','.pdf':'application/pdf'};
const server=http.createServer((req,res)=>{
 const uri=decodeURIComponent((req.url||'/').split('?')[0]);
 const target=path.resolve(root,uri==='/'?'index.html':uri.replace(/^\/+/,''));
 if(!target.startsWith(root+path.sep)&&target!==path.join(root,'index.html'))return res.writeHead(403).end();
 fs.stat(target,(error,stat)=>{
  if(error||!stat.isFile())return res.writeHead(404).end('not found');
  res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream'});
  fs.createReadStream(target).pipe(res);
 });
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  for(const size of [{width:1440,height:980,label:'desktop'},{width:390,height:844,label:'mobile'}]){
   const page=await browser.newPage({viewport:{width:size.width,height:size.height}});
   await page.goto('http://127.0.0.1:'+server.address().port+'/?embed=data&skin=practica-pais#data',
      {waitUntil:'domcontentloaded',timeout:45000});
   const tab=page.locator('#tiEmbedTabs button[data-embed-destination="data-encuesta"]');
   await tab.waitFor({state:'attached',timeout:25000});
   await page.evaluate(()=>document.querySelector('#tiEmbedTabs button[data-embed-destination="data-encuesta"]')?.click());
   await page.locator('#data-encuesta .ppv-shell').waitFor({timeout:25000});
   await page.waitForFunction(()=>document.querySelectorAll('#ppv-kpis .ppv-kpi').length===4,{timeout:25000});
   await page.waitForFunction(()=>document.querySelector('#ppv-map-slot #ppViviendaMapCanvas')!==null,{timeout:35000});
   assert.equal(await page.locator('.ppv-filter input[data-ppv-status]').count(),4);
   assert.equal(await page.locator('#ppv-donut .ppv-donut-legend p').count(),4);
   assert.equal(await page.locator('#ppv-bars .ppv-bar-figure>div').count(),3);
   assert.equal(await page.locator('#ppv-map-slot #ppViviendaMapCanvas').count(),1);
   assert.equal(await page.locator('#ppv-detail-open:disabled').count(),1,
     'Los datos privados no deben mostrarse sin un anfitrión autenticado');
   const body=await page.locator('#data-encuesta .ppv-shell').innerText();
   for(const t of ['Mejoramiento de vivienda','Familias identificadas',
    'Mapa de viviendas','Resultados del levantamiento','Documentos y fuentes']){
     assert.ok(body.includes(t),'Falta contenido: '+t);
   }
   fs.mkdirSync(path.join(root,'screenshots'),{recursive:true});
   await page.screenshot({path:path.join(root,'screenshots','pp-vivienda-2026-'+size.label+'.png'),fullPage:true});
   await page.locator('[data-ppv-source="soporte"]').first().click();
   await page.locator('#ppv-sources').waitFor({timeout:10000});
   assert.equal(await page.locator('#ppv-source-soporte').count(),1);
   console.log('VIVIENDA '+size.label+': KPIs, mapa original, filtros, fuentes y privacidad: PASS');
   await page.close();
  }
 }finally{
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
 }
})().catch(err=>{console.error(err);process.exitCode=1;server.close();});
