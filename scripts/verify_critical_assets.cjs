/* Protección de recursos originales críticos sin modificar sus bytes.
   La huella es el SHA1 de objeto Git (blob LEN\0content), no el hash de descarga. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'docs/INTEGRIDAD_FUENTES_CRITICAS.json'),'utf8'));
assert.equal(manifest.schema,1,'Esquema de huellas incompatible');
assert.ok(Array.isArray(manifest.resources)&&manifest.resources.length>=9,'Fuentes críticas incompletas');
const seen=new Set();
let verified=0;
for(const row of manifest.resources){
  assert.ok(typeof row.path==='string'&&/^(?:assets|data)\//.test(row.path)&&!row.path.includes('..'),'Ruta de fuente inválida');
  assert.ok(!seen.has(row.path),'Fuente duplicada: '+row.path);seen.add(row.path);
  assert.match(row.blobSha,/^[0-9a-f]{40}$/);
  const absolute=path.join(root,row.path),buffer=fs.readFileSync(absolute);
  assert.equal(buffer.length,row.bytes,'El tamaño de '+row.path+' cambió sin actualizar el expediente.');
  const hash=crypto.createHash('sha1').update('blob '+buffer.length+'\0').update(buffer).digest('hex');
  assert.equal(hash,row.blobSha,'El contenido original de '+row.path+' cambió sin revisión de fuente.');
  verified++;
}
console.log('INTEGRIDAD FUENTES: PASS; '+verified+' recursos originales sin alteraciones silenciosas.');
