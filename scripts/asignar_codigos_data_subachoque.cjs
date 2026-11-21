/**
 * Sistema de identificación INTERNO TI-DS v1.
 * 
 * TI-DS-DD.AA.CC-NNN
 * DD  = dimensión actual (01 Social, 02 Económica, 03 Ambiental, 04 Institucional)
 * AA  = área (01..99), CC = categoría (01..99), NNN = consecutivo permanente
 * 00  = área o categoría sin clasificación confirmada (no se inventa clasificación).
 *
 * Cada asignación queda congelada por el ID original, separada del código del
 * Excel. En una reclasificación se conserva el código original y se informa de
 * la divergencia; una migración explícita puede crear un alias, nunca se recicla.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const dataPath=path.join(root,'data','fichas-2026-validadas.json');
const registryPath=path.join(root,'data','codigos-data-subachoque.json');
const DIM={social:'01',economica:'02',ambiental:'03',institucional:'04'};
const CODE=/^TI-DS-(0[1-4])\.(\d{2})\.(\d{2})-(\d{3})$/;
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
function scope(r){
  const dd=DIM[r.dim];assert(dd,'Dimensión inexistente '+r.name);
  const part=String(r.areaCode||'').match(/^([1-4])\.(\d{1,2})$/);
  const topic=String(r.topicCode||'').match(/^([1-4])\.(\d{1,2})\.(\d{1,2})$/);
  if(part)assert.equal(String(+part[1]).padStart(2,'0'),dd,'Área fuera de dimensión '+r.name);
  if(topic){assert(part,'Categoría sin área '+r.name);assert.equal(topic[1]+'.'+(+topic[2]),part[1]+'.'+(+part[2]),'Categoría fuera del área '+r.name);}
  const aa=part?String(+part[2]).padStart(2,'0'):'00';
  const cc=topic?String(+topic[3]).padStart(2,'0'):'00';
  assert(/^\d{2}$/.test(aa)&&/^\d{2}$/.test(cc));
  return dd+'.'+aa+'.'+cc;
}
function applyCodes(catalog,registry){
  assert(Array.isArray(catalog.records)&&catalog.records.length>0);
  assert.equal(registry.scheme,'TI-DS-v1','Registro incompatible');
  const codes=registry.assignments||{};
  const all=new Set(),taken=new Set();
  for(const [id,e] of Object.entries(codes)){
    assert(e&&CODE.test(e.code),'Código inválido en registro '+id);
    assert(!taken.has(e.code),'Código duplicado '+e.code);taken.add(e.code);
  }
  const sorted=[...catalog.records].sort((a,b)=>
    scope(a).localeCompare(scope(b))||
    normalize(a.name).localeCompare(normalize(b.name),'es')||
    a.id.localeCompare(b.id));
  for(const r of sorted){
    assert(typeof r.id==='string'&&r.id,'Ficha sin ID');
    assert(!all.has(r.id),'ID repetido '+r.id);all.add(r.id);
    const hierarchy=scope(r);
    let entry=codes[r.id];
    if(!entry){
      const prefix='TI-DS-'+hierarchy+'-';
      const used=Object.values(codes).filter(e=>e.code.startsWith(prefix)).map(e=>Number(e.code.slice(-3)));
      const n=Math.max(0,...used)+1;
      assert(n<=999,'Consecutivo agotado '+hierarchy);
      const code=prefix+String(n).padStart(3,'0');
      assert(!taken.has(code),'Código repetido '+code);taken.add(code);
      entry=codes[r.id]={code,id:r.id,issuedScope:hierarchy,issuedName:r.name};
    }
    const scopeFromCode=entry.code.slice(6,-4);
    assert.equal(entry.issuedScope,scopeFromCode,'Ámbito no coincide con código '+r.id);
    assert(CODE.test(entry.code),'Formato de código inválido '+r.id);
    r.catalogCode=entry.code;
    r.catalogCodeStatus=scopeFromCode===hierarchy?
      (hierarchy.includes('.00')?'pendiente_clasificacion':'clasificado'):'reclasificado_desde_emision';
    r.catalogCodeScheme='TI-DS-v1';
  }
  const curr=new Set(catalog.records.map(r=>r.catalogCode));assert.equal(curr.size,catalog.records.length,'Códigos no únicos');
  registry.assignments=codes;
  registry.version=1;
  registry.count=Object.keys(codes).length;
  const statuses=catalog.records.reduce((a,r)=>(a[r.catalogCodeStatus]=(a[r.catalogCodeStatus]||0)+1,a),{});
  registry.summary={records:catalog.records.length,active:catalog.records.filter(r=>r.available).length,...statuses};
  catalog.audit={...catalog.audit,catalogCodeScheme:registry.scheme,catalogCodesVerified:catalog.records.length};
  return{registry,catalog,statuses};
}
function sync(){
  const data=JSON.parse(fs.readFileSync(dataPath,'utf8'));
  const registry=fs.existsSync(registryPath)?
    JSON.parse(fs.readFileSync(registryPath,'utf8')):{version:1,scheme:'TI-DS-v1',assignments:{}};
  const {statuses}=applyCodes(data,registry);
  fs.writeFileSync(dataPath,JSON.stringify(data));
  fs.writeFileSync(registryPath,JSON.stringify(registry,null,2)+'\n');
  console.log('CODIGOS_SUBACHOQUE_OK',JSON.stringify({count:data.records.length,unique:new Set(data.records.map(r=>r.catalogCode)).size,statuses,registry:registry.count}));
}
if(require.main===module)sync();
module.exports={applyCodes,scope,CODE,DIM,sync};
