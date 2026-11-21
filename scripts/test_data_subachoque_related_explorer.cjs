'use strict';
// End-to-end verification: no data loss, responsive layout and related-card navigation.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const records=JSON.parse(fs.readFileSync(path.join(root,'data/fichas-2026-validadas.json'))).records.filter(r=>r.available);
const mimes={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 const u=decodeURIComponent((req.url||'/').split('?')[0]);
 const file=path.resolve(root,u==='/'?'index.html':u.replace(/^\/+/,''));
 if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
 fs.stat(file,(err,s)=>{if(err||!s.isFile())return res.writeHead(404).end('Missing');
  res.writeHead(200,{'Content-Type':mimes[path.extname(file)]||'application/octet-stream'});
  fs.createReadStream(file).pipe(res);
 });
});
(async()=>{
 let base=process.env.BASE_URL?.replace(/\/$/,'');
 if(!base)await new Promise(done=>server.listen(0,'127.0.0.1',()=>{base='http://127.0.0.1:'+server.address().port;done()}));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  for(const width of [1600,1050,750,390]){
   const page=await browser.newPage({viewport:{width,height:1000}});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/#data?seccion=data-subachoque&dimension=institucional',{waitUntil:'domcontentloaded'});
   await page.locator('#data-subachoque[data-ready="true"]').waitFor({timeout:40000});
   const container=page.locator('#data-subachoque'),panel=container.locator('.ds5-related');
   assert.equal(await panel.count(),1,'one related explorer');
   assert.equal(await panel.locator('.ds5-related-card').count(),3,'compact preview only');
   assert.equal(await panel.locator('[data-ds5-related-group="all"]').count(),1);
   assert.equal(await panel.locator('.ds5-related-card.is-current').count(),1);
   assert.match(await panel.locator('.ds5-related-heading small').innerText(),/21 indicadores/);
   assert.match(await panel.locator('.ds5-related-card.is-current .ds5-related-name').innerText(),/Índice de Desempeño Institucional/);
   assert.equal(await panel.locator('[data-ds5-related-group]').count(),6,'governance filters');
   const groups=await panel.locator('.ds5-related-filter').evaluateAll(nodes=>nodes.map(n=>({id:n.dataset.ds5RelatedGroup,count:Number((n.textContent.match(/\((\d+)\)/)||[])[1])})));
   assert.equal(groups.filter(x=>x.id!=='all').reduce((n,g)=>n+g.count,0),21);
   const bounds=await panel.locator('.ds5-related-card').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return{left:r.left,right:r.right}}));
   for(const r of bounds)assert(r.left>=-2 && r.right<=width+2,'card fits viewport '+width+': '+JSON.stringify(r));
   if(width===1600||width===390){await panel.scrollIntoViewIfNeeded();await panel.screenshot({path:'/tmp/related-'+width+'.png'});}
   await panel.locator('[data-ds5-related-group="control"]').click();
   assert.equal(await panel.locator('[data-ds5-related-group="control"]').getAttribute('aria-pressed'),'true');
   assert.equal(await panel.locator('.ds5-related-card').count(),3);
   await panel.locator('[data-ds5-related-expand="true"]').click();
   assert.equal(await panel.locator('.ds5-related-card').count(),4,'4 control indicators from Excel');
   await panel.locator('#ds5-related-search').fill('Interno');
   assert.equal(await panel.locator('.ds5-related-card').count(),1);
   assert.match(await panel.locator('.ds5-related-name').innerText(),/Control Interno/);
   await panel.locator('#ds5-related-search').fill('');
   assert.equal(await panel.locator('.ds5-related-card').count(),4);
   await panel.locator('[data-ds5-related-expand="false"]').click();
   assert.equal(await panel.locator('.ds5-related-card').count(),3);
   await panel.locator('[data-ds5-related-group="all"]').click();
   await panel.locator('[data-ds5-related-expand="true"]').click();
   const ids=await panel.locator('.ds5-related-card').evaluateAll(nodes=>nodes.map(n=>n.dataset.ds5Indicator));
   assert.equal(ids.length,21);
   assert.equal(new Set(ids).size,21);
   assert.deepEqual(new Set(ids),new Set(records.filter(r=>r.dim==='institucional'&&r.areaCode==='4.1').map(r=>r.id)));
   assert.equal(await panel.locator('.ds5-related-show-all').getAttribute('aria-expanded'),'true');
   const next=ids.find(x=>x!=='3b6696367fed');
   await panel.locator('[data-ds5-indicator="'+next+'"]').click();
   assert.equal(await container.locator('#ds5-title').innerText(),records.find(r=>r.id===next).name);
   assert.equal(await panel.locator('.ds5-related-card').count(),3);
   assert.deepEqual(errors,[],'JS errors on '+width);
   await page.close();
  }
  const page=await browser.newPage({viewport:{width:1500,height:920}});
  await page.goto(base+'/#data?seccion=data-subachoque&dimension=institucional',{waitUntil:'domcontentloaded'});
  await page.locator('#data-subachoque[data-ready="true"]').waitFor({timeout:40000});
  const content=page.locator('#data-subachoque'),found=new Set();let areaCount=0;
  for(const d of ['institucional','economica','ambiental','social']){
   await content.locator('[data-ds5-dim="'+d+'"]').click();
   const areaIds=await content.locator('[data-ds5-area]').evaluateAll(nodes=>nodes.map(n=>n.dataset.ds5Area));
   for(const areaId of areaIds){
    await content.locator('[data-ds5-area="'+areaId+'"]').click();
    const panel=content.locator('.ds5-related');
    const n=Number((await panel.locator('.ds5-related-heading small').innerText()).match(/(\d+)/)[1]);
    if(n>3)await panel.locator('[data-ds5-related-expand="true"]').click();
    const ids=await panel.locator('.ds5-related-card').evaluateAll(nodes=>nodes.map(n=>n.dataset.ds5Indicator));
    assert.equal(ids.length,n,'All related cards available '+d+'/'+areaId);
    for(const id of ids){assert(!found.has(id),'Duplicated in other areas '+id);found.add(id);}
    const groups=await panel.locator('.ds5-related-filter').evaluateAll(nodes=>nodes.map(n=>({id:n.dataset.ds5RelatedGroup,count:Number((n.textContent.match(/\((\d+)\)/)||[])[1])})));
    assert.equal(groups.filter(g=>g.id!=='all').reduce((a,g)=>a+g.count,0),n,'Groups partition '+d+'/'+areaId);
    areaCount++;
   }
  }
  assert.equal(found.size,290);
  assert.deepEqual(found,new Set(records.map(r=>r.id)));
  await page.goto(base+'/#data?seccion=data-encuesta',{waitUntil:'domcontentloaded'});
  await page.locator('#data-encuesta[data-kobo-ready="true"]').waitFor({timeout:35000});
  assert.match(await page.locator('#data-encuesta .k23-dim').nth(3).innerText(),/Percepci[oó]n ciudadana/i);
  await page.close();
  console.log('RELATED_EXPLORER_PASS 4 widths, filters, search, all 290 records across '+areaCount+' areas, KoBo untouched.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e.stack||e);server.close();process.exit(1)});
