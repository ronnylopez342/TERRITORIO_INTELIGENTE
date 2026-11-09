/* TI · Unidad de Cumplimiento · 4.2 Indicadores. Fuente real y fichas explícitas. */
(function TI42Indicadores(){
'use strict';
const section=document.querySelector('#cumplimiento-proyectos');
const shell=section?.querySelector('.ti42'),tabs=shell?.querySelector('.ti42-tabs');
const summary=window.TI42Summary,projects=window.TI42Proyectos;
if(!section||!shell||!tabs||!summary?.onChange||!projects?.setView)return;
const STORE='ti:uc42:indicadores:v1',PAGE=10;
const htmlEsc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').toLowerCase().trim();
const str=v=>String(v==null?'':v).replace(/\s+/g,' ').trim();
const brief=(v,max=49)=>{const s=str(v);return htmlEsc(s.length>max?s.slice(0,max-1).trimEnd()+'…':s);};
const number=v=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:1}).format(v);
const valid=v=>typeof v==='number'&&Number.isFinite(v);
const cap=v=>Math.max(0,Math.min(100,valid(v)?v:0));
const pct=v=>valid(v)?number(v)+' %':'Sin medición';
const safeUrl=v=>{try{const u=new URL(str(v));return u.protocol==='https:'?u.href:null;}catch{return null;}};
const date=v=>/^\d{4}-\d\d-\d\d$/.test(v||'')?v.slice(8)+'/'+v.slice(5,7)+'/'+v.slice(0,4):'Sin fecha verificada';
const STATUS=[
 {id:'cumplido',name:'Cumplidos',color:'#0fa474'},
 {id:'riesgo',name:'En riesgo',color:'#f2b313'},
 {id:'critico',name:'Críticos',color:'#e43b49'},
 {id:'sin',name:'Sin medición',color:'#98a8b9'}
];
let old={};try{old=JSON.parse(localStorage.getItem(STORE)||'{}')||{};}catch{}
const state={
 mode:['metas','indicadores'].includes(old.mode)?old.mode:'metas',
 search:typeof old.search==='string'?old.search:'',
 line:typeof old.line==='string'?old.line:'all',
 program:typeof old.program==='string'?old.program:'all',
 status:STATUS.some(s=>s.id===old.status)?old.status:'all',
 period:typeof old.period==='string'?old.period:'all',
 page:Math.max(1,Math.trunc(Number(old.page)||1)),
 selectedKey:typeof old.selectedKey==='string'?old.selectedKey:null
};
let rows=[],shared={},loaded=false,sourceError=null,official=[],officialMeta={},relatedMetas=[],visible=[],filtered=[],active=null,renderCount=0,verifiedLoaded=false,verifiedError=null,verifiedExtra={};
const heading=document.createElement('header');
heading.className='ti42i-heading';
heading.dataset.ti42iHead='1';heading.hidden=true;
heading.innerHTML='<div class="ti42i-heading-text"><span class="ti42i-heading-icon">▥</span><div><h2>Indicadores</h2>'+
 '<p>Seguimiento al cumplimiento de los indicadores del Plan de Desarrollo del municipio de Subachoque</p></div></div>'+
 '<div class="ti42i-status-head"><span class="ti42i-status-head-icon">▣</span><div><strong>Fuente documental</strong><small>Excel Unidad de Cumplimiento · sin fecha verificada de actualización</small></div><em>Datos estáticos</em></div>';
tabs.before(heading);
const panel=document.createElement('section');panel.dataset.ti42iRoot='1';panel.className='ti42i';panel.hidden=true;
panel.innerHTML=[
 '<div class="ti42i-kpis" data-ti42i-kpis aria-label="Indicadores generales"></div>',
 '<div class="ti42i-charts">',
 '<article class="ti42i-card"><h3>▥ Cumplimiento de Indicadores por Línea Estratégica</h3><div data-ti42i-lines></div></article>',
 '<article class="ti42i-card"><h3>◉ Estado de los Indicadores</h3><div data-ti42i-donut></div></article>',
 '<article class="ti42i-card"><h3>▥ Evolución del Cumplimiento de Indicadores</h3><div data-ti42i-history></div></article>',
 '</div>',
 '<section class="ti42i-filters" aria-label="Filtros de indicadores">',
 '<label class="ti42i-search"><span aria-hidden="true">⌕</span><input data-ti42i-search type="search" autocomplete="off" aria-label="Buscar indicador o meta" placeholder="Buscar indicador por nombre, proyecto o línea estratégica…"></label>',
 '<label>Línea Estratégica<select data-ti42i-line aria-label="Línea estratégica"><option value="all">Todas</option></select></label>',
 '<label>Programa<select data-ti42i-program aria-label="Programa"><option value="all">Todos</option></select></label>',
 '<label>Estado<select data-ti42i-status aria-label="Estado"><option value="all">Todos</option></select></label>',
 '<label>Periodicidad<select data-ti42i-period aria-label="Periodicidad"><option value="all">Todos</option></select></label>',
 '<button type="button" class="ti42i-filter-btn" data-ti42i-apply>⚑ Filtrar</button>',
 '<button type="button" class="ti42i-reset-btn" data-ti42i-reset>Limpiar</button>',
 '</section>',
 '<div class="ti42i-bottom">',
 '<article class="ti42i-card ti42i-list">',
 '<div class="ti42i-list-heading"><h3>▤ <span data-ti42i-list-title>Listado de Indicadores</span> <span data-ti42i-count></span></h3>',
 '<div class="ti42i-mode-toggle" role="group" aria-label="Tipo de consulta">',
 '<button type="button" data-ti42i-mode="indicadores">Indicadores oficiales</button>',
 '<button type="button" data-ti42i-mode="metas">Metas relacionadas</button></div></div>',
 '<div class="ti42i-data-note" data-ti42i-note></div>',
 '<div class="ti42i-table-scroll"><table class="ti42i-table"><thead><tr><th>#</th><th>Indicador / Meta</th><th>Línea Estratégica</th><th>Programa</th><th>Meta 2024–2027</th><th>Avance Actual</th><th>% Cumplimiento</th><th>Estado</th><th>Tendencia</th><th>Acciones</th></tr></thead><tbody data-ti42i-body></tbody></table></div>',
 '<div class="ti42i-pages"><small data-ti42i-range></small><nav data-ti42i-pages aria-label="Paginación"></nav></div>',
 '</article>',
 '<aside class="ti42i-card ti42i-detail"><h3>▣ Detalle del Indicador</h3><div data-ti42i-detail></div></aside>',
 '</div>',
 '<footer class="ti42i-footer" data-ti42i-footer>Fuente: UNIDAD DE CUMPLIMIENTO(3).xlsx, hoja Proyectos DEFINITIVO. Las metas y los avances de obra no sustituyen indicadores certificados.</footer>',
 '<dialog class="ti42i-dialog" data-ti42i-dialog aria-label="Detalle ampliado de indicador o meta">',
 '<div class="ti42i-dialog-head"><h3 data-ti42i-dialog-title>Ficha ampliada</h3><button type="button" data-ti42i-dialog-close aria-label="Cerrar">×</button></div>',
 '<div data-ti42i-dialog-body></div></dialog>'
].join('');
tabs.after(panel);
const q=s=>panel.querySelector(s),qa=s=>[...panel.querySelectorAll(s)];
const set=(s,html)=>{const e=q(s);if(e)e.innerHTML=html;};
const label=(s,value)=>{const e=q(s);if(e)e.textContent=String(value??'');};
const keep=()=>{try{localStorage.setItem(STORE,JSON.stringify(state));}catch{}};
function commonValue(rs,k){
 const frequencies=new Map();
 for(const r of rs){const v=str(r[k]);if(!v)continue;frequencies.set(v,(frequencies.get(v)||0)+1);}
 return [...frequencies].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'es'))[0]?.[0]||'';
}
function globalMatch(r){
 if(shared.meta&&shared.meta!=='all'&&(shared.meta==='none'?!!r.meta:r.meta!==shared.meta))return false;
 if(shared.year&&shared.year!=='all'&&(shared.year==='none'?!!r.year:r.year!==shared.year))return false;
 if(shared.status&&shared.status!=='all'&&(shared.status==='none'?!!r.contractStatus:r.contractStatus!==shared.status))return false;
 if(shared.sector&&shared.sector!=='all'&&(shared.sector==='none'?!!r.sectorMGA:r.sectorMGA!==shared.sector))return false;
 if(shared.q&&!norm([r.name,r.bpin,r.contract,r.vereda,r.sectorMGA,r.item,r.meta,r.metaTitle].join(' ')).includes(norm(shared.q)))return false;
 return true;
}
function groupMetas(source){
 const groups=new Map();
 for(const r of source){
  const id=str(r.meta);if(!id)continue;
  const g=groups.get(id)||{key:'meta:'+id,metaId:id,type:'meta',rows:[]};
  g.rows.push(r);groups.set(id,g);
 }
 return [...groups.values()].map(g=>({
  ...g,name:commonValue(g.rows,'metaTitle')||'Meta '+g.metaId,
  description:commonValue(g.rows,'metaTitle')||null,
  strategicLine:commonValue(g.rows,'strategicLine'),
  program:projects.getExtraRow?commonValue(g.rows.map(r=>({...r,program:projects.getExtraRow(r.excelRow)?.program||''})),'program'):'',
  alternativeProgram:commonValue(g.rows,'sectorMGA'),
  technicalResponsible:commonValue(g.rows,'technicalResponsible'),
  source:'Excel Unidad de Cumplimiento · Proyectos DEFINITIVO · columnas 7, 10–12',
  status:'sin',periodicity:'sin',
  target:null,currentValue:null,compliance:null,trend:null,
  projectRows:[...new Set(g.rows.map(r=>Number(r.excelRow)))].filter(Number.isFinite),
  observations:commonValue(g.rows,'observations'),
  bpin:[...new Set(g.rows.map(r=>str(r.bpin)).filter(Boolean))],
  vigencias:[...new Set(g.rows.map(r=>str(r.year)).filter(Boolean))]
 })).sort((a,b)=>Number(a.metaId)-Number(b.metaId)||a.metaId.localeCompare(b.metaId,'es'));
}
function approvedRatio(a){
 if(valid(a.reportedCompliancePercent)&&str(a.methodologySource))return a.reportedCompliancePercent;
 if(a.calculationApproved!==true||!str(a.methodologySource))return null;
 const cur=a.currentValue,target=a.target,base=a.baseline;
 if(!valid(cur)||!valid(target))return null;
 if(a.calculationMethod==='increase'&&target>0)return cur/target*100;
 if(a.calculationMethod==='reduction'&&valid(base)&&base>target&&(base-target)!==0)return (base-cur)/(base-target)*100;
 return null;
}
function normalizeOfficial(raw){
 const id=str(raw.indicatorId),name=str(raw.name),citation=str(raw.source);
 if(!id||!name||!citation||raw.verified!==true)return null;
 const attached=[...new Set((Array.isArray(raw.projectRows)?raw.projectRows:[]).map(Number).filter(Number.isFinite))];
 const compliance=approvedRatio(raw);
 const status=STATUS.some(s=>s.id===raw.status)&&str(raw.statusSource)?raw.status:'sin';
 const lastMeasurement=/^\d{4}-\d\d-\d\d$/.test(raw.lastMeasurementDate||'')?raw.lastMeasurementDate:null;
 return {...raw,type:'indicator',key:'ind:'+id,indicatorId:id,name,source:citation,
 strategicLine:str(raw.strategicLine),program:str(raw.program),metaId:str(raw.metaId),
 status,compliance,projectRows:attached,periodicity:str(raw.periodicity)||'sin',
 target:valid(raw.target)?raw.target:null,currentValue:valid(raw.currentValue)?raw.currentValue:null,
 lastMeasurementDate:lastMeasurement,unit:str(raw.unit),measurementDirection:str(raw.measurementDirection),
 trend:typeof raw.trend==='number'&&Number.isFinite(raw.trend)&&str(raw.trendSource)?raw.trend:null};
}
async function loadVerified(){
 try{
  const req=await fetch('data/uc42-indicadores-verificados.json?v=20261108-indicadores-v1',{cache:'no-cache'});
  if(!req.ok)throw Error('Catálogo oficial no disponible');
  const data=await req.json();
  if(data.schema!=='ti-uc42-indicators-v1'||!Array.isArray(data.indicators)||!Array.isArray(data.measurements)||!Array.isArray(data.lineAggregates)||!Array.isArray(data.evolution))throw Error('Esquema de indicadores no válido');
  const next=data.indicators.map(normalizeOfficial).filter(Boolean);
  if(new Set(next.map(v=>v.indicatorId)).size!==next.length)throw Error('Identificadores de indicadores duplicados');
  official=next;officialMeta=data;verifiedExtra={measurements:data.measurements,lineAggregates:data.lineAggregates,evolution:data.evolution};
  verifiedLoaded=true;verifiedError=null;
 }catch(e){verifiedLoaded=false;verifiedError=e.message;official=[];verifiedExtra={measurements:[],lineAggregates:[],evolution:[]};}
 if(loaded){refreshChoices();render();}
}
function filterOfficial(){
 const matched=rows.filter(globalMatch),allowed=new Set(matched.map(r=>Number(r.excelRow)));
 return official.filter(i=>{
  const hasRelations=i.projectRows.length>0;
  if(shared.meta&&shared.meta!=='all'&&i.metaId!==shared.meta&&!i.projectRows.some(r=>allowed.has(r)))return false;
  if((shared.year&&shared.year!=='all')||(shared.status&&shared.status!=='all')||(shared.sector&&shared.sector!=='all'))
   if(!hasRelations||!i.projectRows.some(r=>allowed.has(r)))return false;
  if(shared.q&&!norm([i.name,i.indicatorId,i.program,i.strategicLine,i.metaId].join(' ')).includes(norm(shared.q))
   &&!i.projectRows.some(r=>allowed.has(r)))return false;
  return true;
 });
}
function scopedOfficial(){
 const c=filterOfficial();
 return c.filter(r=>
   (state.line==='all'||r.strategicLine===state.line)&&
   (state.program==='all'||r.program===state.program)&&
   (state.status==='all'||r.status===state.status)&&
   (state.period==='all'||r.periodicity===state.period)&&
   (!state.search||norm([r.name,r.indicatorId,r.metaId,r.strategicLine,r.program,r.description,r.responsible].join(' ')).includes(norm(state.search)))
 );
}
function getSelection(){
 const raw=state.mode==='indicadores'?scopedOfficial():relatedMetas;
 return raw.filter(r=>{
  if(state.search&&!norm([r.name,r.metaId,r.indicatorId,r.strategicLine,r.program,r.description,r.technicalResponsible,
    ...r.projectRows.map(id=>rows.find(x=>Number(x.excelRow)===id)?.name||'')].join(' ')).includes(norm(state.search)))return false;
  if(state.line!=='all'&&r.strategicLine!==state.line)return false;
  if(state.program!=='all'&&r.program!==state.program)return false;
  if(state.status!=='all'&&r.status!==state.status)return false;
  if(state.period!=='all'&&r.periodicity!==state.period)return false;
  return true;
 });
}
function activeSet(){
 const c=state.mode==='indicadores'?filterOfficial():relatedMetas;
 visible=c;
 filtered=getSelection();
 const nPages=Math.max(1,Math.ceil(filtered.length/PAGE));
 state.page=Math.max(1,Math.min(nPages,state.page));
 if(!filtered.some(x=>x.key===state.selectedKey))state.selectedKey=filtered[0]?.key||null;
 active=filtered.find(x=>x.key===state.selectedKey)||null;
}
function refreshChoices(){
 const c=state.mode==='indicadores'?filterOfficial():relatedMetas;
 const unique=(vals)=>[...new Set(vals.filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
 const lineOptions=unique(c.map(o=>o.strategicLine));
 if(state.line!=='all'&&!lineOptions.includes(state.line))state.line='all';
 q('[data-ti42i-line]').innerHTML='<option value="all">Todas</option>'+lineOptions.map(v=>'<option value="'+htmlEsc(v)+'">'+brief(v,50)+'</option>').join('');
 const programOptions=unique(c.filter(x=>state.line==='all'||x.strategicLine===state.line).map(x=>x.program));
 if(state.program!=='all'&&!programOptions.includes(state.program))state.program='all';
 q('[data-ti42i-program]').innerHTML='<option value="all">Todos</option>'+programOptions.map(v=>'<option value="'+htmlEsc(v)+'">'+brief(v,45)+'</option>').join('');
 const per=unique(c.map(x=>x.periodicity));
 const nameOfPeriod=v=>v==='sin'?'Sin periodicidad registrada':v;
 q('[data-ti42i-period]').innerHTML='<option value="all">Todos</option>'+per.map(v=>'<option value="'+htmlEsc(v)+'">'+htmlEsc(nameOfPeriod(v))+'</option>').join('');
 if(state.period!=='all'&&!per.includes(state.period))state.period='all';
 q('[data-ti42i-status]').innerHTML='<option value="all">Todos</option>'+STATUS.map(s=>'<option value="'+s.id+'">'+s.name+'</option>').join('');
 q('[data-ti42i-line]').value=state.line;
 q('[data-ti42i-program]').value=state.program;
 q('[data-ti42i-status]').value=state.status;
 q('[data-ti42i-period]').value=state.period;
 q('[data-ti42i-search]').value=state.search;
}
function kpi(t,v,n,kind,icon){return '<article class="ti42i-kpi '+kind+'"><span class="ti42i-icon">'+icon+'</span><div><small>'+htmlEsc(t)+'</small><strong>'+htmlEsc(v)+'</strong><em>'+htmlEsc(n)+'</em></div></article>';}
function renderKpis(){
 const c=scopedOfficial(),n=c.length,count=id=>c.filter(r=>r.status===id).length;
 const num=id=>n?Math.round(count(id)/n*100)+' % del total':'Sin clasificación acreditada';
 const agg=valid(officialMeta?.aggregateCompliance)&&str(officialMeta?.aggregateSource)?pct(officialMeta.aggregateCompliance):'—';
 const delta=valid(officialMeta?.previousPeriodDelta)&&str(officialMeta?.previousPeriodSource)?(officialMeta.previousPeriodDelta>0?'↑ ':'↓ ')+pct(Math.abs(officialMeta.previousPeriodDelta)):'Sin comparación disponible';
 set('[data-ti42i-kpis]',[
 kpi('Total de Indicadores',String(n),'Con ficha y procedencia verificadas','blue','▦'),
 kpi('Cumplimiento Satisfactorio',String(count('cumplido')),num('cumplido'),'green','✓'),
 kpi('En Riesgo',String(count('riesgo')),num('riesgo'),'amber','▨'),
 kpi('Críticos',String(count('critico')),num('critico'),'red','!'),
 '<article class="ti42i-kpi target"><span class="ti42i-icon">◎</span><div><small>Avance Promedio</small><strong>'+htmlEsc(agg)+'</strong><em>Solo agregado con metodología acreditada</em></div><span class="ti42i-delta">'+htmlEsc(delta)+'</span></article>'
 ].join(''));
}
function renderLineChart(){
 const scoped=scopedOfficial(),lineSource=state.mode==='metas'?filtered:scoped,lines=[...new Set(lineSource.map(x=>x.strategicLine).filter(Boolean))];
 const verifiedAgg=(verifiedExtra.lineAggregates||[]).filter(v=>valid(v.percent)&&str(v.source)&&str(v.methodology)&&str(v.line));
 const colors=['#1e84ef','#10a986','#f2b42a','#9571dc','#33a3e9'];
 set('[data-ti42i-lines]',lines.length?'<div class="ti42i-line-chart">'+lines.map((line,i)=>{
  const agg=verifiedAgg.find(v=>v.line===line);
  const count=scoped.filter(x=>x.strategicLine===line).length,missing=scoped.filter(x=>x.strategicLine===line&&!valid(x.compliance)).length;
  return '<button type="button" data-ti42i-line-chart="'+htmlEsc(line)+'" title="'+htmlEsc(line)+' · '+count+' indicadores con ficha, '+missing+' sin medición. '+(agg?'Cumplimiento acreditado: '+pct(agg.percent):'Sin agregado acreditado')+'">'+
   '<span>'+brief(line,35)+'</span><i class="ti42i-line-track"><b style="width:'+(agg?cap(agg.percent):0)+'%;background:'+colors[i%colors.length]+'"></b></i>'+
   '<strong>'+htmlEsc(agg?pct(agg.percent):'Sin medición')+'</strong></button>';
 }).join('')+'<div class="ti42i-line-axis"><span>0%</span><span>20%</span><span>40%</span><span>60%</span><span>80%</span><span>100%</span></div></div>'
 :'<div class="ti42i-no-data">Sin líneas estratégicas vinculadas a los filtros actuales.</div>');
 label('[data-ti42i-line-note]','');
}
function renderDonut(){
 const c=scopedOfficial(),total=c.length,groups=STATUS.map(s=>({...s,count:c.filter(x=>x.status===s.id).length}));
 let start=0;const gradient=groups.map(g=>{const a=start;start+=total?g.count/total*100:0;return g.count?g.color+' '+a.toFixed(2)+'% '+start.toFixed(2)+'%':null;}).filter(Boolean).join(',');
 set('[data-ti42i-donut]','<div class="ti42i-donut-wrap"><div class="ti42i-donut" style="background:'+(gradient?'conic-gradient('+gradient+')':'conic-gradient(#d8e3ef 0 100%)')+'"><div><strong>'+total+'</strong><small>Total</small></div></div>'+
 '<div class="ti42i-state-legend">'+groups.map(g=>'<button type="button" data-ti42i-status-chart="'+g.id+'"><i style="background:'+g.color+'"></i><span>'+g.name+'</span><b>'+g.count+(total?' ('+Math.round(g.count/total*100)+'%)':' (0%)')+'</b></button>').join('')+'</div></div>'+
 '<p class="ti42i-chart-foot">No se infiere estado a partir del porcentaje físico de proyectos.</p>');
}
function renderHistory(){
 const evolution=(verifiedExtra.evolution||[]).filter(p=>/^\d{4}-\d\d-\d\d$/.test(p.date||'')&&valid(p.actual)&&valid(p.programmed)&&str(p.source));
 if(evolution.length<2){
  set('[data-ti42i-history]','<div class="ti42i-history-key"><span><i></i>Cumplimiento real</span><span><i class="green"></i>Meta programada</span></div>'+
   '<div class="ti42i-history-canvas"><div class="ti42i-yaxis">100%<span>80%</span><span>60%</span><span>40%</span><span>20%</span><span>0%</span></div>'+
   '<div class="ti42i-empty-hist"><strong>Sin serie mensual verificada</strong><p>No hay mediciones y trayectorias programadas comparables. No se dibujan tendencias artificiales.</p></div></div>');
  return;
 }
 const points=evolution.sort((a,b)=>a.date.localeCompare(b.date)).slice(-12),xs=points.map((_,i)=>18+i*(300/Math.max(1,points.length-1)));
 const vY=p=>105-cap(p)/100*88;
 const line=key=>points.map((p,i)=>xs[i].toFixed(1)+','+vY(p[key]).toFixed(1)).join(' ');
 const circles=key=>points.map((p,i)=>'<circle cx="'+xs[i].toFixed(1)+'" cy="'+vY(p[key]).toFixed(1)+'" r="3.2"><title>'+htmlEsc(p.date)+' · '+htmlEsc(key==='actual'?'Cumplimiento real':'Meta programada')+': '+pct(p[key])+'</title></circle>').join('');
 set('[data-ti42i-history]','<div class="ti42i-history-key"><span><i></i>Cumplimiento real</span><span><i class="green"></i>Meta programada</span></div>'+
  '<svg viewBox="0 0 345 139" role="img" aria-label="Serie de cumplimiento real y programado">' +
  [0,20,40,60,80,100].map(v=>'<line x1="18" y1="'+vY(v)+'" x2="335" y2="'+vY(v)+'" stroke="#e3edf5"/><text x="16" y="'+(vY(v)+3)+'" text-anchor="end" font-size="7" fill="#6484a0">'+v+'%</text>').join('')+
  '<polyline points="'+line('actual')+'" fill="none" stroke="#177cdb" stroke-width="2.6"/><g fill="#177cdb">'+circles('actual')+'</g>'+
  '<polyline points="'+line('programmed')+'" fill="none" stroke="#10a675" stroke-width="2.4" stroke-dasharray="5 3"/><g fill="#10a675">'+circles('programmed')+'</g>'+
  points.map((p,i)=>'<text x="'+xs[i]+'" y="128" font-size="7" text-anchor="middle" fill="#4e7195">'+htmlEsc(p.date.slice(5,7))+'</text>').join('')+'</svg>');
}
function renderCharts(){renderLineChart();renderDonut();renderHistory();}
function field(name,val){return '<div><dt>'+htmlEsc(name)+'</dt><dd>'+htmlEsc(val===null||val===undefined||val===''?'No registrado':val)+'</dd></div>';}
function statusBadge(r){
 if(r.type==='meta')return '<span class="ti42i-chip unknown">Sin ficha</span>';
 const s=STATUS.find(x=>x.id===r.status)||STATUS.at(-1);
 return '<span class="ti42i-chip '+s.id+'"><i style="background:'+s.color+'"></i>'+htmlEsc(s.name)+'</span>';
}
function details(){
 if(!active){
  set('[data-ti42i-detail]','<div class="ti42i-detail-empty"><strong>Sin registros para consultar</strong><p>Ajusta los filtros o cambia entre indicadores oficiales y metas relacionadas.</p></div>');
  return;
 }
 const r=active,isMeta=r.type==='meta',present=valid(r.compliance);
 const title=isMeta?'Meta '+r.metaId+': '+r.name:r.name;
 const target=valid(r.target)?number(r.target)+(r.unit?' '+r.unit:''):'No registrado';
 const current=valid(r.currentValue)?number(r.currentValue)+(r.unit?' '+r.unit:''):'Sin medición';
 const prog=present?Math.round(cap(r.compliance)):0;
 set('[data-ti42i-detail]',
 '<div class="ti42i-detail-title"><span class="ti42i-target-glyph">◎</span><div><strong>'+htmlEsc(title)+'</strong><small>Programa: '+htmlEsc(r.program||'No registrado')+'</small></div>'+statusBadge(r)+'</div>'+
 (isMeta?'<p class="ti42i-disclaimer">Esta es una meta del Plan de Desarrollo, no una ficha técnica de indicador. El Excel no proporciona un valor objetivo medible ni una serie de resultados comparable.</p>':'')+
 '<section class="ti42i-detail-block"><small>Línea Estratégica</small><p>'+htmlEsc(r.strategicLine||'No registrada')+'</p></section>'+
 '<section class="ti42i-detail-block"><small>Descripción</small><p>'+htmlEsc(r.description||'Sin descripción oficial vinculada')+'</p></section>'+
 '<section class="ti42i-detail-block"><div class="ti42i-goal-values"><span><small>Meta 2024–2027</small><strong>'+htmlEsc(target)+'</strong></span>'+
 '<span><small>Avance Actual</small><strong>'+htmlEsc(current)+'</strong></span></div>'+
 '<div class="ti42i-progress"><i style="width:'+prog+'%"></i></div><b class="ti42i-progress-percent">'+htmlEsc(pct(r.compliance))+'</b></section>'+
 '<div class="ti42i-two"><span><small>Periodicidad</small><strong>'+htmlEsc(r.periodicity==='sin'?'No registrada':r.periodicity||'No registrada')+'</strong></span>'+
 '<span><small>'+(isMeta?'Dependencia de proyectos':'Responsable')+'</small><strong>'+htmlEsc(isMeta?(r.technicalResponsible||'No registrado'):(r.responsible||'No registrado'))+'</strong></span></div>'+
 '<div class="ti42i-update"><span><small>Última actualización</small><strong>'+htmlEsc(date(r.lastMeasurementDate))+'</strong></span>'+
 '<span><small>Vs. período anterior</small><strong>'+htmlEsc(valid(r.trend)?(r.trend>0?'↑ ':'↓ ')+pct(Math.abs(r.trend)):'Sin comparación')+'</strong></span></div>'+
 '<button type="button" class="ti42i-more" data-ti42i-more>Ver más detalles ↗</button>'
 );
}
function buildTable(){
 const n=filtered.length,isMeta=state.mode==='metas',maxPages=Math.max(1,Math.ceil(n/PAGE));
 label('[data-ti42i-count]','('+n+')');
 label('[data-ti42i-list-title]',isMeta?'Metas relacionadas (sin ficha de indicador)':'Listado de Indicadores');
 set('[data-ti42i-note]',isMeta
  ?'<span><b>'+relatedMetas.length+' metas documentadas</b> en esta selección global. No son indicadores certificados y sus porcentajes de obra NO representan cumplimiento de metas.</span>'
  :'<span><b>'+filterOfficial().length+' indicadores con ficha</b> y procedencia verificadas. No se completan estados ni porcentajes sin fuente.</span>');
 qa('[data-ti42i-mode]').forEach(b=>{const yes=b.dataset.ti42iMode===state.mode;b.classList.toggle('active',yes);b.setAttribute('aria-pressed',String(yes));});
 const start=(state.page-1)*PAGE,part=filtered.slice(start,start+PAGE);
 const rowsHtml=part.map((r,i)=>{
  const on=active?.key===r.key;
  const trend=valid(r.trend)?(r.trend>0?'<span class="ti42i-up">↑</span>':r.trend<0?'<span class="ti42i-down">↓</span>':'—'):'—';
  const go='<button type="button" data-ti42i-row="'+htmlEsc(r.key)+'" title="Ver detalle" aria-label="Ver detalle">◉</button>';
  const chart=r.type==='indicator'&&valid(r.compliance)?'<button type="button" data-ti42i-history-row="'+htmlEsc(r.key)+'" title="Consultar evolución">▥</button>':'';
  return '<tr'+(on?' class="selected"':'')+'><td>'+(start+i+1)+'</td>'+
   '<td><button class="ti42i-row-name" type="button" data-ti42i-row="'+htmlEsc(r.key)+'">'+
    (isMeta?'<b>Meta '+htmlEsc(r.metaId)+'</b> ':'')+brief(r.name,63)+'</button></td>'+
   '<td>'+brief(r.strategicLine||'Sin línea',32)+'</td>'+
   '<td>'+brief(r.program||'Sin programa',35)+'</td>'+
   '<td>'+htmlEsc(valid(r.target)?number(r.target)+(r.unit?' '+r.unit:''):'—')+'</td>'+
   '<td>'+htmlEsc(valid(r.currentValue)?number(r.currentValue)+(r.unit?' '+r.unit:''):'—')+'</td>'+
   '<td>'+htmlEsc(valid(r.compliance)?pct(r.compliance):'—')+'</td>'+
   '<td>'+statusBadge(r)+'</td><td class="ti42i-trend">'+trend+'</td>'+
   '<td><div class="ti42i-actions">'+chart+go+'<details class="ti42i-menu"><summary aria-label="Más acciones">⋮</summary>'+
   '<div><button type="button" data-ti42i-row="'+htmlEsc(r.key)+'">Ver ficha</button><button type="button" data-ti42i-details="'+htmlEsc(r.key)+'">Más detalles</button>'+
   (r.projectRows?.length?'<button type="button" data-ti42i-project="'+r.projectRows[0]+'">Ir al proyecto</button>':'')+
   '</div></details></div></td></tr>';
 }).join('');
 set('[data-ti42i-body]',rowsHtml||'<tr><td colspan="10" class="ti42i-none">'+(isMeta?'No hay metas vinculadas a los filtros actuales.':'No se encontraron indicadores con ficha acreditada. Puedes consultar las metas relacionadas sin tratarlas como indicadores.')+'</td></tr>');
 label('[data-ti42i-range]',n?'Mostrando '+(start+1)+'–'+Math.min(start+PAGE,n)+' de '+n+' '+(isMeta?'metas':'indicadores'):'No hay registros en esta vista');
 const nav=(num,t,disabled=false,activePage=false)=>'<button type="button" '+(disabled?'disabled':'data-ti42i-page="'+num+'"')+' '+(activePage?'aria-current="page" class="active"':'')+'>'+htmlEsc(t)+'</button>';
 let pagination=nav(1,'«',state.page===1)+nav(Math.max(1,state.page-1),'‹',state.page===1);
 const begin=Math.max(1,Math.min(maxPages-4,state.page-2)),end=Math.min(maxPages,begin+4);
 for(let i=begin;i<=end;i++)pagination+=nav(i,String(i),false,i===state.page);
 pagination+=nav(Math.min(maxPages,state.page+1),'›',state.page===maxPages)+nav(maxPages,'»',state.page===maxPages);
 set('[data-ti42i-pages]',pagination);
}
function renderFooter(){
 label('[data-ti42i-footer]','Fuente de metas: UNIDAD DE CUMPLIMIENTO(3).xlsx, hoja «Proyectos DEFINITIVO». Metas y proyectos son entidades distintas de indicadores. Fichas de indicadores acreditadas: '+official.length+'. '+(verifiedError?'Catálogo de fichas: '+verifiedError+'. ':'')+'El avance físico y financiero de proyectos NO se utiliza como medida del Plan de Desarrollo.');
}
function render(){
 if(!loaded){
  set('[data-ti42i-kpis]','<div class="ti42i-no-data">'+htmlEsc(sourceError||'Cargando metas vinculadas al Plan de Desarrollo…')+'</div>');
  return;
 }
 relatedMetas=groupMetas(rows.filter(globalMatch));
 refreshChoices();activeSet();
 renderKpis();renderCharts();buildTable();details();renderFooter();keep();renderCount++;
}
function drawModal(r){
 if(!r)return;
 const isMeta=r.type==='meta';
 label('[data-ti42i-dialog-title]',(isMeta?'Meta '+r.metaId:'Indicador '+r.indicatorId)+' · Ficha completa');
 const fields=[
 ['Identificador',isMeta?'Meta '+r.metaId:r.indicatorId],
 ['Nombre',r.name],['Descripción',r.description],['Línea estratégica',r.strategicLine],
 ['Programa',r.program],['Código de meta',r.metaId||'No registrado'],['Unidad',r.unit||'No registrada'],
 ['Línea base',valid(r.baseline)?number(r.baseline):null],
 ['Valor objetivo',valid(r.target)?number(r.target):null],
 ['Avance medido',valid(r.currentValue)?number(r.currentValue):null],
 ['Porcentaje',valid(r.compliance)?pct(r.compliance):null],
 ['Periodicidad',r.periodicity==='sin'?null:r.periodicity],
 ['Responsable de indicador',isMeta?null:r.responsible],
 ['Fecha última medición',r.lastMeasurementDate?date(r.lastMeasurementDate):null],
 ['Fuente documental',r.source],['Observaciones',r.observations||null]
 ];
 const projectsRows=r.projectRows.map(id=>rows.find(row=>Number(row.excelRow)===id)).filter(Boolean);
 set('[data-ti42i-dialog-body]','<p class="ti42i-dialog-explain">'+(isMeta?'Se conserva textualmente la meta registrada en el Excel. Los campos sin dato no se completan por inferencia.':'Indicador acreditado con procedencia y campos disponibles.')+'</p>'+
 '<dl class="ti42i-facts">'+fields.map(([a,b])=>field(a,b)).join('')+'</dl>'+
 '<h4>Proyectos asociados ('+projectsRows.length+')</h4>'+
 (projectsRows.length?'<div class="ti42i-associated">'+projectsRows.map(p=>'<button type="button" data-ti42i-project="'+p.excelRow+'">'+brief(p.name,76)+' <span>Fila '+p.excelRow+' ↗</span></button>').join('')+'</div>':'<p class="ti42i-dialog-explain">No se encontraron proyectos vinculados.</p>'));
 q('[data-ti42i-dialog]').showModal?.();
}
function readFilters(){
 state.search=q('[data-ti42i-search]').value;
 state.line=q('[data-ti42i-line]').value;
 state.program=q('[data-ti42i-program]').value;
 state.status=q('[data-ti42i-status]').value;
 state.period=q('[data-ti42i-period]').value;state.page=1;render();
}
function reset(){
 Object.assign(state,{search:'',line:'all',program:'all',status:'all',period:'all',page:1,selectedKey:null});
 refreshChoices();render();
}
function selectRow(key){
 const found=filtered.find(r=>r.key===key);
 if(!found)return;
 state.selectedKey=key;
 state.page=Math.floor(filtered.indexOf(found)/PAGE)+1;
 buildTable();details();keep();
}
panel.addEventListener('click',e=>{
 const mode=e.target.closest('[data-ti42i-mode]');
 if(mode){state.mode=mode.dataset.ti42iMode;state.page=1;state.selectedKey=null;Object.assign(state,{search:'',line:'all',program:'all',status:'all',period:'all'});refreshChoices();render();return;}
 const bar=e.target.closest('[data-ti42i-line-chart]');
 if(bar){state.line=state.line===bar.dataset.ti42iLineChart?'all':bar.dataset.ti42iLineChart;state.page=1;refreshChoices();render();return;}
 const stat=e.target.closest('[data-ti42i-status-chart]');
 if(stat){state.status=state.status===stat.dataset.ti42iStatusChart?'all':stat.dataset.ti42iStatusChart;state.page=1;render();return;}
 const row=e.target.closest('[data-ti42i-row]');if(row){selectRow(row.dataset.ti42iRow);return;}
 const graph=e.target.closest('[data-ti42i-history-row]');
 if(graph){const r=filtered.find(x=>x.key===graph.dataset.ti42iHistoryRow);if(r){selectRow(r.key);drawModal(r);}return;}
 const page=e.target.closest('[data-ti42i-page]');if(page){state.page=Number(page.dataset.ti42iPage);buildTable();keep();return;}
 const project=e.target.closest('[data-ti42i-project]');if(project){projects.openProject?.(Number(project.dataset.ti42iProject),'indicadores');q('[data-ti42i-dialog]')?.close?.();return;}
 const full=e.target.closest('[data-ti42i-details]');
 if(full){drawModal(filtered.find(r=>r.key===full.dataset.ti42iDetails));return;}
 if(e.target.closest('[data-ti42i-more]')){drawModal(active);return;}
 if(e.target.closest('[data-ti42i-dialog-close]')){q('[data-ti42i-dialog]')?.close?.();return;}
 if(e.target.closest('[data-ti42i-apply]')){readFilters();return;}
 if(e.target.closest('[data-ti42i-reset]')){reset();return;}
});
panel.addEventListener('input',e=>{if(e.target.matches('[data-ti42i-search]')){state.search=e.target.value;state.page=1;render();}});
panel.addEventListener('change',e=>{
 if(e.target.matches('[data-ti42i-line]')){state.line=e.target.value;state.program='all';state.page=1;render();return;}
 if(e.target.closest('[data-ti42i-program],[data-ti42i-status],[data-ti42i-period]'))readFilters();
});
summary.onChange(snapshot=>{
 rows=snapshot.rows||[];shared=snapshot.state||{};loaded=!!snapshot.loaded;sourceError=snapshot.error||null;
 if(loaded){relatedMetas=groupMetas(rows.filter(globalMatch));if(!panel.hidden)render();}
 else if(!panel.hidden)render();
});
projects.onExtraChange?.(()=>{if(loaded&&!panel.hidden)render();});
loadVerified();
function renderIfActive(){if(panel.hidden||section.hidden)return;render();}
function openMeta(metaId){
 const id=str(metaId);
 if(!relatedMetas.some(x=>x.metaId===id))summary.setMeta?.(id,true);
 relatedMetas=groupMetas(rows.filter(globalMatch));
 const meta=relatedMetas.find(x=>x.metaId===id);
 if(!meta)return false;
 Object.assign(state,{mode:'metas',line:'all',program:'all',status:'all',period:'all',search:'',selectedKey:meta.key,page:1});
 projects.setView('indicadores');render();return true;
}
window.TI42Indicadores={
 renderIfActive,openMeta,
 get loaded(){return loaded;},get verifiedCount(){return official.length;},
 get sourceMetaCount(){return relatedMetas.length;},get filteredCount(){return filtered.length;},
 get selectedKey(){return active?.key||null;},get renderCount(){return renderCount;},
 get error(){return sourceError||verifiedError;}
};
projects.setView(projects.state.view);
})();