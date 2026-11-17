/* E2E: Plan de Acción 3.3 — diez pestañas completas y sin cortes en el menú.
 * Comprueba contenido real en todas las vistas, anchos de escritorio/móvil y
 * que ningún título se trunque. No simula cifras ni edita la base original. */
'use strict';
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json',
  '.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp'};
const server=http.createServer((req,res)=>{
  let p;
  try{p=decodeURIComponent((req.url||'/').split('?')[0]);}catch{return res.writeHead(400).end();}
  const dest=path.resolve(root,p==='/'?'index.html':p.replace(/^\/+/,''));
  if(dest!==path.join(root,'index.html')&&!dest.startsWith(root+path.sep))return res.writeHead(403).end();
  fs.stat(dest,(err,stat)=>{
    if(err||!stat.isFile())return res.writeHead(404).end('Not found');
    res.writeHead(200,{'Content-Type':mime[path.extname(dest)]||'application/octet-stream'});
    fs.createReadStream(dest).pipe(res);
  });
});
const tabs=[
 ['summary','Resumen','.pa-dashboard-cards'],
 ['general','Información General','.pa-ig-dashboard'],
 ['activities','Actividades','.pa-act-dashboard'],
 ['physical','Avance Físico','.pa-ph-dashboard'],
 ['beneficiaries','Beneficiarios','.pa-ben-dashboard'],
 ['budget','Ejecución Presupuestal','.pa-bu-dashboard'],
 ['territory','Territorio','.pa-tr-dashboard'],
 ['contracts','Contratación de Inversión','.pa-ct-dashboard'],
 ['supports','Soportes','.pa-su-dashboard'],
 ['observations','Observaciones','.pa-ob-dashboard']
];
async function measureNavigation(page,width){
  await page.setViewportSize({width,height:960});
  await page.waitForTimeout(140);
  const result=await page.evaluate(()=>{
    const scope=document.querySelector('#desarrollo-accion .pa-tabs');
    const nav=scope.getBoundingClientRect();
    const buttons=[...scope.querySelectorAll('[data-pa-tab]')];
    return {viewport:innerWidth,navWidth:nav.width,scrollWidth:scope.scrollWidth,clientWidth:scope.clientWidth,
      columns:getComputedStyle(scope).gridTemplateColumns.split(' ').length,
      tabs:buttons.map(btn=>{
        const box=btn.getBoundingClientRect(),span=btn.querySelector('span:last-child');
        const label=span.getBoundingClientRect(),css=getComputedStyle(span);
        return {key:btn.dataset.paTab,text:span.textContent.trim(),
          width:box.width,height:box.height,labelWidth:label.width,
          scrollHeight:span.scrollHeight,clientHeight:span.clientHeight,
          wrap:css.whiteSpace,overflow:css.overflow,textOverflow:css.textOverflow,
          inside:box.left>=nav.left-1&&box.right<=nav.right+1,
          visible:box.width>18&&box.height>=42};
      })};
  });
  assert.equal(result.tabs.length,10,'Hay pestañas ausentes: '+JSON.stringify(result));
  assert.ok(result.scrollWidth<=result.clientWidth+2,'El banner tiene scroll horizontal y oculta títulos: '+JSON.stringify(result));
  for(let i=0;i<tabs.length;i++){
    const t=result.tabs[i],expected=tabs[i][1];
    assert.equal(t.key,tabs[i][0],'Orden de pestañas alterado');
    assert.ok(t.text.startsWith(expected),'Título de pestaña incompleto: '+JSON.stringify(t));
    assert.ok(t.inside&&t.visible,'Pestaña fuera del banner: '+JSON.stringify(t));
    assert.equal(t.wrap,'normal','Texto con nowrap: '+JSON.stringify(t));
    assert.notEqual(t.textOverflow,'ellipsis','Etiqueta truncada por CSS: '+JSON.stringify(t));
    assert.ok(t.scrollHeight<=t.clientHeight+2,'Etiqueta cortada verticalmente: '+JSON.stringify(t));
  }
  assert.ok(result.tabs.every(x=>!x.text.includes('Totalizador')),'Totalizador regresó al menú');
  console.log('BANNER '+width+'px: 10 nombres completos, sin scroll ni etiquetas cortadas; '+result.columns+' columnas');
}
async function run(){
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const page=await browser.newPage({viewport:{width:1600,height:960}});
  const failures=[];page.on('pageerror',err=>failures.push(err.message));
  const url='http://127.0.0.1:'+server.address().port+'/#desarrollo?seccion=desarrollo-accion';
  const out=path.join(root,'screenshots');fs.mkdirSync(out,{recursive:true});
  try{
    await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
    await page.waitForFunction(()=>{
      const root=document.querySelector('#desarrollo-accion');
      return !!root?.querySelector('.pa-dashboard-cards') &&
        root.querySelectorAll('[data-pa-tab]').length===10;
    },null,{timeout:45000});
    assert.equal(await page.locator('#pa-year-select').inputValue(),'2026');
    assert.match(await page.locator('#desarrollo-accion .pa-top').innerText(),/tercer trimestre/i);
    for(const width of [1920,1600,1440,1280,1180,1024,800,690,430,390,320]){
      await measureNavigation(page,width);
      if(width===1440||width===390){
        const name=width===1440?'auditoria-plan33-tabs-2026-desktop.png':'auditoria-plan33-tabs-2026-mobile.png';
        await page.locator('#desarrollo-accion .pa-tabs').screenshot({path:path.join(out,name)});
      }
    }
    await page.setViewportSize({width:1440,height:960});
    for(const [key,title,selector] of tabs){
      await page.locator('#desarrollo-accion [data-pa-tab="'+key+'"]').click();
      await page.waitForFunction(([key,selector])=>{
        const root=document.querySelector('#desarrollo-accion');
        return !!root?.querySelector(selector) &&
          root.querySelector('[data-pa-tab="'+key+'"]')?.getAttribute('aria-selected')==='true';
      },[key,selector],{timeout:35000});
      assert.equal(await page.locator('#desarrollo-accion [data-pa-tab]').count(),10,'El menú cambia entre pestañas');
      const headings=await page.locator('#desarrollo-accion .pa-context-heading').innerText();
      assert.ok(headings.length>30,'Encabezado incompleto en '+key);
      const text=await page.locator('#desarrollo-accion '+selector).innerText();
      assert.ok(text.length>80,'Panel vacío o incompleto: '+key+' longitud '+text.length);
      assert.ok(!/No fue posible cargar|No se pudieron cargar los datos|Error de lectura/i.test(text),
        'Error de carga en '+key+': '+text.slice(0,350));
      if(key==='supports'){
        await page.waitForSelector('#desarrollo-accion [data-pa-su-audit-summary]',{timeout:25000});
        const audit=await page.locator('#desarrollo-accion [data-pa-su-audit-summary]').innerText();
        assert.match(audit,/379 actividades/);
        assert.match(audit,/227 referencias/);
        assert.match(audit,/157 sin URL/);
        assert.equal(await page.locator('#desarrollo-accion .pa-su-file-card').count(),7,
          'Meta 101 debe tener 7 carpetas de origen, aunque 6 no tienen metadatos consultables');
        await page.screenshot({path:path.join(out,'auditoria-plan33-soportes-2026-3t.png')});
      }
      if(key==='contracts'){
        await page.waitForSelector('#desarrollo-accion [data-pa-ct-evidence-audit]',{timeout:25000});
        const cross=await page.locator('#desarrollo-accion [data-pa-ct-evidence-audit]').innerText();
        assert.match(cross,/no acredita por sí solo un contrato/i);
        assert.equal(await page.locator('#desarrollo-accion [data-pa-contract-supports]').count(),1);
        await page.screenshot({path:path.join(out,'auditoria-plan33-contratos-2026-3t.png')});
      }
      const year=await page.locator('#pa-year-select').inputValue();
      assert.equal(year,'2026','Vigencia se perdió al cambiar a '+key);
      await measureNavigation(page,1440);
      console.log('SECCIÓN '+key+': panel, encabezado, datos y navegación accesibles');
    }
    await page.setViewportSize({width:390,height:844});
    await page.locator('#desarrollo-accion [data-pa-tab="contracts"]').click();
    await measureNavigation(page,390);
    await page.locator('#desarrollo-accion [data-pa-tab="observations"]').click();
    await measureNavigation(page,390);
    assert.equal(failures.length,0,'Errores JavaScript en las diez vistas: '+failures.join(' | '));
    console.log('PLAN 3.3: PASS — 10 secciones verificadas; menu completo 320–1920px; 2026 T3.');
  } finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
}
run().catch(err=>{console.error(err);server.close();process.exitCode=1;});
