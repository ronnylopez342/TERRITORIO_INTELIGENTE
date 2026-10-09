'use strict';

/* Shared, reload-safe links for the section structure. */
function restoreModuleSection() {
  const fragment=location.hash.slice(1);
  const route=fragment.split('?')[0];
  const view=document.querySelector(`.app-view[data-view="${validRoute(route)?route:'data'}"]`);
  if(!view)return;
  const requested=new URLSearchParams(fragment.split('?')[1]||'').get('seccion');
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
