/* Browser smoke: approved Encuesta Municipal visual + working controls, desktop & mobile. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const base=path.resolve(__dirname,'..');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.geojson':'application/geo+json','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 const uri=decodeURIComponent((req.url||'/').split('?')[0]);
 const dest=path.resolve(base,uri==='/'?'index.html':uri.replace(/^\/+/,''));
 if(!dest.startsWith(base+path.sep)){res.writeHead(403).end();return;}
 fs.stat(dest,(error,stat)=>{
  if(error||!stat.isFile()){res.writeHead(404).end('Not found');return;}
  res.writeHead(200,{'Content-Type':types[path.extname(dest)]||'application/octet-stream'});
  fs.createReadStream(dest).pipe(res);
 });
});
async function main(){
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const baseUrl='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const shots=path.join(base,'screenshots');fs.mkdirSync(shots,{recursive:true});
 const errors=[];
 try{
  const page=await browser.newPage({viewport:{width:1672,height:941},deviceScaleFactor:1,acceptDownloads:true});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(baseUrl+'/#data?seccion=data-encuesta',{waitUntil:'domcontentloaded',timeout:40000});
  await page.locator('#svApp[data-ready="true"]').waitFor({timeout:30000});
  assert.equal(await page.locator('#svMapSvg .sv-vereda').count(),17,'Map should have 17 interactive real polygons');
  assert.equal(await page.locator('#data-encuesta .sv-panel').count(),3,'Map + donut + bars panels');
  assert.equal(await page.locator('#svBreaches .sv-breach-row').count(),8,'Eight highlighted brechas');
  assert.match(await page.locator('#svResponses').innerText(),/1\.248/);
  assert.equal(await page.locator('#svZoneCount').innerText(),'17');
  assert.equal(await page.locator('#svYearStat').innerText(),'2026');
  const expected=['18%','42%','24%','11%','5%'];
  for(const [index,id] of ['svExcellent','svGood','svRegular','svBad','svVeryBad'].entries())assert.equal(await page.locator('#'+id).innerText(),expected[index]);
  assert.equal(await page.locator('#svTipPercent').innerText(),'78%');
  assert.equal(await page.locator('#svTipResponses').innerText(),'142');
  assert.deepEqual(await page.locator('#svBreaches .sv-breach-percent').allInnerTexts(),
   ['68%','52%','45%','38%','34%','28%','24%','18%']);
  assert.equal(await page.locator('#svRealWorkspace .dataset-workspace').count(),1,'Keep legacy import source separate');
  assert.equal(await page.locator('#data-encuesta video').count(),0,'No politician video');
  const layout=await page.evaluate(()=>{
   const b=sel=>{const r=document.querySelector(sel)?.getBoundingClientRect();return r?{x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom}:null;};
   return {header:b('#siteHeader'),hero:b('#data-encuesta .sv-hero'),toolbar:b('#data-encuesta .sv-controls'),map:b('#data-encuesta .sv-map-panel'),donut:b('#data-encuesta .sv-perception'),breaches:b('#data-encuesta .sv-breaches'),general:getComputedStyle(document.querySelector('.app-view.active[data-view="data"] > .view-hero')).display,scrollWidth:document.documentElement.scrollWidth,viewport:window.innerWidth,viewportHeight:window.innerHeight};
  });
  assert.equal(Math.round(layout.header.h),63,'Survey header follows approved screenshot height');
  assert.ok(layout.hero.y>=62&&layout.hero.y<75,'Hero must start immediately under header '+JSON.stringify(layout));
  assert.ok(layout.hero.h>220&&layout.hero.h<280,'Hero should match compact screenshot '+JSON.stringify(layout));
  assert.equal(layout.general,'none','Generic product header must not appear');
  assert.ok(layout.map.x<layout.donut.x,'Map must be on the left');
  assert.ok(Math.abs(layout.map.y-layout.donut.y)<4,'Two panels must start at same vertical position');
  assert.ok(layout.breaches.y>layout.donut.y,'Brechas below donut');
  assert.ok(layout.map.bottom<=layout.viewportHeight+32,'First screen should fit viewport, no giant gap below charts '+JSON.stringify(layout));
  assert.ok(layout.scrollWidth<=layout.viewport+5,'No horizontal scrolling '+JSON.stringify(layout));
  await page.screenshot({path:path.join(shots,'encuesta24-referencia-desktop-1672x941.png'),fullPage:false});
  const chartBefore=await page.locator('#svDonut').getAttribute('style');
  await page.locator('#svZone').selectOption({label:'Rincon Santo'});
  assert.equal(await page.locator('#svResponses').innerText(),'142');
  assert.equal(await page.locator('#svZoneCount').innerText(),'1');
  assert.equal(await page.locator('#svTipPercent').innerText(),'78%');
  const chartAfter=await page.locator('#svDonut').getAttribute('style');
  assert.notEqual(chartBefore,chartAfter,'Selecting a vereda must update chart');
  await page.locator('#svZone').selectOption('');
  assert.match(await page.locator('#svResponses').innerText(),/1\.248/);
  await page.locator('#svSector').selectOption('vias');
  assert.match(await page.locator('#svMapIntro').innerText(),/Vías y movilidad/);
  await page.locator('#svSector').selectOption('');
  await page.locator('#svMapSvg [data-zone="Canica Alta"]').click();
  assert.equal(await page.locator('#svZone').inputValue(),'Canica Alta');
  assert.equal(await page.locator('#svResponses').innerText(),'48');
  await page.locator('#svZoomIn').click();
  assert.match(await page.locator('#svMapGroup').getAttribute('style'),/scale\(1\.2\)/);
  await page.locator('#svZoomReset').click();
  assert.match(await page.locator('#svMapGroup').getAttribute('style'),/scale\(1\)/);
  await page.locator('#svMapLayers').click();
  assert.equal(await page.locator('#svMapLayers').getAttribute('aria-pressed'),'true');
  await page.locator('#svViewBreaches').click();
  await page.locator('#svDetailDialog[open]').waitFor();
  assert.match(await page.locator('#svDialogContent').innerText(),/demostración/);
  await page.locator('#svDialogClose').click();
  await page.locator('#svOpenReal').click();
  await page.locator('#svRealWorkspace[open]').waitFor();
  assert.equal(await page.locator('#svRealWorkspace [data-dataset-workspace="encuesta"]').count(),1);
  const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
  mobile.on('pageerror',e=>errors.push('mobile: '+e.message));
  await mobile.goto(baseUrl+'/#data?seccion=data-encuesta',{waitUntil:'domcontentloaded'});
  await mobile.locator('#svApp[data-ready=true]').waitFor({timeout:30000});
  assert.equal(await mobile.locator('.sv-vereda').count(),17);
  assert.ok(await mobile.locator('#svDonut').isVisible());
  assert.ok(await mobile.locator('#svMapStage').isVisible());
  const dimensions=await mobile.evaluate(()=>({width:window.innerWidth,scrollWidth:document.documentElement.scrollWidth}));
  assert.ok(dimensions.scrollWidth<=dimensions.width+5,'Mobile must not scroll horizontally: '+JSON.stringify(dimensions));
  await mobile.screenshot({path:path.join(shots,'encuesta24-movil-390.png'),fullPage:true});
  assert.deepEqual(errors,[],'No unhandled JS errors should be raised');
  console.log('ENCUESTA 2.4 BROWSER: PASS — matching first viewport, 17 geographic zones, five percentages, eight bars, filters, zoom, details, real importer and mobile.');
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(err=>{console.error(err.stack||err);process.exitCode=1;});
