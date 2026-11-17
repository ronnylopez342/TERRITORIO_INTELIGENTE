/* Smoke actual: navegacion de las cuatro vistas Data, sin depender de previews
   retirados. Usa un servidor local de solo lectura y Chrome sin login. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
 '.css':'text/css; charset=utf-8','.json':'application/json',
 '.geojson':'application/geo+json','.svg':'image/svg+xml','.png':'image/png',
 '.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp',
 '.mp4':'video/mp4','.pdf':'application/pdf'};
const server=http.createServer((req,res)=>{
 let uri;
 try{uri=decodeURIComponent((req.url||'/').split('?')[0]);}
 catch{return res.writeHead(400).end();}
 const rel=uri==='/'?'index.html':uri.replace(/^\/+/, '');
 const dest=path.resolve(root,rel);
 if(dest!==root&&dest!==path.join(root,'index.html')&&!dest.startsWith(root+path.sep))
   return res.writeHead(403).end();
 fs.stat(dest,(err,st)=>{
   if(err||!st.isFile())return res.writeHead(404).end('Not found');
   res.writeHead(200,{'Content-Type':types[path.extname(dest)]||'application/octet-stream'});
   fs.createReadStream(dest).pipe(res);
 });
});
async function run(){
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1420,height:900},acceptDownloads:true});
 const ids=['data-conoce','data-subachoque','data-encuesta','data-explorando'];
 try{
   await page.goto('http://127.0.0.1:'+server.address().port+'/#data',{waitUntil:'domcontentloaded',timeout:45000});
   await page.waitForFunction(()=>!!document.querySelector('.app-view.active[data-view="data"]'),{timeout:25000});
   assert.equal(await page.locator('#dataSubnav [data-module-panel]').count(),4);
   // M2: cada localizador editorial reconstruido debe existir una sola vez en el DOM real.
   const registry=JSON.parse(fs.readFileSync(path.join(root,'editor/registry.json'),'utf8'));
   const located=await page.evaluate(entries=>entries.map(entry=>({
     id:entry.tiId,found:document.querySelectorAll(entry.selector).length
   })),registry.entries);
   assert.ok(located.every(row=>row.found===1),'Registro editorial no univoco: '+JSON.stringify(located.filter(row=>row.found!==1)));
   for(const id of ids){
     const switched=await page.evaluate(id=>selectDataPanel(id),id);
     assert.equal(switched,true,'No se puede activar '+id);
     const result=await page.evaluate(id=>{
       const panel=document.getElementById(id);
       const others=[...document.querySelectorAll('[data-panel-group="data"]')].filter(x=>x.id!==id);
       return {visible:!panel.hidden,active:panel.classList.contains('active'),
        othersHidden:others.every(x=>x.hidden),text:panel.textContent.trim().length};
     },id);
     assert.ok(result.visible&&result.active&&result.othersHidden,'Navegacion incoherente: '+id);
     assert.ok(result.text>200,'Contenido vacio en '+id);
   }
   await page.evaluate(()=>selectDataPanel('data-subachoque'));
   await page.waitForFunction(()=>document.querySelectorAll('#ds3-dimensions [data-ds3-dimension]').length===4,{timeout:25000});
   await page.evaluate(()=>selectDataPanel('data-encuesta'));
   await page.waitForFunction(
     ()=>document.querySelectorAll('#k23-dims [data-k23-dim]').length===4,
     null,{timeout:25000}
   );
   assert.equal(await page.locator('#k23-dims [data-k23-dim]').count(),4,
     'Seccion KoBo: faltan dimensiones reales');
   // R-01: visor historico de doce capitulos, ahora accesible desde Conoce.
   await page.evaluate(()=>selectDataPanel('data-conoce'));
   assert.equal(await page.locator('#cn-tools [data-cn-tool]').count(),4);
   await page.locator('#cn-tools [data-cn-tool="chapters"]').click();
   await page.locator('#cn-tools-dialog[open]').waitFor({timeout:10000});
   const frame=page.frameLocator('#cn-tools-dialog iframe.cn-tools__iframe');
   await frame.locator('#currentChapter').waitFor({state:'visible',timeout:45000});
   await page.waitForFunction(()=>{
     const doc=document.querySelector('#cn-tools-dialog iframe')?.contentDocument;
     return doc?.querySelectorAll('#chapterList .chapter').length===12 &&
       doc?.getElementById('currentChapter')?.textContent.includes('01 / 12');
   },null,{timeout:45000});
   await frame.locator('#chapterToggle').click();
   await frame.locator('#chapterList [data-chapter="12"]').click();
   await page.waitForFunction(()=>{
     const doc=document.querySelector('#cn-tools-dialog iframe')?.contentDocument;
     return doc?.getElementById('currentChapter')?.textContent.includes('12 / 12');
   },null,{timeout:25000});
   await page.locator('[data-cn-tools-close]').click();
   assert.equal(await page.locator('#cn-tools-dialog[open]').count(),0);

   // R-02: las cifras censales deben coincidir con la fuente, sin falsa proyeccion.
   await page.locator('#cn-tools [data-cn-tool="dane"]').click();
   await page.waitForFunction(()=>document.querySelectorAll('#cn-tools-body .cn-tools__metric').length===3,{timeout:20000});
   const dane=await page.locator('#cn-tools-body').innerText();
   for(const figure of ['12.972','14.874','7.217','7.657','4.839'])assert.ok(dane.includes(figure),'DANE missing: '+figure);
   assert.ok((await page.locator('#cn-tools-body .cn-tools__source').getAttribute('href')).includes('25769.pdf'));
   await page.locator('[data-cn-tools-close]').click();

   // R-03: CRUD local compatible con el esquema de datos historico.
   await page.locator('#cn-tools [data-cn-tool="indicators"]').click();
   await page.locator('[data-cn-tool-action="add"]').click();
   await page.locator('#cn-tools-form [name="nombre"]').fill('Cobertura de prueba');
   await page.locator('#cn-tools-form [name="variable"]').fill('Prueba controlada');
   await page.locator('#cn-tools-form [name="fuente"]').fill('Fuente de prueba, no oficial');
   await page.locator('#cn-tools-form [name="metodologia"]').fill('1 entre 4 multiplicado por 100');
   await page.locator('#cn-tools-form [name="formula"]').selectOption('porcentaje');
   await page.locator('#cn-tools-form [name="numerador"]').fill('1');
   await page.locator('#cn-tools-form [name="denominador"]').fill('4');
   assert.match(await page.locator('[data-cn-tools-preview]').innerText(),/25/);
   await page.locator('#cn-tools-form button[type="submit"]').click();
   assert.match(await page.locator('[data-cn-tools-list]').innerText(),/Cobertura de prueba/);
   assert.match(await page.locator('[data-cn-tools-list]').innerText(),/25/);
   await page.locator('[data-cn-tool-action="edit"]').click();
   await page.locator('#cn-tools-form [name="numerador"]').fill('2');
   assert.match(await page.locator('[data-cn-tools-preview]').innerText(),/50/);
   await page.locator('#cn-tools-form button[type="submit"]').click();
   assert.match(await page.locator('[data-cn-tools-list]').innerText(),/50/);
   const download=page.waitForEvent('download',{timeout:15000});
   await page.locator('[data-cn-tool-action="export-json"]').click();
   assert.match((await download).suggestedFilename(),/indicadores-locales-\d{4}-\d{2}-\d{2}\.json/);
   await page.locator('[data-cn-tools-close]').click();
   await page.locator('#cn-tools [data-cn-tool="indicators"]').click();
   assert.match(await page.locator('[data-cn-tools-list]').innerText(),/Cobertura de prueba/);
   page.once('dialog',dlg=>dlg.accept());
   await page.locator('[data-cn-tool-action="delete"]').click();
   assert.equal(await page.locator('[data-cn-tools-list] tr').count(),0);
   await page.locator('[data-cn-tools-import]').setInputFiles({
     name:'indicadores-test.json',mimeType:'application/json',
     buffer:Buffer.from(JSON.stringify({records:[{
       nombre:'Importado de prueba',codigo:'TEST-001',sector:'Salud',variable:'Cobertura',
       fuente:'Fuente de test',metodologia:'Suma directa',periodicidad:'anual',
       formula:'valor',numerador:'12',denominador:'',factor:'1000',unidad:'personas'
     }]}))
   });
   await page.waitForFunction(()=>document.querySelector('[data-cn-tools-list]')?.textContent.includes('Importado de prueba'),null,{timeout:20000});
   assert.match(await page.locator('[data-cn-tools-list]').innerText(),/Importado de prueba/);
   assert.match(await page.locator('[data-cn-tools-list]').innerText(),/12/);
   await page.locator('[data-cn-tools-close]').click();
   // Data Territorio: conservar importaciones estadísticas de pantalla antigua.
   await page.locator('#cn-tools [data-cn-tool="datasets"]').click();
   await page.locator('#cn-tools-dataset-source').waitFor();
   const dataset=page.locator('#cn-tools-body [data-dataset-workspace="externas"]');
   assert.ok(await dataset.locator('input[type="file"]').count(),'Importador estadístico ausente');
   await page.locator('#cn-tools-dataset-source').selectOption('municipales');
   await dataset.locator('input[type="file"]').setInputFiles({
     name:'indicadores-locales.csv',mimeType:'text/csv',
     buffer:Buffer.from('sector,indicador,valor,periodo,fuente,unidad,vereda\nSalud,Cobertura de prueba,25,2025,Prueba local,%,Centro\n')
   });
   await page.waitForFunction(()=>document.querySelector('#cn-tools-body .data-table tbody')?.textContent.includes('Cobertura de prueba'),null,{timeout:25000});
   assert.match(await dataset.locator('.data-table').innerText(),/Salud/);
   await page.locator('[data-cn-tools-close]').click();
   await page.locator('[data-cn-tool="datasets"]').click();
   await page.locator('#cn-tools-dataset-source').selectOption('municipales');
   await page.waitForFunction(()=>document.querySelector('#cn-tools-body .data-table tbody')?.textContent.includes('Cobertura de prueba'),null,{timeout:20000});
   const saved=await page.evaluate(()=>TIData.read('dataset:municipales'));
   assert.equal(saved.rows.length,1);
   assert.equal(saved.rows[0].fuente,'Prueba local');
   const csvDataset=page.waitForEvent('download',{timeout:15000});
   await dataset.locator('[data-export-dataset]').click();
   assert.equal((await csvDataset).suggestedFilename(),'municipales.csv');
   await page.locator('[data-cn-tools-close]').click();
   console.log('BASES LOCALES: importacion CSV, persistencia municipal y exportacion sin publicar: PASS.');

   // Archivo histórico municipal: recuperar registros locales previos sin demos.
   await page.evaluate(()=>TIData.write('municipal-archive:v1',{version:1,records:[{
     id:'archivo-prueba-1',title:'Acta de prueba histórica',type:'Acta',
     dependency:'Secretaría de Planeación',dated:'2024-08-17',
     summary:'Ejemplo local no institucional',source:'Prueba automatizada',
     status:'physical',historic:true,createdAt:'2024-08-17T12:00:00.000Z'
   }]}));
   await page.locator('[data-cn-tool="archive"]').click();
   await page.waitForFunction(()=>document.querySelector('[data-cn-archive-results]')?.textContent.includes('Acta de prueba histórica'),null,{timeout:20000});
   assert.equal(await page.locator('[data-cn-archive-results] tbody tr').count(),1);
   await page.locator('[data-cn-archive-year]').selectOption('2024');
   assert.equal(await page.locator('[data-cn-archive-results] tbody tr').count(),1);
   await page.locator('[data-cn-archive-dep]').selectOption('Secretaría de Planeación');
   await page.locator('[data-cn-archive-q]').fill('Acta de prueba');
   assert.equal(await page.locator('[data-cn-archive-results] tbody tr').count(),1);
   await page.locator('[data-cn-archive-q]').fill('Inexistente');
   assert.equal(await page.locator('[data-cn-archive-results] tbody tr').count(),0);
   await page.locator('[data-cn-archive-q]').fill('');
   await page.locator('[data-cn-archive-action="new"]').click();
   await page.locator('#cn-archive-form [name="title"]').fill('Resolución local de prueba');
   await page.locator('#cn-archive-form [name="dependency"]').fill('Secretaría de Gobierno');
   await page.locator('#cn-archive-form [name="dated"]').fill('2024-11-11');
   await page.locator('#cn-archive-form [name="status"]').selectOption('digital');
   await page.locator('#cn-archive-form [name="file"]').setInputFiles({
     name:'archivo-prueba.txt',mimeType:'text/plain',buffer:Buffer.from('Contenido de ensayo local')
   });
   await page.locator('#cn-archive-form button[type="submit"]').click();
   await page.waitForFunction(()=>document.querySelector('#cn-tools-body .cn-tools__metric strong')?.textContent==='2',null,{timeout:20000});
   await page.locator('[data-cn-archive-year]').selectOption('');
   await page.locator('[data-cn-archive-dep]').selectOption('');
   assert.match(await page.locator('[data-cn-archive-results]').innerText(),/Resolución local de prueba/);
   assert.equal(await page.locator('[data-cn-archive-action="download"]').count(),1);
   const backup=page.waitForEvent('download',{timeout:15000});
   await page.locator('[data-cn-archive-action="download"]').click();
   assert.equal((await backup).suggestedFilename(),'archivo-prueba.txt');
   const archived=page.waitForEvent('download',{timeout:15000});
   await page.locator('[data-cn-archive-action="csv"]').click();
   assert.match((await archived).suggestedFilename(),/memoria-local-\d{4}-\d{2}-\d{2}\.csv/);
   await page.locator('[data-cn-tools-close]').click();
   console.log('MEMORIA LOCAL: antiguos registros, filtros, nuevo archivo, adjunto y exportacion: PASS.');
   // No se ejecutan cambios persistentes en el backend; la prueba es local al navegador.
   console.log('RECUPERACION 2.1: capítulos 01-12, DANE verificado, gestor local CRUD/importe/exporte PASS.');
   console.log('SMOKE DATA ACTUAL: 4 vistas con navegacion funcional, 4 dimensiones y panel KoBo disponibles.');
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
run().catch(e=>{console.error(e);server.close();process.exitCode=1;});
