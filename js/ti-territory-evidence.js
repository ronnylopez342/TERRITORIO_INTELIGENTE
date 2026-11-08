/* Territorio Inteligente — interpretación documental de capas por meta y vigencia.
 * Fuente: JSON derivado de Plan de Acción 2025 y Plan de Acción 2026 2T.
 * Menciones a veredas NO equivalen a coordenadas exactas ni a ejecución local certificada.
 * Se conserva el texto fuente original; nunca se geocodifican viviendas/personas.
 */
(function(){
 'use strict';
 if(window.TITerritoryEvidence)return;
 const catalogue=[
  {id:'coverage',label:'Cobertura declarada',color:'#327e73',dash:'8 7',hint:'Veredas nombradas en el campo territorial del Excel'},
  {id:'interventions',label:'Actividades / intervenciones',color:'#d87849',dash:'2 6',hint:'Actividades que mencionan una vereda; no puntos de obra'},
  {id:'physical',label:'Avance físico reportado',color:'#3a83c5',dash:'13 6',hint:'Avance positivo de una actividad; sin desglose físico por vereda'},
  {id:'beneficiaries',label:'Registros de beneficiarios',color:'#944c9b',dash:'5 5',hint:'Registro de personas por actividad; no atribuible a una sola vereda'},
  {id:'supports',label:'Soportes enlazados',color:'#a58a2e',dash:'1 7',hint:'Enlace documental registrado; no acredita una ubicación de obra'}
 ];
 const labelById=Object.fromEntries(catalogue.map(x=>[x.id,x]));
 const normal=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
 .replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
 const boundaryWords=s=>' '+normal(s)+' ';
 const phrase=(s,q)=>boundaryWords(s).includes(' '+normal(q)+' ');
 const rules=[
  ['Altania',['altania']],
  ['Canica Alta',['canica alta','canica alta']],
  ['Canica Baja',['canica baja']],
  ['Cascajal',['cascajal']],
  ['El Centro (Llanitos)',['el centro llanitos','llanitos']],
  ['El Guamal',['el guamal','guamal']],
  ['El Paramo',['el paramo','paramo']],
  ['El Tobal',['el tobal']],
  ['El Valle',['el valle']],
  ['Galdamez',['galdamez']],
  ['La Union',['la union']],
  ['La Yeguera',['la yeguera']],
  ['Pantano De Arce',['pantano de arce','pantano de arce']],
  ['Rincon Santo',['rincon santo']],
  ['Santa Rosa',['santa rosa']],
  ['Santuario La Cuesta',['santuario la cuesta','la cuesta']],
  ['Tibagota',['tibagota']]
 ];
 const geoNames=new Set(rules.map(r=>normal(r[0])));
 // Not a map for La Pradera: it is not the same administrative polygon as La Yeguera.
 // Do not turn "Centro", "Canica", "El Pantano", "Santuario" or "Subachoque"
 // into a precise polygon: those expressions are geographically ambiguous.
 const cityExpressions=['casco urbano','zona urbana','cabecera municipal'];
 const genericTerritories=['todo el municipio','municipio de subachoque','jurisdiccion municipal',
 'zona rural y urbana','casco rural y urbano','toda la jurisdiccion','sector rural','zona rural'];
 function matchPlaces(raw){
  const names=new Set;
  for(const [canonical,aliases] of rules){
   if(aliases.some(q=>phrase(raw,q)))names.add(normal(canonical));
  }
  const literal=normal(raw);
  if(cityExpressions.some(x=>phrase(literal,x)))names.add('casco urbano');
  return [...names].filter(n=>geoNames.has(n)||n==='casco urbano');
 }
 const description={
  coverage:'Lugar mencionado en el Plan de Acción. No demuestra ubicación puntual de intervención.',
  interventions:'Actividad relacionada con el territorio. No demuestra que toda la vereda haya sido intervenida.',
  physical:'Existe avance cuantitativo de la actividad, pero el Excel no lo distribuye por vereda.',
  beneficiaries:'Existen registros de personas por actividad; NO son domicilios, personas únicas ni valores por vereda.',
  supports:'Hay un enlace documental asociado a la actividad. No se verificó aquí su contenido ni sus coordenadas.'
 };
 const safeLink=v=>{
  try{const u=new URL(String(v||''));return /^https?:$/.test(u.protocol)?u.href:'';}
  catch{return '';}
 };
 function validPeople(a){
  const parts=['Funcionarios o contratistas','Comunidad','Asistentes ocasionales'];
  return parts.map((label,i)=>({label,count:a?.people?.[i]}))
   .filter(x=>typeof x.count==='number'&&Number.isInteger(x.count)&&x.count>0);
 }
 function compile(m,{year='2025',extra=null,source=''}={}){
  const themes=Object.fromEntries(catalogue.map(k=>[k.id,{
    id:k.id,label:k.label,color:k.color,dash:k.dash,hint:k.hint,description:description[k.id],
    items:{},activityIds:new Set,missing:0,broad:0,unresolved:0
  }]));
  const activities=Array.isArray(m?.activities)?m.activities:[];
  const report={
    meta:Number(m?.id)||null,year:String(year),source:String(source||'Plan de Acción'),
    total:activities.length,territoryReported:0,withVereda:0,withOnlyGeneral:0,
    withoutPlace:0,unmatched:0,exactSiteCoordinates:0,
    warnings:['No se recibieron coordenadas individuales de obras ni domicilios en estos registros.']
  };
  for(const a of activities){
   const rawFromExtra=extra?.periods?.[String(year)]?.[String(m.id)]?.[String(a.n)];
   const raw=String(rawFromExtra||a.territory||'').trim();
   const places=matchPlaces(raw),hasPlace=places.length>0,hasRaw=!!raw;
   if(hasRaw)report.territoryReported++;
   if(hasPlace)report.withVereda++;
   else if(!hasRaw)report.withoutPlace++;
   else if(genericTerritories.some(s=>phrase(raw,s))||/^centro$|^alcaldia|^subachoque$/.test(normal(raw)))report.withOnlyGeneral++;
   else report.unmatched++;
   const participants=validPeople(a);
   const progress=typeof a.progress==='number'&&Number.isFinite(a.progress)?a.progress:null;
   const target=typeof a.target==='number'&&Number.isFinite(a.target)?a.target:null;
   const support=safeLink(a.evidence);
   const base={id:String(a.n),name:String(a.name||'Actividad'),raw,unit:String(a.unit||''),
     target,progress,participants,support,source:report.source};
   const active=['coverage','interventions'];
   if(progress!==null&&progress>0)active.push('physical');
   if(participants.length)active.push('beneficiaries');
   if(support)active.push('supports');
   for(const k of active){
    const t=themes[k];if(!t)continue;
    if(!hasPlace){if(!hasRaw)t.missing++;else if(genericTerritories.some(s=>phrase(raw,s)))t.broad++;else t.unresolved++;continue;}
    t.activityIds.add(base.id);
    for(const p of places){
      if(!t.items[p])t.items[p]=[];
      t.items[p].push(base);
    }
   }
  }
  for(const t of Object.values(themes)){
    t.activityCount=t.activityIds.size;
    t.placeCount=Object.keys(t.items).length;
    // Numeric values recorded per activity cannot be summed over territorial
    // polygons when one activity names several places; do not aggregate them.
    delete t.activityIds;
  }
  return {meta:report.meta,year:report.year,themes,report,catalogue};
 }
 function describe(bundle,active){
  const kinds=(Array.isArray(active)?active:[]).filter(k=>labelById[k]);
  if(!kinds.length)return 'Mapa base de Subachoque · activa una o varias capas para consultar evidencias.';
  const parts=kinds.map(k=>{
   const t=bundle?.themes?.[k];
   if(!t||!t.placeCount)return labelById[k].label+': sin veredas identificables en esta meta.';
   return labelById[k].label+': '+t.placeCount+' zona'+(t.placeCount===1?'':'s')+
      ' y '+t.activityCount+' actividad'+(t.activityCount===1?'':'es')+' mencionada'+(t.activityCount===1?'':'s')+'.';
  });
  return parts.join(' · ')+' Ubicaciones puntuales pendientes; no se distribuyen cifras por vereda.';
 }
 function missing(bundle){
  const r=bundle?.report;
  if(!r)return 'Información territorial no disponible.';
  if(!r.territoryReported)return 'Sin campo territorial diligenciado en las actividades de esta meta.';
  const unresolved=r.withoutPlace+r.withOnlyGeneral+r.unmatched;
  return 'Fuente: '+r.source+' · '+r.withVereda+' de '+r.total+
   ' actividades con lugar cartografiable; '+unresolved+
   ' sin vereda identificable. Sin coordenadas de intervención verificadas.';
 }
 window.TITerritoryEvidence={catalogue,compile,describe,missing,matchPlaces,normal};
})();
