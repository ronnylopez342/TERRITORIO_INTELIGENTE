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
  try { await page.waitForFunction(()=>document.querySelectorAll('#desarrollo-cumplimos .asi32-kpi').length===6,null,{timeout:25000}); }
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
  assert.equal(await page.locator(rootSel+'[data-asi-owner]').count(),8);
  await page.screenshot({path:path.join(dest,'asi32-inicio-desktop.png')});
  await page.locator(rootSel+'[data-asi-filter="year"]').selectOption('2026');
  await page.waitForFunction(()=>document.querySelector('#desarrollo-cumplimos .asi32-compare')?.textContent.includes('Sin reporte'),null,{timeout:12000});
  assert.equal(await page.locator(rootSel+'.asi32-segment').count(),0);
  await page.locator(rootSel+'[data-asi-filter="year"]').selectOption('2024');
  assert.match(await page.locator(rootSel+'.asi32-compare').innerText(),/96,9/);
  await page.locator(rootSel+'[data-asi-filter="year"]').selectOption('all');
  await page.locator(rootSel+'[data-asi-owner]').first().click();
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
  await page.screenshot({path:path.join(dest,'asi32-inicio-mobile.png')});
  console.log('ASI CUMPLIMOS 3.2 SMOKE: PASS; charts, 8 departments, 109 goals, 2024 progress, 2026 no data, mobile.');
 }finally{await browser.close();await new Promise(ok=>server.close(ok));}
}
run().catch(error=>{console.error(error);server.close();process.exitCode=1;});