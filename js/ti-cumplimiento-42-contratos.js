(function TI42Contratos(){
'use strict';
const section=document.querySelector('#cumplimiento-proyectos');
const shell=section?.querySelector('.ti42');
const tabs=shell?.querySelector('.ti42-tabs');
const summary=window.TI42Summary,projects=window.TI42Proyectos;
if(!section||!shell||!tabs||!summary?.onChange||!projects?.setView)return;
const K='ti:uc42:contratos:v1';
const CORE_FIELDS=['excelRow','contractObject','contractStart','contractEnd','suspension','extension','addition','policyRCE','policyCompliance','policyQuality','policyStability','paymentDescription','amendmentObservation'];
const escape=v=>String(v===null||v===undefined?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const have=v=>v!==null&&v!==undefined&&String(v).trim()!=='';
const money=v=>Number.isFinite(v)?'$ '+new Intl.NumberFormat('es-CO',{maximumFractionDigits:0}).format(v):'Sin valor registrado';
const fmt=v=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:1}).format(v);
const pct=v=>Number.isFinite(v)?fmt(v)+' %':'Sin porcentaje';
const short=(v,n=60)=>{const t=String(v||'').replace(/\s+/g,' ').trim();return escape(t.length>n?t.slice(0,n-1).trimEnd()+'…':t);};
const dateISO=v=>typeof v==='string'&&/^\d{4}-\d\d-\d\d$/.test(v)?v.slice(8,10)+'/'+v.slice(5,7)+'/'+v.slice(0,4):'Sin fecha registrada';
const validUrl=u=>{try{const o=new URL(String(u||''));return o.protocol==='https:'&&!!o.hostname?o.href:null;}catch{return null;}};
const info=(label,value)=>'<div class="ti42c-fact"><dt>'+escape(label)+'</dt><dd>'+(have(value)?escape(value):'<em>No registrado</em>')+'</dd></div>';
const amount=(label,value)=>info(label,Number.isFinite(value)?money(value):null);
const percentVisual=(value,tone='green')=>{
 if(!Number.isFinite(value))return '<span class="ti42c-empty-percent">Sin dato numérico</span>';
 const outOfRange=value<0||value>100;
 const width=Math.max(0,Math.min(value,100));
 return '<div class="ti42c-progress"><div class="ti42c-track"><i class="'+tone+'" style="width:'+width.toFixed(2)+'%"></i></div><strong>'+pct(value)+'</strong></div>'
 +(outOfRange?'<span class="ti42c-alert-inline">Dato fuera del rango 0–100 %; revisar fuente.</span>':'');
};
const badge=value=>{
 const v=String(value||'').trim(),text=normalize(v);
 let kind='neutral';
 if(text.includes('no se ha iniciado')||text.includes('sin adjudicacion'))kind='warning';
 else if(text.includes('en ejecucion'))kind='success';
 else if(text.includes('adjudicado')||text.includes('firmado'))kind='info';
 return '<span class="ti42c-badge '+kind+'">'+(v?escape(v):'Estado no registrado')+'</span>';
};
const policy=(name,v)=>{
 const checked=v===true||v===1;
 const unclear=v===null||v===undefined;
 return '<div class="ti42c-policy"><span class="ti42c-policy-mark '+(unclear?'na':checked?'yes':'no')+'">'+(unclear?'?':checked?'✓':'—')+'</span><span>'+escape(name)+'</span><strong>'+(unclear?'Sin dato':checked?'Sí en Excel':'No marcado')+'</strong></div>';
};
const isNoApply=s=>!s||['no aplica','n/a','ninguna','no','0'].includes(normalize(s));
const details=['informacion','ejecucion','cronograma','pagos','documentos','evidencias'];
let state={presence:'yes',method:'all',query:'',sort:'file',page:1,size:10,selected:null,detail:'informacion'};
try{const saved=JSON.parse(localStorage.getItem(K)||'null');if(saved&&typeof saved==='object'){for(const key of Object.keys(state))if(Object.hasOwn(saved,key))state[key]=saved[key];}}catch{}
if(!['yes','no','all'].includes(state.presence))state.presence='yes';
if(!['file','cost','latest','contract'].includes(state.sort))state.sort='file';
if(!details.includes(state.detail))state.detail='informacion';
state.size=[10,20,50].includes(Number(state.size))?Number(state.size):10;
state.page=Math.max(1,Math.trunc(Number(state.page))||1);
state.query=typeof state.query==='string'?state.query:'';
state.method=typeof state.method==='string'?state.method:'all';
let source=[],globalFilters={},ready=false,sourceError=null;
let core=new Map(),coreReady=false,coreError=null,visible=[],selected=null,scope=[],maps=null,mapBusy=false,updateCount=0,extraReady=false;
const sheet=document.createElement('section');
sheet.className='ti42c';
sheet.dataset.ti42ContratosRoot='1';
sheet.hidden=true;
sheet.setAttribute('aria-label','Contratos asociados a proyectos estratégicos');
sheet.innerHTML=`
<header class="ti42c-titlebar">
 <div><span class="ti42c-eyebrow">4.2 · ASÍ CUMPLIMOS · CONTRATACIÓN DOCUMENTADA</span>
 <h2>Contratos <span data-ti42c-number>(…)</span></h2>
 <p>Consulta las referencias contractuales asociadas a los proyectos estratégicos. Se muestran los valores y estados tal como se registraron en el Excel.</p></div>
 <button type="button" data-ti42c-export class="ti42c-export" aria-label="Exportar filas contractuales filtradas en CSV">↧ Exportar CSV</button>
</header>
<div class="ti42c-context"><span data-ti42c-context>Selecciona una meta y una vigencia desde los filtros superiores.</span><span>Fuente: «Proyectos DEFINITIVO» · Excel Unidad de Cumplimiento</span></div>
<section class="ti42c-filters" aria-label="Filtros de contratación">
 <div class="ti42c-search"><label for="ti42c-search">Buscar contrato, objeto, proyecto o contratista</label><input id="ti42c-search" type="search" placeholder="Número, modalidad, contratista, proyecto…" data-ti42c-query autocomplete="off"></div>
 <div><label for="ti42c-presence">Referencia contractual</label><select id="ti42c-presence" data-ti42c-filter="presence"><option value="yes">Con número de contrato</option><option value="no">Sin número de contrato</option><option value="all">Todos los registros</option></select></div>
 <div><label for="ti42c-method">Modalidad de selección</label><select id="ti42c-method" data-ti42c-filter="method"><option value="all">Todas las modalidades</option></select></div>
 <div><label for="ti42c-sort">Ordenar</label><select id="ti42c-sort" data-ti42c-filter="sort"><option value="file">Orden del Excel</option><option value="contract">Número de contrato A–Z</option><option value="cost">Costo mayor primero</option><option value="latest">Inicio contractual más reciente</option></select></div>
 <button type="button" data-ti42c-reset class="ti42c-reset" title="Restablece los filtros propios de Contratos">Limpiar</button>
</section>
<div data-ti42c-status class="ti42c-status" role="status" aria-live="polite">Consultando el Excel…</div>
<section class="ti42c-kpis" data-ti42c-kpis aria-label="Indicadores de registros contractuales"></section>
<div class="ti42c-layout">
 <div class="ti42c-left">
  <section class="ti42c-card ti42c-list">
   <div class="ti42c-card-head"><h3>Listado de contratos y referencias</h3><span data-ti42c-table-label>—</span></div>
   <div class="ti42c-table-wrap" data-ti42c-table></div>
   <div class="ti42c-pager"><span data-ti42c-page-range>—</span><div><label for="ti42c-size">Filas</label><select id="ti42c-size" data-ti42c-size><option value="10">10</option><option value="20">20</option><option value="50">50</option></select><button type="button" data-ti42c-prev aria-label="Página anterior">‹</button><span data-ti42c-page-count>1 / 1</span><button type="button" data-ti42c-next aria-label="Página siguiente">›</button></div></div>
  </section>
  <div class="ti42c-lower">
   <section class="ti42c-card"><h3>Registros por modalidad de selección</h3><div data-ti42c-method-bars></div></section>
   <section class="ti42c-card"><h3>Costos declarados por contrato registrado</h3><div data-ti42c-budget-bars></div></section>
   <section class="ti42c-card"><h3>Estados contractuales documentados</h3><div data-ti42c-state-bars></div></section>
   <section class="ti42c-card"><h3>Cobertura de información contractual</h3><div data-ti42c-coverage></div></section>
  </div>
 </div>
 <div class="ti42c-right">
  <article class="ti42c-card ti42c-detail">
   <header class="ti42c-detail-header"><span class="ti42c-eyebrow">FICHA DEL REGISTRO SELECCIONADO</span><h3 data-ti42c-title>Selecciona un contrato</h3><div data-ti42c-badge></div><small data-ti42c-identity>Origen: Excel de la Unidad de Cumplimiento</small></header>
   <nav class="ti42c-detail-tabs" role="tablist" aria-label="Partes de la ficha contractual">
    <button role="tab" type="button" data-ti42c-detail="informacion">Información</button>
    <button role="tab" type="button" data-ti42c-detail="ejecucion">Ejecución</button>
    <button role="tab" type="button" data-ti42c-detail="cronograma">Cronograma</button>
    <button role="tab" type="button" data-ti42c-detail="pagos">Pagos</button>
    <button role="tab" type="button" data-ti42c-detail="documentos">Documentos</button>
    <button role="tab" type="button" data-ti42c-detail="evidencias">Evidencias</button>
   </nav>
   <div data-ti42c-detail-content class="ti42c-detail-content"></div>
   <button type="button" class="ti42c-project-link" data-ti42c-project>Ver ficha del proyecto asociado →</button>
  </article>
  <article class="ti42c-card ti42c-map-card"><h3>Ubicación territorial de referencia</h3>
   <p>Se señala únicamente la vereda documentada; no hay coordenadas de obra validadas.</p>
   <div class="ti42c-map-holder"><div data-ti42c-map data-ti-map data-ti-map-manual="1" class="ti42c-map-host"></div></div>
   <div class="ti42c-map-bottom"><span data-ti42c-vereda>Sin localidad registrada</span><button type="button" data-ti42c-focus>Localizar vereda</button></div>
  </article>
 </div>
</div>
<footer class="ti42c-footer">Fuente: UNIDAD DE CUMPLIMIENTO.xlsx · columnas de contratos, costos, documentos y pólizas, hoja «Proyectos DEFINITIVO». Cada fila es un registro de proyecto; algunas contienen más de una referencia contractual. Los importes de la fuente son «Costo total del proyecto» y «Costo ejecutado», no necesariamente valor adjudicado o pagos certificados.</footer>
`;
tabs.insertAdjacentElement('afterend',sheet);
const q=s=>sheet.querySelector(s);
const all=s=>[...sheet.querySelectorAll(s)];
const set=(s,markup)=>{const el=q(s);if(el)el.innerHTML=markup;};
const label=(s,value)=>{const el=q(s);if(el)el.textContent=value==null?'':String(value);};
const keep=()=>{try{localStorage.setItem(K,JSON.stringify(state));}catch{}};
const joined=r=>({...r,...(core.get(Number(r?.excelRow))||{}),extra:projects.getExtraRow?.(r?.excelRow)||{}});
const parent=r=>summary.matches(r);
const local=r=>{
 const x=projects.getExtraRow?.(r.excelRow)||{};
 if(state.presence==='yes'&&!have(r.contract))return false;
 if(state.presence==='no'&&have(r.contract))return false;
 if(state.method!=='all'&&(state.method==='none'?have(x.selectionMethod):x.selectionMethod!==state.method))return false;
 if(state.query&&!normalize([r.contract,r.contractor,r.name,r.bpin,r.contractStatus,r.vereda,x.selectionMethod,r.item,core.get(Number(r.excelRow))?.contractObject].join(' ')).includes(normalize(state.query)))return false;
 return true;
};
function methods(){
 const applicable=source.filter(parent);
 const setValues=[...new Set(applicable.map(r=>projects.getExtraRow?.(r.excelRow)?.selectionMethod).filter(have))].sort((a,b)=>a.localeCompare(b,'es'));
 const el=q('[data-ti42c-filter="method"]');
 let content='<option value="all">Todas las modalidades</option>';
 for(const value of setValues)content+='<option value="'+escape(value)+'">'+escape(value)+'</option>';
 if(applicable.some(r=>!have(projects.getExtraRow?.(r.excelRow)?.selectionMethod)))content+='<option value="none">Sin modalidad registrada</option>';
 el.innerHTML=content;el.value=state.method;
 if(el.selectedIndex<0||el.value!==state.method){state.method='all';el.value='all';}
}
function filterRows(){
 scope=source.filter(parent);
 let list=scope.filter(local);
 if(state.sort==='contract')list.sort((a,b)=>String(a.contract||'').localeCompare(String(b.contract||''),'es')||a.excelRow-b.excelRow);
 else if(state.sort==='cost')list.sort((a,b)=>(Number.isFinite(b.budget)?b.budget:-Infinity)-(Number.isFinite(a.budget)?a.budget:-Infinity)||a.excelRow-b.excelRow);
 else if(state.sort==='latest')list.sort((a,b)=>String(core.get(b.excelRow)?.contractStart||'').localeCompare(String(core.get(a.excelRow)?.contractStart||''))||a.excelRow-b.excelRow);
 else list.sort((a,b)=>a.excelRow-b.excelRow);
 return list;
}
function metric(label,value,note,tone='',choice=''){
 const tag=choice?'button':'article';
 return '<'+tag+' class="ti42c-kpi '+tone+(choice?' is-clickable':'')+'"'+(choice?' type="button" data-ti42c-presence="'+choice+'"':'')+'><span>'+escape(label)+'</span><strong>'+escape(value)+'</strong><small>'+escape(note)+'</small></'+tag+'>';
}
function kpis(){
 const withNumber=scope.filter(r=>have(r.contract));
 const without=scope.length-withNumber.length;
 const withValue=withNumber.filter(r=>Number.isFinite(r.budget));
 const withCost=withNumber.filter(r=>Number.isFinite(r.executedCost));
 const secop=withNumber.filter(r=>validUrl(r.secopUrl));
 const errors=withNumber.filter(r=>Number.isFinite(r.budget)&&r.budget>0&&Number.isFinite(r.executedCost)&&r.executedCost>r.budget);
 const cards=[
  metric('Con referencia de contrato',String(withNumber.length),'Filas con número o referencias', 'green','yes'),
  metric('Sin número de contrato',String(without),'Filas del Excel por completar','amber','no'),
  metric('Costo total del proyecto · filas',withValue.length?money(withValue.reduce((a,r)=>a+r.budget,0)):'Sin dato',withValue.length+' filas con importe; puede haber duplicados'),
  metric('Costo ejecutado · filas',withCost.length?money(withCost.reduce((a,r)=>a+r.executedCost,0)):'Sin dato',withCost.length+' filas con importe válido'),
  metric('Enlaces SECOP informados',String(secop.length),'No se verificó que abran la ficha específica'),
  metric('Revisión financiera',String(errors.length),'Filas donde el costo ejecutado supera al total','amber')
 ];
 set('[data-ti42c-kpis]',cards.join(''));
 label('[data-ti42c-number]','('+withNumber.length+' referencias en filas)');
}
function renderTable(){
 const pages=Math.max(1,Math.ceil(visible.length/state.size));
 state.page=Math.max(1,Math.min(pages,state.page));
 const start=(state.page-1)*state.size,part=visible.slice(start,start+state.size);
 const rows=part.map(r=>{
  const x=joined(r),chosen=selected?.excelRow===r.excelRow;
  return '<tr class="'+(chosen?'is-selected':'')+'">'+
   '<td><strong class="ti42c-contract-number" title="'+escape(r.contract||'')+'">'+(r.contract?short(r.contract,43):'<em>Sin número</em>')+'</strong><small>Ítem '+escape(r.item||r.excelRow)+'</small></td>'+
   '<td><strong title="'+escape(r.name||'')+'">'+short(r.name,63)+'</strong><small>'+escape(r.year||'Sin vigencia')+'</small></td>'+
   '<td>'+ (have(x.extra.selectionMethod)?short(x.extra.selectionMethod,35):'<em>Sin dato</em>')+'</td>'+
   '<td>'+ (have(r.contractor)?short(r.contractor,35):'<em>Sin dato</em>')+'</td>'+
   '<td>'+badge(r.contractStatus)+'</td>'+
   '<td>'+dateISO(x.contractStart)+'</td>'+
   '<td class="ti42c-money">'+money(r.budget)+'</td>'+
   '<td><button type="button" data-ti42c-select="'+r.excelRow+'" aria-pressed="'+String(chosen)+'" aria-label="Ver ficha del contrato en la fila '+r.excelRow+'">Ver detalle</button></td></tr>';
 }).join('');
 set('[data-ti42c-table]','<table><thead><tr>'+['N.º contrato','Proyecto asociado','Modalidad','Contratista','Estado','Inicio contrato','Costo total del proyecto','Acciones'].map(s=>'<th scope="col">'+s+'</th>').join('')+'</tr></thead><tbody>'+rows+'</tbody></table>'+(part.length?'':'<p class="ti42c-blank">No hay registros contractuales con los filtros actuales. Ajusta la meta o cambia la opción «Referencia contractual».</p>'));
 label('[data-ti42c-table-label]',visible.length+' registros');
 label('[data-ti42c-page-range]',visible.length?(start+1)+'–'+(start+part.length)+' de '+visible.length:'0 registros');
 label('[data-ti42c-page-count]',state.page+' / '+pages);
 q('[data-ti42c-prev]').disabled=state.page===1;
 q('[data-ti42c-next]').disabled=state.page===pages;
}
function visual(labelName,value,tone){
 return '<div class="ti42c-vizline"><span>'+escape(labelName)+'</span>'+percentVisual(value,tone)+'</div>';
}
function financialRate(r){return Number.isFinite(r.budget)&&r.budget>0&&Number.isFinite(r.executedCost)?r.executedCost/r.budget*100:null;}
function docsFor(r){
 const u=validUrl(r.secopUrl);
 return u?'<a class="ti42c-document-link" target="_blank" rel="noopener noreferrer" href="'+escape(u)+'">Consultar enlace SECOP consignado ↗</a><p class="ti42c-caveat">La dirección del Excel puede llevar a la búsqueda general de SECOP. Verifica número y objeto antes de considerar una ficha contractual.</p>':
 '<div class="ti42c-blank">Sin enlace SECOP válido para este registro. No se crea un documento ni una dirección de consulta ficticia.</div>';
}
function smallMap(){
 label('[data-ti42c-vereda]',selected?.vereda?'Vereda de referencia: '+selected.vereda:'Sin vereda identificada');
 q('[data-ti42c-focus]').disabled=!selected?.vereda;
}
function renderDetail(){
 const r=selected;
 if(!r){
  label('[data-ti42c-title]','Sin contrato seleccionado');set('[data-ti42c-badge]','');
  label('[data-ti42c-identity]','Elige otro filtro para consultar un registro.');
  set('[data-ti42c-detail-content]','<div class="ti42c-blank">No hay registros para mostrar.</div>');
  q('[data-ti42c-project]').disabled=true;
  smallMap();return;
 }
 const x=joined(r),extra=x.extra||{};
 label('[data-ti42c-title]',r.contract||'Registro sin número de contrato');
 set('[data-ti42c-badge]',badge(r.contractStatus));
 label('[data-ti42c-identity]','Ítem '+(r.item||r.excelRow)+' · fila Excel '+r.excelRow+' · '+(r.year||'Sin vigencia'));
 q('[data-ti42c-project]').disabled=false;
 let content='';
 if(state.detail==='informacion'){
  content='<h4>Datos generales del contrato</h4><dl class="ti42c-facts">'+[
   info('Número de contrato',r.contract),info('Modalidad de selección',extra.selectionMethod),
   info('Objeto contractual',x.contractObject),info('Contratista',r.contractor),
   info('Proyecto asociado',r.name),info('Código BPIN',r.bpin),
   info('Sector MGA',r.sectorMGA),info('Meta municipal',r.meta),
   info('Vereda o barrio',r.vereda),info('Responsable técnico municipal',r.technicalResponsible),info('Estado contractual',r.contractStatus),
   info('Plazo declarado',extra.contractTerm)
  ].join('')+'</dl>'+docsFor(r);
 }else if(state.detail==='ejecucion'){
  const rate=financialRate(r),reported=Number.isFinite(extra.financialPct)?extra.financialPct:null;
  content='<h4>Costos y avances del registro</h4><dl class="ti42c-facts">'+
   amount('Costo total del proyecto (Excel, col. 44)',r.budget)+
   amount('Costo ejecutado (Excel, col. 45)',r.executedCost)+
   info('Avance físico reportado',Number.isFinite(r.physicalPercent)?pct(r.physicalPercent):null)+
   info('Avance financiero de gestión',Number.isFinite(r.managementPercent)?pct(r.managementPercent):null)+'</dl>'+
   visual('Ejecución financiera registrada (columna 46)',reported,'blue')+
   visual('Costo ejecutado / costo total',rate,'green')+
   '<p class="ti42c-caveat">Estas columnas corresponden a costos del proyecto. Su suma o relación no demuestra valor contractual adjudicado, pagos ni ejecución certificada.</p>'+
   (Number.isFinite(rate)&&rate>100?'<div class="ti42c-warning">El costo ejecutado supera el costo total consignado. Se conserva el dato para revisión.</div>':'');
 }else if(state.detail==='cronograma'){
  const changes=[['Suspensión',x.suspension],['Prórroga',x.extension],['Adición',x.addition]];
  content='<h4>Fechas y modificaciones documentadas</h4><div class="ti42c-date-pair"><div><small>Inicio del contrato</small><strong>'+dateISO(x.contractStart)+'</strong></div><div><small>Terminación registrada</small><strong>'+dateISO(x.contractEnd)+'</strong></div></div><dl class="ti42c-facts">'+
    info('Plazo de ejecución',extra.contractTerm)+
    changes.map(([name,value])=>info(name,have(value)?value:null)).join('')+
    info('Observación contractual adicional',x.amendmentObservation)+'</dl><p class="ti42c-caveat">La terminación registrada puede no incorporar prórrogas o suspensiones. No se asigna automáticamente «vencido» ni «completado» a partir de fechas.</p>';
 }else if(state.detail==='pagos'){
  content='<h4>Información de pagos disponible</h4><dl class="ti42c-facts">'+
   info('Descripción de pagos (texto fuente)',x.paymentDescription)+
   amount('Costo ejecutado registrado',r.executedCost)+
   info('Avance financiero de gestión',Number.isFinite(r.managementPercent)?pct(r.managementPercent):null)+'</dl>'+
   '<div class="ti42c-blank">Este libro no proporciona un listado homogéneo de desembolsos, fechas y comprobantes de pago. «LIQUIDADO» es texto del campo de descripción; no se utiliza como certificación del estado contractual.</div>';
 }else if(state.detail==='documentos'){
  content='<h4>Documentos y pólizas consignados</h4>'+
   '<div class="ti42c-policies">'+
   policy('Responsabilidad civil extracontractual',x.policyRCE)+
   policy('Cumplimiento contractual',x.policyCompliance)+
   policy('Calidad y correcta ejecución',x.policyQuality)+
   policy('Estabilidad de obra',x.policyStability)+'</div>'+
   '<p class="ti42c-caveat">Las casillas reflejan Sí/No en el Excel: no acreditan la existencia, vigencia o validez de las pólizas.</p>'+
   '<h4>Documentación mencionada</h4><div class="ti42c-document-text">'+(have(extra.sourceDocuments)?escape(extra.sourceDocuments):'<em>No se menciona documentación en este registro.</em>')+'</div>'+
   docsFor(r);
 }else if(state.detail==='evidencias'){
  const photos=[['Antes',r.photoBefore],['Seguimiento',r.photoFollow],['Después',r.photoAfter]].filter(([label,url])=>validUrl(url));
  content='<h4>Evidencia fotográfica de la contratación</h4>'+(photos.length?
   photos.map(([title,url])=>'<a class="ti42c-document-link" href="'+escape(validUrl(url))+'" target="_blank" rel="noopener noreferrer">Foto '+escape(title)+' ↗</a>').join(''):
   '<div class="ti42c-evidence-blank"><span aria-hidden="true">▧</span><strong>Sin enlaces fotográficos en este registro</strong><p>No se utilizan imágenes de ejemplo como si fueran evidencia de ejecución.</p></div>')+
  '<h4>Documentación de soporte</h4>'+docsFor(r);
 }
 set('[data-ti42c-detail-content]',content);
 all('[data-ti42c-detail]').forEach(button=>{
  const isActive=button.dataset.ti42cDetail===state.detail;
  button.setAttribute('aria-selected',String(isActive));
  button.classList.toggle('is-active',isActive);
 });
 smallMap();
}
function countBars(data,label,value,unit='registros'){
 if(!data.length)return '<div class="ti42c-blank">Sin datos suficientes para elaborar la distribución.</div>';
 const max=Math.max(1,...data.map(d=>d[value]));
 return '<div class="ti42c-bars">'+data.map(entry=>
  '<div class="ti42c-bars-row"><span title="'+escape(entry[label])+'">'+short(entry[label],55)+'</span><div class="ti42c-track"><i class="green" style="width:'+(100*entry[value]/max).toFixed(2)+'%"></i></div><strong>'+fmt(entry[value])+'</strong></div>'
 ).join('')+'</div><p class="ti42c-chart-note">Cantidad de filas, no contratos únicos certificados.</p>';
}
function renderLower(){
 const rows=visible.filter(r=>have(r.contract));
 const methodMap=new Map(),statusMap=new Map();
 for(const r of rows){
  const method=projects.getExtraRow?.(r.excelRow)?.selectionMethod||'Sin modalidad registrada';
  methodMap.set(method,(methodMap.get(method)||0)+1);
  const status=r.contractStatus||'Sin estado';
  statusMap.set(status,(statusMap.get(status)||0)+1);
 }
 const entries=map=>[...map].sort((a,b)=>b[1]-a[1]).map(([name,count])=>({name,count}));
 set('[data-ti42c-method-bars]',countBars(entries(methodMap),'name','count'));
 set('[data-ti42c-state-bars]',countBars(entries(statusMap),'name','count'));
 const priced=rows.filter(r=>Number.isFinite(r.budget)).sort((a,b)=>b.budget-a.budget).slice(0,7);
 const max=Math.max(1,...priced.map(r=>Math.max(r.budget,Number.isFinite(r.executedCost)?r.executedCost:0)));
 set('[data-ti42c-budget-bars]',priced.length?
  '<div class="ti42c-money-bars">'+priced.map(r=>'<div><span title="'+escape(r.contract||'')+'">'+short(r.contract,28)+'</span>'+
   '<div class="ti42c-finance-stacks"><i class="blue" style="width:'+(100*r.budget/max).toFixed(1)+'%"></i>'+
   (Number.isFinite(r.executedCost)?'<i class="green" style="width:'+(100*Math.max(0,r.executedCost)/max).toFixed(1)+'%"></i>':'<em>Sin costo ejecutado</em>')+'</div></div>').join('')+'</div><p class="ti42c-chart-note"><span class="ti42c-legend blue"></span>Costo total del proyecto <span class="ti42c-legend green"></span>Costo ejecutado · hasta 7 filas con importe más alto; valores en COP.</p>':
 '<div class="ti42c-blank">No hay importes numéricos para comparar.</div>');
 const indicators=[
  ['Fecha inicio contractual',r=>!!core.get(r.excelRow)?.contractStart],
  ['Fecha terminación contractual',r=>!!core.get(r.excelRow)?.contractEnd],
  ['Modalidad',r=>have(projects.getExtraRow?.(r.excelRow)?.selectionMethod)],
  ['Enlace SECOP registrado',r=>!!validUrl(r.secopUrl)],
  ['Objeto contractual',r=>have(core.get(r.excelRow)?.contractObject)]
 ];
 set('[data-ti42c-coverage]',indicators.map(([name,fn])=>{
  const count=rows.filter(fn).length;
  return '<div class="ti42c-coverage-row"><div><span>'+escape(name)+'</span><strong>'+count+' / '+rows.length+'</strong></div><div class="ti42c-track"><i class="green" style="width:'+(rows.length?100*count/rows.length:0).toFixed(1)+'%"></i></div></div>';
 }).join('')+'<p class="ti42c-chart-note">Disponibilidad de campos en las filas visibles; no es un indicador de cumplimiento.</p>');
}
function refresh(){
 if(!ready){label('[data-ti42c-status]',sourceError?'No se pudo leer el Excel: '+sourceError:'Cargando datos del Excel…');return;}
 visible=filterRows();
 if(!visible.some(r=>Number(r.excelRow)===Number(state.selected)))state.selected=visible[0]?.excelRow||null;
 selected=visible.find(r=>Number(r.excelRow)===Number(state.selected))||null;
 label('[data-ti42c-context]',globalFilters.meta==='all'?'Todas las metas':globalFilters.meta==='none'?'Sin meta registrada':'Meta '+(globalFilters.meta||'—')+' · vigencia '+(globalFilters.year==='all'?'todas':globalFilters.year||'todas'));
 label('[data-ti42c-status]',visible.length+' registros visibles de '+scope.length+' vinculados a los filtros generales. '+(coreReady?'Detalle contractual cargado.':'Campos contractuales complementarios '+(coreError?'no disponibles: '+coreError:'cargando…')));
 kpis();renderTable();renderDetail();renderLower();keep();
}
async function loadCore(){
 try{
  const response=await fetch('data/uc42-contratos-core.b64.txt?v=20261108-contratos-v1',{cache:'no-cache'});
  if(!response.ok)throw Error('archivo contractual no encontrado');
  if(typeof DecompressionStream!=='function')throw Error('descompresión no compatible con este navegador');
  const raw=(await response.text()).trim();
  const data=Uint8Array.from(atob(raw),character=>character.charCodeAt(0));
  const plain=await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
  const parsed=JSON.parse(plain);
  if(parsed.schema!==1||parsed.sheet!=='Proyectos DEFINITIVO'
     ||!Array.isArray(parsed.fields)||parsed.fields.join('|')!==CORE_FIELDS.join('|')
     ||!Array.isArray(parsed.rows)||!parsed.rows.every(row=>Array.isArray(row)&&row.length===CORE_FIELDS.length))
    throw Error('esquema contractual inesperado');
  const next=new Map(parsed.rows.map(row=>[Number(row[0]),Object.fromEntries(parsed.fields.map((name,i)=>[name,row[i]]))]));
  if(next.size!==parsed.rows.length)throw Error('filas de origen duplicadas');
  core=next;coreReady=true;coreError=null;
  if(ready&&source.some(r=>!core.has(Number(r.excelRow))))coreError='algunos registros no tienen detalle complementario';
 }catch(e){coreError=e.message;coreReady=false;core=new Map();}
 if(!sheet.hidden)refresh();
}
function changePage(delta){
 const max=Math.max(1,Math.ceil(visible.length/state.size));
 state.page=Math.max(1,Math.min(max,state.page+delta));
 selected=visible[(state.page-1)*state.size]||null;
 state.selected=selected?.excelRow||null;
 state.detail='informacion';renderTable();renderDetail();keep();
}
sheet.addEventListener('click',event=>{
 const choose=event.target.closest('[data-ti42c-select]');
 if(choose){state.selected=Number(choose.dataset.ti42cSelect);summary.selectRow(state.selected);state.detail='informacion';refresh();return;}
 const detail=event.target.closest('[data-ti42c-detail]');
 if(detail){state.detail=detail.dataset.ti42cDetail;renderDetail();keep();return;}
 const p=event.target.closest('[data-ti42c-presence]');
 if(p){state.presence=p.dataset.ti42cPresence;state.page=1;q('[data-ti42c-filter="presence"]').value=state.presence;refresh();return;}
 if(event.target.closest('[data-ti42c-prev]')){changePage(-1);return;}
 if(event.target.closest('[data-ti42c-next]')){changePage(1);return;}
 if(event.target.closest('[data-ti42c-reset]')){state.presence='yes';state.method='all';state.query='';state.sort='file';state.page=1;syncFilters();refresh();return;}
 if(event.target.closest('[data-ti42c-export]')){exportCSV();return;}
 if(event.target.closest('[data-ti42c-project]')&&selected){
   projects.openProject?.(Number(selected.excelRow),'contratos');
   return;
 }
 if(event.target.closest('[data-ti42c-focus]')&&selected?.vereda){maps?.focus?.(selected.vereda,true);return;}
});
sheet.addEventListener('input',event=>{const inp=event.target.closest('[data-ti42c-query]');if(!inp)return;state.query=inp.value;state.page=1;refresh();});
sheet.addEventListener('change',event=>{
 const f=event.target.closest('[data-ti42c-filter]');
 if(f){state[f.dataset.ti42cFilter]=f.value;state.page=1;refresh();return;}
 const size=event.target.closest('[data-ti42c-size]');
 if(size){state.size=Number(size.value);state.page=1;refresh();}
});
const syncFilters=()=>{
 q('[data-ti42c-filter="presence"]').value=state.presence;
 q('[data-ti42c-filter="sort"]').value=state.sort;
 q('[data-ti42c-query]').value=state.query;
 q('[data-ti42c-size]').value=String(state.size);
 q('[data-ti42c-filter="method"]').value=state.method;
};
function startMap(){
 if(sheet.hidden||section.hidden||maps||mapBusy||!window.TISubachoqueMap)return;
 const host=q('[data-ti42c-map]');if(!host)return;
 mapBusy=true;
 window.TISubachoqueMap.mount(host,{onSelect:()=>{}}).then(map=>{
  maps=map;map?.invalidateSize?.();
 }).catch(()=>{mapBusy=false;host.textContent='No se pudo cargar la cartografía territorial.';});
}
function exportCSV(){
 const columns=[['Fila del Excel',r=>r.excelRow],['Número de contrato',r=>r.contract],['Vigencia',r=>r.year],['Proyecto',r=>r.name],['BPIN',r=>r.bpin],['Modalidad de selección',r=>projects.getExtraRow?.(r.excelRow)?.selectionMethod],['Contratista',r=>r.contractor],['Estado de contrato',r=>r.contractStatus],['Objeto contractual',r=>core.get(r.excelRow)?.contractObject],['Inicio contrato',r=>core.get(r.excelRow)?.contractStart],['Terminación contrato',r=>core.get(r.excelRow)?.contractEnd],['Costo total proyecto',r=>r.budget],['Costo ejecutado',r=>r.executedCost],['SECOP',r=>r.secopUrl]];
 const cell=v=>{
  const txt=String(v??'');const protectedText=/^[\s]*[=+\-@\t\r]/.test(txt)?"'"+txt:txt;
  return '"'+protectedText.replace(/"/g,'""')+'"';
 };
 const csv='\uFEFF'+columns.map(c=>cell(c[0])).join(';')+'\r\n'+visible.map(r=>columns.map(c=>cell(c[1](r))).join(';')).join('\r\n');
 const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download='unidad-cumplimiento-contratos-filtrados.csv';
 document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
syncFilters();
summary.onChange(snapshot=>{
 state.selected=snapshot.selectedRow;
 source=snapshot.rows||[];globalFilters=snapshot.state||{};ready=!!snapshot.loaded;sourceError=snapshot.error||null;updateCount++;
 if(ready&&extraReady)methods();
 if(!sheet.hidden)refresh();
});
projects.onExtraChange?.(()=>{extraReady=true;if(ready){methods();if(!sheet.hidden)refresh();}});
loadCore();
function renderIfActive(){
 if(sheet.hidden||section.hidden)return;
 if(ready){if(extraReady)methods();refresh();}
 requestAnimationFrame(()=>{if(!sheet.hidden){startMap();maps?.invalidateSize?.();}});
}
function openContract(rowNumber){
 const id=Number(rowNumber);
 if(!source.some(r=>Number(r.excelRow)===id))return false;
 state.presence='all';state.method='all';state.query='';state.sort='file';state.detail='informacion';
 state.selected=id;summary.selectRow(id);state.page=1;syncFilters();
 projects.setView('contratos');
 if(ready){
  if(extraReady)methods();refresh();
  const at=visible.findIndex(r=>Number(r.excelRow)===id);
  if(at>=0){state.page=Math.floor(at/state.size)+1;state.selected=id;refresh();}
 }
 keep();return true;
}
window.TI42Contratos={
 openContract,renderIfActive,
 get state(){return {...state};},
 get loaded(){return ready;},
 get coreReady(){return coreReady;},
 get filteredCount(){return visible.length;},
 get baseCount(){return scope.length;},
 get selectedRow(){return selected?.excelRow||null;},
 get updates(){return updateCount;},
 get error(){return coreError||sourceError||null;}
};
projects.setView?.(projects.state.view);
})();
