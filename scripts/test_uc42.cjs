const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'js/ti-cumplimiento-42-core.js'),'utf8'),context);
const core=context.window.TI42Core;
function load(name){const file=JSON.parse(zlib.gunzipSync(Buffer.from(fs.readFileSync(path.join(root,'data',name),'utf8').trim(),'base64')));return {...file,records:file.rows.map(row=>Object.fromEntries(file.fields.map((key,i)=>[key,row[i]])))};}
const summary=load('uc42-summary.gz.b64.txt'),extra=load('uc42-proyectos-extra.b64.txt'),chrono=load('uc42-cronograma.gz.b64.txt'),contracts=load('uc42-contratos-core.b64.txt');
const records=summary.records.map(core.prepare);
assert.equal(records.length,30);
assert.equal(records.filter(r=>core.matches(r,{meta:'101'})).length,19);
assert.equal(records.filter(r=>core.matches(r,{meta:'57'})).length,1);
assert.equal(records.filter(r=>core.matches(r,{meta:'all',q:'ALTANIA'})).length,1);
assert.equal(records.filter(r=>core.matches(r,{q:'ZZZ-NO-EXISTE'})).length,0);
assert.equal(records.filter(r=>core.matches(r,{meta:'none'})).length,6);
assert.equal(core.status('EN EJECUCIÓN (SEGUN SECOP)'),'En ejecución (según SECOP)');
assert.equal(core.vereda('Ver base de datos mejoramiento de vivienda'),null);
const noted=records.find(r=>r.veredaRaw==='Ver base de datos mejoramiento de vivienda');
assert.ok(noted);assert.equal(noted.vereda,null);
for(const source of [extra,chrono,contracts]){
 assert.deepEqual(source.records.map(r=>r.excelRow),summary.records.map(r=>r.excelRow));
 assert.equal(source.source,summary.source);assert.equal(source.sourceSha256,summary.sourceSha256);
}
const row5=extra.records.find(r=>r.excelRow===5),cost=records.find(r=>r.excelRow===5);
assert.ok(Math.abs(row5.financialPct-cost.executedCost/cost.budget*100)<1e-8);
assert.equal(row5.financialPct.toFixed(1),'94.3');
assert.match(extra.records.find(r=>r.excelRow===4).scope,/aceptados por el Contratista con la presentación de su propuesta\.$/);
assert.ok(records.filter(r=>r.observations).length>=8);
assert.equal(chrono.records.filter(r=>r.start&&r.end&&r.end>=r.start).length,24);
assert.equal(chrono.records.find(r=>r.excelRow===30).start,'2026-05-22');
assert.match(summary.sourceNotes['30'].start,/Publicación de convocatoria/);
assert.equal(records.filter(r=>r.photoBefore||r.photoFollow||r.photoAfter).length,0);
assert.equal(records.filter(r=>r.meta==='101'&&r.executedCost>r.budget).length,4);
const point=core.coordinate('N 04°57′09.66″ O 74°10′24.97″');
assert.ok(point);assert.ok(Math.abs(point.lat-4.9526833333)<1e-8);assert.equal(point.certified,false);
assert.equal(core.coordinate('N 04°99′09″ O 74°10′24″'),null);
assert.equal(core.coordinate('PENDIENTE'),null);
console.log('UC42: shared filters, source fidelity, full text, missing data, dates, costs and coordinate parsing passed.');

