/* Territorio Inteligente · 4.2 Evidencias | Fuente: Excel Unidad de Cumplimiento */
(function TI42Evidencias(){
'use strict';
const section=document.querySelector('#cumplimiento-proyectos');
const shell=section?.querySelector('.ti42'),tabs=shell?.querySelector('.ti42-tabs');
const summary=window.TI42Summary,projects=window.TI42Proyectos;
if(!section||!shell||!tabs||!summary?.onChange||!projects?.setView)return;
const KEY='ti:uc42:evidencias:v1',PAGE_SIZE=10;
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const clean=v=>String(v==null?'':v).trim();
const short=(s,n=48)=>{const v=clean(s).replace(/\s+/g,' ');return esc(v.length>n?v.slice(0,n-1)+'…':v);};
const fmt=v=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:0}).format(v);
const safeURL=v=>{try{const u=new URL(clean(v));return u.protocol==='https:'&&u.hostname.includes('.')?u.href:null;}catch{return null;}};
const formatDate=v=>typeof v==='string'&&/^\d{4}-\d\d-\d\d$/.test(v)?v.slice(8)+'/'+v.slice(5,7)+'/'+v.slice(0,4):'Sin registrar';
const fileKind=url=>{
 if(!url)return 'external';
 const p=new URL(url).pathname.toLowerCase();
 if(/\.(jpe?g|png|gif|webp|avif)$/.test(p))return 'image';
 if(/\.pdf$/.test(p))return 'pdf';
 if(/\.(mp4|webm|ogg)$/.test(p))return 'video';
 if(/\.(docx?|odt)$/.test(p))return 'word';
 if(/\.(xlsx?|ods|csv)$/.test(p))return 'excel';
 return 'external';
};
const TYPE_INFO=[
 {id:'fotografia',title:'Fotografías',color:'#13b4d5'},
 {id:'informe',title:'Informes',color:'#1485e2'},
 {id:'acta',title:'Actas',color:'#f5ac23'},
 {id:'contrato',title:'Contratos',color:'#8b68d1'},
 {id:'certificado',title:'Certificaciones',color:'#7896cf'},
 {id:'plano',title:'Planos y Diseños',color:'#4599c8'},
 {id:'fuente',title:'Fuentes SECOP',color:'#1469bd'},
 {id:'otro',title:'Otros',color:'#8da4b9'}
];
const STATES=[
 {id:'validada',title:'Validadas',color:'#0ba47c'},
 {id:'revision',title:'En revisión',color:'#f28b0b'},
 {id:'observaciones',title:'Con observaciones',color:'#e93b46'},
 {id:'sin',title:'Sin estado registrado',color:'#7e9aac'}
];
let prev={};try{prev=JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch{}
const state={
 search:typeof prev.search==='string'?prev.search:'',
 project:typeof prev.project==='string'?prev.project:'all',
 type:typeof prev.type==='string'?prev.type:'all',
 status:typeof prev.status==='string'?prev.status:'all',
 since:typeof prev.since==='string'?prev.since:'',
 until:typeof prev.until==='string'?prev.until:'',
 page:Number(prev.page)||1,
 selectedId:typeof prev.selectedId==='string'?prev.selectedId:null
};
if(state.type!=='all'&&!TYPE_INFO.some(t=>t.id===state.type))state.type='all';
if(state.status!=='all'&&!STATES.some(t=>t.id===state.status))state.status='all';
if(!/^\d{4}-\d\d-\d\d$/.test(state.since))state.since='';
if(!/^\d{4}-\d\d-\d\d$/.test(state.until))state.until='';
let source=[],shared={},ready=false,error=null,records=[],base=[],filtered=[],selected=null,updates=0,extraReady=false;
const header=document.createElement('header');
header.dataset.ti42eHeader='1';header.className='ti42e-header';header.hidden=true;
header.innerHTML='<div class="ti42e-title"><span class="ti42e-logo" aria-hidden="true">▤</span><div><h2>Evidencias</h2><p>Consulta y visualización de las evidencias que soportan la ejecución de los proyectos estratégicos del municipio de Subachoque</p></div></div>'+
 '<div class="ti42e-source-label"><span aria-hidden="true">▣</span><div><strong>Origen de los datos</strong><small>Excel de Unidad de Cumplimiento · Actualización no acreditada</small></div><em>Fuente estática</em></div>';
tabs.before(header);
const panel=document.createElement('section');panel.dataset.ti42EvidenciasRoot='1';panel.hidden=true;
panel.innerHTML=[
 '<div class="ti42e">',
 '<section class="ti42e-kpis" data-ti42e-kpis aria-label="Indicadores documentales"></section>',
 '<div class="ti42e-charts">',
 '<article class="ti42e-box"><h3>▧ Evidencias por Tipo de Documento</h3><div data-ti42e-donut></div></article>',
 '<article class="ti42e-box"><h3>♧ Evidencias por Estado</h3><div data-ti42e-states></div></article>',
 '<article class="ti42e-box"><h3>✧ Evidencias por Proyecto (Top 5)</h3><div data-ti42e-top></div></article>',
 '</div>',
 '<section class="ti42e-filters" aria-label="Filtros del centro documental">',
 '<label class="ti42e-query"><span class="ti42e-search-icon" aria-hidden="true">⌕</span><input type="search" data-ti42e-search placeholder="Buscar evidencia por nombre, proyecto, contrato…" aria-label="Buscar evidencia" autocomplete="off"></label>',
 '<label>Proyecto<select data-ti42e-project aria-label="Filtrar proyecto"><option value="all">Todos los proyectos</option></select></label>',
 '<label>Tipo de documento<select data-ti42e-type aria-label="Filtrar tipo"><option value="all">Todos</option></select></label>',
 '<label>Estado<select data-ti42e-status aria-label="Filtrar estado"><option value="all">Todos</option></select></label>',
 '<label class="ti42e-date-label">Fecha de carga <span class="ti42e-date-pair"><input type="date" data-ti42e-since aria-label="Fecha de carga desde" title="Desde"><input type="date" data-ti42e-until aria-label="Fecha de carga hasta" title="Hasta"></span></label>',
 '<button type="button" class="ti42e-filter-btn" data-ti42e-apply>⚑ Filtrar</button>',
 '<button type="button" class="ti42e-reset-btn" data-ti42e-reset>Limpiar</button>',
 '</section>',
 '<section class="ti42e-table-layout">',
 '<article class="ti42e-box ti42e-list">',
 '<div class="ti42e-list-head"><h3>▤ Listado de Evidencias <span data-ti42e-list-total></span></h3><small data-ti42e-list-note></small></div>',
 '<div class="ti42e-table-scroll"><table class="ti42e-table"><thead><tr><th>#</th><th>Nombre de la Evidencia / Fuente</th><th>Proyecto</th><th>Tipo</th><th>Fecha de carga</th><th>Estado</th><th>Acciones</th></tr></thead><tbody data-ti42e-rows></tbody></table></div>',
 '<div class="ti42e-pages"><small data-ti42e-range></small><nav data-ti42e-pages aria-label="Paginación de evidencias"></nav></div>',
 '</article>',
 '<aside class="ti42e-box ti42e-preview">',
 '<h3>▣ Vista Previa de la Evidencia</h3>',
 '<div data-ti42e-preview-head></div>',
 '<div class="ti42e-preview-stage" data-ti42e-preview-stage></div>',
 '<div class="ti42e-preview-actions" data-ti42e-preview-actions></div>',
 '<div class="ti42e-described-docs" data-ti42e-declared></div>',
 '</aside></section>',
 '<footer data-ti42e-source class="ti42e-footer">Fuente: UNIDAD DE CUMPLIMIENTO(3).xlsx · Hoja Proyectos DEFINITIVO. Los enlaces SECOP remiten a procesos, no a PDFs certificados.</footer>',
 '<dialog class="ti42e-dialog" data-ti42e-image-dialog aria-label="Imagen de evidencia"><button type="button" data-ti42e-close-dialog aria-label="Cerrar">×</button><div data-ti42e-full-image></div></dialog>',
 '</div>'
].join('');
tabs.after(panel);
const q=sel=>panel.querySelector(sel),all=sel=>[...panel.querySelectorAll(sel)];
const set=(sel,markup)=>{const el=q(sel);if(el)el.innerHTML=markup;};
const put=(sel,v)=>{const el=q(sel);if(el)el.textContent=String(v??'');};
function keep(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}}
function build(){
 const dedup=new Set(),list=[];
 for(const row of source){
  for(const [kind,label,url] of [['before','Antes',row.photoBefore],['follow','Seguimiento',row.photoFollow],['after','Después',row.photoAfter]]){
   const href=safeURL(url);if(!href)continue;
   const uid='photo:'+row.excelRow+':'+kind;
   if(dedup.has(uid))continue;
   dedup.add(uid);
   list.push({id:uid,excelRow:Number(row.excelRow),project:row.name||'Registro sin nombre',bpin:row.bpin||'',contract:row.contract||'',name:'Fotografía · '+label,kind:'fotografia',url:href,mode:'file',format:fileKind(href),status:'sin',uploaded:null,vereda:row.vereda||''});
  }
  const href=safeURL(row.secopUrl);
  if(href){
   const uid='secop:'+row.excelRow;
   if(dedup.has(uid))continue;
   dedup.add(uid);
   list.push({id:uid,excelRow:Number(row.excelRow),project:row.name||'Registro sin nombre',bpin:row.bpin||'',contract:row.contract||'',name:'Proceso de contratación en SECOP'+(row.contract?' · '+row.contract:''),kind:'fuente',url:href,mode:'reference',format:'external',status:'sin',uploaded:null,vereda:row.vereda||''});
  }
 }
 return list.sort((a,b)=>a.excelRow-b.excelRow||a.id.localeCompare(b.id,'es'));
}
function matchScope(rec){
 const row=source.find(r=>Number(r.excelRow)===rec.excelRow);if(!row)return false;
 if(shared.meta!=='all'&&shared.meta!==undefined&&(shared.meta==='none'?Boolean(row.meta):row.meta!==shared.meta))return false;
 if(shared.year!=='all'&&shared.year!==undefined&&(shared.year==='none'?Boolean(row.year):row.year!==shared.year))return false;
 if(shared.status!=='all'&&shared.status!==undefined&&(shared.status==='none'?Boolean(row.contractStatus):row.contractStatus!==shared.status))return false;
 if(shared.sector!=='all'&&shared.sector!==undefined&&(shared.sector==='none'?Boolean(row.sectorMGA):row.sectorMGA!==shared.sector))return false;
 if(shared.q&&!norm([row.name,row.bpin,row.contract,row.vereda,row.sectorMGA,row.item].join(' ')).includes(norm(shared.q)))return false;
 return true;
}
function filterData(){
 base=records.filter(matchScope);
 filtered=base.filter(r=>{
  if(state.project!=='all'&&String(r.excelRow)!==state.project)return false;
  if(state.type!=='all'&&r.kind!==state.type)return false;
  if(state.status!=='all'&&r.status!==state.status)return false;
  if(state.search&&!norm([r.name,r.project,r.contract,r.bpin,r.kind,r.url].join(' ')).includes(norm(state.search)))return false;
  if(state.since&&(!r.uploaded||r.uploaded<state.since))return false;
  if(state.until&&(!r.uploaded||r.uploaded>state.until))return false;
  return true;
 });
 const pages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
 state.page=Math.max(1,Math.min(pages,Number(state.page)||1));
 if(!filtered.some(r=>r.id===state.selectedId))state.selectedId=filtered[0]?.id||null;
 selected=filtered.find(r=>r.id===state.selectedId)||null;
}
function refreshChoices(){
 const projectsMap=new Map();
 source.forEach(r=>{if(clean(r.name))projectsMap.set(String(r.excelRow),r.name);});
 const p=q('[data-ti42e-project]'),prior=state.project;
 p.innerHTML='<option value="all">Todos los proyectos</option>'+[...projectsMap].sort((a,b)=>a[1].localeCompare(b[1],'es'))
   .map(([id,name])=>'<option value="'+esc(id)+'">'+short(name,49)+'</option>').join('');
 if(state.project!=='all'&&!projectsMap.has(state.project))state.project='all';
 p.value=state.project;
 const presentTypes=new Set(records.map(r=>r.kind)),presentStates=new Set(records.map(r=>r.status));
 q('[data-ti42e-type]').innerHTML='<option value="all">Todos</option>'+TYPE_INFO.filter(t=>presentTypes.has(t.id)).map(t=>'<option value="'+t.id+'">'+esc(t.title)+'</option>').join('');
 q('[data-ti42e-status]').innerHTML='<option value="all">Todos</option>'+STATES.filter(t=>presentStates.has(t.id)).map(t=>'<option value="'+t.id+'">'+esc(t.title)+'</option>').join('');
 if(state.type!=='all'&&!presentTypes.has(state.type))state.type='all';
 if(state.status!=='all'&&!presentStates.has(state.status))state.status='all';
 q('[data-ti42e-type]').value=state.type;
 q('[data-ti42e-status]').value=state.status;
 q('[data-ti42e-search]').value=state.search;
 q('[data-ti42e-since]').value=state.since;
 q('[data-ti42e-until]').value=state.until;
}
function KPI(label,value,detail,tone,icon){
 return '<article class="ti42e-kpi '+tone+'"><span class="ti42e-kpi-icon">'+icon+'</span><div><small>'+esc(label)+'</small><strong>'+fmt(value)+'</strong><em>'+esc(detail)+'</em></div></article>';
}
function drawKpis(){
 const actualFiles=filtered.filter(r=>r.mode==='file'),refs=filtered.filter(r=>r.mode==='reference');
 const count=k=>filtered.filter(r=>r.status===k&&r.mode==='file').length;
 set('[data-ti42e-kpis]',[
 KPI('Total de Evidencias',actualFiles.length,'Archivos vinculados · '+refs.length+' fuentes SECOP','blue','▤'),
 KPI('Evidencias Validadas',count('validada'),'Sin certificados de validación','green','✓'),
 KPI('En Revisión',count('revision'),'Sin estados de revisión registrados','orange','◷'),
 KPI('Observaciones',count('observaciones'),'Sin observaciones de evidencias','red','!')
 ].join(''));
}
function donut(){
 const types=TYPE_INFO.map(o=>({...o,count:filtered.filter(r=>r.kind===o.id).length})).filter(o=>o.count>0),N=filtered.length;
 let off=0;
 const parts=types.map(t=>{const st=off;off+=N?t.count/N*100:0;return t.color+' '+st+'% '+off+'%';});
 const gradient=parts.length?'conic-gradient('+parts.join(',')+')':'conic-gradient(#dce7ef 0 100%)';
 const legend=types.map(t=>'<button type="button" data-ti42e-type-chart="'+t.id+'" aria-pressed="'+(state.type===t.id)+'"><i style="background:'+t.color+'"></i><span>'+esc(t.title)+'</span><b>'+Math.round(t.count/(N||1)*100)+'% ('+t.count+')</b></button>').join('');
 set('[data-ti42e-donut]','<div class="ti42e-donut-wrap"><div class="ti42e-donut" style="background:'+gradient+'"><div><strong>'+N+'</strong><small>Referencias</small></div></div><div class="ti42e-donut-legend">'+(legend||'<p>Sin archivos ni fuentes en la selección.</p>')+'</div></div>'+
 '<p class="ti42e-chart-note">Las referencias SECOP no constituyen archivos PDF.</p>');
}
function stateChart(){
 const N=filtered.length,max=Math.max(1,...STATES.map(st=>filtered.filter(r=>r.status===st.id).length));
 const cols=STATES.map(st=>{
  const count=filtered.filter(r=>r.status===st.id).length;
  const h=Math.max(0,count/max*100);
  return '<button type="button" data-ti42e-state-chart="'+st.id+'" title="'+esc(st.title)+': '+count+' registros" aria-pressed="'+(state.status===st.id)+'" class="ti42e-state-col">'+
  '<div class="ti42e-state-track"><span class="ti42e-state-count">'+count+'</span><i style="height:'+h+'%;background:'+st.color+'"></i></div>'+
  '<small>'+esc(st.title)+'</small></button>';
 }).join('');
 set('[data-ti42e-states]','<div class="ti42e-state-chart">'+cols+'</div><p class="ti42e-chart-note">'+N+' registros de fuente; los estados no están acreditados en el Excel.</p>');
}
function topChart(){
 const groups=new Map();
 for(const r of filtered){
  const id=String(r.excelRow),g=groups.get(id)||{id,name:r.project,count:0};g.count++;groups.set(id,g);
 }
 const items=[...groups.values()].sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name,'es')).slice(0,5);
 const top=Math.max(1,...items.map(x=>x.count));
 set('[data-ti42e-top]',items.length?'<div class="ti42e-top-chart">'+items.map((o,i)=>'<button type="button" data-ti42e-top-project="'+esc(o.id)+'" title="'+esc(o.name)+' · '+o.count+' referencias">'+
 '<span>'+short(o.name,37)+'</span><i><b style="width:'+((o.count/top)*100).toFixed(1)+'%;background:'+['#0d84ea','#05a36d','#f5b528','#47a6f1','#9063d7'][i]+'"></b></i><strong>'+o.count+'</strong></button>').join('')+
 '</div>':'<p class="ti42e-empty">Sin proyectos con fuentes documentales en la selección.</p>');
}
function drawGraphs(){donut();stateChart();topChart();}
function glyph(r){
 if(r.mode==='reference')return '<span class="ti42e-glyph external">↗</span>';
 if(r.format==='pdf')return '<span class="ti42e-glyph pdf">PDF</span>';
 if(r.format==='image')return '<span class="ti42e-glyph image">▧</span>';
 if(r.format==='word')return '<span class="ti42e-glyph word">W</span>';
 if(r.format==='excel')return '<span class="ti42e-glyph excel">X</span>';
 if(r.format==='video')return '<span class="ti42e-glyph video">▶</span>';
 return '<span class="ti42e-glyph external">▤</span>';
}
function badge(r){
 const st=STATES.find(s=>s.id===r.status)||STATES.at(-1);
 return '<span class="ti42e-status '+st.id+'"><i style="background:'+st.color+'"></i>'+esc(st.title)+'</span>';
}
function table(){
 put('[data-ti42e-list-total]','('+filtered.length+')');
 const references=filtered.filter(r=>r.mode==='reference').length,files=filtered.length-references;
 put('[data-ti42e-list-note]',files+' archivos · '+references+' referencias SECOP');
 const start=(state.page-1)*PAGE_SIZE,part=filtered.slice(start,start+PAGE_SIZE);
 const rows=part.map((r,i)=>{
  const active=selected?.id===r.id;
  const actions='<div class="ti42e-td-actions">'+
    '<button type="button" data-ti42e-view="'+esc(r.id)+'" title="Ver detalle y vista previa" aria-label="Ver '+esc(r.name)+'">◉</button>'+
    '<a title="'+(r.mode==='reference'?'Abrir fuente SECOP':'Abrir archivo original')+'" aria-label="Abrir fuente original" href="'+esc(r.url)+'" target="_blank" rel="noopener noreferrer">↗</a>'+
    '<details class="ti42e-menu"><summary aria-label="Más acciones">⋮</summary><div>'+
    '<button type="button" data-ti42e-go-project="'+r.excelRow+'">Ver proyecto</button>'+
    (r.contract?'<button type="button" data-ti42e-go-contract="'+r.excelRow+'">Ver contrato</button>':'')+
    '<button type="button" data-ti42e-copy="'+esc(r.id)+'">Copiar enlace</button>'+
    '</div></details></div>';
  return '<tr class="'+(active?'selected':'')+'"><td>'+(start+i+1)+'</td>'+
    '<td><button type="button" class="ti42e-doc-link" data-ti42e-view="'+esc(r.id)+'">'+glyph(r)+'<span>'+short(r.name,57)+'</span></button></td>'+
    '<td title="'+esc(r.project)+'">'+short(r.project,51)+'</td>'+
    '<td>'+esc(TYPE_INFO.find(t=>t.id===r.kind)?.title||'Otro')+'</td>'+
    '<td>'+esc(formatDate(r.uploaded))+'</td><td>'+badge(r)+'</td><td>'+actions+'</td></tr>';
 }).join('');
 set('[data-ti42e-rows]',rows||'<tr><td colspan="7" class="ti42e-empty-row">No hay evidencias o fuentes documentales con los filtros seleccionados.</td></tr>');
 const N=filtered.length,last=Math.min(N,start+PAGE_SIZE);
 put('[data-ti42e-range]',N?'Mostrando '+(start+1)+' a '+last+' de '+N+' registros':'No hay registros para mostrar');
 const pages=Math.max(1,Math.ceil(N/PAGE_SIZE));
 const btn=(page,label,disabled=false,selectedPage=false)=>'<button type="button" '+(disabled?'disabled':'data-ti42e-page="'+page+'"')+' aria-label="'+esc(label)+'"'+(selectedPage?' aria-current="page" class="current"':'')+'>'+esc(label)+'</button>';
 let html=btn(1,'«',state.page<=1)+btn(Math.max(1,state.page-1),'‹',state.page<=1);
 const from=Math.max(1,Math.min(pages-4,state.page-2)),to=Math.min(pages,from+4);
 for(let i=from;i<=to;i++)html+=btn(i,String(i),false,state.page===i);
 html+=btn(Math.min(pages,state.page+1),'›',state.page>=pages)+btn(pages,'»',state.page>=pages);
 set('[data-ti42e-pages]',html);
}
function inspectDeclared(rowNo){
 const extra=projects.getExtraRow?.(rowNo);
 const raw=clean(extra?.sourceDocuments);
 if(!raw)return '<p class="ti42e-empty-note">No existe listado textual de documentos para este registro.</p>';
 const items=raw.split(/\r?\n/).map(s=>s.replace(/^\s*[-•]+\s*/,'').trim()).filter(Boolean);
 return '<details class="ti42e-declared-list"><summary>Documentos mencionados en el Excel ('+items.length+')</summary>'+
 '<p>Son nombres consignados en el archivo; no se dispone de sus adjuntos ni de enlaces individuales. No se contabilizan como evidencias validadas.</p>'+
 '<ul>'+items.slice(0,80).map(v=>'<li>'+esc(v)+'</li>').join('')+'</ul>'+(items.length>80?'<small>Consulta el Excel original para el resto del listado.</small>':'')+'</details>';
}
function preview(){
 if(!selected){
  set('[data-ti42e-preview-head]','<div class="ti42e-preview-doc"><span class="ti42e-glyph external">▤</span><div><strong>Sin evidencia seleccionada</strong></div></div>');
  set('[data-ti42e-preview-stage]','<div class="ti42e-unavailable"><span>▤</span><strong>Vista previa no disponible</strong><p>No se encontraron archivos ni fuentes con estos filtros.</p></div>');
  set('[data-ti42e-preview-actions]','');
  set('[data-ti42e-declared]',state.project!=='all'?inspectDeclared(Number(state.project)):'');
  return;
 }
 const r=selected;
 set('[data-ti42e-preview-head]','<div class="ti42e-preview-doc">'+glyph(r)+'<div><strong>'+esc(r.name)+'</strong><span>'+short(r.project,66)+'</span><small>'+esc(r.mode==='reference'?'Fuente: SECOP · Fecha de carga no registrada':'Archivo enlazado · Fecha de carga no registrada')+'</small></div>'+badge(r)+'</div>');
 let content='';
 if(r.mode==='reference'){
  content='<div class="ti42e-unavailable"><span aria-hidden="true">↗</span><strong>Vista previa externa</strong>'+
   '<p>El enlace lleva a la ficha pública de un proceso en SECOP. No es un PDF ni garantiza acceso a los documentos sin permisos.</p>'+
   '<a href="'+esc(r.url)+'" target="_blank" rel="noopener noreferrer">Abrir fuente SECOP ↗</a></div>';
 }else if(r.format==='image'){
  content='<button type="button" class="ti42e-image-link" data-ti42e-expand title="Ampliar fotografía"><img src="'+esc(r.url)+'" alt="'+esc(r.name)+'" loading="lazy" referrerpolicy="no-referrer"></button>';
 }else if(r.format==='pdf'){
  content='<div class="ti42e-pdf-toolbar"><span>PDF · visor del navegador</span><a href="'+esc(r.url)+'" target="_blank" rel="noopener noreferrer">Abrir pantalla completa ↗</a></div>'+
  '<iframe src="'+esc(r.url)+'#toolbar=1" title="Vista previa PDF: '+esc(r.name)+'" loading="lazy" referrerpolicy="no-referrer"></iframe>';
 }else if(r.format==='video'){
  content='<video src="'+esc(r.url)+'" controls preload="metadata">El navegador no admite este video. <a href="'+esc(r.url)+'">Abrir fuente</a></video>';
 }else {
  content='<div class="ti42e-unavailable"><span aria-hidden="true">▣</span><strong>Vista previa no disponible</strong>'+
  '<p>El formato o proveedor no permite una vista previa fiable. Puedes abrir el archivo en su fuente original.</p>'+
  '<a href="'+esc(r.url)+'" target="_blank" rel="noopener noreferrer">Abrir archivo original ↗</a></div>';
 }
 set('[data-ti42e-preview-stage]',content);
 set('[data-ti42e-preview-actions]','<a href="'+esc(r.url)+'" target="_blank" rel="noopener noreferrer">↗ '+(r.mode==='reference'?'Abrir proceso SECOP':'Abrir archivo')+'</a>'+
 '<button type="button" data-ti42e-go-project="'+r.excelRow+'">Ver proyecto</button>'+
 (r.contract?'<button type="button" data-ti42e-go-contract="'+r.excelRow+'">Ver contrato</button>':'')+
 (r.vereda?'<button type="button" data-ti42e-go-map="'+r.excelRow+'">Ver referencia territorial</button>':''));
 set('[data-ti42e-declared]',inspectDeclared(r.excelRow));
}
function render(){
 updates++;
 if(!ready){
  set('[data-ti42e-kpis]','<p class="ti42e-empty">'+esc(error||'Consultando los datos documentales…')+'</p>');
  return;
 }
 filterData();drawKpis();drawGraphs();table();preview();keep();
 put('[data-ti42e-source]','Fuente: Excel UNIDAD DE CUMPLIMIENTO(3).xlsx · Proyectos DEFINITIVO. '+records.filter(r=>r.mode==='reference').length+
  ' enlaces SECOP y '+records.filter(r=>r.mode==='file').length+' enlaces fotográficos en el conjunto completo. No se acreditan fechas de carga ni estados de validación. Las referencias SECOP no equivalen a documentos descargables.');
}
function update(){
 state.search=q('[data-ti42e-search]').value;
 state.project=q('[data-ti42e-project]').value;
 state.type=q('[data-ti42e-type]').value;
 state.status=q('[data-ti42e-status]').value;
 state.since=q('[data-ti42e-since]').value;
 state.until=q('[data-ti42e-until]').value;
 state.page=1;render();
}
function reset(){
 Object.assign(state,{search:'',project:'all',type:'all',status:'all',since:'',until:'',page:1,selectedId:null});
 refreshChoices();render();
}
function viewIfActive(){if(panel.hidden||section.hidden)return;if(ready)render();}
function openProject(id){
 const row=source.find(r=>Number(r.excelRow)===Number(id));
 if(!row)return false;
 Object.assign(state,{project:String(row.excelRow),search:'',type:'all',status:'all',since:'',until:'',page:1,selectedId:null});
 refreshChoices();projects.setView('evidencias');if(ready)render();return true;
}
function select(id){
 const row=filtered.find(r=>r.id===id);if(!row)return;
 state.selectedId=id;const index=filtered.findIndex(r=>r.id===id);
 state.page=Math.floor(index/PAGE_SIZE)+1;table();preview();keep();
}
function openLink(id){
 const row=records.find(r=>r.id===id);if(!row)return;
 const safe=safeURL(row.url);if(safe)window.open(safe,'_blank','noopener,noreferrer');
}
panel.addEventListener('click',e=>{
 const type=e.target.closest('[data-ti42e-type-chart]');if(type){state.type=state.type===type.dataset.ti42eTypeChart?'all':type.dataset.ti42eTypeChart;q('[data-ti42e-type]').value=state.type;state.page=1;render();return;}
 const status=e.target.closest('[data-ti42e-state-chart]');if(status){state.status=state.status===status.dataset.ti42eStateChart?'all':status.dataset.ti42eStateChart;q('[data-ti42e-status]').value=state.status;state.page=1;render();return;}
 const project=e.target.closest('[data-ti42e-top-project]');if(project){state.project=state.project===project.dataset.ti42eTopProject?'all':project.dataset.ti42eTopProject;q('[data-ti42e-project]').value=state.project;state.page=1;render();return;}
 const view=e.target.closest('[data-ti42e-view]');if(view){select(view.dataset.ti42eView);return;}
 const pg=e.target.closest('[data-ti42e-page]');if(pg){state.page=Number(pg.dataset.ti42ePage);table();keep();return;}
 if(e.target.closest('[data-ti42e-apply]')){update();return;}
 if(e.target.closest('[data-ti42e-reset]')){reset();return;}
 const go=e.target.closest('[data-ti42e-go-project]');if(go){projects.openProject?.(go.dataset.ti42eGoProject,'evidencias');return;}
 const co=e.target.closest('[data-ti42e-go-contract]');if(co){window.TI42Contratos?.openContract?.(co.dataset.ti42eGoContract);return;}
 const map=e.target.closest('[data-ti42e-go-map]');if(map){projects.setView('mapa');window.TI42Mapa?.selectRecord?.(Number(map.dataset.ti42eGoMap),true);return;}
 const cp=e.target.closest('[data-ti42e-copy]');if(cp){const row=records.find(r=>r.id===cp.dataset.ti42eCopy);if(row?.url&&navigator.clipboard?.writeText){navigator.clipboard.writeText(row.url).then(()=>{cp.textContent='Copiado';}).catch(()=>{});}return;}
 if(e.target.closest('[data-ti42e-expand]')&&selected?.format==='image'){
  set('[data-ti42e-full-image]','<img alt="'+esc(selected.name)+'" src="'+esc(selected.url)+'">');
  q('[data-ti42e-image-dialog]')?.showModal?.();return;
 }
 if(e.target.closest('[data-ti42e-close-dialog]'))q('[data-ti42e-image-dialog]')?.close?.();
});
panel.addEventListener('input',e=>{
 if(e.target.matches('[data-ti42e-search]')){state.search=e.target.value;state.page=1;render();}
});
panel.addEventListener('change',e=>{
 if(e.target.closest('[data-ti42e-project],[data-ti42e-type],[data-ti42e-status],[data-ti42e-since],[data-ti42e-until]'))update();
});
summary.onChange(snapshot=>{
 source=snapshot.rows||[];shared=snapshot.state||{};ready=!!snapshot.loaded;error=snapshot.error||null;
 if(ready){records=build();refreshChoices();if(!panel.hidden)render();}
 else if(!panel.hidden)render();
});
projects.onExtraChange?.(()=>{extraReady=true;if(!panel.hidden&&ready)preview();});
window.TI42Evidencias={renderIfActive:viewIfActive,openProject,select,
 get loaded(){return ready;},get count(){return filtered.length;},get documents(){return records.filter(r=>r.mode==='file').length;},
 get sources(){return records.filter(r=>r.mode==='reference').length;},get error(){return error;},get updates(){return updates;}};
projects.setView(projects.state.view);
})();