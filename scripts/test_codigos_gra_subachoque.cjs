'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {assignGraphCodes,DIM,FORMAT,SCHEME}=require('./asignar_codigos_gra_subachoque.cjs');
const root=path.resolve(__dirname,'..');
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const rows=read('data/fichas-2026-validadas.json').records;
const original=read('data/fichas-2026-consolidadas.json').records;
const reg=read('data/codigos-gra-subachoque.json');
const originalMap=new Map(original.map(r=>[r.id,r]));
assert.equal(rows.length,341);assert.equal(rows.filter(r=>r.available).length,319);
assert.equal(reg.scheme,SCHEME);
assert.equal(Object.keys(reg.assignments).length,341);
const unique=new Set(rows.map(r=>r.graphCode));assert.equal(unique.size,341);
const counts={};for(const r of rows){
 assert(FORMAT.test(r.graphCode),'Invalid graph code '+r.id);
 assert.equal(r.graphCode.split('-')[1],DIM[r.dim],'Wrong graph dimension '+r.id);
 assert.equal(r.graphCode,reg.assignments[r.id].code,'Registry mismatch '+r.id);
 assert.equal(reg.assignments[r.id].archivedCode,r.catalogCode,'Archived ID mismatch');
 assert.equal(r.graphCodeStatus,'vigente');
 const o=originalMap.get(r.id);assert(o);
 assert.equal(r.meta.code,o.meta.code,'Source code changed');
 assert.deepEqual(r.series,o.series,'Numeric source changed');
 assert.deepEqual(r.categories,o.categories,'Category values changed');
 (counts[r.dim]??=[]).push(Number(r.graphCode.slice(-3)));
}
assert.deepEqual(Object.fromEntries(Object.entries(counts).map(([k,v])=>[k,v.length])),
 {social:174,ambiental:82,economica:57,institucional:28});
for(const [dim,seq] of Object.entries(counts)){
 const numbers=seq.sort((a,b)=>a-b);
 assert.deepEqual(numbers,Array.from({length:numbers.length},(_,i)=>i+1),'Gap or duplicate '+dim);
}
for(const r of rows)assert(new Set((r.series||[]).map(_=>r.graphCode)).size<=1);
assert.equal(rows.reduce((n,r)=>n+r.series.length,0),517);
assert.equal(rows.reduce((n,r)=>n+r.series.reduce((a,s)=>a+s.points.length,0),0),1430);
const shuffled={records:JSON.parse(JSON.stringify(rows)).reverse(),audit:{}};
const persistent=JSON.parse(JSON.stringify(reg));
assignGraphCodes(shuffled,persistent);
assert.deepEqual(new Map(shuffled.records.map(r=>[r.id,r.graphCode])),new Map(rows.map(r=>[r.id,r.graphCode])));
const sample=JSON.parse(JSON.stringify(rows.find(r=>r.dim==='social')));
const max=Math.max(...counts.social);
sample.id='test-new-gra-record';delete sample.graphCode;
const expanded={records:[sample,...JSON.parse(JSON.stringify(rows))],audit:{}};
assignGraphCodes(expanded,persistent);
assert.equal(expanded.records[0].graphCode,'GRA-SO-'+String(max+1).padStart(3,'0'));
for(const r of expanded.records.slice(1))assert(unique.has(r.graphCode));
const moved={records:[JSON.parse(JSON.stringify(rows.find(r=>r.dim==='social')))],audit:{}};
moved.records[0].dim='economica';const code=moved.records[0].graphCode;
assignGraphCodes(moved,persistent);
assert.equal(moved.records[0].graphCode,code,'Renumbering on reclassification');
assert.equal(moved.records[0].graphCodeStatus,'requiere_migracion');
console.log('GRA_ALL_CODES_PASS',JSON.stringify({total:341,published:319,unique:true,dimensions:Object.fromEntries(Object.entries(counts).map(([k,v])=>[k,v.length])),series:517,unchangedData:true,persistent:true,legacyPreserved:true}));
