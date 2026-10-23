/* Territorio Inteligente | composición canónica 2.1 para las páginas internas */
(function setupCanonicalHeroes(){
 "use strict";
 const videoRoutes={
  insights:{title:"Análisis territorial en video",description:"Cómo interpretar hallazgos, estudios y fuentes verificadas para entender el territorio."},
  servicios:{title:"Conoce los servicios municipales en video",description:"Cómo encontrar la oferta institucional, los trámites y los canales de atención."}
 };
 const images={desarrollo:{conoce:"territorio-aereo",cumplimos:"gestion",accion:"comunidad",contratacion:"alcaldia",gestion:"gestion"},cumplimiento:{conoce:"gestion",proyectos:"servicio",alumbrado:"servicio",inventario:"territorio-aereo"}};
 function attachVideo(view,labels){
  const hero=view.querySelector(":scope > .ti-module-hero");
  if(!hero||view.querySelector(":scope > .ti-intro-video"))return;
  const section=document.createElement("section");
  section.className="ti-intro-video ti-intro-video--module";
  section.setAttribute("aria-label","Presentación audiovisual de la sección");
  const title=document.createElement("div");
  title.className="ti-video-copy";
  const h2=document.createElement("h2");
  h2.textContent=labels.title;
  const p=document.createElement("p");
  p.textContent=labels.description;
  title.append(h2,p);
  const preview=document.createElement("div");
  preview.className="ti-video-placeholder";
  preview.setAttribute("role","img");
  preview.setAttribute("aria-label","Espacio reservado para un video explicativo. Video todavía no disponible.");
  preview.innerHTML='<span class="ti-video-play" aria-hidden="true">▶</span><span class="ti-video-status">VIDEO POR INCORPORAR</span>';
  section.append(title,preview);
  hero.after(section);
 }
 const characterization=document.getElementById("data-encuesta");
 if(characterization){
  const hero=characterization.querySelector(".k23-hero");
  const wrap=hero?.querySelector(".k23-wrap");
  const vid=wrap?.querySelector(".ti-intro-video--kobo");
  const dims=wrap?.querySelector(".k23-dim-section");
  if(hero&&vid&&dims){
   hero.after(vid);
   vid.after(dims);
  }
 }
 Object.keys(videoRoutes).forEach(route=>{
  const view=document.querySelector('.app-view[data-view="'+route+'"]');
  if(view){
   attachVideo(view,videoRoutes[route]);
   const name=route==="insights"?"gestion":"servicio";
   const img='url("/assets/img/editorial/'+name+'.jpg")';
   view.style.setProperty("--ti-hero-photo",img);
   view.style.setProperty("--ti-mobile-hero-photo",img);
  }
 });
 const policy=document.querySelector('.app-view[data-view="politicas"]');
 if(policy){
  const img='url("/assets/img/editorial/participacion.jpg")';
  policy.style.setProperty("--ti-hero-photo",img);
  policy.style.setProperty("--ti-mobile-hero-photo",img);
  const crumb=policy.querySelector(".ti-module-kicker");
  if(crumb)crumb.textContent="Políticas Públicas / 5.1 Políticas municipales";
 }
 function currentSection(root){
  return root.querySelector('.ti34-nav [data-module-panel].active')
   ||root.querySelector('.ti34-nav [data-module-panel][aria-selected="true"]')
   ||root.querySelector(".ti34-nav [data-module-panel]");
 }
 function updateModule(root){
  const active=currentSection(root);if(!active)return;
  const id=active.dataset.modulePanel||"";
  const name=active.querySelector(".ti34-nav-label")?.textContent?.trim()||"";
  const number=active.querySelector(".ti34-nav-number")?.textContent?.trim()||"";
  const panel=document.getElementById(id);
  const description=panel?.querySelector(".ti34-content-lead")?.textContent?.trim()||"";
  const heading=root.querySelector(".ti34-hero h1");
  const intro=root.querySelector(".ti34-hero-main p");
  const crumb=root.querySelector(".ti34-breadcrumb");
  const videoTitle=root.querySelector(".ti34-video .ti-video-copy h2");
  const videoText=root.querySelector(".ti34-video .ti-video-copy p");
  const route=root.dataset.view;
  const base=route==="desarrollo"?"Plan de Desarrollo":"Unidad de Cumplimiento";
  const displayTitle=name.replace(/^Año /i,"Vigencia ");
  if(heading){
   heading.textContent=displayTitle.toLocaleUpperCase("es-CO");
   heading.classList.toggle("ti-master-long-title",displayTitle.length>24&&displayTitle.length<=38);
   heading.classList.toggle("ti-master-extra-long-title",displayTitle.length>38);
  }
  if(intro&&description)intro.textContent=description;
  if(crumb)crumb.textContent=base+" / "+(number&&number!=="•"?number+" ":"")+name;
  if(videoTitle)videoTitle.textContent=displayTitle+" en video";
  if(videoText)videoText.textContent="Presentación audiovisual de esta sección: "+(description||"contenido institucional por incorporar.");
  const key=route==="desarrollo"?(id.includes("-contratacion")?"contratacion":id.includes("-accion")?"accion":id.endsWith("-gestion")?"gestion":id.endsWith("-cumplimos")?"cumplimos":"conoce"):
   (id.includes("-inventario")?"inventario":id.endsWith("-alumbrado")?"alumbrado":id.endsWith("-proyectos")?"proyectos":"conoce");
  const image=images[route]?.[key]||"territorio-aereo";
  const url='url("/assets/img/editorial/'+image+'.jpg")';
  root.style.setProperty("--ti-hero-photo",url);
  root.style.setProperty("--ti-mobile-hero-photo",url);
 }
 function sync(){
  document.querySelectorAll('.app-view.ti34-ready[data-view="desarrollo"],.app-view.ti34-ready[data-view="cumplimiento"]').forEach(updateModule);
 }
 document.addEventListener("click",e=>{if(e.target.closest(".ti34-nav [data-module-panel], [data-ti34-go]"))queueMicrotask(sync);});
 window.addEventListener("popstate",()=>requestAnimationFrame(sync));
 window.addEventListener("hashchange",()=>requestAnimationFrame(sync));
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",sync);
 else sync();
})();
