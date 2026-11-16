/* Smoke actual: navegacion de las cuatro vistas Data, sin depender de previews
   retirados. Usa un servidor local de solo lectura y Chrome sin login. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
 '.css':'text/css; charset=utf-8','.json':'application/json',
 '.geojson':'application/geo+json','.svg':'image/svg+xml','.png':'image/png',
 '.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp',
 '.mp4':'video/mp4','.pdf':'application/pdf'};
const server=http.createServer((req,res)=>{
 let uri;
 try{uri=decodeURIComponent((req.url||'/').split('?')[0]);}
 catch{return res.writeHead(400).end();}
 const rel=uri==='/'?'index.html':uri.replace(/^\/+/, '');
 const dest=path.resolve(root,rel);
 if(dest!==root&&dest!==path.join(root,'index.html')&&!dest.startsWith(root+path.sep))
   return res.writeHead(403).end();
 fs.stat(dest,(err,st)=>{
   if(err||!st.isFile())return res.writeHead(404).end('Not found');
   res.writeHead(200,{'Content-Type':types[path.extname(dest)]||'application/octet-stream'});
   fs.createReadStream(dest).pipe(res);
 });
});
async function run(){
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1420,height:900}});
 const ids=['data-conoce','data-subachoque','data-encuesta','data-explorando'];
 try{
   await page.goto('http://127.0.0.1:'+server.address().port+'/#data',{waitUntil:'domcontentloaded',timeout:45000});
   await page.waitForFunction(()=>!!document.querySelector('.app-view.active[data-view="data"]'),{timeout:25000});
   assert.equal(await page.locator('#dataSubnav [data-module-panel]').count(),4);
   for(const id of ids){
     const switched=await page.evaluate(id=>selectDataPanel(id),id);
     assert.equal(switched,true,'No se puede activar '+id);
     const result=await page.evaluate(id=>{
       const panel=document.getElementById(id);
       const others=[...document.querySelectorAll('[data-panel-group="data"]')].filter(x=>x.id!==id);
       return {visible:!panel.hidden,active:panel.classList.contains('active'),
        othersHidden:others.every(x=>x.hidden),text:panel.textContent.trim().length};
     },id);
     assert.ok(result.visible&&result.active&&result.othersHidden,'Navegacion incoherente: '+id);
     assert.ok(result.text>200,'Contenido vacio en '+id);
   }
   await page.evaluate(()=>selectDataPanel('data-subachoque'));
   await page.waitForFunction(()=>document.querySelectorAll('#ds3-dimensions [data-ds3-dimension]').length===4,{timeout:25000});
   await page.evaluate(()=>selectDataPanel('data-encuesta'));
   await page.waitForFunction(
     ()=>document.querySelectorAll('#k23-dims [data-k23-dim]').length===4,
     null,{timeout:25000}
   );
   assert.equal(await page.locator('#k23-dims [data-k23-dim]').count(),4,
     'Seccion KoBo: faltan dimensiones reales');
   console.log('SMOKE DATA ACTUAL: 4 vistas con navegacion funcional, 4 dimensiones y panel KoBo disponibles.');
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
run().catch(e=>{console.error(e);server.close();process.exitCode=1;});
