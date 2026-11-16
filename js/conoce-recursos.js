/* Recuperación funcional contextual de Data 2.1 (sin reabrir pestañas antiguas).
   Fuentes DANE verificadas y gestor EXCLUSIVAMENTE LOCAL, sin publicar registros. */
(() => {
  'use strict';
  const root = document.getElementById('cn-tools');
  if (!root) return;
  const dialog = document.getElementById('cn-tools-dialog');
  const body = document.getElementById('cn-tools-body');
  const heading = document.getElementById('cn-tools-dialog-title');
  const close = root.querySelector('[data-cn-tools-close]');
  const storageKey = 'ti-plan-estadistico-indicadores-v1';
  const titles = { chapters:'Capítulos del territorio', dane:'Comparación DANE: Subachoque', indicators:'Indicadores del Plan Estadístico (local)' };
  const periodicities = ['mensual','trimestral','semestral','anual','quinquenal','eventual'];
  const sectors = ['Demografía y población','Salud','Educación','Economía','Convivencia y seguridad','Acceso a servicios públicos','Vivienda','Vías','Ordenamiento territorial','Medición institucional'];
  const formulas = [['valor','Valor directo (A)'],['porcentaje','Porcentaje (A/B × 100)'],['tasa','Tasa (A/B × factor)'],['diferencia','Diferencia (A−B)'],['promedio','Promedio (A/B)']];
  const fields = ['nombre','codigo','sector','variable','fuente','metodologia','periodicidad','formula','numerador','denominador','factor','unidad','fecha','responsable','validado'];
  const format = new Intl.NumberFormat('es-CO',{maximumFractionDigits:2});
  let active = '', opener = null, records = [], editing = null, query = '', feedback = '';
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const today = () => {const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
  const number = value => value == null || String(value).trim()==='' ? NaN : Number(String(value).trim().replace(',','.'));
  const option = (value,title,selected) => '<option value="'+esc(value)+'"'+(String(selected)===String(value)?' selected':'')+'>'+esc(title)+'</option>';
  const input = (name,label,value,attrs) => '<label>'+esc(label)+'<input name="'+name+'" value="'+esc(value||'')+'" '+(attrs||'')+'></label>';
  function notice(text) {
    feedback=text;const node=body.querySelector('[data-cn-tools-status]');
    if(node) node.textContent=text;
  }
  function closeDialog() { if(dialog.open) dialog.close(); }
  dialog.addEventListener('close',()=>{body.replaceChildren();body.classList.remove('cn-tools__content--chapters');active='';if(opener?.isConnected)opener.focus();opener=null;});
  close.addEventListener('click',closeDialog);
  dialog.addEventListener('click',event=>{if(event.target===dialog)closeDialog();});
  root.addEventListener('click',event=>{
    const trigger=event.target.closest('[data-cn-tool]');
    if(!trigger||!root.contains(trigger))return;
    if(dialog.open)closeDialog();
    opener=trigger;active=trigger.dataset.cnTool;heading.textContent=titles[active]||'Herramientas territoriales';
    body.classList.toggle('cn-tools__content--chapters',active==='chapters');
    if(active==='chapters') {
      body.innerHTML='<iframe class="cn-tools__iframe" title="Explorador de los doce capítulos del territorio" src="assets/interactive/data-fuentes-visor.html" loading="eager"></iframe>';
    } else if(active==='dane') {
      body.innerHTML='<p role="status" class="cn-tools__notice">Comprobando la fuente censal de Subachoque…</p>';
    } else if(active==='indicators') {
      readLocal();renderManager();
    } else return;
    dialog.showModal();
    if(active==='dane')renderDane();
  });
  async function renderDane() {
    try {
      const response=await fetch('data/dane-subachoque-cnpv.json',{cache:'no-store'});
      if(!response.ok)throw Error('Archivo estadístico no disponible');
      const data=await response.json();
      if(data.municipality!=='Subachoque'||data.daneCode!=='25769'||!Array.isArray(data.census)||data.census.length<2)throw Error('Esquema de fuente no verificado');
      const years=[2005,2018],rows=years.map(year=>data.census.find(row=>row.year===year));
      if(rows.some(row=>!row||!Number.isFinite(row.total)||row.total!==row.urban+row.rural||!Number.isFinite(row.households)))throw Error('Población sin conciliación municipal');
      const link=new URL(data.source?.url||'',location.href);
      if(link.protocol!=='https:'||!(link.hostname==='dane.gov.co'||link.hostname.endsWith('.dane.gov.co')))throw Error('Fuente sin origen DANE verificable');
      const diff=rows[1].total-rows[0].total, percent=100*diff/rows[0].total;
      const max=Math.max(...rows.map(r=>r.total));
      body.innerHTML=
        '<p class="cn-tools__notice"><strong>Dato censal oficial.</strong> Son cortes de 2005 y 2018, NO una proyección de 2026. Las veredas del mapa no constituyen una desagregación censal.</p>'+
        '<h3 class="cn-tools__section-title">Evolución municipal 2005–2018</h3>'+
        '<div class="cn-tools__datagrid">'+
          '<div class="cn-tools__metric"><strong>'+format.format(rows[0].total)+'</strong><small>Habitantes · Censo 2005</small></div>'+
          '<div class="cn-tools__metric"><strong>'+format.format(rows[1].total)+'</strong><small>Habitantes · CNPV 2018</small></div>'+
          '<div class="cn-tools__metric"><strong>+'+format.format(diff)+'</strong><small>Variación de habitantes ('+format.format(percent)+' %)</small></div>'+
        '</div>'+
        rows.map(r=>'<div class="cn-tools__bar"><span>'+r.year+'</span><span class="cn-tools__track"><span class="cn-tools__fill" style="width:'+(r.total/max*100).toFixed(2)+'%"></span></span><strong>'+format.format(r.total)+'</strong></div>').join('')+
        '<div class="cn-tools__table-wrap"><table class="cn-tools__table"><caption class="sr-only">Comparación censal de Subachoque</caption><thead><tr><th>Año</th><th>Habitantes</th><th>Cabecera</th><th>Rural</th><th>Hogares</th></tr></thead><tbody>'+
        rows.map(r=>'<tr><th scope="row">'+r.year+'</th><td>'+format.format(r.total)+'</td><td>'+format.format(r.urban)+'</td><td>'+format.format(r.rural)+'</td><td>'+format.format(r.households)+'</td></tr>').join('')+
        '</tbody></table></div>'+
        '<p class="cn-tools__notice">'+esc(data.notice||'')+'</p>'+
        '<a class="cn-tools__source" target="_blank" rel="noopener noreferrer" href="'+esc(link.href)+'">Consultar ficha municipal original del DANE (código 25769) ↗</a>';
    } catch(error) {
      body.innerHTML='<p class="cn-tools__notice" role="alert">No fue posible validar las cifras censales. No se muestran valores sin fuente. '+esc(error.message)+'</p>';
    }
  }
  function readLocal() {
    try {
      const list=JSON.parse(localStorage.getItem(storageKey)||'[]');
      records=Array.isArray(list)?list.filter(r=>r&&typeof r==='object'&&typeof r.nombre==='string'&&r.id):[];
      feedback='';
    } catch {
      records=[]; feedback='No fue posible leer los indicadores guardados en este navegador.';
    }
  }
  function persist(next) {
    try {localStorage.setItem(storageKey,JSON.stringify(next));records=next;return true;}
    catch {notice('No fue posible guardar en este navegador. Revisa espacio y permisos.');return false;}
  }
  function calculate(r) {
    const a=number(r.numerador),b=number(r.denominador),factor=number(r.factor);
    if(!Number.isFinite(a))return {error:'Falta valor A'};
    if(r.formula==='valor')return {value:a};
    if(r.formula==='diferencia')return Number.isFinite(b)?{value:a-b}:{error:'Falta valor B'};
    if(!Number.isFinite(b)||b===0)return {error:'El denominador debe ser distinto de cero'};
    if(r.formula==='porcentaje')return {value:a/b*100};
    if(r.formula==='promedio')return {value:a/b};
    if(r.formula==='tasa')return Number.isFinite(factor)&&factor>0?{value:a/b*factor}:{error:'Factor inválido'};
    return {error:'Fórmula desconocida'};
  }
  function validate(r) {
    if(!r.nombre||!r.variable||!r.fuente||!r.metodologia||!periodicities.includes(r.periodicidad)||!formulas.some(f=>f[0]===r.formula))return false;
    if(!r.sector)return false;
    if(r.fecha && (!/^\d{4}-\d{2}-\d{2}$/.test(r.fecha)||r.fecha>today()))return false;
    return !calculate(r).error;
  }
  function state(r) {
    if(!r.fecha||r.periodicidad==='eventual')return 'Revisión manual';
    const days={mensual:31,trimestral:92,semestral:184,anual:366,quinquenal:1830}[r.periodicidad];
    if(!days)return 'Periodicidad no reconocida';
    const elapsed=Math.floor((new Date(today()+'T12:00:00')-new Date(r.fecha+'T12:00:00'))/86400000);
    if(!Number.isFinite(elapsed))return 'Fecha inválida';
    return elapsed>days?'Actualización vencida':elapsed>days*.8?'Próxima actualización':'Dentro del periodo';
  }
  function renderManager() {
    body.classList.remove('cn-tools__content--chapters');
    const registered=records.length;
    body.innerHTML=
      '<p class="cn-tools__notice"><strong>Repositorio exclusivamente local:</strong> se guardan los indicadores en este navegador, no en una base institucional. La validación manual no certifica cifras. Se conservan los registros de la herramienta antigua cuando existen.</p>'+
      '<div class="cn-tools__datagrid"><div class="cn-tools__metric"><strong>'+registered+'</strong><small>Indicadores locales</small></div>'+
      '<div class="cn-tools__metric"><strong>'+records.filter(r=>state(r)==='Actualización vencida').length+'</strong><small>Actualización vencida</small></div>'+
      '<div class="cn-tools__metric"><strong>'+records.filter(r=>!r.validado).length+'</strong><small>Sin revisión interna</small></div></div>'+
      '<p class="cn-tools__status" role="status" data-cn-tools-status>'+esc(feedback)+'</p>'+
      '<div class="cn-tools__toolbar">'+
        '<button type="button" class="cn-tools__action" data-cn-tool-action="add">+ Nuevo indicador</button>'+
        '<button type="button" class="cn-tools__action cn-tools__action--light" data-cn-tool-action="export-json">Exportar JSON</button>'+
        '<button type="button" class="cn-tools__action cn-tools__action--light" data-cn-tool-action="export-csv">Exportar CSV</button>'+
        '<label class="cn-tools__action cn-tools__action--light">Importar JSON / CSV / Excel<input hidden type="file" accept=".json,.csv,.xlsx" data-cn-tools-import></label>'+
        '<input type="search" data-cn-tools-search aria-label="Buscar indicadores locales" placeholder="Buscar por nombre, sector o fuente" value="'+esc(query)+'">'+
      '</div><div data-cn-tools-list></div>';
    renderTable();
  }
  function renderTable() {
    const host=body.querySelector('[data-cn-tools-list]'); if(!host)return;
    const q=query.trim().toLowerCase();
    const found=records.filter(r=>[r.nombre,r.codigo,r.sector,r.variable,r.fuente].join(' ').toLowerCase().includes(q));
    if(!found.length){host.innerHTML='<p class="cn-tools__empty">No hay indicadores que coincidan. Agrega uno o importa un archivo propio.</p>';return;}
    host.innerHTML='<div class="cn-tools__table-wrap"><table class="cn-tools__table"><thead><tr><th>Indicador</th><th>Fuente y variable</th><th>Valor calculado</th><th>Actualización</th><th>Acciones</th></tr></thead><tbody>'+
      found.map(r=>{const v=calculate(r);return '<tr><td><strong>'+esc(r.nombre)+'</strong><br><small>'+esc(r.sector||'Sin sector')+' · '+esc(r.codigo||'Sin código')+'</small></td>'+
        '<td>'+esc(r.fuente)+'<br><small>'+esc(r.variable||'')+'</small></td>'+
        '<td>'+(v.error?esc(v.error):format.format(v.value)+' '+esc(r.unidad||''))+'</td>'+
        '<td>'+esc(state(r))+'<br><small>'+(r.validado?'Revisión interna marcada':'Sin validar')+'</small></td>'+
        '<td><button type="button" data-cn-tool-action="edit" data-id="'+esc(r.id)+'">Editar</button> <button type="button" data-cn-tool-action="delete" data-id="'+esc(r.id)+'">Eliminar</button></td></tr>';}).join('')+
      '</tbody></table></div>';
  }
  function renderForm(id) {
    const previous=records.find(r=>r.id===id)||{};
    editing=id||null;
    const sectorOpts=Array.from(new Set([...sectors,previous.sector||''].filter(Boolean)));
    body.innerHTML='<button type="button" class="cn-tools__action cn-tools__action--light" data-cn-tool-action="back">← Volver a indicadores</button>'+
      '<h3 class="cn-tools__section-title" style="margin-top:16px">'+(id?'Editar ficha local':'Registrar indicador local')+'</h3>'+
      '<p class="cn-tools__notice">Registra la fuente, la metodología y el cálculo. No equivale a la publicación de una ficha oficial.</p>'+
      '<p data-cn-tools-status role="status" class="cn-tools__status"></p>'+
      '<form class="cn-tools__form" id="cn-tools-form">'+
      input('nombre','Nombre del indicador *',previous.nombre,'required maxlength="180"')+
      input('codigo','Código',previous.codigo,'maxlength="50"')+
      input('variable','Variable *',previous.variable,'required maxlength="170"')+
      '<label>Sector *<select required name="sector">'+sectorOpts.map(s=>option(s,s,previous.sector||'Demografía y población')).join('')+'</select></label>'+
      input('fuente','Entidad / fuente de información *',previous.fuente,'required maxlength="200"')+
      '<label>Periodicidad *<select name="periodicidad" required>'+periodicities.map(s=>option(s,s,previous.periodicidad||'anual')).join('')+'</select></label>'+
      input('responsable','Dependencia responsable',previous.responsable,'maxlength="150"')+
      input('fecha','Última actualización',previous.fecha,'type="date" max="'+today()+'"')+
      '<label>Fórmula<select name="formula" required>'+formulas.map(f=>option(f[0],f[1],previous.formula||'valor')).join('')+'</select></label>'+
      input('unidad','Unidad',previous.unidad,'maxlength="40" placeholder="personas, %, km..."')+
      input('numerador','Valor A *',previous.numerador,'type="number" step="any" required')+
      input('denominador','Valor B (si aplica)',previous.denominador,'type="number" step="any"')+
      input('factor','Factor de tasa',previous.factor||'1000','type="number" step="any" min="0.000001"')+
      '<label class="cn-tools__wide">Metodología / fórmula de procedencia *<textarea name="metodologia" required maxlength="2000">'+esc(previous.metodologia||'')+'</textarea></label>'+
      '<label class="cn-tools__check cn-tools__wide"><input type="checkbox" name="validado" '+(previous.validado?'checked':'')+'> Revisión interna marcada (NO certificación oficial)</label>'+
      '<p class="cn-tools__status cn-tools__wide" data-cn-tools-preview></p>'+
      '<div class="cn-tools__toolbar cn-tools__wide"><button class="cn-tools__action" type="submit">'+(id?'Guardar cambios':'Guardar indicador')+'</button><button type="button" class="cn-tools__action cn-tools__action--light" data-cn-tool-action="back">Cancelar</button></div></form>';
    preview();
    body.querySelector('[name="nombre"]')?.focus({preventScroll:true});
  }
  function getForm(form) {
    const r=Object.fromEntries(new FormData(form).entries());
    for(const key of fields.filter(k=>k!=='validado'))r[key]=String(r[key]??'').trim();
    r.validado=form.elements.namedItem('validado').checked;
    return r;
  }
  function preview() {
    const form=body.querySelector('#cn-tools-form');if(!form)return;
    const r=getForm(form),v=calculate(r);
    const hasB=r.formula!=='valor';
    form.elements.namedItem('denominador').required=hasB;
    form.elements.namedItem('factor').disabled=r.formula!=='tasa';
    body.querySelector('[data-cn-tools-preview]').textContent=v.error?'Cálculo pendiente: '+v.error:'Resultado: '+format.format(v.value)+' '+r.unidad;
  }
  function download(filename,content,mime) {
    const file=new Blob([content],{type:mime}),url=URL.createObjectURL(file);
    const a=document.createElement('a');a.href=url;a.download=filename;
    document.body.appendChild(a);a.click();a.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),1500);
  }
  function csvCell(v) {
    let value=String(v==null?'':v);
    if(/^[=+\-@\t\r]/.test(value))value="'"+value;
    return '"'+value.replace(/"/g,'""')+'"';
  }
  function exportData(kind) {
    if(!records.length){notice('No hay indicadores para exportar.');return;}
    const stamp=today();
    if(kind==='json')download('indicadores-locales-'+stamp+'.json',JSON.stringify({format:storageKey,exportedAt:new Date().toISOString(),records},null,2),'application/json');
    else download('indicadores-locales-'+stamp+'.csv',[fields.join(','),...records.map(r=>fields.map(k=>csvCell(r[k])).join(','))].join('\r\n'),'text/csv;charset=utf-8');
    notice('Exportación preparada. El archivo contiene datos locales, no un reporte certificado.');
  }
  function parseCSV(text) {
    const delimiter=(text.split(/\r?\n/)[0]||'').split(';').length>(text.split(/\r?\n/)[0]||'').split(',').length?';':',';
    const result=[];let row=[],cell='',quoted=false;
    for(let i=0;i<text.length;i++){
      const ch=text[i],next=text[i+1];
      if(ch==='"'){if(quoted&&next==='"'){cell+='"';i++;}else quoted=!quoted;}
      else if(ch===delimiter&&!quoted){row.push(cell);cell='';}
      else if((ch==='\r'||ch==='\n')&&!quoted){if(ch==='\r'&&next==='\n')i++;row.push(cell);if(row.some(c=>c.trim()))result.push(row);row=[];cell='';}
      else cell+=ch;
    }
    if(quoted)throw Error('CSV con comillas incompletas');
    row.push(cell);if(row.some(c=>c.trim()))result.push(row);
    const cols=(result.shift()||[]).map(s=>s.toLowerCase().trim().replace(/^\uFEFF/,''));
    return result.map(values=>Object.fromEntries(cols.map((key,i)=>[key,values[i]||''])));
  }
  async function importFile(file) {
    if(!file)return;
    if(file.size>5*1024*1024){notice('Archivo demasiado grande (máximo 5 MB).');return;}
    try {
      let incoming=[];
      if(/\.json$/i.test(file.name)){
        const obj=JSON.parse(await file.text());incoming=Array.isArray(obj)?obj:obj.records;
      } else if(/\.csv$/i.test(file.name)){incoming=parseCSV(await file.text());}
      else if(/\.xlsx$/i.test(file.name)&&window.XLSX){
        const bin=await file.arrayBuffer(),workbook=window.XLSX.read(bin,{type:'array',cellDates:false});
        incoming=window.XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]],{defval:''});
      } else throw Error('Formato no disponible. Prueba con JSON o CSV.');
      if(!Array.isArray(incoming))throw Error('No se encontró una lista válida de indicadores.');
      const existing=new Set(records.map(r=>r.id)), codes=new Set(records.map(r=>String(r.codigo||'').toLowerCase()).filter(Boolean));
      let imported=0,rejected=0;
      const next=records.slice();
      for(const raw of incoming.slice(0,1000)){
        if(!raw||typeof raw!=='object'){rejected++;continue;}
        const r={};for(const key of fields)r[key]=String(raw[key]??'').trim();
        r.validado=false;r.formula=r.formula||'valor';
        if(!validate(r)){rejected++;continue;}
        const newCode=r.codigo.toLowerCase();
        const oldId=String(raw.id||'');
        if((oldId&&existing.has(oldId))||(newCode&&codes.has(newCode))){rejected++;continue;}
        r.id=oldId||((window.crypto&&crypto.randomUUID)?crypto.randomUUID():'indicador-'+Date.now()+'-'+imported);
        r.registrado=new Date().toISOString();r.modificado=r.registrado;
        existing.add(r.id);if(newCode)codes.add(newCode);
        next.push(r);imported++;
      }
      if(incoming.length>1000)rejected+=incoming.length-1000;
      if(!imported){notice('No se importó ningún indicador. Rechazados o duplicados: '+rejected+'.');return;}
      if(persist(next)){feedback=imported+' indicadores importados; '+rejected+' rechazados o duplicados. Revisión interna pendiente.';renderManager();}
    }catch(error){notice('Importación cancelada: '+error.message);}
  }
  body.addEventListener('input',event=>{
    if(event.target.matches('[data-cn-tools-search]')){query=event.target.value;renderTable();}
    if(event.target.closest('#cn-tools-form'))preview();
  });
  body.addEventListener('change',event=>{
    if(event.target.matches('[data-cn-tools-import]')){importFile(event.target.files?.[0]);event.target.value='';}
    if(event.target.closest('#cn-tools-form'))preview();
  });
  body.addEventListener('submit',event=>{
    if(event.target.id!=='cn-tools-form')return;
    event.preventDefault();
    const form=event.target,r=getForm(form);
    if(!validate(r)){notice('Verifica nombre, fuente, método, periodicidad, fecha y valores. No se guardó.');return;}
    const previous=records.find(item=>item.id===editing);
    r.id=previous?.id||((window.crypto&&crypto.randomUUID)?crypto.randomUUID():'indicador-'+Date.now());
    r.registrado=previous?.registrado||new Date().toISOString();
    r.modificado=new Date().toISOString();
    const next=previous?records.map(item=>item.id===previous.id?Object.assign({},item,r):item):[...records,r];
    if(persist(next)){feedback='Indicador guardado solamente en este navegador.';editing=null;renderManager();}
  });
  body.addEventListener('click',event=>{
    const button=event.target.closest('[data-cn-tool-action]');
    if(!button||active!=='indicators')return;
    const action=button.dataset.cnToolAction,id=button.dataset.id;
    if(action==='back'){editing=null;renderManager();}
    if(action==='add')renderForm(null);
    if(action==='edit')renderForm(id);
    if(action==='delete'){
      const r=records.find(item=>item.id===id);
      if(r&&window.confirm('¿Eliminar el indicador local "'+r.nombre+'"? Esta acción no se puede deshacer.')){
        if(persist(records.filter(item=>item.id!==id))){feedback='Indicador local eliminado.';renderManager();}
      }
    }
    if(action==='export-json')exportData('json');
    if(action==='export-csv')exportData('csv');
  });
})();
