(function TI42Proyectos(){
'use strict';
const section=document.querySelector('#cumplimiento-proyectos');
const host=section?.querySelector('[data-ti42-root]');
const shell=host?.querySelector('.ti42');
const tabs=shell?.querySelector('.ti42-tabs');
const summary=shell?.querySelector('[data-ti42-resumen-content]');
const api=window.TI42Summary;
if(!section||!host||!shell||!tabs||!summary||!api?.onChange)return;
const STORE='ti:uc42:proyectos:v1';
const safe=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const normalize=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const money=v=>Number.isFinite(v)?'$ '+new Intl.NumberFormat('es-CO',{maximumFractionDigits:0}).format(v):'Sin dato';
const number=v=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:0}).format(v);
const percent=v=>Number.isFinite(v)?new Intl.NumberFormat('es-CO',{maximumFractionDigits:1}).format(v)+' %':'Sin dato';
const known=v=>v!==null&&v!==undefined&&String(v).trim()!==''?safe(v):'<span class="ti42p-not-available">Sin dato en el Excel</span>';
const brief=(v,n=58)=>{const s=String(v||'').replace(/\s+/g,' ').trim();return safe(s.length>n?s.slice(0,n-1).trimEnd()+'…':s);};
const validUrl=v=>{try{const u=new URL(String(v||''));return u.protocol==='https:'&&u.hostname.length>3?u.href:null;}catch{return null;}};
const yesNoCount=(rows,key)=>rows.filter(r=>r[key]!==null&&r[key]!==undefined&&r[key]!=='').length;
const dd=(k,v)=>'<div class="ti42p-fact"><dt>'+safe(k)+'</dt><dd>'+known(v)+'</dd></div>';
const statusClass=value=>{
 const s=normalize(value);
 if(s.includes('en ejecucion')||s.includes('liquidado'))return 'good';
 if(s.includes('no se ha iniciado')||s.includes('suspendido'))return 'caution';
 if(s.includes('firmado')||s.includes('adjudicado'))return 'info';
 return 'neutral';
};
const pill=v=>v?'<span class="ti42p-status '+statusClass(v)+'"><i></i>'+safe(v)+'</span>':'<span class="ti42p-status neutral">No registrado</span>';
const bar=(v,color='green')=>{
 if(!Number.isFinite(v))return '<span class="ti42p-unknown">Sin porcentaje registrado</span>';
 const width=Math.min(100,Math.max(0,v));
 return '<div class="ti42p-bar-line"><div class="ti42p-track"><i class="'+color+'" style="width:'+width.toFixed(2)+'%"></i></div><strong>'+percent(v)+'</strong></div>'+(v<0||v>100?'<small class="ti42p-warning">Porcentaje fuera de 0–100 en la fuente: revisar registro.</small>':'');
};
let state={view:'resumen',vereda:'all',phase:'all',sort:'file',page:1,pageSize:10,selectedRow:null,detailTab:'informacion'};
try{
 const previous=JSON.parse(localStorage.getItem(STORE)||'null');
 if(previous&&typeof previous==='object'){
   for(const key of ['view','vereda','phase','sort','page','pageSize','selectedRow','detailTab'])if(Object.prototype.hasOwnProperty.call(previous,key))state[key]=previous[key];
 }
}catch{}
if(!['resumen','proyectos','contratos','financiera','cronograma','mapa','evidencias','indicadores','riesgos'].includes(state.view))state.view='resumen';
if(!['file','name','year','budget'].includes(state.sort))state.sort='file';
if(!['informacion','localizacion','contratos','ejecucion','evidencias','indicadores'].includes(state.detailTab))state.detailTab='informacion';
state.pageSize=[10,20,50].includes(Number(state.pageSize))?Number(state.pageSize):10;
state.page=Math.max(1,Number(state.page)||1);
let source=[],shared={},ready=false,error=null,filtered=[],selected=null,projectMap=null,mapMounted=false,loadCount=0;
let extras=new Map(),extraStatus='Cargando campos complementarios del Excel…',extraReady=false;const extraListeners=new Set();
const extraFor=r=>extras.get(Number(r?.excelRow))||{};
const extraFieldOrder=['excelRow','description','program','population','zone','address','coordStart','coordEnd','executionResponsibility','sourceDocuments','scope','selectionMethod','contractTerm','financialPct','physicalUnit','paymentStatus','riskAnnex'];
const panel=document.createElement('section');
panel.dataset.ti42ProyectosRoot='1';panel.className='ti42p';panel.hidden=true;
panel.setAttribute('aria-label','Listado y fichas de proyectos');
panel.innerHTML=`
 <header class="ti42p-intro">
   <div><span class="ti42p-eyebrow">UNIDAD DE CUMPLIMIENTO · PROYECTOS ESTRATÉGICOS</span>
     <h2>Proyectos <span data-ti42p-heading-count>(…)</span></h2>
     <p>Consulta cada registro y sus datos documentados. Una fila del Excel no equivale necesariamente a un proyecto único ni acredita su ejecución.</p>
   </div>
   <button type="button" class="ti42p-export" data-ti42p-export aria-label="Descargar los proyectos filtrados en CSV">↧ Exportar registros</button>
 </header>
 <div class="ti42p-refine">
   <div class="ti42p-search"><label for="ti42p-search">Buscar proyecto, BPIN o contrato</label><div><span aria-hidden="true">⌕</span><input id="ti42p-search" data-ti42p-search type="search" placeholder="Nombre del proyecto, BPIN, sector…" autocomplete="off"></div></div>
   <div><label for="ti42p-vereda">Vereda o barrio</label><select id="ti42p-vereda" data-ti42p-filter="vereda"><option value="all">Todas</option></select></div>
   <div><label for="ti42p-phase">Fase registrada</label><select id="ti42p-phase" data-ti42p-filter="phase"><option value="all">Todas</option></select></div>
   <div><label for="ti42p-sort">Ordenar por</label><select id="ti42p-sort" data-ti42p-filter="sort">
     <option value="file">Orden del Excel</option><option value="name">Nombre A–Z</option><option value="year">Vigencia más reciente</option><option value="budget">Costo mayor primero</option>
   </select></div>
   <button type="button" data-ti42p-clear class="ti42p-clear" title="Restablece únicamente búsqueda, vereda y fase">Limpiar filtros</button>
 </div>
 <p class="ti42p-source" data-ti42p-source role="status" aria-live="polite">Cargando los registros del Excel…</p>
 <div class="ti42p-main">
  <div class="ti42p-left">
   <section class="ti42p-card">
    <div class="ti42p-card-heading"><h3>Listado de proyectos documentados</h3><span data-ti42p-total>—</span></div>
    <div class="ti42p-table-scroll" data-ti42p-table></div>
    <div class="ti42p-pagination" data-ti42p-paging>
      <span data-ti42p-range>—</span>
      <div><label for="ti42p-size">Filas</label><select id="ti42p-size" data-ti42p-page-size><option value="10">10</option><option value="20">20</option><option value="50">50</option></select>
       <button type="button" data-ti42p-previous aria-label="Página anterior">‹</button><span data-ti42p-pages>1 / 1</span><button type="button" data-ti42p-next aria-label="Página siguiente">›</button></div>
    </div>
   </section>
   <div class="ti42p-analysis">
    <section class="ti42p-card"><h3>Avance físico por registro</h3><div data-ti42p-progress></div></section>
    <section class="ti42p-card"><h3>Estados de contrato registrados</h3><div data-ti42p-statuses></div></section>
    <section class="ti42p-card"><h3>Disponibilidad documental</h3><div data-ti42p-coverage></div></section>
    <section class="ti42p-card"><h3>Observaciones relacionadas</h3><div data-ti42p-observations></div></section>
   </div>
  </div>
  <aside class="ti42p-card ti42p-detail" aria-label="Ficha del registro seleccionado">
    <div class="ti42p-detail-top"><div><span class="ti42p-eyebrow">FICHA DE PROYECTO · REGISTRO DEL EXCEL</span>
    <h3 data-ti42p-title>Selecciona un proyecto de la tabla</h3>
    <div data-ti42p-pill></div><small data-ti42p-identity></small></div></div>
    <nav class="ti42p-detail-tabs" role="tablist" aria-label="Apartados de la ficha">
      <button type="button" role="tab" data-ti42p-detail-tab="informacion">Información</button>
      <button type="button" role="tab" data-ti42p-detail-tab="localizacion">Localización</button>
      <button type="button" role="tab" data-ti42p-detail-tab="contratos">Contratos</button>
      <button type="button" role="tab" data-ti42p-detail-tab="ejecucion">Ejecución</button>
      <button type="button" role="tab" data-ti42p-detail-tab="evidencias">Evidencias</button>
      <button type="button" role="tab" data-ti42p-detail-tab="indicadores">Indicadores</button>
    </nav>
    <div class="ti42p-detail-body">
     <div data-ti42p-detail-panel="informacion"></div>
     <div data-ti42p-detail-panel="localizacion" hidden>
       <p class="ti42p-map-caption">Cartografía vectorial de Subachoque. La vereda es una referencia territorial, no una coordenada acreditada de la obra.</p>
       <div class="ti42p-map-frame"><div data-ti42p-map data-ti-map data-ti-map-manual="1" class="ti42p-map-host"></div></div>
       <div data-ti42p-map-meta></div><button type="button" data-ti42p-focus class="ti42p-map-focus">Centrar vereda seleccionada</button>
     </div>
     <div data-ti42p-detail-panel="contratos" hidden></div>
     <div data-ti42p-detail-panel="ejecucion" hidden></div>
     <div data-ti42p-detail-panel="evidencias" hidden></div>
     <div data-ti42p-detail-panel="indicadores" hidden></div>
    </div>
    <div class="ti42p-detail-note">Información procedente del archivo aportado. «Fase del proyecto» y «Estado del contrato» son campos diferentes.</div>
  </aside>
 </div>
 <footer class="ti42p-footer">Fuente: UNIDAD DE CUMPLIMIENTO(1).xlsx · «Proyectos DEFINITIVO» · filas originales identificadas. Sin fecha de actualización acreditada. No se presentan fotos, cantidades de beneficiarios ni coordenadas puntuales que no estén verificadas.</footer>
`;
tabs.insertAdjacentElement('afterend',panel);
const q=s=>panel.querySelector(s);
const set=(s,html)=>{const el=q(s);if(el)el.innerHTML=html;};
const txt=(s,text)=>{const el=q(s);if(el)el.textContent=String(text??'');};
const keep=()=>{try{localStorage.setItem(STORE,JSON.stringify(state));}catch{}};
function setView(view){
 state.view=['resumen','proyectos','contratos','financiera','cronograma','mapa','evidencias','indicadores','riesgos'].includes(view)?view:'resumen';
 const projects=state.view==='proyectos',contracts=state.view==='contratos',finances=state.view==='financiera',chrono=state.view==='cronograma',mapMode=state.view==='mapa',evidenceMode=state.view==='evidencias',indicatorsMode=state.view==='indicadores',risksMode=state.view==='riesgos';
 const hadSummaryHidden=summary.hidden;
 const contractPanel=shell.querySelector('[data-ti42-contratos-root]');
 const financePanel=shell.querySelector('[data-ti42-financiera-root]');
 const chronoHead=shell.querySelector('[data-ti42g-head]');
 const chronoPanel=shell.querySelector('[data-ti42g-panel]');
 const mapPanel=shell.querySelector('[data-ti42-mapa-root]');
 const evidenceHead=shell.querySelector('[data-ti42e-header]');
 const evidencePanel=shell.querySelector('[data-ti42-evidencias-root]');
 const indicatorsHead=shell.querySelector('[data-ti42i-head]');
 const indicatorsPanel=shell.querySelector('[data-ti42i-root]');
 const risksHead=shell.querySelector('[data-ti42r-header]');
 const risksPanel=shell.querySelector('[data-ti42r-root]');
 panel.hidden=!projects;
 summary.hidden=projects||contracts||finances||chrono||mapMode||evidenceMode||indicatorsMode||risksMode;
 if(risksHead)risksHead.hidden=!risksMode;
 if(risksPanel)risksPanel.hidden=!risksMode;
 if(indicatorsHead)indicatorsHead.hidden=!indicatorsMode;
 if(indicatorsPanel)indicatorsPanel.hidden=!indicatorsMode;
 if(evidenceHead)evidenceHead.hidden=!evidenceMode;
 if(evidencePanel)evidencePanel.hidden=!evidenceMode;
 if(mapPanel)mapPanel.hidden=!mapMode;
 if(chronoHead)chronoHead.hidden=!chrono;
 if(chronoPanel)chronoPanel.hidden=!chrono;
 shell.classList.toggle('is-chronogram-view',chrono);
 shell.classList.toggle('is-map-view',mapMode);
 shell.classList.toggle('is-evidence-view',evidenceMode);
 shell.classList.toggle('is-indicators-view',indicatorsMode);
 shell.classList.toggle('is-risks-view',risksMode);
 if(contractPanel)contractPanel.hidden=!contracts;
 if(financePanel)financePanel.hidden=!finances;
 shell.classList.toggle('ti42-projects-active',projects||contracts||finances||chrono||mapMode||evidenceMode||indicatorsMode||risksMode);
 tabs.querySelectorAll('[data-ti42-view]').forEach(tab=>{
   const chosen=tab.dataset.ti42View===state.view;
   tab.classList.toggle('is-active',chosen);
   tab.setAttribute('aria-selected',String(chosen));
 });
 keep();
 if(projects){render();if(state.detailTab==='localizacion')requestAnimationFrame(startMap);}
 else if(contracts){window.TI42Contratos?.renderIfActive?.();}
 else if(finances){window.TI42Financiera?.renderIfActive?.();}
 else if(chrono){window.TI42Cronograma?.renderIfActive?.();}
 else if(mapMode){window.TI42Mapa?.renderIfActive?.();}
 else if(evidenceMode){window.TI42Evidencias?.renderIfActive?.();}
 else if(indicatorsMode){window.TI42Indicadores?.renderIfActive?.();}
 else if(risksMode){window.TI42Riesgos?.renderIfActive?.();}
 else if(hadSummaryHidden)requestAnimationFrame(()=>api.refreshMap?.());
}
function baseFilter(r){
 if(shared.meta!=='all'&&(shared.meta==='none'?!!r.meta:r.meta!==shared.meta))return false;
 if(shared.year!=='all'&&(shared.year==='none'?!!r.year:r.year!==shared.year))return false;
 if(shared.status!=='all'&&(shared.status==='none'?!!r.contractStatus:r.contractStatus!==shared.status))return false;
 if(shared.sector!=='all'&&(shared.sector==='none'?!!r.sectorMGA:r.sectorMGA!==shared.sector))return false;
 if(shared.q&&!normalize([r.name,r.bpin,r.contract,r.vereda,r.sectorMGA,r.phase,r.item].join(' ')).includes(normalize(shared.q)))return false;
 return true;
}
function filteredRows(){
 const list=source.filter(r=>baseFilter(r)
   &&(state.vereda==='all'?(true):(state.vereda==='none'?!r.vereda:r.vereda===state.vereda))
   &&(state.phase==='all'?(true):(state.phase==='none'?!r.phase:r.phase===state.phase)));
 const order=[...list];
 switch(state.sort){
  case 'name':order.sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'es'));break;
  case 'year':order.sort((a,b)=>String(b.year||'').localeCompare(String(a.year||''),'es')||a.excelRow-b.excelRow);break;
  case 'budget':order.sort((a,b)=>(Number.isFinite(b.budget)?b.budget:-Infinity)-(Number.isFinite(a.budget)?a.budget:-Infinity));break;
  default:order.sort((a,b)=>a.excelRow-b.excelRow);
 }
 return order;
}
function choices(){
 const values=(key)=>[...new Set(source.map(r=>r[key]).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'es'));
 const choice=(key,chosen,label)=>{
  let out='<option value="all">'+safe(label)+'</option>';
  values(key).forEach(v=>out+='<option value="'+safe(v)+'">'+safe(v)+'</option>');
  if(source.some(r=>!r[key]))out+='<option value="none">Sin dato</option>';
  const select=q('[data-ti42p-filter="'+chosen+'"]');
  if(select){select.innerHTML=out;select.value=state[chosen];if(select.selectedIndex===-1){state[chosen]='all';select.value='all';}}
 };
 choice('vereda','vereda','Todas las veredas');
 choice('phase','phase','Todas las fases');
 q('[data-ti42p-filter="sort"]').value=state.sort;
 q('[data-ti42p-page-size]').value=String(state.pageSize);
}
function tagStats(rows){
 const meta=rows.filter(r=>Number.isFinite(r.physicalPercent));
 const vals=meta.map(r=>r.physicalPercent);
 const average=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;
 txt('[data-ti42p-heading-count]','('+rows.length+')');
 txt('[data-ti42p-total]',rows.length+' registros');
 txt('[data-ti42p-source]',rows.length+' registros en esta consulta · '+yesNoCount(rows,'bpin')+' con BPIN · '+yesNoCount(rows,'vereda')+' con vereda · '+meta.length+' con avance físico. No son proyectos únicos certificados.');
 return {physical:meta,average};
}
function renderTable(rows){
 const pageCount=Math.max(1,Math.ceil(rows.length/state.pageSize));
 state.page=Math.min(Math.max(1,state.page),pageCount);
 const start=(state.page-1)*state.pageSize,list=rows.slice(start,start+state.pageSize);
 const headers=['N.º','Código BPIN','Nombre del proyecto','Sector MGA','Fase / contrato','Avance físico','Costo total','Acciones'];
 const body=list.map(r=>{
   const active=selected?.excelRow===r.excelRow;
   const phase=r.phase?brief(r.phase,28):'Sin fase';
   return '<tr class="'+(active?'selected':'')+'" data-ti42p-row="'+r.excelRow+'">'
    +'<td>'+safe(r.item??r.excelRow)+'</td>'
    +'<td><span class="ti42p-bpin">'+(r.bpin?safe(r.bpin):'Sin BPIN')+'</span></td>'
    +'<td><strong title="'+safe(r.name)+'">'+brief(r.name,82)+'</strong><small>Vigencia '+(r.year?safe(r.year):'no registrada')+'</small></td>'
    +'<td>'+ (r.sectorMGA?brief(r.sectorMGA,48):'<span class="ti42p-missing">Sin sector</span>')+'</td>'
    +'<td><span class="ti42p-phase">'+phase+'</span>'+pill(r.contractStatus)+'</td>'
    +'<td>'+bar(r.physicalPercent,'green')+'</td>'
    +'<td class="ti42p-money">'+money(r.budget)+'</td>'
    +'<td><button type="button" data-ti42p-select="'+r.excelRow+'" aria-label="Ver ficha del registro '+r.excelRow+'" aria-pressed="'+String(active)+'">Ver detalle →</button></td></tr>';
 }).join('');
 set('[data-ti42p-table]','<table><thead><tr>'+headers.map(h=>'<th scope="col">'+safe(h)+'</th>').join('')+'</tr></thead><tbody>'+body+'</tbody></table>'+(list.length?'':'<div class="ti42p-empty">No hay proyectos que coincidan con los filtros. Puedes cambiar la meta, la vigencia, el sector o el término buscado.</div>'));
 txt('[data-ti42p-range]',rows.length?(start+1)+'–'+Math.min(start+list.length,rows.length)+' de '+rows.length+' registros':'0 registros');
 txt('[data-ti42p-pages]',state.page+' / '+pageCount);
 q('[data-ti42p-previous]').disabled=state.page===1;
 q('[data-ti42p-next]').disabled=state.page>=pageCount;
}
function detailField(label,value){return dd(label,value);}
function plot(label,value,color){
 return '<div class="ti42p-progress-item"><div class="ti42p-progress-title"><span>'+safe(label)+'</span></div>'+bar(value,color)+'</div>';
}
function renderDetail(){
 const r=selected,x=extraFor(selected);
 if(!r){
   txt('[data-ti42p-title]','Sin registros en la selección');
   set('[data-ti42p-pill]','');
   txt('[data-ti42p-identity]','Revisa los filtros para encontrar proyectos.');
   for(const tab of ['informacion','contratos','ejecucion','evidencias','indicadores'])set('[data-ti42p-detail-panel="'+tab+'"]','<p class="ti42p-empty">No hay una ficha disponible con esta selección.</p>');
   set('[data-ti42p-map-meta]','<p class="ti42p-empty">Sin información territorial.</p>');
   return;
 }
 txt('[data-ti42p-title]',r.name||'Registro sin nombre');
 set('[data-ti42p-pill]',pill(r.contractStatus));
 txt('[data-ti42p-identity]','Ítem '+(r.item||'—')+' · fila Excel '+r.excelRow+' · BPIN '+(r.bpin||'no registrado'));
 set('[data-ti42p-detail-panel="informacion"]',
  '<h4>Datos generales</h4><dl class="ti42p-facts">'+[
    ['Nombre del proyecto',r.name],['Código BPIN',r.bpin],['Vigencia',r.year],
    ['Número de meta',r.meta],['Descripción de la meta',r.metaTitle],
    ['Sector MGA',r.sectorMGA],['Línea estratégica',r.strategicLine],
    ['Programa del Plan de Desarrollo',x.program],['Fase del proyecto',r.phase],
    ['Zona municipal',x.zone],['Población objetivo (texto del archivo)',x.population],
    ['Responsabilidad de ejecución',x.executionResponsibility],
    ['Responsable técnico municipal',r.technicalResponsible]
  ].map(([a,b])=>detailField(a,b)).join('')+'</dl>'
  +'<h4>Descripción del proyecto</h4><p class="ti42p-excerpt">'+known(x.description)+'</p>'
  +'<h4>Alcance consignado</h4><p class="ti42p-excerpt">'+known(x.scope)+'</p>'
  +'<div class="ti42p-note">'+safe(extraStatus)+' Los textos extensos se muestran abreviados; consulta el libro original para su contenido completo.</div>'
  +'<button type="button" class="ti42p-evidence-link" data-ti42p-open-risks>Consultar riesgos registrados de este proyecto ↗</button>'
 );
 set('[data-ti42p-map-meta]','<dl class="ti42p-facts">'+[
 ['Localidad registrada',r.vereda],['Zona del municipio',x.zone],['Sector o dirección',x.address],
 ['Coordenada inicial (texto fuente)',x.coordStart],['Coordenada final (texto fuente)',x.coordEnd],
 ['Referencia municipal','Subachoque, Cundinamarca']
 ].map(([a,b])=>detailField(a,b)).join('')+'</dl><p class="ti42p-note">Las coordenadas DMS se muestran tal como aparecen en el Excel: no se han validado ni convertido a puntos georreferenciados. El mapa señala la vereda de referencia, no la ubicación precisa de la obra.</p>');
 q('[data-ti42p-focus]').disabled=!r.vereda;
 set('[data-ti42p-detail-panel="contratos"]',
  '<h4>Información contractual</h4><dl class="ti42p-facts">'+[
    ['Número de contrato',r.contract],['Estado del contrato',r.contractStatus],
    ['Contratista',r.contractor],['Modalidad de selección',x.selectionMethod],
    ['Plazo de ejecución',x.contractTerm],['Costo total consignado',Number.isFinite(r.budget)?money(r.budget):null],
    ['Costo ejecutado consignado',Number.isFinite(r.executedCost)?money(r.executedCost):null],
    ['Documentación mencionada',x.sourceDocuments]
  ].map(([a,b])=>detailField(a,b)).join('')+'</dl>'+
  (validUrl(r.secopUrl)?'<a class="ti42p-secopp" href="'+safe(validUrl(r.secopUrl))+'" target="_blank" rel="noopener noreferrer">Abrir enlace SECOP registrado ↗</a>':'<p class="ti42p-note">Este registro no tiene un enlace SECOP válido en el archivo.</p>'));
 const costRate=Number.isFinite(r.budget)&&r.budget>0&&Number.isFinite(r.executedCost)?r.executedCost/r.budget*100:null;
 set('[data-ti42p-detail-panel="ejecucion"]',
  '<h4>Avances documentados</h4><div class="ti42p-execution">'+
  plot('Avance físico de obra reportado',r.physicalPercent,'green')+
  plot('Avance financiero de gestión reportado',r.managementPercent,'blue')+
  plot('Ejecución financiera de la columna 46',Number.isFinite(x.financialPct)?x.financialPct:null,'blue')+
  plot('Relación costo ejecutado / costo total',costRate,'amber')+
  '</div><dl class="ti42p-facts">'+[
     ['Costo total',Number.isFinite(r.budget)?money(r.budget):null],
     ['Costo ejecutado',Number.isFinite(r.executedCost)?money(r.executedCost):null],
     ['Longitud o unidad reportada',x.physicalUnit],['Descripción de pagos',x.paymentStatus],
     ['Inicio',r.start],['Finalización',r.end]
  ].map(([a,b])=>detailField(a,b)).join('')+'</dl><p class="ti42p-note">Los porcentajes se leen del archivo o se derivan de montos comparables. No sustituyen actas, pagos certificados ni indicadores oficiales de avance.</p>');
 const photos=[['Antes',r.photoBefore],['Seguimiento',r.photoFollow],['Después',r.photoAfter]]
   .filter(([,url])=>!!validUrl(url));
 set('[data-ti42p-detail-panel="evidencias"]',photos.length
  ?'<h4>Enlaces registrados</h4>'+photos.map(([label,url])=>'<a class="ti42p-evidence-link" href="'+safe(validUrl(url))+'" target="_blank" rel="noopener noreferrer">'+safe(label)+' · Abrir evidencia ↗</a>').join('')+'<p class="ti42p-note">Los enlaces no certifican por sí mismos que las fotografías sean de la intervención.</p>'
  :'<div class="ti42p-evidence-empty"><span aria-hidden="true">▧</span><strong>Sin fotografías enlazadas</strong><p>Las columnas Antes, Seguimiento y Después no contienen enlaces de este registro. No se muestran imágenes ajenas como evidencia.</p></div>'+
    (x.sourceDocuments?'<h4>Documentos mencionados por el archivo</h4><p class="ti42p-excerpt">'+safe(x.sourceDocuments)+'</p><p class="ti42p-note">Esta lista textual no aporta por sí misma archivos descargables ni evidencia verificada.</p>':''));
 q('[data-ti42p-detail-panel="evidencias"]')?.insertAdjacentHTML('beforeend','<button class="ti42p-evidence-link" type="button" data-ti42p-open-global-evidences>Consultar este proyecto en la pestaña Evidencias ↗</button>');
 set('[data-ti42p-detail-panel="indicadores"]',
  '<h4>Indicadores disponibles</h4><div class="ti42p-indicator-cards">'+
  '<div><small>Avance físico de obra</small><strong>'+percent(r.physicalPercent)+'</strong></div>'+
  '<div><small>Avance financiero de gestión</small><strong>'+percent(r.managementPercent)+'</strong></div>'+
  '</div><dl class="ti42p-facts">'+detailField('Meta municipal',r.meta)+detailField('BPIN',r.bpin)+detailField('Fase',r.phase)+detailField('Programa',x.program)+detailField('Población objetivo declarada',x.population)+detailField('Unidad física declarada',x.physicalUnit)+detailField('Anexo de riesgos (texto)',x.riskAnnex)+'</dl>'
  +'<h4>Observaciones registradas</h4><p class="ti42p-observation">'+known(r.observations)+'</p>'
  +'<p class="ti42p-note">Los avances físicos y financieros anteriores pertenecen al proyecto; no son mediciones de indicadores del Plan de Desarrollo.</p>'+
  (r.meta?'<button type="button" class="ti42p-evidence-link" data-ti42p-open-plan-indicators>Consultar la Meta '+safe(r.meta)+' en Indicadores ↗</button>':'<p class="ti42p-note">Sin meta vinculada para consultar.</p>'));
 if(projectMap&&r.vereda)projectMap.select(r.vereda);
}
function renderMini(rows,stats){
 const physical=stats.physical.slice().sort((a,b)=>b.physicalPercent-a.physicalPercent).slice(0,6);
 set('[data-ti42p-progress]',physical.length?'<div class="ti42p-mini-progress">'+physical.map(r=>
  '<div><span title="'+safe(r.name)+'">'+brief(r.name,46)+'</span>'+bar(r.physicalPercent,'green')+'</div>').join('')+'</div><p class="ti42p-mini-foot">'+stats.physical.length+' de '+rows.length+' filas con porcentaje físico numérico. Se muestran hasta seis.</p>':
  '<p class="ti42p-empty">Sin porcentajes físicos numéricos para los proyectos seleccionados.</p>');
 const counts=new Map();rows.forEach(r=>{const k=r.contractStatus||'No registrado';counts.set(k,(counts.get(k)||0)+1);});
 const entries=[...counts].sort((a,b)=>b[1]-a[1]),max=Math.max(1,...entries.map(([,n])=>n));
 set('[data-ti42p-statuses]',entries.length?entries.map(([label,count])=>
  '<div class="ti42p-state-row"><span>'+brief(label,44)+'</span><div class="ti42p-track"><i class="blue" style="width:'+((count/max)*100).toFixed(2)+'%"></i></div><strong>'+count+'</strong></div>').join('')+'<p class="ti42p-mini-foot">Estados de contrato, no estados inferidos del proyecto.</p>':'<p class="ti42p-empty">Sin contratos clasificados.</p>');
 const population=[['Código BPIN','bpin'],['Vereda','vereda'],['Contrato','contract'],['Avance físico','physicalPercent'],['Enlace SECOP','secopUrl']];
 set('[data-ti42p-coverage]','<div class="ti42p-coverage-list">'+population.map(([title,key])=>{
  const found=key==='physicalPercent'?rows.filter(r=>Number.isFinite(r[key])).length:
     key==='secopUrl'?rows.filter(r=>!!validUrl(r[key])).length:yesNoCount(rows,key);
  return '<div><span>'+safe(title)+'</span><strong>'+found+' / '+rows.length+'</strong><div class="ti42p-track"><i class="green" style="width:'+(rows.length?(found/rows.length)*100:0).toFixed(2)+'%"></i></div></div>';
 }).join('')+'</div><p class="ti42p-mini-foot">Mide campos disponibles en el Excel, no cumplimiento de obras.</p>');
 const noted=rows.filter(r=>r.observations);
 set('[data-ti42p-observations]',noted.length?'<ul class="ti42p-obs">'+noted.slice(0,4).map(r=>
 '<li><strong>Registro '+safe(r.item||r.excelRow)+'</strong><span>'+brief(r.observations,210)+'</span></li>').join('')+'</ul><p class="ti42p-mini-foot">'+noted.length+' filas con observaciones textuales; no son riesgos clasificados.</p>':
 '<p class="ti42p-empty">Sin observaciones textuales para los registros filtrados.</p>');
}
function draw(){
 if(!ready){txt('[data-ti42p-heading-count]','(…)');txt('[data-ti42p-source]',error?'No se cargaron los registros: '+error:'Cargando registros del Excel…');return;}
 filtered=filteredRows();
 if(!filtered.some(r=>r.excelRow===state.selectedRow))state.selectedRow=filtered[0]?.excelRow||null;
 selected=filtered.find(r=>r.excelRow===state.selectedRow)||null;
 const stats=tagStats(filtered);
 renderTable(filtered);
 renderDetail();
 renderMini(filtered,stats);
 const input=q('[data-ti42p-search]');
 if(input&&document.activeElement!==input)input.value=shared.q||'';
 for(const btn of qAll('[data-ti42p-detail-tab]')){
   const active=btn.dataset.ti42pDetailTab===state.detailTab;
   btn.classList.toggle('is-active',active);btn.setAttribute('aria-selected',String(active));
 }
 qAll('[data-ti42p-detail-panel]').forEach(el=>el.hidden=el.dataset.ti42pDetailPanel!==state.detailTab);
 keep();
}
function qAll(s){return [...panel.querySelectorAll(s)];}
function showDetail(tab){
 state.detailTab=tab;
 qAll('[data-ti42p-detail-tab]').forEach(el=>{
  const active=el.dataset.ti42pDetailTab===tab;
  el.classList.toggle('is-active',active);el.setAttribute('aria-selected',String(active));
 });
 qAll('[data-ti42p-detail-panel]').forEach(el=>el.hidden=el.dataset.ti42pDetailPanel!==tab);
 keep();
 if(tab==='localizacion')requestAnimationFrame(startMap);
}
function startMap(){
 const host=q('[data-ti42p-map]'),location=q('[data-ti42p-detail-panel="localizacion"]');
 if(!host||panel.hidden||location?.hidden||section.hidden)return;
 if(projectMap){projectMap.invalidateSize?.();return;}
 if(mapMounted||!window.TISubachoqueMap)return;
 mapMounted=true;
 window.TISubachoqueMap.mount(host,{onSelect:()=>{}}).then(map=>{
  projectMap=map;
  if(selected?.vereda)map?.select(selected.vereda);
  map?.invalidateSize?.();
 }).catch(()=>{
  mapMounted=false;
  host.textContent='El mapa de referencia no pudo cargarse. Consulta la vereda en la ficha.';
 });
}
function exportCSV(){
 const header=['Fila Excel','Ítem','Vigencia','Nombre','Código BPIN','Meta','Sector MGA','Fase','Vereda','Contrato','Estado contrato','Contratista','Costo total (COP)','Costo ejecutado (COP)','Avance físico (%)','Avance financiero de gestión (%)','Responsable técnico','Observaciones'];
 const keys=['excelRow','item','year','name','bpin','meta','sectorMGA','phase','vereda','contract','contractStatus','contractor','budget','executedCost','physicalPercent','managementPercent','technicalResponsible','observations'];
 const cell=value=>{
  const raw=value==null?'':String(value);
  const guarded=/^[\s]*[=+\-@\t\r]/.test(raw)?"'"+raw:raw;
  return '"'+guarded.replace(/"/g,'""')+'"';
 };
 const contents='\uFEFF'+header.map(cell).join(';')+'\r\n'+filtered.map(r=>keys.map(k=>cell(r[k])).join(';')).join('\r\n');
 const blob=new Blob([contents],{type:'text/csv;charset=utf-8'});
 const url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;a.download='unidad-cumplimiento-proyectos-filtrados.csv';
 document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
tabs.addEventListener('click',ev=>{
 const b=ev.target.closest('[data-ti42-view]');if(b)setView(b.dataset.ti42View);
});
tabs.addEventListener('keydown',ev=>{
 const btn=ev.target.closest('[data-ti42-view]');if(!btn||!['ArrowLeft','ArrowRight','Home','End'].includes(ev.key))return;
 const buttons=[...tabs.querySelectorAll('[data-ti42-view]')],i=buttons.indexOf(btn);
 const target=ev.key==='Home'?buttons[0]:ev.key==='End'?buttons.at(-1):buttons[(i+(ev.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length];
 ev.preventDefault();target.focus();setView(target.dataset.ti42View);
});
panel.addEventListener('click',ev=>{
 const select=ev.target.closest('[data-ti42p-select]');if(select){state.selectedRow=Number(select.dataset.ti42pSelect);state.detailTab='informacion';renderTable(filtered);renderDetail();showDetail('informacion');keep();return;}
 const detail=ev.target.closest('[data-ti42p-detail-tab]');if(detail){showDetail(detail.dataset.ti42pDetailTab);return;}
 if(ev.target.closest('[data-ti42p-previous]')){state.page--;renderTable(filtered);keep();return;}
 if(ev.target.closest('[data-ti42p-next]')){state.page++;renderTable(filtered);keep();return;}
 if(ev.target.closest('[data-ti42p-clear]')){state.vereda='all';state.phase='all';state.page=1;choices();api.setSearch('');return;}
 if(ev.target.closest('[data-ti42p-export]')){exportCSV();return;}
 if(ev.target.closest('[data-ti42p-focus]')&&selected?.vereda){projectMap?.focus(selected.vereda,true);return;}
});
panel.addEventListener('input',ev=>{
 const input=ev.target.closest('[data-ti42p-search]');
 if(input){state.page=1;api.setSearch(input.value);}
});
panel.addEventListener('change',ev=>{
 const element=ev.target.closest('[data-ti42p-filter],[data-ti42p-page-size]');
 if(!element)return;
 if(element.hasAttribute('data-ti42p-page-size'))state.pageSize=Number(element.value);
 else state[element.dataset.ti42pFilter]=element.value;
 state.page=1;render();keep();
});
function render(){if(!ready){draw();return;}draw();}
async function loadExtraData(){
 try{
   const response=await fetch('data/uc42-proyectos-extra.b64.txt?v=20261108-proyectos-v1',{cache:'no-cache'});
   if(!response.ok)throw Error('No se encontró la fuente complementaria');
   if(typeof DecompressionStream!=='function')throw Error('Navegador sin soporte para datos comprimidos');
   const encoded=(await response.text()).trim();
   const binary=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
   const plain=await new Response(new Blob([binary]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
   const obj=JSON.parse(plain);
   if(obj.schema!==1||obj.sheet!=='Proyectos DEFINITIVO'||!Array.isArray(obj.fields)
      ||obj.fields.join('|')!==extraFieldOrder.join('|')||!Array.isArray(obj.rows)
      ||!obj.rows.every(row=>Array.isArray(row)&&row.length===extraFieldOrder.length))
     throw Error('El complemento del Excel no cumple el esquema esperado');
   const next=new Map(obj.rows.map(row=>[Number(row[0]),Object.fromEntries(obj.fields.map((field,i)=>[field,row[i]]))]));
   if(next.size!==obj.rows.length)throw Error('Se encontraron filas duplicadas en el complemento');
   extras=next;extraStatus='Campos complementarios extraídos de Proyectos DEFINITIVO.';
 }catch(err){extras=new Map();extraStatus='Campos complementarios no disponibles ('+err.message+').';}
 extraReady=true;for(const cb of extraListeners){try{cb();}catch(e){console.error('Error sincronizando datos complementarios',e);}}
 if(ready&&selected&&state.view==='proyectos')renderDetail();
}
loadExtraData();
api.onChange(snapshot=>{
 const prev=JSON.stringify(source.map(r=>r.excelRow));
 source=snapshot.rows||[];
 shared=snapshot.state||{};
 error=snapshot.error||null;
 ready=!!snapshot.loaded;
 if(ready&&JSON.stringify(source.map(r=>r.excelRow))!==prev)choices();
 loadCount++;
 if(state.view==='proyectos'&&!panel.hidden)render();
 else if(ready){filtered=filteredRows();tagStats(filtered);}
});
if(ready)choices();
setView(state.view);
function openProject(rowNumber,detailTab='contratos'){
 const target=Number(rowNumber),r=source.find(x=>x.excelRow===target);
 if(!r)return false;
 state.vereda='all';state.phase='all';state.sort='file';state.selectedRow=target;
 state.detailTab=['informacion','localizacion','contratos','ejecucion','evidencias','indicadores'].includes(detailTab)?detailTab:'informacion';
 const list=source.filter(baseFilter).sort((a,b)=>a.excelRow-b.excelRow);
 const index=list.findIndex(x=>x.excelRow===target);
 state.page=index>=0?Math.floor(index/state.pageSize)+1:1;
 choices();setView('proyectos');return true;
}
panel.addEventListener('click',event=>{
 if(event.target.closest('[data-ti42p-open-global-evidences]')&&selected)window.TI42Evidencias?.openProject?.(selected.excelRow);
 if(event.target.closest('[data-ti42p-open-plan-indicators]')&&selected?.meta)window.TI42Indicadores?.openMeta?.(selected.meta);
 if(event.target.closest('[data-ti42p-open-risks]')&&selected)window.TI42Riesgos?.openProject?.(selected.excelRow);
});
window.TI42Proyectos={
 openProject,
 get state(){return {...state};},get filteredCount(){return filtered.length;},get selectedRow(){return selected?.excelRow||null;},
 get loaded(){return ready;},get lastUpdates(){return loadCount;},get error(){return error;},
 setView,
 getExtraRow(rowNumber){return extras.get(Number(rowNumber))||null;},
 onExtraChange(callback){if(typeof callback!=='function')return ()=>{};extraListeners.add(callback);if(extraReady)callback();return ()=>extraListeners.delete(callback);},
 get extraStatus(){return extraStatus;}
};
})();
