'use strict';

/* Shared, reload-safe links for the section structure. */
function restoreModuleSection() {
  const fragment=location.hash.slice(1);
  const route=fragment.split('?')[0];
  const view=document.querySelector(`.app-view[data-view="${validRoute(route)?route:'data'}"]`);
  if(!view)return;
  const original=new URLSearchParams(fragment.split('?')[1]||'').get('seccion');
  // Redirecciones permanentes de la estructura anterior (2.2, 2.3, 2.4, 2.5).
  // Las URL existentes siguen funcionando sin duplicar pestañas ni perder la vista.
  const params=new URLSearchParams(fragment.split('?')[1]||'');
  const aliases={
    // Los tres apartados anteriores se sustituyeron por las dimensiones.
    // Solo redireccionamos: no restauramos pestañas canceladas.
    'data-plan-estadistico':['data-subachoque','social'],
    'data-fuentes':['data-subachoque','social'],
    'data-municipales':['data-subachoque','social'],
    'data-geo':['data-explorando',''],
    'data-caracterizacion':['data-encuesta',''],
    'data-publicaciones':['data-conoce','']
  };
  const alias=route==='data'?aliases[original]:null;
  const requested=alias?alias[0]:original;
  if(alias){
    params.set('seccion',requested);
    params.delete('sub');
    params.delete('vista');
    if(alias[1])params.set('dimension',alias[1]);
    if(original==='data-publicaciones')params.set('bloque','publicaciones');
    history.replaceState({route:'data'},'', '#data?'+params.toString());
  }
  const tabs=[...view.querySelectorAll('[data-module-panel]')];
  const selected=tabs.find(tab=>tab.dataset.modulePanel===requested)||tabs[0];
  if(!selected)return;
  for(const tab of tabs){
    const active=tab===selected;
    tab.classList.toggle('active',active);
    tab.setAttribute('aria-selected',String(active));
    tab.tabIndex=active?0:-1;
    const panel=document.getElementById(tab.dataset.modulePanel);
    panel.hidden=!active;
    panel.classList.toggle('active',active);
  }
  // El submodulo interno se sincroniza tambien al volver/avanzar en el historial.
  if(route==='data')window.TIDataSubachoque?.syncFromHash?.();
}

function saveModuleSection(panelId, route) {
  const hash=`#${route}?seccion=${encodeURIComponent(panelId)}`;
  if(location.hash!==hash)history.pushState({route},'',hash);
  restoreModuleSection();
}

document.addEventListener('click',event=>{
  const tab=event.target.closest('.ti-stage-one [data-module-panel]');
  if(tab)saveModuleSection(tab.dataset.modulePanel,tab.closest('[data-view]').dataset.view);
  const destination=event.target.closest('[data-data-destination]');
  if(destination)saveModuleSection(destination.dataset.dataDestination,'data');
  if(event.target.closest('.route-link[data-route]'))restoreModuleSection();
});
document.addEventListener('keydown',event=>{
  const tab=event.target.closest('.ti-stage-one [role=tab]');
  if(!tab||!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  const tabs=[...tab.closest('[role=tablist]').querySelectorAll('[role=tab]')];
  const delta=['ArrowDown','ArrowRight'].includes(event.key)?1:-1;
  const index=event.key==='Home'?0:event.key==='End'?tabs.length-1:(tabs.indexOf(tab)+delta+tabs.length)%tabs.length;
  event.preventDefault();
  tabs[index].focus();
  saveModuleSection(tabs[index].dataset.modulePanel,tab.closest('[data-view]').dataset.view);
});
addEventListener('popstate',restoreModuleSection);
addEventListener('hashchange',restoreModuleSection);
document.addEventListener('DOMContentLoaded',restoreModuleSection);
