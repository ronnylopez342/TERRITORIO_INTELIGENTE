/* Navegacion y vistas 3-4, identidad Territorio Inteligente. */
(function installTI34(){
'use strict';
const qs=(s,el=document)=>el.querySelector(s);
const years=['2024','2025','2026'];
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
 return `<header class="ti-module-hero ti34-hero"><div class="inner"><p class="ti34-breadcrumb" id="ti34-breadcrumb-${route}">${isPlan?'Plan de Desarrollo / 3.1 Conoce el Plan de Desarrollo':'Unidad de Cumplimiento / 4.1 Conoce la Unidad'}</p><div class="ti34-hero-main"><span class="ti34-hero-icon">${isPlan?'▤':'◎'}</span><div><h1 tabindex="-1">${title}${isPlan?'':'<br><span>DE PROYECTOS ESTRATÉGICOS</span>'}</h1><p>${description}</p><div class="ti34-tags">${(isPlan?['Planeación','Participación','Inversión','Bienestar','Territorio']:['Seguimiento','Transparencia','Resultados','Proyectos estratégicos']).map(x=>`<span>${x}</span>`).join('')}</div></div></div><span class="ti34-photo-caption">Subachoque, Cundinamarca</span></div></header>${video(route)}<div class="ti-module-layout inner ti34-layout"><aside class="ti34-sidebar"><div class="ti34-sidebar-title"><span>${isPlan?'▤':'◎'}</span><div><small>SECCIONES DEL MÓDULO</small><h2>${isPlan?'3. PLAN DE DESARROLLO':'4. UNIDAD DE CUMPLIMIENTO'}</h2></div></div><nav id="${isPlan?'desarrolloSubnav':'cumplimientoSubnav'}" class="module-subnav ti34-nav" role="tablist" aria-label="Secciones de ${isPlan?'Plan de Desarrollo':'Unidad de Cumplimiento'}">${nav}</nav><p class="ti34-nav-hint">Selecciona una sección o despliega sus subapartados.</p></aside><div class="ti-module-content ti34-content">${panels}</div></div>`;
}
function yearsLanding(kind){
 const label=kind==='accion'?'Planes de acción':'Contratación';
 return `<div class="ti34-year-grid">${years.map(y=>`<article class="ti34-year"><span>VIGENCIA</span><strong>${y}</strong><p>${label} · documentación y seguimiento anual.</p>${linkPanel('desarrollo-'+kind+'-'+y,'Consultar '+y)}</article>`).join('')}</div>${empty('Repositorios por vigencia','Los expedientes, archivos y resultados se mostrarán cuando se vinculen documentos oficiales.')}`;
}
function yearPane(kind,y){
 const isAction=kind==='accion';
 return `<div class="ti34-year-banner"><span>VIGENCIA SELECCIONADA</span><strong>${y}</strong><em>${isAction?'PLANES DE ACCIÓN':'CONTRATACIÓN'}</em></div>${indicators(isAction?['Planes registrados','Actividades reportadas','Avance documentado']:['Procesos publicados','Contratos respaldados','Documentos verificados'])}<div class="ti34-three">${card(isAction?'Planes por dependencia':'Procesos contractuales',empty('Archivo anual','Pendiente de vincular.'))}${card('Seguimiento',empty('Información de ejecución','Pendiente de consolidación oficial.'))}${card('Fuentes y documentos',empty('Soportes oficiales','Enlaces y documentos por incorporar.'))}</div><div class="ti34-back">${linkPanel('desarrollo-'+kind,'Volver a '+(isAction?'planes de acción':'contratación'))}</div>`;
}
function renderPlan(){
 const nav=button('desarrollo-conoce','3.1','Conoce el Plan de Desarrollo',true)+button('desarrollo-cumplimos','3.2','Así cumplimos')+group('desarrollo-accion','3.3','Planes de acción',years.map(y=>['desarrollo-accion-'+y,'·','Año '+y]))+group('desarrollo-contratacion','3.4','Contratación',years.map(y=>['desarrollo-contratacion-'+y,'·','Año '+y]))+button('desarrollo-gestion','3.5','Acciones de gestión municipal');
 const intro=`${card('¿Qué es el Plan de Desarrollo?',`<p>Organiza los objetivos, programas y metas del gobierno municipal para orientar la gestión pública y el desarrollo territorial.</p><div class="ti34-doc">▤ &nbsp; DOCUMENTO OFICIAL: PENDIENTE DE VINCULAR</div>`,'ti34-feature')}${card('Temas de consulta',tiles(['Gobernanza','Seguimiento de metas','Participación ciudadana','Bienestar social','Sostenibilidad territorial','Infraestructura y movilidad']))}${card('Documentación del Plan',`<div class="ti34-three">${empty('Plan municipal','Archivo por vincular')}${empty('Matriz de metas','Indicadores por incorporar')}${empty('Informes de avance','Soportes por incorporar')}</div>`)}`;
 const comply=`${indicators(['Metas programadas','Metas con seguimiento','Avance verificado','Última actualización'])}<div class="ti34-two">${fakeChart('Avance general de metas')}${card('Seguimiento documentado',empty('Series de avance','No hay registros oficiales asociados a esta vista.'))}</div>${card('Etapas del seguimiento',tiles(['Meta definida','Información reportada','Validación documental','Resultado publicado']))}`;
 const navYears=(kind,title,number)=>pane('desarrollo','desarrollo-'+kind,number,title,'Selecciona una vigencia para consultar los archivos y el seguimiento oficial.',yearsLanding(kind));
 const panels=[
 pane('desarrollo','desarrollo-conoce','3.1','Conoce el Plan de Desarrollo','Consulta las prioridades, objetivos y principales componentes del plan municipal.',intro,true),
 pane('desarrollo','desarrollo-cumplimos','3.2','Así cumplimos','Seguimiento a las metas y compromisos municipales con respaldo documental.',comply),
 navYears('accion','Planes de acción','3.3'),
 ...years.map(y=>pane('desarrollo','desarrollo-accion-'+y,'3.3 / '+y,'Planes de acción · '+y,'Información de la vigencia '+y+'.',yearPane('accion',y))),
 navYears('contratacion','Contratación','3.4'),
 ...years.map(y=>pane('desarrollo','desarrollo-contratacion-'+y,'3.4 / '+y,'Contratación · '+y,'Información contractual de la vigencia '+y+'.',yearPane('contratacion',y))),
 pane('desarrollo','desarrollo-gestion','3.5','Acciones de gestión municipal','Acciones institucionales clasificadas para su consulta, seguimiento y verificación.',tiles(['Gestión institucional','Atención ciudadana','Obras e infraestructura','Ambiente y territorio','Servicios públicos','Articulación territorial'])+empty('Reportes de gestión','Las acciones específicas y sus evidencias están pendientes de incorporación.'))
 ].join('');
 return shell('desarrollo',nav,panels);
}
function projectList(legacy){
 return `<label class="ti34-search">⌕ <input type="search" data-ti34-search placeholder="Buscar proyecto estratégico..." aria-label="Buscar proyecto estratégico"></label><div class="ti34-project-list">${oldProjects.map(([id,title])=>`<details class="ti34-project" data-ti34-project="${safe(title.toLowerCase())}"><summary><span>▤</span><strong>${safe(title)}</strong><small>FICHA EN PREPARACIÓN</small><span>⌄</span></summary><div class="ti34-project-details">${legacy[id]||empty('Expediente','No disponible.')}</div></details>`).join('')}<p class="ti34-no-results" hidden>No hay proyectos con ese nombre.</p></div><p class="ti34-disclaimer">Se conservaron los expedientes anteriores. Los campos por documentar no representan avances ejecutados.</p>`;
}
function renderUnit(legacy){
 const nav=button('cumplimiento-conoce','4.1','Conoce la Unidad de Cumplimiento',true)+button('cumplimiento-proyectos','4.2','Así cumplimos – Proyectos estratégicos')+button('cumplimiento-alumbrado','4.3','Alumbrado público')+group('cumplimiento-inventario','4.4','Inventario automotor',inventory.map(i=>['cumplimiento-inventario-'+i[0],i[1],i[2]]));
 const intro=card('¿Qué hace la Unidad de Cumplimiento?',`<p>Articula información, responsables y resultados para el seguimiento de los proyectos estratégicos del municipio.</p>${linkPanel('cumplimiento-proyectos','Ver proyectos estratégicos')}`,'ti34-feature')+indicators(['Proyectos con seguimiento','En ejecución','Finalizados','Por documentar'])+card('Áreas de seguimiento',`<div class="ti34-featured">${[['Proyectos estratégicos','cumplimiento-proyectos','ti34-featured-1'],['Alumbrado público','cumplimiento-alumbrado','ti34-featured-2'],['Inventario automotor','cumplimiento-inventario','ti34-featured-3']].map(([text,id,cls])=>`<button type="button" class="${cls}" data-ti34-go="${id}"><strong>${text}</strong><span>Explorar →</span></button>`).join('')}</div>`);
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
