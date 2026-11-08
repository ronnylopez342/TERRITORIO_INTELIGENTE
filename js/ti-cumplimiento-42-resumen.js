(function TI42Resumen(){
  'use strict';
  const root=document.querySelector('#cumplimiento-proyectos');
  if(!root)return;
  const mount=root.querySelector('[data-ti42-root]');
  if(!mount)return;
  const storageKey='ti:uc42:resumen:filters:v1';
  const fieldOrder=['excelRow','item','year','name','bpin','meta','metaTitle','strategicLine','sectorMGA','phase','vereda','start','end','contract','contractStatus','contractor','budget','executedCost','physicalPercent','managementPercent','technicalResponsible','observations','secopUrl','photoBefore','photoFollow','photoAfter'];
  const normal=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const escape=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=v=>Number.isFinite(v)?'$ '+new Intl.NumberFormat('es-CO',{maximumFractionDigits:0}).format(v):'Sin dato';
  const amount=v=>Number.isFinite(v)?new Intl.NumberFormat('es-CO',{maximumFractionDigits:1}).format(v):'—';
  const pct=v=>Number.isFinite(v)?new Intl.NumberFormat('es-CO',{maximumFractionDigits:1}).format(v)+' %':'—';
  const date=v=>{if(!v||!/^\d{4}-\d\d-\d\d$/.test(v))return 'Sin fecha';const [y,m,d]=v.split('-');return d+'/'+m+'/'+y;};
  const clean=(v,missing='Sin información registrada')=>v===null||v===undefined||v===''?missing:escape(v);
  const short=(v,max=85)=>{const str=String(v||'');return escape(str.length>max?str.slice(0,max-1).trimEnd()+'…':str);};
  const validUrl=s=>{try{const u=new URL(s);return u.protocol==='https:'&&u.hostname.length>3?u.href:null;}catch{return null;}};
  let records=[],mapInstance=null,filterCount=0,activeGroup=[],loadError=null,dataLoaded=false;
  const listeners=new Set();
  function notify(){
    for(const listener of listeners){
      try{listener({rows:records.slice(),state:{...state},loaded:dataLoaded,error:loadError?.message||null});}
      catch(e){console.error('No se pudo sincronizar la vista de Proyectos',e);}
    }
  }
  let state={meta:'101',year:'all',status:'all',sector:'all',q:''};
  try{const saved=JSON.parse(localStorage.getItem(storageKey)||'null');if(saved&&typeof saved==='object'){for(const k of Object.keys(state))if(typeof saved[k]==='string')state[k]=saved[k];}}catch{}
  const html=`
  <div class="ti42" aria-label="Resumen de proyectos estratégicos">
    <section class="ti42-toolbar">
      <div class="ti42-chooser">
        <label for="ti42-meta">Selecciona una meta del Plan de Desarrollo</label>
        <select id="ti42-meta" data-ti42-filter="meta" aria-label="Meta del Plan de Desarrollo"><option value="101">Cargando metas…</option></select>
      </div>
      <div class="ti42-current">
        <small>META SELECCIONADA</small>
        <div><strong data-ti42-meta-number>—</strong><span data-ti42-meta-title>Consultando los proyectos asociados…</span></div>
      </div>
      <div class="ti42-filter ti42-year"><label for="ti42-year">Vigencia</label><select id="ti42-year" data-ti42-filter="year"><option value="all">Todas</option></select></div>
      <div class="ti42-filter"><label for="ti42-status">Estado contractual registrado</label><select id="ti42-status" data-ti42-filter="status"><option value="all">Todos</option></select></div>
      <div class="ti42-filter"><label for="ti42-sector">Sector MGA</label><select id="ti42-sector" data-ti42-filter="sector"><option value="all">Todos</option></select></div>
    </section>
    <div class="ti42-source" role="status" aria-live="polite" data-ti42-source>Consultando el Excel de la Unidad de Cumplimiento…</div>
    <section class="ti42-kpis" aria-label="Indicadores del conjunto seleccionado" data-ti42-kpis></section>
    <nav class="ti42-tabs" aria-label="Vistas de proyectos estratégicos" role="tablist">
      <button type="button" role="tab" aria-selected="true" data-ti42-view="resumen" class="ti42-tab is-active">Resumen</button>
      <button type="button" role="tab" aria-selected="false" data-ti42-view="proyectos" class="ti42-tab">Proyectos</button>
      <button type="button" role="tab" aria-selected="false" data-ti42-view="contratos" class="ti42-tab">Contratos</button>
      <button type="button" role="tab" aria-selected="false" data-ti42-view="financiera" class="ti42-tab">Ejecución financiera</button>
      <button type="button" role="tab" aria-selected="false" data-ti42-view="cronograma" class="ti42-tab">Cronograma</button>
      <button type="button" role="tab" aria-selected="false" data-ti42-view="mapa" class="ti42-tab">Mapa</button>
      <button type="button" role="tab" aria-selected="false" data-ti42-view="evidencias" class="ti42-tab">Evidencias</button>
      <span class="ti42-tab is-pending" title="Pendiente de implementación">Indicadores</span>
      <span class="ti42-tab is-pending" title="Pendiente de implementación">Riesgos</span>
      <span class="ti42-tab is-pending" title="Pendiente de implementación">Documentos</span>
    </nav>
    <div data-ti42-resumen-content>
    <section class="ti42-overview" aria-label="Información y seguimiento de la meta">
      <article class="ti42-card ti42-info"><h3>Información general de la meta</h3><div data-ti42-info></div></article>
      <div class="ti42-insights">
        <article class="ti42-card"><h3>Avance físico reportado</h3><div data-ti42-physical></div></article>
        <article class="ti42-card"><h3>Costos registrados (COP)</h3><div data-ti42-finance></div></article>
      </div>
      <article class="ti42-card ti42-map"><h3>Referencia territorial de los proyectos</h3>
        <div class="ti42-map-stage"><div data-ti-map data-ti-map-manual="1" data-ti42-map class="ti42-map-host" aria-label="Mapa vectorial de Subachoque"></div></div>
        <p class="ti42-small">Cartografía local de referencia. Una vereda mencionada no representa la ubicación exacta de una obra.</p>
        <div data-ti42-place-list class="ti42-places"></div>
      </article>
      <div class="ti42-schedules">
        <article class="ti42-card"><h3>Vigencias registradas</h3><div data-ti42-years></div></article>
        <article class="ti42-card"><h3>Fechas documentadas de proyectos</h3><div data-ti42-gantt></div></article>
      </div>
    </section>
    <section class="ti42-bottom-tables">
      <article class="ti42-card"><div class="ti42-card-head"><h3>Proyectos y registros asociados</h3><div class="ti42-search"><label for="ti42-search">Buscar</label><input id="ti42-search" data-ti42-filter="q" placeholder="Nombre, BPIN o contrato…" autocomplete="off"/></div></div>
        <div class="ti42-table-scroll" data-ti42-projects></div><p class="ti42-small" data-ti42-projects-count></p>
      </article>
      <article class="ti42-card"><h3>Contratos identificados</h3><div class="ti42-table-scroll" data-ti42-contracts></div><p class="ti42-small" data-ti42-contract-count></p></article>
    </section>
    <section class="ti42-foot-grid">
      <article class="ti42-card"><h3>Evidencias fotográficas</h3><div data-ti42-evidence></div></article>
      <article class="ti42-card"><h3>Riesgos y observaciones</h3><div data-ti42-risks></div></article>
      <article class="ti42-card"><h3>Lectura y límites de la información</h3><div data-ti42-analysis></div></article>
    </section>
    <footer class="ti42-footer">Fuente: <strong>UNIDAD DE CUMPLIMIENTO(1).xlsx</strong> · Hoja «Proyectos DEFINITIVO», encabezados de la fila 3. No se acredita fecha de actualización. Los recuentos corresponden a filas identificadas, no a ejecuciones certificadas.</footer>
    </div>
    <dialog class="ti42-dialog" data-ti42-dialog aria-labelledby="ti42-detail-title"><header><h3 id="ti42-detail-title" data-ti42-detail-title>Detalle de registro</h3><button type="button" data-ti42-close aria-label="Cerrar detalle">×</button></header><div class="ti42-dialog-body" data-ti42-detail-body></div></dialog>
  </div>`;
  mount.innerHTML=html;
  const q=selector=>mount.querySelector(selector);
  const set=(selector,markup)=>{const el=q(selector);if(el)el.innerHTML=markup;};
  const setText=(selector,value)=>{const el=q(selector);if(el)el.textContent=value;};
  function optionList(values,selected,allLabel){
    return '<option value="all">'+escape(allLabel)+'</option>'+values.map(v=>'<option value="'+escape(v)+'"'+(selected===v?' selected':'')+'>'+escape(v==='none'?'Sin dato':v)+'</option>').join('');
  }
  function populateFilters(){
    const metas=[...new Set(records.map(r=>r.meta).filter(Boolean))].sort((a,b)=>Number(a)-Number(b));
    const years=[...new Set(records.map(r=>r.year).filter(Boolean))].sort();
    const statuses=[...new Set(records.map(r=>r.contractStatus).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
    const sectors=[...new Set(records.map(r=>r.sectorMGA).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
    const allowed=new Set(['all','none',...metas]);
    if(!allowed.has(state.meta))state.meta=metas.includes('101')?'101':(metas[0]||'all');
    if(!years.includes(state.year))state.year='all';
    if(!statuses.includes(state.status))state.status='all';
    if(!sectors.includes(state.sector))state.sector='all';
    q('#ti42-meta').innerHTML='<option value="all">Todas las metas y registros</option>'+metas.map(m=>'<option value="'+escape(m)+'">Meta '+escape(m)+' · '+records.filter(r=>r.meta===m).length+' registros</option>').join('')+'<option value="none">Sin meta registrada · '+records.filter(r=>!r.meta).length+'</option>';
    q('#ti42-meta').value=state.meta;
    q('#ti42-year').innerHTML=optionList([...years,...(records.some(r=>!r.year)?['none']:[])],state.year,'Todas las vigencias');
    q('#ti42-year').value=state.year;
    q('#ti42-status').innerHTML=optionList([...statuses,...(records.some(r=>!r.contractStatus)?['none']:[])],state.status,'Todos los estados');
    q('#ti42-status').value=state.status;
    q('#ti42-sector').innerHTML=optionList([...sectors,...(records.some(r=>!r.sectorMGA)?['none']:[])],state.sector,'Todos los sectores');
    q('#ti42-sector').value=state.sector;
    q('#ti42-search').value=state.q;
  }
  function matches(r){
    if(state.meta!=='all' && (state.meta==='none'?!!r.meta:r.meta!==state.meta))return false;
    if(state.year!=='all' && (state.year==='none'?!!r.year:r.year!==state.year))return false;
    if(state.status!=='all' && (state.status==='none'?!!r.contractStatus:r.contractStatus!==state.status))return false;
    if(state.sector!=='all' && (state.sector==='none'?!!r.sectorMGA:r.sectorMGA!==state.sector))return false;
    if(state.q&&!normal([r.name,r.bpin,r.contract,r.vereda,r.sectorMGA,r.phase,r.item].join(' ')).includes(normal(state.q)))return false;
    return true;
  }
  function numberKpi(value,label,detail,kind=''){
    return '<article class="ti42-kpi '+kind+'"><small>'+escape(label)+'</small><strong>'+escape(value)+'</strong><span>'+escape(detail)+'</span></article>';
  }
  const total=rs=>rs.reduce((sum,r)=>sum+r,0);
  function renderMetrics(rows){
    const physical=rows.filter(r=>Number.isFinite(r.physicalPercent));
    const phys=physical.length?total(physical.map(r=>r.physicalPercent))/physical.length:null;
    const pairs=rows.filter(r=>Number.isFinite(r.budget)&&r.budget>0&&Number.isFinite(r.executedCost));
    const base=total(pairs.map(r=>r.budget));
    const spent=total(pairs.map(r=>r.executedCost));
    const rate=base>0?spent/base*100:null;
    const budgets=rows.filter(r=>Number.isFinite(r.budget));
    const executions=rows.filter(r=>Number.isFinite(r.executedCost));
    const locations=[...new Set(rows.map(r=>r.vereda).filter(Boolean))];
    const contracts=rows.filter(r=>r.contract);
    const metrics=[
      numberKpi(String(rows.length),'Registros asociados','Filas del Excel, no proyectos únicos'),
      numberKpi(pct(phys),'Avance físico informado','Promedio de '+physical.length+' con dato'),
      numberKpi(pct(rate),'Relación de costos','Sobre '+pairs.length+' pares válidos'),
      numberKpi(budgets.length?money(total(budgets.map(r=>r.budget))):'Sin dato','Costo total consignado',budgets.length+' filas con valor'),
      numberKpi(executions.length?money(total(executions.map(r=>r.executedCost))):'Sin dato','Costo ejecutado consignado',executions.length+' filas con valor'),
      numberKpi(String(contracts.length),'Registros con contrato','No implica contratos distintos'),
      numberKpi(String(locations.length),'Veredas mencionadas',rows.filter(r=>r.vereda).length+' registros con ubicación'),
      numberKpi(String(rows.filter(r=>r.contractStatus).length),'Con estado contractual','Estado textual del Excel')
    ];
    set('[data-ti42-kpis]',metrics.join(''));
    return {phys,physical,rate,pairs,base,spent,budgets,executions,contracts,locations};
  }
  function renderGeneral(rows){
    const metaRows=state.meta==='all'?rows:records.filter(r=>r.meta===state.meta);
    const sample=metaRows.find(r=>r.metaTitle)||rows.find(r=>r.metaTitle)||rows[0];
    const metaTitle=state.meta==='all'?'Consulta de todas las metas y registros':state.meta==='none'?'Registros sin meta asignada':sample?.metaTitle||'Descripción de meta no registrada';
    setText('[data-ti42-meta-number]',state.meta==='all'?'TODAS':state.meta==='none'?'S/N':state.meta);
    setText('[data-ti42-meta-title]',metaTitle);
    const unique=(key)=>[...new Set(rows.map(r=>r[key]).filter(Boolean))];
    const detail=(label,value)=>'<div class="ti42-info-line"><dt>'+escape(label)+'</dt><dd title="'+escape(value)+'">'+escape(value)+'</dd></div>';
    const vals=[
      detail('Meta consultada',state.meta==='all'?'Todas las metas':state.meta==='none'?'Sin registro':state.meta),
      detail('Descripción',metaTitle),
      detail('Códigos BPIN',unique('bpin').length===1?unique('bpin')[0]:unique('bpin').length?unique('bpin').length+' códigos identificados':'Sin código registrado'),
      detail('Línea estratégica',unique('strategicLine').length===1?unique('strategicLine')[0]:unique('strategicLine').length?unique('strategicLine').length+' líneas identificadas':'Sin dato'),
      detail('Sector MGA',unique('sectorMGA').length===1?unique('sectorMGA')[0]:unique('sectorMGA').length?unique('sectorMGA').length+' sectores identificados':'Sin dato'),
      detail('Responsable técnico',unique('technicalResponsible').length===1?unique('technicalResponsible')[0]:unique('technicalResponsible').length?unique('technicalResponsible').length+' responsables identificados':'Sin dato'),
      detail('Vigencias',unique('year').sort().join(', ')||'Sin vigencia registrada'),
      detail('Base',rows.length+' registros seleccionados')
    ];
    set('[data-ti42-info]','<dl class="ti42-info-list">'+vals.join('')+'</dl>');
  }
  function ring(value,title,note){
    const bounded=Number.isFinite(value)?Math.max(0,Math.min(100,value)):0;
    return '<div class="ti42-ring-row"><div class="ti42-ring" style="--fill:'+bounded.toFixed(2)+'%"><div><strong>'+pct(value)+'</strong><span>'+escape(title)+'</span></div></div><div class="ti42-ring-copy"><strong>'+escape(note)+'</strong><p>El dato representa únicamente registros con porcentaje válido. No certifica el cumplimiento total de la meta.</p></div></div>';
  }
  function renderPhysical(metrics){
    set('[data-ti42-physical]',ring(metrics.phys,'Promedio físico',metrics.physical.length+' de '+activeGroup.length+' registros con avance informado'));
  }
  function renderFinance(metrics){
    if(!metrics.pairs.length){
      set('[data-ti42-finance]','<p class="ti42-empty">Sin registros con costos total y ejecutado numéricos comparables.</p>');return;
    }
    const max=Math.max(metrics.base,metrics.spent,1);
    const bar=(label,v,tone)=>'<div class="ti42-finance-col"><span>'+money(v)+'</span><div class="ti42-finance-track"><i class="'+tone+'" style="height:'+Math.max(1,(v/max*100)).toFixed(2)+'%"></i></div><b>'+escape(label)+'</b></div>';
    set('[data-ti42-finance]','<div class="ti42-finance-bars">'+bar('Costo total',metrics.base,'ti42-blue')+bar('Costo ejecutado',metrics.spent,'ti42-green')+'</div><p class="ti42-small">Comparación solo entre '+metrics.pairs.length+' filas con ambos importes. El costo ejecutado no equivale necesariamente a pagos.</p>');
  }
  function renderPlaces(rows,metrics){
    const links=metrics.locations.slice(0,9).map(v=>'<button type="button" data-ti42-vereda="'+escape(v)+'">'+escape(v)+'</button>').join('');
    set('[data-ti42-place-list]',links||'<p class="ti42-empty">Sin veredas identificables para el filtro actual.</p>');
  }
  function renderYears(rows){
    const years=[...new Set(rows.map(r=>r.year).filter(Boolean))].sort();
    if(!years.length){set('[data-ti42-years]','<p class="ti42-empty">Sin vigencias declaradas en este conjunto.</p>');return;}
    set('[data-ti42-years]','<div class="ti42-year-dots">'+years.map(y=>'<div class="ti42-year"><span>'+escape(y)+'</span><i></i><small>'+rows.filter(r=>r.year===y).length+' filas</small></div>').join('')+'</div><p class="ti42-small">Vigencia del registro; no es un calendario de ejecución certificado.</p>');
  }
  function renderGantt(rows){
    const withDate=rows.filter(r=>/^\d{4}-\d\d-\d\d$/.test(r.start||'')&&/^\d{4}-\d\d-\d\d$/.test(r.end||'')&&r.end>=r.start);
    if(!withDate.length){set('[data-ti42-gantt]','<p class="ti42-empty">No se registraron pares de fechas de inicio y finalización válidos.</p>');return;}
    const ordered=withDate.slice().sort((a,b)=>a.start.localeCompare(b.start)).slice(0,5);
    const values=withDate.flatMap(r=>[Date.parse(r.start+'T00:00:00Z'),Date.parse(r.end+'T00:00:00Z')]);
    const min=Math.min(...values),max=Math.max(...values);
    const duration=Math.max(86400000,max-min);
    const content=ordered.map(r=>{
      const start=Math.max(0,Math.min(100,(Date.parse(r.start+'T00:00:00Z')-min)/duration*100));
      const width=Math.max(2,Math.min(100-start,(Date.parse(r.end+'T00:00:00Z')-Date.parse(r.start+'T00:00:00Z'))/duration*100));
      return '<div class="ti42-gantt-row"><span title="'+escape(r.name)+'">'+short(r.name,35)+'</span><div class="ti42-gantt-track"><i style="left:'+start.toFixed(2)+'%;width:'+width.toFixed(2)+'%"></i></div></div>';
    }).join('');
    set('[data-ti42-gantt]','<div class="ti42-gantt-years"><span>'+new Date(min).getUTCFullYear()+'</span><span>'+new Date(max).getUTCFullYear()+'</span></div>'+content+'<p class="ti42-small">Fechas registradas de inicio y finalización; '+withDate.length+' filas con ambos campos válidos.</p>');
  }
  function table(headers,rows,emptyMessage){
    if(!rows.length)return '<p class="ti42-empty">'+escape(emptyMessage)+'</p>';
    return '<table class="ti42-data-table"><thead><tr>'+headers.map(h=>'<th scope="col">'+escape(h)+'</th>').join('')+'</tr></thead><tbody>'+rows.join('')+'</tbody></table>';
  }
  function renderTables(rows,metrics){
    const projects=rows.map(r=>'<tr><td title="'+escape(r.name)+'"><strong>'+short(r.name,74)+'</strong><small>Excel · ítem '+escape(r.item||r.excelRow)+'</small></td><td>'+clean(r.year,'—')+'</td><td>'+clean(r.vereda,'Sin ubicación')+'</td><td>'+ (Number.isFinite(r.physicalPercent)?pct(r.physicalPercent):'No informado')+'</td><td><button type="button" data-ti42-detail="'+r.excelRow+'" aria-label="Detalle del registro '+r.excelRow+'">Ver</button></td></tr>');
    set('[data-ti42-projects]',table(['Proyecto / registro','Vigencia','Vereda','Avance físico','Detalle'],projects,'No hay registros para los filtros seleccionados.'));
    setText('[data-ti42-projects-count]','Mostrando '+rows.length+' de '+rows.length+' registros. Desplázate dentro de la tabla para consultar todos.');
    const contracts=metrics.contracts.map(r=>'<tr><td>'+short(r.contract,32)+'</td><td>'+short(r.contractor||'Sin dato',39)+'</td><td>'+ (Number.isFinite(r.budget)?money(r.budget):'Sin dato')+'</td><td><button type="button" data-ti42-detail="'+r.excelRow+'">Ver</button></td></tr>');
    set('[data-ti42-contracts]',table(['Contrato','Contratista','Costo total','Detalle'],contracts,'No se identificaron contratos en los registros filtrados.'));
    setText('[data-ti42-contract-count]','Mostrando '+metrics.contracts.length+' de '+metrics.contracts.length+' filas con contrato. Desplázate dentro de la tabla para consultar todos.');
  }
  function renderFoot(rows,metrics){
    const imgs=rows.filter(r=>[r.photoBefore,r.photoFollow,r.photoAfter].some(v=>validUrl(v)));
    const observations=rows.filter(r=>r.observations);
    set('[data-ti42-evidence]',imgs.length?'<p>Enlaces fotográficos en '+imgs.length+' registros.</p>'+imgs.slice(0,4).map(r=>'<button class="ti42-evidence-button" type="button" data-ti42-detail="'+r.excelRow+'">'+short(r.name,68)+' ↗</button>').join(''):'<div class="ti42-empty-visual"><span aria-hidden="true">▧</span><strong>Sin enlaces fotográficos registrados</strong><p>Las columnas de fotografías no contienen URL verificables para esta selección. No se sustituyen por imágenes ilustrativas.</p></div>');
    set('[data-ti42-risks]','<div class="ti42-observation"><strong>Riesgos clasificados: sin datos disponibles</strong><p>Las columnas de identificación, probabilidad, impacto y nivel de riesgo no traen información estructurada en el archivo.</p></div><strong class="ti42-subtitle">Observaciones: '+observations.length+' registros</strong>'+(observations.length?'<ul class="ti42-observations">'+observations.slice(0,3).map(r=>'<li>'+short(r.observations,170)+'</li>').join('')+'</ul>':'<p class="ti42-small">No hay observaciones textuales en este conjunto.</p>'));
    const missing=rows.length-metrics.physical.length;
    const budgetMissing=rows.length-metrics.budgets.length;
    const mapMissing=rows.length-rows.filter(r=>r.vereda).length;
    set('[data-ti42-analysis]','<ul class="ti42-analysis-list"><li><strong>'+missing+'</strong> filas sin porcentaje físico numérico.</li><li><strong>'+budgetMissing+'</strong> filas sin costo total numérico.</li><li><strong>'+mapMissing+'</strong> filas sin vereda identificada.</li><li><strong>'+rows.filter(r=>!r.year).length+'</strong> filas sin vigencia.</li></ul><p class="ti42-small">Los porcentajes se calculan solo a partir de campos válidos; «sin dato» no se reemplaza por cero. Los valores reflejan el archivo suministrado, no una certificación municipal.</p>');
  }
  function display(){
    activeGroup=records.filter(matches);
    filterCount++;
    const metrics=renderMetrics(activeGroup);
    renderGeneral(activeGroup);
    renderPhysical(metrics);
    renderFinance(metrics);
    renderPlaces(activeGroup,metrics);
    renderYears(activeGroup);
    renderGantt(activeGroup);
    renderTables(activeGroup,metrics);
    renderFoot(activeGroup,metrics);
    setText('[data-ti42-source]',activeGroup.length+' registros visibles de '+records.length+' filas con nombre en el Excel. '+records.filter(r=>!r.meta).length+' sin número de meta. Los filtros afectan todos los paneles.');
    try{localStorage.setItem(storageKey,JSON.stringify(state));}catch{}
    notify();
  }
  function detail(rowNo){
    const r=records.find(v=>v.excelRow===Number(rowNo));if(!r)return;
    const pairs=[
      ['Fila del archivo / ítem',String(r.excelRow)+' / '+String(r.item||'No indicado')],
      ['Nombre del proyecto',r.name],['Vigencia',r.year],['Meta',r.meta],['Descripción de meta',r.metaTitle],
      ['BPIN',r.bpin],['Línea estratégica',r.strategicLine],['Sector MGA',r.sectorMGA],['Fase',r.phase],
      ['Vereda',r.vereda],['Fecha inicio',r.start?date(r.start):null],['Fecha final',r.end?date(r.end):null],
      ['Contrato',r.contract],['Estado contractual',r.contractStatus],['Contratista',r.contractor],
      ['Costo total',Number.isFinite(r.budget)?money(r.budget):null],
      ['Costo ejecutado registrado',Number.isFinite(r.executedCost)?money(r.executedCost):null],
      ['Avance físico reportado',Number.isFinite(r.physicalPercent)?pct(r.physicalPercent):null],
      ['Avance financiero de gestión',Number.isFinite(r.managementPercent)?pct(r.managementPercent):null],
      ['Responsable técnico',r.technicalResponsible],['Observaciones',r.observations]
    ];
    setText('[data-ti42-detail-title]','Registro · '+(r.item||r.excelRow));
    set('[data-ti42-detail-body]','<dl class="ti42-detail-grid">'+pairs.map(([k,v])=>'<div><dt>'+escape(k)+'</dt><dd>'+clean(v)+'</dd></div>').join('')+'</dl>'+(validUrl(r.secopUrl)?'<a href="'+escape(validUrl(r.secopUrl))+'" target="_blank" rel="noopener noreferrer" class="ti42-external">Consultar enlace SECOP registrado ↗</a>':'')+'<p class="ti42-small">Fuente: Proyectos DEFINITIVO · fila '+r.excelRow+'. No equivale a validación contractual.</p>');
    const dialog=q('[data-ti42-dialog]');if(dialog&&!dialog.open)dialog.showModal();
  }
  mount.addEventListener('input',ev=>{const fld=ev.target.closest('[data-ti42-filter="q"]');if(fld){state.q=fld.value;display();}});
  mount.addEventListener('change',ev=>{const fld=ev.target.closest('[data-ti42-filter]');if(!fld||fld.dataset.ti42Filter==='q')return;state[fld.dataset.ti42Filter]=fld.value;display();});
  mount.addEventListener('click',ev=>{
    const detailBtn=ev.target.closest('[data-ti42-detail]');if(detailBtn){detail(detailBtn.dataset.ti42Detail);return;}
    const close=ev.target.closest('[data-ti42-close]');if(close){q('[data-ti42-dialog]')?.close();return;}
    const place=ev.target.closest('[data-ti42-vereda]');if(place&&mapInstance)mapInstance.focus(place.dataset.ti42Vereda,true);
  });
  let mapStarted=false;
  function startMap(){
    const host=q('[data-ti42-map]');
    if(mapStarted||!host||root.hidden||!root.isConnected||!window.TISubachoqueMap)return;
    mapStarted=true;
    window.TISubachoqueMap.mount(host,{onSelect:()=>{}}).then(map=>{mapInstance=map;map?.invalidateSize();}).catch(()=>{mapStarted=false;host.textContent='No fue posible cargar el mapa de referencia.';});
  }
  const observer=new MutationObserver(()=>{if(!root.hidden){requestAnimationFrame(startMap);}});
  observer.observe(root,{attributes:true,attributeFilter:['hidden']});
  document.addEventListener('click',()=>{if(!root.hidden)requestAnimationFrame(startMap);});
  async function getData(){
    const response=await fetch('data/uc42-summary.gz.b64.txt?v=20261108-resumen-v1',{cache:'no-cache'});
    if(!response.ok)throw Error('No se pudo obtener el archivo de datos');
    if(typeof DecompressionStream!=='function')throw Error('Este navegador no admite lectura de datos comprimidos');
    const encoded=(await response.text()).trim();
    const binary=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
    const plain=await new Response(new Blob([binary]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
    const obj=JSON.parse(plain);
    if(obj.schema!==1||obj.sheet!=='Proyectos DEFINITIVO'||!Array.isArray(obj.rows)||!Array.isArray(obj.fields)||obj.fields.join('|')!==fieldOrder.join('|')||!obj.rows.every(row=>Array.isArray(row)&&row.length===fieldOrder.length))throw Error('Archivo de datos no cumple el esquema esperado');
    return obj.rows.map(row=>Object.fromEntries(obj.fields.map((field,i)=>[field,row[i]])));
  }
  getData().then(rows=>{records=rows;dataLoaded=true;populateFilters();display();startMap();}).catch(err=>{
    loadError=err;setText('[data-ti42-source]','No se pudo cargar el Excel de la Unidad de Cumplimiento: '+err.message+'. No se mostrarán cifras de ejemplo.');
    q('[data-ti42-kpis]').innerHTML='<div class="ti42-empty">Información no disponible. Comprueba la conexión y vuelve a cargar la página.</div>';
    q('#ti42-meta').disabled=true;notify();
  });
  window.TI42Summary={
    get state(){return {...state};},
    get totalRows(){return records.length;},
    get lastFilterCount(){return filterCount;},
    get error(){return loadError?.message||null;},
    get loaded(){return dataLoaded;},
    onChange(listener){
      if(typeof listener!=='function')return ()=>{};
      listeners.add(listener);
      listener({rows:records.slice(),state:{...state},loaded:dataLoaded,error:loadError?.message||null});
      return ()=>listeners.delete(listener);
    },
    setSearch(term){state.q=String(term||'');q('#ti42-search').value=state.q;display();},
    refreshMap(){mapInstance?.invalidateSize();}
  };
})();
