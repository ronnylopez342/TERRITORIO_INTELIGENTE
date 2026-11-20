/* Integrity: all Kobo metrics have saved raster PNGs, source hash is exact. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const zlib=require('node:zlib');
const payload=fs.readFileSync('data/caracterizacion-kobo-2026-agregados.gz.b64');
const manifest=JSON.parse(fs.readFileSync('data/kobo-static-sprites.json','utf8'));
const original=JSON.parse(zlib.gunzipSync(Buffer.from(payload.toString().trim(),'base64')));
const metrics=original.dimensiones.flatMap(d=>d.areas.flatMap(a=>a.temas.flatMap(t=>t.metrics)));
assert.equal(metrics.length,49);
assert.equal(Object.keys(manifest.sprites).length,49);
assert.equal(manifest.views.length,6);
assert.equal(manifest.sourceSha256,crypto.createHash('sha256').update(payload).digest('hex'));
for(const m of metrics){
 const p=manifest.sprites[m.id];
 assert(p,'Missing PNG for '+m.id);
 assert.equal(p.path,'assets/kobo-static/'+m.id+'.png');
 const bytes=fs.readFileSync(p.path);
 assert.equal(bytes.toString('hex',0,8),'89504e470d0a1a0a','PNG signature '+m.id);
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),p.sha256);
 const visible=m.a.filter(row=>Number(row[1])>=5&&Number(row[2])>=0).length;
 assert.equal(p.categories,visible);
}
console.log('KOBO STATIC PASS: 49 unique PNG sprites, 294 views, source + SHA256 matched.');
