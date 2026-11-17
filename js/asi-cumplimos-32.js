/* Territorio Inteligente / 3.2 Así cumplimos.
 * Origen: Matriz de Control Cuatrienio 2024-2027, hojas 3, 3.1 (2024) y 3.2 (2025).
 * La agregación física es orientativa. La ejecución no se inventa para 2026/2027.
 */
(() => {
  'use strict';
  const root = document.querySelector('#desarrollo-cumplimos [data-asi32-root]');
  if (!root) return;
  const years = [2024, 2025, 2026, 2027];
  const sections = [
    ['inicio', 'Inicio'], ['ejecutivo', 'Dashboard ejecutivo'], ['plan', 'Plan de desarrollo'],
    ['lineas', 'Líneas estratégicas'], ['sectores', 'Sectores'], ['programas', 'Programas'],
    ['dependencias', 'Dependencias'], ['metas', 'Metas'], ['indicadores', 'Indicadores']
  ];
  const colorYear = ['#07884d','#f7c137','#ec8430','#789d9a'];
  const state = {year:'all',line:'all',sector:'all',program:'all',owner:'all',q:'',tab:'inicio',detailOwner:null};
  let catalog = null, goals = [], details = {}, returnTab = 'ejecutivo';
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const fmt = new Intl.NumberFormat('es-CO',{maximumFractionDigits:1});
  const money = new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0});
  const sum = numbers => numbers.reduce((a,b)=>a+(Number.isFinite(b)?b:0),0);
  const mean = numbers => {const valid=numbers.filter(Number.isFinite);return valid.length?sum(valid)/valid.length:null;};
  const pct = value => Number.isFinite(value)?fmt.format(value*100)+' %':'Sin reporte';
  const compact = n => !Number.isFinite(n)?'Sin dato':n>=1e9?'$ '+fmt.format(n/1e9)+' mil M':n>=1e6?'$ '+fmt.format(n/1e6)+' M':money.format(n);
  const ids = name => (name==='line'?'lines':name==='sector'?'sectors':name==='program'?'programs':'owners');
  const unique = arr => new Set(arr).size;
  const sourceNote = 'Fuente: Matriz de Control Cuatrienio 2024–2027 · Plan Indicativo + Planes de Acción 2024 y 2025. Promedios físicos orientativos, no certificación oficial.';
  function row(a) {return {id:a[0],line:a[1],sector:a[2],program:a[3],owner:a[4],name:a[5],bpin:a[6],physical:a[7],indicative:a[8],action:a[9],paid:a[10]};}
  function opt(value,label,selected) {return '<option value="'+esc(value)+'"'+(String(selected)===String(value)?' selected':'')+'>'+esc(label)+'</option>';}
  function selectedRows() {
    const q=state.q.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    return goals.filter(g=>
      (state.line==='all'||String(g.line)===state.line)&&
      (state.sector==='all'||String(g.sector)===state.sector)&&
      (state.program==='all'||String(g.program)===state.program)&&
      (state.owner==='all'||String(g.owner)===state.owner)&&
      (!q||[g.id,g.name,g.bpin,catalog.lines[g.line],catalog.sectors[g.sector],catalog.programs[g.program],catalog.owners[g.owner]].join(' ').toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(q))
    );
  }
  function yearsToDisplay(){return state.year==='all'?[0,1,2,3]:[years.indexOf(Number(state.year))];}
  function latestReported(){return state.year==='all'?1:years.indexOf(Number(state.year));}
  function stat(rows){
    const selected=yearsToDisplay();
    return {
      metas:rows.length,lines:unique(rows.map(x=>x.line)),sectors:unique(rows.map(x=>x.sector)),programs:unique(rows.map(x=>x.program)),owners:unique(rows.map(x=>x.owner)),
      indicative:sum(rows.flatMap(x=>selected.map(i=>x.indicative[i]))),
      action:sum(rows.flatMap(x=>selected.map(i=>x.action[i]))),
      paid:sum(rows.flatMap(x=>selected.map(i=>x.paid[i]))),
      report:rows.flatMap(x=>selected.map(i=>x.physical[i])).filter(Number.isFinite).length
    };
  }
  function physical(rows,yi){return mean(rows.map(r=>r.physical[yi]));}
  function budget(rows,yi){
    const valid=rows.filter(r=>Number.isFinite(r.action[yi])&&Number.isFinite(r.paid[yi]));
    const b=sum(valid.map(r=>r.action[yi]));
    return {b,p:sum(valid.map(r=>r.paid[yi])),n:valid.length};
  }
  function financialRatio(rows,yi){const b=budget(rows,yi);return b.n&&b.b>0?b.p/b.b:null;}
  function kpi(label,value,description){return '<article class="asi32-kpi"><span>'+esc(label)+'</span><strong class="asi32-kpi-val">'+esc(value)+'</strong><small>'+esc(description)+'</small></article>';}
  function topCards(rows){
    const s=stat(rows);const selection=state.year==='all'?'Cuatrienio 2024–2027':'Vigencia '+state.year;
    return '<div class="asi32-kpis" aria-label="Indicadores generales del filtro">'+
      kpi('Metas producto',s.metas,'Registros únicos, '+selection)+kpi('Líneas estratégicas',s.lines,'Presentes en la selección')+
      kpi('Sectores MGA',s.sectors,'Clasificación del Excel')+kpi('Programas',s.programs,'Programas identificados')+
      kpi('Dependencias',s.owners,'Responsables en la selección')+kpi('Presupuesto programado',fmt.format(s.indicative/1e9)+' mil millones','COP · Plan Indicativo · '+selection)+'</div>';
  }
  function pageTitle(title,desc,kicker){return '<div class="asi32-blockhead"><div><span class="asi32-eyebrow">'+esc(kicker||'Así cumplimos · 3.2')+'</span><h2>'+esc(title)+'</h2>'+(desc?'<p>'+esc(desc)+'</p>':'')+'</div></div>';}
  function bar(value,tone){return '<span class="asi32-track"><span class="asi32-fill" style="width:'+Math.max(0,Math.min(100,(value||0)*100)).toFixed(2)+'%;background:'+esc(tone||'#0b8653')+'"></span></span>';}
  function mini(value,year,tone){return '<span class="asi32-mini">'+bar(value,tone||colorYear[years.indexOf(Number(year))]||'#0c8554')+'<strong>'+pct(value)+'</strong></span>';}
  function goPlanButton(){return '<button class="asi32-action asi32-action--ghost" type="button" data-asi-go-plan>Consultar Planes de Acción 3.3 ↗</button>';}
  function annualCards(rows){
    return '<article class="asi32-card"><h3>Ejecución física por vigencia</h3><p class="asi32-sub">Promedio simple de las metas con porcentaje disponible</p><div class="asi32-year-list">'+
      years.map((year,i)=>'<div class="asi32-year-row"><span>'+year+'</span>'+bar(physical(rows,i),colorYear[i])+'<strong>'+pct(physical(rows,i))+'</strong></div>').join('')+
      '</div><div class="asi32-highlight">'+esc('Los años 2026 y 2027 están programados, pero sus hojas de ejecución anual no contienen registros. Un campo vacío nunca se interpreta como 0 %.')+'</div></article>';
  }
  function ownerBar(rows){
    const yi=latestReported(),year=years[yi],items=catalog.owners.map((name,idx)=>{
      const subset=rows.filter(r=>r.owner===idx);
      if(!subset.length)return null;
      const fys=physical(subset,yi),bud=budget(subset,yi);
      const pay=bud.n&&bud.b>0?bud.p/bud.b:null;
      return {id:idx,name,metas:subset.length,fys,pay,budget:bud};
    }).filter(Boolean);
    const observed=items.flatMap(x=>[x.fys,x.pay]).filter(Number.isFinite);
    const ceiling=Math.max(1,Math.ceil(Math.max(1,...observed)*5)/5);
    const isEmpty=!observed.length;
    const bar=(x,k,tone)=>{
      const val=x[k],height=Number.isFinite(val)?Math.max(0,Math.min(100,val/ceiling*100)):0;
      return '<span class="asi32-owner-col asi32-owner-col--'+k+'"><span class="asi32-owner-value">'+pct(val)+'</span>'+
        '<span class="asi32-owner-bartrack" aria-hidden="true">'+
        (Number.isFinite(val)?'<span class="asi32-owner-bar" style="height:'+height.toFixed(2)+'%;background:'+tone+'"></span>':
          '<span class="asi32-owner-bar--empty">Sin dato</span>')+'</span></span>';
    };
    const groups=items.map(x=>
      '<button type="button" class="asi32-owner-group" data-asi-owner="'+x.id+'" '+
        'aria-label="Abrir ficha de '+esc(x.name)+', avance físico '+pct(x.fys)+', pagos respecto al saldo definitivo '+pct(x.pay)+'">'+
        '<span class="asi32-owner-bars">'+bar(x,'fys','#f1bf2c')+bar(x,'pay','#19804b')+'</span>'+
        '<span class="asi32-owner-name">'+esc(x.name)+'</span>'+
        '<span class="asi32-owner-count">'+x.metas+' metas · Ver detalle ↗</span></button>').join('');
    const list=items.map(x=>
      '<button type="button" class="asi32-chart-item" data-asi-owner="'+x.id+'" aria-label="Ver ficha de '+esc(x.name)+'">'+
        '<span class="asi32-label"><strong>'+esc(x.name)+'</strong><small>'+x.metas+' metas · '+(x.budget.n?'Con datos presupuestales':'Sin informe presupuestal')+'</small></span>'+
        mini(x.fys,year,'#f1bf2c')+mini(x.pay,year,'#19804b')+'<span aria-hidden="true">↗</span></button>').join('');
    const title='Avance consolidado del Plan de Acción '+year+' · Secretarías y entidades';
    return '<section class="asi32-block asi32-owner-section" data-asi-owner-section>'+
      pageTitle(title,'Comparativo físico y financiero basado en la matriz. Selecciona una entidad para consultar sus metas.','Seguimiento del Plan de Acción')+
      '<article class="asi32-card asi32-owner-card">'+
        '<div class="asi32-owner-topline"><div><strong>Comparación por responsable</strong><small>Vigencia: '+year+
          (state.year==='all'?' · Último año con ejecución reportada':' · Filtro seleccionado')+'</small></div>'+
          '<div class="asi32-owner-legend"><span><i style="background:#f1bf2c"></i>Ejecución física promedio</span>'+
            '<span><i style="background:#19804b"></i>Pagos / saldo definitivo</span></div></div>'+
        (isEmpty?
          '<div class="asi32-empty asi32-owner-no-data" role="status"><strong>Sin reporte de ejecución para '+year+'.</strong>'+
            '<p>La matriz tiene programación 2024–2027, pero no resultados físicos ni pagos documentados de esta vigencia. Puedes filtrar 2024 o 2025.</p></div>':
          '<div class="asi32-owner-scroll" role="region" tabindex="0" aria-label="Gráfica de columnas de responsables">'+
            '<div class="asi32-owner-plot" style="--owner-max:'+ceiling+'">'+
              '<div class="asi32-owner-axis" aria-hidden="true"><span>'+pct(ceiling)+'</span><span>'+pct(ceiling*.75)+'</span>'+
                 '<span>'+pct(ceiling*.5)+'</span><span>'+pct(ceiling*.25)+'</span><span>0 %</span></div>'+
              '<div class="asi32-owner-groups">'+groups+'</div></div></div>')+
        '<p class="asi32-source">Amarillo: promedio simple de porcentajes físicos reportados por las metas de cada entidad. Verde: pagos / saldo definitivo de esas metas en '+year+'. Son indicadores diferentes, no un porcentaje oficial de cumplimiento global. Los valores de ejemplo 2026 del Word no son resultados del Excel.</p>'+
      '</article>'+
      (!isEmpty?'<details class="asi32-owner-table"><summary>Ver comparación numérica detallada por secretaría</summary>'+
        '<div class="asi32-chart-list">'+list+'</div></details>':'')+
      '</section>';
  }
  function homeProgress(rows){
    const subset=yearsToDisplay(),all=subset.length===4;
    const items=years.map((y,i)=>({year:y,index:i,avg:physical(rows,i),count:rows.filter(r=>Number.isFinite(r.physical[i])).length})).filter(x=>subset.includes(x.index));
    return '<article class="asi32-card asi32-home-progress" aria-labelledby="asi32-progress-title">'+
      '<div class="asi32-home-cardhead"><div><span class="asi32-eyebrow">Seguimiento físico · Matriz de Control</span><h3 id="asi32-progress-title">Avances del Plan de Desarrollo</h3>'+
      '<p>Porcentaje promedio de metas con avance documentado, por vigencia.</p></div><span class="asi32-home-tag">Escala de referencia: 100 %</span></div>'+
      '<div class="asi32-plot-scroll" tabindex="0" role="region" aria-label="Columnas anuales de avance físico"><div class="asi32-progress-columns">'+
      '<div class="asi32-vcolumn"><strong>100 %</strong><div class="asi32-vtrack"><span style="height:100%;background:#087a4e"></span></div><b>Referencia anual</b><small>Escala, no ejecución</small></div>'+
      '<div class="asi32-home-annual">'+items.map(item=>'<div class="asi32-vcolumn asi32-home-annual-item"><strong class="'+(item.avg===null?'asi32-home-no-data':'asi32-home-annual-value')+'">'+pct(item.avg)+'</strong>'+
        '<div class="asi32-vtrack">'+(item.avg===null?'<div class="asi32-home-missing">Sin datos de ejecución</div>':'<span style="height:'+Math.min(100,item.avg*100).toFixed(4)+'%;background:'+colorYear[item.index]+'"></span>')+'</div>'+
        '<b>'+item.year+'</b><small>'+(item.avg===null?'Sin reporte':item.count+' de '+rows.length+' metas con avance informado')+'</small></div>').join('')+
      '</div></div></div>'+
      '<div class="asi32-home-method"><strong>Cómo interpretar este gráfico</strong><p>Los porcentajes son promedios simples de las metas que tienen dato; no representan el cumplimiento ponderado u oficial de todo el cuatrienio. '+(all?'2026 y 2027 están programados, pero no registran ejecución.':'El filtro muestra únicamente la vigencia seleccionada.')+'</p></div>'+
      '<p class="asi32-source">'+esc(sourceNote)+'</p></article>';
  }
  function homeFinance(rows){
    const subset=yearsToDisplay(),amounts=years.map((y,i)=>sum(rows.map(r=>r.indicative[i]))),max=Math.max(1,...amounts);
    return '<article class="asi32-card asi32-home-finance" aria-labelledby="asi32-finance-title">'+
      '<div class="asi32-home-cardhead"><div><span class="asi32-eyebrow">Recursos y ejecución financiera</span><h3 id="asi32-finance-title">Programación y pagos</h3>'+
      '<p>Plan Indicativo frente a pagos informados en el Plan de Acción.</p></div></div>'+
      '<div class="asi32-home-finance-rows">'+years.map((year,i)=>{
        if(!subset.includes(i))return '';
        const b=budget(rows,i),has=b.n>0,planned=amounts[i];
        return '<div class="asi32-home-finance-row"><div class="asi32-home-finance-label"><strong>'+year+'</strong><span>Programado: $ '+fmt.format(planned/1e6)+' millones COP</span></div>'+
          '<div class="asi32-home-finance-bars"><div title="Programado: '+money.format(planned)+'">'+bar(planned/max,'#128258')+'</div>'+
          (has?'<div title="Pagos informados: '+money.format(b.p)+'">'+bar(b.p/max,'#d7a619')+'</div><small class="asi32-home-paid">Pagos informados: $ '+fmt.format(b.p/1e6)+' millones COP</small>':
          '<small class="asi32-home-no-data">Pagos: sin reporte</small>')+'</div></div>';
      }).join('')+'</div>'+
      '<div class="asi32-legend"><span><i class="asi32-dot" style="background:#128258"></i>Presupuesto programado</span>'+
      '<span><i class="asi32-dot" style="background:#d7a619"></i>Pagos reportados</span></div>'+
      '<p class="asi32-source">Programación del Plan Indicativo y pagos del Plan de Acción son conceptos distintos. 2026 y 2027 no tienen reportes de pagos en sus hojas.</p>'+
      goPlanButton()+'</article>';
  }
  function homeStructure(rows){
    const items=catalog.lines.map((label,index)=>({label,index,rows:rows.filter(r=>r.line===index)})).filter(x=>x.rows.length);
    return '<article class="asi32-card asi32-home-lines"><div class="asi32-home-cardhead"><div><span class="asi32-eyebrow">Organización del Plan</span>'+
      '<h3>Líneas estratégicas</h3><p>Distribución de metas producto en la selección actual.</p></div></div>'+
      '<div class="asi32-home-lines-list">'+items.map(x=>
        '<button type="button" class="asi32-home-line" data-asi-home-line="'+x.index+'"><span class="asi32-home-line-name">'+esc(x.label)+'</span>'+
        '<span class="asi32-home-line-bar">'+bar(x.rows.length/Math.max(1,rows.length),'#248866')+'</span>'+
        '<strong>'+x.rows.length+' metas</strong><span aria-hidden="true">›</span></button>').join('')+'</div>'+
      '<p class="asi32-source">El número de metas representa registros de la matriz, no un porcentaje de ejecución. Selecciona una línea para explorar sus metas.</p></article>';
  }
  function homeCoverage(rows){
    const subset=yearsToDisplay();
    return '<article class="asi32-card asi32-home-coverage"><div class="asi32-home-cardhead"><div><span class="asi32-eyebrow">Calidad y cobertura de la fuente</span>'+
      '<h3>¿Qué información está disponible?</h3><p>Antes de interpretar las gráficas, comprueba cuántas metas tienen reporte.</p></div></div>'+
      '<div class="asi32-home-coverage-grid">'+years.map((year,i)=>{
        if(!subset.includes(i))return '';
        const count=rows.filter(r=>Number.isFinite(r.physical[i])).length;
        return '<div class="asi32-home-coverage-item"><span>'+year+'</span><strong>'+(count?count+' / '+rows.length:'Sin reporte')+'</strong>'+
          '<small>'+(count?'Metas con porcentaje físico':'Hoja anual no diligenciada')+'</small></div>';
      }).join('')+'</div>'+
      '<div class="asi32-home-method"><strong>Sobre los datos</strong><p>Los cuatro años están contemplados en la programación; únicamente 2024 y 2025 registran ejecución física en las hojas anuales de la matriz compartida. La ausencia de datos no se interpreta como cero.</p></div></article>';
  }
  function columns(items,label,formatValue=pct){
    const valid=items.map(x=>x.value).filter(Number.isFinite);
    const max=Math.max(1,...valid);
    return '<div class="asi32-plot-scroll" tabindex="0" role="region" aria-label="'+esc(label)+'"><div class="asi32-data-columns" style="--columns:'+Math.max(1,items.length)+'">'+items.map(x=>
      '<div class="asi32-vcolumn"><strong>'+esc(formatValue(x.value))+'</strong><div class="asi32-vtrack">'+
      (Number.isFinite(x.value)?'<span style="height:'+(Math.max(0,x.value)/max*100).toFixed(4)+'%;background:'+esc(x.color||'#087d50')+'"></span>':'<div class="asi32-home-missing">Sin reporte</div>')+
      '</div><b>'+(x.goal?'<button type="button" class="asi32-meta-link" data-asi-goal="'+x.goal+'">'+esc(x.label)+'</button>':esc(x.label))+'</b><small>'+esc(x.note||'')+'</small></div>').join('')+'</div></div>';
  }
  function pairedExecution(rows){
    const items=yearsToDisplay().flatMap(i=>{
      const count=rows.filter(r=>Number.isFinite(r.physical[i])).length,b=budget(rows,i);
      return [{label:years[i]+' · Física',value:physical(rows,i),color:'#e6b322',note:count+' de '+rows.length+' metas con reporte'},
        {label:years[i]+' · Pagos / saldo',value:financialRatio(rows,i),color:'#138151',note:b.n+' de '+rows.length+' metas con ambos valores'}];
    });
    return '<article class="asi32-card asi32-paired"><h3>Ejecución física y presupuestal</h3><p class="asi32-sub">Dos columnas por vigencia, sin sumar porcentajes anuales.</p>'+columns(items,'Ejecución física y pagos respecto al saldo definitivo')+
      '<p class="asi32-source">Física: promedio simple de porcentajes de metas con reporte. Financiera: suma de pagos / suma del saldo definitivo de las mismas metas con ambos campos numéricos y denominador positivo. Son medidas diferentes. Escala compartida: de 0 % al mayor valor entre 100 % y los reportes visibles. Los años sin reporte se conservan vacíos.</p></article>';
  }
  function financialStages(rows){
    const selected=yearsToDisplay(),stages=['Saldo definitivo','CDP','Registros presupuestales','Obligaciones','Pagos'];
    const tones=['#127db5','#238c58','#ed9039','#348f9a','#c25255'];
    const items=stages.map((label,col)=>{
      const values=rows.flatMap(r=>selected.map(i=>details[r.id]?.financial[i][col])).filter(Number.isFinite);
      return {label,value:values.length?sum(values):null,color:tones[col],note:values.length+' de '+(rows.length*selected.length)+' campos meta–año'};
    });
    return '<article class="asi32-card asi32-stages"><h3>Gestión financiera · Cinco etapas del Plan de Acción</h3><p class="asi32-sub">'+
      (state.year==='all'?'Cuatrienio seleccionado; importes reportados únicamente en 2024 y 2025.':'Vigencia '+state.year)+
      '</p>'+columns(items,'Cinco etapas financieras en millones de pesos',v=>Number.isFinite(v)?'$ '+fmt.format(v/1e6)+' M':'Sin reporte')+
      '<p class="asi32-source">Valores en millones de COP; altura proporcional al mayor importe visible (base cero). Campos exactos AI:AM (2024) y AR:AV (2025), una fila resumen por meta. El saldo definitivo no se suma a la programación del Plan Indicativo. Obligaciones es causación de cuentas; la matriz no identifica una etapa independiente de facturación. Las etapas no se suman entre sí.</p></article>';
  }
  function pendingSources(){return '<article class="asi32-card asi32-pending"><h3>Estados de metas y resultados certificados</h3><p class="asi32-sub">Fuentes por completar</p><p>La distribución circular por riesgo o retraso requiere umbrales, fechas de corte y una metodología oficial. La matriz no aporta esa clasificación. Por eso no se asignan estados ni colores de riesgo a las metas.</p><p class="asi32-source">Logros certificados, noticias y fotografías atribuibles: pendientes de validación institucional. Los textos e imágenes ilustrativos del Word no certifican resultados.</p></article>';}
  function start(rows){
    return '<section class="asi32-block asi32-home-intro">'+
      pageTitle('Inicio · Seguimiento del cuatrienio 2024–2027',
        'Consulta de metas producto con información física y financiera exclusivamente de la Matriz de Control.',
        'Así cumplimos · 3.2')+
      '<div class="asi32-home-lead"><strong>Vista general</strong><span>Elige vigencia, línea, sector, programa o dependencia para actualizar todas las cifras de esta página.</span><button class="asi32-owner-shortcut" data-asi-show-exec type="button">Ver gráfica de las 8 secretarías ↗</button></div>'+
      '<div class="asi32-home-main-grid">'+homeProgress(rows)+homeFinance(rows)+'</div></section>'+
      '<section class="asi32-block asi32-home-bottom">'+
      '<div class="asi32-home-bottom-grid">'+homeStructure(rows)+homeCoverage(rows)+'</div></section>';
  }
  function executive(rows){
    return '<section class="asi32-block">'+pageTitle('Dashboard ejecutivo',
      'Lectura comparativa de la ejecución física y los pagos reportados por las secretarías y entidades.','Seguimiento del cuatrienio')+
      '</section>'+ownerBar(rows)+
      '<section class="asi32-block">'+pairedExecution(rows)+'</section><section class="asi32-block">'+financialStages(rows)+'</section>'+pendingSources();
  }
  function plan(rows){
    const lines=catalog.lines.map((name,id)=>({name,id,rows:rows.filter(r=>r.line===id)})).filter(x=>x.rows.length);
    return '<section class="asi32-block">'+pageTitle('Plan de Desarrollo · Programación y seguimiento por línea','Comparación por línea y vigencia. Desplázate dentro de la tabla para consultar todos los campos.','Plan 2024–2027')+
      '<div class="asi32-table-scroll" tabindex="0" role="region" aria-label="Matriz anual por línea estratégica"><table class="asi32-table asi32-plan-table"><thead><tr><th>Línea estratégica</th><th>Año</th><th>Reportes físicos</th><th>Promedio físico</th><th>Programación Indicativo COP</th><th>Saldo definitivo COP</th><th>Pagos COP</th><th>Pagos / saldo</th><th>Explorar</th></tr></thead><tbody>'+
      lines.map(x=>yearsToDisplay().map(i=>{const b=budget(x.rows,i),n=x.rows.filter(r=>Number.isFinite(r.physical[i])).length;
        return '<tr><th scope="row">'+esc(x.name)+'</th><td>'+years[i]+'</td><td>'+n+' / '+x.rows.length+'</td><td>'+pct(physical(x.rows,i))+'</td><td>'+money.format(sum(x.rows.map(r=>r.indicative[i])))+'</td><td>'+esc(b.n?money.format(b.b):'Sin reporte')+'</td><td>'+esc(b.n?money.format(b.p):'Sin reporte')+'</td><td>'+pct(financialRatio(x.rows,i))+'</td><td><button type="button" class="asi32-action" data-asi-drill="line" data-index="'+x.id+'">Ver metas</button></td></tr>';
      }).join('')).join('')+'</tbody></table></div><p class="asi32-source">Programación: Plan Indicativo AV, CI, DU y FG. Ejecución: resúmenes de los planes de acción; blancos excluidos del promedio, nunca tratados como cero. La programación no equivale al saldo definitivo. Las cifras de cada línea respetan los filtros; el botón permite consultar sus metas.</p>'+goPlanButton()+'</section>';
  }
  function grouping(rows,kind){
    const dict=catalog[ids(kind)];const title=kind==='line'?'Líneas estratégicas':kind==='sector'?'Sectores MGA':kind==='program'?'Programas':'Dependencias responsables';
    const desc='Explora '+title.toLowerCase()+' y profundiza hasta la ficha de cada meta.';
    return '<section class="asi32-block">'+pageTitle(title,desc,'Visor por clasificación')+'<div class="asi32-section-grid">'+dict.map((value,index)=>{
      const sub=rows.filter(r=>r[kind]===index);if(!sub.length)return '';
      const y=latestReported(),av=physical(sub,y),bud=budget(sub,y);
      return '<article class="asi32-group"><span class="asi32-eyebrow">'+sub.length+' metas asociadas</span><h3>'+esc(value)+'</h3><div class="asi32-pills"><span class="asi32-pill">'+unique(sub.map(r=>r.sector))+' sectores</span><span class="asi32-pill">'+unique(sub.map(r=>r.program))+' programas</span></div>'+
        '<div class="asi32-group-meta">Avance físico informado '+years[y]+': '+pct(av)+' · Pagos documentados: '+compact(bud.n?bud.p:null)+'</div>'+
        '<button class="asi32-action" type="button" data-asi-drill="'+kind+'" data-index="'+index+'">'+(kind==='owner'?'Ver ficha y todas las metas':'Explorar metas')+' ↗</button></article>';
    }).join('')+'</div></section>';
  }
  function goalCard(r){
    const which=yearsToDisplay();const annual=which.map(i=>{
      const p=r.physical[i],b=r.action[i],paid=r.paid[i];
      return '<div class="asi32-finance"><strong>'+years[i]+'</strong>'+bar(p,colorYear[i])+'<strong>'+pct(p)+'</strong></div>'+
        '<small>Programado en Plan Indicativo: '+compact(r.indicative[i])+'. '+(Number.isFinite(b)?'Saldo definitivo: '+compact(b)+' · Pagos: '+compact(paid):'Sin ejecución presupuestal registrada')+'</small>';
    }).join('');
    return '<article class="asi32-goal" id="asi32-meta-'+r.id+'" tabindex="-1"><div class="asi32-goal-meta"><span class="asi32-goal-number">META '+r.id+'</span><small>BPIN '+esc(r.bpin||'no informado')+'</small></div>'+
      '<h3>'+esc(r.name)+'</h3><div class="asi32-pills"><span class="asi32-pill">'+esc(catalog.owners[r.owner])+'</span><span class="asi32-pill">'+esc(catalog.lines[r.line])+'</span></div>'+
      '<small><strong>Sector:</strong> '+esc(catalog.sectors[r.sector])+'</small><small><strong>Programa:</strong> '+esc(catalog.programs[r.program])+'</small>'+annual+'</article>';
  }
  function metas(rows){
    return '<section class="asi32-block">'+pageTitle('Metas producto','Cada meta conserva su redacción del Excel, sector, programa, responsable, programación y ejecución por año.','Seguimiento desde la matriz')+
      '<p class="asi32-filter-count">'+rows.length+' metas visibles con los filtros actuales</p><div class="asi32-goals">'+(rows.length?rows.map(goalCard).join(''):'<div class="asi32-empty">No hay metas con estos filtros.</div>')+'</div></section>';
  }
  function indicatorPage(rows){
    return '<section class="asi32-block">'+pageTitle('Indicadores de metas producto','Lectura física anual y financiera de las 109 metas del Plan Indicativo.','Seguimiento reportado')+
      '<p class="asi32-alert">Los porcentajes de ejecución 2024–2025 proceden de los resúmenes de cada meta; 2026–2027 no están reportados. No es correcto presentar un cero por ausencia de datos.</p>'+annualCards(rows)+
      '<div class="asi32-goals" style="margin-top:17px">'+rows.map(goalCard).join('')+'</div></section>';
  }
  function detailOwner(rows){
    const idx=state.detailOwner;if(idx===null)return grouping(rows,'owner');
    const label=catalog.owners[idx],sub=rows.filter(r=>r.owner===idx);
    const s=stat(sub),yy=latestReported(),av=physical(sub,yy),fin=budget(sub,yy);
    return '<section class="asi32-block"><button type="button" class="asi32-action asi32-action--ghost" data-asi-back>← Regresar al '+(returnTab==='ejecutivo'?'consolidado':'listado de dependencias')+'</button>'+
      '<header class="asi32-detail-banner"><span class="asi32-eyebrow" style="color:#bdecd3">Detalle institucional · '+(state.year==='all'?'Cuatrienio 2024–2027':years[yy])+'</span><h2>'+esc(label)+'</h2><p>Información de la entidad y sus metas, según los filtros generales.</p></header>'+
      '<div class="asi32-grid-3"><article class="asi32-card"><h3>Información estratégica</h3><p class="asi32-sub">Estructura de la entidad dentro del plan</p>'+[
        [unique(sub.map(r=>r.line)),'Líneas estratégicas'],[unique(sub.map(r=>r.sector)),'Sectores MGA'],[unique(sub.map(r=>r.program)),'Programas'],[sub.length,'Metas producto']].map(x=>'<div class="asi32-finance" style="grid-template-columns:55px 1fr"><strong style="font-size:24px;color:#0b8653">'+x[0]+'</strong><span>'+x[1]+'</span></div>').join('')+'</article>'+
      '<article class="asi32-card"><h3>Presupuesto de la entidad</h3><p class="asi32-sub">Saldo definitivo del Plan de Acción '+years[yy]+(state.year==='all'?' · Última vigencia con reporte':'')+'</p><strong style="font-size:clamp(22px,2.5vw,34px);color:#106a47">'+compact(fin.n?fin.b:null)+'</strong><p>Pagos informados: <strong>'+compact(fin.n?fin.p:null)+'</strong></p><p class="asi32-source">'+fin.n+' de '+sub.length+' metas con datos financieros. Plan Indicativo '+(state.year==='all'?'2024–2027':state.year)+': '+compact(s.indicative)+' programados.</p></article>'+
      '<article class="asi32-card"><h3>Logros certificados</h3><p class="asi32-sub">Fuente pendiente de validación institucional</p><p>Los avances de la matriz son reportes de seguimiento. No se atribuyen obras, fotografías o logros certificados a esta entidad sin sus soportes.</p></article></div></section><section class="asi32-block">'+pairedExecution(sub)+'</section>'+goalComparison(sub)+metas(sub);
  }
  function goalComparison(rows){
    const i=latestReported(),items=rows.flatMap(r=>[
      {label:'Meta '+r.id+' · Física',value:r.physical[i],color:'#e6b322',goal:r.id},
      {label:'Meta '+r.id+' · Pagos / saldo',value:Number.isFinite(r.paid[i])&&Number.isFinite(r.action[i])&&r.action[i]>0?r.paid[i]/r.action[i]:null,color:'#138151',goal:r.id}
    ]);
    return '<section class="asi32-block"><article class="asi32-card asi32-goal-chart"><h3>Comparación de metas de la entidad · '+years[i]+'</h3><p class="asi32-sub">'+(state.year==='all'?'Última vigencia con ejecución documentada en la matriz. ':'')+rows.length+' metas. Desplázate horizontalmente y selecciona el número para abrir su ficha.</p>'+columns(items,'Avance físico y pagos por meta de la entidad')+'<p class="asi32-source">Dos columnas por meta: porcentaje físico reportado y pagos / saldo definitivo positivo. Cero informado se conserva como 0 %; un campo vacío o denominador cero se muestra sin reporte. Escala compartida de base cero, con referencia mínima de 100 %; los valores por encima de 100 % se conservan.</p></article></section>';
  }
  function content(rows){
    switch(state.tab){
      case 'inicio':return start(rows);
      case 'ejecutivo':return executive(rows);
      case 'plan':return plan(rows);
      case 'lineas':return grouping(rows,'line');
      case 'sectores':return grouping(rows,'sector');
      case 'programas':return grouping(rows,'program');
      case 'dependencias':return grouping(rows,'owner');
      case 'metas':return metas(rows);
      case 'indicadores':return indicatorPage(rows);
      case 'detalle':return detailOwner(rows);
      default:return start(rows);
    }
  }
  function renderFilters(){
    const node=root.querySelector('[data-asi-filters]');if(!node)return;
    const defs=[
      ['year','Vigencia',[['all','Cuatrienio completo (2024–2027)'],...years.map(y=>[String(y),String(y)])]],
      ['line','Línea estratégica',[['all','Todas las líneas'],...catalog.lines.map((s,i)=>[String(i),s])]],
      ['sector','Sector MGA',[['all','Todos los sectores'],...catalog.sectors.map((s,i)=>[String(i),s])]],
      ['program','Programa',[['all','Todos los programas'],...catalog.programs.map((s,i)=>[String(i),s])]],
      ['owner','Dependencia',[['all','Todas las dependencias'],...catalog.owners.map((s,i)=>[String(i),s])]]
    ];
    node.innerHTML=defs.map(x=>'<label class="asi32-filter"><span>'+esc(x[1])+'</span><select data-asi-filter="'+x[0]+'">'+x[2].map(o=>opt(o[0],o[1],state[x[0]])).join('')+'</select></label>').join('')+
      '<label class="asi32-filter"><span>Buscar en metas</span><input type="search" data-asi-search placeholder="Meta, sector, BPIN…" value="'+esc(state.q)+'"></label>'+
      '<button type="button" class="asi32-clear" data-asi-clear>Limpiar filtros</button>';
  }
  function renderTopCards(){const node=root.querySelector('[data-asi-kpis]');if(node)node.innerHTML=topCards(selectedRows());}
  function renderNav(){
    const nav=root.querySelector('[data-asi-tabs]');if(!nav)return;
    const active=state.tab==='detalle'?'dependencias':state.tab;
    nav.innerHTML=sections.map(x=>'<button type="button" role="tab" id="asi32-tab-'+x[0]+'" aria-controls="asi32-panel" data-asi-tab="'+x[0]+'" aria-selected="'+(active===x[0])+'" tabindex="'+(active===x[0]?'0':'-1')+'">'+esc(x[1])+'</button>').join('');
  }
  function renderContent(){const dest=root.querySelector('[data-asi-body]');if(dest){dest.innerHTML=content(selectedRows());dest.setAttribute('aria-labelledby','asi32-tab-'+(state.tab==='detalle'?'dependencias':state.tab));}}
  function render(){renderFilters();renderTopCards();renderNav();renderContent();}
  root.addEventListener('change',event=>{
    const filter=event.target.closest('[data-asi-filter]');if(!filter)return;
    state[filter.dataset.asiFilter]=filter.value;
    if(filter.dataset.asiFilter==='owner'&&state.tab==='detalle'&&filter.value!=='all')state.detailOwner=Number(filter.value);
    render();
  });
  root.addEventListener('input',event=>{
    if(!event.target.matches('[data-asi-search]'))return;
    state.q=event.target.value;renderTopCards();renderContent();
  });
  root.addEventListener('click',event=>{
    const goal=event.target.closest('[data-asi-goal]');
    if(goal){const node=root.querySelector('#asi32-meta-'+goal.dataset.asiGoal);node?.focus({preventScroll:true});node?.scrollIntoView({block:'start',behavior:'smooth'});return;}
    const tab=event.target.closest('[data-asi-tab]');
    if(tab){state.tab=tab.dataset.asiTab;renderNav();renderContent();return;}
    const homeLine=event.target.closest('[data-asi-home-line]');
    if(homeLine){state.line=homeLine.dataset.asiHomeLine;state.tab='lineas';render();return;}
    const clear=event.target.closest('[data-asi-clear]');
    if(clear){Object.assign(state,{year:'all',line:'all',sector:'all',program:'all',owner:'all',q:'',detailOwner:null,tab:'inicio'});render();return;}
    if(event.target.closest('[data-asi-show-exec]')){state.tab='ejecutivo';renderNav();renderContent();root.querySelector('[data-asi-owner-section]')?.scrollIntoView({block:'start'});return;}
    const owner=event.target.closest('[data-asi-owner]');
    if(owner){returnTab=state.tab;state.detailOwner=Number(owner.dataset.asiOwner);state.tab='detalle';render();return;}
    const drill=event.target.closest('[data-asi-drill]');
    if(drill){const kind=drill.dataset.asiDrill,idx=drill.dataset.index;
      if(kind==='owner'){returnTab=state.tab;state.detailOwner=Number(idx);state.tab='detalle';}
      else{state[kind]=idx;state.detailOwner=null;state.tab='metas';}
      render();return;
    }
    if(event.target.closest('[data-asi-back]')){state.detailOwner=null;state.tab=returnTab;render();return;}
    if(event.target.closest('[data-asi-go-plan]')){
      const next=document.getElementById('tab-desarrollo-accion');
      if(next){next.click();document.getElementById('desarrollo-accion')?.scrollIntoView({block:'start'});}
      return;
    }
  });
  root.innerHTML='<header class="asi32-hero asi32-hero--compact" aria-label="Así cumplimos, visor del Plan de Desarrollo">'+
    '<div class="asi32-hero-content"><span class="asi32-kicker">SUBACHOQUE · EL MEJOR PLAN · 2024–2027</span>'+
    '<h1>Así cumplimos</h1><p>Seguimiento del Plan de Desarrollo con datos trazables de la matriz municipal.</p></div>'+
    '<div class="asi32-hero-aside"><strong>Datos de la matriz</strong><span>Plan Indicativo · Planes de Acción</span></div></header>'+
    '<div class="asi32-filters" data-asi-filters aria-label="Filtros del visor"></div>'+
    '<div class="asi32-topmetrics" data-asi-kpis aria-label="Indicadores generales de la selección"></div>'+
    '<nav class="asi32-nav" role="tablist" aria-label="Secciones de Así cumplimos" data-asi-tabs></nav>'+
    '<div class="asi32-body" id="asi32-panel" role="tabpanel" data-asi-body aria-live="polite"><p class="asi32-loading">Consultando la matriz consolidada del cuatrienio…</p></div>';
  root.addEventListener('keydown',event=>{
    const tab=event.target.closest('[data-asi-tab]');if(!tab)return;
    const pos=sections.findIndex(x=>x[0]===tab.dataset.asiTab);
    const next=event.key==='ArrowRight'?(pos+1)%sections.length:event.key==='ArrowLeft'?(pos+sections.length-1)%sections.length:event.key==='Home'?0:event.key==='End'?sections.length-1:null;
    if(next===null)return;event.preventDefault();state.tab=sections[next][0];renderNav();renderContent();root.querySelector('[data-asi-tab="'+state.tab+'"]').focus();
  });
  async function load(){
    try {
      const response=await fetch('data/asi-cumplimos-32.gz.b64.txt',{cache:'no-store'});
      if(!response.ok)throw new Error('Fuente local no disponible (HTTP '+response.status+').');
      const base64=(await response.text()).trim();
      if(!base64||typeof DecompressionStream!=='function')throw new Error('No fue posible descomprimir los registros en este navegador.');
      const bytes=Uint8Array.from(atob(base64),ch=>ch.charCodeAt(0));
      const data=await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).json();
      if(data.s!==1||data.g.length!==109||data.o.length!==8||data.l.length!==6||data.sct.length!==19||data.pr.length!==29)throw new Error('La fuente no superó la verificación estructural.');
      catalog={lines:data.l,sectors:data.sct,programs:data.pr,owners:data.o};
      details=data.details||{};
      goals=data.g.map(row);
      if(unique(goals.map(g=>g.id))!==109)throw new Error('Metas duplicadas o incompletas.');
      render();
    } catch(error) {
      const area=root.querySelector('[data-asi-body]');
      if(area)area.innerHTML='<div class="asi32-empty" role="alert"><strong>No se pueden verificar los datos del cuatrienio.</strong><p>'+esc(error.message)+'</p><p>El visor no presenta porcentajes ni presupuestos sin fuente.</p></div>';
    }
  }
  load();
})();
