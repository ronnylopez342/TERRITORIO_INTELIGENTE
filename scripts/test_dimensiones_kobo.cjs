/* Regression: official dimension taxonomy and KoBo aggregates without browser dependencies. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const base=path.resolve(__dirname,'..');
const file=p=>fs.readFileSync(path.join(base,p));
const html=file('index.html').toString('utf8');
const css=file('css/ti-dimensiones-kobo-20261118.css').toString('utf8');
const js=file('js/caracterizacion-kobo.js').toString('utf8');
const catalog=JSON.parse(file('data/dimensiones-kobo-catalogo.json'));
const d=catalog.dimensiones;
assert.equal(d.length,4);
assert.deepEqual(d.map(x=>x.id),['social','economica','ambiental','percepcion']);
assert.deepEqual(d.map(x=>x.areas.length),[6,6,4,4]);
assert.equal(d.slice(0,3).reduce((n,x)=>n+x.areas.reduce((m,a)=>m+a.temas.length,0),0),86);
assert(!JSON.stringify(d).includes('Dimensión Institucional'));
assert(d.slice(0,3).every(x=>x.areas.every(a=>a.temas.every(t=>t.id&&t.code&&t.nombre))));
assert.equal(new Set(d.flatMap(x=>x.areas.flatMap(a=>a.temas.map(t=>t.id)))).size,90);
assert(d[3].areas.every(a=>a.temas.length===1&&a.temas[0].id===a.id));
assert.deepEqual(d[0].areas[0].temas.map(t=>t.nombre),
  ['Aseguramiento','Salud pública','Prestación de servicios de salud','Discapacidad','Adulto mayor','Primera infancia','Nutrición']);
for(const id of ['k23-dims','k23-areas','k23-topics','k23-chart','k23-insight','k23-findings','k23-category-row','k23-selected-path']){
 assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,'unique '+id);
}
assert(html.includes('ti-dimensiones-kobo-20261118.css'));
assert(css.includes('#data-encuesta .k23-workspace')&&css.includes('grid-template-columns:minmax(0,1.78fr)'));
new Function(js);

const elements=new Map();
function element(id){
 if(!elements.has(id))elements.set(id,{
  id,innerHTML:'',textContent:'',value:'',hidden:false,open:false,
  style:{setProperty(){}},replaceChildren(){this.innerHTML='';},
  setAttribute(k,v){this[k]=v;},getAttribute(k){return this[k]},
  classList:{toggle(){},contains(){return false}}
 });
 return elements.get(id);
}
const listeners={};
const root={
 dataset:{},
 querySelector(selector){if(selector==='#k23-app')return element('k23-app');return element(selector.replace(/^#/,'').replace(/^\./,''));},
 querySelectorAll(){return []},
 contains(){return true},
 addEventListener(event,fn){listeners[event]=fn;}
};
const location={hash:'#data?seccion=data-encuesta'};
const history={pushState(_state,_title,newHash){location.hash=newHash}};
const winListeners={};
const window={addEventListener(event,fn){winListeners[event]=fn}};
const context={document:{getElementById:id=>id==='data-encuesta'?root:null},window,location,history,
 console,URLSearchParams,Response,Blob,DecompressionStream,Uint8Array,atob,Number,Intl,Set,Map,Promise,
 fetch:async uri=>{
  const p=file(uri);
  return uri.endsWith('.json')?{ok:true,json:async()=>JSON.parse(p)}:{ok:true,text:async()=>p.toString('utf8')};
 }};
vm.runInNewContext(js,context,{filename:'js/caracterizacion-kobo.js'});
function click(name,value){
 const btn={dataset:{},hasAttribute(key){const prop=key.replace(/^data-/, '').replace(/-([a-z])/g, (_m,c)=>c.toUpperCase());return this.dataset[prop]!==undefined}};
 btn.dataset[name]=value;
 listeners.click({target:{closest(){return btn}}});
}
async function main(){
 for(let i=0;i<40&&!root.dataset.koboReady;i++)await new Promise(resolve=>setTimeout(resolve,20));
 assert.equal(root.dataset.koboReady,'true','KoBo rendered after fetching real source and official taxonomy');
 assert.match(element('k23-dims').innerHTML,/Dimensión Social/);
 assert.match(element('k23-areas').innerHTML,/Salud y Protección Social/);
 assert.match(element('k23-topics').innerHTML,/1\.1\.1 Aseguramiento/);
 assert.match(element('k23-topic-title').textContent,/Aseguramiento/);
 assert.match(element('k23-metric-title').textContent,/afiliad/i);
 assert.match(element('k23-findings').innerHTML,/Base válida/);
 click('k23Dim','economica');
 assert.match(element('k23-areas').innerHTML,/Hacienda Pública y Gestión Financiera/);
 assert(!element('k23-areas').innerHTML.includes('Salud y Protección Social'));
 click('k23Area','hacienda');
 assert.match(element('k23-topics').innerHTML,/2\.6\.14 Cartera municipal/);
 assert.match(element('k23-topic-title').textContent,/Ingresos municipales/);
 assert.match(element('k23-chart').innerHTML,/Sin resultados disponibles/);
 click('k23Dim','ambiental');
 assert.match(element('k23-areas').innerHTML,/Gestión del Riesgo de Desastres/);
 click('k23Area','vivienda');
 assert.match(element('k23-topics').innerHTML,/3\.2\.6 Catastro/);
 click('k23Dim','percepcion');
 assert.equal(element('k23-category-row').hidden,true);
 assert.match(element('k23-areas').innerHTML,/Confianza e imagen institucional/);
 assert.match(element('k23-areas').innerHTML,/Comunicación pública, transparencia y acceso a la información/);
 assert(!element('k23-areas').innerHTML.includes('Gobierno Territorial'));
 click('k23Area','percepcion-4.1');
 assert.match(element('k23-chart').innerHTML,/Sin resultados disponibles/);
 click('k23Area','percepcion-4.2');
 assert.match(element('k23-topic-title').textContent,/Evaluación del desempeño/);
 assert.match(element('k23-chart').innerHTML,/k23-bar-row/);
 assert.match(element('k23-insight').innerHTML,/KoBo/);
 assert.match(location.hash,/tema=percepcion-4.2/);
 click('k23Dim','social');
 assert.equal(element('k23-category-row').hidden,false);
 assert.match(element('k23-topic-title').textContent,/Aseguramiento/);
 assert(!element('k23-chart').innerHTML.includes('865.000'));
 console.log('DIMENSIONES KOBO: PASS — 4 dimensiones, 20 áreas, 86 categorías; navegación, estados sin datos, percepción, cifras KoBo verificables.');
}
main().catch(e=>{console.error(e);process.exitCode=1});
