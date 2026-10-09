'use strict';

const TI_PATHS = {
  demo: 'data/demo-content.json',
  baseData: 'data/data-territorio.json',
  requirements: 'data/requirements.json',
  geo: 'data/veredas-subachoque.geojson'
};

const TI_STATE = {
  demo: null,
  baseData: null,
  requirements: null,
  geo: null,
  selectedSector: 'demografia',
  sourceLevel: 'dane',
  imported: {},
  planProgress: safeJsonParse(localStorage.getItem('ti-demo-plan-progress')) || {},
  projectProgress: safeJsonParse(localStorage.getItem('ti-demo-project-progress')) || {}
};

async function tiFetchJson(path) {
  const response = await fetch(`${path}?v=24`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return response.json();
}

function safeJsonParse(value) { try { return value ? JSON.parse(value) : null; } catch { return null; } }
function escapeHtml(value='') { return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function money(value) { return new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 }).format((Number(value)||0) * 1_000_000); }
function moneyCompact(value) { const n=Number(value)||0; if(n>=1000)return `$${new Intl.NumberFormat('es-CO',{maximumFractionDigits:1}).format(n/1000)} mil M`; return `$${new Intl.NumberFormat('es-CO',{maximumFractionDigits:0}).format(n)} M`; }
function mediaOrFallback(src,alt='Territorio Inteligente'){ return `<img loading="lazy" decoding="async" src="${escapeHtml(src||'assets/img/editorial/territorio-aereo.jpg')}" alt="${escapeHtml(alt)}">`; }
function budgetBars(items){ const max=Math.max(...items.map(x=>Number(x.budget)||0),1); return `<div class="budget-bars">${items.map(x=>`<div class="budget-bar-row"><div><span>${escapeHtml(x.name)}</span><strong>${moneyCompact(x.budget)}</strong></div><i><b style="width:${Math.max(4,Math.round((x.budget/max)*100))}%"></b></i></div>`).join('')}</div>`; }
function radialProgress(value,label){ const v=pct(value); return `<div class="radial-progress" style="--p:${v}"><div><strong>${v}%</strong><span>${escapeHtml(label)}</span></div></div>`; }
function num(value) { return new Intl.NumberFormat('es-CO').format(Number(value)||0); }
function dateLabel(value) { const d=new Date(value); return Number.isNaN(d.getTime())?String(value||''):new Intl.DateTimeFormat('es-CO',{dateStyle:'medium',...(/^\d{4}-\d{2}-\d{2}$/.test(value)?{timeZone:'UTC'}:{})}).format(d); }
function csvCell(v){ const s=String(v??''); return /[",\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s; }
function rowsToCsv(rows){ if(!rows.length)return''; const keys=[...new Set(rows.flatMap(r=>Object.keys(r)))]; return [keys.join(','),...rows.map(r=>keys.map(k=>csvCell(r[k])).join(','))].join('\n'); }
function downloadBlob(name, content, type='application/json;charset=utf-8'){ const blob=new Blob([content],{type}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),0); a.remove(); }
function demoBadge(label='ILUSTRATIVO'){ return `<span class="demo-badge">${escapeHtml(label)}</span>`; }
function pct(v){ return Math.max(0,Math.min(100,Number(v)||0)); }
function effectiveProgramProgress(p){ return TI_STATE.planProgress[p.id] ?? p.progress; }
function effectiveProjectProgress(p){ return TI_STATE.projectProgress[p.id] ?? p.progress; }

let lastDialogTrigger = null;

function openDetail(title, html) {
  const dialog=document.getElementById('detailDialog');
  const body=document.getElementById('detailDialogBody');
  if(!dialog||!body)return;
  lastDialogTrigger=document.activeElement instanceof HTMLElement ? document.activeElement : null;
  body.innerHTML=`<h2 id="detailDialogTitle" tabindex="-1">${escapeHtml(title)}</h2>${html}`;
  if(typeof dialog.showModal==='function') dialog.showModal(); else dialog.setAttribute('open','');
  requestAnimationFrame(()=>body.querySelector('#detailDialogTitle')?.focus());
}

function initDialog() {
  const dialog=document.getElementById('detailDialog');
  if(!dialog)return;
  dialog.addEventListener('click', e=>{ if(e.target===dialog) dialog.close(); });
  dialog.addEventListener('close',()=>{
    if(lastDialogTrigger?.isConnected) requestAnimationFrame(()=>lastDialogTrigger.focus());
    lastDialogTrigger=null;
  });
}

function initModuleTabs() {
  const activate=(tab,{focus=false}={})=>{
    const panel=document.getElementById(tab.dataset.modulePanel);
    if(!panel)return;
    const group=panel.dataset.panelGroup;
    const tablist=tab.closest('[role="tablist"], .module-subnav');
    document.querySelectorAll(`[data-panel-group="${group}"]`).forEach(p=>{
      const active=p===panel;
      p.classList.toggle('active',active);
      p.hidden=!active;
    });
    tablist?.querySelectorAll('[data-module-panel]').forEach(b=>{
      const active=b===tab;
      b.classList.toggle('active',active);
      b.setAttribute('aria-selected',String(active));
      b.tabIndex=active?0:-1;
    });
    if(focus) tab.focus();
  };

  document.querySelectorAll('.module-subnav').forEach(tablist=>{
    tablist.setAttribute('role','tablist');
    const tabs=[...tablist.querySelectorAll('[data-module-panel]')];
    tabs.forEach((tab,index)=>{
      tab.setAttribute('role','tab');
      const panel=document.getElementById(tab.dataset.modulePanel);
      if(panel){
        if(!tab.id) tab.id=`tab-${tab.dataset.modulePanel}`;
        tab.setAttribute('aria-controls',panel.id);
        panel.setAttribute('role','tabpanel');
        panel.setAttribute('aria-labelledby',tab.id);
      }
      if(index===0 && tab.classList.contains('active')) activate(tab);
    });
  });

  document.addEventListener('click', e=>{
    const tab=e.target.closest('[data-module-panel]');
    if(tab) activate(tab);
  });

  document.addEventListener('keydown',e=>{
    const tab=e.target.closest('[role="tab"][data-module-panel]');
    if(!tab || !['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
    const tabs=[...tab.closest('[role="tablist"]').querySelectorAll('[role="tab"]')];
    const i=tabs.indexOf(tab);
    let next=i;
    if(e.key==='ArrowRight')next=(i+1)%tabs.length;
    if(e.key==='ArrowLeft')next=(i-1+tabs.length)%tabs.length;
    if(e.key==='Home')next=0;
    if(e.key==='End')next=tabs.length-1;
    e.preventDefault();
    activate(tabs[next],{focus:true});
  });
}

function renderHome() {
  const home=TI_STATE.demo.home;
  renderHomeUpdates(home);
  const ticker=document.getElementById('homeNewsTicker');
  if(ticker){ const n=home.nationalNews[0]; ticker.hidden=false; ticker.innerHTML=`<span class="ticker-source">${escapeHtml(n.source)}</span><strong>${escapeHtml(n.title)}</strong><span>${escapeHtml(dateLabel(n.date))}</span><button type="button" class="ticker-action" data-news-detail="${n.id}">Abrir →</button>`; }
  const feature=document.getElementById('homeNationalFeature');
  if(feature){ const n=home.nationalNews[0]; feature.removeAttribute('role'); feature.removeAttribute('tabindex'); feature.removeAttribute('data-news-detail'); feature.innerHTML=`${mediaOrFallback(n.media,n.title)}<div class="feature-tag">${escapeHtml(n.category)} · ${escapeHtml(dateLabel(n.date))}</div><div class="feature-copy"><h3>${escapeHtml(n.title)}</h3><p>${escapeHtml(n.summary)}<br><span class="feature-source">${escapeHtml(n.source)}</span><br><button type="button" class="inline-action" data-news-detail="${n.id}">Abrir ficha →</button></p></div>`; }
  const grid=document.getElementById('homeMunicipalGrid');
  if(grid){ const stories=home.municipalNews; const card=(n,small=false)=>`<article class="story ${small?'small':''} story-real">${mediaOrFallback(n.media,n.title)}<div class="story-copy"><div class="story-label">${escapeHtml(n.dependency)} · ${escapeHtml(dateLabel(n.date))}</div><h3>${escapeHtml(n.title)}</h3><p>${escapeHtml(n.summary)}</p><button type="button" class="story-action" data-municipal-detail="${n.id}">Abrir historia →</button></div></article>`; grid.innerHTML=card(stories[0])+`<div class="story-stack">${stories.slice(1,3).map(x=>card(x,true)).join('')}</div>`; }
  const impact=document.getElementById('homeImpactAreas');
  if(impact) impact.innerHTML=home.impactAreas.map(x=>`<button type="button" class="impact-area route-link reveal" data-route="${x.route}"><small>${escapeHtml(x.number)}</small><div><h3>${escapeHtml(x.title)}</h3><p>${escapeHtml(x.text)}</p></div><span>Explorar →</span></button>`).join('');
  const spotlight=document.getElementById('homeSpotlight');
  if(spotlight){
    const p=TI_STATE.demo.compliance.projects[0];
    spotlight.innerHTML=`<article class="home-spotlight-card reveal">${mediaOrFallback(p.media,p.name)}<div class="home-spotlight-copy"><p class="eyebrow">${escapeHtml(p.sector)} · ${escapeHtml(p.vereda)}</p><h3>${escapeHtml(p.name)}</h3><div class="spotlight-metric"><strong>${effectiveProjectProgress(p)}%</strong><span>avance ilustrativo</span></div><p>Un ejemplo de cómo el portal puede conectar avance, cronograma, riesgo y evidencia sin convertir la portada en un dashboard.</p><button type="button" class="outline-link route-link" data-route="cumplimiento">Ver evidencia →</button></div></article>`;
  }
  const facts=document.getElementById('homeFacts');
  if(facts) facts.innerHTML=home.facts.map(x=>`<article><strong>${escapeHtml(x.value)}</strong><span>${escapeHtml(x.label)}</span><small>${escapeHtml(x.source)}</small></article>`).join('');
  const voices=document.getElementById('homeVoices');
  if(voices) voices.innerHTML=home.testimonials.map((x,i)=>`<article class="voice-card reveal ${i===0?'voice-feature':''}">${mediaOrFallback(x.media,x.role)}<div><span>“</span><blockquote>${escapeHtml(x.quote)}</blockquote><small>${escapeHtml(x.role)}</small></div></article>`).join('');
  document.querySelectorAll('[data-identity]').forEach(btn=>btn.addEventListener('click',()=>{
    const x=home.identity.find(i=>i.id===btn.dataset.identity); if(!x)return;
    openDetail(x.title,`${demoBadge('PROTOTIPO')}<p class="dialog-lead">${escapeHtml(x.description)}</p><div class="dialog-actions"><button class="action-button" type="button" data-demo-copy="${escapeHtml(x.title)}">Copiar nombre</button><button class="text-button" type="button" data-demo-download="identity-${escapeHtml(x.id)}">Descargar ficha</button></div>`);
  }));
  document.querySelectorAll('[data-institutional]').forEach(btn=>btn.addEventListener('click',()=>{
    const x=home.institutional.find(i=>i.id===btn.dataset.institutional); if(!x)return;
    openDetail(x.title,`${demoBadge('PROTOTIPO')}<p class="dialog-lead">${escapeHtml(x.description)}</p><div class="fake-contact-grid"><div><small>Canal</small><strong>Portal TI</strong></div><div><small>Atención de referencia</small><strong>L–V · 8:00–17:00</strong></div></div>`);
  }));
}


function renderHomeUpdates(home) {
  const root=document.querySelector('.home-updates');
  const track=document.getElementById('homeUpdatesTrack');
  if(!root||!track)return;
  root._updatesCleanup?.();
  const serviceMedia=['servicio','comunidad','alcaldia','participacion'];
  const items=home.featuredUpdates?.length ? home.featuredUpdates.map(n=>({...n,kind:n.category,label:'Leer publicación oficial'})) : [
    ...(home.nationalNews||[]).map(n=>({...n,kind:'Noticia nacional / departamental',action:'data-news-detail',label:'Ver noticia',source:n.source})),
    ...(home.municipalNews||[]).map(n=>({...n,kind:'Actualidad municipal',action:'data-municipal-detail',label:'Ver noticia',source:n.dependency})),
    ...(home.services||[]).map((s,i)=>({...s,kind:'Oferta institucional',action:'data-service-detail',label:'Consultar servicio',source:s.dependency,summary:s.requirements.join(' · '),media:'assets/img/editorial/'+serviceMedia[i%serviceMedia.length]+'.jpg'}))
  ];
  if(!items.length){root.hidden=true;return;}
  root.hidden=false;
  const calendarDate=value=>new Intl.DateTimeFormat('es-CO',{dateStyle:'medium',timeZone:'UTC'}).format(new Date(value));
  track.innerHTML=items.map((x,i)=>`<article class="home-update-slide" role="group" aria-roledescription="diapositiva" aria-label="${i+1} de ${items.length}" ${i?'inert':''}>
    <div class="home-update-copy"><p class="home-update-kicker">${escapeHtml(x.kind)}${x.date?' / '+escapeHtml(calendarDate(x.date)):''}</p><h3>${escapeHtml(x.title)}</h3>${x.imageCredit?`<p class="home-update-credit">${escapeHtml(x.imageCredit)}</p>`:''}</div>
    <div class="home-update-media">${mediaOrFallback(x.media,x.title)}</div>
    ${x.sourceUrl?`<a class="home-update-link" href="${escapeHtml(x.sourceUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Leer noticia: ${escapeHtml(x.title)}"></a>`:`<button class="home-update-link" type="button" ${x.action}="${escapeHtml(x.id)}" aria-label="Ver ${escapeHtml(x.title)}"></button>`}</article>`).join('');
  const dots=document.getElementById('homeUpdatesDots');
  dots.innerHTML=items.map((x,i)=>`<button type="button" data-update-index="${i}" aria-label="Mostrar ${escapeHtml(x.title)}" aria-pressed="${i===0}"></button>`).join('');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  let index=0,paused=reduced.matches,hovered=false,focused=false,visible=false;
  const paint=()=>{
    track.querySelectorAll('.home-update-slide').forEach((s,i)=>{s.inert=i!==index;});
    dots.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
  };
  const go=(next,manual=false)=>{
    if(manual)paused=true;
    index=(next+items.length)%items.length;
    track.scrollTo({left:index*track.clientWidth,behavior:reduced.matches?'instant':'smooth'});
    paint();
  };
  document.getElementById('homeUpdatesPrev').onclick=()=>go(index-1,true);
  document.getElementById('homeUpdatesNext').onclick=()=>go(index+1,true);
  dots.onclick=e=>{const b=e.target.closest('[data-update-index]');if(b)go(Number(b.dataset.updateIndex),true);};
  track.onscroll=()=>{const next=Math.round(track.scrollLeft/track.clientWidth);if(next!==index){index=next;paint();}};
  track.onkeydown=e=>{if(e.target!==track)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();go(index+(e.key==='ArrowRight'?1:-1),true);}};
  track.onpointerdown=()=>{paused=true;paint();};
  root.onmouseenter=()=>{hovered=true;};
  root.onmouseleave=()=>{hovered=false;};
  root.onfocusin=()=>{focused=true;};
  root.onfocusout=e=>{focused=root.contains(e.relatedTarget);};
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;},{threshold:.35});
  observer.observe(root);
  const timer=setInterval(()=>{if(!paused&&!hovered&&!focused&&visible&&!document.hidden&&!document.querySelector('dialog[open]')&&root.closest('.app-view')?.classList.contains('active'))go(index+1);},8000);
  const resize=()=>track.scrollTo({left:index*track.clientWidth,behavior:'instant'});
  window.addEventListener('resize',resize);
  root._updatesCleanup=()=>{clearInterval(timer);observer.disconnect();window.removeEventListener('resize',resize);};
  paint();
}

function findHomeNews(id){ return [...(TI_STATE.demo.home.featuredUpdates||[]),...TI_STATE.demo.home.nationalNews,...TI_STATE.demo.home.municipalNews].find(x=>x.id===id); }

function renderServices() {
  const grid=document.getElementById('serviceGrid'); const search=document.getElementById('serviceSearch');
  if(!grid)return;
  const media=['assets/img/editorial/servicio.jpg','assets/img/editorial/comunidad.jpg','assets/img/editorial/alcaldia.jpg','assets/img/editorial/participacion.jpg'];
  const draw=()=>{ const q=(search?.value||'').toLowerCase(); const items=TI_STATE.demo.home.services.filter(s=>`${s.title} ${s.dependency}`.toLowerCase().includes(q)); grid.innerHTML=items.map((s,i)=>`<article class="service-card ${i===0?'service-feature':''}">${i===0?`<div class="card-media">${mediaOrFallback(media[i%media.length],s.title)}</div>`:''}<small>${escapeHtml(s.dependency)}</small><h3>${escapeHtml(s.title)}</h3><p><strong>${escapeHtml(s.time)}</strong><br>${escapeHtml(s.cost)}</p><div class="card-actions"><button type="button" class="text-button" data-service-detail="${s.id}">Ver trámite</button><button type="button" class="text-button" data-service-download="${s.id}">Ficha JSON</button></div></article>`).join(''); };
  draw(); search?.addEventListener('input',draw);
}

function dataSourceRows(kind) {
  const sectors=TI_STATE.demo.data.sectors;
  const rows=[];
  sectors.forEach(s=>s.indicators.forEach((i,n)=>rows.push({sector:s.name,indicador:i.indicator,valor:i.value,periodo:i.period,fuente:kind==='dane'?'Referencia · DANE':kind==='externas'?'Referencia · Fuente externa':kind==='municipales'?'Estimación · Dependencia municipal':'Estimación · Encuesta municipal',registro:n+1})));
  return rows;
}

function renderDataTerritorio() {
  const base=TI_STATE.baseData;
  document.getElementById('dataDefinition').textContent=base.definition;
  document.getElementById('dataPrinciples').innerHTML=base.principles.map((p,i)=>`<article class="principle"><strong>${i+1}. ${escapeHtml(p.title)}</strong><span>${escapeHtml(p.text)}</span></article>`).join('');
  renderStatisticsWheel(base.principles);
  renderDataVisor();
  renderSources();
  renderDocuments();
  buildDatasetWorkspace('dane');
  buildDatasetWorkspace('externas');
  buildDatasetWorkspace('municipales');
  buildDatasetWorkspace('encuesta');
  renderMap();
  renderPublications();
  renderGlossary();
  const status=document.getElementById('dataGlobalStatus');
  if(status)status.innerHTML=`<span class="source-status">10 sectores · 17 veredas · población de referencia 2025: 17.999</span>`;
}

function renderStatisticsWheel(items){ const wheel=document.getElementById('statisticsWheel'),note=document.getElementById('statisticsNote'); if(!wheel||!note)return; wheel.innerHTML=items.map((x,i)=>`<button type="button" class="stat-segment ${i===0?'active':''}" data-stat-index="${i}">${escapeHtml(x.title)}</button>`).join(''); const show=i=>{const x=items[i];wheel.querySelectorAll('[data-stat-index]').forEach((b,n)=>b.classList.toggle('active',n===i));note.innerHTML=`${demoBadge('CONCEPTO')}<strong>${escapeHtml(x.title)}</strong><br>${escapeHtml(x.text)}`;};show(0);wheel.addEventListener('click',e=>{const b=e.target.closest('[data-stat-index]');if(b)show(Number(b.dataset.statIndex));}); }

function trendSvg(points){ const w=700,h=250,p=34; const xs=points.map(x=>x[0]),ys=points.map(x=>Number(x[1])); const minY=Math.min(...ys),maxY=Math.max(...ys); const px=i=>p+(w-p*2)*(i/(points.length-1||1)); const py=v=>h-p-(h-p*2)*((v-minY)/(maxY-minY||1)); const poly=points.map((x,i)=>`${px(i)},${py(x[1])}`).join(' '); return `<svg class="demo-line-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Tendencia demo"><line x1="${p}" y1="${h-p}" x2="${w-p}" y2="${h-p}" class="chart-axis"></line><polyline points="${poly}" class="chart-line"></polyline>${points.map((x,i)=>`<g><circle cx="${px(i)}" cy="${py(x[1])}" r="6" class="chart-dot"></circle><text x="${px(i)}" y="${h-8}" text-anchor="middle">${x[0]}</text><text x="${px(i)}" y="${py(x[1])-12}" text-anchor="middle" class="chart-value">${escapeHtml(x[1])}</text></g>`).join('')}</svg>`; }

function renderDataVisor(){
  const root=document.getElementById('dataVisorWorkspace'); if(!root)return;
  const sectors=TI_STATE.demo.data.sectors; const active=sectors.find(x=>x.id===TI_STATE.selectedSector)||sectors[0]; const home=TI_STATE.demo.home;
  root.innerHTML=`<div class="dashboard-head"><div><p class="eyebrow">Visor territorial</p><h2 class="big-heading">Datos que cuentan una historia antes de convertirse en tabla.</h2><p class="dashboard-lead">La ficha territorial combina referencias públicas con estimaciones de prototipo para demostrar una experiencia completa de análisis.</p></div><div class="dashboard-actions"><button type="button" class="action-button" data-data-export="${active.id}">Descargar sector CSV</button><button type="button" class="text-button" data-data-compare>Comparar sectores</button></div></div>
  <div class="territory-snapshot"><div class="snapshot-media">${mediaOrFallback('assets/img/editorial/territorio-aereo.jpg','Vista aérea de Subachoque')}<div class="snapshot-caption"><span>Subachoque · Sabana Occidente</span><strong>Un territorio rural conectado con Bogotá y la sabana.</strong></div></div><div class="snapshot-facts">${home.facts.map(x=>`<article><strong>${escapeHtml(x.value)}</strong><span>${escapeHtml(x.label)}</span><small>${escapeHtml(x.source)}</small></article>`).join('')}</div></div>
  <div class="sector-tabs">${sectors.map(s=>`<button type="button" class="sector-tab ${s.id===active.id?'active':''}" data-sector-id="${s.id}">${escapeHtml(s.name)}</button>`).join('')}</div>
  <div class="data-hero-stat"><div><span class="source-status">${escapeHtml(active.subtitle)}</span><strong>${escapeHtml(active.headline)}</strong><small>${escapeHtml(active.name)}</small></div><div class="metric-cards">${active.metrics.map(m=>`<article><small>${escapeHtml(m.label)}</small><strong>${escapeHtml(num(m.value))}${m.unit?` <span>${escapeHtml(m.unit)}</span>`:''}</strong></article>`).join('')}</div></div>
  <div class="dashboard-grid two data-chart-grid"><section class="dashboard-panel chart-panel"><div class="panel-head"><div><p class="eyebrow">Serie 2022–2026</p><h3>${escapeHtml(active.name)}</h3></div><button type="button" class="icon-text-button" data-sector-method="${active.id}">Metodología</button></div>${trendSvg(active.trend)}</section><section class="dashboard-panel indicator-panel"><div class="panel-head"><div><p class="eyebrow">Indicadores clave</p><h3>Lo importante, sin esconderlo.</h3></div></div><div class="indicator-table">${active.indicators.map((i,n)=>`<div><span>${escapeHtml(i.indicator)}</span><strong>${escapeHtml(i.value)}</strong><small>${escapeHtml(i.period)}</small><i style="--bar:${Math.min(100,28+n*17)}%"></i></div>`).join('')}</div></section></div>
  <p class="prototype-caption">Nota: las cifras no asociadas a una fuente oficial visible son estimaciones ilustrativas del prototipo.</p>`;
  root.querySelectorAll('[data-sector-id]').forEach(b=>b.addEventListener('click',()=>{TI_STATE.selectedSector=b.dataset.sectorId;renderDataVisor();}));
}

function renderSources(){ const sources=TI_STATE.baseData.sources||[]; const sourceHtml=list=>list.map(s=>`<span class="source-chip"><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.name)} ↗</a> · ${escapeHtml(s.periodicity)}</span>`).join(''); const dane=document.getElementById('daneSourceRegistry'); if(dane)dane.innerHTML=sourceHtml(sources.filter(x=>x.id==='dane'))+demoBadge('DATOS PRECARGADOS DEMO'); const ext=document.getElementById('externalSourceRegistry'); const draw=()=>{if(ext)ext.innerHTML=sourceHtml(sources.filter(x=>x.level===TI_STATE.sourceLevel))+demoBadge('DATOS PRECARGADOS DEMO');}; draw(); document.querySelectorAll('[data-source-level]').forEach(b=>b.addEventListener('click',()=>{TI_STATE.sourceLevel=b.dataset.sourceLevel;document.querySelectorAll('[data-source-level]').forEach(x=>x.classList.toggle('active',x===b));draw();})); }

function renderDocuments(){ const grid=document.getElementById('statDocumentGrid'); const search=document.getElementById('statDocumentSearch'); const draw=()=>{const q=(search?.value||'').toLowerCase(); const docs=TI_STATE.demo.data.documents.filter(d=>`${d.title} ${d.type} ${d.description}`.toLowerCase().includes(q)); grid.innerHTML=docs.map(d=>`<article class="document-card"><small>${escapeHtml(d.type)} · ${escapeHtml(d.size)} · ${demoBadge()}</small><h4>${escapeHtml(d.title)}</h4><p>${escapeHtml(d.description)}</p><p class="freshness">Actualizado ${escapeHtml(dateLabel(d.updated))}</p><div class="card-actions"><button type="button" class="text-button" data-doc-detail="${d.id}">Ver ficha</button><button type="button" class="text-button" data-doc-download="${d.id}">Descargar metadatos</button></div></article>`).join('');}; draw(); search?.addEventListener('input',draw); document.getElementById('exportStatMetadata')?.addEventListener('click',()=>downloadBlob('inventario-estadistico-demo.csv',rowsToCsv(TI_STATE.demo.data.documents),'text/csv;charset=utf-8')); document.getElementById('statDocumentUpload')?.addEventListener('change',e=>{ const n=e.target.files.length; if(n)openDetail('Archivos recibidos',`${demoBadge('SESION LOCAL')}<p>${n} archivo(s) seleccionados. En esta demo se registran para la sesión sin reemplazar los documentos precargados.</p>`); e.target.value=''; }); }

function buildDatasetWorkspace(key){ const el=document.querySelector(`[data-dataset-workspace="${key}"]`); if(!el)return; const sectors=TI_STATE.demo.data.sectors; const seed=dataSourceRows(key); TI_STATE.imported[key]=TI_STATE.imported[key]||{rows:seed,fileName:'dataset-demo'}; el.innerHTML=`<div class="dataset-controls"><select aria-label="Sector"><option value="">Todos los sectores</option>${sectors.map(s=>`<option value="${escapeHtml(s.name)}">${escapeHtml(s.name)}</option>`).join('')}</select><label class="action-button">Importar CSV / JSON<input type="file" accept=".xlsx,.xls,.csv,.json" hidden></label><button type="button" class="text-button" data-export-dataset>Exportar CSV</button></div><div class="dataset-summary"><div class="data-table-wrap"></div><div class="chart-panel"></div></div><div class="local-only-note">${demoBadge()} Esta base viene precargada. Importar un CSV/JSON la reemplaza solo durante esta sesión.</div>`; const select=el.querySelector('select'),input=el.querySelector('input[type=file]'); const render=()=>renderDataset(el,key,select.value); select.addEventListener('change',render); input.addEventListener('change',async()=>{const f=input.files[0];if(!f)return;try{TI_STATE.imported[key]={rows:await parseDatasetFile(f),fileName:f.name};render();openDetail('Base cargada',`<p>${TI_STATE.imported[key].rows.length} registros cargados desde ${escapeHtml(f.name)}.</p>`);}catch(err){openDetail('Error de importación',`<p>${escapeHtml(err.message)}</p>`);}input.value='';}); el.querySelector('[data-export-dataset]').addEventListener('click',()=>downloadBlob(`${key}-demo.csv`,rowsToCsv(TI_STATE.imported[key].rows),'text/csv;charset=utf-8')); render(); }
function renderDataset(el,key,sector){ let rows=TI_STATE.imported[key]?.rows||[]; if(sector)rows=rows.filter(r=>String(r.sector||'').toLowerCase()===sector.toLowerCase()); const table=el.querySelector('.data-table-wrap'),chart=el.querySelector('.chart-panel'); const show=rows.slice(0,80); table.innerHTML=`<table class="data-table"><thead><tr><th>Sector</th><th>Indicador</th><th>Valor</th><th>Periodo</th><th>Fuente</th></tr></thead><tbody>${show.map(r=>`<tr><td>${escapeHtml(r.sector)}</td><td>${escapeHtml(r.indicador)}</td><td><strong>${escapeHtml(r.valor)}</strong></td><td>${escapeHtml(r.periodo)}</td><td>${escapeHtml(r.fuente)}</td></tr>`).join('')}</tbody></table>`; const grouped=show.slice(0,10).map((r,i)=>({label:r.indicador,value:parseFloat(String(r.valor).replace(/[^0-9.,-]/g,'').replace(',','.'))||i+1})); const max=Math.max(...grouped.map(x=>Math.abs(x.value)),1); chart.innerHTML=`<p class="eyebrow">Lectura rápida ${demoBadge()}</p><div class="bar-chart">${grouped.map(x=>`<div class="bar-row"><button type="button" data-dataset-note="${escapeHtml(x.label)}">${escapeHtml(x.label)}</button><div class="bar-track"><div class="bar-fill" style="width:${Math.min(100,Math.abs(x.value)/max*100).toFixed(1)}%"></div></div><span>${escapeHtml(x.value)}</span></div>`).join('')}</div>`; }
async function parseDatasetFile(file){ const ext=file.name.split('.').pop().toLowerCase(); if(ext==='json'){const x=JSON.parse(await file.text());return Array.isArray(x)?x:(x.rows||[x]);} if(ext==='csv')return parseCsv(await file.text()); if(['xlsx','xls'].includes(ext)){ if(!window.XLSX) throw new Error('No se pudo cargar el parser XLSX. Usa CSV/JSON o revisa la conexión.'); const buf=await file.arrayBuffer(); const wb=XLSX.read(buf,{type:'array'}); const ws=wb.Sheets[wb.SheetNames[0]]; return XLSX.utils.sheet_to_json(ws,{defval:''}); } throw new Error('Formato no soportado. Usa XLSX, XLS, CSV o JSON.'); }
function parseCsv(text){ const lines=text.replace(/\r/g,'').split('\n').filter(Boolean); if(lines.length<2)return[]; const head=lines[0].split(',').map(x=>x.trim()); return lines.slice(1).map(line=>{const cells=line.split(',');return Object.fromEntries(head.map((h,i)=>[h,cells[i]??'']));}); }

function renderMap(){ const svg=document.getElementById('territoryMapSvg'),detail=document.getElementById('territoryMapDetail'); if(!svg||!detail)return; const features=TI_STATE.geo.features||[]; const coords=[]; features.forEach(f=>walkCoords(f.geometry.coordinates,c=>coords.push(c))); const xs=coords.map(c=>c[0]),ys=coords.map(c=>c[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),pad=28,W=960,H=600; const project=([x,y])=>[pad+(x-minX)/(maxX-minX||1)*(W-pad*2),H-pad-(y-minY)/(maxY-minY||1)*(H-pad*2)]; svg.innerHTML=features.map((f,i)=>`<path class="map-vereda" tabindex="0" role="button" data-vereda-index="${i}" aria-label="${escapeHtml(f.properties.nombre)}" d="${geometryPath(f.geometry,project)}"></path>`).join(''); const select=i=>{const f=features[i],s=TI_STATE.demo.data.veredaStats.find(x=>x.name===f.properties.nombre)||TI_STATE.demo.data.veredaStats[i]; svg.querySelectorAll('.map-vereda').forEach((p,n)=>p.classList.toggle('active',n===i)); detail.innerHTML=`${demoBadge()}<p class="eyebrow">${escapeHtml(f.properties.nombre)}</p><h3>${escapeHtml(f.properties.nombre)}</h3><div class="map-stat-list"><div class="map-stat"><span>Población demo</span><strong>${num(s.population)}</strong></div><div class="map-stat"><span>Servicios con presencia</span><strong>${s.services}</strong></div><div class="map-stat"><span>Beneficiarios</span><strong>${num(s.beneficiaries)}</strong></div><div class="map-stat"><span>Proyectos</span><strong>${s.projects}</strong></div><div class="map-stat"><span>Cobertura compuesta</span><strong>${s.coverage}%</strong></div><div class="map-stat"><span>Prioridad</span><strong>${s.priority}</strong></div></div><div class="card-actions"><button type="button" class="text-button" data-vereda-download="${i}">Descargar ficha</button><button type="button" class="text-button" data-vereda-services="${i}">Ver servicios</button></div>`;}; svg.addEventListener('click',e=>{const p=e.target.closest('[data-vereda-index]');if(p)select(Number(p.dataset.veredaIndex));}); svg.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-vereda-index]')){e.preventDefault();select(Number(e.target.dataset.veredaIndex));}}); select(0); document.getElementById('geoPointUpload')?.addEventListener('change',e=>{const n=e.target.files.length;if(n)openDetail('Puntos cargados',`${demoBadge('SESION LOCAL')}<p>${n} archivo seleccionado para superponer sobre el mapa demo.</p>`);e.target.value='';}); }
function walkCoords(value,cb){ if(!Array.isArray(value))return; if(typeof value[0]==='number'&&typeof value[1]==='number'){cb(value);return;} value.forEach(v=>walkCoords(v,cb)); }
function geometryPath(geometry,project){ const polys=geometry?.type==='Polygon'?[geometry.coordinates]:geometry?.type==='MultiPolygon'?geometry.coordinates:[]; return polys.map(poly=>poly.map(ring=>ring.map((c,i)=>{const [x,y]=project(c);return `${i?'L':'M'}${x.toFixed(1)},${y.toFixed(1)}`;}).join(' ')+' Z').join(' ')).join(' '); }

function renderPublications(){ const grid=document.getElementById('publicationGrid'); if(!grid)return; const list=TI_STATE.demo.insights.slice(0,4); grid.innerHTML=list.map(x=>`<article class="document-card"><small>${escapeHtml(x.type)} · ${demoBadge()}</small><h4>${escapeHtml(x.title)}</h4><p>${escapeHtml(x.summary)}</p><div class="card-actions"><button type="button" class="text-button" data-insight-detail="${x.id}">Leer</button><button type="button" class="text-button" data-insight-download="${x.id}">Descargar ficha</button></div></article>`).join(''); document.getElementById('publicationUpload')?.addEventListener('change',e=>{const n=e.target.files.length;if(n)openDetail('Publicaciones recibidas',`<p>${n} archivo(s) seleccionados para la sesión.</p>`);e.target.value='';}); }
function renderGlossary(){ const list=document.getElementById('glossaryList'),search=document.getElementById('glossarySearch'); const draw=()=>{const q=(search?.value||'').toLowerCase(); const rows=TI_STATE.demo.data.glossary.filter(x=>`${x.term} ${x.definition} ${x.source}`.toLowerCase().includes(q)); list.innerHTML=rows.map(x=>`<article class="glossary-entry"><h4>${escapeHtml(x.term)}</h4><p>${escapeHtml(x.definition)}</p><p>${escapeHtml(x.source)}</p></article>`).join('');}; draw();search?.addEventListener('input',draw);document.getElementById('exportGlossary')?.addEventListener('click',()=>downloadBlob('glosario-demo.csv',rowsToCsv(TI_STATE.demo.data.glossary),'text/csv;charset=utf-8')); }

function renderPlan(){
  const root=document.getElementById('planDashboard'); if(!root)return;
  const plan=TI_STATE.demo.plan;
  const programs=plan.ejes.flatMap(e=>e.programs.map(p=>({...p,ejeId:e.id,eje:e.name,ejeMedia:e.media})));
  const budget=programs.reduce((sum,p)=>sum+p.budget,0);
  const progress=Math.round(programs.reduce((sum,p)=>sum+effectiveProgramProgress(p),0)/programs.length);
  const goals=programs.reduce((sum,p)=>sum+p.goals.length,0);
  const weakest=[...programs].sort((a,b)=>effectiveProgramProgress(a)-effectiveProgramProgress(b))[0];
  root.innerHTML=`<div class="dashboard-head"><div><p class="eyebrow">${escapeHtml(plan.name)}</p><h2 class="big-heading">De compromisos públicos a decisiones que se pueden seguir.</h2><p class="dashboard-lead">${escapeHtml(plan.sourceNote||'')}</p></div><div class="dashboard-actions"><button type="button" class="action-button" data-plan-export>Exportar plan CSV</button><button type="button" class="text-button" data-plan-summary>Resumen ejecutivo</button></div></div>
  <section class="plan-story"><figure class="plan-story-media">${mediaOrFallback(plan.ejes[3]?.media||plan.ejes[0]?.media,'Territorio y ejecución del plan')}<figcaption>Imagen editorial del prototipo · el contenido de seguimiento debe sustituirse por fuentes institucionales verificadas.</figcaption></figure><div class="plan-story-copy"><p class="eyebrow">Corte de implementación</p><h3>${progress}% de avance promedio necesita una lectura, no solo una cifra.</h3><p>El menor avance del escenario ilustrativo está en <strong>${escapeHtml(weakest.name)}</strong> (${effectiveProgramProgress(weakest)}%). Esta lectura sirve para orientar preguntas de gestión antes de entrar al catálogo completo.</p><div class="plan-primary-metric">${radialProgress(progress,'avance promedio')}</div></div></section>
  <div class="plan-context-strip"><article><small>Ejes estratégicos</small><strong>${plan.ejes.length}</strong><p>Organizan la lectura del plan.</p></article><article><small>Programas</small><strong>${programs.length}</strong><p>Con responsables y metas.</p></article><article><small>Metas en el prototipo</small><strong>${goals}</strong><p>Se consultan por programa.</p></article><article><small>Inversión programada</small><strong>${moneyCompact(budget)}</strong><p>Valor ilustrativo, no oficial.</p></article></div>
  <section class="plan-timeline" aria-label="Secuencia del Plan de Desarrollo"><p class="eyebrow">Del acuerdo al cierre</p><ol><li><time>2024</time><strong>Aprobación</strong><span>El plan entra en ejecución.</span></li><li><time>2025</time><strong>Implementación</strong><span>Programas y metas empiezan a generar evidencia.</span></li><li class="current"><time>2026</time><strong>Corte actual</strong><span>Seguimiento, riesgos y decisiones.</span></li><li><time>2027</time><strong>Cierre</strong><span>Resultados, balance y sostenibilidad.</span></li></ol></section>
  <div class="portfolio-heading"><div><p class="eyebrow">Explorar el plan</p><h3>Seis ejes. Un mismo sistema de seguimiento.</h3></div></div><div class="eje-tabs"><button type="button" class="eje-tab active" data-eje-filter="all">Todos</button>${plan.ejes.map(e=>`<button type="button" class="eje-tab" data-eje-filter="${e.id}">${escapeHtml(e.name)}</button>`).join('')}</div><div class="program-grid" id="programGrid"></div><p class="prototype-caption">Presupuestos, avances y simulaciones son ilustrativos para probar la experiencia y deben sustituirse por información oficial antes de publicación institucional.</p>`;
  const grid=root.querySelector('#programGrid');
  const draw=id=>{
    const rows=id==='all'?programs:programs.filter(p=>p.ejeId===id);
    grid.innerHTML=rows.map((p,i)=>`<article class="program-card ${i===0?'program-feature':''}">${i===0?`<div class="card-media">${mediaOrFallback(p.media||p.ejeMedia,p.name)}</div>`:''}<small>${escapeHtml(p.eje)}</small><h3>${escapeHtml(p.name)}</h3><div class="progress-row"><div class="progress-track"><span style="width:${pct(effectiveProgramProgress(p))}%"></span></div><strong>${effectiveProgramProgress(p)}%</strong></div><dl><div><dt>Presupuesto</dt><dd>${moneyCompact(p.budget)}</dd></div><div><dt>Responsable</dt><dd>${escapeHtml(p.responsible)}</dd></div><div><dt>Metas</dt><dd>${p.goals.length}</dd></div></dl><div class="card-actions card-actions--hierarchy"><button type="button" class="text-button" data-plan-detail="${p.id}">Ver programa</button><button type="button" class="text-button secondary-action" data-plan-goals="${p.id}">Metas</button><button type="button" class="text-button demo-only-action" data-plan-bump="${p.id}">Simular +5%</button></div></article>`).join('');
  };
  draw('all');
  root.querySelectorAll('[data-eje-filter]').forEach(b=>b.addEventListener('click',()=>{root.querySelectorAll('[data-eje-filter]').forEach(x=>x.classList.toggle('active',x===b));draw(b.dataset.ejeFilter);}));
}

function renderCompliance(){
  const root=document.getElementById('complianceDashboard'); if(!root)return;
  const projects=TI_STATE.demo.compliance.projects;
  const total=projects.reduce((sum,p)=>sum+p.budget,0),exec=projects.reduce((sum,p)=>sum+p.executed,0),avg=Math.round(projects.reduce((sum,p)=>sum+effectiveProjectProgress(p),0)/projects.length),high=projects.filter(p=>p.risk==='Alto').length;
  const highRisk=projects.filter(p=>p.risk==='Alto');
  root.innerHTML=`<div class="dashboard-head"><div><p class="eyebrow">Unidad de Cumplimiento</p><h2 class="big-heading">El seguimiento empieza con cinco preguntas, no con un semáforo.</h2><p class="dashboard-lead">Seguimiento ilustrativo construido sobre iniciativas territoriales de referencia y cifras operativas de prototipo.</p></div><div class="dashboard-actions"><button type="button" class="action-button" data-project-export>Exportar proyectos</button></div></div>
  <section class="delivery-questions" aria-label="Cinco preguntas de seguimiento"><article><small>01</small><h3>¿Qué queremos lograr?</h3><p>${projects.length} proyectos prioritarios conforman el portafolio ilustrativo.</p></article><article><small>02</small><h3>¿Cómo lo haremos?</h3><p>Responsables, cronogramas, presupuesto y beneficiarios en una misma ficha.</p></article><article><small>03</small><h3>¿Vamos por buen camino?</h3><p><strong>${avg}%</strong> de avance promedio en el escenario actual.</p></article><article class="attention"><small>04</small><h3>¿Qué necesita decisión?</h3><p><strong>${high}</strong> proyectos aparecen con riesgo alto y requieren lectura de bloqueos.</p></article><article><small>05</small><h3>¿Cómo sostenemos el resultado?</h3><p>Hitos, evidencia y próximos pasos visibles antes del cierre.</p></article></section>
  <section class="decision-board"><div><p class="eyebrow">Qué necesita atención ahora</p><h3>Los riesgos altos deben convertirse en conversación de gestión.</h3></div><div class="decision-list">${highRisk.map(p=>`<article><div><small>${escapeHtml(p.sector)} · ${escapeHtml(p.vereda)}</small><strong>${escapeHtml(p.name)}</strong><p>${p.risks.map(escapeHtml).join(' · ')}</p></div><button type="button" class="text-button" data-project-risk="${p.id}">Revisar bloqueos</button></article>`).join('')||'<p>No hay riesgos altos en el escenario actual.</p>'}</div></section>
  <div class="compliance-context-strip"><article><small>Inversión seguida</small><strong>${moneyCompact(total)}</strong><span>ilustrativa</span></article><article><small>Ejecutado</small><strong>${moneyCompact(exec)}</strong><span>ilustrativo</span></article><article><small>Avance promedio</small><strong>${avg}%</strong><span>escenario actual</span></article></div>
  <div class="project-spotlights">${projects.slice(0,3).map((p,i)=>`<article class="project-spotlight ${i===0?'primary':''}">${mediaOrFallback(p.media,p.name)}<div class="project-spotlight-copy"><span class="risk risk-${p.risk.toLowerCase()}">${escapeHtml(p.risk)}</span><small>${escapeHtml(p.sector)} · ${escapeHtml(p.vereda)}</small><h3>${escapeHtml(p.name)}</h3><div><strong>${effectiveProjectProgress(p)}%</strong><span>avance</span></div><button type="button" class="outline-link" data-project-detail="${p.id}">Abrir seguimiento →</button></div></article>`).join('')}</div>
  <div class="portfolio-heading"><div><p class="eyebrow">Portafolio completo</p><h3>Todos los proyectos, comparables.</h3></div><select id="projectRiskFilter" class="compact-select" aria-label="Filtrar proyectos por riesgo"><option value="">Todos los riesgos</option><option>Bajo</option><option>Medio</option><option>Alto</option></select></div><div class="project-grid" id="projectGrid"></div>
  <section class="delivery-voices"><div><p class="eyebrow">Escenarios ilustrativos de implementación</p><h3>El seguimiento funciona cuando ayuda a conversar antes de que el problema explote.</h3></div><div class="delivery-voice-list">${(TI_STATE.demo.compliance.voices||[]).map(v=>`<article>${mediaOrFallback(v.media,v.role)}<blockquote>“${escapeHtml(v.quote)}”</blockquote><small>${escapeHtml(v.role)}</small></article>`).join('')}</div></section>
  <p class="prototype-caption">Avances, presupuestos, contratos y voces son ilustrativos para el prototipo y no deben interpretarse como información oficial.</p>`;
  const grid=root.querySelector('#projectGrid'),filter=root.querySelector('#projectRiskFilter');
  const draw=()=>{const rows=projects.filter(p=>!filter.value||p.risk===filter.value);grid.innerHTML=rows.map((p,i)=>`<article class="project-card ${i===0?'project-feature':''}">${i===0?`<div class="card-media">${mediaOrFallback(p.media,p.name)}</div>`:''}<div class="project-top"><span class="risk risk-${p.risk.toLowerCase()}">${escapeHtml(p.risk)}</span><small>${escapeHtml(p.sector)} · ${escapeHtml(p.vereda)}</small></div><h3>${escapeHtml(p.name)}</h3><div class="project-progress"><strong>${effectiveProjectProgress(p)}%</strong><div class="progress-track"><span style="width:${pct(effectiveProjectProgress(p))}%"></span></div></div><dl><div><dt>Presupuesto</dt><dd>${moneyCompact(p.budget)}</dd></div><div><dt>Beneficiarios</dt><dd>${num(p.beneficiaries)}</dd></div><div><dt>Estado</dt><dd>${escapeHtml(p.status)}</dd></div></dl><div class="card-actions card-actions--hierarchy"><button type="button" class="text-button" data-project-detail="${p.id}">Abrir proyecto</button><button type="button" class="text-button secondary-action" data-project-risk="${p.id}">Riesgos</button><button type="button" class="text-button demo-only-action" data-project-bump="${p.id}">Simular +5%</button></div></article>`).join('');};
  draw();filter.addEventListener('change',draw);
}

function renderPolicies(){
  const root=document.getElementById('policyDashboard'); if(!root)return;
  const list=TI_STATE.demo.policies;
  const statuses=[...new Set(list.map(p=>p.status))];
  const leads=[...new Set(list.map(p=>p.lead))];
  const featured=list[0];
  root.innerHTML=`<div class="dashboard-head"><div><p class="eyebrow">Políticas públicas</p><h2 class="big-heading">Primero la política que importa hoy. Después, el catálogo completo.</h2><p class="dashboard-lead">La taxonomía disponible en el prototipo usa estado, horizonte y responsable. Nuevos filtros deben conectarse a metadatos oficiales, no inventarse.</p></div><button type="button" class="action-button" data-policy-export>Exportar portafolio</button></div>
  <article class="policy-feature editorial-feature">${mediaOrFallback(featured.media,featured.name)}<div><small>${escapeHtml(featured.status)} · ${escapeHtml(featured.horizon)}</small><h3>${escapeHtml(featured.name)}</h3><p>Responsable: <strong>${escapeHtml(featured.lead)}</strong>. Avance ilustrativo: ${featured.progress}%.</p><button type="button" class="outline-link" data-policy-detail="${featured.id}">Leer política →</button></div></article>
  <div class="collection-heading"><div><p class="eyebrow">Explorar políticas</p><h3>Filtrar antes de recorrer.</h3></div><div class="policy-filters"><input id="policySearch" type="search" class="compact-search" placeholder="Buscar política" aria-label="Buscar política"><select id="policyStatusFilter" class="compact-select" aria-label="Filtrar por estado"><option value="">Todos los estados</option>${statuses.map(x=>`<option>${escapeHtml(x)}</option>`).join('')}</select><select id="policyLeadFilter" class="compact-select" aria-label="Filtrar por responsable"><option value="">Todos los responsables</option>${leads.map(x=>`<option>${escapeHtml(x)}</option>`).join('')}</select></div></div><div class="policy-grid" id="policyGrid"></div><p class="prototype-caption">Estados y porcentajes son ilustrativos para demostrar la experiencia de seguimiento.</p>`;
  const grid=root.querySelector('#policyGrid'),search=root.querySelector('#policySearch'),status=root.querySelector('#policyStatusFilter'),lead=root.querySelector('#policyLeadFilter');
  const draw=()=>{const q=search.value.trim().toLowerCase();const rows=list.filter(p=>(!q||`${p.name} ${p.lead} ${p.actions.join(' ')}`.toLowerCase().includes(q))&&(!status.value||p.status===status.value)&&(!lead.value||p.lead===lead.value));grid.innerHTML=rows.map(p=>`<article class="policy-card"><small>${escapeHtml(p.status)} · ${escapeHtml(p.horizon)}</small><h3>${escapeHtml(p.name)}</h3><div class="progress-row"><div class="progress-track"><span style="width:${pct(p.progress)}%"></span></div><strong>${p.progress}%</strong></div><p>${escapeHtml(p.lead)}</p><button type="button" class="text-button" data-policy-detail="${p.id}">Leer política</button></article>`).join('')||'<div class="empty-state">No hay políticas que coincidan con los filtros.</div>';};
  [search,status,lead].forEach(el=>el.addEventListener(el===search?'input':'change',draw));draw();
}

function renderInsights(){
  const root=document.getElementById('insightDashboard'); if(!root)return;
  const list=TI_STATE.demo.insights;
  const hero=list[0];
  const types=[...new Set(list.map(x=>x.type))];
  const tags=[...new Set(list.flatMap(x=>x.tags||[]))];
  root.innerHTML=`<div class="dashboard-head"><div><p class="eyebrow">Insights · publicación editorial</p><h2 class="big-heading">Un hallazgo principal. Después, un archivo que se pueda explorar.</h2><p class="dashboard-lead">Las piezas del prototipo son ilustrativas y sirven para probar jerarquía, filtros y lectura larga.</p></div><button type="button" class="action-button" data-insight-export>Exportar índice</button></div>
  <article class="insight-feature">${mediaOrFallback(hero.media,hero.title)}<div><small>${escapeHtml(hero.type)} · ${escapeHtml(dateLabel(hero.date))}</small><h3>${escapeHtml(hero.title)}</h3><p>${escapeHtml(hero.summary)}</p><div class="tag-row">${hero.tags.map(t=>`<span>${escapeHtml(t)}</span>`).join('')}</div><button type="button" class="outline-link" data-insight-detail="${hero.id}">Leer análisis →</button></div></article>
  <article class="insight-reader" id="insightReader" hidden aria-live="polite"></article>
  <div class="collection-heading"><div><p class="eyebrow">Archivo</p><h3>Explorar por tema y formato.</h3></div><div class="insight-filters"><input id="insightSearch" class="compact-search" type="search" placeholder="Buscar análisis" aria-label="Buscar análisis"><select id="insightTypeFilter" class="compact-select" aria-label="Filtrar por tipo"><option value="">Todos los tipos</option>${types.map(x=>`<option>${escapeHtml(x)}</option>`).join('')}</select><select id="insightTagFilter" class="compact-select" aria-label="Filtrar por tema"><option value="">Todos los temas</option>${tags.map(x=>`<option>${escapeHtml(x)}</option>`).join('')}</select></div></div><div class="insight-grid" id="insightGrid"></div>`;
  const grid=root.querySelector('#insightGrid'),search=root.querySelector('#insightSearch'),type=root.querySelector('#insightTypeFilter'),tag=root.querySelector('#insightTagFilter');
  const draw=()=>{const q=search.value.trim().toLowerCase();const rows=list.slice(1).filter(x=>(!q||`${x.title} ${x.summary} ${(x.tags||[]).join(' ')}`.toLowerCase().includes(q))&&(!type.value||x.type===type.value)&&(!tag.value||(x.tags||[]).includes(tag.value)));grid.innerHTML=rows.map((x,i)=>`<article class="insight-card ${i%3===0?'insight-with-media':''}">${i%3===0?`<div class="card-media">${mediaOrFallback(x.media,x.title)}</div>`:''}<small>${escapeHtml(x.type)} · ${escapeHtml(dateLabel(x.date))}</small><h3>${escapeHtml(x.title)}</h3><p>${escapeHtml(x.summary)}</p><div class="tag-row">${x.tags.map(t=>`<span>${escapeHtml(t)}</span>`).join('')}</div><div class="card-actions"><button type="button" class="text-button" data-insight-detail="${x.id}">Leer análisis</button><button type="button" class="text-button secondary-action" data-insight-download="${x.id}">Descargar ficha</button></div></article>`).join('')||'<div class="empty-state">No hay contenidos que coincidan con los filtros.</div>';};
  [search,type,tag].forEach(el=>el.addEventListener(el===search?'input':'change',draw));draw();
}

function openInsightReader(x){
  const reader=document.getElementById('insightReader');
  if(!reader){openDetail(x.title,`${demoBadge()}<p>${escapeHtml(x.summary)}</p>`);return;}
  const body=(x.body||[]).map(p=>`<p>${escapeHtml(p)}</p>`).join('');
  reader.hidden=false;
  reader.innerHTML=`<button type="button" class="reader-close" data-insight-reader-close>Volver al archivo ↑</button><p class="eyebrow">${escapeHtml(x.type)} · ${escapeHtml(dateLabel(x.date))}</p><h2 tabindex="-1">${escapeHtml(x.title)}</h2><p class="reader-lede">${escapeHtml(x.summary)}</p><div class="reader-meta"><span>${escapeHtml(x.author||'Equipo Territorio Inteligente · contenido ilustrativo')}</span><span>Escenario ilustrativo · no información oficial</span></div><div class="reader-body">${body||'<p>Esta ficha demuestra la experiencia de lectura larga. El contenido definitivo debe conectarse a una publicación institucional verificable.</p>'}</div><div class="tag-row">${(x.tags||[]).map(t=>`<span>${escapeHtml(t)}</span>`).join('')}</div>`;
  reader.querySelector('[data-insight-reader-close]')?.addEventListener('click',()=>{reader.hidden=true;document.querySelector('#insightDashboard .collection-heading')?.scrollIntoView({behavior:'smooth',block:'start'});});
  requestAnimationFrame(()=>{reader.scrollIntoView({behavior:'smooth',block:'start'});reader.querySelector('h2')?.focus({preventScroll:true});});
}

function initAssistant(){ const launch=document.getElementById('assistantLaunch'),panel=document.getElementById('assistantPanel'),close=document.getElementById('assistantClose'),form=document.getElementById('assistantForm'),query=document.getElementById('assistantQuery'),results=document.getElementById('assistantResults'); if(!launch||!panel)return; const set=open=>{panel.classList.toggle('open',open);panel.setAttribute('aria-hidden',String(!open));panel.inert=!open;launch.setAttribute('aria-expanded',String(open));if(open)setTimeout(()=>query.focus(),50);};launch.addEventListener('click',()=>set(true));close.addEventListener('click',()=>set(false));form.addEventListener('submit',e=>{e.preventDefault();const q=query.value.trim().toLowerCase();if(!q)return;const index=[];TI_STATE.demo.home.services.forEach(x=>index.push({title:x.title,text:x.dependency,route:'servicios'}));TI_STATE.demo.data.sectors.forEach(x=>index.push({title:x.name,text:x.indicators.map(i=>i.indicator).join(' '),route:'data'}));TI_STATE.demo.plan.ejes.flatMap(e=>e.programs).forEach(x=>index.push({title:x.name,text:x.goals.join(' '),route:'desarrollo'}));TI_STATE.demo.compliance.projects.forEach(x=>index.push({title:x.name,text:`${x.sector} ${x.vereda} ${x.risk}`,route:'cumplimiento'}));TI_STATE.demo.insights.forEach(x=>index.push({title:x.title,text:x.summary,route:'insights'}));const terms=q.split(/\s+/);const matches=index.map(x=>({...x,score:terms.reduce((s,t)=>s+(`${x.title} ${x.text}`.toLowerCase().includes(t)?1:0),0)})).filter(x=>x.score).sort((a,b)=>b.score-a.score).slice(0,10);results.innerHTML=matches.length?matches.map(x=>`<article class="assistant-result"><button type="button" data-assistant-route="${x.route}">${escapeHtml(x.title)}</button><p>${escapeHtml(x.text)}</p></article>`).join(''):'<div class="empty-state">No encontré coincidencia. Prueba: acueducto, vías, salud, riesgo, predial o vivienda.</div>';});results.addEventListener('click',e=>{const b=e.target.closest('[data-assistant-route]');if(!b)return;document.querySelector(`.route-link[data-route="${b.dataset.assistantRoute}"]`)?.click();set(false);}); }

function initGlobalActions(){ document.addEventListener('keydown',e=>{ if((e.key==='Enter'||e.key===' ')&&e.target.matches('[role=button][data-news-detail],[role=button][data-municipal-detail]')){ e.preventDefault(); e.target.click(); } }); document.addEventListener('click',e=>{
  let b=e.target.closest('[data-news-detail]'); if(b){const x=findHomeNews(b.dataset.newsDetail); if(x)openDetail(x.title,`${x.sourceUrl?'':demoBadge()}<p>${escapeHtml(x.summary)}</p><p><strong>Fuente:</strong> ${escapeHtml(x.source||x.dependency)}</p><p><strong>Fecha de publicación:</strong> ${escapeHtml(dateLabel(x.date))}</p>${x.sourceUrl?`<p><a class="text-button" href="${escapeHtml(x.sourceUrl)}" target="_blank" rel="noopener noreferrer">Leer publicación oficial ↗</a></p>`:''}`);return;}
  b=e.target.closest('[data-municipal-detail]'); if(b){const x=findHomeNews(b.dataset.municipalDetail); if(x)openDetail(x.title,`${x.sourceUrl?'':demoBadge()}<p>${escapeHtml(x.summary)}</p><p><strong>Fuente:</strong> ${escapeHtml(x.source||x.dependency)}</p><p><strong>Fecha de publicación:</strong> ${escapeHtml(dateLabel(x.date))}</p>${x.sourceUrl?`<p><a class="text-button" href="${escapeHtml(x.sourceUrl)}" target="_blank" rel="noopener noreferrer">Leer publicación oficial ↗</a></p>`:''}`);return;}
  b=e.target.closest('[data-service-detail]'); if(b){const x=TI_STATE.demo.home.services.find(s=>s.id===b.dataset.serviceDetail);openDetail(x.title,`${demoBadge()}<p><strong>${escapeHtml(x.dependency)}</strong></p><h3>Requisitos</h3><ul>${x.requirements.map(r=>`<li>${escapeHtml(r)}</li>`).join('')}</ul><h3>Canales</h3><ul>${x.channels.map(r=>`<li>${escapeHtml(r)}</li>`).join('')}</ul><p><strong>Tiempo:</strong> ${escapeHtml(x.time)} · <strong>Costo:</strong> ${escapeHtml(x.cost)}</p>`);return;}
  b=e.target.closest('[data-service-download]'); if(b){const x=TI_STATE.demo.home.services.find(s=>s.id===b.dataset.serviceDownload);downloadBlob(`servicio-${x.id}-demo.json`,JSON.stringify(x,null,2));return;}
  b=e.target.closest('[data-doc-detail]'); if(b){const x=TI_STATE.demo.data.documents.find(d=>d.id===b.dataset.docDetail);openDetail(x.title,`${demoBadge()}<p>${escapeHtml(x.description)}</p><p><strong>Tipo:</strong> ${x.type} · <strong>Tamaño:</strong> ${x.size}</p><p><strong>Actualizado:</strong> ${dateLabel(x.updated)}</p>`);return;}
  b=e.target.closest('[data-doc-download]'); if(b){const x=TI_STATE.demo.data.documents.find(d=>d.id===b.dataset.docDownload);downloadBlob(`${x.id}-metadatos-demo.json`,JSON.stringify(x,null,2));return;}
  b=e.target.closest('[data-data-export]'); if(b){const x=TI_STATE.demo.data.sectors.find(s=>s.id===b.dataset.dataExport);downloadBlob(`${x.id}-demo.csv`,rowsToCsv(x.indicators),'text/csv;charset=utf-8');return;}
  b=e.target.closest('[data-data-compare]'); if(b){openDetail('Comparación sectorial',`${demoBadge()}<div class="compare-list">${TI_STATE.demo.data.sectors.map(s=>`<div><span>${escapeHtml(s.name)}</span><strong>${escapeHtml(s.headline)}</strong></div>`).join('')}</div>`);return;}
  b=e.target.closest('[data-sector-method]'); if(b){const x=TI_STATE.demo.data.sectors.find(s=>s.id===b.dataset.sectorMethod);openDetail(`Metodología · ${x.name}`,`${demoBadge()}<p>Serie sintética 2022–2026 creada exclusivamente para demostrar la navegación, los gráficos y la lectura sectorial. Debe reemplazarse por la metodología y fuente oficial.</p>`);return;}
  b=e.target.closest('[data-dataset-note]'); if(b){openDetail(b.dataset.datasetNote,`${demoBadge()}<p>Indicador precargado para demostrar interacción con la gráfica y la tabla.</p>`);return;}
  b=e.target.closest('[data-vereda-download]'); if(b){const x=TI_STATE.demo.data.veredaStats[Number(b.dataset.veredaDownload)];downloadBlob(`vereda-${x.name}-demo.json`,JSON.stringify(x,null,2));return;}
  b=e.target.closest('[data-vereda-services]'); if(b){const x=TI_STATE.demo.data.veredaStats[Number(b.dataset.veredaServices)];openDetail(`Servicios · ${x.name}`,`${demoBadge()}<p>Servicios con presencia demo: ${x.services}. Beneficiarios agregados: ${num(x.beneficiaries)}. Cobertura compuesta: ${x.coverage}%.</p>`);return;}
  b=e.target.closest('[data-plan-detail]'); if(b){const p=TI_STATE.demo.plan.ejes.flatMap(e=>e.programs).find(x=>x.id===b.dataset.planDetail);openDetail(p.name,`${demoBadge()}<p><strong>Responsable:</strong> ${escapeHtml(p.responsible)}</p><p><strong>Presupuesto:</strong> ${money(p.budget)} · <strong>Avance:</strong> ${effectiveProgramProgress(p)}%</p><h3>Metas</h3><ul>${p.goals.map(g=>`<li>${escapeHtml(g)}</li>`).join('')}</ul>`);return;}
  b=e.target.closest('[data-plan-goals]'); if(b){const p=TI_STATE.demo.plan.ejes.flatMap(e=>e.programs).find(x=>x.id===b.dataset.planGoals);openDetail(`Metas · ${p.name}`,`<ol class="goal-list">${p.goals.map((g,i)=>`<li><strong>${i+1}</strong>${escapeHtml(g)}</li>`).join('')}</ol>`);return;}
  b=e.target.closest('[data-plan-bump]'); if(b){const id=b.dataset.planBump,p=TI_STATE.demo.plan.ejes.flatMap(e=>e.programs).find(x=>x.id===id);TI_STATE.planProgress[id]=Math.min(100,effectiveProgramProgress(p)+5);localStorage.setItem('ti-demo-plan-progress',JSON.stringify(TI_STATE.planProgress));renderPlan();openDetail('Simulación aplicada',`<p>${escapeHtml(p.name)} ahora muestra ${TI_STATE.planProgress[id]}% en tu navegador.</p>`);return;}
  b=e.target.closest('[data-plan-export]'); if(b){const rows=TI_STATE.demo.plan.ejes.flatMap(e=>e.programs.map(p=>({eje:e.name,programa:p.name,presupuesto_millones:p.budget,avance:effectiveProgramProgress(p),responsable:p.responsible,metas:p.goals.join(' | ')})));downloadBlob('plan-desarrollo-demo.csv',rowsToCsv(rows),'text/csv;charset=utf-8');return;}
  b=e.target.closest('[data-plan-summary]'); if(b){openDetail('Resumen ejecutivo del Plan Demo',`${demoBadge()}<p>El plan demo contiene ${TI_STATE.demo.plan.ejes.length} ejes y ${TI_STATE.demo.plan.ejes.flatMap(e=>e.programs).length} programas. Los mayores presupuestos se concentran en infraestructura, componente social y sostenibilidad.</p>`);return;}
  b=e.target.closest('[data-project-detail]'); if(b){const p=TI_STATE.demo.compliance.projects.find(x=>x.id===b.dataset.projectDetail);openDetail(p.name,`${demoBadge()}<div class="project-detail-grid"><div><small>Avance</small><strong>${effectiveProjectProgress(p)}%</strong></div><div><small>Presupuesto</small><strong>${money(p.budget)}</strong></div><div><small>Ejecutado</small><strong>${money(p.executed)}</strong></div><div><small>Beneficiarios</small><strong>${num(p.beneficiaries)}</strong></div></div><h3>Cronograma</h3><p>${escapeHtml(p.schedule)}</p><ul>${p.milestones.map(m=>`<li>${escapeHtml(m)}</li>`).join('')}</ul><p><strong>Contrato:</strong> ${escapeHtml(p.contract)} · <strong>Evidencias:</strong> ${p.evidence}</p>`);return;}
  b=e.target.closest('[data-project-risk]'); if(b){const p=TI_STATE.demo.compliance.projects.find(x=>x.id===b.dataset.projectRisk);openDetail(`Riesgos · ${p.name}`,`${demoBadge()}<p>Clasificación actual: <strong>${p.risk}</strong></p><ul>${p.risks.map(r=>`<li>${escapeHtml(r)}</li>`).join('')}</ul>`);return;}
  b=e.target.closest('[data-project-bump]'); if(b){const id=b.dataset.projectBump,p=TI_STATE.demo.compliance.projects.find(x=>x.id===id);TI_STATE.projectProgress[id]=Math.min(100,effectiveProjectProgress(p)+5);localStorage.setItem('ti-demo-project-progress',JSON.stringify(TI_STATE.projectProgress));renderCompliance();openDetail('Seguimiento demo actualizado',`<p>${escapeHtml(p.name)} ahora muestra ${TI_STATE.projectProgress[id]}%.</p>`);return;}
  b=e.target.closest('[data-project-export]'); if(b){downloadBlob('proyectos-cumplimiento-demo.csv',rowsToCsv(TI_STATE.demo.compliance.projects),'text/csv;charset=utf-8');return;}
  b=e.target.closest('[data-policy-detail]'); if(b){const p=TI_STATE.demo.policies.find(x=>x.id===b.dataset.policyDetail);openDetail(p.name,`${demoBadge()}<p><strong>${p.status}</strong> · ${p.progress}% · ${escapeHtml(p.horizon)}</p><p><strong>Responsable:</strong> ${escapeHtml(p.lead)}</p><h3>Acciones prioritarias</h3><ul>${p.actions.map(a=>`<li>${escapeHtml(a)}</li>`).join('')}</ul>`);return;}
  b=e.target.closest('[data-policy-export]'); if(b){downloadBlob('politicas-publicas-demo.csv',rowsToCsv(TI_STATE.demo.policies),'text/csv;charset=utf-8');return;}
  b=e.target.closest('[data-insight-detail]'); if(b){const x=TI_STATE.demo.insights.find(i=>i.id===b.dataset.insightDetail);openInsightReader(x);return;}
  b=e.target.closest('[data-insight-download]'); if(b){const x=TI_STATE.demo.insights.find(i=>i.id===b.dataset.insightDownload);downloadBlob(`insight-${x.id}-demo.json`,JSON.stringify(x,null,2));return;}
  b=e.target.closest('[data-insight-export]'); if(b){downloadBlob('insights-demo.csv',rowsToCsv(TI_STATE.demo.insights),'text/csv;charset=utf-8');return;}
  b=e.target.closest('[data-demo-copy]'); if(b){navigator.clipboard?.writeText(b.dataset.demoCopy);b.textContent='Copiado';return;}
  b=e.target.closest('[data-demo-download]'); if(b){downloadBlob(`${b.dataset.demoDownload}.json`,JSON.stringify({demo:true,title:b.dataset.demoDownload},null,2));return;}
 }); }

function initEditorMode(){ const params=new URLSearchParams(location.search),panel=document.getElementById('editorPanel'); if(!panel)return; if(params.get('editor')==='1')panel.hidden=false; document.getElementById('editorExport')?.addEventListener('click',()=>downloadBlob('territorio-inteligente-v2.4-prototipo.json',JSON.stringify(TI_STATE.demo,null,2))); document.getElementById('editorImport')?.addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{TI_STATE.demo=JSON.parse(await f.text());renderAll();openDetail('Snapshot importado','<p>La demo fue reemplazada durante esta sesión.</p>');}catch(err){openDetail('JSON inválido',`<p>${escapeHtml(err.message)}</p>`);}e.target.value='';}); document.getElementById('editorReset')?.addEventListener('click',()=>{localStorage.removeItem('ti-demo-plan-progress');localStorage.removeItem('ti-demo-project-progress');location.reload();}); }

function renderAll(){ renderHome(); renderServices(); renderDataTerritorio(); renderPlan(); renderCompliance(); renderPolicies(); renderInsights(); }

async function tiBoot(){ try{ const [demo,baseData,requirements,geo]=await Promise.all([tiFetchJson(TI_PATHS.demo),tiFetchJson(TI_PATHS.baseData),tiFetchJson(TI_PATHS.requirements),tiFetchJson(TI_PATHS.geo)]); TI_STATE.demo=demo;TI_STATE.baseData=baseData;TI_STATE.requirements=requirements;TI_STATE.geo=geo; initModuleTabs(); initDialog(); renderAll(); initGlobalActions(); initAssistant(); initEditorMode(); }catch(err){ console.error(err); const status=document.getElementById('dataGlobalStatus'); if(status)status.textContent=`Error cargando demo: ${err.message}`; } }


/* TI_UNIFIED_EXTERNAL_SOURCES_V2 */
function tiSyncUnifiedExternalSources(level) {
  const daneView = document.getElementById('dataSourceDaneView');
  const externalView = document.getElementById('dataSourceExternalView');
  const isDane = level === 'dane';
  if (daneView) daneView.hidden = !isDane;
  if (externalView) externalView.hidden = isDane;
}

document.addEventListener('click', function (event) {
  const button = event.target.closest('[data-source-level]');
  if (!button) return;
  tiSyncUnifiedExternalSources(button.dataset.sourceLevel);
});
/* /TI_UNIFIED_EXTERNAL_SOURCES_V2 */

document.addEventListener('DOMContentLoaded',tiBoot);
