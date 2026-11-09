(function TI42SharedFrame(){
  'use strict';
  const root=document.querySelector('#cumplimiento-proyectos'),shell=root?.querySelector('.ti42');
  const projects=window.TI42Proyectos,summary=window.TI42Summary;
  if(!shell||!projects||!summary)return;
  const tabs=[...shell.querySelectorAll('.ti42-tabs [role=tab]')];
  const side=root.querySelector('[data-ti42-side-nav]');
  const icons=['▦','▣','▤','▥','▦','⌖','▧','◴','⚑','▱'];
  const viewTitle=document.createElement('h2');viewTitle.className='ti42-view-title';
  shell.querySelector('.ti42-tabs').after(viewTitle);
  const panelSelectors={resumen:'[data-ti42-resumen-content]',proyectos:'[data-ti42-proyectos-root]',contratos:'[data-ti42-contratos-root]',financiera:'[data-ti42-financiera-root]',cronograma:'[data-ti42g-panel]',mapa:'[data-ti42-mapa-root]',evidencias:'[data-ti42-evidencias-root]',indicadores:'[data-ti42i-root]',riesgos:'[data-ti42r-root]',documentos:'[data-ti42d-root]'};
  for(const tab of tabs){
    const id=tab.dataset.ti42View,panel=shell.querySelector(panelSelectors[id]);
    tab.id='uc42-tab-'+id;
    if(panel){panel.id='uc42-panel-'+id;panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',tab.id);tab.setAttribute('aria-controls',panel.id);}
  }
  shell.addEventListener('keydown',event=>{
    const tab=event.target.closest('[role=tab]'),list=tab?.closest('[role=tablist]');
    if(!list||list.classList.contains('ti42-tabs')||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    const buttons=[...list.querySelectorAll('[role=tab]')],i=buttons.indexOf(tab);
    const next=event.key==='Home'?buttons[0]:event.key==='End'?buttons.at(-1):buttons[(i+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length];
    event.preventDefault();next.focus();next.click();
  });
  side.innerHTML=tabs.map((tab,i)=>'<button type="button" data-ti42-side="'+tab.dataset.ti42View+'"><span aria-hidden="true">'+icons[i]+'</span><span>'+tab.textContent+'</span></button>').join('');
  side.addEventListener('click',event=>{const button=event.target.closest('[data-ti42-side]');if(button)projects.setView(button.dataset.ti42Side);});
  let scheduled=false;
  function sync(){
    scheduled=false;
    const view=projects.state.view;
    const title=tabs.find(tab=>tab.dataset.ti42View===view)?.textContent||'Resumen';
    if(viewTitle.textContent!==title)viewTitle.textContent=title;
    const hideTitle=['proyectos','contratos','financiera'].includes(view);
    if(viewTitle.hidden!==hideTitle)viewTitle.hidden=hideTitle;
    for(const button of side.querySelectorAll('button')){
      const current=button.dataset.ti42Side===view;
      if(current&&button.getAttribute('aria-current')!=='page')button.setAttribute('aria-current','page');
      if(!current&&button.hasAttribute('aria-current'))button.removeAttribute('aria-current');
    }
    // One active tab is in the keyboard sequence, with stable control/panel associations.
    for(const tab of tabs){
      const id=tab.dataset.ti42View;
      if(!tab.id)tab.id='uc42-tab-'+id;
      const active=id===view;
      if(tab.tabIndex!==(active?0:-1))tab.tabIndex=active?0:-1;
    }
    for(const tab of shell.querySelectorAll('[role=tablist]:not(.ti42-tabs) [role=tab]')){
      const value=tab.getAttribute('aria-selected')==='true'?0:-1;
      if(tab.tabIndex!==value)tab.tabIndex=value;
    }
    const row=summary.filteredRows.find(r=>r.excelRow===projects.selectedRow),extra=row?projects.getExtraRow(row.excelRow):null;
    const detail=shell.querySelector('.ti42p-detail-note');
    if(detail&&row){
      let note=detail.querySelector('[data-ti42-quality]');
      if(!note){note=document.createElement('div');note.dataset.ti42Quality='1';detail.append(note);}
      const messages=[];
      if(row.excelRow===4)messages.push('Revisar la fuente: el nombre indica Altania, pero el objeto contractual menciona La Unión / El Almaguer.');
      if(row.excelRow===7)messages.push('Revisar la fuente: el nombre indica La Unión / El Cohete, pero la vereda y el objeto contractual corresponden a El Tobal.');
      if(row.executedCost>row.budget&&Number.isFinite(row.budget))messages.push('El costo ejecutado supera el costo total consignado. Revisar adiciones y valor actualizado.');
      if(row.veredaRaw&&!row.vereda)messages.push('La celda de vereda contiene una nota: '+row.veredaRaw);
      if(row.sourceDateNotes)messages.push('Fechas de origen con contexto: '+Object.values(row.sourceDateNotes).join(' · '));
      const content=messages.join(' ');
      if(note.textContent!==content)note.textContent=content;
      note.className=messages.length?'ti42-source-warning':'ti42-source-note';
      if(extra){
        const location=shell.querySelector('[data-ti42p-map-meta]');
        if(location&&!location.querySelector('[data-ti42-coordinates]')){
          const p=document.createElement('p');p.dataset.ti42Coordinates='1';p.className='ti42-source-note';
          const a=window.TI42Core.coordinate(extra.coordStart),b=window.TI42Core.coordinate(extra.coordEnd);
          p.textContent='Coordenadas de origen: '+(a?a.lat.toFixed(6)+', '+a.lon.toFixed(6):'inicio sin formato válido')+' → '+(b?b.lat.toFixed(6)+', '+b.lon.toFixed(6):'final sin formato válido')+'. Conversión de formato; ubicación de obra pendiente de validar.';
          location.append(p);
        }
      }
    }
  }
  const observer=new MutationObserver(()=>{if(!scheduled){scheduled=true;requestAnimationFrame(sync);}});
  observer.observe(shell,{subtree:true,childList:true,attributes:true,attributeFilter:['data-view','hidden']});
  sync();
})();
