/* DATA SUBACHOQUE / catálogo por dimensiones / Social v1.
   La taxonomía procede de DIMENSIONES.docx. Ningún valor se inventa:
   los indicadores se leen del manifiesto y presentan fuente, corte y cobertura.
   Los antiguos módulos permanecen versionados en Git, no se exponen como pestañas. */
(() => {
  'use strict';

  const root = document.getElementById('data-subachoque');
  if (!root) return;
  const $ = selector => root.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[ch]));
  const norm = value => String(value ?? '').normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const format = value => new Intl.NumberFormat('es-CO',{
    maximumFractionDigits:1, minimumFractionDigits:1
  }).format(value);
  const LEVELS = [
    {id:'nacional', label:'NACIONAL',place:'Colombia',tag:'01'},
    {id:'departamental',label:'DEPARTAMENTAL',place:'Cundinamarca',tag:'02'},
    {id:'municipal',label:'MUNICIPAL',place:'Subachoque',tag:'03'}
  ];
  const icons = {
    social:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><circle cx="24" cy="14" r="7"/><path d="M11 41V31a13 13 0 0 1 26 0v10zM3 39V30q0-8 8-10M45 39V30q0-8-8-10"/></svg>',
    economica:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 40V24h9v16M20 40V15h9v25M34 40V7h8v33M3 41h42"/></svg>',
    ambiental:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 41c0-22 14-30 34-34 0 22-11 34-34 34zM10 38c7-12 16-19 25-26M25 24l-2-12M25 24l13 1"/></svg>',
    institucional:'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 17 19-11 19 11M4 20h40M7 40h34M10 23v14M19 23v14M29 23v14M38 23v14M4 44h40"/></svg>'
  };
  const descriptions = {
    social:'Salud, educación, inclusión, cultura, deporte y seguridad ciudadana.',
    economica:'Producción, empleo, turismo, comercio y hacienda pública.',
    ambiental:'Ambiente, vivienda, movilidad, ordenamiento y gestión del riesgo.',
    institucional:'Capacidad institucional, tecnologías, datos, transparencia y gestión.'
  };
  let catalog = null;
  const state = {dimension:'social',area:'salud',topic:'salud-5',query:''};

  function safeLink(url) {
    try {
      const parsed = new URL(url);
      if(parsed.protocol !== 'https:') return null;
      return parsed.href;
    } catch {return null;}
  }

  function allTopics() {
    return (catalog?.social?.areas || []).flatMap(area => area.topics.map(topic => ({...topic,areaId:area.id,areaTitle:area.title})));
  }
  function areaOf(id) {
    return (catalog?.social?.areas || []).find(area => area.id === id) || catalog?.social?.areas?.[0];
  }
  function topicOf(id) {
    return allTopics().find(t => t.id === id);
  }
  function indicatorsFor(topicId) {
    const values = (catalog?.indicadores || []).filter(item =>
      item.topicId === topicId && LEVELS.some(level => level.id === item.ambito) &&
      Number.isFinite(item.valor) && item.valor>=0 && item.valor<=100 &&
      item.unidad === '%' && safeLink(item.fuente)
    );
    // Primera dimensión: por ahora hay un indicador DANE verificable por tema.
    const id = values[0]?.indicatorId;
    return id ? values.filter(item=>item.indicatorId===id) : [];
  }
  function updateUrl() {
    const parts = new URLSearchParams(location.hash.split('?')[1] || '');
    parts.set('seccion','data-subachoque');
    parts.set('dimension',state.dimension);
    parts.delete('sub');
    parts.delete('vista');
    if(state.dimension === 'social') {
      parts.set('area',state.area);
      parts.set('tema',state.topic);
    } else {
      parts.delete('area');
      parts.delete('tema');
    }
    const hash='#data?'+parts.toString();
    if(location.hash!==hash) history.pushState({route:'data'},'',hash);
  }

  function syncFromHash() {
    const [page,query] = location.hash.slice(1).split('?');
    if(page!=='data') return;
    const params = new URLSearchParams(query||'');
    if(params.get('seccion')!=='data-subachoque') return;
    if(!catalog)return;
    const dim=params.get('dimension') || 'social';
    state.dimension = catalog.dimensiones.some(d=>d.id===dim) ? dim : 'social';
    const requestedTopic=topicOf(params.get('tema'));
    const requestedArea=areaOf(params.get('area'));
    state.area = requestedTopic?.areaId || requestedArea?.id || 'salud';
    state.topic = requestedTopic?.id || areaOf(state.area)?.topics?.[0]?.id || 'salud-1';
    // URLs antiguas apuntaban a tres módulos cancelados. No reabrirlos.
    if(params.has('sub') || params.has('vista')) {
      params.delete('sub');
      params.delete('vista');
      params.set('dimension',state.dimension);
      if(state.dimension==='social'){
        params.set('area',state.area);
        params.set('tema',state.topic);
      }
      history.replaceState({route:'data'},'', '#data?'+params.toString());
    }
    render();
  }

  function renderDimensions() {
    const markup=catalog.dimensiones.map((dimension,i)=>{
      const selected=state.dimension===dimension.id;
      const prepared=dimension.estado==='activa';
      return '<button type="button" class="ds-dimension-card'+(selected?' is-selected':'')+
        '" data-ds-dimension="'+esc(dimension.id)+'" aria-pressed="'+String(selected)+'">'+
        '<span class="ds-dimension-icon" aria-hidden="true">'+icons[dimension.id]+'</span>'+
        '<span class="ds-dimension-copy"><strong>'+esc(dimension.titulo)+'</strong>'+
        '<span>'+esc(descriptions[dimension.id]||'')+'</span>'+
        '<small>'+(prepared?'6 áreas · 33 subtemas':'Próxima etapa')+'</small></span>'+
        '<span class="ds-dimension-arrow" aria-hidden="true">→</span></button>';
    }).join('');
    $('#ds-dimension-grid').innerHTML=markup;
  }

  function renderAreas(){
    $('#ds-social-areas').innerHTML=catalog.social.areas.map(a=>
      '<button type="button" data-ds-area="'+esc(a.id)+'" class="ds-area'+(a.id===state.area?' is-selected':'')+
      '" aria-pressed="'+String(a.id===state.area)+'"><span class="ds-area-code">'+esc(a.code)+'</span>'+
      '<span class="ds-area-name">'+esc(a.title)+'</span><span class="ds-area-count">'+a.topics.length+' →</span></button>'
    ).join('');
  }
  function renderTopics(){
    const area=areaOf(state.area);
    $('#ds-social-topic-title').textContent=area.title;
    $('#ds-social-topic-count').textContent=area.topics.length+' subtemas';
    $('#ds-social-topics').innerHTML=area.topics.map(t=>
      '<button type="button" data-ds-topic="'+esc(t.id)+'" class="ds-topic'+(state.topic===t.id?' is-selected':'')+
      '" aria-pressed="'+String(state.topic===t.id)+'"><span>'+esc(t.title)+'</span><span aria-hidden="true">↗</span></button>'
    ).join('');
    renderSearch();
  }
  function renderSearch(){
    const results=$('#ds-search-results');
    if(!results)return;
    if(!state.query.trim()){
      results.hidden=true;
      results.replaceChildren();
      return;
    }
    const q=norm(state.query);
    const hits=allTopics().filter(t=>norm(t.title+' '+t.areaTitle+' '+t.documentCode).includes(q));
    results.hidden=false;
    results.innerHTML=hits.length?hits.map(t=>
      '<button type="button" data-ds-topic="'+esc(t.id)+'" class="ds-result">'+
      '<span>'+esc(t.title)+'</span><small>'+esc(t.areaTitle)+'</small></button>').join(''):
      '<p>No hay subtemas con ese nombre. Prueba otra palabra.</p>';
  }

  function chart(indicators,focus,topic) {
    const active=indicators.find(item=>item.ambito===focus);
    if(!active) {
      return '<div class="ds-plot-empty" role="status">'+
        '<span class="ds-empty-glyph" aria-hidden="true">▥</span>'+
        '<strong>Dato pendiente de incorporación</strong>'+
        '<p>No hay una serie cuantitativa verificada para este tema y nivel territorial.</p></div>';
    }
    const commonMax=Math.max(5,Math.max(...indicators.map(row=>row.valor))*1.12);
    const rows=LEVELS.map(level=>{
      const metric=indicators.find(item=>item.ambito===level.id);
      if(!metric)return '<div class="ds-bar-row is-unavailable"><span>'+esc(level.place)+'</span><div class="ds-bar-axis"></div><b>—</b></div>';
      const pct=(metric.valor/commonMax*100).toFixed(2);
      return '<div class="ds-bar-row'+(level.id===focus?' is-focused':'')+'">'+
        '<span>'+esc(level.place)+'</span>'+
        '<div class="ds-bar-axis"><span style="width:'+pct+'%"></span></div>'+
        '<b>'+format(metric.valor)+' %</b></div>';
    }).join('');
    return '<div class="ds-plot-data" role="img" aria-label="'+
       esc('Comparación en porcentaje de '+active.indicator+' en Colombia, Cundinamarca y Subachoque, CNPV 2018')+'">'+
       '<div class="ds-plot-value"><strong>'+format(active.valor)+' %</strong><span>'+esc(active.indicator)+'</span></div>'+
       '<div class="ds-plot-bars">'+rows+'</div>'+
       '<span class="ds-plot-key">La barra resaltada corresponde al nivel seleccionado.</span></div>';
  }

  function comparisonText(metric,all) {
    const other=all.filter(item=>item.ambito!==metric.ambito && item.indicatorId===metric.indicatorId);
    if(!other.length)return 'No existe un valor equivalente incorporado para contrastar entre territorios.';
    return other.map(o=>{
      const diff=Math.round((metric.valor-o.valor)*10)/10;
      const value=Math.abs(diff)<.001?'coincide con':(diff>0?'supera a':'está por debajo de');
      return diff===0?
        'El valor coincide con '+LEVELS.find(l=>l.id===o.ambito).place+'.':
        'El valor '+value+' '+LEVELS.find(l=>l.id===o.ambito).place+
          ' en '+format(Math.abs(diff))+' puntos porcentuales.';
    }).join(' ');
  }
  function sourceMarkup(topic,level,indicator) {
    const area=areaOf(topic.areaId);
    const portal=area.portales?.[level.id] || null;
    const officialUrl=indicator?safeLink(indicator.fuente):null;
    const otherUrl=portal?safeLink(portal.url):null;
    const href=officialUrl||otherUrl;
    const title=indicator?'Ficha oficial DANE · CNPV 2018':portal?.nombre || 'Fuente por identificar';
    return '<div class="ds-source">'+
      '<span class="ds-source-heading">'+(indicator?'FUENTE DEL DATO':'PORTAL DE CONSULTA (SIN DATOS CONECTADOS)')+'</span>'+
      '<strong>'+esc(title)+'</strong>'+
      (href?'<a href="'+esc(href)+'" target="_blank" rel="noopener noreferrer" aria-label="Consultar '+esc(title)+' en otra pestaña">Consultar fuente ↗</a>':'')+
      '</div>';
  }
  function analytic(indicators,level,topic) {
    const indicator=indicators.find(row=>row.ambito===level.id);
    if(!indicator){
      return '<span class="ds-state ds-state-missing">SIN VALOR INCORPORADO</span>'+
        '<h4>Datos por validar</h4>'+
        '<p>Para <strong>'+esc(topic.title)+'</strong> todavía no se ha incorporado un indicador comparable de '+esc(level.place)+'. Esto no significa que la entidad carezca de datos.</p>'+
        '<p>Antes de graficar debemos confirmar <strong>variable, unidad, denominador, período, cobertura y responsable</strong>.</p>'+
        sourceMarkup(topic,level,null);
    }
    const meta='<div class="ds-analytic-facts"><span>2018 · corte censal</span><span>DANE</span><span>% de población</span></div>';
    return '<span class="ds-state ds-state-ready">DATO CON FUENTE</span>'+
      '<h4>'+esc(indicator.indicator)+'</h4>'+
      '<p>En <strong>'+esc(level.place)+'</strong>, '+format(indicator.valor)+' % es el valor registrado por el Censo Nacional de Población y Vivienda de 2018.</p>'+
      '<p>'+esc(comparisonText(indicator,indicators))+'</p>'+
      '<p class="ds-analysis-caution">'+esc(indicator.notaMetodologica)+'</p>'+
      meta+sourceMarkup(topic,level,indicator);
  }

  function renderAnalysis() {
    const topic=topicOf(state.topic) || allTopics()[0];
    const area=areaOf(topic.areaId);
    const indicators=indicatorsFor(topic.id);
    const label=$('#ds-active-title');
    label.textContent=topic.title;
    $('#ds-active-path').textContent='DIMENSIÓN SOCIAL / '+area.title+' / '+topic.title;
    $('#ds-active-subtitle').textContent=indicators.length?
      'Datos oficiales comparables por nivel territorial. Corte DANE: 2018.':
      'Estructura lista para incorporar indicadores nacionales, departamentales y municipales con trazabilidad.';
    $('#ds-level-rows').innerHTML=LEVELS.map(level=>{
      const available=Boolean(indicators.find(row=>row.ambito===level.id));
      return '<section class="ds-level-pair" aria-labelledby="ds-level-'+level.id+'">'+
       '<div class="ds-graph-card"><header class="ds-card-head"><span class="ds-level-index">'+level.tag+'</span>'+
       '<div><p>'+esc(level.label)+'</p><h3 id="ds-level-'+level.id+'">'+esc(level.place)+'</h3></div>'+
       '<span class="ds-level-pill">'+(available?'2018 · DANE':'Por incorporar')+'</span></header>'+
       '<div class="ds-plot">'+chart(indicators,level.id,topic)+'</div>'+
       '<footer class="ds-chart-footer">'+esc(indicators[0]?.indicator||topic.title)+' · '+esc(level.place)+'</footer></div>'+
       '<div class="ds-analytic-card"><div class="ds-analytic-header"><span>LECTURA TERRITORIAL</span>'+
       '<strong>ANÁLISIS</strong></div>'+analytic(indicators,level,topic)+'</div></section>';
    }).join('');
    $('#ds-social-footnote').textContent=indicators.length?
      'Los valores disponibles son porcentajes del CNPV 2018. No equivalen a datos de 2026 ni justifican conclusiones causales.':
      'No hay valores cuantitativos cargados para este subtema. Los portales indicados son referencias de consulta, no series conectadas.';
  }

  function renderPending() {
    const d=catalog.dimensiones.find(x=>x.id===state.dimension);
    $('#ds-social-app').hidden=true;
    const pending=$('#ds-pending-dimension');
    pending.hidden=false;
    pending.innerHTML='<span class="ds-state ds-state-missing">PRÓXIMA DIMENSIÓN</span>'+
      '<h2>'+esc(d?.titulo || '')+'</h2>'+
      '<p>La estructura de esta dimensión se implementará en una siguiente etapa, tomando los temas del documento <strong>DIMENSIONES</strong>. Por ahora no se mostrarán indicadores, datos ni gráficas de demostración.</p>'+
      '<button type="button" data-ds-dimension="social" class="ds-return-social">Volver a Dimensión Social →</button>';
  }
  function render() {
    if(!catalog) return;
    renderDimensions();
    const social=state.dimension==='social';
    $('#ds-social-app').hidden=!social;
    $('#ds-pending-dimension').hidden=social;
    if(!social){renderPending();return;}
    renderAreas();
    renderTopics();
    renderAnalysis();
  }
  function selectDimension(dim) {
    if(!catalog.dimensiones.some(x=>x.id===dim))return;
    state.dimension=dim;
    updateUrl();render();
    $('#ds-content-start')?.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function selectArea(id) {
    const area=areaOf(id);
    if(!area)return;
    state.area=area.id;
    state.topic=area.topics[0]?.id;
    updateUrl();render();
  }
  function selectTopic(id) {
    const topic=topicOf(id);
    if(!topic)return;
    state.dimension='social';
    state.area=topic.areaId;
    state.topic=topic.id;
    state.query='';
    const field=$('#ds-topic-search');if(field)field.value='';
    updateUrl();render();
    $('#ds-active-title')?.scrollIntoView({behavior:'smooth',block:'start'});
  }

  root.addEventListener('click',event=>{
    const element=event.target.closest('button');
    if(!element||!root.contains(element))return;
    if(element.hasAttribute('data-ds-dimension')){selectDimension(element.dataset.dsDimension);return;}
    if(element.hasAttribute('data-ds-area')){selectArea(element.dataset.dsArea);return;}
    if(element.hasAttribute('data-ds-topic')){selectTopic(element.dataset.dsTopic);}
  });
  root.addEventListener('input',event=>{
    if(event.target.id!=='ds-topic-search')return;
    state.query=event.target.value;
    renderSearch();
  });
  const json='data/data-subachoque-dimensiones.json';
  fetch(json,{cache:'no-store'}).then(response=>{
    if(!response.ok)throw Error('No se pudo consultar el catálogo');
    return response.json();
  }).then(data=>{
    const n=Array.isArray(data.social?.areas)?data.social.areas.reduce((a,v)=>a+(v.topics?.length||0),0):0;
    if(data.municipio!=='Subachoque'||!Array.isArray(data.dimensiones)||data.dimensiones.length!==4||n!==33||
       !Array.isArray(data.indicadores)||!Array.isArray(data.social.areas)||data.social.areas.length!==6)
       throw Error('El catálogo de dimensiones no pasó las comprobaciones de integridad');
    catalog=data;
    root.dataset.ready='true';
    syncFromHash();
    render();
  }).catch(error=>{
    root.dataset.ready='error';
    $('#ds-setup-alert').textContent='No se pudo cargar la Dimensión Social: '+error.message;
    $('#ds-setup-alert').hidden=false;
  });
  window.TIDataSubachoque=Object.freeze({syncFromHash});
  addEventListener('hashchange',syncFromHash);
  addEventListener('popstate',syncFromHash);
})();