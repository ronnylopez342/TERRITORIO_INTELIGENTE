/* Data Territorio 2.3: vistas editoriales y gráficas DANE, solo Subachoque. */
(function dane23App(){
  "use strict";
  const root=document.getElementById("d23App");
  const legacy=document.getElementById("d23LegacyViewer");
  const C=window.TIDaneCharts;
  if(!root||!legacy||!C)return;
  let source=null,geo=null,active="",selectedVereda=-1,zoom=1;
  const sections={
    poblacion:["Población y demografía","Indicadores censales de Subachoque, distribución poblacional, hogares, edades y acceso a servicios."],
    series:["Series históricas","Compara exclusivamente los cortes censales disponibles: Censo General de 2005 y CNPV de 2018."],
    mapas:["Territorio y mapas","Explora las 17 veredas de referencia del municipio y su contexto poblacional censal."],
    fuentes:["Fuentes y metadatos","Consulta documentación oficial del DANE, metodología y datos descargables."]
  };
  const featureInfo=[
    ["poblacion","Población y demografía","Habitantes, edades, hogares y condiciones de vida."],
    ["series","Series históricas","Evolución y comparación de los cortes censales."],
    ["mapas","Territorio y mapas","Mapa de veredas y estadísticas municipales."],
    ["fuentes","Fuentes y metadatos","Censo, definiciones y documentación oficial."]
  ];
  const format=C.fmt,esc=C.esc;
  const ageColor=["#1e65b3","#49b39c","#f2c64c"];
  const icon={
    poblacion:`<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="15" cy="13" r="5"/><circle cx="33" cy="13" r="5"/><circle cx="24" cy="10" r="6"/><path d="M3 37V27q2-8 12-8M45 37V27q-2-8-12-8M12 40V28q2-11 12-11t12 11v12z"/></svg>`,
    series:`<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M7 41V27h8v14M20 41V18h8v23M33 41V7h8v34M4 42h40"/></svg>`,
    mapas:`<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 44S8 27 8 18a16 16 0 0 1 32 0c0 9-16 26-16 26z"/><circle cx="24" cy="18" r="5"/></svg>`,
    fuentes:`<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M9 3h21l9 9v33H9zM30 3v10h9M15 21h18M15 27h18M15 33h14"/></svg>`
  };
  function homeMarkup(){
    return `<div class="d23-home" id="d23Home">
      <section class="d23-hero" aria-labelledby="d23HeroTitle">
        <div class="d23-hero-image" aria-hidden="true"></div><div class="d23-hero-shade" aria-hidden="true"></div>
        <div class="d23-hero-copy">
          <span class="d23-breadcrumb">Data Territorio&nbsp; / &nbsp;2.3 Datos del DANE</span>
          <h1 id="d23HeroTitle" tabindex="-1">DATOS<br>DEL<br>DANE</h1>
          <p class="d23-hero-lede">Organizamos la información oficial del DANE para Subachoque, con series históricas, comparaciones y visualizaciones territoriales.</p>
          <p class="d23-topicline">Población · Vivienda · Hogares · Servicios</p><span class="d23-shortline"></span>
          <p class="d23-purpose">Las estadísticas oficiales nos ayudan a comprender el territorio y a tomar decisiones con evidencia.</p>
        </div>
        <button type="button" class="d23-video-trigger" data-d23-video aria-label="Información sobre el video de la sección">
          <span class="d23-play" aria-hidden="true">▶</span><span><strong>Conoce los datos del DANE<br>en Subachoque</strong><span>Video explicativo por incorporar</span></span>
        </button>
        <span class="d23-image-label">Imagen editorial conceptual del territorio</span>
      </section>
      <section class="d23-explore" aria-labelledby="d23ExploreTitle">
        <div class="d23-explore-intro"><h2 id="d23ExploreTitle">Explora por temas</h2><p>Información censal de Subachoque, organizada por categorías.</p></div>
        <div class="d23-feature-grid">${featureInfo.map(([key,title,subtitle])=>`<button type="button" class="d23-feature" data-d23-view="${key}"><span class="d23-feature-icon">${icon[key]}</span><span class="d23-feature-copy"><strong>${esc(title)}</strong><span>${esc(subtitle)}</span></span><span class="d23-feature-arrow" aria-hidden="true">→</span></button>`).join("")}</div>
        <p class="d23-footnote">Cifras disponibles: Censo General 2005 y CNPV 2018. La información ilustrada en propuestas de diseño no se utiliza como dato oficial.</p>
      </section>
      <dialog class="d23-modal" id="d23VideoDialog" aria-labelledby="d23VideoDialogTitle"><h3 id="d23VideoDialogTitle">Datos del DANE en Subachoque</h3><div id="d23VideoDialogBody"></div><button class="d23-btn d23-btn-primary" type="button" data-d23-close-video>Cerrar</button></dialog>
    </div>`;
  }
  function panel(title,description,chart,span=6,note=""){
    return `<article class="d23-panel d23-span-${span}"><h3>${esc(title)}</h3><p class="d23-chart-desc">${esc(description)}</p>${chart}${note?`<p class="d23-chart-note">${esc(note)}</p>`:""}</article>`;
  }
  function kpi(label,value,detail){
    return `<div class="d23-kpi"><span>${esc(label)}</span><strong>${esc(value)}</strong><small>${esc(detail)}</small></div>`;
  }
  function stagePopulation(){
    const d=source.census.at(-1),age=source.agePercent2018;
    const census=source.census;
    const urbanPercentage=100*d.urban/d.total,ruralPercentage=100*d.rural/d.total;
    const ageDonut=C.donut(age.map((a,i)=>({name:a.group,value:a.value,color:ageColor[i]})),"100 %","población");
    const panels=[
      panel("Evolución de la población","Personas censadas, 2005 y 2018.",C.trend(census,["total"]),7,"Dos cortes oficiales; los años intermedios no han sido estimados."),
      panel("Población por área","Cabecera frente a centro poblado y rural disperso.",C.donut([{name:"Cabecera",value:d.urban,color:"#1e65b3"},{name:"Resto",value:d.rural,color:"#6ca9ee"}],format(d.total),"personas"),5,`Cabecera ${C.percentage(urbanPercentage)} · Resto ${C.percentage(ruralPercentage)}.`),
      panel("Pirámide poblacional 2018","Hombres y mujeres por edad; cada barra es un porcentaje del total de habitantes.",C.pyramid(source.pyramid2018),8,"Porcentajes redondeados de la ficha oficial CNPV 2018."),
      panel("Grupos de edad","Distribución poblacional en tres grandes grupos del censo 2018.",ageDonut,4),
      panel("Acceso a servicios públicos","Cobertura censal declarada de viviendas en el CNPV 2018.",C.serviceBars(source.services2018),7,"La cobertura no representa la situación actual de 2026."),
      panel("Tamaño de los hogares","Porcentaje de hogares según número de integrantes en 2018.",C.verticalBars(source.householdSizePercent2018.map((x,i)=>({...x,color:C.palette[i]}))),5),
      panel("Hogares y personas","Comparación de censos y procedencia de la información.",C.growthTable(census),12,"El número de hogares y el de personas son magnitudes distintas.")
    ];
    return `<div class="d23-kpis">
      ${kpi("Población censada",format(d.total),"CNPV 2018 · no proyección 2024")}
      ${kpi("Cabecera municipal",format(d.urban),"CNPV 2018")}
      ${kpi("Centro poblado y rural disperso",format(d.rural),"CNPV 2018")}
      ${kpi("Hogares particulares",format(d.households),"CNPV 2018")}
    </div><div class="d23-panels">${panels.join("")}</div>`;
  }
  function stageSeries(){
    const a=source.census[0],b=source.census[1];
    const totalGrowth=(b.total-a.total)/a.total*100;
    const popBars=C.verticalBars([{name:"2005",value:a.total,color:"#5f96d3"},{name:"2018",value:b.total,color:"#ffe500"}]);
    const homeBars=C.verticalBars([{name:"2005",value:a.households,color:"#5f96d3"},{name:"2018",value:b.households,color:"#ffe500"}]);
    const urbanChange=100*(b.urban-a.urban)/a.urban,ruralChange=100*(b.rural-a.rural)/a.rural;
    const comparison=C.serviceBars([
      {name:"Cabecera: cambio 2005–2018",percent:Math.max(0,Math.min(100,urbanChange))},
      {name:"Resto rural: cambio 2005–2018",percent:Math.max(0,Math.min(100,Math.abs(ruralChange)))}
    ]);
    return `<div class="d23-kpis">
      ${kpi("Censo General 2005",format(a.total),"Personas censadas")}
      ${kpi("CNPV 2018",format(b.total),"Personas censadas")}
      ${kpi("Variación 2005–2018","+"+C.percentage(totalGrowth),"Dos cortes censales, no tasa anual")}
      ${kpi("Hogares 2018",format(b.households),`2005: ${format(a.households)}`)}
    </div><div class="d23-panels">
      ${panel("Población urbana, rural y total","Serie comparativa 2005 y 2018; no se representan años sin observación.",C.trend(source.census),12,"Censo General 2005 y CNPV 2018; los conceptos pueden presentar diferencias metodológicas.")}
      ${panel("Total de habitantes","Comparación de dos observaciones censales.",popBars,6)}
      ${panel("Evolución de los hogares","Número de hogares particulares por censo.",homeBars,6)}
      ${panel("Comparación territorial","Valores, variaciones y alcance de la población municipal.",C.growthTable(source.census),12)}
    </div><p class="d23-note">No se extrapolan automáticamente cifras de 2018 hacia 2024 o 2026. Si se incorporan proyecciones nuevas deberán identificarse como proyecciones y referenciar su fuente y fecha.</p>`;
  }
  function stageMaps(){
    const d=source.census.at(-1),list=geo?.features||[],selected=list[selectedVereda]?.properties?.nombre||"Selecciona una vereda";
    const mapPlot=C.geometry(geo,selectedVereda,zoom);
    return `<div class="d23-map-grid">
      <div class="d23-map-stage" id="d23MapStage">${mapPlot}<div class="d23-map-toolbar"><button type="button" data-d23-zoom="in" aria-label="Acercar mapa">+</button><button type="button" data-d23-zoom="out" aria-label="Alejar mapa">−</button><button type="button" data-d23-zoom="reset" aria-label="Restablecer zoom">⌑</button></div></div>
      <aside class="d23-map-side">
        <p class="d23-eyebrow">Subachoque / Cundinamarca</p><h3>Mapa territorial</h3>
        <p>Explora los polígonos de referencia geográfica del proyecto; esta capa no es un mapa oficial de población por vereda.</p>
        <label for="d23VeredaSelector">Seleccionar vereda
          <select id="d23VeredaSelector"><option value="-1">Todas las veredas</option>${list.map((f,i)=>`<option value="${i}"${i===selectedVereda?" selected":""}>${esc(f.properties.nombre)}</option>`).join("")}</select>
        </label>
        <div class="d23-map-stat">Vereda seleccionada<strong style="font-size:20px">${esc(selected)}</strong></div>
        <div class="d23-map-stat">Cobertura de la capa<strong>${list.length} veredas</strong></div>
        <p class="d23-map-annotation">No se asignan habitantes ficticios a las veredas. El dato censal verificado disponible aquí es municipal (cabecera/resto).</p>
        <a class="d23-btn" href="https://geoportal.dane.gov.co/geovisores/sociedad/cnpv-2018/" target="_blank" rel="noopener noreferrer">Abrir mapa oficial DANE ↗</a>
      </aside>
    </div>
    <div class="d23-panels" style="margin-top:17px">
      ${panel("Distribución municipal 2018","Cabecera municipal y resto (centro poblado y rural disperso).",C.donut([{name:"Cabecera",value:d.urban,color:"#1e65b3"},{name:"Resto",value:d.rural,color:"#6da9ef"}],format(d.total),"personas"),6)}
      ${panel("Viviendas y condiciones de ocupación","Conteos censales del municipio de Subachoque en 2018.",C.verticalBars([{name:"Ocupadas",value:source.housing.occupiedWithPeople},{name:"Ausentes",value:source.housing.occupiedAbsent},{name:"Temporales",value:source.housing.temporary},{name:"Desocupadas",value:source.housing.unoccupied}]),6)}
    </div>
    <p class="d23-note">Los límites por vereda proceden del GeoJSON que ya existe en Territorio Inteligente y no se presentan como cartografía certificada por el DANE. No se confunden con la clasificación oficial «cabecera / centro poblado / rural disperso».</p>`;
  }
  function stageSources(){
    return `<div class="d23-source-grid">${source.sourceLinks.map(s=>`<article class="d23-source"><small>${esc(s.type)}</small><h3>${esc(s.title)}</h3><p>${esc(s.detail)}</p><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">Consultar fuente ↗</a></article>`).join("")}</div>
      <div class="d23-actions"><button class="d23-btn d23-btn-primary" type="button" data-d23-export>Descargar datos CSV ↓</button><button class="d23-btn" type="button" data-d23-print>Imprimir / guardar PDF ↗</button><button class="d23-btn" type="button" data-d23-legacy>Ver visor territorial anterior ↓</button></div>
      <p class="d23-note">Procedencia: ficha municipal del CNPV 2018 publicada por el DANE para el código 25769. El mapa de veredas y el visor histórico tienen su propia procedencia. No se trata de cifras actualizadas automáticamente.</p><p class="d23-status" id="d23Status" role="status" aria-live="polite"></p>`;
  }
  function detailMarkup(view){
    const [title,description]=sections[view];
    return `<div class="d23-detail" id="d23Detail">
      <button class="d23-back" type="button" data-d23-back>← Volver a Datos del DANE</button>
      <header class="d23-detail-header"><div><p class="d23-eyebrow">DATA TERRITORIO / 2.3 / SUBACHOQUE</p><h2 tabindex="-1" id="d23DetailTitle">${esc(title)}</h2><p>${esc(description)}</p></div><span class="d23-meta">DANE · CNPV 2018 / CG 2005</span></header>
      <nav class="d23-tabs" aria-label="Vistas de Datos del DANE">${featureInfo.map(([key,name])=>`<button class="d23-tab" type="button" data-d23-view="${key}" aria-selected="${String(key===view)}">${esc(name)}</button>`).join("")}</nav>
      ${view==="poblacion"?stagePopulation():view==="series"?stageSeries():view==="mapas"?stageMaps():stageSources()}
      <div class="d23-actions"><button class="d23-btn d23-btn-primary" type="button" data-d23-export>Descargar datos oficiales utilizados ↓</button><a class="d23-btn" href="${esc(source.source.url)}" target="_blank" rel="noopener noreferrer">Consultar ficha original ↗</a></div>
      <p class="d23-status" id="d23GeneralStatus" role="status" aria-live="polite"></p>
      </div>`;
  }
  function scrollIntoFocus(){
    requestAnimationFrame(()=>{
      const top=window.scrollY+root.getBoundingClientRect().top-(document.getElementById("siteHeader")?.getBoundingClientRect().height||90);
      window.scrollTo({top:Math.max(0,top-8),behavior:"auto"});
      root.querySelector(active?"#d23DetailTitle":"#d23HeroTitle")?.focus({preventScroll:true});
    });
  }
  function showView(view,options={}){
    const next=Object.prototype.hasOwnProperty.call(sections,view)?view:"";
    active=next;
    root.innerHTML=next&&source?detailMarkup(next):homeMarkup();
    legacy.hidden=next!=="fuentes";
    if(next!=="fuentes")legacy.open=false;
    if(options.history!==false&&location.hash.startsWith("#data")){
      const hash="#data?seccion=data-fuentes"+(next?"&vista="+encodeURIComponent(next):"");
      if(location.hash!==hash)history.pushState({route:"data"}, "",hash);
    }
    if(options.focus!==false)scrollIntoFocus();
  }
  function syncHash(){
    const hash=location.hash;
    if(!hash.startsWith("#data"))return;
    const params=new URLSearchParams(hash.split("?")[1]||"");
    if(params.get("seccion")==="data-fuentes")showView(params.get("vista")||"",{history:false,focus:false});
  }
  function status(text){
    const elm=root.querySelector("#d23GeneralStatus")||root.querySelector("#d23Status");
    if(elm)elm.textContent=text;
  }
  function csvCell(value){
    let s=String(value??"");
    if(/^[=+\-@\t\r]/.test(s))s="'"+s;
    return '"'+s.replace(/"/g,'""')+'"';
  }
  function csvExport(){
    if(!source)return;
    const rows=[["Indicador","Periodo","Ámbito","Valor","Unidad","Fuente"]];
    for(const y of source.census){
      [["Población censada",y.total,"personas"],["Población cabecera",y.urban,"personas"],["Centro poblado y rural disperso",y.rural,"personas"],["Hogares particulares",y.households,"hogares"],["Personas por hogar",y.averageHousehold,"personas/hogar"]].forEach(([label,value,unit])=>rows.push([label,y.year,"Subachoque",value,unit,source.source.url]));
    }
    source.agePercent2018.forEach(x=>rows.push(["Edad: "+x.group,2018,"Subachoque",x.value,"%",source.source.url]));
    source.pyramid2018.forEach(x=>{
      rows.push(["Edad "+x.age+" hombres",2018,"Subachoque",x.men,"% población total",source.source.url]);
      rows.push(["Edad "+x.age+" mujeres",2018,"Subachoque",x.women,"% población total",source.source.url]);
    });
    source.services2018.forEach(x=>rows.push(["Servicio: "+x.name,2018,"Subachoque",x.percent,"%",source.source.url]));
    source.householdSizePercent2018.forEach(x=>rows.push(["Tamaño hogar: "+x.name,2018,"Subachoque",x.value,"%",source.source.url]));
    Object.entries(source.housing).forEach(([key,val])=>rows.push(["Vivienda: "+key,2018,"Subachoque",val,"viviendas",source.source.url]));
    const csv="\uFEFF"+rows.map(r=>r.map(csvCell).join(";")).join("\r\n");
    const href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
    const a=document.createElement("a");a.href=href;a.download="dane-subachoque-cnpv-2018-verificado.csv";document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(href),1000);
    status("CSV descargado con los valores censales y su fuente DANE.");
  }
  function openVideo(){
    const modal=root.querySelector("#d23VideoDialog"),body=root.querySelector("#d23VideoDialogBody");
    const url=source?.explanatoryVideoUrl||"";
    body.replaceChildren();
    if(/^https:\/\//i.test(url)){
      if(/\.(mp4|webm)(\?|$)/i.test(url)){
        const video=document.createElement("video");video.src=url;video.controls=true;video.playsInline=true;video.style.cssText="width:100%;max-height:310px";body.appendChild(video);
      }else{
        const p=document.createElement("p");p.textContent="El video explicativo está disponible en una fuente externa.";body.appendChild(p);
        const a=document.createElement("a");a.href=url;a.textContent="Abrir video ↗";a.rel="noopener noreferrer";a.target="_blank";a.className="d23-btn d23-btn-primary";body.appendChild(a);
      }
    }else{
      const p=document.createElement("p");p.textContent="El espacio para el video explicativo de Datos del DANE está preparado, pero todavía no se ha incorporado una grabación aprobada.";body.appendChild(p);
      const p2=document.createElement("p");p2.textContent="Mientras tanto puedes explorar las cifras del CNPV 2018 de Subachoque y consultar su ficha oficial.";body.appendChild(p2);
    }
    if(modal&&!modal.open)modal.showModal();
  }
  function closeVideo(){
    const dlg=root.querySelector("#d23VideoDialog");
    dlg?.querySelector("video")?.pause();if(dlg?.open)dlg.close();
  }
  root.addEventListener("click",event=>{
    const btn=event.target.closest("button");
    if(btn?.hasAttribute("data-d23-view")){showView(btn.dataset.d23View);return;}
    if(btn?.hasAttribute("data-d23-back")){showView("");return;}
    if(btn?.hasAttribute("data-d23-video")){openVideo();return;}
    if(btn?.hasAttribute("data-d23-close-video")){closeVideo();return;}
    if(btn?.hasAttribute("data-d23-export")){csvExport();return;}
    if(btn?.hasAttribute("data-d23-print")){window.print();return;}
    if(btn?.hasAttribute("data-d23-legacy")){
      legacy.hidden=false;legacy.open=true;legacy.scrollIntoView({block:"start",behavior:"smooth"});return;
    }
    if(btn?.hasAttribute("data-d23-zoom")){
      zoom=btn.dataset.d23Zoom==="in"?Math.min(2.4,zoom+.2):btn.dataset.d23Zoom==="out"?Math.max(1,zoom-.2):1;
      const plot=root.querySelector("#d23MapStage svg");
      if(plot)plot.style.transform="scale("+zoom+")";
      return;
    }
    const vereda=event.target.closest("[data-d23-vereda]");
    if(vereda&&active==="mapas"){
      const id=Number(vereda.dataset.d23Vereda);
      if(Number.isInteger(id)&&geo?.features?.[id]){selectedVereda=id;showView("mapas",{history:false,focus:false});}
    }
  });
  root.addEventListener("keydown",event=>{
    const vereda=event.target.closest("[data-d23-vereda]");
    if(vereda&&["Enter"," "].includes(event.key)){
      event.preventDefault();const id=Number(vereda.dataset.d23Vereda);
      if(geo?.features?.[id]){selectedVereda=id;showView("mapas",{history:false,focus:false});}
    }
  });
  root.addEventListener("change",event=>{
    if(event.target.id==="d23VeredaSelector"){
      selectedVereda=Number(event.target.value);
      showView("mapas",{history:false,focus:false});
    }
  });
  document.addEventListener("click",event=>{
    if(event.target.closest('[data-data-destination="data-fuentes"]'))showView("",{history:false,focus:false});
  });
  window.addEventListener("popstate",syncHash);
  window.addEventListener("hashchange",syncHash);
  root.addEventListener("cancel",event=>{
    if(event.target.id==="d23VideoDialog"){event.preventDefault();closeVideo();}
  });
  function load(){
    Promise.all([
      fetch("data/dane-subachoque-cnpv.json",{cache:"no-store"}).then(x=>{if(!x.ok)throw Error("No se pudo recuperar la ficha censal");return x.json();}),
      fetch("data/veredas-subachoque.geojson",{cache:"force-cache"}).then(x=>{if(!x.ok)throw Error("No se pudo recuperar el mapa");return x.json();}).catch(()=>null)
    ]).then(([manifest,map])=>{
      if(manifest.municipality!=="Subachoque"||manifest.daneCode!=="25769"||!Array.isArray(manifest.census)||manifest.census.length!==2||manifest.census.at(-1).total!==manifest.census.at(-1).urban+manifest.census.at(-1).rural)throw Error("Datos DANE inconsistentes");
      source=manifest;geo=map;syncHash();
      if(!active)showView("",{history:false,focus:false});
    }).catch(error=>{
      root.innerHTML='<div class="d23-detail"><h2 style="font-size:32px">Datos temporariamente no disponibles</h2><p>El repositorio censal no pudo leerse. Actualiza la página o abre la ficha oficial del DANE.</p><p><a href="https://sitios.dane.gov.co/cnpv/app/views/informacion/fichas/25769.pdf" target="_blank" rel="noopener noreferrer">Ficha oficial de Subachoque ↗</a></p></div>';
      console.error("DANE 2.3:",error);
    });
  }
  showView("",{history:false,focus:false});
  load();
})();
