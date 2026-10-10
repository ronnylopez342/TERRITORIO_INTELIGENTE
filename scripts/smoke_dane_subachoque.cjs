/* Browser e2e smoke test for the locally served 2.3 portal. No fake data. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.geojson':'application/geo+json','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.mp4':'video/mp4'};
const server=http.createServer((request,response)=>{
  const pathname=decodeURIComponent((request.url||'/').split('?')[0]);
  const rel=pathname==='/'?'index.html':pathname.replace(/^\/+/,'');
  const abs=path.resolve(root,rel);
  if(!abs.startsWith(root+path.sep)&&abs!==path.join(root,'index.html')){response.writeHead(403).end();return;}
  fs.stat(abs,(error,stat)=>{
    if(error||!stat.isFile()){response.writeHead(404).end('Not found');return;}
    response.writeHead(200,{'Content-Type':types[path.extname(abs).toLowerCase()]||'application/octet-stream'});
    fs.createReadStream(abs).pipe(response);
  });
});
async function run(){
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const port=server.address().port;
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const screenshots=path.join(root,'screenshots');
  fs.mkdirSync(screenshots,{recursive:true});
  const url='http://127.0.0.1:'+port+'/#data?seccion=data-fuentes';
  try{
    await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
    await page.waitForFunction(()=>document.querySelector('#d23App')?.dataset.ready==='true',{timeout:25000});
    await page.locator('#d23HeroTitle').waitFor({state:'visible'});
    assert.match(await page.locator('#d23HeroTitle').innerText(),/DATOS[\s\S]*DANE/);
    assert.equal(await page.locator('.d23-feature').count(),4);
    await page.screenshot({path:path.join(screenshots,'dane23-portada.png'),fullPage:true});
    await page.locator('.d23-feature[data-d23-view="poblacion"]').click();
    await page.locator('#d23DetailTitle').waitFor({state:'visible'});
    assert.match(await page.locator('#d23Detail').innerText(),/14\.874/);
    assert.ok(await page.locator('.d23-panel').count()>=7);
    assert.ok(await page.locator('.d23-donut').count()>=2);
    assert.ok(await page.locator('svg.d23-graphic').count()>=3);
    await page.screenshot({path:path.join(screenshots,'dane23-poblacion.png'),fullPage:true});
    await page.locator('.d23-tab[data-d23-view="series"]').click();
    assert.match(await page.locator('#d23DetailTitle').innerText(),/Series históricas/);
    assert.match(await page.locator('#d23Detail').innerText(),/12\.972/);
    await page.locator('.d23-tab[data-d23-view="mapas"]').click();
    await page.locator('#d23MapStage').waitFor({state:'visible'});
    assert.equal(await page.locator('#d23MapStage [data-d23-vereda]').count(),17);
    await page.locator('#d23VeredaSelector').selectOption('3');
    assert.match(await page.locator('.d23-map-side').innerText(),/Cascajal/);
    await page.screenshot({path:path.join(screenshots,'dane23-mapas.png'),fullPage:true});
    await page.locator('.d23-tab[data-d23-view="fuentes"]').click();
    assert.equal(await page.locator('.d23-source a').count(),4);
    await page.locator('[data-d23-legacy]').click();
    assert.ok(await page.locator('#d23LegacyViewer').getAttribute('open')!==null);
    assert.equal(await page.locator('#d23LegacyViewer iframe').count(),1);
    await page.locator('[data-d23-back]').click();
    await page.locator('#d23HeroTitle').waitFor({state:'visible'});
    await page.goto('http://127.0.0.1:'+port+'/#data?seccion=data-plan-estadistico',{waitUntil:'domcontentloaded'});
    await page.locator('#pe-title').waitFor({state:'visible'});
    await page.goto('http://127.0.0.1:'+port+'/#data?seccion=data-conoce',{waitUntil:'domcontentloaded'});
    await page.locator('#cn-title').waitFor({state:'visible'});
    assert.deepEqual(errors.filter(x=>/dane-subachoque|d23|TIDaneCharts/i.test(x)),[]);
    console.log('BROWSER 2.3 SMOKE: PASS. Home, 2.2, 2.1 and historical viewer preserved.');
    if(errors.length)console.log('Other console page errors observed:',errors.slice(0,5));
  }finally{
    await browser.close();
  }
}
run().then(()=>server.close()).catch(err=>{console.error(err);server.close();process.exitCode=1;});
