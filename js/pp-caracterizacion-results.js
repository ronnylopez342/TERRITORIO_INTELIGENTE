/* Unicamente debajo del encabezado de Caracterizacion de Subachoque Platform. */
(() => {
 'use strict';
 if(!document.documentElement.classList.contains('ti-practica-embed')) return;
 const HOST='https://subachoque-platform.vercel.app';
 let mounted=false,mode='inicio';
 const MARKUP="\n<div class=\"pp-results-container\">\n  <section class=\"pp-results-section pp-results-overview\" aria-labelledby=\"pp-results-title\">\n    <div class=\"pp-results-section-head\"><span class=\"pp-results-section-index\" aria-hidden=\"true\">01</span><div><p class=\"pp-results-kicker\">EL TRABAJO REALIZADO</p><h2 id=\"pp-results-title\">Consolidación general</h2></div></div>\n    <div class=\"pp-results-metrics\" aria-label=\"Cifras verificadas de los instrumentos\">\n      <article class=\"pp-results-metric\"><strong>324</strong><span>Registros de encuesta no técnica</span></article>\n      <article class=\"pp-results-metric\"><strong>59</strong><span>Formularios de levantamiento técnico</span></article>\n      <article class=\"pp-results-metric\"><strong>2</strong><span>Instrumentos de caracterización</span></article>\n      <article class=\"pp-results-metric\"><strong>41</strong><span>Gráficas seleccionadas para la revista</span></article>\n    </div>\n    <p class=\"pp-results-source\">Fuente: consolidado KoBo de referencia, corte del 17 de octubre de 2026. Los instrumentos tienen universos distintos; estas cifras no equivalen a personas beneficiadas ni deben sumarse como hogares únicos.</p>\n  </section>\n  <section class=\"pp-results-section pp-results-method\" aria-labelledby=\"pp-results-work-title\">\n    <div class=\"pp-results-section-head\"><span class=\"pp-results-section-index\" aria-hidden=\"true\">02</span><div><p class=\"pp-results-kicker\">DESDE EL TERRITORIO</p><h2 id=\"pp-results-work-title\">¿Qué se realizó?</h2></div></div>\n    <p class=\"pp-results-paragraph\">Se realizó un proceso de caracterización municipal mediante visitas de campo, aplicación de instrumentos, registro en KoBoToolbox y consolidación de información. Este trabajo permitió organizar respuestas sobre las personas, los hogares y las condiciones de vivienda como insumo para el análisis territorial.</p>\n    <div class=\"pp-results-process\" aria-label=\"Etapas del trabajo\"><span>Levantamiento en campo</span><i aria-hidden=\"true\"></i><span>Registro y sistematización</span><i aria-hidden=\"true\"></i><span>Análisis y publicación</span></div>\n  </section>\n  <section class=\"pp-results-section pp-results-instruments\" aria-labelledby=\"pp-results-instruments-title\">\n    <div class=\"pp-results-section-head\"><span class=\"pp-results-section-index\" aria-hidden=\"true\">03</span><div><p class=\"pp-results-kicker\">LOS INSTRUMENTOS</p><h2 id=\"pp-results-instruments-title\">¿Cómo estuvo compuesta la encuesta?</h2></div></div>\n    <div class=\"pp-results-instrument-grid\">\n      <article class=\"pp-results-instrument\"><div class=\"pp-results-icon\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\"><path d=\"M8 3h8m-7 0v3m6-3v3M6 6h12v15H6zM9 11h6M9 15h6\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg></div><div><span class=\"pp-results-pill\">Instrumento 01</span><h3>Encuesta no técnica</h3><p>Información de hogares y personas: composición, educación, actividades, servicios, condiciones sociales y otros aspectos recogidos en el formulario.</p></div></article>\n      <article class=\"pp-results-instrument\"><div class=\"pp-results-icon\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\"><path d=\"M3 11L12 4l9 7M5 10v10h14V10M10 20v-7h4v7M17 4v3\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg></div><div><span class=\"pp-results-pill\">Instrumento 02</span><h3>Levantamiento técnico</h3><p>Registro de condiciones físicas de viviendas visitadas, observaciones y aspectos asociados a posibles necesidades de mejoramiento.</p></div></article>\n    </div>\n  </section>\n  <section class=\"pp-results-section pp-results-explore\" id=\"pp-results-paths\" aria-labelledby=\"pp-results-paths-title\">\n    <div class=\"pp-results-section-head\"><span class=\"pp-results-section-index\" aria-hidden=\"true\">04</span><div><p class=\"pp-results-kicker\">RECORRIDO DE CONSULTA</p><h2 id=\"pp-results-paths-title\">Tres maneras de conocer los resultados</h2><p class=\"pp-results-subtitle\">Conoce el proceso y elige qué información deseas explorar.</p></div></div>\n    <div class=\"pp-results-journey\" role=\"tablist\" aria-label=\"Tres rutas de consulta\" aria-orientation=\"horizontal\"><div class=\"pp-results-journey-line\" aria-hidden=\"true\"></div>\n      <button type=\"button\" id=\"pp-results-tab-kobo\" role=\"tab\" aria-controls=\"pp-results-kobo-panel\" aria-selected=\"false\" tabindex=\"-1\" data-pp-route=\"kobo\" class=\"pp-results-step pp-results-card\"><span class=\"pp-results-step-number\" aria-hidden=\"true\">1</span><span class=\"pp-results-step-type\">BASE COMPLETA</span><span class=\"pp-results-step-heading\">Consolidación general de KoBo</span><span class=\"pp-results-step-description\">Explora las dimensiones disponibles en el visor estadístico, sus indicadores y los filtros de territorio y levantamiento.</span><span class=\"pp-results-card-action\">Consultar consolidación <span aria-hidden=\"true\">↗</span></span></button>\n      <button type=\"button\" id=\"pp-results-tab-revista\" role=\"tab\" aria-controls=\"pp-results-magazine-intro\" aria-selected=\"false\" tabindex=\"-1\" data-pp-route=\"revista\" class=\"pp-results-step pp-results-card\"><span class=\"pp-results-step-number\" aria-hidden=\"true\">2</span><span class=\"pp-results-step-type\">RESULTADOS SELECCIONADOS</span><span class=\"pp-results-step-heading\">Revista de caracterización</span><span class=\"pp-results-step-description\">Recorre las 41 gráficas de la revista, sus bases, frecuencias, porcentajes y alternativas de visualización.</span><span class=\"pp-results-card-action\">Explorar 41 gráficas <span aria-hidden=\"true\">↗</span></span></button>\n      <button type=\"button\" id=\"pp-results-tab-focal\" role=\"tab\" aria-controls=\"pp-results-focal-panel\" aria-selected=\"false\" tabindex=\"-1\" data-pp-route=\"focal\" class=\"pp-results-step pp-results-card\"><span class=\"pp-results-step-number\" aria-hidden=\"true\">3</span><span class=\"pp-results-step-type\">LECTURA CUALITATIVA</span><span class=\"pp-results-step-heading\">Grupos focales</span><span class=\"pp-results-step-description\">Un espacio para reunir conversaciones, testimonios, temas y hallazgos cualitativos que complementan las encuestas.</span><span class=\"pp-results-card-action\">Consultar grupos focales <span aria-hidden=\"true\">↗</span></span></button>\n    </div>\n    <p class=\"pp-results-nav-note\">Selecciona una tarjeta para abrir su contenido abajo. Puedes cambiar entre las tres opciones sin salir de esta página.</p>\n  </section>\n  <section class=\"pp-results-stage\" id=\"pp-results-kobo-panel\" role=\"tabpanel\" tabindex=\"0\" aria-labelledby=\"pp-results-tab-kobo\" hidden><div><p class=\"pp-results-kicker\">RUTA 01 · CONSOLIDACIÓN INTEGRAL</p><h2>Consolidación general de KoBo</h2><p>Explora los registros estadísticos disponibles, sus indicadores y los filtros del levantamiento técnico y no técnico. El visor completo se despliega a continuación sin abandonar esta página.</p></div></section>\n  <section class=\"pp-results-stage\" id=\"pp-results-magazine-intro\" role=\"tabpanel\" tabindex=\"0\" aria-labelledby=\"pp-results-tab-revista\" hidden aria-labelledby=\"pp-results-magazine-title\"><div><p class=\"pp-results-kicker\">RUTA 02 · REVISTA</p><h2 id=\"pp-results-magazine-title\">41 gráficas para explorar</h2><p>Las preguntas seleccionadas para la revista se presentan junto con sus resultados consolidados y los datos que respaldan cada visualización.</p></div></section>\n  <section class=\"pp-results-stage\" id=\"pp-results-focal-panel\" role=\"tabpanel\" tabindex=\"0\" aria-labelledby=\"pp-results-tab-focal\" hidden aria-labelledby=\"pp-results-focal-title\"><div><p class=\"pp-results-kicker\">RUTA 03 · GRUPOS FOCALES</p><h2 id=\"pp-results-focal-title\">Escuchar y comprender el territorio</h2><p>Este apartado está destinado a presentar temas, hallazgos y citas verificadas de los grupos focales, en complemento con los resultados de los formularios.</p><p class=\"pp-results-focal-note\">La información cualitativa se incorporará cuando sus registros estén sistematizados y documentados. No se publican testimonios ni conclusiones sin una fuente comprobable.</p></div></section>\n</div>";
 function getNodes(){
  const panel=document.getElementById('data-conoce');
  return {panel,hero:document.getElementById('pp-char-header'),
   magazine:panel?.querySelector(':scope > iframe[src*="/caracterizacion/revista.html"]'),
   intro:document.getElementById('pp-characterization-results')};
 }
 function height(){
  const panel=getNodes().panel;
  if(!panel||panel.hidden||window.parent===window)return;
  const bottom=panel.getBoundingClientRect().bottom+window.scrollY;
  window.parent.postMessage({type:'TI_DATA_EMBED_HEIGHT',height:Math.max(540,Math.ceil(bottom+12))},HOST);
 }
 function focus(node){
  if(!node)return;
  requestAnimationFrame(()=>{node.scrollIntoView({behavior:'smooth',block:'start'});height();});
 }
 function navigate(next){
  const {panel,magazine,intro}=getNodes();
  if(!panel||!magazine||!intro||!['kobo','revista','focal'].includes(next))return;
  mode=next;
  panel.dataset.ppResultsMode=next;
  const revista=next==='revista';
  magazine.style.setProperty('display',revista?'block':'none','important');
  magazine.setAttribute('aria-hidden',String(!revista));
  magazine.tabIndex=revista?0:-1;
  const selection=intro.querySelector(next==='kobo'?'#pp-results-kobo-panel':next==='revista'?'#pp-results-magazine-intro':'#pp-results-focal-panel');
  for(const route of ['kobo','revista','focal']){
    const tab=intro.querySelector('#pp-results-tab-'+route);
    const pane=intro.querySelector(route==='kobo'?'#pp-results-kobo-panel':route==='revista'?'#pp-results-magazine-intro':'#pp-results-focal-panel');
    const active=route===next;
    if(pane)pane.hidden=!active;
    if(tab){
      tab.setAttribute('aria-selected',String(active));
      tab.tabIndex=active?0:-1;
      tab.classList.toggle('is-open',active);
    }
  }
  // Se conserva el mismo iframe y se abre UN unico resultado abajo.
  // KoBo vive en el host autenticado, inmediatamente despues del iframe;
  // las otras rutas lo ocultan. No se reemplaza ninguna fotografia.
  window.parent.postMessage({type:'PP_CHARACTERIZATION_RESULT_CHANGED',route:next},HOST);
  requestAnimationFrame(()=>{height();requestAnimationFrame(height);});
  focus(selection);
 }
 function resetSelection(){
  const {panel,magazine,intro}=getNodes();
  if(!panel||!magazine||!intro)return;
  mode='inicio';
  panel.dataset.ppResultsMode='inicio';
  magazine.style.setProperty('display','none','important');
  magazine.setAttribute('aria-hidden','true');
  magazine.tabIndex=-1;
  intro.querySelectorAll('[role="tabpanel"]').forEach(pane=>{pane.hidden=true;});
  const tabs=[...intro.querySelectorAll('button[data-pp-route]')];
  tabs.forEach((tab,i)=>{
    tab.setAttribute('aria-selected','false');
    tab.classList.remove('is-open');
    tab.tabIndex=i===0?0:-1;
  });
  requestAnimationFrame(()=>{height();requestAnimationFrame(height);});
 }
 window.addEventListener('message',event=>{
  if(event.origin!==HOST||event.source!==window.parent||!event.data)return;
  if(event.data.type==='PP_CHARACTERIZATION_RESULT_RESET')resetSelection();
 });
 function mount(){
  if(mounted)return;
  const {panel,hero,magazine}=getNodes();
  if(!panel||!hero||!magazine||panel.dataset.ppRevistaMounted!=='1')return;
  if(document.getElementById('pp-characterization-results')){mounted=true;return;}
  mounted=true;
  const section=document.createElement('div');
  section.id='pp-characterization-results';
  section.className='pp-results';
  section.innerHTML=MARKUP;
  // El encabezado y sus fotografias NO se modifican.
  hero.insertAdjacentElement('afterend',section);
  panel.dataset.ppResultsMode='inicio';
  magazine.style.setProperty('display','none','important');
  magazine.setAttribute('aria-hidden','true');
  magazine.tabIndex=-1;
  const journey=section.querySelector('.pp-results-journey');
  section.addEventListener('click',e=>{
   const b=e.target.closest('button[data-pp-route]');
   if(!b||!section.contains(b))return;
   navigate(b.dataset.ppRoute);
  });
  journey.addEventListener('keydown',e=>{
   if(!['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Home','End'].includes(e.key))return;
   const tabs=[...journey.querySelectorAll('button[data-pp-route]')];
   const index=tabs.indexOf(document.activeElement);
   if(index<0)return;
   e.preventDefault();
   const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:
     (index+(e.key==='ArrowRight'||e.key==='ArrowDown'?1:-1)+tabs.length)%tabs.length;
   tabs[next].focus();
   navigate(tabs[next].dataset.ppRoute);
  });
  const tabs=[...journey.querySelectorAll('button[data-pp-route]')];
  if(tabs[0])tabs[0].tabIndex=0;
  requestAnimationFrame(height);
  window.addEventListener('resize',height,{passive:true});
 }
 const observer=new MutationObserver(()=>{if(mounted)observer.disconnect();else mount();});
 observer.observe(document.documentElement,{childList:true,subtree:true});
 document.addEventListener('DOMContentLoaded',mount,{once:true});
 window.addEventListener('load',mount,{once:true});
 mount();
})();