/* Regression: approved publication screenshot and preserved document workflow. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const base=path.resolve(__dirname,'..');
const read=path=>fs.readFileSync(require('node:path').join(base,path),'utf8');
const html=read('index.html'), css=read('css/publicaciones-editorial.css'), js=read('js/publicaciones-editorial.js');
new Function(js);
assert.equal((html.match(/id="data-publicaciones"/g)||[]).length,1,'One Data Publicaciones panel');
assert.equal((html.match(/id="pubApp"/g)||[]).length,1,'One standalone editorial screen');
assert.equal((html.match(/id="publicationUpload"/g)||[]).length,1,'The existing upload input is preserved exactly once');
assert.equal((html.match(/id="publicationGrid"/g)||[]).length,1,'Legacy original-file catalog remains');
assert.equal((html.match(/id="glossarySearch"/g)||[]).length,1,'Glossary remains available');
assert.ok(html.includes('data-data-destination="data-publicaciones"'),'Navigation destination unchanged');
for(const id of ['pubHero','pubTitle','pubCatalogTitle','pubVisualGrid','pubYear','pubArchiveYears','pubManageDialog','pubManageOpen','pubReaderDialog','pubEditDialog','pubMetadataForm','pubMetaList','pubHeaderSearch']){
 const attr=id==='pubHero'?'class="pub-hero"':'id="'+id+'"';
 assert.ok(html.includes(attr),'Required screen structure missing: '+id);
}
for(const t of ['Todos','Boletines','Papers','Informes','Encuestas','Series históricas','Repositorio histórico','Boletines, papers, informes y encuestas'])
 assert.ok(html.includes(t),'Missing editorial reference text: '+t);
assert.ok(html.includes('VISTA DEMOSTRATIVA')&&html.includes('DEMO EDITORIAL'),'Mock data must be identified prominently');
assert.ok(html.includes('css/publicaciones-editorial.css?v=pub25-01'),'Missing CSS cache bust');
assert.ok(html.includes('js/publicaciones-editorial.js?v=pub25-01'),'Missing script cache bust');
assert.ok(html.indexOf('js/data-workspace.js')<html.indexOf('js/publicaciones-editorial.js'),'Local file library must load before editorial overlay');
assert.ok(css.includes('grid-template-rows:minmax(290px,37.6%) minmax(394px,49.3%) minmax(106px,13.1%)'),'Screenshot exact first viewport proportions missing');
assert.ok(css.includes('grid-template-columns:minmax(0,1.276fr) minmax(0,1fr)'),'Reference two-column catalog missing');
assert.ok(css.includes(':has(#data-publicaciones:not([hidden]))'),'Design changes must remain scoped');
assert.ok(css.includes('background:#f1eee6'),'Archive should have the approved ivory background');
assert.ok(css.includes('@media(max-width:620px)'),'Responsive mobile support needed');
assert.ok(js.includes('TIData.read("publications")'),'Integration must load original document store');
assert.ok(js.includes('TIData.write(META_KEY,updated)'),'Metadata must persist locally');
assert.ok(js.includes('data-pub-year')&&js.includes('data-pub-filter'),'Year and category filters must be interactive');
assert.ok(js.includes('MutationObserver'),'Preserve original TIWorkspace upload handler');
assert.ok(!js.includes("TIData.write('publications',items)")&&!js.includes('TIData.write("publications",items)'),'Demo entries must not be saved as real publications');
assert.ok(!/heroLocalVideo|jorge-alberto-camacho/i.test(js),'No former mayor video media');
const samples=(js.match(/\{id:"demo-[^"]+"/g)||[]);
assert.equal(samples.length,9,'Nine editorial sample articles');
const years=(js.match(/\{year:20\d\d,count:\d+\}/g)||[]);
assert.equal(years.length,6,'Six archive years');
assert.deepEqual(years,[ '{year:2024,count:8}', '{year:2023,count:12}', '{year:2022,count:10}', '{year:2021,count:9}', '{year:2020,count:7}', '{year:2019,count:6}' ]);
assert.ok(js.includes('No hay un PDF original disponible'),'Do not offer fake PDF download');
console.log('PUBLICACIONES 2.5 STATIC: PASS — approved layout, nine sample records, 6-year archive, full-width scope and retained original file uploads.');
