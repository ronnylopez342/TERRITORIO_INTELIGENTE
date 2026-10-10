/* Playwright: editorial fidelity, interactions, original storage and mobile. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const base=path.resolve(__dirname,'..');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.geojson':'application/geo+json','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 let uri;
 try{uri=decodeURIComponent((req.url||'/').split('?')[0]);}
 catch {res.writeHead(400).end();return;}
 const dest=path.resolve(base,uri==='/'?'index.html':uri.replace(/^\/+/,''));
 if(!dest.startsWith(base+path.sep)){res.writeHead(403).end();return;}
 fs.stat(dest,(e,stat)=>{
  if(e||!stat.isFile()){res.writeHead(404).end('Not found');return;}
  res.writeHead(200,{'Content-Type':mime[path.extname(dest)]||'application/octet-stream'});
  fs.createReadStream(dest).pipe(res);
 });
});
async function run(){
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const host='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const shots=path.join(base,'screenshots');fs.mkdirSync(shots,{recursive:true});
 const errors=[];
 try{
  const page=await browser.newPage({viewport:{width:1672,height:941},deviceScaleFactor:1,acceptDownloads:true});
  page.on('pageerror',e=>errors.push('desktop: '+e.message));
  await page.goto(host+'/#data?seccion=data-publicaciones',{waitUntil:'domcontentloaded',timeout:40000});
  await page.locator('#pubApp[data-ready="true"]').waitFor({timeout:30000});
  await page.locator('#data-publicaciones:not([hidden])').waitFor({timeout:30000});
  assert.equal(await page.locator('#pubVisualGrid .pub-feature-card').count(),1,'One large featured publication');
  assert.equal(await page.locator('#pubVisualGrid .pub-small-card').count(),4,'Four smaller covers');
  assert.equal(await page.locator('#pubArchiveYears .pub-year').count(),6,'Six historical year cards');
  assert.equal(await page.locator('#data-publicaciones video').count(),0,'No mayor video');
  assert.match(await page.locator('#pubVisualGrid').innerText(),/Diagnóstico territorial de Subachoque 2024/);
  assert.match(await page.locator('#pubArchiveTitle').innerText(),/Repositorio histórico/);
  const metrics=await page.evaluate(()=>{
   const box=sel=>{const r=document.querySelector(sel)?.getBoundingClientRect();return r?{x:r.x,y:r.y,w:r.width,h:r.height,b:r.bottom}:null;};
   return {header:box('#siteHeader'),hero:box('#data-publicaciones .pub-hero'),catalog:box('#data-publicaciones .pub-catalog'),feature:box('#data-publicaciones .pub-feature-card'),right:box('#data-publicaciones .pub-right-grid'),archive:box('#data-publicaciones .pub-archive'),page:box('#pubApp'),legacyHero:getComputedStyle(document.querySelector('.app-view.active[data-view="data"]>.view-hero')).display,scrollWidth:document.documentElement.scrollWidth,viewport:window.innerWidth,viewportHeight:window.innerHeight};
  });
  assert.equal(Math.round(metrics.header.h),58,'Approved header size '+JSON.stringify(metrics));
  assert.ok(metrics.hero.y>=57&&metrics.hero.y<=70,'Hero must begin directly after header '+JSON.stringify(metrics));
  assert.ok(metrics.hero.h>=300&&metrics.hero.h<=355,'Approved compact hero '+JSON.stringify(metrics));
  assert.equal(metrics.legacyHero,'none','Old generic Data hero must not render on Publications');
  assert.ok(Math.abs(metrics.feature.y-metrics.right.y)<4,'Featured and secondary cards must align');
  assert.ok(metrics.feature.x<metrics.right.x,'Featured must be on the left');
  assert.ok(metrics.archive.y>metrics.catalog.y,'Ivory archive beneath catalog');
  assert.ok(metrics.archive.b<=metrics.viewportHeight+15,'Full-width screen should fit in one viewport '+JSON.stringify(metrics));
  assert.ok(metrics.scrollWidth<=metrics.viewport+5,'No horizontal scroll '+JSON.stringify(metrics));
  await page.screenshot({path:path.join(shots,'publicaciones25-ref-desktop-1672x941.png'),fullPage:false});
  await page.locator('[data-pub-filter="boletin"]').click();
  assert.equal(await page.locator('#pubVisualGrid .pub-feature-card').count(),1);
  assert.match(await page.locator('#pubVisualGrid .pub-feature-card').innerText(),/Boletín económico/);
  assert.equal(await page.locator('[data-pub-filter="boletin"]').getAttribute('aria-pressed'),'true');
  await page.locator('[data-pub-filter="todos"]').click();
  assert.equal(await page.locator('.pub-small-card').count(),4);
  await page.locator('#pubHeaderSearch').fill('ecosistémicos');
  assert.equal(await page.locator('.pub-feature-card').count(),1);
  assert.match(await page.locator('.pub-feature-card').innerText(),/Capital natural/);
  await page.locator('#pubHeaderSearch').fill('');
  await page.locator('#pubYear').selectOption('2023');
  assert.equal(await page.locator('.pub-feature-card').count(),1);
  assert.match(await page.locator('.pub-feature-card').innerText(),/Encuesta de percepción ciudadana 2023/);
  await page.locator('#pubYear').selectOption('');
  assert.equal(await page.locator('.pub-small-card').count(),4);
  await page.locator('[data-pub-open="demo-diagnostico24"]').first().click();
  await page.locator('#pubReaderDialog[open]').waitFor();
  assert.match(await page.locator('#pubReaderBody').innerText(),/DEMO VISUAL/);
  assert.match(await page.locator('#pubReaderBody').innerText(),/no se ofrece una descarga inexistente/);
  await page.locator('#pubReaderDialog [data-pub-close]').first().click();
  await page.locator('[data-pub-download="demo-diagnostico24"]').click();
  await page.locator('#pubReaderDialog[open]').waitFor();
  assert.match(await page.locator('#pubReaderBody').innerText(),/No hay un PDF original/);
  await page.locator('#pubReaderDialog [data-pub-close]').first().click();
  await page.locator('#pubManageOpen').click();
  await page.locator('#pubManageDialog[open]').waitFor();
  assert.equal(await page.locator('#publicationGrid').count(),1,'Legacy original-file list preserved');
  assert.equal(await page.locator('#publicationUpload').count(),1,'Legacy file importer preserved');
  await page.locator('#publicationUpload').setInputFiles({
   name:'boletin_ejemplo_prueba.txt',mimeType:'text/plain',
   buffer:Buffer.from('Publicacion local de prueba: datos de Subachoque.','utf8')
  });
  await page.locator('#pubLegacyView summary').click();
  await page.locator('#publicationGrid .document-card').first().waitFor({timeout:18000});
  await page.locator('#pubMetaList .pub-meta-item').first().waitFor({timeout:18000});
  assert.match(await page.locator('#pubReviewAlert').innerText(),/pendiente/);
  await page.locator('#pubMetaList [data-pub-edit]').first().click();
  await page.locator('#pubEditDialog[open]').waitFor();
  await page.locator('#pubEditName').fill('Boletín local de prueba');
  await page.locator('#pubEditType').selectOption('boletin');
  await page.locator('#pubEditAuthor').fill('Equipo de prueba');
  await page.locator('#pubEditSources').fill('Archivo de ejemplo incorporado por navegador; no publicable');
  await page.locator('#pubEditStatus').selectOption('revisada');
  await page.locator('#pubMetadataForm button[type=submit]').click();
  await page.locator('#pubEditDialog:not([open])').waitFor();
  assert.match(await page.locator('#pubMetaList').innerText(),/Boletín local de prueba/);
  assert.match(await page.locator('#pubMetaList').innerText(),/Revisada \(local\)/);
  await page.locator('#pubManageDialog [data-pub-close]').first().click();
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('#pubApp[data-ready="true"]').waitFor({timeout:30000});
  await page.locator('#pubManageOpen').click();
  await page.locator('#pubManageDialog[open]').waitFor();
  await page.locator('#pubMetaList .pub-meta-item').first().waitFor({timeout:18000});
  assert.match(await page.locator('#pubMetaList').innerText(),/Boletín local de prueba/);
  assert.match(await page.locator('#pubMetaList').innerText(),/Revisada \(local\)/);
  // Other Data and top-level routes must retain their visual identity and behavior.
  await page.goto(host+'/#data?seccion=data-encuesta',{waitUntil:'domcontentloaded'});
  await page.locator('#svApp[data-ready=true]').waitFor({timeout:30000});
  assert.equal(await page.locator('#svMapSvg .sv-vereda').count(),17);
  await page.goto(host+'/#data?seccion=data-municipales',{waitUntil:'domcontentloaded'});
  await page.locator('#maApp[data-ready=true]').waitFor({timeout:30000});
  await page.goto(host+'/#home',{waitUntil:'domcontentloaded'});
  await page.locator('.app-view.active[data-view="home"]').waitFor({timeout:30000});
  const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
  mobile.on('pageerror',e=>errors.push('mobile: '+e.message));
  await mobile.goto(host+'/#data?seccion=data-publicaciones',{waitUntil:'domcontentloaded'});
  await mobile.locator('#pubApp[data-ready="true"]').waitFor({timeout:30000});
  assert.equal(await mobile.locator('.pub-small-card').count(),4,'Mobile four editorial cards');
  const md=await mobile.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth}));
  assert.ok(md.scrollWidth<=md.viewport+5,'Mobile overflow '+JSON.stringify(md));
  await mobile.screenshot({path:path.join(shots,'publicaciones25-ref-mobile-390.png'),fullPage:true});
  assert.deepEqual(errors,[],'No uncaught JS errors on desktop or mobile');
  console.log('PUBLICACIONES 2.5 BROWSER: PASS — approved viewport, five article cards, six archive years, filters/search, viewer, honest demo, upload/metadata persist, other routes, mobile.');
 }finally{
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
 }
}
run().catch(e=>{console.error(e.stack||e);process.exitCode=1;});