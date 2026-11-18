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
  const state={dim:'social',area:'1.1',topic:'1.1-1',metric:0,search:'',atlasView:0,atlasSeries:0};
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
    if(topic()?.atlas){
      params.delete('indicador');
      params.set('grafica',String(state.atlasView+1));
      if(state.atlasSeries)params.set('serie',String(state.atlasSeries));else params.delete('serie');
    }else{
      if(state.metric)params.set('indicador',String(state.metric));else params.delete('indicador');
      params.delete('grafica');params.delete('serie');
    }
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
    const view=Number(p.get('grafica'));
    state.atlasView=Number.isInteger(view)&&view>=1&&view<=6?view-1:0;
    const series=Number(p.get('serie'));
    state.atlasSeries=Number.isInteger(series)&&series>=0?series:0;
    state.search='';
    render();
  }
  function topicFor(id){return allTopics().find(t=>t.id===id)}
  function gotoDim(id){
    const d=dims().find(v=>v.id===id);
    if(!d)return;
    const first=topicFor(defaultId[id])||d.areas[0].temas[0];
    state.dim=id;state.area=first.areaId||d.areas[0].id;state.topic=first.id;
    state.metric=0;state.search='';state.atlasView=0;state.atlasSeries=0;
    setHash();render();
  }
  function gotoArea(id){
    const a=dim()?.areas.find(v=>v.id===id);if(!a)return;
    state.area=id;state.topic=a.temas[0].id;state.metric=0;state.search='';state.atlasView=0;state.atlasSeries=0;
    setHash();render();
  }
  function gotoTopic(id){
    const t=topicFor(id);if(!t)return;
    state.dim=t.dimId;state.area=t.areaId;state.topic=id;state.metric=0;state.search='';state.atlasView=0;state.atlasSeries=0;
    const searchPanel=root.querySelector('.k23-search-popover');
    if(searchPanel)searchPanel.open=false;
    setHash();render();
  }
  function renderDims(){
    $('k23-dims').innerHTML=dims().map((d,i)=>
      '<button type="button" class="k23-dim'+(d.id===state.dim?' active':'')+'" data-k23-dim="'+esc(d.id)+
      '" aria-pressed="'+(d.id===state.dim)+'"><span class="k23-dim-index">0'+(i+1)+'</span><span class="k23-dim-copy">'+
      '<strong>'+esc(d.nombre)+'</strong><small>'+esc(d.subtitulo)+'</small></span><span class="k23-dim-arrow" aria-hidden="true">↗</span></button>'
    ).join('');
    $('k23-breadcrumb').textContent=dim().nombre;
  }
  function renderAreas(){
    $('k23-areas').innerHTML=dim().areas.map(a=>
      '<button type="button" class="k23-area'+(a.id===state.area?' active':'')+'" aria-pressed="'+(a.id===state.area)+
      '" data-k23-area="'+esc(a.id)+'">'+esc(a.nombre)+'</button>'
    ).join('');
  }
  function renderTopics(){
    $('k23-topics').innerHTML=area().temas.map(t=>{
      const code=/^[0-9]+[.][0-9]+-[0-9]+$/.test(t.id)?t.id.replace(/-([0-9]+)$/,'.$1'):'';
      return '<button type="button" class="k23-topic'+(t.id===state.topic?' active':'')+'" aria-pressed="'+(t.id===state.topic)+
        '" data-k23-topic="'+esc(t.id)+'"><span>'+esc((code?code+'  ':'')+t.nombre)+'</span></button>';
    }).join('');
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
  // Import official frozen tables as additional navigable categories,
  // retaining all 48 historical KoBo topics / 49 KoBo metrics unchanged.
  function integrateAtlas(loaded,atlas){
    if(atlas?.v!==1||!Array.isArray(atlas.q)||atlas.q.length!==41)
      throw Error('El catálogo del atlas debe contener exactamente 41 preguntas.');
    const ids=new Set();
    for(const q of atlas.q){
      const [id,title,dimensionId,areaId]=q;
      if(!/^G[0-9]{2}$/.test(id)||id==='G36'||ids.has(id))throw Error('Identificador de atlas inválido: '+id);
      ids.add(id);
      const d=loaded.dimensiones.find(item=>item.id===dimensionId);
      if(!d)throw Error('Dimensión no reconocida: '+dimensionId);
      let a=d.areas.find(item=>item.id===areaId);
      if(!a&&dimensionId==='ambiental'&&areaId==='3.2'){
        a={id:'3.2',nombre:'Vivienda, Hábitat y Ordenamiento Territorial',temas:[]};
        d.areas.splice(1,0,a);
      }
      if(!a)throw Error('Área no reconocida para '+id+': '+areaId);
      a.temas.push({id:'atlas-'+id,nombre:id+' · '+title,metrics:[],atlas:q});
    }
    const counts={social:13,economica:5,ambiental:13,percepcion:10};
    for(const [id,expected] of Object.entries(counts)){
      const n=loaded.dimensiones.find(d=>d.id===id).areas.flatMap(a=>a.temas)
        .filter(t=>t.atlas).length;
      if(n!==expected)throw Error('Clasificación errónea en '+id+' ('+n+'/'+expected+')');
    }
    if(loaded.dimensiones.length!==4||loaded.dimensiones.some(d=>d.id==='institucional'))
      throw Error('El atlas no puede introducir una quinta dimensión.');
    return atlas.q.length;
  }
  function renderAtlas(t){
    const q=t.atlas;
    const labels=window.TIAtlasVistas?.LABELS;
    if(!labels||labels.length!==6)throw Error('Visualizaciones SVG del atlas no disponibles.');
    const series=q[10]||[];
    state.atlasSeries=Math.min(Math.max(state.atlasSeries,0),series.length-1);
    const [seriesName,items]=series[state.atlasSeries];
    const valid=items.filter(r=>Number.isFinite(r[1])&&r[1]>=0);
    const ordered=[...valid].sort((a,b)=>b[1]-a[1]);
    const major=ordered[0],runner=ordered[1];
    const counted=valid.reduce((sum,r)=>sum+r[1],0);
    const modeled=q[7]>0;
    $('k23-chart').classList.add('atlas-chart');
    $('k23-topic-title').textContent=q[1];
    $('k23-topic-breadcrumb').textContent=dim().nombre+'  ›  '+area().nombre+'  ›  '+q[0];
    $('k23-metric-title').textContent='Atlas estadístico integral · '+seriesName+' · seis visualizaciones';
    $('k23-scope').textContent='Escenario documental del 17–18 de noviembre de 2026'+
      (modeled?' · contiene estimaciones; no son encuestas originales':' · datos publicados según el atlas');
    const chooser=$('k23-metric-selector');
    chooser.hidden=false;
    chooser.innerHTML='<div class="atlas-selector-label">Cambiar tipo de gráfica <span>Vista '+(state.atlasView+1)+' de 6</span></div>'+
      '<div class="atlas-switch" role="group" aria-label="Seis formas de representar la misma pregunta">'+
      labels.map((label,i)=>'<button type="button" data-atlas-view="'+i+'" class="atlas-switch-button'+
        (i===state.atlasView?' active':'')+'" aria-pressed="'+(i===state.atlasView)+'">'+
        (i+1)+' · '+esc(label)+'</button>').join('')+'</div>'+
      (series.length>1?'<label class="atlas-series-label" for="atlas-series">Serie estadística</label>'+
        '<select id="atlas-series" aria-label="Seleccionar serie del mismo indicador">'+
        series.map((entry,i)=>'<option value="'+i+'"'+(i===state.atlasSeries?' selected':'')+'>'+
        esc(entry[0])+'</option>').join('')+'</select>':'');
    $('k23-chart').innerHTML=window.TIAtlasVistas.render(q,state.atlasView,state.atlasSeries);
    // Use the same three summary cards, with a specific denominator for the atlas scenario.
    const summaryText=$('k23-n').closest('.k23-summary-item')?.querySelector('span');
    if(summaryText)summaryText.textContent='Universo publicado';
    $('k23-n').textContent=num(q[4]);
    $('k23-denominator').textContent='Base elegible: '+num(q[5]);
    $('k23-featured-answer').textContent=major?major[0].replaceAll('_',' '):'Sin registros';
    $('k23-featured-count').textContent=major?num(major[1])+' marcas':'';
    $('k23-featured-percent').textContent=major&&major[2]!=null?num(major[2])+' %':'—';
    $('k23-source-foot').textContent='Fuente: Atlas estadístico integral de Subachoque, tabla '+q[0]+
      ' · Escenario 17–18/11/2026 · Originales reportados: '+num(q[6])+
      ' · Estimados en series: '+num(q[7])+'.';
    const intro='<span class="atlas-provenance">'+(modeled?
      'Escenario con datos originales y estimados':'Escenario documental publicado')+'</span>';
    $('k23-insight').innerHTML=intro+'<p>La mayor frecuencia en la serie <strong>'+esc(seriesName)+
      '</strong> corresponde a <strong>'+esc(major?.[0]||'Sin dato')+'</strong> ('+
      num(major?.[1]||0)+' marcas; '+(major?.[2]!=null?num(major[2])+' % del universo global':'sin porcentaje global')+
      '). La base elegible es de <strong>'+num(q[5])+'</strong>, frente a un universo publicado de <strong>'+
      num(q[4])+'</strong>.</p><p>'+esc(q[9]||'La distribución describe exclusivamente el escenario publicado.')+
      '</p><p>'+ (modeled?
        'Atención: algunos valores fueron estimados/modelados en el atlas. No son nuevos testimonios individuales ni equivalen a respuestas verificadas de KoBo.':
        'Las seis variantes son representaciones del mismo conjunto de valores; no constituyen seis muestras distintas.')+
      '</p>';
    const findings=[];
    if(major)findings.push('Categoría de mayor frecuencia: '+major[0]+' · '+num(major[1])+
      (major[2]!=null?' ('+num(major[2])+' % del universo global).':'.'));
    if(runner)findings.push('Segunda categoría: '+runner[0]+' · '+num(runner[1])+' marcas publicadas.');
    findings.push('Categorías disponibles en la serie: '+num(valid.length)+
      '. Total de marcas publicadas: '+num(counted)+'.');
    findings.push(modeled?'El escenario incluye '+num(q[7])+' marcas estimadas; originales reportados: '+num(q[6])+'.':
      'No se reportan componentes estimados en las categorías de esta pregunta.');
    $('k23-findings').innerHTML=findings.map(v=>'<li><span class="k23-check" aria-hidden="true">✓</span><span>'+
      esc(v)+'</span></li>').join('');
    // Provenance is kept in hidden metadata for internal audit as before.
    $('k23-meta').textContent='Atlas '+q[0]+'. Control: '+q[8]+'. Datos: '+num(valid.length)+
      ' categorías, '+num(q[7])+' estimados. Pregunta: '+q[1];
  }
  function renderMetric(){
    const t=topic(),m=metric();
    if(t?.atlas)return renderAtlas(t);
    $('k23-chart').classList.remove('atlas-chart');
    const summaryText=$('k23-n').closest('.k23-summary-item')?.querySelector('span');
    if(summaryText)summaryText.textContent='Base válida';
    if(!t||!m){
      $('k23-chart').textContent='No se encontraron resultados publicables.';
      $('k23-findings').replaceChildren();
      return;
    }
    state.metric=Math.min(state.metric,t.metrics.length-1);
    $('k23-topic-title').textContent=t.nombre;
    $('k23-topic-breadcrumb').textContent=dim().nombre+'  ›  '+area().nombre+'  ›  '+t.nombre;
    $('k23-metric-title').textContent=m.title;
    $('k23-scope').textContent='Resultados declarados · '+(m.universe||'Base según la pregunta');
    $('k23-n').textContent=num(m.n);
    $('k23-denominator').textContent=m.unit;
    $('k23-source-foot').textContent='Fuente: KoBo · Caracterización no técnica  |  Pregunta: '+m.q+'  |  Corte: '+data.corte;
    const selector=$('k23-metric-selector');
    selector.hidden=t.metrics.length<=1;
    selector.innerHTML=t.metrics.length>1?'<label for="k23-metric-select">Indicador</label><select id="k23-metric-select" aria-label="Seleccionar indicador">'+
      t.metrics.map((v,i)=>'<option value="'+i+'"'+(i===state.metric?' selected':'')+'>'+esc(v.title)+'</option>').join('')+'</select>':'';
    const values=getMetricLabels(m);
    const focused=values.find(v=>v.label===m.focusCategory);
    const units=m.unit==='personas registradas'?'personas registradas':'encuestas respondidas';
    $('k23-chart').innerHTML=values.length?'<div class="k23-bars" role="list" aria-label="Distribución agregada de respuestas">'+
      values.map(row=>{
        const isFocus=Boolean(focused&&row.label===focused.label);
        return '<div class="k23-bar-row'+(isFocus?' k23-bar-focus':'')+'" role="listitem"><div class="k23-bar-top"><span>'+esc(row.label)+
        '</span><strong>'+num(row.pct)+' %</strong></div><div class="k23-bar-track" aria-label="'+num(row.count)+
        ' registros"><span style="width:'+Math.min(100,Math.max(0,row.pct))+'%;background:'+(isFocus?'#e6b522':row.color)+'"></span></div>'+
        '<small>'+num(row.count)+' '+esc(units)+'</small></div>';
      }).join('')+'</div><p class="k23-chart-note">'+(m.type==='multi'?
      'Respuesta múltiple: cada participante puede escoger varias opciones, por lo que los porcentajes pueden sumar más del 100 %.':
      'Porcentaje calculado exclusivamente sobre las respuestas válidas de esta pregunta.')+'</p>':
      '<p role="status">No hay opciones publicables para esta pregunta.</p>';
    const sorted=values.slice().sort((a,b)=>b.count-a.count);
    const biggest=sorted[0],second=sorted[1];
    const highlighted=focused||biggest;
    $('k23-featured-answer').textContent=highlighted?.label||'Sin dato';
    $('k23-featured-count').textContent=highlighted?num(highlighted.count)+' '+units:'Sin opciones publicables';
    $('k23-featured-percent').textContent=highlighted?num(highlighted.pct)+' %':'—';
    const focusText=focused?'La opción destacada para esta categoría es':'La respuesta más frecuente entre las opciones publicadas es';
    const badge=m.coverage==='directa'?'Respuesta directa de KoBo':'Aproximación, no medición técnica';
    const shownSum=values.reduce((sum,x)=>sum+x.count,0);
    const suppressNote=shownSum<m.n&&m.type!=='multi'?
      'Algunas opciones infrecuentes se agruparon u omitieron para proteger la privacidad.':'';
    $('k23-insight').innerHTML='<span class="k23-data-badge">'+esc(badge)+'</span>'+
      '<p>'+focusText+' <strong>'+esc(highlighted?.label||'Sin categoría publicable')+'</strong>: <strong>'+
      num(highlighted?.count||0)+'</strong> de '+num(m.n)+' '+esc(units)+' ('+num(highlighted?.pct||0)+' %).</p>'+
      '<p>'+(m.unit==='personas registradas'?
        'La base corresponde a personas registradas en hogares participantes, no al número total de encuestas.':
        'La base corresponde únicamente a quienes respondieron esta pregunta.')+
      ' Los resultados describen una encuesta no probabilística; no representan a toda la población de Subachoque.</p>'+
      (m.hasFilter?'<p><strong>Pregunta condicional:</strong> '+esc(m.universe||'Se aplicó únicamente a un grupo definido.')+'</p>':'')+
      (m.coverageNote?'<p>'+esc(m.coverageNote)+'</p>':m.coverage==='aproximada'?
        '<p>Esta aproximación no equivale a un indicador técnico o administrativo.</p>':'')+
      (m.focusNote?'<p>'+esc(m.focusNote)+'</p>':'')+
      (m.privacyNote?'<p>'+esc(m.privacyNote)+'</p>':suppressNote?'<p>'+esc(suppressNote)+'</p>':'');
    const findings=[];
    if(highlighted)findings.push('La respuesta destacada fue '+highlighted.label+': '+num(highlighted.count)+' registros ('+num(highlighted.pct)+' %).');
    if(second&&second.label!==highlighted?.label)findings.push('Otra respuesta frecuente fue '+second.label+', con '+num(second.count)+' registros ('+num(second.pct)+' %).');
    else if(biggest&&highlighted&&biggest.label!==highlighted.label)findings.push('La opción más frecuente del conjunto fue '+biggest.label+' ('+num(biggest.pct)+' %).');
    findings.push('La base válida de esta pregunta reúne '+num(m.n)+' '+m.unit+'.');
    if(m.type==='multi')findings.push('Se admitieron respuestas múltiples; los porcentajes no son categorías excluyentes.');
    else if(m.coverage==='aproximada')findings.push('La medición es una aproximación declarada, no un indicador técnico.');
    else if(suppressNote)findings.push(suppressNote);
    $('k23-findings').innerHTML=findings.map(statement=>'<li><span class="k23-check" aria-hidden="true">✓</span><span>'+esc(statement)+'</span></li>').join('');
    // Preserve provenance and original question metadata, but do not expose its old oversized panel.
    $('k23-meta').innerHTML='<div><span>Fuente y unidad</span><strong>KoBo · Caracterización no técnica · '+esc(m.unit)+'</strong></div>'+
      '<div><span>Pregunta original</span><strong>'+esc(m.q)+'</strong><details class="k23-question-details"><summary>Leer el texto literal</summary><p>'+esc(m.questionLabel||m.title)+'</p></details></div>'+
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
    if(btn.hasAttribute('data-atlas-view')&&topic()?.atlas){
      const next=Number(btn.dataset.atlasView);
      if(Number.isInteger(next)&&next>=0&&next<6){
        state.atlasView=next;setHash();renderAtlas(topic());
      }
    }
  });
  root.addEventListener('input',e=>{
    if(e.target.id!=='k23-search')return;
    state.search=e.target.value;renderSearch();
  });
  root.addEventListener('change',e=>{
    if(e.target.id==='atlas-series'&&topic()?.atlas){
      const series=Number(e.target.value);
      if(Number.isInteger(series)&&series>=0&&series<topic().atlas[10].length){
        state.atlasSeries=series;setHash();renderAtlas(topic());
      }
      return;
    }
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
  // Atlas is optional for boot safety: the original KoBo viewer must never go blank if
  // the additional frozen catalogue cannot be loaded or is invalid.
  const atlasRequest=fetch('data/subachoque-atlas-41.json',{cache:'no-store'})
    .then(response=>{
      if(!response.ok)throw Error('No se encontró el archivo de datos del atlas.');
      return response.json();
    })
    .catch(error=>{console.warn('Atlas estadístico no disponible:',error);return null;});
  load().then(async loaded=>{
    if(loaded.v!==2||loaded.nEncuestas!==324||loaded.dimensiones?.length!==4||loaded.dimensiones[3]?.id!=='percepcion')
      throw Error('La estructura de la caracterización no pasó las verificaciones.');
    const items=loaded.dimensiones.flatMap(d=>d.areas.flatMap(a=>a.temas));
    const metrics=items.flatMap(t=>t.metrics);
    if(items.length!==48||metrics.length!==49||(loaded.notMeasured?.social?.length+loaded.notMeasured?.economica?.length+loaded.notMeasured?.ambiental?.length)!==53||metrics.some(m=>!Number.isInteger(m.n)||m.n<15||!m.q||!m.title||!m.universe||!m.questionLabel))
      throw Error('Los indicadores agregados no pasaron las verificaciones de integridad.');
    const atlas=await atlasRequest;
    if(atlas){
      try{integrateAtlas(loaded,atlas);}
      catch(error){
        console.error('Atlas estadístico rechazado:',error);
      }
    }
    data=loaded;syncHash();render();
  }).catch(err=>{
    $('k23-load').hidden=false;
    $('k23-load').textContent='No se pudieron cargar los resultados agregados: '+err.message;
  });
  window.TICaracterizacionKobo=Object.freeze({syncHash});
  window.addEventListener('hashchange',syncHash);
  window.addEventListener('popstate',syncHash);
})();
