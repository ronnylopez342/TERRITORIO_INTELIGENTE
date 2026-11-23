/* Vivienda 2026 / Práctica País: edición exclusiva del iframe institucional.
   Reutiliza la misma instancia de TISubachoqueMap; no altera capas de veredas.
   Coordenadas privadas: solo se reciben a través del host autenticado. */
(() => {
  'use strict';
  if (!document.documentElement.classList.contains('ti-practica-embed')) return;
  const ROOT_ID = 'data-encuesta';
  const PARENT = 'https://subachoque-platform.vercel.app';
  const labels = {priorizada:'Priorizadas',espera:'En espera',revision:'Revisión técnica',descartada:'Descartadas'};
  const colors = {priorizada:'#227540',espera:'#3299c5',revision:'#e0ab23',descartada:'#d75e55'};
  const active = new Set(Object.keys(labels));
  let dataset = null, privateRows = null, current = null, mapApi = null, markerLayer = null;
  let onlyLocated = false, mapObserver = null;
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const int = n => Number(n||0).toLocaleString('es-CO');
  const sourceAction = (id) => '<button type="button" class="ppv-inline-source" data-ppv-source="' + esc(id) + '">Ver fuente ↗</button>';
  const mapNote = () => !privateRows
    ? 'El mapa territorial conserva los colegios y servicios originales. Las ubicaciones de hogares solo se habilitan con permisos de administración.'
    : 'Coordenadas registradas en la base original, pendientes de validación territorial. Los puntos coincidentes se agrupan sin desplazar su ubicación.';
  const landscape = '<svg class="ppv-landscape" viewBox="0 0 920 160" preserveAspectRatio="xMidYMax slice" aria-hidden="true">'
    + '<path fill="#dae6d5" d="M0 120Q130 0 280 103Q440 0 630 110Q810 20 920 89V160H0Z"/>'
    + '<path fill="#b8d1ba" d="M0 137Q220 54 390 113Q540 49 711 116Q820 63 920 107V160H0Z"/>'
    + '<path fill="#8cae86" d="M0 155Q130 115 283 144Q470 78 635 137Q820 93 920 143V160H0Z"/>'
    + '<path fill="#698d65" d="M600 152L900 152L920 134L920 160H0v-9Z"/>'
    + '<g transform="translate(742,62)"><path d="M0 75V38H16V15L28 0L40 15V38H61V75" fill="#fffbeb" stroke="#687a59" stroke-width="3"/><path d="M12 36h34v35H12Z" fill="#f1e7c9"/><path d="M23 33V15h10v18Z" fill="#f7f4d5"/><path d="M26 14V7h4v7" stroke="#596c4d" stroke-width="2"/><path d="M23 70V53Q28 47 34 53V70" fill="#637e5c"/></g>'
    + '<path stroke="#d4ae37" stroke-width="2" fill="none" d="M0 151Q290 143 540 149T920 152"/></svg>';
  const hero = () => '<header class="ppv-hero"><div class="ppv-hero-copy">'
    + '<div class="ppv-eyebrow">SUBACHOQUE PLATFORM · PRÁCTICA PAÍS</div><h1>Mejoramiento de vivienda</h1>'
    + '<p>Del levantamiento técnico a la priorización de hogares</p></div>' + landscape + '</header>';
  function skeleton() {
    return '<div class="ppv-shell">'
      + hero()
      + '<section class="ppv-top" aria-label="Consolidación de vivienda">'
      + '<div class="ppv-intro"><span class="ppv-symbol">⌂</span><span>Se realizaron visitas técnicas para evaluar condiciones de <b>cocina, baño y pisos.</b></span></div>'
      + '<div class="ppv-kpis" id="ppv-kpis" aria-live="polite"></div></section>'
      + '<section class="ppv-steps" aria-label="Proceso realizado"><strong>Proceso realizado</strong><div><b>① Identificación</b><small>Listado y depuración</small></div><i>⟶</i>'
      + '<div><b>② Visita técnica</b><small>Verificación en territorio</small></div><i>⟶</i>'
      + '<div><b>③ Evaluación</b><small>Análisis de criterios</small></div><i>⟶</i>'
      + '<div><b>④ Priorización</b><small>Clasificación y selección</small></div></section>'
      + '<section class="ppv-map-card" aria-label="Mapa de viviendas levantadas">'
      + '<div class="ppv-map-filters"><h2>Mapa de viviendas<br>levantadas</h2><p>Distribución territorial y estados de selección. Se conserva la cartografía original.</p>'
      + '<div id="ppv-status-filters" class="ppv-filters"></div>'
      + '<label class="ppv-only-located"><input id="ppv-only-located" type="checkbox"> Solo con coordenadas registradas</label>'
      + '<p id="ppv-map-caption" class="ppv-map-caption" role="status"></p></div>'
      + '<div class="ppv-map-slot" id="ppv-map-slot"><div class="ppv-map-loading">Cargando mapa original del municipio…</div></div>'
      + '<aside class="ppv-detail" id="ppv-detail"><h3>Ficha técnica</h3><div class="ppv-detail-content" id="ppv-detail-content">'
      + '<p>Selecciona un punto en el mapa para consultar la ficha correspondiente.</p>'
      + '<small>La información individual está restringida al personal institucional autorizado.</small></div>'
      + '<button type="button" class="ppv-detail-open" id="ppv-detail-open" disabled>Ver detalle administrativo ↗</button></aside></section>'
      + '<section class="ppv-results" aria-label="Resultados del levantamiento"><h2>Resultados del levantamiento</h2>'
      + '<div class="ppv-results-grid"><article><h3>Resultado de la priorización</h3><div id="ppv-donut"></div></article>'
      + '<article><h3>Intervenciones requeridas</h3><p class="ppv-minor">Una vivienda puede requerir más de una intervención.</p><div id="ppv-bars"></div></article>'
      + '<article><h3>Criterios de selección</h3><div id="ppv-criteria"></div><div class="ppv-docs">'
      + '<button type="button" data-ppv-source="soporte">Documentos y fuentes ↗</button></div></article></div></section>'
      + '<section class="ppv-admin-records" id="ppv-admin-records" hidden><h2>Registros administrativos</h2>'
      + '<p>Solo identificadores internos; datos individuales protegidos por autenticación.</p><div id="ppv-cases"></div></section>'
      + '<p class="ppv-footer-note" id="ppv-footer-note">Información documentada del programa de mejoramiento de vivienda 2026.</p>'
      + '</div>';
  }
  function renderSummary() {
    if (!dataset) return;
    const root = document.querySelector('.ppv-shell'); if (!root || root.dataset.summaryMounted === '1') return;
    root.dataset.summaryMounted = '1';
    const info = [{key:'identified',title:'Familias identificadas',icon:'♟',source:'presentacion'},
      {key:'visited',title:'Familias visitadas',icon:'⌖',source:'presentacion'},
      {key:'surveys',title:'Levantamientos realizados',icon:'▤',source:'auditoria'},
      {key:'prioritized',title:'Familias priorizadas',icon:'⌂',source:'soporte'}];
    root.querySelector('#ppv-kpis').innerHTML=info.map(x=>'<div class="ppv-kpi">'
      + '<span class="ppv-kpi-icon">' + x.icon + '</span><div><strong>' + int(dataset.totals[x.key]) + '</strong>'
      + '<span>' + x.title + '</span>' + sourceAction(x.source) + '</div></div>').join('');
    root.querySelector('#ppv-status-filters').innerHTML=dataset.classification.map(x=>
      '<label class="ppv-filter"><input type="checkbox" data-ppv-status="' + esc(x.key) + '" checked>'
      + '<span class="ppv-dot" style="--status-color:'+esc(colors[x.key])+'"></span>'
      + '<strong>'+esc(x.label)+'</strong><small>'+int(x.count)+'</small></label>').join('');
    const values=dataset.classification, total=values.reduce((n,x)=>n+x.count,0);
    const stops=[];let last=0;for(const x of values){const next=last+100*x.count/total;stops.push(colors[x.key]+' '+last.toFixed(3)+'% '+next.toFixed(3)+'%');last=next;}
    root.querySelector('#ppv-donut').innerHTML='<div class="ppv-donut-figure" role="img" aria-label="'
      +values.map(x=>esc(x.count)+' '+esc(x.label)).join(', ')+'" style="background:conic-gradient('+stops.join(',')+')"><span>'
      +int(total)+'<small>levantamientos</small></span></div><div class="ppv-donut-legend">'
      +values.map(x=>'<p><span class="ppv-dot" style="--status-color:'+colors[x.key]+'"></span><b>'+int(x.count)+'</b> '+esc(x.label)
        +'<small>'+(100*x.count/total).toFixed(1).replace('.',',')+' %</small></p>').join('')+'</div>';
    const highest=Math.max(...dataset.improvements.map(x=>x.count));
    root.querySelector('#ppv-bars').innerHTML='<div class="ppv-bar-figure">'+dataset.improvements.map(x=>
      '<div><b>'+int(x.count)+'</b><i style="height:'+(40+100*x.count/highest)+'px"></i><span>'+esc(x.label)+'</span></div>').join('')+'</div>'
      +'<p class="ppv-minor">Necesidades registradas, no obras ejecutadas. '+sourceAction('soporte')+'</p>';
    root.querySelector('#ppv-criteria').innerHTML=dataset.methodology.map((x,i)=>
      '<div class="ppv-criterion"><span>'+ (i+1) +'</span><div><strong>'+esc(x.title)+'</strong><small>'+esc(x.detail)+'</small></div>'
      + sourceAction(x.source) +'</div>').join('');
    root.querySelector('#ppv-footer-note').textContent='Fuentes originales: auditoría del levantamiento, base de mejoramientos e informes técnicos 2026. '+dataset.notes[0];
    bindControls();
  }
  function bindControls(){
    document.querySelectorAll('[data-ppv-status]').forEach(n=>n.addEventListener('change',()=>{
      if(n.checked)active.add(n.dataset.ppvStatus);else active.delete(n.dataset.ppvStatus);
      refreshPrivate();
    }));
    const toggle=document.getElementById('ppv-only-located');
    toggle?.addEventListener('change',()=>{onlyLocated=toggle.checked;refreshPrivate();});
  }
  function renderSources(){
    if(!dataset)return;
    const panel=document.getElementById('data-explorando');
    if(!panel||panel.querySelector('.ppv-source-section'))return;
    const section=document.createElement('section');section.className='ppv-source-section';section.id='ppv-sources';
    section.innerHTML='<div class="ppv-sources-title"><span>RECURSOS · TRAZABILIDAD DOCUMENTAL</span>'
      +'<h2>Fuentes del mejoramiento de vivienda</h2>'
      +'<p>Consulta el origen de los indicadores y los documentos del levantamiento. Los expedientes con información personal están restringidos.</p></div>'
      +'<div class="ppv-source-grid">'+dataset.sources.map(s=>'<article id="ppv-source-'+esc(s.id)+'">'
      +'<span>'+esc(s.type)+' · '+esc(s.sections)+'</span><h3>'+esc(s.title)+'</h3>'
      +'<p>'+esc(s.details)+'</p><small>Documento original protegido; consultar con administración institucional.</small></article>').join('')+'</div>'
      +'<p class="ppv-source-note">Las referencias se conservaron por nombre, hoja y página; no se ofrecen descargas públicas de archivos que contienen cédulas, teléfonos o ubicaciones particulares.</p>';
    panel.prepend(section);
  }
  function showSource(id){
    if(!dataset)return;
    renderSources();
    const button=document.querySelector('#tiEmbedTabs button[data-embed-destination="data-explorando"]');
    if(!button)return;
    button.click();
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      const node=document.getElementById('ppv-source-'+id)||document.getElementById('ppv-sources');
      node?.scrollIntoView({behavior:'smooth',block:'start'});
      node?.classList.add('ppv-source-selected');
      setTimeout(()=>node?.classList.remove('ppv-source-selected'),2400);
    }));
  }
  function attachMap(panel){
    const mapWrap=panel.querySelector('#ppViviendaMap');
    const slot=panel.querySelector('#ppv-map-slot');
    if(!mapWrap||!slot)return false;
    if(mapWrap.parentElement!==slot){slot.replaceChildren(mapWrap);mapWrap.style.removeProperty('display');}
    mapApi=window.TISubachoqueMap?.getInstance?.(panel.querySelector('#ppViviendaMapCanvas'))||null;
    if(mapApi){ mapApi.invalidateSize(); refreshPrivate(); }
    return !!mapApi;
  }
  function connectMap(panel){
    if(attachMap(panel))return;
    if(!mapObserver){
      mapObserver=new MutationObserver(()=>{attachMap(panel);});
      mapObserver.observe(panel,{childList:true,subtree:true});
    }
    let ticks=0;
    const poll=setInterval(()=>{
      if(!panel.isConnected||++ticks>80){clearInterval(poll);return;}
      if(attachMap(panel)){clearInterval(poll);mapObserver?.disconnect();mapObserver=null;}
    },250);
  }
  function requestPrivate(){
    if(window.parent===window)return;
    window.parent.postMessage({type:'PP_HOUSING_REQUEST'},PARENT);
  }
  function placeMarkers(){
    if(!mapApi||!window.L)return;
    if(markerLayer){ markerLayer.clearLayers(); }else{ markerLayer=window.L.layerGroup().addTo(mapApi.map); }
    if(!privateRows)return;
    const items=privateRows.filter(x=>active.has(x.status)&&Number.isFinite(x.latitude)&&Number.isFinite(x.longitude)
      &&(!onlyLocated||x.coordinate_quality==='validada'||x.coordinate_quality==='registrada_pendiente_validacion')
      &&mapApi.contains(x.longitude,x.latitude));
    const groups=new Map();
    for(const item of items){
      const key=item.latitude.toFixed(6)+','+item.longitude.toFixed(6);
      if(!groups.has(key))groups.set(key,[]);
      groups.get(key).push(item);
    }
    for(const list of groups.values()){
      const first=list[0], col=colors[first.status]||'#456b52';
      const marker=window.L.circleMarker([first.latitude,first.longitude],
        {radius:list.length>1?9:7,color:'#ffffff',weight:2,fillColor:col,fillOpacity:.96});
      marker.bindTooltip(list.length>1?list.length+' registros en esta coordenada':'Registro '+first.case_code,{direction:'top'});
      marker.on('click',()=>chooseCase(list));
      marker.addTo(markerLayer);
    }
    const count=document.getElementById('ppv-map-caption');
    if(count)count.textContent=items.length+' registros con coordenadas en territorio; '+groups.size+' posiciones geográficas. '+mapNote();
  }
  function chooseCase(list){
    if(!list?.length)return;
    if(list.length===1){selectedCase(list[0]);return;}
    const body=document.getElementById('ppv-detail-content');if(!body)return;
    body.innerHTML='<p>Hay '+list.length+' levantamientos con la misma coordenada registrada. Selecciona uno:</p>'
      +list.map(x=>'<button type="button" class="ppv-case-option" data-case="'+esc(x.case_code)+'">'+esc(x.case_code)+' · '+esc(x.vereda)+'</button>').join('');
    body.querySelectorAll('[data-case]').forEach(b=>b.addEventListener('click',()=>{
      const row=list.find(x=>x.case_code===b.dataset.case);if(row)selectedCase(row);
    }));
    document.getElementById('ppv-detail-open').disabled=true;
  }
  function selectedCase(row){
    current=row;
    const body=document.getElementById('ppv-detail-content');if(!body)return;
    body.innerHTML='<div class="ppv-case-name">'+esc(row.case_code)+'</div>'
      +'<dl><dt>Estado</dt><dd>'+esc(labels[row.status])+'</dd>'
      +'<dt>Vereda</dt><dd>'+esc(row.vereda)+'</dd>'
      +'<dt>Mejoramiento principal</dt><dd>'+esc(row.primary_improvement||'Sin información de tipo principal')+'</dd>'
      +'<dt>Coordenadas</dt><dd>'+esc(row.coordinate_quality==='validada'?'Validada':'Registrada; pendiente de validación')+'</dd>'
      +'<dt>Evaluación documental</dt><dd>Consultar expediente original</dd></dl>';
    document.getElementById('ppv-detail-open').disabled=false;
  }
  function showDetail(){
    if(!current)return;
    const detail=document.getElementById('ppv-detail-content');
    if(!detail)return;
    const extra=detail.querySelector('.ppv-record-reference');
    if(extra){extra.remove();return;}
    const box=document.createElement('div');box.className='ppv-record-reference';
    box.innerHTML='<b>Referencia administrativa</b><p>Auditoría de levantamientos, fila '+Number(current.source_audit_row)
      +'. El expediente íntegro conserva sus soportes protegidos. No hay datos de propiedad o puntajes validados en esta vista resumida.</p>'
      +'<button data-ppv-source="auditoria" type="button">Consultar fuente ↗</button>';
    detail.append(box);
  }
  function refreshPrivate(){
    const admin=document.getElementById('ppv-admin-records');
    const cases=document.getElementById('ppv-cases');
    if(!admin||!cases)return;
    admin.hidden=!privateRows;
    if(!privateRows){const msg=document.getElementById('ppv-map-caption');if(msg)msg.textContent=mapNote();return;}
    let rows=privateRows.filter(x=>active.has(x.status));
    if(onlyLocated)rows=rows.filter(x=>Number.isFinite(x.latitude)&&Number.isFinite(x.longitude));
    cases.innerHTML=rows.map(x=>'<button class="ppv-record-button" data-case="'+esc(x.case_code)+'" type="button">'
      +'<b>'+esc(x.case_code)+'</b><span>'+esc(x.vereda)+'</span><small>'+esc(labels[x.status])+'</small>'
      +'</button>').join('') || '<p>No hay registros para este filtro.</p>';
    cases.querySelectorAll('[data-case]').forEach(b=>b.addEventListener('click',()=>{
      const record=privateRows.find(x=>x.case_code===b.dataset.case);
      if(!record)return;
      selectedCase(record);
      document.getElementById('ppv-detail')?.scrollIntoView({behavior:'smooth',block:'center'});
    }));
    placeMarkers();
  }
  function mount(){
    const panel=document.getElementById(ROOT_ID);
    if(!panel)return;
    if(!panel.querySelector('.ppv-shell')){
      panel.insertAdjacentHTML('afterbegin',skeleton());
      panel.classList.add('ppv-ready');
      panel.addEventListener('click',event=>{
        const link=event.target.closest('[data-ppv-source]');
        if(link){event.preventDefault();showSource(link.dataset.ppvSource);}
      });
      document.getElementById('ppv-detail-open')?.addEventListener('click',showDetail);
    }
    connectMap(panel);
    if(dataset){renderSummary();renderSources();}
    else fetch('/data/pp-vivienda-2026-resumen.json',{cache:'no-store'})
      .then(r=>{if(!r.ok)throw Error('No disponible');return r.json();})
      .then(x=>{dataset=x;renderSummary();renderSources();})
      .catch(()=>{const el=document.getElementById('ppv-kpis');if(el)el.textContent='No se pudo cargar el resumen documentado. El mapa original sigue disponible.';});
    if(privateRows===null)requestPrivate();
  }
  window.addEventListener('message',event=>{
    if(event.origin!==PARENT||event.source!==window.parent||!event.data)return;
    if(event.data.type==='PP_HOUSING_DATA'){
      const incoming=event.data.rows;
      if(!Array.isArray(incoming))return;
      privateRows=incoming.filter(x=>x&&typeof x.case_code==='string'
        &&Object.hasOwn(labels,x.status)&&typeof x.vereda==='string').map(x=>({
          ...x,latitude:x.latitude===null?null:Number(x.latitude),
          longitude:x.longitude===null?null:Number(x.longitude)
        }));
      refreshPrivate();
    }else if(event.data.type==='PP_HOUSING_DENIED'||event.data.type==='PP_HOUSING_ERROR'){
      privateRows=null;
      const node=document.getElementById('ppv-map-caption');
      if(node)node.textContent=String(event.data.message||'La capa privada no está disponible.');
    }
  });
  function init(){
    const tabs=document.getElementById('tiEmbedTabs');
    if(tabs)tabs.addEventListener('click',event=>{
      const btn=event.target.closest('[data-embed-destination]');
      if(!btn)return;
      if(btn.dataset.embedDestination===ROOT_ID)setTimeout(mount,0);
      if(btn.dataset.embedDestination==='data-explorando'&&dataset)renderSources();
    });
    if(document.querySelector('#tiEmbedTabs [data-embed-destination="data-encuesta"][aria-selected="true"]'))mount();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
