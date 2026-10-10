/* Memoria de la Alcaldía (2.3) — registro documental local con visualizaciones reales y trazabilidad. */
(function MemoriaAlcaldia(){
"use strict";
const root=document.getElementById("maApp");
const legacy=document.getElementById("maLegacyWorkspace");
if(!root||!legacy)return;
const KEY="municipal-archive:v1";
const TYPE_OPTIONS=["Decreto","Resolución","Acuerdo","Informe","Plan","Acta","Contrato","Manual","Correspondencia","Otro"];
const DEP_HINTS=["Despacho del Alcalde","Secretaría de Planeación","Secretaría de Gobierno","Secretaría de Hacienda","Secretaría de Infraestructura","Secretaría de Desarrollo Social","Secretaría de Ambiente","Oficina de Control Interno","Otra dependencia"];
const COLORS=["#ffe500","#5caff7","#35bdab","#a584e3","#eea76c","#adc1d3","#6e91bf","#eb80aa"];
const allowed=/\.(pdf|docx?|xlsx?|csv|json|txt|png|jpe?g|webp)$/i;
const maxBytes=25*1024*1024;
const state={records:[],mode:"overview",filters:{q:"",type:"",dependency:"",year:""},page:0,error:"",ready:false,alertDismissed:false,filtersVisible:false};
const escape=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const format=n=>new Intl.NumberFormat("es-CO").format(Number(n)||0);
const shortDate=v=>{if(!v)return"Sin fecha";const date=new Date(v.length===10?v+"T12:00:00":v);return isNaN(date.valueOf())?"Sin fecha":new Intl.DateTimeFormat("es-CO",{day:"2-digit",month:"short",year:"numeric"}).format(date);};
const safeUrl=value=>{if(!value)return"";try{const u=new URL(value);return u.protocol==="https:"?u.href:"";}catch{return"";}};
const unique=arr=>[...new Set(arr.filter(Boolean))];
const icon={
  documents:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 2h11l4 4v16H5zM16 2v5h4M9 11h7M9 15h7M9 19h5"/></svg>',
  dependencies:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m2 9 10-6 10 6M4 9v12m4-12v12m4-12v12m4-12v12m4-12v12M2 21h20M2 9h20"/></svg>',
  history:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="18" height="15" rx="1"/><path d="M3 11h18M8 7V3h8v4M8 15h8"/></svg>',
  indicators:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 22V14h4v8M10 22V8h4v14M17 22V3h4v19M2 22h21"/></svg>'
};
function indicatorRows(){return (typeof TI_STATE!=="undefined"?TI_STATE?.imported?.municipales?.rows:null)||[];}
function indicatorCount(){return unique(indicatorRows().map(r=>[r.indicador,r.sector,r.fuente].join("|"))).length;}
function sorted(){return [...state.records].sort((a,b)=>String(b.dated||b.createdAt).localeCompare(String(a.dated||a.createdAt))||String(b.createdAt).localeCompare(String(a.createdAt)));}
function filtered(data=sorted()){
 const {q,type,dependency,year}=state.filters;
 const needle=q.trim().toLocaleLowerCase("es");
 return data.filter(item=>{
  if(type&&item.type!==type)return false;
  if(dependency&&item.dependency!==dependency)return false;
  if(year&&String(item.dated||"").slice(0,4)!==year)return false;
  if(!needle)return true;
  return [item.title,item.type,item.dependency,item.summary,item.source,item.fileName,String(item.dated||""),item.id].some(s=>String(s||"").toLocaleLowerCase("es").includes(needle));
 });
}
function availableYears(){return unique(state.records.map(r=>String(r.dated||"").slice(0,4))).filter(x=>/^\d{4}$/.test(x)).sort((a,b)=>b.localeCompare(a));}
function availableDeps(){return unique(state.records.map(r=>r.dependency)).sort((a,b)=>a.localeCompare(b,"es"));}
function metricEmpty(){return `<div class="ma-empty"><strong>Sin registros todavía</strong><span>Carga documentos reales para generar esta visualización.</span><button class="ma-btn ma-primary" type="button" data-ma-action="new">+ Agregar archivo</button></div>`;}
function panel(title,body,span=4,subtitle="",action=""){
 return `<section class="ma-panel ma-span-${span}"><div class="ma-panel-head"><div><h3>${escape(title)}</h3>${subtitle?`<p>${escape(subtitle)}</p>`:""}</div>${action||""}</div>${body}</section>`;
}
function formatSize(bytes){
 if(!bytes)return"—";
 return bytes>=1024*1024?(bytes/1024/1024).toFixed(1)+" MB":(bytes/1024).toFixed(1)+" KB";
}
function recordsStats(rows=filtered()){
 const years=rows.map(r=>Number(String(r.dated).slice(0,4))).filter(Number.isFinite);
 return {count:rows.length,departments:unique(rows.map(x=>x.dependency)).length,historic:rows.filter(x=>x.historic).length,digital:rows.filter(x=>x.status==="digital").length,undigitized:rows.filter(x=>x.status==="physical").length,first:years.length?Math.min(...years):null,last:years.length?Math.max(...years):null,size:rows.reduce((s,r)=>s+(Number(r.fileBlob?.size)||0),0)};
}
function filtersMarkup(){
 const types=unique([...TYPE_OPTIONS.filter(t=>state.records.some(r=>r.type===t)),...state.records.map(r=>r.type)]).sort((a,b)=>a.localeCompare(b,"es"));
 return `<form class="ma-search" id="maSearchForm" role="search" aria-label="Buscar en Memoria de la Alcaldía">
  <label class="ma-field"><span class="ma-filter-icon" aria-hidden="true">⌕</span><input name="q" type="search" value="${escape(state.filters.q)}" placeholder="Buscar documentos, dependencias, temas o palabras clave" aria-label="Texto a buscar"/></label>
  <div class="ma-field ma-split"><span class="ma-filter-icon" aria-hidden="true">▤</span><label><small>Tipo de documento</small><select name="type" aria-label="Tipo de documento"><option value="">Todos</option>${types.map(t=>`<option value="${escape(t)}"${state.filters.type===t?" selected":""}>${escape(t)}</option>`).join("")}</select></label></div>
  <div class="ma-field ma-split"><span class="ma-filter-icon" aria-hidden="true">⌂</span><label><small>Dependencia</small><select name="dependency" aria-label="Dependencia"><option value="">Todas</option>${availableDeps().map(t=>`<option value="${escape(t)}"${state.filters.dependency===t?" selected":""}>${escape(t)}</option>`).join("")}</select></label></div>
  <div class="ma-field ma-split"><span class="ma-filter-icon" aria-hidden="true">▣</span><label><small>Año</small><select name="year" aria-label="Año"><option value="">Todos</option>${availableYears().map(t=>`<option value="${t}"${state.filters.year===t?" selected":""}>${t}</option>`).join("")}</select></label></div>
  <button class="ma-search-btn" type="submit">Buscar&nbsp; →</button>
 </form>`;
}
function featureMarkup(){
 const cards=[
  ["history","Archivos históricos","Documentos, acuerdos, decretos y registros institucionales."],
  ["dependencies","Dependencias","Explora la documentación por áreas de la Alcaldía."],
  ["indicators","Bases municipales","Conjuntos de datos institucionales en formato abierto."],
  ["series","Series históricas","Evolución de indicadores y registros en el tiempo."]
 ];
 return `<div class="ma-features" aria-label="Explora la memoria municipal">${cards.map(([key,name,sub])=>`<button type="button" class="ma-feature" data-ma-mode="${key}" aria-pressed="${state.mode===key}"><span class="ma-feature-icon">${icon[key==="series"?"indicators":key==="history"?"documents":key==="indicators"?"history":key]}</span><span class="ma-feature-body"><strong>${escape(name)}</strong><small>${escape(sub)}</small></span><span class="ma-feature-arrow" aria-hidden="true">→</span></button>`).join("")}</div>`;
}
function statsMarkup(rows=filtered()){
 const v=recordsStats(rows);
 const total=v.count?Math.round(v.digital/v.count*100)+" %":"—";
 return `<div class="ma-stats">
  <div class="ma-stat"><small>Documentos registrados</small><strong>${format(v.count)}</strong><span>En este navegador</span></div>
  <div class="ma-stat"><small>Dependencias presentes</small><strong>${format(v.departments)}</strong><span>En registros cargados</span></div>
  <div class="ma-stat"><small>Digitalizados</small><strong>${total}</strong><span>${format(v.digital)} con archivo o enlace</span></div>
  <div class="ma-stat"><small>Periodo documental</small><strong>${v.first?`${v.first}–${v.last}`:"—"}</strong><span>Según fechas registradas</span></div>
 </div>`;
}
function docTable(rows,mini=false){
 if(!rows.length)return metricEmpty();
 const pageSize=mini?7:20;
 const maxPage=Math.max(0,Math.ceil(rows.length/pageSize)-1);
 const page=mini?0:Math.min(state.page,maxPage);
 const visible=rows.slice(page*pageSize,(page+1)*pageSize);
 return `<div class="ma-table-scroller"><table class="ma-doc-table"><thead><tr><th>Documento</th><th>Tipo</th><th>Dependencia</th><th>Fecha</th><th>Archivo</th></tr></thead><tbody>${visible.map(r=>`<tr><td><button type="button" class="ma-doc-title" title="${escape(r.title)}" data-ma-view="${escape(r.id)}"><span class="ma-type-dot" style="background:${COLORS[Math.max(0,TYPE_OPTIONS.indexOf(r.type))%COLORS.length]}"></span>${escape(r.title)}</button></td><td>${escape(r.type)}</td><td title="${escape(r.dependency)}">${escape(r.dependency)}</td><td>${shortDate(r.dated)}</td><td>${r.fileBlob?`<button type="button" class="ma-table-action" data-ma-download="${escape(r.id)}" aria-label="Descargar ${escape(r.title)}">↓</button>`:r.url&&safeUrl(r.url)?`<a class="ma-text-link" target="_blank" rel="noopener noreferrer" href="${escape(safeUrl(r.url))}">↗</a>`:"—"}</td></tr>`).join("")}</tbody></table></div>${!mini&&rows.length>pageSize?`<div class="ma-pager"><button type="button" data-ma-action="prev" ${page===0?"disabled":""}>← Anterior</button><span>${page*pageSize+1}–${Math.min(rows.length,(page+1)*pageSize)} de ${rows.length}</span><button type="button" data-ma-action="next" ${page===maxPage?"disabled":""}>Siguiente →</button></div>`:""}`;
}
function chartTrend(rows){
 const counter=new Map();
 rows.forEach(r=>{const y=Number(String(r.dated).slice(0,4));if(y>=1900&&y<=2100)counter.set(y,(counter.get(y)||0)+1);});
 if(counter.size===0)return metricEmpty();
 const years=[...counter.keys()].sort((a,b)=>a-b).slice(-9),max=Math.max(1,...years.map(y=>counter.get(y))),w=470,h=204,l=43,r=25,t=25,b=28;
 const pts=years.map((year,i)=>({x:years.length===1?(l+w-r)/2:l+(w-l-r)*i/(years.length-1),y:h-b-(counter.get(year)/max)*(h-t-b),year,val:counter.get(year)}));
 const lines=[0,.25,.5,.75,1].map(ratio=>`<line x1="${l}" x2="${w-r}" y1="${h-b-ratio*(h-t-b)}" y2="${h-b-ratio*(h-t-b)}" stroke="#3b5870" stroke-width="1"/><text x="${l-8}" y="${h-b-ratio*(h-t-b)+4}" font-size="10" fill="#b9cbd8" text-anchor="end">${format(Math.round(max*ratio))}</text>`).join("");
 const poly=pts.map(p=>`${p.x},${p.y}`).join(" ");
 const dots=pts.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="4.8" fill="#ffe500"><title>${p.year}: ${p.val} documento(s)</title></circle><text x="${p.x}" y="${h-8}" font-size="10" text-anchor="middle" fill="#c3d7e5">${p.year}</text>`).join("");
 return `<svg viewBox="0 0 ${w} ${h}" class="ma-chart" role="img" aria-label="Cantidad de documentos registrados por año, con ${years.map(y=>`${y}: ${counter.get(y)}`).join(", ")}">${lines}<polyline fill="none" stroke="#ffe500" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round" points="${poly}"/>${dots}</svg><p class="ma-panel-subtle">Conteos de archivos cargados; no representan el archivo municipal completo.</p>`;
}
function chartDeps(rows){
 const totals=new Map();rows.forEach(r=>totals.set(r.dependency,(totals.get(r.dependency)||0)+1));
 const arr=[...totals].sort((a,b)=>b[1]-a[1]).slice(0,7);
 if(!arr.length)return metricEmpty();
 const max=arr[0][1];
 return `<div class="ma-hbars">${arr.map(([name,val])=>`<div class="ma-hbar" title="${escape(name)}"><span class="ma-hbar-name">${escape(name)}</span><div class="ma-hbar-track"><div class="ma-hbar-fill" style="width:${(val/max*100).toFixed(1)}%"></div></div><b>${format(val)}</b></div>`).join("")}</div><p class="ma-panel-subtle">Dependencias identificadas dentro de los registros actuales.</p>`;
}
function chartTypes(rows){
 const totals=new Map();rows.forEach(r=>totals.set(r.type,(totals.get(r.type)||0)+1));
 const arr=[...totals].sort((a,b)=>b[1]-a[1]);
 if(!arr.length)return metricEmpty();
 const total=rows.length;const top=arr.slice(0,5);const other=arr.slice(5).reduce((n,x)=>n+x[1],0);
 if(other)top.push(["Otros tipos",other]);
 let offset=0;
 const stops=top.map(([name,val],i)=>{const start=offset;offset+=val/total*100;return `${COLORS[i]} ${start.toFixed(3)}% ${offset.toFixed(3)}%`;}).join(", ");
 return `<div class="ma-donut-row"><div role="img" aria-label="Documentos por tipo: ${escape(arr.map(x=>x.join(" ")).join(", "))}" class="ma-donut" style="background:conic-gradient(${stops})"><div class="ma-donut-value"><strong>${format(total)}</strong><small>documentos</small></div></div><div class="ma-donut-legend">${top.map(([name,val],i)=>`<span><i class="ma-color" style="background:${COLORS[i]}"></i><em title="${escape(name)}">${escape(name)}</em><b>${Math.round(val/total*100)}%</b></span>`).join("")}</div></div>`;
}
function recentUploads(rows){
 const recent=[...rows].sort((a,b)=>String(b.createdAt||"").localeCompare(String(a.createdAt||""))).slice(0,6);
 if(!recent.length)return metricEmpty();
 return `<ul class="ma-line-list">${recent.map(r=>`<li><div><strong title="${escape(r.title)}">${escape(r.title)}</strong><small>${shortDate(r.createdAt)} · ${escape(r.dependency)}</small></div><button type="button" class="ma-table-action" data-ma-view="${escape(r.id)}" aria-label="Ver ficha">↗</button></li>`).join("")}</ul>`;
}
function chartArchiveStatus(rows){
 const total=rows.length,docs=rows.filter(r=>r.status==="digital").length,physical=rows.filter(r=>r.status==="physical").length;
 const pct=total?Math.round(docs/total*100):0;
 const background=total?`conic-gradient(#ffe500 0 ${pct}%,#7ca6ed ${pct}% 100%)`:"conic-gradient(#29475b 0 100%)";
 return `<div class="ma-archive-state">
 <div class="ma-donut" role="img" aria-label="${total?`${docs} digitalizados y ${physical} pendientes de digitalización`:"Sin registros documentales"}" style="background:${background}"><div class="ma-donut-value"><strong>${total?format(total):"—"}</strong><small>${total?"documentos":"sin registros"}</small></div></div>
 <div class="ma-archive-state-legend"><div><i class="ma-color" style="background:#ffe500"></i><span><strong>${total?pct+" %":"—"}</strong><small>Digitalizados<br>${format(docs)} documento(s)</small></span></div><div><i class="ma-color" style="background:#7ca6ed"></i><span><strong>${total?(100-pct)+" %":"—"}</strong><small>Pendientes de digitalización<br>${format(physical)} registro(s)</small></span></div></div>
 </div>`;
}
function keyStats(rows){
 const stats=recordsStats(rows);const oldest=stats.first&&stats.last?stats.first+" – "+stats.last:"—";
 const cells=[
  ["▤",format(stats.count),"Documentos registrados"],
  ["▥",format(stats.digital),"Documentos digitalizados"],
  ["♧",format(stats.departments),"Dependencias con registros"],
  ["◷",oldest,"Rango del archivo"]
 ];
 return `<div class="ma-key-metrics">${cells.map(([sym,val,label])=>`<div class="ma-key-metric"><span class="ma-key-symbol" aria-hidden="true">${sym}</span><div><strong>${escape(val)}</strong><small>${escape(label)}</small></div></div>`).join("")}</div>`;
}
function archiveTimeline(rows){
 const years=new Map();
 rows.filter(r=>r.historic&&/^\d{4}-/.test(r.dated||"")).forEach(r=>{
 const year=String(r.dated).slice(0,4);
 if(!years.has(year))years.set(year,[]);
 years.get(year).push(r);
 });
 const items=[...years].sort((a,b)=>a[0].localeCompare(b[0])).slice(-6);
 if(!items.length)return `<div class="ma-timeline-blank"><div class="ma-timeline-axis" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span></div><p>La cronología aparecerá al incorporar documentos históricos con fechas verificables.</p><button type="button" class="ma-text-link" data-ma-action="new">Agregar archivo histórico →</button></div>`;
 return `<div class="ma-timeline-horizontal" role="list" aria-label="Línea de tiempo de documentos históricos"><div class="ma-timeline-axis" aria-hidden="true"></div>${items.map(([year,files])=>`<button type="button" role="listitem" class="ma-time-point" data-ma-year="${escape(year)}" title="Consultar ${format(files.length)} documento(s) de ${year}"><span class="ma-time-dot" aria-hidden="true"></span><b>${escape(year)}</b><small>${format(files.length)} documento(s) en el archivo</small></button>`).join("")}</div>`;
}
function board(){
 const rows=filtered();
 const link=(mode,label)=>`<button type="button" class="ma-text-link" data-ma-mode="${mode}">${label} →</button>`;
 const dept=rows.length?chartDeps(rows):metricEmpty();
 return `<div class="ma-grid ma-grid-analytics" id="maBoard">
 ${panel("Documentos por dependencia",dept,5,"",link("dependencies","Ver todas"))}
 ${panel("Estado del archivo municipal",chartArchiveStatus(rows),3)}
 ${panel("Indicadores clave",keyStats(rows),4)}
 </div>
 <div class="ma-grid ma-grid-doc-history">
 ${panel("Documentos recientes",docTable(rows,true),6,"",link("documents","Ver todos"))}
 ${panel("Línea de tiempo de la memoria institucional",archiveTimeline(rows),6,"",link("history","Ver serie completa"))}
 </div>`;
}
function detailedView(){
 const rows=filtered(),mode=state.mode;
 const header=(title,summary,button="")=>`<div class="ma-view-header"><div><h2 tabindex="-1" id="maSectionTitle">${escape(title)}</h2><p>${escape(summary)}</p></div><div class="ma-action-set">${button}<button class="ma-btn" type="button" data-ma-mode="overview">← Volver al resumen</button></div></div>`;
 if(mode==="documents")return header("Archivo documental",`${format(rows.length)} documento(s) disponibles con los filtros seleccionados.`,`<button class="ma-btn ma-primary" type="button" data-ma-action="new">+ Agregar documento</button>`)+panel("Documentos oficiales",docTable(rows),12,"Consulta sus fichas y descarga los archivos originales");
 if(mode==="dependencies"){
  const map=new Map();
  rows.forEach(r=>{const v=map.get(r.dependency)||{count:0,last:""};v.count++;if(r.dated>v.last)v.last=r.dated;map.set(r.dependency,v)});
  return header("Documentos por dependencia","Las dependencias se identifican a partir de las fuentes registradas; no se presupone un inventario oficial.")+(map.size?`<div class="ma-tiles">${[...map].sort((a,b)=>b[1].count-a[1].count).map(([name,val])=>`<button class="ma-dep-card" type="button" data-ma-department="${escape(name)}"><strong>${escape(name)}</strong><b>${format(val.count)}</b><small>documento(s) · última fecha: ${shortDate(val.last)}</small><small>Ver documentos →</small></button>`).join("")}</div>`:panel("Sin dependencias registradas",metricEmpty(),12));
 }
 if(mode==="history"){
  const historic=rows.filter(r=>r.historic),byYear=new Map();
  historic.forEach(r=>{const y=String(r.dated).slice(0,4);if(!byYear.has(y))byYear.set(y,[]);byYear.get(y).push(r);});
  return header("Inventario histórico","Solo se muestran los registros marcados como históricos al incorporarlos.")+(historic.length?panel("Línea de tiempo documental",`<div class="ma-timeline">${[...byYear].sort((a,b)=>b[0].localeCompare(a[0])).map(([year,docs])=>`<div class="ma-milestone"><strong>${escape(year)}</strong><span>${format(docs.length)} documento(s): ${escape(docs.slice(0,3).map(x=>x.title).join(" · "))}${docs.length>3?"…":""}</span></div>`).join("")}</div>`,12)+`<div class="ma-grid" style="margin-top:14px">${panel("Archivos históricos",docTable(historic),12)}</div>`:panel("Inventario histórico",metricEmpty(),12));
 }
 if(mode==="series"){
  const all=indicatorRows(),byYear=new Map();
  all.forEach(row=>{const year=String(row.periodo||"").slice(0,4),n=TIData.number(row.valor);if(/^\d{4}$/.test(year)&&n!==null){byYear.set(year,(byYear.get(year)||0)+1);}});
  return header("Series históricas","Registros e indicadores por periodo; solo los años efectivamente cargados.",`<button class="ma-btn ma-primary" type="button" data-ma-action="legacy">Explorar base municipal ↓</button>`)+
    `<div class="ma-grid">`+panel("Evolución del archivo",chartTrend(filtered()),6,"Registros por año del documento")+panel("Información estadística importada",byYear.size?`<div class="ma-timeline-horizontal">${[...byYear].sort((a,b)=>a[0].localeCompare(b[0])).slice(-6).map(([year,num])=>`<div class="ma-time-point"><span class="ma-time-dot"></span><b>${year}</b><small>${num} valores</small></div>`).join("")}</div>`:metricEmpty(),6,"Según periodo de las bases municipales")+`</div>`;
 }
 if(mode==="indicators"){
  const rows=indicatorRows(),counts=unique(rows.map(x=>x.indicador));
  return header("Indicadores municipales","Conservamos el importador y las gráficas de las bases municipales existentes.")+
   `<div class="ma-grid">${panel("Base estadística municipal",`<div class="ma-stats"><div class="ma-stat"><small>Indicadores disponibles</small><strong>${format(counts.length)}</strong><span>Base local importada</span></div><div class="ma-stat"><small>Registros estadísticos</small><strong>${format(rows.length)}</strong><span>Sin publicación institucional</span></div></div><p class="ma-panel-subtle">La importación estadística anterior permanece disponible abajo. La información está en este dispositivo y puede requerir validación por dependencia.</p><button class="ma-btn ma-primary" type="button" data-ma-action="legacy">Abrir importador de bases ↓</button>`,12)}</div>`;
 }
 return board();
}
function shell(){
 const rows=filtered();
 const filterActive=Object.values(state.filters).some(Boolean);
 return `<div class="ma-page">
 <section class="ma-hero" aria-labelledby="maTitle">
 <div class="ma-hero-photo" aria-hidden="true"></div><div class="ma-hero-overlay" aria-hidden="true"></div>
 <div class="ma-shell ma-hero-content">
  <p class="ma-kicker">Data Territorio&nbsp; / &nbsp;2.3 Memoria de la Alcaldía</p>
  <h1 id="maTitle" tabindex="-1">MEMORIA DE<br>LA ALCALDÍA</h1>
  <h2>Archivos, históricos y dependencias</h2>
  <p class="ma-hero-lead">Explora la memoria institucional de Subachoque. Accede a archivos históricos, documentos por dependencias, bases municipales y series de información que cuentan la historia de nuestro territorio.</p>
 </div>
 <button class="ma-story-trigger" type="button" data-ma-mode="history" aria-label="Conocer la memoria municipal mediante su línea de tiempo"><span class="ma-play-circle" aria-hidden="true">▶</span><span>Conoce nuestra<br>memoria municipal<small>EXPLORAR HISTORIA&nbsp; ↗</small></span></button>
 <span class="ma-hero-caption"><strong>SUBACHOQUE</strong><small>Nuestra historia<br>también construye<br>el futuro</small></span>
 </section>
 <div class="ma-content ma-shell">
  ${featureMarkup()}
  ${state.mode==="overview"?board():detailedView()}
  <div class="ma-extra-tools">
    <div class="ma-extra-copy"><strong>Archivo y gestión documental</strong><span>Consulta, incorpora y administra información real del municipio.</span></div>
    <div class="ma-action-set">
     <button type="button" class="ma-btn" data-ma-action="search" aria-expanded="${Boolean(state.filtersVisible)}">⌕ Buscar y filtrar ${filterActive?"(filtros activos)":""}</button>
     <button type="button" class="ma-btn" data-ma-action="export">↓ Exportar catálogo</button>
     <button type="button" class="ma-btn ma-primary" data-ma-action="new">+ Agregar documento</button>
    </div>
  </div>
  ${state.filtersVisible?`<div class="ma-search-drawer" id="maSearchDrawer">${filtersMarkup()}<div class="ma-search-meta">${format(rows.length)} resultado(s) de ${format(state.records.length)} · <button class="ma-text-link" type="button" data-ma-action="clear">Limpiar filtros</button></div></div>`:""}
  <p role="status" aria-live="polite" class="ma-status" id="maStatus">${escape(state.error)}</p>
  <p class="ma-local-footnote">Repositorio de trabajo · Los documentos que cargues se conservan en este navegador, no se publican automáticamente y no sustituyen el archivo institucional. Las estadísticas se calculan únicamente con registros incorporados; no se muestran cifras ilustrativas como oficiales.</p>
 </div>
 <dialog id="maFormDialog" class="ma-modal" aria-labelledby="maFormHeading"></dialog>
 <dialog id="maDetailDialog" class="ma-modal" aria-labelledby="maDetailHeading"></dialog>
 </div>`;
}
function render({focus=false}={}){
 root.innerHTML=shell();
 if(state.mode==="indicators"){legacy.hidden=false;legacy.open=true;}
 else{legacy.hidden=true;legacy.open=false;}
 root.dataset.ready=state.ready?"true":"loading";
 if(focus)requestAnimationFrame(()=>root.querySelector("#maSectionTitle,#maTitle")?.focus({preventScroll:true}));
}
function scrollToResults(){
 requestAnimationFrame(()=>{const el=root.querySelector(state.mode==="overview"?"#maBoard":"#maSectionTitle");if(!el)return;const header=document.getElementById("siteHeader");const top=window.scrollY+el.getBoundingClientRect().top-(header?.getBoundingClientRect().height||80)-14;window.scrollTo({top:Math.max(0,top),behavior:"auto"});el.focus?.({preventScroll:true});});
}
function newForm(record=null){
 const editing=!!record;
 const formDialog=root.querySelector("#maFormDialog");if(!formDialog)return;
 const selectedType=record?.type&&TYPE_OPTIONS.includes(record.type)?record.type:"Otro";
 const otherType=record&&!TYPE_OPTIONS.includes(record.type)?record.type:"";
 const today=new Date().toLocaleDateString("sv-SE");
 formDialog.innerHTML=`<h2 id="maFormHeading">${editing?"Editar ficha":"Agregar documento municipal"}</h2>
 <p>${editing?"Actualiza los metadatos sin borrar el archivo que ya estaba guardado.":"Registra únicamente documentos reales. Puedes adjuntar uno o varios archivos, o crear una referencia física sin archivo digital."}</p>
 <form class="ma-form" id="maUploadForm">
  <label class="ma-wide">Título del documento<input name="title" type="text" maxlength="160" value="${escape(record?.title||"")}" placeholder="Título o nombre institucional" ${editing?"required":""}/></label>
  <label>Tipo de documento<select name="type" required>${TYPE_OPTIONS.map(t=>`<option value="${escape(t)}"${(record?selectedType===t:t==="Informe")?" selected":""}>${escape(t)}</option>`).join("")}</select></label>
  <label>Otro tipo · ¿Cuál?<input type="text" name="otherType" maxlength="60" value="${escape(otherType)}" placeholder="Especificar si corresponde"/></label>
  <label class="ma-wide">Dependencia responsable<input name="dependency" list="maDependencyHints" type="text" required maxlength="120" value="${escape(record?.dependency||"")}" placeholder="Escribe la dependencia que originó el documento"/></label>
  <datalist id="maDependencyHints">${DEP_HINTS.map(t=>`<option value="${escape(t)}"></option>`).join("")}</datalist>
  <label>Fecha del documento<input name="dated" required type="date" value="${escape(record?.dated||today)}"/></label>
  <label>Estado de digitalización<select name="status"><option value="digital"${!record||record?.status==="digital"?" selected":""}>Digitalizado (archivo o enlace)</option><option value="physical"${record?.status==="physical"?" selected":""}>Registro físico pendiente de digitalizar</option></select></label>
  <label>Clasificación del archivo<select name="historic"><option value="false"${!record?.historic?" selected":""}>Archivo administrativo</option><option value="true"${record?.historic?" selected":""}>Archivo histórico</option></select></label>
  <label>Fuente o procedencia<input name="source" type="text" maxlength="150" required value="${escape(record?.source||"")}" placeholder="Unidad, dependencia o inventario fuente"/></label>
  <label class="ma-wide">Descripción / contenido<textarea name="summary" maxlength="700" placeholder="Breve resumen del contenido">${escape(record?.summary||"")}</textarea></label>
  <label class="ma-wide">Enlace oficial de descarga (opcional)<input type="url" name="url" value="${escape(record?.url||"")}" placeholder="https://..."/></label>
  <label class="ma-wide">Archivo original (PDF, Word, Excel, imagen, CSV)${editing&&record?.fileName?` · Conservado: ${escape(record.fileName)}`:""}<input name="files" type="file" ${editing?"":"multiple"} accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.json,.txt,.png,.jpg,.jpeg,.webp"/></label>
  <p class="ma-privacy ma-wide">Máximo 25 MB por archivo y 15 documentos por operación. Si son varios, cada archivo queda registrado por su nombre con la misma dependencia, fecha y clasificación.</p>
  <p class="ma-error ma-wide" role="alert" id="maFormError"></p>
  <div class="ma-form-actions"><button type="button" class="ma-btn" data-ma-action="close">Cancelar</button><button type="submit" class="ma-btn ma-primary" id="maSaveButton">${editing?"Guardar cambios":"Guardar documentos"}</button></div>
 </form>`;
 formDialog.dataset.edit=record?.id||"";
 formDialog.showModal();
 formDialog.querySelector('[name="title"]').focus();
}
function validateEntry(form,original){
 const data=new FormData(form),files=[...(form.elements.namedItem("files").files||[])];
 if(files.length>15)throw Error("Solo se admiten 15 archivos por operación.");
 if(files.some(file=>file.size>maxBytes||!allowed.test(file.name)))throw Error("Archivo no admitido o mayor de 25 MB.");
 const type=data.get("type")==="Otro"?(String(data.get("otherType")||"").trim()):String(data.get("type")||"").trim();
 const dependency=String(data.get("dependency")||"").trim(),source=String(data.get("source")||"").trim();
 const title=String(data.get("title")||"").trim(),dated=String(data.get("dated")||"");
 const summary=String(data.get("summary")||"").trim(),url=String(data.get("url")||"").trim();
 const status=String(data.get("status"))==="physical"?"physical":"digital";
 if(!type||!dependency||!source)throw Error("Completa tipo, dependencia y procedencia.");
 if(!/^\d{4}-\d{2}-\d{2}$/.test(dated)||Number.isNaN(new Date(dated+"T12:00:00").valueOf()))throw Error("Indica una fecha válida.");
 if(url&&!safeUrl(url))throw Error("El enlace oficial debe comenzar con https://.");
 if(status==="digital"&&!files.length&&!safeUrl(url)&&!original?.fileBlob)throw Error("Para documentos digitalizados adjunta un archivo o un enlace HTTPS.");
 if(files.length<=1&&!title&&!files[0]&&!original?.title)throw Error("Introduce el título.");
 if(status==="physical"&&files.length)throw Error("Un registro físico sin digitalizar no debe adjuntar un archivo. Cambia el estado a Digitalizado.");
 return {type,dependency,source,title,dated,summary,url,status,historic:String(data.get("historic"))==="true",files};
}
async function saveForm(form){
 const dlg=root.querySelector("#maFormDialog"),message=dlg.querySelector("#maFormError"),button=dlg.querySelector("#maSaveButton");
 const original=state.records.find(r=>r.id===dlg.dataset.edit);
 let payload;
 try{payload=validateEntry(form,original);}catch(e){message.textContent=e.message;return;}
 const list=payload.files.length?payload.files:[null];
 const created=state.records.slice();const now=new Date().toISOString();
 try{
  button.disabled=true;button.textContent="Guardando…";message.textContent="";
  for(const file of list){
   const filename=file?.name||original?.fileName||"";
   const name=payload.title||filename.replace(/\.[^.]+$/,"")||"Documento sin título";
   const item={id:original?.id||crypto.randomUUID(),title:list.length>1?filename.replace(/\.[^.]+$/,""):name,
     type:payload.type,dependency:payload.dependency,dated:payload.dated,source:payload.source,summary:payload.summary,
     url:payload.url,status:payload.status,historic:payload.historic,fileName:payload.status==="digital"?filename:"",
     fileBlob:payload.status==="digital"?(file||original?.fileBlob||null):null,createdAt:original?.createdAt||now,updatedAt:now};
   if(original){const index=created.findIndex(x=>x.id===original.id);if(index<0)throw Error("El registro ya no existe.");created[index]=item;}
   else created.push(item);
  }
  await TIData.write(KEY,{version:1,records:created});
  state.records=created;state.error=`${list.length} registro(s) guardado(s) en este navegador.`;
  dlg.close();state.mode=state.mode==="history"?"history":"documents";state.page=0;render();
 }catch(err){message.textContent=err.message||"No se pudo guardar. Revisa el espacio disponible en este navegador.";}
 finally{if(button.isConnected){button.disabled=false;button.textContent=original?"Guardar cambios":"Guardar documentos";}}
}
function fiche(record){
 const dlg=root.querySelector("#maDetailDialog");if(!dlg||!record)return;
 const list=[
  ["Tipo de documento",record.type],["Dependencia",record.dependency],["Fecha institucional",shortDate(record.dated)],
  ["Estado",record.status==="digital"?"Digitalizado":"Referencia física pendiente de digitalización"],
  ["Clasificación",record.historic?"Archivo histórico":"Archivo administrativo"],["Procedencia",record.source],
  ["Descripción",record.summary||"Sin descripción"],["Archivo asociado",record.fileName||"No hay archivo digital"],
  ["Registrado localmente",shortDate(record.createdAt)]
 ];
 dlg.dataset.id=record.id;
 dlg.innerHTML=`<h2 id="maDetailHeading">${escape(record.title)}</h2><p>Ficha documental almacenada en este navegador.</p>
  <dl class="ma-fiche">${list.map(([title,value])=>`<dt>${escape(title)}</dt><dd>${escape(value)}</dd>`).join("")}</dl>
  <div class="ma-dialog-actions">
   ${record.fileBlob?`<button type="button" class="ma-btn ma-primary" data-ma-download="${escape(record.id)}">↓ Descargar original</button>`:""}
   ${safeUrl(record.url)?`<a class="ma-btn" href="${escape(safeUrl(record.url))}" target="_blank" rel="noopener noreferrer">Abrir fuente oficial ↗</a>`:""}
   <button type="button" class="ma-btn" data-ma-action="edit">Editar ficha</button>
   <button type="button" class="ma-btn" data-ma-action="delete">Eliminar</button>
   <button type="button" class="ma-btn" data-ma-action="close">Cerrar</button>
  </div>`;
 dlg.showModal();
}
function fileDownload(id){
 const rec=state.records.find(x=>x.id===id);
 if(!rec?.fileBlob)return;
 const obj=URL.createObjectURL(rec.fileBlob);
 const a=document.createElement("a");a.href=obj;a.download=rec.fileName||rec.title;a.style.display="none";
 document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(obj),3000);
}
function exportCsv(){
 const rows=filtered();
 if(!rows.length){state.error="No hay registros que exportar.";render();return;}
 const fields=["title","type","dependency","dated","status","historic","source","summary","fileName","url","createdAt","updatedAt"];
 const labels=["Título","Tipo","Dependencia","Fecha","Estado","Histórico","Procedencia","Resumen","Archivo","URL","Creado","Modificado"];
 const csvItem=value=>{
  let x=String(value??"");
  if(/^[\s]*[=+\-@\t\r]/.test(x))x="'"+x;
  return '"'+x.replace(/"/g,'""')+'"';
 };
 const content="\uFEFF"+[labels.map(csvItem).join(";"),...rows.map(row=>fields.map(k=>csvItem(k==="historic"?(row.historic?"Sí":"No"):row[k])).join(";"))].join("\r\n");
 const url=URL.createObjectURL(new Blob([content],{type:"text/csv;charset=utf-8"}));
 const anchor=document.createElement("a");anchor.href=url;anchor.download="memoria-alcaldia-catalogo-local.csv";document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
 state.error=`Catálogo CSV preparado con ${rows.length} registro(s) filtrados. Los archivos originales se descargan por separado.`;
 root.querySelector("#maStatus").textContent=state.error;
}
function handleAction(action){
 if(action==="new"){newForm();return;}
 if(action==="search"){state.filtersVisible=!state.filtersVisible;render();if(state.filtersVisible)root.querySelector("#maSearchDrawer input")?.focus();return;}
 if(action==="close"){const d=root.querySelector("#maFormDialog[open],#maDetailDialog[open]");d?.close();return;}
 if(action==="clear"){state.filters={q:"",type:"",dependency:"",year:""};state.page=0;render();return;}
 if(action==="dismiss"){state.alertDismissed=true;root.querySelector(".ma-local-alert")?.remove();return;}
 if(action==="export"){exportCsv();return;}
 if(action==="prev"){state.page=Math.max(0,state.page-1);render();scrollToResults();return;}
 if(action==="next"){state.page++;render();scrollToResults();return;}
 if(action==="legacy"){legacy.hidden=false;legacy.open=true;legacy.scrollIntoView({behavior:"smooth",block:"start"});return;}
 if(action==="edit"){
  const d=root.querySelector("#maDetailDialog");
  const rec=state.records.find(r=>r.id===d?.dataset.id);
  if(!rec)return;d.close();newForm(rec);return;
 }
 if(action==="delete"){
  const d=root.querySelector("#maDetailDialog");
  const id=d?.dataset.id,rec=state.records.find(r=>r.id===id);
  if(!rec)return;
  if(!window.confirm(`¿Eliminar "${rec.title}" del repositorio de este navegador?`))return;
  const old=state.records.slice();const next=old.filter(r=>r.id!==id);
  TIData.write(KEY,{version:1,records:next}).then(()=>{
   state.records=next;state.error="Documento eliminado del almacenamiento local.";d.close();render();
  }).catch(err=>{const msg=d.querySelector(".ma-error")||document.createElement("p");msg.className="ma-error";msg.textContent=err.message;d.appendChild(msg);});
 }
}
root.addEventListener("click",event=>{
 const download=event.target.closest("[data-ma-download]");
 if(download){fileDownload(download.dataset.maDownload);return;}
 const detail=event.target.closest("[data-ma-view]");
 if(detail){fiche(state.records.find(r=>r.id===detail.dataset.maView));return;}
 const yearItem=event.target.closest("[data-ma-year]");
 if(yearItem){state.filters.year=yearItem.dataset.maYear;state.mode="documents";state.filtersVisible=true;state.page=0;render({focus:true});scrollToResults();return;}
 const dep=event.target.closest("[data-ma-department]");
 if(dep){state.filters.dependency=dep.dataset.maDepartment;state.mode="documents";state.page=0;render();scrollToResults();return;}
 const mode=event.target.closest("[data-ma-mode]");
 if(mode){state.mode=mode.dataset.maMode;state.page=0;render({focus:true});scrollToResults();return;}
 const action=event.target.closest("[data-ma-action]");
 if(action)handleAction(action.dataset.maAction);
});
root.addEventListener("submit",event=>{
 if(event.target.id==="maUploadForm"){event.preventDefault();void saveForm(event.target);return;}
 if(event.target.id==="maSearchForm"){
  event.preventDefault();const data=new FormData(event.target);
  state.filters={q:String(data.get("q")||"").trim(),type:String(data.get("type")||""),dependency:String(data.get("dependency")||""),year:String(data.get("year")||"")};
  state.page=0;render();scrollToResults();
 }
});
root.addEventListener("change",event=>{
 if(event.target.closest("#maSearchForm")&&event.target.tagName==="SELECT"){
  const form=root.querySelector("#maSearchForm");if(form)form.requestSubmit();
 }
});
root.addEventListener("cancel",event=>{if(["maFormDialog","maDetailDialog"].includes(event.target.id)){event.preventDefault();event.target.close();}});
async function init(){
 try{
  const stored=await TIData.read(KEY);
  const items=Array.isArray(stored?.records)?stored.records:[];
  state.records=items.filter(r=>r&&typeof r.id==="string"&&typeof r.title==="string"&&typeof r.dependency==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(r.dated||""));
  if(state.records.length!==items.length)state.error="Algunos registros incompletos se omitieron de esta vista.";
 }catch(error){state.error="No fue posible leer el archivo de este navegador: "+error.message;}
 finally{state.ready=true;render();}
}
void init();
})();
