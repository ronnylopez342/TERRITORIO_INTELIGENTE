'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const records=JSON.parse(fs.readFileSync(path.join(root,'data/fichas-2026-validadas.json'),'utf8')).records.filter(r=>r.available);
const server=http.createServer((req,res)=>{
 const url=decodeURIComponent((req.url||'/').split('?')[0]),p=path.resolve(root,url==='/'?'index.html':url.replace(/^\/+/,''));
 if(!p.startsWith(root+path.sep))return res.writeHead(403).end();
 fs.stat(p,(e,stat)=>{
  if(e||!stat.isFile())return res.writeHead(404).end();
  const ext=path.extname(p),type={'.js':'text/javascript','.json':'application/json','.css':'text/css','.html':'text/html'}[ext]||'application/octet-stream';
  res.writeHead(200,{'Content-Type':type});fs.createReadStream(p).pipe(res);
 });
});
(async()=>{
 let base=process.env.BASE_URL?.replace(/\/$/,'');
 if(!base)await new Promise(done=>server.listen(0,'127.0.0.1',()=>{base='http://127.0.0.1:'+server.address().port;done()}));
 const browser=await chromium.launch({args:['--no-sandbox']});
 try{
  for(const width of [1600,920,390]){
   const p=await browser.newPage({acceptDownloads:true,viewport:{width,height:1000}});
   const errors=[];p.on('pageerror',e=>errors.push(e.message));
   await p.goto(base+'/#data?seccion=data-subachoque&dimension=institucional',{waitUntil:'domcontentloaded'});
   const root=p.locator('#data-subachoque');
   await root.locator('[data-ready="true"]').count();
   await p.locator('#data-subachoque[data-ready="true"]').waitFor({timeout:40000});
   const example=records.find(x=>x.name.includes('Índice de Desempeño Institucional'));
   assert(example,'IDI must exist');
   assert.equal(await root.locator('#ds5-code').innerText(),example.graphCode,'GRA code in header');
   assert((await root.locator('.ds5-meta-card').innerText()).includes(example.graphCode),'GRA code in metadata');
   assert((await root.locator('.ds5-related-card').first().innerText()).includes(example.graphCode),'related card GRA code visible');
   const rect=await root.locator('#ds5-code').boundingBox(); assert(rect?.width>35&&rect?.x>=0&&rect?.x+rect?.width<=width+2,'code badge fits screen');
   const fromSheet=example.meta.code;
   if(fromSheet&&!/LO ASIGNAMOS|PENDIENTE/.test(fromSheet)&&!/^\d+$/.test(fromSheet))assert((await root.locator('.ds5-meta-card').innerText()).includes(fromSheet),'source code preserved');
   await root.locator('#ds5-search').fill(example.graphCode);
   const results=root.locator('#ds5-results [data-ds5-search]');
   assert.equal(await results.count(),1,'find unique indicator by exact internal code');
   assert((await results.first().innerText()).includes(example.graphCode),'search shows GRA code');
   await results.first().click();
   assert.equal(await root.locator('#ds5-code').innerText(),example.graphCode);
   const pdf=await Promise.all([p.waitForEvent('download',{timeout:12000}),root.locator('#ds5-download').click()]).then(a=>a[0]);
   assert(pdf.suggestedFilename().includes(example.graphCode),'filename includes graph code');
   const file='/tmp/ti-codigo-'+width+'.pdf';await pdf.saveAs(file);
   const raw=fs.readFileSync(file).toString('latin1');
   assert(raw.includes(example.graphCode),'PDF includes GRA code');
   assert(raw.includes('CODIGO DE GRAFICA'),'code label in PDF');
   assert.deepEqual(errors,[],'JS errors');
   await p.close();
  }
  // Perform full search verification for every published indicator. First
  // search result must uniquely correspond to that exact assigned code.
  const page=await browser.newPage({viewport:{width:1350,height:960}});
  await page.goto(base+'/#data?seccion=data-subachoque&dimension=institucional',{waitUntil:'domcontentloaded'});
  await page.locator('#data-subachoque[data-ready="true"]').waitFor({timeout:40000});
  for(const r of records){
   const input=page.locator('#ds5-search');
   for(const code of [r.graphCode,r.shortCode,r.catalogCode]){
    await input.fill(code);
    const matches=page.locator('#ds5-results [data-ds5-search]');
    assert.equal(await matches.count(),1,'code resolves exactly one available fiche '+code);
    assert.equal(await matches.first().getAttribute('data-ds5-search'),r.id);
   }
  }
  console.log('CODE_UI_PASS',{searched:records.length,unique:341,viewports:[1600,920,390],pdfCode:true,relatedCards:true,sourceCodeIntact:true});
  await page.close();
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e.stack||e);server.close();process.exit(1)});
