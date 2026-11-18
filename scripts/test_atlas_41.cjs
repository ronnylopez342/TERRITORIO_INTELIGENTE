'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const atlas=JSON.parse(fs.readFileSync('data/subachoque-atlas-41.json','utf8'));
assert.equal(atlas.v,1);
assert.equal(atlas.q.length,41);
assert.equal(new Set(atlas.q.map(q=>q[0])).size,41);
assert(!atlas.q.some(q=>q[0]==='G36'));
const dims=atlas.q.reduce((x,q)=>(x[q[2]]=(x[q[2]]||0)+1,x),{});
assert.deepEqual(dims,{ambiental:13,social:13,percepcion:10,economica:5});
const env={window:{}};
vm.runInNewContext(fs.readFileSync('js/atlas-vistas.js','utf8'),env);
const renderer=env.window.TIAtlasVistas;
assert.equal(renderer.LABELS.length,6);
let count=0,multi=0;
for(const q of atlas.q){
 assert.equal(q.length,11,q[0]);
 assert(q[10].length>0);
 assert(q[10].every(s=>s[1].length>0));
 if(q[10].length>1)multi++;
 for(let i=0;i<6;i++){
   const html=renderer.render(q,i,0);
   assert.match(html,/<svg\b/);
   assert.match(html,/fill="#FFFFFF"/);
   assert.match(html,/role="img"/);
   assert(html.includes(q[0]));
   assert(!html.includes('NaN')&&!html.includes('undefined'));
   count++;
 }
 for(let j=1;j<q[10].length;j++){
   const html=renderer.render(q,3,j);
   assert.match(html,/<svg\b/);
 }
}
assert.equal(count,246);
assert.equal(multi,2,'G27 and G32 must preserve both series');
const g13=atlas.q.find(q=>q[0]==='G13');
assert.equal(g13[6],965);
assert.equal(g13[7],6);
assert.equal(g13[10][0][1][0][1],905);
const g42=atlas.q.find(q=>q[0]==='G42');
assert.equal(g42[4],59);
assert.equal(g42[7],4);
assert.equal(g42[2],'ambiental');
assert.equal(g42[3],'3.2');
assert(fs.readFileSync('index.html','utf8').includes('atlas-vistas.js'));
const css=fs.readFileSync('css/atlas-vistas.css','utf8');
assert.match(css,/background:#FFFFFF!important/);
console.log('ATLAS 41 PASS: 41 indicators, 246 variants, 4 dimensions, 2 multisets, original vs estimated recorded.');
