/* Unidad de Cumplimiento 4.2: Cronograma. Fuente exclusiva: Excel 3. */
(function TI42Cronograma(){
'use strict';
const section=document.querySelector('#cumplimiento-proyectos');
const shell=section?.querySelector('.ti42');
const tabs=shell?.querySelector('.ti42-tabs');
const projects=window.TI42Proyectos;
if(!section||!shell||!tabs||!projects?.setView)return;
const STORAGE='ti:uc42:cronograma:v1';
const START=Date.UTC(2024,0,1),END=Date.UTC(2028,0,1),DAY=86400000;
const FIELDS=['excelRow','item','year','name','bpin','meta','sectorMGA','phase','start','end','contractStart','contractEnd','contractStatus','vereda','technicalResponsible','executionResponsibility','contractor','physicalPercent','observations'];
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const fmt=v=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:1}).format(v);
const dateMs=v=>{if(typeof v!=='string'||!/^20\d{2}-\d{2}-\d{2}$/.test(v))return null;const d=Date.parse(v+'T00:00:00Z');return Number.isFinite(d)?d:null;};
const fullDate=v=>{const d=dateMs(v);return d===null?'Sin fecha':new Intl.DateTimeFormat('es-CO',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:'UTC'}).format(d);};
const short=(v,n=42)=>{const s=String(v||'').replace(/\s+/g,' ').trim();return esc(s.length>n?s.slice(0,n-1).trimEnd()+'…':s);};
const percentage=v=>Number.isFinite(v)?fmt(v)+' %':'Sin dato';
const today=()=>{const n=new Date();return Date.UTC(n.getFullYear(),n.getMonth(),n.getDate());};
const isForm=r=>/prefactibilidad|factibilidad|formulacion/.test(norm(r.phase));
const isRun=r=>/ejecucion/.test(norm(r.phase));
const hasDates=r=>dateMs(r.start)!==null&&dateMs(r.end)!==null&&dateMs(r.end)>=dateMs(r.start);
const status=r=>{
 if(isRun(r))return {label:'En ejecución (fase)',tone:'running'};
 if(isForm(r))return {label:'En formulación',tone:'planning'};
 return {label:'Sin fase informada',tone:'unknown'};
};
const cap=v=>Math.min(100,Math.max(0,Number.isFinite(v)?v:0));
const nowPct=()=>cap((today()-START)*100/(END-START));
let state={view:'years',sector:'all',phase:'all',search:'',chartYear:'2026',selectedRow:null};
try{const old=JSON.parse(localStorage.getItem(STORAGE)||'null');if(old&&typeof old==='object')for(const k of Object.keys(state))if(Object.hasOwn(old,k))state[k]=old[k];}catch{}
if(!['years','quarters','months'].includes(state.view))state.view='years';
if(!['2024','2025','2026','2027'].includes(state.chartYear))state.chartYear='2026';
for(const k of ['sector','phase','search'])if(typeof state[k]!=='string')state[k]=k==='search'?'':'all';
let source=[],visible=[],selected=null,ready=false,loadError=null,map=null,mapBusy=false,renderCount=0;
const heading=document.createElement('section');
heading.dataset.ti42gHead='1';
heading.className='ti42g-heading';
heading.hidden=true;
heading.innerHTML=[
 '<div class="ti42g-titlebar"><div class="ti42g-name">',
 '<span class="ti42g-titleicon" aria-hidden="true">▥</span><div>',
 '<h2>Cronograma Estratégico de Proyectos</h2>',
 '<p>Seguimiento temporal de los proyectos del Plan de Desarrollo 2024–2027</p>',
 '</div></div><div class="ti42g-stamp"><span>◷</span><div><strong>Fuente documental</strong>',
 '<small>Excel Unidad de Cumplimiento · Sin fecha de actualización acreditada</small></div></div></div>',
 '<div class="ti42g-kpis" data-ti42g-kpis></div>'
].join('');
tabs.before(heading);
const panel=document.createElement('section');
panel.className='ti42g-panel';
panel.dataset.ti42gPanel='1';
panel.hidden=true;
panel.setAttribute('aria-label','Cronograma estratégico de proyectos');
panel.innerHTML=[
 '<div class="ti42g-layout"><div class="ti42g-left">',
 '<article class="ti42g-card ti42g-master">',
 '<div class="ti42g-cardbar"><h3><span>▣</span> Cronograma Maestro de Proyectos</h3>',
 '<div class="ti42g-actions"><span class="ti42g-caption">Vista:</span>',
 '<div class="ti42g-modes" role="group" aria-label="Escala del cronograma">',
 '<button type="button" data-ti42g-mode="years">Años</button>',
 '<button type="button" data-ti42g-mode="quarters">Trimestres</button>',
 '<button type="button" data-ti42g-mode="months">Meses</button></div>',
 '<label><span class="sr-only">Filtrar sector</span><select data-ti42g-sector><option value="all">Todos los sectores</option></select></label>',
 '<button class="ti42g-export" data-ti42g-export type="button">↧ Exportar</button></div></div>',
 '<div class="ti42g-refine"><label>Buscar proyecto <input type="search" data-ti42g-search placeholder="Nombre, BPIN, contrato, vereda…" autocomplete="off"></label>',
 '<label>Fase <select data-ti42g-phase><option value="all">Todas las fases</option></select></label>',
 '<span data-ti42g-count aria-live="polite">Cargando fechas documentadas…</span></div>',
 '<div class="ti42g-gantt-scroll" data-ti42g-gantt-scroll><div data-ti42g-gantt></div></div>',
 '<div class="ti42g-legend"><span><i class="complete"></i>100 % físico declarado</span>',
 '<span><i class="running"></i>Fase de ejecución</span><span><i class="planning"></i>Factibilidad / prefactibilidad</span>',
 '<span><i class="unknown"></i>Sin fase</span><span><i class="today"></i>Hoy</span></div></article>',
 '<div class="ti42g-chart-row">',
 '<article class="ti42g-card"><div class="ti42g-cardbar"><h3>▤ Inicios y finales por mes</h3>',
 '<select data-ti42g-chart-year aria-label="Año de las fechas"><option value="2024">2024</option><option value="2025">2025</option><option value="2026">2026</option><option value="2027">2027</option></select></div>',
 '<div data-ti42g-month-chart></div></article>',
 '<article class="ti42g-card"><h3>▣ Avance físico por dependencia</h3><div data-ti42g-departments></div></article>',
 '<article class="ti42g-card"><h3>▦ Fechas de inicio y fin por vigencia</h3><div data-ti42g-year-chart></div></article>',
 '</div>',
 '<div class="ti42g-low-row">',
 '<article class="ti42g-card"><h3>♧ Hitos del Plan de Desarrollo 2024–2027</h3><div class="ti42g-milestones" data-ti42g-milestones></div></article>',
 '<article class="ti42g-card"><h3>⚠ Alertas y revisión de fechas</h3><div data-ti42g-alerts></div></article>',
 '</div></div>',
 '<aside class="ti42g-right">',
 '<article class="ti42g-card ti42g-project">',
 '<header class="ti42g-project-head"><div><h3 data-ti42g-project-name>Selecciona un proyecto</h3>',
 '<div class="ti42g-project-identity" data-ti42g-project-id></div></div><button type="button" data-ti42g-clear-select aria-label="Seleccionar primer proyecto">×</button></header>',
 '<div class="ti42g-project-subtabs"><span>General</span><strong>Cronograma</strong><span>Financiero</span><span>Contratos</span><span>Evidencias</span></div>',
 '<div class="ti42g-aside-section"><h4>♧ Hitos documentados del proyecto</h4><div data-ti42g-steps></div></div>',
 '<div class="ti42g-aside-section"><h4>▣ Avance y tiempo del proyecto</h4><div data-ti42g-project-progress></div></div>',
 '<div class="ti42g-aside-section"><h4>▦ Fechas clave</h4><div data-ti42g-dates></div></div>',
 '<div class="ti42g-aside-section"><h4>♙ Responsables</h4><div data-ti42g-people></div></div>',
 '</article>',
 '<article class="ti42g-card ti42g-map"><h3>♧ Mapa de referencia territorial</h3>',
 '<div data-ti42g-map data-ti-map data-ti-map-manual="1" class="ti42g-map-host" aria-label="Mapa de veredas de Subachoque"></div>',
 '<p data-ti42g-map-label>El mapa ubica una vereda de referencia, no las coordenadas de la obra.</p></article>',
 '<article class="ti42g-card ti42g-upcoming"><h3>▤ Próximas fechas (30 días)</h3>',
 '<div data-ti42g-upcoming></div></article>',
 '</aside></div>',
 '<footer class="ti42g-footer" data-ti42g-source>Fuente: UNIDAD DE CUMPLIMIENTO(3).xlsx, hoja «Proyectos DEFINITIVO». No se atribuye estado de finalización ni retraso sin actas o fechas verificadas.</footer>'
].join('');
tabs.after(panel);
const h=s=>heading.querySelector(s),q=s=>panel.querySelector(s),all=s=>[...panel.querySelectorAll(s)];
const set=(s,v)=>{const el=q(s);if(el)el.innerHTML=v;};
const text=(s,v)=>{const el=q(s);if(el)el.textContent=String(v??'');};
const keep=()=>{try{localStorage.setItem(STORAGE,JSON.stringify(state));}catch{}};
const ratio=(n,d)=>d>0?n/d*100:null;
function filter(){
 visible=source.filter(r=>{
  if(state.sector!=='all'&&r.sectorMGA!==state.sector)return false;
  if(state.phase!=='all'&&r.phase!==state.phase)return false;
  if(state.search&&!norm([r.name,r.bpin,r.contractor,r.vereda,r.year,r.item,r.meta].join(' ')).includes(norm(state.search)))return false;
  return true;
 });
 if(!visible.some(r=>r.excelRow===state.selectedRow))state.selectedRow=visible[0]?.excelRow??null;
 selected=visible.find(r=>r.excelRow===state.selectedRow)||null;
}
function choices(){
 const opts=(field,label)=>{
  let html='<option value="all">'+esc(label)+'</option>';
  [...new Set(source.map(r=>r[field]).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'es')).forEach(v=>html+='<option value="'+esc(v)+'">'+esc(v)+'</option>');
  return html;
 };
 const sect=q('[data-ti42g-sector]'),phase=q('[data-ti42g-phase]');
 sect.innerHTML=opts('sectorMGA','Todos los sectores');phase.innerHTML=opts('phase','Todas las fases');
 if(![...sect.options].some(v=>v.value===state.sector))state.sector='all';
 if(![...phase.options].some(v=>v.value===state.phase))state.phase='all';
 sect.value=state.sector;phase.value=state.phase;
 q('[data-ti42g-search]').value=state.search;
 q('[data-ti42g-chart-year]').value=state.chartYear;
}
function KPI(value,label,detail,tone){
 return '<article class="ti42g-kpi '+tone+'"><span class="ti42g-kpi-glyph">'+({blue:'▣',green:'✓',yellow:'♧',red:'!',cyan:'▤',ring:'◎'}[tone]||'▣')+'</span><div><strong>'+esc(value)+'</strong><b>'+esc(label)+'</b><small>'+esc(detail)+'</small></div></article>';
}
function drawKpis(){
 const n=visible.length,paired=visible.filter(hasDates).length;
 const hundred=visible.filter(r=>Number.isFinite(r.physicalPercent)&&r.physicalPercent>=100).length;
 const running=visible.filter(isRun).length;
 const forms=visible.filter(isForm).length;
 const checks=visible.filter(r=>{const end=dateMs(r.end);return end!==null&&end<today()&&(!Number.isFinite(r.physicalPercent)||r.physicalPercent<100);}).length;
 const coverage=ratio(paired,n),cv=coverage===null?'—':fmt(coverage)+' %';
 h('[data-ti42g-kpis]').innerHTML=[
  KPI(n,'Registros estratégicos','Filas visibles del Excel','blue'),
  KPI(hundred,'100 % físico declarado','No implica acta de cierre','green'),
  KPI(running,'Fase de ejecución','Clasificación en Excel','yellow'),
  KPI(checks,'Fechas para revisar','No prueba retrasos','red'),
  KPI(forms,'En formulación','Prefactibilidad y factibilidad','cyan'),
  '<article class="ti42g-kpi ti42g-kpi-ring"><div class="ti42g-donut" style="--ti42g-fill:'+cap(coverage)+'%"><strong>'+cv+'</strong></div><div><b>Fechas completas</b><small>'+paired+' de '+n+' filas con inicio y fin</small></div></article>'
 ].join('');
}
function barStyle(r){
 const a=dateMs(r.start),b=dateMs(r.end);
 if(a===null||b===null||b<a)return null;
 const l=cap((Math.max(a,START)-START)/(END-START)*100);
 const w=Math.max(.9,cap((Math.min(b,END)-Math.max(a,START))/(END-START)*100));
 if(b<START||a>=END)return null;
 const tone=Number.isFinite(r.physicalPercent)&&r.physicalPercent>=100?'complete':isRun(r)?'running':isForm(r)?'planning':'unknown';
 return {left:l,width:Math.min(w,100-l),tone};
}
function axis(){
 const months=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
 const group='<div class="ti42g-years">'+[2024,2025,2026,2027].map(y=>'<strong>'+y+'</strong>').join('')+'</div>';
 const ticks=[];
 for(let year=2024;year<=2027;year++){
  for(let v=0;v<(state.view==='months'?12:4);v++){
    ticks.push('<span>'+ (state.view==='months'?months[v]:'Trim '+(v+1)) +'</span>');
  }
 }
 return group+'<div class="ti42g-ticks'+(state.view==='months'?' is-months':'')+'">'+ticks.join('')+'</div>';
}
function drawGantt(){
 const total=visible.length;
 text('[data-ti42g-count]',total+' registros · '+visible.filter(hasDates).length+' con fechas completas');
 const timelineWidth=state.view==='months'?1230:state.view==='quarters'?870:580;
 const columns='<div class="ti42g-g-col id">ID</div><div class="ti42g-g-col name">Proyecto</div><div class="ti42g-g-col sector">Sector</div><div class="ti42g-g-col date">Inicio</div><div class="ti42g-g-col date">Fin</div>';
 const head='<div class="ti42g-gantt-head">'+columns+'<div class="ti42g-axis" style="width:'+timelineWidth+'px">'+axis()+'</div><div class="ti42g-g-col state">Fase</div></div>';
 const line=nowPct();
 const body=visible.map(r=>{
  const v=barStyle(r),s=status(r),active=selected?.excelRow===r.excelRow;
  const track='<div class="ti42g-track" style="width:'+timelineWidth+'px">'+
   '<span class="ti42g-now" style="left:'+line+'%" aria-hidden="true"></span>'+
   (v?'<span class="ti42g-duration '+v.tone+'" style="left:'+v.left.toFixed(3)+'%;width:'+v.width.toFixed(3)+'%" title="'+esc(fullDate(r.start)+' — '+fullDate(r.end))+'"></span>':'<em class="ti42g-track-empty">Sin par de fechas</em>')+'</div>';
  return '<button type="button" class="ti42g-gantt-row'+(active?' selected':'')+'" data-ti42g-select="'+r.excelRow+'" aria-pressed="'+active+'">'+
   '<span class="ti42g-g-col id">'+esc(r.item||r.excelRow)+'</span>'+
   '<span class="ti42g-g-col name" title="'+esc(r.name)+'">'+short(r.name,36)+'</span>'+
   '<span class="ti42g-g-col sector">'+short(r.sectorMGA||'Sin sector',25)+'</span>'+
   '<span class="ti42g-g-col date">'+esc(fullDate(r.start))+'</span>'+
   '<span class="ti42g-g-col date">'+esc(fullDate(r.end))+'</span>'+track+
   '<span class="ti42g-g-col state"><i class="'+s.tone+'"></i>'+esc(s.label)+'</span></button>';
 }).join('');
 set('[data-ti42g-gantt]','<div class="ti42g-gantt" style="--ti42g-timeline-width:'+timelineWidth+'px">'+head+(body||'<div class="ti42g-empty">No hay proyectos con los filtros seleccionados.</div>')+'</div>');
 all('[data-ti42g-mode]').forEach(b=>{const on=b.dataset.ti42gMode===state.view;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
}
function barChartMonths(){
 const months=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
 const yyyy=Number(state.chartYear);
 const starts=Array(12).fill(0),ends=Array(12).fill(0);
 for(const r of visible){
  const a=dateMs(r.start),b=dateMs(r.end);
  if(a!==null&&new Date(a).getUTCFullYear()===yyyy)starts[new Date(a).getUTCMonth()]++;
  if(b!==null&&new Date(b).getUTCFullYear()===yyyy)ends[new Date(b).getUTCMonth()]++;
 }
 const max=Math.max(1,...starts,...ends);
 const html=months.map((m,i)=>'<div class="ti42g-vertical-col" title="'+esc(m)+': '+starts[i]+' inicios y '+ends[i]+' finales">'+
 '<div class="ti42g-vertical-pair"><i class="blue" style="height:'+Math.max(1,starts[i]/max*100)+'%"></i><i class="green" style="height:'+Math.max(1,ends[i]/max*100)+'%"></i></div><small>'+m+'</small></div>').join('');
 set('[data-ti42g-month-chart]','<div class="ti42g-chart-legend"><span><i class="blue"></i>Inicio</span><span><i class="green"></i>Fin</span></div><div class="ti42g-vertical-chart">'+html+'</div><p class="ti42g-chart-note">Cantidad de fechas registradas; no es una serie histórica de ejecución.</p>');
}
function departments(){
 const data=new Map();
 for(const r of visible){
  if(!Number.isFinite(r.physicalPercent)||!r.technicalResponsible)continue;
  const key=r.technicalResponsible;
  if(!data.has(key))data.set(key,{name:key,sum:0,count:0});
  const g=data.get(key);g.sum+=r.physicalPercent;g.count++;
 }
 const ar=[...data.values()].map(o=>({...o,avg:o.sum/o.count})).sort((a,b)=>b.count-a.count).slice(0,6);
 set('[data-ti42g-departments]',ar.length?'<div class="ti42g-hbars">'+ar.map(g=>'<div class="ti42g-hbar"><span title="'+esc(g.name)+'">'+short(g.name,24)+'</span><div class="ti42g-htrack"><i style="width:'+cap(g.avg)+'%"></i></div><strong>'+fmt(g.avg)+'%</strong></div>').join('')+'</div><p class="ti42g-chart-note">Promedio de avances físicos reportados por dependencia.</p>':'<p class="ti42g-empty">No existen datos suficientes para comparar dependencias.</p>');
}
function yearChart(){
 const years=[2024,2025,2026,2027],data=years.map(y=>({y,starts:0,ends:0}));
 for(const r of visible){
  const a=dateMs(r.start),b=dateMs(r.end);
  if(a!==null){const y=new Date(a).getUTCFullYear();if(y>=2024&&y<=2027)data[y-2024].starts++;}
  if(b!==null){const y=new Date(b).getUTCFullYear();if(y>=2024&&y<=2027)data[y-2024].ends++;}
 }
 const max=Math.max(1,...data.flatMap(v=>[v.starts,v.ends]));
 set('[data-ti42g-year-chart]','<div class="ti42g-chart-legend"><span><i class="blue"></i>Inicios</span><span><i class="green"></i>Finales</span></div><div class="ti42g-vertical-chart is-years">'+
 data.map(d=>'<div class="ti42g-vertical-col" title="'+d.y+': '+d.starts+' inicios, '+d.ends+' finales"><div class="ti42g-vertical-pair"><i class="blue" style="height:'+Math.max(1,d.starts/max*100)+'%"></i><i class="green" style="height:'+Math.max(1,d.ends/max*100)+'%"></i></div><small>'+d.y+'</small></div>').join('')+'</div><p class="ti42g-chart-note">Fechas según el archivo; no equivalen a obras entregadas.</p>');
}
function milestones(){
 const years=[2024,2025,2026,2027];
 const html=years.map(y=>{
  const a=visible.filter(r=>{const t=dateMs(r.start);return t!==null&&new Date(t).getUTCFullYear()===y;}).length;
  const b=visible.filter(r=>{const t=dateMs(r.end);return t!==null&&new Date(t).getUTCFullYear()===y;}).length;
  return '<div class="ti42g-milestone"><i></i><strong>'+y+'</strong><span>'+a+' inicios</span><small>'+b+' terminaciones registradas</small></div>';
 }).join('');
 set('[data-ti42g-milestones]',html);
}
function alerts(){
 const missing=visible.filter(r=>!hasDates(r)).length;
 const needReview=visible.filter(r=>{const b=dateMs(r.end);return b!==null&&b<today()&&(!Number.isFinite(r.physicalPercent)||r.physicalPercent<100);}).length;
 const wrong=visible.filter(r=>dateMs(r.start)!==null&&dateMs(r.end)!==null&&dateMs(r.end)<dateMs(r.start)).length;
 const phase=visible.filter(r=>!r.phase).length;
 const notes=[
  ['warning',missing+' registros sin fechas completas de inicio y finalización.'],
  ['warning',needReview+' terminaciones pasadas con avance físico inferior a 100 % o no informado: comprobar cierre.'],
  ['danger',wrong+' pares con finalización anterior al inicio.'],
  ['info',phase+' registros sin fase del proyecto documentada.']
 ];
 set('[data-ti42g-alerts]',notes.filter((x,i)=>i!==2||wrong>0).map(([tone,msg])=>'<div class="ti42g-alert '+tone+'"><span>'+(tone==='danger'?'!':tone==='warning'?'⚠':'i')+'</span><p>'+esc(msg)+'</p></div>').join('')+'<p class="ti42g-chart-note">Son verificaciones de consistencia, no alertas de incumplimiento certificadas.</p>');
}
function projectSteps(r){
 const items=[['Inicio del proyecto',r.start],['Inicio del contrato',r.contractStart],['Terminación del contrato',r.contractEnd],['Fecha final del proyecto',r.end]];
 return '<div class="ti42g-steps">'+items.map(([label,value])=>{
  const t=dateMs(value),past=t!==null&&t<=today();
  return '<div class="ti42g-step"><i class="'+(t===null?'unknown':past?'past':'future')+'"></i><span>'+esc(label)+'</span><strong>'+esc(fullDate(value))+'</strong><small>'+ (t===null?'Sin registrar':past?'Fecha transcurrida':'Fecha futura')+'</small></div>';
 }).join('')+'</div><p class="ti42g-muted">No se inventan fechas de estudios, fases ni hitos intermedios.</p>';
}
function projectProgress(r){
 const start=dateMs(r.start),end=dateMs(r.end),now=today();
 const time=start!==null&&end!==null&&end>=start?cap((now-start)/Math.max(DAY,end-start)*100):null;
 const physical=Number.isFinite(r.physicalPercent)?r.physicalPercent:null;
 const row=(title,value,kind)=>'<div class="ti42g-progress-row"><div><span>'+esc(title)+'</span><strong>'+esc(percentage(value))+'</strong></div><div class="ti42g-progress-track"><i class="'+kind+'" style="width:'+cap(value)+'%"></i></div></div>';
 return row('Tiempo transcurrido del plazo',time,'green')+row('Avance físico informado',physical,'blue')+
 '<p class="ti42g-muted">El tiempo transcurrido no es una meta física programada; su comparación no certifica retraso ni cumplimiento.</p>';
}
function projectDates(r){
 const a=dateMs(r.start),b=dateMs(r.end),now=today();
 const duration=a!==null&&b!==null&&b>=a?Math.round((b-a)/DAY)+1:null;
 const remain=b!==null?Math.round((b-now)/DAY):null;
 const pairs=[['Fecha de inicio',fullDate(r.start)],['Fecha de finalización',fullDate(r.end)],['Duración prevista',duration===null?'Sin dato':duration+' días'],['Días hasta fecha final',remain===null?'Sin dato':remain>=0?remain+' días':'Fecha transcurrida'],['Fase registrada',r.phase||'Sin fase']];
 return '<dl class="ti42g-dategrid">'+pairs.map(([k,v])=>'<div><dt>'+esc(k)+'</dt><dd>'+esc(v)+'</dd></div>').join('')+'</dl>';
}
function projectPeople(r){
 const people=[['Responsable técnico',r.technicalResponsible],['Responsabilidad de ejecución',r.executionResponsibility],['Contratista',r.contractor]];
 return '<dl class="ti42g-people">'+people.map(([k,v])=>'<div><dt>'+esc(k)+'</dt><dd>'+esc(v||'No registrado')+'</dd></div>').join('')+'</dl>';
}
function drawProject(){
 const r=selected;
 if(!r){
  text('[data-ti42g-project-name]','Sin proyecto seleccionado');
  set('[data-ti42g-project-id]','');set('[data-ti42g-steps]','<p class="ti42g-empty">Selecciona un registro del cronograma.</p>');
  for(const k of ['project-progress','dates','people'])set('[data-ti42g-'+k+']','');
  text('[data-ti42g-map-label]','Sin ubicación asociada a la selección.');
  return;
 }
 text('[data-ti42g-project-name]',r.name);
 const st=status(r);
 set('[data-ti42g-project-id]','<span class="ti42g-status '+st.tone+'">'+esc(st.label)+'</span><span>Ítem '+esc(r.item||r.excelRow)+'</span><span>BPIN: '+esc(r.bpin||'Sin dato')+'</span>');
 set('[data-ti42g-steps]',projectSteps(r));
 set('[data-ti42g-project-progress]',projectProgress(r));
 set('[data-ti42g-dates]',projectDates(r));
 set('[data-ti42g-people]',projectPeople(r));
 text('[data-ti42g-map-label]',r.vereda?'Vereda de referencia: '+r.vereda+'. No representa coordenadas certificadas.':'Sin vereda documentada. Se muestra la cartografía general de Subachoque.');
 try{if(map&&r.vereda)map.select(r.vereda);}catch{}
}
function upcoming(){
 const end=today()+DAY*30,events=[];
 for(const r of visible){
  for(const [type,iso] of [['Fin del proyecto',r.end],['Fin contractual',r.contractEnd]]){
   const when=dateMs(iso);
   if(when!==null&&when>=today()&&when<=end)events.push({row:r,when,type,iso});
  }
 }
 events.sort((a,b)=>a.when-b.when);
 set('[data-ti42g-upcoming]',events.length?'<table class="ti42g-upcoming-table"><thead><tr><th>Proyecto</th><th>Hito</th><th>Fecha</th></tr></thead><tbody>'+
 events.slice(0,7).map(e=>'<tr><td title="'+esc(e.row.name)+'">'+short(e.row.name,32)+'</td><td>'+esc(e.type)+'</td><td>'+esc(fullDate(e.iso))+'</td></tr>').join('')+
 '</tbody></table>':'<p class="ti42g-empty">No hay fechas de terminación registradas para los próximos 30 días.</p>');
}
function startMap(){
 if(panel.hidden||section.hidden||mapBusy||map||!window.TISubachoqueMap)return;
 const host=q('[data-ti42g-map]');if(!host)return;
 mapBusy=true;
 window.TISubachoqueMap.mount(host,{onSelect:()=>{}}).then(m=>{
  map=m;mapBusy=false;if(selected?.vereda)map?.select(selected.vereda);map?.invalidateSize?.();
 }).catch(()=>{mapBusy=false;host.textContent='No fue posible cargar la cartografía territorial.';});
}
function refresh(){
 if(!ready){text('[data-ti42g-count]',loadError?'Error: '+loadError:'Cargando cronograma…');return;}
 filter();renderCount++;drawKpis();drawGantt();barChartMonths();departments();yearChart();milestones();alerts();drawProject();upcoming();keep();
}
function csv(){
 const columns=[['Fila',r=>r.excelRow],['Ítem',r=>r.item],['Proyecto',r=>r.name],['BPIN',r=>r.bpin],['Meta',r=>r.meta],['Sector',r=>r.sectorMGA],['Fase',r=>r.phase],['Inicio del proyecto',r=>r.start],['Fin del proyecto',r=>r.end],['Inicio del contrato',r=>r.contractStart],['Terminación del contrato',r=>r.contractEnd],['Avance físico (%)',r=>r.physicalPercent],['Vereda',r=>r.vereda],['Responsable técnico',r=>r.technicalResponsible]];
 const cell=v=>{const a=String(v??'');const guarded=/^[\s]*[=+\-@\t\r]/.test(a)?"'"+a:a;return '"'+guarded.replace(/"/g,'""')+'"';};
 const contents='\uFEFF'+columns.map(c=>cell(c[0])).join(';')+'\r\n'+visible.map(r=>columns.map(c=>cell(c[1](r))).join(';')).join('\r\n');
 const url=URL.createObjectURL(new Blob([contents],{type:'text/csv;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download='unidad-cumplimiento-cronograma.csv';document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
panel.addEventListener('click',event=>{
 const row=event.target.closest('[data-ti42g-select]');
 if(row){state.selectedRow=Number(row.dataset.ti42gSelect);refresh();return;}
 const mode=event.target.closest('[data-ti42g-mode]');
 if(mode){state.view=mode.dataset.ti42gMode;refresh();return;}
 if(event.target.closest('[data-ti42g-export]')){csv();return;}
 if(event.target.closest('[data-ti42g-clear-select]')){state.selectedRow=visible[0]?.excelRow||null;refresh();}
});
panel.addEventListener('change',event=>{
 const sector=event.target.closest('[data-ti42g-sector]'),phase=event.target.closest('[data-ti42g-phase]'),year=event.target.closest('[data-ti42g-chart-year]');
 if(sector){state.sector=sector.value;refresh();}
 else if(phase){state.phase=phase.value;refresh();}
 else if(year){state.chartYear=year.value;barChartMonths();keep();}
});
panel.addEventListener('input',event=>{
 if(event.target.matches('[data-ti42g-search]')){state.search=event.target.value;refresh();}
});
async function load(){
 try{
  const response=await fetch('data/uc42-cronograma.gz.b64.txt?v=20261108-excel3-v1',{cache:'no-cache'});
  if(!response.ok)throw Error('archivo de fechas no disponible');
  if(typeof DecompressionStream!=='function')throw Error('navegador sin descompresión de datos');
  const encoded=(await response.text()).trim();
  const binary=Uint8Array.from(atob(encoded),s=>s.charCodeAt(0));
  const json=await new Response(new Blob([binary]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
  const data=JSON.parse(json);
  if(data.schema!==1||data.sheet!=='Proyectos DEFINITIVO'||data.fields.join('|')!==FIELDS.join('|')||!Array.isArray(data.rows)||!data.rows.every(r=>Array.isArray(r)&&r.length===FIELDS.length))throw Error('esquema del cronograma no coincide');
  source=data.rows.map(row=>Object.fromEntries(FIELDS.map((k,i)=>[k,row[i]])));
  ready=true;loadError=null;choices();refresh();
 }catch(e){
  ready=false;loadError=e.message;text('[data-ti42g-count]','No se pudieron consultar las fechas del Excel: '+e.message);
  h('[data-ti42g-kpis]').innerHTML='<div class="ti42g-empty">Cronograma no disponible. No se muestran proyectos ni fechas de ejemplo.</div>';
 }
}
load();
function renderIfActive(){
 if(panel.hidden||section.hidden)return;
 if(ready)refresh();
 requestAnimationFrame(()=>{startMap();map?.invalidateSize?.();});
}
window.TI42Cronograma={renderIfActive,get loaded(){return ready;},get error(){return loadError;},get selectedRow(){return selected?.excelRow||null;},get filteredCount(){return visible.length;},get renderCount(){return renderCount;}};
projects.setView(projects.state.view);
})();