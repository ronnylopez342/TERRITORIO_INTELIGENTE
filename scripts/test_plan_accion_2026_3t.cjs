'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const zlib=require('node:zlib');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const encoded=fs.readFileSync(path.join(root,'data/plan-accion-2026-3t.gz.b64.txt'),'utf8').trim();
assert.match(encoded,/^[a-zA-Z0-9+/]+={0,2}$/);
const d=JSON.parse(zlib.gunzipSync(Buffer.from(encoded,'base64')).toString('utf8'));
assert.equal(d.schema,'ti-plan-accion-2026-trimestre-v1');
assert.equal(d.year,2026);assert.equal(d.quarter,3);assert.equal(d.cutoff,'2026-09-30');assert.equal(d.monthsReported,9);
assert.equal(d.period.metas.length,109);
assert.deepEqual(d.period.metas.map(x=>x.id),Array.from({length:109},(_,i)=>i+1));
assert.equal(d.period.metas.reduce((s,m)=>s+m.activities.length,0),379);
assert.equal(Object.keys(d.info.metas).length,109);
assert.ok(d.excelHeaderWarning.includes('2025'),'Discrepancia de encabezados del archivo fuente no documentada');
assert.ok(d.budgetPctMethod.includes('RP / saldo'));
const issues=d.quality.issues;
assert.equal(d.quality.issueCounts.physical_month_sum_mismatch,49);
assert.equal(issues.filter(x=>x.type==='numeric_text_month').length,1);
assert.equal(issues.filter(x=>x.type==='missing_physical_inputs').length,2);
assert.equal(issues.filter(x=>x.type==='physical_goal_formula_mismatch').length,1);
assert.equal(Object.values(d.observations).reduce((n,arr)=>n+arr.length,0),89);
let physical=0,financial=0,monthlyErrors=0;
const sum=Array(6).fill(0);
for(const m of d.period.metas){
 assert.equal(typeof m.name,'string');assert.ok(m.name.length>10);
 assert.ok(typeof m.agency==='string'&&m.agency.length>3);
 assert.equal(m.budget.length,6);
 for(let i=0;i<6;i++)if(Number.isFinite(m.budget[i]))sum[i]+=m.budget[i];
 if(Number.isFinite(m.pct))physical++;
 if(Number.isFinite(m.budgetPct))financial++;
 if(m.budget[0]>0&&Number.isFinite(m.budget[2])&&Number.isFinite(m.budgetPct))
   assert.ok(Math.abs(m.budget[2]/m.budget[0]-m.budgetPct)<1e-7,'RP/saldo inconsistente meta '+m.id);
 for(const a of m.activities){
   assert.equal(a.months.length,12);
   assert.deepEqual(a.months.slice(9),[null,null,null],'Octubre-diciembre deben quedar sin reporte');
   assert.equal(a.reportedQuarter,3);
   if(!a.reconcilesWithMonthly)monthlyErrors++;
 }
}
assert.equal(physical,109);
assert.equal(financial,100);
assert.equal(monthlyErrors,49);
const expected=[36773137993.15,32494080882.14,22270574421.38,15098401070.85,14098537045.85,4279057111.01];
for(let i=0;i<6;i++)assert.ok(Math.abs(sum[i]-expected[i])<2,'Etapa presupuestal '+i+' no coincide con la fuente');
const sample=d.period.metas.find(x=>x.id===101);
assert.ok(Math.abs(sample.pct-.77812)<1e-9);
assert.ok(Math.abs(sample.budget[2]-2966034726.08)<.01);
assert.ok(Math.abs(sample.budgetPct-.9868325493499404)<1e-7);
assert.equal(sample.activities.length,7);
assert.ok(/^[a-f0-9]{64}$/.test(d.sourceFileSha256));
console.log('PLAN DE ACCION 2026 3T: PASS. 109 metas; 379 actividades; 89 observaciones; 9 meses; '+monthlyErrors+' diferencias mensuales conservadas; RP/saldo verificado.');
