'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const zlib=require('node:zlib');
const root=path.resolve(__dirname,'..');
const load=n=>JSON.parse(fs.readFileSync(path.join(root,n),'utf8'));
const audit=load('data/plan-accion-2026-3t-soportes-enlaces.json');
const metadata=load('data/plan-accion-2026-3t-drive-audit.json');
const plan=JSON.parse(zlib.gunzipSync(Buffer.from(
  fs.readFileSync(path.join(root,'data/plan-accion-2026-3t.gz.b64.txt'),'utf8').trim(),'base64')).toString('utf8'));
assert.equal(audit.schema,'ti-plan-3t-support-links-v1');
assert.equal(audit.sourceSha256,plan.sourceFileSha256);
assert.equal(audit.year,2026);
assert.equal(audit.cutoff,'2026-09-30');
assert.equal(plan.period.metas.length,109);
assert.equal(audit.stats.totalActivities,379);
assert.equal(audit.stats.activitiesWithLink,222);
assert.equal(audit.stats.activitiesWithoutLink,157);
assert.equal(audit.stats.linkReferences,227);
assert.equal(audit.stats.uniqueIds,160);
assert.equal(audit.stats.cellHyperlinks,218);
assert.equal(metadata.summary.total,160);
assert.equal(metadata.summary.accessible,150);
assert.equal(metadata.summary.inaccessible,10);
assert.equal(metadata.summary.anyone,141);
let count=0,withLink=0,referenceCount=0,missing=0;
const ids=new Set();
for(const m of plan.period.metas){
  const manifest=audit.metas[String(m.id)];
  assert.ok(manifest,'No se encontraron actividades de meta '+m.id);
  for(const a of m.activities){
    count++;
    const x=manifest[String(a.n)];
    assert.ok(x,'Sin inventario de actividad '+a.n);
    assert.equal(x.meta,m.id);
    assert.ok(Number.isInteger(x.row)&&x.row>=3);
    assert.ok(typeof x.supportExpected==='string');
    if(x.refs.length)withLink++;else missing++;
    referenceCount+=x.refs.length;
    for(const ref of x.refs){
      assert.ok(ref.url.startsWith('https://'),'Enlace inseguro');
      assert.ok(/^[A-Za-z0-9_-]{15,}$/.test(ref.id),'ID externo no válido');
      assert.ok(['file','folder'].includes(ref.kind),'Tipo no identificado');
      assert.equal(ref.column,'AC');
      ids.add(ref.id);
      assert.ok(metadata.items[ref.id],'Falta metadato de auditoría: '+ref.id);
    }
  }
}
assert.equal(count,379);
assert.equal(withLink,222);
assert.equal(missing,157);
assert.equal(referenceCount,227);
assert.equal(ids.size,160);
const withMetas=Object.values(audit.metas).filter(v=>Object.values(v).some(a=>a.refs.length)).length;
assert.equal(withMetas,75);
for(const x of Object.values(metadata.items)){
  assert.ok(['accessible','unavailable'].includes(x.status));
  if(x.visibility!=='anyone')assert.equal(x.name,null,'No publicar nombres privados o no verificados');
}
assert.equal(audit.metas['11']['11.1'].refs.length,2);
assert.equal(audit.metas['16']['16.2'].refs[0].via,'hyperlink');
assert.equal(audit.metas['101']['101.1'].refs.length,1);
assert.equal(audit.metas['109']['109.1'].refs.length,0);
console.log('AUDITORIA DOCUMENTAL 3T: PASS | 379 actividades, 222 con enlaces, 157 sin enlaces, 227 referencias, 160 IDs, 150 metadatos accesibles, 10 sin acceso.');
