'use strict';
/* End-to-end 2.2 navigation parity with 2.3: four dimension cards,
 * area and category pills, fourth institutional, no charts or placeholders. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json',
 '.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.b64':'text/plain'};
const server=http.createServer((req,res)=>{
 const url=decodeURIComponent((req.url||'/').split('?')[0]);
 const f=path.resolve(root,url==='/'?'index.html':url.replace(/^\/+/,''));
 if(!f.startsWith(root+path.sep))return res.writeHead(403).end();
 fs.stat(f,(err,st)=>{if(err||!st.isFile())return res.writeHead(404).end('Not found');
 res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'});
 fs.createReadStream(f).pipe(res);});
});
(async()=>{
 let base=process.env.BASE_URL?.replace(/\/$/,'');
 if(!base){await new Promise(res=>server.listen(0,'127.0.0.1',res));base='http://127.0.0.1:'+server.address().port;}
 const original=JSON.parse(fs.readFileSync(path.join(root,'data/data-subachoque-dimensiones.json'),'utf8'));
 assert.deepEqual(original.dimensiones.map(d=>[d.id,d.areas.length]),[
  ['social',6],['economica',6],['ambiental',4],['institucional',5]
 ]);
 assert.equal(original.dimensiones.flatMap(d=>d.areas.flatMap(a=>a.topics)).length,105);
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  for(const width of [1648,1100,790,390]){
   const page=await browser.newPage({viewport:{width,height:950}});
   const errors=[];page.on('pageerror',err=>errors.push(err.message));
   await page.goto(base+'/#data?seccion=data-subachoque',{waitUntil:'domcontentloaded',timeout:45000});
   await page.locator('#data-subachoque[data-ready="true"]').waitFor({timeout:35000});
   const p=page.locator('#data-subachoque');
   assert.equal(await p.locator('.k23-dim').count(),4,'four dimensions');
   assert.equal(await p.locator('canvas, .ds3-chart-pane, .ds3-plot, .k23-chart-panel, .k23-atlas-image').count(),0,'no chart UI');
   assert.equal((await p.locator('#ds4-main-title').innerText()).replace(/\s+/g,''),'DATASUBACHOQUE');
   for(const [di,d] of original.dimensiones.entries()){
    await p.locator('.k23-dim').nth(di).click();
    assert((await p.locator('.k23-dim.active').innerText()).includes(d.titulo));
    assert.equal(await p.locator('.k23-area').count(),d.areas.length,d.id+' area count');
    for(const a of d.areas){
     await p.locator('.k23-area[data-ds4-area="'+a.id+'"]').click();
     assert.equal(await p.locator('.k23-topic').count(),a.topics.length,a.id+' topic count');
     const first=a.topics[0];
     await p.locator('.k23-topic').first().click();
     assert.equal(await p.locator('#ds4-topic-title').innerText(),first.title);
     assert.equal(await p.locator('#ds4-topic-code').innerText(),first.documentCode);
     assert.equal(await p.locator('.ds4-level').count(),3,'three source levels');
     const info=await p.locator('#ds4-information').innerText();
     assert(info.includes('Nacional')&&info.includes('Departamental')&&info.includes('Municipal'));
     assert(!info.includes('Gráfica'));
     assert.equal(await p.locator('svg, canvas, video').count(),0,'no charts');
    }
   }
   assert((await p.locator('.k23-dim').nth(3).innerText()).includes('Institucional'),'fourth is institutional');
   assert.equal(await p.locator('.k23-area').count(),5,'institutional has five areas');
   // Search jumps across dimensions, preserving proper route.
   await p.locator('details.k23-search-popover summary').click();
   await p.locator('#ds4-search').fill('Impuesto predial');
   const hit=p.locator('#ds4-results [data-ds4-search-topic]').filter({hasText:'Impuesto predial'});
   assert((await hit.count())>=1,'global search index');
   await hit.first().click();
   assert((await p.locator('.k23-dim.active').innerText()).includes('Económica'));
   assert.equal(await p.locator('#ds4-topic-title').innerText(),'Impuesto predial');
   assert.equal(await p.locator('canvas, .ds3-chart-pane').count(),0);
   const geometry=await p.evaluate(el=>{
    const r=el.getBoundingClientRect();
    return {overflow:document.documentElement.scrollWidth-window.innerWidth,
      width:r.width,visible:window.getComputedStyle(el).display!=='none',
      cards:[...el.querySelectorAll('.k23-dim')].map(e=>{
       const b=e.getBoundingClientRect();return {left:b.left,right:b.right}})};
   });
   assert(geometry.visible,'section remains visible');
   // The site's existing off-canvas assistant extends beyond the viewport.
   // Test the Data Subachoque cards themselves, not that unrelated drawer.
   for(const item of geometry.cards)assert(item.left>=-2&&item.right<=width+2,'dimension card contained '+width);
   if(width===1648){await p.screenshot({path:'/tmp/ds4-social-institucional-desktop.png',fullPage:false});}
   if(width===390){await p.screenshot({path:'/tmp/ds4-institucional-mobile.png',fullPage:false});}
   assert.deepEqual(errors,[],'JS errors at '+width);
   await page.close();
  }
  // Global 2.3 characterization must remain untouched, including fourth perception.
  const page=await browser.newPage({viewport:{width:1366,height:850}});
  await page.goto(base+'/#data?seccion=data-encuesta',{waitUntil:'domcontentloaded'});
  await page.locator('#data-encuesta[data-kobo-ready="true"]').waitFor({timeout:35000});
  assert.equal(await page.locator('#data-encuesta .k23-dim').count(),4);
  assert.match(await page.locator('#data-encuesta .k23-dim').nth(3).innerText(),/Percepci[oó]n ciudadana/i);
  assert.equal(await page.locator('#data-encuesta .k23-dim').filter({hasText:'Institucional'}).count(),0);
  await page.close();
  console.log('DATA SUBACHOQUE NAV PASS: 4 official dimensions, 21 areas, 105 topics, no graphs; 4 widths; 2.3 unchanged.');
 }finally{await browser.close();server.close();}
})().catch(err=>{console.error(err.stack||err);server.close();process.exit(1)});
