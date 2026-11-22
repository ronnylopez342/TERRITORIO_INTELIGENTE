/**
 * Restore the data present in the 32 original Instituto Excel worksheets.
 * Source: Fichas de indicadores INSTITUTO.xlsx, November 2026 attachment.
 * Original public GRA IDs and historical source metadata remain immutable.
 * 29 source sheets have numeric data or verifiable breakdowns; the other 3
 * are kept as unavailable because the source's series cells are blank.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const patch=JSON.parse(fs.readFileSync(path.join(root,'data/instituto-datos-recuperados-2026.json'),'utf8'));
const sourcePath=path.join(root,'data/fichas-2026-consolidadas.json');
const d=JSON.parse(fs.readFileSync(sourcePath,'utf8'));
const sourceFile='Fichas de indicadores INSTITUTO.xlsx';
const before=new Map(d.records.map(r=>[r.id,{code:r.meta?.code,graph:r.graphCode,alias:r.shortCode,archive:r.catalogCode,dim:r.dim}]));
const done=new Set();
const caution={
 '9':'Asistencias sumadas entre actividades culturales por año; una persona puede asistir a más de una actividad. No equivalen a personas únicas.',
 '12':'Los importes de los contratos se agregan por año a partir de los renglones del Excel. No son cantidades de artistas.',
 '13':'Los importes de los incentivos se agregan por año desde los registros originales; no representan número de personas beneficiarias.',
 '19':'Asistencias sumadas entre actividades deportivas por año; no equivalen necesariamente a personas únicas.',
 '21':'Suma anual de contratos de implementos deportivos registrados en la ficha, no ejecución presupuestal total.',
 '22':'Suma anual de los incentivos deportivos listados, no cantidad de deportistas.',
 '25':'Los objetivos futuros y valores sin fecha exacta no se incorporan a la serie histórica observada.',
 '26':'El dato numérico corresponde SOLO a asistentes a eventos en 2025 (registro parcial); NO hay un total anual verificado de visitantes del municipio.',
 '28':'Las dos cifras de camas para 2025 provienen de fuentes/criterios alternativos; no representan una evolución temporal ni deben sumarse.'
};
for(const r of d.records){
 if(r.sourceFile!==sourceFile)continue;
 const p=patch[r.sourceSheet];
 assert(p,'Falta hoja del Instituto '+r.sourceSheet);
 assert(!done.has(r.sourceSheet),'Duplicado del Instituto '+r.sourceSheet);
 done.add(r.sourceSheet);
 assert(Array.isArray(p.s)&&Array.isArray(p.c),'Falta serie o desagregación '+r.sourceSheet);
 for(const s of p.s){
   assert(typeof s.name==='string' && s.name.trim(),'Serie sin nombre');
   assert(Array.isArray(s.points)&&s.points.length>0,'Serie vacía');
   for(const [y,v] of s.points){
     assert(Number.isInteger(y)&&y>=1990&&y<=2040,'Año inválido');
     assert(typeof v==='number'&&Number.isFinite(v),'Valor numérico inválido');
   }
 }
 r.series=p.s; r.categories=p.c;
 r.available=p.a;
 r.dataCells=r.series.reduce((a,s)=>a+s.points.length,0)+r.categories.reduce((a,c)=>a+c.values.length,0);
 if(caution[r.sourceSheet])r.sourceCaveat=caution[r.sourceSheet];
 if(['11','12','13','21','22'].includes(r.sourceSheet)){
   r.meta.originalUnitInExcel=r.meta.unit||'No consignada';
   r.meta.unit='Pesos colombianos (COP)';
   r.sourceUnitCorrection='El encabezado de la tabla fuente contiene importes en COP; se conserva la unidad consignada en Excel en originalUnitInExcel.';
 }
 r.sourceRecovery={workbook:sourceFile,sheet:r.sourceSheet,method:'lectura directa de hoja original, sin imputación de datos faltantes',version:'2026-11-21'};
}
assert.equal(done.size,32,'No se reconocieron las 32 fichas del Instituto');
assert.equal([...done].filter(k=>patch[k].a).length,29,'Disponibles del Instituto');
const have=d.records.filter(r=>r.available).length;
assert.equal(have,319,'Total final de fichas con datos');
d.audit.available=have;d.audit.empty=d.records.length-have;
d.audit.recovery={sourceFile,worksheets:32,restored:29,withoutNumericValues:['10','20','23'],sourceIntegrity:'based on original workbook; no fake values'};
fs.writeFileSync(sourcePath,JSON.stringify(d));
for(const r of d.records){
 const old=before.get(r.id);assert(old);
 assert.equal(r.meta.code,old.code);
 assert.equal(r.dim,old.dim);
}
console.log('INSTITUTO_RESTORED',JSON.stringify({
 worksheets:done.size,restored:29,records:d.records.length,available:have,
 newSeries:d.records.filter(r=>r.sourceFile===sourceFile).reduce((n,r)=>n+r.series.length,0),
 newPoints:d.records.filter(r=>r.sourceFile===sourceFile).reduce((n,r)=>n+r.series.reduce((a,s)=>a+s.points.length,0),0),
 newCategoricalValues:d.records.filter(r=>r.sourceFile===sourceFile).reduce((n,r)=>n+r.categories.reduce((a,c)=>a+c.values.length,0),0)
}));
