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
 const state={dim:'institucional',area:null,topic:null,indicator:null,series:0,chartMode:'temporal',search:'',relatedGroup:'all',relatedExpanded:false,relatedSearch:''};
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
  const d=dimensions().find(v=>v.id===did&&v.available)||dimensions().find(v=>v.available)||dimensions()[0];
  const a=d.areas.find(v=>v.available&&(v.id===aid||v.code===aid))||d.areas.find(v=>v.available)||d.areas[0];
  const t=a.topics.find(v=>v.available&&(v.id===tid||v.documentCode===tid))||availableTopic(a)||a.topics[0];
  const rs=indicators(t);
  const starter=t.documentCode==='4.1.1'?rs.find(v=>v.available&&/indice de desempeno institucional \(idi\)/.test(norm(v.name))):null;
  const r=rs.find(v=>v.id===rid&&v.available)||starter||rs.find(v=>v.available)||null;
  state.dim=d.id;state.area=a.id;state.topic=t.id;state.indicator=r?.id||null;state.series=0;state.chartMode='temporal';
  state.relatedGroup='all';state.relatedExpanded=false;state.relatedSearch='';
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
  by('ds4-dims').innerHTML=dimensions().filter(d=>d.available).map(d=>
   '<button type="button" class="k23-dim'+selectedClass(d.id===state.dim)+'" data-ds5-dim="'+esc(d.id)+'" aria-pressed="'+(d.id===state.dim)+'">'+
   '<span class="k23-dim-index">0'+(dimensions().indexOf(d)+1)+'</span><span class="k23-dim-copy"><strong>'+
   esc(d.titulo)+'</strong><small>'+esc(d.subtitulo||'')+'</small></span>'+
   '<span class="k23-dim-arrow" aria-hidden="true">↗</span></button>'
  ).join('');
 }
 function renderFilters(){
  by('ds4-areas').innerHTML=dim().areas.filter(a=>a.available).map(a=>
   '<button type="button" class="k23-area'+selectedClass(a.id===state.area)+
   '" data-ds5-area="'+esc(a.id)+'" aria-pressed="'+(a.id===state.area)+'">'+
   esc(a.title)+'</button>').join('');
  by('ds4-topics').innerHTML=area().topics.filter(t=>t.available).map(t=>
   '<button type="button" class="k23-topic'+selectedClass(t.id===state.topic)+
   '" data-ds5-topic="'+esc(t.id)+'" aria-pressed="'+(t.id===state.topic)+'">'+
   '<span>'+esc((t.documentCode?t.documentCode+' ':'')+t.title)+'</span></button>'
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
 // Layout uses the LIVE size of its parent card. W/H are SVG viewBox units
 // matching the onscreen CSS pixels; no artificial empty area or stretched text.
 function lineChart(r,width=850,height=525){
  const series=chartSeries(r)||mainMeasure(r),p=normalizedPoints(r,series),inf=unitInfo(r,series);
  if(!p.length)return '<p class="ds5-missing">No hay puntos publicables para la serie.</p>';
  const W=Math.max(300,Math.round(width)),H=Math.max(300,Math.round(height));
  const narrow=W<530,small=W<720;
  const ft=narrow?12:small?14:16;
  const yearFont=narrow?13:small?15:18;
  const valueFont=narrow?17:small?19:22;
  const isPercent=inf.unit==='%'||/porcentaje/.test(norm(inf.unit));
  const axisText=v=>{
   const full=number(v,1)+(isPercent?' %':'');
   return full.length>(narrow?9:14)?
    new Intl.NumberFormat('es-CO',{notation:'compact',maximumFractionDigits:1}).format(v)+(isPercent?' %':''):full;
  };
  const minX=Math.min(...p.map(q=>q.year)),maxX=Math.max(...p.map(q=>q.year));
  const low=Math.min(...p.map(q=>q.value)),high=Math.max(...p.map(q=>q.value));
  const range=high-low||Math.max(Math.abs(high),1);
  const ymin=low>=0?Math.max(0,low-range*.19):low-range*.19;
  const ymax=high+range*.20;
  const ticks=Array.from({length:5},(_,i)=>ymin+(ymax-ymin)*i/4);
  const yStrings=ticks.map(axisText);
  const estimated=Math.max(...yStrings.map(x=>x.length))*ft*.59;
  const left=Math.min(W*.35,Math.max(narrow?64:86,estimated+20));
  const right=narrow?19:29,top=narrow?46:58,bottom=narrow?55:67;
  const usableW=W-left-right,usableH=H-top-bottom;
  const sx=x=>minX===maxX?left+usableW/2:left+(x-minX)/(maxX-minX)*usableW;
  const sy=y=>H-bottom-(y-ymin)/(ymax-ymin)*usableH;
  const grid=ticks.map((v,i)=>'<g>'+
    '<line x1="'+left.toFixed(1)+'" y1="'+sy(v).toFixed(1)+'" x2="'+(W-right)+'" y2="'+sy(v).toFixed(1)+
      '" stroke="#477b8d" stroke-width="1" opacity=".65"/>'+
    '<text class="ds5-graph-tick" x="'+(left-13).toFixed(1)+'" y="'+(sy(v)+ft*.36).toFixed(1)+
      '" text-anchor="end" fill="#d1e9f1" font-size="'+ft+'" font-weight="650">'+esc(yStrings[i])+'</text></g>').join('');
  const barWidth=Math.max(18,Math.min(88,usableW/(Math.max(2,p.length)*1.65)));
  const bars=p.map(q=>'<rect x="'+(sx(q.year)-barWidth/2).toFixed(1)+'" y="'+Math.min(sy(q.value),sy(ymin)).toFixed(1)+
    '" width="'+barWidth.toFixed(1)+'" height="'+Math.max(2,Math.abs(sy(ymin)-sy(q.value))).toFixed(1)+
    '" rx="5" fill="#38c7d7" opacity=".9"><title>'+esc(q.year+': '+valueText(q.value,inf))+'</title></rect>').join('');
  const path=p.map((q,i)=>(i?'L':'M')+sx(q.year).toFixed(1)+' '+sy(q.value).toFixed(1)).join(' ');
  const dataMarks=p.length>1?
   '<path d="'+path+'" fill="none" stroke="#36d8e8" stroke-width="'+(narrow?3:3.8)+'" stroke-linecap="round" stroke-linejoin="round"/>'+
   p.map(q=>'<circle cx="'+sx(q.year).toFixed(1)+'" cy="'+sy(q.value).toFixed(1)+'" r="'+(narrow?5:7)+
    '" fill="#ffce31" stroke="#063648" stroke-width="2"><title>'+esc(q.year+': '+valueText(q.value,inf))+'</title></circle>').join(''):bars;
  // Render every point and year in accessible text, but only paint labels when
  // there is room for their actual text. Prioritize the first and last year.
  const gap=usableW/Math.max(1,p.length-1);
  const maxYearLabels=Math.max(2,Math.floor(usableW/(narrow?55:68)));
  const step=p.length<=maxYearLabels?1:Math.ceil((p.length-1)/(maxYearLabels-1));
  const years=p.filter((q,i)=>i===0||i===p.length-1||i%step===0).map(q=>
   '<text class="ds5-graph-year" x="'+sx(q.year).toFixed(1)+'" y="'+(H-bottom+yearFont+17).toFixed(1)+
   '" text-anchor="middle" font-size="'+yearFont+'" font-weight="750" fill="#eefaff">'+q.year+'</text>').join('');
  const boxes=[];const labels=[];
  // Label the observed values visibly, not with the tiny original 13px.
  const items=p.map((q,i)=>({q,i,priority:i===p.length-1?3:i===0?2:1})).sort((a,b)=>b.priority-a.priority||a.i-b.i);
  for(const {q,i} of items){
   const fullValue=number(q.value,2)+(isPercent?' %':'');
   // On narrow charts, abbreviate only the painted text, never the value:
   // every original number stays in the point tooltip and SVG aria-label.
   const maxLabelWidth=Math.max(76,Math.min(usableW*.40,165));
   const text=fullValue.length*valueFont*.59+10>maxLabelWidth?
     new Intl.NumberFormat('es-CO',{notation:'compact',maximumFractionDigits:2}).format(q.value)+(isPercent?' %':''):
     fullValue;
   const estimatedWidth=text.length*valueFont*.59+10;
   const px=sx(q.year),py=sy(q.value);
   const cx=Math.max(left+estimatedWidth/2+5,Math.min(W-right-estimatedWidth/2-5,px));
   const opts=[
    {x:cx,y:py-(narrow?15:20)},
    {x:cx,y:py+valueFont+18},
    {x:Math.max(left+estimatedWidth/2+5,cx-estimatedWidth*.28),y:py-17},
    {x:Math.min(W-right-estimatedWidth/2-5,cx+estimatedWidth*.28),y:py-17}
   ];
   let chosen=null,rect;
   for(const opt of opts){
    const x1=opt.x-estimatedWidth/2,x2=opt.x+estimatedWidth/2;
    const y1=opt.y-valueFont,y2=opt.y+5;
    if(y1<top-7||y2>H-bottom-7||x1<left||x2>W-right)continue;
    if(boxes.some(b=>x1<b.x2+6&&x2>b.x1-6&&y1<b.y2+3&&y2>b.y1-3))continue;
    chosen=opt;rect={x1,x2,y1,y2};break;
   }
   if(chosen){
    boxes.push(rect);
    labels.push({i,html:'<text class="ds5-graph-value" data-point-index="'+i+'" x="'+chosen.x.toFixed(1)+
      '" y="'+chosen.y.toFixed(1)+'" text-anchor="middle" font-size="'+valueFont+
      '" font-weight="850" fill="#fff">'+esc(text)+'</text>'});
   }
  }
  labels.sort((a,b)=>a.i-b.i);
  const pointDescription=p.map(q=>q.year+': '+valueText(q.value,inf)).join('; ');
  return '<svg class="ds5-chart-svg" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="xMidYMid meet" role="img"'+
   ' aria-label="'+esc('Evolución de '+(series?.name||r.name)+'. '+pointDescription)+'">'+
   '<g class="ds5-graph-grid">'+grid+'</g><g class="ds5-graph-data">'+dataMarks+
    years+labels.map(x=>x.html).join('')+'</g></svg>';
 }
 function categoricalChart(r){
  const rows=(r.categories||[]).flatMap(c=>c.values.map(v=>({name:c.name+(c.values.length>1?' · '+v[0]:''),value:Number(v[1])})))
    .filter(v=>Number.isFinite(v.value)).sort((a,b)=>Math.abs(b.value)-Math.abs(a.value));
  if(!rows.length)return '<p class="ds5-missing">No hay desagregaciones publicables.</p>';
  const max=Math.max(1,...rows.map(v=>Math.abs(v.value)));
  return '<div class="ds5-bar-list">'+rows.map(row=>
    '<div class="ds5-bar-row"><span class="ds5-bar-label">'+esc(row.name)+'</span>'+
    '<span class="ds5-bar-track"><span class="ds5-bar-fill" style="width:'+Math.max(.5,Math.abs(row.value)/max*100).toFixed(2)+'%"></span></span>'+
    '<strong>'+esc(number(row.value,2))+'</strong></div>').join('')+'</div>';
 }
 function chart(r){
  const all=availableSeries(r),m=metrics(r);
  const hasCats=(r.categories||[]).some(c=>c.values&&c.values.length);
  const useCategories=hasCats&&(state.chartMode==='categorias'||all.length===0);
  const graph=useCategories?categoricalChart(r):lineChart(r);
  const switches=hasCats&&all.length?
   '<div class="ds5-modes" role="group" aria-label="Explorar todas las representaciones de la ficha">'+
    '<button type="button" data-ds5-chartmode="temporal" aria-pressed="'+(!useCategories)+'" class="'+(!useCategories?'active':'')+'">Serie temporal</button>'+
    '<button type="button" data-ds5-chartmode="categorias" aria-pressed="'+useCategories+'" class="'+(useCategories?'active':'')+'">Desagregaciones</button></div>':'';
  const seriesSelect=!useCategories&&all.length>1?'<label class="ds5-series-selector">Serie de la ficha <select id="ds5-series-select" aria-label="Elegir serie para la gráfica">'+
   all.map((s,i)=>'<option value="'+i+'"'+(i===state.series?' selected':'')+'>'+esc(s.name)+'</option>').join('')+
   '</select></label>':'';
  return '<section class="ds5-chart-card" aria-labelledby="ds5-chart-title">'+
   '<div class="ds5-chart-head"><h3 id="ds5-chart-title">'+(useCategories?'Desagregaciones del indicador':'Evolución del indicador')+'</h3>'+seriesSelect+'</div>'+
   switches+
   '<div class="ds5-chart-frame">'+graph+'</div>'+
   (!useCategories&&all.length?'<div class="ds5-chart-axis-name">'+
     esc((chartSeries(r)||mainMeasure(r)).name)+' · '+esc(unitInfo(r,chartSeries(r)||mainMeasure(r)).unit)+'</div>':'')+
   '<p class="ds5-chart-foot">'+esc(m.info.note||'Visualización exclusiva de los valores y desagregaciones de la ficha Excel original.')+
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
 // Organizador editorial — las cantidades y las fichas siempre se obtienen del
 // catálogo realmente publicado. Nunca se suman puntuaciones con pesos o tasas.
 const relatedSymbols={
  all:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  gestion:'<path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1"/><circle cx="12" cy="12" r="4.3"/>',
  planeacion:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4m8-4v4M3 10h18m-13 5 2 2 5-5"/>',
  control:'<path d="M12 2 20 6v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4Z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  transparencia:'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5M8.5 11h5m-2.5-2.5v5"/>',
  ingresos:'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M3 11h18M8 15h3M6 3h12"/>',
  tributos:'<path d="M4 5h16v14H4zM8 9h8m-8 4h8m-8 4h5"/>',
  presupuesto:'<path d="M3 19V5h18v14M7 15l3-4 4 2 4-5"/><path d="M7 19h10"/>',
  deuda:'<path d="M4 8h16M5 12h14M7 16h10M12 3v4m0 10v4"/>',
  otros:'<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
  medalla:'<circle cx="12" cy="9" r="6"/><path d="m8 14-2 8 6-3 6 3-2-8M12 6l.9 1.9 2.1.3-1.5 1.5.4 2.1-1.9-1-1.9 1 .4-2.1L9 8.2l2.1-.3z"/>',
  compras:'<circle cx="9" cy="20" r="1"/><circle cx="19" cy="20" r="1"/><path d="M2 3h3l3 13h12l2-10H6"/>'
 };
 function relatedIcon(type){
  return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+(relatedSymbols[type]||relatedSymbols.otros)+'</svg>';
 }
 function groupForRelated(r,context){
  const t=context.topics.find(x=>x.id===r.nav?.topic);
  const n=norm(r.name);
  // 4.1: categorías editoriales para las políticas de gestión, no escalas
  // comparables entre sí. El identificador POL se usa cuando existe.
  if(context.code==='4.1'&&context.dimension==='institucional'){
   const pol=(n.match(/\bpol\s*0?(\d{1,2})\b/)||[])[1];
   const id=pol?Number(pol):null;
   if(/indice de desempeno institucional/.test(n)||[1,5,6,7,11,16,18].includes(id))return 'gestion';
   if([3,4,14,17].includes(id))return 'planeacion';
   if([2,8,9,19].includes(id))return 'control';
   if([12,13,15].includes(id))return 'transparencia';
   return 'otros';
  }
  // Hacienda: clasificación coherente con la naturaleza financiera de la ficha.
  if(context.code==='2.6'&&context.dimension==='economica'){
   if(/deuda|cartera|tesoreria/.test(n))return 'deuda';
   if(/presupuest|inversion|gasto publico/.test(n))return 'presupuesto';
   if(/predial|industria y comercio|sobretasa|recaudo tributario|avisos y tableros/.test(n))return 'tributos';
   if(/ingresos|recaudo no tributario|regalias|transferencia/.test(n))return 'ingresos';
   return 'otros';
  }
  return t?.id||'otros';
 }
 const relatedBuiltins={
  gestion:'Gestión',planeacion:'Planeación',control:'Control',
  transparencia:'Transparencia',ingresos:'Ingresos',tributos:'Tributos',
  presupuesto:'Presupuesto e inversión',deuda:'Deuda y cartera',otros:'Otros'
 };
 function relatedContext(){
  const a=area();
  const rows=a.topics.flatMap(t=>indicators(t)).filter(x=>x.available);
  const seen=new Set();
  const unique=rows.filter(r=>{if(seen.has(r.id))return false;seen.add(r.id);return true;});
  const context={dimension:state.dim,code:a.code,topics:a.topics,rows:unique};
  const groups=new Map();
  for(const r of unique){
   const id=groupForRelated(r,context);
   const label=relatedBuiltins[id]||a.topics.find(t=>t.id===id)?.title||'Otros';
   if(!groups.has(id))groups.set(id,{id,label,count:0,icon:relatedSymbols[id]?id:'all'});
   groups.get(id).count++;
  }
  const order=context.code==='4.1'&&state.dim==='institucional'?
   ['gestion','planeacion','control','transparencia','otros']:
   context.code==='2.6'&&state.dim==='economica'?
   ['ingresos','tributos','presupuesto','deuda','otros']:[];
  context.groups=[...groups.values()].sort((a,b)=>{
    if(order.length)return order.indexOf(a.id)-order.indexOf(b.id);
    const ai=context.topics.findIndex(t=>t.id===a.id),bi=context.topics.findIndex(t=>t.id===b.id);
    return (ai<0?999:ai)-(bi<0?999:bi);
  });
  return context;
 }
 function relatedValue(r){
  const series=availableSeries(r)[0];
  const info=unitInfo(r,series),data=normalizedPoints(r,series),last=data.at(-1);
  const cat=(r.categories||[])[0]?.values?.[0];
  if(last){
   const original=last.value;
   const unit=norm(r.meta?.unit);
   // Format only the label; original exact values remain in the full fiche.
   const isCOP=/pesos colombianos|cop/.test(unit)&&!info.million&&Math.abs(original)>=1e6;
   if(isCOP)return {value:number(original/1e6,1)+' M',note:'COP · '+last.year,full:valueText(original,info)};
   return {value:valueText(original,info),note:'Vigencia '+last.year,full:valueText(original,info)};
  }
  if(cat&&Number.isFinite(Number(cat[1])))return {value:number(Number(cat[1]),2),note:'Desagregación disponible',full:number(Number(cat[1]),2)};
  return {value:'Ver ficha',note:'Dato disponible en ficha',full:'Ver ficha'};
 }
 function relatedSparkline(r){
  const s=availableSeries(r)[0],data=normalizedPoints(r,s);
  if(data.length<2||new Set(data.map(x=>x.year)).size<2)return '';
  const p=data.slice(-7);
  const a=Math.min(...p.map(x=>x.value)),b=Math.max(...p.map(x=>x.value)),lo=Math.min(...p.map(x=>x.year)),hi=Math.max(...p.map(x=>x.year));
  const y=v=>35-((v-a)/(b-a||1))*25,x=v=>6+((v-lo)/(hi-lo||1))*114;
  const points=p.map(z=>x(z.year).toFixed(1)+','+y(z.value).toFixed(1)).join(' ');
  const last=p.at(-1);
  return '<svg class="ds5-related-spark" viewBox="0 0 126 43" aria-hidden="true" focusable="false"><polyline points="'+
   points+'" fill="none" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"/>'+
   '<circle cx="'+x(last.year).toFixed(1)+'" cy="'+y(last.value).toFixed(1)+'" r="4" fill="currentColor"/></svg>';
 }
 function relatedCard(r,context,current){
  const groupId=groupForRelated(r,context);
  const group=context.groups.find(g=>g.id===groupId)||{label:'Otros',icon:'otros'};
  const val=relatedValue(r),sel=r.id===current.id;
  const icon=/indice de desempeno institucional/i.test(norm(r.name))?'medalla':
   /compras y contratacion/i.test(norm(r.name))?'compras':group.icon;
  return '<button type="button" class="ds5-related-card'+(sel?' is-current':'')+'" data-ds5-indicator="'+esc(r.id)+'"'+
   (sel?' aria-current="true"':'')+' aria-label="'+esc(r.name+', '+val.full+', '+(sel?'indicador en consulta':'abrir ficha'))+'">'+
   '<span class="ds5-related-card-head"><span class="ds5-related-card-icon">'+relatedIcon(icon)+'</span>'+
   (sel?'<span class="ds5-related-current">En consulta</span>':'')+'</span>'+
   '<span class="ds5-related-name" title="'+esc(r.name)+'">'+esc(r.name)+'</span>'+
   '<span class="ds5-related-measure" title="'+esc(val.full)+'">'+esc(val.value)+'</span>'+
   '<span class="ds5-related-meta"><span class="ds5-related-tag">'+esc(group.label)+'</span>'+
   '<small>'+esc(val.note)+'</small></span>'+relatedSparkline(r)+'</button>';
 }
 function relatedList(current,context){
  const group=state.relatedGroup;
  const query=norm(state.relatedSearch);
  const filtered=context.rows.filter(r=>
    (group==='all'||groupForRelated(r,context)===group)&&
    (!query||norm(r.name+' '+r.topicLabel+' '+r.meta?.code).includes(query)));
  filtered.sort((a,b)=>{
    if(a.id===current.id)return -1;
    if(b.id===current.id)return 1;
    const sameA=a.nav?.topic===current.nav?.topic,sameB=b.nav?.topic===current.nav?.topic;
    if(sameA!==sameB)return sameA?-1:1;
    // Preserve the stable workbook order for each source; never rank
    // money, percentages and indexes by their numeric value.
    return context.rows.indexOf(a)-context.rows.indexOf(b);
  });
  const display=state.relatedExpanded?filtered:filtered.slice(0,3);
  const remaining=filtered.length-display.length;
  const noData='<p class="ds5-related-empty">No hay indicadores que coincidan con esta búsqueda.</p>';
  const cards=display.length?'<div class="ds5-related-grid">'+display.map(r=>relatedCard(r,context,current)).join('')+'</div>':noData;
  const toggle=filtered.length>3||state.relatedExpanded?
   '<button type="button" class="ds5-related-show-all" data-ds5-related-expand="'+(state.relatedExpanded?'false':'true')+
   '" aria-expanded="'+state.relatedExpanded+'">'+
   (state.relatedExpanded?'Mostrar menos':'Ver los '+filtered.length+' indicadores')+
   '<span aria-hidden="true">'+(state.relatedExpanded?' ↑':' →')+'</span></button>':'';
  return cards+'<div class="ds5-related-footer"><span class="ds5-related-visible">'+
   (filtered.length?'Mostrando '+display.length+' de '+filtered.length+' indicadores':'Sin coincidencias')+'</span>'+toggle+'</div>';
 }
 function related(r){
  const context=relatedContext();
  if(!context.groups.some(g=>g.id===state.relatedGroup))state.relatedGroup='all';
  const tabs=[{id:'all',label:'Todos',icon:'all',count:context.rows.length},...context.groups];
  const controls=tabs.map(g=>
   '<button type="button" class="ds5-related-filter'+(g.id===state.relatedGroup?' active':'')+
   '" data-ds5-related-group="'+esc(g.id)+'" aria-pressed="'+(g.id===state.relatedGroup)+'">'+
   relatedIcon(g.icon||g.id)+'<span>'+esc(g.label)+' <span class="ds5-related-count">('+g.count+')</span></span></button>').join('');
  return '<section class="ds5-related" aria-labelledby="ds5-related-title">'+
   '<div class="ds5-related-heading"><h3 id="ds5-related-title">'+relatedIcon('all')+' Otros indicadores del componente</h3>'+
   '<small>'+context.rows.length+' indicadores del área disponibles</small></div>'+
   '<nav class="ds5-related-filters" aria-label="Filtrar indicadores por tema">'+controls+'</nav>'+
   (state.relatedExpanded?'<label class="ds5-related-search-label" for="ds5-related-search">Buscar entre los indicadores del área'+
   '<input id="ds5-related-search" type="search" placeholder="Buscar por nombre o código…" autocomplete="off" value="'+esc(state.relatedSearch)+'"></label>':'')+
   '<div class="ds5-related-results" aria-live="polite">'+relatedList(r,context)+'</div></section>';
 }
 // Resized charts use the actual available pixel dimensions in the card.
 // ResizeObserver only tracks the chart frame, avoiding all global layout hacks.
 let plotObserver=null;
 function fitChartFrame(frame){
  if(!frame?.isConnected)return;
  const r=active();
  if(!r||!availableSeries(r).length)return;
  if(state.chartMode==='categorias'&&(r.categories||[]).some(c=>c.values?.length))return;
  const width=Math.round(frame.getBoundingClientRect().width);
  const height=Math.round(frame.getBoundingClientRect().height);
  if(width<120||height<120)return;
  const signature=r.id+':'+state.series+':'+width+'x'+height;
  if(frame.dataset.plotSize===signature)return;
  frame.dataset.plotSize=signature;
  frame.innerHTML=lineChart(r,width,height);
 }
 function updateChartFit(){
  if(plotObserver){plotObserver.disconnect();plotObserver=null;}
  requestAnimationFrame(()=>{
   const frame=root.querySelector('.ds5-chart-frame');
   if(!frame||!frame.isConnected)return;
   fitChartFrame(frame);
   if('ResizeObserver' in window){
    plotObserver=new ResizeObserver(entries=>{
     for(const entry of entries)if(entry.target===frame)fitChartFrame(frame);
    });
    plotObserver.observe(frame);
   }
  });
 }
 function chooseIndicator(r){
  const code=liveCode(r.meta?.code),t=topic();
  by('ds5-title').textContent=r.name;
  by('ds5-code').textContent=code==='Sin código asignado'?(t.documentCode||'Ficha'):(code);
  by('ds5-subtitle').textContent=nice(r.meta?.definition)||'Indicador municipal con datos reportados en el libro de origen.';
  by('ds5-source-tag').textContent=trace(r);
  by('ds5-kpis').innerHTML=kpis(r);
  by('ds5-dual').innerHTML=chart(r)+metadata(r);
  updateChartFit();
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
   else if(b.dataset.ds5Indicator){
    const r=lookup.get(b.dataset.ds5Indicator);
    if(r?.nav){
      if(r.id!==state.indicator){
        change(r.nav.dimension,r.nav.area,r.nav.topic,r.id);
        requestAnimationFrame(()=>root.querySelector('.ds5-content')?.scrollIntoView({behavior:'smooth',block:'start'}));
      }
    }
   }
   else if(b.dataset.ds5Search){
    const r=lookup.get(b.dataset.ds5Search);if(r?.nav)change(r.nav.dimension,r.nav.area,r.nav.topic,r.id);
    by('ds5-search').value='';
   }
   else if(b.dataset.ds5Chartmode){
    state.chartMode=b.dataset.ds5Chartmode;
    const r=active();
    if(r){
      root.querySelector('.ds5-chart-card')?.replaceWith(document.createRange().createContextualFragment(chart(r)));
      updateChartFit();
    }
   }
   else if(b.dataset.ds5RelatedGroup){
    state.relatedGroup=b.dataset.ds5RelatedGroup;
    state.relatedExpanded=false;state.relatedSearch='';
    const r=active();if(r)by('ds5-related-root').innerHTML=related(r);
   }
   else if(b.dataset.ds5RelatedExpand){
    state.relatedExpanded=b.dataset.ds5RelatedExpand==='true';
    if(!state.relatedExpanded)state.relatedSearch='';
    const r=active();if(r)by('ds5-related-root').innerHTML=related(r);
   }
   else if(b.id==='ds5-download')printPdf();
  });
  root.addEventListener('change',e=>{
   if(e.target.id==='ds5-series-select'){
    state.series=Number(e.target.value)||0;
    const r=active();if(r){
     by('ds5-kpis').innerHTML=kpis(r);
     root.querySelector('.ds5-chart-card')?.replaceWith(document.createRange().createContextualFragment(chart(r)));
     updateChartFit();
     by('ds5-interpretation').textContent=analytical(r);
     by('ds5-findings-root').innerHTML=findings(r);
    }
   }
  });
  root.addEventListener('input',e=>{
    if(e.target.id==='ds5-related-search'){
      state.relatedSearch=e.target.value;
      const r=active(),list=root.querySelector('.ds5-related-results');
      if(r&&list)list.innerHTML=relatedList(r,relatedContext());
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
  fetch('data/fichas-2026-validadas.json').then(r=>{if(!r.ok)throw Error('Fichas Excel inaccesibles');return r.json();})
 ]).then(([tax,sources])=>{
  if(sources.records?.length!==341||tax.dimensiones?.length!==4)throw Error('Fuentes inesperadas; no se publicarán datos incompletos.');
  if(sources.audit?.validation?.available!==290||sources.audit?.validation?.series!==435||sources.audit?.validation?.points!==1212||
     sources.audit?.validation?.categoryValues!==98||sources.records.some(r=>r.available&&!r.classification)||
     new Set(sources.records.map(r=>r.id)).size!==341)
    throw Error('La integridad de las fichas Excel o su clasificación no coincide.');
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
