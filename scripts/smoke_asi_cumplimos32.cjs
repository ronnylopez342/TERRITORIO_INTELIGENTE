'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const zlib=require('node:zlib');
const root=path.resolve(__dirname,'..'),dest=path.join(root,'screenshots');
const data=JSON.parse(zlib.gunzipSync(Buffer.from(fs.readFileSync(path.join(root,'data/asi-cumplimos-32.gz.b64.txt'),'utf8').trim(),'base64')));
const archive=JSON.parse(zlib.gunzipSync(Buffer.from(fs.readFileSync(path.join(root,'data/asi-cumplimos-32-fuentes.gz.b64.txt'),'utf8').trim(),'base64')));
const server=http.createServer((req,res)=>{
 const rel=decodeURIComponent((req.url||'/').split('?')[0]).replace(/^\/+/, '')||'index.html';
 const file=path.resolve(root,rel);
 if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
 const mime={'.js':'text/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.txt':'text/plain','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml'};
 fs.stat(file,(err,stat)=>{if(err||!stat.isFile())return res.writeHead(404).end();res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);});
});
async function run(){
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,channel:process.env.ASI_BROWSER_CHANNEL||undefined,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const pageErrors=[];
 page.on('pageerror',e=>pageErrors.push(e.message));
 page.on('requestfailed',r=>console.log('[NETWORK]',new URL(r.url()).origin+new URL(r.url()).pathname));
 page.on('response',r=>{if(r.status()>=400)console.log('[HTTP '+r.status()+']',new URL(r.url()).pathname);});
 page.on('console',msg=>{if(msg.type()==='error')console.log('[BROWSER CONSOLE]',msg.text());});
 fs.mkdirSync(dest,{recursive:true});
 try{
  const base=process.env.ASI_BASE_URL||'http://127.0.0.1:'+server.address().port;
  await page.goto(base.replace(/\/$/,'')+'/#desarrollo?seccion=desarrollo-cumplimos',{waitUntil:'domcontentloaded',timeout:45000});
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
  const headingClear=await page.evaluate(()=>{
    const kicker=document.querySelector('#desarrollo-cumplimos .asi32-kicker');
    const header=document.querySelector('#siteHeader');
    return kicker.getBoundingClientRect().top>=header.getBoundingClientRect().bottom;
  });
  assert.ok(headingClear,'La identificación institucional queda oculta bajo la barra fija');
  assert.equal(await page.locator(rootSel+'[data-asi-tab]').count(),9);
  assert.equal(await page.locator(rootSel+'[data-asi-tab="territorio"]').count(),0);
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
  assert.equal(await page.locator(rootSel+'.asi32-paired .asi32-vcolumn').count(),8);
  assert.equal(await page.locator(rootSel+'.asi32-stages .asi32-vcolumn').count(),5);
  assert.match(await page.locator(rootSel+'.asi32-stages').innerText(),/Obligaciones/);
  await page.locator(rootSel+'.asi32-stages').screenshot({path:path.join(dest,'asi32-finanzas-desktop.png')});
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
  assert.equal(await page.locator(rootSel+'.asi32-stages .asi32-home-missing').count(),5);
  assert.equal(await page.locator(rootSel+'.asi32-paired .asi32-home-missing').count(),2);
  await page.locator(rootSel+'[data-asi-filter="year"]').selectOption('2024');
  assert.equal(await page.locator(rootSel+'.asi32-owner-group').count(),8);
  assert.match(await page.locator(rootSel+'[data-asi-owner-section] .asi32-blockhead').innerText(),/2024/);
  await page.locator(rootSel+'[data-asi-filter="year"]').selectOption('all');
  await page.locator(rootSel+'.asi32-owner-group').first().click();
  assert.equal(await page.locator(rootSel+'[data-asi-tab]').count(),9,'La ficha no agrega otra navegación');
  assert.equal(await page.locator(rootSel+'.asi32-detail-banner').count(),1);
  assert.ok(await page.locator(rootSel+'.asi32-goal').count()>0);
  assert.equal(await page.locator(rootSel+'.asi32-goal-chart .asi32-vcolumn').count(),2*await page.locator(rootSel+'.asi32-goal').count());
  await page.locator(rootSel+'.asi32-goal-chart [data-asi-goal]').first().click();
  await page.locator(rootSel+'.asi32-detail-banner').scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(dest,'asi32-secretaria-desktop.png')});
  await page.locator(rootSel+'[data-asi-back]').click();
  assert.equal(await page.locator(rootSel+'[data-asi-tab="ejecutivo"]').getAttribute('aria-selected'),'true');
  // Cada una de las ocho fichas debe corresponder exactamente a sus metas de la fuente.
  for(let owner=0;owner<data.o.length;owner++){
    await page.locator(rootSel+'.asi32-owner-group[data-asi-owner="'+owner+'"]').click();
    const expected=data.g.filter(g=>g[4]===owner).map(g=>g[0]);
    const actual=await page.locator(rootSel+'.asi32-goal').evaluateAll(nodes=>nodes.map(n=>Number(n.id.replace('asi32-meta-',''))));
    assert.deepEqual(actual,expected,'Metas incorrectas de '+data.o[owner]);
    assert.match(await page.locator(rootSel+'.asi32-detail-banner h2').innerText(),new RegExp(data.o[owner].replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
    assert.equal(await page.locator(rootSel+'[data-asi-tab]').count(),9);
    if(owner===1){
      await page.locator(rootSel+'.asi32-goal-chart').screenshot({path:path.join(dest,'asi32-metas-entidad-desktop.png')});
      await page.locator(rootSel+'.asi32-paired').screenshot({path:path.join(dest,'asi32-ejecucion-entidad-desktop.png')});
    }
    await page.locator(rootSel+'[data-asi-back]').click();
  }
  await page.locator(rootSel+'[data-asi-tab="plan"]').click();
  assert.equal(await page.locator(rootSel+'.asi32-plan-table tbody tr').count(),24);
  assert.equal(await page.locator(rootSel+'.asi32-home-progress').count(),0);
  await page.locator(rootSel+'.asi32-plan-table').screenshot({path:path.join(dest,'asi32-plan-desktop.png'),style:'#siteHeader{visibility:hidden!important}'});
  assert.equal(await page.locator(rootSel+'.asi32-poai tbody tr').count(),109);
  const independents=page.locator(rootSel+'.asi32-independent .asi32-source-expand');
  assert.deepEqual(await independents.locator('tbody').evaluateAll(nodes=>nodes.map(n=>n.querySelectorAll('tr').length)),[17,64,12]);
  await page.locator(rootSel+'.asi32-poai summary').click();
  await page.locator(rootSel+'.asi32-poai [data-ti32-row="3"]').click();
  assert.equal(await page.locator(rootSel+'.asi32-original-fields[open] dt').count(),Object.keys(archive.sheets[1].rows.find(r=>r.row===3).cells).length);
  await page.keyboard.press('Escape');
  await page.locator(rootSel+'.asi32-poai').screenshot({path:path.join(dest,'asi32-poai-desktop.png'),style:'#siteHeader{visibility:hidden!important}'});
  for(const [tab,n] of [['lineas',6],['sectores',19],['programas',29]]){
    await page.locator(rootSel+'[data-asi-tab="'+tab+'"]').click();
    assert.equal(await page.locator(rootSel+'.asi32-group').count(),n);
    assert.equal(await page.locator(rootSel+'[data-asi-class-row]').count(),n*4);
  }
  await page.locator(rootSel+'[data-asi-tab="lineas"]').click();
  await page.locator(rootSel+'.asi32-section-grid').screenshot({path:path.join(dest,'asi32-lineas-desktop.png')});
  await page.locator(rootSel+'[data-asi-tab="indicadores"]').click();
  assert.equal(await page.locator(rootSel+'.asi32-indicator-table tbody tr').count(),109);
  assert.equal(await page.locator(rootSel+'.asi32-source-coverage tbody tr').count(),15);
  assert.equal(await page.locator(rootSel+'.asi32-ods-row').count(),16,'ODS consignados y categoría sin ODS, sin inferir la meta 63');
  assert.ok((await page.locator(rootSel+'.asi32-ods').innerText()).includes('ODS no informado'));
  await page.locator(rootSel+'.asi32-source-coverage').screenshot({path:path.join(dest,'asi32-cobertura-excel-desktop.png'),style:'#siteHeader{visibility:hidden!important}'});
  for(const s of archive.sheets){
    await page.locator(rootSel+'.asi32-source-coverage [data-ti32-sheet="'+s.id+'"]').click();
    assert.equal(await page.locator(rootSel+'.asi32-source-dialog').isVisible(),true);
    assert.equal(await page.locator(rootSel+'#asi32-source-title').innerText(),s.name.trim());
    const expected=Math.min(20,s.rows.length);
    if(expected)assert.equal(await page.locator(rootSel+'.asi32-source-dialog tbody tr').count(),expected);
    else assert.match(await page.locator(rootSel+'.asi32-source-dialog').innerText(),/no contiene registros/);
    if(s.rows.length>20){
      await page.locator(rootSel+'[data-ti32-page="1"]').click();
      assert.equal(await page.locator(rootSel+'.asi32-source-dialog tbody tr').first().locator('td').first().innerText(),String(s.rows[20].row));
    }
    if(s.id===1){
      await page.locator(rootSel+'[data-ti32-page="-1"]').click();
      const [download]=await Promise.all([page.waitForEvent('download'),page.locator(rootSel+'[data-ti32-download]').click()]);
      const csv=fs.readFileSync(await download.path(),'utf8');
      assert.ok(csv.includes('"BP3"')&&csv.includes('"625560655"')&&csv.includes('"EJ111"'),'Descarga conserva campos de la primera y última meta del POAI');
      await page.locator(rootSel+'.asi32-source-dialog').screenshot({path:path.join(dest,'asi32-fuentes-desktop.png')});
    }
    await page.keyboard.press('Escape');
    assert.equal(await page.locator(rootSel+'.asi32-source-dialog').isVisible(),false);
  }
  // La última página de actividades 2024 no puede perder la fila 584.
  await page.locator(rootSel+'.asi32-source-coverage [data-ti32-sheet="3"]').click();
  for(let i=1;i<Math.ceil(archive.sheets[3].rows.length/20);i++)await page.locator(rootSel+'[data-ti32-page="1"]').click();
  assert.equal(await page.locator(rootSel+'.asi32-source-dialog tbody tr').last().locator('td').first().innerText(),'584');
  await page.keyboard.press('Escape');
  assert.match(await page.locator(rootSel+'.asi32-indicator-table tbody tr').first().innerText(),/Documentos de planeación elaborados/);
  await page.locator(rootSel+'[data-asi-open-meta="1"]').click();
  assert.equal(await page.locator(rootSel+'[data-asi-tab="metas"]').getAttribute('aria-selected'),'true');
  assert.match(await page.locator(rootSel+'#asi32-meta-1').innerText(),/0,25 Número/);
  await page.locator(rootSel+'#asi32-meta-1 [data-ti32-sheet="3"]').click();
  assert.equal(await page.locator(rootSel+'.asi32-source-dialog tbody tr').count(),archive.sheets[3].rows.filter(r=>r.goal===1).length);
  await page.keyboard.press('Escape');
  await page.locator(rootSel+'#asi32-meta-1 [data-ti32-sheet="5"]').click();
  assert.match(await page.locator(rootSel+'.asi32-source-dialog').innerText(),/Hoja vacía/);
  await page.keyboard.press('Escape');
  await page.locator(rootSel+'[data-asi-tab="metas"]').click();
  assert.equal(await page.locator(rootSel+'.asi32-goal').count(),109);
  await page.locator(rootSel+'[data-asi-search]').fill('zzzz-no-match');
  assert.equal(await page.locator(rootSel+'.asi32-goal').count(),0);
  await page.locator(rootSel+'[data-asi-clear]').click();
  // Todos los filtros se contrastan contra las filas reales y persisten entre pestañas.
  for(const [filter,col] of [['line',1],['sector',2],['program',3],['owner',4]]){
    const value=String(data.g[0][col]);
    await page.locator(rootSel+'[data-asi-filter="'+filter+'"]').selectOption(value);
    await page.locator(rootSel+'[data-asi-tab="metas"]').click();
    assert.equal(await page.locator(rootSel+'.asi32-goal').count(),data.g.filter(g=>String(g[col])===value).length);
    await page.locator(rootSel+'[data-asi-tab="plan"]').click();
    assert.equal(await page.locator(rootSel+'.asi32-poai tbody tr').count(),data.g.filter(g=>String(g[col])===value).length);
    assert.equal(await page.locator(rootSel+'.asi32-source-limit').count(),3,'No asignar registros independientes a las metas filtradas');
    await page.locator(rootSel+'[data-asi-tab="ejecutivo"]').click();
    assert.equal(await page.locator(rootSel+'[data-asi-filter="'+filter+'"]').inputValue(),value);
    assert.equal(await page.locator(rootSel+'.asi32-hero').count(),1);
    assert.equal(await page.locator(rootSel+'.asi32-nav').count(),1);
    assert.equal(await page.locator(rootSel+'.asi32-kpis').count(),1);
    await page.locator(rootSel+'[data-asi-clear]').click();
  }
  await page.locator(rootSel+'[data-asi-tab="inicio"]').focus();
  await page.keyboard.press('End');
  assert.equal(await page.locator(rootSel+'[data-asi-tab="indicadores"]').getAttribute('aria-selected'),'true');
  await page.keyboard.press('Home');
  assert.equal(await page.locator(rootSel+'[data-asi-tab="inicio"]').getAttribute('aria-selected'),'true');
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
  for(const tab of ['inicio','ejecutivo','plan','lineas','sectores','programas','dependencias','metas','indicadores']){
    await page.locator(rootSel+'[data-asi-tab="'+tab+'"]').click();
    const widths=await page.evaluate(()=>({body:document.documentElement.scrollWidth,viewport:innerWidth}));
    assert.ok(widths.body<=widths.viewport+2,tab+' desborda el documento móvil: '+JSON.stringify(widths));
  }
  await page.locator(rootSel+'[data-asi-tab="indicadores"]').click();
  await page.locator(rootSel+'.asi32-source-coverage [data-ti32-sheet="1"]').click();
  const modal=await page.locator(rootSel+'.asi32-source-dialog').boundingBox();
  assert.ok(modal.width<=390&&modal.height<=844,'Consulta móvil fuera de ventana');
  await page.screenshot({path:path.join(dest,'asi32-fuentes-mobile.png')});
  await page.keyboard.press('Escape');
  await page.locator(rootSel+'[data-asi-tab="ejecutivo"]').click();
  await page.locator(rootSel+'.asi32-owner-group').nth(1).click();
  await page.locator(rootSel+'.asi32-goal-chart').screenshot({path:path.join(dest,'asi32-metas-entidad-mobile.png')});
  assert.deepEqual(pageErrors,[],'Errores de ejecución del navegador');
  console.log('ASÍ CUMPLIMOS 3.2: INICIO EN ORDEN, KPI ÚNICO, 109 METAS, 2024/2025 REALES, 2026/2027 SIN REPORTE Y MÓVIL: PASS.');
 }finally{await browser.close();await new Promise(ok=>server.close(ok));}
}
run().catch(error=>{console.error(error);server.close();process.exitCode=1;});
