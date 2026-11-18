'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp'};
const server=http.createServer((req,res)=>{
 const p=decodeURIComponent((req.url||'/').split('?')[0]);
 const dest=path.resolve(root,p==='/'?'index.html':p.replace(/^\/+/,''));
 if(!dest.startsWith(root+path.sep))return res.writeHead(403).end('Forbidden');
 fs.stat(dest,(e,stat)=>{if(e||!stat.isFile())return res.writeHead(404).end('Not found');
  res.writeHead(200,{'Content-Type':mime[path.extname(dest)]||'application/octet-stream'});
  fs.createReadStream(dest).pipe(res);});
});
async function bounds(p,s){return p.locator(s).boundingBox();}
async function main(){
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const base='http://127.0.0.1:'+server.address().port;
 const errors=[];
 try{
  const page=await browser.newPage({viewport:{width:1648,height:956}});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/#data?seccion=data-encuesta',{waitUntil:'domcontentloaded',timeout:40000});
  await page.locator('#data-encuesta[data-kobo-ready="true"]').waitFor({timeout:30000});
  await page.locator('#k23-findings li').first().waitFor();
  assert.equal(await page.locator('#data-encuesta').isVisible(),true,'The full module must be visible');
  assert.equal(await page.locator('#k23-dims button').count(),4);
  assert.equal(await page.locator('#k23-areas button').count(),6);
  assert.equal(await page.locator('#k23-topics button').count(),7);
  assert.equal(await page.locator('#k23-topic-title').innerText(),'Aseguramiento');
  assert.match(await page.locator('#k23-source-foot').innerText(),/Fuente.*KoBo.*Corte.*2026-10-17/);
  assert.equal(await page.locator('.k23-topics-panel').count(),0,'Old vertical topics sidebar');
  assert.equal(await page.locator('#svRealWorkspace').isVisible(),false);
  assert.equal(await page.locator('#k23-gaps').isVisible(),false);
  assert.equal(await page.locator('#k23-meta').isVisible(),false);
  assert((await page.locator('#k23-findings li').count())>=2);
  const b={dims:await bounds(page,'#k23-dims'),areas:await bounds(page,'#k23-areas'),
   topics:await bounds(page,'#k23-topics'),chart:await bounds(page,'.k23-chart-panel'),
   insight:await bounds(page,'.k23-insight-panel'),findings:await bounds(page,'.k23-findings-panel')};
  for(const [key,value] of Object.entries(b))
   assert(value&&value.width>80&&value.height>20,'Missing visible '+key+JSON.stringify(value));
  assert(b.dims.y<b.areas.y&&b.areas.y<b.topics.y&&b.topics.y<b.chart.y,'Navigation rows above chart');
  assert(b.topics.height<100,'The categories must be in one horizontal row (not a vertical list): '+JSON.stringify(b.topics));
  const t1=await bounds(page,'#k23-topics button:nth-child(1)');
  const t2=await bounds(page,'#k23-topics button:nth-child(2)');
  assert(t2.x>t1.x,'Categories must run left to right');
  assert(b.chart.x<b.insight.x&&b.chart.x<b.findings.x,'Chart must be to the left');
  assert(b.findings.y>b.insight.y,'Findings card must be below the insight card');
  assert(b.chart.width>b.insight.width,'Chart must be larger');
  fs.mkdirSync(path.join(root,'screenshots'),{recursive:true});
  await page.screenshot({path:path.join(root,'screenshots','kobo-layout-desktop.png'),fullPage:true});
  await page.locator('#k23-area-nonexistent').count();
  await page.locator('#k23-areas button[data-k23-area="1.2"]').click();
  assert.equal(await page.locator('#k23-topic-title').innerText(),'Cobertura educativa');
  assert.equal(await page.locator('#k23-topics button').count(),4);
  assert((await page.locator('#k23-findings li').count())>=2);
  await page.locator('#k23-dims button[data-k23-dim="economica"]').click();
  assert.match(await page.locator('#k23-areas').innerText(),/Comercio y Desarrollo Empresarial/);
  await page.locator('#k23-dims button[data-k23-dim="percepcion"]').click();
  assert.match(await page.locator('#k23-topic-breadcrumb').innerText(),/Percepción ciudadana/);
  assert((await page.locator('#k23-findings li').count())>=2);
  await page.goto(base+'/#data?seccion=data-subachoque',{waitUntil:'domcontentloaded',timeout:30000});
  await page.locator('#data-subachoque:not([hidden])').waitFor({timeout:15000});
  assert.equal(await page.locator('#data-subachoque').isVisible(),true,'Another Data section must remain accessible');
  const mobile=await browser.newPage({viewport:{width:390,height:844}});
  mobile.on('pageerror',e=>errors.push(e.message));
  await mobile.goto(base+'/#data?seccion=data-encuesta',{waitUntil:'domcontentloaded',timeout:40000});
  await mobile.locator('#data-encuesta[data-kobo-ready="true"]').waitFor({timeout:30000});
  assert.equal(await mobile.locator('#data-encuesta').isVisible(),true);
  assert((await mobile.locator('#k23-findings li').count())>=2);
  assert.equal(await mobile.locator('#k23-areas button').count(),6);
  assert.equal(await mobile.locator('#k23-topics button').count(),7);
  const horizontal=await mobile.evaluate(()=>{
    const module=document.querySelector('#data-encuesta');
    const filter=document.querySelector('#k23-topics');
    return {page:document.documentElement.scrollWidth,view:window.innerWidth,
      moduleWidth:module.getBoundingClientRect().width,
      filterWidth:filter.getBoundingClientRect().width,
      filterScroll:filter.scrollWidth};
  });
  assert(horizontal.moduleWidth<=horizontal.view+5,'Dimension module fits mobile width '+JSON.stringify(horizontal));
  assert(horizontal.filterWidth<=horizontal.view,'Categories scroll inside their own horizontal row');
  await mobile.screenshot({path:path.join(root,'screenshots','kobo-layout-mobile.png'),fullPage:true});
  assert.deepEqual(errors,[],'No browser errors');
  console.log('KOBO LAYOUT BROWSER PASS');
  console.log(JSON.stringify({b,horizontal},null,2));
 }finally{await browser.close();server.close();}
}
main().catch(e=>{console.error(e);server.close();process.exit(1)});
