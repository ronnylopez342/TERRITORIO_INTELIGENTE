/* 2.3 Caracterizacion y Diagnostico Municipal — KoBo 2026.
   Exclusivamente agregados, SIN respuestas individuales ni identificadores.
   Fuente: export de respuestas KoBo y XLSForm (17/oct/2026).
   Secciones de vivienda/mejoramiento 17–22 y cierre 23 excluidas. */
(()=>{
  'use strict';
  const root=document.getElementById('data-encuesta');
  if(!root||!root.querySelector('#k23-app'))return;
  const $=id=>root.querySelector('#'+id);
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
  const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const num=n=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:1}).format(n);
  const COLORS=['#edbe23','#56b8cc','#6497db','#8f84cd','#df9274','#4aa998','#738caa','#a4aeb9','#d7a65a','#ac8fb4'];
  const defaultId={social:'1.1-1',economica:'2.2-1',ambiental:'3.1-1',percepcion:'per-gestion-gest'};
  const icon={social:'heart-pulse',economica:'chart',ambiental:'leaf',percepcion:'message'};
  const state={dim:'social',area:'1.1',topic:'1.1-1',metric:0,search:''};
  let data=null;
  function allTopics(){
    return (data?.dimensiones||[]).flatMap(d=>d.areas.flatMap(a=>a.temas.map(t=>({...t,dimId:d.id,dimName:d.nombre,areaId:a.id,areaName:a.nombre}))));
  }
  const dims=()=>data?.dimensiones||[];
  const dim=()=>dims().find(d=>d.id===state.dim)||dims()[0];
  const area=()=>dim()?.areas.find(a=>a.id===state.area)||dim()?.areas?.[0];
  const topic=()=>allTopics().find(t=>t.id===state.topic);
  const metric=()=>topic()?.metrics[state.metric]||topic()?.metrics[0];
  function setHash(){
    const params=new URLSearchParams(location.hash.split('?')[1]||'');
    params.set('seccion','data-encuesta');
    params.set('dimension',state.dim);
    params.set('area',state.area);
    params.set('tema',state.topic);
    if(state.metric)params.set('indicador',String(state.metric));else params.delete('indicador');
    params.delete('nivel');params.delete('sub');params.delete('vista');
    const hash='#data?'+params.toString();
    if(location.hash!==hash)history.pushState({route:'data'},'',hash);
  }
  function syncHash(){
    if(!data||location.hash.split('?')[0]!=='#data')return;
    const p=new URLSearchParams(location.hash.split('?')[1]||'');
    if(p.get('seccion')!=='data-encuesta')return;
    let picked=topicFor(p.get('tema'));
    const requested=dims().find(d=>d.id===p.get('dimension'))||dims()[0];
    if(!picked||picked.dimId!==requested.id)picked=null;
    const chosenArea=requested.areas.find(a=>a.id===p.get('area'))||requested.areas[0];
    const base=topicFor(defaultId[requested.id]);
    const selected=picked||chosenArea.temas.find(t=>t.id===p.get('tema'))||(!p.has('area')?base:null)||chosenArea.temas[0];
    state.dim=requested.id;
    state.area=(picked?.areaId||(!p.has('area')?base?.areaId:null)||chosenArea.id);
    state.topic=selected?.id||chosenArea.temas[0].id;
    const i=Number(p.get('indicador'));
    state.metric=Number.isInteger(i)&&i>=0?i:0;
    state.search='';
    render();
  }
  function topicFor(id){return allTopics().find(t=>t.id===id)}
  function gotoDim(id){
    const d=dims().find(v=>v.id===id);
    if(!d)return;
    const first=topicFor(defaultId[id])||d.areas[0].temas[0];
    state.dim=id;state.area=first.areaId||d.areas[0].id;state.topic=first.id;
    state.metric=0;state.search='';
    setHash();render();
  }
  function gotoArea(id){
    const a=dim()?.areas.find(v=>v.id===id);if(!a)return;
    state.area=id;state.topic=a.temas[0].id;state.metric=0;state.search='';
    setHash();render();
  }
  function gotoTopic(id){
    const t=topicFor(id);if(!t)return;
    state.dim=t.dimId;state.area=t.areaId;state.topic=id;state.metric=0;state.search='';
    setHash();render();
  }
  function renderDims(){
    $('k23-dims').innerHTML=dims().map((d,i)=>
      '<button type="button" class="k23-dim'+(d.id===state.dim?' active':'')+'" data-k23-dim="'+esc(d.id)+
      '" aria-pressed="'+(d.id===state.dim)+'"><span class="k23-dim-index">0'+(i+1)+'</span><span class="k23-dim-copy">'+
      '<strong>'+esc(d.nombre)+'</strong><small>'+esc(d.subtitulo)+'</small></span><span class="k23-dim-arrow" aria-hidden="true">↗</span></button>'
    ).join('');
    $('k23-breadcrumb').textContent=dim().nombre;
    $('k23-heading').textContent=dim().nombre;
    $('k23-description').textContent=dim().subtitulo+'. Información declarada por quienes respondieron la caracterización de KoBo.';
  }
  function renderAreas(){
    $('k23-areas-label').textContent='Áreas de '+dim().nombre;
    $('k23-areas').innerHTML=dim().areas.map(a=>
      '<button type="button" class="k23-area'+(a.id===state.area?' active':'')+'" aria-pressed="'+(a.id===state.area)+
      '" data-k23-area="'+esc(a.id)+'">'+esc(a.nombre)+'</button>'
    ).join('');
  }
  function renderTopics(){
    $('k23-topics-heading').textContent=area().nombre;
    $('k23-topics').innerHTML=area().temas.map(t=>
      '<button type="button" class="k23-topic'+(t.id===state.topic?' active':'')+'" aria-current="'+(t.id===state.topic)+
      '" data-k23-topic="'+esc(t.id)+'"><span>'+esc(t.nombre)+'</span><span aria-hidden="true">›</span></button>'
    ).join('');
    $('k23-search').value=state.search;
    renderSearch();
  }
  function renderSearch(){
    const results=$('k23-results');
    if(!state.search.trim()){results.hidden=true;results.replaceChildren();return;}
    const q=norm(state.search);
    const hits=allTopics().filter(t=>norm(t.nombre+' '+t.areaName+' '+t.dimName).includes(q)).slice(0,30);
    results.hidden=false;
    results.innerHTML=hits.length?hits.map(t=>
      '<button type="button" class="k23-result" data-k23-topic="'+esc(t.id)+'"><strong>'+esc(t.nombre)+
      '</strong><small>'+esc(t.dimName)+' · '+esc(t.areaName)+'</small></button>').join(''):
      '<p>No hay subtemas con esa palabra.</p>';
  }
  function getMetricLabels(m){
    return (m?.a||[]).map((r,i)=>({label:String(r[0]),count:Number(r[1]),pct:Number(r[2]),color:COLORS[i%COLORS.length]}))
      .filter(x=>Number.isFinite(x.count)&&Number.isFinite(x.pct)&&x.count>=5&&x.pct>=0);
  }
  function renderMetric(){
    const t=topic(),m=metric();
    if(!t||!m){$('k23-chart').textContent='No se encontraron resultados publicables.';return;}
    state.metric=Math.min(state.metric,t.metrics.length-1);
    $('k23-topic-title').textContent=t.nombre;
    $('k23-topic-breadcrumb').textContent=area().nombre+' / '+t.nombre;
    $('k23-metric-title').textContent=m.title;
    $('k23-scope').textContent='Cobertura municipal · encuesta KoBo · corte '+data.corte;
    $('k23-n').textContent=num(m.n);
    $('k23-denominator').textContent='Respuestas válidas: '+num(m.n)+' '+m.unit;
    const selector=$('k23-metric-selector');
    selector.hidden=t.metrics.length<=1;
    selector.innerHTML=t.metrics.length>1?'<label for="k23-metric-select">Indicador</label><select id="k23-metric-select" aria-label="Seleccionar indicador">'+
      t.metrics.map((v,i)=>'<option value="'+i+'"'+(i===state.metric?' selected':'')+'>'+esc(v.title)+'</option>').join('')+'</select>':'';
    const values=getMetricLabels(m);
    $('k23-chart').innerHTML='<div class="k23-bars" role="list" aria-label="Distribución agregada de respuestas">'+
      values.map(row=>'<div class="k23-bar-row" role="listitem"><div class="k23-bar-top"><span>'+esc(row.label)+
      '</span><strong>'+num(row.pct)+' %</strong></div><div class="k23-bar-track" aria-label="'+num(row.count)+
      ' respuestas"><span style="width:'+Math.min(100,row.pct)+'%;background:'+row.color+'"></span></div>'+
      '<small>'+num(row.count)+' respuestas</small></div>').join('')+
      '</div><p class="k23-chart-note">'+(m.type==='multi'?'Pregunta de selección múltiple: una persona puede marcar varias opciones y los porcentajes pueden superar el 100 % en total.':'Las opciones corresponden a las respuestas registradas en la pregunta.')+
      '</p>';
    const biggest=values.slice().sort((a,b)=>b.count-a.count)[0];
    const coverage=m.coverage==='directa'?'Medición directa':'Indicador aproximado';
    const incomplete=values.reduce((s,x)=>s+x.count,0)<m.n;
    const context=m.unit==='personas registradas'?'La unidad es la persona registrada dentro del hogar, NO cada encuesta.':'La unidad corresponde a respuestas de encuesta, NO a la población total del municipio.';
    $('k23-insight').innerHTML='<span class="k23-data-badge">'+esc(coverage)+'</span>'+
      '<p>Entre <strong>'+num(m.n)+'</strong> respuestas válidas, la categoría con mayor frecuencia visible fue <strong>'+
      esc(biggest?.label||'Sin categoría publicable')+'</strong> ('+num(biggest?.pct||0)+' %, '+num(biggest?.count||0)+' registros).</p>'+
      '<div class="k23-important"><strong>Cómo interpretar este resultado</strong><p>'+esc(context)+
      ' La encuesta no establece representatividad estadística de todo Subachoque; describe a quienes contestaron.</p></div>'+
      (m.coverage==='aproximada'?'<p>Esta pregunta aproxima el tema seleccionado, pero no constituye por sí sola una medición técnica o administrativa completa.</p>':'')+
      (incomplete?'<p>Por privacidad no se publican categorías con menos de cinco registros, por lo que las barras mostradas pueden no sumar el 100 %.</p>':'');
    $('k23-meta').innerHTML='<div><span>Fuente</span><strong>Encuesta KoBo · Caracterización no técnica</strong></div>'+
      '<div><span>Pregunta</span><strong>'+esc(m.q)+'</strong></div>'+
      '<div><span>Respuestas válidas</span><strong>'+num(m.n)+'</strong></div>'+
      '<div><span>Corte</span><strong>'+esc(data.corte)+'</strong></div>';
  }
  function render(){
    if(!data)return;
    renderDims();renderAreas();renderTopics();renderMetric();
    root.dataset.koboReady='true';
  }
  root.addEventListener('click',e=>{
    const btn=e.target.closest('button');
    if(!btn||!root.contains(btn))return;
    if(btn.hasAttribute('data-k23-dim'))return gotoDim(btn.dataset.k23Dim);
    if(btn.hasAttribute('data-k23-area'))return gotoArea(btn.dataset.k23Area);
    if(btn.hasAttribute('data-k23-topic'))return gotoTopic(btn.dataset.k23Topic);
  });
  root.addEventListener('input',e=>{
    if(e.target.id!=='k23-search')return;
    state.search=e.target.value;renderSearch();
  });
  root.addEventListener('change',e=>{
    if(e.target.id!=='k23-metric-select')return;
    const val=Number(e.target.value);
    if(!Number.isInteger(val)||val<0||val>=topic().metrics.length)return;
    state.metric=val;setHash();renderMetric();
  });
  async function load(){
    const response=await fetch('data/caracterizacion-kobo-2026-agregados.gz.b64',{cache:'no-store'});
    if(!response.ok)throw Error('El archivo agregado de KoBo no está disponible.');
    if(typeof DecompressionStream==='undefined'||typeof atob==='undefined')throw Error('Este navegador no admite la descompresión de datos del visor.');
    const encoded=(await response.text()).replace(/\s+/g,'');
    const binary=Uint8Array.from(atob(encoded),ch=>ch.charCodeAt(0));
    const decoded=new Response(new Blob([binary]).stream().pipeThrough(new DecompressionStream('gzip')));
    return decoded.json();
  }
  load().then(loaded=>{
    if(loaded.nEncuestas!==324||loaded.dimensiones?.length!==4||loaded.dimensiones[3]?.id!=='percepcion')
      throw Error('La estructura de la caracterización no pasó las verificaciones.');
    const items=loaded.dimensiones.flatMap(d=>d.areas.flatMap(a=>a.temas));
    const metrics=items.flatMap(t=>t.metrics);
    if(items.length!==48||metrics.length!==49||metrics.some(m=>!Number.isInteger(m.n)||m.n<15||!m.q||!m.title))
      throw Error('Los indicadores agregados no pasaron las verificaciones de integridad.');
    data=loaded;syncHash();render();
  }).catch(err=>{
    $('k23-load').hidden=false;
    $('k23-load').textContent='No se pudieron cargar los resultados agregados: '+err.message;
  });
  window.TICaracterizacionKobo=Object.freeze({syncHash});
  window.addEventListener('hashchange',syncHash);
  window.addEventListener('popstate',syncHash);
})();