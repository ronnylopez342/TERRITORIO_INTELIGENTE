/* Territorio Inteligente | Totalizador de todas las metas | Datos de los Excel vigentes.
   No representa un porcentaje presupuestal ponderado por montos ni una ejecución
   física unificada entre unidades heterogéneas. */
(function (root) {
  'use strict';
  const numeric = x => typeof x === 'number' && Number.isFinite(x);
  const escape = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clean = v => String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es-CO').trim();
  const int = v => new Intl.NumberFormat('es-CO',{maximumFractionDigits:0}).format(v);
  const decimal = v => new Intl.NumberFormat('es-CO',{maximumFractionDigits:1}).format(v);
  const rate = v => numeric(v) ? decimal(v*100) + '%' : '—';
  const mean = values => {const valid=values.filter(numeric);return {value:valid.length?valid.reduce((s,n)=>s+n,0)/valid.length:null,count:valid.length};};
  const statuses = [
    {key:'running',label:'En ejecución',short:'En ejecución',color:'#1677dc'},
    {key:'risk',label:'En riesgo*',short:'En riesgo',color:'#e9ac16'},
    {key:'delay',label:'Sin avance*',short:'Sin avance',color:'#e55364'},
    {key:'done',label:'Meta cumplida',short:'Cumplida',color:'#057b48'},
    {key:'unavailable',label:'Sin porcentaje',short:'Sin dato',color:'#72849a'}
  ];
  const safeStatus = (m, classify) => {try {return classify(m)?.key || 'unavailable';}catch{return 'unavailable';}};
  function measures(ctx){
    const metas=ctx.metas || [];
    const counts=Object.fromEntries(statuses.map(s=>[s.key,0]));
    metas.forEach(m=>{const code=safeStatus(m,ctx.classify);counts[code]=(counts[code]||0)+1;});
    const physical=mean(metas.map(m=>m.pct));
    const finance=mean(metas.map(m=>m.budgetPct));
    return {total:metas.length,counts,physical,finance};
  }
  function donut(m,label,color){
    const n=numeric(m.value)?Math.max(0,Math.min(100,m.value*100)):0;
    return `<div class="pa-total-donut-set"><div class="pa-total-donut" role="img" aria-label="${escape(label)}: ${rate(m.value)}; ${m.count} metas con dato" style="--pa-total-angle:${n}%;--pa-total-color:${color}"><span>${rate(m.value)}</span></div><div><strong>${escape(label)}</strong><small>Promedio simple · ${int(m.count)} metas con dato</small></div></div>`;
  }
  function ribbon(ctx,short){
    const m=measures(ctx),c=m.counts,total=m.total;
    return `<section class="pa-total-ribbon ${short?'pa-total-ribbon--short':''}" aria-label="Estado general de todas las metas del Plan de Acción">
      <div class="pa-total-ribbon-title"><div class="pa-total-ribbon-icon" aria-hidden="true">▥</div><div><h2>Totalizador del Plan</h2><p>Estado general de todas las metas · ${escape(ctx.year)}</p><small class="pa-total-state-note">Cumplidas: ${int(c.done||0)} · Sin porcentaje: ${int(c.unavailable||0)}</small>${short?'<button type="button" class="pa-total-ribbon-open" data-pa-overall-open>Ver todas las metas →</button>':''}</div></div>
      <div class="pa-total-kpis" aria-label="Distribución de estados">
        <div class="pa-total-kpi pa-total-kpi--all"><b>${int(total)}</b><span>Metas del plan</span></div>
        <div class="pa-total-kpi pa-total-kpi--running"><b>${int(c.running||0)}</b><span>En ejecución</span></div>
        <div class="pa-total-kpi pa-total-kpi--risk"><b>${int(c.risk||0)}</b><span>En riesgo*</span></div>
        <div class="pa-total-kpi pa-total-kpi--delay"><b>${int(c.delay||0)}</b><span>Sin avance*</span></div>
      </div>
      <div class="pa-total-averages">${donut(m.physical,'Ejecución física','#047a48')}${donut(m.finance,'Ejecución presupuestal','#126cd9')}</div>
    </section>`;
  }
  function highlights(ctx){
    const list=ctx.metas||[],p=list.filter(m=>numeric(m.pct)),b=list.filter(m=>numeric(m.budgetPct));
    const byPhys=[...p].sort((a,z)=>z.pct-a.pct || a.id-z.id);
    const minPhys=[...p].sort((a,z)=>a.pct-z.pct || a.id-z.id);
    const byBudget=[...b].sort((a,z)=>z.budgetPct-a.budgetPct || a.id-z.id);
    const cards=[
      {title:'Mayor avance físico reportado',meta:byPhys[0],field:'pct',tone:'green'},
      {title:'Menor avance físico reportado',meta:minPhys[0],field:'pct',tone:'yellow'},
      {title:'Mayor ejecución presupuestal reportada',meta:byBudget[0],field:'budgetPct',tone:'blue'}
    ];
    return `<section class="pa-total-highlights" aria-labelledby="pa-total-highlights-heading"><div class="pa-total-section-heading"><div><p class="pa-total-eyebrow">LECTURA DEL PERIODO</p><h3 id="pa-total-highlights-heading">Metas destacadas</h3></div><span>Valores tomados del archivo de ${escape(ctx.year)}. Comparaciones de porcentajes reportados, no de impacto.</span></div>
      <div class="pa-total-highlight-grid">${cards.map(c=>`<article class="pa-total-feature pa-total-feature--${c.tone}"><span>${c.title}</span>${c.meta?`<div class="pa-total-feature-rate">${rate(c.meta[c.field])}</div><strong>Meta ${int(c.meta.id)}</strong><p title="${escape(c.meta.name)}">${escape(c.meta.name)}</p><button type="button" data-pa-overall-meta="${c.meta.id}">Consultar esta meta →</button>`:'<p>Sin porcentaje numérico reportado para esta categoría.</p>'}</article>`).join('')}</div>
    </section>`;
  }
  function statusBadge(meta,ctx){const key=safeStatus(meta,ctx.classify);const label=ctx.classify(meta)?.label || 'Sin dato';return `<span class="pa-total-state pa-total-state--${key}">${escape(label)}</span>`;}
  function progress(val,kind){return `<div class="pa-total-progress"><b>${rate(val)}</b><div class="pa-total-track" role="img" aria-label="Avance ${rate(val)}"><i class="pa-total-fill pa-total-fill--${kind}" style="width:${numeric(val)?Math.max(0,Math.min(100,val*100)):0}%"></i></div></div>`;}
  function filtered(ctx){
    let rows=[...(ctx.metas||[])];const q=clean(ctx.query),status=ctx.status||'all';
    if(q)rows=rows.filter(m=>[m.id,m.name,m.line,m.sector,m.program,m.agency,...(m.activities||[]).map(a=>a.name)].some(v=>clean(v).includes(q)));
    if(status!=='all')rows=rows.filter(m=>safeStatus(m,ctx.classify)===status);
    const sort=ctx.sort||'id';const number=(m,field)=>numeric(m[field])?m[field]:null;
    if(sort==='name')rows.sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'es')||a.id-b.id);
    else if(sort==='physical-high'||sort==='physical-low'||sort==='budget-high'||sort==='budget-low'){
      const field=sort.startsWith('physical')?'pct':'budgetPct',ascending=sort.endsWith('low');
      rows.sort((a,b)=>{const x=number(a,field),y=number(b,field);if(x===null&&y===null)return a.id-b.id;if(x===null)return 1;if(y===null)return -1;return ascending?x-y||a.id-b.id:y-x||a.id-b.id;});
    }else rows.sort((a,b)=>a.id-b.id);
    return rows;
  }
  function table(ctx){
    const metas=filtered(ctx),total=(ctx.metas||[]).length;
    return `<p class="pa-total-table-count" aria-live="polite">Mostrando <strong>${int(metas.length)}</strong> de <strong>${int(total)}</strong> metas · ${escape(ctx.year)}</p>
      <div class="pa-total-table-scroll" tabindex="0" aria-label="Tabla de las metas, desplaza horizontalmente cuando sea necesario"><table class="pa-total-table"><thead><tr><th scope="col">N.º meta</th><th scope="col">Meta</th><th scope="col">Línea estratégica</th><th scope="col">Sector</th><th scope="col">Estado</th><th scope="col">Ejecución física</th><th scope="col">Ejecución presupuestal</th><th scope="col">Acciones</th></tr></thead><tbody>${metas.map(m=>`<tr class="${Number(ctx.selectedId)===m.id?'pa-total-row--selected':''}"><td><strong>${int(m.id)}</strong></td><td><span class="pa-total-name" title="${escape(m.name)}">${escape(m.name||'Sin denominación')}</span></td><td>${escape(m.line||'No reportada')}</td><td>${escape(m.sector||'No reportado')}</td><td>${statusBadge(m,ctx)}</td><td>${progress(m.pct,'physical')}</td><td>${progress(m.budgetPct,'finance')}</td><td><button type="button" class="pa-total-detail" data-pa-overall-meta="${m.id}" aria-label="Ver detalle de la meta ${m.id}">Ver detalle</button></td></tr>`).join('')||'<tr><td class="pa-total-noresults" colspan="8">No se encontraron metas con los criterios seleccionados.</td></tr>'}</tbody></table></div>`;
  }
  function page(ctx){
    return `<div class="pa-total-page">${ribbon(ctx,false)}${highlights(ctx)}<section class="pa-total-directory" aria-labelledby="pa-total-directory-title"><div class="pa-total-section-heading"><div><p class="pa-total-eyebrow">REGISTRO COMPLETO · ${escape(ctx.year)}</p><h3 id="pa-total-directory-title">Detalle de todas las metas del plan</h3></div><span>Explora cada meta, compara los porcentajes y abre su seguimiento individual.</span></div>
      <div class="pa-total-toolbar"><label class="pa-total-input"><span>Buscar meta, sector o palabra clave</span><input type="search" id="pa-overall-search" placeholder="Número, nombre, programa, dependencia…" value="${escape(ctx.query||'')}" autocomplete="off"></label>
        <label><span>Filtrar por estado</span><select id="pa-overall-status"><option value="all" ${(!ctx.status||ctx.status==='all')?'selected':''}>Todos los estados</option>${statuses.map(s=>`<option value="${s.key}" ${ctx.status===s.key?'selected':''}>${escape(s.short)}</option>`).join('')}</select></label>
        <label><span>Ordenar por</span><select id="pa-overall-sort">${[['id','N.º de meta'],['name','Nombre A–Z'],['physical-high','Mayor avance físico'],['physical-low','Menor avance físico'],['budget-high','Mayor ejecución presupuestal'],['budget-low','Menor ejecución presupuestal']].map(([k,n])=>`<option value="${k}" ${ctx.sort===k?'selected':''}>${n}</option>`).join('')}</select></label>
        <button type="button" class="pa-total-export" data-pa-overall-export>Descargar CSV</button>
      </div><div class="pa-total-table-region">${table(ctx)}</div></section>
      <p class="pa-total-method"><strong>Fuente:</strong> ${escape(ctx.source||'Plan de Acción Municipal')} · Año ${escape(ctx.year)}${ctx.year==='2026'?' (segundo trimestre)':''}. <strong>Metodología:</strong> los promedios físico y presupuestal son medias aritméticas de porcentajes de metas con dato numérico, con igual peso para cada meta; no son agregados de magnitudes físicas incompatibles ni ejecución presupuestal ponderada por recursos. Las alertas de color provienen de los rangos orientativos del tablero, no son certificaciones administrativas de atraso. El valor «—» señala ausencia de un porcentaje comparable.</p></div>`;
  }
  function csv(ctx){
    const fields=['Numero de meta','Meta','Linea estrategica','Sector MGA','Programa','Dependencia','Estado','Ejecucion fisica (%)','Ejecucion presupuestal (%)'];
    const quote=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
    return [fields.map(quote).join(';'),...filtered(ctx).map(m=>[m.id,m.name,m.line,m.sector,m.program,m.agency,ctx.classify(m)?.label||'Sin dato',numeric(m.pct)?decimal(m.pct*100):'',numeric(m.budgetPct)?decimal(m.budgetPct*100):''].map(quote).join(';'))].join('\r\n');
  }
  root.TIPlanTotalizador={ribbon,page,table,csv,measures};
})(window);