/* Reconstrucción segura del control M2 sobre la estructura vigente.
   Solo verifica localizadores; no aplica atributos ni cambia el DOM. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=path.resolve(__dirname,'..');
const registry=JSON.parse(fs.readFileSync(path.join(base,'editor/registry.json'),'utf8'));
const html=fs.readFileSync(path.join(base,'index.html'),'utf8');
const generated=fs.readFileSync(path.join(base,'js/ti-modules-34.js'),'utf8');
assert.equal(registry.schema,2);
assert.ok(Array.isArray(registry.entries)&&registry.entries.length>=15);
const keys=new Set(),selectors=new Set();
for(const item of registry.entries){
 assert.ok(/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(item.tiId),'ID editorial invalido: '+item.tiId);
 assert.ok(!keys.has(item.tiId),'ID editorial duplicado: '+item.tiId);keys.add(item.tiId);
 assert.ok(!selectors.has(item.selector),'Selector duplicado: '+item.selector);selectors.add(item.selector);
 assert.ok(['protected','editable','advanced'].includes(item.mode),'Modo invalido: '+item.tiId);
 assert.ok(/^#[a-zA-Z][\w-]*$/.test(item.selector),'Selector inseguro o demasiado amplio: '+item.selector);
 const id=item.selector.slice(1);
 if(item.location==='static'){
   assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,
     'Localizador HTML no unico: '+item.tiId);
 } else if(item.location==='generated') {
   assert.ok(generated.includes("pane('cumplimiento','"+id+"'"),
     'La vista dinamica ya no se monta: '+item.tiId);
 } else assert.fail('Ubicacion desconocida: '+item.tiId);
}
console.log('EDITOR M2: PASS — '+registry.entries.length+' localizadores actuales, sin colisiones ni IDs obsoletos.');
