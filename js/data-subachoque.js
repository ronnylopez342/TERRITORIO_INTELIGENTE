/* Territorio Inteligente · Data Subachoque · 4 dimensiones y 105 subtemas
   La maqueta define el diseño, NO las cifras. Solo mostrar datos con fuente verificable.
   El selector territorial se ubica antes del contenido (no dentro del gráfico). */
(() => {
  'use strict';
  const root = document.getElementById('data-subachoque');
  if(!root) return;
  const $ = id => root.querySelector('#'+id);
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize = value => String(value||'').normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es').trim();
  const format = value => new Intl.NumberFormat('es-CO',{minimumFractionDigits:1,maximumFractionDigits:1}).format(value);
  const LEVELS=[
    {id:'nacional',name:'Colombia',label:'Nacional',color:'#082c5b'},
    {id:'departamental',name:'Cundinamarca',label:'Departamental',color:'#388cef'},
    {id:'municipal',name:'Subachoque',label:'Municipal',color:'#ffd400'}
  ];
  const icons={
    social:'<path d="M20 43 6 29C-1 21 4 9 14 9c5 0 8 3 10 6 2-3 6-6 11-6 11 0 16 13 7 22L28 43Z"/><path d="M8 25h10l4-7 5 14 4-7h10"/>',
    economica:'<path d="M5 42V29h10v13M19 42V19h10v23M33 42V7h10v35M3 44h42"/>',
    ambiental:'<path d="M8 42C5 19 19 9 42 6 43 30 28 42 8 42Zm0 0 24-24"/><path d="m20 30-3-12m3 12 12 2"/>',
    institucional:'<path d="M3 18 24 5l21 13M3 22h42M6 44h36M10 25v16M20 25v16M29 25v16M39 25v16M2 46h44"/>'
  };
  const areaIcons={
    salud:'<path d="M6 8v10a7 7 0 0 0 14 0V8M4 8h5M18 8h5M13 25v6a8 8 0 0 0 16 0v-3"/><circle cx="29" cy="26" r="3"/>',
    educacion:'<path d="m4 15 18-9 18 9-18 9zM11 19v12q11 9 22 0V19M40 15v18"/>',
    inclusion:'<circle cx="22" cy="12" r="5"/><circle cx="9" cy="17" r="4"/><circle cx="35" cy="17" r="4"/><path d="M12 36v-7a10 10 0 0 1 20 0v7ZM1 34v-5a9 9 0 0 1 9-9M43 34v-5a9 9 0 0 0-9-9"/>',
    cultura:'<path d="M6 9h15v12q0 14-8 14T6 21ZM25 9h15v12q0 14-8 14t-7-14M10 17h5M29 17h5"/>',
    deporte:'<circle cx="30" cy="8" r="4"/><path d="m28 15-9 9 7 6-6 12M18 18l10-3 10 8M26 30l11 8M12 24l-6 9"/>',
    justicia:'<path d="M23 4 6 12v12q0 14 17 19 17-5 17-19V12zM14 23l6 6 12-13"/>',
    agricultura:'<path d="M24 42V22M24 23C10 23 8 13 6 7c16 0 19 9 18 16Zm0 5c16 0 17-9 19-16-15 0-19 7-19 16Z"/>',
    comercio:'<path d="M5 20h38M7 20v22h34V20M5 20l4-13h30l4 13M14 42V28h12v14M34 27h3"/>',
    turismo:'<rect x="5" y="12" width="38" height="29" rx="4"/><circle cx="24" cy="26" r="8"/><path d="M16 12l3-6h11l3 6"/>',
    empleo:'<circle cx="23" cy="10" r="6"/><path d="M11 40V28a12 12 0 0 1 24 0v12M3 42h40"/>',
    energia:'<path d="m27 3-17 23h14l-4 19 19-27H25z"/>',
    hacienda:'<rect x="8" y="7" width="32" height="36" rx="3"/><circle cx="24" cy="25" r="9"/><path d="M18 18h12M24 14v22"/>',
    ambiente:'<path d="M8 42C5 19 19 9 42 6 43 30 28 42 8 42Zm0 0 24-24"/>',
    vivienda:'<path d="M3 22 24 5l21 17M9 19v24h30V19M20 43V27h9v16"/>',
    movilidad:'<rect x="8" y="8" width="32" height="30" rx="5"/><path d="M8 24h32M15 15h18M16 38v5M32 38v5"/><circle cx="16" cy="31" r="2"/><circle cx="32" cy="31" r="2"/>',
    riesgo:'<path d="M24 3 5 10v16q0 14 19 20 19-6 19-20V10zM24 14v14m0 6v2"/>',
    gobierno:'<path d="M3 17 24 5l21 12M5 21h38M7 43h34M12 23v17M22 23v17M32 23v17"/>',
    tic:'<rect x="5" y="6" width="38" height="29" rx="3"/><path d="M16 43h16M24 35v8"/>',
    estadistica:'<ellipse cx="24" cy="9" rx="16" ry="6"/><path d="M8 9v28c0 8 32 8 32 0V9M8 22c0 8 32 8 32 0"/>',
    transparencia:'<circle cx="24" cy="12" r="6"/><circle cx="8" cy="22" r="4"/><circle cx="40" cy="22" r="4"/><path d="M13 43V32a11 11 0 0 1 22 0v11M1 43v-9a7 7 0 0 1 8-7m38 16v-9a7 7 0 0 0-8-7"/>',
    talento:'<circle cx="24" cy="24" r="9"/><path d="m20 2-1 6m10 32 1 6M2 20l6 1m32 6 6 1M8 8l5 5m22 22 5 5M40 8l-5 5M13 35l-5 5"/>'
  };
  const svgIcon=(body,cssClass='')=>'<svg class="'+cssClass+'" viewBox="0 0 48 48" width="28" height="28" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">'+(body||icons.social)+'</svg>';
  const defaultLevel={social:'nacional',economica:'municipal',ambiental:'departamental',institucional:'nacional'};
  const firstTopic={
    social:'salud-5',
    economica:'economica-hacienda-1',
    ambiental:'ambiental-ambiente-6',
    institucional:'institucional-gobierno-1'
  };
  const state={dimension:'social',area:'salud',topic:'salud-5',nivel:'nacional',indicator:0,search:''};
  let catalog=null;
  const dimensions=()=>catalog?.dimensiones||[];
  const dimension=()=>dimensions().find(d=>d.id===state.dimension);
  const areas=()=>dimension()?.areas||[];
  const allTopics=()=>dimensions().flatMap(d=>d.areas.flatMap(a=>a.topics.map(t=>({...t,dimensionId:d.id,dimensionTitle:d.titulo,areaId:a.id,areaTitle:a.title}))));
  const topicById=id=>allTopics().find(t=>t.id===id);
  const areaById=id=>areas().find(a=>a.id===id);
  const topic=()=>topicById(state.topic);
  const level=()=>LEVELS.find(l=>l.id===state.nivel)||LEVELS[0];
  const safeUrl=url=>{
    try{const parsed=new URL(url);return parsed.protocol==='https:'?parsed.href:null;}
    catch{return null;}
  };
  const indicators=()=> {
    const found=(catalog?.indicadores||[]).filter(i=>
      i.topicId===state.topic && LEVELS.some(l=>l.id===i.ambito) &&
      typeof i.indicatorId==='string' && typeof i.valor==='number' &&
      Number.isFinite(i.valor) && typeof i.unidad==='string' &&
      typeof i.periodo==='string' && safeUrl(i.fuente));
    return [...new Set(found.map(i=>i.indicatorId))].map(id=>found.filter(i=>i.indicatorId===id));
  };
  const currentIndicator=()=>indicators()[Math.min(state.indicator,indicators().length-1)]||[];

  function setURL(replace=false){
    const params=new URLSearchParams(location.hash.split('?')[1]||'');
    params.set('seccion','data-subachoque');
    params.set('dimension',state.dimension);
    params.set('area',state.area);
    params.set('tema',state.topic);
    params.set('nivel',state.nivel);
    params.delete('sub');params.delete('vista');
    if(state.indicator)params.set('indicador',String(state.indicator));
    else params.delete('indicador');
    const hash='#data?'+params.toString();
    if(location.hash!==hash){
      if(replace)history.replaceState({route:'data'},'',hash);
      else history.pushState({route:'data'},'',hash);
    }
  }
  function syncFromHash(){
    const [route,query]=location.hash.slice(1).split('?');
    if(route!=='data'||!catalog)return;
    const params=new URLSearchParams(query||'');
    if(params.get('seccion')!=='data-subachoque')return;
    let dim=dimensions().find(d=>d.id===params.get('dimension'))||dimensions()[0];
    state.dimension=dim.id;
    const targeted=topicById(params.get('tema'));
    const area=dim.areas.find(a=>a.id===params.get('area'));
    const starter=topicById(firstTopic[dim.id]);
    state.area=(targeted?.dimensionId===dim.id?targeted.areaId:area?.id)||starter?.areaId||dim.areas[0].id;
    const chosen=targeted?.dimensionId===dim.id?targeted:null;
    state.topic=chosen?.id||(area?area.topics[0]?.id:null)||starter?.id||dim.areas[0].topics[0].id;
    state.nivel=LEVELS.some(l=>l.id===params.get('nivel'))?params.get('nivel'):defaultLevel[dim.id];
    const indicatorIndex=Number(params.get('indicador'));
    state.indicator=Number.isInteger(indicatorIndex)&&indicatorIndex>=0?indicatorIndex:0;
    state.search='';
    render();
  }

  function changeDimension(id){
    const d=dimensions().find(x=>x.id===id);
    if(!d)return;
    state.dimension=id;
    const selection=topicById(firstTopic[id]);
    state.area=selection?.areaId||d.areas[0].id;
    state.topic=selection?.id||d.areas[0].topics[0].id;
    state.nivel=defaultLevel[id];
    state.indicator=0;state.search='';
    setURL();render();
  }
  function changeArea(id){
    const a=areaById(id);if(!a)return;
    state.area=a.id;state.topic=a.topics[0].id;
    state.indicator=0;state.search='';
    setURL();render();
  }
  function changeTopic(id){
    const t=topicById(id);if(!t)return;
    state.dimension=t.dimensionId;state.area=t.areaId;state.topic=t.id;
    state.indicator=0;state.search='';
    setURL();render();
  }
  function changeLevel(id){
    if(!LEVELS.some(l=>l.id===id))return;
    state.nivel=id;setURL();render();
  }
  function renderDimensions(){
    $('ds3-dimensions').innerHTML=dimensions().map(d=>
      '<button type="button" class="ds3-dimension'+(d.id===state.dimension?' is-active':'')+
      '" data-ds3-dimension="'+escapeHTML(d.id)+'" aria-pressed="'+String(d.id===state.dimension)+'">'+
      '<span class="ds3-dimension-icon">'+svgIcon(icons[d.id])+'</span>'+
      '<span class="ds3-dimension-copy"><strong>'+escapeHTML(d.titulo)+'</strong><small>'+escapeHTML(d.subtitulo)+'</small></span>'+
      '<span class="ds3-dimension-arrow" aria-hidden="true">›</span></button>'
    ).join('');
  }
  function renderAreas(){
    $('ds3-areas').style.setProperty('--ds3-area-count',String(areas().length));
    $('ds3-areas').innerHTML=areas().map(a=>
      '<button type="button" class="ds3-area-tab'+(a.id===state.area?' is-active':'')+
      '" data-ds3-area="'+escapeHTML(a.id)+'" aria-pressed="'+String(a.id===state.area)+'">'+
      svgIcon(areaIcons[a.id])+'<span>'+escapeHTML(a.title)+'</span></button>'
    ).join('');
  }
  function renderLevels(){
    root.querySelectorAll('[data-ds3-level]').forEach(button=>{
      button.classList.toggle('is-active',button.dataset.ds3Level===state.nivel);
      button.setAttribute('aria-pressed',String(button.dataset.ds3Level===state.nivel));
      const lvl=LEVELS.find(item=>item.id===button.dataset.ds3Level);
      button.setAttribute('aria-label',lvl?.label+': '+lvl?.name);
    });
  }
  function renderSearchResults(){
    const results=$('ds3-search-results');
    if(!state.search.trim()){results.hidden=true;results.replaceChildren();return;}
    const term=normalize(state.search);
    const matches=allTopics().filter(t=>normalize(t.title+' '+t.areaTitle+' '+t.dimensionTitle).includes(term)).slice(0,30);
    results.hidden=false;
    results.innerHTML=matches.length?'<p class="ds3-search-count">Resultados en las cuatro dimensiones</p>'+matches.map(t=>
      '<button type="button" data-ds3-topic="'+escapeHTML(t.id)+'" class="ds3-search-result"><b>'+escapeHTML(t.title)+'</b><small>'+escapeHTML(t.dimensionTitle+' · '+t.areaTitle)+'</small></button>'
    ).join(''):'<p class="ds3-empty-search">No se encontraron subtemas.</p>';
  }
  function renderTopics(){
    const list=areaById(state.area)?.topics||[];
    $('ds3-topics').innerHTML=list.map(t=>
      '<button type="button" class="ds3-topic'+(t.id===state.topic?' is-active':'')+
      '" data-ds3-topic="'+escapeHTML(t.id)+'" aria-current="'+(t.id===state.topic?'true':'false')+'">'+
      '<span>'+escapeHTML(t.title)+'</span><span aria-hidden="true">›</span></button>'
    ).join('');
    $('ds3-search').value=state.search;
    renderSearchResults();
  }
  function renderTitle(){
    const d=dimension(),t=topic(),a=areaById(state.area);
    $('ds3-title').textContent=d.titulo;
    $('ds3-breadcrumb-current').textContent=d.titulo;
    $('ds3-description').textContent=d.areas.map(x=>x.title).join(', ')+'.';
    $('ds3-header-icon').innerHTML=svgIcon(icons[d.id],'ds3-big-icon');
    $('ds3-area-label').textContent=a?.title||'';
    $('ds3-topic-title').textContent=t?.title||'';
  }
  function tickHTML(value){return format(value).replace(',0','');}
  function chartSVG(rows){
    if(!rows.length)return '';
    const metricUnit=String(rows[0].unidad||'');
    const suffix=metricUnit==='%'?' %':' '+metricUnit;
    const max=Math.max(10,...rows.map(row=>Number(row.valor)||0));
    const roundedStep=Math.pow(10,Math.floor(Math.log10(max)));
    const ceil=Math.ceil(max/roundedStep)*roundedStep||10;
    const axisTop=76,axisBottom=318,axisLeft=176,axisWidth=456,step=axisWidth/4;
    const ticks=[0,1,2,3,4].map(i=>{
      const x=axisLeft+i*step;
      return '<line x1="'+x+'" y1="'+axisTop+'" x2="'+x+'" y2="'+axisBottom+'" class="ds3-grid-line"/>'+
        '<text x="'+x+'" y="347" class="ds3-tick" text-anchor="middle">'+tickHTML(ceil*i/4)+escapeHTML(suffix)+'</text>';
    }).join('');
    const bars=LEVELS.map((lvl,index)=>{
      const y=113+index*79;
      const entry=rows.find(v=>v.ambito===lvl.id);
      const selected=lvl.id===state.nivel;
      const background='<rect x="'+axisLeft+'" y="'+(y-2)+'" width="'+axisWidth+'" height="24" rx="4" class="ds3-track"/>';
      if(!entry)return '<g>'+background+'<text class="ds3-bar-label" x="13" y="'+(y+14)+'">'+escapeHTML(lvl.name)+'</text>'+
        '<text class="ds3-missing-number" text-anchor="end" x="690" y="'+(y+14)+'">s/d</text></g>';
      const value=Math.max(2,entry.valor/ceil*axisWidth);
      const textX=axisLeft+Math.min(axisWidth+16,value+14);
      return '<g class="'+(selected?'ds3-focused':'')+'">'+background+
        '<rect x="'+axisLeft+'" y="'+(y-2)+'" width="'+value.toFixed(2)+'" height="24" rx="4" fill="'+lvl.color+'"'+
        (selected?' stroke="#f4ad00" stroke-width="2"':'')+'/>'+
        '<text class="ds3-bar-label" x="13" y="'+(y+14)+'">'+escapeHTML(lvl.name)+'</text>'+
        '<text class="ds3-bar-value" x="'+Math.min(687,textX)+'" y="'+(y+15)+'" text-anchor="'+(textX>655?'end':'start')+'">'+format(entry.valor)+escapeHTML(suffix)+'</text></g>';
    }).join('');
    const label='Comparación por nivel territorial de '+String(rows[0].indicator)+', '+String(rows[0].periodo)+
      ': '+LEVELS.map(l=>l.name+' '+(rows.find(v=>v.ambito===l.id)?.valor ?? 'sin dato')).join(', ');
    return '<svg class="ds3-chart-svg" viewBox="0 0 720 365" role="img" aria-label="'+escapeHTML(label)+'">'+
      '<text x="14" y="30" class="ds3-graph-kicker">'+escapeHTML(metricUnit==='%'?'PORCENTAJE':metricUnit.toLocaleUpperCase('es'))+' · '+escapeHTML(rows[0].periodo)+'</text>'+
      ticks+bars+'</svg>';
  }
  function renderChart(){
    const t=topic(),groups=indicators(),rows=currentIndicator();
    const have=rows.length>0;
    $('ds3-indicator-title').textContent=have?rows[0].indicator:t.title;
    $('ds3-indicator-description').textContent=have?
      'Comparación territorial · '+rows[0].periodo+' · '+rows[0].unidad:
      'Información pendiente de incorporación y validación.';
    $('ds3-chart-area').innerHTML=have?chartSVG(rows):
      '<div class="ds3-no-data" role="status"><div class="ds3-no-data-symbol" aria-hidden="true">▥</div>'+
      '<h3>Gráfica pendiente de datos</h3>'+
      '<p>Aún no hay un indicador con valores verificados para <strong>'+escapeHTML(t.title)+'</strong>. La estructura está preparada para Colombia, Cundinamarca y Subachoque.</p>'+
      '<p class="ds3-empty-method">Sin cifras de muestra ni series temporales inventadas.</p></div>';
    $('ds3-chart-footer').innerHTML=have?
      '<span class="ds3-source-mark">●</span> '+escapeHTML(rows[0].origen||'Entidad productora')+
      ' <span class="ds3-meta-sep">·</span> '+escapeHTML(rows[0].periodo)+
      ' <span class="ds3-meta-sep">·</span> '+escapeHTML(rows[0].unidad):
      '<span class="ds3-source-mark">○</span> Pendiente: indicador, unidad, período, fuente y cobertura.';
    const navigation=$('ds3-indicator-nav');
    navigation.hidden=groups.length<=1;
    if(groups.length>1){
      navigation.innerHTML='<button type="button" data-ds3-step="-1" aria-label="Indicador anterior">‹</button>'+
        '<span>Indicador '+(state.indicator+1)+' de '+groups.length+'</span>'+
        '<button type="button" data-ds3-step="1" aria-label="Indicador siguiente">›</button>';
    }else navigation.replaceChildren();
  }
  function diffText(value,other,otherName){
    if(!other)return '';
    const diff=Number((value-other.valor).toFixed(1));
    if(Math.abs(diff)<0.05)return 'El resultado coincide con '+otherName+'.';
    return 'Es '+format(Math.abs(diff))+' '+(other.unidad==='%'?'puntos porcentuales':other.unidad)+' '+(diff>0?'mayor':'menor')+' que en '+otherName+'.';
  }
  function renderAnalysis(){
    const t=topic(),selected=level(),rows=currentIndicator();
    const current=rows.find(i=>i.ambito===state.nivel);
    const parent=$('ds3-analysis-body'),source=$('ds3-source');
    if(!current){
      parent.innerHTML='<span class="ds3-state ds3-state-unavailable">DATO NO DISPONIBLE</span>'+
        '<p>Para <strong>'+escapeHTML(t.title)+'</strong> todavía no se ha incorporado un indicador cuantitativo comprobado del nivel <strong>'+escapeHTML(selected.label.toLowerCase())+
        '</strong> ('+escapeHTML(selected.name)+').</p>'+
        '<div class="ds3-explainer"><strong>¿Qué hace falta?</strong><p>Identificar una variable comparable, su unidad, período, cobertura territorial y fuente original. No se utilizarán cifras ilustrativas como datos oficiales.</p></div>';
      const portal=catalog?.guiaFuentes?.[state.dimension]?.[state.nivel];
      const link=portal?safeUrl(portal.url):null;
      source.innerHTML='<span class="ds3-source-label">PORTAL PARA CONSULTA</span>'+
        '<p>'+(portal?escapeHTML(portal.nombre):'Fuente institucional por identificar')+'</p>'+
        (link?'<a href="'+escapeHTML(link)+'" target="_blank" rel="noopener noreferrer">Consultar portal ↗</a>':'')+
        '<small>No se ha vinculado todavía una serie oficial de este subtema.</small>';
      return;
    }
    const others=LEVELS.filter(l=>l.id!==state.nivel).map(l=>{
      const row=rows.find(x=>x.ambito===l.id);
      return row?diffText(current.valor,row,l.name):'No hay valor comparable para '+l.name+'.';
    });
    const note=current.notaMetodologica||'La lectura depende del universo estadístico, la unidad y la metodología original.';
    parent.innerHTML='<span class="ds3-state ds3-state-official">DATO CON FUENTE</span>'+
      '<p>En <strong>'+escapeHTML(selected.name)+'</strong>, el '+escapeHTML(current.periodo)+
      ' registró <strong>'+format(current.valor)+' '+escapeHTML(current.unidad)+'</strong> para el indicador <strong>'+escapeHTML(current.indicator)+
      '</strong>.</p>'+
      '<p>'+escapeHTML(others.join(' '))+'</p>'+
      '<div class="ds3-explainer"><strong>¿Qué significa?</strong><p>'+escapeHTML(note)+'</p></div>'+
      '<p class="ds3-avoid-overreach">Una medición censal no demuestra por sí sola una tendencia entre años ni una relación causal.</p>';
    const link=safeUrl(current.fuente);
    source.innerHTML='<span class="ds3-source-label">FUENTE ORIGINAL</span>'+
      '<p>'+escapeHTML(current.origen||'DANE')+' · '+escapeHTML(current.periodo)+
      (current.pagina?', pág. '+escapeHTML(current.pagina):'')+'</p>'+
      (link?'<a href="'+escapeHTML(link)+'" target="_blank" rel="noopener noreferrer">Ver ficha oficial ↗</a>':'');
  }
  function render(){
    if(!catalog)return;
    root.dataset.ready='true';
    renderTitle();renderDimensions();renderAreas();renderLevels();
    renderTopics();renderChart();renderAnalysis();
  }
  root.addEventListener('click',event=>{
    const btn=event.target.closest('button');
    if(!btn||!root.contains(btn))return;
    if(btn.hasAttribute('data-ds3-dimension'))return changeDimension(btn.dataset.ds3Dimension);
    if(btn.hasAttribute('data-ds3-area'))return changeArea(btn.dataset.ds3Area);
    if(btn.hasAttribute('data-ds3-topic'))return changeTopic(btn.dataset.ds3Topic);
    if(btn.hasAttribute('data-ds3-level'))return changeLevel(btn.dataset.ds3Level);
    if(btn.hasAttribute('data-ds3-step')){
      const groups=indicators();if(!groups.length)return;
      state.indicator=(state.indicator+Number(btn.dataset.ds3Step)+groups.length)%groups.length;
      setURL();render();
    }
  });
  root.addEventListener('input',event=>{
    if(event.target.id!=='ds3-search')return;
    state.search=event.target.value;
    renderSearchResults();
  });
  fetch('data/data-subachoque-dimensiones.json',{cache:'no-store'}).then(r=>{
    if(!r.ok)throw Error('No se pudo descargar el catálogo.');
    return r.json();
  }).then(data=>{
    const ds=data.dimensiones||[];
    if(data.municipio!=='Subachoque'||ds.length!==4||
       ds.map(d=>d.areas.reduce((n,a)=>n+a.topics.length,0)).join(',')!=='33,33,20,19'||
       ds.reduce((n,d)=>n+d.areas.length,0)!==21||!Array.isArray(data.indicadores)){
      throw Error('La estructura de dimensiones está incompleta.');
    }
    catalog=data;
    syncFromHash();
    render();
  }).catch(error=>{
    root.dataset.ready='error';
    $('ds3-setup-alert').textContent='No se pudieron cargar las dimensiones: '+error.message;
    $('ds3-setup-alert').hidden=false;
    $('ds3-dimensions').textContent='No se pudieron cargar las dimensiones.';
  });
  window.TIDataSubachoque=Object.freeze({syncFromHash});
  addEventListener('hashchange',syncFromHash);
  addEventListener('popstate',syncFromHash);
})();