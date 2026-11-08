/* Navegacion y vistas 3-4, identidad Territorio Inteligente. */
(function installTI34(){
'use strict';
const qs=(s,el=document)=>el.querySelector(s);
const inventory=[
 ['automoviles','4.4.1','Automóviles','Carros, camionetas, camperos y similares','🚙'],
 ['motocicletas','4.4.2','Motocicletas','Motocicletas de la administración municipal','◉'],
 ['carga','4.4.3','Vehículos de carga','Camiones, volquetas y tractocamiones','▣'],
 ['especiales','4.4.4','Vehículos especiales','Ambulancias, buses y vehículos de servicios públicos','✚'],
 ['amarilla','4.4.5','Maquinaria amarilla','Retroexcavadoras, excavadoras, motoniveladoras, cargadores, vibrocompactadores, bulldozers y minicargadores','⚙']
];
const oldProjects=[
 ['cumplimiento-placas','Placas huellas'],
 ['cumplimiento-mujer','Casa de la Mujer'],
 ['cumplimiento-colegio','Colegio'],
 ['cumplimiento-mercado','Plaza de mercado'],
 ['cumplimiento-vivienda','Mejoramiento de vivienda'],
 ['cumplimiento-hospital','Hospital'],
 ['cumplimiento-museo','Museo municipal']
];
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function button(id,num,label,selected=false,child=false){
 return `<button type="button" id="tab-${id}" class="module-tab ti34-tab${selected?' active':''}${child?' ti34-child':''}" role="tab" aria-controls="${id}" aria-selected="${selected}" tabindex="${selected?0:-1}" data-module-panel="${id}"><span class="ti34-nav-number">${num||'•'}</span><span class="ti34-nav-label">${safe(label)}</span><span aria-hidden="true" class="ti34-chevron">›</span></button>`;
}
function group(id,num,name,sub){
 return `<div class="ti34-group"><div class="ti34-group-head">${button(id,num,name)}<button type="button" class="ti34-toggle" data-ti34-toggle aria-expanded="true" aria-controls="ti34-sub-${id}" aria-label="Mostrar u ocultar ${safe(name)}">⌄</button></div><div class="ti34-subnav" id="ti34-sub-${id}">${sub.map(s=>button(...s,false,true)).join('')}</div></div>`;
}
function card(title,body,extra=''){
 return `<article class="ti34-card ${extra}"><h3>${safe(title)}</h3>${body}</article>`;
}
function empty(title,description){
 return `<div class="ti34-empty"><strong>${safe(title)}</strong><p>${safe(description)}</p><span>INFORMACIÓN POR INCORPORAR</span></div>`;
}
function indicators(labels){
 return `<div class="ti34-indicators">${labels.map((t,i)=>`<div class="ti34-indicator"><span class="ti34-indicator-symbol">${['◎','▥','◈','▣'][i%4]}</span><strong>—</strong><span>${safe(t)}</span><small>Sin cifra verificada</small></div>`).join('')}</div>`;
}
function tiles(list){
 return `<div class="ti34-tiles">${list.map((x,i)=>`<div class="ti34-tile ti34-tile-${i%6}"><span class="ti34-tile-symbol">${['♧','♢','▥','✳','❖','⌁'][i%6]}</span><strong>${safe(x)}</strong></div>`).join('')}</div>`;
}
function fakeChart(title){
 return card(title,`<div class="ti34-chart"><div class="ti34-chart-lines"><i></i><i></i><i></i><i></i></div><div class="ti34-chart-label">DATOS OFICIALES PENDIENTES<br><small>La gráfica se mostrará cuando se publiquen indicadores verificables.</small></div></div>`,'ti34-card--chart');
}
function linkPanel(id,txt){return `<button type="button" class="ti34-link" data-ti34-go="${id}">${safe(txt)} <span aria-hidden="true">↗</span></button>`;}
function pane(route,id,num,title,intro,body,active=false){
 return `<section id="${id}" class="module-panel ti34-pane${active?' active':''}" data-panel-group="${route}" role="tabpanel" aria-labelledby="tab-${id}"${active?'':' hidden'}><p class="ti-section-index">${num} / ${route==='desarrollo'?'PLAN DE DESARROLLO':'UNIDAD DE CUMPLIMIENTO'}</p><div class="ti34-content-head"><h2>${safe(title)}</h2><span>SUBACHOQUE · CUNDINAMARCA</span></div><p class="ti34-content-lead">${safe(intro)}</p>${body}</section>`;
}
function video(route){
 const isPlan=route==='desarrollo';
 return `<section class="ti-intro-video ti34-video" aria-labelledby="ti34-video-title-${route}"><div class="ti-video-copy"><h2 id="ti34-video-title-${route}">Conoce ${isPlan?'el Plan de Desarrollo':'la Unidad de Cumplimiento'} en video</h2><p>${isPlan?'Qué es, cómo se construye y cómo orienta las decisiones municipales.':'Qué es, cómo funciona y cómo se realiza el seguimiento de los proyectos estratégicos.'}</p></div><div class="ti-video-placeholder" role="img" aria-label="Espacio reservado para video explicativo, todavía no disponible"><span class="ti-video-play" aria-hidden="true">▶</span><span class="ti-video-status">VIDEO POR INCORPORAR</span></div></section>`;
}
function shell(route,nav,panels){
 const isPlan=route==='desarrollo';
 const title=isPlan?'PLAN DE<br>DESARROLLO':'UNIDAD DE<br>CUMPLIMIENTO';
 const description=isPlan?'Instrumento de planificación que orienta las decisiones, inversiones y metas de la administración municipal.':'Seguimiento a los proyectos estratégicos, sus responsables, evidencias y resultados para el territorio.';
 return `<header class="ti-module-hero ti34-hero"><div class="inner"><p class="ti34-breadcrumb" id="ti34-breadcrumb-${route}">${isPlan?'Plan de Desarrollo / 3.1 Conoce el Plan de Desarrollo':'Unidad de Cumplimiento / 4.1 Conoce la Unidad'}</p><div class="ti34-hero-main"><span class="ti34-hero-icon">${isPlan?'▤':'◎'}</span><div><h1 tabindex="-1">${title}${isPlan?'':'<br><span>DE PROYECTOS ESTRATÉGICOS</span>'}</h1><p>${description}</p><div class="ti34-tags">${(isPlan?['Planeación','Participación','Inversión','Bienestar','Territorio']:['Seguimiento','Transparencia','Resultados','Proyectos estratégicos']).map(x=>`<span>${x}</span>`).join('')}</div></div></div><span class="ti34-photo-caption">Subachoque, Cundinamarca</span></div></header>${video(route)}<div class="ti-module-layout inner ti34-layout"><aside class="ti34-sidebar"><div class="ti34-sidebar-title"><span>${isPlan?'▤':'◎'}</span><div><small>SECCIONES DEL MÓDULO</small><h2>${isPlan?'3. PLAN DE DESARROLLO':'4. UNIDAD DE CUMPLIMIENTO'}</h2></div></div><nav id="${isPlan?'desarrolloSubnav':'cumplimientoSubnav'}" class="module-subnav ti34-nav" role="tablist" aria-label="Secciones de ${isPlan?'Plan de Desarrollo':'Unidad de Cumplimiento'}">${nav}</nav><p class="ti34-nav-hint">${isPlan?'Selecciona una de las cuatro secciones del Plan de Desarrollo.':'Selecciona una sección o despliega sus subapartados.'}</p></aside><div class="ti-module-content ti34-content">${panels}</div></div>`;
}
function renderPlan(){
 const nav=button('desarrollo-conoce','3.1','Conoce el Plan de Desarrollo',true)+button('desarrollo-cumplimos','3.2','Así cumplimos')+button('desarrollo-accion','3.3','Planes de acción')+button('desarrollo-contratacion','3.4','Contratación');
 const intro=`${card('¿Qué es el Plan de Desarrollo?',`<p>Organiza los objetivos, programas y metas del gobierno municipal para orientar la gestión pública y el desarrollo territorial.</p><div class="ti34-doc">▤ &nbsp; DOCUMENTO OFICIAL: PENDIENTE DE VINCULAR</div>`,'ti34-feature')}${card('Temas de consulta',tiles(['Gobernanza','Seguimiento de metas','Participación ciudadana','Bienestar social','Sostenibilidad territorial','Infraestructura y movilidad']))}${card('Documentación del Plan',`<div class="ti34-three">${empty('Plan municipal','Archivo por vincular')}${empty('Matriz de metas','Indicadores por incorporar')}${empty('Informes de avance','Soportes por incorporar')}</div>`)}`;
 const comply=`${indicators(['Metas programadas','Metas con seguimiento','Avance verificado','Última actualización'])}<div class="ti34-two">${fakeChart('Avance general de metas')}${card('Seguimiento documentado',empty('Series de avance','No hay registros oficiales asociados a esta vista.'))}</div>${card('Etapas del seguimiento',tiles(['Meta definida','Información reportada','Validación documental','Resultado publicado']))}`;
 const action=`${indicators(['Planes de acción registrados','Dependencias responsables','Actividades con seguimiento'])}<div class="ti34-three">${card('Planes por dependencia',empty('Documentos institucionales','Planes de acción oficiales pendientes de vincular.'))}${card('Seguimiento físico y financiero',empty('Indicadores y ejecución','Información de seguimiento pendiente de consolidación.'))}${card('Fuentes y soportes',empty('Evidencias documentales','Archivos y enlaces oficiales por incorporar.'))}</div>`;
 const contracts=`${indicators(['Procesos contractuales','Contratos documentados','Seguimiento verificado'])}<div class="ti34-three">${card('Procesos de contratación',empty('Información contractual','Procesos oficiales pendientes de vincular.'))}${card('Ejecución y seguimiento',empty('Estado y cumplimiento','Informes y soportes pendientes de consolidación.'))}${card('Documentos y fuentes',empty('Expedientes de contratación','Enlaces y documentos oficiales por incorporar.'))}</div>`;
 const panels=[
  pane('desarrollo','desarrollo-conoce','3.1','Conoce el Plan de Desarrollo','Consulta las prioridades, objetivos y principales componentes del plan municipal.',intro,true),
  pane('desarrollo','desarrollo-cumplimos','3.2','Así cumplimos','Seguimiento a las metas y compromisos municipales con respaldo documental.',comply),
  pane('desarrollo','desarrollo-accion','3.3','Planes de acción','Consulta los planes de acción por dependencia y su seguimiento.',action),
  pane('desarrollo','desarrollo-contratacion','3.4','Contratación','Consulta los procesos contractuales y su documentación de seguimiento.',contracts)
 ].join('');
 return shell('desarrollo',nav,panels);
}
function projectList(legacy){
 return `<label class="ti34-search">⌕ <input type="search" data-ti34-search placeholder="Buscar proyecto estratégico..." aria-label="Buscar proyecto estratégico"></label><div class="ti34-project-list">${oldProjects.map(([id,title])=>`<details class="ti34-project" data-ti34-project="${safe(title.toLowerCase())}"><summary><span>▤</span><strong>${safe(title)}</strong><small>FICHA EN PREPARACIÓN</small><span>⌄</span></summary><div class="ti34-project-details">${legacy[id]||empty('Expediente','No disponible.')}</div></details>`).join('')}<p class="ti34-no-results" hidden>No hay proyectos con ese nombre.</p></div><p class="ti34-disclaimer">Se conservaron los expedientes anteriores. Los campos por documentar no representan avances ejecutados.</p>`;
}
function renderUnitOverview41(){
 const icon=(id)=>{const body={
 projects:'<path d="M4 21V7h16v14M8 7V3h8v4M8 12h2m4 0h2M8 16h2m4 0h2M2 21h20"/>',
 inventory:'<rect x="2" y="8" width="20" height="10" rx="2"/><path d="m5 8 2-4h10l2 4M6 18v2m12-2v2"/><circle cx="7" cy="15" r="1"/><circle cx="17" cy="15" r="1"/>',
 studies:'<path d="M12 21c-3-2-6-3-10-3V4c4 0 7 1 10 3 3-2 6-3 10-3v14c-4 0-7 1-10 3Z"/><path d="M12 7v14"/>',
 weekly:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 11h18M7 15h4m4 0h2"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
 route:'<path d="M4 20V5m8 15V9m8 11V3M2 21h20"/>',
 file:'<path d="M5 2h9l5 5v15H5zM14 2v6h5M8 12h8M8 16h8"/>',
 download:'<path d="M12 2v14m-5-5 5 5 5-5M4 18v4h16v-4"/>'
 };return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(body[id]||body.file)+'</svg>'};
 const stats=[
 ['namedProjectRows','projects','Filas con nombre de proyecto','Registros de proyectos; pueden existir nombres repetidos.','Proyectos DEFINITIVO'],
 ['uniqueVehicleIds','inventory','Identificadores de unidades','Vehículos y maquinaria reconocidos por su placa o ID.','Maquinaria'],
 ['namedStudies','studies','Iniciativas de estudios y diseños','Listadas sin porcentajes de avance documentados.','ESTUDIOS Y DISEÑOS'],
 ['weekly','weekly','Informes semanales','No se identificaron registros operativos completos.','Informe semanal']
 ].map(([key,symbol,title,description,sheet])=>'<article class="ti41-stat'+(key==='weekly'?' ti41-stat-weekly':'')+'">'+
   '<div class="ti41-stat-lead"><span class="ti41-stat-icon">'+icon(symbol)+'</span><div class="ti41-stat-name">'+
   (key==='weekly'?'<strong data-ti41-weekly>—</strong>':'<strong data-ti41-count="'+key+'">—</strong>')+
   '<b>'+title+'</b></div></div>'+
   '<p>'+description+'</p><small>Fuente: '+sheet+'</small></article>').join('');
 const cards=[
  ['file','¿De qué trata?','Conoce el propósito de la Unidad de Cumplimiento y la organización del seguimiento a proyectos.','Proyectos DEFINITIVO'],
  ['target','Alcance','Identifica la información disponible, los registros que se pueden consultar y los datos pendientes.','Cinco hojas del Excel'],
  ['route','Seguimiento','Explora cómo se relacionan proyectos, contratación, finanzas, riesgos y evidencias documentadas.','Proyectos DEFINITIVO'],
  ['studies','Fuentes y definiciones','Comprende las unidades, los criterios de interpretación y la procedencia de cada cifra.','Unidad de Cumplimiento.xlsx']
 ].map(([symbol,title,description,sheet])=>'<article class="ti41-topic"><span class="ti41-topic-icon">'+icon(symbol)+'</span>'+
 '<h3>'+title+'</h3><p>'+description+'</p><small>Fuente: '+sheet+'</small></article>').join('');
 return `<div class="ti41" aria-label="Introducción a la Unidad de Cumplimiento">
   <section class="ti41-showcase">
     <div class="ti41-intro">
       <span class="ti41-yellow-rule" aria-hidden="true"></span>
       <h1>UNIDAD DE<br>CUMPLIMIENTO</h1>
       <p class="ti41-lead">Conoce la información disponible sobre los proyectos estratégicos de Subachoque y cómo consultarla para comprender su seguimiento.</p>
       <p class="ti41-description">Este espacio organiza datos de proyectos, contratación, finanzas, riesgos, evidencias e inventario a partir de los archivos aportados. Los resultados no constituyen por sí mismos certificaciones de ejecución.</p>
     </div>
     <aside class="ti41-document" aria-label="Referencia documental de la Unidad de Cumplimiento">
       <div class="ti41-cover" role="img" aria-label="Portada ilustrativa de la Unidad de Cumplimiento; no es la portada de un documento municipal oficial.">
         <span class="ti41-cover-brand">TERRITORIO<br>INTELIGENTE</span>
         <span class="ti41-cover-rule" aria-hidden="true"></span>
         <strong>Unidad de<br>Cumplimiento<em>Proyectos estratégicos</em></strong>
         <span class="ti41-cover-note">Información que orienta.<br>Seguimiento con evidencia.</span>
         <span class="ti41-cover-landscape" aria-hidden="true"></span>
       </div>
       <div class="ti41-document-info">
         <h2>Unidad de Cumplimiento</h2>
         <p>Referencia de diseño con diez vistas para proyectos, contratos, finanzas, cronograma, mapa, evidencias, indicadores, riesgos y documentos.</p>
         <button type="button" class="ti41-document-action ti41-document-open" data-ti41-open-doc aria-haspopup="dialog" aria-controls="ti41-doc-dialog">${icon('file')}<span>VER REFERENCIA</span><b aria-hidden="true">→</b></button>
         <button type="button" class="ti41-document-action ti41-document-download" disabled aria-label="La descarga del Word original aún no está publicada en el sitio">${icon('download')}<span>DESCARGAR WORD</span><b aria-hidden="true">→</b></button>
         <small>Referencia Word aportada · El archivo original no está alojado públicamente. No equivale a una aprobación municipal.</small>
       </div>
     </aside>
   </section>
   <section class="ti41-stats" aria-label="Indicadores extraídos del Excel">${stats}</section>
   <section class="ti41-topics" aria-label="Temas de la Unidad de Cumplimiento">${cards}</section>
   <p class="ti41-data-status" role="status" aria-live="polite">Consultando el resumen del Excel suministrado…</p>
   <dialog class="ti41-dialog" id="ti41-doc-dialog" aria-labelledby="ti41-doc-title">
     <div class="ti41-dialog-head"><div><span>DOCUMENTO DE REFERENCIA · WORD</span><h2 id="ti41-doc-title">Unidad de Cumplimiento</h2></div><button type="button" data-ti41-close aria-label="Cerrar">×</button></div>
     <div class="ti41-dialog-body"><p>El Word aportado contiene diez diseños de interfaz para 4.2 Así cumplimos — Proyectos Estratégicos. Es una referencia de presentación; los datos deben proceder del Excel.</p>
       <ol><li>Resumen</li><li>Proyectos</li><li>Contratos</li><li>Ejecución financiera</li><li>Cronograma</li><li>Mapa</li><li>Evidencias</li><li>Indicadores</li><li>Riesgos</li><li>Documentos</li></ol>
       <p class="ti41-dialog-note">El documento Word completo todavía no está alojado en el sitio. Esta vista explica su contenido y no reemplaza la descarga del original.</p>
     </div>
   </dialog>
 </div>`;
}
async function loadUnitOverview41(){
 const root=qs('#cumplimiento-conoce',u);
 if(!root)return;
 const status=qs('.ti41-data-status',root);
 try{
  const response=await fetch('data/unidad-cumplimiento-4-1.json?v=20261108-41-v1',{cache:'no-cache'});
  if(!response.ok)throw new Error('Archivo de datos no disponible');
  const data=await response.json();
  if(data?.schemaVersion!==1||!data.metrics||!data.weekly)throw new Error('Datos no válidos');
  for(const key of ['namedProjectRows','uniqueVehicleIds','namedStudies']){
   const value=data.metrics[key]?.value;
   if(!Number.isInteger(value)||value<0)throw new Error('Falta el dato '+key);
   const el=qs('[data-ti41-count="'+key+'"]',root);
   if(el){el.textContent=new Intl.NumberFormat('es-CO').format(value);el.title=String(data.metrics[key].detail||'');}
  }
  const weekly=qs('[data-ti41-weekly]',root);
  if(weekly)weekly.textContent=String(data.weekly.state||'Información no registrada');
  if(status)status.textContent='Fuente: '+String(data.source?.filename||'archivo suministrado')+' · Cifras derivadas del Excel aportado; no representan indicadores oficiales certificados.';
 }catch(_error){
  root.querySelectorAll('[data-ti41-count]').forEach(el=>{el.textContent='—';});
  const weekly=qs('[data-ti41-weekly]',root);
  if(weekly)weekly.textContent='Sin datos disponibles';
  if(status)status.textContent='No fue posible consultar el resumen del Excel. Se conserva la orientación sin presentar cifras no verificadas.';
 }
}
function renderUnit(legacy){
 const nav=button('cumplimiento-conoce','4.1','Conoce la Unidad de Cumplimiento',true)+button('cumplimiento-proyectos','4.2','Así cumplimos – Proyectos estratégicos')+button('cumplimiento-alumbrado','4.3','Alumbrado público')+group('cumplimiento-inventario','4.4','Inventario automotor',inventory.map(i=>['cumplimiento-inventario-'+i[0],i[1],i[2]]));
 const intro=renderUnitOverview41();
 const light=indicators(['Luminarias registradas','Mantenimiento reportado','Cobertura verificada'])+`<div class="ti34-two">${fakeChart('Cobertura de alumbrado público')}${card('Mapa y localización',empty('Infraestructura georreferenciada','Pendiente de inventario oficial.'))}</div><div class="ti34-three">${card('Inventario de luminarias',empty('Registros','Por incorporar.'))}${card('Operación y mantenimiento',empty('Intervenciones','Por documentar.'))}${card('Documentación contractual',empty('Contratos y actas','Por vincular.'))}</div>`;
 const catalog=`<div class="ti34-inventory-grid">${inventory.map(i=>`<button type="button" class="ti34-inventory-item" data-ti34-go="cumplimiento-inventario-${i[0]}"><span>${i[4]}</span><small>${i[1]}</small><strong>${i[2]}</strong><p>${i[3]}</p><em>Consultar categoría →</em></button>`).join('')}</div>${indicators(['Unidades registradas','Fichas verificadas','Mantenimientos reportados'])}<p class="ti34-disclaimer">La estructura del inventario está habilitada sin introducir unidades ficticias.</p>`;
 const panes=[
 pane('cumplimiento','cumplimiento-conoce','4.1','Conoce la Unidad de Cumplimiento','Conoce cómo se organizan los proyectos, el seguimiento y la rendición de resultados.',intro,true),
 pane('cumplimiento','cumplimiento-proyectos','4.2','Así cumplimos – Proyectos estratégicos','Selecciona los expedientes estratégicos que ya existían en el proyecto.',projectList(legacy)),
 pane('cumplimiento','cumplimiento-alumbrado','4.3','Alumbrado público','Servicio, cobertura, mantenimiento y documentación con fuentes verificables.',light),
 pane('cumplimiento','cumplimiento-inventario','4.4','Inventario automotor','Explora la clasificación de vehículos y maquinaria de la administración municipal.',catalog),
 ...inventory.map(i=>pane('cumplimiento','cumplimiento-inventario-'+i[0],i[1],i[2],i[3]+'. Consulta de identificación, operación y mantenimiento.',`<div class="ti34-year-banner"><span>INVENTARIO AUTOMOTOR</span><strong>${i[1]}</strong><em>${i[2]}</em></div>${indicators(['Unidades documentadas','Registros completos','Mantenimientos verificados'])}<div class="ti34-three">${card('Identificación',empty('Ficha técnica','Placa, código, marca y modelo.'))}${card('Estado operativo',empty('Asignación y uso','Dependencia y responsable.'))}${card('Mantenimiento',empty('Seguimiento','Revisiones, pólizas y documentación.'))}</div>${linkPanel('cumplimiento-inventario','Volver a todo el inventario')}`))
 ].join('');
 return shell('cumplimiento',nav,panes);
}
const d=qs('.app-view[data-view="desarrollo"]'),u=qs('.app-view[data-view="cumplimiento"]');
if(!d||!u)return;
const legacy={};
oldProjects.forEach(([id])=>{const old=qs('#'+id,u);legacy[id]=old?(qs('.ti-project-fields',old)?.outerHTML||'')+(qs('.ti-project-components',old)?.outerHTML||''):'';});
d.innerHTML=renderPlan();
u.innerHTML=renderUnit(legacy);
loadUnitOverview41();
u.addEventListener('click',event=>{
 const btn=event.target.closest('[data-ti41-open-doc]');
 if(btn){const modal=qs('#ti41-doc-dialog',u);if(modal&&!modal.open)modal.showModal();return;}
 const close=event.target.closest('[data-ti41-close]');
 if(close)close.closest('dialog')?.close();
});

[d,u].forEach(root=>{
 root.classList.add('ti34-ready');
 root.addEventListener('click',event=>{
  const toggle=event.target.closest('[data-ti34-toggle]');
  if(toggle){const sub=qs('.ti34-subnav',toggle.closest('.ti34-group'));sub.hidden=!sub.hidden;toggle.setAttribute('aria-expanded',String(!sub.hidden));return;}
  const go=event.target.closest('[data-ti34-go]');
  if(go){const target=go.getAttribute('data-ti34-go');if(typeof saveModuleSection==='function')saveModuleSection(target,root.dataset.view);qs('.ti34-layout',root)?.scrollIntoView({behavior:'smooth',block:'start'});}
 });
 root.addEventListener('input',event=>{
  const input=event.target.closest('[data-ti34-search]');if(!input)return;
  const rows=[...root.querySelectorAll('[data-ti34-project]')];
  const term=input.value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  let count=0;
  rows.forEach(row=>{const label=row.dataset.ti34Project.normalize('NFD').replace(/[\u0300-\u036f]/g,'');row.hidden=!!term&&!label.includes(term);if(!row.hidden)count++;});
  qs('.ti34-no-results',root).hidden=!!count;
 });
});
function sync(){
 [d,u].forEach(root=>{
  const active=qs('.ti34-nav .module-tab.active',root);
  if(!active)return;
  const n=qs('.ti34-nav-number',active)?.textContent||'';
  const l=qs('.ti34-nav-label',active)?.textContent||'';
  const crumb=qs('#ti34-breadcrumb-'+root.dataset.view,root);
  if(crumb)crumb.textContent=(root===d?'Plan de Desarrollo':'Unidad de Cumplimiento')+' / '+n+' '+l;
  root.querySelectorAll('.ti34-group').forEach(g=>{
   const selected=!!qs('.ti34-child.active, .ti34-group-head .module-tab.active',g);
   g.classList.toggle('ti34-selected',selected);
   if(selected&&qs('.ti34-child.active',g)){const sub=qs('.ti34-subnav',g),tog=qs('.ti34-toggle',g);sub.hidden=false;tog.setAttribute('aria-expanded','true');}
  });
 });
}
document.addEventListener('click',event=>{if(event.target.closest('.ti34-nav .module-tab'))queueMicrotask(sync);});
addEventListener('popstate',sync);addEventListener('hashchange',sync);document.addEventListener('DOMContentLoaded',sync);
})();
