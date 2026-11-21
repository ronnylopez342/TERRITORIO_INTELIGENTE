'use strict';
const fs=require('fs'),path=require('path'),http=require('http');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 const u=decodeURIComponent((req.url||'/').split('?')[0]);
 const f=path.resolve(root,u==='/'?'index.html':u.replace(/^\/+/,''));
 if(!f.startsWith(root+path.sep))return res.writeHead(403).end();
 fs.stat(f,(e,s)=>{if(e||!s.isFile())return res.writeHead(404).end();
 const type=f.endsWith('.css')?'text/css':f.endsWith('.js')?'text/javascript':f.endsWith('.json')?'application/json':'text/html';
 res.writeHead(200,{'Content-Type':type});fs.createReadStream(f).pipe(res)});
});
(async()=>{
 await new Promise(res=>server.listen(0,res));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const p=await browser.newPage({acceptDownloads:true,viewport:{width:1280,height:900}});
  const errors=[];p.on('pageerror',e=>errors.push(e.message));
  p.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text())});
  await p.goto('http://127.0.0.1:'+server.address().port+'/#data?seccion=data-subachoque&dimension=institucional',{waitUntil:'domcontentloaded'});
  await p.locator('#data-subachoque[data-ready="true"]').waitFor({timeout:30000});
  const download=await Promise.all([p.waitForEvent('download',{timeout:10000}),p.locator('#ds5-download').click()]).then(x=>x[0]);
  assert.match(download.suggestedFilename(),/^Data-Subachoque-.+\.pdf$/);
  await download.saveAs('/tmp/ti-ficha-idi-direct.pdf');
  const buf=fs.readFileSync('/tmp/ti-ficha-idi-direct.pdf');
  assert.equal(buf.toString('latin1',0,8),'%PDF-1.4');
  assert(buf.length>2500&&buf.length<1500000,'PDF must contain full content');
  assert(buf.toString('latin1').includes('87,9'),'Actual IDI value preserved in PDF');
  assert(buf.toString('latin1').includes('Departamento Administrativo'),'Origin/definition preserved');
  assert(buf.toString('latin1').includes('startxref'),'PDF xref present');
  assert.deepEqual(errors.filter(x=>!x.includes('ERR_NAME_NOT_RESOLVED')),[]);
  await p.close();
  console.log('PDF DOWNLOAD PASS',download.suggestedFilename(),'bytes',buf.length,'header, values, metadata, xref verified');
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e.stack||e);server.close();process.exit(1)});
