/* E2E: video introductorio solo en Conoce; títulos completos en 2.3.
 * Verifica sitio normal y modo revista ?embed=data en 320-1920 px. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8',
  '.json':'application/json','.jpg':'image/jpeg','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml',
  '.mp4':'video/mp4','.txt':'text/plain'};
const server=http.createServer((req,res)=>{
  let u;try{u=decodeURIComponent((req.url||'/').split('?')[0]);}catch{return res.writeHead(400).end();}
  const dest=path.resolve(root,u==='/'?'index.html':u.replace(/^\/+/,''));
  if(dest!==path.join(root,'index.html')&&!dest.startsWith(root+path.sep))return res.writeHead(403).end();
  fs.stat(dest,(e,stat)=>{
    if(e||!stat.isFile())return res.writeHead(404).end('Not found');
    res.writeHead(200,{'Content-Type':mime[path.extname(dest)]||'application/octet-stream'});
    fs.createReadStream(dest).pipe(res);
  });
});
async function checkData(page,mode,out){
  await page.goto(mode==='embed'?'/?embed=data#data':'/#data',{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(()=>!!document.querySelector('#data-conoce')&&typeof selectDataPanel==='function');
  const cases=[
    ['data-conoce','.cn-video-section',true],
    ['data-subachoque','.ds3-video',false],
    ['data-encuesta','.ti-intro-video--kobo',false],
    ['data-explorando','.ti-intro-video--explorando',false]
  ];
  for(const [id,selector,hasVideo] of cases){
    assert.equal(await page.evaluate(id=>selectDataPanel(id),id),true);
    assert.equal(await page.locator('#'+id+' '+selector).count(),hasVideo?1:0,
      mode+': video introductorio incorrecto en '+id);
    if(hasVideo)assert.ok(await page.locator('#'+id+' '+selector).isVisible());
    await page.waitForTimeout(70);
  }
  await page.evaluate(()=>selectDataPanel('data-encuesta'));
  await page.waitForFunction(()=>document.querySelectorAll('#k23-dims [data-k23-dim]').length===4,
    null,{timeout:30000});
  const structure=await page.evaluate(()=>({
    dims:document.querySelector('.k23-app>.k23-dim-section')!==null,
    insideHero:document.querySelector('#data-encuesta .k23-hero .k23-dim-section')!==null,
    lines:[...document.querySelectorAll('#k23-main-title .k23-title-line')].map(x=>x.textContent.trim())
  }));
  assert.ok(structure.dims&&!structure.insideHero,mode+': dimensiones 2.3 no aparecen tras la portada');
  assert.deepEqual(structure.lines,['CARACTERIZACIÓN','Y DIAGNÓSTICO','MUNICIPAL']);
  for(const width of [1920,1440,1280,1024,800,700,600,430,390,375,320]){
    await page.setViewportSize({width,height:920});
    await page.waitForTimeout(90);
    const detail=await page.evaluate(()=>{
      const container=document.querySelector('#data-encuesta .k23-hero-top>div:first-child');
      const box=container.getBoundingClientRect();
      const lines=[...document.querySelectorAll('#k23-main-title .k23-title-line')].map(span=>{
        const rect=document.createRange();rect.selectNodeContents(span);
        const range=rect.getBoundingClientRect();
        const css=getComputedStyle(span);
        return {text:span.textContent.trim(),right:Math.round(range.right),
          boxRight:Math.round(box.right),left:Math.round(range.left),boxLeft:Math.round(box.left),
          lines:rect.getClientRects().length,overflowWrap:css.overflowWrap,wordBreak:css.wordBreak,
          scroll:span.scrollWidth,client:span.clientWidth};
      });
      const hero=document.querySelector('#data-encuesta .k23-hero');
      return {width:innerWidth,lines,heroScroll:hero.scrollWidth,heroClient:hero.clientWidth,pageScroll:document.documentElement.scrollWidth};
    });
    for(const l of detail.lines){
      assert.ok(l.right<=l.boxRight+2&&l.left>=l.boxLeft-2,
        mode+' '+width+'px: el título corta letras: '+JSON.stringify(l));
      assert.equal(l.lines,1,mode+' '+width+'px: palabra dividida: '+JSON.stringify(l));
      assert.equal(l.wordBreak,'normal',mode+' '+width+'px: word-break incorrecto');
    }
    assert.ok(detail.heroScroll<=detail.heroClient+3,mode+' '+width+'px: desbordamiento de la portada: '+JSON.stringify(detail));
    if(width===1440||width===390){
      await page.locator('#data-encuesta .k23-hero').screenshot({
        path:path.join(out,'conoce-solo-23-'+mode+'-'+width+'.png')
      });
    }
    console.log('TÍTULO 2.3 '+mode+' '+width+'px: palabras completas sin corte');
  }
  await page.evaluate(()=>selectDataPanel('data-explorando'));
  assert.equal(await page.locator('#ex-map').count(),1,'Mapa de 2.4 perdido');
  await page.evaluate(()=>selectDataPanel('data-subachoque'));
  assert.equal(await page.locator('#ds3-dimensions').count(),1,'Dimensiones 2.2 perdidas');
  console.log('DATA '+mode+': 2.1 video; 2.2/2.3/2.4 directas; paneles íntegros');
}
async function checkPlan(page,out){
  // 3.1–3.3 usan la portada editorial propia, no ti34-ready.
  await page.setViewportSize({width:1366,height:900});
  await page.goto('/#desarrollo?seccion=desarrollo-conoce',{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(()=>document.querySelector('.app-view.pd-landing[data-view="desarrollo"]')!==null);
  assert.equal(await page.locator('.app-view.pd-landing .pd-panel').count(),3);
  assert.equal(await page.locator('.app-view.pd-landing .cn-video-section').count(),1,
    'Solo 3.1 debe tener una sección de video en toda la plantilla.');
  for(const id of ['desarrollo-conoce','desarrollo-cumplimos','desarrollo-accion']){
    await page.evaluate(id=>saveModuleSection(id,'desarrollo'),id);
    await page.waitForFunction(id=>document.querySelector('#'+id)?.classList.contains('active')===true,id);
    assert.ok(await page.locator('#'+id).isVisible(),'Contenido 3.x oculto: '+id);
    const intro=id==='desarrollo-conoce';
    assert.equal(await page.locator('#'+id+' .cn-video-section').count(),intro?1:0,
      'Video editorial indebido: '+id);
    if(intro)assert.ok(await page.locator('#'+id+' .cn-video-section').isVisible());
    if(!intro){
      assert.ok((await page.locator('#'+id).innerText()).trim().length>80,
        'No hay contenido funcional en '+id);
      // En 3.2 la portada de la maqueta está oculta a propósito: manda el
      // encabezado propio de Así cumplimos; capturar la vista real del usuario.
      await page.evaluate(()=>window.scrollTo({top:0,left:0,behavior:'instant'}));
      await page.screenshot({path:path.join(out,'conoce-solo-'+id+'.png')});
    }
    console.log('Plan '+id+': '+(intro?'video presente':'contenido directo sin video'));
  }
}
async function checkUnit(page,out){
  const route='cumplimiento';
  const cases=['cumplimiento-conoce','cumplimiento-proyectos','cumplimiento-alumbrado',
    'cumplimiento-inventario','cumplimiento-inventario-automoviles'];
  await page.setViewportSize({width:1366,height:900});
  await page.goto('/#cumplimiento?seccion=cumplimiento-conoce',{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(()=>document.querySelector('.app-view.ti34-ready[data-view="cumplimiento"] .ti34-video')!==null);
  for(const id of cases){
    const nav=page.locator('.app-view[data-view="cumplimiento"] .ti34-nav [data-module-panel="'+id+'"]');
    await nav.click({timeout:20000});
    await page.waitForFunction(id=>{
      const root=document.querySelector('.app-view.ti34-ready[data-view="cumplimiento"]');
      const tab=root?.querySelector('.ti34-nav [data-module-panel="'+id+'"]');
      const vid=root?.querySelector(':scope>.ti34-video');
      return tab?.getAttribute('aria-selected')==='true'&&vid?.hidden===(id==='cumplimiento-conoce'?false:true);
    },id,{timeout:15000});
    const hasVideo=id==='cumplimiento-conoce';
    assert.equal(await page.locator('.app-view[data-view="cumplimiento"]>.ti34-video').isVisible(),hasVideo,
      'Video visible fuera de 4.1: '+id);
    assert.ok(await page.locator('#'+id).isVisible(),'Contenido oculto en '+id);
    if(id==='cumplimiento-proyectos'){
      await page.locator('.app-view[data-view="cumplimiento"] .ti34-hero').screenshot({
        path:path.join(out,'conoce-solo-cumplimiento-4.2.png')
      });
    }
    console.log('Unidad '+id+': video '+(hasVideo?'visible':'ausente')+' y contenido presente');
  }
  await page.locator('.app-view[data-view="cumplimiento"] .ti34-nav [data-module-panel="cumplimiento-proyectos"]').focus();
  await page.keyboard.press('Home');
  await page.waitForFunction(()=>{
    const root=document.querySelector('.app-view.ti34-ready[data-view="cumplimiento"]');
    return root?.querySelector(':scope>.ti34-video')?.hidden===false &&
      root.querySelector('.ti34-nav [data-module-panel="cumplimiento-conoce"]')?.getAttribute('aria-selected')==='true';
  },null,{timeout:8000});
  console.log('Unidad: el teclado vuelve a 4.1 y recupera su video');
}
async function run(){
  await new Promise(done=>server.listen(0,'127.0.0.1',done));
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const out=path.join(root,'screenshots');fs.mkdirSync(out,{recursive:true});
  try{
    const origin='http://127.0.0.1:'+server.address().port;
    const page=await browser.newPage({baseURL:origin,viewport:{width:1440,height:920}});
    await checkData(page,'normal',out);
    await checkData(page,'embed',out);
    await checkPlan(page,out);
    await checkUnit(page,out);
    console.log('PASS: videos únicamente en las portadas Conoce; sin cortes de letras, 2.1–4.4 navegables.');
  }finally{await browser.close();await new Promise(done=>server.close(done));}
}
run().catch(err=>{console.error(err);server.close();process.exitCode=1;});
