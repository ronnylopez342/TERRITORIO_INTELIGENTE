'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {applyCodes,scope,CODE}=require('./asignar_codigos_data_subachoque.cjs');
const root=path.resolve(__dirname,'..');
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const src=read('data/fichas-2026-consolidadas.json');
const rows=read('data/fichas-2026-validadas.json').records;
const registry=read('data/codigos-data-subachoque.json');
const originals=new Map(src.records.map(r=>[r.id,r]));
assert.equal(rows.length,341);assert.equal(rows.filter(r=>r.available).length,319);
assert.equal(Object.keys(registry.assignments).length,341);
assert.equal(new Set(rows.map(r=>r.catalogCode)).size,341);
assert.equal(new Set(rows.map(r=>r.id)).size,341);
assert.equal(rows.filter(r=>r.catalogCodeStatus==='clasificado').length,331);
assert.equal(rows.filter(r=>r.catalogCodeStatus==='pendiente_clasificacion').length,5);
assert.equal(rows.filter(r=>r.catalogCodeStatus==='reclasificado_desde_emision').length,5);
for(const r of rows){
 assert(CODE.test(r.catalogCode),'Invalid code '+r.name);
 assert.equal(r.catalogCode,registry.assignments[r.id]?.code,'Code differs from frozen registry');
 const prefix=r.catalogCode.slice(6,-4);
 if(r.catalogCodeStatus!=='reclasificado_desde_emision') assert.equal(prefix,scope(r),'Code reflects original classification');
 else assert.notEqual(prefix,scope(r),'Archived code retained after corrected classification');
 const source=originals.get(r.id);assert(source,'Source fiche missing');
 assert.equal(r.meta.code,source.meta.code,'Original imported code must remain unchanged');
 assert.deepEqual(r.series,source.series,'Numeric series were mutated');
 assert.deepEqual(r.categories,source.categories,'Categorical series were mutated');
 assert.equal(r.catalogCodeScheme,'TI-DS-v1');
}
assert.equal(rows.reduce((n,r)=>n+r.series.length,0),517);
assert.equal(rows.reduce((n,r)=>n+r.series.reduce((s,x)=>s+x.points.length,0),0),1430);
assert.equal(rows.reduce((n,r)=>n+r.categories.reduce((s,x)=>s+x.values.length,0),0),152);
// Re-ordering a workbook or rerunning the classifier must never change codes.
const random=[...rows].reverse();
const clone=JSON.parse(JSON.stringify({records:random,audit:{}}));
const reg=JSON.parse(JSON.stringify(registry));
applyCodes(clone,reg);
assert.deepEqual(new Map(clone.records.map(r=>[r.id,r.catalogCode])),new Map(rows.map(r=>[r.id,r.catalogCode])));
const added={...JSON.parse(JSON.stringify(rows.find(r=>r.available&&r.topicCode))),id:'test-new-record-'+Date.now(),name:'Indicador nuevo de prueba',catalogCode:null};
const oldSet=new Set(rows.map(r=>r.catalogCode));
const group=scope(added);
const more=JSON.parse(JSON.stringify({records:[added,...rows],audit:{}}));
applyCodes(more,reg);
assert.equal(more.records.length,342);
assert(CODE.test(more.records[0].catalogCode));assert(!oldSet.has(more.records[0].catalogCode));
for(const r of more.records.slice(1))assert(oldSet.has(r.catalogCode));
assert.equal(more.records[0].catalogCode.slice(6,-4),group);
// Changing thematic classification does not silently replace a previously
// issued identifier; instead the record is flagged for explicit migration.
const moved=JSON.parse(JSON.stringify({records:[rows.find(x=>x.available&&x.topicCode)],audit:{}}));
moved.records[0].dim='economica';moved.records[0].areaCode='2.6';moved.records[0].topicCode='2.6.4';
const originalCode=moved.records[0].catalogCode;
applyCodes(moved,reg);
assert.equal(moved.records[0].catalogCode,originalCode);
assert.equal(moved.records[0].catalogCodeStatus,'reclasificado_desde_emision');
console.log('CODES_341_PASS',{unique:341,valid:341,classified:331,provisional:5,unchangedExcelCodes:true,series:517,temporalValues:1430,categoricalValues:152,stableAfterResort:true,newCodeUnique:true,reclassificationTraceable:true});
