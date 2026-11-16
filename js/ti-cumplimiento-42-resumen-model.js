/* Cálculos exclusivos del Resumen: ausencia de dato nunca equivale a cero. */
(function(global){
 'use strict';
 const sum=values=>values.reduce((a,b)=>a+b,0);
 const validPct=v=>Number.isFinite(v)&&v>=0&&v<=100;
 function metrics(rows){
  const physical=rows.filter(r=>validPct(r.physicalPercent));
  const management=rows.filter(r=>validPct(r.managementPercent));
  const pairs=rows.filter(r=>Number.isFinite(r.budget)&&r.budget>0&&Number.isFinite(r.executedCost)&&r.executedCost>=0);
  const base=sum(pairs.map(r=>r.budget)),spent=sum(pairs.map(r=>r.executedCost));
  return {physical,management,pairs,base,spent,phys:physical.length?sum(physical.map(r=>r.physicalPercent))/physical.length:null,
   managementMean:management.length?sum(management.map(r=>r.managementPercent))/management.length:null,
   rate:base>0?spent/base*100:null,excess:pairs.filter(r=>r.executedCost>r.budget),
   budgets:rows.filter(r=>Number.isFinite(r.budget)),executions:rows.filter(r=>Number.isFinite(r.executedCost)),
   contracts:rows.filter(r=>r.contract),locations:[...new Set(rows.map(r=>r.vereda).filter(Boolean))],
   distribution:[physical.filter(r=>r.physicalPercent===100).length,physical.filter(r=>r.physicalPercent>0&&r.physicalPercent<100).length,physical.filter(r=>r.physicalPercent===0).length,rows.length-physical.length],
   invalidPhysical:rows.filter(r=>Number.isFinite(r.physicalPercent)&&!validPct(r.physicalPercent)).length};
 }
 function interval(r){
  const iso=v=>/^\d{4}-\d\d-\d\d$/.test(v||'')&&Number.isFinite(Date.parse(v+'T00:00:00Z'));
  return iso(r.start)&&iso(r.end)&&r.end>=r.start;
 }
 // Prefijar fórmulas en CSV para que textos de origen no se ejecuten al abrirlos.
 function csvCell(value){const v=String(value??'');return '"'+(/^[\s]*[=+@-]/.test(v)?"'":'')+v.replace(/"/g,'""')+'"';}
 global.TI42ResumenModel=Object.freeze({metrics,interval,validPct,csvCell});
})(window);
