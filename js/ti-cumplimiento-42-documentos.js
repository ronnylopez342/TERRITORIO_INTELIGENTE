/* Territorio Inteligente · 4.2 Documentos del Proyecto
 * Expediente documental por fila real de Proyectos DEFINITIVO.
 * Solo fotografías certificadas por catálogo en galerías; SECOP es referencia, no PDF.
 */
(function TI42Documentos(){
'use strict';
const section=document.querySelector('#cumplimiento-proyectos');
const shell=section?.querySelector('.ti42'),tabs=shell?.querySelector('.ti42-tabs');
const summary=window.TI42Summary,projects=window.TI42Proyectos;
if(!section||!shell||!tabs||!summary?.onChange||!projects?.setView)return;
const KEY='ti:uc42:documentos:v1',CATALOG='data/uc42-documentos-verificados.json?v=20261109-docs-v1';
const STAGES=[
 {id:'antes',title:'ANTES',subtitle:'Estado inicial del proyecto',color:'#d93046',glyph:'●'},
 {id:'durante',title:'DURANTE',subtitle:'Registro de ejecución',color:'#e7a300',glyph:'⚒'},
 {id:'despues',title:'DESPUÉS',subtitle:'Registro posterior',color:'#0b9362',glyph:'✓'}
];
const TABS=[
 {id:'fotos',name:'Seguimiento Fotográfico',icon:'▣'},
 {id:'videos',name:'Videos',icon:'▶'},
 {id:'tecnicos',name:'Documentos Técnicos',icon:'▤'},
 {id:'planos',name:'Planos',icon:'▥'},
 {id:'actas',name:'Actas',icon:'♧'},
 {id:'otros',name:'Otros',icon:'◩'}
];
const escapeHTML=v=>String(v==null?'':v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const string=v=>String(v==null?'':v).replace(/\s+/g,' ').trim();
const numeric=v=>typeof v==='number'&&Number.isFinite(v);
const short=(v,max=60)=>{const s=string(v);return escapeHTML(s.length>max?s.slice(0,max-1).trimEnd()+'…':s);};
const fmt=v=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:1}).format(v);
const fullMoney=v=>numeric(v)?new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(v):null;
const money=v=>numeric(v)?Math.abs(v)>=1000000?'$ '+fmt(v/1000000)+' M':'$ '+fmt(v):'No registrado';
const date=v=>/^\d{4}-\d\d-\d\d$/.test(v||'')&&!Number.isNaN(Date.parse(v+'T00:00:00Z'))?v.slice(8)+'/'+v.slice(5,7)+'/'+v.slice(0,4):'No registrada';
const safeURL=v=>{try{const url=new URL(string(v));return url.protocol==='https:'&&url.hostname.includes('.')?url.href:null;}catch{return null;}};
const imageMime=m=>/^image\/(jpeg|png|webp|gif|avif)$/i.test(string(m));
const imagePath=u=>/\.(jpe?g|png|webp|gif|avif)(?:\?|#|$)/i.test(u||'');
const videoPath=u=>/\.(mp4|webm|ogg)(?:\?|#|$)/i.test(u||'');
const pdfPath=u=>/\.pdf(?:\?|#|$)/i.test(u||'');
const normalized=v=>string(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const validStage=id=>STAGES.some(s=>s.id===id);
const validType=id=>['foto','video','tecnico','plano','acta','otro'].includes(id);
let stored={};try{stored=JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch{}
const state={
 row:Number.isSafeInteger(Number(stored.row))&&Number(stored.row)>0?Number(stored.row):null,
 tab:TABS.some(t=>t.id===stored.tab)?stored.tab:'fotos',
 indexes:{antes:0,durante:0,despues:0},focused:validStage(stored.focused)?stored.focused:'antes'
};
let source=[],shared={},loaded=false,sourceError=null,extrasReady=false,files=[],docsStatus='loading',docsError=null,skipped=0;
let selected=null,scopedRows=[],mapInstance=null,mapPending=false,viewerStage=null,viewerIndex=0,renderCount=0;
let zipBusy=false,lastError=null,projectPinned=false;
const q=s=>panel.querySelector(s),set=(s,markup)=>{const el=q(s);if(el)el.innerHTML=markup;};
const text=(s,value)=>{const el=q(s);if(el)el.textContent=String(value??'');};
const keep=()=>{try{localStorage.setItem(KEY,JSON.stringify({row:state.row,tab:state.tab,focused:state.focused}));}catch{}};
const rowNo=r=>Number(r?.excelRow);
const extra=r=>projects.getExtraRow?.(rowNo(r))||{};
function isProjectVisible(row){
 if(shared.meta&&shared.meta!=='all'&&(shared.meta==='none'?!!row.meta:row.meta!==shared.meta))return false;
 if(shared.year&&shared.year!=='all'&&(shared.year==='none'?!!row.year:row.year!==shared.year))return false;
 if(shared.status&&shared.status!=='all'&&(shared.status==='none'?!!row.contractStatus:row.contractStatus!==shared.status))return false;
 if(shared.sector&&shared.sector!=='all'&&(shared.sector==='none'?!!row.sectorMGA:row.sectorMGA!==shared.sector))return false;
 if(shared.q&&!normalized([row.name,row.bpin,row.contract,row.item,row.vereda,row.sectorMGA,row.meta].join(' ')).includes(normalized(shared.q)))return false;
 return true;
}
const header=document.createElement('header');
header.dataset.ti42dHead='1';header.className='ti42d-heading';header.hidden=true;
header.innerHTML='<div class="ti42d-heading-main"><div class="ti42d-heading-icon">▤</div><div><h2>Documentos del Proyecto</h2>'+
 '<p>Evidencias documentales y seguimiento fotográfico del proyecto estratégico</p></div></div>'+
 '<div class="ti42d-heading-status"><span>▣</span><div><small>Última actualización de fuente</small><b data-ti42d-updated>Sin fecha acreditada</b></div>'+
 '<em>Datos documentales</em></div>';
tabs.before(header);
const panel=document.createElement('section');
panel.className='ti42d';panel.dataset.ti42dRoot='1';panel.hidden=true;
panel.setAttribute('aria-label','Documentos por proyecto estratégico');
panel.innerHTML=[
 '<div class="ti42d-project-strip">',
  '<div class="ti42d-project-name"><span class="ti42d-project-glyph" aria-hidden="true">▥</span><div>',
   '<button type="button" data-ti42d-project-menu class="ti42d-project-name-button" title="Cambiar proyecto"><strong data-ti42d-project-name>Seleccionar proyecto</strong><span aria-hidden="true">⌄</span></button>',
   '<div class="ti42d-project-meta"><span data-ti42d-project-sector>No registrado</span><span class="ti42d-project-pill" data-ti42d-project-state>Sin estado registrado</span><span data-ti42d-outofscope class="ti42d-outofscope" hidden>Fuera de filtros generales</span></div>',
  '</div><div class="ti42d-project-popover" data-ti42d-project-popover hidden><label>Cambiar proyecto<select data-ti42d-project-select aria-label="Proyecto del expediente"></select></label></div></div>',
  '<div class="ti42d-project-stat"><small>Código BPIN</small><strong data-ti42d-bpin>—</strong></div>',
  '<div class="ti42d-project-stat"><small>Fecha inicio</small><strong data-ti42d-start>—</strong></div>',
  '<div class="ti42d-project-stat"><small>Fecha fin</small><strong data-ti42d-end>—</strong></div>',
  '<div class="ti42d-project-stat ti42d-project-money"><small>Valor total</small><strong data-ti42d-budget>—</strong></div>',
  '<div class="ti42d-project-stat ti42d-project-progress"><small>Avance físico</small><div><strong data-ti42d-progress-value>—</strong><i class="ti42d-track"><b data-ti42d-progress-bar></b></i></div></div>',
 '</div>',
 '<nav class="ti42d-subtabs" aria-label="Categorías de documentos" role="tablist">',
  TABS.map(t=>'<button type="button" role="tab" aria-selected="'+(t.id==='fotos'?'true':'false')+'" data-ti42d-tab="'+t.id+'" class="'+(t.id==='fotos'?'active':'')+'"><i>'+t.icon+'</i>'+t.name+'</button>').join(''),
 '</nav>',
 '<div class="ti42d-data-note" data-ti42d-data-note role="status" hidden></div>',
 '<div class="ti42d-layout">',
  '<main class="ti42d-main"><div data-ti42d-main></div></main>',
  '<aside class="ti42d-aside" aria-label="Información y vínculos del proyecto">',
   '<section class="ti42d-side-card ti42d-side-info"><h3>▣ Información del Proyecto</h3><div data-ti42d-info></div></section>',
   '<section class="ti42d-side-card ti42d-side-desc"><h3>▤ Descripción</h3><p data-ti42d-description>No se ha seleccionado un proyecto.</p><button type="button" data-ti42d-readmore hidden>Leer más</button></section>',
   '<section class="ti42d-side-card ti42d-side-location"><h3>⌖ Ubicación <button type="button" data-ti42d-map-open>▣ Ver en mapa</button></h3>',
    '<div class="ti42d-map-shell"><div data-ti42d-map data-ti-map data-ti-map-manual="1" class="ti42d-map-host" aria-label="Mapa municipal existente"></div></div>',
    '<small data-ti42d-place>Referencia territorial: sin vereda registrada.</small>',
   '</section>',
   '<section class="ti42d-side-card ti42d-side-links"><h3>▣ Enlaces de interés</h3><div class="ti42d-side-actions">',
    '<button type="button" data-ti42d-contract>▤ Ver Contrato</button>',
    '<button type="button" data-ti42d-technical>▤ Ficha Técnica</button>',
    '<button type="button" data-ti42d-download>⇩ Descargar Galería</button>',
   '</div><small data-ti42d-action-message role="status" aria-live="polite"></small></section>',
   '<div class="ti42d-motto"><span>❧</span><em>Territorios conectados, información verificable.</em></div>',
  '</aside>',
 '</div>',
 '<dialog data-ti42d-lightbox class="ti42d-lightbox" aria-label="Visor fotográfico">',
  '<div class="ti42d-lightbox-head"><div><strong data-ti42d-lightbox-title>Fotografía</strong><small data-ti42d-lightbox-meta></small></div><button type="button" data-ti42d-close-photo aria-label="Cerrar fotografía">×</button></div>',
  '<div class="ti42d-lightbox-photo"><button data-ti42d-view-prev type="button" aria-label="Foto anterior">‹</button><img data-ti42d-view-img alt="Fotografía del proyecto" /><button data-ti42d-view-next type="button" aria-label="Foto siguiente">›</button></div>',
  '<p data-ti42d-lightbox-desc></p>',
 '</dialog>',
 '<dialog data-ti42d-document-dialog class="ti42d-document-dialog" aria-label="Vista previa documental">',
  '<div class="ti42d-lightbox-head"><div><strong data-ti42d-document-title>Documento</strong><small data-ti42d-document-meta></small></div><button type="button" data-ti42d-close-document>×</button></div>',
  '<div data-ti42d-document-preview class="ti42d-document-preview"></div>',
 '</dialog>'
].join('');
tabs.after(panel);
function normalizeDocument(input){
 if(!input||typeof input!=='object'||Array.isArray(input)||input.verified!==true)return null;
 const documentId=string(input.documentId),sourceName=string(input.source),title=string(input.title),
  row=Number(input.projectExcelRow),type=string(input.type),fileUrl=safeURL(input.fileUrl),
  sourceUrl=safeURL(input.sourceUrl),stage=string(input.photoStage),mime=string(input.mimeType).toLowerCase();
 if(!documentId||!sourceName||!title||!Number.isSafeInteger(row)||row<=0||!validType(type))return null;
 if(type==='foto'&&(!validStage(stage)||!fileUrl||!(imageMime(mime)||imagePath(fileUrl))))return null;
 return {id:documentId,row,type,stage,title,description:string(input.description),fileUrl,sourceUrl,source:sourceName,
   recordedAt:string(input.recordedAt),uploadedAt:string(input.uploadedAt),mime,
   version:string(input.version),downloadAllowed:input.downloadAllowed===true,
   verified:true,finalizationVerified:input.finalizationVerified===true&&!!string(input.finalizationSource)};
}
async function loadCatalogue(){
 try{
  const response=await fetch(CATALOG,{cache:'no-cache'});
  if(!response.ok)throw Error('Catálogo documental HTTP '+response.status);
  const data=await response.json();
  if(data.schema!=='ti-uc42-documents-v1'||!Array.isArray(data.documents))throw Error('Esquema documental no válido');
  const unique=new Set(),approved=[];let rejected=0;
  for(const item of data.documents){
   const doc=normalizeDocument(item);
   if(!doc||unique.has(doc.id)){rejected++;continue;}
   unique.add(doc.id);approved.push(doc);
  }
  files=approved;skipped=rejected;docsStatus='ready';docsError=null;
  text('[data-ti42d-updated]',date(data.sourceUpdatedAt)==='No registrada'?'Sin fecha acreditada':date(data.sourceUpdatedAt));
 }catch(err){files=[];docsStatus='error';docsError=err?.message||'Error de consulta documental';}
 if(!panel.hidden)render();
}
function pick(){
 scopedRows=source.filter(isProjectVisible);
 const current=source.find(r=>rowNo(r)===state.row);
 if(!current){
  const desired=projects.selectedRow;
  selected=scopedRows.find(r=>rowNo(r)===Number(desired))||scopedRows[0]||null;
  state.row=selected?rowNo(selected):null;projectPinned=false;
 }else if(!projectPinned&&scopedRows.length&&!scopedRows.some(r=>rowNo(r)===state.row)){
  selected=scopedRows.find(r=>rowNo(r)===Number(projects.selectedRow))||scopedRows[0];
  state.row=rowNo(selected);
 }else selected=current;
 if(!selected&&source.length&&scopedRows.length===0){state.row=null;}
}
function projectDocs(){return files.filter(doc=>doc.row===state.row);}
function photos(stage){return projectDocs().filter(doc=>doc.type==='foto'&&doc.stage===stage).sort((a,b)=>{
 const da=/^\d{4}-\d\d-\d\d$/.test(a.recordedAt)?a.recordedAt:'9999-99-99';
 const db=/^\d{4}-\d\d-\d\d$/.test(b.recordedAt)?b.recordedAt:'9999-99-99';
 return da.localeCompare(db)||a.id.localeCompare(b.id,'es');
});}
function taggedLinks(){
 if(!selected)return[];
 const raw=[
  ['antes',selected.photoBefore,'Antes'],
  ['durante',selected.photoFollow,'Seguimiento'],
  ['despues',selected.photoAfter,'Después']
 ];
 return raw.map(([stage,url,label])=>({stage,url:safeURL(url),label})).filter(x=>x.url);
}
const forTab=id=>projectDocs().filter(d=>d.type===({videos:'video',tecnicos:'tecnico',planos:'plano',actas:'acta',otros:'otro'}[id]));
const srcKnown=(doc)=>doc?.fileUrl||doc?.sourceUrl||null;
function selectProject(value){
 const id=Number(value),row=source.find(r=>rowNo(r)===id);
 if(!row)return false;
 state.row=id;projectPinned=true;state.indexes={antes:0,durante:0,despues:0};state.focused='antes';
 q('[data-ti42d-project-popover]').hidden=true;
 render();return true;
}
function changeHeader(){
 text('[data-ti42d-project-name]',selected?.name||'No hay proyecto seleccionado');
 text('[data-ti42d-project-sector]',selected?.sectorMGA||'Sector no registrado');
 text('[data-ti42d-project-state]',selected?.contractStatus?'Estado contractual: '+selected.contractStatus:'Estado contractual no registrado');
 text('[data-ti42d-bpin]',selected?.bpin||'—');
 text('[data-ti42d-start]',selected?.start?date(selected.start):'—');
 text('[data-ti42d-end]',selected?.end?date(selected.end):'—');
 const budget=selected?.budget;
 text('[data-ti42d-budget]',money(budget));
 q('[data-ti42d-budget]').title=fullMoney(budget)||'No registrado';
 const progress=selected?.physicalPercent;
 text('[data-ti42d-progress-value]',numeric(progress)?fmt(progress)+' %':'Sin dato');
 q('[data-ti42d-progress-bar]').style.width=(numeric(progress)?Math.max(0,Math.min(100,progress)):0)+'%';
 const badge=q('[data-ti42d-outofscope]');if(badge)badge.hidden=!selected||scopedRows.some(r=>rowNo(r)===rowNo(selected));
 const picker=q('[data-ti42d-project-select]');
 picker.innerHTML=(scopedRows.length?scopedRows:source).map(row=>
  '<option value="'+rowNo(row)+'">'+short(row.name,80)+' · fila '+rowNo(row)+'</option>').join('');
 if(selected)picker.value=String(rowNo(selected));
 q('[data-ti42d-project-menu]').disabled=!source.length;
 q('[data-ti42d-project-menu]').title='Cambiar proyecto sin abandonar Documentos';
}
function displayTabs(){
 panel.querySelectorAll('[data-ti42d-tab]').forEach(btn=>{
  const on=btn.dataset.ti42dTab===state.tab;
  btn.classList.toggle('active',on);btn.setAttribute('aria-selected',String(on));
 });
}
function galleryCard(stage){
 const arr=photos(stage.id);
 const pos=Math.max(0,Math.min(arr.length-1,state.indexes[stage.id]||0));
 state.indexes[stage.id]=pos;
 const chosen=arr[pos]||null,has=!!chosen,verifiedFinal=chosen?.finalizationVerified;
 const sub=stage.id==='despues'&&verifiedFinal?'Proyecto finalizado':stage.subtitle;
 const thumbFirst=Math.max(0,Math.min(pos-1,Math.max(0,arr.length-3))),thumbs=arr.slice(thumbFirst,thumbFirst+3);
 const dateLabel=has?date(chosen.recordedAt):'Sin fecha';
 const image=has
  ?'<img src="'+escapeHTML(chosen.fileUrl)+'" data-ti42d-photo alt="'+escapeHTML(chosen.description||chosen.title)+'" loading="lazy" decoding="async">'+
    '<button type="button" data-ti42d-expand="'+stage.id+'" aria-label="Ampliar fotografía">⛶</button>'
  :'<div class="ti42d-photo-empty" aria-label="Sin fotografías verificadas"><span>▧</span><strong>Sin fotografías verificadas</strong>'+
   '<small>No se asignan imágenes de otras obras.</small></div>';
 const thumbsHTML=thumbs.map((doc,idx)=>{
  const actual=thumbFirst+idx;
  return '<button type="button" class="'+(actual===pos?'is-current':'')+'" data-ti42d-thumb="'+stage.id+'" data-ti42d-index="'+actual+'" aria-label="Fotografía '+(actual+1)+' de '+arr.length+'">'+
   '<img data-ti42d-thumb-image loading="lazy" decoding="async" alt="'+escapeHTML(doc.title)+'" src="'+escapeHTML(doc.fileUrl)+'"></button>';
 }).join('');
 return '<article class="ti42d-stage '+stage.id+'" data-ti42d-stage-card="'+stage.id+'">'+
  '<div class="ti42d-stage-head"><span class="ti42d-stage-icon">'+stage.glyph+'</span><div><strong>'+stage.title+'</strong><small>'+escapeHTML(sub)+'</small></div><span class="ti42d-stage-date">'+escapeHTML(dateLabel)+'</span></div>'+
  '<div class="ti42d-stage-hero">'+image+'</div>'+
  '<div class="ti42d-stage-caption">'+escapeHTML(has?chosen.description||chosen.title:'Sin registro fotográfico en esta etapa')+'</div>'+
  '<div class="ti42d-stage-thumbs"><button type="button" class="ti42d-arrow" data-ti42d-direction="-1" data-ti42d-for="'+stage.id+'" '+(pos<1?'disabled':'')+' aria-label="Fotografía anterior">‹</button>'+
   '<div class="ti42d-thumb-strip">'+(thumbsHTML||'<div class="ti42d-no-thumbs">Sin miniaturas disponibles</div>')+'</div>'+
   '<button type="button" class="ti42d-arrow" data-ti42d-direction="1" data-ti42d-for="'+stage.id+'" '+(pos>=arr.length-1?'disabled':'')+' aria-label="Fotografía siguiente">›</button></div>'+
 '</article>';
}
function photoTimeline(){
 return '<section class="ti42d-timeline"><h3>♧ Línea de tiempo del registro fotográfico</h3>'+
  '<div class="ti42d-timeline-track">'+STAGES.map(st=>{
   const list=photos(st.id),d=list.length?date(list[0].recordedAt):'Sin fecha registrada';
   const name=st.id==='antes'?'Registro inicial':st.id==='durante'?'Registro de ejecución':'Registro posterior';
   return '<button type="button" class="ti42d-timeline-point '+st.id+(state.focused===st.id?' active':'')+'" data-ti42d-focus="'+st.id+'">'+
    '<span class="ti42d-dot"></span><strong>'+escapeHTML(d)+'</strong><small>'+name+'</small>'+
    '<em>'+(list.length?list.length+' fotografía(s)':'Sin fotografías')+'</em></button>';
  }).join('')+'</div></section>';
}
function renderPhotos(){
 set('[data-ti42d-main]','<section class="ti42d-photo-section"><header><h3>▣ Evolución del Proyecto</h3>'+
 '<p>Registro fotográfico del antes, durante y después de la ejecución del proyecto.</p></header>'+
 '<div class="ti42d-gallery-row">'+STAGES.map(galleryCard).join('')+'</div></section>'+photoTimeline());
}
function evidenceCard(doc){
 const direct=srcKnown(doc),isPDF=doc.mime==='application/pdf'||pdfPath(doc.fileUrl),isImage=doc.type!=='foto'&&(imageMime(doc.mime)||imagePath(doc.fileUrl));
 return '<article class="ti42d-document-item"><span class="ti42d-document-item-icon">'+(doc.type==='video'?'▶':doc.type==='plano'?'▥':doc.type==='acta'?'▣':'▤')+'</span>'+
 '<div><strong>'+escapeHTML(doc.title)+'</strong><p>'+escapeHTML(doc.description||'Sin descripción registrada')+'</p>'+
 '<small>Fuente: '+escapeHTML(doc.source)+' · Registro: '+escapeHTML(date(doc.recordedAt))+'</small>'+
 (doc.version?'<small>Versión '+escapeHTML(doc.version)+'</small>':'')+'</div>'+
 '<div class="ti42d-document-actions">'+
 (direct?'<button type="button" data-ti42d-view-doc="'+escapeHTML(doc.id)+'">'+(isPDF||isImage?'Vista previa':'Consultar')+'</button>':'<span>Sin archivo enlazado</span>')+
 (doc.fileUrl&&doc.downloadAllowed?'<a href="'+escapeHTML(doc.fileUrl)+'" target="_blank" rel="noopener noreferrer" download>Descargar ↗</a>':'')+
 '</div></article>';
}
function renderList(){
 const collection=forTab(state.tab),words=TABS.find(t=>t.id===state.tab);
 let content='<section class="ti42d-files-section"><header><h3>'+words.icon+' '+words.name+'</h3>'+
 '<p>Archivos documentales asociados al proyecto seleccionado, sin mezclar referencias con archivos disponibles.</p></header>';
 if(collection.length){
  if(state.tab==='videos'){
   content+='<div class="ti42d-videos">'+collection.map(doc=>{
    const native=doc.fileUrl&&(doc.mime.startsWith('video/')||videoPath(doc.fileUrl));
    return '<article class="ti42d-video-item"><div class="ti42d-video-player">'+(native?'<video controls preload="metadata" src="'+escapeHTML(doc.fileUrl)+'"></video>':'<div class="ti42d-video-placeholder">▶</div>')+'</div>'+evidenceCard(doc)+'</article>';
   }).join('')+'</div>';
  }else content+='<div class="ti42d-document-list">'+collection.map(evidenceCard).join('')+'</div>';
 }else content+='<div class="ti42d-empty-category"><span>▤</span><strong>Sin '+escapeHTML(words.name.toLowerCase())+' verificados</strong>'+
 '<p>Este proyecto no tiene archivos acreditados en esta categoría.</p></div>';
 const x=selected?extra(selected):{};
 if(state.tab==='tecnicos'&&string(x.sourceDocuments))
  content+='<article class="ti42d-source-mention"><h4>Documentación mencionada en el Excel</h4>'+
    '<p>'+escapeHTML(x.sourceDocuments)+'</p><small>Referencia textual: no equivale a un archivo descargable o verificado.</small></article>';
 if(state.tab==='otros'&&selected){
  const refs=taggedLinks(),secop=safeURL(selected.secopUrl);
  if(secop||refs.length)content+='<article class="ti42d-source-mention"><h4>Referencias presentes en el archivo original</h4>'+
   (secop?'<p>Proceso SECOP: <a href="'+escapeHTML(secop)+'" target="_blank" rel="noopener noreferrer">Abrir fuente contractual ↗</a></p>':'')+
   refs.map(p=>'<p>Enlace fotográfico «'+escapeHTML(p.label)+'» (sin verificación): '+
    '<a href="'+escapeHTML(p.url)+'" target="_blank" rel="noopener noreferrer">Consultar enlace original ↗</a></p>').join('')+
   '<small>Las referencias no acreditan fotografías, actas ni documentos descargables.</small></article>';
 }
 if(state.tab==='otros'&&selected)content+='<button type="button" class="ti42d-evidence-shortcut" data-ti42d-evidences>Consultar evidencias del proyecto ↗</button>';
 content+='</section>';
 set('[data-ti42d-main]',content);
}
function renderMain(){
 if(state.tab==='fotos')renderPhotos();else renderList();
 displayTabs();
}
function progressMarkup(value){
 return numeric(value)?'<strong>'+escapeHTML(fmt(value))+'%</strong><span class="ti42d-side-progress"><i style="width:'+Math.max(0,Math.min(100,value))+'%"></i></span>':
 '<span class="ti42d-no-progress">Sin avance reportado</span>';
}
function field(label,value){
 return '<div class="ti42d-side-info-row"><dt>'+escapeHTML(label)+'</dt><dd>'+escapeHTML(value===null||value===undefined||value===''?'No registrado':value)+'</dd></div>';
}
function renderAside(){
 const r=selected,x=selected?extra(selected):{};
 const details=[
  field('Nombre',r?.name||null),field('Sector',r?.sectorMGA||null),
  field('Estado contractual',r?.contractStatus||null),
  '<div class="ti42d-side-info-row"><dt>Avance físico</dt><dd>'+progressMarkup(r?.physicalPercent)+'</dd></div>',
  field('Contratista',r?.contractor||null),
  field('Supervisor',r?.technicalResponsible||null),
  field('Valor total',numeric(r?.budget)?money(r.budget):null)
 ];
 set('[data-ti42d-info]','<dl>'+details.join('')+'</dl>');
 const description=string(x.description),hasMore=description.length>180;
 const p=q('[data-ti42d-description]');
 p.textContent=description||'Sin descripción oficial registrada en el complemento del proyecto.';
 p.classList.toggle('collapsed',hasMore);
 const more=q('[data-ti42d-readmore]');
 more.hidden=!hasMore;more.textContent='Leer más';more.setAttribute('aria-expanded','false');
 text('[data-ti42d-place]',r?.vereda?'Referencia territorial: '+r.vereda+'. La vereda no representa un punto exacto.':'No se registró ubicación verificable para esta obra.');
 q('[data-ti42d-map-open]').disabled=!r||!r.vereda;
 q('[data-ti42d-contract]').disabled=!r||!string(r.contract);
 q('[data-ti42d-technical]').disabled=!r;
 const count=projectDocs().filter(d=>d.type==='foto'&&d.downloadAllowed&&!!d.fileUrl).length;
 q('[data-ti42d-download]').disabled=count===0||zipBusy;
 q('[data-ti42d-download]').title=count?'Descargar '+count+' imagen(es) autorizada(s)':'Sin fotografías verificadas y autorizadas para descarga';
 text('[data-ti42d-action-message]',lastError||'');
 if(mapInstance&&r?.vereda){try{mapInstance.focus?.(r.vereda,false);}catch{}}
}
function render(){
 if(!loaded){text('[data-ti42d-project-name]',sourceError?'No se cargaron proyectos':'Cargando proyectos…');return;}
 const note=q('[data-ti42d-data-note]');if(note){note.hidden=docsStatus!=='error';if(docsStatus==='error')note.textContent='No se pudo consultar el catálogo documental: '+docsError+'. No se muestran archivos de ejemplo.';}
 pick();changeHeader();renderAside();renderMain();keep();renderCount++;
 if(!panel.hidden)requestAnimationFrame(mountMap);
}
function mountMap(){
 const host=q('[data-ti42d-map]');
 if(panel.hidden||section.hidden||!host?.isConnected)return;
 if(mapInstance){mapInstance.invalidateSize?.();return;}
 if(mapPending||!window.TISubachoqueMap)return;
 mapPending=true;
 window.TISubachoqueMap.mount(host,{onSelect:()=>{}}).then(api=>{
  mapInstance=api;mapPending=false;mapInstance.invalidateSize?.();
  if(selected?.vereda)try{mapInstance.focus?.(selected.vereda,false);}catch{}
 }).catch(()=>{mapPending=false;host.textContent='Mapa territorial no disponible';});
}
function selectTab(id){
 if(!TABS.some(t=>t.id===id))return;
 state.tab=id;renderMain();keep();
}
function selectThumb(stage,index){
 if(!validStage(stage))return;
 const list=photos(stage),n=Number(index);
 if(!Number.isSafeInteger(n)||n<0||n>=list.length)return;
 state.indexes[stage]=n;state.focused=stage;
 if(state.tab==='fotos')renderMain();keep();
}
function moveThumb(stage,delta){selectThumb(stage,(state.indexes[stage]||0)+delta);}
function showViewer(stage){
 const list=photos(stage);
 if(!list.length)return;
 viewerStage=stage;viewerIndex=Math.max(0,Math.min(list.length-1,state.indexes[stage]||0));
 renderViewer();q('[data-ti42d-lightbox]').showModal?.();
}
function renderViewer(){
 const list=photos(viewerStage),photo=list[viewerIndex];
 if(!photo){q('[data-ti42d-lightbox]').close?.();return;}
 text('[data-ti42d-lightbox-title]',selected?.name||'Documento fotográfico');
 text('[data-ti42d-lightbox-meta]',(STAGES.find(s=>s.id===viewerStage)?.title||'')+' · '+(viewerIndex+1)+' / '+list.length+' · '+date(photo.recordedAt));
 text('[data-ti42d-lightbox-desc]',photo.description||photo.title);
 const img=q('[data-ti42d-view-img]');
 img.src=photo.fileUrl;img.alt=photo.description||photo.title;
 q('[data-ti42d-view-prev]').disabled=viewerIndex===0;
 q('[data-ti42d-view-next]').disabled=viewerIndex===list.length-1;
 state.indexes[viewerStage]=viewerIndex;
}
function viewDocument(id){
 const doc=files.find(d=>d.id===id&&d.row===state.row);
 if(!doc)return;
 const url=doc.fileUrl||doc.sourceUrl;
 if(!url)return;
 if((doc.mime==='application/pdf'||pdfPath(url))&&doc.fileUrl){
  text('[data-ti42d-document-title]',doc.title);
  text('[data-ti42d-document-meta]','Fuente: '+doc.source+' · '+date(doc.recordedAt));
  set('[data-ti42d-document-preview]','<iframe src="'+escapeHTML(url)+'" title="'+escapeHTML(doc.title)+'"></iframe>'+
   '<p>Si la fuente bloquea el visor, <a target="_blank" rel="noopener noreferrer" href="'+escapeHTML(url)+'">abrir PDF original ↗</a>.</p>');
  q('[data-ti42d-document-dialog]').showModal?.();
 }else if((imageMime(doc.mime)||imagePath(url))&&doc.fileUrl){
  text('[data-ti42d-document-title]',doc.title);
  text('[data-ti42d-document-meta]','Fuente: '+doc.source+' · '+date(doc.recordedAt));
  set('[data-ti42d-document-preview]','<img alt="'+escapeHTML(doc.title)+'" src="'+escapeHTML(url)+'">');
  q('[data-ti42d-document-dialog]').showModal?.();
 }else window.open(url,'_blank','noopener,noreferrer');
}
function write16(a,v){a.push(v&255,(v>>8)&255);}
function write32(a,v){a.push(v&255,(v>>>8)&255,(v>>>16)&255,(v>>>24)&255);}
function crc32(data){
 let crc=-1;
 for(const v of data){crc^=v;for(let j=0;j<8;j++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}
 return (crc^-1)>>>0;
}
function makeZip(entries){
 const encoder=new TextEncoder(),chunks=[],central=[];
 let offset=0;
 const add=arr=>{chunks.push(arr instanceof Uint8Array?arr:new Uint8Array(arr));offset+=arr.length;};
 for(const entry of entries){
  const name=encoder.encode(entry.name),body=entry.body,size=body.byteLength,crc=crc32(body),start=offset;
  if(name.byteLength>255)throw Error('Nombre demasiado largo');
  const local=[];write32(local,0x04034b50);write16(local,20);write16(local,0);write16(local,0);write16(local,0);
  write16(local,33);write32(local,crc);write32(local,size);write32(local,size);write16(local,name.length);write16(local,0);
  add(local);add(name);add(body);
  const dir=[];write32(dir,0x02014b50);write16(dir,20);write16(dir,20);write16(dir,0);write16(dir,0);
  write16(dir,0);write16(dir,33);write32(dir,crc);write32(dir,size);write32(dir,size);
  write16(dir,name.length);write16(dir,0);write16(dir,0);write16(dir,0);write16(dir,0);write32(dir,0);write32(dir,start);
  central.push(new Uint8Array(dir),name);
 }
 const dirSize=central.reduce((n,x)=>n+x.length,0),dirStart=offset;
 for(const item of central)add(item);
 const tail=[];write32(tail,0x06054b50);write16(tail,0);write16(tail,0);write16(tail,entries.length);
 write16(tail,entries.length);write32(tail,dirSize);write32(tail,dirStart);write16(tail,0);
 add(tail);return new Blob(chunks,{type:'application/zip'});
}
async function downloadGallery(){
 if(zipBusy)return;
 const authorized=projectDocs().filter(doc=>doc.type==='foto'&&doc.downloadAllowed&&doc.fileUrl);
 if(!authorized.length){lastError='No hay fotografías autorizadas para descarga.';text('[data-ti42d-action-message]',lastError);return;}
 zipBusy=true;lastError=null;renderAside();
 try{
  if(authorized.length>35)throw Error('Demasiadas fotografías para una descarga única.');
  const entries=[],maxBytes=50*1024*1024;let total=0;
  for(const doc of authorized){
   const response=await fetch(doc.fileUrl,{mode:'cors',credentials:'omit'});
   if(!response.ok)throw Error('El archivo "'+doc.title+'" no se pudo descargar (HTTP '+response.status+').');
   const binary=new Uint8Array(await response.arrayBuffer());
   total+=binary.length;if(total>maxBytes)throw Error('El tamaño total de la galería supera 50 MB.');
   const ext=doc.mime==='image/png'?'.png':doc.mime==='image/webp'?'.webp':doc.mime==='image/avif'?'.avif':doc.mime==='image/gif'?'.gif':'.jpg';
   const name=doc.stage+'-'+String(entries.length+1).padStart(2,'0')+ext;
   entries.push({name,body:binary});
  }
  const zip=makeZip(entries),u=URL.createObjectURL(zip),a=document.createElement('a');
  a.href=u;a.download='galeria-proyecto-'+state.row+'.zip';document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(u),1500);
  lastError='Galería preparada: '+entries.length+' archivo(s) autorizados.';
  text('[data-ti42d-action-message]',lastError);
 }catch(err){
  lastError=(err?.message||'No se pudo preparar la descarga.')+' Las fuentes externas pueden impedir la descarga por CORS.';
  text('[data-ti42d-action-message]',lastError);
 }finally{zipBusy=false;renderAside();}
}
panel.addEventListener('click',event=>{
 const target=event.target;
 const menu=target.closest('[data-ti42d-project-menu]');if(menu){const pop=q('[data-ti42d-project-popover]');pop.hidden=!pop.hidden;return;}
 const sub=target.closest('[data-ti42d-tab]');if(sub){selectTab(sub.dataset.ti42dTab);return;}
 const thumb=target.closest('[data-ti42d-thumb]');if(thumb){selectThumb(thumb.dataset.ti42dThumb,thumb.dataset.ti42dIndex);return;}
 const move=target.closest('[data-ti42d-direction]');if(move){moveThumb(move.dataset.ti42dFor,Number(move.dataset.ti42dDirection));return;}
 const enlarge=target.closest('[data-ti42d-expand]');if(enlarge){showViewer(enlarge.dataset.ti42dExpand);return;}
 const focus=target.closest('[data-ti42d-focus]');if(focus){
  state.focused=focus.dataset.ti42dFocus;state.tab='fotos';renderMain();
  panel.querySelector('[data-ti42d-stage-card="'+state.focused+'"]')?.focus?.();keep();return;
 }
 if(target.closest('[data-ti42d-readmore]')){
  const desc=q('[data-ti42d-description]'),btn=q('[data-ti42d-readmore]');
  const open=desc.classList.toggle('collapsed');
  btn.textContent=open?'Leer más':'Leer menos';btn.setAttribute('aria-expanded',String(!open));return;
 }
 if(target.closest('[data-ti42d-map-open]')&&selected?.vereda){
  projects.setView('mapa');window.TI42Mapa?.selectRecord?.(state.row,true);return;
 }
 if(target.closest('[data-ti42d-contract]')&&selected?.contract){window.TI42Contratos?.openContract?.(state.row);return;}
 if(target.closest('[data-ti42d-technical]')&&selected){projects.openProject?.(state.row,'informacion');return;}
 if(target.closest('[data-ti42d-evidences]')&&selected){window.TI42Evidencias?.openProject?.(state.row);return;}
 if(target.closest('[data-ti42d-download]')){downloadGallery();return;}
 const doc=target.closest('[data-ti42d-view-doc]');if(doc){viewDocument(doc.dataset.ti42dViewDoc);return;}
 if(target.closest('[data-ti42d-close-photo]')){q('[data-ti42d-lightbox]')?.close?.();return;}
 if(target.closest('[data-ti42d-close-document]')){q('[data-ti42d-document-dialog]')?.close?.();return;}
 if(target.closest('[data-ti42d-view-prev]')){viewerIndex=Math.max(0,viewerIndex-1);renderViewer();return;}
 if(target.closest('[data-ti42d-view-next]')){viewerIndex=Math.min(photos(viewerStage).length-1,viewerIndex+1);renderViewer();return;}
});
panel.addEventListener('change',event=>{
 const selector=event.target.closest('[data-ti42d-project-select]');
 if(selector){selectProject(selector.value);return;}
});
panel.addEventListener('error',event=>{
 const img=event.target;if(img?.matches?.('img[data-ti42d-photo],img[data-ti42d-thumb-image]')){img.replaceWith(document.createTextNode('Imagen no disponible en la fuente.'));}
},true);
panel.addEventListener('keydown',event=>{
 const dialog=q('[data-ti42d-lightbox]');
 if(!dialog?.open)return;
 if(event.key==='ArrowRight'){event.preventDefault();viewerIndex=Math.min(photos(viewerStage).length-1,viewerIndex+1);renderViewer();}
 if(event.key==='ArrowLeft'){event.preventDefault();viewerIndex=Math.max(0,viewerIndex-1);renderViewer();}
});
summary.onChange(snapshot=>{
 const prior=loaded;
 source=snapshot.rows||[];shared=snapshot.state||{};loaded=!!snapshot.loaded;sourceError=snapshot.error||null;
 if(!prior&&!state.row&&projects.selectedRow)state.row=Number(projects.selectedRow);
 if(loaded&&!panel.hidden)render();
 else if(sourceError&&!panel.hidden)text('[data-ti42d-project-name]',sourceError);
});
projects.onExtraChange?.(()=>{extrasReady=true;if(loaded&&!panel.hidden)renderAside();});
loadCatalogue();
function renderIfActive(){
 if(panel.hidden||section.hidden)return;
 if(loaded)render();
 requestAnimationFrame(mountMap);
}
function openProject(rowId){
 const row=source.find(r=>rowNo(r)===Number(rowId));
 if(!row)return false;
 state.row=rowNo(row);projectPinned=true;state.tab='fotos';state.focused='antes';state.indexes={antes:0,durante:0,despues:0};
 projects.setView('documentos');render();return true;
}
window.TI42Documentos={
 renderIfActive,openProject,
 get loaded(){return loaded&&docsStatus==='ready';},
 get selectedRow(){return state.row;},get currentTab(){return state.tab;},
 get verifiedFiles(){return files.length;},get photos(){return files.filter(d=>d.type==='foto').length;},
 get scopeCount(){return scopedRows.length;},get renderCount(){return renderCount;},
 get error(){return sourceError||docsError;}
};
if(typeof MutationObserver==='function'){
 const observer=new MutationObserver(()=>{if(!section.hidden&&!panel.hidden)requestAnimationFrame(mountMap);});
 observer.observe(section,{attributes:true,attributeFilter:['hidden']});
}
projects.setView?.(projects.state.view);
})();