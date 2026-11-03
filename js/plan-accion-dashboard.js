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
  const categories = ['Resumen','Información General','Actividades','Avance Físico','Beneficiarios','Ejecución Presupuestal','Territorio','Soportes','Observaciones'];
  const categoryIcons = ['▣','ⓘ','☷','▥','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="8" cy="7" r="3"/><circle cx="16" cy="7" r="3"/><path d="M1 20v-3c0-3 3-5 7-5s7 2 7 5v3M9 20v-3c0-3 3-5 7-5s7 2 7 5v3"/></svg>','＄','♧','▰','▤'];
  const state = { year:'2025', current:101, data:null, list:false, listCategory:'all', qNumber:'', qKeyword:'', activityExpanded:new Set(), activeTab:'summary', physicalFilters:{status:'all',activity:'all'}, activityFilters:{q:'',status:'all',owner:'all',place:'all'}, activityCompareUnit:null, activityCarouselPage:0, beneficiaryPlace:null, activityData:null, activityLoading:true, activityError:null, infoData:null, infoLoading:true, infoError:null, territoryKind:'veredas', territoryExpanded:false, loading:true, error:null };
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
      <div class="pa-hero-row"><div><p class="pa-overline">PLAN DE DESARROLLO MUNICIPAL · SUBACHOQUE</p><h1>Seguimiento al Plan de Desarrollo 2024–2028</h1><p>Conoce cómo avanzamos en la construcción de un mejor Subachoque.</p></div><div class="pa-hero-motto"><strong>Transparencia</strong><span>Gestión</span><span>Resultados</span><strong>para la gente</strong></div></div>
      <div class="pa-control-row">
        <form class="pa-query" id="pa-query-form" autocomplete="off" role="search"><div class="pa-search-field"><label for="pa-query-num">Consultar por número de meta</label><div class="pa-field-inline"><input id="pa-query-num" inputmode="numeric" placeholder="Ej. 1, 25, 109..." value="${html(state.qNumber)}"/><button type="submit" aria-label="Buscar por número de meta">${searchIcon}</button></div></div><div class="pa-search-field"><label for="pa-query-key">o busca por palabra clave</label><div class="pa-field-inline"><input id="pa-query-key" placeholder="Ej. educación, vías, adulto mayor..." value="${html(state.qKeyword)}"/><button type="submit" aria-label="Buscar por palabra clave">${searchIcon}</button></div></div><div class="pa-select-wrap"><label for="pa-year-select">Filtrar por año</label><div class="pa-select-shell">${clockIcon}<select id="pa-year-select" aria-label="Filtrar los registros por año">${[2024,2025,2026,2027].map(y=>`<option value="${y}"${String(y)===state.year?' selected':''}>${y}</option>`).join('')}</select><span aria-hidden="true">⌄</span></div></div></form>
        <div class="pa-kpis">${kpiMarkup('all',available?fmtInt.format(fixed):'—','Metas del Plan','Metas numeradas registradas en los archivos del Plan de Acción')}${kpiMarkup('running',available?fmtInt.format(stats.running):'—','En ejecución','Avance del 40% al 99%: criterio visual')}${kpiMarkup('risk',available?fmtInt.format(stats.risk):'—','En riesgo*','Avance del 1% al 39%: alerta calculada')}${kpiMarkup('delay',available?fmtInt.format(stats.delay):'—','Con retraso*','Avance del 0%: alerta calculada; no es retraso acreditado')}</div>
      </div>
    </div>`;
  };
  function tabMarkup(m){return `<div class="pa-tabs" role="tablist" aria-label="Secciones del seguimiento">${categories.map((name,i)=>{const enabled=i<=5,active=(i===0&&state.activeTab==='summary')||(i===1&&state.activeTab==='general')||(i===2&&state.activeTab==='activities')||(i===3&&state.activeTab==='physical')||(i===4&&state.activeTab==='beneficiaries')||(i===5&&state.activeTab==='budget');return `<button type="button" role="tab" class="pa-tab ${active?'pa-tab--selected':''}" aria-selected="${active}" ${enabled?`data-pa-tab="${i===0?'summary':i===1?'general':i===2?'activities':i===3?'physical':i===4?'beneficiaries':'budget'}"`:'disabled title="Sección pendiente de incorporar" aria-disabled="true"'}><span class="pa-tab-icon" aria-hidden="true">${categoryIcons[i]}</span><span>${name}${i===2 && m ? ` (${m.activities.length})` : ''}</span></button>`}).join('')}</div>`;}
  function unavailableMarkup(){return `<div class="pa-empty" role="status"><span class="pa-empty-symbol" aria-hidden="true">▤</span><h2>Información no disponible para ${state.year}</h2><p>El encabezado, los buscadores, el selector anual y las secciones se mantienen visibles. No se ha incorporado un archivo de Plan de Acción de ${state.year}.</p><p>Selecciona <strong>2025</strong> o <strong>2026</strong> para consultar los datos aportados.</p></div>`;}
  function statusBar(m){
    const c=classification(m),fill=pct(m.pct),percent=pctLabel(m.pct);
    return `<div class="pa-meta-heading"><button type="button" class="pa-back" data-pa-list="true">← <span>Volver a metas</span></button><div class="pa-meta-line"><div class="pa-meta-number"><span>Meta</span><strong>${m.id}</strong></div><div class="pa-meta-title"><h2>${html(m.name)}</h2><div class="pa-meta-progress"><span class="pa-state-chip pa-state-${c.key}" title="${html(c.hint)}">${html(c.label)}</span><span class="pa-progress-track"><span style="width:${fill??0}%"></span></span><strong>${percent}</strong></div></div><div class="pa-meta-info"><div><small>Línea Estratégica</small><strong>${html(m.line||'No reportada')}</strong></div><div><small>Sector MGA</small><strong>${html(m.sector||'No reportado')}</strong></div><div><small>Programa</small><strong>${html(m.program||'No reportado')}</strong></div><div><small>Dependencia Responsable</small><strong>${html(m.agency||'No reportada')}</strong></div></div></div></div>`;
  }
  function dial(value,caption,color){const percent=pct(value),center=isNumeric(value)?pctLabel(value):'—';return `<div class="pa-dial" style="--pa-dial-color:${color};--pa-dial-fill:${percent??0}%"><div class="pa-dial-inner"><strong>${center}</strong><small>${caption}</small></div></div>`;}
  function detailRows(m){
    const display=(n,unit)=>isNumeric(n)?numberOrDash(n)+' '+html(unit||''):'—';
    const remaining=isNumeric(m.pct) ? fmtNum.format(Math.max(0,100-m.pct*100))+'%' : '—';
    const vals=[['Valor esperado cuatrienio',display(m.expected,m.unit)],['Avance registrado',pctLabel(m.pct)],['Saldo porcentual pendiente',remaining],['Línea base',display(m.base,m.unit)],['Tipo de meta',unitText(m.type)]];
    return `<div class="pa-quick-table">${vals.map(([k,v])=>`<div><span>${k}</span><strong>${v}</strong></div>`).join('')}</div>`;
  }
  function chartMarkup(m){
    const acts=m.activities||[], counts=months.map((_,i)=>acts.filter(a=>isNumeric(a.months?.[i]) && a.months[i]>0).length),cumulative=months.map((_,i)=>acts.filter(a=>a.months?.slice(0,i+1).some(v=>isNumeric(v)&&v>0)).length);
    const observedMonths=state.year==='2026'?6:12;const max=Math.max(2, ...counts.slice(0,observedMonths), ...cumulative.slice(0,observedMonths));const W=630,H=245,left=35,top=15,bottom=36,plotH=H-top-bottom,plotW=W-left-12;const band=plotW/12;
    const bars=counts.slice(0,observedMonths).map((n,i)=>{const barH=n/max*plotH;return `<rect x="${(left+i*band+band*.21).toFixed(1)}" y="${(top+plotH-barH).toFixed(1)}" width="${(band*.53).toFixed(1)}" height="${barH.toFixed(1)}" rx="3" fill="#91c9e8"><title>${fullMonths[i]}: ${n} actividades con avance reportado</title></rect>`;}).join('');
    const points=cumulative.slice(0,observedMonths).map((n,i)=>[(left+i*band+band*.49).toFixed(2),(top+plotH-n/max*plotH).toFixed(2)]);const polyline=points.map(a=>a.join(',')).join(' ');
    const ticks=[0,.25,.5,.75,1].map(t=>{const y=top+plotH*(1-t);return `<line x1="${left}" x2="${W-12}" y1="${y}" y2="${y}" stroke="#dce5eb"/><text x="30" y="${y+4}" font-size="10" text-anchor="end" fill="#667a8d">${fmtInt.format(max*t)}</text>`;}).join('');
    return `<div class="pa-plot-key"><span><i class="pa-key-bar"></i> Actividades con avance en el mes</span><span><i class="pa-key-line"></i> Acumulado sin duplicar</span></div><svg class="pa-plot" role="img" aria-label="Actividad mensual informada para la meta ${m.id}, año ${state.year}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">${ticks}${bars}<polyline points="${polyline}" stroke="#058546" stroke-width="3" fill="none" stroke-linejoin="round"/>${points.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="4" fill="#058546"/>`).join('')}${months.map((v,i)=>`<text x="${(left+i*band+band*.49).toFixed(1)}" y="${H-11}" text-anchor="middle" fill="#526479" font-size="10">${v}</text>`).join('')}</svg><p class="pa-chart-note">Conteo real de actividades con reporte mensual positivo; la línea cuenta actividades distintas acumuladas. No es porcentaje de ejecución. ${state.year==='2026'?'Fuente: segundo trimestre; julio a diciembre sin reporte.':''}</p>`;
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
    return `<div class="pa-map-layout"><div class="pa-map-view"><iframe loading="lazy" title="Mapa de referencia de Subachoque, sin localización de actividades" src="https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&amp;layer=mapnik&amp;marker=4.92614%2C-74.17299" referrerpolicy="no-referrer-when-downgrade"></iframe></div><div class="pa-location-list"><strong>${places.length?'Lugares consignados':'Sin veredas especificadas'}</strong>${places.length ? places.map(p=>`<span>● ${html(p)}</span>`).join('') : '<span>El Excel no identifica ubicaciones específicas para las actividades de esta meta.</span>'}<a class="pa-map-open" href="https://www.openstreetmap.org/#map=12/4.92614/-74.17299" target="_blank" rel="noopener noreferrer">Abrir mapa interactivo ↗</a><small>Mapa de referencia · Centro de Subachoque. No representa georreferenciación de actividades.</small></div></div>`;
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
  function card(title,content,klass=''){return `<section class="pa-card ${klass}"><h3>${title}</h3>${content}</section>`;}
  function summaryMarkup(m){
    return `<div class="pa-dashboard-cards"><div class="pa-card-row pa-row-3">${card('Avance de la Meta',`<div class="pa-progress-card">${dial(m.pct,'Ejecución de la meta','#006b3c')}${detailRows(m)}</div>`)}${card('Actividad mensual reportada '+state.year,chartMarkup(m))}${card('Ejecución Presupuestal '+state.year,budgetMarkup(m))}</div><div class="pa-card-row pa-row-mixed">${card('Número de Personas Asistidas / Beneficiadas',peopleMarkup(m))}${card('Territorio de Intervención',locationsMarkup(m))}${card('Producto de la Ejecución de la Meta',productMarkup(m))}</div><div class="pa-card-row pa-row-table">${card('Actividades del Plan de Acción '+state.year,activitiesMarkup(m),'pa-activity-card')}${card('Documentos y soportes destacados',evidenceMarkup(m),'pa-docs-card')}</div>${galleryDialogMarkup(m)}<p class="pa-method-note"><strong>Fuente:</strong> ${html(currentYear()?.source || '')}. <strong>Otras metas:</strong> ${summarize().done} al 100% y ${summarize().empty} sin porcentaje numérico. <strong>Criterios de lectura:</strong> “En ejecución” = avance de 40 a 99%; “En riesgo” = avance mayor a 0 y menor a 40%; “Con retraso*” = 0% reportado (alerta orientativa, no retraso certificado). Son alertas orientativas del tablero, no estados administrativos certificados. Los resultados y avances son los registrados en el archivo aportado.</p></div>`;
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
    return `<div class="pa-ig-meta"><button type="button" class="pa-ig-number" data-pa-list="true" title="Elegir otra meta" aria-label="Cambiar meta ${m.id}"><small>Meta</small><strong>${m.id}</strong></button><div class="pa-ig-meta-text"><h2>${html(m.name)}</h2><p>${html(m.project||'El archivo no registra una descripción complementaria del proyecto.')}</p><button type="button" class="pa-ig-change" data-pa-list="true">← Cambiar meta</button></div><span class="pa-state-chip pa-state-${c.key} pa-ig-state" title="${html(c.hint)}"><span aria-hidden="true">⌁</span>${html(c.label)}</span><div class="pa-ig-meta-fact"><span class="pa-ig-fact-icon" aria-hidden="true">▦</span><div><small>Dependencia responsable</small><strong>${igEsc(inf?.responsible || m.agency)}</strong></div></div><div class="pa-ig-meta-fact"><span class="pa-ig-fact-icon" aria-hidden="true">▣</span><div><small>Periodo del reporte</small><strong>${html(infoPeriod())}</strong></div></div></div>`;
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
    return igSection('Cobertura Territorial','territory',`<div class="pa-ig-territory-layout">${locs}<div class="pa-ig-map"><iframe loading="lazy" title="Mapa exploratorio de Subachoque. No representa ubicación geográfica verificada de intervenciones" src="https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&amp;layer=mapnik" referrerpolicy="no-referrer-when-downgrade"></iframe><div class="pa-ig-map-legend"><span>●</span> Mapa municipal de referencia · sin puntos de intervención</div><a href="https://www.openstreetmap.org/#map=12/4.92614/-74.17299" target="_blank" rel="noopener noreferrer">Abrir mapa interactivo ↗</a></div></div>`,'pa-ig-territory-card');
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
  const actCanonicalUnit=x=>{
    const v=normalizeQuery(x||'Sin unidad');
    if(['numero','n\u00famero','n\u00f9mero','unidad','unidades'].includes(v))return 'N\u00famero';
    if(['kilometros','kilometro','km'].includes(v))return 'Kil\u00f3metros';
    return String(x||'Sin unidad').trim();
  };
  function actComparison(m,filtered){
    const candidates=filtered.filter(a=>isNumeric(a.target)&&isNumeric(a.progress)&&a.target>=0);
    const groups=new Map();for(const a of candidates){const key=actCanonicalUnit(a.unit);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(a);}
    const sorted=[...groups.entries()].sort((a,b)=>b[1].length-a[1].length);
    if(!sorted.length)return '<div class="pa-act-nodata">No hay valores programados y ejecutados comparables para representar gr\u00e1ficamente.</div>';
    const chosen=groups.has(state.activityCompareUnit)?state.activityCompareUnit:sorted[0][0];const arr=groups.get(chosen)||[];
    const maxVal=Math.max(1,...arr.flatMap(a=>[a.target,a.progress]));
    const w=Math.max(430,arr.length*92+74),h=260,left=48,top=25,plotHeight=181,barBase=top+plotHeight,groupSize=(w-left-22)/arr.length;
    const svg=[];
    for(let n=0;n<=4;n++){const value=(maxVal*n/4),y=barBase-(plotHeight*n/4);svg.push(`<line x1="${left}" y1="${y}" x2="${w-10}" y2="${y}" stroke="#dfe8f0" stroke-width="1"/><text x="${left-7}" y="${y+4}" font-size="10" fill="#54718b" text-anchor="end">${html(fmtNum.format(value))}</text>`);}
    arr.forEach((a,i)=>{
      const center=left+groupSize*(i+.5),barW=Math.min(20,groupSize*.25);
      const f1=plotHeight*Math.max(0,a.target)/maxVal,f2=plotHeight*Math.max(0,a.progress)/maxVal;
      svg.push(`<rect x="${center-barW-3}" y="${barBase-f1}" width="${barW}" height="${f1}" rx="3" fill="#338cf0"><title>${html(a.n)}: Programado ${numberOrDash(a.target)} ${html(chosen)}</title></rect>`);
      svg.push(`<rect x="${center+3}" y="${barBase-f2}" width="${barW}" height="${f2}" rx="3" fill="#3caf57"><title>${html(a.n)}: Avance ${numberOrDash(a.progress)} ${html(chosen)}</title></rect>`);
      svg.push(`<text x="${center-barW/2-3}" y="${Math.max(11,barBase-f1-6)}" fill="#0a3462" font-size="11" font-weight="700" text-anchor="middle">${html(fmtNum.format(a.target))}</text><text x="${center+3+barW/2}" y="${Math.max(11,barBase-f2-6)}" fill="#176e39" font-size="11" font-weight="700" text-anchor="middle">${html(fmtNum.format(a.progress))}</text>`);
      svg.push(`<text x="${center}" y="${barBase+20}" font-size="10" fill="#29486d" text-anchor="middle">Act. ${html(a.n)}</text>`);
    });
    const options=sorted.map(([k,a])=>`<option value="${html(k)}"${k===chosen?' selected':''}>${html(k)} (${a.length})</option>`).join('');
    return `<div class="pa-act-compare-control"><span>Unidad de medida</span><select id="pa-act-compare-unit" aria-label="Filtrar gr\u00e1fico por unidad">${options}</select></div><div class="pa-act-chart-scroll" tabindex="0"><svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Barras azules de valores programados y verdes de avances para actividades con unidad ${html(chosen)}">${svg.join('')}</svg></div><div class="pa-act-chart-legend"><span><i class="pa-act-legend-blue"></i>Programado ${state.year}</span><span><i class="pa-act-legend-green"></i>Ejecutado ${state.year}</span></div><p class="pa-act-smallnote">Comparaci\u00f3n exclusivamente entre actividades con la misma unidad de medida; desplaza la gr\u00e1fica si hay muchos registros.</p>`;
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
    const content=`<div class="pa-act-dashboard">${actKeyStats(m)}${actFiltersMarkup(m)}${actTable(m,filtered)}<div class="pa-act-bottom-grid"><section class="pa-act-card"><h3>Programaci\u00f3n vs ejecuci\u00f3n por actividad</h3>${actComparison(m,filtered)}</section><section class="pa-act-card"><h3>Registro mensual de ejecuci\u00f3n ${state.year}</h3>${actTimeline(m,filtered)}</section><section class="pa-act-card"><h3>Soportes y Evidencias Destacadas</h3>${actCarousel(m)}</section></div><p class="pa-act-source"><strong>Fuente:</strong> ${html(currentYear()?.source||'Excel de plan de acci\u00f3n')} \u00b7 ${state.year==='2026'?'Segundo trimestre de 2026.':'Vigencia 2025.'} Los colores de avance son indicadores de lectura; los retrasos solo se mencionan cuando el texto original los especifica.</p></div>${actDetailDialog()}${actRepositoryDialog(m)}`;
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
    return `<div class="pa-ph-map-wrap"><div class="pa-ph-map-view"><iframe title="Mapa de referencia de Subachoque sin marcadores de intervenciones" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&amp;layer=mapnik"></iframe></div><div class="pa-ph-map-side"><strong>Ubicaciones reportadas</strong>${places.length?places.slice(0,5).map(s=>`<p>${html(s)}</p>`).join(''):'<p>No se registraron lugares espec\u00edficos.</p>'}<p class="pa-ph-map-warning">El mapa muestra Subachoque como referencia, no coordenadas de obras. No se atribuyen puntos ni estados sin evidencia geogr\u00e1fica.</p><a href="https://www.openstreetmap.org/#map=12/4.92614/-74.17299" target="_blank" rel="noopener noreferrer">Ver mapa completo \u2192</a></div></div>`;
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
    return benPanel('Mapa de beneficiarios',`<div class="pa-ben-map-area"><iframe title="Mapa interactivo de referencia de Subachoque sin marcadores de beneficiarios" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&amp;layer=mapnik"></iframe></div><div class="pa-ben-map-caption"><span class="pa-ben-map-dot"></span><span>Mapa de Subachoque (referencia geográfica, sin puntos de beneficiarios)</span></div><p class="pa-ben-territory-selection" id="pa-ben-selected-place" aria-live="polite">${chosen?'Localidad en el Excel: '+html(chosen.name):places.length?'Selecciona un lugar de la tabla para identificarlo en el listado documental.':'No hay localidades específicas verificadas en el Excel para esta meta.'}</p><a class="pa-ben-map-link" href="https://www.openstreetmap.org/#map=12/4.92614/-74.17299" target="_blank" rel="noopener noreferrer">Abrir mapa completo ↗</a>`,'pa-ben-map-card');
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
  function resultsMarkup(){
    if(state.loading)return `<div class="pa-empty"><span class="pa-spinner" aria-hidden="true"></span><h2>Cargando registros de los planes de acción...</h2><p>Preparando información de 2025 y 2026.</p></div>`;
    if(state.error)return `<div class="pa-empty"><h2>No fue posible cargar los registros</h2><p>${html(state.error)}</p><button type="button" class="pa-retry" data-pa-reload="1">Reintentar</button></div>`;
    if(!currentYear())return unavailableMarkup();
    if(state.list)return listMarkup();
    const m=selected();if(!m)return unavailableMarkup();
    return statusBar(m)+tabMarkup(m)+summaryMarkup(m);
  }
  function pageMarkup(){
    if(state.activeTab==='budget')return `<div class="pa-shell pa-general-mode pa-activities-mode pa-budget-mode">${buHero()}<section class="pa-body pa-ig-body" aria-label="Ejecución Presupuestal para ${state.year}"><div class="pa-content" id="pa-content">${buResults()}</div></section></div>`;
    if(state.activeTab==='beneficiaries')return `<div class="pa-shell pa-general-mode pa-activities-mode pa-beneficiaries-mode">${benHero()}<section class="pa-body pa-ig-body" aria-label="Beneficiarios de la meta para ${state.year}"><div class="pa-content" id="pa-content">${benResults()}</div></section></div>`;
    if(state.activeTab==='physical')return `<div class="pa-shell pa-general-mode pa-activities-mode pa-physical-mode">${physicalHero()}<section class="pa-body pa-ig-body" aria-label="Avance f\u00edsico para ${state.year}"><div class="pa-content" id="pa-content">${physicalResults()}</div></section></div>`;
    if(state.activeTab==='activities')return `<div class="pa-shell pa-general-mode pa-activities-mode">${actHero()}<section class="pa-body pa-ig-body" aria-label="Actividades para ${state.year}"><div class="pa-content" id="pa-content">${actResults()}</div></section></div>`;
    if(state.activeTab==='general')return `<div class="pa-shell pa-general-mode">${igHero()}<section class="pa-body pa-ig-body" aria-label="Información General para ${state.year}"><div class="pa-content" id="pa-content">${generalResults()}</div></section></div>`;
    const avail=!!currentYear();return `<div class="pa-shell">${topMarkup()}<section class="pa-body" aria-label="Panel de seguimiento para ${state.year}">${!avail?tabMarkup(null):''}<div class="pa-content" id="pa-content">${resultsMarkup()}</div></section></div>`;
  }
  function refresh({preserveFocus=false}={}){
    const node=preserveFocus?document.activeElement:null;const id=node?.id,sel= node?.selectionStart, selEnd=node?.selectionEnd;
    panel.innerHTML=pageMarkup();
    if(preserveFocus&&id){const replacement=panel.querySelector('#'+id);if(replacement){replacement.focus({preventScroll:true});try{replacement.setSelectionRange(sel,selEnd)}catch{}}}
  }
  function focusMeta(id){const found=metas().find(m=>m.id===id);if(!found)return;state.current=found.id;state.list=false;state.activityExpanded.clear();state.qNumber='';state.qKeyword='';state.listCategory='all';state.activityFilters={q:'',status:'all',owner:'all',place:'all'};state.physicalFilters={status:'all',activity:'all'};state.activityCompareUnit=null;state.activityCarouselPage=0;state.beneficiaryPlace=null;refresh();const header=panel.querySelector('.pa-meta-heading');header?.scrollIntoView({behavior:'smooth',block:'start'});}
  function searchAction(){
    if(!currentYear()){state.list=false;refresh();return;}
    const rawNum=state.qNumber.trim(),rawWord=normalizeQuery(state.qKeyword);
    if(/^\d+$/.test(rawNum)&&!rawWord){const exact=metas().find(x=>x.id===Number(rawNum));if(exact){focusMeta(exact.id);return;}}
    state.list=true;state.listCategory='all';refresh();panel.querySelector('.pa-meta-catalog')?.scrollIntoView({behavior:'smooth',block:'start'});
  }
  panel.addEventListener('submit',ev=>{if(ev.target.id==='pa-query-form'){ev.preventDefault();searchAction();}});
  panel.addEventListener('input',ev=>{if(ev.target.id==='pa-query-num')state.qNumber=ev.target.value.replace(/[^\d]/g,'').slice(0,3);if(ev.target.id==='pa-query-key')state.qKeyword=ev.target.value.slice(0,140);if(ev.target.id==='pa-act-search'){state.activityFilters.q=ev.target.value.slice(0,140);refresh({preserveFocus:true});}});
  panel.addEventListener('change',ev=>{
    const filterMap={'pa-act-filter-state':'status','pa-act-filter-owner':'owner','pa-act-filter-place':'place'};
    if(filterMap[ev.target.id]){state.activityFilters[filterMap[ev.target.id]]=ev.target.value;refresh();return;}
    if(ev.target.id==='pa-act-compare-unit'){state.activityCompareUnit=ev.target.value;const y=window.scrollY;refresh();window.scrollTo({top:y});return;}
    if(ev.target.id==='pa-ph-filter-status'){state.physicalFilters.status=ev.target.value;const y=window.scrollY;refresh();window.scrollTo({top:y});return;}
    if(ev.target.id==='pa-ph-filter-activity'){state.physicalFilters.activity=ev.target.value;const y=window.scrollY;refresh();window.scrollTo({top:y});return;}
    if(!['pa-year-select','pa-ig-year-select','pa-act-year-select','pa-ph-year-select','pa-ph-table-year','pa-ben-year-select','pa-bu-year-select'].includes(ev.target.id))return;
    state.year=ev.target.value;state.list=false;state.listCategory='all';state.territoryExpanded=false;state.activityExpanded.clear();state.qNumber='';state.qKeyword='';state.activityFilters={q:'',status:'all',owner:'all',place:'all'};state.physicalFilters={status:'all',activity:'all'};state.activityCompareUnit=null;state.activityCarouselPage=0;state.beneficiaryPlace=null;refresh();
  });
  panel.addEventListener('click',ev=>{
    const tab=ev.target.closest('[data-pa-tab]');
    if(tab){const next=tab.dataset.paTab;if(!['general','summary','activities','physical','beneficiaries','budget'].includes(next))return;state.activeTab=next;state.list=false;state.territoryExpanded=false;refresh();panel.scrollIntoView({behavior:'instant',block:'start'});return;}
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
    if(ev.target.closest('[data-pa-list]')){state.list=true;state.listCategory='all';refresh();return;}
    const kpi=ev.target.closest('[data-pa-kpi]');if(kpi){if(!currentYear())return;state.list=true;state.listCategory=kpi.dataset.paKpi;refresh();return;}
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
      state.data=parsed;state.loading=false;refresh();
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
  panel.addEventListener('click',ev=>{const dialog=ev.target;if(dialog?.classList?.contains('pa-gallery-dialog')||dialog?.classList?.contains('pa-ig-doc-dialog')||dialog?.classList?.contains('pa-act-dialog')||dialog?.classList?.contains('pa-ben-dialog')||dialog?.classList?.contains('pa-bu-dialog'))dialog.close();});
  load();
})();