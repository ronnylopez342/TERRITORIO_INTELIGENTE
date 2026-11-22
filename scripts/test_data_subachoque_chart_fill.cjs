'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const items=require('../data/fichas-2026-validadas.json').records.filter(r=>r.available);
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 const p=decodeURIComponent((req.url||'/').split('?')[0]);
 const full=path.resolve(root,p==='/'?'index.html':p.replace(/^\/+/,''));
 if(!full.startsWith(root+path.sep))return res.writeHead(403).end();
 fs.stat(full,(e,s)=>{if(e||!s.isFile())return res.writeHead(404).end('not found');
  res.writeHead(200,{'Content-Type':mime[path.extname(full)]||'application/octet-stream'});
  fs.createReadStream(full).pipe(res);
 });
});
async function selectIndicator(page,r){
 const panel=page.locator('#data-subachoque');
 await panel.locator('#ds5-search').fill(r.name);
 await panel.locator('[data-ds5-search="'+r.id+'"]').click();
 const selected=await panel.locator('#ds5-title').innerText();
 assert.equal(selected.replace(/\s+/g,' ').trim(),r.name.replace(/\s+/g,' ').trim(),'wrong indicator');
 const frame=panel.locator('.ds5-chart-frame');
 if(r.series.length){
  await page.waitForFunction(()=>{const n=document.querySelector('#data-subachoque .ds5-chart-frame');return n?.dataset.plotSize&&!!n.querySelector('svg');},{timeout:20000});
 }
 return frame;
}
async function geometry(page,r){
 const result=await page.evaluate(()=>{
  const frame=document.querySelector('#data-subachoque .ds5-chart-frame');
  const card=frame.closest('.ds5-chart-card');
  const svg=frame.querySelector('svg.ds5-chart-svg');
  const bounds=el=>{const b=el.getBoundingClientRect();return{x:b.x,y:b.y,w:b.width,h:b.height,right:b.right,bottom:b.bottom}};
  const visualTexts=(svg?.querySelectorAll('.ds5-graph-value,.ds5-graph-year,.ds5-graph-tick')||[]);
  const labels=[...visualTexts].map(el=>{
   const b=el.getBBox();return{type:el.classList.contains('ds5-graph-value')?'value':el.classList.contains('ds5-graph-year')?'year':'tick',
     text:el.textContent,x:b.x,y:b.y,w:b.width,h:b.height,font:parseFloat(el.getAttribute('font-size')||getComputedStyle(el).fontSize)};
  });
  const corners=svg?svg.viewBox.baseVal:null;
  return{frame:bounds(frame),card:bounds(card),svg:svg&&bounds(svg),
    view:corners?{w:corners.width,h:corners.height}:null,
    plotSize:frame.dataset.plotSize,labels,
    axisText:document.querySelector('#data-subachoque .ds5-chart-axis-name')?.textContent||'',
    svgAccessible:svg?.getAttribute('aria-label'),
    categories:frame.querySelectorAll('.ds5-bar-row').length,
    chartType:svg?'temporal':'categorical'};
 });
 if(result.svg){
  assert(Math.abs(result.svg.w-result.frame.w)<2.5,'chart should use entire width');
  assert(Math.abs(result.svg.h-result.frame.h)<2.5,'chart should use entire height');
  assert(Math.abs(result.view.w-result.frame.w)<=3,'SVG logical and real width equal');
  assert(Math.abs(result.view.h-result.frame.h)<=3,'SVG logical and real height equal');
  assert(result.frame.h>=320,'graph card should be tall enough');
  assert(result.labels.filter(x=>x.type==='value').every(x=>x.font>=17),'value labels too small');
  const textCollision=(x,y)=>x.x<y.x+y.w-2&&x.x+x.w>y.x+2&&x.y<y.y+y.h-2&&x.y+x.h>y.y+2;
  const nums=result.labels.filter(x=>x.type==='value');
  for(let i=0;i<nums.length;i++){
   const a=nums[i];assert(a.x>=-2&&a.x+a.w<=result.view.w+2&&a.y>=-2&&a.y+a.h<=result.view.h+2,'value label clipped: '+a.text);
   for(let j=i+1;j<nums.length;j++)assert(!textCollision(a,nums[j]),'value labels collide '+a.text+' and '+nums[j].text);
  }
  // No labels collide with year numbers. Tick labels are outside the plot.
  for(const n of nums)for(const year of result.labels.filter(x=>x.type==='year'))
    assert(!textCollision(n,year),'value/year label overlap: '+n.text+' with '+year.text);
 }
 return result;
}
(async()=>{
 let base=process.env.BASE_URL?.replace(/\/$/,'');
 if(!base)await new Promise(resolve=>server.listen(0,'127.0.0.1',()=>{base='http://127.0.0.1:'+server.address().port;resolve()}));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  let checks=0;
  const samples=[
   'e48851583333',  // 2024 100% -> 2025 65% (user screenshot)
   'f638706658df',  // 11 annual points
   'ab6b9409a865',  // 32 category values
   'ed19995f0bac',  // large currency values
   '3b6696367fed'   // institution IDI
  ];
  for(const width of [1600,980,620,390]){
   const page=await browser.newPage({viewport:{width,height:950}});
   const jsErrors=[];page.on('pageerror',e=>jsErrors.push(e.message));
   await page.goto(base+'/#data?seccion=data-subachoque&dimension=institucional',{waitUntil:'domcontentloaded'});
   await page.locator('#data-subachoque[data-ready="true"]').waitFor({timeout:45000});
   for(const id of samples){
    const r=items.find(x=>x.id===id);if(!r)throw Error('Missing sample '+id);
    const frame=await selectIndicator(page,r);
    let g=await geometry(page,r);
    if(id==='e48851583333'){
     assert(g.svg,'percent screenshot must have SVG');
     assert(g.svgAccessible.includes('2024: 100 %')||g.svgAccessible.includes('2024: 100'),'2024 value preserved');
     assert(g.svgAccessible.includes('2025: 65 %')||g.svgAccessible.includes('2025: 65'),'2025 value preserved');
     assert(g.labels.some(x=>x.type==='value'&&x.text.startsWith('100')));
     assert(g.labels.some(x=>x.type==='value'&&x.text.startsWith('65')));
     if(width===1600||width===390){
      await page.locator('#data-subachoque .ds5-chart-card').scrollIntoViewIfNeeded();
      await page.locator('#data-subachoque .ds5-chart-card').screenshot({path:'/tmp/chart-full-'+width+'.png'});
     }
    }
    if(id==='ab6b9409a865'){
     await page.locator('#data-subachoque [data-ds5-chartmode="categorias"]').click();
     g=await geometry(page,r);
     assert.equal(g.chartType,'categorical');assert.equal(g.categories,32,'all 32 category values kept');
     const scroll=await frame.evaluate(n=>({height:n.scrollHeight,client:n.clientHeight}));
     assert(scroll.height<=scroll.client+6,'categorical graph must not have internal scrollbar');
    }
    checks++;
   }
   assert.deepEqual(jsErrors,[],'No JS errors');
   await page.close();
  }
  // Walk ALL 290 graphs on 1280px: no regression and every series value retained.
  const page=await browser.newPage({viewport:{width:1280,height:960}});
  await page.goto(base+'/#data?seccion=data-subachoque&dimension=institucional',{waitUntil:'domcontentloaded'});
  await page.locator('#data-subachoque[data-ready="true"]').waitFor({timeout:35000});
  let primary=0;
  for(const r of items){
   await selectIndicator(page,r);
   let g=await geometry(page,r);
   if(r.series.some(s=>s.points?.length)){
    assert.equal(g.chartType,'temporal','Expected temporal for '+r.id+' '+r.name);
    assert(g.svgAccessible.length>15,'SVG accessibility text missing '+r.name);
    const currentSeries=r.series.filter(s=>s.points?.length);
    for(let i=1;i<currentSeries.length;i++){
     await page.locator('#data-subachoque #ds5-series-select').selectOption(String(i));
     await page.waitForFunction(expected=>{
       const f=document.querySelector('#data-subachoque .ds5-chart-frame');
       return !!f?.dataset.plotSize&&f.dataset.plotSize.includes(':'+expected+':');
     },i,{timeout:20000});
     g=await geometry(page,r);
     const text=g.svgAccessible;
     const first=currentSeries[i].points[0],last=currentSeries[i].points.at(-1);
     assert(text.includes(String(first[0]))&&text.includes(String(last[0])),'series years lost '+r.name);
    }
    primary+=currentSeries.length;
   } else {
    assert.equal(g.chartType,'categorical','Expected categorical for '+r.id+' '+r.name);
    const n=r.categories.reduce((s,c)=>s+c.values.length,0);
    assert.equal(g.categories,n,'categorical rows missing');
   }
   checks++;
  }
  console.log('CHART_FILL_PASS',JSON.stringify({cases:checks,primary,viewportWidths:[1600,980,620,390,1280],allRecords:items.length}));
  await page.close();
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e.stack||e);server.close();process.exit(1)});
