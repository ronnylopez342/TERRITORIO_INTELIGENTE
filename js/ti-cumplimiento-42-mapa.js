/* Territorio Inteligente · 4.2 Mapa Estratégico
   Reutiliza el mapa oficial TI; nunca adjudica puntos exactos a una vereda.
   Fuente de registros: TI42Summary (Proyectos DEFINITIVO).
*/
(function TI42Mapa(){
'use strict';
const section=document.querySelector('#cumplimiento-proyectos');
const shell=section?.querySelector('.ti42');
const nav=shell?.querySelector('.ti42-tabs');
const summary=window.TI42Summary,projects=window.TI42Proyectos;
if(!section||!shell||!nav||!summary?.onChange||!projects?.setView)return;
const KEY='ti:uc42:mapa:v1';
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
const have=v=>v!==null&&v!==undefined&&String(v).trim()!=='';
const finite=v=>typeof v==='number'&&Number.isFinite(v);
const money=v=>finite(v)?'$ '+new Intl.NumberFormat('es-CO',{maximumFractionDigits:0}).format(v):'Sin dato';
const millions=v=>finite(v)?'$ '+new Intl.NumberFormat('es-CO',{maximumFractionDigits:1}).format(v/1000000)+' M':'Sin dato';
const pcent=v=>finite(v)?new Intl.NumberFormat('es-CO',{maximumFractionDigits:1}).format(v)+' %':'Sin dato';
const cap=v=>Math.max(0,Math.min(100,finite(v)?v:0));
const clip=(v,n=52)=>{const str=String(v||'').replace(/\s+/g,' ').trim();return esc(str.length>n?str.slice(0,n-1).trimEnd()+'…':str);};
const date=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)?v.slice(8)+'/'+v.slice(5,7)+'/'+v.slice(0,4):'Sin dato';
const safeUrl=v=>{try{const u=new URL(String(v||''));return u.protocol==='https:'?u.href:null;}catch{return null;}};
const CATS=[
 {id:'vias',label:'Vías e infraestructura',color:'#1666ca',icon:'▣'},
 {id:'vivienda',label:'Vivienda',color:'#079553',icon:'⌂'},
 {id:'agua',label:'Agua potable',color:'#19ade0',icon:'◉'},
 {id:'educacion',label:'Educación',color:'#9251d8',icon:'▤'},
 {id:'salud',label:'Salud',color:'#e84358',icon:'✚'},
 {id:'ambiente',label:'Ambiente',color:'#5ca72d',icon:'♧'},
 {id:'otros',label:'Otros',color:'#dd9922',icon:'◇'}
];
const category=r=>{
 const text=norm([r.sectorMGA,r.strategicLine,r.name].join(' '));
 if(/acueducto|agua potable|saneamiento|alcantarillado|h[ií]drico/.test(text))return 'agua';
 if(/educacion|colegio|escuela|institucion educativa/.test(text))return 'educacion';
 if(/salud|hospital|centro medico/.test(text))return 'salud';
 if(/ambiente|ecologia|ecosistema|forestal|ambiental/.test(text))return 'ambiente';
 if(/vivienda|habitacional|mejoramiento de vivienda/.test(text))return 'vivienda';
 if(/transporte|infraestructura|placa huella|vias|vial|movilidad|puente/.test(text))return 'vias';
 return 'otros';
};
const catInfo=id=>CATS.find(c=>c.id===id)||CATS.at(-1);
const placeKeys=r=>{
 if(!have(r.vereda))return [];
 const match=window.TITerritoryEvidence?.matchPlaces?.(r.vereda);
 if(Array.isArray(match))return [...new Set(match.filter(v=>v!=='casco urbano'))];
 return [];
};
let saved=null;try{saved=JSON.parse(localStorage.getItem(KEY)||'null');}catch{}
const state={
 search:typeof saved?.search==='string'?saved.search:'',
 vereda:typeof saved?.vereda==='string'?saved.vereda:'all',
 category:CATS.some(c=>c.id===saved?.category)?saved.category:'all',
 projectLayers: Array.isArray(saved?.projectLayers)?saved.projectLayers.filter(v=>CATS.some(c=>c.id===v)):CATS.map(c=>c.id),
 selectedRow:Number(saved?.selectedRow)||null,
 photo:0,
 withProjectAreas:saved?.withProjectAreas!==false
};
if(!state.projectLayers.length)state.projectLayers=CATS.map(c=>c.id);
let rows=[],shared={},loaded=false,loadError=null,base=[],visible=[],selected=null;
let mapApi=null,miniMap=null,mapPending=false,miniPending=false;
let geo=null,geoPending=false,baseLayer=null,allVeredaKeys=[],mapInstancesReady=false;
let mapViewCount=0,heatInvestments=new Map(),heatUsed=0,heatExcluded=0;
const html=[
 '<div class="ti42m" data-ti42m-root aria-label="Mapa Estratégico de Proyectos">',
 '<div class="ti42m-kpis" data-ti42m-kpis></div>',
 '<div class="ti42m-layout">',
 '<section class="ti42m-primary"><div class="ti42m-map-wrap">',
 '<div data-ti42m-map data-ti-map data-ti-map-manual="1" class="ti42m-map-host" aria-label="Cartografía de Subachoque"></div>',
 '<div class="ti42m-map-search">',
 '<label class="ti42m-map-searchbox" for="ti42m-search"><span aria-hidden="true">⌕</span>',
 '<input id="ti42m-search" data-ti42m-search autocomplete="off" type="search" placeholder="Buscar proyecto o vereda..." aria-label="Buscar proyecto o vereda"></label>',
 '<div data-ti42m-suggestions class="ti42m-suggestions" hidden></div></div>',
 '<div class="ti42m-map-legend"><strong>Leyenda de proyectos</strong><div data-ti42m-legend></div>',
 '<small>Veredas con registros · No señala puntos exactos de obra</small></div>',
 '</div></section>',
 '<aside class="ti42m-side"><article class="ti42m-record">',
 '<div class="ti42m-record-head"><h3 data-ti42m-name>Selecciona un proyecto</h3>',
 '<button type="button" data-ti42m-unselect title="Limpiar selección" aria-label="Limpiar selección">×</button></div>',
 '<div class="ti42m-gallery" data-ti42m-gallery></div>',
 '<div class="ti42m-record-status" data-ti42m-status></div>',
 '<dl class="ti42m-record-fields" data-ti42m-fields></dl>',
 '<div class="ti42m-record-buttons">',
 '<button type="button" data-ti42m-action="evidencias">▧ Ver evidencias</button>',
 '<button type="button" data-ti42m-action="contrato">▤ Ver contrato</button>',
 '<button type="button" data-ti42m-action="ficha">▣ Ficha técnica</button></div>',
 '<div class="ti42m-mini-map" data-ti42m-mini data-ti-map data-ti-map-manual="1" aria-label="Mapa territorial de la ficha"></div>',
 '<div class="ti42m-mini-bar"><span data-ti42m-mini-label>Ubicación territorial de referencia</span>',
 '<button type="button" data-ti42m-focus>Ver en mapa ↗</button></div></article></aside>',
 '</div>',
 '<div class="ti42m-bottom">',
 '<article class="ti42m-panel"><h3>♧ Mapa de calor por inversión</h3><div class="ti42m-heat-body" data-ti42m-heat></div>',
 '<p data-ti42m-heat-note class="ti42m-panel-note"></p></article>',
 '<article class="ti42m-panel"><h3>▣ Distribución de proyectos por sector</h3><div data-ti42m-donut></div>',
 '<p class="ti42m-panel-note">Nombres distintos del Excel · sectores clasificados por contenido</p></article>',
 '<article class="ti42m-panel"><h3>♧ Avance territorial acumulado</h3><div data-ti42m-years></div>',
 '<p class="ti42m-panel-note">Proyectos por vigencia y veredas mencionadas acumuladas; no mide avance de obra.</p></article>',
 '<article class="ti42m-panel"><h3>▤ Top 5 veredas por inversión registrada</h3><div data-ti42m-top></div>',
 '<p class="ti42m-panel-note">Suma de importes atribuibles a una vereda · No certifica inversión territorial.</p></article>',
 '<article class="ti42m-panel"><h3>⚠ Alertas y recomendaciones</h3><div data-ti42m-alerts></div>',
 '<p class="ti42m-panel-note">Reglas de calidad documental, no dictámenes automatizados de incumplimiento.</p></article>',
 '</div>',
 '<p class="ti42m-foot" data-ti42m-foot>Fuente: Unidad de Cumplimiento · «Proyectos DEFINITIVO». Veredas y geometrías de la cartografía local; sin certificación de coordenadas puntuales.</p>',
 '<dialog class="ti42m-lightbox" data-ti42m-lightbox aria-label="Fotografía documental"><button data-ti42m-lightbox-close aria-label="Cerrar fotografía">×</button><div data-ti42m-lightbox-image></div></dialog>',
 '</div>'
].join('');
const panel=document.createElement('section');
panel.dataset.ti42MapaRoot='1';
panel.hidden=true;
panel.innerHTML=html;
nav.after(panel);
const q=s=>panel.querySelector(s),all=s=>[...panel.querySelectorAll(s)];
const set=(s,content)=>{const el=q(s);if(el)el.innerHTML=content;};
const put=(s,content)=>{const el=q(s);if(el)el.textContent=String(content??'');};
function keep(){
 try{localStorage.setItem(KEY,JSON.stringify({search:state.search,vereda:state.vereda,category:state.category,projectLayers:state.projectLayers,selectedRow:state.selectedRow,withProjectAreas:state.withProjectAreas}));}catch{}
}
const dateMs=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)?Date.parse(v+'T00:00:00Z'):null;
const baseMatches=r=>window.TI42Summary.matches(r);
function applyFilters(){
 base=rows.filter(baseMatches);
 const categories=state.projectLayers;
 visible=base.filter(r=>{
   if(state.vereda!=='all'&&!placeKeys(r).includes(state.vereda))return false;
   if(state.category!=='all'&&category(r)!==state.category)return false;
   if(!categories.includes(category(r)))return false;
   if(state.search&&!norm([r.name,r.bpin,r.vereda,r.contract,r.sectorMGA,r.item].join(' ')).includes(norm(state.search)))return false;
   return true;
 });
 if(state.selectedRow===-1){selected=null;return;}
 if(!visible.some(r=>Number(r.excelRow)===state.selectedRow)){
   const first=visible.find(r=>placeKeys(r).length)||visible[0];
   state.selectedRow=first?.excelRow??null;
 }
 selected=visible.find(r=>Number(r.excelRow)===state.selectedRow)||null;
}
const namedUnique=rr=>new Set(rr.map(r=>norm(r.name)).filter(Boolean));
function makeKpi(icon,label,value,subtitle,colour){
 return '<article class="ti42m-kpi"><span class="ti42m-kpi-icon '+colour+'">'+icon+'</span><div><small>'+esc(label)+'</small><strong>'+esc(value)+'</strong><em>'+esc(subtitle)+'</em></div></article>';
}
function renderKpis(){
 // El Excel contiene coordenadas de texto, pero ninguna está acreditada como punto exacto verificado.
 const geocoded=0;
 const budgets=visible.filter(r=>finite(r.budget)&&r.budget>=0);
 const total=budgets.reduce((s,r)=>s+r.budget,0);
 const current=visible.filter(r=>/en ejecucion/.test(norm(r.contractStatus))&&have(r.contract)).length;
 const photos=visible.filter(r=>[r.photoBefore,r.photoFollow,r.photoAfter].some(v=>safeUrl(v))).length;
 const recognized=new Set(visible.flatMap(placeKeys));
 const count=allVeredaKeys.length||17,ratio=count?Math.round(recognized.size/count*100):null;
 set('[data-ti42m-kpis]',[
 makeKpi('●','Proyectos georreferenciados',geocoded,'Sin puntos de obra validados','blue'),
 makeKpi('▤','Inversión total',budgets.length?millions(total):'Sin dato','Suma de '+budgets.length+' filas; puede duplicar','green'),
 makeKpi('◧','Cobertura territorial',ratio===null?'—':ratio+' %','Veredas mencionadas / '+count,'green'),
 makeKpi('♣','Veredas mencionadas',recognized.size,'Mencionadas, no verificadas','green'),
 makeKpi('▣','Contratos activos',current,'Con estado textual «en ejecución»','blue'),
 makeKpi('▧','Evidencias geolocalizadas',0,'Fotos sin ubicación verificada'+(photos?'; '+photos+' enlaces':'') ,'blue')
 ].join(''));
}
function renderLegend(){
 set('[data-ti42m-legend]',CATS.map(c=>'<button type="button" data-ti42m-cat="'+c.id+'" aria-pressed="'+(state.category===c.id)+'" class="'+(state.category===c.id?'active':'')+'"><i style="background:'+c.color+'"></i>'+esc(c.label)+'</button>').join(''));
}
function renderSuggestions(){
 const host=q('[data-ti42m-suggestions]');
 if(!state.search||state.search.trim().length<2){host.hidden=true;host.innerHTML='';return;}
 const n=norm(state.search);
 const entries=base.filter(r=>norm([r.name,r.bpin,r.vereda].join(' ')).includes(n)).slice(0,5);
 const veredas=[...new Set(allVeredaKeys)].filter(v=>v.includes(n)).slice(0,3);
 let body=veredas.map(v=>'<button type="button" data-ti42m-suggest-place="'+esc(v)+'"><b>⌖ Vereda</b> '+esc(v)+'</button>').join('');
 body+=entries.map(r=>'<button type="button" data-ti42m-suggest-row="'+r.excelRow+'"><b>▤ Proyecto</b> '+clip(r.name,58)+'</button>').join('');
 host.innerHTML=body||'<p>No hay coincidencias en los registros filtrados.</p>';host.hidden=false;
}
function photos(r){
 if(!r)return [];
 return [['Antes',r.photoBefore],['Seguimiento',r.photoFollow],['Después',r.photoAfter]]
   .filter(([,u])=>!!safeUrl(u)).map(([title,u])=>({title,url:safeUrl(u)}));
}
function drawGallery(){
 const gallery=q('[data-ti42m-gallery]'),img=photos(selected);
 if(!img.length){
  gallery.innerHTML='<div class="ti42m-gallery-empty"><span aria-hidden="true">▧</span><strong>Sin fotografía documental vinculada</strong><small>Las columnas «Antes», «Seguimiento» y «Después» no contienen enlaces verificables para este registro.</small></div>';
  return;
 }
 state.photo=Math.min(Math.max(0,state.photo),img.length-1);
 gallery.innerHTML='<button type="button" class="ti42m-gallery-image" data-ti42m-zoom aria-label="Ampliar fotografía '+esc(img[state.photo].title)+'"><img alt="Fotografía '+esc(img[state.photo].title)+' del proyecto" src="'+esc(img[state.photo].url)+'" loading="lazy"></button>'+
  '<div class="ti42m-gallery-controls"><button type="button" data-ti42m-photo="-1" aria-label="Foto anterior">‹</button><button type="button" data-ti42m-photo="1" aria-label="Foto siguiente">›</button></div>'+
  '<span class="ti42m-gallery-count">'+(state.photo+1)+'/'+img.length+'</span>';
}
function label(name,value){
 return '<div><dt>'+esc(name)+'</dt><dd>'+esc(have(value)?value:'No registrado')+'</dd></div>';
}
function stateBadge(r){
 const text=String(r.contractStatus||'Estado no registrado');
 const parsed=norm(text);
 const tone=parsed.includes('en ejecucion')?'green':parsed.includes('adjudicado')||parsed.includes('firmado')?'blue':parsed.includes('no se ha iniciado')?'orange':'neutral';
 return '<span class="ti42m-badge '+tone+'">'+esc(text)+'</span>';
}
function renderRecord(){
 if(!selected){
  put('[data-ti42m-name]','Sin registros para la selección');
  set('[data-ti42m-gallery]','<div class="ti42m-gallery-empty"><strong>Selecciona un proyecto del mapa o cambia los filtros.</strong></div>');
  set('[data-ti42m-status]','');set('[data-ti42m-fields]','');
  all('[data-ti42m-action]').forEach(b=>b.disabled=true);
  put('[data-ti42m-mini-label]','Sin referencia territorial');
  return;
 }
 put('[data-ti42m-name]',selected.name);
 drawGallery();
 set('[data-ti42m-status]',stateBadge(selected));
 const r=selected;
 const progress='<div class="ti42m-progress"><strong>'+pcent(r.physicalPercent)+'</strong><div><i style="width:'+cap(r.physicalPercent)+'%"></i></div></div>';
 set('[data-ti42m-fields]',
  label('Proyecto',r.name)+label('Sector',r.sectorMGA)+
  '<div><dt>Avance físico</dt><dd>'+progress+'</dd></div>'+
  label('BPIN',r.bpin)+label('Valor total',finite(r.budget)?money(r.budget):null)+
  label('Contratista',r.contractor)+label('Supervisor',r.technicalResponsible)+
  label('Fecha inicio',date(r.start))+label('Fecha fin',date(r.end))+
  label('Ubicación',placeKeys(r).length?'Vereda de referencia (no punto de obra)':'Sin georreferenciación acreditada')+
  label('Vereda',r.vereda)
 );
 all('[data-ti42m-action]').forEach(b=>b.disabled=false);
 put('[data-ti42m-mini-label]',placeKeys(r).length?'Vereda documental: '+r.vereda:'Sin vereda cartografiable');
 if(mapApi&&placeKeys(r).length&&!panel.hidden)focusSelected(false);
 if(miniMap&&placeKeys(r).length)focusMini();
}
function focusSelected(focus){
 if(!mapApi||!selected)return;
 const key=placeKeys(selected)[0];
 if(!key)return;
 try{if(focus)mapApi.focus(key,true);else mapApi.focus(key,false);}catch{}
}
function focusMini(){
 if(!miniMap||!selected)return;
 const key=placeKeys(selected)[0];if(!key)return;
 try{miniMap.focus(key,true);}catch{}
}
function uniqueVeredaName(name){
 if(!geo)return name;
 return geo.features.map(f=>window.TISubachoqueMap?.featureName(f)||f.properties?.nombre||'')
   .find(s=>norm(s)===norm(name))||name;
}
function selectVereda(name){
 const key=norm(name);
 state.search='';q('[data-ti42m-search]').value='';
 state.vereda=state.vereda===key?'all':key;
 const candidates=base.filter(r=>placeKeys(r).includes(key));
 if(candidates.length){state.selectedRow=candidates[0].excelRow;state.photo=0;}
 refresh();
 const target=uniqueVeredaName(name);
 if(mapApi&&state.vereda!=='all')mapApi.focus(target,true);
}
function selectRecord(id,focus=true){
 const chosen=visible.find(r=>Number(r.excelRow)===Number(id))||base.find(r=>Number(r.excelRow)===Number(id));
 if(!chosen)return;
 state.selectedRow=Number(chosen.excelRow);summary.selectRow(state.selectedRow);state.photo=0;
 if(state.vereda!=='all'&&!placeKeys(chosen).includes(state.vereda))state.vereda='all';
 if(state.category!=='all'&&category(chosen)!==state.category)state.category='all';
 state.search='';q('[data-ti42m-search]').value='';
 refresh();
 if(focus)focusSelected(true);
}
function mountMap(){
 if(panel.hidden||section.hidden||mapApi||mapPending||!window.TISubachoqueMap)return;
 mapPending=true;
 const host=q('[data-ti42m-map]');
 window.TISubachoqueMap.mount(host,{onSelect:name=>selectVereda(name)}).then(api=>{
  mapPending=false;mapApi=api;
  try{mapApi.toggleLayerPanel();}catch{}
  injectProjectControls();
  if(!geoPending&&!geo){geoPending=true;window.TISubachoqueMap.getGeo('veredas').then(g=>{
    geo=g;geoPending=false;allVeredaKeys=g.features.map(f=>norm(window.TISubachoqueMap.featureName(f)));
    renderKpis();renderSuggestions();updateMapAreas();drawHeat();
  }).catch(()=>{geoPending=false;});}
  if(selected)focusSelected(false);
  mapApi.invalidateSize?.();
 }).catch(e=>{mapPending=false;host.textContent='No se pudo mostrar la cartografía de Subachoque: '+e.message;});
}
function mountMini(){
 if(panel.hidden||section.hidden||miniMap||miniPending||!window.TISubachoqueMap)return;
 miniPending=true;
 window.TISubachoqueMap.mount(q('[data-ti42m-mini]'),{onSelect:name=>{
    selectVereda(name); if(mapApi)mapApi.focus(name,true);
 }}).then(api=>{miniPending=false;miniMap=api;if(selected)focusMini();miniMap.invalidateSize?.();}).catch(()=>{miniPending=false;q('[data-ti42m-mini]').textContent='Mapa compacto no disponible';});
}
function injectProjectControls(){
 const host=q('[data-ti42m-map]'),floating=host?.querySelector('.ti-ed-layer-panel');
 if(!floating||floating.querySelector('[data-ti42m-layer-controls]'))return;
 const wrap=document.createElement('div');
 wrap.dataset.ti42mLayerControls='1';
 wrap.className='ti42m-layer-controls';
 wrap.innerHTML='<strong>PROYECTOS CON VEREDA REGISTRADA</strong>'+
  '<label><input type="checkbox" data-ti42m-area-enabled '+(state.withProjectAreas?'checked':'')+'> Resaltar veredas referidas</label>'+
  '<small>Esta capa no señala coordenadas puntuales.</small>'+
  CATS.map(c=>'<label><input type="checkbox" data-ti42m-layer-cat="'+c.id+'" '+(state.projectLayers.includes(c.id)?'checked':'')+'><i style="background:'+c.color+'"></i>'+esc(c.label)+'</label>').join('');
 floating.append(wrap);
 host.addEventListener('change',e=>{
  const en=e.target.closest('[data-ti42m-area-enabled]');
  if(en){state.withProjectAreas=en.checked;updateMapAreas();keep();return;}
  const l=e.target.closest('[data-ti42m-layer-cat]');
  if(l){
    state.projectLayers=l.checked?[...new Set([...state.projectLayers,l.dataset.ti42mLayerCat])]:state.projectLayers.filter(x=>x!==l.dataset.ti42mLayerCat);
    refresh();
  }
 });
}
function updateMapAreas(){
 if(!mapApi||!geo||!window.L)return;
 if(baseLayer){mapApi.map.removeLayer(baseLayer);baseLayer=null;}
 if(!state.withProjectAreas)return;
 const byPlace=new Map();
 for(const r of visible){
  const key=placeKeys(r)[0];if(!key)continue;
  if(!byPlace.has(key))byPlace.set(key,new Map());
  const bag=byPlace.get(key),id=category(r);bag.set(id,(bag.get(id)||0)+1);
 }
 const styledFeatures=geo.features.filter(f=>byPlace.has(norm(window.TISubachoqueMap.featureName(f))));
 const layer=window.L.geoJSON({type:'FeatureCollection',features:styledFeatures},{
  style:f=>{
    const key=norm(window.TISubachoqueMap.featureName(f)),entries=[...(byPlace.get(key)||new Map())];
    const major=entries.sort((a,b)=>b[1]-a[1])[0]?.[0]||'otros',color=catInfo(major).color;
    return {color,weight:2.8,opacity:0.93,fillColor:color,fillOpacity:.14,dashArray:'5 5'};
  },
  onEachFeature:(f,l)=>{
    const key=norm(window.TISubachoqueMap.featureName(f)),count=visible.filter(r=>placeKeys(r).includes(key)).length;
    l.bindTooltip(esc(window.TISubachoqueMap.featureName(f))+' · '+count+' registro(s) con referencia territorial');
    l.on('click',()=>selectVereda(key));
  }
 });
 baseLayer=layer.addTo(mapApi.map);
}
function investmentByPlace(){
 heatInvestments=new Map();heatUsed=0;heatExcluded=0;
 const attributed=[];
 for(const r of visible){
  if(!finite(r.budget)||r.budget<0)continue;
  const keys=placeKeys(r);
  if(keys.length!==1){heatExcluded++;continue;}
  attributed.push({row:r,key:keys[0]});
 }
 const byContract=new Map();
 for(const o of attributed){
  const k=norm(o.row.contract||o.row.name);
  if(!k)continue;
  if(!byContract.has(k))byContract.set(k,new Set());
  byContract.get(k).add(o.key);
 }
 const seen=new Set();
 for(const o of attributed){
  const contract=norm(o.row.contract||o.row.name);
  if(!contract||byContract.get(contract)?.size!==1){heatExcluded++;continue;}
  const key=contract+'|'+o.key+'|'+o.row.budget;
  if(seen.has(key)){heatExcluded++;continue;}
  seen.add(key);heatUsed++;heatInvestments.set(o.key,(heatInvestments.get(o.key)||0)+o.row.budget);
 }
}
function renderHeatSvg(){
 if(!geo){
  set('[data-ti42m-heat]','<p class="ti42m-empty">Consultando geometría municipal de referencia…</p>');
  return;
 }
 investmentByPlace();
 const polys=geo.features;
 const points=[];
 function gather(coords){
   if(!Array.isArray(coords))return;
   if(typeof coords[0]==='number'&&typeof coords[1]==='number'){points.push(coords);return;}
   coords.forEach(gather);
 }
 polys.forEach(f=>gather(f.geometry?.coordinates));
 if(!points.length)return;
 let x0=Infinity,x1=-Infinity,y0=Infinity,y1=-Infinity;
 for(const p of points){if(p[0]<x0)x0=p[0];if(p[0]>x1)x1=p[0];if(p[1]<y0)y0=p[1];if(p[1]>y1)y1=p[1];}
 const W=235,H=156,pad=7,scale=Math.min((W-2*pad)/(x1-x0),(H-2*pad)/(y1-y0));
 const offsetX=(W-(x1-x0)*scale)/2,offsetY=(H-(y1-y0)*scale)/2;
 const xy=p=>[(offsetX+(p[0]-x0)*scale).toFixed(2),(H-offsetY-(p[1]-y0)*scale).toFixed(2)];
 const ring=r=>r.map((p,i)=>{const z=xy(p);return (i?'L':'M')+z[0]+' '+z[1];}).join(' ')+'Z';
 const path=f=>(f.geometry?.type==='Polygon'?[f.geometry.coordinates]:f.geometry?.type==='MultiPolygon'?f.geometry.coordinates:[]).map(p=>p.map(ring).join(' ')).join(' ');
 const values=[...heatInvestments.values()],max=Math.max(1,...values);
 const heatColor=v=>!finite(v)?'#e7edf0':v===0?'#d9eee0':v/max<.25?'#78ca71':v/max<.55?'#e8cf4b':v/max<.85?'#f19b3b':'#de4b31';
 const paths=polys.map(f=>{
   const key=norm(window.TISubachoqueMap.featureName(f)),v=heatInvestments.get(key);
   return '<path tabindex="0" role="button" data-ti42m-heat-place="'+esc(key)+'" d="'+path(f)+'" fill="'+heatColor(v)+'" stroke="#fff" stroke-width="1" title="'+esc(window.TISubachoqueMap.featureName(f))+' · '+(finite(v)?money(v):'Sin importe atribuible')+'"><title>'+esc(window.TISubachoqueMap.featureName(f))+' · '+(finite(v)?money(v):'Sin importe atribuible')+'</title></path>';
 }).join('');
 set('[data-ti42m-heat]','<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Distribución por vereda de costos totales consignados en el Excel">'+paths+'</svg>'+
  '<div class="ti42m-heat-scale"><span>Mayor registro</span><i></i><span>Menor registro</span><em>Gris: sin importe atribuible</em></div>');
 put('[data-ti42m-heat-note]',heatUsed+' filas con costo atribuido a una sola vereda; '+heatExcluded+' excluidas de esta distribución por ambigüedad o duplicidad.');
}
function drawHeat(){renderHeatSvg();}
function setCategory(id){
 state.category=state.category===id?'all':id;state.search='';q('[data-ti42m-search]').value='';refresh();
}
function renderDonut(){
 const unique=new Map();
 for(const r of visible){const name=norm(r.name);if(!name||unique.has(name))continue;unique.set(name,r);}
 const counts=new Map(CATS.map(c=>[c.id,0]));
 for(const r of unique.values())counts.set(category(r),counts.get(category(r))+1);
 const total=unique.size;
 let cursor=0,colors=[];
 for(const c of CATS){const n=counts.get(c.id),next=cursor+(total?n/total*100:0);
  if(n)colors.push(c.color+' '+cursor.toFixed(2)+'% '+next.toFixed(2)+'%');cursor=next;}
 const gradient=colors.length?'conic-gradient('+colors.join(',')+')':'conic-gradient(#d9e5ed 0 100%)';
 const legend=CATS.filter(c=>counts.get(c.id)).map(c=>
  '<button type="button" data-ti42m-cat="'+c.id+'" aria-pressed="'+(state.category===c.id)+'">'+
  '<i style="background:'+c.color+'"></i><span>'+esc(c.label)+'</span><b>'+Math.round(counts.get(c.id)/total*100)+'%</b></button>'
 ).join('');
 set('[data-ti42m-donut]','<div class="ti42m-donut-layout"><div class="ti42m-donut" style="background:'+gradient+'"><div><strong>'+total+'</strong><span>nombres distintos</span></div></div><div class="ti42m-donut-legend">'+(legend||'<p>Sin sectores registrados</p>')+'</div></div>');
}
function renderYears(){
 const yrs=[2024,2025,2026,2027],entries=[];
 let places=new Set();
 for(const y of yrs){
  const yr=visible.filter(r=>String(r.year)===String(y));
  yr.flatMap(placeKeys).forEach(x=>places.add(x));
  entries.push({year:y,projects:namedUnique(yr).size,coverage:allVeredaKeys.length?places.size/allVeredaKeys.length*100:0});
 }
 const W=310,H=148,baseY=113,max=Math.max(1,...entries.map(e=>e.projects));
 const bars=entries.map((e,i)=>{
  const x=37+i*71,w=24,h=(e.projects/max)*90;
  return '<rect x="'+x+'" y="'+(baseY-h).toFixed(1)+'" width="'+w+'" height="'+h.toFixed(1)+'" fill="#2e89e4" rx="2"><title>'+e.projects+' nombres distintos, vigencia '+e.year+'</title></rect>'+
   '<text x="'+(x+12)+'" y="'+(baseY-h-5).toFixed(1)+'" text-anchor="middle" font-size="9" fill="#1b609d">'+e.projects+'</text>'+
   '<text x="'+(x+12)+'" y="'+(baseY+13)+'" text-anchor="middle" font-size="10" fill="#3f6689">'+e.year+'</text>';
 }).join('');
 const linePoints=entries.map((e,i)=>(49+i*71)+','+(baseY-e.coverage/100*90).toFixed(1)).join(' ');
 const circles=entries.map((e,i)=>'<circle cx="'+(49+i*71)+'" cy="'+(baseY-e.coverage/100*90).toFixed(1)+'" r="3.7" fill="#14a87a"><title>'+e.coverage.toFixed(1)+'% de veredas mencionadas hasta '+e.year+'</title></circle>').join('');
 set('[data-ti42m-years]','<div class="ti42m-key"><span><i class="blue"></i>Nombres por vigencia</span><span><i class="green"></i>Mención territorial acumulada</span></div>'+
 '<svg viewBox="0 0 '+W+' '+H+'" aria-label="Nombres de proyectos por vigencia y porcentaje acumulado de veredas mencionadas" role="img">'+
 [0,1,2,3,4].map(n=>'<line x1="18" x2="305" y1="'+(baseY-n*22.5)+'" y2="'+(baseY-n*22.5)+'" stroke="#e0eaf2" stroke-width=".9"/>').join('')+
 bars+'<polyline fill="none" stroke="#17a876" stroke-width="2.8" points="'+linePoints+'"/>'+circles+'</svg>');
}
function renderTop(){
 investmentByPlace();
 const amounts=[...heatInvestments.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5);
 set('[data-ti42m-top]',amounts.length?
 '<table class="ti42m-top-table"><thead><tr><th>#</th><th>Vereda</th><th>Importes (M)</th></tr></thead><tbody>'+
 amounts.map(([name,sum],i)=>'<tr data-ti42m-top-place="'+esc(name)+'" tabindex="0" role="button" aria-label="Consultar vereda '+esc(name)+'"><td>'+String(i+1)+'</td><td>'+esc(uniqueVeredaName(name))+'</td><td>'+millions(sum)+'</td></tr>').join('')+
 '</tbody></table>':'<p class="ti42m-empty">No hay importes que puedan atribuirse a una sola vereda con los registros filtrados.</p>');
}
function renderAlerts(){
 const invalid=visible.filter(r=>finite(r.budget)&&finite(r.executedCost)&&r.executedCost>r.budget);
 const noVereda=visible.filter(r=>!placeKeys(r).length);
 const noPhotos=visible.filter(r=>!photos(r).length);
 const missingDate=visible.filter(r=>!r.start||!r.end);
 const alerts=[
 {level:'red',label:'Revisar relación de costos',desc:invalid.length+' registros superan costo total con ejecutado.',row:invalid[0]},
 {level:'orange',label:'Localización por precisar',desc:noVereda.length+' registros sin vereda identificable.',row:noVereda[0]},
 {level:'yellow',label:'Seguimiento documental',desc:noPhotos.length+' registros sin enlaces fotográficos.',row:noPhotos[0]},
 {level:'blue',label:'Fechas pendientes de verificar',desc:missingDate.length+' registros sin par completo de fechas.',row:missingDate[0]}
 ];
 set('[data-ti42m-alerts]',alerts.map((a,i)=>'<button type="button" class="ti42m-alert '+a.level+'" '+(a.row?'data-ti42m-alert-row="'+a.row.excelRow+'"':'disabled')+'><i>'+['!','2','!','i'][i]+'</i><span><strong>'+esc(a.label)+'</strong><small>'+esc(a.desc)+'</small></span></button>').join(''));
}
function refresh(){
 if(!loaded){
  set('[data-ti42m-kpis]','<p class="ti42m-empty">'+esc(loadError||'Cargando registros documentados…')+'</p>');
  return;
 }
 applyFilters();mapViewCount++;renderKpis();renderLegend();renderSuggestions();renderRecord();
 renderDonut();renderYears();renderTop();renderAlerts();
 if(geo)updateMapAreas();
 put('[data-ti42m-foot]','Fuente: hoja «Proyectos DEFINITIVO», Excel Unidad de Cumplimiento. Se muestran '+visible.length+' de '+rows.length+' filas con nombre, según filtros aplicados. La vereda es una referencia documental, no una coordenada certificada. Los importes y estados se reproducen del archivo, no acreditan ejecución ni contratos únicos.');
 keep();
}
function viewIfActive(){
 if(panel.hidden||section.hidden)return;
 if(loaded)refresh();
 requestAnimationFrame(()=>{mountMap();mountMini();mapApi?.invalidateSize?.();miniMap?.invalidateSize?.();});
}
panel.addEventListener('input',event=>{
 const search=event.target.closest('[data-ti42m-search]');
 if(search){state.search=search.value;state.vereda='all';state.category='all';refresh();}
});
panel.addEventListener('click',event=>{
 const suggestRow=event.target.closest('[data-ti42m-suggest-row]');
 if(suggestRow){selectRecord(suggestRow.dataset.ti42mSuggestRow);return;}
 const suggestPlace=event.target.closest('[data-ti42m-suggest-place]');
 if(suggestPlace){state.search='';q('[data-ti42m-search]').value='';selectVereda(suggestPlace.dataset.ti42mSuggestPlace);return;}
 const cat=event.target.closest('[data-ti42m-cat]');
 if(cat){setCategory(cat.dataset.ti42mCat);return;}
 const heat=event.target.closest('[data-ti42m-heat-place]');
 if(heat){selectVereda(heat.dataset.ti42mHeatPlace);return;}
 const top=event.target.closest('[data-ti42m-top-place]');
 if(top){selectVereda(top.dataset.ti42mTopPlace);return;}
 const alert=event.target.closest('[data-ti42m-alert-row]');
 if(alert){selectRecord(alert.dataset.ti42mAlertRow);return;}
 if(event.target.closest('[data-ti42m-unselect]')){state.selectedRow=-1;state.vereda='all';state.category='all';state.search='';q('[data-ti42m-search]').value='';refresh();mapApi?.fit?.();return;}
 if(event.target.closest('[data-ti42m-focus]')){focusSelected(true);mapApi?.invalidateSize?.();return;}
 const action=event.target.closest('[data-ti42m-action]');
 if(action&&selected){
  const id=selected.excelRow,kind=action.dataset.ti42mAction;
  if(kind==='contrato'){
    if(!window.TI42Contratos?.openContract?.(id))projects.openProject?.(id,'contratos');
  }else if(kind==='evidencias'){
    if(!window.TI42Evidencias?.openProject?.(id))projects.openProject?.(id,'evidencias');
  }else projects.openProject?.(id,'informacion');
  return;
 }
 const change=event.target.closest('[data-ti42m-photo]');
 if(change){const pic=photos(selected);if(pic.length){state.photo=(state.photo+Number(change.dataset.ti42mPhoto)+pic.length)%pic.length;drawGallery();}return;}
 if(event.target.closest('[data-ti42m-zoom]')){
  const pic=photos(selected),p=pic[state.photo];if(!p)return;
  set('[data-ti42m-lightbox-image]','<img alt="Fotografía '+esc(p.title)+' del proyecto" src="'+esc(p.url)+'">');
  q('[data-ti42m-lightbox]')?.showModal();return;
 }
 if(event.target.closest('[data-ti42m-lightbox-close]')){q('[data-ti42m-lightbox]')?.close();return;}
});
panel.addEventListener('keydown',event=>{
 if(!['Enter',' '].includes(event.key))return;
 const target=event.target.closest('[data-ti42m-top-place],[data-ti42m-heat-place]');
 if(target){event.preventDefault();target.click();}
});
panel.addEventListener('click',event=>{
 if(!event.target.closest('.ti42m-map-search'))q('[data-ti42m-suggestions]').hidden=true;
});
summary.onChange(snapshot=>{
 state.selectedRow=snapshot.selectedRow;
 rows=snapshot.rows||[];shared=snapshot.state||{};loaded=!!snapshot.loaded;loadError=snapshot.error||null;
 if(loaded){refresh();if(!panel.hidden)viewIfActive();}else if(!panel.hidden)refresh();
});
function initGeo(){
 if(geo||geoPending||!window.TISubachoqueMap)return;
 geoPending=true;
 window.TISubachoqueMap.getGeo('veredas').then(g=>{
  geo=g;geoPending=false;allVeredaKeys=g.features.map(f=>norm(window.TISubachoqueMap.featureName(f)));
  if(loaded)refresh();updateMapAreas();
 }).catch(()=>{geoPending=false;});
}
initGeo();
window.TI42Mapa={renderIfActive:viewIfActive,selectRecord,selectVereda,
 get loaded(){return loaded;},get error(){return loadError;},
 get filteredCount(){return visible.length;},get selectedRow(){return selected?.excelRow||null;},
 get renderCount(){return mapViewCount;}
};
projects.setView(projects.state.view);
})();