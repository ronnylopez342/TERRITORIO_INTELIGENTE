(function TI42Financiera(){
'use strict';
const section=document.querySelector('#cumplimiento-proyectos');
const shell=section?.querySelector('.ti42');
const tabs=shell?.querySelector('.ti42-tabs');
const summary=window.TI42Summary,projects=window.TI42Proyectos;
if(!section||!shell||!tabs||!summary?.onChange||!projects?.setView)return;
const KEY='ti:uc42:financiera:v1';
const esc=v=>String(v===null||v===undefined?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const have=v=>v!==null&&v!==undefined&&String(v).trim()!=='';
const finite=v=>typeof v==='number'&&Number.isFinite(v);
const fmt=v=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:1}).format(v);
const money=v=>finite(v)?'$ '+new Intl.NumberFormat('es-CO',{maximumFractionDigits:0}).format(v):'Sin dato';
const percent=v=>finite(v)?fmt(v)+' %':'Sin dato';
const shorten=(v,max=76)=>{const t=String(v??'').replace(/\s+/g,' ').trim();return esc(t.length>max?t.slice(0,max-1).trimEnd()+'…':t);};
const extra=r=>projects.getExtraRow?.(r?.excelRow)||{};
const hasTotal=r=>finite(r.budget)&&r.budget>=0;
const hasExecuted=r=>finite(r.executedCost)&&r.executedCost>=0;
const hasPair=r=>finite(r.budget)&&r.budget>0&&hasExecuted(r);
const rate=r=>hasPair(r)?100*r.executedCost/r.budget:null;
const anomaly=r=>(finite(r.budget)&&r.budget<0)||(finite(r.executedCost)&&r.executedCost<0)||(finite(r.budget)&&r.budget>=0&&finite(r.executedCost)&&r.executedCost>r.budget);
const quality=r=>hasPair(r)?'paired':hasTotal(r)||hasExecuted(r)?'partial':'none';
const status=r=>{
 if(anomaly(r))return {label:'Requiere revisión',tone:'warning'};
 if(hasPair(r))return {label:'Costos comparables',tone:'success'};
 if(quality(r)==='partial')return {label:'Datos parciales',tone:'partial'};
 return {label:'Sin par de costos',tone:'missing'};
};
const field=(title,value)=>'<div class="ti42f-field"><dt>'+esc(title)+'</dt><dd>'+(
  have(value)?esc(value):'<em>No informado en el archivo</em>')+'</dd></div>';
const sum=(rows,key)=>rows.reduce((total,r)=>total+(finite(r[key])?r[key]:0),0);
const cap=x=>Math.max(0,Math.min(100,finite(x)?x:0));
const gauge=(label,value,tone,description)=>{
 const known=finite(value),width=cap(value);
 return '<div class="ti42f-gauge"><div><strong>'+esc(label)+'</strong><span>'+percent(value)+'</span></div><div class="ti42f-track"><i class="'+tone+'" style="width:'+width.toFixed(2)+'%"></i></div>'+
 (known&&value>100?'<p class="ti42f-gauge-warn">Valor real superior al 100 %; la barra se limita visualmente, no se altera el dato.</p>':'')+
 (description?'<p>'+esc(description)+'</p>':'')+'</div>';
};
const metric=(title,value,subtitle,tone='blue')=>
 '<article class="ti42f-kpi '+tone+'"><span>'+esc(title)+'</span><strong>'+esc(value)+'</strong><small>'+esc(subtitle)+'</small></article>';
let state={quality:'all',ratio:'all',sort:'file',query:'',page:1,pageSize:10,selectedRow:null,detail:'resumen',chartMode:'cop'};
try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved&&typeof saved==='object')for(const k of Object.keys(state))if(Object.prototype.hasOwnProperty.call(saved,k))state[k]=saved[k];}catch{}
if(!['all','paired','partial','none','review'].includes(state.quality))state.quality='all';
if(!['all','upTo100','over100','unknown'].includes(state.ratio))state.ratio='all';
if(!['file','total','executed','ratio','project'].includes(state.sort))state.sort='file';
if(!['resumen','fuente','calidad'].includes(state.detail))state.detail='resumen';
if(!['cop','ratio'].includes(state.chartMode))state.chartMode='cop';
state.query=typeof state.query==='string'?state.query:'';
state.pageSize=[10,20,50].includes(Number(state.pageSize))?Number(state.pageSize):10;
state.page=Math.max(1,Math.trunc(Number(state.page))||1);
let rows=[],globalState={},loaded=false,error=null,selected=null,filtered=[],visibleSourceCount=0,extraReady=false,renderCount=0;
const panel=document.createElement('section');
panel.hidden=true;panel.dataset.ti42FinancieraRoot='1';panel.className='ti42f';
panel.setAttribute('aria-label','Ejecución financiera de proyectos estratégicos');
panel.innerHTML=`
<header class="ti42f-top">
 <div><span class="ti42f-eyebrow">4.2 · ASÍ CUMPLIMOS · PROYECTOS ESTRATÉGICOS</span>
  <h2>Ejecución financiera <span data-ti42f-year></span></h2>
  <p>Compara los costos totales y ejecutados consignados en el Excel, identifica brechas de información y consulta cada registro. Las cifras describen filas del archivo, no pagos certificados.</p>
 </div>
 <button type="button" data-ti42f-export class="ti42f-export">↧ Exportar CSV</button>
</header>
<div class="ti42f-context" role="note">
 <span data-ti42f-parent>Aplicando los filtros generales…</span>
 <span>Fuente: UNIDAD DE CUMPLIMIENTO(1).xlsx · «Proyectos DEFINITIVO»</span>
</div>
<section class="ti42f-filters" aria-label="Filtros financieros">
 <div class="ti42f-query"><label for="ti42f-query">Buscar proyecto o referencia</label><input id="ti42f-query" data-ti42f-query type="search" autocomplete="off" placeholder="Proyecto, BPIN, contrato o vereda…"></div>
 <div><label for="ti42f-quality">Disponibilidad de importes</label><select id="ti42f-quality" data-ti42f-filter="quality">
  <option value="all">Todos los registros</option><option value="paired">Dos importes comparables</option>
  <option value="partial">Solo uno / base cero</option><option value="none">Sin costos comparables</option><option value="review">Requieren revisión</option>
 </select></div>
 <div><label for="ti42f-ratio">Relación de costos</label><select id="ti42f-ratio" data-ti42f-filter="ratio">
  <option value="all">Todas</option><option value="upTo100">Hasta el 100 %</option>
  <option value="over100">Superior al 100 %</option><option value="unknown">No calculable</option>
 </select></div>
 <div><label for="ti42f-sort">Ordenar</label><select id="ti42f-sort" data-ti42f-filter="sort">
  <option value="file">Orden del Excel</option><option value="total">Mayor costo total</option>
  <option value="executed">Mayor costo ejecutado</option><option value="ratio">Mayor relación (%)</option>
  <option value="project">Nombre del proyecto</option>
 </select></div>
 <button class="ti42f-clear" type="button" data-ti42f-clear>Limpiar</button>
</section>
<p class="ti42f-status" role="status" aria-live="polite" data-ti42f-status>Consultando la información financiera…</p>
<section class="ti42f-kpis" aria-label="Indicadores de ejecución financiera" data-ti42f-kpis></section>
<div class="ti42f-layout">
 <div class="ti42f-left">
  <article class="ti42f-card ti42f-graph">
   <header class="ti42f-card-head">
    <div><h3>Costos por proyecto o registro</h3><p>Los importes se comparan en pesos colombianos (COP), sin combinar unidades distintas.</p></div>
    <div class="ti42f-switch" role="group" aria-label="Tipo de comparación">
     <button type="button" data-ti42f-chart-mode="cop">Valores ($)</button>
     <button type="button" data-ti42f-chart-mode="ratio">Relación (%)</button>
    </div>
   </header>
   <div class="ti42f-legend"><span><i class="blue"></i>Costo total del proyecto</span><span><i class="green"></i>Costo ejecutado</span></div>
   <div class="ti42f-chart-scroll" data-ti42f-chart></div>
   <p class="ti42f-note" data-ti42f-chart-note></p>
  </article>
  <article class="ti42f-card ti42f-table-card">
   <div class="ti42f-card-head"><h3>Registros financieros del Excel</h3><span class="ti42f-count" data-ti42f-count>—</span></div>
   <div class="ti42f-table-scroll" data-ti42f-table></div>
   <div class="ti42f-pager">
    <span data-ti42f-range>—</span>
    <div><label for="ti42f-size">Filas</label><select id="ti42f-size" data-ti42f-size><option value="10">10</option><option value="20">20</option><option value="50">50</option></select>
      <button type="button" data-ti42f-prev aria-label="Página anterior">‹</button>
      <strong data-ti42f-page>1 / 1</strong>
      <button type="button" data-ti42f-next aria-label="Página siguiente">›</button>
    </div>
   </div>
  </article>
 </div>
 <div class="ti42f-right">
  <article class="ti42f-card ti42f-detail">
   <header class="ti42f-detail-head"><span class="ti42f-eyebrow">REGISTRO SELECCIONADO</span>
    <h3 data-ti42f-title>Selecciona un proyecto</h3>
    <div data-ti42f-badge></div>
    <small data-ti42f-id>Fuente: «Proyectos DEFINITIVO»</small>
   </header>
   <nav class="ti42f-detail-tabs" role="tablist" aria-label="Ficha de información financiera">
    <button type="button" role="tab" data-ti42f-detail="resumen">Resumen financiero</button>
    <button type="button" role="tab" data-ti42f-detail="fuente">Datos de origen</button>
    <button type="button" role="tab" data-ti42f-detail="calidad">Lectura y límites</button>
   </nav>
   <div class="ti42f-detail-content" data-ti42f-detail-content></div>
   <button type="button" class="ti42f-project-link" data-ti42f-project>Ver proyecto asociado →</button>
  </article>
  <article class="ti42f-card ti42f-coverage">
   <h3>Cobertura de los datos financieros</h3>
   <div data-ti42f-coverage></div>
   <p class="ti42f-note">Disponibilidad de columnas del Excel en los registros filtrados. No mide la ejecución de la administración.</p>
  </article>
  <article class="ti42f-card ti42f-sectors">
   <h3>Costos comparables por sector</h3>
   <div data-ti42f-sectors></div>
   <p class="ti42f-note">Suma descriptiva de filas con los dos importes válidos; puede incluir proyectos repetidos.</p>
  </article>
 </div>
</div>
<footer class="ti42f-footer">
 Fuente: UNIDAD DE CUMPLIMIENTO(1).xlsx, hoja «Proyectos DEFINITIVO». Se conservan la vigencia, el sector y las cifras de origen. La relación costo ejecutado / costo total es un cálculo aritmético, no equivale automáticamente al porcentaje oficial de ejecución presupuestal, a desembolsos, ni a contratos únicos. No se atribuye fecha de actualización ni se rellenan valores ausentes con ceros.
</footer>`;
tabs.insertAdjacentElement('afterend',panel);
const q=s=>panel.querySelector(s),all=s=>[...panel.querySelectorAll(s)];
const set=(s,html)=>{const x=q(s);if(x)x.innerHTML=html;};
const text=(s,value)=>{const x=q(s);if(x)x.textContent=String(value??'');};
const keep=()=>{try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}};
const parent=r=>{
 const f=globalState||{};
 if(f.meta&&f.meta!=='all'&&(f.meta==='none'?!!r.meta:r.meta!==f.meta))return false;
 if(f.year&&f.year!=='all'&&(f.year==='none'?!!r.year:r.year!==f.year))return false;
 if(f.status&&f.status!=='all'&&(f.status==='none'?!!r.contractStatus:r.contractStatus!==f.status))return false;
 if(f.sector&&f.sector!=='all'&&(f.sector==='none'?!!r.sectorMGA:r.sectorMGA!==f.sector))return false;
 if(f.q&&!norm([r.name,r.bpin,r.contract,r.vereda,r.sectorMGA,r.phase,r.item].join(' ')).includes(norm(f.q)))return false;
 return true;
};
function local(r){
 if(state.quality==='paired'&&!hasPair(r))return false;
 if(state.quality==='partial'&&quality(r)!=='partial')return false;
 if(state.quality==='none'&&quality(r)!=='none')return false;
 if(state.quality==='review'&&!anomaly(r))return false;
 const ratio=rate(r);
 if(state.ratio==='upTo100'&&!(finite(ratio)&&ratio<=100))return false;
 if(state.ratio==='over100'&&!(finite(ratio)&&ratio>100))return false;
 if(state.ratio==='unknown'&&finite(ratio))return false;
 if(state.query&&!norm([r.name,r.bpin,r.contract,r.contractor,r.vereda,r.meta,r.sectorMGA,r.year,r.item,extra(r).program].join(' ')).includes(norm(state.query)))return false;
 return true;
}
function results(){
 const list=rows.filter(parent).filter(local);
 const sortNumber=(field)=>(a,b)=>{const aa=field(a),bb=field(b);return (finite(bb)?bb:-Infinity)-(finite(aa)?aa:-Infinity)||a.excelRow-b.excelRow;};
 if(state.sort==='total')list.sort(sortNumber(r=>hasTotal(r)?r.budget:null));
 else if(state.sort==='executed')list.sort(sortNumber(r=>hasExecuted(r)?r.executedCost:null));
 else if(state.sort==='ratio')list.sort(sortNumber(rate));
 else if(state.sort==='project')list.sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'es')||a.excelRow-b.excelRow);
 else list.sort((a,b)=>a.excelRow-b.excelRow);
 return list;
}
function parentSummary(){
 const filterText='Meta '+(globalState.meta==='all'?'todas':globalState.meta==='none'?'sin identificar':globalState.meta||'—')
 +' · Vigencia '+(globalState.year==='all'?'todas':globalState.year||'todas')
 +' · Sector '+(globalState.sector==='all'?'todos':globalState.sector||'todos');
 text('[data-ti42f-parent]',filterText);
 const years=[...new Set(filtered.map(r=>r.year).filter(Boolean))];
 text('[data-ti42f-year]',years.length===1?'· '+years[0]:'');
}
function cards(){
 const matched=filtered.filter(hasPair),budget=sum(matched,'budget'),spent=sum(matched,'executedCost');
 const comparableRate=budget>0?100*spent/budget:null;
 const missing=filtered.length-matched.length;
 const invalid=filtered.filter(anomaly);
 const kpis=[
  metric('Registros en la selección',String(filtered.length),'Filas del Excel; no proyectos únicos'),
  metric('Con costos comparables',String(matched.length),matched.length+' de '+filtered.length+' con ambos valores', 'green'),
  metric('Costo total · pares válidos',matched.length?money(budget):'Sin dato','Suma de los mismos '+matched.length+' registros'),
  metric('Costo ejecutado · pares válidos',matched.length?money(spent):'Sin dato','No equivale a pagos certificados','green'),
  metric('Relación costo ejecutado / total',percent(comparableRate),'Calculada sobre '+matched.length+' pares válidos',finite(comparableRate)&&comparableRate>100?'amber':'blue'),
  metric('Filas sin par / alertas',missing+' / '+invalid.length,'Sin par comparable / importes a revisar','amber')
 ];
 set('[data-ti42f-kpis]',kpis.join(''));
}
function drawChart(){
 const length=filtered.length;
 if(!length){set('[data-ti42f-chart]','<p class="ti42f-empty">No hay registros para los filtros seleccionados.</p>');text('[data-ti42f-chart-note]','');return;}
 const capRows=filtered;
 const vals=capRows.filter(r=>hasTotal(r)||hasExecuted(r));
 const maxCost=Math.max(1,...vals.flatMap(r=>[hasTotal(r)?r.budget:0,hasExecuted(r)?r.executedCost:0]));
 const row=capRows.map(r=>{
  const pair=hasPair(r),v=rate(r),id=esc(r.item||r.excelRow);
  const title='<div class="ti42f-chart-project" title="'+esc(r.name)+'"><strong>'+id+'</strong><span>'+shorten(r.name,54)+'</span></div>';
  let graph;
  if(state.chartMode==='cop'){
   const base=finite(r.budget)?r.budget:null,ex=finite(r.executedCost)?r.executedCost:null;
   graph='<div class="ti42f-plotbars"><div class="ti42f-plotline"><div class="ti42f-track"><i class="blue" style="width:'+(finite(base)?cap(base/maxCost*100).toFixed(2):0)+'%"></i></div><span>'+money(base)+'</span></div><div class="ti42f-plotline"><div class="ti42f-track"><i class="green" style="width:'+(finite(ex)?cap(ex/maxCost*100).toFixed(2):0)+'%"></i></div><span>'+money(ex)+'</span></div></div>';
  }else{
   graph='<div class="ti42f-plotbars"><div class="ti42f-plotline"><div class="ti42f-track"><i class="blue" style="width:'+(pair?'100':'0')+'%"></i></div><span>'+(pair?'100 %':'Sin base comparable')+'</span></div><div class="ti42f-plotline"><div class="ti42f-track"><i class="green" style="width:'+cap(v).toFixed(2)+'%"></i></div><span>'+percent(v)+'</span></div>'+
   (finite(v)&&v>100?'<small class="ti42f-chart-warning">Valor real mayor que 100 %</small>':'')+'</div>';
  }
  return '<button type="button" class="ti42f-chart-row'+(selected?.excelRow===r.excelRow?' is-selected':'')+'" data-ti42f-select="'+r.excelRow+'" title="Seleccionar registro '+esc(r.item||r.excelRow)+'">'+title+graph+'</button>';
 }).join('');
 set('[data-ti42f-chart]',row);
 text('[data-ti42f-chart-note]',state.chartMode==='cop'?'Escala común en COP entre valores no negativos; los valores negativos se conservan en las etiquetas y se señalan como anomalías, sin dibujar barras negativas. Desplázate verticalmente para consultar las '+length+' filas.':'Cada base comparable representa el 100 % del costo total; el porcentaje verde es costo ejecutado dividido entre costo total. Un dato mayor que 100 % se indica textualmente y no se oculta.');
 all('[data-ti42f-chart-mode]').forEach(b=>{
  const on=b.dataset.ti42fChartMode===state.chartMode;b.classList.toggle('is-active',on);b.setAttribute('aria-pressed',String(on));
 });
}
function drawTable(){
 const pages=Math.max(1,Math.ceil(filtered.length/state.pageSize));
 state.page=Math.max(1,Math.min(pages,state.page));
 const start=(state.page-1)*state.pageSize,part=filtered.slice(start,start+state.pageSize);
 const head=['Ítem / proyecto','Vigencia · Meta','Costo total','Costo ejecutado','Relación calculada','% financiero informado','Lectura de datos','Acción'];
 const body=part.map(r=>{
  const st=status(r),v=rate(r),reported=extra(r).financialPct;
  return '<tr class="'+(selected?.excelRow===r.excelRow?'is-selected':'')+'">'+
    '<td title="'+esc(r.name)+'"><strong>'+shorten(r.name,68)+'</strong><small>Ítem '+esc(r.item||r.excelRow)+' · fila '+r.excelRow+'</small></td>'+
    '<td>'+esc(r.year||'Sin vigencia')+'<small>Meta '+esc(r.meta||'S/N')+'</small></td>'+
    '<td class="ti42f-number">'+money(finite(r.budget)?r.budget:null)+'</td>'+
    '<td class="ti42f-number">'+money(finite(r.executedCost)?r.executedCost:null)+'</td>'+
    '<td class="ti42f-number">'+percent(v)+(finite(v)&&v>100?'<small class="ti42f-over">Sobre 100 %</small>':'')+'</td>'+
    '<td class="ti42f-number">'+percent(finite(reported)?reported:null)+'</td>'+
    '<td><span class="ti42f-badge '+st.tone+'">'+st.label+'</span></td>'+
    '<td><button type="button" data-ti42f-select="'+r.excelRow+'" aria-label="Ver ficha financiera del registro '+r.excelRow+'">Ver detalle</button></td></tr>';
 }).join('');
 set('[data-ti42f-table]','<table><thead><tr>'+head.map(h=>'<th scope="col">'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+body+'</tbody></table>'+
 (!part.length?'<div class="ti42f-empty">No se encontraron filas. Cambia el filtro de disponibilidad o la meta seleccionada.</div>':''));
 text('[data-ti42f-count]',filtered.length+' registros');
 text('[data-ti42f-range]',filtered.length?(start+1)+'–'+(start+part.length)+' de '+filtered.length:'0 registros');
 text('[data-ti42f-page]',state.page+' / '+pages);
 q('[data-ti42f-prev]').disabled=state.page<=1;
 q('[data-ti42f-next]').disabled=state.page>=pages;
}
function drawDetail(){
 if(!selected){
  text('[data-ti42f-title]','Sin registro seleccionado');
  text('[data-ti42f-id]','Ajusta los filtros para visualizar información financiera.');
  set('[data-ti42f-badge]','');
  set('[data-ti42f-detail-content]','<p class="ti42f-empty">No hay datos que mostrar para los filtros actuales.</p>');
  q('[data-ti42f-project]').disabled=true;return;
 }
 const r=selected,x=extra(r),v=rate(r),st=status(r),fp=finite(x.financialPct)?x.financialPct:null;
 text('[data-ti42f-title]',r.name||'Proyecto sin nombre');
 text('[data-ti42f-id]','Ítem '+(r.item||r.excelRow)+' · fila original '+r.excelRow+' · '+(r.year||'Sin vigencia'));
 set('[data-ti42f-badge]','<span class="ti42f-badge '+st.tone+'">'+st.label+'</span>');
 q('[data-ti42f-project]').disabled=false;
 let content='';
 if(state.detail==='resumen'){
  content='<h4>Comparación de costos del proyecto</h4><div class="ti42f-detail-amounts">'+
    '<div><small>Costo total consignado</small><strong>'+money(finite(r.budget)?r.budget:null)+'</strong></div>'+
    '<div><small>Costo ejecutado consignado</small><strong>'+money(finite(r.executedCost)?r.executedCost:null)+'</strong></div>'+
    '</div>'+gauge('Relación de costos calculada',v,'green','Costo ejecutado / costo total del proyecto. No equivale por sí solo a ejecución presupuestal.')+
    gauge('Avance financiero reportado en el archivo',fp,'blue','Campo financiero explícito del Excel; puede diferir de la relación aritmética.')+
    '<dl class="ti42f-facts">'+
    field('Diferencia aritmética (total menos ejecutado)',hasTotal(r)&&hasExecuted(r)?money(r.budget-r.executedCost):null)+
    field('Avance financiero de gestión reportado',finite(r.managementPercent)?percent(r.managementPercent):null)+
    field('Número de contrato',r.contract)+
    '</dl>'+
    (anomaly(r)?'<div class="ti42f-warning">La fuente contiene un valor financiero superior al total o un importe negativo. Se conserva la cifra original y se señala para revisión.</div>':'');
 }else if(state.detail==='fuente'){
  content='<h4>Campos originales y procedencia</h4><dl class="ti42f-facts">'+[
    field('Hoja Excel','Proyectos DEFINITIVO'),field('Fila original',r.excelRow),
    field('Vigencia',r.year),field('Número de meta',r.meta),field('Código BPIN',r.bpin),
    field('Sector MGA',r.sectorMGA),field('Proyecto',r.name),
    field('Contratista',r.contractor),field('Estado contractual (texto)',r.contractStatus),
    field('Costo total (columna de origen)',finite(r.budget)?money(r.budget):null),
    field('Costo ejecutado (columna de origen)',finite(r.executedCost)?money(r.executedCost):null),
    field('Porcentaje financiero del Excel',finite(fp)?percent(fp):null),
    field('Avance financiero de gestión',finite(r.managementPercent)?percent(r.managementPercent):null),
    field('Descripción de pagos (texto del archivo)',x.paymentStatus),
    field('Observaciones',r.observations)
   ].join('')+'</dl>';
 }else{
  const hasMissing=!hasPair(r);
  content='<h4>Comprobación y límites de lectura</h4><ul class="ti42f-checks">'+
    '<li class="'+(hasTotal(r)?'pass':'pending')+'">'+(hasTotal(r)?'✓':'!')+' Costo total '+(hasTotal(r)?'numérico':'no informado o no válido')+'</li>'+
    '<li class="'+(hasExecuted(r)?'pass':'pending')+'">'+(hasExecuted(r)?'✓':'!')+' Costo ejecutado '+(hasExecuted(r)?'numérico':'no informado o no válido')+'</li>'+
    '<li class="'+(finite(fp)?'pass':'pending')+'">'+(finite(fp)?'✓':'!')+' Porcentaje financiero de origen '+(finite(fp)?'disponible':'sin dato')+'</li>'+
    '<li class="'+(anomaly(r)?'pending':'pass')+'">'+(anomaly(r)?'! Importes que requieren revisión':'✓ Sin sobrecosto aritmético identificable en los importes registrados')+'</li></ul>'+
    (hasMissing?'<div class="ti42f-warning">No se calcula porcentaje cuando falta uno de los importes, el costo total es cero o existen cifras negativas.</div>':'')+
    '<p>La relación se calcula únicamente cuando el costo total es positivo y el costo ejecutado no es negativo. No se certifica disponibilidad presupuestal, CDP, RP, obligaciones ni pagos sin documentos que lo acrediten.</p>'+
    '<p>Los porcentajes «avance financiero» y «relación de costos» representan campos distintos y no tienen que coincidir.</p>';
 }
 set('[data-ti42f-detail-content]',content);
 all('[data-ti42f-detail]').forEach(b=>{const active=b.dataset.ti42fDetail===state.detail;b.classList.toggle('is-active',active);b.setAttribute('aria-selected',String(active));});
}
function drawCoverage(){
 const parts={paired:0,partial:0,none:0};
 for(const r of filtered)parts[quality(r)]++;
 const n=filtered.length;
 set('[data-ti42f-coverage]','<div class="ti42f-coverage-total"><strong>'+n+'</strong><span>filas del Excel seleccionadas</span></div>'+
 '<div class="ti42f-coverage-track"><i class="success" style="width:'+(n?100*parts.paired/n:0).toFixed(2)+'%"></i><i class="partial" style="width:'+(n?100*parts.partial/n:0).toFixed(2)+'%"></i><i class="missing" style="width:'+(n?100*parts.none/n:0).toFixed(2)+'%"></i></div>'+
 [['Con importes comparables',parts.paired,'success'],['Con un importe o base cero',parts.partial,'partial'],['Sin importes válidos',parts.none,'missing']].map(([name,value,tone])=>'<div class="ti42f-coverage-key"><span><i class="'+tone+'"></i>'+name+'</span><strong>'+value+' <small>('+ (n?fmt(100*value/n):'0')+' %)</small></strong></div>').join('')+
 '<div class="ti42f-review-count"><strong>'+filtered.filter(anomaly).length+'</strong> filas con importes que deben revisarse</div>');
}
function drawSectors(){
 const comparable=filtered.filter(hasPair),groups=new Map();
 for(const r of comparable){
  const key=r.sectorMGA||'Sector sin registrar';
  if(!groups.has(key))groups.set(key,{name:key,count:0,budget:0,executed:0});
  const g=groups.get(key);g.count++;g.budget+=r.budget;g.executed+=r.executedCost;
 }
 const ordered=[...groups.values()].sort((a,b)=>b.budget-a.budget),max=Math.max(1,...ordered.flatMap(g=>[g.budget,g.executed]));
 const html=ordered.map(g=>'<div class="ti42f-sector"><div><span title="'+esc(g.name)+'">'+shorten(g.name,65)+'</span><small>'+g.count+' registros comparables</small></div>'+
 '<div class="ti42f-sector-tracks"><div class="ti42f-track"><i class="blue" style="width:'+cap(100*g.budget/max).toFixed(2)+'%"></i></div>'+
 '<div class="ti42f-track"><i class="green" style="width:'+cap(100*g.executed/max).toFixed(2)+'%"></i></div></div>'+
 '<strong>'+money(g.budget)+' / '+money(g.executed)+'</strong></div>').join('');
 set('[data-ti42f-sectors]',html||'<p class="ti42f-empty">No hay pares de costos válidos para desagregar por sector.</p>');
}
function refresh(){
 if(!loaded){text('[data-ti42f-status]',error?'No se pudo cargar el origen: '+error:'Cargando filas del Excel…');return;}
 filtered=results();visibleSourceCount=rows.filter(parent).length;renderCount++;
 if(!filtered.some(r=>Number(r.excelRow)===Number(state.selectedRow)))state.selectedRow=filtered[0]?.excelRow??null;
 selected=filtered.find(r=>Number(r.excelRow)===Number(state.selectedRow))||null;
 parentSummary();cards();drawChart();drawTable();drawDetail();drawCoverage();drawSectors();
 text('[data-ti42f-status]',filtered.length+' registros visibles de '+visibleSourceCount+' correspondientes a los filtros generales. '+(extraReady?'Campos financieros complementarios consultados.':'Consultando columnas complementarias…'));
 keep();
}
function syncControls(){
 q('[data-ti42f-query]').value=state.query;
 for(const k of ['quality','ratio','sort'])q('[data-ti42f-filter="'+k+'"]').value=state[k];
 q('[data-ti42f-size]').value=String(state.pageSize);
}
function goPage(delta){
 state.page=Math.max(1,Math.min(Math.max(1,Math.ceil(filtered.length/state.pageSize)),state.page+delta));
 state.selectedRow=filtered[(state.page-1)*state.pageSize]?.excelRow??null;state.detail='resumen';
 selected=filtered.find(r=>Number(r.excelRow)===Number(state.selectedRow))||null;
 drawTable();drawDetail();drawChart();keep();
}
function exportCSV(){
 const keys=[
  ['Fila Excel',r=>r.excelRow],['Ítem',r=>r.item],['Vigencia',r=>r.year],['Proyecto',r=>r.name],
  ['BPIN',r=>r.bpin],['Meta',r=>r.meta],['Sector MGA',r=>r.sectorMGA],['Vereda',r=>r.vereda],
  ['Contrato',r=>r.contract],['Estado contractual',r=>r.contractStatus],
  ['Costo total (COP)',r=>finite(r.budget)?r.budget:null],['Costo ejecutado (COP)',r=>finite(r.executedCost)?r.executedCost:null],
  ['Relación de costos calculada (%)',r=>rate(r)],['Avance financiero de origen (%)',r=>extra(r).financialPct],
  ['Avance financiero de gestión (%)',r=>r.managementPercent],['Disponibilidad de importes',r=>status(r).label],
  ['Observaciones',r=>r.observations]
 ];
 const csvCell=value=>{
  if(typeof value==='number'&&Number.isFinite(value))return '"'+String(value)+'"';
  const raw=String(value??'');const protectedValue=/^\s*[=+\-@\t\r]/.test(raw)?"'"+raw:raw;
  return '"'+protectedValue.replace(/"/g,'""')+'"';
 };
 const content='\uFEFF'+keys.map(([k])=>csvCell(k)).join(';')+'\r\n'+filtered.map(r=>keys.map(([k,f])=>csvCell(f(r))).join(';')).join('\r\n');
 const url=URL.createObjectURL(new Blob([content],{type:'text/csv;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download='unidad-cumplimiento-ejecucion-financiera-filtrada.csv';
 document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
panel.addEventListener('click',event=>{
 const choose=event.target.closest('[data-ti42f-select]');
 if(choose){state.selectedRow=Number(choose.dataset.ti42fSelect);selected=filtered.find(r=>Number(r.excelRow)===state.selectedRow)||null;state.detail='resumen';drawChart();drawTable();drawDetail();keep();return;}
 const detail=event.target.closest('[data-ti42f-detail]');
 if(detail){state.detail=detail.dataset.ti42fDetail;drawDetail();keep();return;}
 const chart=event.target.closest('[data-ti42f-chart-mode]');
 if(chart){state.chartMode=chart.dataset.ti42fChartMode;drawChart();keep();return;}
 if(event.target.closest('[data-ti42f-prev]')){goPage(-1);return;}
 if(event.target.closest('[data-ti42f-next]')){goPage(1);return;}
 if(event.target.closest('[data-ti42f-clear]')){state.quality='all';state.ratio='all';state.sort='file';state.query='';state.page=1;syncControls();refresh();return;}
 if(event.target.closest('[data-ti42f-export]')){exportCSV();return;}
 if(event.target.closest('[data-ti42f-project]')&&selected){projects.openProject?.(selected.excelRow,'ejecucion');return;}
});
panel.addEventListener('input',event=>{
 const input=event.target.closest('[data-ti42f-query]');if(!input)return;
 state.query=input.value;state.page=1;refresh();
});
panel.addEventListener('change',event=>{
 const select=event.target.closest('[data-ti42f-filter]');
 if(select){state[select.dataset.ti42fFilter]=select.value;state.page=1;refresh();return;}
 const size=event.target.closest('[data-ti42f-size]');
 if(size){state.pageSize=Number(size.value);state.page=1;refresh();}
});
syncControls();
summary.onChange(snapshot=>{
 rows=snapshot.rows||[];globalState=snapshot.state||{};loaded=!!snapshot.loaded;error=snapshot.error||null;
 if(!panel.hidden)refresh();
});
projects.onExtraChange?.(()=>{extraReady=true;if(!panel.hidden)refresh();});
function renderIfActive(){
 if(!panel.hidden&&!section.hidden)refresh();
}
window.TI42Financiera={
 renderIfActive,
 get state(){return {...state};},
 get loaded(){return loaded;},
 get filteredCount(){return filtered.length;},
 get globalCount(){return visibleSourceCount;},
 get selectedRow(){return selected?.excelRow??null;},
 get renderCount(){return renderCount;},
 get error(){return error;}
};
projects.setView?.(projects.state.view);
})();
