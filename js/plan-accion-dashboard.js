/* TERRITORIO INTELIGENTE | Planes de Accion 2025 / 2026 | Solo pantalla Resumen.
 * Fuente: los dos archivos Excel entregados. Sin indicadores ni fotos inventadas.
 * Cualquier semaforizacion es una lectura orientativa, no un dictamen oficial.
 */
(() => {
  'use strict';
  const panel = document.getElementById('desarrollo-accion');
  if (!panel) return;
  panel.classList.add('pa-mounted');

  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const fullMonths = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const categories = ['Resumen','Totalizador del Plan','Información General','Actividades','Avance Físico','Beneficiarios','Ejecución Presupuestal','Territorio','Contratación de Inversión','Soportes','Observaciones'];
  const navSvg = inner => `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${inner}</svg>`;
  const categoryIcons = [
    navSvg("<rect x=\"3\" y=\"3.5\" width=\"18\" height=\"17\" rx=\"1.5\"/><rect x=\"7\" y=\"8\" width=\"10\" height=\"8\" rx=\".5\"/><path d=\"M9 11h6\"/>"),
    navSvg("<path d=\"M3 21V12h4v9M10 21V7h4v14M17 21V3h4v18\"/><path d=\"M2 21h21\"/>"),
    navSvg("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\" stroke=\"none\"/><path d=\"M12 11v6M12 7.2v.5\" stroke=\"var(--pa-icon-cutout,#f4f7fa)\" stroke-width=\"2.7\"/>"),
    navSvg("<path d=\"M10 6h11M10 12h11M10 18h11\"/><rect x=\"3\" y=\"4.5\" width=\"4\" height=\"3\" rx=\".5\" fill=\"currentColor\" stroke=\"none\"/><rect x=\"3\" y=\"10.5\" width=\"4\" height=\"3\" rx=\".5\" fill=\"currentColor\" stroke=\"none\"/><rect x=\"3\" y=\"16.5\" width=\"4\" height=\"3\" rx=\".5\" fill=\"currentColor\" stroke=\"none\"/>"),
    navSvg("<path d=\"M3 21V3M3 21h18M7 17v-4M11 17V9M15 17V12M19 17V5\"/><path d=\"m6 13 5-5 4 2 5-6m-4 0h4v4\"/>"),
    navSvg("<circle cx=\"12\" cy=\"7.5\" r=\"3\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"5.1\" cy=\"9\" r=\"2.4\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"18.9\" cy=\"9\" r=\"2.4\" fill=\"currentColor\" stroke=\"none\"/><path d=\"M6.5 21v-2.8c0-3.1 2-4.7 5.5-4.7s5.5 1.6 5.5 4.7V21zM1 20v-2c0-2.3 1.1-3.5 3.7-3.5M23 20v-2c0-2.3-1.1-3.5-3.7-3.5\" fill=\"currentColor\" stroke=\"none\"/>"),
    navSvg("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\" stroke=\"none\"/><path d=\"M15 8.8c-1.6-1.4-5-.9-5 1.4 0 2.6 5.3 1.1 5.3 4.2 0 2.3-3.9 3.2-6 1.4M12 5.8v12.4\" stroke=\"var(--pa-icon-cutout,#f4f7fa)\" stroke-width=\"2\"/>"),
    navSvg("<path d=\"M12 22S4 15.4 4 10a8 8 0 0 1 16 0c0 5.4-8 12-8 12Z\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"12\" cy=\"10\" r=\"2.8\" fill=\"var(--pa-icon-cutout,#f4f7fa)\" stroke=\"none\"/>"),
    navSvg("<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\" stroke=\"none\"/><rect x=\"8\" y=\"5.5\" width=\"8\" height=\"13\" rx=\"1.2\" fill=\"none\" stroke=\"var(--pa-icon-cutout,#f4f7fa)\" stroke-width=\"1.8\"/><path d=\"M10 10h4M10 13h4\" stroke=\"var(--pa-icon-cutout,#f4f7fa)\" stroke-width=\"1.8\"/>"),
    navSvg("<path d=\"M6 2h8l5 5v15H6z\" fill=\"currentColor\" stroke=\"none\"/><path d=\"M14 2v5h5M9 12h7M9 16h7\" stroke=\"var(--pa-icon-cutout,#f4f7fa)\" stroke-width=\"1.6\"/>"),
    navSvg("<path d=\"M4 4h16c1.1 0 2 .9 2 2v11c0 1.1-.9 2-2 2H9l-6 3V6c0-1.1.9-2 2-2Z\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"8\" cy=\"11.5\" r=\"1.3\" fill=\"var(--pa-icon-cutout,#f4f7fa)\" stroke=\"none\"/><circle cx=\"13\" cy=\"11.5\" r=\"1.3\" fill=\"var(--pa-icon-cutout,#f4f7fa)\" stroke=\"none\"/><circle cx=\"18\" cy=\"11.5\" r=\"1.3\" fill=\"var(--pa-icon-cutout,#f4f7fa)\" stroke=\"none\"/>")
  ];
  const state = { year:'2025', current:101, overallSearch:'', overallStatus:'all', overallSort:'id', data:null, list:false, listCategory:'all', qNumber:'', qKeyword:'', activityExpanded:new Set(), activeTab:'summary', physicalFilters:{status:'all',activity:'all'}, activityFilters:{q:'',status:'all',owner:'all',place:'all'}, activityCompareUnit:null, activityCarouselPage:0, beneficiaryPlace:null, activityData:null, activityLoading:true, activityError:null, infoData:null, infoLoading:true, infoError:null, territoryKind:'veredas', territoryExpanded:false, territorySelected:null, territoryGalleryPage:0, territoryExtra:null, territoryExtraLoaded:false, territoryExtraLoading:false, territoryThemeActive:new Set(), supportFilters:{activity:'all',type:'all',place:'all',from:'',to:'',q:''}, supportTreeOpen:new Set(), supportRecentAll:false, supportShowAll:false, supportExtra:null, supportVerified:null, supportExtraLoaded:false, supportLoading:false, supportError:null, obData:null, obLoading:false, obLoaded:false, obError:null, obFilters:{type:'all',status:'all',issuer:'all',from:'',to:'',q:''}, obPage:0, obSort:'source', obSortAsc:true, loading:true, error:null };
  // Persist only public navigation state. Never persist sensitive, fetched data,
  // filters, authentication, coordinates, or open modal content here.
  const PLAN_NAV_KEY='ti:plan33:navigation:v1';
  const planNavTabs=['summary','overall','general','activities','physical','beneficiaries','budget','territory','contracts','supports','observations'];
  function restorePlanNavigation(){
    try {
      const saved=JSON.parse(localStorage.getItem(PLAN_NAV_KEY)||'null');
      if(!saved||typeof saved!=='object')return;
      if(planNavTabs.includes(saved.tab))state.activeTab=saved.tab;
      const year=String(saved.year||'');
      if(['2025','2026'].includes(year)||
         (state.activeTab==='contracts'&&['2024','2027'].includes(year)))state.year=year;
      const id=Number(saved.meta);
      if(Number.isInteger(id)&&id>=1&&id<=999)state.current=id;
    } catch { /* Blocked storage, old format, or invalid JSON: use normal defaults. */ }
  }
  function rememberPlanNavigation(){
    try {
      localStorage.setItem(PLAN_NAV_KEY,JSON.stringify({
        tab:state.activeTab,year:state.year,meta:state.current
      }));
    } catch { /* The site must function even when browser storage is disabled. */ }
  }
  restorePlanNavigation();

  const fmtNum = new Intl.NumberFormat('es-CO',{maximumFractionDigits:1});
  const fmtInt = new Intl.NumberFormat('es-CO',{maximumFractionDigits:0});
  const fmtMoney = new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0});
  const html = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const isNumeric = v => typeof v === 'number' && Number.isFinite(v);
  const normalizeQuery = v => String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es-CO').trim();
  // PDF files were confirmed inside the folders linked in the Excel for Meta 101.
  // These are real documents; they are NOT presented as photographs of completed work.
  const verifiedPDFs={
    '2025:101':[
      {title:'KM - INTERVENIDOS - HASTA JUN 2025.pdf',url:'https://drive.google.com/file/d/1KYqwpuzIoZbJW1c29-o4tN0MuG843dgj/view',kind:'pdf',act:'101.1–101.2'},
      {title:'META 101 - INFORME DATAVISOR JUN 2025.pdf',url:'https://drive.google.com/file/d/1PscOVLUmCcRpTlUHzwUFU58NYtJLCwiu/view',kind:'pdf',act:'101.1–101.2'}
    ],
    '2026:101':[
      {title:'INFORME DE AVANCE META 101 - 2026.pdf',url:'https://drive.google.com/file/d/1aGcMVH-1XXhOyJaYcPhD_AXWWFSk_k3i/view',kind:'pdf',act:'101.1'}
    ]
  };
  const mediaIcons={
    people:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="7" r="3"/><path d="M3 21v-3c0-3 2.5-5 6-5s6 2 6 5v3M17 4a3 3 0 0 1 0 6M17 13c2.8 0 4 2 4 5v3"/></svg>',
    photo:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m4 18 5-5 3 2 3-4 5 7"/></svg>',
    folder:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h7l2 2h9v12H3z"/></svg>',
    file:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h8l4 4v16H6zM14 2v5h4M9 12h6M9 16h6"/></svg>'
  };
  const numberOrDash = n => isNumeric(n) ? fmtNum.format(n) : '—';
  const currencyOrDash = n => isNumeric(n) ? fmtMoney.format(n) : '—';
  const unitText = v => html(v || 'No informado');
  const valText = v => isNumeric(v) ? fmtNum.format(v) : html(v ?? '—');
  const pct = p => isNumeric(p) ? Math.min(100,Math.max(0,p*100)) : null;
  const pctLabel = p => isNumeric(p) ? fmtNum.format(p*100)+'%' : '—';
  const lineBreaks = v => html(v || 'No reportado').replace(/\n/g,'<br>');
  const safeLink = value => {
    if (typeof value!=='string') return null;
    try { const u=new URL(value);return ['https:','http:'].includes(u.protocol) ? u.href : null; }catch {return null;}
  };
  function classification(meta) {
    if (!meta || !isNumeric(meta.pct)) return {key:'unavailable',label:meta?.pctRaw ? String(meta.pctRaw) : 'Sin dato',hint:'Sin porcentaje numérico reportado'};
    if(meta.pct >= 1) return {key:'done',label:'Meta cumplida',hint:'Ejecución reportada de 100%'};
    if(meta.pct >= .4) return {key:'running',label:'En ejecución',hint:'Avance del 40% al 99%'};
    if(meta.pct > 0) return {key:'risk',label:'En riesgo*',hint:'Alerta visual: avance menor del 40%'};
    return {key:'delay',label:'Sin avance*',hint:'Alerta visual: avance registrado de 0%'};
  }
  function currentYear() { return state.data?.periods?.[state.year] || null; }
  function metas() {return currentYear()?.metas || [];}
  function selected() {return metas().find(m=>m.id===state.current) || metas()[0] || null;}
  function summarize() {
    const list = metas();
    return {total: list.length || 109,
      running:list.filter(m=>classification(m).key==='running').length,
      risk:list.filter(m=>classification(m).key==='risk').length,
      delay:list.filter(m=>classification(m).key==='delay').length,
      done:list.filter(m=>classification(m).key==='done').length,
      empty:list.filter(m=>classification(m).key==='unavailable').length};
  }
  const externalIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M20 13v7H4V4h7"/></svg>';
  const searchIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.2"/><path d="m15.3 15.3 5.3 5.3"/></svg>';
  const clockIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v15H4zM8 2v6M16 2v6M4 10h16"/></svg>';
  const kpiMarkup = (kind,value,label,sub) => `<button class="pa-kpi pa-kpi--${kind}" type="button" data-pa-kpi="${kind}" title="${html(sub)}"><span class="pa-kpi-value">${html(value)}</span><span class="pa-kpi-label">${html(label)}</span></button>`;
  const topMarkup = () => {
    const stats=summarize(),available=!!currentYear(), fixed = available ? metas().length : null;
    return `<div class="pa-top">
      <div class="pa-hero-row"><div><p class="pa-overline">PLAN DE DESARROLLO MUNICIPAL · SUBACHOQUE</p><h1>Subachoque el mejor plan 2024-2027</h1><p>Seguimiento al Plan de Acción</p></div><div class="pa-hero-motto"><strong>Transparencia</strong><span>Gestión</span><span>Resultados</span><strong>para la gente</strong></div></div>
      <div class="pa-control-row">
        <form class="pa-query" id="pa-query-form" autocomplete="off" role="search"><div class="pa-search-field"><label for="pa-query-num">Consultar por número de meta</label><div class="pa-field-inline"><input id="pa-query-num" inputmode="numeric" placeholder="Ej. 1, 25, 109..." value="${html(state.qNumber)}"/><button type="submit" aria-label="Buscar por número de meta">${searchIcon}</button></div></div><div class="pa-search-field"><label for="pa-query-key">o busca por palabra clave</label><div class="pa-field-inline"><input id="pa-query-key" placeholder="Ej. educación, vías, adulto mayor..." value="${html(state.qKeyword)}"/><button type="submit" aria-label="Buscar por palabra clave">${searchIcon}</button></div></div><div class="pa-select-wrap"><label for="pa-year-select">Filtrar por año</label><div class="pa-select-shell">${clockIcon}<select id="pa-year-select" aria-label="Filtrar los registros por año">${[2024,2025,2026,2027].map(y=>`<option value="${y}"${String(y)===state.year?' selected':''}>${y}</option>`).join('')}</select><span aria-hidden="true">⌄</span></div></div></form>
        <div class="pa-kpis">${kpiMarkup('all',available?fmtInt.format(fixed):'—','Metas del Plan','Metas numeradas registradas en los archivos del Plan de Acción')}${kpiMarkup('running',available?fmtInt.format(stats.running):'—','En ejecución','Avance del 40% al 99%: criterio visual')}${kpiMarkup('risk',available?fmtInt.format(stats.risk):'—','En riesgo*','Avance del 1% al 39%: alerta calculada')}${kpiMarkup('delay',available?fmtInt.format(stats.delay):'—','Con retraso*','Avance del 0%: alerta calculada; no es retraso acreditado')}</div>
      </div>
    </div>`;
  };
  const tabKeys=planNavTabs;
  function tabMarkup(m){return `<div class="pa-tabs" role="tablist" aria-label="Secciones del seguimiento">${categories.map((name,i)=>{const active=tabKeys[i]===state.activeTab;return `<button type="button" role="tab" class="pa-tab ${active?'pa-tab--selected':''}" aria-selected="${active}" data-pa-tab="${tabKeys[i]}"><span class="pa-tab-icon" aria-hidden="true">${categoryIcons[i]}</span><span>${name}${tabKeys[i]==='activities' && m ? ` (${m.activities.length})` : ''}</span></button>`}).join('')}</div>`;}
  function unavailableMarkup(){return `<div class="pa-empty" role="status"><span class="pa-empty-symbol" aria-hidden="true">▤</span><h2>Información no disponible para ${state.year}</h2><p>El encabezado, los buscadores, el selector anual y las secciones se mantienen visibles. No se ha incorporado un archivo de Plan de Acción de ${state.year}.</p><p>Selecciona <strong>2025</strong> o <strong>2026</strong> para consultar los datos aportados.</p></div>`;}
  function dial(value,caption,color){const percent=pct(value),center=isNumeric(value)?pctLabel(value):'—';return `<div class="pa-dial" style="--pa-dial-color:${color};--pa-dial-fill:${percent??0}%"><div class="pa-dial-inner"><strong>${center}</strong><small>${caption}</small></div></div>`;}
  function detailRows(m){
    const display=(n,unit)=>isNumeric(n)?numberOrDash(n)+' '+html(unit||''):'—';
    const remaining=isNumeric(m.pct) ? fmtNum.format(Math.max(0,100-m.pct*100))+'%' : '—';
    const vals=[['Valor esperado cuatrienio',display(m.expected,m.unit)],['Avance registrado',pctLabel(m.pct)],['Saldo porcentual pendiente',remaining],['Línea base',display(m.base,m.unit)],['Tipo de meta',unitText(m.type)]];
    return `<div class="pa-quick-table">${vals.map(([k,v])=>`<div><span>${k}</span><strong>${v}</strong></div>`).join('')}</div>`;
  }
  function chartMarkup(m){
  const all=m.activities||[];
  const items=all.filter(a=>isNumeric(a.target)&&a.target>0&&isNumeric(a.progress)&&a.progress>=0);
  if(!items.length)return `<div class="pa-act-nodata" role="status">Sin valores físicos programados y ejecutados comparables para la meta ${m.id} de ${state.year}. Consulta el detalle de Actividades.</div>`;
  const high=Math.max(100,...items.map(a=>a.progress/a.target*100));
  const yMax=Math.max(100,Math.ceil(high/25)*25);
  const W=Math.max(740,items.length*88+115),H=255,L=52,T=16,B=52,R=14;
  const h=H-T-B,band=(W-L-R)/items.length,barWidth=Math.min(29,band*.27),y=v=>T+h*(1-v/yMax);
  const lines=[0,.25,.5,.75,1].map(q=>{
    const value=yMax*q,yy=y(value);
    return `<line x1="${L}" y1="${yy}" x2="${W-R}" y2="${yy}" stroke="#dce5eb"/><text x="${L-6}" y="${yy+4}" font-size="10" text-anchor="end" fill="#667a8d">${fmtNum.format(value)}%</text>`;
  }).join('');
  const bars=items.map((a,i)=>{
    const center=L+(i+.5)*band,executed=a.progress/a.target*100;
    const p=html(fmtNum.format(a.target)),v=html(fmtNum.format(a.progress)),unit=html(a.unit||'unidades'),name=html(a.n);
    return `<rect x="${center-barWidth-3}" y="${y(100)}" width="${barWidth}" height="${y(0)-y(100)}" rx="2" fill="#91c9e8"><title>Actividad ${name}: programado ${p} ${unit} (100%)</title></rect><rect x="${center+3}" y="${y(executed)}" width="${barWidth}" height="${Math.max(0,y(0)-y(executed))}" rx="2" fill="#058546"><title>Actividad ${name}: ejecutado ${v} ${unit} (${fmtNum.format(executed)}% de lo programado)</title></rect><text x="${center}" y="${H-25}" font-size="10" text-anchor="middle" fill="#445c74">Act.</text><text x="${center}" y="${H-12}" font-size="10" text-anchor="middle" fill="#445c74">${name}</text>`;
  }).join('');
  return `<div class="pa-plot-key"><span><i class="pa-key-bar"></i>Programado</span><span><i class="pa-key-line" style="width:10px;height:10px;border-radius:2px"></i>Ejecutado</span></div><div class="pa-summary-compare-scroll" tabindex="0" role="group" aria-label="Gráfico de ejecución física por actividad; desplaza horizontalmente para consultar más actividades"><svg viewBox="0 0 ${W} ${H}" style="display:block;width:100%;min-width:${Math.min(W,640)}px;height:auto" role="img" aria-label="Programación y ejecución física por actividad de la meta ${m.id}, año ${state.year}" preserveAspectRatio="xMidYMid meet">${lines}${bars}</svg></div>`;
}
  function budgetMarkup(m){
    const names=['Saldo definitivo de la meta','CDP','Compromiso (RP)','Obligaciones','Pagos','Saldo disponible'];
    const colors=['#24b065','#39af5b','#2676df','#9ca8b4','#edb528','#ed5d63'];
    const nums=m.budget||[];const max=Math.max(1,...nums.filter(isNumeric).map(v=>Math.max(0,v)));
    return `<div class="pa-budget-wrap">${dial(m.budgetPct,'Ejecución presupuestal','#005f36')}<div class="pa-budget-items">${names.map((n,i)=>`<div class="pa-budget-line"><span>${i+1}. ${n}</span><span class="pa-mini-track"><i style="width:${isNumeric(nums[i])?Math.min(100,Math.max(0,nums[i]/max*100)):0}%;background:${colors[i]}"></i></span><b>${currencyOrDash(nums[i])}</b></div>`).join('')}<div class="pa-budget-total"><span>Porcentaje registrado en Excel</span><strong>${isNumeric(m.budgetPct)?pctLabel(m.budgetPct):html(m.budgetPctRaw||'Sin dato')}</strong></div></div></div>`;
  }
  function peopleMarkup(m){
    const totals=[0,0,0,0],reported=[false,false,false,false];
    for(const a of m.activities)for(let i=0;i<4;i++){const x=a.people?.[i];if(isNumeric(x)){totals[i]+=x;reported[i]=true;}}
    const names=['Funcionarios y contratistas','Beneficiarios de programas','Asistentes ocasionales','Total reportado'];
    return `<div class="pa-people-grid">${totals.map((x,i)=>`<div class="pa-person pa-person--${i}"><span class="pa-person-icon">${mediaIcons.people}</span><strong>${reported[i]?fmtInt.format(x):'—'}</strong><small>${names[i]}</small></div>`).join('')}</div><p class="pa-card-foot">Suma de registros por actividad. No se deduplican personas; un guion indica dato no informado.</p>`;
  }
  function locationsMarkup(m){
    const places=[...new Set(m.activities.map(a=>a.territory?.trim()).filter(Boolean))].slice(0,7);
    const bbox='-74.225%2C4.879%2C-74.123%2C4.989';
    return `<div class="pa-map-layout"><div class="pa-map-view"><div class="ti-ed-map" data-ti-map="summary" role="region" aria-label="Mapa vectorial de Subachoque sin puntos de actividades"></div></div><div class="pa-location-list"><strong>${places.length?'Lugares consignados':'Sin veredas especificadas'}</strong>${places.length ? places.map(p=>`<span>● ${html(p)}</span>`).join('') : '<span>El Excel no identifica ubicaciones específicas para las actividades de esta meta.</span>'}<a class="pa-map-open" href="#desarrollo?seccion=desarrollo-accion" data-pa-open-theme="interventions">Abrir mapa interactivo ↗</a><small data-pa-map-audit="summary" role="status">Contrastando la ubicación declarada en el Excel…</small></div></div>`;
  }
  function productMarkup(m){
    const links=m.activities.map(a=>({title:a.name,url:safeLink(a.evidence),act:a.n})).filter(x=>x.url);
    const verified=verifiedPDFs[state.year+':'+m.id]||[];
    const directPhotos=links.filter(x=>/\.(png|jpe?g|webp)(?:[?#]|$)/i.test(x.url));
    const photoMarkup=Array.from({length:3},(_,i)=>{
      const item=directPhotos[i];
      if(item)return `<a class="pa-photo-tile pa-photo-tile--verified" href="${html(item.url)}" target="_blank" rel="noopener noreferrer" aria-label="Abrir fotografía de soporte de la actividad ${html(item.act)}"><img src="${html(item.url)}" alt="Fotografía vinculada en el Excel de la actividad ${html(item.act)}" loading="lazy" referrerpolicy="no-referrer"/><span>Actividad ${html(item.act)} ↗</span></a>`;
      return `<div class="pa-photo-tile pa-photo-tile--empty" aria-label="No hay fotografía verificada para el espacio ${i+1}"><span class="pa-photo-icon">${mediaIcons.photo}</span><span>Evidencia fotográfica<br>no disponible</span></div>`;
    }).join('');
    return `<div class="pa-gallery" aria-label="Galería de evidencias del producto de la meta ${m.id}"><div class="pa-gallery-grid">${photoMarkup}</div><p class="pa-gallery-caption"><strong>${html(m.product||'Producto sin denominación registrada')}</strong><small>${html(m.project||'Proyecto no especificado en el Excel')}</small></p><div class="pa-gallery-actions"><span>${verified.length?verified.length+' documentos PDF identificados':links.length+' soportes enlazados'} · ${directPhotos.length?directPhotos.length+' fotografías enlazadas':'Sin fotografías verificadas'}</span>${verified.length||links.length?'<button type="button" class="pa-gallery-more" data-pa-gallery="true">Ver más evidencias →</button>':'<span class="pa-gallery-unavailable">Sin enlaces de soporte</span>'}</div></div>`;
  }
  function galleryDialogMarkup(m){
    const verified=verifiedPDFs[state.year+':'+m.id]||[];
    const links=m.activities.map(a=>({title:a.name,url:safeLink(a.evidence),act:a.n,kind:'folder'})).filter(x=>x.url);
    const items=[...verified,...links];
    return `<dialog class="pa-gallery-dialog" id="pa-gallery-dialog" aria-labelledby="pa-gallery-dialog-title"><div class="pa-gallery-dialog-head"><div><small>Meta ${m.id} · ${state.year}</small><h2 id="pa-gallery-dialog-title">Documentos y evidencias asociados</h2></div><button type="button" class="pa-gallery-close" data-pa-close-gallery aria-label="Cerrar galería">×</button></div><p>Solo se muestran vínculos realmente registrados o documentos verificados dentro de carpetas del Excel. Si no hay fotografías, no se presentan imágenes ilustrativas como evidencia.</p><div class="pa-gallery-document-list">${items.map((item,i)=>`<a href="${html(item.url)}" target="_blank" rel="noopener noreferrer" class="pa-gallery-document"><span class="pa-file-icon">${mediaIcons[item.kind==='pdf'?'file':'folder']}</span><strong>${html(item.title)}</strong><small>${item.kind==='pdf'?'PDF verificado':'Soporte enlazado en Excel'} ${html(item.act||'')} ↗</small></a>`).join('')}</div></dialog>`;
  }
  function evidenceMarkup(m){
    const verified=verifiedPDFs[state.year+':'+m.id]||[];
    const records=m.activities.filter(a=>safeLink(a.evidence)).map(a=>({title:a.name,url:safeLink(a.evidence),n:a.n}));
    const items=[...verified.map(v=>({title:v.title,url:v.url,n:v.act,kind:'pdf'})),...records.map(v=>({...v,kind:'folder'}))].slice(0,5);
    const links=items.map(a=>`<a class="pa-evidence-link" href="${html(a.url)}" target="_blank" rel="noopener noreferrer"><span class="pa-file-icon">${mediaIcons[a.kind==='pdf'?'file':'folder']}</span><span><strong>${html(a.title)}</strong><small>${a.kind==='pdf'?'PDF verificado':'Enlace del Excel'} · actividad ${html(a.n||'')}</small></span><span class="pa-link-arrow" aria-hidden="true">↗</span></a>`).join('');
    return `<div class="pa-evidence-list">${links||'<div class="pa-not-reported">No se encontraron enlaces de soporte para esta meta.</div>'}</div>${items.length>0?`<small class="pa-card-foot">${verified.length} archivos PDF identificados · ${records.length} vínculos registrados.</small>`:''}`;
  }
  function activitiesMarkup(m){
    const rows=(m.activities||[]).map((a,i)=>{
      const key=m.id+'-'+i;const expanded=state.activityExpanded.has(key);const weight=isNumeric(a.weight)?fmtNum.format(a.weight*100)+'%':'—';
      return `<tr><td>${html(a.n||String(i+1))}</td><td class="pa-activity-name">${html(a.name)}</td><td>${weight}</td><td>${html(a.indicator||'—')}</td><td>${html(a.unit||'—')}</td><td>${valText(a.target)}</td><td>${valText(a.progress)}</td><td><span class="pa-mini-status ${isNumeric(a.progress)&&a.progress>0?'pa-mini-positive':'pa-mini-neutral'}">${isNumeric(a.progress)?(a.progress>0?'Con avance':'Sin avance'):'Sin dato'}</span></td><td><button type="button" class="pa-detail-trigger" data-pa-activity="${i}" aria-expanded="${expanded?'true':'false'}">${expanded?'Ocultar':'Ver detalle'}</button></td></tr>${expanded?`<tr class="pa-activity-detail"><td colspan="9"><div class="pa-activity-details"><div><strong>Actividad ${html(a.n||'')}</strong><p>${html(a.name)}</p><p><b>Territorio:</b> ${html(a.territory||'No indicado')} · <b>Unidad:</b> ${html(a.unit||'No indicada')}</p>${a.note?`<p><b>Observación del archivo:</b> ${html(a.note)}</p>`:''}</div><div>${safeLink(a.evidence)?`<a href="${html(safeLink(a.evidence))}" target="_blank" rel="noopener noreferrer">Abrir soporte original ↗</a>`:'<span>Sin soporte enlazado</span>'}</div></div></td></tr>`:''}`;
    }).join('');
    return `<div class="pa-table-wrap"><table class="pa-act-table"><thead><tr><th>N.º actividad</th><th>Actividad</th><th>Peso %</th><th>Indicador</th><th>Unidad</th><th>Valor programado</th><th>Avance reportado</th><th>Estado*</th><th>Ver detalle</th></tr></thead><tbody>${rows||'<tr><td colspan="9">Sin actividades asociadas a esta meta.</td></tr>'}</tbody></table></div>`;
  }
  // Serie presupuestal: cifras originales, sin inferir meses ni valores no reportados.
  function budgetTraceMarkup(m){
    const titles=[['Saldo','definitivo'],['CDP'],['RP'],['Obligaciones'],['Pagos'],['Saldo','disponible']];
    const tones=['#139f59','#1aa75a','#1979e5','#9ba9b5','#f2b91f','#e64655'];
    const nums=m.budget||[];
    const valid=nums.filter(isNumeric).map(v=>Math.max(0,v));
    if(!valid.length)return `<div class="pa-act-nodata" role="status">Sin registros presupuestales para la meta ${m.id} en ${state.year}.</div>`;
    const high=Math.max(1,...valid);
    const power=Math.pow(10,Math.floor(Math.log10(high)));
    const gap=(high/power>4?power:power/2);
    const max=Math.max(gap,Math.ceil(high/gap)*gap);
    const nTicks=Math.min(7,Math.max(1,Math.round(max/gap)));
    const W=800,H=248,L=132,R=16,T=14,B=60;
    const area=H-T-B,band=(W-L-R)/titles.length,bar=Math.min(75,band*.65);
    const y=v=>T+area*(1-Math.max(0,Math.min(max,v))/max);
    const grid=Array.from({length:nTicks+1},(_,i)=>{
      const n=max*i/nTicks,yy=y(n);
      return `<line x1="${L}" y1="${yy}" x2="${W-R}" y2="${yy}" stroke="#dce5eb"/><text x="${L-9}" y="${yy+4}" font-size="11" text-anchor="end" fill="#516b85">$ ${fmtNum.format(Math.round(n))}</text>`;
    }).join('');
    const bars=titles.map((words,i)=>{
      const raw=nums[i],x=L+(i+.5)*band,usable=isNumeric(raw);
      const top=usable?y(raw):y(0),h=Math.max(0,y(0)-top);
      const rect=usable?`<rect x="${x-bar/2}" y="${top}" width="${bar}" height="${h}" rx="3" fill="${tones[i]}"><title>${html(words.join(' '))}: ${html(currencyOrDash(raw))}</title></rect>`:'';
      const cap=words.map((word,j)=>`<text x="${x}" y="${H-35+j*15}" text-anchor="middle" fill="#1a3654" font-size="12">${html(word)}</text>`).join('');
      return rect+cap;
    }).join('');
    return `<div class="pa-summary-budget-plot" role="group" aria-label="Trazabilidad presupuestal de la meta ${m.id} · ${state.year}"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Cifras presupuestales originales de ${state.year} en pesos colombianos">${grid}${bars}</svg></div>`;
  }
  function card(title,content,klass=''){return `<section class="pa-card ${klass}"><h3>${title}</h3>${content}</section>`;}
  function summaryMarkup(m){
    return `<div class="pa-dashboard-cards"><div class="pa-card-row pa-summary-analytics">${card('Avance de la ejecución física de la meta '+state.year,`<div class="pa-summary-main-body"><div class="pa-progress-card">${dial(m.pct,'Avance físico','#006b3c')}${detailRows(m)}</div></div><div class="pa-summary-chart-block pa-summary-physical-plot"><h3 class="pa-summary-subtitle">Ejecución física por actividad · ${state.year}</h3>${chartMarkup(m)}</div>`,'pa-summary-physical-metric')}${card('Avance de la ejecución presupuestal de la meta '+state.year,`<div class="pa-summary-main-body">${budgetMarkup(m)}</div><div class="pa-summary-chart-block pa-summary-budget-trace"><h3 class="pa-summary-subtitle">Trazabilidad presupuestal · ${state.year}</h3>${budgetTraceMarkup(m)}</div>`,'pa-summary-budget-metric')}</div><div class="pa-card-row pa-row-mixed">${card('Número de Personas Asistidas / Beneficiadas',peopleMarkup(m))}${card('Territorio de Intervención',locationsMarkup(m))}${card('Producto de la Ejecución de la Meta',productMarkup(m))}</div><div class="pa-card-row pa-row-table">${card('Actividades del Plan de Acción '+state.year,activitiesMarkup(m),'pa-activity-card')}${card('Documentos y soportes destacados',evidenceMarkup(m),'pa-docs-card')}</div>${galleryDialogMarkup(m)}<p class="pa-method-note"><strong>Fuente:</strong> ${html(currentYear()?.source || '')}. <strong>Otras metas:</strong> ${summarize().done} al 100% y ${summarize().empty} sin porcentaje numérico. <strong>Criterios de lectura:</strong> “En ejecución” = avance de 40 a 99%; “En riesgo” = avance mayor a 0 y menor a 40%; “Con retraso*” = 0% reportado (alerta orientativa, no retraso certificado). Son alertas orientativas del tablero, no estados administrativos certificados. Los resultados y avances son los registrados en el archivo aportado.</p></div>`;
  }
  function listMarkup(){
    const q=normalizeQuery(state.qKeyword), num=(state.qNumber||'').trim();
    const matches=metas().filter(m=>(!num || String(m.id).includes(num))&&(!q || [m.name,m.line,m.sector,m.program,m.agency,...m.activities.map(a=>a.name)].some(x=>normalizeQuery(x).includes(q)))&&(state.listCategory==='all'||classification(m).key===state.listCategory));
    const items=matches.slice(0,109).map(m=>{const s=classification(m);return `<button class="pa-result" type="button" data-pa-meta="${m.id}"><span class="pa-result-id">${m.id}</span><span class="pa-result-text"><strong>${html(m.name)}</strong><small>${html(m.line||'Sin línea estratégica')}</small></span><span class="pa-state-chip pa-state-${s.key}">${html(s.label)}</span><b>${pctLabel(m.pct)}</b></button>`}).join('');
    return `<div class="pa-meta-catalog"><div class="pa-list-head"><h2>Metas del Plan de Acción · ${state.year}</h2><p>Selecciona una meta para abrir su resumen y los reportes del año.</p><span>${matches.length} de ${metas().length} metas</span></div><div class="pa-list-content">${items || '<p>No se encontraron metas para los criterios seleccionados.</p>'}</div></div>`;
  }
  /* Segunda pestaña: Información General. Campos obtenidos del mismo año y meta que Resumen.
     El diseño es una plantilla; los valores se leen del Excel, jamás del ejemplo gráfico. */
  const igIcon = {
    strategic:'▦',technical:'▣',chain:'⇵',territory:'◈',metrics:'▥',documents:'▤',
    line:'✦',program:'▤',project:'⚙',meta:'◎',product:'⬡',indicator:'▥'
  };
  const igYears=[2024,2025,2026,2027];
  const infoRecord = () => state.infoData?.periods?.[state.year]?.metas?.[String(state.current)] || null;
  const infoPeriod = () => state.infoData?.periods?.[state.year]?.reportingPeriod || (state.year==='2026'?'Segundo trimestre de 2026':`Vigencia ${state.year}`);
  const igValue = value => {
    if(Array.isArray(value)) return value.filter(x=>x!==null&&x!==undefined&&String(x).trim()).join(' · ') || 'Sin dato registrado';
    return value===null || value===undefined || String(value).trim()==='' ? 'Sin dato registrado' : String(value);
  };
  const igEsc = value => html(igValue(value));
  const igSimple = value => value===null || value===undefined || String(value).trim()==='' ? '—' : html(String(value));
  const igSourceNote = () => `Fuente: ${html(currentYear()?.source || 'Archivo de Plan de Acción')}. ${state.year==='2026'?'Corte del segundo trimestre de 2026.':'Periodo del archivo: vigencia 2025; el Excel no informa fecha de actualización por meta.'} Los campos vacíos se muestran como «Sin dato registrado».`;
  function igSection(title,symbol,body,extra=''){
    return `<section class="pa-ig-card ${extra}"><h3><span class="pa-ig-headicon" aria-hidden="true">${igIcon[symbol]||'▣'}</span>${html(title)}</h3>${body}</section>`;
  }
  function igTable(entries){
    return `<dl class="pa-ig-table">${entries.map(([key,value])=>`<div class="pa-ig-table-row"><dt>${html(key)}</dt><dd>${igEsc(value)}</dd></div>`).join('')}</dl>`;
  }
  function igHero(){
    return `<header class="pa-ig-hero"><div class="pa-ig-hero-main"><span class="pa-ig-kicker">PLAN DE DESARROLLO · SUBACHOQUE</span><h1>Información General</h1><p>Conoce el detalle de la meta, su propósito, alcance y la información estratégica asociada.</p></div><div class="pa-ig-hero-actions"><div class="pa-ig-quote">“Un territorio<br>que avanza con<br>la fuerza de su gente”</div><label class="pa-ig-select-year">Año de seguimiento <select id="pa-ig-year-select" aria-label="Año de seguimiento">${igYears.map(y=>`<option value="${y}" ${String(y)===state.year?'selected':''}>${y}</option>`).join('')}</select></label></div></header>`;
  }
  function igMetaHeader(m,inf){
    const c=classification(m);
    // El selector vive DENTRO de la misma ficha, nunca crea una fila nueva.
    const metaChoices=metas().map(item=>`<button type="button" class="pa-meta-choice" data-pa-meta="${item.id}"><b>${item.id}</b><span>${html(item.name)}</span></button>`).join('');
    return `<div class="pa-ig-meta"><button type="button" class="pa-ig-number" data-pa-list="true" title="Elegir otra meta" aria-label="Cambiar meta ${m.id}"><small>Meta</small><strong>${m.id}</strong></button><div class="pa-ig-meta-text"><h2>${html(m.name)}</h2><p>${html(m.project||'El archivo no registra una descripción complementaria del proyecto.')}</p><details class="pa-meta-chooser"><summary class="pa-ig-change" aria-label="Cambiar meta">← Cambiar meta</summary><div class="pa-meta-chooser-panel"><label for="pa-meta-chooser-search">Buscar meta</label><input id="pa-meta-chooser-search" type="search" placeholder="Número o palabra clave" autocomplete="off" aria-label="Buscar meta por número o nombre"/><div class="pa-meta-chooser-results">${metaChoices}</div></div></details></div><span class="pa-state-chip pa-state-${c.key} pa-ig-state" title="${html(c.hint)}"><span aria-hidden="true">⌁</span>${html(c.label)}</span><div class="pa-ig-meta-fact"><span class="pa-ig-fact-icon" aria-hidden="true">▦</span><div><small>Dependencia responsable</small><strong>${igEsc(inf?.responsible || m.agency)}</strong></div></div><div class="pa-ig-meta-fact"><span class="pa-ig-fact-icon" aria-hidden="true">▣</span><div><small>Periodo del reporte</small><strong>${html(infoPeriod())}</strong></div></div></div>`;
  }
  function igStrategic(m,inf){
    return igSection('Información Estratégica','strategic',igTable([
      ['Línea Estratégica',inf?.line || m.line],
      ['Sector MGA',inf?.sector || m.sector],
      ['Programa Catálogo de Productos DNP',inf?.programDNP],
      ['Programa Plan de Desarrollo',inf?.programPlan || m.program],
      ['Código BPIN',inf?.bpin],
      ['Nombre del proyecto',inf?.project || m.project],
      ['Descripción (campo del Excel)',inf?.description],
    ]),'pa-ig-strategic');
  }
  function igTechnical(m,inf){
    return igSection('Información Técnica de la Meta','technical',igTable([
      ['Código de Producto',inf?.productCode],
      ['Producto',inf?.product || m.product],
      ['Código de Indicador',inf?.indicatorCode],
      ['Indicador Producto',inf?.indicatorProduct],
      ['Unidad de Medida',inf?.unit || m.unit],
      ['Número de Meta',m.id],
      ['Meta Producto',inf?.metaName || m.name],
      ['Tipo de Meta Producto',inf?.metaType || m.type],
      ['Línea Base',inf?.baseline ?? m.base],
      ['Fuente',inf?.source],
      ['Valor esperado cuatrienio',inf?.expected ?? m.expected]
    ]),'pa-ig-technical');
  }
  function igChain(m,inf){
    const steps=[
      ['Línea Estratégica',inf?.line || m.line,'line'],
      ['Programa',inf?.programPlan || m.program,'program'],
      ['Proyecto',inf?.project || m.project,'project'],
      ['Meta',`${m.id}. ${m.name}`,'meta'],
      ['Producto',inf?.product || m.product,'product'],
      ['Indicador',inf?.indicatorProduct,'indicator']
    ];
    return igSection('Cadena de Gestión','chain',`<ol class="pa-ig-chain">${steps.map(([label,value,key])=>`<li class="pa-ig-chain-step pa-ig-step-${key}"><span class="pa-ig-chain-symbol" aria-hidden="true">${igIcon[key]}</span><div><strong>${html(label)}</strong><p>${igEsc(value)}</p></div></li>`).join('')}</ol>`,'pa-ig-chain-card');
  }
  function igPlaces(m){
    const out={veredas:[],barrios:[],other:[]};
    const seen={veredas:new Set(),barrios:new Set(),other:new Set()};
    for(const a of (m.activities||[])){
      const raw=String(a.territory||'').trim();
      if(!raw)continue;
      for(const fragment of raw.split(/[,;\n]+/)){
        const token=fragment.trim().replace(/\.$/,'');
        if(!token)continue;
        const v=token.match(/^veredas?\s*[:\-]?\s*(.+)$/i);
        const b=token.match(/^barrios?\s*[:\-]?\s*(.+)$/i);
        const type=v?'veredas':b?'barrios':'other';
        const label=(v?.[1]||b?.[1]||token).trim();
        const clean=label.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es-CO').replace(/\s+/g,' ');
        if(!clean || seen[type].has(clean))continue;
        seen[type].add(clean);out[type].push(label);
      }
    }
    return out;
  }
  function igTerritory(m){
    const places=igPlaces(m),isVereda=state.territoryKind==='veredas';
    const active=isVereda?places.veredas:places.barrios;
    const visible=state.territoryExpanded?active:active.slice(0,6);
    const bbox='-74.225%2C4.879%2C-74.123%2C4.989';
    const locs=`<div class="pa-ig-location-list"><div class="pa-ig-location-switch" role="group" aria-label="Tipo de territorio"><button type="button" class="${isVereda?'selected':''}" data-pa-ig-kind="veredas" aria-pressed="${isVereda}">Veredas</button><button type="button" class="${!isVereda?'selected':''}" data-pa-ig-kind="barrios" aria-pressed="${!isVereda}">Barrios</button></div><div class="pa-ig-loc-results">${visible.length?visible.map(x=>`<span><b aria-hidden="true">●</b>${html(x)}</span>`).join(''):`<p class="pa-ig-missing">No se identifican ${isVereda?'veredas':'barrios'} con nombre explícito en el archivo de esta meta.</p>`}</div>${active.length>6?`<button type="button" class="pa-ig-more-locations" data-pa-ig-expand>${state.territoryExpanded?'Mostrar menos':'Ver todas las '+(isVereda?'veredas':'barrios')} ↗</button>`:''}${places.other.length?'<small>El Excel contiene además descripciones territoriales sin tipo de localidad explícito; se conservan en los registros de las actividades.</small>':''}</div>`;
    return igSection('Cobertura Territorial','territory',`<div class="pa-ig-territory-layout">${locs}<div class="pa-ig-map"><div class="ti-ed-map" data-ti-map="general" role="region" aria-label="Mapa vectorial de Subachoque sin puntos de obras"></div><div class="pa-ig-map-legend"><span>●</span><span data-pa-map-audit="general" role="status">Contrastando cobertura territorial…</span></div><a href="#desarrollo?seccion=desarrollo-accion" data-pa-open-theme="coverage">Abrir mapa interactivo ↗</a></div></div>`,'pa-ig-territory-card');
  }
  function igPeople(m){
    const records=(m.activities||[]).map(a=>a.people?.[1]).filter(isNumeric);
    if(!records.length)return {value:'—',detail:'Sin beneficiarios cuantificados en el archivo'};
    const sum=records.reduce((a,b)=>a+b,0);
    return {value:fmtInt.format(sum),detail:'Suma de registros por actividad; no representa personas únicas'};
  }
  function igKPIs(m,inf){
    const exp=inf?.expected??m.expected,base=inf?.baseline??m.base,people=igPeople(m);
    const unit=String(inf?.unit||m.unit||'').trim();
    const suffix=unit && normalizeQuery(unit)!=='numero' && unit!=='%' ? ' '+unit : '';
    const val=isNumeric(m.expected)?fmtNum.format(m.expected)+suffix:igValue(exp)+(suffix||'');
    const props=[
      ['flag',val,'Valor esperado cuatrienio','Valor oficial de la meta, no avance ejecutado'],
      ['avance',isNumeric(m.pct)?pctLabel(m.pct):'—','Avance acumulado','Porcentaje de ejecución de meta reportado en el Excel'],
      ['saldo','—','Saldo por ejecutar','No se calcula sin magnitudes físicas acumuladas compatibles'],
      ['actividades',fmtInt.format((m.activities||[]).length),'Actividades asociadas','Número de actividades del año seleccionado'],
      ['beneficiarios',people.value,'Beneficiarios registrados',people.detail]
    ];
    return igSection('Indicadores Clave de la Meta','metrics',`<div class="pa-ig-kpi-grid">${props.map(([key,v,label,desc])=>`<div class="pa-ig-kpi pa-ig-kpi-${key}" title="${html(desc)}"><span class="pa-ig-kpi-symbol" aria-hidden="true">${key==='actividades'?'☷':key==='beneficiarios'?'♟':key==='avance'?'▥':key==='saldo'?'◷':'⚑'}</span><div><strong>${html(v)}</strong><span>${html(label)}</span></div></div>`).join('')}</div><p class="pa-ig-kpi-note">${html(people.detail)}. No se inventan saldos físicos ni se deduplican personas.</p>`,'pa-ig-kpi-card');
  }
  function igDocuments(m){
    const verified=verifiedPDFs[state.year+':'+m.id]||[];
    const candidate=[...verified.map(a=>({...a,verified:true})),...(m.activities||[]).filter(a=>safeLink(a.evidence)).map(a=>({url:safeLink(a.evidence),title:'Soporte de la actividad '+(a.n||'sin número'),kind:/\/file\/d\//.test(a.evidence)||/\.pdf(?:[?#]|$)/i.test(a.evidence)?'pdf':'folder',act:a.n,verified:false}))];
    const unique=[];const seen=new Set();
    for(const item of candidate){if(!item.url||seen.has(item.url))continue;seen.add(item.url);unique.push(item);}
    return unique;
  }
  function igDocs(m){
    const items=igDocuments(m);
    const documentLine = item=>`<a class="pa-ig-document-link" href="${html(item.url)}" target="_blank" rel="noopener noreferrer"><span class="pa-ig-document-icon ${item.kind==='pdf'?'pdf':'folder'}" aria-hidden="true">${item.kind==='pdf'?'▣':'▰'}</span><span><strong>${html(item.title)}</strong><small>${item.kind==='pdf'?(item.verified?'PDF confirmado en carpeta de soporte':'Archivo PDF enlazado en Excel'):'Carpeta / vínculo registrado en Excel'}${item.act?' · Act. '+html(item.act):''}</small></span><span class="pa-ig-document-action" title="Abrir vínculo en una nueva pestaña" aria-hidden="true">↗</span></a>`;
    return igSection('Documentos de referencia','documents',`<div class="pa-ig-document-list">${items.length?items.slice(0,4).map(documentLine).join(''):'<p class="pa-ig-missing">No hay documentos o enlaces de soporte registrados para esta meta.</p>'}</div>${items.length>4?'<button type="button" class="pa-ig-doc-more" data-pa-ig-docs>Ver todos los documentos →</button>':''}<p class="pa-ig-doc-note">Las carpetas se abren en Google Drive; no se identifican como descargas directas.</p><dialog class="pa-ig-doc-dialog" id="pa-ig-doc-dialog" aria-label="Todos los documentos de referencia"><div class="pa-ig-doc-modal-head"><h3>Documentos registrados · Meta ${m.id}</h3><button type="button" data-pa-ig-doc-close aria-label="Cerrar ventana">×</button></div><div class="pa-ig-document-list">${items.map(documentLine).join('')}</div></dialog>`,'pa-ig-doc-card');
  }
  function generalDashboard(m){
    const inf=infoRecord();
    if(state.infoLoading){return '<div class="pa-ig-pending">Preparando la ficha oficial de Información General…</div>';}
    return `<div class="pa-ig-dashboard"><div class="pa-ig-top-grid">${igStrategic(m,inf)}${igTechnical(m,inf)}${igChain(m,inf)}</div><div class="pa-ig-bottom-grid">${igTerritory(m)}${igKPIs(m,inf)}${igDocs(m)}</div><p class="pa-ig-method">${igSourceNote()} Los porcentajes y estados son los mismos de Resumen; los indicadores no equivalen necesariamente a avances físicos en unidades.</p></div>`;
  }
  function generalResults(){
    if(state.loading)return tabMarkup(null)+`<div class="pa-empty"><h2>Cargando registros de Información General…</h2><p>Preparando los datos de los Excel.</p></div>`;
    if(state.error)return tabMarkup(null)+`<div class="pa-empty"><h2>No fue posible cargar la información</h2><p>${html(state.error)}</p><button type="button" data-pa-reload>Reintentar</button></div>`;
    if(state.list)return listMarkup();
    if(!currentYear())return tabMarkup(null)+unavailableMarkup();
    const m=selected(); if(!m)return tabMarkup(null)+unavailableMarkup();
    return igMetaHeader(m,infoRecord())+tabMarkup(m)+generalDashboard(m);
  }

  /* Third functional tab, Actividades. The only factual inputs are the supplied
     Plan de Accion workbooks and the previously verified support PDFs. */
  const actIcons={
    list:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h6M8 1v4M16 1v4"/>',
    done:'<circle cx="12" cy="12" r="9"/><path d="m7 12 3.2 3.2L17 8"/>',
    alert:'<path d="m12 2 10 19H2L12 2zM12 8v6M12 18h.01"/>',
    chart:'<path d="M3 21h18M6 17V9h3v8M12 17V3h3v14M18 17V11h3v6"/>',
    budget:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 2 16 2 16 0V5M4 12v7c0 2 16 2 16 0v-7"/>',
    eye:'<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="3"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 5 5"/>',
    folder:'<path d="M2 5h8l3 3h9v12H2z"/>',
    image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m4 18 6-5 4 3 4-5 3 7"/>',
    filter:'<path d="M3 4h18l-7 8v7l-4 2v-9z"/>'
  };
  const actIcon = key => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${actIcons[key]||actIcons.list}</svg>`;
  const actOwner=(a,m)=>state.activityData?.periods?.[state.year]?.[String(m.id)]?.[String(a.n)]||null;
  const actRatio=a=>isNumeric(a.target)&&a.target>0&&isNumeric(a.progress)?Math.max(0,a.progress/a.target):null;
  function actStatus(a){
    const note=normalizeQuery(a.note||'');
    const explicit=/(con retraso|retraso en|actividad retrasada|incumplimiento del cronograma|fuera de plazo)/.test(note);
    if(explicit)return {key:'delay',label:'Retraso indicado',hint:'La observaci\u00f3n del archivo menciona un retraso; revisar su contexto.'};
    const ratio=actRatio(a);
    if(ratio!==null&&ratio>=1)return {key:'done',label:'Objetivo alcanzado',hint:'El avance reportado iguala o supera el valor programado de la actividad.'};
    if(isNumeric(a.progress)&&a.progress>0)return {key:'running',label:'En ejecuci\u00f3n',hint:'Existe avance mayor que cero; no equivale a una certificaci\u00f3n administrativa.'};
    if(isNumeric(a.progress)&&a.progress===0)return {key:'idle',label:'Sin avance',hint:'Avance num\u00e9rico 0 registrado. No implica retraso acreditado.'};
    return {key:'missing',label:'Sin dato',hint:'Avance no cuantificado en el archivo.'};
  }
  const actFileList=m=>{
    const items=[...(verifiedPDFs[state.year+':'+m.id]||[]).map(x=>({...x,verified:true,kind:'pdf'}))];
    for(const a of m.activities||[]){
      const url=safeLink(a.evidence);if(!url)continue;
      const isImage=/\.(?:png|jpg|jpeg|webp|gif)(?:[?#]|$)/i.test(url);
      const isPdf=/\/file\/d\/|\.pdf(?:[?#]|$)/i.test(url);
      items.push({title:`Soporte de la actividad ${a.n}`,url,kind:isImage?'image':isPdf?'pdf':'folder',verified:false,act:a.n,activity:a.name});
    }
    const seen=new Set();return items.filter(x=>{if(seen.has(x.url))return false;seen.add(x.url);return true;});
  };
  function actHero(){
    const yearOptions=[2024,2025,2026,2027].map(y=>`<option value="${y}"${String(y)===state.year?' selected':''}>${y}</option>`).join('');
    return `<header class="pa-ig-hero pa-act-hero"><div class="pa-ig-hero-main"><nav class="pa-act-breadcrumb" aria-label="Ruta del m\u00f3dulo"><span>Inicio</span><span>Metas</span><span>Meta ${state.current}</span><strong>Actividades</strong></nav><h1>Actividades de la Meta</h1><p>Consulta el plan de acci\u00f3n, programaci\u00f3n, avances y evidencias de cada actividad.</p></div><div class="pa-ig-hero-actions"><div class="pa-ig-quote">\u201cAcciones que<br>transforman nuestro<br>territorio\u201d</div><label class="pa-ig-select-year">A\u00f1o de seguimiento<select id="pa-act-year-select" aria-label="A\u00f1o de seguimiento">${yearOptions}</select></label></div></header>`;
  }
  function actKeyStats(m){
    const total=m.activities.length;
    const statuses=m.activities.map(actStatus);
    const running=statuses.filter(s=>s.key==='running').length;
    const delay=statuses.filter(s=>s.key==='delay').length;
    const entries=[
      {key:'list',value:fmtInt.format(total),title:'Actividades registradas',hint:'N\u00famero de actividades asociadas a la meta en el Excel.'},
      {key:'done',value:fmtInt.format(running),title:'En ejecuci\u00f3n',hint:'Actividades con avance registrado positivo y objetivo no alcanzado.'},
      {key:'alert',value:delay?fmtInt.format(delay):'\u2014',title:'Con retraso',hint:delay?'Observaci\u00f3n expl\u00edcita que contiene una menci\u00f3n de retraso.':'No hay datos suficientes de fechas l\u00edmite para certificar retrasos.'},
      {key:'chart',value:pctLabel(m.pct),title:'Avance f\u00edsico de la meta',hint:'Porcentaje de ejecuci\u00f3n de la meta registrado en el Excel; no es promedio simple de actividades.'},
      {key:'budget',value:pctLabel(m.budgetPct),title:'Ejecuci\u00f3n presupuestal',hint:'Porcentaje presupuestal de la meta reportado en el Excel.'}
    ];
    return `<section class="pa-act-summary-kpis" aria-label="Indicadores de las actividades">${entries.map(e=>`<div class="pa-act-kpi pa-act-kpi-${e.key}" title="${html(e.hint)}"><span class="pa-act-kpi-icon">${actIcon(e.key)}</span><div class="pa-act-kpi-text"><strong>${e.value}</strong><span>${e.title}</span></div></div>`).join('')}</section>`;
  }
  function actPlaceTokens(a){
    if(!a.territory)return [];
    return String(a.territory).split(/[,;\n]+/).map(x=>x.trim()).filter(Boolean);
  }
  function actFiltersMarkup(m){
    const activities=m.activities||[];
    const owners=[...new Set(activities.map(a=>actOwner(a,m)).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
    const places=[...new Set(activities.flatMap(actPlaceTokens))].sort((a,b)=>a.localeCompare(b,'es'));
    const opts=(items,value)=>items.map(x=>`<option value="${html(x)}"${x===value?' selected':''}>${html(x)}</option>`).join('');
    return `<div class="pa-act-table-toolbar"><div class="pa-act-toolbar-heading"><h2>Listado de Actividades del Plan de Acci\u00f3n ${state.year}</h2><small>Registros reales de la meta ${m.id}</small></div><div class="pa-act-toolbar-controls"><label class="pa-act-find"><span class="sr-only">Buscar actividad</span><input id="pa-act-search" type="search" placeholder="Buscar actividad..." value="${html(state.activityFilters.q)}" autocomplete="off"/><span class="pa-act-find-icon">${actIcon('search')}</span></label><label>Estado<select id="pa-act-filter-state"><option value="all">Todos</option>${[['running','En ejecuci\u00f3n'],['done','Objetivo alcanzado'],['idle','Sin avance'],['delay','Retraso indicado'],['missing','Sin dato']].map(([v,l])=>`<option value="${v}"${v===state.activityFilters.status?' selected':''}>${l}</option>`).join('')}</select></label><label>Responsable<select id="pa-act-filter-owner"><option value="all">Todos</option>${opts(owners,state.activityFilters.owner)}</select></label><label>Vereda / Barrio<select id="pa-act-filter-place"><option value="all">Todos</option>${opts(places,state.activityFilters.place)}</select></label><button type="button" class="pa-act-reset" data-pa-act-clear ${!state.activityFilters.q&&state.activityFilters.status==='all'&&state.activityFilters.owner==='all'&&state.activityFilters.place==='all'?'disabled':''}>Limpiar</button></div></div>`;
  }
  function actFiltered(m){
    const f=state.activityFilters;
    return m.activities.filter(a=>{
      if(f.status!=='all'&&actStatus(a).key!==f.status)return false;
      if(f.owner!=='all'&&actOwner(a,m)!==f.owner)return false;
      if(f.place!=='all'&&!actPlaceTokens(a).some(t=>t===f.place))return false;
      const q=normalizeQuery(f.q);
      return !q||[a.n,a.name,a.indicator,a.unit,a.territory,actOwner(a,m),a.note].some(x=>normalizeQuery(x).includes(q));
    });
  }
  const actStatePill=s=>`<span class="pa-act-state pa-act-state-${s.key}" title="${html(s.hint)}"><span class="pa-act-state-dot" aria-hidden="true"></span>${s.label}</span>`;
  function actTable(m,filtered){
    const trs=filtered.map(a=>{
      const i=m.activities.indexOf(a), ratio=actRatio(a),progressPct=ratio===null?null:Math.min(100,ratio*100),s=actStatus(a),owner=actOwner(a,m);
      return `<tr><td class="pa-act-id">${html(a.n)}</td><td class="pa-act-name" title="${html(a.name)}">${html(a.name)}</td><td>${isNumeric(a.weight)?pctLabel(a.weight):'\u2014'}</td><td>${html(a.indicator||'Sin dato')}</td><td>${html(a.unit||'\u2014')}</td><td>${numberOrDash(a.target)}</td><td><div class="pa-act-progress-value"><strong>${numberOrDash(a.progress)}</strong>${progressPct===null?'':`<small>(${fmtNum.format(ratio*100)}%)</small>`}</div><div class="pa-act-progress-track" aria-label="${progressPct===null?'Avance no evaluable':`Avance ${fmtNum.format(ratio*100)}%`}"><span style="width:${progressPct??0}%" class="pa-act-progress-fill pa-act-fill-${s.key}"></span></div></td><td>${actStatePill(s)}</td><td class="pa-act-owner">${html(owner||'Sin dato registrado')}</td><td><button type="button" data-pa-act-detail="${i}" class="pa-act-detail-btn" aria-label="Ver detalle de actividad ${html(a.n)}">${actIcon('eye')}<span>Ver detalle</span></button></td></tr>`;
    }).join('');
    return `<section class="pa-act-table-panel"><div class="pa-act-table-scroll" tabindex="0" aria-label="Listado desplazable de actividades"><table class="pa-act-main-table"><thead><tr><th>N\u00ba</th><th>Actividad</th><th>Peso %</th><th>Indicador</th><th>Unidad de medida</th><th>Valor programado ${state.year}</th><th>Avance</th><th>Estado</th><th>Responsable</th><th>Ver detalle</th></tr></thead><tbody>${trs||'<tr><td colspan="10" class="pa-act-noresults">No hay actividades que coincidan con los filtros. Usa Limpiar para ver todos los registros.</td></tr>'}</tbody></table></div><p class="pa-act-count">Mostrando ${filtered.length} de ${m.activities.length} actividades. Las etiquetas de estado son lecturas de los avances reportados; un avance bajo por s\u00ed solo no certifica retraso.</p></section>`;
  }
  function actUnitCatalog(){
  return [
    {key:'metros-cuadrados',label:'Metros cuadrados',one:'metro cuadrado',many:'metros cuadrados',re:/(?:metros?\s+cuadrados?|(?:^|\W)m2(?:\W|$)|m²|m\^2)/},
    {key:'metros-cubicos',label:'Metros cúbicos',one:'metro cúbico',many:'metros cúbicos',re:/(?:metros?\s+cubicos?|(?:^|\W)m3(?:\W|$)|m³|m\^3)/},
    {key:'metros-lineales',label:'Metros lineales',one:'metro lineal',many:'metros lineales',re:/(?:metros?\s+lineales?|(?:^|\W)ml(?:\W|$))/},
    {key:'kilometros',label:'Kilómetros',one:'kilómetro',many:'kilómetros',re:/(?:kilometros?|(?:^|\W)km(?:\W|$))/},
    {key:'hectareas',label:'Hectáreas',one:'hectárea',many:'hectáreas',re:/(?:hectareas?|(?:^|\W)ha(?:\W|$))/},
    {key:'metros',label:'Metros',one:'metro',many:'metros',re:/\bmetros?\b/},
    {key:'litros',label:'Litros',one:'litro',many:'litros',re:/\blitros?\b/},
    {key:'toneladas',label:'Toneladas',one:'tonelada',many:'toneladas',re:/\btoneladas?\b/},
    {key:'kilogramos',label:'Kilogramos',one:'kilogramo',many:'kilogramos',re:/(?:\bkilogramos?\b|(?:^|\W)kg(?:\W|$))/},
    {key:'personas',label:'Personas',one:'persona',many:'personas',re:/(?:\bpersonas?\b|\bbeneficiari[oa]s?\b|\bparticipantes?\b|\basistentes?\b|\bestudiantes?\b|\bhabitantes?\b|\bpoblacion\b)/},
    {key:'familias',label:'Familias',one:'familia',many:'familias',re:/\bfamilias?\b/},
    {key:'hogares',label:'Hogares',one:'hogar',many:'hogares',re:/\bhogares?\b/},
    {key:'viviendas',label:'Viviendas',one:'vivienda',many:'viviendas',re:/\bviviendas?\b/},
    {key:'informes',label:'Informes',one:'informe',many:'informes',re:/\binformes?\b/},
    {key:'documentos',label:'Documentos',one:'documento',many:'documentos',re:/\bdocumentos?\b/},
    {key:'proyectos',label:'Proyectos',one:'proyecto',many:'proyectos',re:/\bproyectos?\b/},
    {key:'estudios',label:'Estudios',one:'estudio',many:'estudios',re:/\bestudios?\b/},
    {key:'obras',label:'Obras',one:'obra',many:'obras',re:/\bobras?\b/},
    {key:'equipamientos',label:'Equipamientos',one:'equipamiento',many:'equipamientos',re:/\bequipamientos?\b/},
    {key:'capacitaciones',label:'Capacitaciones',one:'capacitación',many:'capacitaciones',re:/\bcapacitaciones?\b/},
    {key:'talleres',label:'Talleres',one:'taller',many:'talleres',re:/\btalleres?\b/},
    {key:'eventos',label:'Eventos',one:'evento',many:'eventos',re:/\beventos?\b/},
    {key:'actividades',label:'Actividades',one:'actividad',many:'actividades',re:/\bactividades?\b/},
    {key:'contratos',label:'Contratos',one:'contrato',many:'contratos',re:/\bcontratos?\b/},
    {key:'predios',label:'Predios',one:'predio',many:'predios',re:/\bpredios?\b/},
    {key:'instituciones',label:'Instituciones',one:'institución',many:'instituciones',re:/\binstituciones?\b/},
    {key:'dias',label:'Días',one:'día',many:'días',re:/\bdias?\b/},
    {key:'meses',label:'Meses',one:'mes',many:'meses',re:/\bmeses?\b/},
    {key:'porcentaje',label:'Porcentaje',one:'%',many:'%',re:/(?:porcentaje|porcentual|%)/}
  ];
}
  function actUnitInfo(activity){
  const original=String(activity.unit||'').trim();
  const given=normalizeQuery(original);
  const generic=!given||/^(numero|nro|n[ºo]|cantidad|unidad|unidades|sin unidad)$/.test(given);
  const catalog=actUnitCatalog();
  let info=catalog.find(d=>d.re.test(given));
  if(!info&&generic){
    const context=normalizeQuery(activity.indicator||'')||normalizeQuery(activity.name||'');
    info=catalog.find(d=>d.re.test(context));
  }
  if(info){
    const derived={key:info.key,label:info.label,one:info.one,many:info.many,original};
    const context=normalizeQuery(activity.indicator||'');
    if(info.key==='personas'&&/capacitad/.test(context)){
      derived.one='persona capacitada';derived.many='personas capacitadas';
    } else if(info.key==='informes'&&/cumplimiento/.test(context)){
      derived.one='informe de cumplimiento';derived.many='informes de cumplimiento';
    } else if(info.key==='personas'&&/beneficiari/.test(context)){
      derived.one='persona beneficiaria';derived.many='personas beneficiarias';
    }
    return derived;
  }
  if(generic)return {key:'sin-especificar',label:'Número sin especificar',one:'unidad del indicador',many:'unidades del indicador',original};
  // Preserve uncommon official units instead of silently replacing their meaning.
  return {key:'original:'+given,label:original,one:original,many:original,original};
}
  function actQuantityLabel(value,unit){
  if(!isNumeric(value))return 'Sin dato';
  const formatted=fmtNum.format(value);
  const name=Math.abs(value)===1?unit.one:unit.many;
  return name==='%'?formatted+' %':formatted+' '+name;
}
  function actGraphLines(value,maxLength=12,maxLines=3){
  const words=String(value||'Sin descripción').trim().split(/\s+/).filter(Boolean);
  const result=[];let line='';
  for(let i=0;i<words.length;i++){
    const next=line?line+' '+words[i]:words[i];
    if(next.length<=maxLength){line=next;continue;}
    if(line){result.push(line);line=words[i];}
    else{result.push(words[i].slice(0,maxLength-1)+'…');line='';}
    if(result.length>=maxLines){line='';break;}
  }
  if(line&&result.length<maxLines)result.push(line);
  if(!result.length)result.push('Sin descripción');
  const covered=result.join(' ').replace(/…/g,'');
  if(result.length===maxLines&&covered.length<String(value).length&&result[maxLines-1].slice(-1)!=='…'){
    result[maxLines-1]=result[maxLines-1].slice(0,Math.max(1,maxLength-1))+'…';
  }
  return result;
}
  function actChartControls(){
  const viewport=panel.querySelector('#pa-act-chart-scroll');
  const nav=panel.querySelector('[data-pa-act-chart-nav]');
  if(!viewport||!nav)return;
  const max=Math.max(0,viewport.scrollWidth-viewport.clientWidth);
  nav.hidden=max<=3;
  const back=nav.querySelector('[data-pa-act-chart-step="-1"]');
  const next=nav.querySelector('[data-pa-act-chart-step="1"]');
  if(back)back.disabled=viewport.scrollLeft<=2;
  if(next)next.disabled=viewport.scrollLeft>=max-2;
}
  function actComparison(m,filtered){
  const source=filtered.map(a=>({activity:a,unit:actUnitInfo(a)}));
  if(!source.length)return '<div class="pa-act-nodata">No hay actividades que coincidan con los filtros actuales.</div>';
  const groups=new Map();
  for(const entry of source){const key=entry.unit.key;if(!groups.has(key))groups.set(key,{unit:entry.unit,count:0});groups.get(key).count++;}
  const groupChoices=[...groups.entries()].sort((a,b)=>b[1].count-a[1].count||a[1].unit.label.localeCompare(b[1].unit.label,'es'));
  const selectedUnit=groups.has(state.activityCompareUnit)?state.activityCompareUnit:'all';
  const visible=selectedUnit==='all'?source:source.filter(item=>item.unit.key===selectedUnit);
  const options=[`<option value="all"${selectedUnit==='all'?' selected':''}>Todas las unidades (${source.length})</option>`,...groupChoices.map(([key,info])=>`<option value="${html(key)}"${key===selectedUnit?' selected':''}>${html(info.unit.label)} (${info.count})</option>`)].join('');
  const left=59,right=16,barGroup=147,plotTop=103,plotH=160,base=plotTop+plotH;
  const width=Math.max(648,left+visible.length*barGroup+right),height=355;
  const slot=(width-left-right)/visible.length,svg=[];
  const unitLine=(value,entry)=>actGraphLines(Math.abs(value)===1?entry.unit.one:entry.unit.many,12,3);
  const badge=(cx,position,entry,kind,color)=>{
    const a=entry.activity,u=entry.unit,val=kind==='programado'?a.target:a.progress;
    const x=cx+(position==='left'?-70:2),lines=isNumeric(val)?unitLine(val,entry):['Sin dato'];
    const amount=isNumeric(val)?fmtNum.format(val):'—';
    const tip=(kind==='programado'?'Programado: ':'Ejecutado: ')+actQuantityLabel(val,u)+'. Indicador: '+(a.indicator||'Sin indicador')+'. Unidad oficial: '+(u.original||'no indicada')+'.';
    return `<g class="pa-act-value-badge"><title>${html(tip)}</title><rect x="${x}" y="1" width="68" height="79" rx="8" fill="${color}"/><path d="M ${x+29} 80 l 5 6 l 5 -6" fill="${color}"/><text x="${x+34}" y="17" text-anchor="middle" fill="#15375b" font-size="8.8" font-weight="700">${kind==='programado'?'Programado':'Ejecutado'}</text><text x="${x+34}" y="34" text-anchor="middle" fill="#102e52" font-size="13" font-weight="850">${html(amount)}</text>${lines.map((line,i)=>`<text x="${x+34}" y="${47+i*10}" text-anchor="middle" font-size="8.5" fill="#23425b">${html(line)}</text>`).join('')}</g>`;
  };
  // Both series are normalized by each activity's OWN programmed value.
  for(let tick=0;tick<=5;tick++){
    const pct=tick*20,y=base-plotH*pct/100;
    svg.push(`<line x1="${left}" y1="${y}" x2="${width-8}" y2="${y}" stroke="#dce6f0" stroke-width="1"/><text x="${left-7}" y="${y+4}" text-anchor="end" fill="#456581" font-size="10">${pct}%</text>`);
  }
  svg.push(`<text transform="translate(13 ${plotTop+plotH/2}) rotate(-90)" text-anchor="middle" fill="#163658" font-size="10" font-weight="700">Cumplimiento de la meta (%)</text>`);
  visible.forEach((entry,i)=>{
    const a=entry.activity,u=entry.unit,cx=left+slot*(i+.5);
    const validTarget=isNumeric(a.target)&&a.target>0;
    const validProgress=isNumeric(a.progress)&&a.progress>=0;
    const rate=validTarget&&validProgress?a.progress/a.target*100:null;
    const capped=rate===null?0:Math.max(0,Math.min(100,rate));
    const blueX=cx-57,greenX=cx+5,barW=51;
    const greenH=plotH*capped/100;
    const rateText=rate===null?(validTarget?'Sin dato':'No evaluable'):fmtNum.format(rate)+'%';
    svg.push(`<g class="pa-act-group" data-pa-act-group="${html(a.n)}"><title>${html('Actividad '+a.n+': '+a.name+'. Programado: '+actQuantityLabel(a.target,u)+'. Ejecutado: '+actQuantityLabel(a.progress,u)+'. Cumplimiento: '+rateText+'.')}</title>`);
    svg.push(badge(cx,'left',entry,'programado','#e5f0fd')+badge(cx,'right',entry,'ejecutado','#ddf5e4'));
    if(validTarget){
      svg.push(`<rect x="${blueX}" y="${plotTop}" width="${barW}" height="${plotH}" rx="4" fill="#338cf0"/><text x="${blueX+barW/2}" y="${plotTop+20}" text-anchor="middle" fill="#fff" font-size="13" font-weight="850">100%</text>`);
    }else{
      svg.push(`<line x1="${blueX}" y1="${base-2}" x2="${blueX+barW}" y2="${base-2}" stroke="#9db2c7" stroke-width="3" stroke-dasharray="4 3"/><text x="${blueX+barW/2}" y="${base-13}" text-anchor="middle" fill="#5c7892" font-size="9">N/E</text>`);
    }
    if(rate!==null&&capped>0){
      svg.push(`<rect x="${greenX}" y="${base-greenH}" width="${barW}" height="${greenH}" rx="4" fill="#3caf57"/>`);
    }
    if(rate===null){
      svg.push(`<text x="${greenX+barW/2}" y="${base-13}" fill="#54728a" font-size="9" text-anchor="middle">${validTarget?'Sin dato':'N/E'}</text>`);
    }else{
      const pctY=capped>=15?base-greenH+19:base-greenH-5,fg=capped>=15?'#fff':'#087844';
      svg.push(`<text x="${greenX+barW/2}" y="${pctY}" fill="${fg}" font-size="${capped>=15?12:10}" font-weight="800" text-anchor="middle">${html(rateText)}</text>`);
    }
    svg.push(`<text x="${cx}" y="${base+23}" text-anchor="middle" fill="#17365a" font-size="12" font-weight="850">${html(a.n)}</text>`);
    const nameLines=actGraphLines(a.name,23,3);
    svg.push(`<text x="${cx}" y="${base+37}" text-anchor="middle" fill="#3a5977" font-size="9">${nameLines.map((line,k)=>`<tspan x="${cx}" dy="${k===0?0:11}">${html(line)}</tspan>`).join('')}</text></g>`);
  });
  const legend=`<div class="pa-act-chart-legend"><span><i class="pa-act-legend-blue"></i>Programado ${state.year}</span><span><i class="pa-act-legend-green"></i>Ejecutado ${state.year}</span></div>`;
  return `<div class="pa-act-compare-toolbar"><div class="pa-act-compare-control"><label for="pa-act-compare-unit">Unidad de medida</label><select id="pa-act-compare-unit" aria-label="Filtrar gráfico por unidad">${options}</select></div>${legend}</div><div class="pa-act-chart-nav" data-pa-act-chart-nav hidden><button type="button" data-pa-act-chart-step="-1" aria-label="Ver actividades anteriores" title="Desplazar a la izquierda">‹</button><button type="button" data-pa-act-chart-step="1" aria-label="Ver actividades siguientes" title="Desplazar a la derecha">›</button></div><div class="pa-act-chart-scroll" id="pa-act-chart-scroll" tabindex="0" role="region" aria-label="Gráfica de ${visible.length} actividades; desplázate horizontalmente para ver todas"><svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Comparación de cumplimiento físico de ${visible.length} actividades, en porcentaje de 0 a 100">${svg.join('')}</svg></div><p class="pa-act-compare-explain"><span aria-hidden="true">ⓘ</span>El cumplimiento se calcula por actividad: ejecutado ÷ programado. Las etiquetas muestran las cantidades y unidades reportadas; en ausencia de datos, se indica expresamente.</p>`;
}
  function actTimeline(m,filtered){
    if(!filtered.length)return '<div class="pa-act-nodata">No hay actividades que mostrar en el registro mensual.</div>';
    const hdr=months.map(x=>`<th scope="col">${x}</th>`).join('');
    const rows=filtered.map(a=>{
      const index=m.activities.indexOf(a);
      const cells=months.map((label,i)=>{
        const v=Array.isArray(a.months)?a.months[i]:null;
        const key=!isNumeric(v)?'unknown':v>0?'positive':'zero';
        const note=!isNumeric(v)?'Sin reporte en el archivo':`${fmtNum.format(v)} ${a.unit||'unidades'} reportados`;
        return `<td><button type="button" class="pa-act-month pa-act-month-${key}" data-pa-act-detail="${index}" title="${html(a.n)} \u00b7 ${fullMonths[i]} ${state.year}: ${html(note)}" aria-label="${html(a.n)} ${fullMonths[i]}: ${html(note)}">${key==='positive'?'\u25cf':key==='zero'?'\u00b7':'\u2014'}</button></td>`;
      }).join('');
      return `<tr><th scope="row" title="${html(a.name)}"><span>${html(a.n)}</span><small>${html(a.name.length>42?a.name.slice(0,42)+'\u2026':a.name)}</small></th>${cells}</tr>`;
    }).join('');
    return `<div class="pa-act-timeline-scroll" tabindex="0" aria-label="Registro mensual de las actividades"><table class="pa-act-timeline-table"><thead><tr><th scope="col">Actividad</th>${hdr}</tr></thead><tbody>${rows}</tbody></table></div><div class="pa-act-timeline-legend"><span><i class="pa-act-month-positive"></i>Avance reportado</span><span><i class="pa-act-month-zero"></i>Cero reportado</span><span><i class="pa-act-month-unknown"></i>Sin informaci\u00f3n</span></div><p class="pa-act-smallnote">Muestra los registros mensuales del Excel, <strong>no</strong> un cronograma de fechas programadas. En 2026 solo hay datos hasta junio.</p>`;
  }
  function actCarousel(m){
    const files=actFileList(m);
    const groups=Math.max(1,Math.ceil(files.length/3)),page=Math.min(state.activityCarouselPage,groups-1),start=page*3;
    const visible=Array.from({length:3},(_,i)=>files[start+i]||null);
    const tile=entry=>{
      if(!entry)return `<div class="pa-act-evidence-tile pa-act-evidence-empty" aria-label="Evidencia fotogr\u00e1fica no disponible"><div class="pa-act-thumb-placeholder">${actIcon('image')}<span>Sin fotograf\u00eda<br>verificada</span></div><small>Evidencia no disponible</small></div>`;
      const photo=entry.kind==='image';const filename=photo?'<img src="'+html(entry.url)+'" alt="Imagen enlazada en el Excel" loading="lazy" referrerpolicy="no-referrer"/>':`<span class="pa-act-thumb-${entry.kind}">${actIcon(entry.kind==='folder'?'folder':'list')}<b>${entry.kind==='pdf'?'PDF':'CARPETA'}</b></span>`;
      return `<a class="pa-act-evidence-tile" href="${html(entry.url)}" target="_blank" rel="noopener noreferrer" title="${html(entry.title)}"><div class="pa-act-thumb-placeholder">${filename}</div><small>${html(entry.title)}</small><em>${entry.verified?'Documento verificado':'Enlace registrado en Excel'} \u2197</em></a>`;
    };
    const dots=Array.from({length:groups},(_,i)=>`<button type="button" class="${page===i?'selected':''}" data-pa-act-carousel-page="${i}" aria-label="P\u00e1gina ${i+1} de ${groups}" aria-current="${page===i?'true':'false'}"></button>`).join('');
    return `<div class="pa-act-carousel"><div class="pa-act-carousel-inner"><button class="pa-act-arrow" type="button" data-pa-act-carousel-step="-1" aria-label="Evidencias anteriores" ${groups===1?'disabled':''}>\u276e</button><div class="pa-act-evidence-grid">${visible.map(tile).join('')}</div><button class="pa-act-arrow" type="button" data-pa-act-carousel-step="1" aria-label="Evidencias siguientes" ${groups===1?'disabled':''}>\u276f</button></div><div class="pa-act-carousel-dots">${dots}</div><p class="pa-act-smallnote">${files.length} enlaces de soporte vinculados a esta meta. Los PDFs y carpetas no se presentan como fotograf\u00edas de obras.</p><div class="pa-act-repository"><span>${actIcon('folder')}</span><div><p>Consulta las evidencias, informes y archivos registrados en los Excel.</p><button type="button" data-pa-act-show-docs ${!files.length?'disabled':''}>Ver repositorio de soportes \u2192</button></div></div></div>`;
  }
  function actDetailDialog(){
    return `<dialog class="pa-act-dialog" id="pa-act-dialog" aria-labelledby="pa-act-dialog-title"><div class="pa-act-dialog-head"><div><small>PLAN DE ACCI\u00d3N \u00b7 ${state.year}</small><h2 id="pa-act-dialog-title">Detalle de actividad</h2></div><button type="button" data-pa-act-close aria-label="Cerrar detalle">\u00d7</button></div><div id="pa-act-dialog-body"></div></dialog>`;
  }
  function actRepositoryDialog(m){
    const files=actFileList(m);
    const links=files.map(item=>`<a href="${html(item.url)}" class="pa-act-repository-link" target="_blank" rel="noopener noreferrer"><span class="pa-act-repo-icon">${actIcon(item.kind==='image'?'image':'folder')}</span><span><strong>${html(item.title)}</strong><small>${item.verified?'Archivo PDF verificado':'Enlace aportado en el Excel'}${item.act?' \u00b7 Actividad '+html(item.act):''}</small></span><span aria-hidden="true">\u2197</span></a>`).join('');
    return `<dialog class="pa-act-dialog" id="pa-act-repository-dialog" aria-labelledby="pa-act-repository-title"><div class="pa-act-dialog-head"><div><small>META ${m.id} \u00b7 ${state.year}</small><h2 id="pa-act-repository-title">Soportes y evidencias</h2></div><button type="button" data-pa-act-close aria-label="Cerrar repositorio">\u00d7</button></div><p class="pa-act-smallnote">V\u00ednculos consignados en los archivos. Una carpeta no se identifica como descarga directa.</p><div class="pa-act-repository-list">${links||'<p>Esta meta no tiene enlaces disponibles en los datos aportados.</p>'}</div></dialog>`;
  }
  function actDashboard(m){
    const filtered=actFiltered(m);
    const content=`<div class="pa-act-dashboard">${actKeyStats(m)}${actFiltersMarkup(m)}${actTable(m,filtered)}<div class="pa-act-bottom-grid"><section class="pa-act-card"><h3>Programación vs ejecución por actividad · ${state.year}</h3>${actComparison(m,filtered)}</section><section class="pa-act-card"><h3>Registro mensual de ejecuci\u00f3n ${state.year}</h3>${actTimeline(m,filtered)}</section><section class="pa-act-card"><h3>Soportes y Evidencias Destacadas</h3>${actCarousel(m)}</section></div><p class="pa-act-source"><strong>Fuente:</strong> ${html(currentYear()?.source||'Excel de plan de acci\u00f3n')} \u00b7 ${state.year==='2026'?'Segundo trimestre de 2026.':'Vigencia 2025.'} Los colores de avance son indicadores de lectura; los retrasos solo se mencionan cuando el texto original los especifica.</p></div>${actDetailDialog()}${actRepositoryDialog(m)}`;
    return content;
  }
  function actResults(){
    if(state.loading)return tabMarkup(null)+'<div class="pa-empty"><h2>Cargando actividades...</h2></div>';
    if(state.error)return tabMarkup(null)+`<div class="pa-empty"><h2>No fue posible cargar los registros</h2><p>${html(state.error)}</p><button type="button" data-pa-reload>Reintentar</button></div>`;
    if(state.list)return listMarkup();
    if(!currentYear())return tabMarkup(null)+`<div class="pa-empty"><h2>Informaci\u00f3n de actividades no disponible para ${state.year}</h2><p>Los buscadores, el selector y las pesta\u00f1as siguen disponibles. Selecciona 2025 o 2026 para consultar registros oficiales.</p></div>`;
    const m=selected();if(!m)return tabMarkup(null)+unavailableMarkup();
    return igMetaHeader(m,infoRecord())+tabMarkup(m)+actDashboard(m);
  }
  function actShowDetail(index){
    const m=selected(),a=m?.activities?.[index];if(!a)return;
    const data=[['Meta',m.id],['N.\u00ba de actividad',a.n],['Actividad',a.name],['Responsable (Excel)',actOwner(a,m)],['Indicador',a.indicator],['Unidad de medida',a.unit],['Peso en la meta',isNumeric(a.weight)?pctLabel(a.weight):null],['Valor programado',isNumeric(a.target)?fmtNum.format(a.target):null],['Avance reportado',isNumeric(a.progress)?fmtNum.format(a.progress):null],['Porcentaje de cumplimiento de la actividad',actRatio(a)!==null?pctLabel(actRatio(a)):null],['Territorio consignado',a.territory],['Estado orientativo',actStatus(a).label],['Observaciones del Excel',a.note]];
    const rows=data.map(([k,v])=>`<div><dt>${html(k)}</dt><dd>${v===null||v===undefined||v===''?'Sin dato registrado':html(v)}</dd></div>`).join('');
    const link=safeLink(a.evidence);
    const dialog=panel.querySelector('#pa-act-dialog');if(!dialog)return;
    dialog.querySelector('#pa-act-dialog-title').textContent=`Actividad ${a.n}`;
    dialog.querySelector('#pa-act-dialog-body').innerHTML=`<dl class="pa-act-dialog-list">${rows}</dl>${link?`<a class="pa-act-modal-link" href="${html(link)}" target="_blank" rel="noopener noreferrer">Abrir soporte original en nueva pesta\u00f1a \u2197</a>`:'<p>Sin soporte enlazado en el archivo.</p>'}`;
    dialog.showModal();
  }

  /* Fourth section: Avance Fisico. Derived calculations are explicitly labelled.
     Monthly cells preserve all raw Excel values. A monthly time series is constructed
     only for activities whose monthly figures reconcile with the reported total. */
  const physYearOptions=()=>[2024,2025,2026,2027].map(y=>`<option value="${y}"${String(y)===state.year?' selected':''}>${y}</option>`).join('');
  const physActivityOptions=m=>(m.activities||[]).map((a,i)=>`<option value="${i}"${String(i)===state.physicalFilters.activity?' selected':''}>${html(a.n)} \u00b7 ${html(a.name.length>54?a.name.slice(0,54)+'\u2026':a.name)}</option>`).join('');
  const physCard=(title,body,klass='')=>`<section class="pa-ph-card ${klass}"><h3>${title}</h3>${body}</section>`;
  const phFmtUnit=m=>html(m.unit||'Sin unidad informada');
  const phShown=v=>isNumeric(v)?fmtNum.format(v):'\u2014';
  const phText=(k,v)=>`<div class="pa-ph-field"><span>${k}</span><strong>${v}</strong></div>`;
  function physicalHero(){
    return `<header class="pa-ig-hero pa-act-hero pa-ph-hero"><div class="pa-ig-hero-main"><nav class="pa-act-breadcrumb" aria-label="Ruta del m\u00f3dulo"><span>Inicio</span><span>Metas</span><span>Meta ${state.current}</span><strong>Avance F\u00edsico</strong></nav><h1>Avance F\u00edsico de la Meta</h1><p>Consulta el cumplimiento f\u00edsico de las actividades y el avance en la ejecuci\u00f3n de la meta.</p></div><div class="pa-ig-hero-actions"><div class="pa-ig-quote">\u201cTerritorios que<br>avanzan con<br>su gente\u201d</div><label class="pa-ig-select-year">A\u00f1o de seguimiento<select id="pa-ph-year-select" aria-label="A\u00f1o de seguimiento">${physYearOptions()}</select></label></div></header>`;
  }
  function phStatus(a){return actStatus(a);}
  function phVisible(m){return m.activities.filter((a,i)=>(state.physicalFilters.activity==='all'||String(i)===state.physicalFilters.activity)&&(state.physicalFilters.status==='all'||phStatus(a).key===state.physicalFilters.status));}
  function phMainProgress(m){
    const remaining=isNumeric(m.pct)?Math.max(0,100-m.pct*100):null;
    const detail=[
      ['Valor esperado cuatrienio',isNumeric(m.expected)?`${phShown(m.expected)} ${phFmtUnit(m)}`:'Sin dato'],
      ['Avance registrado (Excel)',pctLabel(m.pct)],
      ['Saldo porcentual pendiente',remaining===null?'Sin dato':`${fmtNum.format(remaining)}%`],
      ['N\u00famero de actividades',fmtInt.format(m.activities.length)],
      ['Tipo de meta',html(m.type||'No informado')]
    ].map(x=>phText(...x)).join('');
    return `<div class="pa-ph-overview">${dial(m.pct,'Avance f\u00edsico de la meta','#087946')}<div class="pa-ph-fields">${detail}</div></div><p class="pa-ph-caption">Porcentaje de ejecuci\u00f3n de la meta reportado en el Excel. No se infiere un avance absoluto en ${phFmtUnit(m)} desde ese porcentaje.</p>`;
  }
  function phMonthlyKind(a){
    const obs=state.year==='2026'?6:12;
    const vals=(a.months||[]).slice(0,obs);
    if(!isNumeric(a.progress)||!isNumeric(a.target)||a.target<=0||!isNumeric(a.weight)||a.weight<0||!vals.some(isNumeric))return null;
    const numerical=vals.filter(isNumeric);
    const sum=numerical.reduce((s,x)=>s+x,0);
    const last=numerical[numerical.length-1];
    const tolerance=Math.max(0.015,Math.abs(a.progress)*0.012);
    const nonnegative=numerical.every(v=>v>=-tolerance);
    if(nonnegative&&Math.abs(sum-a.progress)<=tolerance)return {kind:'monthly',values:vals};
    const nondecreasing=numerical.every((v,i)=>i===0||v>=numerical[i-1]-tolerance);
    if(nondecreasing&&Math.abs(last-a.progress)<=tolerance){
      let prev=0;
      return {kind:'cumulative',values:vals.map(v=>{if(!isNumeric(v))return null;const change=Math.max(0,v-prev);prev=v;return change;})};
    }
    return null;
  }
  function phMonthlyTrend(m){
    const observed=state.year==='2026'?6:12;
    const accepted=m.activities.map(a=>({activity:a,reconciled:phMonthlyKind(a)})).filter(x=>x.reconciled);
    const increments=Array(12).fill(null),cumul=Array(12).fill(null);
    let accumulated=0;
    for(let i=0;i<observed;i++){
      let addition=0;
      for(const entry of accepted){
        const a=entry.activity;const target=a.target;
        let prev=0;
        for(let j=0;j<i;j++){const v=entry.reconciled.values[j];if(isNumeric(v))prev+=v;}
        const delta=entry.reconciled.values[i];
        const cur=prev+(isNumeric(delta)?delta:0);
        // Each activity is normalized by its own unit before applying its official weight.
        const weighted=Math.max(0,cur/target-prev/target)*a.weight*100;
        addition+=weighted;
      }
      increments[i]=Math.max(0,addition);
      accumulated+=Math.max(0,addition);
      cumul[i]=accumulated;
    }
    return {increments,cumul,accepted:accepted.length,excluded:m.activities.length-accepted.length,observed};
  }
  function phChart(m){
    const stats=phMonthlyTrend(m);
    if(stats.accepted===0)return `<p class="pa-ph-empty-chart">No hay series mensuales que concilien con los totales reportados. Consulta los valores originales en la matriz.</p>`;
    const W=655,H=238,L=43,T=18,B=31,R=15,h=H-T-B,w=W-L-R;
    const max=Math.max(10,...stats.cumul.filter(isNumeric),...stats.increments.filter(isNumeric));
    const ymax=Math.ceil(max/10)*10;
    const barW=w/12, x=i=>L+i*barW+barW*.5,y=v=>T+h-Math.min(ymax,v)/ymax*h;
    const rules=[0,.25,.5,.75,1].map(q=>{const yy=T+h*(1-q);return `<line x1="${L}" y1="${yy}" x2="${W-R}" y2="${yy}" stroke="#dfe7ed"/><text x="${L-7}" y="${yy+4}" text-anchor="end" font-size="11" fill="#5a7188">${fmtNum.format(ymax*q)}</text>`;}).join('');
    const bars=stats.increments.slice(0,stats.observed).map((v,i)=>{const hh=h*v/ymax;return `<rect x="${x(i)-barW*.29}" y="${y(v)}" width="${barW*.58}" height="${hh}" rx="2" fill="#99cfe9"><title>${fullMonths[i]} ${state.year}: aporte ponderado ${fmtNum.format(v)} puntos porcentuales (calculado)</title></rect>`;}).join('');
    const linePts=stats.cumul.slice(0,stats.observed).map((v,i)=>`${x(i)},${y(v)}`).join(' ');
    const circles=stats.cumul.slice(0,stats.observed).map((v,i)=>`<circle cx="${x(i)}" cy="${y(v)}" r="4.6" fill="#087a43" stroke="#fff" stroke-width="1.5"><title>${fullMonths[i]} ${state.year}: ${fmtNum.format(v)}% ponderado acumulado (calculado, no porcentaje oficial)</title></circle>`).join('');
    const labels=months.map((name,i)=>`<text x="${x(i)}" y="${H-10}" text-anchor="middle" font-size="11" fill="${i>=stats.observed?'#acbcc9':'#4b6380'}">${name}</text>`).join('');
    return `<div class="pa-ph-trend-key"><span><i></i>Aporte mensual ponderado</span><span><i></i>Acumulado ponderado</span></div><div class="pa-ph-trend-chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Evoluci\u00f3n mensual calculada para ${stats.accepted} de ${m.activities.length} actividades" preserveAspectRatio="xMidYMid meet">${rules}${bars}<polyline points="${linePts}" stroke="#067b41" stroke-width="3" fill="none"/>${circles}${labels}</svg></div><p class="pa-ph-caption">\u00cdndice normalizado por unidad y ponderado por peso: ${stats.accepted} de ${m.activities.length} actividades con meses conciliados. <strong>No equivale al avance oficial de la meta.</strong> ${stats.excluded?`${stats.excluded} actividad(es) no tienen una serie conciliable.`:''} ${state.year==='2026'?'Julio a diciembre: sin reporte.':''}</p>`;
  }
  function phActivityProgress(m){
    const acts=m.activities||[];
    if(!acts.length)return '<p class="pa-ph-empty-chart">Sin actividades documentadas.</p>';
    return `<div class="pa-ph-bars">${acts.map((a,i)=>{
      const ratio=actRatio(a),s=phStatus(a),progress=ratio===null?null:Math.round(Math.max(0,Math.min(100,ratio*100)));
      return `<button type="button" class="pa-ph-activity-row" data-pa-act-detail="${i}" title="Ver detalle de ${html(a.n)}"><span class="pa-ph-activity-label"><strong>Actividad ${html(a.n)}</strong><small>${html(a.name)}</small></span><span class="pa-ph-bar"><i class="pa-ph-bar-${s.key}" style="width:${progress??0}%"></i></span><strong>${progress===null?'\u2014':fmtNum.format(ratio*100)+'%'}</strong></button>`;
    }).join('')}</div><p class="pa-ph-caption">Porcentaje = avance / valor programado de cada actividad. Se mantienen actividades que no tienen denominador v\u00e1lido.</p>`;
  }
  function phToolbar(m){
    return `<div class="pa-ph-table-head"><h2>Avance F\u00edsico por Actividad y Mes</h2><div class="pa-ph-tools"><label>A\u00f1o<select id="pa-ph-table-year">${physYearOptions()}</select></label><label>Estado<select id="pa-ph-filter-status"><option value="all">Todos</option>${[['running','En ejecuci\u00f3n'],['done','Objetivo alcanzado'],['idle','Sin avance'],['delay','Retraso indicado'],['missing','Sin dato']].map(([k,l])=>`<option value="${k}" ${state.physicalFilters.status===k?'selected':''}>${l}</option>`).join('')}</select></label><label>Actividad<select id="pa-ph-filter-activity"><option value="all">Todas</option>${physActivityOptions(m)}</select></label><button type="button" class="pa-ph-export" data-pa-ph-export title="Exportar los registros visibles en Excel">${actIcon('file')}<span>Exportar</span></button></div></div>`;
  }
  function phMatrix(m){
    const filtered=phVisible(m);
    const header=months.map(x=>`<th>${x}</th>`).join('');
    const body=filtered.map((a)=>{
      const i=m.activities.indexOf(a),status=phStatus(a),ratio=actRatio(a);
      const reportCells=months.map((name,mi)=>{
        const v=Array.isArray(a.months)?a.months[mi]:null;
        const present=isNumeric(v);
        const color=!present?'none':v>0?'positive':'zero';
        const title=`${fullMonths[mi]} ${state.year}: ${present?fmtNum.format(v)+' '+(a.unit||'unidades'):'Sin dato reportado'}. ${status.key==='delay'?'Retraso mencionado en observaci\u00f3n; revisar contexto.':''}`;
        return `<td class="pa-ph-month pa-ph-month-${color}" title="${html(title)}">${present?fmtNum.format(v):'\u2014'}</td>`;
      }).join('');
      return `<tr><td>${html(a.n)}</td><td class="pa-ph-name">${html(a.name)}</td><td>${html(a.indicator||'Sin dato')}</td><td>${html(a.unit||'\u2014')}</td><td>${phShown(a.target)}</td>${reportCells}<td class="pa-ph-total">${phShown(a.progress)}</td><td>${ratio===null?'\u2014':fmtNum.format(ratio*100)+'%'}</td><td>${actStatePill(status)}</td><td><button type="button" class="pa-ph-eye" data-pa-act-detail="${i}" aria-label="Ver detalle de la actividad ${html(a.n)}">${actIcon('eye')}</button></td></tr>`;
    }).join('');
    return `<section class="pa-ph-table-card">${phToolbar(m)}<div class="pa-ph-table-scroller" tabindex="0" aria-label="Matriz mensual desplazable por actividad"><table class="pa-ph-matrix"><thead><tr><th>N\u00ba</th><th>Actividad</th><th>Indicador</th><th>Unidad de medida</th><th>Valor programado ${state.year}</th>${header}<th>Total avance</th><th>% avance</th><th>Estado</th><th>Ver detalle</th></tr></thead><tbody>${body||'<tr><td colspan="21" class="pa-ph-no-results">No hay actividades para los filtros seleccionados.</td></tr>'}</tbody></table></div><div class="pa-ph-legend"><span><i class="pa-ph-month-positive"></i>Valor positivo reportado</span><span><i class="pa-ph-month-zero"></i>Cero informado</span><span><i class="pa-ph-month-none"></i>Sin dato</span><span><i class="pa-ph-month-delay"></i>Retrasos mensuales: sin fechas verificables</span></div><p class="pa-ph-caption">Cada celda presenta el valor mensual original del Excel. El total mostrado es el campo de avance reportado, <strong>no la suma autom\u00e1tica de los meses</strong>. La coincidencia entre total y suma mensual puede variar por actividad. Los estados son orientativos. ${state.year==='2026'?'Corte: segundo trimestre; julio a diciembre no reportados.':''}</p></section>`;
  }
  function phTypeCard(m){
    return `${dial(m.pct,'Cumplimiento f\u00edsico reportado','#078146')}<div class="pa-ph-legend-details"><div><i class="pa-ph-legend-run"></i><span>Avance reportado por la meta</span><strong>${pctLabel(m.pct)}</strong></div><div><i class="pa-ph-legend-wait"></i><span>Saldo porcentual pendiente</span><strong>${isNumeric(m.pct)?fmtNum.format(Math.max(0,100-m.pct*100))+'%':'\u2014'}</strong></div><p>Valor esperado: ${isNumeric(m.expected)?phShown(m.expected)+' '+phFmtUnit(m):'sin dato'}. El Excel no certifica una cantidad acumulada en la unidad de la meta para cada mes.</p></div>`;
  }
  function phMap(m){
    const places=[...new Set((m.activities||[]).map(x=>x.territory).filter(Boolean))];
    const bbox='-74.225%2C4.879%2C-74.123%2C4.989';
    return `<div class="pa-ph-map-wrap"><div class="pa-ph-map-view"><div class="ti-ed-map" data-ti-map="physical" role="region" aria-label="Mapa de referencia de Subachoque, sin puntos de intervenciones"></div></div><div class="pa-ph-map-side"><strong>Ubicaciones reportadas</strong>${places.length?places.slice(0,5).map(s=>`<p>${html(s)}</p>`).join(''):'<p>No se registraron lugares espec\u00edficos.</p>'}<p class="pa-ph-map-warning" data-pa-map-audit="physical" role="status">Comprobando lugares declarados y avance físico…</p><a href="#desarrollo?seccion=desarrollo-accion" data-pa-open-theme="physical">Ver mapa completo \u2192</a></div></div>`;
  }
  function phEvidence(m){
    const n=actFileList(m).length;
    return `<div class="pa-ph-evidence-top"><p>Documentos, enlaces y fotograf\u00edas verificadas asociados a esta meta.</p><button type="button" data-pa-act-show-docs ${n?'':'disabled'}>Ver todas \u2192</button></div>${actCarousel(m)}`;
  }
  function physicalDashboard(m){
    return `<div class="pa-ph-dashboard"><div class="pa-ph-top-grid">${physCard('Avance f\u00edsico de la meta',phMainProgress(m),'pa-ph-overview-card')}${physCard('Evoluci\u00f3n del Avance F\u00edsico de la Meta',phChart(m),'pa-ph-trend-card')}${physCard('Cumplimiento por Actividad',phActivityProgress(m),'pa-ph-activity-card')}</div>${phMatrix(m)}<div class="pa-ph-bottom-grid">${physCard('Tipo de Meta - Avance F\u00edsico',phTypeCard(m),'pa-ph-type-card')}${physCard('Mapa de Intervenciones Ejecutadas',phMap(m),'pa-ph-map-card')}${physCard('Evidencias de Avance F\u00edsico',phEvidence(m),'pa-ph-evidence-card')}</div><p class="pa-ph-method"><strong>Fuente:</strong> ${html(currentYear()?.source||'Archivo de Plan de Acci\u00f3n')} \u00b7 ${state.year==='2026'?'Segundo trimestre de 2026.':'Vigencia 2025.'} El porcentaje de cumplimiento de la meta se toma directamente del Excel. Las gr\u00e1ficas derivadas se identifican como calculadas y no se extrapolan a periodos no reportados.</p></div>${actDetailDialog()}${actRepositoryDialog(m)}`;
  }
  function physicalResults(){
    if(state.loading)return tabMarkup(null)+'<div class="pa-empty"><h2>Cargando avances f\u00edsicos...</h2></div>';
    if(state.error)return tabMarkup(null)+`<div class="pa-empty"><h2>No fue posible cargar los registros</h2><p>${html(state.error)}</p><button type="button" data-pa-reload>Reintentar</button></div>`;
    if(state.list)return listMarkup();
    if(!currentYear())return tabMarkup(null)+`<div class="pa-empty" role="status"><h2>Informaci\u00f3n de avance f\u00edsico no disponible para ${state.year}</h2><p>Se conserva la navegaci\u00f3n del seguimiento. Selecciona 2025 o 2026 para consultar los archivos oficiales.</p></div>`;
    const m=selected();if(!m)return tabMarkup(null)+unavailableMarkup();
    return igMetaHeader(m,infoRecord())+tabMarkup(m)+physicalDashboard(m);
  }
  function phExport(){
    const m=selected();if(!m||!currentYear())return;
    const rows=phVisible(m).map(a=>{
      const r={'Meta':m.id,'A\u00f1o':state.year,'N.\u00ba Actividad':a.n,'Actividad':a.name,'Indicador':a.indicator||'','Unidad de medida':a.unit||'','Valor programado':isNumeric(a.target)?a.target:null};
      months.forEach((name,i)=>r[fullMonths[i].charAt(0).toUpperCase()+fullMonths[i].slice(1)]=isNumeric(a.months?.[i])?a.months[i]:null);
      r['Total avance reportado']=isNumeric(a.progress)?a.progress:null;
      r['Porcentaje calculado']=actRatio(a)!==null?actRatio(a)*100:null;
      r['Estado orientativo']=phStatus(a).label;
      r['Responsable']=actOwner(a,m)||'';
      r['Territorio registrado']=a.territory||'';
      r['Observaciones']=a.note||'';
      return r;
    });
    const name=`Avance-Fisico-Subachoque-${state.year}-meta-${m.id}`;
    // The page already loads the verified XLSX browser library for existing tools.
    if(window.XLSX?.utils?.json_to_sheet){
      const sheet=window.XLSX.utils.json_to_sheet(rows.length?rows:[{Meta:m.id,'A\u00f1o':state.year,Nota:'No hay actividades con los filtros actuales'}]);
      const book=window.XLSX.utils.book_new();window.XLSX.utils.book_append_sheet(book,sheet,'Avance Fisico');window.XLSX.writeFile(book,name+'.xlsx');return;
    }
    // If the CDN library is temporarily unavailable, download Excel-compatible CSV.
    const fields=rows.length?Object.keys(rows[0]):['Meta','A\u00f1o','Nota'];
    const serial=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
    const data=[fields.map(serial).join(';'),...(rows.length?rows:[{Meta:m.id,'A\u00f1o':state.year,Nota:'Sin actividades con estos filtros'}]).map(row=>fields.map(k=>serial(row[k])).join(';'))].join('\r\n');
    const blob=new Blob(['\ufeff',data],{type:'text/csv;charset=utf-8'});
    const href=URL.createObjectURL(blob),link=document.createElement('a');link.href=href;link.download=name+'.csv';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(href),1500);
  }

  /* Quinta pestaña: Beneficiarios. La pestaña se alimenta ÚNICAMENTE de las
     tres columnas de asistentes en las actividades del Excel. La columna TOTAL
     de los archivos NO es un total de personas (contiene avance físico); por
     tanto nunca se utiliza para beneficiarios. Los registros por actividad
     pueden repetir personas y NO equivalen a personas únicas. */
  const benGroups=[
    ['Población rural campesina','#10a465'],
    ['Niños, niñas y adolescentes','#3085f5'],
    ['Jóvenes','#f5b80c'],
    ['Adultos','#ff8d50'],
    ['Personas mayores','#e54f63'],
    ['Mujeres','#ac63df'],
    ['Personas con discapacidad','#8394a6']
  ];
  const benIconPaths={
    people:'<circle cx="8" cy="7" r="3"/><circle cx="16" cy="7" r="3"/><path d="M1 20v-3c0-3 3-5 7-5s7 2 7 5v3M9 20v-3c0-3 3-5 7-5s7 2 7 5v3"/>',
    community:'<circle cx="12" cy="7" r="3"/><circle cx="4.5" cy="10" r="2"/><circle cx="19.5" cy="10" r="2"/><path d="M5 21v-3c0-3 3-5 7-5s7 2 7 5v3M1 20v-3c0-2 1-3 3-4m19 7v-3c0-2-1-3-3-4"/>',
    person:'<circle cx="12" cy="6" r="4"/><path d="M4 22v-4c0-5 3-7 8-7s8 2 8 7v4z"/>',
    geo:'<path d="M12 22s8-7.5 8-14a8 8 0 1 0-16 0c0 6.5 8 14 8 14Z"/><circle cx="12" cy="8" r="2.6"/>',
    info:'<circle cx="12" cy="12" r="10"/><path d="M12 10v7M12 7h.01"/>'
  };
  const benIcon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${benIconPaths[name]||benIconPaths.people}</svg>`;
  function benHero(){
    const opts=[2024,2025,2026,2027].map(y=>`<option value="${y}"${state.year===String(y)?' selected':''}>${y}</option>`).join('');
    return `<header class="pa-ig-hero pa-act-hero pa-ben-hero"><div class="pa-ig-hero-main"><nav class="pa-act-breadcrumb" aria-label="Ruta del módulo"><span>Inicio</span><span>Metas</span><span>Meta ${state.current}</span><strong>Beneficiarios</strong></nav><h1>Beneficiarios de la Meta</h1><p>Conoce la población que se beneficia con esta meta y su impacto en el territorio.</p></div><div class="pa-ig-hero-actions"><div class="pa-ig-quote">“La gente<br>es el centro de<br>todo lo que hacemos”</div><label class="pa-ig-select-year">Año de seguimiento<select id="pa-ben-year-select" aria-label="Año de seguimiento">${opts}</select></label></div></header>`;
  }
  function benData(m){
    const acts=m.activities||[];
    const groups=[{key:'staff',index:0,name:'Funcionarios y contratistas',tone:'petrol',icon:'person'},
                  {key:'community',index:1,name:'Beneficiarios de programas (Comunidad)',tone:'blue',icon:'community'},
                  {key:'casual',index:2,name:'Asistentes ocasionales',tone:'amber',icon:'people'}];
    const categories=groups.map(g=>{
      const valid=acts.map(a=>a.people?.[g.index]).filter(v=>isNumeric(v)&&v>=0&&Number.isInteger(v));
      const invalid=acts.map(a=>a.people?.[g.index]).filter(v=>v!==null&&v!==undefined&&v!==''&&!(isNumeric(v)&&v>=0&&Number.isInteger(v)));
      return {...g,value:valid.length?valid.reduce((a,b)=>a+b,0):null,reported:valid.length,invalid:invalid.length,activities:acts.length};
    });
    return {categories, totalUnique:null, reports:categories.reduce((n,c)=>n+(isNumeric(c.value)?c.value:0),0),hasRecords:categories.some(c=>c.reported>0),hasPopulationBreakdown:false,hasMonthlyBreakdown:false};
  }
  const benSumText=c=>c&&isNumeric(c.value)?fmtInt.format(c.value):'—';
  const benCategoryNote=c=>c.reported>0?`Suma de valores de ${c.reported} actividad${c.reported===1?'':'es'}; no son personas únicas${c.invalid?', con '+c.invalid+' registro(s) no validables':''}.`:'No se registró una cifra numérica en esta categoría.';
  function benCard(tone,title,value,description,icon,sub){
    return `<article class="pa-ben-kpi pa-ben-${tone}" title="${html(sub)}"><span class="pa-ben-kpi-icon">${benIcon(icon)}</span><div class="pa-ben-kpi-body"><h3>${html(title)}</h3><div class="pa-ben-kpi-amount">${value}</div><p>${html(description)}</p></div></article>`;
  }
  function benStats(m){
    const b=benData(m), community=b.categories[1],staff=b.categories[0],casual=b.categories[2];
    return `<section class="pa-ben-stats" aria-label="Indicadores de beneficiarios de la meta">
      ${benCard('green','Total de beneficiarios','—','Sin total verificable de personas únicas','people','Los Excel no ofrecen una clave de deduplicación de beneficiarios.')}
      ${benCard('blue','Beneficiarios de programas (Comunidad)',benSumText(community),community.reported?'Registros reportados en actividades':'Sin dato registrado','community',benCategoryNote(community))}
      ${benCard('petrol','Funcionarios y contratistas',benSumText(staff),staff.reported?'Participaciones informadas':'Sin dato registrado','person',benCategoryNote(staff))}
      ${benCard('amber','Asistentes ocasionales',benSumText(casual),casual.reported?'Asistencias registradas':'Sin dato registrado','people',benCategoryNote(casual))}
    </section><p class="pa-ben-kpi-method"><strong>Lectura de las cifras:</strong> son sumas de valores enteros no negativos en las actividades con dato. Pueden repetirse personas entre actividades; no representan población única. La columna «TOTAL» del Excel corresponde al avance de actividad y no se utiliza para contar beneficiarios.</p>`;
  }
  function benEmpty(title,message){return `<div class="pa-ben-empty" role="note"><span aria-hidden="true">${benIcon('info')}</span><strong>${html(title)}</strong><p>${html(message)}</p></div>`;}
  function benPanel(title,body,klass=''){
    return `<section class="pa-ben-card ${klass}"><h3>${html(title)}</h3>${body}</section>`;
  }
  function benMonthly(){
    const lines=[0,1,2,3,4].map(i=>`<line x1="42" x2="730" y1="${36+i*42}" y2="${36+i*42}" stroke="#dce5ee" stroke-width="1"/>`).join('');
    const monthsLabel=months.map((a,i)=>`<text x="${63+i*55}" y="222" text-anchor="middle" fill="#5d748d" font-size="12">${a}</text>`).join('');
    return benPanel('Evolución de beneficiarios por mes ('+state.year+')',`<div class="pa-ben-legend"><span><i class="green"></i>Beneficiarios de programas</span><span><i class="blue"></i>Funcionarios y contratistas</span><span><i class="yellow"></i>Asistentes ocasionales</span></div><div class="pa-ben-monthly-graphic"><svg viewBox="0 0 760 240" role="img" aria-label="Cuadrícula mensual sin datos de beneficiarios: el archivo presenta avances físicos por mes, no desagregación de personas">${lines}${monthsLabel}</svg><div class="pa-ben-monthly-overlay">${benEmpty('Sin distribución mensual verificable','Las columnas de enero a diciembre describen avance físico de actividades, no beneficiarios por mes.')}</div></div>`,'pa-ben-monthly-card');
  }
  function benDistribution(m){
    const b=benData(m);
    const legend=b.categories.map(c=>`<div class="pa-ben-dist-line"><span class="pa-ben-dot ${c.tone}"></span><span>${html(c.name)}</span><strong>${benSumText(c)}</strong></div>`).join('');
    return benPanel('Distribución de beneficiarios',`<div class="pa-ben-dist-layout"><div class="pa-ben-dist-circle" role="img" aria-label="Total de beneficiarios únicos no disponible; no se representan porcentajes de categorías superpuestas"><span>—<small>Sin total<br>único</small></span></div><div class="pa-ben-dist-labels">${legend}</div></div><p class="pa-ben-footnote">Los datos son valores reportados por actividad. No se dibujan porcentajes porque no se acreditó que las categorías sean excluyentes ni que correspondan a personas únicas.</p>`,'pa-ben-dist-card');
  }
  function benPopulation(){
    return benPanel('Beneficiarios por grupo poblacional',`<div class="pa-ben-group-list">${benGroups.map(([label,color])=>`<div class="pa-ben-group-row"><span>${html(label)}</span><span class="pa-ben-group-track"><i style="--ben-group-color:${color}"></i></span><b>—</b></div>`).join('')}</div><p class="pa-ben-footnote">El archivo no contiene cantidades desagregadas verificables por grupo poblacional. Los guiones indican ausencia de dato, no cero.</p>`,'pa-ben-groups-card');
  }
  function benPlaces(m){
    const known=igPlaces(m);const names=[...known.veredas.map(s=>({name:'Vereda '+s,group:'vereda'})),...known.barrios.map(s=>({name:'Barrio '+s,group:'barrio'}))];
    const byName=new Map();for(const x of names){const key=normalizeQuery(x.name);if(!byName.has(key))byName.set(key,x);}
    const list=[...byName.values()];
    const general=known.other.filter(s=>/^todo el municipio$|^casco urbano\b|^centro poblado\b|^municipio de subachoque$|^subachoque$/i.test(s));
    if(!list.length&&general.length)for(const x of general)list.push({name:x,group:'general'});
    return {places:list,otherCount:known.other.length};
  }
  function benTerritoryTable(m){
    const list=benPlaces(m).places;
    const rows=list.map((place,i)=>`<tr><td><button type="button" class="pa-ben-place-select${state.beneficiaryPlace===i?' selected':''}" data-pa-ben-place="${i}" aria-pressed="${state.beneficiaryPlace===i}">${benIcon('geo')}<span>${html(place.name)}</span></button></td><td>—</td><td>—</td></tr>`).join('');
    return benPanel('Beneficiarios por vereda / barrio',`<div class="pa-ben-territory-scroll" tabindex="0" aria-label="Tabla desplazable de lugares reportados"><table class="pa-ben-table"><thead><tr><th>Vereda / Barrio</th><th>Beneficiarios</th><th>% del total</th></tr></thead><tbody>${rows||'<tr><td colspan="3" class="pa-ben-no-places">No se identificaron veredas o barrios de forma explícita para esta meta.</td></tr>'}</tbody></table></div><p class="pa-ben-footnote">Se muestran nombres consignados en las actividades. El Excel no distribuye los beneficiarios numéricamente por vereda o barrio: los guiones no representan cero.</p>`,'pa-ben-territory-card');
  }
  function benMap(m){
    const {places}=benPlaces(m);
    const chosen=Number.isInteger(state.beneficiaryPlace)?places[state.beneficiaryPlace]:null;
    const bbox='-74.225%2C4.879%2C-74.123%2C4.989';
    return benPanel('Mapa de beneficiarios',`<div class="pa-ben-map-area"><div class="ti-ed-map" data-ti-map="beneficiaries" role="region" aria-label="Mapa vectorial de Subachoque, sin marcadores de beneficiarios"></div></div><div class="pa-ben-map-caption"><span class="pa-ben-map-dot"></span><span data-pa-map-audit="beneficiaries" role="status">Comprobando lugares y registros de beneficiarios…</span></div><p class="pa-ben-territory-selection" id="pa-ben-selected-place" aria-live="polite">${chosen?'Localidad en el Excel: '+html(chosen.name):places.length?'Selecciona un lugar de la tabla para identificarlo en el listado documental.':'No hay localidades específicas verificadas en el Excel para esta meta.'}</p><a class="pa-ben-map-link" href="#desarrollo?seccion=desarrollo-accion" data-pa-open-theme="beneficiaries">Abrir mapa completo ↗</a>`,'pa-ben-map-card');
  }
  function benTestimonies(){
    return benPanel('Testimonios de la comunidad',`<button class="pa-ben-view-all" type="button" data-pa-ben-testimony-all aria-haspopup="dialog" aria-controls="pa-ben-testimonials-dialog">Ver todos →</button><div class="pa-ben-testimonial-cards">${[1,2,3].map(()=>`<div class="pa-ben-testimony"><div class="pa-ben-testimony-image" aria-label="Fotografía de participante pendiente de incorporar">${benIcon('people')}</div><p>Testimonio pendiente de incorporar</p><small>No existe cita verificada y autorizada para esta meta.</small></div>`).join('')}</div><div class="pa-ben-pagination"><button type="button" disabled aria-label="Testimonio anterior no disponible">‹</button><span aria-label="Sin testimonios incorporados">○ ○ ○</span><button type="button" disabled aria-label="Testimonio siguiente no disponible">›</button></div><dialog id="pa-ben-testimonials-dialog" class="pa-ben-dialog" aria-labelledby="pa-ben-dialog-title"><div class="pa-ben-modal-top"><h3 id="pa-ben-dialog-title">Testimonios de la comunidad · Meta ${state.current}</h3><button type="button" data-pa-ben-testimony-close aria-label="Cerrar">×</button></div>${benEmpty('Testimonios pendientes de verificación','Los Excel de Plan de Acción no contienen testimonios consentidos ni retratos atribuibles a esta meta. No se muestran citas ni fotografías ficticias.')}</dialog>`,'pa-ben-testimonials-card');
  }
  function benDashboard(m){
    return `<div class="pa-ben-dashboard">${benStats(m)}<div class="pa-ben-mid-grid">${benMonthly()}${benDistribution(m)}${benPopulation()}</div><div class="pa-ben-bottom-grid">${benTerritoryTable(m)}${benMap(m)}${benTestimonies()}</div><p class="pa-ben-source"><strong>Fuente:</strong> ${html(currentYear()?.source||'Plan de Acción')} · ${state.year==='2026'?'Información reportada al segundo trimestre de 2026.':'Vigencia 2025.'} Los valores numéricos son los registrados por actividad, sin deduplicación; el desglose poblacional y los testimonios no figuran en los archivos aportados. No se confunden avances físicos mensuales con personas beneficiadas.</p></div>`;
  }
  function benResults(){
    if(state.loading)return tabMarkup(null)+'<div class="pa-empty"><h2>Cargando beneficiarios…</h2></div>';
    if(state.error)return tabMarkup(null)+`<div class="pa-empty"><h2>No fue posible cargar beneficiarios</h2><p>${html(state.error)}</p><button type="button" data-pa-reload>Reintentar</button></div>`;
    if(state.list)return listMarkup();
    if(!currentYear())return tabMarkup(null)+`<div class="pa-empty" role="status"><h2>Información de beneficiarios no disponible para ${state.year}</h2><p>El encabezado y el selector de vigencia permanecen visibles. Selecciona 2025 o 2026 para consultar los datos oficiales disponibles.</p></div>`;
    const m=selected();if(!m)return tabMarkup(null)+unavailableMarkup();
    return igMetaHeader(m,infoRecord())+tabMarkup(m)+benDashboard(m);
  }

  /* Sixth functional tab: financial execution. Source data: six budget columns
     and the recorded financial percentage for each meta in the two workbooks.
     This view NEVER invents monthly CDP/RP/cash series or funding shares. */
  const buYears=[2024,2025,2026,2027];
  const buPalette=['#087be9','#11884c','#eeb20e','#aa4bcd','#ea4265'];
  const buIcons={
    balance:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 4 16 4 16 0V5M4 12v6c0 4 16 4 16 0v-6"/>',
    cdp:'<path d="M5 3h14v18H5zM9 2v4m6-4v4M8 11h8m-8 4h8"/>',
    rp:'<rect x="4" y="4" width="16" height="16" rx="2"/><path d="m7 12 3 3 7-7"/>',
    oblig:'<path d="M6 2h9l4 4v16H6zM15 2v5h4M9 11h6m-6 4h6m-6 4h4"/>',
    pay:'<rect x="2" y="6" width="20" height="13" rx="3"/><path d="M2 10h20M6 15h4"/>',
    avail:'<path d="m12 3 9 5-9 5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5"/>',
    note:'<path d="M3 4h18v14H7l-4 4zM7 9h10M7 13h7"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v1"/>',
    link:'<path d="M14 4h6v6M20 4l-9 9M20 13v7H4V4h7"/>',
    file:'<path d="M5 2h10l4 4v16H5zM15 2v5h4M8 12h8M8 16h6"/>'
  };
  const buIcon=(type)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${buIcons[type]||buIcons.file}</svg>`;
  const buCurrency=value=>isNumeric(value)?'$ '+new Intl.NumberFormat('es-CO',{maximumFractionDigits:0}).format(value):'—';
  const buMillions=value=>isNumeric(value)?'$ '+fmtNum.format(value/1e6)+' M':'—';
  const buNum=(v)=>isNumeric(v)?fmtNum.format(v):'—';
  const buEntries=[
    {name:'1. Saldo Definitivo de la Meta',short:'Saldo definitivo',icon:'balance',tone:'navy'},
    {name:'2. Disponibilidades (CDP)',short:'Disponibilidades (CDP)',icon:'cdp',tone:'blue'},
    {name:'3. Compromisos (RP)',short:'Compromisos (RP)',icon:'rp',tone:'green'},
    {name:'4. Obligaciones',short:'Obligaciones',icon:'oblig',tone:'amber'},
    {name:'5. Pagos',short:'Pagos',icon:'pay',tone:'purple'},
    {name:'6. Saldo Disponible',short:'Saldo disponible',icon:'avail',tone:'red'}
  ];
  function buRecord(m){
    const values=Array.isArray(m?.budget)?Array.from({length:6},(_,i)=>isNumeric(m.budget[i])?m.budget[i]:null):Array(6).fill(null);
    const def=values[0];
    const rel=values.map((v,i)=>isNumeric(def)&&def>0&&isNumeric(v)?v/def:null);
    const official=isNumeric(m?.budgetPct)?m.budgetPct:null;
    const basedOnRP=isNumeric(def)&&def>0&&isNumeric(values[2])?values[2]/def:null;
    const diff=official!==null&&basedOnRP!==null?Math.abs(official-basedOnRP):null;
    const noResource=m?.budgetPctRaw==='SIN RECURSO'||(isNumeric(def)&&def===0);
    return {values,rel,official,basedOnRP,diff,noResource};
  }
  const buRatioLabel=(v)=>isNumeric(v)?fmtNum.format(v*100)+'%':'—';
  const buSafeFill=(ratio)=>isNumeric(ratio)?Math.max(0,Math.min(100,ratio*100)) : 0;
  function buHero(){
    const years=buYears.map(y=>`<option value="${y}"${String(y)===state.year?' selected':''}>${y}</option>`).join('');
    return `<header class="pa-ig-hero pa-act-hero pa-bu-hero"><div class="pa-ig-hero-main"><nav class="pa-act-breadcrumb" aria-label="Ruta del módulo"><span>Inicio</span><span>Metas</span><span>Meta ${state.current}</span><strong>Ejecución Presupuestal</strong></nav><h1>Ejecución Presupuestal de la Meta</h1><p>Consulta el estado de los recursos asignados y su ejecución en el marco del plan de acción.</p></div><div class="pa-ig-hero-actions"><div class="pa-ig-quote">“Transparencia<br>en la inversión,<br>bienestar para nuestra gente”</div><label class="pa-ig-select-year">Año de seguimiento<select id="pa-bu-year-select" aria-label="Año de seguimiento">${years}</select></label></div></header>`;
  }
  function buPanel(title,body,extra=''){
    return `<section class="pa-bu-panel ${extra}"><h3>${html(title)}</h3>${body}</section>`;
  }
  function buCards(m,r){
    return `<section class="pa-bu-six" aria-label="Seis etapas presupuestales">${buEntries.map((k,i)=>{
      const v=r.values[i],rto=r.rel[i];
      return `<article class="pa-bu-stage pa-bu-${k.tone}" title="${html(k.name)} · ${buCurrency(v)} · Fuente: Plan de Acción ${state.year}"><span class="pa-bu-stage-icon">${buIcon(k.icon)}</span><div class="pa-bu-stage-text"><strong class="pa-bu-stage-heading">${html(k.name)}</strong><span class="pa-bu-stage-amount">${buCurrency(v)}</span>${i===0?`<small>${isNumeric(v)?'Apropiación registrada en el archivo':'No hay valor registrado'}</small>`:`<div class="pa-bu-stage-progress"><b>${buRatioLabel(rto)}</b><span class="pa-bu-track"><i style="width:${buSafeFill(rto)}%"></i></span></div>`}</div></article>`;
    }).join('')}</section>`;
  }
  function buDonut(m,r){
    const value=r.official;
    const hasValue=isNumeric(value)&&!r.noResource;
    const percent=hasValue?Math.max(0,Math.min(100,value*100)):0;
    const remaining=isNumeric(r.values[0])&&isNumeric(r.values[2])?Math.max(0,r.values[0]-r.values[2]):null;
    const method=r.diff!==null&&r.diff>.005?`El porcentaje consignado en el archivo no coincide con RP / saldo definitivo. Diferencia: ${fmtNum.format(r.diff*100)} puntos porcentuales.`:'Porcentaje registrado en el Excel: compromisos RP / saldo definitivo. No equivale al porcentaje pagado.';
    return buPanel('Porcentaje de Ejecución Presupuestal',`<div class="pa-bu-donut-layout"><div class="pa-bu-ring" role="img" aria-label="${hasValue?buRatioLabel(value):'No disponible'} de ejecución presupuestal reportada" style="--bu-progress:${percent}%"><div class="pa-bu-ring-label"><strong>${hasValue?buRatioLabel(value):'—'}</strong><span>Ejecución<br>presupuestal</span></div></div><div class="pa-bu-donut-key"><div><i class="pa-bu-key-dot green"></i>Comprometido (RP)</div><div><i class="pa-bu-key-dot gray"></i>Sin comprometer</div></div><div class="pa-bu-donut-amounts"><div><strong>${buCurrency(r.values[2])}</strong><small>Compromisos (RP)</small></div><div><strong>${buCurrency(remaining)}</strong><small>Diferencia saldo definitivo − RP</small></div></div></div><p class="pa-bu-clarification">${html(method)} ${state.year==='2026'?'Corte: segundo trimestre de 2026.':''}</p>`,'pa-bu-budget-percent');
  }
  function buExpenses(m,r){
    const def=r.values[0],rp=r.values[2];
    const valid=isNumeric(def)&&def>0&&isNumeric(rp);
    let bars='';
    if(valid){
      const W=400,H=182,L=42,B=32,T=12,barH=H-T-B,max=def*1.12;
      const y=v=>T+barH-(v/max)*barH;
      const lines=[0,.25,.5,.75,1].map(q=>{const yy=y(def*q);return `<line x1="${L}" y1="${yy}" x2="${W-12}" y2="${yy}" stroke="#d9e5ee"/><text x="${L-6}" y="${yy+3}" text-anchor="end" font-size="10" fill="#55708c">${fmtNum.format(def*q/1e6)} M</text>`;}).join('');
      bars=`<div class="pa-bu-bar-key"><span><i class="green"></i>Asignado</span><span><i class="blue"></i>Comprometido (RP)</span></div><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Comparación del saldo definitivo y el registro presupuestal de la meta"><g>${lines}</g><rect x="125" y="${y(def)}" width="64" height="${barH*def/max}" fill="#24a45d" rx="3"><title>Saldo definitivo: ${buCurrency(def)}</title></rect><rect x="219" y="${y(rp)}" width="64" height="${barH*rp/max}" fill="#328bed" rx="3"><title>Compromisos (RP): ${buCurrency(rp)}</title></rect><text x="204" y="${H-10}" text-anchor="middle" font-size="12" fill="#1c385c">Total de la meta · ${state.year}</text></svg>`;
    } else bars='<div class="pa-bu-graph-empty">No hay importes compatibles para comparar la apropiación y los compromisos.</div>';
    return buPanel('Ejecución por Tipo de Gasto',`<div class="pa-bu-chart-zone">${bars}</div><p class="pa-bu-clarification"><strong>Comparación total de la meta.</strong> Los Excel no identifican una desagregación financiera verificable por Funcionamiento, Inversión y Transferencias. No se construye una distribución ficticia.</p>`,'pa-bu-expenses');
  }
  function buMonthly(m,r){
    const data=[{label:'CDP',amount:r.values[1],class:'blue'},{label:'Compromisos (RP)',amount:r.values[2],class:'green'},{label:'Obligaciones',amount:r.values[3],class:'amber'},{label:'Pagos',amount:r.values[4],class:'purple'}];
    const scale=Math.max(1,...data.map(a=>a.amount||0));
    return buPanel('Evolución de la Ejecución Presupuestal '+state.year,`<div class="pa-bu-month-legend">${data.map(s=>`<span><i class="${s.class}"></i>${html(s.label)}</span>`).join('')}</div><div class="pa-bu-month-axis" aria-hidden="true">${months.map((m,i)=>`<span${state.year==='2026'&&i>=6?' class="future"':''}>${m}</span>`).join('')}</div><div class="pa-bu-reported"><div class="pa-bu-reported-title">Valores registrados al corte · ${state.year}</div>${data.map(s=>`<div class="pa-bu-reported-row" title="${html(s.label)}: ${buCurrency(s.amount)}"><span>${html(s.label)}</span><div class="pa-bu-reported-track"><i class="${s.class}" style="width:${isNumeric(s.amount)?Math.max(0,100*s.amount/scale):0}%"></i></div><strong>${buMillions(s.amount)}</strong></div>`).join('')}</div><p class="pa-bu-clarification">No existe serie financiera mensual de CDP, RP, obligaciones y pagos en los archivos. Estas barras representan <strong>totales del corte</strong>, no importes por mes. ${state.year==='2026'?'Solo se dispone del segundo trimestre.':''}</p>`,'pa-bu-monthly');
  }
  function buTable(m,r){
    const table=`<div class="pa-bu-table-scroll"><table class="pa-bu-table"><thead><tr><th>Concepto</th><th>Valor</th><th>% del saldo definitivo</th><th>Estado del dato</th></tr></thead><tbody>${buEntries.map((e,i)=>{
      const v=r.values[i],pctValue=r.rel[i];
      const meaningful=isNumeric(v)&&isNumeric(r.values[0])&&r.values[0]>0;
      const flag=meaningful?'Registrado':isNumeric(v)?'Sin base porcentual':'Sin dato';
      return `<tr><td>${html(e.name)}</td><td>${buCurrency(v)}</td><td>${buRatioLabel(pctValue)}</td><td><span class="pa-bu-data-state ${meaningful?'known':'unknown'}">${meaningful?'●':'○'} ${html(flag)}</span></td></tr>`;
    }).join('')}</tbody></table></div><p class="pa-bu-clarification">El estado indica disponibilidad del registro, no una evaluación de cumplimiento. La clasificación financiera no se infiere por el color de los saldos.</p>`;
    return buPanel('Detalle de la Ejecución Presupuestal',table,'pa-bu-table-panel');
  }
  function buWaterfall(m,r){
    const [def,cdp,rp,obl,pay,free]=r.values;
    const ordered=[def,cdp,rp,obl,pay].every(isNumeric)&&def>0&&def>=cdp-0.01&&cdp>=rp-0.01&&rp>=obl-0.01&&obl>=pay-0.01;
    if(!ordered){
      return buPanel('Trazabilidad del Recurso',`<div class="pa-bu-graph-empty">Los valores disponibles no permiten construir una cascada financiera conciliable para esta meta.</div><p class="pa-bu-clarification">Se conservan los importes originales en la tabla. No se calculan saldos con conceptos incompatibles.</p>`,'pa-bu-waterfall');
    }
    const vals=[def,def-cdp,cdp-rp,rp-obl,obl-pay,pay];
    const heads=['Saldo\ndefinitivo','Sin CDP','Sin RP','Sin obligación','Pendiente\nde pago','Pagos'];
    const W=610,H=254,L=22,R=16,T=36,B=60,ht=H-T-B,gap=(W-L-R)/6,bw=44;
    const y=value=>T+ht-(value/def)*ht;
    const rects=[];let top=def;
    vals.forEach((v,i)=>{
      const cx=L+gap*(i+.5),zero=i===0?0:i===5?0:top-v;
      const y1=y(i===0?def:i===5?v:top),y2=y(i===0?0:i===5?0:zero);
      const h=Math.max(1,Math.abs(y2-y1));
      const fill=i===0?'#22a15c':i===5?'#258bed':'#e95c5d';
      rects.push(`<rect x="${cx-bw/2}" y="${Math.min(y1,y2)}" width="${bw}" height="${h}" rx="2" fill="${fill}"><title>${heads[i].replace(/\n/g,' ')}: ${buCurrency(v)}</title></rect><text x="${cx}" y="${Math.max(13,Math.min(y1,y2)-5)}" text-anchor="middle" font-size="10" font-weight="700" fill="#194066">${i===0||i===5?buMillions(v):'− '+buMillions(v)}</text>${heads[i].split('\n').map((line,j)=>`<text x="${cx}" y="${H-B+20+j*12}" text-anchor="middle" font-size="10" fill="#2d4c70">${line}</text>`).join('')}`);
      if(i>0&&i<5)top=zero;
    });
    const ledger=`<div class="pa-bu-trace-legend"><span><i></i>Saldo inicial</span><span><i></i>Diferencias entre etapas</span><span><i></i>Pagos</span></div>`;
    const availability=isNumeric(free)?`<div class="pa-bu-free-badge">Saldo disponible reportado: <strong>${buCurrency(free)}</strong>${isNumeric(def)&&isNumeric(cdp)&&Math.abs((def-cdp)-free)>1?'<span> · Difiere de saldo definitivo menos CDP</span>':''}</div>`:'';
    return buPanel('Trazabilidad del Recurso',`${ledger}<div class="pa-bu-waterfall-chart"><svg role="img" aria-label="Cascada conciliable de apropiación, etapas y pagos" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet"><line x1="${L}" y1="${H-B}" x2="${W-R}" y2="${H-B}" stroke="#bacbd9"/>${rects.join('')}</svg></div>${availability}<p class="pa-bu-clarification">Cascada conciliada hasta <strong>Pagos</strong>: las deducciones son diferencias entre etapas consecutivas. El saldo disponible se reporta por separado porque corresponde a otro concepto.</p>`,'pa-bu-waterfall');
  }
  function buFunding(m,r){
    return buPanel('Fuentes de Financiación',`<div class="pa-bu-funding-layout"><div class="pa-bu-funding-ring" role="img" aria-label="Sin distribución presupuestal verificable por fuentes"><div><strong>—</strong><small>Sin desglose<br>por fuentes</small></div></div><div class="pa-bu-funding-legend"><div><i class="green"></i>Recursos propios <span>—</span></div><div><i class="blue"></i>SGP <span>—</span></div><div><i class="amber"></i>Cofinanciación <span>—</span></div><div><i class="purple"></i>Otras fuentes <span>—</span></div></div></div><p class="pa-bu-clarification">Los archivos de Plan de Acción no desagregan recursos por estas fuentes para cada meta. No se estiman porcentajes.</p>`,'pa-bu-funding');
  }
  function buDocs(m){
    const keys=[['CDP','cdp'],['Registro presupuestal','rp'],['Obligaciones','oblig'],['Pagos','pay']];
    const links=igDocuments(m).filter(x=>!!safeLink(x.url));
    const htmlDocs=keys.map(([name,key])=>`<div class="pa-bu-document"><span class="pa-bu-doc-symbol ${key}">${buIcon('file')}</span><span><strong>${name}</strong><small>Documento presupuestal no identificado</small></span><span class="pa-bu-doc-unavailable" aria-label="Sin archivo verificado">—</span></div>`).join('');
    const references=links.length?`<div class="pa-bu-support-references"><strong>Enlaces de soporte registrados (sin certificación de carácter presupuestal):</strong>${links.slice(0,3).map(x=>`<a href="${html(safeLink(x.url))}" target="_blank" rel="noopener noreferrer">${html(x.title)} ↗</a>`).join('')}${links.length>3?`<button type="button" data-pa-bu-docs>Ver los ${links.length} enlaces registrados →</button>`:''}</div>`:'<div class="pa-bu-support-references">El Excel no contiene enlaces de soporte para esta meta.</div>';
    const dialog=links.length>3?`<dialog id="pa-bu-doc-dialog" class="pa-bu-dialog" aria-label="Enlaces de soporte registrados para esta meta"><header><h3>Enlaces registrados · Meta ${m.id}</h3><button type="button" data-pa-bu-docs-close aria-label="Cerrar">×</button></header>${links.map(x=>`<a href="${html(safeLink(x.url))}" target="_blank" rel="noopener noreferrer">${html(x.title)} ↗</a>`).join('')}</dialog>`:'';
    return buPanel('Documentos Presupuestales',`<div class="pa-bu-document-list">${htmlDocs}</div>${references}${dialog}`,'pa-bu-docs');
  }
  function buObservations(m){
    const note=String(m?.notes||'').trim();
    const match=/(presupuest|\bcdp\b|\bRP\b|financiaci[oó]n|financiero|saldo disponible|recursos? (?:asignados?|comprometidos?|pendientes?|gestionados?|faltantes?)|obligaciones?|\bpagos?\b)/i.test(note);
    const phrase=match?`<strong>Observación consignada en el archivo:</strong><br>${html(note)}`:'Sin observaciones presupuestales específicas registradas para esta meta y vigencia.';
    return buPanel('Observaciones',`<div class="pa-bu-observation-box"><span>${buIcon('note')}</span><p>${phrase}</p></div><p class="pa-bu-clarification">Las observaciones operativas generales no se presentan como hallazgos financieros.</p>`,'pa-bu-observations');
  }
  function buMethodDialog(m,r){
    const ratio=isNumeric(r.values[0])&&r.values[0]>0&&isNumeric(r.values[2])?buRatioLabel(r.values[2]/r.values[0]):'No calculable';
    return `<dialog class="pa-bu-dialog" id="pa-bu-method-dialog" aria-labelledby="pa-bu-method-title"><header><h3 id="pa-bu-method-title">Metodología y procedencia · Meta ${m.id} · ${state.year}</h3><button type="button" data-pa-bu-method-close aria-label="Cerrar">×</button></header><p><strong>Fuente:</strong> ${html(currentYear()?.source||'Plan de Acción')}. Se utilizan una sola vez los seis valores de presupuesto registrados por meta, sin repetir los importes de cada actividad.</p><p><strong>Porcentaje:</strong> en estos archivos coincide con Compromisos (RP) / Saldo definitivo. Cálculo de contraste: ${ratio}. Porcentaje reportado: ${buRatioLabel(r.official)}.</p><p><strong>CDP, RP, obligaciones y pagos:</strong> etapas financieras distintas. El saldo disponible se toma del campo oficial; no se obtiene restando pagos.</p><p><strong>Desagregaciones:</strong> no se registran series mensuales de ejecución, composición por tipo de gasto ni participaciones por fuentes de financiación a nivel de meta.</p><p><strong>Corte:</strong> ${state.year==='2026'?'segundo trimestre de 2026':'archivo de vigencia 2025, sin fecha individual de actualización por meta'}.</p></dialog>`;
  }
  function buDashboard(m){
    const r=buRecord(m);
    return `<div class="pa-bu-dashboard">${buCards(m,r)}<div class="pa-bu-top-grid">${buDonut(m,r)}${buExpenses(m,r)}${buMonthly(m,r)}</div><div class="pa-bu-middle-grid">${buTable(m,r)}${buWaterfall(m,r)}${buFunding(m,r)}</div><div class="pa-bu-bottom-grid">${buDocs(m)}${buObservations(m)}</div><div class="pa-bu-source"><span>Datos presupuestales reportados en el Plan de Acción ${state.year}${state.year==='2026'?' · Segundo trimestre':''}.</span><button type="button" data-pa-bu-method aria-haspopup="dialog" aria-controls="pa-bu-method-dialog">${buIcon('info')} Consultar metodología de los cálculos</button></div>${buMethodDialog(m,r)}</div>`;
  }
  function buResults(){
    if(state.loading)return tabMarkup(null)+'<div class="pa-empty"><h2>Cargando Ejecución Presupuestal…</h2></div>';
    if(state.error)return tabMarkup(null)+`<div class="pa-empty"><h2>No fue posible cargar el presupuesto</h2><p>${html(state.error)}</p><button type="button" data-pa-reload>Reintentar</button></div>`;
    if(state.list)return listMarkup();
    if(!currentYear())return tabMarkup(null)+`<div class="pa-empty" role="status"><h2>Información presupuestal no disponible para ${state.year}</h2><p>Se conservan los buscadores y la navegación. No se ha recibido el Plan de Acción de esta vigencia.</p></div>`;
    const m=selected();if(!m)return tabMarkup(null)+unavailableMarkup();
    return igMetaHeader(m,infoRecord())+tabMarkup(m)+buDashboard(m);
  }

  /* PESTAÑA 7 · TERRITORIO. Las actividades de los Excel no incluyen coordenadas exactas;
     una mención de vereda o barrio NO se convierte en un punto ni en una obra ejecutada.
     Límites: IGAC (municipio) e IDEAM/DANE 2024 (veredas), vía API de lectura. */
  const trYears=[2024,2025,2026,2027];
  const trCenter=[4.92614,-74.17299];
  const trOsmUrl='#data?seccion=data-explorando';
  const trKnown=[
    ['canica alta','Canica Alta','vereda'],['canica baja','Canica Baja','vereda'],
    ['el paramo','El Páramo','vereda'],['paramo','El Páramo','vereda'],
    ['el valle','El Valle','vereda'],['galdamez','Galdámez','vereda'],
    ['tibagota','Tibagota','vereda'],['altania','Altania','vereda'],
    ['la union','La Unión','vereda'],['cascajal','Cascajal','vereda'],
    ['rincon santo','Rincón Santo','vereda'],['la cuesta','La Cuesta','vereda'],
    ['el tobal','El Tobal','vereda'],['llanitos','Llanitos','vereda'],
    ['el guamal','Guamal','vereda'],['guamal','Guamal','vereda'],
    ['pantano de arce','Pantano de Arce','vereda'],['pantano de vargas','Pantano de Vargas','vereda'],
    ['el pantano','Pantano','vereda'],['pantano','Pantano','vereda'],
    ['santa rosa','Santa Rosa','vereda'],['la yeguera','La Yegüera','vereda'],
    ['las pilas','Las Pilas','vereda'],['santuario','Santuario','vereda'],
    ['la pradera','La Pradera','centro poblado'],['siglo xxi','Siglo XXI','barrio'],
    ['centro poblado','Centro poblado','centro poblado'],['casco urbano','Casco urbano','casco urbano'],
    ['subachoque centro','Centro de Subachoque','casco urbano'],['zona urbana','Zona urbana','casco urbano']
  ];
  const trSlug=s=>normalizeQuery(s).replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
  const trMentionsOnly=s=>{const n=trSlug(s);return /^(todo el municipio|municipio de subachoque|subachoque|jurisdiccion municipal|zona rural y urbana|casco rural y urbano)$/.test(n);};
  const trWordMatch=(hay,word)=>{
    const pieces=trSlug(word).split(/\s+/);const words=trSlug(hay).split(/\s+/);
    for(let i=0;i<=words.length-pieces.length;i++)if(pieces.every((p,j)=>words[i+j]===p))return true;
    return false;
  };
  function trRaw(a,m){
    const fromExtra=state.territoryExtra?.periods?.[state.year]?.[String(m.id)]?.[String(a.n)];
    return String(fromExtra||a.territory||'').trim();
  }
  function trPlaceData(m){
    const byKey=new Map(),broad=[],activities=[];
    for(const a of (m?.activities||[])){
      const raw=trRaw(a,m);
      if(!raw)continue;
      const act={n:String(a.n),name:a.name,raw,activity:a,state:actStatus(a)};
      activities.push(act);
      if(trMentionsOnly(raw)||/^(alcaldia|secretaria|idcts|coliseo municipal)/i.test(trSlug(raw)))broad.push(act);
      for(const [token,label,type] of trKnown){
        if(!trWordMatch(raw,token))continue;
        const key=trSlug(label);
        if(!byKey.has(key))byKey.set(key,{key,label,type,activities:[],sources:[],isOfficial:false});
        const place=byKey.get(key);
        if(!place.activities.some(x=>x.n===act.n))place.activities.push(act);
        if(!place.sources.includes(raw))place.sources.push(raw);
      }
      // Registrar barrios declarados expresamente, aunque no estén en el catálogo de coincidencias conocidas.
      const re=/\bbarrio\s+([\p{L}0-9]+(?:\s+(?!de\s+la\s+|en\s+la\s+)[\p{L}0-9]+){0,3})/giu;
      let match;
      while((match=re.exec(raw))!==null){
        const candidate=match[1].replace(/\s+(del|y|que|para|donde|se|con)\b.*$/i,'').trim();
        if(!candidate||candidate.length>45)continue;
        const key=trSlug(candidate);
        if(!byKey.has(key))byKey.set(key,{key,label:candidate,type:'barrio',activities:[],sources:[],isOfficial:false});
        const place=byKey.get(key);
        if(!place.activities.some(x=>x.n===act.n))place.activities.push(act);
        if(!place.sources.includes(raw))place.sources.push(raw);
      }
    }
    const places=[...byKey.values()].sort((a,b)=>a.label.localeCompare(b.label,'es'));
    const veredas=places.filter(p=>p.type==='vereda'),barrios=places.filter(p=>p.type==='barrio');
    const activityCount=activities.length;
    // No existen coordenadas exactas de sitios de obra en los Excel; este conteo queda indeterminado.
    return {places,veredas,barrios,broad,activities,activityCount};
  }
  const trAll=()=>trPlaceData(selected());
  const trIconPaths={
    pin:'<path d="M12 22s8-7.5 8-14a8 8 0 1 0-16 0c0 6.5 8 14 8 14Z"/><circle cx="12" cy="8" r="2.7"/>',
    village:'<path d="M3 21V8l6-4 6 4v13H3Zm12 0V5h6v16M6 11h2M6 15h2M10 11h2M10 15h2M18 9h1M18 13h1"/>',
    nodes:'<circle cx="12" cy="3.5" r="2"/><circle cx="4" cy="15" r="2"/><circle cx="20" cy="15" r="2"/><path d="M11 5 5 13M13 5l6 8M6 16l12 0"/>',
    photo:'<rect x="2" y="4" width="20" height="16" rx="2"/><circle cx="8" cy="9" r="1.6"/><path d="m3 18 5-5 4 3 4-5 5 7"/>',
    file:'<path d="M6 2h9l4 4v16H6zM15 2v5h4M9 12h7M9 16h7"/>',
    north:'<path d="m12 2 7 20-7-5-7 5z"/>',
    download:'<path d="M12 2v13m-5-5 5 5 5-5M4 18v4h16v-4"/>',
    layers:'<path d="m12 2 10 5-10 5L2 7zm-10 10 10 5 10-5M2 17l10 5 10-5"/>',
    info:'<circle cx="12" cy="12" r="10"/><path d="M12 10v6M12 7h.01"/>',
    satellite:'<circle cx="12" cy="12" r="8"/><path d="M4 4h4M16 4h4M4 20h4M16 20h4"/>'
  };
  const trIcon=k=>`<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${trIconPaths[k]||trIconPaths.pin}</svg>`;
  function trHero(){
    return `<header class="pa-ig-hero pa-act-hero pa-tr-hero"><div class="pa-ig-hero-main"><nav class="pa-act-breadcrumb" aria-label="Ruta del módulo"><span>Inicio</span><span>Metas</span><span>Meta ${state.current}</span><strong>Territorio</strong></nav><h1>Territorio de la Meta</h1><p>Conoce dónde se ejecutan las actividades de esta meta y su impacto en las veredas y barrios del municipio.</p></div><div class="pa-ig-hero-actions"><div class="pa-ig-quote">“Territorios que<br>se transforman en<br>bienestar para la gente”</div><label class="pa-ig-select-year">Año de seguimiento<select id="pa-tr-year-select" aria-label="Año de seguimiento">${trYears.map(y=>`<option value="${y}"${String(y)===state.year?' selected':''}>${y}</option>`).join('')}</select></label></div></header>`;
  }
  function trCard(title,body,cls='',extra=''){
    return `<section class="pa-tr-card ${cls}"><div class="pa-tr-card-head"><h3>${html(title)}</h3>${extra}</div>${body}</section>`;
  }
  function trMapPanel(m){
    const choices=(window.TITerritoryEvidence?.catalogue||[]).map(kind=>
      '<label class="pa-tr-theme-chip" style="--theme-color:'+html(kind.color)+'" title="'+html(kind.hint)+'">'+
      '<input type="checkbox" data-pa-tr-theme="'+html(kind.id)+'"'+(state.territoryThemeActive.has(kind.id)?' checked':'')+'>'+
      '<span class="pa-tr-theme-swatch" aria-hidden="true"></span>'+html(kind.label)+'</label>').join('');
    const controls='<div class="pa-tr-map-controls"><button type="button" class="pa-tr-map-mode" data-pa-tr-basemap title="Mostrar capas base">'+trIcon('layers')+' Capas</button>'+
      '<button type="button" data-pa-tr-fullmap title="Ampliar mapa" aria-label="Ampliar mapa">⛶</button></div>';
    const map='<div class="pa-tr-map-frame">'+
      '<div id="pa-tr-map" class="pa-tr-map-canvas" data-ti-map="territory" data-ti-map-manual="1" role="region"'+
      ' aria-label="Mapa maestro territorial con capas documentales combinables"></div>'+
      '<div class="pa-tr-map-fallback" id="pa-tr-map-fallback" role="status">Cargando cartografía…</div>'+
      controls+'<div class="pa-tr-map-bottom">'+trIcon('info')+
      '<span>Base vectorial WGS84. Capas del Excel, sin puntos de obras inventados.</span></div></div>';
    const layers='<div class="pa-tr-theme-toolbar"><div class="pa-tr-theme-heading"><strong>Capas de información</strong>'+
      '<span>Selecciona una o varias para superponerlas en este mismo mapa.</span></div>'+
      '<div class="pa-tr-theme-chips" role="group" aria-label="Capas temáticas">'+choices+'</div>'+
      '<p class="pa-tr-theme-status" id="pa-tr-theme-status" role="status">Mapa base · sin capas temáticas activas.</p>'+
      '<p class="pa-tr-theme-quality" id="pa-tr-theme-quality">Contrastando información territorial…</p></div>';
    const after='<div class="pa-tr-map-after"><span>Subachoque · Cundinamarca · DIVIPOLA 25769</span>'+
      '<span class="pa-tr-map-status" id="pa-tr-map-status">Cartografía de referencia WGS84</span>'+
      '<a href="#data?seccion=data-explorando">Abrir mapa completo ↗</a></div>';
    return trCard('Mapa de Intervenciones de la Meta',map+layers+after,'pa-tr-primary-map');
  }
  function trCoverageStats(m){
    const d=trPlaceData(m);
    const stat=(icon,value,label,hint,tone)=>`<article class="pa-tr-coverage-stat ${tone}" title="${html(hint)}"><span class="pa-tr-stat-symbol">${trIcon(icon)}</span><div><strong>${html(value)}</strong><p>${html(label)}</p><small>${html(hint)}</small></div></article>`;
    const body=`<div class="pa-tr-coverage-grid">${stat('pin',fmtInt.format(d.veredas.length),'Veredas citadas','Menciones explícitas en las actividades; no son obras georreferenciadas.','green')}${stat('village',fmtInt.format(d.barrios.length),'Barrios citados','Solo barrios nombrados en los campos territoriales.','blue')}${stat('nodes','—','Sitios exactos','El Excel no proporciona coordenadas de sitios únicos.','purple')}</div>`;
    return trCard('Cobertura Territorial',body,'pa-tr-coverage');
  }
  function trPlaceStatus(p){
    const progress=p.activities.map(a=>a.state.key);
    if(progress.includes('running')||progress.includes('done')){
      if(progress.includes('idle')||progress.includes('missing')||progress.includes('delay'))return ['mixed','Avances mixtos'];
      return ['running','Con avance'];
    }
    if(progress.every(x=>x==='idle'))return ['idle','Sin avance registrado'];
    return ['missing','Sin estado consolidado'];
  }
  function trDetailTable(m){
    const d=trPlaceData(m),rows=d.places.slice(0,state.territoryExpanded?999:7);
    const htmlRows=rows.map((p,i)=>{
      const [k,desc]=trPlaceStatus(p);
      return `<tr><td><button type="button" class="pa-tr-place-btn${state.territorySelected===p.key?' selected':''}" data-pa-tr-place="${html(p.key)}" title="Ver actividades asociadas a ${html(p.label)}">${html(p.label)}</button><small>${html(p.type)}</small></td><td><strong>${p.activities.length}</strong><small>actividades que la mencionan</small></td><td><span class="pa-tr-status ${k}"><i></i>${html(desc)}</span></td><td><span class="pa-tr-progress-unknown" title="No hay avance desagregado por vereda o barrio">No evaluable</span></td></tr>`;
    }).join('');
    const nothing='<tr><td colspan="4" class="pa-tr-empty-table">Los campos de ubicación no identifican nombres específicos de veredas o barrios para esta meta. Consulta los textos originales en Actividades.</td></tr>';
    const action=d.places.length>7?`<button type="button" class="pa-tr-link" data-pa-tr-expand-places>${state.territoryExpanded?'Ver menos':'Ver todas'} →</button>`:'<span class="pa-tr-minicaption">Según el Excel</span>';
    const detail=`<div class="pa-tr-table-scroll"><table class="pa-tr-place-table"><thead><tr><th>Vereda / Barrio</th><th>Actividades citadas</th><th>Lectura del avance</th><th>Avance territorial</th></tr></thead><tbody>${htmlRows||nothing}</tbody></table></div><div class="pa-tr-table-foot"><span>${d.places.length} localidades identificadas por nombre. No equivale a número de sitios de obra.</span></div>`;
    return trCard('Detalle por Vereda / Barrio',detail,'pa-tr-places',action);
  }
  function trEvidenceCards(m){
    const images=actFileList(m).filter(f=>f.kind==='image'&&safeLink(f.url));
    const documents=(m.activities||[]).filter(a=>safeLink(a.evidence));
    const photos=images.map(file=>({
      kind:'image',title:file.title||'Fotografía enlazada',
      description:file.activity||file.act||'Evidencia registrada en el Plan de Acción',
      url:safeLink(file.url),activity:file.act||'',verified:!!file.verified
    }));
    const photoUrls=new Set(photos.map(photo=>photo.url));
    const docs=documents.filter(a=>!photoUrls.has(safeLink(a.evidence))).map(a=>({
      kind:'document',title:a.name,description:'Actividad '+a.n+' · enlace registrado en Excel',
      url:safeLink(a.evidence),activity:String(a.n)
    }));
    // Preserve every real source. Do not invent photography or duplicate a
    // document link that is already represented as a verified image.
    const available=[...photos,...docs];
    return available.length?available:[{
      kind:'empty',title:'Sin fotografías ni documentos enlazados',
      description:'Esta meta no tiene soportes disponibles en el archivo consultado.',
      activity:'',url:null
    }];
  }
  function trGallery(m){
    const all=trEvidenceCards(m),total=all.length;
    const first=Math.max(0,Math.min(total-1,state.territoryGalleryPage||0));
    const item=all[first];
    const isImage=item.kind==='image',isDocument=item.kind==='document';
    const kindLabel=isImage?'Fotografía enlazada':isDocument?'Soporte documental':'Información no disponible';
    const visual=isImage&&item.url
      ?'<a class="pa-tr-featured-image-link" href="'+html(item.url)+'" target="_blank" rel="noopener noreferrer" aria-label="Abrir fotografía de la evidencia"><img src="'+html(item.url)+'" alt="'+html(item.title)+'" loading="lazy"/></a>'
      :'<div class="pa-tr-featured-placeholder '+(isDocument?'document':'empty')+'">'+
        '<div class="pa-tr-featured-icon">'+trIcon(isDocument?'file':'photo')+'</div>'+
        '<strong>'+(isDocument?'Soporte documental':'Sin fotografía disponible')+'</strong>'+
        '<span>'+(isDocument?'Archivo enlazado en el Plan de Acción':'No hay imágenes ni archivos enlazados para esta meta')+'</span></div>';
    const media='<div class="pa-tr-featured-media'+(isImage?' image':'')+'">'+visual+'</div>';
    const caption='<div class="pa-tr-featured-caption" id="pa-tr-gallery-caption" aria-live="polite" aria-atomic="true">'+
      '<span class="pa-tr-featured-kind">'+html(kindLabel)+'</span>'+
      '<h4 title="'+html(item.title)+'">'+html(item.title)+'</h4>'+
      '<p>'+html(item.description)+'</p>'+
      (item.url?'<a class="pa-tr-featured-open" href="'+html(item.url)+'" target="_blank" rel="noopener noreferrer">Abrir '+(isImage?'fotografía':'soporte')+' ↗</a>':'')+
      '</div>';
    const windowSize=Math.min(total,7);
    const dotStart=Math.min(Math.max(0,first-Math.floor(windowSize/2)),total-windowSize);
    const dots=Array.from({length:windowSize},(_,i)=>{
      const index=dotStart+i;
      return '<button type="button" data-pa-tr-gallery-page="'+index+'"'+
       (index===first?' class="selected" aria-current="true"':'')+
       ' aria-label="Mostrar evidencia '+(index+1)+' de '+total+'"></button>';
    }).join('');
    const controls='<div class="pa-tr-carousel-nav" aria-label="Navegar entre fotografías y documentos">'+
      '<button type="button" data-pa-tr-gallery-step="-1" aria-label="Evidencia anterior"'+(total===1?' disabled':'')+'>‹</button>'+
      '<span class="pa-tr-carousel-counter" aria-label="Evidencia '+(first+1)+' de '+total+'">'+(first+1)+' / '+total+'</span>'+
      '<div class="pa-tr-carousel-pages" aria-label="Evidencias">'+dots+'</div>'+
      '<button type="button" data-pa-tr-gallery-step="1" aria-label="Evidencia siguiente"'+(total===1?' disabled':'')+'>›</button></div>';
    const more='<button type="button" class="pa-tr-link" data-pa-tr-gallery-all aria-haspopup="dialog">Ver todas →</button>';
    const modal='<dialog class="pa-tr-dialog" id="pa-tr-gallery-dialog" aria-label="Fotografías y documentos de la meta">'+
      '<header><h3>Fotografías y documentos · Meta '+m.id+'</h3><button type="button" data-pa-tr-dialog-close aria-label="Cerrar">×</button></header>'+
      '<p>Las imágenes se muestran únicamente cuando están enlazadas e identificadas. Los documentos son soportes, no fotografías verificadas de intervenciones.</p>'+
      (all.some(x=>x.url)?all.filter(x=>x.url).map(x=>'<a href="'+html(x.url)+'" target="_blank" rel="noopener noreferrer">'+html(x.title)+' · '+html(x.activity)+' ↗</a>').join('')
       :'<p>No se registraron fotografías ni documentos enlazados para esta meta.</p>')+'</dialog>';
    const body='<p class="pa-tr-gallery-intro">Recorre las fotografías y los documentos asociados a las actividades de esta meta.</p>'+
      '<div class="pa-tr-gallery-carousel" role="region" aria-roledescription="carrusel" aria-label="Galería de evidencias de la meta">'+
       '<article class="pa-tr-featured">'+media+caption+'</article>'+controls+'</div>'+
      '<p class="pa-tr-fineprint">Los documentos se muestran como soportes; no prueban por sí solos la ejecución de una obra.</p>'+modal;
    return trCard('Fotografías y documentos del territorio',body,'pa-tr-gallery',more);
  }
  function trCoverageDonut(m){
    const d=trPlaceData(m),linked=d.activities;
    let withProgress=0,idle=0,missing=0,done=0;
    for(const a of linked){if(a.state.key==='done')done++;else if(a.state.key==='running')withProgress++;else if(a.state.key==='idle')idle++;else missing++;}
    const count=linked.length;
    const circle=count?'conic-gradient(#0ca357 0 '+(100*done/count)+'%,#2c97e9 '+(100*done/count)+'% '+(100*(done+withProgress)/count)+'%,#f8b524 '+(100*(done+withProgress)/count)+'% '+(100*(done+withProgress+idle)/count)+'%,#b0bbc8 '+(100*(done+withProgress+idle)/count)+'% 100%)'
      :'conic-gradient(#d3dce5 0 100%)';
    const legend=[['#0ca357','Meta de actividad alcanzada',done],['#2c97e9','Con avance registrado',withProgress],['#f8b524','Sin avance reportado',idle],['#b0bbc8','Sin porcentaje evaluable',missing]];
    const legendMarkup=legend.map(([color,label,value])=>'<div class="pa-tr-donut-key"><i style="background:'+color+'"></i><span>'+html(label)+'</span><b>'+value+(count?' <small>('+fmtNum.format(value*100/count)+'%)</small>':'')+'</b></div>').join('');
    const body='<p class="pa-tr-indicators-intro">Conoce el estado de las actividades que mencionan una ubicación territorial.</p>'+
      '<div class="pa-tr-donut-layout">'+
       '<div class="pa-tr-donut" style="background:'+circle+'" role="img" aria-label="Distribución de '+count+' actividades con información territorial, no de sitios intervenidos">'+
        '<div><strong>'+fmtInt.format(count)+'</strong><small>actividades con<br>campo territorial</small></div></div>'+
       '<div class="pa-tr-donut-legend" aria-label="Estados de las actividades">'+legendMarkup+'</div>'+
      '</div>'+
      '<p class="pa-tr-fineprint">Cifras calculadas a partir de <strong>actividades con información territorial</strong>, no de sitios intervenidos. No certifican ejecución en cada vereda.</p>';
    return trCard('Indicadores de Cobertura Territorial',body,'pa-tr-indicators');
  }
  function trDownloads(m){
    const link='<a href="https://sigi.igac.gov.co/dip/rest/services/Limites/FeatureServer/0" target="_blank" rel="noopener noreferrer">IGAC · límite municipal ↗</a>';
    const orientation='<p class="pa-tr-download-intro">Consulta los archivos del Plan de Acción y los mapas de referencia de Subachoque para identificar la información territorial disponible y revisar su procedencia.</p>'+
      '<div class="pa-tr-download-guide" aria-label="Contenido y fuentes de los recursos">'+
        '<h4>Qué encontrarás y de dónde viene</h4>'+
        '<ul>'+
          '<li><strong>Plan de Acción '+html(state.year)+':</strong> localidades y actividades en CSV.</li>'+
          '<li><strong>Cartografía local:</strong> límite municipal y veredas en GeoJSON; origen por verificar.</li>'+
          '<li><strong>Fuentes institucionales:</strong> enlaces al IGAC y al IDEAM (referencia «veredas DANE 2024»).</li>'+
        '</ul>'+
      '</div>';
    const body=`${orientation}<div class="pa-tr-download-list">
      <button type="button" data-pa-tr-csv class="pa-tr-file-item"><span class="pa-tr-file-symbol excel">CSV</span><span><strong>Localidades y actividades</strong><small>CSV generado a partir del Plan de Acción ${state.year}</small></span><span class="pa-tr-file-download">${trIcon('download')}</span></button>
      <button type="button" data-pa-tr-geo="municipio" class="pa-tr-file-item" disabled><span class="pa-tr-file-symbol geo">GEO</span><span><strong>Límite municipal de referencia</strong><small>GeoJSON local · origen por verificar</small></span><span class="pa-tr-file-download">${trIcon('download')}</span></button>
      <button type="button" data-pa-tr-geo="veredas" class="pa-tr-file-item" disabled><span class="pa-tr-file-symbol geo">GEO</span><span><strong>Veredas · referencia local</strong><small>GeoJSON local · origen por verificar</small></span><span class="pa-tr-file-download">${trIcon('download')}</span></button>
      <div class="pa-tr-file-item unavailable"><span class="pa-tr-file-symbol pdf">PDF</span><span><strong>Mapa de intervenciones (PDF)</strong><small>No se recibió un archivo geográfico de obras por meta</small></span><span>—</span></div>
    </div><p class="pa-tr-fineprint">Archivos cartográficos oficiales disponibles según la conectividad del servicio. No se generan shapefiles ni puntos de obra inexistentes.</p><p class="pa-tr-geo-sources">Fuentes: ${link} · <a href="https://visualizador.ideam.gov.co/gisserver/rest/services/Entidades_Territoriales/FeatureServer/5" target="_blank" rel="noopener noreferrer">IDEAM · veredas DANE 2024 ↗</a></p>`;
    return trCard('Mapas y datos del territorio',body,'pa-tr-downloads');
  }
  function trDashboard(m){
    return `<div class="pa-tr-dashboard"><div class="pa-tr-upper"><div class="pa-tr-map-col">${trMapPanel(m)}</div><div class="pa-tr-data-col">${trCoverageStats(m)}${trDetailTable(m)}</div></div><div class="pa-tr-lower">${trGallery(m)}${trCoverageDonut(m)}${trDownloads(m)}</div><p class="pa-tr-source"><strong>Fuente de actividades y ubicaciones:</strong> ${html(currentYear()?.source||'Excel del Plan de Acción')} · ${state.year==='2026'?'Corte: segundo trimestre de 2026.':'Vigencia 2025.'} La información geográfica oficial sirve como referencia municipal y veredal; no demuestra coordenadas exactas de intervenciones. Las cifras del ejemplo visual no se trasladaron al tablero.</p></div>`;
  }
  function trResults(){
    if(state.loading)return tabMarkup(null)+'<div class="pa-empty"><h2>Cargando Territorio…</h2></div>';
    if(state.error)return tabMarkup(null)+`<div class="pa-empty"><h2>No fue posible cargar la información territorial</h2><p>${html(state.error)}</p><button type="button" data-pa-reload>Reintentar</button></div>`;
    if(state.list)return listMarkup();
    if(!currentYear())return tabMarkup(null)+`<div class="pa-empty" role="status"><h2>Información territorial no disponible para ${state.year}</h2><p>El encabezado, el año y las pestañas siguen disponibles. No se han aportado registros territoriales para ${state.year}.</p></div>`;
    const m=selected();if(!m)return tabMarkup(null)+unavailableMarkup();
    return igMetaHeader(m,infoRecord())+tabMarkup(m)+trDashboard(m);
  }
  /* One documented evidence model for all five instances of the same map. */
  function territorialBundle(m=selected()){
    return window.TITerritoryEvidence?.compile(m,{year:state.year,
      extra:state.territoryExtra,source:currentYear()?.source||'Plan de Acción'})||null;
  }
  function updateMapEvidenceNotes(bundle){
    const contexts={summary:'interventions',general:'coverage',physical:'physical',beneficiaries:'beneficiaries'};
    for(const [context,kind] of Object.entries(contexts)){
      const note=panel.querySelector('[data-pa-map-audit="'+context+'"]');
      if(!note)continue;
      const layer=bundle?.themes?.[kind];
      note.textContent=layer?.placeCount?
        layer.placeCount+' zonas con mención territorial en '+layer.activityCount+
        ' actividades. Sin coordenadas puntuales ni cifras desagregadas por vereda.':
        'Información geográfica faltante: sin veredas identificables en esta capa.';
      note.classList.toggle('pa-map-data-missing',!layer?.placeCount);
      note.title=(window.TITerritoryEvidence?.describe(bundle,[kind])||'')+' '+
        (window.TITerritoryEvidence?.missing(bundle)||'');
    }
  }
  function attachThematicCards(){
    const engine=window.TISubachoqueMap;if(!engine||!selected()||!currentYear())return;
    const bundle=territorialBundle();
    const contexts={summary:'interventions',general:'coverage',physical:'physical',beneficiaries:'beneficiaries'};
    updateMapEvidenceNotes(bundle);
    for(const node of panel.querySelectorAll('[data-ti-map]')){
      if(node.dataset.tiMapManual==='1')continue;
      const api=engine.getInstance(node),kind=contexts[node.dataset.tiMap];
      if(api&&kind)api.setDocumentaryData(bundle,[kind]);
    }
  }
  function updateMainThematicNotes(bundle=territorialBundle()){
    const active=[...state.territoryThemeActive];
    const status=panel.querySelector('#pa-tr-theme-status'),quality=panel.querySelector('#pa-tr-theme-quality');
    if(status)status.textContent=window.TITerritoryEvidence?.describe(bundle,active)||'Sin información temática.';
    if(quality)quality.textContent=window.TITerritoryEvidence?.missing(bundle)||'Datos pendientes.';
    panel.querySelectorAll('[data-pa-tr-theme]').forEach(input=>{
      const layer=bundle?.themes?.[input.dataset.paTrTheme];
      input.checked=state.territoryThemeActive.has(input.dataset.paTrTheme);
      input.closest('label')?.classList.toggle('pa-tr-theme-unavailable',!layer?.placeCount);
      input.title=layer?.placeCount?layer.placeCount+' zonas citadas, sin puntos exactos':
        'Sin veredas identificables en los registros';
    });
  }
  /* Adaptador cartográfico de la pestaña Territorio. No contiene datos puntuales de obras. */
  let trMap=null,trMapLayers=null,trGeoData={municipio:null,veredas:null},trInitSequence=0;
  function trUnmountMap(){
    trInitSequence++;
    if(trMap){try{trMap.destroy();}catch(e){}trMap=null;}
    trMapLayers=null;
  }
  function trUpdateStatus(message){const el=panel.querySelector('#pa-tr-map-status');if(el)el.textContent=message;}
  function trMatchedPlace(feature,m){
    const val=window.TISubachoqueMap?.featureName(feature)||'';
    const original=trSlug(val);if(!original)return null;
    return trPlaceData(m).places.find(p=>p.type==='vereda'&&
      (p.key===original||p.key.replace(/^el /,'')===original.replace(/^el /,'')||
       trWordMatch(p.key,original)||trWordMatch(original,p.key)))||null;
  }
  function trShowFallback(message){
    const host=panel.querySelector('#pa-tr-map-fallback');if(!host)return;
    host.innerHTML='<strong>Cartografía no disponible</strong><p>'+html(message)+'</p>';
    host.classList.add('pa-tr-show-fallback');
    trUpdateStatus('Mapa temporalmente no disponible: revisa la conectividad');
  }
  async function trInitMap(){
    const host=panel.querySelector('#pa-tr-map');
    if(!host||state.activeTab!=='territory'||!currentYear()||state.list)return;
    const seq=++trInitSequence;
    try{
      const engine=window.TISubachoqueMap;
      if(!engine)throw Error('No se encontró el motor cartográfico compartido');
      const instance=await engine.mount(host,{onSelect:(label,feature)=>{
        const m=selected(),place=m?trMatchedPlace(feature,m):null;
        if(place)trSelectPlace(place.key,false);
      }});
      if(!instance)return;
      if(seq!==trInitSequence||!host.isConnected){instance.destroy();return;}
      trMap=instance;trMapLayers={municipio:true,veredas:true};
      instance.setDocumentaryData(territorialBundle(),[...state.territoryThemeActive]);
      updateMainThematicNotes();
      const geos=await Promise.all([engine.getGeo('municipio'),engine.getGeo('veredas')]);
      if(seq!==trInitSequence)return;
      trGeoData={municipio:geos[0],veredas:geos[1]};
      trEnableDownload('municipio');trEnableDownload('veredas');
      panel.querySelector('#pa-tr-map-fallback')?.remove();
      trUpdateStatus('17 veredas vectoriales · WGS84 · precisión geográfica del archivo por verificar');
      requestAnimationFrame(()=>instance.invalidateSize());
    }catch(err){if(seq!==trInitSequence)return;trShowFallback(err?.message||'No fue posible iniciar el visor');}
  }
  function trEnableDownload(kind){
    const button=panel.querySelector('[data-pa-tr-geo="'+kind+'"]');
    if(button)button.disabled=false;
  }
  function trSelectPlace(key,withScroll){
    state.territorySelected=key;
    panel.querySelectorAll('[data-pa-tr-place]').forEach(button=>{const selected=button.dataset.paTrPlace===key;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));});
    const popupPlace=trPlaceData(selected()).places.find(p=>p.key===key);
    let info=panel.querySelector('.pa-tr-selected-info');
    if(!info){info=document.createElement('div');info.className='pa-tr-selected-info';panel.querySelector('.pa-tr-places')?.appendChild(info);}
    if(info&&popupPlace)info.innerHTML=`<strong>${html(popupPlace.label)}</strong><span>${popupPlace.activities.map(a=>`<button type="button" data-pa-tr-act-detail="${html(a.n)}">Actividad ${html(a.n)} ↗</button>`).join(' · ')} · mención territorial, no punto exacto de obra.</span>`;
    if(trMap&&popupPlace)trMap.focus(popupPlace.label,true);
    if(withScroll)panel.querySelector('.pa-tr-primary-map')?.scrollIntoView({behavior:'smooth',block:'center'});
  }
  function trChangeBasemap(){trMap?.toggleLayerPanel();}
  function trToggleLayer(kind,enabled){trMap?.toggle(kind,enabled);}
  function trDownload(name,text,mime){const blob=new Blob([text],{type:mime});const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=name;document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);}
  function trExportCsv(){
    const m=selected();if(!m)return;
    const header=['Año','Meta','Actividad','Descripción de actividad','Ubicación original declarada','Avance reportado','Unidad','Soporte (URL)','Fuente'];
    const entries=(m.activities||[]).map(a=>[state.year,m.id,a.n,a.name,trRaw(a,m),a.progress??'',a.unit||'',a.evidence||'',currentYear()?.source||'']);
    const csv=[header,...entries].map(row=>row.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(';')).join('\r\n');
    trDownload(`Territorio_Inteligente_Meta_${m.id}_${state.year}.csv`,'\ufeff'+csv,'text/csv;charset=utf-8');
  }
  function trDownloadGeo(kind){
    const data=trGeoData[kind];if(!data)return;
    const provenance='GeoJSON original de subachoque-platform; procedencia cartográfica oficial no verificada';
    const exported={...data,metadata:{fuente:provenance,municipio:'Subachoque',codigo_Divipola:'25769',nota:'Geometría administrativa, no georreferenciación de actividades del Plan de Acción'}};
    trDownload('subachoque_'+(kind==='municipio'?'limite_referencia':'veredas_referencia')+'.geojson',JSON.stringify(exported),'application/geo+json');
  }
  async function trLoadFullTexts(){
    if(state.territoryExtraLoaded||state.territoryExtraLoading)return;
    state.territoryExtraLoading=true;
    try{
      const r=await fetch('/data/plan-accion-territorio-completo.b64.txt',{cache:'no-cache'});
      if(!r.ok)throw Error('Catálogo territorial '+r.status);
      const b64=(await r.text()).trim(),binary=atob(b64),buf=new Uint8Array(binary.length);
      for(let i=0;i<binary.length;i++)buf[i]=binary.charCodeAt(i);
      const content=await new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
      const v=JSON.parse(content);
      if(!v?.periods?.['2025']||!v?.periods?.['2026'])throw Error('Catálogo territorial incompleto');
      state.territoryExtra=v;state.territoryExtraLoaded=true;
      if(['summary','general','physical','beneficiaries','territory'].includes(state.activeTab)&&currentYear()){
        const y=window.scrollY;refresh();window.scrollTo({top:y});
      }
    }catch(err){console.warn('Texto territorial original:',err);state.territoryExtraLoaded=true;}
    finally{state.territoryExtraLoading=false;}
  }

  /* Octava pestaña: catálogo documental enlazado en los Excel de 2025/2026.
     Sin fotos ni contadores inventados. Las carpetas no inspeccionadas no se
     hacen pasar por archivos y las fechas de Drive se etiquetan como modificación. */
  const suYears=[2024,2025,2026,2027];
  const suSvg={
    grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    filter:'<path d="M4 4h16l-6.5 8v7l-3 2v-9z"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v.2"/>',
    link:'<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    folder:'<path d="M3 6h7l2 2h9v12H3z"/>',
    photo:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="1.5"/><path d="m4 18 5-5 3 2 4-5 5 7"/>',
    document:'<path d="M6 2h9l4 4v16H6zM15 2v5h4M9 12h7M9 16h7"/>',
    video:'<rect x="2" y="4" width="20" height="16" rx="3"/><path d="m10 8 6 4-6 4z"/>',
    certificate:'<path d="M7 2h10v12H7zM9 6h6M9 10h6M9 14v8l3-2 3 2v-8"/>',
    open:'<path d="M14 4h6v6M20 4l-9 9M20 13v7H4V4h7"/>',
    close:'<path d="M4 4l16 16M20 4 4 20"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>',
    clear:'<path d="M5 5l14 14M19 5 5 19"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="1"/><path d="M7 2v6M17 2v6M3 10h18"/>',
    file:'<path d="M6 2h9l4 4v16H6zM15 2v5h4M9 12h7M9 16h7"/>',
    sort:'<path d="M5 5h14M7 10h10M9 15h6"/>'
  };
  const suIcon=k=>`<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${suSvg[k]||suSvg.file}</svg>`;
  const suKey=()=>`${state.year}:${state.current}`;
  function suFolderId(url){return String(url||'').match(/drive\.google\.com\/drive\/(?:u\/\d+\/)?folders\/([\w-]+)/)?.[1]||null;}
  function suFileId(url){return String(url||'').match(/(?:\/file\/d\/|\/document\/d\/|\/spreadsheets\/d\/|\/presentation\/d\/)([\w-]+)/)?.[1]||null;}
  const suFileUrl=f=>{
    const id=String(f.id||'');
    if(safeLink(f.url))return safeLink(f.url);
    if(!/^[A-Za-z0-9_-]{15,}$/.test(id))return null;
    if(f.mime?.includes('wordprocessingml'))return 'https://drive.google.com/file/d/'+id+'/view';
    return 'https://drive.google.com/file/d/'+id+'/view';
  };
  const suValidDate=v=>/^\d{4}-\d\d-\d\d/.test(String(v||''))?String(v).slice(0,10):'';
  const suDateFormat=v=>{const d=suValidDate(v);if(!d)return 'Fecha no registrada';return d.slice(8,10)+'/'+d.slice(5,7)+'/'+d.slice(0,4);};
  const suSizeFormat=size=>{const n=Number(size);return !Number.isFinite(n)||n<=0?'Tamaño no disponible':n>=1048576?fmtNum.format(n/1048576)+' MB':Math.round(n/1024)+' KB';};
  function suType(file){
    const mime=String(file.mime||'').toLowerCase(),title=String(file.title||'').toLowerCase();
    if(file.kind==='folder')return String(file.key||'').startsWith('link:')?'link':'folder';
    if(/^image\//.test(mime)||/\.(png|jpe?g|webp|gif)$/i.test(title))return 'photo';
    if(/^video\//.test(mime)||/\.(mp4|webm|mov)$/i.test(title))return 'video';
    if(/(actas?|certificad[oa]s?|constancias?)/i.test(title))return 'certificate';
    return 'document';
  }
  function suExtras(m){return state.supportExtra?.periods?.[state.year]?.[String(m.id)]||{};}
  function suBuild(m){
    const metaExtras=suExtras(m),verifiedFolders=state.supportVerified?.folders||{};
    const repoMap=new Map(),fileMap=new Map();
    for(const a of m.activities||[]){
      const extra=metaExtras[String(a.n)]||{},url=safeLink(a.evidence)||safeLink(extra.url);
      if(!url)continue;
      const folderId=suFolderId(url),fileId=suFileId(url);
      const base={acts:[String(a.n)],actNames:[String(a.name||'')],territories:[String(extra.territory||a.territory||'')],expected:[String(extra.expected||'')]};
      if(folderId){
        const k='folder:'+folderId;
        if(repoMap.has(k)){
          const v=repoMap.get(k);v.acts.push(...base.acts);v.actNames.push(...base.actNames);v.territories.push(...base.territories);v.expected.push(...base.expected);
        }else repoMap.set(k,{key:k,kind:'folder',id:folderId,title:'Repositorio de la actividad '+a.n,url,verified:false,complete:!!verifiedFolders[folderId]?.complete,...base});
      }else if(fileId){
        const k='file:'+fileId;
        if(fileMap.has(k)){
          const v=fileMap.get(k);v.acts.push(...base.acts);v.actNames.push(...base.actNames);v.territories.push(...base.territories);v.expected.push(...base.expected);
        }else{
          const known=state.supportVerified?.direct?.[fileId]||{};
          fileMap.set(k,{key:k,id:fileId,kind:'file',mime:known.mime||'application/vnd.google-apps.document',title:known.title||'Documento enlazado · actividad '+a.n,url:safeLink(known.url)||url,size:known.size||null,modified:suValidDate(known.modified),verified:!!known.title,complete:!!known.title,...base});
        }
      }else{
        const k='link:'+url;
        if(!repoMap.has(k))repoMap.set(k,{key:k,kind:'folder',id:null,title:'Enlace externo · actividad '+a.n,url,verified:false,complete:false,...base});
      }
    }
    for(const repo of repoMap.values()){
      const folder=verifiedFolders[repo.id]||{};
      if(folder.title)repo.title=folder.title;
      if(folder.status==='unverified')repo.accessNote='No se pudo consultar el contenido del repositorio';
      if(!folder.complete||!Array.isArray(folder.files))continue;
      repo.complete=true;
      for(const f of folder.files){
        if(!f.id||!f.title)continue;
        const k='file:'+f.id;
        const existing=fileMap.get(k);
        if(existing){existing.acts.push(...repo.acts);existing.territories.push(...repo.territories);existing.expected.push(...repo.expected);continue;}
        const file={key:k,kind:'file',id:f.id,title:String(f.title),mime:String(f.mime||''),url:suFileUrl(f),size:f.size||null,modified:suValidDate(f.modified),created:suValidDate(f.created),verified:true,complete:true,sourceFolder:repo.id,acts:[...repo.acts],actNames:[...repo.actNames],territories:[...repo.territories],expected:[...repo.expected]};
        fileMap.set(k,file);
      }
    }
    const files=[...fileMap.values()],repos=[...repoMap.values()];
    for(const item of [...files,...repos]){
      item.acts=[...new Set(item.acts)];item.type=suType(item);
      item.search=[item.title,...item.actNames,...item.acts,...item.territories,...item.expected].map(normalizeQuery).join(' ');
    }
    const unknownRepos=repos.filter(x=>!x.complete).length;
    const types={photo:0,document:0,certificate:0,video:0};
    for(const f of files){if(types[f.type]!==undefined)types[f.type]++;}
    return {files,repos,entries:[...files,...repos],types,unknownRepos};
  }
  function suPlaceOptions(m){
    const t=trPlaceData(m);return [...t.places].map(p=>({name:p.label,acts:p.activities.map(a=>String(a.n)),key:p.key}));
  }
  function suSelectedItems(m){
    const f=state.supportFilters||{},catalog=suBuild(m),places=suPlaceOptions(m);
    return catalog.entries.filter(item=>{
      if(f.activity!=='all'&&!item.acts.includes(f.activity))return false;
      if(f.type!=='all'&&item.type!==f.type)return false;
      if(f.place!=='all'){
        const p=places.find(p=>p.key===f.place);
        if(!p||!item.acts.some(a=>p.acts.includes(a)))return false;
      }
      if(f.from&&!item.modified)return false;
      if(f.from&&item.modified<f.from)return false;
      if(f.to&&!item.modified)return false;
      if(f.to&&item.modified>f.to)return false;
      if(f.q&&!item.search.includes(normalizeQuery(f.q)))return false;
      return true;
    });
  }
  function suHero(){
    return `<header class="pa-ig-hero pa-act-hero pa-su-hero"><div class="pa-ig-hero-main"><nav class="pa-act-breadcrumb" aria-label="Ruta del módulo"><span>Inicio</span><span>Metas</span><span>Meta ${state.current}</span><strong>Soportes</strong></nav><h1>Soportes de la Meta</h1><p>Consulta las evidencias, documentos y soportes que respaldan la ejecución de las actividades.</p></div><div class="pa-ig-hero-actions"><div class="pa-ig-quote">“La transparencia<br>también construye<br>desarrollo”</div><label class="pa-ig-select-year">Año de seguimiento<select id="pa-su-year-select" aria-label="Año de seguimiento">${suYears.map(y=>`<option value="${y}" ${String(y)===state.year?'selected':''}>${y}</option>`).join('')}</select></label></div></header>`;
  }
  function suSummary(m){
    const cat=suBuild(m),len=cat.files.length;
    const suffix=cat.unknownRepos?'identificados · hay carpetas sin enumerar':'individuales identificados';
    const values=[['folder','Total de soportes',len||(!cat.unknownRepos?'0':'—'),'Archivos '+suffix],['photo','Fotografías',cat.types.photo||(cat.unknownRepos?'—':'0'),cat.unknownRepos?'Archivos no clasificados en otras carpetas':'Imágenes identificadas'],['document','Documentos',cat.types.document||(cat.unknownRepos?'—':'0'),'Archivos documentales'],['video','Videos',cat.types.video||(cat.unknownRepos?'—':'0'),'Videos identificados'],['certificate','Actas / Certificaciones',cat.types.certificate||(cat.unknownRepos?'—':'0'),'Sin duplicar documentos']];
    return `<div class="pa-su-summary" aria-label="Indicadores de soportes">${values.map(([icon,title,value,sub])=>`<article class="pa-su-stat pa-su-stat-${icon}"><span class="pa-su-stat-icon">${suIcon(icon)}</span><div><h3>${html(title)}</h3><strong>${html(value)}</strong><small>${html(sub)}</small></div></article>`).join('')}</div><p class="pa-su-accuracy-note">${cat.repos.length} ${cat.repos.length===1?'repositorio enlazado':'repositorios enlazados'} en el Excel para esta meta. ${cat.unknownRepos?'El contenido de '+cat.unknownRepos+' no se ha podido enumerar; los contadores de archivos son parciales.':'Los archivos identificados se muestran sin duplicar enlaces compartidos.'}</p>`;
  }
  function suFilterBar(m){
   const opts=(arr,value)=>arr.map(([v,t])=>`<option value="${html(v)}"${v===value?' selected':''}>${html(t)}</option>`).join('');
   const f=state.supportFilters,locs=suPlaceOptions(m);
   const actOpts=[['all','Todas'],...(m.activities||[]).map(a=>[String(a.n),a.n+' · '+String(a.name).slice(0,53)])];
   const typeOpts=[
    ['all','Todos','grid'],
    ['photo','Fotografías','photo'],
    ['document','Documentos','document'],
    ['video','Videos','video'],
    ['certificate','Actas / Certificaciones','certificate'],
    ['folder','Carpetas','folder'],
    ['link','Enlaces','link']
   ];
   const visualTypes=typeOpts.map(([key,label,icon])=>{
    const active=f.type===key;
    return `<button class="pa-su-type-card ${active?'selected':''} type-${key}" type="button" data-pa-su-type="${html(key)}" aria-pressed="${active}" title="Mostrar ${html(label.toLowerCase())}">${suIcon(icon)}<span>${html(label)}</span>${active?'<span class="pa-su-type-check" aria-hidden="true">✓</span>':''}</button>`;
   }).join('');
   const header=`<div class="pa-su-filter-header"><span class="pa-su-filter-header-icon">${suIcon('filter')}</span><div><h3>Filtrar soportes</h3><p>Encuentre y explore los soportes de la meta aplicando los filtros disponibles.</p></div></div>`;
   const top=`<div class="pa-su-filter-top"><label class="pa-su-filter-field"><span>Actividad</span><select id="pa-su-filter-activity" aria-label="Filtrar por actividad">${opts(actOpts,f.activity)}</select></label><div class="pa-su-type-container"><div class="pa-su-type-label">Tipo de soporte <span title="Puedes seleccionar una categoría a la vez; se combina con los demás filtros." aria-label="Una categoría a la vez; combinable con los otros filtros">${suIcon('info')}</span></div><div class="pa-su-type-grid" role="group" aria-label="Filtrar por tipo de soporte">${visualTypes}</div></div></div>`;
   const bottom=`<div class="pa-su-filter-bottom"><label class="pa-su-filter-field"><span>Vereda / Barrio</span><select id="pa-su-filter-place" aria-label="Filtrar por vereda o barrio">${opts([['all','Todos'],...locs.map(x=>[x.key,x.name])],f.place)}</select></label><label class="pa-su-filter-field"><span>Fecha desde</span><input id="pa-su-from" type="date" value="${html(f.from)}" aria-label="Fecha inicial de modificación"></label><label class="pa-su-filter-field"><span>Fecha hasta</span><input id="pa-su-to" type="date" value="${html(f.to)}" aria-label="Fecha final de modificación"></label><label class="pa-su-searchbox"><span aria-hidden="true">${suIcon('search')}</span><input id="pa-su-search" type="search" value="${html(f.q)}" placeholder="Buscar por palabra clave..." autocomplete="off" aria-label="Buscar soportes por palabra clave"></label><button type="button" class="pa-su-search-action" data-pa-su-search>${suIcon('search')}<span>Buscar</span></button><button type="button" class="pa-su-reset" data-pa-su-reset>${suIcon('clear')}<span>Limpiar</span></button></div>`;
   const note=`<div class="pa-su-filter-help" role="note">${suIcon('info')}<span>Los filtros se aplican sobre los soportes de la meta. Puedes combinar actividad, tipo, ubicación, fechas y palabras clave.<small>Las fechas corresponden a última modificación verificada en Drive, no a la ejecución; los enlaces sin fecha se excluyen si seleccionas un rango.</small></span></div>`;
   return `<section class="pa-su-filter-panel">${header}<div class="pa-su-filter-controls">${top}${bottom}</div>${note}</section>`;
  }
  function suFileBadge(item){
    const type=item.type;
    const types={photo:'Fotografía',document:'Documento',video:'Video',certificate:'Acta / Certificación',folder:'Carpeta',link:'Enlace'};
    return `<span class="pa-su-badge ${type}">${suIcon(type==='certificate'?'certificate':type)}${html(types[type]||'Archivo')}</span>`;
  }
  function suFileCard(item){
    const kind=item.type,info=item.acts.length>1?'Actividades '+item.acts.join(', '):'Actividad '+(item.acts[0]||'—');
    const heading=html(item.title||'Archivo sin título');
    const visual=kind==='photo'&&item.id?`<img loading="lazy" referrerpolicy="no-referrer" src="https://drive.google.com/thumbnail?id=${encodeURIComponent(item.id)}&sz=w640" alt="Miniatura del archivo ${heading}">`:`<span class="pa-su-file-pict ${kind}">${suIcon(kind==='folder'?'folder':kind==='certificate'?'certificate':kind)}</span>`;
    const date=item.modified?`Última modificación: ${suDateFormat(item.modified)}`:(item.type==='folder'?(item.complete?'Repositorio consultado':'Contenido del repositorio sin enumerar'):item.type==='link'?'Enlace registrado sin fecha':'Fecha no registrada');
    const footer=item.verified?`${suSizeFormat(item.size)} · archivo identificado`:(item.type==='folder'?(item.complete?'Carpeta consultada':'Repositorio enlazado; acceso por verificar'):item.type==='link'?'Enlace externo · acceso por verificar':'Archivo individual enlazado');
    return `<article class="pa-su-file-card ${kind}" data-su-file="${html(item.key)}"><div class="pa-su-file-preview">${visual}${suFileBadge(item)}</div><div class="pa-su-file-body"><strong title="${heading}">${heading}</strong><small title="${html(info)}">${html(info)}</small><div class="pa-su-file-meta"><span>${html(date)}</span><button type="button" data-pa-su-preview="${html(item.key)}" aria-label="Consultar soporte ${heading}" title="Consultar soporte">${suIcon('open')}</button></div><p class="pa-su-file-origin">${html(footer)}</p></div></article>`;
  }
  function suGallery(m){
    const rows=suSelectedItems(m),total=suBuild(m),f=state.supportFilters;
    const cards=rows.slice(0,state.supportShowAll?999:24);
    const text=rows.length?`${rows.length} entradas encontradas (${rows.filter(x=>x.kind==='file').length} archivos individuales, ${rows.filter(x=>x.type==='folder').length} carpetas y ${rows.filter(x=>x.type==='link').length} enlaces externos).`:'No se encontraron soportes con los filtros seleccionados.';
    return `<section class="pa-su-gallery"><div class="pa-su-section-head"><h3>Galería de Soportes</h3><span>${html(text)}</span></div>${rows.length?`<div class="pa-su-gallery-grid">${cards.map(suFileCard).join('')}</div>`:`<div class="pa-su-empty"><span>${suIcon('folder')}</span><strong>${html(text)}</strong><small>${total.repos.length?'Prueba con otro filtro o consulta el árbol de carpetas.':'No se encontraron enlaces de soporte registrados para esta meta en el Excel.'}</small></div>`}${rows.length>24&&!state.supportShowAll?`<button type="button" class="pa-su-show-all" data-pa-su-gallery-all>Mostrar todas las ${rows.length} entradas →</button>`:''}</section>`;
  }
  function suTree(m){
    const cat=suBuild(m),f=state.supportFilters;
    const branches=(m.activities||[]).map((a,i)=>{
      const id=String(a.n),items=cat.entries.filter(x=>x.acts.includes(id));const actual=items.filter(x=>x.kind==='file').length;
      const expanded=state.supportTreeOpen.has(id);
      const header=`<div class="pa-su-tree-row ${f.activity===id?'selected':''}"><button type="button" data-pa-su-tree-toggle="${html(id)}" aria-expanded="${expanded}" aria-label="${expanded?'Contraer':'Expandir'} actividad ${html(id)}">${expanded?'⌄':'›'}</button><button type="button" data-pa-su-tree-activity="${html(id)}" aria-pressed="${f.activity===id}">${suIcon('folder')}<span>${html('Actividad '+id+' - '+String(a.name).slice(0,38))}${actual?` (${actual})`:''}</span></button></div>`;
      const children=expanded?`<div class="pa-su-tree-children">${items.length?items.map(x=>`<button type="button" data-pa-su-preview="${html(x.key)}">${suIcon(x.type==='link'?'link':x.kind==='folder'?'folder':x.type)}<span>${html(x.title)}</span></button>`).join(''):'<small>Sin enlace documental en esta actividad.</small>'}</div>`:'';
      return `<div class="pa-su-tree-branch">${header}${children}</div>`;
    }).join('');
    const all=f.activity==='all';
    return `<section class="pa-su-sidecard pa-su-folders"><h3>Estructura de carpetas</h3><div class="pa-su-tree"><div class="pa-su-tree-root"><button type="button" data-pa-su-tree-root class="${all?'selected':''}" aria-pressed="${all}">${suIcon('folder')}<span>Meta ${m.id} · ${html(String(m.name).slice(0,45))}</span></button></div>${branches}<p class="pa-su-tree-note">Organización virtual por meta y actividad. Los enlaces conducen a los repositorios originales; no se crean carpetas nuevas.</p></div></section>`;
  }
  function suRecent(m){
    const cat=suBuild(m),items=cat.files.filter(f=>!!f.modified).sort((a,b)=>b.modified.localeCompare(a.modified));
    const rows=(state.supportRecentAll?items:items.slice(0,5));
    const extra=items.length>5?`<button type="button" data-pa-su-recent-toggle>${state.supportRecentAll?'Ver menos':'Ver todos →'}</button>`:'';
    return `<section class="pa-su-sidecard pa-su-recent"><div class="pa-su-side-head"><h3>Últimos soportes cargados</h3>${extra}</div>${items.length?`<p class="pa-su-recent-explainer">Ordenados por última modificación verificada en Drive.</p><div class="pa-su-recent-list">${rows.map(f=>`<button class="pa-su-recent-row" type="button" data-pa-su-preview="${html(f.key)}"><span class="pa-su-recent-icon ${f.type}">${suIcon(f.type)}</span><span><strong>${html(f.title)}</strong><small>${html(suSizeFormat(f.size))} · ${html('Actividad '+f.acts.join(', '))}</small></span><time datetime="${html(f.modified)}">${html(suDateFormat(f.modified))}</time></button>`).join('')}</div>`:`<div class="pa-su-recent-empty">No hay fechas de modificación verificables para ordenar los soportes de esta meta. Puedes abrir los repositorios desde la galería o el árbol de carpetas.</div>`}</section>`;
  }
  function suPreviewDialog(){return `<dialog class="pa-su-dialog" id="pa-su-dialog" aria-labelledby="pa-su-preview-title"><div class="pa-su-dialog-title"><div><small>Repositorio documental · ${state.year}</small><h2 id="pa-su-preview-title">Soporte de la Meta</h2></div><button type="button" data-pa-su-close aria-label="Cerrar visor">×</button></div><div id="pa-su-dialog-content"></div></dialog>`;}
  function suDashboard(m){
    const loading=state.supportLoading&&!state.supportExtraLoaded;
    if(loading)return `<div class="pa-su-loading" role="status">Cargando descripciones y enlaces del Excel…</div>`;
    return `<div class="pa-su-dashboard"><div class="pa-su-main-grid"><div class="pa-su-main-col">${suFilterBar(m)}${suGallery(m)}</div><aside class="pa-su-sidebar">${suTree(m)}${suRecent(m)}</aside></div><p class="pa-su-source"><strong>Fuentes:</strong> Plan de Acción ${state.year} · campos «Soporte de Cumplimiento Actividad» y «Link de soportes de la actividad». ${state.year==='2026'?'Corte: segundo trimestre de 2026.':''} Solo se muestran documentos individualizados cuando se obtuvo su metadato del repositorio. El contenido de las carpetas sin inspeccionar no se contabiliza como archivo.</p>${suPreviewDialog()}</div>`;
  }
  function suResults(){
    if(state.loading)return tabMarkup(null)+'<div class="pa-empty"><h2>Cargando Soportes…</h2></div>';
    if(state.error)return tabMarkup(null)+`<div class="pa-empty"><h2>No se pudieron cargar los datos</h2><p>${html(state.error)}</p></div>`;
    if(state.list)return listMarkup();
    if(!currentYear())return tabMarkup(null)+`<div class="pa-empty" role="status"><h2>Información de soportes no disponible para ${state.year}</h2><p>El encabezado, el selector y las pestañas se conservan. Se dispone de información documental de 2025 y 2026.</p></div>`;
    const m=selected();if(!m)return tabMarkup(null)+unavailableMarkup();
    return igMetaHeader(m,infoRecord())+tabMarkup(m)+suDashboard(m);
  }
  function suRefreshPart(){
    if(state.activeTab!=='supports'||!currentYear()||state.list)return;
    const m=selected();if(!m)return;
    const dashboard=panel.querySelector('.pa-su-dashboard');if(dashboard)dashboard.outerHTML=suDashboard(m);
  }
  function suResetFilters(){state.supportFilters={activity:'all',type:'all',place:'all',from:'',to:'',q:''};state.supportTreeOpen=new Set();state.supportRecentAll=false;state.supportShowAll=false;}
  async function suLoadCatalog(){
    if(state.supportLoading||state.supportExtraLoaded)return;
    state.supportLoading=true;
    try{
      const [extraRes,verifiedRes]=await Promise.all([fetch('/data/plan-accion-soportes-extra.b64.txt',{cache:'no-cache'}),fetch('/data/plan-accion-soportes-verificados.json',{cache:'no-cache'})]);
      if(!extraRes.ok)throw Error('No se pudo abrir el inventario de soportes ('+extraRes.status+').');
      const b64=(await extraRes.text()).trim(),binary=atob(b64),bytes=new Uint8Array(binary.length);
      for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
      const decoded=await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
      const obj=JSON.parse(decoded);
      if(!obj?.periods?.['2025']||!obj?.periods?.['2026'])throw Error('Faltan los dos periodos de soportes.');
      state.supportExtra=obj;
      if(verifiedRes.ok){const meta=await verifiedRes.json();if(meta?.folders)state.supportVerified=meta;}
      state.supportError=null;
    }catch(error){state.supportError=String(error.message||error);console.warn('Soportes:',error);}
    finally{state.supportLoading=false;state.supportExtraLoaded=true;if(state.activeTab==='supports')refresh();}
  }
  function suOpenPreview(key){
    const m=selected(),item=m?suBuild(m).entries.find(f=>f.key===key):null;
    if(!item)return;
    const dialog=panel.querySelector('#pa-su-dialog'),content=dialog?.querySelector('#pa-su-dialog-content');if(!dialog||!content)return;
    const title=dialog.querySelector('#pa-su-preview-title');if(title)title.textContent=item.title;
    const type=item.type,isImage=type==='photo'&&item.id,isVideo=type==='video';
    const link=safeLink(item.url);
    const photo=isImage?`<img class="pa-su-preview-image" loading="lazy" src="https://drive.google.com/thumbnail?id=${encodeURIComponent(item.id)}&sz=w1600" alt="Vista del archivo ${html(item.title)}">`:'';
    const video=isVideo&&/\.(mp4|webm)(?:\?|$)/i.test(link||'')?`<video controls playsinline src="${html(link)}"></video>`:'';
    content.innerHTML=`<div class="pa-su-preview-art ${type}">${photo||video||suIcon(type==='folder'?'folder':type)}</div><dl class="pa-su-preview-details"><div><dt>Tipo</dt><dd>${html(type==='folder'?'Repositorio de archivos':type==='link'?'Enlace externo':type==='photo'?'Fotografía':type==='video'?'Video':type==='certificate'?'Acta / Certificación':'Documento')}</dd></div><div><dt>Actividad</dt><dd>${html(item.acts.join(', ')||'No indicada')}</dd></div><div><dt>Fecha</dt><dd>${html(suDateFormat(item.modified))}${item.modified?' · última modificación':''}</dd></div><div><dt>Tamaño</dt><dd>${html(item.kind==='file'?suSizeFormat(item.size):item.type==='link'?'No aplica':'No se conoce número de archivos')}</dd></div><div><dt>Verificación</dt><dd>${html(item.type==='link'?'Enlace registrado en Excel; contenido no inspeccionado':item.kind==='folder'?(item.complete?'Contenido enumerado en una consulta de Drive':'Enlace del Excel; contenido no enumerado'):item.verified?'Archivo identificado en Drive':'Archivo individual enlazado en Excel; acceso no comprobado')}</dd></div></dl><div class="pa-su-preview-actions">${link?`<a href="${html(link)}" target="_blank" rel="noopener noreferrer">${suIcon('open')} Abrir ${item.type==='link'?'enlace':item.kind==='folder'?'repositorio':'archivo'} original</a>`:'<span>Enlace no disponible</span>'}</div><p class="pa-su-preview-warning">Si el proveedor solicita iniciar sesión, el acceso depende de los permisos originales. Esta página no modifica ni publica archivos restringidos.</p>`;
    if(typeof dialog.showModal==='function')dialog.showModal();
  }

  /* 3.3 / Observaciones: registros documentales de los dos Excel, sin estados inferidos. */
  const obYears=[2024,2025,2026,2027];
  const obTypes=[['Comentario','#0c72c5'],['Alerta','#ed3746'],['Recomendación','#f8b900'],['Solicitud','#b78a03'],['Avance','#006d89'],['Otro','#8994a4'],['Sin clasificar','#7e899d']];
  const obStatusKeys=[['closed','Cerrada','#008750'],['tracking','En seguimiento','#f5b300'],['pending','Pendiente de atención','#e63848'],['unknown','Estado no registrado','#8b9bb0']];
  const obIcons={
    comment:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 5h16v11H9l-5 4z"/><path stroke-linecap="round" d="M8 11h.1m4 0h.1m4 0h.1"/></svg>',
    check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8"><circle cx="12" cy="12" r="9"/><path stroke-linecap="round" stroke-linejoin="round" d="m7.5 12 3 3 6-6"/></svg>',
    clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><circle cx="12" cy="12" r="9"/><path stroke-linecap="round" d="M12 6v6l4 2"/></svg>',
    alert:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2 2 20h20z"/><path stroke-linecap="round" d="M12 9v5m0 3v.2"/></svg>',
    search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="10.5" cy="10.5" r="6.4"/><path d="m15.3 15.3 5.2 5.2"/></svg>',
    xl:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 2h10l4 4v16H5zM15 2v5h4"/><path d="m8 11 5 7m0-7-5 7M15 11v7"/></svg>',
    pdf:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 2h10l4 4v16H5zM15 2v5h4M8 17v-6h2a2 2 0 0 1 0 4H8m6-4v6h1.2a3 3 0 0 0 0-6H14m5 0h-2v6m0-3h2"/></svg>',
    open:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1"><path d="M13 4h7v7m0-7-10 10M20 14v6H4V4h8"/></svg>',
  };
  function obIcon(name){return obIcons[name]||obIcons.comment;}
  function obList(){return state.obData?.periods?.[state.year]?.[String(state.current)]||[];}
  function obDate(v){if(!v)return 'Fecha no registrada';const d=new Date(v+'T12:00:00');return Number.isNaN(+d)?'Fecha no registrada':d.toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'});}
  function obTitleValue(v){return v==null||String(v).trim()===''?'No registrado':String(v);}
  function obStatus(record){return record.status==='closed'?'closed':record.status==='tracking'?'tracking':record.status==='pending'?'pending':'unknown';}
  function obType(record){return obTypes.find(v=>v[0]===record.type)?.[0]||'Sin clasificar';}
  function obTypeColor(type){return obTypes.find(v=>v[0]===type)?.[1]||'#8492a5';}
  function obReset(){state.obFilters={type:'all',status:'all',issuer:'all',from:'',to:'',q:''};state.obPage=0;state.obSort='source';state.obSortAsc=true;}
  function obFiltered(){
    const f=state.obFilters,needle=normalizeQuery(f.q);
    const rows=obList().filter(x=>{
      if(f.type!=='all'&&obType(x)!==f.type)return false;
      if(f.status!=='all'&&obStatus(x)!==f.status)return false;
      if(f.issuer!=='all'&&(x.issuer||'unknown')!==f.issuer)return false;
      if(f.from&&(!x.date||x.date<f.from))return false;
      if(f.to&&(!x.date||x.date>f.to))return false;
      if(needle){const text=[x.text,x.type,x.status,x.issuer,x.id,...(x.activities||[]),...(x.activityNames||[]),x.response].filter(Boolean).join(' ');if(!normalizeQuery(text).includes(needle))return false;}
      return true;
    });
    const order=state.obSort,dir=state.obSortAsc?1:-1;
    rows.sort((a,b)=>{
      let av=order==='date'?(a.date||''):order==='type'?obType(a):order==='issuer'?(a.issuer||''):order==='status'?obStatus(a):order==='text'?a.text:(a.sourceRows?.[0]||0);
      let bv=order==='date'?(b.date||''):order==='type'?obType(b):order==='issuer'?(b.issuer||''):order==='status'?obStatus(b):order==='text'?b.text:(b.sourceRows?.[0]||0);
      const cmp=typeof av==='number'&&typeof bv==='number'?av-bv:String(av).localeCompare(String(bv),'es');return cmp*dir;
    });
    return rows;
  }
  function obHero(){return `<header class="pa-ig-hero pa-act-hero pa-su-hero pa-ob-hero"><div class="pa-ig-hero-main"><nav class="pa-act-breadcrumb" aria-label="Ruta del módulo"><span>Inicio</span><span>Metas</span><span>Meta ${state.current}</span><strong>Observaciones</strong></nav><h1>Observaciones de la Meta</h1><p>Consulta los comentarios, alertas, recomendaciones y notas de seguimiento realizadas por las dependencias responsables y entes de control.</p></div><div class="pa-ig-hero-actions"><div class="pa-ig-quote">“La mejora continua<br>también construye<br>desarrollo”</div><label class="pa-ig-select-year">Año de seguimiento<select id="pa-ob-year-select" aria-label="Año de seguimiento">${obYears.map(y=>`<option value="${y}"${String(y)===state.year?' selected':''}>${y}</option>`).join('')}</select></label></div></header>`;}
  function obKpi(name,value,subtitle,icon,kind,extra){return `<article class="pa-ob-stat pa-ob-${kind}" title="${html(extra||subtitle)}"><div class="pa-ob-stat-icon">${obIcon(icon)}</div><div><span>${html(name)}</span><strong>${html(value)}</strong><small>${html(subtitle)}</small></div></article>`;}
  function obStats(){const records=obList(),by=Object.fromEntries(obStatusKeys.map(x=>[x[0],records.filter(r=>obStatus(r)===x[0]).length])),known=records.length-by.unknown;
    return `<div class="pa-ob-stats">${obKpi('Total de observaciones',fmtInt.format(records.length),'Registros únicos documentados','comment','total','Registros extraídos del campo de observaciones de cada actividad; textos repetidos agrupados por meta')}${obKpi('Cerradas',known?fmtInt.format(by.closed):'—',known?fmtNum.format(by.closed/known*100)+'% de estados conocidos':'Sin estado de cierre oficial','check','closed')}${obKpi('En seguimiento',known?fmtInt.format(by.tracking):'—',known?fmtNum.format(by.tracking/known*100)+'% de estados conocidos':'Estado no registrado','clock','tracking')}${obKpi('Pendiente de atención',known?fmtInt.format(by.pending):'—',known?fmtNum.format(by.pending/known*100)+'% de estados conocidos':'Estado no registrado','alert','pending')}</div>`;}
  function obSelect(id,name,values,chosen){return `<label for="${id}">${html(name)}<select id="${id}">${values.map(([value,label])=>`<option value="${html(value)}"${value===chosen?' selected':''}>${html(label)}</option>`).join('')}</select></label>`;}
  function obFilters(){
    const f=state.obFilters,types=[['all','Todos'],...obTypes.map(t=>[t[0],t[0]])];
    const status=[['all','Todos'],['closed','Cerrada'],['tracking','En seguimiento'],['pending','Pendiente de atención'],['unknown','Estado no registrado']];
    const issuers=[...new Set(obList().map(x=>x.issuer).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
    const deps=[['all','Todas'],...issuers.map(x=>[x,x])];if(obList().some(x=>!x.issuer))deps.push(['unknown','Emisor no registrado']);
    return `<section class="pa-ob-panel pa-ob-filter"><h3>Filtrar observaciones</h3><div class="pa-ob-filter-fields">${obSelect('pa-ob-type','Tipo de observación',types,f.type)}${obSelect('pa-ob-status','Estado',status,f.status)}${obSelect('pa-ob-issuer','Dependencia emisora',deps,f.issuer)}<label for="pa-ob-from">Fecha desde<input id="pa-ob-from" type="date" value="${html(f.from)}"></label><label for="pa-ob-to">Fecha hasta<input id="pa-ob-to" type="date" min="${html(f.from)}" value="${html(f.to)}"></label></div><div class="pa-ob-search"><span aria-hidden="true">${obIcon('search')}</span><input id="pa-ob-search" placeholder="Buscar por palabra clave..." value="${html(f.q)}" aria-label="Buscar observaciones"><button type="button" data-pa-ob-search aria-label="Buscar">${obIcon('search')}</button></div><button type="button" class="pa-ob-clear" data-pa-ob-clear>Restablecer filtros</button><div class="pa-ob-filter-legend"><h4>Tipos de observación</h4>${obTypes.slice(0,-1).map(([name,color])=>`<span><i style="background:${color}"></i>${html(name)}</span>`).join('')}<span><i style="background:#8190a5"></i>Sin clasificar</span></div></section>`;
  }
  function obTable(){const all=obFiltered(),pages=Math.max(1,Math.ceil(all.length/8));if(state.obPage>=pages)state.obPage=pages-1;
    const start=state.obPage*8,slice=all.slice(start,start+8);
    const rows=slice.map(x=>{const type=obType(x),s=obStatus(x),sname=obStatusKeys.find(k=>k[0]===s)?.[1];return `<tr><td class="pa-ob-date">${html(obDate(x.date))}</td><td><span class="pa-ob-type"><i style="background:${obTypeColor(type)}"></i>${html(type)}</span></td><td class="pa-ob-note" title="${html(x.text)}"><span class="pa-ob-note-preview">${html(x.text)}</span></td><td class="pa-ob-dependency">${html(x.issuer||'Emisor no registrado')}</td><td><span class="pa-ob-state ${s}">${s==='unknown'?'○':s==='closed'?'✓':s==='tracking'?'◷':'!'} ${html(sname)}</span></td><td><button type="button" class="pa-ob-detail-btn" data-pa-ob-detail="${html(x.id)}">Ver detalle</button></td></tr>`}).join('');
    const heads=[['date','Fecha'],['type','Tipo'],['text','Observación'],['issuer','Dependencia'],['status','Estado'],['','Acciones']];
    const countText=all.length?`Mostrando ${start+1} - ${Math.min(start+8,all.length)} de ${all.length} observaciones`:'Mostrando 0 de 0 observaciones';
    const pagination=`<footer class="pa-ob-pagination"><span>${countText}</span><div>${pages>1?`<button type="button" data-pa-ob-page="${state.obPage-1}" ${state.obPage===0?'disabled':''} aria-label="Página anterior">‹</button>`:''}${Array.from({length:pages},(_,i)=>`<button type="button" data-pa-ob-page="${i}" class="${i===state.obPage?'active':''}" aria-label="Página ${i+1}" aria-current="${i===state.obPage?'page':'false'}">${i+1}</button>`).join('')}${pages>1?`<button type="button" data-pa-ob-page="${state.obPage+1}" ${state.obPage+1>=pages?'disabled':''} aria-label="Página siguiente">›</button>`:''}</div></footer>`;
    return `<section class="pa-ob-panel pa-ob-table-panel"><h3>Listado de observaciones</h3><div class="pa-ob-table-scroller"><table class="pa-ob-table"><thead><tr>${heads.map(([k,v])=>`<th>${k?`<button type="button" data-pa-ob-sort="${k}" title="Ordenar por ${html(v)}">${html(v)}${state.obSort===k?(state.obSortAsc?' ↑':' ↓'):''}</button>`:html(v)}</th>`).join('')}</tr></thead><tbody>${rows||'<tr><td colspan="6"><div class="pa-ob-noresults">No se encontraron observaciones con los filtros seleccionados.</div></td></tr>'}</tbody></table></div>${pagination}<p class="pa-ob-method">Fuente: campo original de observaciones de cada actividad. No se asignan fechas, autores, tipos ni estados por inferencia.</p></section>`;
  }
  function obByAgency(){const list=obList(),matched=list.filter(x=>x.issuer),unknown=list.length-matched.length;const agg=new Map();for(const x of matched)agg.set(x.issuer,(agg.get(x.issuer)||0)+1);
    const sorted=[...agg.entries()].sort((a,b)=>b[1]-a[1]),max=Math.max(1,...sorted.map(a=>a[1]));
    const bars=sorted.map(([dep,n],i)=>`<button class="pa-ob-dep-row" type="button" data-pa-ob-dep="${html(dep)}" title="${html(dep)}: ${n} observaciones"><span>${html(dep)}</span><i><b style="width:${100*n/max}%;background:${['#06a258','#167bea','#e9ab11','#e94652','#9743c9'][i%5]}"></b></i><strong>${n}</strong></button>`).join('');
    return `<section class="pa-ob-panel pa-ob-agencies"><h3>Observaciones por dependencia</h3>${bars}${unknown?`<button class="pa-ob-dep-row neutral" type="button" data-pa-ob-dep="unknown" title="No consta la dependencia que emitió estas observaciones"><span>Emisor no registrado</span><i><b style="width:${Math.round(100*unknown/Math.max(unknown,max))}%;background:#8795a9"></b></i><strong>${unknown}</strong></button>`:''}<p class="pa-ob-hint">El campo «Responsable» del Excel corresponde a la actividad, no necesariamente a quien emitió la observación.</p></section>`;
  }
  function obStateDonut(){const list=obList(),n=list.length,counts=Object.fromEntries(obStatusKeys.map(v=>[v[0],list.filter(x=>obStatus(x)===v[0]).length]));
    let pos=0;const stops=obStatusKeys.map(([key,,color])=>{const share=n?counts[key]/n*100:0;const s=`${color} ${pos}% ${pos+share}%`;pos+=share;return s;});
    const gradient=n?`conic-gradient(${stops.join(',')})`:'conic-gradient(#dce5ed 0 100%)';
    return `<section class="pa-ob-panel pa-ob-states"><h3>Estado de las observaciones</h3><div class="pa-ob-states-content"><div class="pa-ob-donut" style="background:${gradient}"><div><strong>${fmtInt.format(n)}</strong><small>Total</small></div></div><div class="pa-ob-state-legend">${obStatusKeys.map(([key,label,color])=>`<button type="button" data-pa-ob-status="${key}" title="Filtrar por ${html(label)}"><i style="background:${color}"></i><span>${html(label)}</span><b>${counts[key]}${n?' ('+fmtNum.format(counts[key]/n*100)+'%)':''}</b></button>`).join('')}</div></div>${n&&!list.some(x=>x.status)?'<p class="pa-ob-hint">No hay estados formales de cierre en los archivos suministrados.</p>':''}</section>`;
  }
  function obExportPanel(){return `<section class="pa-ob-panel pa-ob-export"><h3>Descargar reporte de observaciones</h3><p>Consulta y descarga las observaciones documentadas en formato Excel o PDF.</p><label for="pa-ob-export-scope">Alcance del reporte<select id="pa-ob-export-scope"><option value="filtered">Resultados filtrados</option><option value="all">Todas las observaciones de la meta</option></select></label><div class="pa-ob-export-buttons"><button type="button" data-pa-ob-export="xlsx">${obIcon('xl')} Descargar Excel</button><button type="button" data-pa-ob-export="pdf">${obIcon('pdf')} Descargar PDF</button></div><small>Generado por Territorio Inteligente a partir del Excel original; no es certificación municipal.</small></section>`;}
  function obDetailDialog(){return `<dialog class="pa-ob-dialog" id="pa-ob-dialog" aria-labelledby="pa-ob-dialog-title"><header><div><small>Seguimiento al Plan de Acción · ${state.year}</small><h2 id="pa-ob-dialog-title">Detalle de la observación</h2></div><button type="button" data-pa-ob-close aria-label="Cerrar detalle">×</button></header><div id="pa-ob-dialog-content"></div></dialog>`;}
  function obDashboard(m){return `<div class="pa-ob-dashboard" id="pa-ob-dashboard"><div class="pa-ob-grid"><div class="pa-ob-left-zone">${obStats()}<div class="pa-ob-work-area">${obFilters()}${obTable()}</div></div><div class="pa-ob-right-zone">${obByAgency()}${obStateDonut()}${obExportPanel()}</div></div><div class="pa-ob-dataline">${state.obLoading?'Leyendo observaciones originales…':state.obError?`No fue posible consultar el inventario completo: ${html(state.obError)}`:`Registros de ${state.year} · ${html(state.year==='2026'?'Segundo trimestre':'Vigencia 2025')} · Observaciones sin clasificación oficial preservadas.`}</div>${obDetailDialog()}</div>`;}
  function obResults(){
    if(state.loading)return tabMarkup(null)+'<div class="pa-empty"><h2>Cargando registros…</h2></div>';
    if(state.error)return tabMarkup(null)+`<div class="pa-empty"><h2>Datos no disponibles</h2><p>${html(state.error)}</p></div>`;
    if(state.list)return listMarkup();
    if(!currentYear())return tabMarkup(null)+`<div class="pa-empty" role="status"><h2>Información de observaciones no disponible para ${state.year}</h2><p>La navegación y selección de vigencia se conservan. Los archivos disponibles corresponden a 2025 y al segundo trimestre de 2026.</p></div>`;
    const m=selected();if(!m)return tabMarkup(null)+unavailableMarkup();
    return igMetaHeader(m,infoRecord())+tabMarkup(m)+(state.obLoading?'<div class="pa-ob-loading" role="status">Cargando las observaciones documentadas…</div>':state.obError?`<div class="pa-empty"><h2>No fue posible cargar las observaciones</h2><p>${html(state.obError)}</p><button type="button" data-pa-ob-retry>Reintentar</button></div>`:obDashboard(m));
  }
  function obRefreshPart(preserve=false){
    if(state.activeTab!=='observations'||!currentYear()||state.obLoading||state.obError)return;
    const node=preserve?document.activeElement:null,activeId=node?.id,sel=node?.selectionStart,end=node?.selectionEnd,scroll=window.scrollY;
    const el=panel.querySelector('#pa-ob-dashboard');if(el&&selected())el.outerHTML=obDashboard(selected());
    if(activeId){const input=panel.querySelector('#'+activeId);if(input){input.focus({preventScroll:true});try{input.setSelectionRange(sel,end)}catch{}}}
    window.scrollTo({top:scroll});
  }
  async function obLoad(){
    if(state.obLoading||state.obLoaded)return;
    state.obLoading=true;state.obError=null;
    try{
      const res=await fetch('/data/plan-accion-observaciones-2025-2026.b64.txt',{cache:'no-cache'});
      if(!res.ok)throw Error('Inventario de observaciones: HTTP '+res.status);
      const bin=atob((await res.text()).trim()),bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
      const decoded=await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
      const obj=JSON.parse(decoded);if(!obj?.periods?.['2025']||!obj?.periods?.['2026']||obj.schema!=='ti-plan-observaciones-v1')throw Error('La fuente de observaciones está incompleta.');
      state.obData=obj;state.obLoaded=true;state.obError=null;
    }catch(err){state.obError=String(err?.message||err);console.warn('Observaciones:',err);}
    finally{state.obLoading=false;if(state.activeTab==='observations')refresh();}
  }
  function obOpenDetail(id){const item=obList().find(x=>x.id===id);if(!item)return;const dialog=panel.querySelector('#pa-ob-dialog');if(!dialog)return;
    const field=(label,val)=>`<div><dt>${html(label)}</dt><dd>${html(obTitleValue(val))}</dd></div>`;
    const links=item.supportUrls?.map(url=>safeLink(url)).filter(Boolean)||[];
    const actButtons=(item.activities||[]).map(a=>`<button type="button" data-pa-ob-to-activity="${html(a)}">Actividad ${html(a)} ↗</button>`).join('');
    dialog.querySelector('#pa-ob-dialog-content').innerHTML=`<div class="pa-ob-detail-meta"><span class="pa-ob-pill">${html(obType(item))}</span><span class="pa-ob-pill muted">${html(obStatusKeys.find(x=>x[0]===obStatus(item))?.[1])}</span></div><div class="pa-ob-detail-text">${lineBreaks(item.text)}</div><dl class="pa-ob-detail-list">${field('Identificador',item.id)}${field('Meta',item.meta)}${field('Vigencia',item.year)}${field('Fecha',obDate(item.date))}${field('Dependencia emisora',item.issuer||'No registrada')}${field('Dependencia responsable de actividad',item.responsibles?.join(' / '))}${field('Respuesta institucional',item.response)}${field('Fecha de cierre',item.closedAt)}${field('Archivo de origen',item.sourceFile)}${field('Hoja',item.sourceSheet)}${field('Campo',item.sourceField)}${field('Filas originales',item.sourceRows?.join(', '))}${field('Actividades relacionadas',item.activities?.join(', '))}</dl><div class="pa-ob-detail-links"><h4>Actividades y soportes vinculados</h4>${actButtons}${links.map(url=>`<a href="${html(url)}" target="_blank" rel="noopener noreferrer">${obIcon('open')} Abrir soporte original</a>`).join('')||'<p>No hay enlaces documentales vinculados.</p>'}</div><p class="pa-ob-detail-note">Este registro reproduce una observación del Excel. El tipo, fecha exacta, dependencia emisora y estado de cierre no se completan sin evidencia.</p>`;
    dialog.showModal();
  }
  function obDownloadBlob(name,bytes,mime){const blob=new Blob([bytes],{type:mime}),href=URL.createObjectURL(blob),a=document.createElement('a');a.href=href;a.download=name;a.hidden=true;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(href),30000);}
  function obReportRows(){const scope=panel.querySelector('#pa-ob-export-scope')?.value||'filtered';return scope==='all'?obList():obFiltered();}
  function obColumns(){return ['Vigencia','Número de meta','Nombre de meta','ID observación','Actividades','Fecha','Tipo','Observación completa','Dependencia emisora','Estado','Respuesta','Fecha de cierre','Dependencia responsable de actividad','Fuente Excel','Hoja','Filas fuente','Soportes'];}
  function obRecordsToCells(records){const meta=selected();return records.map(r=>[state.year,String(r.meta),meta?.name||'',r.id,(r.activities||[]).join(', '),r.date||'',r.type||'Sin clasificar',r.text,r.issuer||'',r.status||'Estado no registrado',r.response||'',r.closedAt||'',(r.responsibles||[]).join(' / '),r.sourceFile,r.sourceSheet,(r.sourceRows||[]).join(', '),(r.supportUrls||[]).join('\n')]);}
  function obZip(files){
    const te=new TextEncoder(),parts=[],centers=[];let ofs=0;
    const u16=(dv,o,n)=>dv.setUint16(o,n,true),u32=(dv,o,n)=>dv.setUint32(o,n>>>0,true);
    const crc=bytes=>{let c=0xffffffff;for(const b of bytes){c^=b;for(let i=0;i<8;i++)c=(c&1)?(c>>>1)^0xedb88320:c>>>1;}return(c^0xffffffff)>>>0;};
    for(const [name,content] of Object.entries(files)){
      const n=te.encode(name),d=te.encode(content),hash=crc(d),head=new Uint8Array(30+n.length),v=new DataView(head.buffer);
      u32(v,0,0x04034b50);u16(v,4,20);u16(v,6,0);u16(v,8,0);u32(v,14,hash);u32(v,18,d.length);u32(v,22,d.length);u16(v,26,n.length);head.set(n,30);parts.push(head,d);
      const center=new Uint8Array(46+n.length),c=new DataView(center.buffer);u32(c,0,0x02014b50);u16(c,4,20);u16(c,6,20);u32(c,16,hash);u32(c,20,d.length);u32(c,24,d.length);u16(c,28,n.length);u32(c,42,ofs);center.set(n,46);centers.push(center);ofs+=head.length+d.length;
    }
    const centralLength=centers.reduce((a,b)=>a+b.length,0),end=new Uint8Array(22),e=new DataView(end.buffer);u32(e,0,0x06054b50);u16(e,8,centers.length);u16(e,10,centers.length);u32(e,12,centralLength);u32(e,16,ofs);
    return new Blob([...parts,...centers,end],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
  }
  function obXml(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;').replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g,'');}
  function obXlsx(records){
    const cols=obColumns(),rows=[cols,...obRecordsToCells(records)],cells=rows.map((row,i)=>`<row r="${i+1}">${row.map((value,j)=>{let n=j+1,col='';while(n>0){col=String.fromCharCode(65+(n-1)%26)+col;n=Math.floor((n-1)/26);}if(value==null||value==='')return '';return `<c r="${col}${i+1}" s="${i===0?1:0}" t="inlineStr"><is><t xml:space="preserve">${obXml(value)}</t></is></c>`;}).join('')}</row>`).join('');
    const colWidths=[11,11,39,20,23,17,20,75,27,24,42,16,34,29,31,16,45];
    const sheet=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="A1:Q${rows.length}"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="17"/><cols>${colWidths.map((w,i)=>`<col min="${i+1}" max="${i+1}" width="${w}" customWidth="1"/>`).join('')}</cols><sheetData>${cells}</sheetData><autoFilter ref="A1:Q${rows.length}"/></worksheet>`;
    return obZip({
      '[Content_Types].xml':'<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
      '_rels/.rels':'<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
      'xl/workbook.xml':'<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Observaciones" sheetId="1" r:id="rId1"/></sheets></workbook>',
      'xl/_rels/workbook.xml.rels':'<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
      'xl/styles.xml':'<?xml version="1.0" encoding="UTF-8"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/><color rgb="FF183962"/></font><font><b/><sz val="11"/><name val="Calibri"/><color rgb="FF102A50"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE0F2E8"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="1" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>',
      'xl/worksheets/sheet1.xml':sheet
    });
  }
  function obPdfText(v){const cp={8216:145,8217:146,8220:147,8221:148,8211:150,8212:151,8230:133,8364:128};return String(v??'').replace(/[\\()]/g,c=>'\\'+c).replace(/[^\x20-\x7e]/g,c=>{const n=c.charCodeAt(0),byte=n<=255?n:cp[n]||63;return '\\'+byte.toString(8).padStart(3,'0');});}
  function obWrap(text,max=104){const out=[];for(const para of String(text||'').split(/\r?\n/)){const words=para.trim().split(/\s+/);let line='';for(const word of words){if((line+' '+word).trim().length>max&&line){out.push(line);line=word;}else line=(line?line+' ':'')+word;}out.push(line);}return out;}
  function obPdf(records){
    const m=selected(),pages=[];let cmds=[],y=0;
    const newPage=()=>{cmds=[];pages.push(cmds);y=793;cmds.push('0.06 0.18 0.33 rg 42 812 510 8 re f');cmds.push(`BT /F2 15 Tf 0.06 0.18 0.33 rg 44 788 Td (${obPdfText('TERRITORIO INTELIGENTE')}) Tj ET`);y=764;};
    const ensure=space=>{if(y-space<56)newPage();};
    const textLine=(s,font='F1',size=9,color='0.11 0.22 0.34')=>{ensure(size+4);cmds.push(`BT /${font} ${size} Tf ${color} rg 44 ${y.toFixed(1)} Td (${obPdfText(s)}) Tj ET`);y-=size+4;};
    newPage();textLine('Reporte de observaciones generado por Territorio Inteligente','F2',12);y-=3;
    for(const line of obWrap(`Meta ${m?.id||state.current} - ${m?.name||'Sin título'}`,85))textLine(line,'F2',9.6);
    textLine(`Vigencia: ${state.year}  |  Registros: ${records.length}  |  Generado: ${new Date().toLocaleDateString('es-CO')}`,'F1',8.5);y-=7;
    for(const line of obWrap('Fuente: Plan de Acción municipal (archivo Excel aportado). Tipo, emisor, fecha exacta y estado solo se muestran cuando están documentados.',100))textLine(line,'F1',8.2);
    y-=10;
    if(!records.length)textLine('No hay registros de observaciones para esta selección.','F1',10);
    for(const r of records){
      ensure(83);cmds.push(`0.92 0.96 0.98 rg 42 ${(y-6).toFixed(1)} 510 17 re f`);
      textLine(`Observación ${r.id}  |  Actividad(es): ${(r.activities||[]).join(', ')||'No registrada'}`,'F2',9);
      textLine(`Fecha: ${obDate(r.date)}   |   Tipo: ${obType(r)}   |   Estado: ${obStatusKeys.find(x=>x[0]===obStatus(r))?.[1]||'No registrado'}`,'F1',8.1);
      for(const line of obWrap(r.text,99))textLine(line,'F1',8.4);
      for(const line of obWrap(`Origen: ${r.sourceFile}; hoja ${r.sourceSheet}; filas ${(r.sourceRows||[]).join(', ')}.`,108))textLine(line,'F1',7.3,'0.36 0.44 0.53');
      y-=11;
    }
    const font1='<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
    const font2='<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';
    const objects=['','<< /Type /Catalog /Pages 2 0 R >>','',font1,font2];
    const children=[];for(let i=0;i<pages.length;i++){const pageId=5+i*2,streamId=pageId+1;children.push(`${pageId} 0 R`);pages[i].push(`BT /F1 8 Tf 0.45 0.53 0.61 rg 44 31 Td (${obPdfText('Reporte documental - no es certificación municipal')}) Tj ET`);pages[i].push(`BT /F1 8 Tf 0.45 0.53 0.61 rg 502 31 Td (${obPdfText((i+1)+' / '+pages.length)}) Tj ET`);const stream=pages[i].join('\n')+'\n';objects[pageId]=`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${streamId} 0 R >>`;objects[streamId]=`<< /Length ${stream.length} >>\nstream\n${stream}endstream`;}
    objects[2]=`<< /Type /Pages /Count ${pages.length} /Kids [${children.join(' ')}] >>`;
    let pdf='%PDF-1.4\n',offsets=[0];for(let i=1;i<objects.length;i++){offsets.push(pdf.length);pdf+=`${i} 0 obj\n${objects[i]}\nendobj\n`;}
    const xref=pdf.length;pdf+=`xref\n0 ${objects.length}\n0000000000 65535 f \n`;
    for(let i=1;i<offsets.length;i++)pdf+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';
    pdf+=`trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
    return new Blob([pdf],{type:'application/pdf'});
  }
  function obExport(kind){const records=obReportRows(),suffix=`Observaciones_Meta_${state.current}_${state.year}`;
    if(kind==='xlsx'){const doc=obXlsx(records);obDownloadBlob(suffix+'.xlsx',doc,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');}
    else if(kind==='pdf'){const doc=obPdf(records);obDownloadBlob(suffix+'.pdf',doc,'application/pdf');}
  }

  /* 3.3 · Contratación de inversión: datos vinculados a metas numeradas verificables. */
  const ctYears=['2024','2025','2026','2027'];
  const ctStatusDefs=[['running','En ejecución','#06945d'],['finished','Finalizado','#1679e8'],['liquidated','Liquidado','#904ed5'],['suspended','Suspendido','#f3a31a'],['cancelled','Cancelado','#e24650'],['unknown','Sin estado verificable','#95a5ba']];
  const ctColors=['#11a965','#2683ec','#f39b37','#a05bd7','#0a729c','#d3575d'];
  const ctIcons={file:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 2h9l4 4v16H6zM15 2v5h4M9 12h7M9 16h7"/></svg>',coins:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v5c0 4 16 4 16 0V5M4 11v5c0 4 16 4 16 0v-5M4 16v3c0 4 16 4 16 0v-3"/></svg>',plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M7 12h10"/></svg>',chart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 21V12h4v9M10 21V8h4v13M16 21V3h4v18M2 21h20"/></svg>',gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="m11 2-1 3-3 1-3-1-2 4 3 2v3l-2 2 3 4 3-1 3 1 1 3h4l1-3 3-1 3 1 2-4-3-2v-3l3-2-2-4-3 1-3-1-1-3z"/></svg>',check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9"/><path d="m7 12 3 3 7-7"/></svg>',open:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 4h7v7m0-7-9 9M20 14v6H4V4h8"/></svg>'};
  state.ctData=null;state.ctLoading=false;state.ctLoaded=false;state.ctError=null;
  state.ctFilters={q:'',status:'all',selection:'all',contractor:'all'};state.ctPage=0;
  state.ctSelected=null;state.ctDetailTab='info';state.ctPanelOpen=true;
  const ctText=v=>v==null||String(v).trim()===''?'No registrado':String(v);
  const ctMoney=v=>isNumeric(v)?fmtMoney.format(v):'—';
  const ctShortMoney=v=>{if(!isNumeric(v))return '—';if(Math.abs(v)>=1e9)return '$ '+fmtNum.format(v/1e9)+' mil M';if(Math.abs(v)>=1e6)return '$ '+fmtNum.format(v/1e6)+' M';return '$ '+fmtInt.format(v);};
  const ctPercent=(n,d)=>d?fmtNum.format(n/d*100)+'%':'—';
  const ctDate=v=>{if(!v)return 'No registrada';const d=new Date(String(v).slice(0,10)+'T12:00:00');return Number.isNaN(+d)?'No registrada':d.toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'});};
  const ctSafeUrl=v=>{const link=safeLink(v);if(!link)return null;try{const h=new URL(link).hostname.toLowerCase();return ['secop.gov.co','contratos.gov.co','colombiacompra.gov.co'].some(x=>h===x||h.endsWith('.'+x))?link:null;}catch{return null;}};
  function ctReset(){state.ctFilters={q:'',status:'all',selection:'all',contractor:'all'};state.ctPage=0;state.ctSelected=null;state.ctDetailTab='info';state.ctPanelOpen=true;}
  async function ctLoad(){
    if(state.ctLoading||state.ctLoaded)return;
    state.ctLoading=true;state.ctError=null;
    try{
      const res=await fetch('/data/plan-accion-contratacion-2024-2026.b64.txt',{cache:'no-cache'});
      if(!res.ok)throw Error('No se pudo consultar la base de contratación ('+res.status+').');
      const encoded=(await res.text()).trim(),binary=atob(encoded),bytes=new Uint8Array(binary.length);
      for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
      const decoded=await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
      const doc=JSON.parse(decoded);
      if(!doc.periods?.['2024']||!doc.periods?.['2025']||!doc.periods?.['2026'])throw Error('Faltan vigencias en las bases de contratación.');
      state.ctData=doc;state.ctLoaded=true;
    }catch(e){state.ctError=e?.message||'No se pudieron cargar los registros';console.warn('Contratación de Inversión:',e);}
    finally{state.ctLoading=false;if(state.activeTab==='contracts')refresh();}
  }
  function ctMeta(){return selected() || state.data?.periods?.['2025']?.metas?.find(m=>m.id===state.current) || null;}
  function ctAll(){return state.ctData?.periods?.[state.year]?.contracts||[];}
  function ctRecords(){return ctAll().filter(c=>Array.isArray(c.metas)&&c.metas.includes(state.current));}
  function ctFiltered(){const f=state.ctFilters;const q=normalizeQuery(f.q);return ctRecords().filter(c=>{
    if(f.status!=='all'&&c.statusKey!==f.status)return false;
    if(f.selection!=='all'&&(c.selection||'No registrada')!==f.selection)return false;
    if(f.contractor!=='all'&&(c.contractor||'No registrado')!==f.contractor)return false;
    if(q&&!normalizeQuery([c.contract,c.process,c.contractor,c.object,c.agency,c.selection,c.kind,c.rubro,c.funding,c.metaRaw].join(' ')).includes(q))return false;
    return true;
  });}
  function ctCurrent(){const items=ctRecords();let c=items.find(x=>x.id===state.ctSelected);if(!c&&items.length){c=items[0];state.ctSelected=c.id;}return c||null;}
  function ctStatusLabel(key){return ctStatusDefs.find(x=>x[0]===key)?.[1]||'No determinado';}
  function ctStatusColor(key){return ctStatusDefs.find(x=>x[0]===key)?.[2]||'#91a1b3';}
  function ctHero(){return `<header class="pa-ig-hero pa-act-hero pa-ct-hero"><div class="pa-ig-hero-main"><nav class="pa-act-breadcrumb" aria-label="Ruta del módulo"><span>Inicio</span><span>Metas</span><span>Meta ${state.current}</span><strong>Contratación de Inversión</strong></nav><h1>Contratación de Inversión de la Meta</h1><p>Consulta contratos, recursos, modalidades de selección y novedades vinculados a esta meta.</p></div><div class="pa-ig-hero-actions"><div class="pa-ig-quote">“Inversión pública<br>que se puede<br>consultar”</div><label class="pa-ig-select-year">Año de contratación<select id="pa-ct-year-select" aria-label="Año de contratación">${ctYears.map(y=>`<option value="${y}" ${state.year===y?'selected':''}>${y}</option>`).join('')}</select></label></div></header>`;}
  function ctMetaStrip(m){
    if(!m)return `<div class="pa-ct-missingmeta">No se ha cargado el catálogo de metas. Intenta actualizar la página.</div>`;
    if(state.year==='2024')return `<div class="pa-ig-meta"><div class="pa-ig-number" aria-label="Meta ${m.id}"><small>Meta</small><strong>${m.id}</strong></div><div class="pa-ig-meta-text"><h2>${html(m.name)}</h2><p>Denominación de referencia del catálogo 2025; asociación contractual tomada del campo META de la base 2024.</p></div><span class="pa-state-chip pa-ig-state pa-state-unavailable">Estado de meta 2024 no reportado</span><div class="pa-ig-meta-fact"><div><small>Fuente</small><strong>Base de contratación 2024</strong></div></div><div class="pa-ig-meta-fact"><div><small>Periodo</small><strong>Vigencia 2024</strong></div></div></div>`;
    if(state.year==='2027')return `<div class="pa-ig-meta"><div class="pa-ig-number"><small>Meta</small><strong>${m.id}</strong></div><div class="pa-ig-meta-text"><h2>${html(m.name)}</h2><p>Sin base de contratación de 2027.</p></div><span class="pa-state-chip pa-ig-state pa-state-unavailable">Sin datos contractuales</span></div>`;
    return igMetaHeader(m,infoRecord());
  }
  function ctSwitchMeta(){const arr=state.data?.periods?.['2025']?.metas||[];return `<div class="pa-ct-meta-switch"><label for="pa-ct-meta-select">Consultar otra meta<select id="pa-ct-meta-select">${arr.map(m=>`<option value="${m.id}" ${m.id===state.current?'selected':''}>${m.id} · ${html(m.name).slice(0,66)}</option>`).join('')}</select></label>${!state.ctPanelOpen?'<button type="button" class="pa-ct-open" data-pa-ct-open>Mostrar detalle del contrato</button>':''}<span class="pa-ct-datasource">Fuente: contratos de inversión de ${state.year} · Vinculación por número de meta registrado</span></div>`;}
  function ctSummary(list){
    const sum=key=>list.reduce((v,c)=>v+(isNumeric(c[key])?c[key]:0),0);
    const valid=key=>list.some(c=>isNumeric(c[key]));
    const additions=list.map(c=>(isNumeric(c.add1)?c.add1:0)+(isNumeric(c.add2)?c.add2:0));
    return {n:list.length,initial:valid('initial')?sum('initial'):null,additions:list.some(c=>isNumeric(c.add1)||isNumeric(c.add2))?additions.reduce((a,b)=>a+b,0):null,value:valid('value')?sum('value'):null,running:list.filter(c=>c.statusKey==='running').length,finished:list.filter(c=>['finished','liquidated'].includes(c.statusKey)).length,shared:list.filter(c=>c.metas?.length>1).length};
  }
  function ctStats(){const x=ctSummary(ctRecords());const all=[['file','Total de contratos',fmtInt.format(x.n)],['coins','Valor inicial identificado',ctShortMoney(x.initial)],['plus','Valor de adiciones',ctShortMoney(x.additions)],['chart','Valor contractual identificado',ctShortMoney(x.value)],['gear','Contratos en ejecución',fmtInt.format(x.running)],['check','Finalizados / liquidados',fmtInt.format(x.finished)]];
    return `<section class="pa-ct-stats" aria-label="Indicadores contractuales">${all.map(([icon,label,val],i)=>`<div class="pa-ct-stat pa-ct-stat-${i}"><span class="pa-ct-stat-icon">${ctIcons[icon]}</span><span><small>${label}</small><strong title="${html(val)}">${html(val)}</strong></span></div>`).join('')}</section>`;
  }
  function ctStatusChart(){const list=ctRecords(),n=list.length;let offset=0;const parts=ctStatusDefs.map(([key,label,color])=>{const count=list.filter(c=>c.statusKey===key).length;const start=offset;offset+=n?count/n*100:0;return {key,label,color,count,start,end:offset};});const active=parts.filter(p=>p.count>0),grad=n?'conic-gradient('+active.map(p=>`${p.color} ${p.start}% ${p.end}%`).join(',')+')':'conic-gradient(#dce6ee 0 100%)';return `<section class="pa-ct-card pa-ct-state-card"><h3>Estado de los contratos</h3><div class="pa-ct-donutrow"><div class="pa-ct-donut" style="background:${grad}"><div><strong>${n}</strong><small>Contratos</small></div></div><div class="pa-ct-legend">${(n?active:parts.slice(0,3)).map(p=>`<button type="button" data-pa-ct-filter-state="${p.key}" title="Filtrar: ${p.label}"><i style="background:${p.color}"></i><span>${p.label}</span><b>${p.count} ${n?'('+ctPercent(p.count,n)+')':''}</b></button>`).join('')}</div></div></section>`;}
  function ctSelectionChart(){const counts=new Map();for(const c of ctRecords()){const k=c.selection||'No registrada';counts.set(k,(counts.get(k)||0)+1);}const sorted=[...counts].sort((a,b)=>b[1]-a[1]),max=Math.max(1,...sorted.map(x=>x[1]));return `<section class="pa-ct-card pa-ct-selection"><h3>Modalidad de selección</h3>${sorted.length?sorted.slice(0,6).map(([s,n],i)=>`<button class="pa-ct-hbar" type="button" data-pa-ct-filter-selection="${html(s)}" title="${html(s)}: ${n} contratos"><span>${html(s)}</span><i><b style="width:${n/max*100}%;background:${ctColors[i%ctColors.length]}"></b></i><strong>${n}</strong></button>`).join(''):'<p class="pa-ct-note">No hay modalidades documentadas para esta meta.</p>'}</section>`;}
  function ctExecutionChart(){const list=ctRecords().filter(c=>isNumeric(c.value)),s=list.slice().sort((a,b)=>b.value-a.value).slice(0,5),max=Math.max(1,...s.map(c=>c.value));return `<section class="pa-ct-card pa-ct-execution"><h3>Valores por contrato</h3><p class="pa-ct-subline">Comparación de importes contractuales; no representa pagos ni ejecución porcentual.</p>${s.length?s.map(c=>`<button class="pa-ct-contractbar ${state.ctSelected===c.id?'selected':''}" type="button" data-pa-ct-contract="${html(c.id)}" title="${html(c.contract||c.process)}: ${ctMoney(c.value)}"><span>${html(c.contract||c.process||'Sin número')}</span><i><b style="width:${c.value/max*100}%"></b></i><strong>${ctShortMoney(c.value)}</strong></button>`).join(''):'<p class="pa-ct-note">No hay valores financieros verificables.</p>'}<p class="pa-ct-caption">La base no aporta importes de obligaciones o pagos por contrato para calcular su ejecución financiera.</p></section>`;}
  function ctGantt(){const src=ctRecords(),selected=ctCurrent(),data=[...(selected?[selected]:[]),...src.filter(c=>c.id!==selected?.id)].filter(c=>c.started||c.signed).slice(0,5),yr=Number(state.year),start=Date.UTC(yr,0,1),end=Date.UTC(yr+1,0,1),days=end-start;
    const head=months.map(x=>`<span>${x}</span>`).join('');
    const rows=data.map(c=>{
      const from=Date.parse((c.started||c.signed)+'T00:00:00Z'),last=Date.parse((c.ended||c.finalEnd||c.started||c.signed)+'T00:00:00Z'),final=c.finalEnd?Date.parse(c.finalEnd+'T00:00:00Z'):last;
      if(!Number.isFinite(from)||!Number.isFinite(last))return '';
      const first=Math.max(start,from),baseEnd=Math.min(end,Math.max(last,from+86400000)),newEnd=Math.min(end,Math.max(final,last));
      let bars='';if(baseEnd>first){bars+=`<button type="button" data-pa-ct-contract="${html(c.id)}" class="pa-ct-gantt-bar ${state.ctSelected===c.id?'selected':''}" style="left:${100*(first-start)/days}%;width:${100*(baseEnd-first)/days}%" title="${html(c.contract||c.process)}: ${ctDate(c.started||c.signed)} — ${ctDate(c.ended)}"></button>`;}
      if(final>last&&newEnd>Math.max(last,start)){const extStart=Math.max(start,last);bars+=`<button type="button" data-pa-ct-contract="${html(c.id)}" class="pa-ct-gantt-bar extension" style="left:${100*(extStart-start)/days}%;width:${100*(newEnd-extStart)/days}%" title="Prórroga documentada hasta ${ctDate(c.finalEnd)}"></button>`;}
      return `<div class="pa-ct-gantt-row"><span title="${html(c.contract||c.process)}">${html(c.contract||c.process||'Contrato')}</span><div class="pa-ct-gantt-track">${bars||'<span class="pa-ct-gantt-out">Fuera de vigencia</span>'}</div></div>`;
    }).join('');
    return `<section class="pa-ct-card pa-ct-gantt"><h3>Cronograma contractual · ${state.year}</h3><div class="pa-ct-gantt-legend"><span><i></i> Plazo inicial</span><span><i class="extension"></i> Prórroga verificada</span></div><div class="pa-ct-gantt-head"><span></span><div>${head}</div></div>${rows||'<p class="pa-ct-note">Sin fechas de inicio verificables.</p>'}<p class="pa-ct-caption">Contraste con el PAA pendiente de su versión oficial e identificadores de correspondencia. Las fechas son las registradas en el Excel.</p></section>`;
  }
  function ctSelect(id,label,values,active){return `<label>${label}<select id="${id}"><option value="all">Todos</option>${values.map(v=>`<option value="${html(v)}" ${v===active?'selected':''}>${html(id==='pa-ct-filter-state'?ctStatusLabel(v):v)}</option>`).join('')}</select></label>`;}
  function ctBarCharts(){return `<div class="pa-ct-charts">${ctStatusChart()}${ctSelectionChart()}${ctExecutionChart()}${ctGantt()}</div>`;}
  function ctTable(){const f=state.ctFilters,all=ctRecords(),valid=ctFiltered(),pageTotal=Math.max(1,Math.ceil(valid.length/7));state.ctPage=Math.min(state.ctPage,pageTotal-1);const start=state.ctPage*7,subset=valid.slice(start,start+7),opts=(key)=>[...new Set(all.map(c=>c[key]||'No registrado'))].sort((a,b)=>a.localeCompare(b,'es'));
    const tableHeads=['Meta','Meta producto','N.º contrato','Tipo de contrato','Modalidad de selección','Objeto contractual','Contratista','Representante legal','Identificación protegida','Plazo','Inicio','Terminación','Estado','Valor contractual'];
    const m=ctMeta();return `<section class="pa-ct-card pa-ct-table-panel"><div class="pa-ct-table-toolbar"><h3>Listado de contratos de la meta</h3><div class="pa-ct-search"><input id="pa-ct-search" placeholder="Buscar número, contratista u objeto..." aria-label="Buscar contratos" value="${html(f.q)}"/>${searchIcon}</div>${ctSelect('pa-ct-filter-state','Estado',ctStatusDefs.filter(s=>all.some(c=>c.statusKey===s[0])).map(s=>s[0]),f.status)}${ctSelect('pa-ct-filter-selection','Modalidad',opts('selection'),f.selection)}${ctSelect('pa-ct-filter-contractor','Contratista',opts('contractor'),f.contractor)}<button class="pa-ct-export" type="button" data-pa-ct-export>${ctIcons.file} Exportar</button></div><div class="pa-ct-table-scroll"><table class="pa-ct-table"><thead><tr>${tableHeads.map(s=>`<th>${html(s)}</th>`).join('')}</tr></thead><tbody>${subset.map(c=>`<tr tabindex="0" role="button" data-pa-ct-contract="${html(c.id)}" class="${c.id===state.ctSelected?'selected':''}" aria-label="Ver contrato ${html(c.contract||c.process||'sin número')}"><td>${state.current}</td><td title="${html(m?.name||'No informada')}"><span class="pa-ct-celltext">${html(m?.name||'No informada')}</span></td><td><strong>${html(c.contract||c.process||'—')}</strong>${c.metas?.length>1?'<small class="pa-ct-shared">Compartido</small>':''}</td><td title="${html(c.kind||'No registrado')}"><span class="pa-ct-celltext">${html(c.kind||'No registrado')}</span></td><td title="${html(c.selection||'—')}"><span class="pa-ct-celltext">${html(c.selection||'—')}</span></td><td title="${html(c.object||'')}"><span class="pa-ct-celltext">${html(c.object||'No registrado')}</span></td><td title="${html(c.contractor||'—')}"><span class="pa-ct-celltext">${html(c.contractor||'—')}</span></td><td title="${html(c.representative||'—')}"><span class="pa-ct-celltext">${html(c.representative||'—')}</span></td><td>${html(c.maskedId||'—')}</td><td title="${html(c.term||'—')}"><span class="pa-ct-celltext">${html(c.term||'—')}</span></td><td>${html(ctDate(c.started))}</td><td>${html(ctDate(c.finalEnd||c.ended))}</td><td><span class="pa-ct-badge ${html(c.statusKey)}">${html(ctStatusLabel(c.statusKey))}</span></td><td><strong>${ctMoney(c.value)}</strong></td></tr>`).join('')||'<tr><td colspan="14"><div class="pa-ct-noresults">No hay contratos que coincidan con los filtros de esta meta y vigencia.</div></td></tr>'}</tbody></table></div><div class="pa-ct-table-footer"><span>Mostrando ${valid.length?start+1:0}–${Math.min(start+7,valid.length)} de ${valid.length} contratos · ${all.length} relacionados con la meta</span><div><button type="button" data-pa-ct-page="${state.ctPage-1}" ${state.ctPage<=0?'disabled':''}>‹</button>${Array.from({length:pageTotal},(_,i)=>`<button type="button" class="${i===state.ctPage?'active':''}" data-pa-ct-page="${i}" aria-label="Página ${i+1}">${i+1}</button>`).join('')}<button type="button" data-pa-ct-page="${state.ctPage+1}" ${state.ctPage>=pageTotal-1?'disabled':''}>›</button></div></div></section>`;}
  function ctFinancialTracking(){const c=ctCurrent();if(!c)return `<section class="pa-ct-card"><h3>Trazabilidad financiera del contrato seleccionado</h3><p class="pa-ct-note">Selecciona un contrato para consultar sus valores.</p></section>`;
    const vals=[['Valor inicial',c.initial,'#94a8b9'],['Adición 1',c.add1,'#11a768'],['Adición 2',c.add2,'#2383ed'],['Valor actualizado',c.value,'#9750d1']];const max=Math.max(1,...vals.map(x=>isNumeric(x[1])?Math.abs(x[1]):0));return `<section class="pa-ct-card pa-ct-tracking"><h3>Trazabilidad contractual · ${html(c.contract||'Contrato')}</h3><div class="pa-ct-track-bars">${vals.map(([name,value,color])=>`<div><strong>${ctShortMoney(value)}</strong><span class="pa-ct-track-plot"><i style="height:${Math.max(3,(isNumeric(value)?Math.abs(value)/max*100:0))}%;background:${color}"></i></span><small>${name}</small></div>`).join('')}</div><p class="pa-ct-caption">CDP ${html(c.cdp||'sin número')} · RP ${html(c.rp||'sin número')}. Identificadores sin importes de CDP/RP, obligaciones o pagos verificados.</p>${isNumeric(c.diff)&&Math.abs(c.diff)>1?`<p class="pa-ct-warning">Diferencia por conciliar entre valor actualizado y suma de adiciones: ${ctMoney(c.diff)}.</p>`:''}</section>`;}
  function ctFunding(){const c=ctCurrent(),raw=c?.funding||'',parts=[...new Set(raw.split(/\s{2,}|\n|;|\s+\+\s+/).map(x=>x.trim()).filter(Boolean))];return `<section class="pa-ct-card pa-ct-funding"><h3>Fuentes de financiación</h3><div class="pa-ct-funding-layout"><div class="pa-ct-funding-donut"><div>Sin reparto<br>monetario</div></div><ul>${parts.length?parts.map((x,i)=>`<li><i style="background:${ctColors[i%ctColors.length]}"></i>${html(x)}</li>`).join(''):'<li>Fuente no reportada</li>'}</ul></div><p class="pa-ct-caption">La base consigna fuentes, pero no necesariamente montos por cada una. No se fabrican porcentajes.</p></section>`;}
  function ctRubros(){const c=ctCurrent();return `<section class="pa-ct-card pa-ct-rubro"><h3>Rubro presupuestal</h3>${c?`<dl class="pa-ct-mini-dl"><div><dt>Número de rubro</dt><dd>${html(c.rubro||'No registrado')}</dd></div><div><dt>Nombre del rubro</dt><dd>${html(c.rubroName||'No registrado')}</dd></div><div><dt>Fuente</dt><dd>${html(c.funding||'No registrada')}</dd></div><div><dt>Gasto</dt><dd>${html(c.spendingRaw||'No registrado')}${c.spending==='mixed'?' · Contrato mixto':''}</dd></div></dl>`:'<p class="pa-ct-note">Selecciona un contrato.</p>'}</section>`;}
  function ctDetailItems(items){return `<dl class="pa-ct-detail-list">${items.map(([name,value])=>`<div><dt>${html(name)}</dt><dd>${html(ctText(value))}</dd></div>`).join('')}</dl>`;}
  function ctDetailContent(c){if(!c)return '<div class="pa-ct-noresults">Selecciona un contrato en la tabla para visualizar su detalle.</div>';
    if(state.ctDetailTab==='finance')return ctDetailItems([['Valor inicial',ctMoney(c.initial)],['Valor actualizado',ctMoney(c.value)],['Base del valor',c.valueBasis],['Valor mensual',ctMoney(c.monthly)],['Adición 1',ctMoney(c.add1)],['Adición 2',ctMoney(c.add2)],['Número de CDP',c.cdp],['Fecha CDP',ctDate(c.cdpDate)],['Número de RP',c.rp],['Fecha RP',ctDate(c.rpDate)],['Fuente',c.funding],['Rubro',c.rubro],['Nombre del rubro',c.rubroName],['Pagos', 'Sin importe documental verificable'],['Obligaciones','Sin importe documental verificable']]);
    if(state.ctDetailTab==='additions')return `<div class="pa-ct-mods">${ctDetailItems([['Valor inicial',ctMoney(c.initial)],['Primera adición',ctMoney(c.add1)],['Segunda adición',ctMoney(c.add2)],['Valor actualizado',ctMoney(c.value)],['Prórroga',c.extended],['Plazo de prórroga',c.extension],['Fecha final',ctDate(c.finalEnd)],['Liquidación',ctDate(c.liquidated)]])}${isNumeric(c.diff)&&Math.abs(c.diff)>1?`<p class="pa-ct-warning">Diferencia financiera por verificar: ${ctMoney(c.diff)}</p>`:''}<h4>Observaciones y novedades registradas</h4><p class="pa-ct-observation">${html(c.notes||'No se registran observaciones de novedades.')}</p></div>`;
    if(state.ctDetailTab==='secop'){const url=ctSafeUrl(c.secop);return `<div class="pa-ct-secop-tab">${ctDetailItems([['Número de proceso',c.process],['Número de contrato',c.contract],['Procedencia',c.source],['Enlace SECOP',url?'Enlace oficial consignado en el Excel':'No existe un enlace SECOP verificable']])}${url?`<a href="${html(url)}" class="pa-ct-secop-link" target="_blank" rel="noopener noreferrer">${ctIcons.open} Abrir proceso en SECOP</a>`:'<p class="pa-ct-note">No se construye una URL de SECOP ficticia.</p>'}<p class="pa-ct-caption">La URL procede de la base de contratación. La disponibilidad del portal o sus permisos no se pueden garantizar automáticamente.</p></div>`;}
    return ctDetailItems([['Número de meta',c.metas?.join(', ')||'No registrado'],['Meta producto',ctMeta()?.name||'No registrada'],['Número de proceso',c.process],['Número de contrato',c.contract],['Contratista',c.contractor],['Representante legal',c.representative],['Identificación protegida',c.maskedId],['Tipo contractual',c.kind],['Modalidad de selección',c.selection],['Objeto contractual',c.object],['Supervisor',c.supervisor],['Dependencia',c.agency],['Plazo de ejecución',c.term],['Firma',ctDate(c.signed)],['Fecha de inicio',ctDate(c.started)],['Terminación inicial',ctDate(c.ended)],['Terminación final',ctDate(c.finalEnd)],['Estado según archivo',c.status],['Gasto',c.spendingRaw],['Asociación a metas',c.matchStatus],['Fuente y fila',c.source]]);
  }
  function ctDetailPanel(){const c=ctCurrent(),visible=state.ctPanelOpen;return `<aside class="pa-ct-detail ${visible?'':'is-collapsed'}" aria-label="Detalle del contrato"><header><strong>Detalle del contrato</strong><button type="button" data-pa-ct-close title="Cerrar detalle" aria-label="Cerrar detalle">×</button></header><div class="pa-ct-detail-inner"><div class="pa-ct-detail-heading"><h3>${html(c?.contract||c?.process||'Sin contrato seleccionado')}</h3>${c?`<span class="pa-ct-badge ${html(c.statusKey)}">${html(ctStatusLabel(c.statusKey))}</span>`:''}</div><nav class="pa-ct-detail-tabs" aria-label="Secciones del detalle">${[['info','Información'],['finance','Financiera'],['additions','Adiciones'],['secop','SECOP']].map(([k,l])=>`<button type="button" class="${state.ctDetailTab===k?'active':''}" data-pa-ct-detail-tab="${k}">${l}</button>`).join('')}</nav><div class="pa-ct-detail-content">${ctDetailContent(c)}</div><footer><button type="button" data-pa-ct-docs ${c&&(c.reports||c.expensesLink)?'':'disabled'}>${ctIcons.file} Ver documentos</button>${c&&ctSafeUrl(c.secop)?`<a target="_blank" rel="noopener noreferrer" href="${html(ctSafeUrl(c.secop))}">${ctIcons.open} Abrir en SECOP</a>`:'<span class="pa-ct-detail-no-link">SECOP sin enlace verificable</span>'}</footer></div></aside>`;}
  function ctDocsDialog(){const c=ctCurrent();const links=c?[['Informes',c.reports],['Egresos',c.expensesLink]].filter(x=>safeLink(x[1])):[];return `<dialog id="pa-ct-doc-dialog" class="pa-ct-dialog"><header><h2>Documentos del contrato</h2><button type="button" data-pa-ct-doc-close aria-label="Cerrar">×</button></header><p>Archivos o repositorios enlazados desde la matriz de contratación. El acceso depende del proveedor.</p>${links.map(([t,u])=>`<a href="${html(safeLink(u))}" target="_blank" rel="noopener noreferrer">${ctIcons.open} ${t} · abrir enlace original</a>`).join('')||'<p>No hay documentos enlazados desde el archivo para este contrato.</p>'}</dialog>`;}
  function ctDashboard(){return `<div class="pa-ct-dashboard">${ctSwitchMeta()}<div class="pa-ct-layout ${state.ctPanelOpen?'':'full'}"><div class="pa-ct-main">${ctStats()}${ctBarCharts()}${ctTable()}<div class="pa-ct-bottom">${ctFinancialTracking()}${ctFunding()}${ctRubros()}</div><p class="pa-ct-method">Fuente: bases de contratación de Subachoque 2024, 2025 y 2026. Contratos asociados a la meta por número explícito; los contratos compartidos se muestran con su valor total (no necesariamente imputable a una sola meta). El estado contractual corresponde al Excel y puede no reflejar cambios posteriores en SECOP.</p></div>${ctDetailPanel()}</div>${ctDocsDialog()}</div>`;}
  function ctResults(){
    if(state.loading)return '<div class="pa-ct-placeholder">Cargando metas…</div>';
    const m=ctMeta();if(!m)return '<div class="pa-ct-placeholder">No se ha podido obtener una referencia para la meta seleccionada.</div>';
    const top=ctMetaStrip(m)+tabMarkup(m);
    if(state.year==='2027')return top+'<div class="pa-ct-empty"><h2>Contratación no disponible para 2027</h2><p>Las bases adjuntas solo incluyen 2024, 2025 y 2026. Puedes cambiar de vigencia sin salir del módulo.</p></div>';
    if(state.ctError)return top+`<div class="pa-ct-empty"><h2>No se pudo cargar la contratación</h2><p>${html(state.ctError)}</p><button type="button" data-pa-ct-retry>Reintentar</button></div>`;
    if(!state.ctLoaded)return top+'<div class="pa-ct-placeholder">Cargando contratos oficiales de 2024, 2025 y 2026…</div>';
    return top+ctDashboard();
  }
  function ctRefreshPart(preserveFocus=false){const root=panel.querySelector('.pa-ct-dashboard');if(!root)return;
    const field=preserveFocus?document.activeElement:null,id=field?.id,pos=field?.selectionStart;
    root.outerHTML=ctDashboard();
    if(preserveFocus&&id){const replacement=panel.querySelector('#'+id);if(replacement){replacement.focus({preventScroll:true});try{replacement.setSelectionRange(pos,pos);}catch{}}}
  }
  function ctCsvExport(){const records=ctFiltered(),headers=['Año','Meta','Metas relacionadas','Número de proceso','Número de contrato','Tipo contractual','Modalidad de selección','Objeto contractual','Contratista','Dependencia','Plazo','Fecha inicio','Fecha terminación','Estado según Excel','Valor inicial COP','Adición 1 COP','Adición 2 COP','Valor actualizado COP','Base del valor','Fuente','Rubro','Enlace SECOP','Archivo y fila de origen'];
    const vals=records.map(c=>[state.year,state.current,(c.metas||[]).join(' / '),c.process,c.contract,c.kind,c.selection,c.object,c.contractor,c.agency,c.term,c.started,c.finalEnd||c.ended,c.status,c.initial,c.add1,c.add2,c.value,c.valueBasis,c.funding,c.rubro,c.secop,c.source]);
    const csv=[headers,...vals].map(row=>row.map(v=>'"'+String(v??'').replace(/^[=+@\-\t\r]/,v=>"'"+v).replace(/"/g,'""')+'"').join(';')).join('\r\n');
    const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`Contratacion_Inversion_Meta_${state.current}_${state.year}.csv`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
  }
  // Totalizador: se consumen los mismos porcentajes que en las fichas por meta.
  // No se suman unidades físicas distintas ni se inventa una ejecución financiera global.
  function overallContext(){
    return {metas:metas(),year:state.year,classify:classification,selectedId:state.current,
      query:state.overallSearch,status:state.overallStatus,sort:state.overallSort,source:currentYear()?.source||''};
  }
  function overallMarkup(full=false){
    const engine=window.TIPlanTotalizador;
    if(!engine)return full?'<div class="pa-empty" role="alert"><h2>No se pudo cargar el totalizador</h2><p>El seguimiento individual permanece disponible en las otras pestañas.</p></div>':'';
    return full?engine.page(overallContext()):engine.ribbon(overallContext(),true);
  }
  function overallRefreshTable(){
    const node=panel.querySelector('.pa-total-table-region');
    if(node&&window.TIPlanTotalizador)node.innerHTML=window.TIPlanTotalizador.table(overallContext());
  }
  function overallExport(){
    if(!window.TIPlanTotalizador)return;
    const raw=window.TIPlanTotalizador.csv(overallContext());
    const url=URL.createObjectURL(new Blob(['\ufeff',raw],{type:'text/csv;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download='totalizador-metas-'+state.year+'.csv';
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function resultsMarkup(){
    if(state.loading)return `<div class="pa-empty"><span class="pa-spinner" aria-hidden="true"></span><h2>Cargando registros de los planes de acción...</h2><p>Preparando información de 2025 y 2026.</p></div>`;
    if(state.error)return `<div class="pa-empty"><h2>No fue posible cargar los registros</h2><p>${html(state.error)}</p><button type="button" class="pa-retry" data-pa-reload="1">Reintentar</button></div>`;
    if(!currentYear())return tabMarkup(null)+unavailableMarkup();
    const m=selected();if(!m)return tabMarkup(null)+unavailableMarkup();
    // Cabecera idéntica en TODAS las pestañas: título -> ficha de meta -> 11 pestañas.
    // Únicamente cambia el contenido que viene debajo.
    if(state.activeTab==='overall')return igMetaHeader(m,infoRecord())+tabMarkup(m)+overallMarkup(true);
    return igMetaHeader(m,infoRecord())+tabMarkup(m)+overallMarkup(false)+summaryMarkup(m);
  }

  // Encabezado global único para todas las secciones 3.3: búsqueda, año y
  // totalizadores siguen visibles al consultar Información General, Contratos, etc.
  // Los títulos particulares se mantienen como subtítulo compacto, sin un
  // segundo encabezado panorámico ni un selector anual duplicado.
  function sectionHeadingMarkup(tab=state.activeTab) {
    const sections={
      summary:['Resumen de la Meta','Consulta el estado general de la meta, sus avances y principales indicadores.'],
      overall:['Totalizador del Plan','Consulta el consolidado de todas las metas, sus avances físicos y su ejecución presupuestal.'],
      search:['Resultados de la búsqueda','Selecciona una meta para continuar en la pestaña actual.'],
      general:['Información General','Conoce el detalle de la meta, su propósito, alcance y la información estratégica asociada.'],
      activities:['Actividades de la Meta','Consulta el plan de acción, programación, avances y evidencias de cada actividad.'],
      physical:['Avance Físico de la Meta','Consulta el cumplimiento físico de las actividades y el avance en la ejecución de la meta.'],
      beneficiaries:['Beneficiarios de la Meta','Conoce la población que se beneficia con esta meta y su impacto en el territorio.'],
      budget:['Ejecución Presupuestal de la Meta','Consulta el estado de los recursos asignados y su ejecución en el marco del plan de acción.'],
      territory:['Territorio de la Meta','Conoce dónde se ejecutan las actividades de esta meta y su impacto en las veredas y barrios del municipio.'],
      contracts:['Contratación de Inversión de la Meta','Consulta contratos, recursos, modalidades de selección y novedades vinculados a esta meta.'],
      supports:['Soportes de la Meta','Consulta las evidencias, documentos y soportes que respaldan la ejecución de las actividades.'],
      observations:['Observaciones de la Meta','Consulta los comentarios, alertas, recomendaciones y notas de seguimiento realizadas por las dependencias responsables y entes de control.']
    };
    const info=sections[tab];if(!info)return '';
    return '<header class="pa-context-heading" aria-label="'+html(info[0])+'">'+
      '<div class="pa-context-heading-main"><span class="pa-context-kicker">PLAN DE ACCIÓN · '+html(state.year)+'</span>'+
      '<h2>'+html(info[0])+'</h2><p>'+html(info[1])+'</p></div>'+
      (tab==='search'?'':'<span class="pa-context-meta">Meta '+html(state.current)+'</span>')+'</header>';
  }
  function pageMarkup(){
    // La búsqueda y el año pertenecen a topMarkup(), compartido por cada ruta.
    // Las vistas particulares conservan todos sus paneles y la navegación previa.
    const sharedHeader=topMarkup();
    const detailPage=(classNames,ariaLabel,content,context=state.activeTab)=>{
      return '<div class="pa-shell pa-global-shell '+classNames+'">'+sharedHeader+
      '<section class="pa-body pa-ig-body" aria-label="'+html(ariaLabel)+'">'+
      '<div class="pa-content" id="pa-content">'+sectionHeadingMarkup(context)+content+'</div></section></div>';
    };
    // Unificar los resultados en las diez vistas, incluida Contratación,
    // cuya pantalla originalmente no manejaba state.list.
    if(state.activeTab==='contracts')return detailPage('pa-general-mode pa-activities-mode pa-contract-mode','Contratación de Inversión para '+state.year,ctResults());
    if(state.activeTab==='observations')return detailPage('pa-general-mode pa-activities-mode pa-observations-mode','Observaciones de la meta para '+state.year,obResults());
    if(state.activeTab==='supports')return detailPage('pa-general-mode pa-activities-mode pa-supports-mode','Soportes de la meta para '+state.year,suResults());
    if(state.activeTab==='territory')return detailPage('pa-general-mode pa-activities-mode pa-territory-mode','Territorio para '+state.year,trResults());
    if(state.activeTab==='budget')return detailPage('pa-general-mode pa-activities-mode pa-budget-mode','Ejecución Presupuestal para '+state.year,buResults());
    if(state.activeTab==='beneficiaries')return detailPage('pa-general-mode pa-activities-mode pa-beneficiaries-mode','Beneficiarios de la meta para '+state.year,benResults());
    if(state.activeTab==='physical')return detailPage('pa-general-mode pa-activities-mode pa-physical-mode','Avance físico para '+state.year,physicalResults());
    if(state.activeTab==='activities')return detailPage('pa-general-mode pa-activities-mode','Actividades para '+state.year,actResults());
    if(state.activeTab==='general')return detailPage('pa-general-mode','Información General para '+state.year,generalResults());
    const avail=!!currentYear();
    return '<div class="pa-shell pa-global-shell pa-general-mode">'+sharedHeader+'<section class="pa-body pa-ig-body" aria-label="Panel de seguimiento para '+html(state.year)+'">'+
      '<div class="pa-content" id="pa-content">'+sectionHeadingMarkup()+resultsMarkup()+'</div></section></div>';
  }
  function refresh({preserveFocus=false}={}){
    // Las selecciones antiguas del listado de tarjetas se redirigen al unico directorio.
    if(state.list){state.list=false;state.activeTab='overall';}
    rememberPlanNavigation();
    const node=preserveFocus?document.activeElement:null;const id=node?.id,sel= node?.selectionStart, selEnd=node?.selectionEnd;
    window.TISubachoqueMap?.destroyWithin(panel);
    trUnmountMap();
    panel.innerHTML=pageMarkup();
    const activeRender=panel.firstElementChild;
    requestAnimationFrame(()=>{
      const engine=window.TISubachoqueMap;if(!engine)return;
      engine.mountAll(panel).then(()=>{
        if(panel.isConnected&&panel.firstElementChild===activeRender)attachThematicCards();
      }).catch(error=>console.warn('Mapas de la meta:',error));
    });
    if(state.activeTab==='activities')requestAnimationFrame(actChartControls);
    if(state.activeTab==='territory'&&currentYear()&&!state.list){
      requestAnimationFrame(()=>trInitMap());
      if(!state.territoryExtraLoaded)trLoadFullTexts();
    }
    if(state.activeTab==='supports'&&currentYear()&&!state.list&&!state.supportExtraLoaded&&!state.supportLoading)suLoadCatalog();
    if(state.activeTab==='contracts'&&!state.ctLoaded&&!state.ctLoading&&!state.ctError)ctLoad();
    if(state.activeTab==='observations'&&currentYear()&&!state.list&&!state.obLoaded&&!state.obLoading&&!state.obError)obLoad();
    if(preserveFocus&&id){const replacement=panel.querySelector('#'+id);if(replacement){replacement.focus({preventScroll:true});try{replacement.setSelectionRange(sel,selEnd)}catch{}}}
  }
  function focusMeta(id){const found=metas().find(m=>m.id===id);if(!found)return;state.current=found.id;state.territoryThemeActive.clear();state.list=false;state.activityExpanded.clear();state.qNumber='';state.qKeyword='';state.listCategory='all';state.activityFilters={q:'',status:'all',owner:'all',place:'all'};state.physicalFilters={status:'all',activity:'all'};state.activityCompareUnit=null;state.activityCarouselPage=0;state.beneficiaryPlace=null;state.territorySelected=null;state.territoryGalleryPage=0;suResetFilters();obReset();ctReset();refresh();const header=panel.querySelector('.pa-context-heading, .pa-ig-meta');header?.scrollIntoView({behavior:'smooth',block:'start'});}
  function searchAction(){
    if(!currentYear()){state.list=false;refresh();return;}
    const rawNum=state.qNumber.trim(),rawWord=normalizeQuery(state.qKeyword);
    if(/^\d+$/.test(rawNum)&&!rawWord){const exact=metas().find(x=>x.id===Number(rawNum));if(exact){if(state.activeTab==='overall')state.activeTab='summary';focusMeta(exact.id);return;}}
    // Una sola vista para consultar metas: el directorio del Totalizador.
    state.overallSearch=rawWord?state.qKeyword.trim():rawNum;
    state.overallStatus='all';state.overallSort='id';
    state.activeTab='overall';state.list=false;state.listCategory='all';
    refresh();panel.querySelector('.pa-total-directory')?.scrollIntoView({behavior:'smooth',block:'start'});
  }
  panel.addEventListener('submit',ev=>{if(ev.target.id==='pa-query-form'){ev.preventDefault();searchAction();}});
  panel.addEventListener('input',ev=>{if(ev.target.id==='pa-meta-chooser-search'){const q=normalizeQuery(ev.target.value.trim());panel.querySelectorAll('.pa-meta-chooser-results [data-pa-meta]').forEach(option=>{option.hidden=!!q&&!normalizeQuery(option.textContent).includes(q);});return;}if(ev.target.id==='pa-query-num')state.qNumber=ev.target.value.replace(/[^\d]/g,'').slice(0,3);if(ev.target.id==='pa-query-key')state.qKeyword=ev.target.value.slice(0,140);if(ev.target.id==='pa-act-search'){state.activityFilters.q=ev.target.value.slice(0,140);refresh({preserveFocus:true});}if(ev.target.id==='pa-su-search'){state.supportFilters.q=ev.target.value.slice(0,160);state.supportShowAll=false;refresh({preserveFocus:true});}if(ev.target.id==='pa-ob-search'){state.obFilters.q=ev.target.value.slice(0,180);state.obPage=0;obRefreshPart(true);}if(ev.target.id==='pa-ct-search'){state.ctFilters.q=ev.target.value.slice(0,180);state.ctPage=0;ctRefreshPart(true);}if(ev.target.id==='pa-overall-search'){state.overallSearch=ev.target.value.slice(0,180);overallRefreshTable();}});
  panel.addEventListener('change',ev=>{
    if(ev.target.id==='pa-overall-status'){state.overallStatus=ev.target.value;overallRefreshTable();return;}
    if(ev.target.id==='pa-overall-sort'){state.overallSort=ev.target.value;overallRefreshTable();return;}
    const themeInput=ev.target.closest('[data-pa-tr-theme]');
    if(themeInput){
      const kind=themeInput.dataset.paTrTheme;
      if(!(window.TITerritoryEvidence?.catalogue||[]).some(x=>x.id===kind))return;
      if(themeInput.checked)state.territoryThemeActive.add(kind);
      else state.territoryThemeActive.delete(kind);
      trMap?.setDocumentaryVisibility(kind,themeInput.checked);
      updateMainThematicNotes();return;
    }
    const filterMap={'pa-act-filter-state':'status','pa-act-filter-owner':'owner','pa-act-filter-place':'place'};
    if(filterMap[ev.target.id]){state.activityFilters[filterMap[ev.target.id]]=ev.target.value;refresh();return;}
    if(ev.target.id==='pa-act-compare-unit'){state.activityCompareUnit=ev.target.value;const y=window.scrollY;refresh();window.scrollTo({top:y});return;}
    if(ev.target.id==='pa-ph-filter-status'){state.physicalFilters.status=ev.target.value;const y=window.scrollY;refresh();window.scrollTo({top:y});return;}
    if(ev.target.id==='pa-ph-filter-activity'){state.physicalFilters.activity=ev.target.value;const y=window.scrollY;refresh();window.scrollTo({top:y});return;}
    const suFilters={'pa-su-filter-activity':'activity','pa-su-filter-type':'type','pa-su-filter-place':'place','pa-su-from':'from','pa-su-to':'to'};
    if(suFilters[ev.target.id]){state.supportFilters[suFilters[ev.target.id]]=ev.target.value;state.supportShowAll=false;const y=window.scrollY;refresh();window.scrollTo({top:y});return;}
    const ctFilterMap={'pa-ct-filter-state':'status','pa-ct-filter-selection':'selection','pa-ct-filter-contractor':'contractor'};
    if(ctFilterMap[ev.target.id]){state.ctFilters[ctFilterMap[ev.target.id]]=ev.target.value;state.ctPage=0;ctRefreshPart();return;}
    if(ev.target.id==='pa-ct-meta-select'){state.current=Number(ev.target.value);ctReset();refresh();return;}
    const obFilterMap={'pa-ob-type':'type','pa-ob-status':'status','pa-ob-issuer':'issuer','pa-ob-from':'from','pa-ob-to':'to'};
    if(obFilterMap[ev.target.id]){state.obFilters[obFilterMap[ev.target.id]]=ev.target.value;state.obPage=0;obRefreshPart();return;}
    if(ev.target.matches('[data-pa-tr-layer]')){trToggleLayer(ev.target.dataset.paTrLayer,ev.target.checked);return;}
    if(!['pa-year-select','pa-ig-year-select','pa-act-year-select','pa-ph-year-select','pa-ph-table-year','pa-ben-year-select','pa-bu-year-select','pa-tr-year-select','pa-su-year-select','pa-ob-year-select','pa-ct-year-select'].includes(ev.target.id))return;
    state.year=ev.target.value;state.territoryThemeActive.clear();
    if(metas().length&&!metas().some(m=>m.id===state.current))state.current=metas()[0].id;
    state.list=false;state.listCategory='all';state.territoryExpanded=false;state.activityExpanded.clear();state.qNumber='';state.qKeyword='';state.activityFilters={q:'',status:'all',owner:'all',place:'all'};state.physicalFilters={status:'all',activity:'all'};state.activityCompareUnit=null;state.activityCarouselPage=0;state.beneficiaryPlace=null;state.territorySelected=null;state.territoryGalleryPage=0;suResetFilters();obReset();ctReset();refresh();
  });
  panel.addEventListener('click',ev=>{
    const visibleChooser=panel.querySelector('.pa-meta-chooser[open]');
    if(visibleChooser&&!visibleChooser.contains(ev.target)&&!ev.target.closest('[data-pa-list]'))visibleChooser.open=false;
    if(ev.target.closest('[data-pa-overall-open]')){state.activeTab='overall';state.list=false;refresh();panel.querySelector('.pa-total-page')?.scrollIntoView({behavior:'smooth',block:'start'});return;}
    const overallMeta=ev.target.closest('[data-pa-overall-meta]');
    if(overallMeta){state.activeTab='summary';focusMeta(Number(overallMeta.dataset.paOverallMeta));return;}
    if(ev.target.closest('[data-pa-overall-export]')){overallExport();return;}
    const requestedMapTheme=ev.target.closest('[data-pa-open-theme]');
    if(requestedMapTheme){
      ev.preventDefault();
      const kind=requestedMapTheme.dataset.paOpenTheme;
      if(!(window.TITerritoryEvidence?.catalogue||[]).some(theme=>theme.id===kind))return;
      state.activeTab='territory';
      state.list=false;
      state.territoryThemeActive=new Set([kind]);
      refresh();
      requestAnimationFrame(()=>panel.querySelector('.pa-tr-primary-map')?.scrollIntoView({behavior:'instant',block:'start'}));
      return;
    }
    const tab=ev.target.closest('[data-pa-tab]');
    if(tab){const next=tab.dataset.paTab;if(!['general','summary','overall','activities','physical','beneficiaries','budget','territory','contracts','supports','observations'].includes(next))return;state.activeTab=next;state.list=false;state.territoryExpanded=false;refresh();panel.scrollIntoView({behavior:'instant',block:'start'});return;}
    if(ev.target.closest('[data-pa-ct-open]')){state.ctPanelOpen=true;ctRefreshPart();return;}
    if(ev.target.closest('[data-pa-ct-close]')){state.ctPanelOpen=false;ctRefreshPart();return;}
    if(ev.target.closest('[data-pa-ct-retry]')){state.ctError=null;state.ctLoaded=false;ctLoad();return;}
    if(ev.target.closest('[data-pa-ct-doc-close]')){panel.querySelector('#pa-ct-doc-dialog')?.close();return;}
    if(ev.target.closest('[data-pa-ct-docs]')){panel.querySelector('#pa-ct-doc-dialog')?.showModal();return;}
    const ctTab=ev.target.closest('[data-pa-ct-detail-tab]');if(ctTab){state.ctDetailTab=ctTab.dataset.paCtDetailTab;ctRefreshPart();return;}
    const ctContract=ev.target.closest('[data-pa-ct-contract]');if(ctContract){state.ctSelected=ctContract.dataset.paCtContract;state.ctPanelOpen=true;ctRefreshPart();return;}
    const ctPager=ev.target.closest('[data-pa-ct-page]');if(ctPager){state.ctPage=Math.max(0,Number(ctPager.dataset.paCtPage));ctRefreshPart();return;}
    const ctState=ev.target.closest('[data-pa-ct-filter-state]');if(ctState){state.ctFilters.status=state.ctFilters.status===ctState.dataset.paCtFilterState?'all':ctState.dataset.paCtFilterState;state.ctPage=0;ctRefreshPart();return;}
    const ctMethod=ev.target.closest('[data-pa-ct-filter-selection]');if(ctMethod){state.ctFilters.selection=state.ctFilters.selection===ctMethod.dataset.paCtFilterSelection?'all':ctMethod.dataset.paCtFilterSelection;state.ctPage=0;ctRefreshPart();return;}
    if(ev.target.closest('[data-pa-ct-export]')){ctCsvExport();return;}
    if(ev.target.closest('[data-pa-ob-close]')){ev.target.closest('dialog')?.close();return;}
    if(ev.target.closest('[data-pa-ob-retry]')){state.obError=null;state.obLoaded=false;obLoad();refresh();return;}
    if(ev.target.closest('[data-pa-ob-clear]')){obReset();obRefreshPart();return;}
    if(ev.target.closest('[data-pa-ob-search]')){const field=panel.querySelector('#pa-ob-search');if(field){state.obFilters.q=field.value;state.obPage=0;obRefreshPart();}return;}
    const obSort=ev.target.closest('[data-pa-ob-sort]');if(obSort){const field=obSort.dataset.paObSort;if(state.obSort===field)state.obSortAsc=!state.obSortAsc;else{state.obSort=field;state.obSortAsc=true;}state.obPage=0;obRefreshPart();return;}
    const obPager=ev.target.closest('[data-pa-ob-page]');if(obPager){state.obPage=Math.max(0,Number(obPager.dataset.paObPage));obRefreshPart();return;}
    const obDetail=ev.target.closest('[data-pa-ob-detail]');if(obDetail){obOpenDetail(obDetail.dataset.paObDetail);return;}
    const obToActivity=ev.target.closest('[data-pa-ob-to-activity]');if(obToActivity){const m=selected(),idx=m?.activities?.findIndex(a=>String(a.n)===obToActivity.dataset.paObToActivity)??-1;if(idx>=0){panel.querySelector('#pa-ob-dialog')?.close();state.activeTab='activities';refresh();actShowDetail(idx);}return;}
    const obAgency=ev.target.closest('[data-pa-ob-dep]');if(obAgency){state.obFilters.issuer=obAgency.dataset.paObDep;state.obPage=0;obRefreshPart();return;}
    const obStatusFilter=ev.target.closest('[data-pa-ob-status]');if(obStatusFilter){state.obFilters.status=obStatusFilter.dataset.paObStatus;state.obPage=0;obRefreshPart();return;}
    const obExportButton=ev.target.closest('[data-pa-ob-export]');if(obExportButton){obExport(obExportButton.dataset.paObExport);return;}
    if(ev.target.closest('[data-pa-su-close]')){ev.target.closest('dialog')?.close();return;}
    const suPreview=ev.target.closest('[data-pa-su-preview]');
    if(suPreview){suOpenPreview(suPreview.dataset.paSuPreview);return;}
    const supportTypeCard=ev.target.closest('[data-pa-su-type]');
    if(supportTypeCard){
      const type=supportTypeCard.dataset.paSuType;
      if(!['all','photo','document','video','certificate','folder','link'].includes(type))return;
      state.supportFilters.type=state.supportFilters.type===type&&type!=='all'?'all':type;
      state.supportShowAll=false;
      suRefreshPart();
      panel.querySelector('.pa-su-type-card[data-pa-su-type="'+state.supportFilters.type+'"]')?.focus({preventScroll:true});
      return;
    }
    if(ev.target.closest('[data-pa-su-reset]')){suResetFilters();const y=window.scrollY;refresh();window.scrollTo({top:y});return;}
    if(ev.target.closest('[data-pa-su-search]')){const input=panel.querySelector('#pa-su-search');if(input){state.supportFilters.q=input.value;const y=window.scrollY;refresh();window.scrollTo({top:y});}return;}
    if(ev.target.closest('[data-pa-su-gallery-all]')){state.supportShowAll=true;suRefreshPart();return;}
    if(ev.target.closest('[data-pa-su-recent-toggle]')){state.supportRecentAll=!state.supportRecentAll;suRefreshPart();return;}
    if(ev.target.closest('[data-pa-su-tree-root]')){state.supportFilters.activity='all';state.supportShowAll=false;suRefreshPart();return;}
    const suTree=ev.target.closest('[data-pa-su-tree-activity]');
    if(suTree){state.supportFilters.activity=suTree.dataset.paSuTreeActivity;state.supportShowAll=false;suRefreshPart();return;}
    const suToggle=ev.target.closest('[data-pa-su-tree-toggle]');
    if(suToggle){const id=suToggle.dataset.paSuTreeToggle;if(state.supportTreeOpen.has(id))state.supportTreeOpen.delete(id);else state.supportTreeOpen.add(id);suRefreshPart();return;}
    if(ev.target.closest('[data-pa-tr-dialog-close]')){ev.target.closest('dialog')?.close();return;}
    if(ev.target.closest('[data-pa-tr-gallery-all]')){panel.querySelector('#pa-tr-gallery-dialog')?.showModal();return;}
    const trGalleryButton=ev.target.closest('[data-pa-tr-gallery-page],[data-pa-tr-gallery-step]');
    if(trGalleryButton){
      const m=selected();if(!m)return;
      const total=trEvidenceCards(m).length;
      const index=Math.max(0,Math.min(total-1,state.territoryGalleryPage||0));
      state.territoryGalleryPage=trGalleryButton.hasAttribute('data-pa-tr-gallery-page')
        ?Math.max(0,Math.min(total-1,Number(trGalleryButton.dataset.paTrGalleryPage)))
        :total>1?(index+Number(trGalleryButton.dataset.paTrGalleryStep)+total)%total:0;
      const focusSelector=trGalleryButton.hasAttribute('data-pa-tr-gallery-page')
        ?'[data-pa-tr-gallery-page="'+state.territoryGalleryPage+'"]'
        :'[data-pa-tr-gallery-step="'+trGalleryButton.dataset.paTrGalleryStep+'"]';
      const container=panel.querySelector('.pa-tr-gallery');
      if(container){container.outerHTML=trGallery(m);panel.querySelector('.pa-tr-gallery '+focusSelector)?.focus({preventScroll:true});}
      return;
    }
    if(ev.target.closest('[data-pa-tr-expand-places]')){
      state.territoryExpanded=!state.territoryExpanded;
      const node=panel.querySelector('.pa-tr-places');if(node&&selected())node.outerHTML=trDetailTable(selected());
      return;
    }
    const place=ev.target.closest('[data-pa-tr-place]');
    if(place){trSelectPlace(place.dataset.paTrPlace,true);return;}
    if(ev.target.closest('[data-pa-tr-basemap]')){trChangeBasemap();return;}
    if(ev.target.closest('[data-pa-tr-fullmap]')){panel.querySelector('.pa-tr-primary-map')?.classList.toggle('pa-tr-expanded');setTimeout(()=>trMap?.invalidateSize(),160);return;}
    if(ev.target.closest('[data-pa-tr-csv]')){trExportCsv();return;}
    const geographic=ev.target.closest('[data-pa-tr-geo]');if(geographic){trDownloadGeo(geographic.dataset.paTrGeo);return;}
    const openActivity=ev.target.closest('[data-pa-tr-act-detail]');
    if(openActivity){const id=String(openActivity.dataset.paTrActDetail),idx=selected()?.activities?.findIndex(a=>String(a.n)===id)??-1;if(idx>=0){state.activeTab='activities';refresh();actShowDetail(idx);}return;}
    if(ev.target.closest('[data-pa-bu-method]')){panel.querySelector('#pa-bu-method-dialog')?.showModal();return;}
    if(ev.target.closest('[data-pa-bu-method-close]')){panel.querySelector('#pa-bu-method-dialog')?.close();return;}
    if(ev.target.closest('[data-pa-bu-docs]')){panel.querySelector('#pa-bu-doc-dialog')?.showModal();return;}
    if(ev.target.closest('[data-pa-bu-docs-close]')){panel.querySelector('#pa-bu-doc-dialog')?.close();return;}
    if(ev.target.closest('[data-pa-ben-testimony-all]')){panel.querySelector('#pa-ben-testimonials-dialog')?.showModal();return;}
    if(ev.target.closest('[data-pa-ben-testimony-close]')){panel.querySelector('#pa-ben-testimonials-dialog')?.close();return;}
    const benPlace=ev.target.closest('[data-pa-ben-place]');
    if(benPlace){
      state.beneficiaryPlace=Number(benPlace.dataset.paBenPlace);
      panel.querySelectorAll('[data-pa-ben-place]').forEach(btn=>{const chosen=btn===benPlace;btn.classList.toggle('selected',chosen);btn.setAttribute('aria-pressed',String(chosen));});
      const title=selected()&&benPlaces(selected()).places[state.beneficiaryPlace]?.name;
      const region=panel.querySelector('#pa-ben-selected-place');
      if(region)region.textContent=title?'Localidad en el Excel: '+title:'Localidad no especificada';
      return;
    }
    if(ev.target.closest('[data-pa-ph-export]')){phExport();return;}
    const chartMove=ev.target.closest('[data-pa-act-chart-step]');
    if(chartMove){const scroll=panel.querySelector('#pa-act-chart-scroll');if(scroll)scroll.scrollBy({left:Number(chartMove.dataset.paActChartStep)*Math.max(180,Math.round(scroll.clientWidth*.7)),behavior:'smooth'});return;}
    if(ev.target.closest('[data-pa-act-clear]')){state.activityFilters={q:'',status:'all',owner:'all',place:'all'};refresh();return;}
    const d=ev.target.closest('[data-pa-act-detail]');if(d){actShowDetail(Number(d.dataset.paActDetail));return;}
    if(ev.target.closest('[data-pa-act-close]')){ev.target.closest('dialog')?.close();return;}
    if(ev.target.closest('[data-pa-act-show-docs]')){panel.querySelector('#pa-act-repository-dialog')?.showModal();return;}
    const pageBtn=ev.target.closest('[data-pa-act-carousel-page]');
    if(pageBtn){state.activityCarouselPage=Number(pageBtn.dataset.paActCarouselPage);const y=window.scrollY;refresh();window.scrollTo({top:y});return;}
    const stepBtn=ev.target.closest('[data-pa-act-carousel-step]');
    if(stepBtn){const m=selected(),count=Math.max(1,Math.ceil(actFileList(m).length/3));state.activityCarouselPage=(state.activityCarouselPage+Number(stepBtn.dataset.paActCarouselStep)+count)%count;const y=window.scrollY;refresh();window.scrollTo({top:y});return;}
    const kind=ev.target.closest('[data-pa-ig-kind]');
    if(kind){state.territoryKind=kind.dataset.paIgKind;state.territoryExpanded=false;const y=window.scrollY;refresh();window.scrollTo({top:y});return;}
    if(ev.target.closest('[data-pa-ig-expand]')){state.territoryExpanded=!state.territoryExpanded;const y=window.scrollY;refresh();window.scrollTo({top:y});return;}
    if(ev.target.closest('[data-pa-ig-docs]')){panel.querySelector('#pa-ig-doc-dialog')?.showModal();return;}
    if(ev.target.closest('[data-pa-ig-doc-close]')){panel.querySelector('#pa-ig-doc-dialog')?.close();return;}
    const meta=ev.target.closest('[data-pa-meta]');if(meta){focusMeta(Number(meta.dataset.paMeta));return;}
    if(ev.target.closest('[data-pa-list]')){const chooser=panel.querySelector('.pa-meta-chooser');if(chooser){chooser.open=!chooser.open;if(chooser.open)chooser.querySelector('#pa-meta-chooser-search')?.focus({preventScroll:true});}return;}
    const kpi=ev.target.closest('[data-pa-kpi]');if(kpi){if(!currentYear())return;state.activeTab='overall';state.list=false;state.overallSearch='';state.overallStatus=kpi.dataset.paKpi;refresh();panel.querySelector('.pa-total-directory')?.scrollIntoView({behavior:'smooth',block:'start'});return;}
    const act=ev.target.closest('[data-pa-activity]');if(act){const key=selected()?.id+'-'+act.dataset.paActivity;if(state.activityExpanded.has(key))state.activityExpanded.delete(key);else state.activityExpanded.add(key);const scrollY=window.scrollY;refresh();window.scrollTo({top:scrollY});return;}
    if(ev.target.closest('[data-pa-gallery]')){
      const dialog=panel.querySelector('#pa-gallery-dialog');if(dialog && typeof dialog.showModal==='function')dialog.showModal();return;
    }
    if(ev.target.closest('[data-pa-close-gallery]')){panel.querySelector('#pa-gallery-dialog')?.close();return;}
    if(ev.target.closest('[data-pa-reload]'))load();
  });
  async function loadActivityExtras(){
    try{
      const res=await fetch('/data/plan-accion-actividades-responsables.b64.txt',{cache:'no-cache'});
      if(!res.ok)throw Error('Responsables por actividad '+res.status);
      const b64=(await res.text()).trim(),binary=atob(b64),bytes=new Uint8Array(binary.length);
      for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
      const decoded=await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
      const payload=JSON.parse(decoded);
      if(!payload?.periods?.['2025']||!payload?.periods?.['2026'])throw Error('No se encuentran ambos periodos en el archivo de responsables.');
      state.activityData=payload;state.activityError=null;
    }catch(err){state.activityError=err?.message||'Faltan los responsables por actividad';console.warn('Responsables de actividades:',err);}
    finally{state.activityLoading=false;if(state.activeTab==='activities')refresh();}
  }

  async function load(){
    state.loading=true;state.error=null;refresh();
    try{
      const res=await fetch('/data/plan-accion-2025-2026.b64.txt',{cache:'no-cache'});
      if(!res.ok)throw Error('El archivo de datos no respondió ('+res.status+').');
      const b64=(await res.text()).trim();
      if(typeof DecompressionStream==='undefined')throw Error('Este navegador requiere soporte para descompresión gzip (Chrome actualizado).');
      const binary=atob(b64), bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
      const decompressed=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
      const decoded=await new Response(decompressed).text();
      const parsed=JSON.parse(decoded);
      if(!parsed?.periods?.['2025']?.metas || !parsed?.periods?.['2026']?.metas)throw Error('No están completos los años 2025 y 2026.');
      if(parsed.periods['2025'].metas.length!==109 || parsed.periods['2026'].metas.length!==109)throw Error('El número de metas no coincide con los Excel.');
      state.data=parsed;
      trLoadFullTexts().catch(e=>console.warn('Textos territoriales:',e));
      if(metas().length&&!metas().some(m=>m.id===state.current))state.current=metas()[0].id;
      state.loading=false;refresh();
      // Load metadata separately: failure must never break the existing Resumen.
      try{
        const infoResponse=await fetch('/data/plan-accion-info-general-2025-2026.b64.txt',{cache:'no-cache'});
        if(!infoResponse.ok)throw Error('Ficha técnica '+infoResponse.status);
        const infoB64=(await infoResponse.text()).trim();
        const infoBin=atob(infoB64),infoBytes=new Uint8Array(infoBin.length);
        for(let i=0;i<infoBin.length;i++)infoBytes[i]=infoBin.charCodeAt(i);
        const infoText=await new Response(new Blob([infoBytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
        const infoParsed=JSON.parse(infoText);
        if(Object.keys(infoParsed?.periods?.['2025']?.metas||{}).length!==109 || Object.keys(infoParsed?.periods?.['2026']?.metas||{}).length!==109)throw Error('Faltan fichas por meta.');
        state.infoData=infoParsed;state.infoError=null;
      }catch(e){state.infoError=e.message||'No se pudieron leer fichas adicionales.';console.warn('Información General:',e);}
      finally{state.infoLoading=false;refresh();}
      await loadActivityExtras();
    }catch(err){state.loading=false;state.error=err?.message||'Error de lectura';refresh();console.error('Planes de Acción:',err);}
  }
  panel.addEventListener('click',ev=>{const dialog=ev.target;if(dialog?.classList?.contains('pa-gallery-dialog')||dialog?.classList?.contains('pa-ig-doc-dialog')||dialog?.classList?.contains('pa-act-dialog')||dialog?.classList?.contains('pa-ben-dialog')||dialog?.classList?.contains('pa-bu-dialog')||dialog?.classList?.contains('pa-tr-dialog')||dialog?.classList?.contains('pa-su-dialog')||dialog?.classList?.contains('pa-ob-dialog')||dialog?.classList?.contains('pa-ct-dialog'))dialog.close();});
  panel.addEventListener('scroll',ev=>{if(ev.target?.id==='pa-act-chart-scroll')actChartControls();},true);
  window.addEventListener('resize',()=>{if(state.activeTab==='activities')actChartControls();});
  panel.addEventListener('keydown',ev=>{
    const gallery=ev.target.closest('.pa-tr-gallery-carousel');
    if(gallery&&(ev.key==='ArrowLeft'||ev.key==='ArrowRight')&&!ev.target.matches('input,textarea,select')){
      const step=ev.key==='ArrowLeft'?'-1':'1';
      const button=gallery.querySelector('[data-pa-tr-gallery-step="'+step+'"]');
      if(button&&!button.disabled){ev.preventDefault();button.click();}
      return;
    }
    const row=ev.target.closest('tr[data-pa-ct-contract]');
    if(row&&(ev.key==='Enter'||ev.key===' ')){ev.preventDefault();row.click();}
  });
  load();
})();