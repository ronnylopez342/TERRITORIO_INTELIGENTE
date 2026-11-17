'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const zlib = require('node:zlib');
const root = path.resolve(__dirname, '..');
const compressed = fs.readFileSync(path.join(root, 'data/asi-cumplimos-32.gz.b64.txt'), 'utf8').trim();
assert.match(compressed,/^[A-Za-z0-9+/]+={0,2}$/);
const d = JSON.parse(zlib.gunzipSync(Buffer.from(compressed,'base64')));
assert.equal(d.s,1);
assert.equal(d.y.length,4);
assert.deepEqual(d.y,[2024,2025,2026,2027]);
assert.deepEqual([d.g.length,d.l.length,d.sct.length,d.pr.length,d.o.length],[109,6,19,29,8]);
assert.deepEqual(d.g.map(g=>g[0]),Array.from({length:109},(_,i)=>i+1));
for(const row of d.g){
 assert.equal(row.length,11);
 assert.ok(row[1]>=0&&row[1]<d.l.length,'Estrategia inválida: '+row[0]);
 assert.ok(row[2]>=0&&row[2]<d.sct.length,'Sector inválido: '+row[0]);
 assert.ok(row[3]>=0&&row[3]<d.pr.length,'Programa inválido: '+row[0]);
 assert.ok(row[4]>=0&&row[4]<d.o.length,'Responsable inválido: '+row[0]);
 assert.ok(typeof row[5]==='string'&&row[5].length>10,'Nombre de meta sin soporte: '+row[0]);
 for(const idx of [7,8,9,10])assert.equal(row[idx].length,4);
 for(let year=0;year<4;year++){
   if(row[7][year]!==null)assert.ok(Number.isFinite(row[7][year])&&row[7][year]>=0&&row[7][year]<=1.5);
   for(const idx of [8,9,10])if(row[idx][year]!==null)assert.ok(Number.isFinite(row[idx][year])&&row[idx][year]>=0);
 }
 for(const year of [2,3]){
   assert.equal(row[7][year],null,'2026/2027 no pueden tener avances físicos inventados');
   assert.equal(row[9][year],null,'2026/2027 no pueden tener presupuestos ejecutados inventados');
   assert.equal(row[10][year],null,'2026/2027 no pueden tener pagos inventados');
 }
}
const sum=(col,y)=>d.g.reduce((s,g)=>s+(g[col][y]||0),0);
assert.equal(d.g.filter(g=>Number.isFinite(g[7][0])).length,103);
assert.equal(d.g.filter(g=>Number.isFinite(g[7][1])).length,108);
assert.ok(Math.abs(sum(8,0)-13063984853.36)<2);
assert.ok(Math.abs(sum(8,1)-43147953431.1314)<2);
assert.ok(Math.abs(sum(8,2)-19612614026.607853)<2);
assert.ok(Math.abs(sum(8,3)-21742670982.904716)<2);
assert.ok(Math.abs(sum(9,1)-18363274897)<2);
assert.ok(Math.abs(sum(10,0)-11520781967.57)<2);
assert.ok(Math.abs(sum(10,1)-2224991233.86)<2);
assert.equal(d.audit.sha256,'09a2cf3a3d2f9527c88b74511a8920ef492fce493e9c8d6186202bb3efbeeac2');
assert.equal(Object.keys(d.audit.sheets).length,15);
assert.deepEqual(d.audit.summaryRows,[109,109]);
assert.deepEqual(d.audit.missingPhysical[0],[6,7,12,47,93,95]);
assert.deepEqual(d.audit.missingPhysical[1],[7]);
assert.equal(Object.keys(d.details).length,109);
for(const g of d.g){
 const m=d.details[g[0]];
 assert.ok(m.indicator&&m.unit&&m.code);
 assert.equal(m.targets.length,4);
 assert.deepEqual(m.financial.map(f=>f[0]),g[9]);
 assert.deepEqual(m.financial.map(f=>f[4]),g[10]);
 for(const i of [2,3])assert.deepEqual(m.financial[i],[null,null,null,null,null]);
}
for(const [year,expected] of [[0,[13063984853.36,11874985552.67,11874985552.67,11759485552.67,11520781967.57]],[1,[18363274897,14840016603,6998238041.64,2235061772.86,2224991233.86]]]){
 expected.forEach((n,col)=>assert.ok(Math.abs(Object.values(d.details).reduce((s,m)=>s+(m.financial[year][col]??0),0)-n)<0.02));
}
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const source=fs.readFileSync(path.join(root,'js/asi-cumplimos-32.js'),'utf8');
const landing=fs.readFileSync(path.join(root,'js/plan-desarrollo-landing.js'),'utf8');
const css=fs.readFileSync(path.join(root,'css/asi-cumplimos-32.css'),'utf8');
assert.ok(index.includes('js/asi-cumplimos-32.js')&&index.includes('css/asi-cumplimos-32.css'));
assert.ok(landing.includes('data-asi32-root'));
assert.ok(css.includes('asi32-nav'));
assert.ok(source.includes('Cuatrienio completo (2024–2027)'));
assert.ok(source.includes('2026–2027 no hay ejecución registrada'));
console.log('ASI 3.2 DATA: PASS · 109 metas, 6 líneas, 19 sectores, 29 programas, 8 entidades, pagos conciliados, sin avances ficticios 2026–2027.');
