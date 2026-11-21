/**
 * TI — Codigos amigables para funcionarios.
 * Ej: IDI, POL05, PREDIAL, SAL-MENT, AGUA-PTAP.
 * Son alias legibles de catalogCode, que se preserva como identificador
 * persistente y verificable. La clave Excel meta.code no se modifica.
 *
 * El registro por ID nunca cambia alias existentes al reimportar datos.
 * No usar hashes ni numeraciones para una ficha si puede usar una palabra corta.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const dataPath=path.join(root,'data/fichas-2026-validadas.json');
const regPath=path.join(root,'data/codigos-amigables-subachoque.json');
const normal=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const words=s=>normal(s).split(' ').filter(Boolean);
const banned=new Set('DE DEL LA LAS LOS EL Y O U AL EN POR PARA CON SEGUN DESDE HASTA QUE SE SOBRE MEDIANTE A UNA UN COMO LAS AL MUNICIPIO MUNICIPAL SUBACHOQUE DEL TERRITORIO TERRITORIAL TOTAL TOTALES ANUAL ANUALES REALIZADAS REALIZADOS REGISTRADAS REGISTRADOS NUMERO VALOR VALORES PERSONAS PERSONA DEL LOS UNA POR SUS AQUELLOS CANTIDAD EL DE LUGAR'.split(' '));
const skip=new Set('EN ACTIVOS ACTIVO ACTIVA ACTIVAS BENEFICIARIOS BENEFICIADAS BENEFICIADOS DEL NOMBRE NUEVOS NUEVAS NUEVO NUEVA'.split(' '));
const stemMap={
 'POLITICA':'POL','AFILIACION':'AFIL','AFILIADOS':'AFIL','AFILIADAS':'AFIL','AFILIADO':'AFIL',
 'REGIMEN':'REG','CONTRIBUTIVO':'CONT','CONTRIBUTIVA':'CONT','SUBSIDIADA':'SUBS','SUBSIDIADO':'SUBS',
 'COMPENSAR':'COMP','FAMISANAR':'FAMI','PARTICIPACION':'PART','CONCENTRACION':'CONC',
 'CONTRATACION':'CONTR','CONTRATOS':'CONTR','EJECUCION':'EJEC','PORCENTAJE':'PCT',
 'COBERTURA':'COB','INVERSION':'INV','INVERSIONES':'INV','PRESUPUESTO':'PRES','PRESUPUESTAL':'PRES',
 'SALUD':'SAL','MENTAL':'MENT','PUBLICA':'PUB','PUBLICO':'PUB','ESCUELAS':'ESC','FORMACION':'FORM',
 'EDUCACION':'EDU','ARTISTICA':'ART','CULTURAL':'CULT','CULTURA':'CULT','DEPORTIVA':'DEP',
 'DEPORTIVAS':'DEP','DEPORTE':'DEP','ATENCIONES':'ATEN','ATENDIDOS':'ATEN','ATENDIDAS':'ATEN',
 'ATENDIDA':'ATEN','ATENCION':'ATEN','BRIGADAS':'BRIG','BRIGADA':'BRIG','VACUNACION':'VAC',
 'MEDICINA':'MED','GENERAL':'GRAL','ENFERMERIA':'ENF','SERVICIOS':'SERV','SERVICIO':'SERV',
 'TASAS':'TASA','FECUNDIDAD':'FEC','POBLACION':'POB','RURAL':'RUR','URBANA':'URB','URBANO':'URB',
 'VIVIENDAS':'VIV','VIVIENDA':'VIV','INFRAESTRUCTURA':'INFRA','RECAUDO':'REC','TRIBUTARIO':'TRIB',
 'TRIBUTARIA':'TRIB','PREDIAL':'PREDIAL','INDUSTRIA':'IND','COMERCIO':'COM','TRANSFERENCIAS':'TRANS',
 'REGALIAS':'REGALIAS','TESORERIA':'TESORERIA','DEUDA':'DEUDA','CARTERA':'CARTERA',
 'HIDRICAS':'AGUA','HIDRICOS':'AGUA','AGUA':'AGUA','RIESGO':'RIESGO','AMBIENTAL':'AMB',
 'AMBIENTE':'AMB','MANTENIMIENTO':'MANT','MANTENIMIENTOS':'MANT','TERCIARIAS':'VIAL',
 'TURISMO':'TUR','TURISTICOS':'TUR','TURISTICAS':'TUR','TURISTICO':'TUR',
 'AGROPECUARIOS':'AGRO','AGROPECUARIAS':'AGRO','AGRICOLAS':'AGRO','AGRICOLA':'AGRO',
 'ARTESANOS':'ARTES','ARTESANALES':'ARTES','PRODUCTORES':'PROD','PRODUCCION':'PROD',
 'CUMPLIMIENTO':'CUMP','CAMBIO':'CAMB','VARIACION':'VAR','DEFUNCIONES':'DEFUNC',
 'MORTALIDAD':'MORT','MORBILIDAD':'MORB','PERSONAL':'PERS','EMPLEO':'EMPLEO',
 'EFICIENCIA':'EFIC','GESTION':'GEST','ACTIVIDADES':'ACT','FINANCIACION':'FIN',
 'VISITAS':'VIS','NUMERO':'NUM','PROMOCION':'PROM','PREVENCION':'PREV',
 'INTEGRANTES':'INTEGR','CONEXION':'CONEX','INTERNET':'NET','BENEFICIARIOS':'BENEF',
 'ESTUDIANTES':'ESTUD','DOCENTES':'DOC','SOCIAL':'SOC','PROTECCION':'PROT',
 'CAPACITACION':'CAP','FORMULADO':'FORM','FORMULADA':'FORM','RECURSOS':'REC',
 'ACTAS':'ACT','EMERGENCIAS':'EMERG','DESASTRES':'DESAST','RECOLECCION':'RECOL',
 'COMITE':'COMITE','COLEGIOS':'COLEG','ALUMBRADO':'LUM','LUMINARIAS':'LUM',
 'REGISTRADOS':'REG','REGISTRADAS':'REG','MUNICIPAL':'MUN',
 'MENSUAL':'MES','MENSUALES':'MES','ESPECIFICA':'ESP','MUJERES':'MUJ','MUJER':'MUJ',
 'NINAS':'NIN','NINOS':'NIN','JORNADAS':'JORN','JORNADA':'JORN','AUDITORIAS':'AUD',
 'HALLAZGOS':'HALL','DISPENSACION':'DISP','PERSISTENCIA':'PERSIST','REFERENCIA':'REF',
 'CONTRARREFERENCIA':'CONTRREF','PRADERA':'PRAD','SEMESTRAL':'SEM','EFECTIVAS':'EFEC',
 'EFECTIVOS':'EFEC','CONSULTAS':'CONS','PROGRAMA':'PROG','PROGRAMAS':'PROG',
 'FAMILIAS':'FAM','FAMILIA':'FAM','CAPACIDAD':'CAP','ANIMALES':'ANIM',
 'ANIMAL':'ANIM','HUERTAS':'HUERT','HUERTA':'HUERT','CRITERIOS':'CRIT',
 'CLASIFICACION':'CLAS','DEMOSTRATIVAS':'DEM','CENTRALES':'CENT',
 'ABASTO':'ABASTO','ACUEDUCTOS':'ACUED','ACUEDUCTO':'ACUED',
 'PARTICIPACIONES':'PART','AREA':'AREA','AREAS':'AREAS','ARBOLES':'ARB',
 'HECTAREAS':'HECT','ESTUDIOS':'ESTUD','ESTUDIO':'ESTUD','TECNICOS':'TEC',
 'CONVENIO':'CONV','SUSCRIPTORES':'SUSCR','REALIZADAS':'REAL',
 'ASISTENCIA':'ASIST','ASISTENCIAS':'ASIST','CAPACITADOS':'CAP',
 'DESEMPENO':'DES','FORMACION':'FORM','EDUCATIVOS':'EDU','REUNIONES':'REUN',
 'REGISTRADA':'REG','COLECTIVAS':'COLECT','VINCULADOS':'VINC',
 'MIGRANTES':'MIGRA','EMPRENDEDORES':'EMPREN','ACTORES':'ACT',
 'ORGANIZACIONES':'ORG','ORGANIZACION':'ORG','HOGARES':'HOG',
 'COMPORTAMIENTO':'TEND','PROPORCION':'PROP','INTERVENCIONES':'INTERV',
 'SISTEMAS':'SIST','SISTEMA':'SIST','INFORMACION':'INFO',
 'DESARROLLO':'DES','TRANSPORTE':'TRANS','RECIBIDOS':'RECIB',
 'PATRIMONIALES':'PATR','PATRIMONIO':'PATR','CONSTRUCCION':'CONST'

};
const fixedById={
 '3b6696367fed':'IDI',
 'c15056b95733':'SAL-MENT',
 '14262d490cda':'PREDIAL',
 'f638706658df':'REC-TRIB',
 '2b9ce4a075d2':'REC-NOTR',
 'e86769219baa':'ICA',
 'ed19995f0bac':'INGRESOS',
 'bf64515c1294':'DEUDA',
 'bfbc7346f690':'CARTERA',
 'db239d7b7ee8':'GASOLINA',
 '0c01e2f03e7e':'REGALIAS',
 '25151226f08f':'TESORERIA',
 '16ae27d57072':'PRES-ING',
 '3d85ed11d33e':'INV-PUB',
 '3bf8b39d9fb0':'TRANSFER',
 '8dde4fbc56c7':'SISBEN',
 'e69231e683cf':'CONTR-GOB',
 'e48851583333':'EFIC-CONTR',
 '17ec702e89e1':'POB-TOTAL',
 '214437970999':'POB-RURAL',
 '252dcad49835':'POB-URB',
 'ca60a88b247e':'RURAL-PCT',
 '86c9d66c3373':'URB-PCT',
 '5c1de640ebcd':'INFRA-CULT',
 '51069be26fa3':'INFRA-DEP',
 '15be6d98510b':'POL-ACC',
 'e5271272ff59':'TRAC-AG',
 '75eff6d02c24':'TRAC-SERV',
 '1e705065dd2b':'TRAC-REC',
 'c749cebcd1ef':'AGRO-INS',
 'ab2b20de7207':'BIB-SABER',
 'ae031ffee5b5':'AFIL-POB',
 '30c5184a3bf6':'AFIL-SUBS',
 '0138859b9ac8':'BRE-SUBS',
 '92292b0838cd':'COMP-CAMB',
 '97ed225eac14':'FAMI-CAMB',
 'c4a30f7b5f8d':'COMP-CONC',
 '7b86f672e8c9':'FAMI-CONC',
 '8073a4b78e65':'NEPS-CONC',
 '356fdd15a02c':'UPC-REST',
 'bbb8c96f7f82':'AFIL-EXC',
 '0465062130bb':'PART-SUBS',
 'a66eaab3e883':'POB-AFIL',
 'b94638da7a62':'VAR-CONT',
 'd0e41b79b8bd':'VAR-SUBS',
 '0fa3d531969b':'VAR-EXC',
 '1f7797065f4f':'VAC-BRIG',
 'ad461de14311':'VAC-PRAD',
 '0c21e13260af':'FEC-10-19',
 'eabbc9e65ff0':'FEC-15-19',
 'ee19058a824d':'FEC-10-14',
 '1b968d5e0c60':'ENF-BRIG',
 '541d3935b461':'ORAL-BRIG',
 '579edd47d49c':'MED-BRIG',
 '373d2ac1aecb':'MED-PRAD',
 '0644c342b968':'AUD-FAMI',
 'd1249ad5b802':'CITAS-EFEC',
 '40792a1bc217':'CITAS-SAC',
 '678e7e629c75':'CONS-FEB',
 '3dd95656ab6b':'REF-NEPS',
 '815b4dd23bb1':'SAC-ESPEC',
 'c4d159d18b06':'REF-STOT',
 '8f3e6b40cba2':'ACCE-COMP',
 '476b82a0c720':'SAC-PART',
 'd854895eb2bc':'DISP-COMP',
 '262a6eca0dce':'DISP-FAMI',
 'ed4f265b67f7':'DISP-STOT',
 'c7f0478c4829':'DISP-GAUDI',
 '2d184c5aef57':'BRIG-SERV',
 '6cad284e780d':'BRIG-SALUD',
 '9464826f2602':'MAMO-JORN',
 '26e5a4d8281b':'VIV-SANCAR',
 '70565529cfeb':'CULT-POB',
 '7a7a370af45e':'CULT-RUR',
 'b40452e7e976':'CULT-DISC',
 '7b442ace1541':'CULT-TOTAL',
 'e4225fe4f97e':'CULT-ESC',
 '96c80fe92275':'DEP-POB',
 'acfe4e61493a':'DEP-RUR',
 '7000f622947e':'DEP-DISC',
 'b4b4cf043505':'DEP-TOTAL',
 '5bfbaba3e1e3':'DEP-ESC',
 '5277c4ad584c':'FEC-TASA',
 '55d32255bb99':'DEFUNC',
 '64a1f561e21c':'MIGRANTES',
 'dea19b1749d1':'POB-EDAD',
 '84ff855bbad1':'AGRO-ESC',
 'c98b1f23ae1e':'SAN-ANIM',
 'e5271272ff59':'TRAC-CUMP',
 'fad9e7af2b34':'ABASTO-TON',
 '2e8a4bce4dfb':'ABASTO-GRU',
 '813ffd88d300':'MGA-COSTO',
 'a72e50a9b842':'MGA-PROPIOS',
 'f930d60fea1d':'MGA-EDU',
 'aecffda750cd':'ANIM-JORN',
 '708108c16fcd':'ANIM-RUR',
 '2d5ae576b219':'PSA-APORT',
 'a6d2cc8657f4':'RIES-INV',
 '35117db82088':'ARB-REFO',
 '40b61513f9ab':'ECO-AREA',
 '0156dc4a041f':'CAUD-VER',
 '1d9c83946329':'PSA-HECT',
 '8cbd609f7ed2':'ANIM-SENS',
 '2ade5f2604ce':'EDU-AMB',
 '16afb310d3fc':'HUELLA-CO2',
 'dd47cd6a96c5':'VIV-RURAL',
 'acaf04b7cb53':'PTAP-CAP',
 '42ec7c0a253e':'PTAP-DISTR',
 '9a7a4136d31e':'PTAP-ZON',
 '33061d8a21e7':'PTAP-TOTAL',
 'f105446a40e0':'VIAS-ZONA',
 '7f7b2291ef23':'VIAS-MANT',
 '4201eedb6d69':'VIAS-PRES',
 'b8812ce01e68':'RIES-AREA',
 '9b0dd8e42c5f':'RIES-OBRA',
 'bde6c2688e11':'RIES-ESTUD',
 'eea59f142b00':'RIES-GAL',
 '541218380de9':'RIES-PRAD',
 '0a15e4ed5703':'RIES-SILES',
 '295a6df5542f':'RIES-PRES',
 '670d9635fa1d':'RIES-CAP',
 '509022e7d99b':'RIES-ADULT',
 'e838dd04371c':'RIES-MUJ',
 '13e46ab2092c':'RIES-TANQ',
 '3788f99c9d39':'RIES-EDUC',
 'ad5c25b99e56':'RIES-EDU',
 '77066a3c64cb':'NET-EDU',
 'ddeeca8f1ae4':'SIST-ALCAL',
 '14fc1bdce1eb':'CTSSS',
 'bdb001bf952e':'COPACO',
 'cd8b64bbd73b':'FIN-SGP',
 '3778d9e62a23':'MUERT-EXT',
 'aa741788ddf2':'CUID-FORM',
 'cd6eae694b52':'MAY-EDAD',
 '824e0b9d9da6':'ESC-PERM',
 '69d66d92b5d7':'MAT-RURAL',
 '70e0195dcc84':'MATRICULA',
 '06405ca821d7':'INGLES',
 '0621ff0d5434':'PAE',
 '32ee2eb32467':'TRANS-ESC',
 'c517cc8bff4c':'SEDES-DOT',
 'f5d790906a02':'POBREZA',
 'db3f692f8165':'VIOL-INTRA',
 'b0fd8a59e1e6':'DER-VERIF',
 '7dc9589b1730':'VIOL-DENUNC',
 '1c2330d75dea':'INC-ART',
 '620476f75f55':'INC-DEP',
 'ce8854c38605':'CONCILIA',
 '19f06e9aea3d':'POL-ACT',
 'ba35715f1621':'TRAM-POL',
 'c973b7db9245':'COMPAREN',
 '83ca949b4748':'MAQ-HORAS',
 '2fb985d453d0':'ABASTO-PROD',
 'c12faa758f76':'HUERT-INS',
 'a16e2c517491':'HUERT-VER',
 'a48836e69717':'MICE-ESP',
 '4eea3f8d97eb':'TUR-GASTRO',
 '2f907199af63':'VIS-TUR',
 '6320b6dab01d':'TUR-NAT',
 '9be033470d73':'EMPLEO',
 'f338959de5b1':'FAMI-BRE',
 '805f34a32b31':'AVISOS',
 '1a48c7bb7597':'UPC-ADRES',
 '7380efb95772':'UPC-DEP',
 '448a93d25700':'IVC-PRES',
 '1a6a3bc55c3c':'RES-COSTO',
 'f520f9c39735':'LUM-CABLE',
 '9eb818ffd3ef':'AGUA-USU',
 'a7a8f29d1a1c':'ACU-USU',
 'a8ca361426cd':'ALCAN-USU',
 '77def22bf180':'ENER-USU',
 '54ac4a24c2a0':'ACU-RIES',
 '03d9ba8c9521':'ALCAN-RED',
 'd33502752be0':'RES-SOL',
 '505d17a77a3c':'ACU-COM',
 '5efa1300b1ee':'IRCA',
 'e8712cba7a5d':'PTAR-ZONA',
 '01834c4bf7aa':'PTAR-TOTAL',
 '31e681db2d98':'SUB-USU',
 '123cb44d225e':'DOC-ALUM'
};
const canonicalCode=r=>{
 const n=normal(r.name);
 const p=n.match(/\bPOL\s*0*(\d{1,2})\b/);
 if(/^POLITICA\b/.test(n)&&p)return 'POL'+String(Number(p[1])).padStart(2,'0');
 if(fixedById[r.id])return fixedById[r.id];
 // Los planes EOT son identificables por su sector, no como 'PCT-EJEC'.
 if(/PROGRAMAS? DEL EOT/.test(n)){
   const areas=[[/EDUCACION/,'EDU'],[/EQUIPAMIENTO/,'EQUIP'],[/PATRIMONIO|CULTURAL/,'CULT'],[/SALUD/,'SAL'],[/SERVICIOS PUBLICOS/,'SERV'],[/TURISMO/,'TUR'],[/VIAS|TRANSPORTE/,'VIAS'],[/VIVIENDA/,'VIV'],[/MEDIO AMBIENTE|RECURSOS NATURALES/,'AMB'],[/SISTEMAS PRODUCTIVOS/,'PROD']];
   const area=areas.find(a=>a[0].test(n));
   if(area)return 'EOT-'+area[1];
 }
 // Fichas de formación cultural y deportiva: evita códigos como COB-CADA.
 if(/^COBERTURA/.test(n)&&/ESCUELAS? DE FORMACION/.test(n)){
   const sector=r.topicCode?.startsWith('1.5.')?'DEP':'CULT';
   if(/DISCAPACIDAD/.test(n))return sector+'-DISC';
   if(/GRUPO POBLACIONAL/.test(n))return sector+'-POB';
   if(/SECTOR|RURAL|URBANO/.test(n))return sector+'-RUR';
   if(/TOTAL/.test(n))return sector+'-TOTAL';
 }
 // Contenido de tablas de caracterización que no menciona claramente
 // en su primer par de palabras el sujeto real.
 if(/FECUNDIDAD ESPECIFICA/.test(n)){
   const age=n.match(/(10|15) A (14|19) ANOS/);
   if(age)return 'FEC-'+age[1]+'-'+age[2];
 }
 if(/PAGOS POR SERVICIOS AMBIENTALES/.test(n))return 'PSA-PAGOS';

 if(/\bFUENTES?\s+HIDRICAS\b.*\bPTAP\b/.test(n))return 'AGUA-PTAP';
 if(/\bCONSEJO\s+TERRITORIAL\s+DE\s+SEGURIDAD\s+SOCIAL\b/.test(n))return 'CTSSS';
 const source=words(r.name);
 const semantic=source.filter((t,i)=>(!banned.has(t)&&!skip.has(t)&&!/^\d{4}$/.test(t)&&!/^20\d\d$/.test(t)));
 if(!semantic.length)return 'FICHA';
 const kw=semantic.map(t=>stemMap[t]||t.slice(0,Math.min(t.length,6)));
 const dedup=kw.filter((t,i)=>i===0||t!==kw[i-1]);
 const raw=dedup[0];
 if(dedup.length===1)return raw.slice(0,11);
 let a=dedup[0],b=dedup[1];
 // Prefer the full keyword when short; otherwise short recognisable stems.
 if(a.length+b.length+1>13){a=a.slice(0,6);b=b.slice(0,6)}
 const first=a+'-'+b;
 return first.length<=13?first:first.slice(0,13);
};
function candidates(r){
 const base=canonicalCode(r),arr=[base];
 const sem=words(r.name).filter(t=>!banned.has(t)&&!skip.has(t)&&!/^\d{4}$/.test(t)).map(t=>stemMap[t]||t.slice(0,6));
 const word=t=>t.slice(0,6);
 const variants=[
  sem.length>=3?word(sem[0])+'-'+word(sem[2]):'',
  sem.length>=3?word(sem[1])+'-'+word(sem[2]):'',
  sem.length>=3?word(sem[0])+'-'+word(sem.at(-1)):'',
  sem.length>=3?word(sem[1])+'-'+word(sem.at(-1)):'',
  sem.length>=2?word(sem[0])+'-'+word(sem.at(-1)):'',
  sem.length>=4?word(sem[2])+'-'+word(sem[3]):'',
 ];
 for(const s of variants){const c=s.replace(/-+$/,'').slice(0,13);if(c.length>=4&&!arr.includes(c))arr.push(c)}
 return arr;
}
function assign(data,reg){
 assert.equal(reg.scheme,'TI-SHORT-v1');
 const records=data.records;
 const assigned=reg.assignments||{};
 const used=new Map();
 for(const [id,r] of Object.entries(assigned)){
  assert(r.shortCode&&/^[A-Z0-9]{2,12}(?:-[A-Z0-9]{1,8}){0,2}$/.test(r.shortCode),'Invalid stored alias '+id);
  if(used.has(r.shortCode))throw Error('Duplicate persisted short code '+r.shortCode);
  used.set(r.shortCode,id);
 }
 // Allocate all high priority codes before generic derivation.
 const sorted=[...records].sort((a,b)=>{
  const af=canonicalCode(a),bf=canonicalCode(b);
  const ap=/^(POL\d\d|IDI)$/.test(af)?0:fixedById[a.id]?1:2;
  const bp=/^(POL\d\d|IDI)$/.test(bf)?0:fixedById[b.id]?1:2;
  return ap-bp||af.localeCompare(bf,'es')||a.id.localeCompare(b.id);
 });
 for(const r of sorted){
  assert(r.catalogCode&&r.id,'Missing immutable key');
  let entry=assigned[r.id];
  if(!entry){
   const pool=candidates(r);
   let code=pool.find(c=>!used.has(c));
   if(!code){
    const base=pool[0].slice(0,10);
    for(let n=2;n<=99;n++){
     const candidate=base+'-'+String(n).padStart(2,'0');
     if(!used.has(candidate)){code=candidate;break}
    }
   }
   assert(code,'No short code for '+r.name);
   assert(/^[A-Z0-9]{2,12}(?:-[A-Z0-9]{1,8}){0,2}$/.test(code),'Bad generated alias '+code);
   entry={shortCode:code,id:r.id,sourceId:r.id,fullCode:r.catalogCode,issuedName:r.name};
   assigned[r.id]=entry;used.set(code,r.id);
  }
  assert.equal(entry.fullCode,r.catalogCode,'Changed full canonical code '+r.id);
  r.shortCode=entry.shortCode;
  r.shortCodeScheme=reg.scheme;
 }
 reg.assignments=assigned;
 reg.count=Object.keys(assigned).length;
 reg.updatedForRecords=records.length;
 data.audit={...data.audit,shortCodeScheme:reg.scheme,shortCodesAssigned:records.length};
 assert.equal(new Set(records.map(r=>r.shortCode)).size,records.length);
 return data;
}
function sync(){
 const data=JSON.parse(fs.readFileSync(dataPath,'utf8'));
 const reg=fs.existsSync(regPath)?JSON.parse(fs.readFileSync(regPath,'utf8')):{version:1,scheme:'TI-SHORT-v1',assignments:{}};
 assign(data,reg);
 fs.writeFileSync(dataPath,JSON.stringify(data));
 fs.writeFileSync(regPath,JSON.stringify(reg,null,2)+'\n');
 const lengths=data.records.map(r=>r.shortCode.length);
 console.log('CODIGOS_CORTOS_OK',JSON.stringify({count:data.records.length,unique:new Set(data.records.map(r=>r.shortCode)).size,maxLength:Math.max(...lengths),average:(lengths.reduce((a,b)=>a+b,0)/lengths.length).toFixed(1),examples:data.records.filter(r=>['3b6696367fed','c15056b95733','14262d490cda'].includes(r.id)).map(r=>[r.name,r.shortCode])}));
}
if(require.main===module)sync();
module.exports={sync,assign,canonicalCode,candidates};
