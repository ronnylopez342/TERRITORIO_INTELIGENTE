'use strict';
/* Regression: full Atlas JPG manifest, 246 real images, 4/20 areas,
 * unchanged KoBo metrics, selector visual and navigation in browser.
 * Optional BASE_URL=https://... for production smoke tests.
 */
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'data/atlas-original-manifest.json'),'utf8'));
const atlas=JSON.parse(fs.readFileSync(path.join(root,'data/subachoque-atlas-41.json'),'utf8'));
const official=JSON.parse(fs.readFileSync(path.join(root,'data/atlas-taxonomia-oficial.json'),'utf8'));
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css',
 '.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png'};
const server=http.createServer((req,res)=>{
 const url=decodeURIComponent((req.url||'/').split('?')[0]);
 const file=path.resolve(root,url==='/'?'index.html':url.replace(/^\/+/,''));
 if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
 fs.stat(file,(e,st)=>{
   if(e||!st.isFile())return res.writeHead(404).end('Not found');
   res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});
   fs.createReadStream(file).pipe(res);
 });
});
const sha=data=>crypto.createHash('sha256').update(data).digest('hex');
const locallyVerified=[];
for(const [code,record] of Object.entries(manifest.questions)){
 assert(record.views.length===6,code+' six JPGs');
 for(let i=0;i<6;i++){
  const f=path.join(root,record.views[i]);
  assert(fs.existsSync(f),code+' missing '+f);
  assert.equal(sha(fs.readFileSync(f)),record.sha256[i],code+' original JPG '+(i+1));
  locallyVerified.push(record.views[i]);
 }
 assert.equal(sha(fs.readFileSync(path.join(root,record.panel))),record.panelSha256);
}
assert.equal(locallyVerified.length,246);
assert.equal(Object.keys(manifest.questions).length,41);
assert.equal(atlas.q.length,41);
assert.deepEqual(official.dimensions.map(d=>d.areas.length),[6,6,4,4]);

async function run(){
 const external=process.env.BASE_URL?.replace(/\/$/,'');
 if(!external)await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=external||('http://127.0.0.1:'+server.address().port);
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const errorList=[];
 try{
 const page=await browser.newPage({viewport:{width:1648,height:940},deviceScaleFactor:1});
 page.on('pageerror',e=>errorList.push(e.message));
 await page.goto(base+'/#data?seccion=data-encuesta',{waitUntil:'domcontentloaded',timeout:45000});
 await page.locator('#data-encuesta[data-kobo-ready="true"]').waitFor({timeout:30000});
 assert.equal(await page.locator('#data-encuesta').isVisible(),true,'module visible');
 assert.equal(await page.locator('#k23-dims button').count(),4,'four dimensions');
 assert.equal(await page.locator('#k23-areas button').count(),6,'six social areas');
 assert.equal(await page.locator('.k23-summary').count(),0,'old summary removed');
 assert.equal(await page.locator('.atlas-switch-button').count(),6,'six chart selectors on KoBo');
 assert.equal(await page.locator('.atlas-switch-button.active').count(),1);
 assert.equal(await page.locator('.atlas-selector-label').innerText(),'Tipo de gráfica:');
 const dims=await page.locator('#k23-dims').boundingBox();
 const area=await page.locator('#k23-areas').boundingBox();
 const topic=await page.locator('#k23-topics').boundingBox();
 const chart=await page.locator('.k23-chart-panel').boundingBox();
 const insight=await page.locator('.k23-insight-panel').boundingBox();
 const findings=await page.locator('.k23-findings-panel').boundingBox();
 assert(dims.y<area.y&&area.y<topic.y&&topic.y<chart.y,'header and filters preserved');
 assert(chart.x<insight.x&&chart.x<findings.x,'chart left, analytics right');
 assert(chart.width>insight.width&&findings.y>insight.y,'two stacked right panels');
 await page.locator('#k23-topics button[data-k23-topic="1.1-4"]').click();
 assert.equal(await page.locator('#k23-topic-title').innerText(),'Discapacidad');
 assert.match(await page.locator('#k23-chart').innerText(),/854/);
 assert.match(await page.locator('#k23-chart').innerText(),/73/);
 assert.match(await page.locator('#k23-source-foot').innerText(),/KoBo/);
 await page.locator('.atlas-switch-button[data-atlas-view="4"]').click();
 assert.equal(await page.locator('#k23-chart svg[role="img"]').count(),1,'KoBo dynamic circular view');
 await page.locator('.atlas-switch-button[data-atlas-view="0"]').click();
 assert.equal(await page.locator('#k23-chart .k23-bars').count(),1,'KoBo original bar chart restored');
 await page.locator('#k23-topics button[data-k23-topic="atlas-G13"]').click();
 assert.equal(await page.locator('.atlas-original-image').count(),1,'actual JPG not SVG for Atlas');
 assert.equal(await page.locator('#k23-chart svg').count(),0);
 assert.match(await page.locator('#k23-topic-title').innerText(),/afiliadas/i);
 for(let i=0;i<6;i++){
   await page.locator('.atlas-switch-button[data-atlas-view="'+i+'"]').click();
   const expected=manifest.questions.G13.views[i].split('/').pop();
   assert((await page.locator('#k23-atlas-image').getAttribute('src')).endsWith(expected));
   await page.locator('#k23-atlas-image').evaluate(img=>img.decode());
   const valid=await page.locator('#k23-atlas-image').evaluate(img=>img.complete&&img.naturalWidth>100);
   assert(valid,'G13 image '+i+' decoded');
   assert.equal(await page.locator('.atlas-switch-button.active').count(),1);
 }
 assert.match(await page.locator('#k23-source-foot').innerText(),/G13/);
 await page.locator('.atlas-image-open').click();
 assert(await page.locator('#k23-atlas-dialog').evaluate(el=>el.open),'modal opens');
 await page.locator('[data-atlas-close]').click();
 assert(!(await page.locator('#k23-atlas-dialog').evaluate(el=>el.open)),'modal closes');
 if(!external){
  fs.mkdirSync(path.join(root,'screenshots'),{recursive:true});
  await page.screenshot({path:path.join(root,'screenshots','final-atlas-original-desktop.png'),fullPage:true});
 }
 await page.locator('#k23-dims button[data-k23-dim="economica"]').click();
 assert.equal(await page.locator('#k23-areas button').count(),6);
 await page.locator('#k23-areas button[data-k23-area="2.1"]').click();
 assert.match(await page.locator('#k23-chart').innerText(),/Sin datos disponibles/);
 await page.locator('#k23-areas button[data-k23-area="2.3"]').click();
 await page.locator('#k23-topics button[data-k23-topic="atlas-G27"]').click();
 assert.equal(await page.locator('#atlas-series option').count(),2);
 await page.locator('#atlas-series').selectOption('1');
 assert.equal(await page.locator('#atlas-series').inputValue(),'1');
 assert.equal(await page.locator('#k23-atlas-image').count(),1);
 await page.locator('#k23-dims button[data-k23-dim="ambiental"]').click();
 await page.locator('#k23-areas button[data-k23-area="3.1"]').click();
 await page.locator('#k23-topics button[data-k23-topic="atlas-G26"]').click();
 assert.match(await page.locator('#k23-topic-title').innerText(),/Elementos importantes/);
 await page.locator('#k23-dims button[data-k23-dim="percepcion"]').click();
 assert.equal(await page.locator('#k23-areas button').count(),4,'four official citizen areas');
 assert.match(await page.locator('#k23-areas').innerText(),/Confianza e imagen institucional/);
 assert.doesNotMatch(await page.locator('#k23-dims').innerText(),/Dimensión Institucional/);
 for(const d of official.dimensions){
  await page.locator('#k23-dims button[data-k23-dim="'+d.id+'"]').click();
  assert.equal(await page.locator('#k23-areas button').count(),d.areas.length,d.id+' area count');
 }
 // Check all 246 unique images, classification and proper question binding (local or production).
 for(const q of atlas.q){
  const m=official.atlasBindings[q[0]];
  await page.locator('#k23-dims button[data-k23-dim="'+m.dimension+'"]').click();
  await page.locator('#k23-areas button[data-k23-area="'+m.area+'"]').click();
  await page.locator('#k23-topics button[data-k23-topic="atlas-'+q[0]+'"]').click();
  assert.equal(await page.locator('#k23-chart svg').count(),0,q[0]+' not SVG');
  for(let i=0;i<6;i++){
   await page.locator('.atlas-switch-button[data-atlas-view="'+i+'"]').click();
   const img=page.locator('#k23-atlas-image');
   assert.equal(await img.getAttribute('src'),manifest.questions[q[0]].views[i],q[0]+' image '+i);
   await img.evaluate(node=>node.decode());
   assert(await img.evaluate(node=>node.naturalWidth>50&&node.naturalHeight>50),q[0]+' image loaded '+i);
  }
  assert.equal(await page.locator('#k23-chart svg').count(),0,q[0]+' original six images only');
 }
 // Confirm another Data Territorio module remains accessible.
 await page.goto(base+'/#data?seccion=data-subachoque',{waitUntil:'domcontentloaded'});
 await page.locator('#data-subachoque:not([hidden])').waitFor({timeout:20000});
 assert.equal(await page.locator('#data-subachoque').isVisible(),true,'Data Subachoque unaffected');
 await page.goto(base+'/#data?seccion=data-encuesta&dimension=social&area=1.1&tema=1.1-4',{waitUntil:'domcontentloaded'});
 await page.locator('#data-encuesta[data-kobo-ready="true"]').waitFor({timeout:30000});
 const mobile=await browser.newPage({viewport:{width:390,height:844}});
 mobile.on('pageerror',e=>errorList.push(e.message));
 await mobile.goto(base+'/#data?seccion=data-encuesta',{waitUntil:'domcontentloaded'});
 await mobile.locator('#data-encuesta[data-kobo-ready="true"]').waitFor({timeout:30000});
 await mobile.locator('#k23-topics button[data-k23-topic="atlas-G13"]').click();
 const module=await mobile.locator('#data-encuesta').boundingBox();
 const img=await mobile.locator('#k23-atlas-image').boundingBox();
 assert(module.width<=395,'module fits mobile viewport');
 assert(img.width<=module.width,'image does not overflow module');
 assert.equal(await mobile.locator('.atlas-switch-button').count(),6);
 if(!external)await mobile.screenshot({path:path.join(root,'screenshots','final-atlas-original-mobile.png'),fullPage:true});
 assert.deepEqual(errorList,[],'no JS page errors');
 console.log('ATLAS ORIGINAL E2E PASS — 246/246 image decodes, 41 categories, 4 official dimensions, KoBo preserved, modal, desktop/mobile');
 }finally{await browser.close();if(!external)server.close();}
}
run().catch(err=>{console.error(err);server.close();process.exitCode=1});
