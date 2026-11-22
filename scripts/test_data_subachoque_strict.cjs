'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const catalog=require('../data/data-subachoque-dimensiones.json');
const file=require('../data/fichas-2026-validadas.json');
const audit=require('../data/auditoria-clasificacion-fichas.json');
const data=file.records;
const available=data.filter(r=>r.available);
assert.equal(available.length,319);
assert.equal(audit.corrected.length,70);
assert.equal(audit.sourceFiles,9);
assert.equal(available.reduce((n,r)=>n+r.series.length,0),517);
assert.equal(available.reduce((n,r)=>n+r.series.reduce((k,s)=>k+s.points.length,0),0),1430);
assert.equal(available.reduce((n,r)=>n+r.categories.reduce((k,c)=>k+c.values.length,0),0),152);
const topiccodes=new Set(catalog.dimensiones.flatMap(d=>d.areas.flatMap(a=>a.topics.map(t=>t.documentCode))));
for(const r of available){
 assert(topiccodes.has(r.topicCode)||(r.topicCode===''&&r.topicLabel==='Inversión social municipal'),'Strict official taxonomy mapping: '+r.name);
 assert(r.classification?.verifiedAgainst&&r.sourceClassification,'Audit trail '+r.name);
 assert(!(r.otherSources||[]).some(s=>s.workbook===r.sourceFile&&s.sheet===r.sourceSheet),'Own duplicated source '+r.name);
}
const server=http.createServer((req,res)=>{
 const url=decodeURIComponent((req.url||'/').split('?')[0]);
 const p=path.resolve(root,url==='/'?'index.html':url.replace(/^\/+/,''));
 if(!p.startsWith(root+path.sep))return res.writeHead(403).end();
 fs.stat(p,(e,s)=>{
  if(e||!s.isFile())return res.writeHead(404).end('Missing');
  const mime=p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':p.endsWith('.json')?'application/json':'text/html';
  res.writeHead(200,{'Content-Type':mime});fs.createReadStream(p).pipe(res);
 });
});
(async()=>{
 const base=process.env.BASE_URL||await new Promise(resolve=>server.listen(0,'127.0.0.1',()=>resolve('http://127.0.0.1:'+server.address().port)));
 const browser=await chromium.launch({args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1600,height:1080}});
  await page.goto(base+'/#data?seccion=data-subachoque&dimension=institucional',{waitUntil:'domcontentloaded'});
  await page.locator('#data-subachoque[data-ready="true"]').waitFor({timeout:55000});
  const result=await page.evaluate(async list=>{
   const root=document.getElementById('data-subachoque');
   const input=root.querySelector('#ds5-search');
   const failures=[];let checked=0,series=0,dual=0,areas=0,topics=0;
   for(const r of list){
    input.value=r.name;input.dispatchEvent(new Event('input',{bubbles:true}));
    const btn=root.querySelector('[data-ds5-search="'+r.id+'"]');
    if(!btn){failures.push('Search missing '+r.id+' '+r.name);continue;}
    btn.click();
    const active=root.querySelector('#ds5-title');
    if(active?.textContent!==r.name){failures.push('Misrouted '+r.name+' got '+active?.textContent);continue;}
    if(root.querySelectorAll('button.k23-area[disabled],button.k23-topic[disabled]').length)
      failures.push('Disabled controls still visible '+r.name);
    const chart=root.querySelector('.ds5-chart-card');
    if(!chart||!root.querySelector('.ds5-meta-card')){failures.push('Missing chart/metadata '+r.name);continue;}
    const times=r.series.filter(s=>s.points?.length);
    const cats=r.categories.reduce((n,c)=>n+c.values.length,0);
    if(times.length){
      if(!chart.querySelector('svg'))failures.push('Temporal graph missing '+r.name);
      if(times.length>1&&chart.querySelectorAll('select option').length!==times.length)
        failures.push('Missing series choices '+r.name);
      series+=times.length;
    }else if(cats&&!chart.querySelector('.ds5-bar-list'))failures.push('Categorical chart missing '+r.name);
    if(cats&&times.length){
      const b=chart.querySelector('[data-ds5-chartmode="categorias"]');
      if(!b)failures.push('Category toggle missing '+r.name);
      else{
       b.click();
       const count=root.querySelectorAll('.ds5-bar-row').length;
       if(count!==cats)failures.push('Lost categorical values '+r.name+': '+count+' / '+cats);
       if(!root.querySelector('[data-ds5-chartmode="temporal"]'))failures.push('No return toggle '+r.name);
      }
      dual++;
    }else if(cats){
      const count=chart.querySelectorAll('.ds5-bar-row').length;
      if(count!==cats)failures.push('Missing categorical rows '+r.name+': '+count+' / '+cats);
    }
    checked++;
   }
   const selectedDims=[...root.querySelectorAll('.k23-dim')].map(b=>b.textContent.trim());
   return {checked,series,dual,selectedDims,failures};
  },available);
  assert.equal(result.checked,319);
  assert.equal(result.series,517);
  assert.equal(result.dual,14);
  assert.deepEqual(result.failures,[]);
  for(const d of catalog.dimensiones){
   await page.locator('[data-ds5-dim="'+d.id+'"]').click();
   const areas=page.locator('#data-subachoque [data-ds5-area]');
   assert((await areas.count())>=1,'No available area '+d.id);
   assert.equal(await page.locator('#data-subachoque [data-ds5-area][disabled]').count(),0);
   for(let i=0;i<await areas.count();i++){
    await areas.nth(i).click();
    const topic=page.locator('#data-subachoque [data-ds5-topic]');
    assert((await topic.count())>=1,'Available area lacking topics '+d.id);
    assert.equal(await page.locator('#data-subachoque [data-ds5-topic][disabled]').count(),0);
   }
  }
  console.log('STRICT_VISUAL_AUDIT_PASS',JSON.stringify(result).slice(0,580));
  await page.close();
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e.stack||e);server.close();process.exit(1)});
