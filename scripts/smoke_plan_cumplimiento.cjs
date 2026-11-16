/* Comprobaciones end-to-end del diseño vigente 3.3 y 4.2.
   No crea datos simulados ni escribe en servicios externos. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css',
 '.json':'application/json','.geojson':'application/geo+json','.svg':'image/svg+xml',
 '.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'};
const server=http.createServer((req,res)=>{
 let uri;
 try{uri=decodeURIComponent((req.url||'/').split('?')[0]);}catch{return res.writeHead(400).end();}
 const dest=path.resolve(root,uri==='/'?'index.html':uri.replace(/^\/+/,''));
 if(dest!==path.join(root,'index.html')&&!dest.startsWith(root+path.sep))return res.writeHead(403).end();
 fs.stat(dest,(err,s)=>{
  if(err||!s.isFile())return res.writeHead(404).end('Not found');
  res.writeHead(200,{'Content-Type':types[path.extname(dest)]||'application/octet-stream'});
  fs.createReadStream(dest).pipe(res);
 });
});
async function test(){
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const host='http://127.0.0.1:'+server.address().port;
 const out=path.join(root,'screenshots');fs.mkdirSync(out,{recursive:true});
 try{
  await page.goto(host+'/#desarrollo?seccion=desarrollo-accion',{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(()=>{
   const p=document.getElementById('desarrollo-accion');
   return p?.classList.contains('pa-mounted') &&
     p.querySelectorAll('.pa-summary-analytics>.pa-card').length===2;
  },null,{timeout:35000});
  assert.equal(await page.locator('#desarrollo-accion [data-pa-tab]').count(),11);
  assert.equal(await page.locator('#desarrollo-accion .pa-summary-physical-plot').count(),1);
  assert.equal(await page.locator('#desarrollo-accion .pa-summary-budget-trace').count(),1);
  assert.match(await page.locator('#desarrollo-accion .pa-kpi--all').innerText(),/109/);
  assert.match(await page.locator('#desarrollo-accion .pa-summary-analytics').innerText(),/2025/);
  const chart=await page.locator('#desarrollo-accion .pa-summary-physical-plot').innerText();
  assert.ok(chart.trim().length>20,'Ejecucion fisica debe tener contenido');
  await page.screenshot({path:path.join(out,'auditoria-plan33-2025.png'),fullPage:false});
  await page.locator('#pa-year-select').selectOption('2026');
  await page.waitForFunction(()=>document.querySelector('.pa-summary-analytics')?.textContent.includes('2026'),null,{timeout:20000});
  assert.match(await page.locator('.pa-kpi--all').innerText(),/109/);
  await page.locator('#pa-year-select').selectOption('2024');
  await page.waitForFunction(()=>document.querySelector('#desarrollo-accion .pa-empty')?.textContent.includes('2024'),null,{timeout:18000});
  await page.locator('#pa-year-select').selectOption('2025');
  await page.waitForFunction(()=>document.querySelector('.pa-summary-analytics')?.textContent.includes('2025'),null,{timeout:20000});
  console.log('PLAN 3.3: dos paneles compuestos, dos trazados, 109 metas, 2025/2026 y sin datos 2024: PASS');

  await page.goto(host+'/#cumplimiento?seccion=cumplimiento-proyectos',{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(()=>window.TI42Summary?.loaded===true,null,{timeout:35000});
  assert.equal(await page.evaluate(()=>window.TI42Summary.totalRows),30);
  assert.ok(await page.locator('#ti42-meta').count(),'Filtro de meta ausente');
  assert.equal(await page.locator('#cumplimiento-proyectos [data-ti42-view]').count(),10);
  assert.equal(await page.locator('#cumplimiento-proyectos .ti42-project-legend span').count(),4);
  assert.equal(await page.locator('#cumplimiento-proyectos [data-ti42-place-list]').count(),0,'Volvio el listado de veredas bajo el mapa');
  await page.locator('#ti42-meta').selectOption('all');
  assert.equal(await page.evaluate(()=>window.TI42Summary.filteredRows.length),30);
  await page.waitForFunction(()=>{
   const root=document.getElementById('cumplimiento-proyectos');
   return !!root?.querySelector('.ti42-map-stage .leaflet-container') &&
     root.querySelectorAll('.ti-ed-label-wrapper').length>=17;
  },null,{timeout:35000});
  const visual=await page.evaluate(()=>{
   const root=document.getElementById('cumplimiento-proyectos');
   const stage=root.querySelector('.ti42-map-stage');
   const labels=[...root.querySelectorAll('.ti-ed-label-wrapper')];
   return {height:stage.getBoundingClientRect().height,
    labelCount:labels.length,
    labelsVisible:labels.every(e=>getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden'),
    pins:root.querySelectorAll('.ti42-project-pin').length,
    hasOldText:root.textContent.includes('Una vereda mencionada')};
  });
  assert.ok(visual.height>=370,'Mapa comprimido: '+JSON.stringify(visual));
  assert.ok(visual.labelsVisible,'Los nombres de veredas quedaron ocultos: '+JSON.stringify(visual));
  assert.ok(!visual.hasOldText,'Texto de cartografia obsoleto');
  assert.ok(visual.pins>0,'El mapa no muestra marcadores de proyectos: '+JSON.stringify(visual));
  await page.screenshot({path:path.join(out,'auditoria-cumplimiento42-mapa.png'),fullPage:false});
  console.log('CUMPLIMIENTO 4.2: 30 registros, 10 vistas, mapa expandido, etiquetas y pines referenciales: PASS');
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
test().catch(err=>{console.error(err);server.close();process.exitCode=1;});
