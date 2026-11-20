/* 2.2 Data Subachoque — navigation parallels 2.3 Caracterización.
 * Four official Data Subachoque dimensions, the FOURTH institutional (not
 * the fourth survey/perception dimension). No charts are rendered or loaded.
 * Existing verified indicator data and external source links remain available.
 */
(()=>{
  'use strict';
  const root=document.getElementById('data-subachoque');
  if(!root)return;
  const el=id=>root.querySelector('#'+id);
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=value=>String(value??'').normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es').trim();
  const fmt=value=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:2}).format(value);
  const icon={
    social:'users-round',economica:'coins',ambiental:'leaf',institucional:'landmark'
  };
  const descriptions={
    social:'Personas y bienestar',
    economica:'Actividad económica y desarrollo local',
    ambiental:'Entorno y territorio',
    institucional:'Gestión pública y capacidades institucionales'
  };
  const levels=[
    {id:'nacional',name:'Nacional',place:'Colombia',mark:'◉'},
    {id:'departamental',name:'Departamental',place:'Cundinamarca',mark:'◈'},
    {id:'municipal',name:'Municipal',place:'Subachoque',mark:'⌂'}
  ];
  let catalog;
  const state={dimension:'social',area:'salud',topic:'salud-1',search:''};
  const dims=()=>catalog?.dimensiones||[];
  const dim=()=>dims().find(d=>d.id===state.dimension)||dims()[0];
  const area=()=>dim()?.areas.find(a=>a.id===state.area)||dim()?.areas[0];
  const topic=()=>area()?.topics.find(t=>t.id===state.topic)||area()?.topics[0];
  const all=()=>dims().flatMap(d=>d.areas.flatMap(a=>
    a.topics.map(t=>({dim:d,area:a,topic:t}))));
  const safeLink=value=>{
    try{
      const url=new URL(String(value??''));
      return url.protocol==='https:'||url.protocol==='http:'&&url.hostname==='localhost'?url.href:null;
    }catch{return null;}
  };
  function choose(dimensionId,areaId,topicId){
    const d=dims().find(v=>v.id===dimensionId)||dims()[0];
    const a=d.areas.find(v=>v.id===areaId)||d.areas[0];
    const t=a.topics.find(v=>v.id===topicId)||a.topics[0];
    state.dimension=d.id;
    state.area=a.id;
    state.topic=t.id;
  }
  function readHash(){
    const [route,search='']=location.hash.slice(1).split('?');
    if(route!=='data')return;
    const p=new URLSearchParams(search);
    if(p.get('seccion')!=='data-subachoque')return;
    choose(p.get('dimension'),p.get('area'),p.get('tema'));
    state.search='';
    render();
  }
  function updateHash(replace=false){
    const p=new URLSearchParams(location.hash.split('?')[1]||'');
    p.set('seccion','data-subachoque');
    p.set('dimension',state.dimension);
    p.set('area',state.area);
    p.set('tema',state.topic);
    // The former graph and scale parameters must not leak into the new section.
    ['nivel','indicador','vista','grafica','sub'].forEach(key=>p.delete(key));
    const next='#data?'+p.toString();
    if(location.hash!==next){
      const method=replace?'replaceState':'pushState';
      history[method]({route:'data'},'',next);
    }
  }
  function navigate(dimensionId,areaId,topicId){
    choose(dimensionId,areaId,topicId);
    state.search='';
    updateHash();
    root.querySelector('.k23-search-popover')?.removeAttribute('open');
    render();
  }
  function renderDimensions(){
    el('ds4-dims').innerHTML=dims().map((d,i)=>
      '<button type="button" class="k23-dim'+(d.id===state.dimension?' active':'')+
      '" data-ds4-dimension="'+esc(d.id)+'" aria-pressed="'+(d.id===state.dimension)+
      '"><span class="k23-dim-index">0'+(i+1)+'</span>'+
      '<span class="k23-dim-copy"><strong>'+esc(d.titulo)+
      '</strong><small>'+esc(d.subtitulo||descriptions[d.id])+'</small></span>'+
      '<span class="k23-dim-arrow" aria-hidden="true">↗</span></button>'
    ).join('');
    el('ds4-dimension-breadcrumb').textContent=dim()?.titulo||'';
  }
  function renderAreas(){
    el('ds4-areas').innerHTML=dim().areas.map(a=>
      '<button type="button" class="k23-area'+(a.id===state.area?' active':'')+
      '" data-ds4-area="'+esc(a.id)+'" aria-pressed="'+(a.id===state.area)+'">'+
      esc(a.title)+'</button>'
    ).join('');
  }
  function renderTopics(){
    el('ds4-topics').innerHTML=area().topics.map(t=>
      '<button type="button" class="k23-topic'+(t.id===state.topic?' active':'')+
      '" data-ds4-topic="'+esc(t.id)+'" aria-pressed="'+(t.id===state.topic)+'">'+
      '<span>'+esc(t.documentCode+' '+t.title)+'</span></button>'
    ).join('');
  }
  function renderResults(){
    const panel=el('ds4-results');
    if(!state.search.trim()){
      panel.hidden=true;
      panel.replaceChildren();
      return;
    }
    const text=norm(state.search);
    const hits=all().filter(x=>norm(x.topic.title+' '+x.topic.documentCode+' '+
      x.area.title+' '+x.dim.titulo).includes(text)).slice(0,35);
    panel.hidden=false;
    panel.innerHTML=hits.length?hits.map(x=>
      '<button type="button" class="k23-result" data-ds4-search-topic="'+esc(x.topic.id)+'">'+
      '<strong>'+esc(x.topic.documentCode+' '+x.topic.title)+'</strong>'+
      '<small>'+esc(x.dim.titulo+' · '+x.area.title)+'</small></button>'
    ).join(''):'<p>No encontramos categorías con ese término.</p>';
  }
  function topicIndicators(levelId){
    // Preserve all properly sourced and verified records, without drawing a graph.
    return (catalog.indicadores||[]).filter(r=>
      r.topicId===state.topic&&r.ambito===levelId&&
      ['cotejado-ficha-dane','verificado'].includes(r.verificado)&&
      typeof r.valor==='number'&&Number.isFinite(r.valor)&&
      safeLink(r.fuente)&&typeof r.unidad==='string'&&typeof r.periodo==='string'
    ).sort((a,b)=>String(b.periodo).localeCompare(String(a.periodo),'es'));
  }
  function renderLevel(level){
    const a=area(),rows=topicIndicators(level.id);
    const sources=[a.fuentesConsulta?.[level.id],a.portales?.[level.id]]
      .filter(Boolean).filter(x=>safeLink(x.url));
    const uniqueSources=sources.filter((x,i)=>sources.findIndex(y=>y.url===x.url)===i);
    const sourceLinks=uniqueSources.map(src=>
      '<a href="'+esc(safeLink(src.url))+'" target="_blank" rel="noopener noreferrer">'+
      esc(src.nombre||'Consultar fuente oficial')+' <span aria-hidden="true">↗</span></a>').join('');
    const dataRows=rows.map(row=>
      '<li class="ds4-measure">'+
      '<div><strong>'+esc(row.indicator||row.nombre||'Indicador oficial')+'</strong>'+
      '<small>'+esc(row.periodo)+(row.origen?' · '+esc(row.origen):'')+'</small></div>'+
      '<span class="ds4-measure-value">'+fmt(row.valor)+' '+esc(row.unidad)+'</span>'+
      '</li>').join('');
    return '<section class="ds4-level" aria-label="Información '+level.name+'">'+
      '<div class="ds4-level-head"><span class="ds4-level-icon" aria-hidden="true">'+level.mark+'</span>'+
      '<div><h3>'+esc(level.name)+'</h3><p>'+esc(level.place)+'</p></div></div>'+
      (rows.length?
        '<p class="ds4-verified">Datos con fuente y periodo verificados</p>'+
        '<ul class="ds4-measures">'+dataRows+'</ul>':
        '<p class="ds4-empty">Aún no se ha vinculado un indicador verificado de este subtema para este ámbito.</p>')+
      (sourceLinks?'<div class="ds4-links">'+sourceLinks+'</div>':'')+
      '</section>';
  }
  function renderDetails(){
    const d=dim(),a=area(),t=topic();
    el('ds4-topic-breadcrumb').textContent=d.titulo+' › '+a.title+' › '+t.title;
    el('ds4-topic-code').textContent=t.documentCode;
    el('ds4-topic-title').textContent=t.title;
    el('ds4-topic-context').textContent=d.titulo+' · '+a.title;
    el('ds4-information').innerHTML=levels.map(renderLevel).join('');
    el('ds4-search').value=state.search;
    renderResults();
  }
  function render(){
    if(!catalog)return;
    renderDimensions();
    renderAreas();
    renderTopics();
    renderDetails();
    root.dataset.ready='true';
  }
  root.addEventListener('click',event=>{
    const button=event.target.closest('button');
    if(!button||!root.contains(button))return;
    if(button.dataset.ds4Dimension){
      navigate(button.dataset.ds4Dimension,null,null);
    }else if(button.dataset.ds4Area){
      navigate(state.dimension,button.dataset.ds4Area,null);
    }else if(button.dataset.ds4Topic){
      navigate(state.dimension,state.area,button.dataset.ds4Topic);
    }else if(button.dataset.ds4SearchTopic){
      const found=all().find(x=>x.topic.id===button.dataset.ds4SearchTopic);
      if(found)navigate(found.dim.id,found.area.id,found.topic.id);
    }
  });
  el('ds4-search').addEventListener('input',event=>{
    state.search=event.target.value;
    renderResults();
  });
  window.addEventListener('popstate',readHash);
  window.addEventListener('hashchange',readHash);
  fetch('data/data-subachoque-dimensiones.json').then(r=>{
    if(!r.ok)throw Error('No fue posible consultar el catálogo de Data Subachoque.');
    return r.json();
  }).then(data=>{
    const ids=(data.dimensiones||[]).map(d=>d.id);
    if(ids.join(',')!=='social,economica,ambiental,institucional')throw Error('Dimensiones inesperadas.');
    if(data.dimensiones.some(d=>!d.areas.length||d.areas.some(a=>!a.topics.length)))throw Error('Catálogo incompleto.');
    catalog=data;
    readHash();
    render();
  }).catch(error=>{
    console.error('Data Subachoque:',error);
    el('ds4-dims').innerHTML='<p role="alert">No fue posible cargar las dimensiones. Actualiza la página.</p>';
    root.dataset.ready='error';
  });
})();
