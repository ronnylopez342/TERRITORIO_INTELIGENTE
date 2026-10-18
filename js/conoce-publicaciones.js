/* Publicaciones dentro de 2.1 Conoce.
   Las seis portadas iniciales son muestras editoriales, NO documentos oficiales.
   Las publicaciones verificadas se leen del manifiesto versionado en Git y
   los archivos privados ya guardados por TIWorkspace se conservan en IndexedDB. */
(() => {
  'use strict';
  const root = document.getElementById('cn-publicaciones');
  if (!root) return;
  const $ = id => document.getElementById(id);
  const text = value => String(value ?? '');
  const escape = value => text(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const normalize = value => text(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const labels = Object.freeze({
    revista:'REVISTA',boletin:'BOLETÍN',paper:'PAPER',informe:'INFORME',
    grafico:'PRODUCTO GRÁFICO',ficha:'FICHA TÉCNICA',serie:'SERIE HISTÓRICA',
    visualizacion:'VISUALIZACIÓN',galeria:'GALERÍA',estudio:'ESTUDIO',
    encuesta:'ENCUESTA'
  });
  const statusNames = Object.freeze({
    borrador:'Borrador',pendiente:'Pendiente de revisión',
    revisada:'Revisada (local)',aprobada:'Aprobada (local)'
  });
  const META_KEY = 'publication-catalog-meta-v1';
  const images = Object.freeze({
    revista:'assets/img/editorial/encuesta-subachoque-referencia.webp',
    boletin:'assets/img/editorial/cn-pubs-boletin.svg',
    paper:'assets/img/editorial/cn-pubs-paper.svg',
    informe:'assets/img/editorial/cn-pubs-informe.svg',
    grafico:'assets/img/editorial/cn-pubs-atlas.svg',
    ficha:'assets/img/editorial/cn-pubs-ficha.svg',
    serie:'assets/img/editorial/territorio-aereo.jpg',
    estudio:'assets/img/editorial/gestion.jpg',
    visualizacion:'assets/img/editorial/alcaldia.jpg',
    galeria:'assets/img/editorial/comunidad.jpg',
    encuesta:'assets/img/editorial/participacion.jpg'
  });
  // Muestras de maquetación: ni fechas ni números atribuidos al municipio.
  const samples = Object.freeze([
    {id:'preview-revista',kind:'demo',type:'revista',title:'Revista Territorio 2025',coverTitle:'Revista|Territorio|2025',summary:'Datos, análisis e historias que muestran el municipio y sus comunidades.',caption:'Diseño de revista',date:'2025-03-01',cover:images.revista},
    {id:'preview-boletin',kind:'demo',type:'boletin',title:'Boletín económico municipal',coverTitle:'Boletín|económico|municipal',summary:'Panorama de la economía local y de las dinámicas productivas.',caption:'Diseño de boletín',date:'2025-02-01',cover:images.boletin},
    {id:'preview-paper',kind:'demo',type:'paper',title:'Paper de movilidad y espacio público',coverTitle:'Movilidad|y espacio|público',summary:'Ejemplo de un análisis especializado de movilidad en el territorio.',caption:'Diseño de paper',date:'2025-01-01',cover:images.paper},
    {id:'preview-grafico',kind:'demo',type:'grafico',title:'Atlas gráfico del municipio',coverTitle:'Atlas gráfico|del municipio',summary:'Mapas, infografías y visualizaciones de los datos municipales.',caption:'Diseño gráfico',date:'2024-12-01',cover:images.grafico},
    {id:'preview-informe',kind:'demo',type:'informe',title:'Informe de calidad de vida',coverTitle:'Informe de|calidad de|vida',summary:'Ejemplo de resultados e indicadores sociales y de bienestar.',caption:'Diseño de informe',date:'2024-11-01',cover:images.informe},
    {id:'preview-ficha',kind:'demo',type:'ficha',title:'Ficha territorial de población',coverTitle:'Ficha territorial|de población',summary:'Indicadores de población representados en un formato visual.',caption:'Diseño de ficha',date:'2024-10-01',cover:images.ficha}
  ]);
  const state = {type:'todos',query:'',all:false,slide:0,published:[],local:[],metadata:{},ready:false};
  const icon = {
    doc:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 2h10l4 4v16H5zM15 2v5h4M8 12h8M8 16h8"/></svg>',
    layers:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 10 5-10 5L2 7zm-10 10 10 5 10-5M2 17l10 5 10-5"/></svg>',
    calendar:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M7 2v6M17 2v6"/></svg>',
    chart:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V13h4v7M10 20V8h4v12M16 20V3h4v17M2 21h20"/></svg>',
    book:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6C9 4 5 4 2 4v15c4 0 7 0 10 2 3-2 6-2 10-2V4c-3 0-7 0-10 2Zm0 0v15"/></svg>',
    download:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v13m-5-5 5 5 5-5M4 18v3h16v-3"/></svg>'
  };
  function safeUrl(raw,category) {
    if (!raw || typeof raw !== 'string') return null;
    try {
      const url = new URL(raw, document.baseURI);
      if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) return null;
      const accepted = category === 'file' ? /^\/assets\/publicaciones\// : /^\/assets\//;
      return accepted.test(url.pathname) ? url.href : null;
    } catch { return null; }
  }
  function dateLabel(date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text(date))) return 'Fecha por confirmar';
    const d = new Date(date+'T12:00:00Z');
    if (Number.isNaN(d.getTime())) return 'Fecha por confirmar';
    return new Intl.DateTimeFormat('es-CO',{month:'long',year:'numeric',timeZone:'UTC'}).format(d);
  }
  function inferType(name) {
    const n=normalize(name);
    if (n.includes('revista')) return 'revista';
    if (n.includes('boletin')) return 'boletin';
    if (n.includes('paper')||n.includes('articulo')) return 'paper';
    if (n.includes('atlas')||n.includes('infograf')||n.includes('grafico')) return 'grafico';
    if (n.includes('ficha')) return 'ficha';
    if (n.includes('serie')) return 'serie';
    if (n.includes('estudio')) return 'estudio';
    if (n.includes('encuesta')) return 'encuesta';
    return 'informe';
  }
  function normalType(value) {
    const n=normalize(value).replace(/[^a-z]/g,'');
    return Object.hasOwn(labels,n)?n:inferType(value);
  }
  function makePublic(item,index) {
    if (!item || typeof item!=='object') return null;
    const title=text(item.titulo ?? item.title).trim().slice(0,150);
    const url=safeUrl(item.archivo ?? item.url,'file');
    if (!title || !url) return null;
    const type=normalType(item.tipo ?? item.type ?? title);
    const cover=safeUrl(item.portada ?? item.cover,'image') || images[type] || images.informe;
    return {id:'oficial-'+index,kind:'public',type,title,summary:text(item.resumen ?? item.summary ?? '').slice(0,400),
      coverTitle:title.replace(/\s+/g,' ').split(' ').reduce((a,w)=>{if(!a.length||a[a.length-1].length+w.length>16)a.push(w);else a[a.length-1]+=' '+w;return a;},[]).slice(0,4).join('|'),
      cover,caption:'Documento institucional',date:text(item.fecha ?? item.date ?? ''),url,filename:url.split('/').pop().split('?')[0],author:text(item.autor||'')};
  }
  async function loadPublic() {
    try {
      const response=await fetch('data/publicaciones.json',{cache:'no-store'});
      if (!response.ok) return;
      const payload=await response.json();
      const list=Array.isArray(payload)?payload:payload.publicaciones;
      state.published=Array.isArray(list)?list.map(makePublic).filter(Boolean):[];
    } catch(error){console.warn('Catálogo institucional no disponible:',error);}
    render();
  }
  function makeLocal(file) {
    if (!file || !file.blob) return null;
    const meta=state.metadata[file.id]||{};
    const title=text(meta.title || file.name).trim();
    const type=normalType(meta.type || inferType(file.name));
    return {id:'local-'+file.id,fileId:file.id,kind:'local',type,title,summary:text(meta.summary||'Archivo disponible solamente en este navegador.'),
      coverTitle:title.split(' ').reduce((a,w)=>{if(!a.length||a[a.length-1].length+w.length>16)a.push(w);else a[a.length-1]+=' '+w;return a;},[]).slice(0,4).join('|'),
      cover:images[type]||images.informe,caption:'Archivo local',date:meta.date||file.created?.slice(0,10)||'',filename:file.name,blob:file.blob};
  }
  async function loadLocal() {
    if (typeof TIData==='undefined') return;
    try {
      const [raw,metadata]=await Promise.all([TIData.read('publications'),TIData.read(META_KEY)]);
      state.metadata=metadata && typeof metadata==='object' && !Array.isArray(metadata) ? metadata : {};
      const files=Array.isArray(raw)?raw:[];
      state.local=files.map(makeLocal).filter(Boolean);
      renderManage();
      render();
    } catch(error) {
      const alert=$('pubReviewAlert');
      if(alert)alert.textContent='No se pudieron leer los archivos de este navegador: '+error.message;
    }
  }
  function entries() {
    const real=[...state.published,...state.local];
    const useExamples=real.length<6 ? samples : [];
    return [...real,...useExamples].filter(item=> (state.type==='todos'||item.type===state.type)
      && (!state.query || normalize([item.title,item.summary,item.type,labels[item.type]].join(' ')).includes(normalize(state.query))));
  }
  function cover(item,large=false) {
    const pieces=(item.coverTitle || item.title).split('|').map(escape);
    if(pieces.length>1 && /\b20\d{2}$/.test(pieces[pieces.length-1]))pieces[pieces.length-1]='<strong>'+pieces[pieces.length-1]+'</strong>';
    const img=encodeURI(item.cover || images.informe).replace(/['"()\\]/g,'');
    return '<div class="cn-pubs-cover'+(large?' cn-pubs-cover-large':'')+'" data-cover-kind="'+escape(item.kind)+'" data-cover-type="'+escape(item.type)+'" role="img" aria-label="Portada '+(item.kind==='demo'?'ilustrativa':'de catálogo')+': '+escape(item.title)+'" style="--pub-cover-img:url('+img+')">'+
      '<span class="cn-pubs-cover-mark">TERRITORIO<br>INTELIGENTE</span>'+
      '<span class="cn-pubs-cover-title">'+pieces.join('<br>')+'</span>'+
      '<span class="cn-pubs-cover-caption">'+escape(item.kind==='demo'?'VISTA DE EJEMPLO':item.caption||'PUBLICACIÓN')+'</span>'+
    '</div>';
  }
  function feature(item) {
    if(!item)return '<div class="cn-pubs-empty"><h4>No hay resultados</h4><p>Prueba otro término o categoría.</p></div>';
    const total=entries();
    const dots=total.slice(0,4).map((_,index)=>'<button type="button" data-cn-pubs-slide="'+index+'" aria-label="Destacada '+(index+1)+'" aria-current="'+String(index===state.slide)+'"></button>').join('');
    return '<div class="cn-pubs-feature-cover"><span class="cn-pubs-feature-sticker">'+'PUBLICACIÓN DESTACADA'+'</span>'+cover(item,true)+'</div>'+
      '<div class="cn-pubs-feature-copy"><span class="cn-pubs-type">'+escape(labels[item.type])+(item.kind==='demo'?' · EJEMPLO':item.kind==='local'?' · LOCAL':'')+'</span>'+
      '<h3>'+escape(item.title)+'</h3><span class="cn-pubs-date">'+escape(item.kind==='demo'?dateLabel(item.date)+' · Ejemplo editorial':dateLabel(item.date))+'</span>'+
      '<p class="cn-pubs-feature-desc">'+escape(item.summary)+'</p>'+
      '<div class="cn-pubs-feature-actions"><button type="button" class="cn-pubs-action cn-pubs-action-primary" data-cn-pubs-open="'+escape(item.id)+'">'+icon.book+'<span>Ver publicación</span><span aria-hidden="true">→</span></button>'+
      '<button type="button" class="cn-pubs-action" data-cn-pubs-download="'+escape(item.id)+'">'+icon.download+'<span>Descargar PDF</span></button></div>'+
      '<div class="cn-pubs-dots">'+dots+'</div></div>';
  }
  function card(item) {
    return '<article class="cn-pubs-card">'+cover(item)+
      '<div class="cn-pubs-card-body"><span class="cn-pubs-card-type">'+escape(labels[item.type])+(item.kind==='demo'?' · DEMO':item.kind==='local'?' · LOCAL':'')+'</span>'+
      '<h4>'+escape(item.title)+'</h4><p class="cn-pubs-card-date">'+escape(dateLabel(item.date))+'</p>'+
      '<p class="cn-pubs-card-desc">'+escape(item.summary)+'</p>'+
      '<button type="button" class="cn-pubs-card-action" data-cn-pubs-open="'+escape(item.id)+'">'+
      '<span>▣ &nbsp; Ver publicación</span><span aria-hidden="true">→</span></button></div></article>';
  }
  function updateStats() {
    const real=[...state.published,...state.local];
    const years=real.map(i=>i.date?.slice(0,4)).filter(s=>/^(19|20)\d{2}$/.test(s)).sort();
    $('cn-pubs-stat-count').textContent=String(real.length);
    $('cn-pubs-stat-years').textContent=years.length?(years[0]===years.at(-1)?years[0]:years[0]+'–'+years.at(-1)):'—';
    $('cn-pubs-stat-real').textContent=String(state.published.length);
    $('cn-pubs-stat-demo').textContent=String(samples.length);
    const available=$('cn-pubs-availability');
    available.textContent=state.published.length?state.published.length+' publicación(es) disponibles para todos.':
      'Las portadas de muestra son ilustrativas. Para que un archivo sea público debe incorporarse al catálogo institucional.';
  }
  function render() {
    const all=entries(),count=all.length;
    state.slide=count?((state.slide%count)+count)%count:0;
    $('cn-pubs-feature').innerHTML=feature(all[state.slide]);
    const cards=$('cn-pubs-catalog');
    const shown=state.all?all:all.slice(0,6);
    cards.innerHTML=shown.map(card).join('')||(count===0?'<div class="cn-pubs-empty"><h4>Sin publicaciones en esta categoría</h4><p>Selecciona otra categoría o borra el texto de búsqueda.</p></div>':'');
    cards.classList.toggle('is-extended',state.all&&shown.length>6);
    $('cn-pubs-see-all').textContent=state.all?'Ver menos ↑':'Ver todas las publicaciones →';
    $('cn-pubs-results').textContent=count+' elemento(s)'+(state.published.length===0?' · Muestras visuales y archivos locales':'');
    root.querySelectorAll('[data-cn-pubs-filter]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.cnPubsFilter===state.type)));
    updateStats();
    root.dataset.ready='true';
  }
  function lookup(id) {return [...state.published,...state.local,...samples].find(i=>i.id===id);}
  let objectURL=null;
  const modal=$('cn-pubs-viewer');
  function releaseBlob() {
    $('cn-pubs-viewer-content').replaceChildren();
    if(objectURL){URL.revokeObjectURL(objectURL);objectURL=null;}
  }
  async function openDocument(id,downloadOnly=false) {
    const item=lookup(id);if(!item)return;
    if(downloadOnly&&item.kind!=='demo'){
      const href=item.kind==='local'?(objectURL=URL.createObjectURL(item.blob)):item.url;
      const a=document.createElement('a');a.href=href;a.download=item.filename||item.title+'.pdf';document.body.append(a);a.click();a.remove();
      if(item.kind==='local'){setTimeout(()=>{if(objectURL){URL.revokeObjectURL(objectURL);objectURL=null;}},4000);}
      return;
    }
    releaseBlob();
    const content=$('cn-pubs-viewer-content'),link=$('cn-pubs-viewer-download'),status=$('cn-pubs-viewer-status');
    $('cn-pubs-viewer-title').textContent=item.title;
    link.hidden=true;link.removeAttribute('href');
    status.textContent=item.kind==='demo'?'MAQUETA / NO ES UNA PUBLICACIÓN OFICIAL':item.kind==='local'?'ARCHIVO DE ESTE NAVEGADOR':'DOCUMENTO MUNICIPAL';
    if(item.kind==='demo'){
      content.innerHTML='<div class="cn-pubs-viewer-placeholder"><h4>Portada de ejemplo</h4><p>Esta pieza representa cómo se verá el catálogo. Aún no corresponde a una revista, paper o boletín original incorporado y verificado. No se ofrece un archivo ficticio para leer o descargar.</p><p>Cuando se carguen publicaciones reales, estarán disponibles en este mismo visor.</p></div>';
    }else{
      const source=item.kind==='local'?(objectURL=URL.createObjectURL(item.blob)):item.url;
      if(item.kind==='public'){
        try{const res=await fetch(source,{method:'HEAD',cache:'no-store'});if(!res.ok)throw Error('Archivo no disponible');}
        catch(err){content.innerHTML='<div class="cn-pubs-viewer-placeholder"><h4>Documento no disponible</h4><p>No se pudo verificar el archivo original. Revisa su ruta en el repositorio institucional.</p></div>';modal.showModal();return;}
      }
      const name=(item.filename||'').toLowerCase().split('?')[0];
      if(/\.pdf$/i.test(name)){const frame=document.createElement('iframe');frame.title='Publicación original: '+item.title;frame.src=source+'#page=1';content.append(frame);}
      else if(/\.(png|jpe?g|webp)$/i.test(name)){const img=document.createElement('img');img.alt=item.title;img.src=source;content.append(img);}
      else{content.innerHTML='<div class="cn-pubs-viewer-placeholder"><h4>Archivo disponible para descarga</h4><p>Este formato no tiene previsualización integrada. Puedes descargar el documento original sin modificarlo.</p></div>';}
      link.hidden=false;link.href=source;link.download=item.filename||item.title;
    }
    if(!modal.open)modal.showModal();
  }
  function closeDialog(dlg) {if(dlg?.open)dlg.close();}
  function statusOf(file){return state.metadata[file.fileId]?.status||'pendiente';}
  function metadataOf(file){
    return state.metadata[file.fileId]||{title:file.title,type:file.type,summary:file.summary,author:'',date:file.date,sources:'',status:'pendiente'};
  }
  function renderManage(){
    if(!$('pubMetaList'))return;
    $('pubLocalCount').textContent=state.local.length+' archivo(s) en este navegador';
    const pending=state.local.filter(i=>!['aprobada','revisada'].includes(statusOf(i))).length;
    $('pubReviewAlert').textContent=state.local.length?pending+' archivo(s) pendientes de revisión local.':'No hay archivos cargados en este navegador.';
    $('pubMetaList').innerHTML=state.local.map(file=>{
      const m=metadataOf(file);
      return '<article class="pub-meta-item"><div><strong>'+escape(m.title||file.title)+'</strong><small>'+escape(file.filename||'')+' · '+escape(labels[normalType(m.type)]||'INFORME')+' · '+escape(m.author||'Sin autor identificado')+'</small></div>'+
        '<span>'+escape(statusNames[m.status]||statusNames.pendiente)+'</span>'+
        '<button type="button" data-cn-pubs-edit="'+escape(file.fileId)+'">Editar ficha →</button></article>';
    }).join('')||'<p>Primero agrega un archivo para crear su ficha.</p>';
  }
  function openManager(){renderManage();const dlg=$('pubManageDialog');if(!dlg.open)dlg.showModal();void loadLocal();}
  function editFile(id) {
    const file=state.local.find(f=>f.fileId===id);if(!file)return;
    const meta=metadataOf(file);
    for(const [field,val] of Object.entries({Id:id,Name:meta.title||file.title,Type:normalType(meta.type),Summary:meta.summary,Author:meta.author,Date:meta.date?.slice(0,10),Sources:meta.sources,Status:meta.status||'pendiente'})){
      const input=$('pubEdit'+field);if(input)input.value=val||'';
    }
    if(!$('pubEditDialog').open)$('pubEditDialog').showModal();
  }
  async function saveMetadata(event) {
    event.preventDefault();
    if(typeof TIData==='undefined')return;
    const form=new FormData($('pubMetadataForm')),id=text(form.get('id')),file=state.local.find(f=>f.fileId===id);
    if(!file)return;
    const next={title:text(form.get('title')).trim().slice(0,150),type:normalType(form.get('type')),
      summary:text(form.get('summary')).trim().slice(0,1000),author:text(form.get('author')).trim().slice(0,120),
      date:text(form.get('date')).slice(0,10),sources:text(form.get('sources')).trim().slice(0,1200),status:text(form.get('status'))};
    if(!next.title||!Object.hasOwn(statusNames,next.status))return;
    try{state.metadata={...state.metadata,[id]:next};await TIData.write(META_KEY,state.metadata);closeDialog($('pubEditDialog'));await loadLocal();}
    catch(error){$('pubEditDialog').querySelector('.pub-edit-disclaimer').textContent='No se pudo guardar la ficha: '+error.message;}
  }
  function setup(){
    root.addEventListener('click',event=>{
      const button=event.target.closest('button');if(!button)return;
      if(button.dataset.cnPubsFilter!==undefined){state.type=button.dataset.cnPubsFilter;state.slide=0;state.all=false;render();}
      else if(button.dataset.cnPubsSlide!==undefined){state.slide=Number(button.dataset.cnPubsSlide);render();}
      else if(button.dataset.cnPubsNav!==undefined){state.slide+=Number(button.dataset.cnPubsNav);render();}
      else if(button.dataset.cnPubsOpen){void openDocument(button.dataset.cnPubsOpen);}
      else if(button.dataset.cnPubsDownload){void openDocument(button.dataset.cnPubsDownload,true);}
      else if(button.id==='cn-pubs-see-all'){state.all=!state.all;render();}
      else if(button.hasAttribute('data-cn-pubs-manage'))openManager();
    });
    $('cn-pubs-search').addEventListener('input',e=>{state.query=e.target.value;state.slide=0;render();});
    for(const dialog of [modal,$('pubManageDialog'),$('pubEditDialog')]){
      dialog.addEventListener('click',e=>{
        if(e.target.closest('[data-cn-pubs-close], [data-pub-close]'))closeDialog(dialog);
        else if(e.target===dialog)closeDialog(dialog);
      });
    }
    modal.addEventListener('close',releaseBlob);
    $('pubMetaList').addEventListener('click',e=>{const button=e.target.closest('[data-cn-pubs-edit]');if(button)editFile(button.dataset.cnPubsEdit);});
    $('pubMetadataForm').addEventListener('submit',saveMetadata);
    document.addEventListener('ti:publication-store-changed',()=>{void loadLocal();});
    $('publicationUpload').addEventListener('change',()=>{$('pubLocalCount').textContent='Guardando archivos en este navegador…';});
  }
  function start(){setup();render();void Promise.all([loadPublic(),loadLocal()]);}

  function revealPublicationsLink() {
    const fragment=location.hash.slice(1),part=fragment.split('?');
    if(part[0]!=='data'||new URLSearchParams(part[1]||'').get('bloque')!=='publicaciones')return;
    if(document.getElementById('data-conoce')?.hidden)return;
    requestAnimationFrame(()=>requestAnimationFrame(()=>root.scrollIntoView({block:'start',behavior:'instant'})));
  }
  addEventListener('hashchange',()=>setTimeout(revealPublicationsLink,70));
  setTimeout(revealPublicationsLink,180);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
  window.TIPublicacionesConoce={refresh:()=>Promise.all([loadPublic(),loadLocal()])};
})();