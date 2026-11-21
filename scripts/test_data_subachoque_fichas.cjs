'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent((req.url||'/').split('?')[0]);
 const f=path.resolve(root,pathname==='/'?'index.html':pathname.replace(/^\/+/,''));
 if(!f.startsWith(root+path.sep))return res.writeHead(403).end();
 fs.stat(f,(e,s)=>{if(e||!s.isFile())return res.writeHead(404).end('Not found');
  res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'});
  fs.createReadStream(f).pipe(res);
 });
});
(async()=>{
 let base=(process.env.BASE_URL||'').replace(/\/$/,'');
 if(!base){await new Promise(r=>server.listen(0,'127.0.0.1',r));base='http://127.0.0.1:'+server.address().port;}
 const source=JSON.parse(fs.readFileSync(path.join(root,'data/fichas-2026-consolidadas.json')));
 assert.equal(source.records.length,341);
 assert.equal(source.records.filter(r=>r.available).length,290);
 assert.equal(source.records.filter(r=>!r.available).length,51);
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 let checks=0;
 try{
  for(const width of [1648,1190,820,390]){
   const page=await browser.newPage({viewport:{width,height:960}});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/#data?seccion=data-subachoque&dimension=institucional',{waitUntil:'domcontentloaded',timeout:45000});
   await page.locator('#data-subachoque[data-ready="true"]').waitFor({timeout:30000});
   const root=page.locator('#data-subachoque');
   assert.equal(await root.locator('.k23-dim').count(),4,'four dimensions');
   assert.match(await root.locator('.k23-dim').nth(3).innerText(),/Institucional/);
   assert.equal(await root.locator('.k23-area').filter({hasText:'Gobierno Territorial'}).count(),1);
   assert.equal(await root.locator('.ds5-kpi').count(),5,'five metric cards');
   assert.equal(await root.locator('.ds5-chart-card').count(),1);
   assert.equal(await root.locator('.ds5-meta-card').count(),1);
   assert.equal(await root.locator('.ds5-findings').count(),1);
   assert.equal(await root.locator('.ds5-analysis').count(),1);
   assert.equal(await root.locator('.ds5-pdf-button').count(),1);
   assert.equal(await root.locator('#ds5-title').innerText(),'Índice de Desempeño Institucional (IDI)');
   const id=await root.locator('#ds5-kpis').innerText();
   assert.match(id,/87,9/,'actual 2025 IDI value from workbook');
   assert.match(id,/2025/,'last year 2025, not invented 2026 result');
   assert.match(id,/18/,'absolute yearly increase 2024 to 2025');
   assert.match(await root.locator('#ds5-dual').innerText(),/Departamento Administrativo de la Función Pública/);
   assert.match(await root.locator('#ds5-dual').innerText(),/2026/);
   assert.match(await root.locator('#ds5-related-root').innerText(),/Política/);
   assert.equal(await root.locator('.ds5-chart-frame svg').count(),1);
   assert.equal(await root.locator('#ds5-code').innerText(),'TI-DS-04.01.01-002','issued internal code from immutable registry');
   const g=await page.evaluate(()=>{
    const card=document.querySelector('#data-subachoque .ds5-ficha-card').getBoundingClientRect();
    const chart=document.querySelector('#data-subachoque .ds5-chart-card').getBoundingClientRect();
    const meta=document.querySelector('#data-subachoque .ds5-meta-card').getBoundingClientRect();
    const tab=document.querySelector('#data-subachoque .ds5-dims').getBoundingClientRect();
    return {card:{left:card.left,right:card.right},chart:{left:chart.left,right:chart.right},meta:{left:meta.left,right:meta.right},tabs:{left:tab.left,right:tab.right}};
   });
   for(const r of [g.card,g.chart,g.meta,g.tabs])assert(r.left>=-2&&r.right<=width+2,'No overflow '+width+' '+JSON.stringify(r));
   // Institutional source is authoritative; dimension 4 in 2.3 is perception.
   await root.locator('.k23-dim').nth(0).click();
   assert.match(await root.locator('.k23-dim.active').innerText(),/Social/);
   await root.locator('.k23-dim').nth(2).click();
   assert.match(await root.locator('.k23-dim.active').innerText(),/Ambiental/);
   await root.locator('.k23-dim').nth(3).click();
   assert.match(await root.locator('.k23-dim.active').innerText(),/Institucional/);
   assert.equal(await root.locator('button.k23-topic[disabled]').count(),0,'no dark disabled category tabs');
   assert.equal(await root.locator('button.k23-area[disabled]').count(),0,'no dark disabled area tabs');
   const availableTopicCount=await root.locator('button.k23-topic').count();
   assert(availableTopicCount>=1,'there is at least one valid category');
   if(width===1648){
    await root.screenshot({path:'/tmp/data-subachoque-fichas-desktop.png',fullPage:false});
    const pdf=await page.pdf({path:'/tmp/data-subachoque-idi.pdf',format:'A4',printBackground:true});
    assert(pdf.length>10000,'PDF from printed indicator fiche');
    assert(pdf.subarray(0,4).toString()==='%PDF');
   }
   if(width===390)await root.screenshot({path:'/tmp/data-subachoque-fichas-mobile.png',fullPage:false});
   assert.deepEqual(errors,[],'No page errors on '+width);
   checks++;
   await page.close();
  }
  const page=await browser.newPage({viewport:{width:1366,height:950}});
  await page.goto(base+'/#data?seccion=data-subachoque&dimension=economica',{waitUntil:'domcontentloaded'});
  await page.locator('#data-subachoque[data-ready="true"]').waitFor({timeout:30000});
  const r=page.locator('#data-subachoque');
  await r.locator('#ds5-search').fill('Recaudo del impuesto predial municipal');
  const matches=r.locator('#ds5-results .ds5-search-result');
  assert((await matches.count())>=1,'Imported Hacienda indicator indexed globally');
  await matches.first().click();
  assert.match(await r.locator('#ds5-title').innerText(),/predial/i);
  assert.equal(await r.locator('.ds5-chart-card').count(),1);
  assert.equal(await r.locator('.ds5-kpi').count(),5);
  const val=await r.locator('#ds5-kpis').innerText();assert.match(val,/2026|2025/);
  await page.goto(base+'/#data?seccion=data-encuesta',{waitUntil:'domcontentloaded'});
  await page.locator('#data-encuesta[data-kobo-ready="true"]').waitFor({timeout:30000});
  assert.match(await page.locator('#data-encuesta .k23-dim').nth(3).innerText(),/Percepci[oó]n ciudadana/i);
  await page.close();
  console.log('DATA SUBACHOQUE FICHAS PASS: 341 consolidated, 290 with values, 51 unavailable, four widths, IDI 87.9 from 2025, Hacienda, print PDF, 2.3 unchanged. Tests',checks);
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e.stack||e);server.close();process.exit(1)});
