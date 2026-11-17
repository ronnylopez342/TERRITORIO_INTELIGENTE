/* Consulta íntegra y de solo lectura de las 15 hojas del Excel de 3.2.
 * Las celdas originales no alimentan cálculos nuevos ni se mezclan entre fuentes.
 */
(() => {
  'use strict';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num=new Intl.NumberFormat('es-CO',{maximumFractionDigits:10});
  const cop=new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:2});
  const present=v=>v!==null&&v!==undefined&&String(v).trim()!=='';
  const year=v=>[2024,2025,2026,2027].includes(Number(String(v??'').trim()))?Number(String(v).trim()):null;
  const text=v=>present(v)?esc(typeof v==='number'?num.format(v):v):'Sin dato';
  const money=v=>Number.isFinite(v)?esc(cop.format(v)):'Sin dato';
  const button=(sheet,label,goal,row)=>'<button type="button" class="asi32-source-link" data-ti32-sheet="'+sheet+'"'+(goal?' data-ti32-goal="'+goal+'"':'')+(row?' data-ti32-row="'+row+'"':'')+'>'+esc(label)+'</button>';
  function table(head,rows,kind){
    return '<div class="asi32-table-scroll" tabindex="0" role="region" aria-label="'+esc(kind)+'"><table class="asi32-table"><thead><tr>'+head.map(h=>'<th scope="col">'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+
      (rows.length?rows.map(r=>'<tr>'+r.map(v=>'<td>'+v+'</td>').join('')+'</tr>').join(''):'<tr><td colspan="'+head.length+'">Sin registros para esta selección.</td></tr>')+'</tbody></table></div>';
  }
  window.TI32Sources={create(options){
    const {root,getState,getDetails,navigate}=options;
    let archive=null,dialog=null,viewer={sheet:0,goal:null,page:0},lastFocus=null;
    const sheet=id=>archive.sheets[id];
    const body=id=>sheet(id).rows.filter(r=>r.row>sheet(id).headerRow);
    const selected=(id,goals)=>{const ids=new Set(goals.map(g=>g.id));return body(id).filter(r=>ids.has(r.goal));};
    const orgFiltered=()=>['line','sector','program','owner'].some(k=>getState()[k]!=='all');
    const annual=i=>getState().year==='all'||String(i)===getState().year;
    const cellLink=(id,row)=>button(id,'Ver fila '+row,null,row);
    const heading=(title,note)=>'<h3>'+esc(title)+'</h3><p class="asi32-sub">'+esc(note)+'</p>';
    const expand=(label,content)=>'<details class="asi32-source-expand"><summary>'+esc(label)+'</summary>'+content+'</details>';
    function poai(goals){
      const years=[2024,2025,2026,2027].filter(annual),cols=['BP','CH','CZ','DR'];
      const rows=selected(1,goals).map(r=>['<b>Meta '+r.goal+'</b>',text(r.cells.E),text(r.cells.F),text(r.cells.G),text(r.cells.J),...years.map(y=>money(r.cells[cols[y-2024]])),cellLink(1,r.row)]);
      return '<section class="asi32-block asi32-poai"><article class="asi32-card">'+heading('POAI e indicadores de resultado','La programación del POAI se consulta por separado: puede diferir del Plan Indicativo. Los valores esperados son metas de resultado, no resultados alcanzados.')+
        expand('Consultar las '+rows.length+' metas de la selección en el POAI',table(['Meta producto','Meta de resultado','Indicador de resultado','Línea base del resultado','Valor esperado del resultado',...years.map(y=>'POAI '+y+' · COP'),'Fuente completa'],rows,'POAI por meta'))+
        '<p class="asi32-source">Fuente: 2. POAI, filas originales. Se conserva la relación meta producto–resultado, sin sumar indicadores repetidos ni mezclar los dos presupuestos. En «Ver fila» están las unidades, fuentes, articulación, financiación y todos los demás campos de esta hoja.</p></article></section>';
    }
    function contracts(goals){
      const columns=[['D','E','F','G','H','I','J','K','L','M'],['N','O','P','Q','R','S','T','U','V','W'],['X','Y','Z','AA','AB','AC','AD','AE','AF','AG'],['AH','AI','AJ','AK','AL','AM','AN','AO','AP','AQ']];
      const rows=selected(7,goals).flatMap(r=>columns.flatMap((cols,i)=>{
        if(!annual(2024+i)||!present(r.cells[cols[0]]))return [];
        return [['Meta '+r.goal,String(2024+i),text(r.cells[cols[0]]),text(r.cells[cols[1]]),text(r.cells[cols[2]]),text(r.cells[cols[6]]),text(r.cells[cols[7]]),money(r.cells[cols[8]]),cellLink(7,r.row)]];
      }));
      return '<section class="asi32-block asi32-contracts"><article class="asi32-card">'+heading('Contratos consignados en esta matriz','Consulta de 4. Contratos Cuatrienio, vinculada por número de meta y vigencia. Se conservan los registros tal como fueron diligenciados.')+
        expand('Consultar '+rows.length+' registros con número de contrato',table(['Meta','Vigencia','Número consignado','Tipo','Objeto','Proveedor','Estado consignado','Valor compromiso · COP','Fuente completa'],rows,'Contratos de la matriz'))+
        '<p class="asi32-source">Las filas sin número de contrato no se cuentan como contratos. Una celda puede contener más de una referencia; no se afirma que este conteo sea de contratos únicos. «Ver fila» permite consultar fechas, duración y observaciones. Los compromisos no se suman a pagos ni a la programación del plan. '+button(7,'Consultar también las filas sin contrato')+'</p></article></section>';
    }
    function independent(){
      const state=getState();
      const explain='Estas hojas no contienen número de meta para enlazarlas de forma verificable con líneas, sectores, programas o dependencias. Solo se aplica la vigencia a las filas que la identifican. No se atribuyen registros a una entidad por inferencia.';
      const filtered=orgFiltered()||!!state.q;
      const gestion=body(9).filter(r=>year(r.cells.B)&&annual(year(r.cells.B)));
      const projects=body(10).filter(r=>state.year==='all'||year(r.cells.B)===Number(state.year));
      const initiatives=body(11);
      const sections=[
        ['Gestión de recursos',9,gestion,['Vigencia','Descripción','Entidad consignada','Valor consignado · COP','Fuente completa'],r=>[text(r.cells.B),text(r.cells.C),text(r.cells.D),money(r.cells.E),cellLink(9,r.row)],'La gestión reportada no equivale a pagos ni a obras terminadas. La fila TOTAL GESTIÓN se conserva en la consulta de fuente y se excluye del listado de registros para evitar contarla dos veces.'],
        ['Proyectos y registros complementarios',10,projects,['Fila','Proyecto o concepto','Vigencia','Descripción técnica','Valor estimado · COP','Vereda o barrio','Campo de metros','Fuente completa'],r=>[String(r.row),text(r.cells.A),text(r.cells.B),text(r.cells.C),money(r.cells.D),text(r.cells.E),text(r.cells.F),cellLink(10,r.row)],'Hoja6 reúne información vial y otros conceptos, incluidos registros sin vigencia y filas incompletas. No se cuentan como proyectos únicos ni se interpreta el campo «MTS A EJECUTADOS» como avance certificado. Se presenta exclusivamente como tabla; no incluye mapa.'],
        ['Iniciativas de proyectos',11,initiatives,['Fila','Iniciativa consignada','Fuente completa'],r=>[String(r.row),text(r.cells.B),cellLink(11,r.row)],'La hoja Lista registra iniciativas sin fecha, ejecución ni número de meta. Se conservan los doce textos originales; la vigencia no permite clasificarlos. No se presentan como proyectos ejecutados.']
      ];
      return '<section class="asi32-block asi32-independent">'+sections.map(([title,id,rows,headers,render,note])=>'<article class="asi32-card">'+heading(title,note)+
        (filtered?'<p class="asi32-source-limit">Limpia los filtros de clasificación y búsqueda para consultar este listado independiente. '+button(id,'Consultar la hoja original')+'</p>':expand('Consultar registros de '+sheet(id).name.trim(),table(headers,rows.map(render),title)))+'</article>').join('')+'<p class="asi32-source">'+esc(explain)+'</p></section>';
    }
    function ods(goals){
      const groups=new Map();
      goals.forEach(g=>{const d=getDetails()[g.id]?.ods,k=d?.name||'ODS no informado';if(!groups.has(k))groups.set(k,[]);groups.get(k).push(g);});
      const items=[...groups].sort((a,b)=>(parseInt(a[0])||99)-(parseInt(b[0])||99));
      return '<section class="asi32-block asi32-ods"><article class="asi32-card">'+heading('Articulación con los Objetivos de Desarrollo Sostenible','Distribución de las metas seleccionadas según el ODS consignado en el Plan Indicativo; no mide el cumplimiento del ODS.')+
        items.map(([name,list])=>'<div class="asi32-ods-row"><b>'+esc(name)+'</b><span class="asi32-track"><span class="asi32-fill" style="width:'+(100*list.length/Math.max(1,goals.length)).toFixed(4)+'%"></span></span><strong>'+list.length+' metas</strong></div>').join('')+
        expand('Consultar objetivo y meta ODS de cada meta producto',table(['Meta producto','ODS consignado','Objetivo','Meta ODS'],goals.map(g=>{const d=getDetails()[g.id]?.ods;return ['Meta '+g.id,text(d?.name),text(d?.description),text(d?.target)];}),'Articulación ODS'))+
        '<p class="asi32-source">Fuente: Plan Indicativo S:U. El catálogo de la hoja ODS y sus opciones de aplicabilidad se conservan en la consulta original; no se relacionan por posición de fila. '+button(13,'Consultar catálogo ODS')+'</p></article></section>';
    }
    function goalInfo(g){
      const d=getDetails()[g.id]?.ods;
      return '<small><strong>ODS:</strong> '+text(d?.name)+'</small><div class="asi32-goal-sources">'+[2024,2025,2026,2027].filter(annual).map(y=>button(y-2021,'Actividades y soportes '+y,g.id)).join('')+button(1,'Ficha POAI',g.id)+'</div>';
    }
    function coverage(){
      const locations=['Indicadores · fuentes','Plan de desarrollo · POAI','Todas las vistas de metas','Metas · actividades 2024','Metas · actividades 2025','Sin registros en el archivo','Sin registros en el archivo','Metas · contratos de esta matriz','Sin registros en el archivo','Plan de desarrollo · Gestión','Plan de desarrollo · registros complementarios, sin mapa','Plan de desarrollo · iniciativas','Indicadores · consulta auxiliar','Indicadores · articulación y catálogo','Indicadores · consulta auxiliar'];
      return '<section class="asi32-block asi32-source-coverage" id="asi32-cobertura">'+heading('Cobertura de las 15 hojas del Excel','Cada hoja tiene una consulta de sus celdas originales y una ubicación definida. Las hojas vacías no generan cifras. No es necesario convertir los catálogos auxiliares en gráficas.')+
        table(['Hoja original','Filas con contenido','Ubicación y tratamiento','Consulta'],archive.sheets.map(s=>[esc(s.name),String(s.rows.length),esc(locations[s.id]),button(s.id,s.rows.length?'Consultar hoja':'Ver estado sin información')]),'Cobertura completa del Excel')+
        '<p class="asi32-source">Fuente: '+esc(archive.source)+'. «Consultar hoja» permite recorrer todas las filas con contenido, desplegar todos sus campos y descargar los valores almacenados. Esta consulta documental conserva las columnas y filas originales, sin los filtros del visor. Los listados analíticos de metas sí responden a los filtros generales. No se recalculan las fórmulas del libro ni se publica el mapa de la página 6 del Word.</p></section>';
    }
    function originalCell(value,label){
      if(typeof value==='string'&&/^https?:\/\/\S+$/i.test(value.trim()))return '<a href="'+esc(value.trim())+'" target="_blank" rel="noopener noreferrer">'+esc(value)+'</a>';
      if(typeof value==='number'&&/fecha/i.test(label)&&value>20000&&value<100000){
        const date=new Date(Date.UTC(1899,11,30)+value*86400000);
        return esc(new Intl.DateTimeFormat('es-CO',{timeZone:'UTC'}).format(date))+' <small>(valor Excel: '+text(value)+')</small>';
      }
      return text(value);
    }
    function renderDialog(){
      const s=sheet(viewer.sheet),all=viewer.goal?s.rows.filter(r=>r.goal===viewer.goal):s.rows;
      const cols=[...new Set(all.flatMap(r=>Object.keys(r.cells)))].sort((a,b)=>{const ix=c=>[...c].reduce((n,ch)=>n*26+ch.charCodeAt(0)-64,0);return ix(a)-ix(b);});
      const shown=cols.slice(0,5),start=viewer.page*20,rows=all.slice(start,start+20);
      const headers=shown.map(c=>s.headers[c]||'Columna '+c);
      dialog.innerHTML='<header class="asi32-source-dialog-head"><div><h2 id="asi32-source-title">'+esc(s.name)+'</h2><p>'+esc(s.note)+(viewer.goal?' · Meta '+viewer.goal:' · Hoja original completa, sin filtros del visor')+'</p></div><button type="button" data-ti32-close aria-label="Cerrar consulta">Cerrar ×</button></header>'+
        '<div class="asi32-source-dialog-body"><p>Mostrando '+(all.length?start+1:0)+'–'+Math.min(start+20,all.length)+' de '+all.length+' filas con contenido. Desplázate horizontalmente para ver las columnas. «Todos los campos» conserva el resto, con su celda de origen.</p>'+
        table(['Fila original',...headers,'Detalle de fila'],rows.map(r=>[String(r.row),...shown.map((c,i)=>originalCell(r.cells[c],headers[i])),
          '<details class="asi32-original-fields"'+(viewer.row===r.row?' open':'')+'><summary>Todos los campos ('+Object.keys(r.cells).length+')</summary><dl>'+Object.entries(r.cells).map(([c,v])=>'<dt>'+esc(s.headers[c]||'Columna '+c)+' <small>· '+c+r.row+'</small></dt><dd>'+originalCell(v,s.headers[c]||'')+'</dd>').join('')+'</dl></details>']),s.name)+
        (!all.length?'<p class="asi32-empty">Esta hoja no contiene registros'+(viewer.goal?' de esta meta':'')+'. No se interpreta como avance del 0 %.</p>':'')+'</div>'+
        '<footer class="asi32-source-dialog-foot"><button type="button" data-ti32-page="-1"'+(viewer.page===0?' disabled':'')+'>Anterior</button><span>Página '+(viewer.page+1)+' de '+Math.max(1,Math.ceil(all.length/20))+'</span><button type="button" data-ti32-page="1"'+(start+20>=all.length?' disabled':'')+'>Siguiente</button><button type="button" data-ti32-download>Descargar filas consultadas (CSV)</button></footer>';
    }
    function download(){
      const s=sheet(viewer.sheet),rows=viewer.goal?s.rows.filter(r=>r.goal===viewer.goal):s.rows;
      const safe=v=>{let t=String(v??'');if(/^[=+@-]/.test(t)&&typeof v!=='number')t="'"+t;return '"'+t.replace(/"/g,'""')+'"';};
      const csv=[['Hoja','Fila','Celda','Encabezado','Valor almacenado'],...rows.flatMap(r=>Object.entries(r.cells).map(([c,v])=>[s.name,r.row,c+r.row,s.headers[c]||'',v]))].map(r=>r.map(safe).join(';')).join('\r\n');
      const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));
      const a=document.createElement('a');a.href=url;a.download='matriz-hoja-'+(s.id+1)+(viewer.goal?'-meta-'+viewer.goal:'')+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    }
    root.addEventListener('click',event=>{
      const open=event.target.closest('[data-ti32-sheet]');
      if(open){lastFocus=open;viewer={sheet:Number(open.dataset.ti32Sheet),goal:Number(open.dataset.ti32Goal)||null,row:Number(open.dataset.ti32Row)||null,page:0};if(viewer.row){const index=sheet(viewer.sheet).rows.findIndex(r=>r.row===viewer.row);viewer.page=Math.max(0,Math.floor(index/20));}renderDialog();dialog.showModal();dialog.querySelector('.asi32-original-fields[open]')?.scrollIntoView({block:'center'});return;}
      if(event.target.closest('[data-ti32-close]')){dialog.close();return;}
      const next=event.target.closest('[data-ti32-page]');if(next){const direction=next.dataset.ti32Page;viewer.page+=Number(direction);renderDialog();dialog.querySelector('.asi32-source-dialog-body').scrollTop=0;dialog.querySelector('[data-ti32-page="'+direction+'"]:not(:disabled)')?.focus({preventScroll:true});return;}
      if(event.target.closest('[data-ti32-download]')){download();return;}
      if(event.target.closest('[data-ti32-coverage]')){navigate('indicadores');root.querySelector('#asi32-cobertura')?.scrollIntoView({block:'start'});}
    });
    return {poai,contracts,independent,ods,goalInfo,coverage,
      shortcut:()=>'<button type="button" class="asi32-action asi32-action--ghost" data-ti32-coverage>Consultar las 15 hojas y su cobertura ↗</button>',
      async load(){
        const response=await fetch('data/asi-cumplimos-32-fuentes.gz.b64.txt',{cache:'no-store'});
        if(!response.ok)throw Error('No se pudo consultar el archivo completo de fuentes.');
        const bytes=Uint8Array.from(atob((await response.text()).trim()),c=>c.charCodeAt(0));
        archive=await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).json();
        if(archive.schema!==1||archive.sheets.length!==15||archive.sha256!=='09a2cf3a3d2f9527c88b74511a8920ef492fce493e9c8d6186202bb3efbeeac2')throw Error('No coincide la fuente completa con la matriz auditada.');
        dialog=document.createElement('dialog');dialog.className='asi32-source-dialog';dialog.setAttribute('aria-labelledby','asi32-source-title');root.append(dialog);
        dialog.addEventListener('close',()=>lastFocus?.focus({preventScroll:true}));
      }
    };
  }};
})();
