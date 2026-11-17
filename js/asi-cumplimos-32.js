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
    ['dependencias', 'Dependencias'], ['metas', 'Metas'], ['indicadores', 'Indicadores'],
    ['territorio', 'Territorio']
  ];
  const colorYear = ['#07884d','#f7c137','#ec8430','#789d9a'];
  const state = {year:'all',line:'all',sector:'all',program:'all',owner:'all',q:'',tab:'inicio',detailOwner:null};
  let catalog = null, goals = [];
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
    const valid=rows.filter(r=>Number.isFinite(r.action[yi]));
    const b=sum(valid.map(r=>r.action[yi]));
    return {b,p:sum(valid.map(r=>r.paid[yi])),n:valid.length};
  }
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
  function fullChart(rows){
    const reported=years.map((y,i)=>physical(rows,i));
    const ysel=yearsToDisplay();
    const yearlyShares=years.map((year,i)=>ysel.includes(i)&&reported[i]!==null?(state.year==='all'?reported[i]/4:reported[i]):0);
    const total=sum(yearlyShares),available=years.map((y,i)=>ysel.includes(i)&&reported[i]!==null);
    const bars=years.map((y,i)=>available[i]?'<span class="asi32-segment" style="height:'+((yearlyShares[i]*100).toFixed(2))+'%;background:'+colorYear[i]+'" title="'+y+' · '+pct(reported[i])+' promedio de metas informadas"></span>':'').join('');
    const headline=state.year==='all'?'Lectura orientativa del cuatrienio':'Avance promedio informado en '+state.year;
    const foot=state.year==='all'?'Las porciones 2024–2025 usan un peso visual uniforme de 25 % por vigencia. No equivale al indicador oficial de avance del plan. Para 2026–2027 no hay ejecución registrada.':'Promedio simple de metas con dato en la vigencia elegida; no ponderado por presupuesto ni por tamaño de meta.';
    return '<article class="asi32-card"><h3>Avances del Plan de Desarrollo</h3><p class="asi32-sub">Programación física frente a los reportes de ejecución</p>'+
      '<div class="asi32-compare"><div class="asi32-column"><strong>100 %</strong><div class="asi32-vertical asi32-vertical--full"></div><label>Referente programado</label></div>'+
      '<div class="asi32-column"><strong>'+(available.some(Boolean)?fmt.format(total*100)+' %':'Sin reporte')+'</strong><div class="asi32-vertical">'+bars+'</div><label>'+esc(headline)+'</label></div></div>'+
      '<div class="asi32-legend">'+years.map((y,i)=>'<span><i class="asi32-dot" style="background:'+colorYear[i]+'"></i>'+y+': '+(ysel.includes(i)?pct(reported[i]):'Fuera del filtro')+'</span>').join('')+'</div>'+
      '<div class="asi32-alert">'+esc(foot)+'</div><p class="asi32-source">'+esc(sourceNote)+'</p></article>';
  }
  function annualCards(rows){
    return '<article class="asi32-card"><h3>Ejecución física por vigencia</h3><p class="asi32-sub">Promedio simple de las metas con porcentaje disponible</p><div class="asi32-year-list">'+
      years.map((year,i)=>'<div class="asi32-year-row"><span>'+year+'</span>'+bar(physical(rows,i),colorYear[i])+'<strong>'+pct(physical(rows,i))+'</strong></div>').join('')+
      '</div><div class="asi32-highlight">'+esc('Los años 2026 y 2027 están programados, pero sus hojas de ejecución anual no contienen registros. Un campo vacío nunca se interpreta como 0 %.')+'</div></article>';
  }
  function budgetChart(rows){
    const ys=yearsToDisplay();
    const numbers=years.map((y,i)=>sum(rows.map(r=>r.indicative[i])));
    const max=Math.max(1,...numbers);
    return '<article class="asi32-card"><h3>Gestión financiera del cuatrienio</h3><p class="asi32-sub">Programación del Plan Indicativo y pagos informados en los planes de acción</p>'+
      years.filter((y,i)=>ys.includes(i)).map(y=>{
        const i=years.indexOf(y),bud=budget(rows,i),v=numbers[i];
        return '<div class="asi32-finance"><strong>'+y+'</strong><div>'+bar(v/max,'#14774f')+'<div style="height:7px"></div>'+bar(bud.n?bud.p/max:null,'#efb327')+'</div><span style="font-size:11px">'+compact(v)+'<br>'+(bud.n?'Pagos '+compact(bud.p):'Pagos sin reporte')+'</span></div>';
      }).join('')+
      '<div class="asi32-legend"><span><i class="asi32-dot" style="background:#14774f"></i>Plan Indicativo</span><span><i class="asi32-dot" style="background:#efb327"></i>Pagos de Plan de Acción</span></div>'+
      '<p class="asi32-source">No sumar el saldo definitivo del Plan de Acción con la programación del Plan Indicativo: son conceptos diferentes. 2026/2027 no cuentan con pagos registrados.</p></article>';
  }
  function ownerBar(rows){
    const i=latestReported();
    const year=years[i];
    return '<section class="asi32-block">'+pageTitle('Avance consolidado por secretarías y entidades','Selecciona una entidad para ver su ficha estratégica y las metas asociadas. Comparativo '+year+'.','Plan de Acción · responsables')+
      '<div class="asi32-chart-list">'+catalog.owners.map((name,idx)=>{
        const subset=rows.filter(r=>r.owner===idx);if(!subset.length)return '';
        const av=physical(subset,i),bud=budget(subset,i),pay=bud.b>0?bud.p/bud.b:null;
        return '<button class="asi32-chart-item" data-asi-owner="'+idx+'" type="button" aria-label="Ver ficha de '+esc(name)+'"><span class="asi32-label"><strong>'+esc(name)+'</strong><small>'+subset.length+' metas · '+(bud.n?'Con datos presupuestales':'Sin datos presupuestales')+'</small></span>'+mini(av,year)+mini(pay,year,'#f1b72d')+'<span aria-hidden="true">↗</span></button>';
      }).join('')+'</div><p class="asi32-source">Primera barra: ejecución física de metas. Segunda: pagos / saldo definitivo de la misma vigencia. Valores agregados por responsable; no comparan unidades físicas heterogéneas.</p></section>';
  }
  function photoCards(){
    const content=[
      ['Infraestructura y gestión','assets/img/editorial/gestion.jpg','Imagen editorial del portal; las metas y sus presupuestos se consultan en la matriz.'],
      ['Comunidad y participación','assets/img/editorial/comunidad.jpg','Referencia visual institucional, no fotografía atribuida a una obra específica.'],
      ['Territorio y sostenibilidad','assets/img/editorial/territorio-aereo.jpg','Panorama contextual de Subachoque; no implica una georreferenciación de metas.']
    ];
    return '<section class="asi32-block">'+pageTitle('Territorio, acciones y seguimiento','Imágenes de contexto para una lectura más cercana del Plan; las cifras de ejecución proceden del Excel.','Rendición de cuentas')+
      '<div class="asi32-photo-cards">'+content.map(x=>'<article class="asi32-photo-card"><img src="'+x[1]+'" alt="'+esc(x[0])+'" loading="lazy"><div><h3>'+esc(x[0])+'</h3><p>'+esc(x[2])+'</p></div></article>').join('')+'</div></section>';
  }
  function homeProgress(rows){
    const subset=yearsToDisplay(),all=subset.length===4;
    const items=years.map((y,i)=>({year:y,index:i,avg:physical(rows,i),count:rows.filter(r=>Number.isFinite(r.physical[i])).length})).filter(x=>subset.includes(x.index));
    return '<article class="asi32-card asi32-home-progress" aria-labelledby="asi32-progress-title">'+
      '<div class="asi32-home-cardhead"><div><span class="asi32-eyebrow">Seguimiento físico · Matriz de Control</span><h3 id="asi32-progress-title">Avances del Plan de Desarrollo</h3>'+
      '<p>Porcentaje promedio de metas con avance documentado, por vigencia.</p></div><span class="asi32-home-tag">Escala de referencia: 100 %</span></div>'+
      '<div class="asi32-home-progress-main"><div class="asi32-home-target" aria-label="Referencia de escala: 100 por ciento">'+
      '<strong>100 %</strong><span class="asi32-home-targetbar"></span><small>Referencia para cada vigencia, no avance acumulado</small></div>'+
      '<div class="asi32-home-annual" aria-label="Avance físico por año">'+
      items.map(item=>'<div class="asi32-home-annual-item"><div class="asi32-home-annual-head"><strong>'+item.year+'</strong>'+
        '<span class="'+(item.avg===null?'asi32-home-no-data':'asi32-home-annual-value')+'">'+pct(item.avg)+'</span></div>'+
        (item.avg===null?'<div class="asi32-home-missing"><span>Sin datos de ejecución en la matriz</span></div>':bar(item.avg,colorYear[item.index]))+
        '<small>'+(item.avg===null?'Hoja de ejecución no diligenciada':item.count+' de '+rows.length+' metas con avance informado')+'</small></div>').join('')+
      '</div></div>'+
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
  function start(rows){
    return '<section class="asi32-block asi32-home-intro">'+
      pageTitle('Inicio · Seguimiento del cuatrienio 2024–2027',
        'Una lectura clara de las 109 metas producto, con información física y financiera exclusivamente de la Matriz de Control.',
        'Así cumplimos · 3.2')+
      '<div class="asi32-home-lead"><strong>Vista general</strong><span>Elige vigencia, línea, sector, programa o dependencia para actualizar todas las cifras de esta página.</span></div>'+
      '<div class="asi32-home-main-grid">'+homeProgress(rows)+homeFinance(rows)+'</div></section>'+
      '<section class="asi32-block asi32-home-bottom">'+
      '<div class="asi32-home-bottom-grid">'+homeStructure(rows)+homeCoverage(rows)+'</div></section>';
  }
  function executive(rows){
    const s=stat(rows);return '<section class="asi32-block">'+pageTitle('Dashboard ejecutivo','109 metas en el conjunto completo, con filtros cruzados por vigencia, línea, sector, programa y dependencia.','Lectura transversal')+
      '<div class="asi32-grid">'+annualCards(rows)+budgetChart(rows)+'</div></section>'+ownerBar(rows)+
      '<section class="asi32-block">'+pageTitle('Financiación del seguimiento','Presupuesto y pagos responden a hojas y definiciones diferentes.','Transparencia')+
      '<div class="asi32-grid-3">'+
      kpi('Plan Indicativo',compact(s.indicative),'Programado '+(state.year==='all'?'2024–2027':state.year))+
      kpi('Saldo definitivo',compact(s.action),'Planes de acción con datos')+
      kpi('Pagos',compact(s.paid),'Solo vigencias con informe')+'</div></section>';
  }
  function plan(rows){
    return '<section class="asi32-block">'+pageTitle('Plan de Desarrollo: el cuatrienio completo','Del referente de programación a la evidencia de ejecución por vigencia.','Plan 2024–2027')+
      '<div class="asi32-grid">'+fullChart(rows)+budgetChart(rows)+'</div><div class="asi32-highlight" style="margin-top:18px">'+
      esc('El periodo del Excel es 2024–2027. El Plan de Desarrollo adoptado puede usar una denominación 2024–2028 en sus documentos oficiales; no se trasladan cifras de un periodo al otro sin conciliación.')+'</div>'+goPlanButton()+'</section>'+photoCards();
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
    return '<article class="asi32-goal"><div class="asi32-goal-meta"><span class="asi32-goal-number">META '+r.id+'</span><small>BPIN '+esc(r.bpin||'no informado')+'</small></div>'+
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
    return '<section class="asi32-block"><button type="button" class="asi32-action asi32-action--ghost" data-asi-back>← Todas las dependencias</button>'+
      '<header class="asi32-detail-banner"><span class="asi32-eyebrow" style="color:#bdecd3">Detalle institucional · '+years[yy]+'</span><h2>'+esc(label)+'</h2><p>Fuente: matriz consolidada. Imágenes institucionales de contexto, sin atribución de obras específicas.</p></header>'+
      '<div class="asi32-grid-3"><article class="asi32-card"><h3>Información estratégica</h3><p class="asi32-sub">Estructura de la entidad dentro del plan</p>'+[
        [unique(sub.map(r=>r.line)),'Líneas estratégicas'],[unique(sub.map(r=>r.sector)),'Sectores MGA'],[unique(sub.map(r=>r.program)),'Programas'],[sub.length,'Metas producto']].map(x=>'<div class="asi32-finance" style="grid-template-columns:55px 1fr"><strong style="font-size:24px;color:#0b8653">'+x[0]+'</strong><span>'+x[1]+'</span></div>').join('')+'</article>'+
      '<article class="asi32-card"><h3>Ejecución física y presupuestal</h3><p class="asi32-sub">Vigencia de referencia '+years[yy]+'</p><div class="asi32-finance"><span>Física</span>'+bar(av,'#0a854e')+'<strong>'+pct(av)+'</strong></div><div class="asi32-finance"><span>Pagos</span>'+bar(fin.b>0?fin.p/fin.b:null,'#f1b72d')+'<strong>'+(fin.b>0?pct(fin.p/fin.b):'Sin reporte')+'</strong></div><p class="asi32-source">Porcentaje de metas con reporte y pagos respecto al saldo definitivo; no son indicadores oficiales de cumplimiento global.</p></article>'+
      '<article class="asi32-card"><h3>Presupuesto asignado</h3><p class="asi32-sub">Saldo definitivo del Plan de Acción '+years[yy]+'</p><strong style="font-size:clamp(22px,2.5vw,34px);color:#106a47">'+compact(fin.n?fin.b:null)+'</strong><p>Pagos informados: <strong>'+compact(fin.n?fin.p:null)+'</strong></p><p class="asi32-source">Plan Indicativo 2024–2027: '+compact(s.indicative)+' programados, sujeto a validación de fuente y vigencia.</p></article></div></section>'+metas(sub);
  }
  function territory(rows){
    return '<section class="asi32-block">'+pageTitle('El Plan en el territorio','La matriz clasifica metas por sector y dependencia, pero no asigna coordenadas verificadas de obra a cada meta.','Territorio y evidencias')+
      '<div class="asi32-grid"><article class="asi32-card"><h3>Lectura territorial responsable</h3><p>La cartografía de veredas y los expedientes de proyectos estratégicos se consultan en la Unidad de Cumplimiento. El visor 3.2 no coloca pines que el Excel no soporta.</p>'+goPlanButton()+'<p class="asi32-source">Para ver los proyectos estratégicos y su referencia territorial, abre Unidad de Cumplimiento → 4.2.</p></article>'+annualCards(rows)+'</div></section>'+photoCards();
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
      case 'territorio':return territory(rows);
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
    const all=state.detailOwner!==null?[...sections,['detalle','Ficha de entidad']]:sections;
    nav.innerHTML=all.map(x=>'<button type="button" role="tab" data-asi-tab="'+x[0]+'" aria-selected="'+(state.tab===x[0])+'" tabindex="'+(state.tab===x[0]?'0':'-1')+'">'+esc(x[1])+'</button>').join('');
  }
  function renderContent(){const dest=root.querySelector('[data-asi-body]');if(dest)dest.innerHTML=content(selectedRows());}
  function render(){renderFilters();renderTopCards();renderNav();renderContent();}
  root.addEventListener('change',event=>{
    const filter=event.target.closest('[data-asi-filter]');if(!filter)return;
    state[filter.dataset.asiFilter]=filter.value;
    if(filter.dataset.asiFilter==='owner')state.detailOwner=null;
    render();
  });
  root.addEventListener('input',event=>{
    if(!event.target.matches('[data-asi-search]'))return;
    state.q=event.target.value;renderTopCards();renderContent();
  });
  root.addEventListener('click',event=>{
    const tab=event.target.closest('[data-asi-tab]');
    if(tab){state.tab=tab.dataset.asiTab;renderNav();renderContent();return;}
    const homeLine=event.target.closest('[data-asi-home-line]');
    if(homeLine){state.line=homeLine.dataset.asiHomeLine;state.tab='lineas';render();return;}
    const clear=event.target.closest('[data-asi-clear]');
    if(clear){Object.assign(state,{year:'all',line:'all',sector:'all',program:'all',owner:'all',q:'',detailOwner:null,tab:'inicio'});render();return;}
    const owner=event.target.closest('[data-asi-owner]');
    if(owner){state.detailOwner=Number(owner.dataset.asiOwner);state.owner='all';state.tab='detalle';render();return;}
    const drill=event.target.closest('[data-asi-drill]');
    if(drill){const kind=drill.dataset.asiDrill,idx=drill.dataset.index;
      if(kind==='owner'){state.detailOwner=Number(idx);state.owner='all';state.tab='detalle';}
      else{state[kind]=idx;state.detailOwner=null;state.tab='metas';}
      render();return;
    }
    if(event.target.closest('[data-asi-back]')){state.detailOwner=null;state.tab='dependencias';render();return;}
    if(event.target.closest('[data-asi-go-plan]')){
      const next=document.getElementById('tab-desarrollo-accion');
      if(next){next.click();document.getElementById('desarrollo-accion')?.scrollIntoView({block:'start'});}
      return;
    }
  });
  root.innerHTML='<header class="asi32-hero asi32-hero--compact" aria-label="Así cumplimos, visor del Plan de Desarrollo">'+
    '<div class="asi32-hero-content"><span class="asi32-kicker">SUBACHOQUE · EL MEJOR PLAN · 2024–2027</span>'+
    '<h1>Así cumplimos</h1><p>Seguimiento del Plan de Desarrollo con datos trazables de la matriz municipal.</p></div>'+
    '<div class="asi32-hero-aside"><strong>109 metas producto</strong><span>Programación 2024–2027 · Reportes disponibles 2024 y 2025</span></div></header>'+
    '<div class="asi32-filters" data-asi-filters aria-label="Filtros del visor"></div>'+
    '<div class="asi32-topmetrics" data-asi-kpis aria-label="Indicadores generales de la selección"></div>'+
    '<nav class="asi32-nav" role="tablist" aria-label="Secciones de Así cumplimos" data-asi-tabs></nav>'+
    '<div class="asi32-body" data-asi-body aria-live="polite"><p class="asi32-loading">Consultando la matriz consolidada del cuatrienio…</p></div>';
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