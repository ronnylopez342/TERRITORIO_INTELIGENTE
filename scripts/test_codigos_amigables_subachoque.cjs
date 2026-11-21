'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {assign}=require('./asignar_codigos_amigables_subachoque.cjs');
const root=path.resolve(__dirname,'..');
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const rows=read('data/fichas-2026-validadas.json').records;
const original=read('data/fichas-2026-consolidadas.json').records;
const registry=read('data/codigos-amigables-subachoque.json');
const lookup=new Map(original.map(r=>[r.id,r]));
const map=new Map(rows.map(r=>[r.id,r]));
assert.equal(rows.length,341);
assert.equal(Object.keys(registry.assignments).length,341);
assert.equal(rows.filter(r=>r.available).length,290);
assert.equal(new Set(rows.map(r=>r.shortCode)).size,341);
assert.equal(new Set(rows.map(r=>r.catalogCode)).size,341);
const pattern=/^[A-Z0-9]{2,12}(?:-[A-Z0-9]{1,8}){0,2}$/;
for(const r of rows){
 assert(pattern.test(r.shortCode),'Bad short code '+r.name+' / '+r.shortCode);
 assert(r.shortCode.length<=11,'Too long to recall '+r.shortCode);
 assert.equal(r.shortCode,registry.assignments[r.id]?.shortCode,'Short registry mismatch '+r.id);
 assert.equal(r.catalogCode,registry.assignments[r.id]?.fullCode,'Immutable archive key '+r.id);
 const old=lookup.get(r.id);
 assert(old,'Missing source ID '+r.id);
 assert.equal(r.meta.code,old.meta.code,'Source codes were altered '+r.name);
 assert.deepEqual(r.series,old.series,'Numeric content modified '+r.name);
 assert.deepEqual(r.categories,old.categories,'Categorical content modified '+r.name);
}
for(const [id,expected] of Object.entries({
 '3b6696367fed':'IDI','eb6f3130c0f2':'POL05','d06a78d8dcbc':'POL19',
 '14262d490cda':'PREDIAL','c15056b95733':'SAL-MENT','ab6b9409a865':'AGUA-PTAP',
 '5efa1300b1ee':'IRCA','70e0195dcc84':'MATRICULA','f638706658df':'REC-TRIB'
}))assert.equal(map.get(id)?.shortCode,expected,'Semantic code mismatch '+id);
assert.equal(rows.reduce((n,r)=>n+r.series.length,0),435);
assert.equal(rows.reduce((n,r)=>n+r.series.reduce((t,s)=>t+s.points.length,0),0),1212);
assert.equal(rows.reduce((n,r)=>n+r.categories.reduce((t,c)=>t+c.values.length,0),0),98);
const shuffled=JSON.parse(JSON.stringify({records:[...rows].reverse(),audit:{}}));
const reg=JSON.parse(JSON.stringify(registry));
assign(shuffled,reg);
assert.deepEqual(new Map(shuffled.records.map(r=>[r.id,r.shortCode])),new Map(rows.map(r=>[r.id,r.shortCode])));
const clone=JSON.parse(JSON.stringify(rows.find(r=>r.shortCode==='SAL-MENT')));
clone.id='artificial_new_indicator_for_test';delete clone.shortCode;
const fresh=JSON.parse(JSON.stringify({records:[clone,...rows],audit:{}}));
assign(fresh,reg);
assert.equal(fresh.records.length,342);
assert.equal(new Set(fresh.records.map(r=>r.shortCode)).size,342);
for(const r of fresh.records.slice(1))assert.equal(r.shortCode,map.get(r.id).shortCode);
console.log('SHORT_CODES_PASS',JSON.stringify({unique:341,active:290,maxLength:Math.max(...rows.map(r=>r.shortCode.length)),avgLength:(rows.reduce((n,r)=>n+r.shortCode.length,0)/rows.length).toFixed(1),series:435,categoricalValues:98,originalCodesPreserved:true,stableAfterReimport:true,collisionHandled:true}));
