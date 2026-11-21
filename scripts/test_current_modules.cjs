/* Auditoria de datos reales y modulos activos 2.1-2.4.
   Los ensayos de pantallas retiradas se conservan como pruebas historicas,
   pero no son pruebas de la interfaz actual. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const zlib=require('node:zlib');
const base=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(base,p),'utf8');
const json=p=>JSON.parse(read(p));
const html=read('index.html');
const active=['data-conoce','data-subachoque','data-encuesta','data-explorando'];
for(const id of active){
  assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,'Panel activo ausente/duplicado: '+id);
}
assert.equal((html.match(/data-module-panel="data-[^"]+"/g)||[]).length,4,'Navegacion Data: cuatro paneles');
const scripts=['data-conoce','data-subachoque-fichas','data-subachoque-pdf','caracterizacion-kobo','explorando-territorio','subachoque-map'];
for(const part of scripts){
 const file='js/'+part+'.js';
 assert.ok(html.includes('src="'+file),'Script no cargado: '+file);
 new Function(read(file));
}
const sub=json('data/data-subachoque-dimensiones.json');
assert.equal(sub.municipio,'Subachoque');
assert.equal(sub.dimensiones.length,4,'Dimensiones incompletas');
assert.equal(sub.dimensiones.reduce((s,d)=>s+d.areas.length,0),21,'Areas incompletas');
const subTopics=sub.dimensiones.flatMap(d=>d.areas.flatMap(a=>a.topics));
assert.equal(subTopics.length,105,'Subtemas incompletos');
assert.ok(Array.isArray(sub.indicadores),'Catalogo de indicadores inexistente');
const raw=read('data/caracterizacion-kobo-2026-agregados.gz.b64').trim();
const survey=JSON.parse(zlib.gunzipSync(Buffer.from(raw,'base64')).toString('utf8'));
assert.equal(survey.v,2,'Esquema de agregados KoBo');
assert.equal(survey.nEncuestas,324,'Numero de encuestas de la fuente');
assert.equal(survey.dimensiones.length,4);
assert.equal(survey.dimensiones.flatMap(d=>d.areas.flatMap(a=>a.temas)).length,48);
const dane=json('data/dane-subachoque-cnpv.json');
assert.equal(dane.daneCode,'25769');
assert.equal(dane.census.length,2);
for(const row of dane.census)assert.equal(row.total,row.urban+row.rural,'Poblacion DANE sin conciliar');
const geo=json('data/cartografia-subachoque/veredas-subachoque.geojson');
assert.equal(geo.features.length,17,'Cartografia de veredas incompleta');
const chapters=json('assets/interactive/data-fuentes-capitulos.json');
assert.equal(Object.keys(chapters).length,12,'Visor historico: capitulos perdidos');
for(let i=1;i<=12;i++)assert.ok(chapters[String(i).padStart(2,'0')],'Capitulo historico ausente: '+i);
assert.ok(html.includes('id="cn-plan-territorial"'),'Plan Estadistico no integrado en 2.1');
assert.ok(html.includes('id="k23-app"'),'Caracterizacion agregada no integrada en 2.3');
assert.ok(html.includes('id="ex-map"'),'Mapa 2.4 no integrado');
console.log('DATA ACTUAL 2.1-2.4: 4 vistas, 105 subtemas, 324 encuestas agregadas, 17 veredas, 12 capitulos fuente y DANE coherentes.');
