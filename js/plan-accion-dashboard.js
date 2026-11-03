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
  const categoryIcons = ['▣','ⓘ','☷','▥','♟','＄','♧','▰','▤'];
  const state = { year:'2025', current:101, data:null, list:false, listCategory:'all', qNumber:'', qKeyword:'', activityExpanded:new Set(), activeTab:'summary', infoData:null, infoLoading:true, infoError:null, territoryKind:'veredas', territoryExpanded:false, loading:true, error:null };
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
  function tabMarkup(m){return `<div class="pa-tabs" role="tablist" aria-label="Secciones del seguimiento">${categories.map((name,i)=>{const enabled=i<=1,active=(i===0&&state.activeTab==='summary')||(i===1&&state.activeTab==='general');return `<button type="button" role="tab" class="pa-tab ${active?'pa-tab--selected':''}" aria-selected="${active}" ${enabled?`data-pa-tab="${i===0?'summary':'general'}"`:'disabled title="Sección pendiente de incorporar" aria-disabled="true"'}><span class="pa-tab-icon" aria-hidden="true">${categoryIcons[i]}</span><span>${name}${i===2 && m ? ` (${m.activities.length})` : ''}</span></button>`}).join('')}</div>`;}
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

  function resultsMarkup(){
    if(state.loading)return `<div class="pa-empty"><span class="pa-spinner" aria-hidden="true"></span><h2>Cargando registros de los planes de acción...</h2><p>Preparando información de 2025 y 2026.</p></div>`;
    if(state.error)return `<div class="pa-empty"><h2>No fue posible cargar los registros</h2><p>${html(state.error)}</p><button type="button" class="pa-retry" data-pa-reload="1">Reintentar</button></div>`;
    if(!currentYear())return unavailableMarkup();
    if(state.list)return listMarkup();
    const m=selected();if(!m)return unavailableMarkup();
    return statusBar(m)+tabMarkup(m)+summaryMarkup(m);
  }
  function pageMarkup(){
    if(state.activeTab==='general')return `<div class="pa-shell pa-general-mode">${igHero()}<section class="pa-body pa-ig-body" aria-label="Información General para ${state.year}"><div class="pa-content" id="pa-content">${generalResults()}</div></section></div>`;
    const avail=!!currentYear();return `<div class="pa-shell">${topMarkup()}<section class="pa-body" aria-label="Panel de seguimiento para ${state.year}">${!avail?tabMarkup(null):''}<div class="pa-content" id="pa-content">${resultsMarkup()}</div></section></div>`;
  }
  function refresh({preserveFocus=false}={}){
    const node=preserveFocus?document.activeElement:null;const id=node?.id,sel= node?.selectionStart, selEnd=node?.selectionEnd;
    panel.innerHTML=pageMarkup();
    if(preserveFocus&&id){const replacement=panel.querySelector('#'+id);if(replacement){replacement.focus({preventScroll:true});try{replacement.setSelectionRange(sel,selEnd)}catch{}}}
  }
  function focusMeta(id){const found=metas().find(m=>m.id===id);if(!found)return;state.current=found.id;state.list=false;state.activityExpanded.clear();state.qNumber='';state.qKeyword='';state.listCategory='all';refresh();const header=panel.querySelector('.pa-meta-heading');header?.scrollIntoView({behavior:'smooth',block:'start'});}
  function searchAction(){
    if(!currentYear()){state.list=false;refresh();return;}
    const rawNum=state.qNumber.trim(),rawWord=normalizeQuery(state.qKeyword);
    if(/^\d+$/.test(rawNum)&&!rawWord){const exact=metas().find(x=>x.id===Number(rawNum));if(exact){focusMeta(exact.id);return;}}
    state.list=true;state.listCategory='all';refresh();panel.querySelector('.pa-meta-catalog')?.scrollIntoView({behavior:'smooth',block:'start'});
  }
  panel.addEventListener('submit',ev=>{if(ev.target.id==='pa-query-form'){ev.preventDefault();searchAction();}});
  panel.addEventListener('input',ev=>{if(ev.target.id==='pa-query-num')state.qNumber=ev.target.value.replace(/[^\d]/g,'').slice(0,3);if(ev.target.id==='pa-query-key')state.qKeyword=ev.target.value.slice(0,140);});
  panel.addEventListener('change',ev=>{if(!['pa-year-select','pa-ig-year-select'].includes(ev.target.id))return;state.year=ev.target.value;state.list=false;state.listCategory='all';state.territoryExpanded=false;state.activityExpanded.clear();state.qNumber='';state.qKeyword='';refresh();});
  panel.addEventListener('click',ev=>{
    const tab=ev.target.closest('[data-pa-tab]');
    if(tab){const next=tab.dataset.paTab;if(next!=='general'&&next!=='summary')return;state.activeTab=next;state.list=false;state.territoryExpanded=false;refresh();panel.scrollIntoView({behavior:'instant',block:'start'});return;}
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
    }catch(err){state.loading=false;state.error=err?.message||'Error de lectura';refresh();console.error('Planes de Acción:',err);}
  }
  panel.addEventListener('click',ev=>{const dialog=ev.target;if(dialog?.classList?.contains('pa-gallery-dialog')||dialog?.classList?.contains('pa-ig-doc-dialog'))dialog.close();});
  load();
})();