/* Plan Estadistico: comprobaciones estructurales autocontenidas (Node.js). */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'css/plan-estadistico.css'),'utf8');
const js=fs.readFileSync(path.join(root,'js/plan-estadistico.js'),'utf8');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'data/plan-estadistico.json'),'utf8'));
new Function(js);
for(const id of ['data-plan-estadistico','peHome','peDetail','peIndicatorUpload','peFormSlot','peIndicatorsBody','peSheetsGrid','peWarnings','statDocumentGrid','statDocumentUpload','statDocumentSearch','peVideoDialog']){
 assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,'ID must be unique: '+id);
}
for(const word of ['Documentos oficiales','Indicadores del plan','Fichas técnicas','Seguimiento y reportes']){
 assert.ok(html.includes(word),'missing: '+word);
}
assert.ok(html.includes('data-data-destination="data-plan-estadistico"'));
assert.ok(html.includes('assets/interactive/data-fuentes-visor.html'));
assert.ok(html.includes('src="js/plan-estadistico.js?v=pe22-01"'));
assert.ok(html.includes('href="css/plan-estadistico.css?v=pe22-01"'));
assert.ok(css.includes('#data-plan-estadistico'));
assert.ok(Array.isArray(manifest.documents));
assert.equal(typeof manifest.videoUrl,'string');
assert.ok(!html.includes('id="peOfficialGrid"><article'),'No invented official entries');
console.log('PLAN ESTADISTICO 2.2 CHECK: OK');
