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
const archive=JSON.parse(zlib.gunzipSync(Buffer.from(fs.readFileSync(path.join(root,'data/asi-cumplimos-32-fuentes.gz.b64.txt'),'utf8').trim(),'base64')));
const archiveBytes=zlib.gunzipSync(Buffer.from(fs.readFileSync(path.join(root,'data/asi-cumplimos-32-fuentes.gz.b64.txt'),'utf8').trim(),'base64'));
assert.equal(require('node:crypto').createHash('sha256').update(archiveBytes).digest('hex'),'0766209a097af6bb808205fb723d98b16a1de19ecbeba2062c57e9ccfe9cdd8e','Integridad del archivo completo conciliado contra el Excel');
assert.equal(archive.sheets.reduce((n,s)=>n+s.rows.reduce((m,r)=>m+Object.keys(r.cells).length,0),0),60948);
assert.equal(archive.schema,1);
assert.equal(archive.sha256,d.audit.sha256);
assert.equal(archive.sheets.length,15);
assert.deepEqual(archive.sheets.map(s=>s.rows.length),[5,111,112,584,501,0,0,111,0,19,65,13,13,17,102]);
const cell=(sheet,row,col)=>archive.sheets[sheet].rows.find(r=>r.row===row)?.cells[col];
assert.equal(cell(1,3,'BP'),625560655,'POAI mantiene su presupuesto distinto');
assert.equal(cell(2,3,'AV'),0,'No sustituir Plan Indicativo por POAI');
assert.equal(cell(9,20,'E'),47990333464,'Total Gestión se conserva sin sumarlo a sus registros');
assert.ok(cell(10,68,'A').includes('especialistas'),'No truncar las filas inferiores de Hoja6');
assert.equal(archive.sheets[11].rows.filter(r=>r.row>1).length,12);
assert.equal(archive.sheets[7].rows.filter(r=>r.row>2&&['D','N','X','AH'].some(c=>r.cells[c]!=null&&String(r.cells[c]).trim()!=='')).length,0,'No inventar contratos por tener metas o importes');
for(const g of d.g){
 const m=d.details[g[0]];
 const original=archive.sheets[2].rows.find(r=>r.goal===g[0]).cells;
 assert.deepEqual(m.ods,{name:original.S??null,description:original.T??null,target:original.U??null},'ODS coincide con lo diligenciado; no completar blancos por inferencia');
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
assert.ok(!source.includes('reported[i]/4'),'No acumular promedios con pesos inventados');
assert.ok(!source.includes("['territorio', 'Territorio']"),'Mapa y pestaña territorial excluidos');
const evidence=JSON.parse(fs.readFileSync(path.join(root,'data/asi-cumplimos-32-evidencias.json'),'utf8'));
assert.equal(evidence.matrixSha256,d.audit.sha256);
assert.equal(evidence.records.length,5);
assert.deepEqual(evidence.sourceRequirements.map(x=>x.id),['acumulado','estados','facturacion','reconocimiento','fotografias']);
assert.equal(evidence.publications.length,1);
assert.equal(evidence.publications[0].publishedAt,'2025-08-28');
assert.equal(evidence.publications[0].goal,null,'No inferir correspondencia de noticia con meta');
assert.equal(new URL(evidence.publications[0].sourceUrl).hostname,'subachoque.101tramites.com');
assert.equal(evidence.citizenChannel.url,'https://subachoque.101tramites.com/Paginas/canales-de-atencion.aspx');
for(const r of evidence.records){
 assert.ok(d.g.some(g=>g[0]===r.goal),'La evidencia debe corresponder a una meta real');
 assert.equal(r.year,2025);
 assert.ok(r.documentDate||r.documentMonth,'Conservar la precisión de la fecha disponible');
 assert.equal(r.certifiedOverallAchievement,false);
 assert.equal(r.photograph,null,'No atribuir una foto sin evidencia');
 assert.match(r.sourceUrl,/^https:\/\/drive\.google\.com\/file\/d\//);
 assert.ok(r.sourceSections&&r.matrixReference&&r.summary);
}
assert.equal(evidence.records[0].activity,'3.1');
assert.equal(evidence.records[1].activity,'3.2');
assert.match(evidence.records[1].summary,/20 funcionarios/);
assert.equal(evidence.records[0].documentDate,'2025-04-30');
assert.equal(evidence.records[1].documentDate,'2025-04-30');
assert.equal(evidence.records[2].documentDate,null,'No usar la fecha del formato como fecha de actividad');
assert.equal(evidence.records[2].documentMonth,'2025-11');
assert.equal(evidence.records[3].documentDate,'2025-11-21');
assert.match(evidence.records[3].summary,/no acredita la entrega/);
assert.match(evidence.records[4].summary,/20 de junio de 2024/);
assert.ok(Object.values(d.details).filter(m=>m.accumulation==='Acumulativo').length===35);
assert.ok(Object.values(d.details).filter(m=>m.accumulation==='No acumulativo').length===74);
console.log('ASI 3.2 DATA: PASS · 109 metas, 6 líneas, 19 sectores, 29 programas, 8 entidades, pagos conciliados, sin avances ficticios 2026–2027.');
