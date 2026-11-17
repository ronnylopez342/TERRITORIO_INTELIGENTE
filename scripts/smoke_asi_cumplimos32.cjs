'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),dest=path.join(root,'screenshots');
const server=http.createServer((req,res)=>{
 const rel=decodeURIComponent((req.url||'/').split('?')[0]).replace(/^\/+/, '')||'index.html';
 const file=path.resolve(root,rel);
 if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
 const mime={'.js':'text/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.txt':'text/plain','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml'};
 fs.stat(file,(err,stat)=>{if(err||!stat.isFile())return res.writeHead(404).end();res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);});
});
async function run(){
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 page.on('pageerror',e=>console.log('[BROWSER PAGEERROR]',e.message));
 page.on('console',msg=>{if(msg.type()==='error')console.log('[BROWSER CONSOLE]',msg.text());});
 fs.mkdirSync(dest,{recursive:true});
 try{
  await page.goto('http://127.0.0.1:'+server.address().port+'/#desarrollo?seccion=desarrollo-cumplimos',{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForSelector('#desarrollo-cumplimos [data-asi32-root]',{timeout:30000});
  if(await page.locator('#desarrollo-cumplimos').isHidden())await page.evaluate(()=>document.getElementById('tab-desarrollo-cumplimos')?.click());
  try { await page.waitForFunction(()=>document.querySelectorAll('#desarrollo-cumplimos .asi32-kpis').length>=1 && document.querySelector('#desarrollo-cumplimos .asi32-kpis')?.querySelectorAll('.asi32-kpi').length===6,null,{timeout:25000}); }
  catch(error) {
    const debug=await page.evaluate(()=>({
      section:document.querySelector('#desarrollo-cumplimos')?.outerHTML.slice(0,2400),
      body:document.querySelector('#desarrollo-cumplimos [data-asi-body]')?.innerText.slice(0,1300),
      loader:!!document.querySelector('script[src*="asi-cumplimos-32.js"]'),
      path:location.href,
      state:document.querySelector('#desarrollo-cumplimos')?.hidden,
      scriptText:document.querySelector('#desarrollo-cumplimos [data-asi32-root]')?.innerText.slice(0,1200)
    }));
    console.log('ASI32 DIAGNOSTIC',JSON.stringify(debug));
    throw error;
  }
  const rootSel='#desarrollo-cumplimos ';
  assert.equal(await page.locator(rootSel+'[data-asi-tab]').count(),10);
  assert.equal(await page.locator(rootSel+'[data-asi-filter]').count(),5);
  assert.equal(await page.locator(rootSel+'[data-asi-filter="year"]').inputValue(),'all');
  const kpis=await page.locator(rootSel+'.asi32-kpis').first().innerText();
  for(const k of ['109','6','19','29','8'])assert.ok(kpis.includes(k),'Missing KPI '+k);
  // Inicio debe tener UN único encabezado compacto, filtros, KPIs, y botones, en ese orden.
  assert.equal(await page.locator(rootSel+'.asi32-hero').count(),1);
  assert.ok(!(await page.locator(rootSel+'.asi32-hero').innerText()).includes('109 metas'),'No repetir un KPI en el encabezado');
  assert.equal(await page.locator(rootSel+'.asi32-photo-strip').count(),0,'Se reintrodujo el collage antiguo');
  assert.equal(await page.locator(rootSel+'[data-asi-kpis]').count(),1);
  assert.equal(await page.locator(rootSel+'[data-asi-kpis] .asi32-kpi').count(),6);
  assert.equal(await page.locator(rootSel+'[data-asi-body] .asi32-kpi').count(),0,'KPIs duplicados dentro de Inicio');
  assert.equal(await page.locator(rootSel+'.asi32-nav').count(),1);
  const order=await page.evaluate(()=>{
    const items=['.asi32-hero','.asi32-filters','.asi32-topmetrics','.asi32-nav','.asi32-body'];
    return items.map(sel=>[sel,document.querySelector('#desarrollo-cumplimos '+sel)?.getBoundingClientRect().top]);
  });
  assert.ok(order.every(x=>Number.isFinite(x[1]))&&order.every((x,i)=>i===0||x[1]>=order[i-1][1]),
    'Orden de filtros, KPIs, navegación o contenido incorrecto: '+JSON.stringify(order));
  assert.ok((await page.locator(rootSel+'.asi32-hero').boundingBox()).height<175,'Portada desproporcionada');
  assert.equal(await page.locator(rootSel+'.asi32-home-progress').count(),1);
  assert.equal(await page.locator(rootSel+'.asi32-home-finance').count(),1);
  const inicio=await page.locator(rootSel+'[data-asi-body]').innerText();
  for(const value of ['96,9','17,5','103 de 109','108 de 109','2026','2027','Sin reporte'])
    assert.ok(inicio.includes(value),'Falta dato real en Inicio: '+value);
  const kpiText=await page.locator(rootSel+'[data-asi-kpis]').innerText();
  assert.ok(kpiText.includes('97,6')&&kpiText.includes('mil millones'),'No se cargó presupuesto real del cuatrienio');
  assert.ok(!inicio.includes('71,20 %')&&!inicio.includes('3,91 billones'),'No reutilizar porcentajes o presupuestos ficticios del diseño');
  await page.screenshot({path:path.join(dest,'asi32-inicio-desktop.png'),fullPage:true});
  await page.locator(rootSel+'[data-asi-filter="year"]').selectOption('2026');
  await page.waitForFunction(()=>document.querySelector('#desarrollo-cumplimos .asi32-home-annual')?.textContent.includes('Sin reporte'),null,{timeout:12000});
  assert.equal(await page.locator(rootSel+'.asi32-home-annual-value').count(),0);
  assert.equal(await page.locator(rootSel+'.asi32-home-missing').count(),1);
  await page.locator(rootSel+'[data-asi-filter="year"]').selectOption('2024');
  assert.match(await page.locator(rootSel+'.asi32-home-annual').innerText(),/96,9/);
  await page.locator(rootSel+'[data-asi-filter="year"]').selectOption('all');
  // Comparativo ORIGINAL restaurado con dos columnas por entidad, sin cifras ficticias.
  await page.locator(rootSel+'[data-asi-show-exec]').click();
  assert.equal(await page.locator(rootSel+'[data-asi-tab="ejecutivo"]').getAttribute('aria-selected'),'true');
  assert.equal(await page.locator(rootSel+'.asi32-owner-group').count(),8);
  assert.equal(await page.locator(rootSel+'.asi32-owner-col').count(),16);
  assert.equal(await page.locator(rootSel+'.asi32-owner-legend span').count(),2);
  const title=await page.locator(rootSel+'[data-asi-owner-section] .asi32-blockhead h2').innerText();
  assert.match(title,/2025/);
  assert.match(title,/secretarías y entidades/i);
  const legend=await page.locator(rootSel+'.asi32-owner-legend').innerText();
  assert.match(legend,/Ejecución física/);
  assert.match(legend,/Pagos/);
  assert.ok((await page.locator(rootSel+'.asi32-owner-value').allInnerTexts()).some(v=>v.includes('%')),'Faltan porcentajes visibles en columnas');
  const headingColor=await page.locator(rootSel+'[data-asi-owner-section] .asi32-blockhead h2')
    .evaluate(el=>getComputedStyle(el).color);
  assert.equal(headingColor,'rgb(21, 63, 47)','Título de gráfica ilegible sobre fondo claro');
  await page.evaluate(()=>{
    const el=document.querySelector('#desarrollo-cumplimos [data-asi-owner-section]');
    window.scrollTo({top:el.getBoundingClientRect().top+window.scrollY-115,behavior:'instant'});
  });
  await page.screenshot({path:path.join(dest,'asi32-consolidado-desktop.png')});
  await page.locator(rootSel+'[data-asi-filter="year"]').selectOption('2026');
  assert.equal(await page.locator(rootSel+'.asi32-owner-group').count(),0);
  assert.match(await page.locator(rootSel+'.asi32-owner-no-data').innerText(),/Sin reporte de ejecución para 2026/);
  await page.locator(rootSel+'[data-asi-filter="year"]').selectOption('2024');
  assert.equal(await page.locator(rootSel+'.asi32-owner-group').count(),8);
  assert.match(await page.locator(rootSel+'[data-asi-owner-section] .asi32-blockhead').innerText(),/2024/);
  await page.locator(rootSel+'[data-asi-filter="year"]').selectOption('all');
  await page.locator(rootSel+'.asi32-owner-group').first().click();
  assert.equal(await page.locator(rootSel+'.asi32-detail-banner').count(),1);
  assert.ok(await page.locator(rootSel+'.asi32-goal').count()>0);
  await page.screenshot({path:path.join(dest,'asi32-secretaria-desktop.png')});
  await page.locator(rootSel+'[data-asi-back]').click();
  await page.locator(rootSel+'[data-asi-tab="metas"]').click();
  assert.equal(await page.locator(rootSel+'.asi32-goal').count(),109);
  await page.locator(rootSel+'[data-asi-search]').fill('zzzz-no-match');
  assert.equal(await page.locator(rootSel+'.asi32-goal').count(),0);
  await page.locator(rootSel+'[data-asi-clear]').click();
  await page.setViewportSize({width:390,height:844});
  const rect=await page.locator(rootSel+'.asi32').boundingBox();
  assert.ok(rect.width<=400,'Mobile overflow '+JSON.stringify(rect));
  assert.equal(await page.locator(rootSel+'[data-asi-kpis] .asi32-kpi').count(),6);
  assert.equal(await page.locator(rootSel+'[data-asi-body] .asi32-kpi').count(),0);
  const compactHeader=await page.locator(rootSel+'.asi32-hero').boundingBox();
  assert.ok(compactHeader.height<260,'Encabezado móvil demasiado grande: '+JSON.stringify(compactHeader));
  await page.screenshot({path:path.join(dest,'asi32-inicio-mobile.png'),fullPage:true});
  await page.locator(rootSel+'[data-asi-tab="ejecutivo"]').click();
  assert.equal(await page.locator(rootSel+'.asi32-owner-group').count(),8);
  const viewport=await page.evaluate(()=>{
    const chart=document.querySelector('#desarrollo-cumplimos .asi32-owner-scroll');
    return {screen:innerWidth,region:chart?.getBoundingClientRect().width,
      scrollWidth:chart?.scrollWidth,clientWidth:chart?.clientWidth};
  });
  assert.ok(viewport.region<=viewport.screen+2,'Comparativo desborda ventana móvil: '+JSON.stringify(viewport));
  assert.ok(viewport.scrollWidth>viewport.clientWidth,'El móvil debe permitir desplazamiento horizontal dentro de la gráfica');
  await page.locator(rootSel+'[data-asi-owner-section]').scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(dest,'asi32-consolidado-mobile.png')});
  console.log('ASÍ CUMPLIMOS 3.2: INICIO EN ORDEN, KPI ÚNICO, 109 METAS, 2024/2025 REALES, 2026/2027 SIN REPORTE Y MÓVIL: PASS.');
 }finally{await browser.close();await new Promise(ok=>server.close(ok));}
}
run().catch(error=>{console.error(error);server.close();process.exitCode=1;});