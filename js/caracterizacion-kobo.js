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
  const pct=n=>{
    const decimals=Math.abs(Number(n)*10-Math.round(Number(n)*10))<1e-7?1:2;
    return new Intl.NumberFormat('es-CO',{maximumFractionDigits:decimals}).format(Number(n)||0);
  };
  const COLORS=['#edbe23','#56b8cc','#6497db','#8f84cd','#df9274','#4aa998','#738caa','#a4aeb9','#d7a65a','#ac8fb4'];
  const defaultId={social:'atlas-G13',economica:'2.2-1',ambiental:'3.1-1',percepcion:'per-gestion-gest'};
  const icon={social:'heart-pulse',economica:'chart',ambiental:'leaf',percepcion:'message'};
  const state={dim:'social',area:'1.1',topic:'atlas-G13',metric:0,search:'',atlasView:0,atlasSeries:0};
  let data=null;
  let atlasManifest=null;
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
      if(state.atlasView)params.set('grafica',String(state.atlasView+1));
      else params.delete('grafica');
      params.delete('serie');
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
    const selected=picked||chosenArea.temas.find(t=>t.id===p.get('tema'))||(!p.has('area')?base:null)||chosenArea.temas.find(t=>t.atlas)||chosenArea.temas[0];
    state.dim=requested.id;
    state.area=(picked?.areaId||(!p.has('area')?base?.areaId:null)||chosenArea.id);
    state.topic=selected?.id||chosenArea.temas[0]?.id||'';
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
    const original=topicFor(defaultId[id]);
    const selectedArea=d.areas.find(a=>a.id===original?.areaId);
    const first=selectedArea?.temas.find(t=>t.atlas)||d.areas.flatMap(a=>a.temas).find(t=>t.atlas)||original||d.areas.flatMap(a=>a.temas)[0];
    const resolved=topicFor(first?.id);
    state.dim=id;state.area=resolved?.areaId||d.areas[0].id;state.topic=resolved?.id||'';
    state.metric=0;state.search='';state.atlasView=0;state.atlasSeries=0;
    setHash();render();
  }
  function gotoArea(id){
    const a=dim()?.areas.find(v=>v.id===id);if(!a)return;
    state.area=id;state.topic=(a.temas.find(t=>t.atlas)||a.temas[0])?.id||'';state.metric=0;state.search='';state.atlasView=0;state.atlasSeries=0;
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
    // Original notebook JPGs first; KoBo is still available as source-specific
    // published numbers, never silently replaced with a reconstructed chart.
    const ordered=area().temas.slice().sort((a,b)=>Number(Boolean(b.atlas))-Number(Boolean(a.atlas)));
    $('k23-topics').innerHTML=ordered.length?ordered.map(t=>{
      const code=/^[0-9]+[.][0-9]+-[0-9]+$/.test(t.id)?t.id.replace(/-([0-9]+)$/,'.$1'):'';
      const label=t.id==='atlas-G13'?'Aseguramiento · G13 · JPG original':
        t.id==='1.1-1'?'Aseguramiento · KoBo (datos directos)':
        (t.atlas?t.nombre+' · JPG original':(code?code+'  ':'')+t.nombre+' · KoBo');
      return '<button type="button" class="k23-topic'+(t.id===state.topic?' active':'')+'" aria-pressed="'+(t.id===state.topic)+
        '" data-k23-topic="'+esc(t.id)+'"><span>'+esc(label)+'</span></button>';
    }).join(''):'<span class="k23-no-topics">No hay indicadores publicados para esta área.</span>';
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
  function applyOfficialTaxonomy(loaded,catalog){
    if(catalog?.version!==1||catalog.dimensions?.length!==4)
      throw Error('Taxonomía territorial incompleta.');
    const before=new Set(loaded.dimensiones.flatMap(d=>d.areas.flatMap(a=>a.temas.map(t=>t.id))));
    if(before.size!==48)throw Error('La cantidad original de indicadores KoBo cambió.');
    const remap=catalog.legacyKoboAreaMap;
    for(const d of loaded.dimensiones){
      const official=catalog.dimensions.find(item=>item.id===d.id);
      if(!official)throw Error('Dimensión no reconocida: '+d.id);
      const old=d.areas.flatMap(a=>a.temas.map(t=>({topic:t,legacyArea:a.id})));
      const grouped=new Map(official.areas.map(a=>[a.id,[]]));
      for(const item of old){
        const target=d.id==='percepcion'?remap[item.topic.id]:item.legacyArea;
        if(!grouped.has(target))throw Error('Área sin correspondencia: '+item.topic.id+' -> '+target);
        grouped.get(target).push(item.topic);
      }
      d.areas=official.areas.map(a=>({id:a.id,nombre:a.nombre,temas:grouped.get(a.id)}));
      d.nombre=official.nombre;
    }
    const after=new Set(loaded.dimensiones.flatMap(d=>d.areas.flatMap(a=>a.temas.map(t=>t.id))));
    if(after.size!==48||[...before].some(id=>!after.has(id)))throw Error('Se perdieron categorías originales de KoBo.');
    if(loaded.dimensiones.some((d,i)=>d.areas.length!==[6,6,4,4][i]))
      throw Error('La estructura oficial 6/6/4/4 no coincide.');
  }
  function integrateAtlas(loaded,atlas,catalog){
    if(atlas?.v!==1||!Array.isArray(atlas.q)||atlas.q.length!==41)
      throw Error('El Atlas debe contener 41 preguntas.');
    const ids=new Set();
    for(const q of atlas.q){
      const id=q[0],binding=catalog.atlasBindings[id];
      if(!/^G[0-9]{2}$/.test(id)||id==='G36'||ids.has(id)||!binding)
        throw Error('Identificador del Atlas inválido: '+id);
      ids.add(id);
      const d=loaded.dimensiones.find(item=>item.id===binding.dimension);
      const a=d?.areas.find(item=>item.id===binding.area);
      if(!a)throw Error('Área oficial sin correspondencia: '+id);
      a.temas.push({id:'atlas-'+id,nombre:id+' · '+q[1],metrics:[],atlas:q,
        classification:catalog.classificationNotes?.[id]||''});
    }
    const counts={social:13,economica:6,ambiental:13,percepcion:9};
    for(const [id,count] of Object.entries(counts)){
      const n=loaded.dimensiones.find(d=>d.id===id).areas.reduce((sum,a)=>
        sum+a.temas.filter(t=>t.atlas).length,0);
      if(n!==count)throw Error('Distribución del Atlas incorrecta: '+id+' = '+n);
    }
    return ids.size;
  }
  function renderTypeSelector(hasSeries=false,series=[]){
    const labels=['Barras','Puntos','Proporciones','Mosaico','Circular','Columnas'];
    const icons=["<path d=\"M3 5h3v3H3zM9 5h12M3 11h3v3H3zM9 11h12M3 17h3v3H3zM9 17h12\"/>", "<circle cx=\"7\" cy=\"7\" r=\"2\"/><circle cx=\"17\" cy=\"7\" r=\"2\"/><circle cx=\"12\" cy=\"17\" r=\"2\"/><path d=\"M9 8.5l2 6M15 8.5l-2 6\"/>", "<rect x=\"3\" y=\"5\" width=\"3\" height=\"14\"/><rect x=\"8\" y=\"5\" width=\"5\" height=\"14\"/><rect x=\"15\" y=\"5\" width=\"6\" height=\"14\"/>", "<rect x=\"3\" y=\"3\" width=\"8\" height=\"8\"/><rect x=\"13\" y=\"3\" width=\"8\" height=\"8\"/><rect x=\"3\" y=\"13\" width=\"8\" height=\"8\"/><rect x=\"13\" y=\"13\" width=\"8\" height=\"8\"/>", "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 12V3M12 12l8 4M12 12l-5 7\"/>", "<rect x=\"4\" y=\"13\" width=\"3\" height=\"8\"/><rect x=\"10\" y=\"8\" width=\"3\" height=\"13\"/><rect x=\"16\" y=\"3\" width=\"3\" height=\"18\"/>"];
    const buttons=labels.map((label,i)=>
      '<button type="button" class="atlas-switch-button'+(i===state.atlasView?' active':'')+
      '" data-atlas-view="'+i+'" aria-label="Mostrar gráfica de '+esc(label)+
      '" aria-pressed="'+(state.atlasView===i)+'"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+
      icons[i]+'</svg><span>'+esc(label)+'</span></button>'
    ).join('');
    return '<div class="atlas-selector-row"><strong class="atlas-selector-label">Tipo de gráfica:</strong>'+
      '<div class="atlas-switch" role="group" aria-label="Tipo de gráfica">'+buttons+'</div></div>'+
      (hasSeries&&series.length>1?'<div class="atlas-secondary-selector"><label for="atlas-series">Serie de la pregunta:</label>'+
        '<select id="atlas-series" aria-label="Seleccionar serie del mismo indicador">'+
        series.map((entry,i)=>'<option value="'+i+'"'+(i===state.atlasSeries?' selected':'')+'>'+
        esc(entry[0].replaceAll('_',' '))+'</option>').join('')+'</select></div>':'');
  }
  function renderAtlas(t){
    const q=t.atlas,id=q[0],meta=atlasManifest?.questions?.[id];
    const series=q[10]||[];
    state.atlasSeries=Math.max(0,Math.min(state.atlasSeries,series.length-1));
    const [seriesName,items]=series[state.atlasSeries]||['Sin serie',[]];
    const valid=items.filter(r=>Number.isFinite(r[1])&&r[1]>=0);
    const ordered=valid.slice().sort((a,b)=>b[1]-a[1]);
    const major=ordered[0],runner=ordered[1];
    const total=valid.reduce((sum,r)=>sum+r[1],0);
    const modelCoverage=Number(q[7])||0;
    const modelMarks=valid.reduce((sum,r)=>sum+(Number(r[3])||0),0);
    const note=(modelCoverage||modelMarks)?' · Incluye estimaciones, diferenciadas de registros originales':'';
    $('k23-chart').classList.add('atlas-chart');
    $('k23-topic-title').textContent=id==='G13'?'Aseguramiento':q[1];
    $('k23-topic-breadcrumb').textContent=dim().nombre+'  ›  '+area().nombre+'  ›  '+id;
    $('k23-metric-title').textContent=(id==='G13'?q[1]+' · ':'Atlas estadístico integral · ')+seriesName.replaceAll('_',' ');
    $('k23-scope').textContent='Escenario documentado del 17–18 de noviembre de 2026'+note;
    const chooser=$('k23-metric-selector');
    chooser.hidden=false;
    chooser.innerHTML=renderTypeSelector(true,series);
    const source=meta?.views?.[state.atlasView];
    const safeSource=typeof source==='string'&&
      new RegExp('^assets/atlas-original/'+id+'/'+id+'_[0-9]{2}_[a-z0-9_]+[.]jpg$').test(source);
    if(safeSource){
      $('k23-chart').innerHTML='<figure class="atlas-original-figure">'+
        '<button type="button" class="atlas-image-open" data-atlas-open="1" aria-label="Ampliar la gráfica original de '+esc(id)+'">'+
        '<img id="k23-atlas-image" class="atlas-original-image" src="'+esc(source)+'" '+
        'alt="Gráfica original '+esc(id)+' · '+esc(q[1])+' · '+(state.atlasView+1)+' de seis" '+
        'loading="eager" decoding="async" /></button>'+
        '<figcaption>Imagen original del notebook · '+(state.atlasView+1)+' de 6 · Haz clic para ampliar</figcaption></figure>';
      const next=meta.views[(state.atlasView+1)%6];
      if(next&&typeof Image!=='undefined'){const preloaded=new Image();preloaded.src=next;}
    }else{
      $('k23-chart').innerHTML='<div class="atlas-image-error" role="status"><strong>Imagen original no disponible.</strong>'+
        '<p>El indicador y sus datos permanecen disponibles. Comprueba el manifiesto de imágenes antes de publicar.</p></div>';
    }
    $('k23-source-foot').textContent='Fuente: Atlas estadístico integral de Subachoque | '+id+
      ' | Corte: 17–18/11/2026 | Registros originales: '+num(q[6])+
      ' | Estimaciones de cobertura: '+num(modelCoverage)+' | Estado: '+q[8]+'.';
    const warning=valid.some(r=>r[1]>0&&r[1]<5);
    $('k23-insight').innerHTML='<span class="atlas-provenance">'+
      esc(q[8])+'</span>'+
      '<p>En la serie <strong>'+esc(seriesName.replaceAll('_',' '))+
      '</strong>, la categoría con más marcas publicadas es <strong>'+
      esc(major?.[0]?.replaceAll('_',' ')||'Sin datos')+
      '</strong> ('+num(major?.[1]||0)+' marcas; '+(major?.[2]!=null?pct(major[2])+' % del universo global':'sin porcentaje disponible')+
      '). La base elegible es '+num(q[5])+' y el universo documental es '+num(q[4])+'.</p>'+
      (q[9]?'<p>'+esc(q[9])+'</p>':'')+
      (t.classification?'<p>'+esc(t.classification)+'</p>':'')+
      ((modelCoverage||modelMarks)?'<p>Las estimaciones de cobertura ('+num(modelCoverage)+
        ') son distintas de las marcas estimadas en esta serie ('+num(modelMarks)+
        '); no representan nuevas encuestas originales.</p>':'')+
      (warning?'<p>Nota de privacidad: existen categorías de frecuencia reducida; no se ofrecen cruces individuales ni datos personales.</p>':'');
    const findings=[];
    if(major)findings.push('Mayor frecuencia: '+major[0].replaceAll('_',' ')+', '+num(major[1])+
      ' marcas'+(major[2]!=null?' ('+pct(major[2])+' % del universo global).':'.'));
    if(runner)findings.push('Segunda categoría: '+runner[0].replaceAll('_',' ')+
      ' ('+num(runner[1])+' marcas).');
    findings.push('La serie presenta '+num(valid.length)+' categorías y '+num(total)+' marcas publicadas'+
      (series.length>1?'; existen '+series.length+' series diferenciadas.':'.'));
    if(modelMarks!==modelCoverage)findings.push('Las marcas estimadas por categoría y las estimaciones de cobertura miden conceptos distintos.');
    $('k23-findings').innerHTML=findings.map(v=>'<li><span class="k23-check" aria-hidden="true">✓</span><span>'+
      esc(v)+'</span></li>').join('');
    $('k23-meta').textContent='Atlas '+id+'. Estado: '+q[8]+'. Fuente original: '+atlasManifest?.source+
      '. Series: '+series.length+'.';
  }
  function renderMetric(){
    const t=topic(),m=metric();
    if(t?.atlas){$('k23-chart').classList.remove('kobo-image-chart','kobo-tabular-chart');return renderAtlas(t);}
    $('k23-chart').classList.remove('atlas-chart','kobo-image-chart','kobo-tabular-chart');
    if(!t||!m){
      $('k23-topic-title').textContent=area()?.nombre||'Sin indicadores';
      $('k23-topic-breadcrumb').textContent=dim().nombre+'  ›  '+area().nombre;
      $('k23-metric-title').textContent='Esta área oficial todavía no dispone de indicadores publicados.';
      $('k23-scope').textContent='No se presentan cifras ni categorías inventadas.';
      $('k23-metric-selector').hidden=true;
      $('k23-metric-selector').replaceChildren();
      $('k23-chart').innerHTML='<div class="k23-no-published" role="status">Sin datos disponibles para esta área. Puedes seleccionar otra área o dimensión.</div>';
      $('k23-insight').innerHTML='<p>Esta área forma parte de la estructura territorial oficial. No se identificó una medición pública verificable para este apartado.</p>';
      $('k23-findings').replaceChildren();
      $('k23-source-foot').textContent='Fuente: catálogo oficial de dimensiones · Sin indicador integrado.';
      return;
    }
    state.metric=Math.min(state.metric,t.metrics.length-1);
    $('k23-topic-title').textContent=t.nombre;
    $('k23-topic-breadcrumb').textContent=dim().nombre+'  ›  '+area().nombre+'  ›  '+t.nombre;
    $('k23-metric-title').textContent=m.title;
    $('k23-scope').textContent='Resultados declarados · '+(m.universe||'Base según la pregunta');
    $('k23-source-foot').textContent='Fuente: KoBo · Caracterización no técnica  |  Pregunta: '+m.q+'  |  Corte: '+data.corte;
    const selector=$('k23-metric-selector');
    selector.hidden=t.metrics.length<=1;
    selector.innerHTML=t.metrics.length>1?'<div class="atlas-secondary-selector"><label for="k23-metric-select">Indicador KoBo:</label>'+
      '<select id="k23-metric-select" aria-label="Seleccionar indicador de KoBo">'+
      t.metrics.map((v,i)=>'<option value="'+i+'"'+(i===state.metric?' selected':'')+'>'+esc(v.title)+'</option>').join('')+
      '</select></div>':'';
    const values=getMetricLabels(m);
    const focused=values.find(v=>v.label===m.focusCategory);
    const units=m.unit==='personas registradas'?'personas registradas':'encuestas respondidas';
    // Actual notebook JPGs belong to the separate Gxx Atlas indicators.
    // A KoBo direct response with different counts is shown AS DATA, not a
    // fabricated image or mislabeled notebook graphic. Preserve the response.
    const originalRelated=m.id==='kobo_1'?'atlas-G13':null;
    $('k23-chart').classList.add('kobo-tabular-chart');
    const content=values.length?
      '<table class="kobo-results-table"><thead><tr><th scope="col">Respuesta publicada</th>'+
      '<th scope="col">Registros</th><th scope="col">Porcentaje</th></tr></thead><tbody>'+
      values.map(v=>'<tr><th scope="row">'+esc(v.label)+'</th>'+
        '<td>'+num(v.count)+'</td><td>'+pct(v.pct)+' %</td></tr>').join('')+
      '</tbody></table>':
      '<p>No hay categorías publicables en esta pregunta.</p>';
    $('k23-chart').innerHTML='<section class="kobo-results-panel" aria-label="Datos KoBo sin gráfica reconstruida">'+
      '<h3>Resultados originales declarados en KoBo</h3>'+
      '<p class="kobo-results-intro">Respuestas agregadas: base de '+num(m.n)+' '+esc(m.unit)+
      '. No se inventa una visualización que el notebook original no contiene.</p>'+
      content+
      (m.type==='multi'?'<p class="kobo-results-note">Respuesta múltiple: los porcentajes pueden superar el 100 %.</p>':'')+
      (originalRelated?
        '<div class="kobo-original-related"><p><strong>Hay un indicador relacionado en el Atlas (G13).</strong> '+
        'Sus cifras incluyen conciliaciones o estimaciones y no deben interpretarse como idénticas a KoBo.</p>'+
        '<button type="button" class="kobo-original-link" data-k23-topic="'+originalRelated+'">'+
        'Ver las seis imágenes JPG originales de G13</button></div>':
        '<p class="kobo-results-note">Los indicadores Gxx del Atlas, cuando existen, muestran las seis imágenes JPG originales del notebook.</p>')+
      '</section>';
    const sorted=values.slice().sort((a,b)=>b.count-a.count);
    const biggest=sorted[0],second=sorted[1];
    const highlighted=focused||biggest;
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
    if(btn.hasAttribute('data-atlas-view')&&topic()){
      const next=Number(btn.dataset.atlasView);
      if(Number.isInteger(next)&&next>=0&&next<6){
        state.atlasView=next;setHash();renderMetric();
      }
      return;
    }
    if(btn.hasAttribute('data-atlas-open')){
      const image=$('k23-atlas-image'),dialog=$('k23-atlas-dialog');
      if(image?.src&&dialog?.showModal){
        $('k23-atlas-dialog-img').src=image.src;
        $('k23-atlas-dialog-img').alt=image.alt;
        dialog.showModal();
      }
      return;
    }
    if(btn.hasAttribute('data-atlas-close')){
      $('k23-atlas-dialog')?.close();
      return;
    }
  });
  root.addEventListener('error',e=>{
    if(e.target?.id!=='k23-atlas-image')return;
    const figure=e.target.closest('.atlas-original-figure');
    if(figure)figure.innerHTML='<div class="atlas-image-error" role="alert">'+
      'No se pudo cargar el JPG original. Los datos y la navegación siguen disponibles.</div>';
  },true);
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
    state.metric=val;state.atlasView=0;setHash();renderMetric();
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
  const optionalJSON=path=>fetch(path,{cache:'no-store'}).then(r=>{
    if(!r.ok)throw Error('No disponible: '+path);
    return r.json();
  }).catch(error=>{console.warn(error);return null;});
  const atlasRequest=optionalJSON('data/subachoque-atlas-41.json');
  const taxonomyRequest=optionalJSON('data/atlas-taxonomia-oficial.json');
  const imagesRequest=optionalJSON('data/atlas-original-manifest.json');
  load().then(async loaded=>{
    if(loaded.v!==2||loaded.nEncuestas!==324||loaded.dimensiones?.length!==4||loaded.dimensiones[3]?.id!=='percepcion')
      throw Error('La estructura de la caracterización no pasó las verificaciones.');
    const items=loaded.dimensiones.flatMap(d=>d.areas.flatMap(a=>a.temas));
    const metrics=items.flatMap(t=>t.metrics);
    if(items.length!==48||metrics.length!==49||(loaded.notMeasured?.social?.length+loaded.notMeasured?.economica?.length+loaded.notMeasured?.ambiental?.length)!==53||metrics.some(m=>!Number.isInteger(m.n)||m.n<15||!m.q||!m.title||!m.universe||!m.questionLabel))
      throw Error('Los indicadores agregados no pasaron las verificaciones de integridad.');
    const [atlas,taxonomy,images]=await Promise.all([atlasRequest,taxonomyRequest,imagesRequest]);
    atlasManifest=images?.questions&&Object.keys(images.questions).length===41?images:null;
    if(taxonomy){
      try{
        applyOfficialTaxonomy(loaded,taxonomy);
        if(atlas)integrateAtlas(loaded,atlas,taxonomy);
      }catch(error){
        console.error('Error al integrar el Atlas y la taxonomía:',error);
        // Preserve KoBo even if external mapping fails; do not leave empty UI.
        loaded=(await load());
        atlasManifest=null;
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
