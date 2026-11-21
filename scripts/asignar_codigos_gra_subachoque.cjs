/**
 * Codigo publico uniforme para cada ficha/grafica de Data Subachoque.
 * GRA-XX-NNN:
 *   GRA = grafica/indicador; XX = SO/EC/AM/IN; NNN = consecutivo permanente.
 * Una misma ficha conserva el codigo entre series, representaciones y vigencias.
 * El codigo NO codifica un ano de corte, porque eso volveria obsoleta la referencia.
 *
 * El mapa ID -> GRA es inmutable: ni ordenar Excel ni renombrar la ficha lo
 * modifica. Las claves anteriores (TI-DS y alias cortos) permanecen guardadas
 * para permitir consultas historicas, no aparecen como codigo principal.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..');
const DATA=path.join(ROOT,'data/fichas-2026-validadas.json');
const REGISTRY=path.join(ROOT,'data/codigos-gra-subachoque.json');
const DIM={social:'SO',economica:'EC',ambiental:'AM',institucional:'IN'};
const FORMAT=/^GRA-(SO|EC|AM|IN)-(\d{3})$/;
const SCHEME='GRA-DIM-NNN-v1';

function assignGraphCodes(data,registry){
 assert(Array.isArray(data.records),'Catalogo de fichas invalido');
 assert.equal(registry.scheme,SCHEME,'Version del registro GRA incompatible');
 const entries=registry.assignments||{};
 const seenCodes=new Set();
 for(const [id,e] of Object.entries(entries)){
   assert(e&&FORMAT.test(e.code),'Codigo GRA invalido '+id);
   assert(!seenCodes.has(e.code),'Codigo GRA duplicado: '+e.code);
   seenCodes.add(e.code);
 }
 const rows=[...data.records];
 const keys=new Set();
 for(const r of rows){
   assert(r.id&&!keys.has(r.id),'ID original ausente o repetido '+r.id);
   keys.add(r.id);
   assert(DIM[r.dim],'Dimension no contemplada: '+r.dim);
   assert(r.catalogCode&&r.shortCode,'Falta trazabilidad historica '+r.id);
 }
 // Initial assignment sorts by existing archived identifiers, which are
 // deterministic even when a source changes its display name.
 rows.sort((a,b)=>a.catalogCode.localeCompare(b.catalogCode,'es')||a.id.localeCompare(b.id));
 for(const r of rows){
   const expectedPrefix=DIM[r.dim];
   let e=entries[r.id];
   if(!e){
     const taken=Object.values(entries).filter(x=>x.code.startsWith('GRA-'+expectedPrefix+'-'));
     const n=Math.max(0,...taken.map(x=>Number(x.code.slice(-3))))+1;
     assert(n<=999,'Capacidad de codigos excedida para la dimension '+expectedPrefix);
     const code='GRA-'+expectedPrefix+'-'+String(n).padStart(3,'0');
     assert(!seenCodes.has(code),'Colision GRA '+code);
     e={code,sourceId:r.id,dimensionAtIssue:r.dim,archivedCode:r.catalogCode,oldAlias:r.shortCode};
     entries[r.id]=e;seenCodes.add(code);
   }
   assert.equal(e.archivedCode,r.catalogCode,'Cambio no autorizado al codigo tecnico original '+r.id);
   assert(FORMAT.test(e.code),'Codigo con formato incorrecto '+r.id);
   r.graphCode=e.code;
   r.graphCodeScheme=SCHEME;
   // No reasignar automaticamente el codigo al reclasificar: marcar la
   // divergencia para migracion explicita con alias y sin referencias rotas.
   r.graphCodeStatus=e.dimensionAtIssue===r.dim?'vigente':'requiere_migracion';
 }
 assert.equal(new Set(data.records.map(r=>r.graphCode)).size,data.records.length,'Colision de codigos publicos');
 registry.assignments=entries;
 registry.version=1;
 registry.dimensions=DIM;
 registry.count=Object.keys(entries).length;
 registry.summary={
   records:data.records.length,
   published:data.records.filter(r=>r.available).length,
   countsByDimension:Object.fromEntries(Object.keys(DIM).map(dim=>[
     dim,data.records.filter(r=>r.dim===dim).length])),
   migrationPending:data.records.filter(r=>r.graphCodeStatus!=='vigente').length
 };
 data.audit={...data.audit,graphCodeScheme:SCHEME,graphCodesVerified:data.records.length};
 return{data,registry};
}

function sync(){
 const data=JSON.parse(fs.readFileSync(DATA,'utf8'));
 const registry=fs.existsSync(REGISTRY)?
   JSON.parse(fs.readFileSync(REGISTRY,'utf8')):
   {version:1,scheme:SCHEME,dimensions:DIM,assignments:{}};
 assignGraphCodes(data,registry);
 fs.writeFileSync(DATA,JSON.stringify(data));
 fs.writeFileSync(REGISTRY,JSON.stringify(registry,null,2)+'\n');
 console.log('GRA_CODES_PASS',JSON.stringify(registry.summary));
}
if(require.main===module)sync();
module.exports={assignGraphCodes,DIM,FORMAT,SCHEME,sync};
