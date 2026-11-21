/* Data Subachoque 2.2 — imported municipal indicator sheets.
 * Replaces the previous 2.2-only navigation without touching 2.3.
 * Source of truth: nine user-supplied Excel workbooks, parsed server-side into
 * data/fichas-2026-consolidadas.json with literal values and cell provenance.
 * Blank series are NOT public metrics; missing topics remain visibly disabled.
 */
(()=>{
 'use strict';
 const root=document.getElementById('data-subachoque');
 if(!root)return;
 const by=id=>root.querySelector('#'+id);
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&#39;'}[c]));
 const norm=x=>String(x??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
 const slug=x=>norm(x).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,58);
 const number=(x,max=2)=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:max}).format(x);
 const nice=s=>String(s||'').trim().replace(/\s+/g,' ');
 const stripCode=s=>nice(s).replace(/^\d+(?:\.\d+){1,3}\s*[.:–\-]*\s*/,'');
 const trace=r=>r.sourceFile+' · Hoja '+r.sourceSheet;
 const dimLabels={social:'Dimensión Social',economica:'Dimensión Económica',ambiental:'Dimensión Ambiental y Territorial',institucional:'Dimensión Institucional'};
 const icons={social:'♧',economica:'▰',ambiental:'♧',institucional:'▤'};
 const state={dim:'institucional',area:null,topic:null,indicator:null,series:0,search:''};
 let catalog=null, dataset=null,lookup=new Map(),catalogIndex=[];
 const dimensions=()=>catalog?.dimensiones||[];
 const dim=()=>dimensions().find(d=>d.id===state.dim)||dimensions()[0];
 const area=()=>dim()?.areas.find(a=>a.id===state.area)||dim()?.areas.find(a=>a.available)||dim()?.areas[0];
 const topic=()=>area()?.topics.find(t=>t.id===state.topic)||area()?.topics.find(t=>t.available)||area()?.topics[0];
 const indicators=t=>(t?.fichas||[]).map(id=>lookup.get(id)).filter(Boolean);
 const active=()=>lookup.get(state.indicator)||indicators(topic()).find(r=>r.available)||null;
 const selectedClass=(isSelected)=>isSelected?' active':'';
 const hasData=r=>r&&r.available&&((r.series||[]).some(s=>s.points?.length)||r.categories?.length);
 const liveCode=raw=>{
  const s=nice(raw);
  return !s||/lo asignamos|pendiente|por confirmar|por definir|no aplica/i.test(s)||/^\d+$/.test(s)?'Sin código asignado':s;
 };
 const validLink=raw=>{
  const m=String(raw||'').match(/https?:\/\/[^\s<>";]+/i);
  if(!m)return '';
  try{const u=new URL(m[0]);return u.protocol==='https:'&&!/uniandes-my[.]sharepoint[.]com/i.test(u.hostname)?u.href:'';}catch{return '';}
 };
 const startsWithCode=(value,prefix)=>String(value||'').startsWith(prefix+'.');
 const inferArea=(r,d)=>{
  const x=norm([r.name,r.areaLabel,r.topicLabel].join(' '));
  const key=d.id;
  if(key==='social'){
   if(/cultur|museo|biblioteca|artist/.test(x))return d.areas.find(a=>a.code==='1.4');
   if(/deport|recreaci|escuela de formaci[oó]n/.test(x))return d.areas.find(a=>a.code==='1.5');
   if(/educaci|estudiante|colegio/.test(x))return d.areas.find(a=>a.code==='1.2');
   if(/mujer|violencia|vulnerab|pobreza/.test(x))return d.areas.find(a=>a.code==='1.3');
   return d.areas.find(a=>a.code==='1.1');
  }
  if(key==='ambiental')return d.areas.find(a=>a.code==='3.2')||d.areas[0];
  if(key==='economica')return d.areas.find(a=>a.code==='2.6')||d.areas[0];
  return d.areas.find(a=>a.code==='4.1')||d.areas[0];
 };
 function normalizeSourceRecord(r){
  // Nothing is interpolated as trusted HTML. No fabricated codes or goals.
  return {...r,available:hasData(r)};
 }
 function merge(source,original){
  const data=structuredClone(original);
  const unique=new Set();
  lookup=new Map();
  for(const raw of source.records){
   if(unique.has(raw.id))throw Error('Identificador duplicado '+raw.id);
   unique.add(raw.id);
   const r=normalizeSourceRecord(raw);lookup.set(r.id,r);
   const d=data.dimensiones.find(v=>v.id===r.dim);
   if(!d)throw Error('Dimensión no reconocida: '+r.dim);
   const rawArea=(r.areaCode||'').match(/^[1-4]\.\d+/)?.[0]||'';
   let a=d.areas.find(x=>x.code===rawArea);
   if(!a&&r.areaLabel)a=d.areas.find(x=>norm(x.title)===norm(stripCode(r.areaLabel)));
   if(!a&&rawArea){
    a={id:'nueva-area-'+slug(rawArea+'-'+r.areaLabel),code:rawArea,
      title:stripCode(r.areaLabel)||'Área incorporada de las fichas',topics:[],new:true};
    d.areas.push(a);
   }
   if(!a)a=inferArea(r,d);
   if(!a)throw Error('No se pudo clasificar: '+r.name);
   let topicCode=r.topicCode||'';
   if(topicCode&&!(topicCode.startsWith(a.code+'.')))topicCode='';
   let t=topicCode?a.topics.find(x=>x.documentCode===topicCode):null;
   if(!t&&r.topicLabel){
    const label=stripCode(r.topicLabel).split(/[;/]/)[0].trim();
    if(label)t=a.topics.find(x=>norm(x.title)===norm(label));
   }
   if(!t&&topicCode){
    const label=stripCode(r.topicLabel).split(/[;/]/)[0].trim();
    t={id:'nuevo-tema-'+slug(a.id+'-'+topicCode),documentCode:topicCode,
      title:label||r.name,new:true};
    a.topics.push(t);
   }
   if(!t){
    const label=stripCode(r.topicLabel).split(/[;/]/)[0].trim();
    const title=label&&label.length>3?label:r.name;
    t=a.topics.find(x=>norm(x.title)===norm(title));
    if(!t){
     t={id:'nuevo-tema-'+slug(a.id+'-'+title),documentCode:'',title,new:true};
     a.topics.push(t);
    }
   }
   if(!t.fichas)t.fichas=[];
   if(!t.fichas.includes(r.id))t.fichas.push(r.id);
   r.nav={dimension:d.id,area:a.id,topic:t.id};
  }
  for(const d of data.dimensiones){
   for(const a of d.areas){
    for(const t of a.topics){
     t.fichas=t.fichas||[];
     t.available=t.fichas.some(id=>lookup.get(id)?.available);
     t.loaded=t.fichas.length;
     t.published=t.fichas.filter(id=>lookup.get(id)?.available).length;
    }
    a.available=a.topics.some(t=>t.available);
    a.published=a.topics.reduce((n,t)=>n+t.published,0);
   }
   d.available=d.areas.some(a=>a.available);
  }
  catalogIndex=data.dimensiones.flatMap(d=>d.areas.flatMap(a=>a.topics.flatMap(t=>indicators(t).map(r=>({d,a,t,r})))));
  return data;
 }
 function availableTopic(a){return a?.topics.find(t=>t.available)||null;}
 function resolve(did,aid,tid,rid){
  const d=dimensions().find(v=>v.id===did)||dimensions().find(v=>v.available)||dimensions()[0];
  const a=d.areas.find(v=>v.id===aid||v.code===aid)||d.areas.find(v=>v.available)||d.areas[0];
  const t=a.topics.find(v=>v.id===tid||v.documentCode===tid)||availableTopic(a)||a.topics[0];
  const rs=indicators(t);
  const starter=t.documentCode==='4.1.1'?rs.find(v=>v.available&&/indice de desempeno institucional \(idi\)/.test(norm(v.name))):null;
  const r=rs.find(v=>v.id===rid&&v.available)||starter||rs.find(v=>v.available)||null;
  state.dim=d.id;state.area=a.id;state.topic=t.id;state.indicator=r?.id||null;state.series=0;
 }
 function readHash(){
  if(!catalog)return;
  const [route,query='']=location.hash.slice(1).split('?');
  if(route!=='data')return;
  const p=new URLSearchParams(query);
  if(p.get('seccion')!=='data-subachoque')return;
  resolve(p.get('dimension')||'institucional',p.get('area'),p.get('tema'),p.get('ficha'));
  render();
 }
 function updateHash(){
  const p=new URLSearchParams(location.hash.split('?')[1]||'');
  for(const key of ['nivel','indicador','grafica','sub','vista'])p.delete(key);
  p.set('seccion','data-subachoque');p.set('dimension',state.dim);
  p.set('area',state.area);p.set('tema',state.topic);
  if(state.indicator)p.set('ficha',state.indicator);
  else p.delete('ficha');
  history.pushState({section:'data-subachoque'},'','#data?'+p.toString());
 }
 function change(did,aid,tid,rid){
  resolve(did,aid,tid,rid);state.search='';updateHash();render();
 }
 function renderDimensions(){
  by('ds4-dimension-breadcrumb').textContent=dim().titulo;
  by('ds4-dims').innerHTML=dimensions().map((d,i)=>
   '<button type="button" class="k23-dim'+selectedClass(d.id===state.dim)+'" data-ds5-dim="'+esc(d.id)+'" aria-pressed="'+(d.id===state.dim)+'"'+(!d.available?' disabled aria-disabled="true"':'')+'>'+
   '<span class="k23-dim-index">0'+(i+1)+'</span><span class="k23-dim-copy"><strong>'+
   esc(d.titulo)+'</strong><small>'+esc(d.subtitulo||'')+'</small></span>'+
   '<span class="k23-dim-arrow" aria-hidden="true">↗</span></button>'
  ).join('');
 }
 function renderFilters(){
  by('ds4-areas').innerHTML=dim().areas.map(a=>
   '<button type="button" class="k23-area'+selectedClass(a.id===state.area)+
   '" data-ds5-area="'+esc(a.id)+'" aria-pressed="'+(a.id===state.area)+'"'+
   (!a.available?' disabled aria-disabled="true" title="Sin indicadores con datos"':'')+
   '>'+esc(a.title)+'</button>').join('');
  by('ds4-topics').innerHTML=area().topics.map(t=>
   '<button type="button" class="k23-topic'+selectedClass(t.id===state.topic)+
   '" data-ds5-topic="'+esc(t.id)+'" aria-pressed="'+(t.id===state.topic)+'"'+
   (!t.available?' disabled aria-disabled="true" title="Categoría sin datos numéricos publicados"':'')+
   '><span>'+esc((t.documentCode?t.documentCode+' ':'')+t.title)+'</span></button>'
  ).join('');
  by('ds4-topic-breadcrumb').textContent=dim().titulo+' › '+area().title+' › '+topic().title;
 }
 function renderSearch(){
  const slot=by('ds5-results');slot.innerHTML='';
  if(!state.search.trim()){slot.hidden=true;return;}
  const q=norm(state.search);const seen=new Set();
  const results=catalogIndex.filter(({d,a,t,r})=>
    r.available&&norm(r.name+' '+r.meta?.code+' '+t.title+' '+a.title+' '+d.titulo).includes(q))
    .filter(({r})=>{if(seen.has(r.id))return false;seen.add(r.id);return true;}).slice(0,35);
  slot.hidden=false;
  slot.innerHTML=results.length?results.map(({d,a,t,r})=>
    '<button type="button" class="ds5-search-result" data-ds5-search="'+esc(r.id)+'">'+
    '<strong>'+esc(r.name)+'</strong><small>'+esc(d.titulo+' · '+a.title+' · '+t.title)+'</small></button>'
  ).join(''):'<p class="ds5-empty-search">No encontramos indicadores con datos para esa búsqueda.</p>';
 }
 function availableSeries(r){
  return (r?.series||[]).filter(s=>s.points&&s.points.length>0);
 }
 function chartSeries(r){
  const ser=availableSeries(r);
  return ser[Math.max(0,Math.min(state.series,ser.length-1))]||null;
 }
 function normalizedPoints(r,s){
  if(!s)return [];
  const raw=s.points.filter(p=>Number.isFinite(+p[0])&&Number.isFinite(+p[1])).map(p=>({year:+p[0],raw:+p[1]}))
    .sort((a,b)=>a.year-b.year);
  const unit=norm(r?.meta?.unit);
  const million=unit.includes('millon')&&raw.some(p=>Math.abs(p.raw)>=1e8);
  const percent=(unit.includes('porcentaje')||unit.includes('%'))&&raw.length>0&&raw.every(p=>Math.abs(p.raw)<=1.02);
  return raw.map(p=>({...p,value:p.raw*(million?1e-6:percent?100:1)}));
 }
 function unitInfo(r,s){
  const raw=(s?.points||[]).map(p=>+p[1]).filter(Number.isFinite);
  const meta=norm(r?.meta?.unit);
  const million=meta.includes('millon')&&raw.some(n=>Math.abs(n)>=1e8);
  const percent=(meta.includes('porcentaje')||meta.includes('%'))&&raw.length&&raw.every(n=>Math.abs(n)<=1.02);
  return {million,percent,unit:million?'millones de pesos':percent?'%':r?.meta?.unit||'valor reportado',
    note:million?'Valores de origen expresados en pesos colombianos; visualización convertida a millones (÷ 1.000.000).':
     percent?'Fracciones originales transformadas a porcentajes (× 100) para visualización.':''};
 }
 const valueText=(n,info)=>{
  if(n===null||n===undefined||!Number.isFinite(n))return 'Sin dato';
  const decimals=info?.unit==='%'?2:Math.abs(n)<10?2:1;
  const a=number(n,decimals);
  return a+(info?.unit==='%'?' %':info?.million?' millones':info?.unit&&norm(info.unit)!=='numero'&&norm(info.unit)!=='número'?' '+info.unit:'');
 };
 function mainMeasure(r){
  const ser=availableSeries(r);
  return ser.slice().sort((a,b)=>b.points.length-a.points.length)[0]||null;
 }
 function pointsFor(r){return normalizedPoints(r,chartSeries(r)||mainMeasure(r));}
 function metrics(r){
  const p=pointsFor(r),info=unitInfo(r,chartSeries(r)||mainMeasure(r));
  const latest=p.at(-1)||null,previous=p.at(-2)||null;
  const delta=latest&&previous?latest.value-previous.value:null;
  const percentDelta=delta!==null&&previous.value!==0?delta/Math.abs(previous.value)*100:null;
  const max=p.length?p.reduce((a,b)=>b.value>a.value?b:a):null;
  const missingYears=p.length>1?Math.max(0,p.at(-1).year-p[0].year+1-p.length):0;
  return {p,info,latest,previous,delta,percentDelta,max,missingYears};
 }
 function kpis(r){
  const m=metrics(r);
  const year=m.latest?.year;
  const period=m.p.length>1?m.p[0].year+'–'+m.p.at(-1).year:(year||'—');
  const name=norm(r.name);
  const metricType=/recaud|ingreso|tribut|presupuesto|inversion|regali|cartera|pesos/.test(name)?'Recaudo / valor reportado':
    /cobertura|porcentaje|afiliaci[oó]n|proporci[oó]n/.test(name)?'Cobertura / porcentaje':'Resultado del indicador';
  const up=m.p.length>1&&m.p.every((v,i)=>i===0||v.value>=m.p[i-1].value);
  const down=m.p.length>1&&m.p.every((v,i)=>i===0||v.value<=m.p[i-1].value);
  const tendency=m.p.length<2?'No comparable':up?'Ascendente':down?'Descendente':'Variable';
  const ds=[
   {icon:'▣',label:metricType,value:m.latest?valueText(m.latest.value,m.info):'Sin dato',note:year?'Último corte: '+year:'—'},
   {icon:'↗',label:m.previous?'Variación '+m.previous.year+'–'+year:'Variación entre periodos',value:m.delta===null?'Sin comparación':(m.delta>0?'+':'')+number(m.delta,2),note:m.percentDelta===null?'Sin comparación porcentual':(m.percentDelta>=0?'+':'')+number(m.percentDelta,1)+' % · cambio relativo'},
   {icon:'◎',label:'Valor máximo registrado',value:m.max?valueText(m.max.value,m.info):'Sin dato',note:m.max?'Vigencia '+m.max.year:'—'},
   {icon:'▥',label:'Comportamiento de la serie',value:tendency,note:m.p.length+' '+(m.p.length===1?'periodo':'periodos')+' · '+period+(m.missingYears?' · '+m.missingYears+' faltantes':'')},
   {icon:'▦',label:'Última actualización',value:nice(r.meta?.updated)||'No indicada',note:trace(r)}
  ];
  return ds.map(k=>'<div class="ds5-kpi"><span class="ds5-kpi-icon" aria-hidden="true">'+k.icon+
    '</span><div><p>'+esc(k.label)+'</p><strong>'+esc(k.value)+'</strong><small>'+esc(k.note)+'</small></div></div>').join('');
 }
 // Chart: SVG with independent plot/legend zones; no overlapping labels.
 function lineChart(r){
  const series=chartSeries(r)||mainMeasure(r),p=normalizedPoints(r,series),inf=unitInfo(r,series);
  if(!p.length)return '<p class="ds5-missing">No hay puntos publicables para la serie.</p>';
  const W=1040,H=412,left=85,right=35,top=37,bottom=83;
  const minX=Math.min(...p.map(q=>q.year)),maxX=Math.max(...p.map(q=>q.year));
  const low=Math.min(...p.map(q=>q.value)),high=Math.max(...p.map(q=>q.value));
  const range=high-low||Math.abs(high)||1;
  const ymin=low>=0?Math.max(0,low-range*.20):low-range*.20;
  const ymax=high+range*.18;
  const sx=x=>minX===maxX?W/2:left+(x-minX)/(maxX-minX)*(W-left-right);
  const sy=y=>H-bottom-(y-ymin)/(ymax-ymin)*(H-top-bottom);
  const ticks=Array.from({length:5},(_,i)=>ymin+(ymax-ymin)*i/4);
  const grid=ticks.map(v=>'<g><line x1="'+left+'" y1="'+sy(v).toFixed(1)+'" x2="'+(W-right)+'" y2="'+sy(v).toFixed(1)+
    '" stroke="#315d6c" stroke-width="1"/><text x="'+(left-16)+'" y="'+(sy(v)+4).toFixed(1)+'" text-anchor="end" fill="#b3d2dd" font-size="13">'+esc(number(v,1))+'</text></g>').join('');
  const bars=p.length===1||p.length>14;
  const gap=Math.min(48,(W-left-right)/Math.max(1,p.length*1.7));
  const columns=p.map(q=>'<rect x="'+(sx(q.year)-gap/2).toFixed(1)+'" y="'+sy(q.value).toFixed(1)+'" width="'+gap.toFixed(1)+
    '" height="'+Math.max(1,sy(ymin)-sy(q.value)).toFixed(1)+'" rx="3" fill="#37bfcc" opacity=".9" />').join('');
  const path=p.map((q,i)=>(i?'L':'M')+sx(q.year).toFixed(1)+' '+sy(q.value).toFixed(1)).join(' ');
  const line=p.length>1?'<path d="'+path+'" fill="none" stroke="#36ccdb" stroke-width="3" stroke-linejoin="round"/>'+p.map(q=>
    '<circle cx="'+sx(q.year).toFixed(1)+'" cy="'+sy(q.value).toFixed(1)+'" r="5" fill="#ffcf2f" stroke="#0a3144" stroke-width="2"/>').join(''):columns;
  const years=p.map(q=>'<text x="'+sx(q.year).toFixed(1)+'" y="'+(H-bottom+29)+'" text-anchor="middle" font-size="14" fill="#cee4ec">'+q.year+'</text>').join('');
  const labels=p.length<=9?p.map(q=>'<text x="'+sx(q.year).toFixed(1)+'" y="'+Math.max(14,sy(q.value)-13).toFixed(1)+'" text-anchor="middle" font-size="13" font-weight="750" fill="#ffffff">'+esc(number(q.value,2))+'</text>').join(''):'';
  return '<svg class="ds5-chart-svg" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Serie '+esc(series?.name||r.name)+
   ' entre '+minX+' y '+maxX+'"><g>'+grid+'</g><g>'+line+labels+years+'</g>'+
   '<text x="'+(W/2)+'" y="'+(H-14)+'" text-anchor="middle" font-size="14" fill="#b9d8e3">'+esc(series?.name||r.name)+' · '+esc(inf.unit)+'</text></svg>';
 }
 function categoricalChart(r){
  const rows=(r.categories||[]).flatMap(c=>c.values.map(v=>({name:c.name+(c.values.length>1?' · '+v[0]:''),value:Number(v[1])})))
    .filter(v=>Number.isFinite(v.value)).sort((a,b)=>Math.abs(b.value)-Math.abs(a.value)).slice(0,14);
  if(!rows.length)return '<p class="ds5-missing">No hay desagregaciones publicables.</p>';
  const max=Math.max(1,...rows.map(v=>Math.abs(v.value)));
  return '<div class="ds5-bar-list">'+rows.map(row=>
    '<div class="ds5-bar-row"><span class="ds5-bar-label">'+esc(row.name)+'</span>'+
    '<span class="ds5-bar-track"><span class="ds5-bar-fill" style="width:'+Math.max(.5,Math.abs(row.value)/max*100).toFixed(2)+'%"></span></span>'+
    '<strong>'+esc(number(row.value,2))+'</strong></div>').join('')+'</div>';
 }
 function chart(r){
  const all=availableSeries(r),m=metrics(r);
  const graph=all.length?lineChart(r):categoricalChart(r);
  const seriesSelect=all.length>1?'<label class="ds5-series-selector">Serie de la ficha <select id="ds5-series-select" aria-label="Elegir serie para la gráfica">'+
   all.map((s,i)=>'<option value="'+i+'"'+(i===state.series?' selected':'')+'>'+esc(s.name)+'</option>').join('')+
   '</select></label>':'';
  return '<section class="ds5-chart-card" aria-labelledby="ds5-chart-title">'+
   '<div class="ds5-chart-head"><h3 id="ds5-chart-title">Evolución del indicador</h3>'+seriesSelect+'</div>'+
   '<div class="ds5-chart-frame">'+graph+'</div>'+
   '<p class="ds5-chart-foot">'+esc(m.info.note||'Gráfica construida exclusivamente con los valores de las series incluidas en la ficha original.')+
   '</p></section>';
 }
 function metadata(r){
  const m=r.meta||{},entries=[
   ['Nombre del indicador',r.name],['Código',liveCode(m.code)],
   ['Definición',m.definition],['Unidad de medida',m.unit],
   ['Fórmula',m.formula],['Periodicidad',m.periodicity],
   ['Fuente de información',[m.source,m.sourceEntity].filter(Boolean).join(' · ')],
   ['Responsable del dato',m.responsible],['Metodología',m.methodology],
   ['Año de actualización',m.updated],['Enlace de soporte',m.support],
   ['Observaciones',m.observations]
  ];
  const rows=entries.map(([label,value])=>'<div class="ds5-meta-row"><dt>'+esc(label)+'</dt>'+
   '<dd>'+ (value?
     label==='Enlace de soporte'?(validLink(value)?'<a target="_blank" rel="noopener noreferrer" href="'+esc(validLink(value))+'">Abrir enlace registrado ↗</a>':'Soporte mencionado en el Excel; acceso por verificar') :esc(nice(value)) :
     '<span class="ds5-not-supplied">No consignado en la ficha</span>')+'</dd></div>').join('');
  return '<section class="ds5-meta-card"><h3>Ficha del indicador</h3><dl>'+rows+'</dl>'+
    '<p class="ds5-meta-source">Procedencia: '+esc(trace(r))+'</p></section>';
 }
 function analytical(r){
  const m=metrics(r);
  const p=m.p;const name=r.name;
  if(p.length<2)return 'La ficha registra '+(p.length===1?'un periodo con valor numérico':'valores desagregados sin una serie temporal comparable')+
   '. No se calcula una tendencia anual ni una variación sin una segunda observación verificable.';
  const first=p[0],last=p.at(-1),absolute=last.value-first.value,relative=first.value!==0?absolute/Math.abs(first.value)*100:null;
  return 'La serie de '+name+' presenta '+p.length+' observaciones entre '+first.year+' y '+last.year+
   '. El valor pasó de '+valueText(first.value,m.info)+' a '+valueText(last.value,m.info)+
   ', una diferencia de '+(absolute>=0?'+':'')+number(absolute,2)+
   (relative===null?'':', equivalente a '+(relative>=0?'+':'')+number(relative,1)+' % frente al primer periodo')+
   '. Este resultado describe los registros de la ficha, sin atribuir causas ni implicar por sí mismo una mejora en el bienestar.';
 }
 function findings(r){
  const m=metrics(r),p=m.p,items=[];
  if(p.length){
   items.push('Último valor con dato: '+valueText(p.at(-1).value,m.info)+' ('+p.at(-1).year+').');
   const min=p.reduce((a,b)=>b.value<a.value?b:a);
   const max=m.max;
   if(p.length>1)items.push('Intervalo observado: de '+valueText(min.value,m.info)+' ('+min.year+') a '+valueText(max.value,m.info)+' ('+max.year+').');
   if(m.missingYears)items.push('Hay '+m.missingYears+' vigencia(s) sin valores dentro del intervalo consultado.');
   else if(p.length>1)items.push('Los '+p.length+' periodos entre '+p[0].year+' y '+p.at(-1).year+' tienen valores registrados.');
  }else if(r.categories?.length){
   items.push('La ficha presenta desagregaciones numéricas sin secuencia anual homogénea.');
   items.push('Se mantiene la estructura y las categorías consignadas en el libro de origen.');
  }
  if(!items.length)items.push('El archivo original no aporta una serie publicable.');
  if(items.length<3)items.push('La información corresponde a la ficha remitida por '+r.sourceFile+'.');
  return '<section class="ds5-findings"><h3><span aria-hidden="true">▥</span> Principales hallazgos</h3>'+
    '<ul>'+items.slice(0,4).map(x=>'<li><span aria-hidden="true">✓</span>'+esc(x)+'</li>').join('')+'</ul></section>';
 }
 function related(r){
  const siblings=area().topics.flatMap(t=>indicators(t)).filter(x=>x.available&&x.id!==r.id)
    .sort((a,b)=>Number(b.nav?.topic===state.topic)-Number(a.nav?.topic===state.topic));
  return '<section class="ds5-related"><div class="ds5-related-heading"><h3>Otros indicadores del componente</h3>'+
   '<small>'+siblings.length+' indicadores del área disponibles</small></div>'+
   (siblings.length?'<div class="ds5-related-grid">'+siblings.map(other=>{
    const rawSeries=availableSeries(other)[0];
    const info=unitInfo(other,rawSeries),pts=normalizedPoints(other,rawSeries);
    const top=pts.at(-1);
    const categorical=(other.categories||[])[0]?.values?.[0];
    const value=top?valueText(top.value,info):categorical?number(Number(categorical[1]),2):'Ver detalle';
    return '<button type="button" class="ds5-related-card" data-ds5-indicator="'+esc(other.id)+'"><span class="ds5-related-icon" aria-hidden="true">▤</span>'+
     '<span class="ds5-related-name">'+esc(other.name)+'</span><strong>'+esc(value)+'</strong>'+
     '<small>'+esc((top?'Vigencia '+top.year+' · ':'')+
       (area().topics.find(t=>t.id===other.nav?.topic)?.title||liveCode(other.meta?.code)))+'</small></button>';
   }).join('')+'</div>':'<p class="ds5-no-related">No hay otros indicadores con datos en esta categoría.</p>')+
   '</section>';
 }
 function chooseIndicator(r){
  const code=liveCode(r.meta?.code),t=topic();
  by('ds5-title').textContent=r.name;
  by('ds5-code').textContent=code==='Sin código asignado'?(t.documentCode||'Ficha'):(code);
  by('ds5-subtitle').textContent=nice(r.meta?.definition)||'Indicador municipal con datos reportados en el libro de origen.';
  by('ds5-source-tag').textContent=trace(r);
  by('ds5-kpis').innerHTML=kpis(r);
  by('ds5-dual').innerHTML=chart(r)+metadata(r);
  by('ds5-interpretation').textContent=analytical(r);
  by('ds5-findings-root').innerHTML=findings(r);
  by('ds5-related-root').innerHTML=related(r);
  by('ds5-ficha-card').hidden=false;
  by('ds5-unavailable').hidden=true;
 }
 function render(){
  if(!catalog)return;
  renderDimensions();renderFilters();renderSearch();
  const r=active();
  if(r&&r.available)chooseIndicator(r);
  else{
   by('ds5-ficha-card').hidden=true;by('ds5-unavailable').hidden=false;
   by('ds5-unavailable').textContent='Todavía no hay un indicador con datos publicables en esta categoría.';
  }
  root.dataset.ready='true';
 }
 function printPdf(){
  const r=active();if(!r)return;
  try{
   if(!window.TIDataPdf?.download)throw Error('El generador PDF no ha cargado');
   window.TIDataPdf.download(
     r,chartSeries(r)||mainMeasure(r),
     by('ds5-interpretation').textContent,
     [...root.querySelectorAll('#ds5-findings-root li')].map(li=>li.textContent.trim())
   );
  }catch(error){
   console.error('Ficha PDF:',error);
   // The browser's native print-to-PDF remains a universal fallback.
   document.title='Data Subachoque - '+r.name;
   window.print();
  }
 }
 function bind(){
  root.addEventListener('click',e=>{
   const b=e.target.closest('button');if(!b||b.disabled||!root.contains(b))return;
   if(b.dataset.ds5Dim)change(b.dataset.ds5Dim,null,null,null);
   else if(b.dataset.ds5Area)change(state.dim,b.dataset.ds5Area,null,null);
   else if(b.dataset.ds5Topic)change(state.dim,state.area,b.dataset.ds5Topic,null);
   else if(b.dataset.ds5Indicator){const r=lookup.get(b.dataset.ds5Indicator);if(r?.nav)change(r.nav.dimension,r.nav.area,r.nav.topic,r.id);}
   else if(b.dataset.ds5Search){
    const r=lookup.get(b.dataset.ds5Search);if(r?.nav)change(r.nav.dimension,r.nav.area,r.nav.topic,r.id);
    by('ds5-search').value='';
   }
   else if(b.id==='ds5-download')printPdf();
  });
  root.addEventListener('change',e=>{
   if(e.target.id==='ds5-series-select'){
    state.series=Number(e.target.value)||0;
    const r=active();if(r){
     by('ds5-kpis').innerHTML=kpis(r);
     root.querySelector('.ds5-chart-card')?.replaceWith(document.createRange().createContextualFragment(chart(r)));
     by('ds5-interpretation').textContent=analytical(r);
     by('ds5-findings-root').innerHTML=findings(r);
    }
   }
  });
  by('ds5-search').addEventListener('input',e=>{state.search=e.target.value;renderSearch();});
  window.addEventListener('popstate',readHash);
  window.addEventListener('hashchange',readHash);
  window.addEventListener('afterprint',()=>{document.title='Territorio Inteligente';});
 }
 bind();
 Promise.all([
  fetch('data/data-subachoque-dimensiones.json').then(r=>{if(!r.ok)throw Error('Catálogo 2.2 inaccesible');return r.json();}),
  fetch('data/fichas-2026-consolidadas.json').then(r=>{if(!r.ok)throw Error('Fichas Excel inaccesibles');return r.json();})
 ]).then(([tax,sources])=>{
  if(sources.records?.length!==341||tax.dimensiones?.length!==4)throw Error('Fuentes inesperadas; no se publicarán datos incompletos.');
  dataset=sources;
  catalog=merge(sources,tax);
  const extraAreas=catalog.dimensiones.flatMap(d=>d.areas).filter(a=>a.new).length;
  const extraTopics=catalog.dimensiones.flatMap(d=>d.areas.flatMap(a=>a.topics)).filter(t=>t.new).length;
  root.dataset.fichasTotal=String(sources.records.length);
  root.dataset.fichasConDatos=String(sources.records.filter(r=>r.available).length);
  root.dataset.extraAreas=String(extraAreas);
  root.dataset.extraTopics=String(extraTopics);
  readHash();
  if(root.dataset.ready!=='true'){
   const d=catalog.dimensiones.find(d=>d.id==='institucional');
   const a=d.areas.find(a=>a.code==='4.1');
   const t=a?.topics.find(t=>t.documentCode==='4.1.1');
   resolve('institucional',a?.id,t?.id);
   render();
  }
 }).catch(error=>{
  console.error('Data Subachoque / Excel:',error);
  by('ds4-dims').innerHTML='<p role="alert">No fue posible cargar las fichas de indicadores. Actualiza la página.</p>';
  root.dataset.ready='error';
 });
})();
