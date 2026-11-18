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
  const defaultId={social:'salud-1',economica:'economica-comercio-4',ambiental:'ambiental-ambiente-1',percepcion:'percepcion-4.2'};
  const icon={social:'heart-pulse',economica:'chart',ambiental:'leaf',percepcion:'message'};
  const state={dim:'social',area:'salud',topic:'salud-1',metric:0,search:''};
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
  function topicFor(id){return allTopics().find(t=>t.id===id||t.koboIds?.includes(id))}
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
  const dimIcons={
    social:'<circle cx="17" cy="15" r="6"/><circle cx="32" cy="16" r="5"/><path d="M5 40v-6a12 12 0 0 1 24 0v6M27 29a11 11 0 0 1 14 11"/>',
    economica:'<ellipse cx="24" cy="12" rx="16" ry="6"/><path d="M8 12v12c0 8 32 8 32 0V12M8 24v12c0 8 32 8 32 0V24M8 18c0 8 32 8 32 0"/>',
    ambiental:'<path d="M8 42C6 18 20 9 43 6 43 30 28 42 8 42Zm0 0 26-26"/>',
    percepcion:'<circle cx="17" cy="16" r="5"/><circle cx="32" cy="16" r="5"/><path d="M2 40v-6c0-13 23-13 23 0v6M23 40v-6c0-13 23-13 23 0v6"/>'
  };
  const areaGlyphs={salud:'✚',educacion:'▤',inclusion:'♧',cultura:'◈',deporte:'◉',justicia:'⬡',agricultura:'❀',comercio:'▣',turismo:'⌂',empleo:'♧',energia:'ϟ',hacienda:'▥',ambiente:'❀',vivienda:'⌂',movilidad:'↝',riesgo:'⬡'};
  function renderDims(){
    $('k23-dims').innerHTML=dims().map((d,i)=>
      '<button type="button" class="k23-dim'+(d.id===state.dim?' active':'')+'" data-k23-dim="'+esc(d.id)+
      '" aria-pressed="'+(d.id===state.dim)+'"><span class="k23-dim-icon" aria-hidden="true">'+
      '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">'+(dimIcons[d.id]||dimIcons.social)+'</svg></span>'+
      '<span class="k23-dim-copy"><strong>'+esc(d.nombre)+'</strong><small>'+esc(d.subtitulo)+'</small></span>'+
      '<span class="k23-dim-arrow" aria-hidden="true">›</span></button>'
    ).join('');
    $('k23-breadcrumb').textContent=dim().nombre;
  }
  function renderAreas(){
    $('k23-areas').innerHTML=dim().areas.map(a=>
      '<button type="button" class="k23-area'+(a.id===state.area?' active':'')+'" aria-pressed="'+(a.id===state.area)+
      '" data-k23-area="'+esc(a.id)+'"><span class="k23-area-icon" aria-hidden="true">'+esc(areaGlyphs[a.id]||'◈')+
      '</span><span>'+esc(a.nombre)+'</span></button>'
    ).join('');
  }
  function renderTopics(){
    const isPerception=state.dim==='percepcion';
    $('k23-category-row').hidden=isPerception;
    $('k23-topics').innerHTML=isPerception?'':area().temas.map(t=>
      '<button type="button" class="k23-topic'+(t.id===state.topic?' active':'')+'" aria-pressed="'+(t.id===state.topic)+
      '" data-k23-topic="'+esc(t.id)+'"><span>'+esc((t.code?t.code+' ':'')+t.nombre)+'</span></button>'
    ).join('');
    $('k23-selected-path').textContent=dim().nombre+'  ›  '+area().nombre+
      (isPerception?'':'  ›  '+(topic()?.nombre||''));
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
    const t=topic();
    if(!t)return;
    const selector=$('k23-metric-selector');
    const hasMetrics=Array.isArray(t.metrics)&&t.metrics.length>0;
    state.metric=hasMetrics?Math.max(0,Math.min(state.metric,t.metrics.length-1)):0;
    const m=hasMetrics?t.metrics[state.metric]:null;
    $('k23-topic-title').textContent=t.nombre;
    $('k23-metric-title').textContent=m?.title||(state.dim==='percepcion'?'Información de percepción sobre la gestión municipal':'Resultados de caracterización del territorio');
    $('k23-scope').textContent=m?'KoBo · '+data.corte+' · '+(m.universe||'Base válida según la pregunta'):
      'Categoría del inventario territorial · sin resultados KoBo publicables';
    selector.hidden=!m||t.metrics.length<=1;
    selector.innerHTML=m&&t.metrics.length>1?'<label for="k23-metric-select">Indicador</label>'+
      '<select id="k23-metric-select" aria-label="Seleccionar indicador de esta categoría">'+
      t.metrics.map((v,i)=>'<option value="'+i+'"'+(i===state.metric?' selected':'')+'>'+esc(v.title)+'</option>').join('')+'</select>':'';
    if(!m){
      $('k23-chart').innerHTML='<div class="k23-no-data" role="status"><span aria-hidden="true">▥</span>'+
        '<h3>Sin resultados disponibles para esta categoría</h3><p>El tema está incluido en DIMENSIONES.docx, pero la encuesta KoBo no contiene una medición publicable que pueda atribuirse a este apartado.</p>'+
        '<p>No se presentan cifras de ejemplo ni se reemplazan con las de otra categoría.</p></div>';
      $('k23-n').textContent='—';$('k23-denominator').textContent='Sin base válida';
      $('k23-summary-top').textContent='Sin datos';$('k23-summary-options').textContent='0';
      $('k23-insight').innerHTML='<p>No hay datos suficientes para realizar una interpretación analítica de este tema. Se mantiene la categoría para incorporar futuros indicadores verificados.</p>';
      $('k23-findings').innerHTML='<p class="k23-empty-findings">No hay hallazgos estadísticos publicables para esta selección.</p>';
      $('k23-meta').innerHTML='<p>Catálogo temático: DIMENSIONES.docx. Sin pregunta KoBo equivalente verificada.</p>';
      return;
    }
    const values=getMetricLabels(m);
    const units=m.unit==='personas registradas'?'personas registradas':'encuestas respondidas';
    const sorted=[...values].sort((a,b)=>b.count-a.count);
    const biggest=sorted[0],second=sorted[1];
    $('k23-n').textContent=num(m.n);
    $('k23-denominator').textContent=esc(m.unit);
    $('k23-summary-top').textContent=biggest?num(biggest.pct)+' %':'Sin dato';
    $('k23-summary-options').textContent=String(values.length);
    $('k23-chart').innerHTML=values.length?'<div class="k23-bars" role="list" aria-label="Distribución agregada de respuestas">'+
      values.map((row,i)=>'<div class="k23-bar-row" role="listitem"><div class="k23-bar-top"><span>'+esc(row.label)+
        '</span><strong>'+num(row.pct)+' %</strong></div><div class="k23-bar-track" aria-label="'+num(row.count)+
        ' registros"><span style="width:'+Math.min(100,Math.max(0,row.pct))+'%;background:'+(i===0?'#e6b522':row.color)+'"></span></div>'+
        '<small>'+num(row.count)+' '+esc(units)+'</small></div>'
      ).join('')+'</div><p class="k23-chart-note">'+(m.type==='multi'?
        'Respuesta múltiple: una persona puede escoger varias opciones; los porcentajes pueden superar el 100 % al sumarse.':
        'Los porcentajes se calculan con la base válida específica de esta pregunta.')+'</p>':
      '<div class="k23-no-data" role="status"><h3>Sin opciones publicables</h3><p>Las categorías con menos de cinco registros no se muestran.</p></div>';
    const dataBadge=state.dim==='percepcion'?'Pregunta KoBo relacionada con el área':
      m.coverage==='directa'?'Respuesta directa de KoBo':'Aproximación a esta categoría';
    const description=biggest?'Entre las respuestas publicables, la opción más frecuente fue <strong>'+esc(biggest.label)+'</strong>, con <strong>'+num(biggest.count)+
      '</strong> '+esc(units)+' ('+num(biggest.pct)+' %).':'No existen opciones con un mínimo de cinco registros publicables.';
    $('k23-insight').innerHTML='<span class="k23-data-badge">'+esc(dataBadge)+'</span>'+
      '<p>'+description+'</p><p>La base corresponde a <strong>'+num(m.n)+'</strong> '+esc(m.unit)+
      ' asociados a esta pregunta. Se describen únicamente las respuestas de participantes de una encuesta no probabilística, sin extrapolación a la población municipal.</p>'+
      (m.hasFilter?'<p><strong>Pregunta condicional:</strong> '+esc(m.universe||'Se aplicó solo a un grupo definido.')+'</p>':'')+
      (m.coverageNote?'<p>'+esc(m.coverageNote)+'</p>':'')+
      (m.privacyNote?'<p>'+esc(m.privacyNote)+'</p>':'')+
      (state.dim==='percepcion'?'<p>El indicador presentado no sustituye una evaluación integral del área de percepción.</p>':'');
    const points=[];
    if(biggest)points.push('La opción '+biggest.label+' concentra '+num(biggest.pct)+' % de las respuestas válidas ('+num(biggest.count)+' registros).');
    if(second)points.push('La segunda opción publicable fue '+second.label+', con '+num(second.pct)+' % ('+num(second.count)+' registros).');
    points.push('Base válida para esta pregunta: '+num(m.n)+' '+m.unit+'.');
    if(m.type==='multi')points.push('Se permitieron respuestas múltiples; no sumar porcentajes como si fueran categorías excluyentes.');
    $('k23-findings').innerHTML='<ul>'+points.map(x=>'<li><span class="k23-finding-check" aria-hidden="true">✓</span><span>'+esc(x)+'</span></li>').join('')+'</ul>';
    $('k23-meta').innerHTML='<div><span>Fuente y unidad</span><strong>KoBo · Caracterización no técnica · '+esc(m.unit)+'</strong></div>'+
      '<div><span>Pregunta original</span><strong>'+esc(m.q)+'</strong><details class="k23-question-details"><summary>Leer texto literal</summary><p>'+esc(m.questionLabel||m.title)+'</p></details></div>'+
      '<div><span>Base válida</span><strong>'+num(m.n)+'</strong></div>'+
      '<div><span>Corte</span><strong>'+esc(data.corte)+'</strong></div>';
  }
  function renderGaps(){
    const wrap=$('k23-gaps');
    if(!wrap)return;
    const unmeasured=(data.notMeasured||{})[state.dim]||[];
    if(!unmeasured.length){
      wrap.innerHTML='<p class="k23-covered-note">Esta dimensión reúne preguntas específicas de percepción ciudadana, distintas de los indicadores administrativos de Data Subachoque.</p>';
      return;
    }
    const grouped=new Map();
    for(const item of unmeasured){
      if(!grouped.has(item.area))grouped.set(item.area,[]);
      grouped.get(item.area).push(item);
    }
    const why={
      no_cubierto:'Sin pregunta equivalente en KoBo',
      muestra_insuficiente:'Respuestas insuficientes',
      requiere_validacion:'Excluido por sensibilidad',
      excluida_vivienda:'Fuera de alcance: vivienda'
    };
    wrap.innerHTML='<details class="k23-gaps-details"><summary><span>¿Qué subtemas no cubre KoBo en esta dimensión?</span>'+
      '<strong>'+unmeasured.length+' sin indicador publicable</strong></summary>'+
      '<p>Se conservan en el inventario territorial; no se les atribuyen respuestas o cifras que el formulario no recolectó.</p>'+
      [...grouped].map(([group,items])=>'<section class="k23-gap-group"><h4>'+esc(group)+'</h4><ul>'+
      items.map(item=>'<li><span>'+esc(item.code+' '+item.title)+'</span><small>'+esc(why[item.state]||'Pendiente de validación')+'</small></li>').join('')+
      '</ul></section>').join('')+'</details>';
  }

  function render(){
    if(!data)return;
    renderDims();renderAreas();renderTopics();renderMetric();renderGaps();
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
    const [response,taxonomyResponse]=await Promise.all([
      fetch('data/caracterizacion-kobo-2026-agregados.gz.b64',{cache:'no-store'}),
      fetch('data/dimensiones-kobo-catalogo.json',{cache:'no-store'})
    ]);
    if(!response.ok||!taxonomyResponse.ok)throw Error('No está disponible la base agregada o el catálogo de dimensiones.');
    if(typeof DecompressionStream==='undefined'||typeof atob==='undefined')throw Error('Este navegador no admite la descompresión de datos del visor.');
    const encoded=(await response.text()).replace(/\s+/g,'');
    const binary=Uint8Array.from(atob(encoded),ch=>ch.charCodeAt(0));
    const decoded=new Response(new Blob([binary]).stream().pipeThrough(new DecompressionStream('gzip')));
    return {aggregates:await decoded.json(),taxonomy:await taxonomyResponse.json()};
  }
  const perceptionGroups={
    'percepcion-4.1':[],
    'percepcion-4.2':['per-gestion-gest','per-gestion-apoyos','per-programas-apoyo','per-servicios-salud','per-servicios-cultura','per-servicios-vial','per-presencia-seguridad'],
    'percepcion-4.3':['per-participacion-jac','per-participacion-votacion','per-programas-actividades','per-presencia-presencia'],
    'percepcion-4.4':['per-informacion-enterados','per-informacion-medios','per-informacion-visor','per-programas-conocimiento']
  };
  function combineOfficialAndKobo(aggregates,taxonomy){
    const original=aggregates.dimensiones.flatMap(d=>d.areas.flatMap(a=>
      a.temas.map(t=>({...t,sourceDim:d.id,sourceArea:a.id}))));
    const dimensions=taxonomy.dimensiones.map(d=>({
      id:d.id,nombre:d.nombre,subtitulo:d.subtitulo,
      areas:d.areas.map(a=>({
        id:a.id,code:a.code,nombre:a.nombre,
        temas:a.temas.map(t=>{
          if(d.id==='percepcion'){
            const ids=perceptionGroups[t.id]||[];
            return {...t,koboIds:ids,metrics:ids.flatMap(id=>{
              const originalTopic=original.find(x=>x.id===id);
              return originalTopic?.metrics||[];
            })};
          }
          const match=original.find(x=>x.sourceDim===d.id&&norm(x.nombre)===norm(t.nombre)&&
            (x.sourceArea===a.code||x.sourceArea===a.id));
          return {...t,koboIds:match?[match.id]:[],metrics:match?.metrics||[]};
        })
      }))
    }));
    if(dimensions.length!==4||dimensions.some(d=>d.id==='institucional')||
      dimensions[0].areas.length!==6||dimensions[1].areas.length!==6||
      dimensions[2].areas.length!==4||dimensions[3].areas.length!==4||
      dimensions.slice(0,3).reduce((n,d)=>n+d.areas.reduce((x,a)=>x+a.temas.length,0),0)!==86)
      throw Error('La taxonomía del documento Word no pasó las comprobaciones de integridad.');
    return {...aggregates,dimensiones:dimensions};
  }
  load().then(({aggregates:loaded,taxonomy})=>{
    if(loaded.v!==2||loaded.nEncuestas!==324||loaded.dimensiones?.length!==4||loaded.dimensiones[3]?.id!=='percepcion')
      throw Error('La estructura de la caracterización no pasó las verificaciones.');
    const items=loaded.dimensiones.flatMap(d=>d.areas.flatMap(a=>a.temas));
    const metrics=items.flatMap(t=>t.metrics);
    if(items.length!==48||metrics.length!==49||(loaded.notMeasured?.social?.length+loaded.notMeasured?.economica?.length+loaded.notMeasured?.ambiental?.length)!==53||metrics.some(m=>!Number.isInteger(m.n)||m.n<15||!m.q||!m.title||!m.universe||!m.questionLabel))
      throw Error('Los indicadores agregados no pasaron las verificaciones de integridad.');
    data=combineOfficialAndKobo(loaded,taxonomy);syncHash();render();
  }).catch(err=>{
    $('k23-load').hidden=false;
    $('k23-load').textContent='No se pudieron cargar los resultados agregados: '+err.message;
  });
  window.TICaracterizacionKobo=Object.freeze({syncHash});
  window.addEventListener('hashchange',syncHash);
  window.addEventListener('popstate',syncHash);
})();