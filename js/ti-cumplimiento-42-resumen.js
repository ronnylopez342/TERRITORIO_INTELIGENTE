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
  const model=window.TI42ResumenModel;
  let selectedRow=null;
  let extras=new Map(),extraError=null;
  const summaryPages={projects:1,contracts:1};
  let records=[],mapInstance=null,filterCount=0,activeGroup=[],loadError=null,dataLoaded=false;
  const listeners=new Set();
  function notify(){
    for(const listener of listeners){
      try{listener({rows:records.slice(),state:{...state},selectedRow,loaded:dataLoaded,error:loadError?.message||null});}
      catch(e){console.error('No se pudo sincronizar la vista de Proyectos',e);}
    }
  }
  let state={meta:'101',year:'all',status:'all',sector:'all',q:''};
  try{const saved=JSON.parse(localStorage.getItem(storageKey)||'null');if(saved&&typeof saved==='object'){for(const k of Object.keys(state))if(typeof saved[k]==='string')state[k]=saved[k];}}catch{}
  const html=`
  <div class="ti42-frame">
    <header class="ti42-masthead"><div class="ti42-brand"><span aria-hidden="true">❧</span><div><b>ALCALDÍA DE SUBACHOQUE</b><small>Subachoque · Cundinamarca</small></div></div><div><h1>Unidad de Cumplimiento de Proyectos Estratégicos</h1><p>Plan de Desarrollo 2024–2027 · Seguimiento de proyectos</p></div><div class="ti42-panorama"><strong>Nuestro territorio,<br>nuestro futuro.</strong></div></header>
    <div class="ti42" aria-label="Resumen de proyectos estratégicos">
    <section class="ti42-toolbar" aria-label="Filtros generales">
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
      <div class="ti42-global-search"><label for="ti42-global-search">Buscar en todas las vistas</label><input id="ti42-global-search" data-ti42-filter="q" type="search" placeholder="Proyecto, BPIN, contrato…" autocomplete="off"></div>
      <button class="ti42-clear-all" data-ti42-clear-all type="button">Limpiar filtros generales</button>
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
      <button type="button" role="tab" aria-selected="false" data-ti42-view="indicadores" class="ti42-tab">Indicadores</button>
      <button type="button" role="tab" aria-selected="false" data-ti42-view="riesgos" class="ti42-tab">Riesgos</button>
      <button type="button" role="tab" aria-selected="false" data-ti42-view="documentos" class="ti42-tab">Documentos</button>
    </nav>
    <div data-ti42-resumen-content>
    <div class="ti42-summary-actions"><p>Lectura documental de la selección · porcentajes y costos con cobertura explícita</p><button type="button" data-ti42-export>Descargar resumen CSV</button></div>
    <section class="ti42-overview" aria-label="Información y seguimiento de la meta">
      <article class="ti42-card ti42-info"><h3>Información general de la meta</h3><div data-ti42-info></div></article>
      <div class="ti42-insights">
        <article class="ti42-card"><h3>Avance físico reportado</h3><div data-ti42-physical></div></article>
        <article class="ti42-card"><h3>Costos registrados (COP)</h3><div data-ti42-finance></div></article>
      </div>
      <article class="ti42-card ti42-map"><h3>Referencia territorial de los proyectos</h3>
        <div class="ti42-map-stage">
          <div data-ti-map data-ti-map-manual="1" data-ti42-map class="ti42-map-host" aria-label="Mapa completo de Subachoque con referencias de proyectos estratégicos"></div>
          <div class="ti42-project-legend" aria-label="Estados consignados para los proyectos">
            <span><i style="--pin-tone:#169b50"></i>Ejecutado</span>
            <span><i style="--pin-tone:#1976cf"></i>En ejecución</span>
            <span><i style="--pin-tone:#f2af1d"></i>Por iniciar</span>
            <span><i style="--pin-tone:#8996a3"></i>Sin estado</span>
          </div>
        </div>
      </article>
      <div class="ti42-schedules">
        <article class="ti42-card"><h3>Vigencias registradas</h3><div data-ti42-years></div></article>
        <article class="ti42-card"><h3>Fechas documentadas de proyectos</h3><div data-ti42-gantt></div></article>
      </div>
    </section>
    <section class="ti42-bottom-tables">
      <article class="ti42-card"><div class="ti42-card-head"><h3>Proyectos y registros asociados</h3><button type="button" data-ti42-open-view="proyectos">Ver todos en Proyectos</button><div class="ti42-search"><label for="ti42-search">Buscar</label><input id="ti42-search" data-ti42-filter="q" placeholder="Nombre, BPIN o contrato…" autocomplete="off"/></div></div>
        <div class="ti42-table-scroll" data-ti42-projects></div><p class="ti42-small" data-ti42-projects-count></p>
      </article>
      <article class="ti42-card"><div class="ti42-card-head"><h3>Contratos identificados</h3><button type="button" data-ti42-open-view="contratos">Abrir Contratos</button></div><div class="ti42-table-scroll" data-ti42-contracts></div><p class="ti42-small" data-ti42-contract-count></p></article>
    </section>
    <section class="ti42-foot-grid">
      <article class="ti42-card"><h3>Evidencias fotográficas</h3><div data-ti42-evidence></div></article>
      <article class="ti42-card"><h3>Riesgos y observaciones</h3><div data-ti42-risks></div></article>
      <article class="ti42-card"><h3>Lectura y límites de la información</h3><div data-ti42-analysis></div></article>
    </section>
    <footer class="ti42-footer">Fuente: <strong>UNIDAD DE CUMPLIMIENTO.xlsx</strong> · Hoja «Proyectos DEFINITIVO», encabezados de la fila 3. No se acredita fecha de actualización. Los recuentos corresponden a filas identificadas, no a ejecuciones certificadas.</footer>
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
    q('#ti42-search').value=state.q;q('#ti42-global-search').value=state.q;
  }
  function matches(r){return window.TI42Core.matches(r,state);}
  function numberKpi(value,label,detail,kind=''){
    return '<article class="ti42-kpi '+kind+'"><small>'+escape(label)+'</small><strong>'+escape(value)+'</strong><span>'+escape(detail)+'</span></article>';
  }
  const total=rs=>rs.reduce((sum,r)=>sum+r,0);
  function renderMetrics(rows){
    const computed=model.metrics(rows);
    const {physical,phys,pairs,base,spent,rate,budgets,executions,locations,contracts}=computed;
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
    return computed;
  }
  function renderGeneral(rows){
    const metaRows=state.meta==='all'?rows:records.filter(r=>r.meta===state.meta);
    const sample=metaRows.find(r=>r.metaTitle)||rows.find(r=>r.metaTitle)||rows[0];
    const metaTitle=state.meta==='all'?'Consulta de todas las metas y registros':state.meta==='none'?'Registros sin meta asignada':sample?.metaTitle||'Descripción de meta no registrada';
    setText('[data-ti42-meta-number]',state.meta==='all'?'TODAS':state.meta==='none'?'S/N':state.meta);
    setText('[data-ti42-meta-title]',metaTitle);
    const unique=(key)=>[...new Set(rows.map(r=>r[key]??extras.get(r.excelRow)?.[key]).filter(Boolean))];
    const allValues=key=>unique(key).join(' · ')||'Sin dato';
    const detail=(label,value)=>'<div class="ti42-info-line"><dt>'+escape(label)+'</dt><dd title="'+escape(value)+'">'+escape(value)+'</dd></div>';
    const vals=[
      detail('Meta consultada',state.meta==='all'?'Todas las metas':state.meta==='none'?'Sin registro':state.meta),
      detail('Descripción',metaTitle),
      detail('Códigos BPIN',unique('bpin').length===1?unique('bpin')[0]:unique('bpin').length?allValues('bpin'):'Sin código registrado'),
      detail('Línea estratégica',unique('strategicLine').length===1?unique('strategicLine')[0]:unique('strategicLine').length?allValues('strategicLine'):'Sin dato'),
      detail('Sector MGA',unique('sectorMGA').length===1?unique('sectorMGA')[0]:unique('sectorMGA').length?allValues('sectorMGA'):'Sin dato'),
      detail('Responsable técnico',unique('technicalResponsible').length===1?unique('technicalResponsible')[0]:unique('technicalResponsible').length?allValues('technicalResponsible'):'Sin dato'),
      detail('Programa del Plan de Desarrollo',allValues('program')),
      detail('Población objetivo registrada',allValues('population')),
      detail('Fase registrada',allValues('phase')),
      detail('Responsabilidad de ejecución',allValues('executionResponsibility')),
      detail('Vigencias',unique('year').sort().join(', ')||'Sin vigencia registrada'),
      detail('Indicador de producto / meta cuatrienal','Sin ficha de indicador ni objetivo numérico acreditados'),
      detail('Inicio documental más temprano',rows.filter(model.interval).length?date(rows.filter(model.interval).map(r=>r.start).sort()[0]):'Sin fecha válida'),
      detail('Final documental más tardío',rows.filter(model.interval).length?date(rows.filter(model.interval).map(r=>r.end).sort().at(-1)):'Sin fecha válida'),
      detail('Base',rows.length+' registros seleccionados')
    ];
    set('[data-ti42-info]',(extraError?'<p class="ti42-summary-warning">No fue posible consultar la fuente complementaria de programa y población. Vuelve a cargar la página.</p>':'')+'<dl class="ti42-info-list">'+vals.join('')+'</dl>');
  }
  function ring(value,title,note){
    const bounded=Number.isFinite(value)?Math.max(0,Math.min(100,value)):0;
    return '<div class="ti42-ring-row"><div class="ti42-ring" style="--fill:'+bounded.toFixed(2)+'%"><div><strong>'+pct(value)+'</strong><span>'+escape(title)+'</span></div></div><div class="ti42-ring-copy"><strong>'+escape(note)+'</strong><p>El dato representa únicamente registros con porcentaje válido. No certifica el cumplimiento total de la meta.</p></div></div>';
  }
  function renderPhysical(metrics){
    const labels=['100 % informado','Entre 0 y 100 %','0 % informado','Sin porcentaje válido'];
    const tones=['#07865e','#2388c5','#d6971d','#a7b6c6'];
    const distribution='<div class="ti42-distribution" role="img" aria-label="Distribución de avance físico: '+labels.map((v,i)=>v+': '+metrics.distribution[i]).join(', ')+'">'+metrics.distribution.map((n,i)=>n?'<span style="width:'+(n/activeGroup.length*100).toFixed(3)+'%;background:'+tones[i]+'"></span>':'').join('')+'</div><ul class="ti42-series-legend">'+labels.map((v,i)=>'<li><i style="background:'+tones[i]+'"></i>'+v+' <b>'+metrics.distribution[i]+'</b></li>').join('')+'</ul>';
    const comparison=(label,value,n,tone)=>'<div class="ti42-summary-series"><span>'+label+' <small>'+n+' registros con dato</small></span><strong>'+pct(value)+'</strong><div><i style="width:'+(Number.isFinite(value)?Math.min(100,Math.max(0,value)):0)+'%;background:'+tone+'"></i></div></div>';
    const rows=activeGroup.map(r=>'<li><button type="button" data-ti42-detail="'+r.excelRow+'">Ítem '+escape(r.item)+' · '+escape(r.name)+'</button><strong>'+pct(r.physicalPercent)+'</strong></li>').join('');
    set('[data-ti42-physical]',ring(metrics.phys,'Promedio físico',metrics.physical.length+' de '+activeGroup.length+' registros con avance informado')+distribution+
      comparison('Avance físico',metrics.phys,metrics.physical.length,'#07865e')+comparison('Gestión financiera',metrics.managementMean,metrics.management.length,'#2388c5')+
      '<p class="ti42-small">Escala de porcentajes: 0–100 %. Cada promedio usa su propia cobertura; gestión financiera no equivale a pagos ni a relación de costos.</p>'+
      (metrics.invalidPhysical?'<p class="ti42-summary-warning">'+metrics.invalidPhysical+' valores fuera de 0–100 % excluidos del promedio.</p>':'')+
      '<details><summary>Consultar los '+activeGroup.length+' registros y su avance</summary><ul class="ti42-summary-records">'+rows+'</ul></details>'+
      '<p class="ti42-small">Meta programada, unidades intervenidas y cumplimiento certificado: sin una ficha de indicador y mediciones compatibles. No se suman metros, viviendas y otras unidades.</p>');
  }
  function renderFinance(metrics){
    if(!metrics.pairs.length){
      set('[data-ti42-finance]','<p class="ti42-empty">Sin registros con costos total y ejecutado numéricos comparables.</p>');return;
    }
    const max=Math.max(metrics.base,metrics.spent,1);
    const bar=(label,v,tone)=>'<div class="ti42-finance-col"><span>'+money(v)+'</span><div class="ti42-finance-track"><i class="'+tone+'" style="height:'+Math.max(0,(v/max*100)).toFixed(2)+'%"></i></div><b>'+escape(label)+'</b></div>';
    set('[data-ti42-finance]','<p class="ti42-small">Escala común en COP · 0 a '+money(max)+'</p><div class="ti42-finance-bars">'+bar('Costo total comparable',metrics.base,'ti42-blue')+bar('Costo ejecutado comparable',metrics.spent,'ti42-green')+'</div><p class="ti42-summary-ratio"><strong>'+pct(metrics.rate)+'</strong> relación ejecutado / total</p><p class="ti42-small">Diferencia ejecutado − total: '+money(metrics.spent-metrics.base)+'. Comparación solo entre '+metrics.pairs.length+' de '+activeGroup.length+' filas con ambos importes válidos. Los indicadores superiores suman por separado todas las filas con valor.</p><p class="ti42-small">El costo ejecutado no equivale necesariamente a pagos. Apropiado, comprometido, obligado y pagado: sin desglose en el Excel.</p>'+ (metrics.excess.length?'<details class="ti42-summary-warning"><summary>'+metrics.excess.length+' registros con ejecutado superior al total</summary><p>Revisar adiciones y bases del costo antes de concluir sobrecostos.</p><ul>'+metrics.excess.map(r=>'<li><button type="button" data-ti42-detail="'+r.excelRow+'">Ítem '+escape(r.item)+' · '+escape(r.contract)+'</button>: '+money(r.executedCost-r.budget)+'</li>').join('')+'</ul></details>':''));
  }
  function renderYears(rows){
    const years=[...new Set(rows.map(r=>r.year).filter(Boolean))].sort();
    if(!years.length){set('[data-ti42-years]','<p class="ti42-empty">Sin vigencias declaradas en este conjunto.</p>');return;}
    set('[data-ti42-years]','<div class="ti42-year-dots">'+years.map(y=>'<div class="ti42-year"><span>'+escape(y)+'</span><i></i><small>'+rows.filter(r=>r.year===y).length+' filas</small></div>').join('')+'</div><p class="ti42-small">'+rows.filter(r=>!r.year).length+' filas sin vigencia. Vigencia administrativa del registro; no es un calendario de ejecución certificado.</p>');
  }
  function renderGantt(rows){
    const withDate=rows.filter(model.interval);
    if(!withDate.length){set('[data-ti42-gantt]','<p class="ti42-empty">No se registraron pares de fechas de inicio y finalización válidos.</p>');return;}
    const ordered=withDate.slice().sort((a,b)=>a.start.localeCompare(b.start));
    const values=withDate.flatMap(r=>[Date.parse(r.start+'T00:00:00Z'),Date.parse(r.end+'T00:00:00Z')]);
    const min=Math.min(...values),max=Math.max(...values),duration=Math.max(86400000,max-min);
    const rowMarkup=r=>{
      const start=(Date.parse(r.start+'T00:00:00Z')-min)/duration*100;
      const width=Math.max(.5,Math.min(100-start,(Date.parse(r.end+'T00:00:00Z')-Date.parse(r.start+'T00:00:00Z'))/duration*100));
      return '<div class="ti42-gantt-row"><button type="button" data-ti42-detail="'+r.excelRow+'">Ítem '+escape(r.item)+' · '+escape(r.name)+'<small>'+date(r.start)+' – '+date(r.end)+(r.sourceDateNotes?' · Fechas de proceso: revisar texto original':'')+'</small></button><div class="ti42-gantt-track" role="img" aria-label="Desde '+date(r.start)+' hasta '+date(r.end)+'"><i style="left:'+start.toFixed(2)+'%;width:'+width.toFixed(2)+'%"></i></div></div>';
    };
    set('[data-ti42-gantt]','<div class="ti42-gantt-years"><span>'+date(new Date(min).toISOString().slice(0,10))+'</span><span>'+date(new Date(max).toISOString().slice(0,10))+'</span></div>'+ordered.slice(0,5).map(rowMarkup).join('')+
      (ordered.length>5?'<details><summary>Ver los '+(ordered.length-5)+' intervalos adicionales</summary>'+ordered.slice(5).map(rowMarkup).join('')+'</details>':'')+
      '<p class="ti42-small">'+withDate.length+' de '+rows.length+' filas con pares válidos. No se infieren hitos de planeación, obra, seguimiento ni entrega. '+withDate.filter(r=>r.sourceDateNotes).length+' registros contienen fechas de proceso que requieren revisión; no acreditan ejecución de la obra.</p>');
  }
  function table(headers,rows,emptyMessage){
    if(!rows.length)return '<p class="ti42-empty">'+escape(emptyMessage)+'</p>';
    return '<table class="ti42-data-table"><thead><tr>'+headers.map(h=>'<th scope="col">'+escape(h)+'</th>').join('')+'</tr></thead><tbody>'+rows.join('')+'</tbody></table>';
  }
  function renderTables(rows,metrics){
    const pageSize=5;
    const range=(key,items)=>{summaryPages[key]=Math.min(summaryPages[key],Math.max(1,Math.ceil(items.length/pageSize)));return items.slice((summaryPages[key]-1)*pageSize,summaryPages[key]*pageSize);};
    const paging=(key,n)=>'<div class="ti42-summary-paging"><span>'+ (n?((summaryPages[key]-1)*pageSize+1)+'–'+Math.min(n,summaryPages[key]*pageSize):'0')+' de '+n+' registros</span><button type="button" data-ti42-page="'+key+'" data-step="-1" '+(summaryPages[key]===1?'disabled':'')+' aria-label="Página anterior de '+key+'">Anterior</button><button type="button" data-ti42-page="'+key+'" data-step="1" '+(summaryPages[key]*pageSize>=n?'disabled':'')+' aria-label="Página siguiente de '+key+'">Siguiente</button></div>';
    const projects=range('projects',rows).map(r=>'<tr><td><strong>'+escape(r.name)+'</strong><small>Excel · ítem '+escape(r.item||r.excelRow)+'</small></td><td>'+clean(r.bpin,'Sin BPIN')+'</td><td>'+clean(r.year,'—')+'</td><td>'+clean(r.vereda,'Sin ubicación')+'</td><td>'+clean(r.contractStatus,'Sin estado')+'</td><td>'+pct(r.physicalPercent)+'</td><td>'+pct(r.managementPercent)+'</td><td>'+money(r.budget)+'</td><td>'+clean(extras.get(r.excelRow)?.population,'Sin dato')+'</td><td><button type="button" data-ti42-detail="'+r.excelRow+'" aria-label="Detalle del registro '+r.excelRow+'">Ver</button></td></tr>');
    set('[data-ti42-projects]',table(['Proyecto / registro','BPIN','Vigencia','Vereda','Estado contractual','Avance físico','Gestión financiera','Costo total (COP)','Población objetivo','Detalle'],projects,'No hay registros para los filtros seleccionados.')+paging('projects',rows.length));
    setText('[data-ti42-projects-count]','Hay '+rows.length+' registros en la selección. Un nombre o BPIN repetido no certifica un proyecto único.');
    const contracts=range('contracts',metrics.contracts).map(r=>'<tr><td>'+escape(r.contract)+'</td><td>'+clean(r.contractor,'Sin dato')+'</td><td>'+money(r.budget)+'</td><td>'+clean(r.contractStatus,'Sin estado')+'</td><td>'+pct(r.physicalPercent)+'</td><td><button type="button" data-ti42-detail="'+r.excelRow+'">Ver</button></td></tr>');
    set('[data-ti42-contracts]',table(['Contrato consignado','Contratista','Costo total (COP)','Estado contractual','Avance físico','Detalle'],contracts,'No se identificaron contratos en los registros filtrados.')+paging('contracts',metrics.contracts.length));
    setText('[data-ti42-contract-count]',metrics.contracts.length+' filas con contrato. Una celda puede incluir varios identificadores y un contrato puede repetirse; no es un conteo de contratos únicos.');
  }
  function renderFoot(rows,metrics){
    const imgs=rows.filter(r=>[r.photoBefore,r.photoFollow,r.photoAfter].some(v=>validUrl(v)));
    const observations=rows.filter(r=>r.observations);
    set('[data-ti42-evidence]',imgs.length?'<p>Enlaces fotográficos en '+imgs.length+' registros.</p>'+imgs.map(r=>'<button class="ti42-evidence-button" type="button" data-ti42-detail="'+r.excelRow+'">'+escape(r.name)+' ↗</button>').join(''):'<div class="ti42-empty-visual"><span aria-hidden="true">▧</span><strong>Sin enlaces fotográficos registrados</strong><p>Las columnas de fotografías no contienen URL verificables para esta selección. No se sustituyen por imágenes ilustrativas.</p></div>');
    set('[data-ti42-risks]','<div class="ti42-observation"><strong>Riesgos clasificados: sin datos disponibles</strong><p>Las columnas de identificación, probabilidad, impacto y nivel de riesgo no traen información estructurada en el archivo.</p></div><strong class="ti42-subtitle">Observaciones: '+observations.length+' registros</strong>'+(observations.length?'<details><summary>Consultar todas las observaciones</summary><ul class="ti42-observations">'+observations.map(r=>'<li><button type="button" data-ti42-detail="'+r.excelRow+'">Ítem '+escape(r.item)+' · '+escape(r.name)+'</button><p>'+escape(r.observations)+'</p></li>').join('')+'</ul></details>':'<p class="ti42-small">No hay observaciones textuales en este conjunto.</p>'));
    const missing=rows.length-metrics.physical.length;
    const budgetMissing=rows.length-metrics.budgets.length;
    const mapMissing=rows.length-rows.filter(r=>r.vereda).length;
    set('[data-ti42-analysis]','<ul class="ti42-analysis-list"><li><strong>'+missing+'</strong> filas sin porcentaje físico válido.</li><li><strong>'+budgetMissing+'</strong> filas sin costo total numérico.</li><li><strong>'+mapMissing+'</strong> filas sin vereda identificada.</li><li><strong>'+rows.filter(r=>!r.year).length+'</strong> filas sin vigencia.</li></ul><p class="ti42-small">Los porcentajes se calculan solo a partir de campos válidos; «sin dato» no se reemplaza por cero. Los valores reflejan el archivo suministrado, no una certificación municipal.</p>');
  }
  function display(){
    summaryPages.projects=1;summaryPages.contracts=1;
    activeGroup=records.filter(matches);
    if(!activeGroup.some(r=>r.excelRow===selectedRow))selectedRow=activeGroup[0]?.excelRow||null;
    filterCount++;
    const metrics=renderMetrics(activeGroup);
    renderGeneral(activeGroup);
    renderPhysical(metrics);
    renderFinance(metrics);
    refreshProjectPins();
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
      ['Responsable técnico',r.technicalResponsible],['Programa',extras.get(r.excelRow)?.program],['Población objetivo (texto fuente)',extras.get(r.excelRow)?.population],['Observaciones',r.observations],['Fecha inicio original (proceso)',r.sourceDateNotes?.start],['Fecha final original (proceso)',r.sourceDateNotes?.end]
    ];
    setText('[data-ti42-detail-title]','Registro · '+(r.item||r.excelRow));
    set('[data-ti42-detail-body]','<dl class="ti42-detail-grid">'+pairs.map(([k,v])=>'<div><dt>'+escape(k)+'</dt><dd>'+clean(v)+'</dd></div>').join('')+'</dl>'+(validUrl(r.secopUrl)?'<a href="'+escape(validUrl(r.secopUrl))+'" target="_blank" rel="noopener noreferrer" class="ti42-external">Consultar enlace SECOP registrado ↗</a>':'')+[ ['Antes',r.photoBefore],['Seguimiento',r.photoFollow],['Después',r.photoAfter] ].filter(([,v])=>validUrl(v)).map(([label,v])=>'<a class="ti42-external" href="'+escape(validUrl(v))+'" target="_blank" rel="noopener noreferrer">Fotografías · '+label+' ↗</a>').join('')+'<p class="ti42-small">Fuente: Proyectos DEFINITIVO · fila '+r.excelRow+'. No equivale a validación contractual.</p>');
    const dialog=q('[data-ti42-dialog]');if(dialog&&!dialog.open)dialog.showModal();
  }
  mount.addEventListener('input',ev=>{const fld=ev.target.closest('[data-ti42-filter="q"]');if(fld){state.q=fld.value;mount.querySelectorAll('[data-ti42-filter="q"]').forEach(input=>{if(input!==fld)input.value=state.q;});display();}});
  mount.addEventListener('change',ev=>{const fld=ev.target.closest('[data-ti42-filter]');if(!fld||fld.dataset.ti42Filter==='q')return;state[fld.dataset.ti42Filter]=fld.value;display();});
  mount.addEventListener('click',ev=>{
    const page=ev.target.closest('[data-ti42-page]');if(page){summaryPages[page.dataset.ti42Page]+=Number(page.dataset.step);renderTables(activeGroup,model.metrics(activeGroup));return;}
    const openView=ev.target.closest('[data-ti42-open-view]');if(openView){q('[data-ti42-view="'+openView.dataset.ti42OpenView+'"]')?.click();return;}
    if(ev.target.closest('[data-ti42-export]')){
      const fields=['excelRow','item','name','bpin','meta','year','vereda','contract','contractStatus','physicalPercent','managementPercent','budget','executedCost','start','end','observations'];
      const labels=['Fila Excel','Ítem','Nombre','BPIN','Meta','Vigencia','Vereda','Contrato consignado','Estado contractual','Avance físico reportado (%)','Gestión financiera (%)','Costo total (COP)','Costo ejecutado (COP)','Inicio documental','Final documental','Observaciones'];
      const csv='\ufeff'+[labels,...activeGroup.map(r=>fields.map(k=>r[k]))].map(row=>row.map(model.csvCell).join(';')).join('\r\n');
      const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='resumen-unidad-cumplimiento.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return;
    }
    if(ev.target.closest('[data-ti42-clear-all]')){state={meta:'all',year:'all',status:'all',sector:'all',q:''};populateFilters();display();return;}
    const detailBtn=ev.target.closest('[data-ti42-detail]');if(detailBtn){detail(detailBtn.dataset.ti42Detail);return;}
    const close=ev.target.closest('[data-ti42-close]');if(close){q('[data-ti42-dialog]')?.close();return;}
  });
  // Pins de referencia por vereda: nunca presentan el centroide como coordenada real de obra.
  // La fuente distingue registros de proyectos de sus posibles ubicaciones documentales.
  const pinTones={ejecutado:'#169b50',ejecucion:'#1976cf',iniciar:'#f2af1d',desconocido:'#8996a3'};
  let projectPinLayer=null,projectPinGeometries=null,projectPinGeoPromise=null;
  const placeKey=v=>normal(v).replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
  function pinStatus(row){
    const status=normal(row.contractStatus||row.phase||'');
    if(/finalizad|terminad|ejecutad|liquidad|completad|entregad/.test(status))return 'ejecutado';
    if(/no se ha iniciado|sin iniciar|por iniciar|pendiente de inicio/.test(status))return 'iniciar';
    if(/en ejecucion|en desarrollo|en curso|iniciad|en obra/.test(status))return 'ejecucion';
    return 'desconocido';
  }
  function pointInRing(x,y,ring){
    let inside=false;
    for(let i=0,j=ring.length-1;i<ring.length;j=i++){
      const a=ring[i],b=ring[j];
      if((a[1]>y)!==(b[1]>y) && x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;
    }
    return inside;
  }
  function referenceAnchor(feature){
    const geometry=feature?.geometry;
    const polygons=geometry?.type==='Polygon'?[geometry.coordinates]:
      geometry?.type==='MultiPolygon'?geometry.coordinates:[];
    let best=null,bestScore=-1;
    for(const polygon of polygons){
      const outer=polygon[0];
      if(!Array.isArray(outer)||outer.length<4)continue;
      const xs=outer.map(p=>p[0]),ys=outer.map(p=>p[1]);
      const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
      for(let i=0;i<17;i++)for(let j=0;j<17;j++){
        const x=minX+(maxX-minX)*(i+.5)/17,y=minY+(maxY-minY)*(j+.5)/17;
        if(!pointInRing(x,y,outer)||polygon.slice(1).some(hole=>pointInRing(x,y,hole)))continue;
        const score=Math.min((x-minX)/(maxX-minX||1),(maxX-x)/(maxX-minX||1),
          (y-minY)/(maxY-minY||1),(maxY-y)/(maxY-minY||1));
        if(score>bestScore){bestScore=score;best=[y,x];}
      }
    }
    return best;
  }
  function pinGradient(rows){
    const counts=new Map();
    rows.forEach(r=>{const key=pinStatus(r);counts.set(key,(counts.get(key)||0)+1);});
    let at=0;const stops=[];
    for(const key of ['ejecutado','ejecucion','iniciar','desconocido']){
      const n=counts.get(key)||0;if(!n)continue;
      const next=at+n/rows.length*100;
      stops.push(pinTones[key]+' '+at.toFixed(2)+'% '+next.toFixed(2)+'%');
      at=next;
    }
    return 'conic-gradient('+stops.join(',')+')';
  }
  function renderProjectPins(){
    if(!mapInstance||!projectPinGeometries||!window.L)return;
    if(!projectPinLayer)projectPinLayer=window.L.layerGroup().addTo(mapInstance.map);
    projectPinLayer.clearLayers();
    const evidence=window.TITerritoryEvidence;
    if(!evidence?.matchPlaces)return;
    const features=new Map();
    for(const item of projectPinGeometries){
      for(const feature of item.features||[]){
        const key=item.kind==='casco'?'casco urbano':placeKey(window.TISubachoqueMap.featureName(feature));
        if(key&&!features.has(key))features.set(key,{feature,label:item.kind==='casco'?'Casco urbano':window.TISubachoqueMap.featureName(feature)});
      }
    }
    const groups=new Map();
    for(const row of activeGroup){
      const names=evidence.matchPlaces(row.vereda);
      // Si el Excel cita varios lugares o ninguno, no asignar un punto arbitrario.
      if(names.length!==1||!features.has(names[0]))continue;
      if(!groups.has(names[0]))groups.set(names[0],[]);
      groups.get(names[0]).push(row);
    }
    for(const [key,rows] of groups){
      const location=features.get(key),anchor=referenceAnchor(location.feature);
      if(!anchor)continue;
      const count=rows.length;
      const marker=window.L.marker(anchor,{
        title:count+' registro(s) de proyectos en '+location.label+' (referencia por vereda)',
        // Nombres de veredas sobre los pines si coinciden visualmente.
        zIndexOffset:-1200,
        keyboard:true,
        icon:window.L.divIcon({
          className:'ti42-pin-icon',
          html:'<span class="ti42-project-pin" style="background:'+pinGradient(rows)+'"><b>'+count+'</b></span>',
          iconSize:[36,36],iconAnchor:[18,18],popupAnchor:[0,-19]
        })
      });
      const cards=rows.map(row=>
        '<li><span class="ti42-pin-status" style="--pin-tone:'+pinTones[pinStatus(row)]+'"></span>'+
        '<div><strong>'+short(row.name,75)+'</strong><small>'+escape(row.contractStatus||row.phase||'Sin estado registrado')+'</small></div>'+
        '<button type="button" data-ti42-pin-detail="'+row.excelRow+'">Ver</button></li>'
      ).join('');
      marker.bindPopup(
        '<div class="ti42-pin-popup"><strong>'+escape(location.label)+' · '+count+' registro(s)</strong>'+
        '<small>Referencias documentales por vereda. El pin no representa el punto exacto de una obra.</small>'+
        '<ul>'+cards+'</ul></div>',{maxWidth:340,minWidth:220}
      );
      marker.on('popupopen',event=>{
        event.popup.getElement()?.querySelectorAll('[data-ti42-pin-detail]').forEach(button=>{
          button.addEventListener('click',ev=>{
            ev.preventDefault();ev.stopPropagation();
            detail(button.dataset.ti42PinDetail);
          });
        });
      });
      marker.addTo(projectPinLayer);
    }
  }
  function refreshProjectPins(){
    if(!mapInstance||!window.TISubachoqueMap)return;
    if(projectPinGeometries){renderProjectPins();return;}
    if(!projectPinGeoPromise){
      projectPinGeoPromise=Promise.all([
        window.TISubachoqueMap.getGeo('veredas'),
        window.TISubachoqueMap.getGeo('casco')
      ]).then(([veredas,casco])=>{
        projectPinGeometries=[{kind:'veredas',features:veredas.features},{kind:'casco',features:casco.features}];
        renderProjectPins();
      }).catch(err=>{projectPinGeoPromise=null;console.warn('No se pudieron cargar las referencias de los pines',err);});
    }
  }
  let mapStarted=false;
  function startMap(){
    const host=q('[data-ti42-map]');
    if(mapStarted||!host||root.hidden||!root.isConnected||!window.TISubachoqueMap)return;
    mapStarted=true;
    window.TISubachoqueMap.mount(host,{onSelect:()=>{}}).then(map=>{mapInstance=map;map?.invalidateSize();refreshProjectPins();}).catch(()=>{mapStarted=false;host.textContent='No fue posible cargar el mapa de referencia.';});
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
    try{
      const responseExtra=await fetch('data/uc42-proyectos-extra.b64.txt',{cache:'no-cache'});
      if(!responseExtra.ok)throw Error('Fuente complementaria no disponible');
      const bytes=Uint8Array.from(atob((await responseExtra.text()).trim()),c=>c.charCodeAt(0));
      const extra=JSON.parse(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text());
      if(extra.sourceSha256!==obj.sourceSha256||!Array.isArray(extra.fields)||!extra.fields.includes('excelRow')||!Array.isArray(extra.rows))throw Error('Fuente complementaria distinta del libro original');
      extras=new Map(extra.rows.map(row=>{const r=Object.fromEntries(extra.fields.map((k,i)=>[k,row[i]]));return [r.excelRow,r];}));
    }catch(error){extraError=error.message;console.warn('Resumen: no se pudo ampliar la información general',error);}
    return obj.rows.map(row=>window.TI42Core.prepare({...Object.fromEntries(obj.fields.map((field,i)=>[field,row[i]])),sourceDateNotes:obj.sourceNotes?.[row[0]]||null}));
  }
  getData().then(rows=>{records=rows;dataLoaded=true;populateFilters();display();startMap();}).catch(err=>{
    loadError=err;setText('[data-ti42-source]','No se pudo cargar el Excel de la Unidad de Cumplimiento: '+err.message+'. No se mostrarán cifras de ejemplo.');
    q('[data-ti42-kpis]').innerHTML='<div class="ti42-empty">Información no disponible. Comprueba la conexión y vuelve a cargar la página.</div>';
    q('#ti42-meta').disabled=true;notify();
  });
  window.TI42Summary={
    get state(){return {...state};},
    matches,
    get selectedRow(){return selectedRow;},
    selectRow(id){const row=records.find(r=>r.excelRow===Number(id)&&matches(r));if(!row)return false;if(selectedRow!==row.excelRow){selectedRow=row.excelRow;notify();}return true;},
    get filteredRows(){return records.filter(matches);},
    get totalRows(){return records.length;},
    get lastFilterCount(){return filterCount;},
    get error(){return loadError?.message||null;},
    get loaded(){return dataLoaded;},
    onChange(listener){
      if(typeof listener!=='function')return ()=>{};
      listeners.add(listener);
      listener({rows:records.slice(),state:{...state},selectedRow,loaded:dataLoaded,error:loadError?.message||null});
      return ()=>listeners.delete(listener);
    },
    setSearch(term){state.q=String(term||'');q('#ti42-search').value=state.q;q('#ti42-global-search').value=state.q;display();},
    setMeta(metaId,clearOtherFilters=false){const id=String(metaId||'');if(id!=='all'&&id!=='none'&&!records.some(r=>r.meta===id))return false;state.meta=id;q('#ti42-meta').value=id;if(clearOtherFilters){state.year='all';state.status='all';state.sector='all';state.q='';q('#ti42-year').value='all';q('#ti42-status').value='all';q('#ti42-sector').value='all';q('#ti42-search').value='';}display();return true;},
    refreshMap(){mapInstance?.invalidateSize();}
  };
})();
