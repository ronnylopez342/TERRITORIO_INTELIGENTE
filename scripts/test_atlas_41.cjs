'use strict';
/* The Atlas must be read from its source JPGs. No chart-generation fallback. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const atlas=JSON.parse(fs.readFileSync('data/subachoque-atlas-41.json','utf8'));
const manifest=JSON.parse(fs.readFileSync('data/atlas-original-manifest.json','utf8'));
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
assert.equal(atlas.v,1);
assert.equal(atlas.q.length,41);
assert.equal(Object.keys(manifest.questions).length,41);
assert(!atlas.q.some(q=>q[0]==='G36'));
const counts=atlas.q.reduce((m,q)=>(m[q[2]]=(m[q[2]]||0)+1,m),{});
assert.deepEqual(counts,{ambiental:13,social:13,percepcion:10,economica:5});
let original=0,series=0;
for(const q of atlas.q){
 assert.equal(q.length,11);
 assert(q[10].length>=1);
 series+=q[10].length;
 const v=manifest.questions[q[0]];
 assert(v&&v.views.length===6);
 for(let i=0;i<6;i++){
  const f=v.views[i];
  assert.match(f,/^assets\/atlas-original\/G\d\d\/G\d\d_\d\d_[a-z0-9_]+\.jpg$/);
  assert(fs.existsSync(f),f);
  assert.equal(sha(fs.readFileSync(f)),v.sha256[i],f);
  original++;
 }
 assert(fs.existsSync(v.panel));
 assert.equal(sha(fs.readFileSync(v.panel)),v.panelSha256);
}
const g13=atlas.q.find(q=>q[0]==='G13');
assert.equal(g13[6],965);assert.equal(g13[7],6);
assert.equal(g13[10][0][1][0][1],905);
assert.equal(atlas.q.filter(q=>q[10].length>1).length,2);
const js=fs.readFileSync('js/caracterizacion-kobo.js','utf8');
const html=fs.readFileSync('index.html','utf8');
assert(!js.includes('TIAtlasVistas.render'),'No runtime chart generator');
assert(!js.includes('kobo-static-sprites'),'No generated Kobo PNGs');
assert(!html.includes('js/atlas-vistas.js'),'No SVG module loaded');
assert(!html.includes('css/atlas-vistas.css'),'No deprecated generator CSS loaded');
assert.equal(original,246);
console.log('ATLAS ORIGINAL JPG PASS: 41 indicators, 246 JPGs, 41 panels, hashes verified; no runtime chart generation.');
