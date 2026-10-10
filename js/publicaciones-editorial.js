/* Publicaciones 2.5 — catálogo editorial navegable y archivo local.
 * Las fichas precargadas son MUESTRAS VISUALES basadas en la imagen aprobada;
 * nunca se escriben en IndexedDB ni se sirven como documentos institucionales.
 * Las publicaciones cargadas por TIWorkspace se preservan y se complementan
 * con metadatos locales de autor, fuentes y revisión.
 */
(function(){
"use strict";
const root=document.getElementById("pubApp");
if(!root)return;
const $=id=>document.getElementById(id);
const text=value=>String(value??"");
const escape=value=>text(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const norm=value=>text(value).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
const dateText=iso=>{
 if(!iso)return"Por definir";
 const d=new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso)?iso+"T12:00:00Z":iso);
 return Number.isNaN(d.getTime())?"Por definir":new Intl.DateTimeFormat("es-CO",{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"}).format(d);
};
const pictures={
 featured:"assets/img/editorial/encuesta-subachoque-referencia.webp",
 coffee:"assets/img/editorial/servicio.jpg",
 school:"assets/img/editorial/pub-education.webp",
 environment:"assets/img/editorial/territorio-aereo.jpg",
 survey:"assets/img/editorial/participacion.jpg"
};
const items=Object.freeze([
 {id:"demo-diagnostico24",type:"informe",date:"2024-04-15",cover:"featured",author:"Ejemplo editorial · Subachoque",tag:"Territorio",title:"Diagnóstico territorial de Subachoque 2024",
  summary:"Un análisis integral de las dinámicas sociales, económicas, ambientales e institucionales que definen el territorio y sus oportunidades de desarrollo sostenible.",
  source:"Ficha ilustrativa basada en el diseño aprobado. No procede de una publicación institucional autenticada."},
 {id:"demo-boletin24",type:"boletin",date:"2024-03-28",cover:"coffee",author:"Ejemplo editorial · Economía",tag:"Economía",title:"Boletín económico Subachoque Q1 2024",
  summary:"Panorama económico, empleo y sectores estratégicos del municipio, presentado como muestra del catálogo de publicaciones.",
  source:"Ficha de demostración: cifras, autoría y archivo pendiente de validación."},
 {id:"demo-educacion24",type:"paper",date:"2024-02-18",cover:"school",author:"Ejemplo editorial · Educación",tag:"Educación",title:"Educación rural en Subachoque: avances y retos",
  summary:"Análisis de cobertura, calidad y permanencia en el sistema educativo rural del municipio.",
  source:"Ficha de demostración sin artículo original ni base de datos verificada."},
 {id:"demo-ambiente24",type:"informe",date:"2024-01-26",cover:"environment",author:"Ejemplo editorial · Ambiente",tag:"Ambiente",title:"Capital natural y servicios ecosistémicos",
  summary:"Valoración del patrimonio ambiental del municipio y su papel en el desarrollo territorial.",
  source:"Referencia de diseño; no se atribuye a una publicación oficial."},
 {id:"demo-encuesta23",type:"encuesta",date:"2023-12-10",cover:"survey",author:"Ejemplo editorial · Encuesta",tag:"Participación",title:"Encuesta de percepción ciudadana 2023",
  summary:"Resultados principales sobre la calidad de vida, los servicios y el gobierno local.",
  source:"Ficha de ejemplo; no representa respuestas reales de la caracterización."},
 {id:"demo-serie22",type:"serie",date:"2022-09-13",cover:"environment",author:"Ejemplo editorial · Datos",tag:"Estadística",title:"Evolución territorial en cifras 2018–2022",
  summary:"Una lectura de indicadores seleccionados y su evolución en el tiempo.",
  source:"Serie de muestra sin datos verificados ni documento adjunto."},
 {id:"demo-boletin21",type:"boletin",date:"2021-11-15",cover:"coffee",author:"Ejemplo editorial · Economía",tag:"Economía",title:"Boletín de economía territorial 2021",
  summary:"Ejemplo de comunicación de indicadores económicos locales.",
  source:"Publicación de demostración; sin archivo original."},
 {id:"demo-informe20",type:"informe",date:"2020-08-20",cover:"school",author:"Ejemplo editorial · Educación",tag:"Educación",title:"Informe de cobertura social y educativa 2020",
  summary:"Ejemplo de informe estadístico con enfoque municipal.",
  source:"Contenido ficticio de demostración."},
 {id:"demo-paper19",type:"paper",date:"2019-06-11",cover:"environment",author:"Ejemplo editorial · Ambiente",tag:"Ambiente",title:"Territorio, agua y sostenibilidad 2019",
  summary:"Ejemplo de paper sobre territorio y recursos naturales.",
  source:"Ficha ilustrativa sin documento académico comprobable."}
]);
const archiveCounts=[{year:2024,count:8},{year:2023,count:12},{year:2022,count:10},{year:2021,count:9},{year:2020,count:7},{year:2019,count:6}];
const names={informe:"INFORME",boletin:"BOLETÍN",paper:"PAPER",encuesta:"ENCUESTA",serie:"SERIE HISTÓRICA"};
const statusNames={borrador:"Borrador",pendiente:"Pendiente de revisión",revisada:"Revisada (local)",aprobada:"Aprobada (local)"};
const META_KEY="publication-catalog-meta-v1";
const state={type:"todos",year:"",search:"",metadata:{},local:[],loaded:false};
function filtered(){
 return items.filter(a=>(state.type==="todos"||a.type===state.type)&&(!state.year||a.date.slice(0,4)===state.year)&&(!state.search||norm([a.title,a.summary,a.author,a.tag,a.type].join(" ")).includes(norm(state.search))));
}
function smallCard(item){
 return '<article class="pub-small-card" data-id="'+escape(item.id)+'">'+
  '<div class="pub-small-cover" style="background-image:url(&quot;'+escape(pictures[item.cover])+'&quot;)"><span class="pub-type-chip" data-type="'+escape(item.type)+'">'+escape(names[item.type])+'</span></div>'+
  '<div class="pub-small-body"><h3>'+escape(item.title)+'</h3><p>'+escape(item.summary)+'</p>'+
  '<button type="button" class="pub-small-open" data-pub-open="'+escape(item.id)+'" aria-label="Leer ficha de ejemplo: '+escape(item.title)+'">›</button></div></article>';
}
function featuredCard(item){
 return '<article class="pub-feature-card" data-id="'+escape(item.id)+'">'+
  '<div class="pub-feature-cover" style="background-image:url(&quot;'+escape(pictures[item.cover])+'&quot;)"><span class="pub-feature-caption">INFORME DESTACADO</span></div>'+
  '<div class="pub-feature-content"><div class="pub-feature-meta"><span class="pub-type-chip" data-type="'+escape(item.type)+'">'+escape(names[item.type])+'</span><time datetime="'+escape(item.date)+'">'+escape(dateText(item.date))+'</time></div>'+
  '<h3>'+escape(item.title)+'</h3><p>'+escape(item.summary)+'</p>'+
  '<button type="button" class="pub-feature-read" data-pub-open="'+escape(item.id)+'">LEER PUBLICACIÓN <span class="pub-cta-arrow" aria-hidden="true">→</span></button>'+
  '<div class="pub-feature-resources">'+
  '<button type="button" data-pub-download="'+escape(item.id)+'"><span aria-hidden="true">⇩</span><b>Descargar PDF</b></button>'+
  '<button type="button" data-pub-sources="'+escape(item.id)+'"><span aria-hidden="true">▤</span><b>Ver datos fuente</b></button>'+
  '<button type="button" data-pub-open="'+escape(item.id)+'"><span aria-hidden="true">▣</span><b>Ficha técnica</b></button></div>'+
  '</div></article>';
}
function renderArchive(){
 const el=$("pubArchiveYears");if(!el)return;
 el.innerHTML=archiveCounts.map((a,i)=>
  '<button type="button" class="pub-year'+(state.year===String(a.year)||(!state.year&&i===0)?" is-active":"")+
  '" data-pub-year="'+a.year+'" aria-pressed="'+String(state.year===String(a.year))+'">'+
  '<strong>'+a.year+'</strong><small>'+a.count+' publicaciones</small><i aria-hidden="true">›</i></button>').join("");
}
function render(){
 const matches=filtered();
 const board=$("pubVisualGrid");
 if(!board)return;
 if(!matches.length){
  board.className="pub-visual-grid pub-visual-empty";
  board.innerHTML='<div class="pub-empty-card"><h3>No encontramos publicaciones de ejemplo con esos filtros.</h3>'+
   '<p>Cambia el tema, el año o el texto de búsqueda para explorar el catálogo ilustrativo.</p>'+
   '<button type="button" data-pub-reset>Mostrar todas las publicaciones</button></div>';
 }else{
  board.className="pub-visual-grid"+(matches.length===1?" pub-one-result":"");
  board.innerHTML=featuredCard(matches[0])+
   (matches.length>1?'<div class="pub-right-grid">'+matches.slice(1,5).map(smallCard).join("")+'</div>':'');
 }
 renderArchive();
 $("pubYear").value=state.year;
 document.querySelectorAll("#data-publicaciones [data-pub-filter]").forEach(button=>{
  const pressed=button.dataset.pubFilter===state.type;
  button.classList.toggle("is-active",pressed);
  button.setAttribute("aria-pressed",String(pressed));
 });
 const info=state.type==="todos"&&!state.year&&!state.search?"":matches.length+" ficha(s) de ejemplo";
 $("pubResultMeta").textContent=info;
 root.dataset.ready="true";
}
function findDemo(id){return items.find(item=>item.id===id);}
function showReader(id,what){
 const item=findDemo(id);
 if(!item)return;
 const dlg=$("pubReaderDialog"),body=$("pubReaderBody");
 const extra=what==="download"?"No hay un PDF original disponible para descargar en esta ficha ilustrativa.":
   what==="sources"?"No existe una base de datos original vinculada todavía a esta ficha ilustrativa.":
   "Esta publicación reproduce el diseño editorial; su contenido definitivo se incorporará con fuentes verificadas.";
 body.innerHTML='<p class="pub-tiny-label">SUBACHOQUE · '+escape(names[item.type])+'</p>'+
  '<h2 id="pubReaderTitle">'+escape(item.title)+'</h2>'+
  '<div class="pub-reader-meta"><span>'+escape(dateText(item.date))+'</span><span>'+escape(item.tag)+'</span><span>DEMO VISUAL</span></div>'+
  '<p>'+escape(item.summary)+'</p>'+
  '<p class="pub-reader-disclaimer">'+escape(extra)+'</p>'+
  '<dl class="pub-metadata"><dt>Tipo documental</dt><dd>'+escape(names[item.type])+'</dd>'+
  '<dt>Autoría</dt><dd>'+escape(item.author)+'</dd>'+
  '<dt>Fecha representada</dt><dd>'+escape(dateText(item.date))+'</dd>'+
  '<dt>Fuentes y datos</dt><dd>'+escape(item.source)+'</dd>'+
  '<dt>Documento original</dt><dd>No cargado: no se ofrece una descarga inexistente.</dd></dl>'+
  '<div class="pub-reader-actions"><button class="pub-yellow-button" type="button" data-pub-manage>Incorporar documento real →</button>'+
  '<button type="button" class="pub-outline-button" data-pub-close>Cerrar ficha</button></div>';
 if(!dlg.open)dlg.showModal();
}
function closeDialog(button){
 const dlg=button.closest("dialog");if(dlg?.open)dlg.close();
}
function openManage(){
 const dlg=$("pubManageDialog");
 if(!dlg.open)dlg.showModal();
 loadReal().catch(e=>{const status=$("pubReviewAlert");if(status)status.textContent="No fue posible consultar el repositorio local: "+e.message;});
}
async function loadReal(){
 if(!window.TIData)return;
 const [files,meta]=await Promise.all([TIData.read("publications"),TIData.read(META_KEY)]);
 state.local=Array.isArray(files)?files:[];
 state.metadata=meta&&typeof meta==="object"&&!Array.isArray(meta)?meta:{};
 state.loaded=true;
 renderLocal();
}
function statusOf(file){return state.metadata[file.id]?.status||"pendiente";}
function metadataOf(file){
 return state.metadata[file.id]||{title:file.name,type:inferType(file.name),summary:"",author:"",date:file.created?.slice(0,10)||"",sources:"",status:"pendiente"};
}
function inferType(name){
 const base=norm(name);
 if(base.includes("boletin"))return"boletin";
 if(base.includes("encuesta"))return"encuesta";
 if(base.includes("paper")||base.includes("articulo"))return"paper";
 if(base.includes("serie")||base.includes("historica"))return"serie";
 return"informe";
}
function renderLocal(){
 $("pubLocalCount").textContent=state.local.length+" archivo(s) guardados en este navegador";
 const pending=state.local.filter(f=>!["aprobada","revisada"].includes(statusOf(f))).length;
 $("pubReviewAlert").textContent=state.local.length?(pending+" publicación(es) pendientes de revisión en este navegador."):"Ningún archivo cargado todavía. Puedes añadir el primero arriba.";
 $("pubMetaList").innerHTML=state.local.map(file=>{
  const m=metadataOf(file);
  return '<article class="pub-meta-item"><div><strong>'+escape(m.title||file.name)+'</strong>'+
   '<small>'+escape(file.name)+' · '+escape(names[m.type]||"INFORME")+' · '+escape(m.author||"Sin autor identificado")+'</small></div>'+
   '<span>'+escape(statusNames[m.status]||statusNames.pendiente)+'</span>'+
   '<button type="button" data-pub-edit="'+escape(file.id)+'">Editar ficha →</button></article>';
 }).join("")||'<p class="pub-empty-local">No se han incorporado publicaciones originales todavía.</p>';
}
function editReal(id){
 const file=state.local.find(f=>f.id===id);if(!file)return;
 const meta=metadataOf(file);
 const set=(key,val)=>{const input=$("pubEdit"+key);if(input)input.value=val||"";};
 set("Id",id);set("Name",meta.title||file.name);set("Type",meta.type||"informe");
 set("Summary",meta.summary);set("Author",meta.author);set("Date",meta.date?.slice(0,10));
 set("Sources",meta.sources);set("Status",meta.status||"pendiente");
 const dlg=$("pubEditDialog");if(!dlg.open)dlg.showModal();
}
async function saveReal(event){
 event.preventDefault();
 const form=$("pubMetadataForm"),data=new FormData(form);
 const id=text(data.get("id"));
 const file=state.local.find(f=>f.id===id);if(!file)return;
 const next={
  title:text(data.get("title")).trim().slice(0,150),
  type:text(data.get("type")),summary:text(data.get("summary")).trim().slice(0,1000),
  author:text(data.get("author")).trim().slice(0,120),
  date:text(data.get("date")),
  sources:text(data.get("sources")).trim().slice(0,1200),
  status:text(data.get("status"))
 };
 if(!next.title){$("pubEditName").focus();return;}
 if(!Object.hasOwn(names,next.type)||!Object.hasOwn(statusNames,next.status))return;
 try{
  const updated={...state.metadata,[id]:next};
  await TIData.write(META_KEY,updated);
  state.metadata=updated;renderLocal();
  $("pubEditDialog").close();
 }catch(error){
  const paragraph=$("pubEditDialog").querySelector(".pub-edit-disclaimer");
  paragraph.textContent="No se pudo guardar la ficha en el navegador: "+error.message;
 }
}
function setup(){
 document.querySelectorAll("#data-publicaciones [data-pub-filter]").forEach(b=>{
  b.addEventListener("click",()=>{state.type=b.dataset.pubFilter;render();});
 });
 $("pubYear").addEventListener("change",event=>{state.year=event.target.value;render();});
 $("pubHeaderSearch")?.addEventListener("input",event=>{state.search=event.target.value;render();});
 $("pubVisualGrid").addEventListener("click",event=>{
  const b=event.target.closest("[data-pub-open],[data-pub-download],[data-pub-sources],[data-pub-reset]");
  if(!b)return;
  if(b.dataset.pubReset!==undefined){
   state.type="todos";state.year="";state.search="";
   $("pubHeaderSearch").value="";render();return;
  }
  const id=b.dataset.pubOpen||b.dataset.pubDownload||b.dataset.pubSources;
  showReader(id,b.dataset.pubDownload?"download":b.dataset.pubSources?"sources":"read");
 });
 $("pubArchiveYears").addEventListener("click",event=>{
  const btn=event.target.closest("[data-pub-year]");if(!btn)return;
  state.year=state.year===btn.dataset.pubYear?"":btn.dataset.pubYear;
  render();
  $("pubCatalogTitle").scrollIntoView({behavior:"smooth",block:"start"});
 });
 $("pubManageOpen").addEventListener("click",openManage);
 $("pubReaderBody").addEventListener("click",event=>{
  if(event.target.closest("[data-pub-manage]")){
   $("pubReaderDialog").close();openManage();
  }
 });
 for(const dlg of [$("pubReaderDialog"),$("pubManageDialog"),$("pubEditDialog")]){
  dlg.addEventListener("click",event=>{
   const b=event.target.closest("[data-pub-close]");
   if(b)closeDialog(b);
   else if(event.target===dlg)dlg.close();
  });
 }
 $("pubMetaList").addEventListener("click",event=>{
  const btn=event.target.closest("[data-pub-edit]");
  if(btn)editReal(btn.dataset.pubEdit);
 });
 $("pubMetadataForm").addEventListener("submit",saveReal);
 // TIWorkspace owns #publicationUpload and the primary IndexedDB files;
 // observe its existing grid instead of overriding that uploader.
 const grid=$("publicationGrid");
 if(grid){
  let queued=false;
  new MutationObserver(()=>{
   if(queued)return;queued=true;
   queueMicrotask(()=>{queued=false;loadReal().catch(()=>{});});
  }).observe(grid,{childList:true,subtree:false});
 }
 const upload=$("publicationUpload");
 if(upload){
  upload.addEventListener("change",()=>{
   // The existing TIWorkspace handles file persistence and grid refresh.
   $("pubLocalCount").textContent="Guardando archivo(s)…";
  });
 }
}
function start(){
 setup();render();
 // TIWorkspace.restore runs asynchronously, so wait for its grid renderer.
 if(window.TIData)loadReal().catch(()=>{});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});
else start();
window.TIPublicaciones25=Object.freeze({items,archiveCounts,names,state,filtered,loadReal,render});
})();