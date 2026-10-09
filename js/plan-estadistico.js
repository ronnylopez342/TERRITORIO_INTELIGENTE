'use strict';
/* Data delivery 02. Explicit, local-only statistical metadata and computations.
   The source must be entered by the operator. No source or number is certified here. */
const TIStat = (() => {
  let indicators = [];
  const safe = value => escapeHtml(String(value ?? ''));
  const day = value => value ? new Date(value+'T12:00:00Z') : null;
  const fmt = number => new Intl.NumberFormat('es-CO',{maximumFractionDigits:6}).format(number);
  const freshness = item => {
    if (!item.actualizado || !item.periodicidad) return {code:'unknown',name:'Actualización sin validar'};
    if(item.periodicidad === 'eventual') return {code:'unknown',name:'Frecuencia eventual'};
    const when=day(item.actualizado);
    if(!when || !Number.isFinite(when.getTime()) || when.getTime()>Date.now()) return {code:'invalid',name:'Fecha por verificar'};
    const limits={mensual:45,trimestral:110,semestral:205,anual:400};
    const stale=(Date.now()-when.getTime())/86400000>limits[item.periodicidad];
    return stale?{code:'stale',name:'Actualización pendiente'}:{code:'current',name:'Dentro de periodicidad'};
  };
  const value = item => {
    const n=item.numerador,d=item.denominador,f=item.factor;
    if(n===''||d===''||f===''||n==null||d==null||f==null)return null;
    const nums=[n,d,f].map(Number);
    return nums.every(Number.isFinite)&&nums[1]!==0?nums[0]/nums[1]*nums[2]:null;
  };
  const draw = () => {
    const root=document.getElementById('statIndicatorList');
    if(!root)return;
    const query=(document.getElementById('statIndicatorSearch')?.value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    const rows=indicators.filter(x=>(x.nombre+' '+x.sector+' '+x.fuente).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(query));
    root.innerHTML=rows.map(x=>{
      const state=freshness(x),calculated=value(x);
      return `<article class="ti-stat-indicator"><small>${safe(x.sector)} · ${safe(x.periodo||'Periodo no documentado')}</small><h5>${safe(x.nombre)}</h5><strong class="ti-stat-value">${calculated===null?'Sin cálculo':fmt(calculated)+' '+safe(x.unidad)}</strong><p><span class="ti-stat-state" data-state="${state.code}">${safe(state.name)}</span></p><p><b>Fuente:</b> ${safe(x.fuente)}<br><b>Periodicidad:</b> ${safe(x.periodicidad)}<br><b>Actualizado:</b> ${safe(x.actualizado||'Sin fecha')}</p><p><b>Fórmula:</b> numerador ÷ denominador × factor.<br><b>Metodología:</b> ${safe(x.metodologia)}</p><div class="card-actions"><button type="button" class="text-button" data-stat-edit="${safe(x.id)}">Editar</button><button type="button" class="text-button" data-stat-delete="${safe(x.id)}">Eliminar</button></div></article>`;
    }).join('')||'<p class="empty-state">Aún no hay indicadores registrados en este navegador.</p>';
    root.querySelectorAll('[data-stat-edit]').forEach(button=>button.onclick=()=>{
      const record=indicators.find(i=>i.id===button.dataset.statEdit);if(!record)return;
      const form=document.getElementById('statIndicatorForm');
      for(const [k,v] of Object.entries(record)){const field=form.elements.namedItem(k);if(field)field.value=v??'';}
      form.scrollIntoView({behavior:'smooth',block:'start'});form.querySelector('[name="nombre"]').focus();
    });
    root.querySelectorAll('[data-stat-delete]').forEach(button=>button.onclick=async()=>{
      const id=button.dataset.statDelete,record=indicators.find(i=>i.id===id);
      if(!record||!window.confirm('¿Eliminar el indicador local «'+record.nombre+'»?'))return;
      const next=indicators.filter(i=>i.id!==id);
      try {await TIData.write('stat:indicators',next);indicators=next;draw();status('Indicador eliminado de este navegador.');}
      catch(error){status('No se pudo guardar la eliminación: '+error.message);}
    });
  };
  const status = msg => {const el=document.getElementById('statSaveStatus');if(el)el.textContent=msg;};
  function intro() {
    const root=document.getElementById('sourceIntroCatalog');
    if(!root)return;
    const sources=TI_STATE.baseData?.sources||[];
    root.innerHTML=sources.map(source=>`<article><a href="${safe(source.url)}" target="_blank" rel="noopener noreferrer">${safe(source.name)} ↗</a><p>Origen: ${safe(source.level)}<br>Periodicidad: ${safe(source.periodicity)}<br>Integración: no verificada</p></article>`).join('');
  }
  async function init(){
    intro();
    const form=document.getElementById('statIndicatorForm');
    if(!form)return;
    try {indicators=await TIData.read('stat:indicators')||[];if(!Array.isArray(indicators))indicators=[];}catch(error){status('No se pudo leer indicadores locales: '+error.message);}
    draw();
    document.getElementById('statIndicatorSearch')?.addEventListener('input',draw);
    form.addEventListener('reset',()=>{form.elements.namedItem('id').value='';});
    form.addEventListener('submit',async event=>{
      event.preventDefault();if(!form.reportValidity())return;
      const raw=Object.fromEntries(new FormData(form).entries());
      if(raw.denominador!==''&&Number(raw.denominador)===0){status('El denominador no puede ser cero.');return;}
      if(raw.actualizado&&day(raw.actualizado)>new Date()){status('La fecha de actualización no puede estar en el futuro.');return;}
      if((raw.numerador==='') !== (raw.denominador==='')){status('Para calcular se requieren numerador y denominador.');return;}
      const row={...raw,id:raw.id||crypto.randomUUID(),modified:new Date().toISOString()};
      const next=raw.id?indicators.map(x=>x.id===raw.id?row:x):[...indicators,row];
      try {await TIData.write('stat:indicators',next);indicators=next;form.reset();form.elements.namedItem('id').value='';draw();status('Indicador registrado localmente. No se ha publicado ni certificado.');}
      catch(error){status('No se pudo guardar: '+error.message);}
    });
    document.getElementById('statExportIndicators')?.addEventListener('click',()=>{
      if(!indicators.length){status('No hay indicadores para exportar.');return;}
      const rows=indicators.map(x=>({...x,resultado:value(x)??'',estado_actualizacion:freshness(x).name}));
      downloadBlob('plan-estadistico-indicadores-locales.csv','\uFEFF'+rowsToCsv(rows),'text/csv;charset=utf-8');
    });
  }
  return {init};
})();
window.addEventListener('load',()=>{let attempts=0;const loop=()=>{if(typeof TI_STATE !== 'undefined' && TI_STATE.baseData)TIStat.init();else if(++attempts<80)setTimeout(loop,150)};loop();});
