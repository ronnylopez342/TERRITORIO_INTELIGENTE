/* Territorio Inteligente · 4.2 Riesgos | Registro formal trazable
 * Las observaciones, pólizas, atrasos y ausencia de matrices NO se convierten en riesgos.
 * Fuente vacía hasta recibir fichas verificadas con identificador, procedencia y proyecto vinculable.
 */
(function TI42Riesgos(){
'use strict';
const section=document.querySelector('#cumplimiento-proyectos');
const shell=section?.querySelector('.ti42'),tabs=shell?.querySelector('.ti42-tabs');
const summary=window.TI42Summary,projects=window.TI42Proyectos;
if(!section||!shell||!tabs||!summary?.onChange||!projects?.setView)return;
const STORAGE='ti:uc42:riesgos:v1',PAGE_SIZE=10;
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=v=>String(v==null?'':v).replace(/\s+/g,' ').trim();
const norm=v=>clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const short=(v,max=50)=>{const s=clean(v);return esc(s.length>max?s.slice(0,max-1).trimEnd()+'…':s);};
const finite=v=>typeof v==='number'&&Number.isFinite(v);
const fmt=v=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:0}).format(v);
const iso=v=>typeof v==='string'&&/^\d{4}-\d\d-\d\d$/.test(v)&&!Number.isNaN(Date.parse(v+'T00:00:00Z'))?v:null;
const formatDate=v=>iso(v)?v.slice(8)+'/'+v.slice(5,7)+'/'+v.slice(0,4):'No registrada';
const safeURL=v=>{try{const u=new URL(clean(v));return u.protocol==='https:'&&u.hostname.includes('.')?u.href:null;}catch{return null;}};
const TYPES=[
 {id:'tecnico',label:'Técnicos',color:'#0e84eb'},
 {id:'financiero',label:'Financieros',color:'#079e66'},
 {id:'ambiental',label:'Ambientales',color:'#f4b515'},
 {id:'social',label:'Sociales',color:'#8656d6'},
 {id:'legal',label:'Legales',color:'#367fea'},
 {id:'institucional',label:'Institucionales',color:'#6d96bb'},
 {id:'otro',label:'Otros',color:'#2db9de'},
 {id:'sin',label:'Sin categoría',color:'#97a8b9'}
];
const LEVELS=[
 {id:'alto',label:'Alto',color:'#e9343e'},
 {id:'medio',label:'Medio',color:'#ffc017'},
 {id:'bajo',label:'Bajo',color:'#08a970'},
 {id:'sin',label:'Sin clasificar',color:'#98aabd'}
];
const STATUSES=[
 {id:'tratamiento',label:'En tratamiento',color:'#0b7ce5'},
 {id:'mitigado',label:'Mitigado',color:'#09a673'},
 {id:'sin_tratamiento',label:'Sin tratamiento',color:'#e83446'},
 {id:'cerrado',label:'Cerrado',color:'#8294a8'},
 {id:'sin',label:'Sin estado registrado',color:'#a2afbd'}
];
const icon={
 shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 2 21 6v6c0 6-4 9-9 11-5-2-9-5-9-11V6l9-4Z"/><path d="M12 7v7m0 4v.2" stroke-linecap="round"/></svg>',
 warning:'<svg viewBox="0 0 24 24" fill="none"><path d="M12 2 23 21H1L12 2Z" fill="currentColor"/><path d="M12 8v6m0 4v.2" stroke="#fff" stroke-width="2.8" stroke-linecap="round"/></svg>',
 check:'<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="currentColor"/><path d="m6 12 4 4 8-9" stroke="white" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 gears:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10.5 1 12 4l2 .8 3.1-1 2.4 2.4-1 3.1.8 2L22 12l-2.7 1.6-.8 2 1 3.1-2.4 2.4-3.1-1-2 .8L10.5 24H7.5L6 21l-2-.8-3.1 1L-1 18.7l1-3.1-.8-2L-3 12l2.8-1.7.8-2-1-3.1L1 2.8l3.1 1L6 3l1.5-2h3Zm-1.5 6a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z" transform="translate(3 0) scale(.72)"/><circle cx="17.5" cy="17.5" r="4.2"/></svg>',
 clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2" stroke-linecap="round"/></svg>',
 eye:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12S6 5.5 12 5.5 22 12 22 12s-4 6.5-10 6.5S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
 edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m4 16-.8 4.8L8 20l11-11-4-4L4 16Z"/><path d="m13 7 4 4"/></svg>',
 filter:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 4h18l-7 8v6l-4 2v-8L3 4Z"/></svg>',
 document:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 2h9l5 5v14H5V2Z"/><path d="M14 2v6h5M8 12h8m-8 4h8"/></svg>'
};
const iconEl=(name)=>icon[name]||icon.document;
const category=id=>TYPES.find(x=>x.id===id)||TYPES.at(-1);
const level=id=>LEVELS.find(x=>x.id===id)||LEVELS.at(-1);
const status=id=>STATUSES.find(x=>x.id===id)||STATUSES.at(-1);
let previous={};try{previous=JSON.parse(localStorage.getItem(STORAGE)||'{}')||{};}catch{}
const state={
 search:typeof previous.search==='string'?previous.search:'',
 project:typeof previous.project==='string'?previous.project:'all',
 category:TYPES.some(x=>x.id===previous.category)?previous.category:'all',
 severity:LEVELS.some(x=>x.id===previous.severity)?previous.severity:'all',
 status:STATUSES.some(x=>x.id===previous.status)?previous.status:'all',
 page:Math.max(1,Math.trunc(Number(previous.page)||1)),
 selectedId:typeof previous.selectedId==='string'?previous.selectedId:null
};
let source=[],shared={},ready=false,error=null,register=[],loadState='loading',loadError=null,ignored=0;
let scope=[],filtered=[],selected=null,renderCount=0,lastDialog=null;
const header=document.createElement('header');
header.dataset.ti42rHeader='1';header.className='ti42r-header';header.hidden=true;
header.innerHTML='<div class="ti42r-title"><span class="ti42r-title-icon" aria-hidden="true">'+iconEl('shield')+'</span><div><h2>Riesgos</h2>'+
 '<p>Gestión y seguimiento de los riesgos asociados a los proyectos estratégicos del municipio de Subachoque</p></div></div>'+
 '<div class="ti42r-meta"><span class="ti42r-calendar">▣</span><div><small>Actualización de fuente</small><strong>Sin fecha verificada</strong></div><em>Datos documentales</em></div>';
tabs.before(header);
const panel=document.createElement('section');panel.dataset.ti42rRoot='1';panel.className='ti42r';panel.hidden=true;
panel.innerHTML=[
 '<section class="ti42r-kpis" data-ti42r-kpis aria-label="Resumen de riesgos"></section>',
 '<section class="ti42r-charts">',
 '<article class="ti42r-card"><h3>◈ Riesgos por Categoría</h3><div data-ti42r-by-category></div></article>',
 '<article class="ti42r-card"><h3>▥ Riesgos por Nivel de Severidad</h3><div data-ti42r-by-severity></div></article>',
 '<article class="ti42r-card"><h3>◈ Estado de Tratamiento de Riesgos</h3><div data-ti42r-by-status></div></article>',
 '</section>',
 '<form class="ti42r-filters" data-ti42r-filters aria-label="Filtros de riesgos">',
 '<label class="ti42r-search"><span aria-hidden="true">⌕</span><input data-ti42r-search type="search" autocomplete="off" placeholder="Buscar riesgo por nombre, proyecto o categoría…" aria-label="Buscar riesgo"></label>',
 '<label>Proyecto<select data-ti42r-project aria-label="Filtrar proyecto"><option value="all">Todos los proyectos</option></select></label>',
 '<label>Categoría<select data-ti42r-category aria-label="Filtrar categoría"><option value="all">Todas</option></select></label>',
 '<label>Nivel de Severidad<select data-ti42r-severity aria-label="Filtrar nivel"><option value="all">Todos</option></select></label>',
 '<label>Estado<select data-ti42r-status aria-label="Filtrar estado"><option value="all">Todos</option></select></label>',
 '<button type="submit" class="ti42r-apply">'+iconEl('filter')+' Filtrar</button>',
 '<button type="button" data-ti42r-reset class="ti42r-reset">Limpiar</button></form>',
 '<section class="ti42r-main">',
 '<article class="ti42r-card ti42r-list">',
 '<h3>▦ Listado de Riesgos <span data-ti42r-list-total>(0)</span></h3>',
 '<div class="ti42r-table-wrap"><table class="ti42r-table"><thead><tr><th>#</th><th>Riesgo</th><th>Proyecto</th><th>Categoría</th><th>Nivel</th><th>Estado</th><th>Fecha de identificación</th><th>Acciones</th></tr></thead><tbody data-ti42r-rows></tbody></table></div>',
 '<div class="ti42r-pages"><small data-ti42r-range></small><nav data-ti42r-pages aria-label="Paginación de riesgos"></nav></div>',
 '</article>',
 '<aside class="ti42r-card ti42r-detail"><h3>♜ Detalle del Riesgo</h3><div data-ti42r-detail></div></aside>',
 '</section>',
 '<p class="ti42r-provenance" data-ti42r-provenance>Fuente: Excel «Proyectos DEFINITIVO». No se consideran riesgos formales las observaciones ni las pólizas.</p>',
 '<dialog class="ti42r-dialog" data-ti42r-dialog aria-label="Ficha e historial del riesgo"><div class="ti42r-dialog-header"><h3 data-ti42r-dialog-title>Historial</h3>'+
 '<button type="button" data-ti42r-dialog-close aria-label="Cerrar">×</button></div><div data-ti42r-dialog-body></div></dialog>',
].join('');
tabs.after(panel);
const q=s=>panel.querySelector(s),qa=s=>[...panel.querySelectorAll(s)];
const set=(s,markup)=>{const el=q(s);if(el)el.innerHTML=markup;};
const put=(s,value)=>{const el=q(s);if(el)el.textContent=String(value??'');};
function keep(){try{localStorage.setItem(STORAGE,JSON.stringify(state));}catch{}}
function rowFor(id){return source.find(r=>Number(r.excelRow)===Number(id))||null;}
const riskProjectRows=raw=>{
 const ids=[...(Array.isArray(raw.projectExcelRows)?raw.projectExcelRows:[])];
 if(raw.projectExcelRow!=null)ids.push(raw.projectExcelRow);
 return [...new Set(ids.map(Number).filter(n=>Number.isSafeInteger(n)&&n>0))];
};
function normalizeRisk(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||raw.verified!==true)return null;
 const id=clean(raw.riskId),title=clean(raw.title),src=clean(raw.source);
 if(!id||!title||!src||id.length>200)return null;
 const linkedRows=riskProjectRows(raw);
 const cat=TYPES.some(x=>x.id===raw.category)?raw.category:'sin';
 const sev=LEVELS.some(x=>x.id===raw.severity)?raw.severity:'sin';
 const st=STATUSES.some(x=>x.id===raw.treatmentStatus)?raw.treatmentStatus:'sin';
 const plan=raw.mitigationPlan&&typeof raw.mitigationPlan==='object'&&!Array.isArray(raw.mitigationPlan)?raw.mitigationPlan:null;
 const actions=Array.isArray(plan?.actions)?plan.actions.filter(a=>a&&typeof a==='object'&&clean(a.description)).map(a=>({
  description:clean(a.description),responsible:clean(a.responsible),deadline:iso(a.deadline),status:clean(a.status)
 })):[];
 const planApproved=plan?.verified===true&&!!clean(plan.source)&&actions.length>0;
 const history=Array.isArray(raw.history)?raw.history.filter(h=>h&&typeof h==='object'&&iso(h.date)&&clean(h.description)&&clean(h.source)).map(h=>({
  date:iso(h.date),description:clean(h.description),source:clean(h.source),responsible:clean(h.responsible),
  oldStatus:STATUSES.some(x=>x.id===h.oldStatus)?h.oldStatus:null,
  newStatus:STATUSES.some(x=>x.id===h.newStatus)?h.newStatus:null,
  oldSeverity:LEVELS.some(x=>x.id===h.oldSeverity)?h.oldSeverity:null,
  newSeverity:LEVELS.some(x=>x.id===h.newSeverity)?h.newSeverity:null,
  evidenceUrl:safeURL(h.evidenceUrl)
 })).sort((a,b)=>a.date.localeCompare(b.date)):[];
 return {riskId:id,title,description:clean(raw.description),projectRows:linkedRows,
  projectId:clean(raw.projectId),contractId:clean(raw.contractId),category:cat,severity:sev,treatmentStatus:st,
  probability:typeof raw.probability==='number'||typeof raw.probability==='string'?clean(raw.probability):'',
  impact:typeof raw.impact==='number'||typeof raw.impact==='string'?clean(raw.impact):'',
  identifiedAt:iso(raw.identifiedAt),responsible:clean(raw.responsible),source:src,sourceUrl:safeURL(raw.sourceUrl),
  mitigationPlan:planApproved?{description:clean(plan.description),source:clean(plan.source),sourceUrl:safeURL(plan.sourceUrl),
    responsible:clean(plan.responsible),actions}:null,
  targetClosureDate:iso(raw.targetClosureDate),actualClosureDate:iso(raw.actualClosureDate),lastReviewedAt:iso(raw.lastReviewedAt),
  evidenceIds:Array.isArray(raw.evidenceIds)?raw.evidenceIds.map(clean).filter(Boolean):[],history,
  observations:clean(raw.observations),territoryVereda:clean(raw.territoryVereda),metaId:clean(raw.metaId),
  recordedCategory:clean(raw.category),recordedStatus:clean(raw.treatmentStatus),
  sourceKind:'verified_catalog'};
}
async function loadCatalogue(){
 try{
  const response=await fetch('data/uc42-riesgos-verificados.json?v=20261109-riesgos-v1',{cache:'no-cache'});
  if(!response.ok)throw Error('El catálogo de riesgos no está disponible (HTTP '+response.status+')');
  const data=await response.json();
  if(!data||data.schema!=='ti-uc42-risks-v1'||!Array.isArray(data.risks))throw Error('Catálogo de riesgos con esquema inválido');
  const validRisks=[],ids=new Set();let omitted=0;
  for(const raw of data.risks){
   const risk=normalizeRisk(raw);
   if(!risk||ids.has(risk.riskId)){omitted++;continue;}
   ids.add(risk.riskId);validRisks.push(risk);
  }
  register=validRisks;ignored=omitted;loadState='ready';loadError=null;
  const lastUpdate=iso(data.sourceUpdatedAt);
  const dateNode=header.querySelector('.ti42r-meta strong');
  if(dateNode)dateNode.textContent=lastUpdate?formatDate(lastUpdate):'Sin fecha verificada';
 }catch(err){loadState='error';loadError=err?.message||'Error al consultar riesgos';register=[];ignored=0;}
 if(!panel.hidden)render();
}
function projectMatchesGlobal(r){
 return window.TI42Summary.matches(r);
}
function filterScope(){
 const constraint=['meta','year','status','sector'].some(k=>shared[k]&&shared[k]!=='all');
 return register.filter(r=>{
  const joined=r.projectRows.map(rowFor).filter(Boolean);
  if(constraint&&(joined.length===0||!joined.some(projectMatchesGlobal)))return false;
  if(shared.q){
   const sought=norm(shared.q);
   const search=norm([r.riskId,r.title,r.description,r.contractId,r.category,r.responsible,
      ...joined.flatMap(p=>[p.name,p.bpin,p.contract,p.vereda,p.sectorMGA])].join(' '));
   if(!search.includes(sought))return false;
  }
  return true;
 });
}
function filterLocal(){
 scope=filterScope();
 filtered=scope.filter(r=>{
  if(state.project!=='all'&&!r.projectRows.some(n=>String(n)===state.project))return false;
  if(state.category!=='all'&&r.category!==state.category)return false;
  if(state.severity!=='all'&&r.severity!==state.severity)return false;
  if(state.status!=='all'&&r.treatmentStatus!==state.status)return false;
  if(state.search){
   const joined=r.projectRows.map(rowFor).filter(Boolean);
   const hay=norm([r.riskId,r.title,r.description,r.contractId,r.category,r.responsible,r.source,
     ...joined.flatMap(p=>[p.name,p.bpin,p.contract])].join(' '));
   if(!hay.includes(norm(state.search)))return false;
  }
  return true;
 });
 const maxPage=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
 state.page=Math.max(1,Math.min(maxPage,state.page));
 if(!filtered.some(r=>r.riskId===state.selectedId))state.selectedId=filtered[0]?.riskId||null;
 selected=filtered.find(r=>r.riskId===state.selectedId)||null;
}
function count(key,val){return filtered.filter(x=>x[key]===val).length;}
const frac=(value,total)=>total?Math.round(value/total*100):0;
function exactChartPercentages(groups,total){
 if(!total)return new Map(groups.map(g=>[g.id,0]));
 const parts=groups.map((g,i)=>{const precise=g.count/total*100;return {id:g.id,i,whole:Math.floor(precise),remainder:precise-Math.floor(precise)};});
 const remaining=Math.max(0,100-parts.reduce((s,p)=>s+p.whole,0));
 parts.slice().sort((a,b)=>b.remainder-a.remainder||a.i-b.i).slice(0,remaining).forEach(p=>p.whole++);
 return new Map(parts.map(p=>[p.id,p.whole]));
}
function kpi(kind,label,value,sub,ic){
 return '<article class="ti42r-kpi '+kind+'"><span class="ti42r-kpi-icon">'+iconEl(ic)+'</span>'+
  '<div><small>'+esc(label)+'</small><strong>'+esc(value)+'</strong><em>'+esc(sub)+'</em></div></article>';
}
function renderKpis(){
 if(loadState!=='ready'||!register.length){
  const message=loadState==='error'?'Fuente no disponible':loadState==='ready'?'Sin información registrada':'Cargando catálogo';
  set('[data-ti42r-kpis]',[
   kpi('blue','Total de Riesgos','—',message,'shield'),kpi('red','Riesgos Altos','—',message,'warning'),
   kpi('amber','Riesgos Medios','—',message,'warning'),kpi('green','Riesgos Bajos','—',message,'check'),
   kpi('muted','Riesgos con Plan de Mitigación','—',message,'gears')].join(''));
  return;
 }
 const total=filtered.length;
 const high=count('severity','alto'),middle=count('severity','medio'),low=count('severity','bajo');
 const plans=filtered.filter(x=>x.mitigationPlan!==null).length;
 set('[data-ti42r-kpis]',[
  kpi('blue','Total de Riesgos',fmt(total),'Documentados en la selección','shield'),
  kpi('red','Riesgos Altos',fmt(high),frac(high,total)+'% del total','warning'),
  kpi('amber','Riesgos Medios',fmt(middle),frac(middle,total)+'% del total','warning'),
  kpi('green','Riesgos Bajos',fmt(low),frac(low,total)+'% del total','check'),
  kpi('muted','Riesgos con Plan de Mitigación',fmt(plans),frac(plans,total)+'% del total','gears')
 ].join(''));
}
function donut(groups,key,label,total){
 const percentages=exactChartPercentages(groups,total);
 let cursor=0;
 const colored=groups.filter(g=>g.count>0).map(g=>{
  const a=cursor;cursor+=g.count/total*100;return g.color+' '+a.toFixed(2)+'% '+cursor.toFixed(2)+'%';
 });
 const circle=colored.length?'conic-gradient('+colored.join(',')+')':'conic-gradient(#dbe5ed 0 100%)';
 return '<div class="ti42r-donut-body"><div class="ti42r-donut" style="background:'+circle+'"><div><strong>'+total+'</strong><span>Total</span></div></div>'+
  '<div class="ti42r-donut-legend">'+groups.map(g=>
   '<button type="button" data-ti42r-chart-'+key+'="'+g.id+'" aria-pressed="'+(state[key]===g.id)+'" title="'+esc(g.label+' · '+g.count+' ('+percentages.get(g.id)+'%)')+'">'+
   '<i style="background:'+g.color+'"></i><span>'+esc(g.label)+'</span><b>'+percentages.get(g.id)+'% ('+g.count+')</b></button>').join('')+
   '</div></div>';
}
function drawCategories(){
 const total=filtered.length,groups=TYPES.filter(x=>x.id!=='sin'||count('category','sin')>0).map(x=>({...x,count:count('category',x.id)}));
 set('[data-ti42r-by-category]',donut(groups,'category','Categoría',total));
}
function drawStatus(){
 const total=filtered.length,groups=STATUSES.filter(x=>x.id!=='sin'||count('treatmentStatus','sin')>0).map(x=>({...x,count:count('treatmentStatus',x.id)}));
 // Estado del tratamiento es una dimensión independiente de la severidad.
 set('[data-ti42r-by-status]',donut(groups,'status','Tratamiento',total));
}
function drawSeverity(){
 const levels=LEVELS.filter(l=>l.id!=='sin'||count('severity','sin')>0);
 const counts=levels.map(l=>count('severity',l.id));
 const max=Math.max(1,...counts),step=Math.max(1,Math.ceil(max/4)),axisTop=step*4;
 set('[data-ti42r-by-severity]','<div class="ti42r-bars"><div class="ti42r-bars-axis">'+[4,3,2,1,0].map(i=>'<span>'+step*i+'</span>').join('')+'</div>'+
  '<div class="ti42r-bars-body"><div class="ti42r-bar-grid">'+[0,1,2,3,4].map(()=>'<i></i>').join('')+'</div>'+
  '<div class="ti42r-bar-columns">'+levels.map((lv,i)=>{
   const n=counts[i],height=n/axisTop*100;
   return '<button type="button" data-ti42r-chart-severity="'+lv.id+'" aria-pressed="'+(state.severity===lv.id)+'" title="'+esc(lv.label)+' · '+n+' riesgos">'+
    '<div class="ti42r-bar-container"><strong>'+n+'</strong><i style="height:'+height.toFixed(2)+'%;background:'+lv.color+'"></i></div>'+
    '<small>'+esc(lv.label)+'</small></button>';
  }).join('')+'</div></div><span class="ti42r-axis-caption">Número de riesgos</span></div>');
}
function renderCharts(){if(!register.length){for(const key of ['category','severity','status'])set('[data-ti42r-by-'+key+']','<p class="ti42r-empty-row">Sin información registrada. El catálogo está pendiente de diligenciar.</p>');return;}drawCategories();drawSeverity();drawStatus();}
function choices(){
 const allProjects=new Map();
 for(const row of source){if(clean(row.name))allProjects.set(String(row.excelRow),row.name);}
 if(state.project!=='all'&&!allProjects.has(state.project))state.project='all';
 q('[data-ti42r-project]').innerHTML='<option value="all">Todos los proyectos</option>'+
  [...allProjects].sort((a,b)=>a[1].localeCompare(b[1],'es')).map(([id,name])=>
   '<option value="'+id+'">'+short(name,52)+'</option>').join('');
 q('[data-ti42r-category]').innerHTML='<option value="all">Todas</option>'+TYPES.map(g=>'<option value="'+g.id+'">'+esc(g.label)+'</option>').join('');
 q('[data-ti42r-severity]').innerHTML='<option value="all">Todos</option>'+LEVELS.map(g=>'<option value="'+g.id+'">'+esc(g.label)+'</option>').join('');
 q('[data-ti42r-status]').innerHTML='<option value="all">Todos</option>'+STATUSES.map(g=>'<option value="'+g.id+'">'+esc(g.label)+'</option>').join('');
 q('[data-ti42r-search]').value=state.search;
 q('[data-ti42r-project]').value=state.project;
 q('[data-ti42r-category]').value=state.category;
 q('[data-ti42r-severity]').value=state.severity;
 q('[data-ti42r-status]').value=state.status;
}
function levelChip(id){const l=level(id);return '<span class="ti42r-dot-label '+id+'"><i style="background:'+l.color+'"></i>'+esc(l.label)+'</span>';}
function statusChip(id){const s=status(id);return '<span class="ti42r-dot-label '+id+'"><i style="background:'+s.color+'"></i>'+esc(s.label)+'</span>';}
function projectFor(r){
 const list=r.projectRows.map(rowFor).filter(Boolean);
 return list[0]||null;
}
function table(){
 put('[data-ti42r-list-total]','('+filtered.length+')');
 const start=(state.page-1)*PAGE_SIZE,part=filtered.slice(start,start+PAGE_SIZE);
 const html=part.map((r,i)=>{
  const p=projectFor(r),name=p?.name||'Sin proyecto vinculado',isCurrent=selected?.riskId===r.riskId;
  return '<tr'+(isCurrent?' class="selected"':'')+'>'+
   '<td>'+(start+i+1)+'</td>'+
   '<td><button type="button" class="ti42r-name" title="'+esc(r.title)+'" data-ti42r-select="'+esc(r.riskId)+'">'+short(r.title,62)+'</button></td>'+
   '<td title="'+esc(name)+'">'+short(name,53)+'</td>'+
   '<td>'+esc(category(r.category).label)+'</td>'+
   '<td>'+levelChip(r.severity)+'</td>'+
   '<td>'+statusChip(r.treatmentStatus)+'</td>'+
   '<td>'+esc(formatDate(r.identifiedAt))+'</td>'+
   '<td><div class="ti42r-actions">'+
   '<button type="button" title="Ver detalle" aria-label="Ver riesgo '+esc(r.riskId)+'" data-ti42r-select="'+esc(r.riskId)+'">'+iconEl('eye')+'</button>'+
   '<button type="button" disabled title="Edición no disponible: no hay backend institucional autorizado" aria-label="Edición no disponible">'+iconEl('edit')+'</button>'+
   '<details class="ti42r-menu"><summary aria-label="Más acciones">⋮</summary><div>'+
   '<button type="button" data-ti42r-full="'+esc(r.riskId)+'">Ver ficha ampliada</button>'+
   '<button type="button" data-ti42r-history="'+esc(r.riskId)+'">Historial de seguimiento</button>'+
   (p?'<button type="button" data-ti42r-project-link="'+p.excelRow+'">Consultar proyecto</button>':'')+
   '<button type="button" data-ti42r-plan="'+esc(r.riskId)+'">Consultar mitigación</button>'+
   '<button type="button" data-ti42r-copy="'+esc(r.riskId)+'">Copiar identificador</button>'+
   '</div></details></div></td></tr>';
 }).join('');
 let emptyMessage='No hay riesgos documentados para los filtros seleccionados.';
 if(loadState==='error')emptyMessage='No se pudo consultar el catálogo de riesgos. Comprueba la fuente antes de interpretar los totales.';
 else if(loadState==='loading'||!ready)emptyMessage='Consultando las fichas de riesgos…';
 else if(register.length===0)emptyMessage='El Excel no contiene riesgos clasificados. El catálogo institucional está pendiente de diligenciar.';
 set('[data-ti42r-rows]',html||'<tr><td colspan="8" class="ti42r-empty-row"><div>'+iconEl('shield')+'<strong>'+esc(emptyMessage)+'</strong><small>Las observaciones y las pólizas no se registran como riesgos identificados.</small></div></td></tr>');
 const N=filtered.length,pages=Math.max(1,Math.ceil(N/PAGE_SIZE));
 put('[data-ti42r-range]',N?'Mostrando '+(start+1)+'–'+Math.min(N,start+PAGE_SIZE)+' de '+N+' riesgos':'Mostrando 0 de 0 riesgos documentados');
 function button(page,label,disabled=false,active=false){
  return '<button type="button" '+(disabled?'disabled':'data-ti42r-page="'+page+'"')+' '+(active?'aria-current="page" class="active"':'')+'>'+esc(label)+'</button>';
 }
 let paging=button(1,'«',state.page===1)+button(Math.max(1,state.page-1),'‹',state.page===1);
 const from=Math.max(1,Math.min(pages-3,state.page-1)),to=Math.min(pages,from+3);
 for(let n=from;n<=to;n++)paging+=button(n,String(n),false,n===state.page);
 paging+=button(Math.min(pages,state.page+1),'›',state.page===pages)+button(pages,'»',state.page===pages);
 set('[data-ti42r-pages]',paging);
}
const info=(name,value)=>'<div><dt>'+esc(name)+'</dt><dd>'+esc(value===null||value===undefined||String(value).trim()===''?'No registrado':value)+'</dd></div>';
function detail(){
 const r=selected,p=r?projectFor(r):null,empty=!r;
 const title=empty?'Sin riesgos documentados':r.title;
 const project=empty?'No hay un riesgo seleccionado':(p?p.name:(r.projectId?'ID documental: '+r.projectId:'Sin proyecto vinculado'));
 const type=empty?'No registrada':category(r.category).label;
 const lvl=empty?'Sin clasificar':level(r.severity).label;
 const stateName=empty?'Sin registrar':status(r.treatmentStatus).label;
 const badge=empty?'<span class="ti42r-risk-badge sin">Sin registro</span>':'<span class="ti42r-risk-badge '+r.severity+'">'+esc(lvl)+'</span>';
 const heading='<div class="ti42r-detail-title"><span class="ti42r-detail-alert">'+iconEl('warning')+'</span><div><strong>'+esc(title)+'</strong><small>Proyecto: '+short(project,68)+'</small></div>'+badge+'</div>';
 const description=empty?'El Excel no contiene riesgos identificados en su dimensión de riesgos y alertas tempranas.':(r.description||'No registrada');
 const details='<div class="ti42r-detail-box"><small>Descripción</small><p>'+esc(description)+'</p></div>'+
 '<div class="ti42r-detail-duo">'+info('Categoría',type)+info('Fecha de identificación',empty?'No registrada':formatDate(r.identifiedAt))+'</div>'+
 '<div class="ti42r-detail-trip">'+info('Probabilidad',empty?'No registrada':(r.probability||'No registrada'))+
 info('Impacto',empty?'No registrado':(r.impact||'No registrado'))+
 '<div class="ti42r-severity-box '+(empty?'sin':r.severity)+'">'+info('Nivel de Severidad',lvl)+'</div></div>'+
 '<div class="ti42r-detail-duo">'+info('Estado',stateName)+info('Responsable',empty?'No registrado':(r.responsible||'No registrado'))+'</div>'+
 '<div class="ti42r-detail-box"><small>Plan de Mitigación</small><p>'+
 esc(empty?'No existen planes asociados a riesgos verificados.':r.mitigationPlan?(r.mitigationPlan.description||r.mitigationPlan.actions[0]?.description||'Acciones documentadas; consultar la ficha.'):'Sin plan de mitigación acreditado')+
 '</p></div>'+
 '<div class="ti42r-detail-box"><small>Fecha estimada de cierre</small><p>'+esc(empty?'No registrada':formatDate(r.targetClosureDate))+'</p></div>';
 const buttons=r?'<div class="ti42r-detail-links">'+
 (p?'<button type="button" data-ti42r-project-link="'+p.excelRow+'">Ver proyecto ↗</button>':'')+
 (r.contractId&&p?.contract&&norm(r.contractId)===norm(p.contract)?'<button type="button" data-ti42r-contract-link="'+p.excelRow+'">Ver contrato ↗</button>':'')+
 (r.territoryVereda?'<button type="button" data-ti42r-territory="'+esc(r.territoryVereda)+'" title="Vereda informada para el riesgo; no equivale a coordenada de obra">Ver territorio ↗</button>':'')+
 (r.evidenceIds.length&&p?'<button type="button" data-ti42r-evidence-link="'+p.excelRow+'">Referencias del proyecto ↗</button>':'')+
 '</div>':'';
 set('[data-ti42r-detail]',heading+details+buttons+
 '<button type="button" class="ti42r-history-button" '+(!r?'disabled title="Sin riesgos documentados"':'data-ti42r-history="'+esc(r.riskId)+'"')+
 '>'+iconEl('clock')+' Ver historial de seguimiento</button>');
}
function render(){
 if(!ready&&loadState==='loading')return;
 if(loadState==='ready')filterLocal();else {scope=[];filtered=[];selected=null;}
 renderCount++;renderKpis();renderCharts();choices();table();detail();
 const label='Fuente: UNIDAD DE CUMPLIMIENTO.xlsx · Proyectos DEFINITIVO · columnas «Riesgos identificados», «Probabilidad», «Impacto», «Nivel de Riesgo», «Alertas Tempranas» y «Semaforización» sin registros. ';
 put('[data-ti42r-provenance]',label+(loadState==='error'?'ERROR: '+loadError+'.':register.length+' fichas verificadas en catálogo. ')+(ignored?' Se excluyeron '+ignored+' registros sin identidad o fuente verificable. ':'')+'Observaciones, pólizas y referencias SECOP no acreditan un riesgo formal.');
 keep();
}
function readFilters(){
 state.search=q('[data-ti42r-search]').value;
 state.project=q('[data-ti42r-project]').value;
 state.category=q('[data-ti42r-category]').value;
 state.severity=q('[data-ti42r-severity]').value;
 state.status=q('[data-ti42r-status]').value;
 state.page=1;render();
}
function reset(){
 Object.assign(state,{search:'',project:'all',category:'all',severity:'all',status:'all',page:1,selectedId:null});
 render();
}
function select(id){
 const found=filtered.find(x=>x.riskId===id);
 if(!found)return;
 state.selectedId=id;state.page=Math.floor(filtered.indexOf(found)/PAGE_SIZE)+1;
 table();detail();keep();
}
function modal(id,kind){
 const r=register.find(x=>x.riskId===id);
 if(!r)return;
 const dialog=q('[data-ti42r-dialog]');lastDialog=kind;
 const link=r.sourceUrl?'<a href="'+esc(r.sourceUrl)+'" target="_blank" rel="noopener noreferrer">Consultar fuente original ↗</a>':'';
 if(kind==='history'){
  put('[data-ti42r-dialog-title]','Historial de seguimiento · '+r.riskId);
  set('[data-ti42r-dialog-body]',r.history.length?
   '<ol class="ti42r-history-list">'+r.history.map(h=>
    '<li><strong>'+esc(formatDate(h.date))+'</strong><p>'+esc(h.description)+'</p>'+
    '<small>Responsable: '+esc(h.responsible||'No registrado')+' · Fuente: '+esc(h.source)+'</small>'+
    (h.oldStatus&&h.newStatus?'<small>Estado: '+esc(status(h.oldStatus).label)+' → '+esc(status(h.newStatus).label)+'</small>':'')+
    (h.oldSeverity&&h.newSeverity?'<small>Severidad: '+esc(level(h.oldSeverity).label)+' → '+esc(level(h.newSeverity).label)+'</small>':'')+
    (h.evidenceUrl?'<a href="'+esc(h.evidenceUrl)+'" target="_blank" rel="noopener noreferrer">Evidencia relacionada ↗</a>':'')+
    '</li>').join('')+'</ol>':'<p class="ti42r-dialog-empty">Sin seguimientos registrados para este riesgo. No se generan movimientos de demostración.</p>');
 }else if(kind==='mitigation'){
  put('[data-ti42r-dialog-title]','Plan de mitigación · '+r.riskId);
  const p=r.mitigationPlan;
  set('[data-ti42r-dialog-body]',p?'<p>'+esc(p.description||'Plan documentado sin resumen.')+'</p>'+
   '<div class="ti42r-modal-facts">'+info('Responsable del plan',p.responsible)+info('Fuente del plan',p.source)+'</div>'+
   '<ol class="ti42r-history-list">'+p.actions.map(a=>'<li><strong>'+esc(a.description)+'</strong>'+
    '<p>Responsable: '+esc(a.responsible||'No registrado')+'</p>'+
    '<small>Fecha objetivo: '+esc(formatDate(a.deadline))+' · Estado: '+esc(a.status||'Sin registrar')+'</small></li>').join('')+'</ol>'+
   (p.sourceUrl?'<a href="'+esc(p.sourceUrl)+'" target="_blank" rel="noopener noreferrer">Abrir plan original ↗</a>':''):
   '<p class="ti42r-dialog-empty">No existe un plan de mitigación verificable asociado a esta ficha.</p>');
 }else{
  put('[data-ti42r-dialog-title]','Ficha del riesgo · '+r.riskId);
  const p=projectFor(r);
  const fields=[['Identificador',r.riskId],['Riesgo',r.title],['Descripción',r.description],
   ['Proyecto',p?.name||r.projectId||null],['Contrato asociado',r.contractId],['Categoría',category(r.category).label],
   ['Probabilidad',r.probability],['Impacto',r.impact],['Severidad',level(r.severity).label],
   ['Estado de tratamiento',status(r.treatmentStatus).label],['Identificado',formatDate(r.identifiedAt)],
   ['Responsable',r.responsible],['Vereda del riesgo',r.territoryVereda],['Meta relacionada (declarada)',r.metaId],
   ['Cierre programado',formatDate(r.targetClosureDate)],
   ['Cierre real',formatDate(r.actualClosureDate)],['Última revisión',formatDate(r.lastReviewedAt)],
   ['Fuente documental',r.source],['Observaciones',r.observations],
   ['Seguimientos disponibles',r.history.length],['Plan de mitigación documentado',r.mitigationPlan?'Sí':'No']];
  set('[data-ti42r-dialog-body]','<dl class="ti42r-modal-facts">'+fields.map(([k,v])=>info(k,v)).join('')+'</dl>'+
   (r.mitigationPlan?'<button type="button" data-ti42r-plan="'+esc(r.riskId)+'">Consultar plan de mitigación</button>':'')+
   '<button type="button" data-ti42r-history="'+esc(r.riskId)+'">Ver historial de seguimiento</button>'+link);
 }
 if(!dialog.open)dialog.showModal?.();
}
function openProject(row){
 const project=rowFor(row);
 if(!project)return false;
 Object.assign(state,{project:String(project.excelRow),search:'',category:'all',severity:'all',status:'all',page:1,selectedId:null});
 projects.setView('riesgos');render();return true;
}
function openRisk(riskId){
 const candidate=register.find(r=>r.riskId===riskId);
 if(!candidate)return false;
 Object.assign(state,{project:'all',search:'',category:'all',severity:'all',status:'all',page:1,selectedId:riskId});
 projects.setView('riesgos');render();return !!selected;
}
panel.addEventListener('click',event=>{
 const target=event.target;
 const row=target.closest('[data-ti42r-select]');if(row){select(row.dataset.ti42rSelect);return;}
 const c=target.closest('[data-ti42r-chart-category]');if(c){state.category=state.category===c.dataset.ti42rChartCategory?'all':c.dataset.ti42rChartCategory;state.page=1;render();return;}
 const s=target.closest('[data-ti42r-chart-severity]');if(s){state.severity=state.severity===s.dataset.ti42rChartSeverity?'all':s.dataset.ti42rChartSeverity;state.page=1;render();return;}
 const st=target.closest('[data-ti42r-chart-status]');if(st){state.status=state.status===st.dataset.ti42rChartStatus?'all':st.dataset.ti42rChartStatus;state.page=1;render();return;}
 const page=target.closest('[data-ti42r-page]');if(page){state.page=Number(page.dataset.ti42rPage);table();keep();return;}
 if(target.closest('[data-ti42r-reset]')){reset();return;}
 const project=target.closest('[data-ti42r-project-link]');if(project){projects.openProject?.(Number(project.dataset.ti42rProjectLink),'informacion');q('[data-ti42r-dialog]')?.close?.();return;}
 const contract=target.closest('[data-ti42r-contract-link]');if(contract){
  const row=Number(contract.dataset.ti42rContractLink),p=rowFor(row);
  if(p?.contract&&selected?.contractId&&norm(p.contract)===norm(selected.contractId))window.TI42Contratos?.openContract?.(row);
  q('[data-ti42r-dialog]')?.close?.();return;
 }
 const territory=target.closest('[data-ti42r-territory]');if(territory){projects.setView('mapa');window.TI42Mapa?.selectVereda?.(territory.dataset.ti42rTerritory);q('[data-ti42r-dialog]')?.close?.();return;}
 const evidence=target.closest('[data-ti42r-evidence-link]');if(evidence){window.TI42Evidencias?.openProject?.(Number(evidence.dataset.ti42rEvidenceLink));q('[data-ti42r-dialog]')?.close?.();return;}
 const full=target.closest('[data-ti42r-full]');if(full){modal(full.dataset.ti42rFull,'full');return;}
 const history=target.closest('[data-ti42r-history]');if(history){modal(history.dataset.ti42rHistory,'history');return;}
 const plan=target.closest('[data-ti42r-plan]');if(plan){modal(plan.dataset.ti42rPlan,'mitigation');return;}
 const copy=target.closest('[data-ti42r-copy]');if(copy){
  if(navigator.clipboard?.writeText){const btn=copy;navigator.clipboard.writeText(copy.dataset.ti42rCopy).then(()=>{btn.textContent='Copiado';}).catch(()=>{});}
  return;
 }
 if(target.closest('[data-ti42r-dialog-close]')){q('[data-ti42r-dialog]')?.close?.();return;}
});
q('[data-ti42r-filters]').addEventListener('submit',event=>{event.preventDefault();readFilters();});
panel.addEventListener('input',event=>{
 if(event.target.matches('[data-ti42r-search]')){state.search=event.target.value;state.page=1;render();}
});
panel.addEventListener('change',event=>{
 if(event.target.matches('[data-ti42r-project],[data-ti42r-category],[data-ti42r-severity],[data-ti42r-status]'))readFilters();
});
summary.onChange(snapshot=>{
 source=snapshot.rows||[];shared=snapshot.state||{};ready=!!snapshot.loaded;error=snapshot.error||null;
 if(!panel.hidden){if(loadState==='ready'||loadState==='error')render();else renderKpis();}
});
loadCatalogue();
function renderIfActive(){if(panel.hidden||section.hidden)return;render();}
window.TI42Riesgos={renderIfActive,openProject,openRisk,
 get loaded(){return ready&&loadState==='ready';},get risksTotal(){return register.length;},
 get risksInScope(){return scope.length;},get filteredCount(){return filtered.length;},
 get documentedPlans(){return register.filter(x=>x.mitigationPlan).length;},
 get selectedId(){return selected?.riskId||null;},get error(){return error||loadError;},
 get renderCount(){return renderCount;}
};
projects.setView?.(projects.state.view);
})();