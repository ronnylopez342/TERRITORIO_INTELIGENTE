/* Plan Estadistico 2025-2029: verificar la vista actual en 2.1, no el modulo 2.2 retirado. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const pdf=path.join(root,'assets/docs/plan-estadistico-territorial-original.pdf');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'data/plan-estadistico.json'),'utf8'));
for(const id of ['cn-plan-territorial','cn-pet-title','cn-pet-document-status',
  'cn-pet-download','cn-pet-dialog','cn-pet-viewer']){
  assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,'ID del Plan duplicado o ausente: '+id);
}
assert.ok(html.includes('PLAN ESTADÍSTICO<br>TERRITORIAL 2025–2029'),
  'El titulo y vigencia del Plan en Conoce Data no coinciden');
assert.ok(html.includes('data-cn-open-document'),'No se encuentra la apertura del documento');
for(const topic of ['proposito','alcance','marco','definiciones']){
  assert.ok(html.includes('data-cn-plan-topic="'+topic+'"'),'Falta tema del Plan: '+topic);
}
assert.ok(html.includes('assets/docs/plan-estadistico-territorial-original.pdf'),'Enlace PDF ausente');
assert.ok(fs.existsSync(pdf)&&fs.statSync(pdf).size>1000,'PDF base ausente o vacio');
assert.ok(Array.isArray(manifest.documents),'Catalogo de documentos invalido');
assert.equal(typeof manifest.videoUrl,'string');
assert.ok(!html.includes('id="peHome"')&&!html.includes('id="data-plan-estadistico"'),
  'Se reintrodujo el modulo 2.2 heredado y duplicado');
console.log('PLAN ESTADISTICO ACTUAL (2.1): documento y secciones editoriales verificados.');
