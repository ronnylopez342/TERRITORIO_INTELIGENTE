/* Vista visual de demostración 2.3.
   NINGUNO de estos números o documentos es información institucional verificada.
   Los datos oficiales/locales siguen aislados en js/memoria-alcaldia.js.
   Referencia visual: maqueta aprobada de Memoria de la Alcaldía. */
(function initMemoriaDemo(){
"use strict";
const departments=Object.freeze([
 {name:"Secretaría de Planeación",short:"Secretaría de Planeación",value:1284},
 {name:"Secretaría de Gobierno",short:"Secretaría de Gobierno",value:892},
 {name:"Secretaría de Hacienda",short:"Secretaría de Hacienda",value:743},
 {name:"Secretaría de Infraestructura",short:"Secretaría de Infraestructura",value:620},
 {name:"Secretaría de Desarrollo Social",short:"Secretaría de Desarrollo Social",value:518},
 {name:"Secretaría de Ambiente",short:"Secretaría de Ambiente",value:410},
 {name:"Oficina de Control Interno",short:"Oficina de Control Interno",value:308},
 {name:"Despacho del Alcalde",short:"Despacho del Alcalde",value:296},
 {name:"Otras dependencias",short:"Otras dependencias",value:182}
]);
const docs=Object.freeze([
 {id:"demo-acuerdo",title:"Acuerdo 004 de 2024 – Plan de Desarrollo Municipal",type:"Acuerdo",dependency:"Despacho del Alcalde",date:"2024-03-12",shortDate:"12 mar 2024"},
 {id:"demo-decreto",title:"Decreto 023 de 2024 – Ajuste presupuestal",type:"Decreto",dependency:"Secretaría de Hacienda",date:"2024-02-28",shortDate:"28 feb 2024"},
 {id:"demo-informe",title:"Informe de gestión 2023",type:"Informe",dependency:"Secretaría de Planeación",date:"2024-01-15",shortDate:"15 ene 2024"},
 {id:"demo-pot",title:"Plan de Ordenamiento Territorial – Documento técnico",type:"Plan",dependency:"Secretaría de Planeación",date:"2024-02-02",shortDate:"02 feb 2024"},
 {id:"demo-licencias",title:"Histórico de licencias urbanísticas 2010–2024",type:"Informe",dependency:"Secretaría de Infraestructura",date:"2024-01-26",shortDate:"26 ene 2024"}
]);
const events=Object.freeze([
 {year:1984,title:"Primeros registros municipales digitalizados"},
 {year:1997,title:"Reorganización institucional"},
 {year:2005,title:"Plan de desarrollo territorial"},
 {year:2012,title:"Modernización de archivos"},
 {year:2018,title:"Implementación de gestión documental"},
 {year:2024,title:"Territorio Inteligente y datos abiertos"}
]);
const metrics=Object.freeze({documents:5253,digitized:3572,pending:1681,digitizedPercent:68,pendingPercent:32,departments:11,firstYear:1984,lastYear:2024,documentChange:12,digitalChange:18,departmentChange:0,yearChange:4});
const sum=departments.reduce((s,x)=>s+x.value,0);
if(sum!==metrics.documents || metrics.digitized+metrics.pending!==metrics.documents)throw new Error("Inconsistent illustrative mockup data");
const safe=t=>String(t??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const num=n=>new Intl.NumberFormat("es-CO").format(n);
function departmentsChart(){
 const max=departments[0].value;
 return '<div class="ma-hbars ma-demo-bars" role="img" aria-label="Ejemplo ilustrativo de documentos por dependencia: '+safe(departments.map(x=>x.name+": "+x.value).join(", "))+'">'+
  departments.map(d=>'<div class="ma-hbar"><span class="ma-hbar-name" title="'+safe(d.name)+'">'+safe(d.short)+'</span><div class="ma-hbar-track"><span class="ma-hbar-fill" style="width:'+(100*d.value/max).toFixed(2)+'%"></span></div><b>'+num(d.value)+'</b></div>').join("")+'</div>';
}
function archiveStatus(){
 return '<div class="ma-archive-state ma-demo-archive-status"><div class="ma-donut" role="img" aria-label="Demostración: 68 % digitalizados, 32 % por digitalizar" style="background:conic-gradient(#ffdc26 0 68%,#709af5 68% 100%)"><div class="ma-donut-value"><strong>5.253</strong><small>documentos<br>totales</small></div></div><div class="ma-archive-state-legend">'+
  '<div><i class="ma-color" style="background:#ffdc26"></i><span><strong>68%</strong><small>Digitalizados<br>3.572 documentos</small></span></div>'+
  '<div><i class="ma-color" style="background:#709af5"></i><span><strong>32%</strong><small>Pendientes de digitalización<br>1.681 documentos</small></span></div></div></div>';
}
const icons={
 documents:'<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M6 2h12l6 6v18H6zM18 2v7h6M10 15h10M10 19h10" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
 digital:'<svg viewBox="0 0 28 28" aria-hidden="true"><ellipse cx="14" cy="6" rx="10" ry="4" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M4 6v8c0 2.5 4.5 4 10 4s10-1.5 10-4V6M4 14v8c0 2.5 4.5 4 10 4s10-1.5 10-4v-8" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
 dependency:'<svg viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="5" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="5" cy="23" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="14" cy="23" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="23" cy="23" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M14 8v7M5 15h18M5 15v5M14 15v5M23 15v5" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
 clock:'<svg viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="11" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M14 6v9l5 3" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>'
};
function keyMetrics(){
 const cells=[
  ["documents","5.253","Documentos totales","↑ +12%","vs. 2023","up"],
  ["digital","3.572","Documentos digitalizados","↑ +18%","vs. 2023","up"],
  ["dependency","11","Dependencias activas","→ 0%","vs. 2023","flat"],
  ["clock","1984–2024","Rango histórico","+4","años","up"]
 ];
 return '<div class="ma-key-metrics ma-demo-key-metrics">'+cells.map(([icon,value,label,delta,compare,color])=>
  '<div class="ma-key-metric ma-demo-kpi"><span class="ma-key-symbol">'+icons[icon]+'</span>'+
  '<div class="ma-demo-kpi-value"><strong>'+safe(value)+'</strong><small>'+safe(label)+'</small></div>'+
  '<div class="ma-demo-kpi-change '+(color==="up"?"ma-positive":"ma-neutral")+'"><b>'+safe(delta)+'</b><small>'+safe(compare)+'</small></div></div>'
 ).join('')+'</div>';
}
function documentsList(items=docs){
 if(!items.length)return '<p class="ma-demo-notice">No hay documentos de ejemplo que coincidan con esta búsqueda.</p>';
 return '<div class="ma-demo-documents" role="list">'+items.map(d=>
  '<div class="ma-demo-document" role="listitem"><button type="button" class="ma-demo-doc-title" data-ma-demo-doc="'+safe(d.id)+'" title="Ficha de muestra — no es un documento oficial descargable"><span class="ma-demo-file-icon" aria-hidden="true">'+icons.documents+'</span>'+safe(d.title)+'</button>'+
  '<span class="ma-demo-doc-dep">'+safe(d.dependency)+'</span><span class="ma-demo-doc-date">'+safe(d.shortDate)+'</span>'+
  '<button type="button" class="ma-demo-doc-open" data-ma-demo-doc="'+safe(d.id)+'" aria-label="Abrir ficha de demostración de '+safe(d.title)+'">↓</button></div>'
 ).join('')+'</div>';
}
function timeline(){
 return '<div class="ma-timeline-horizontal ma-demo-timeline" role="list" aria-label="Cronología ilustrativa de la memoria municipal"><div class="ma-timeline-axis" aria-hidden="true"></div>'+
  events.map((e,i)=>'<button type="button" role="listitem" class="ma-time-point" data-ma-demo-event="'+e.year+'" title="Hito de la demostración visual"><span class="ma-time-dot" aria-hidden="true"></span><b>'+e.year+'</b><small>'+safe(e.title)+'</small></button>').join('')+
  '</div>';
}
function filteredDocs(filters){
 const q=String(filters?.q||"").trim().toLocaleLowerCase("es"),type=String(filters?.type||""),dep=String(filters?.dependency||""),year=String(filters?.year||"");
 return docs.filter(d=>(!type||d.type===type)&&(!dep||d.dependency===dep)&&(!year||d.date.slice(0,4)===year)&&(!q||[d.title,d.type,d.dependency,d.date].some(s=>s.toLocaleLowerCase("es").includes(q))));
}
function dashboard(panel,filters){
 const filtered=filteredDocs(filters);
 const link=(mode,label)=>'<button class="ma-text-link" type="button" data-ma-mode="'+mode+'">'+label+' →</button>';
 return '<div class="ma-grid ma-grid-analytics ma-demo-dashboard" id="maBoard">'+
  panel("Documentos por dependencia",departmentsChart(),5,"",link("dependencies","Ver todas"))+
  panel("Estado del archivo municipal",archiveStatus(),3)+
  panel("Indicadores clave",keyMetrics(),4)+
  '</div><div class="ma-grid ma-grid-doc-history ma-demo-dashboard">'+
  panel("Documentos recientes",documentsList(filtered),6,"",link("documents","Ver todos"))+
  panel("Línea de tiempo de la memoria institucional",timeline(),6,"",link("history","Ver serie completa"))+'</div>';
}
function modalContent(id){
 const d=docs.find(x=>x.id===id);if(!d)return"";
 return '<h2 id="maDetailHeading">'+safe(d.title)+'</h2>'+
  '<p class="ma-demo-modal-warning">FICHA DE DEMOSTRACIÓN · No corresponde a un documento oficial verificado.</p>'+
  '<dl class="ma-fiche"><dt>Tipo</dt><dd>'+safe(d.type)+'</dd><dt>Dependencia</dt><dd>'+safe(d.dependency)+'</dd><dt>Fecha mostrada</dt><dd>'+safe(d.shortDate)+'</dd><dt>Disponibilidad</dt><dd>Sin archivo descargable. Este registro existe únicamente en la maqueta.</dd></dl>'+
  '<div class="ma-dialog-actions"><button type="button" class="ma-btn ma-primary" data-ma-action="close">Cerrar ficha</button><button type="button" class="ma-btn" data-ma-action="new">Agregar un documento real +</button></div>';
}
function modalEvent(year){
 const event=events.find(x=>x.year===year);if(!event)return"";
 return '<h2 id="maDetailHeading">'+event.year+' · '+safe(event.title)+'</h2>'+
  '<p class="ma-demo-modal-warning">HITO ILUSTRATIVO · La fecha y la descripción reproducen la referencia de diseño; aún no están respaldadas por un documento histórico oficial.</p>'+
  '<div class="ma-dialog-actions"><button type="button" class="ma-btn ma-primary" data-ma-action="close">Cerrar</button><button type="button" class="ma-btn" data-ma-action="new">Vincular documento real</button></div>';
}
window.TI_MA_DEMO=Object.freeze({
 data:Object.freeze({departments,docs,events,metrics}),
 filteredDocs,departmentsChart,archiveStatus,keyMetrics,documentsList,timeline,dashboard,modalContent,modalEvent
});
})();
