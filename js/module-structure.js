'use strict';

/* Shared, reload-safe links for the section structure. */
function restoreModuleSection() {
  const fragment=location.hash.slice(1);
  const route=fragment.split('?')[0];
  const view=document.querySelector(`.app-view[data-view="${validRoute(route)?route:'data'}"]`);
  if(!view)return;
  const requested=new URLSearchParams(fragment.split('?')[1]||'').get('seccion');
  const tabs=[...view.querySelectorAll('[data-module-panel]')];
  const selected=tabs.find(tab=>tab.dataset.modulePanel===requested)
    || (route==='data' ? tabs.find(tab=>tab.dataset.modulePanel==='data-fuentes') : null)
    || tabs[0];
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
  if(route==='data'){
    const active=document.getElementById('tiDataActiveLabel');
    if(active)active.textContent=selected.textContent.trim();
    document.querySelectorAll('[data-data-destination]').forEach(button=>button.classList.toggle('is-selected',button.dataset.dataDestination===selected.dataset.modulePanel));
  }
}

function saveModuleSection(panelId, route) {
  const hash=`#${route}?seccion=${encodeURIComponent(panelId)}`;
  if(location.hash!==hash)history.pushState({route},'',hash);
  restoreModuleSection();
}

const dataChapterToggle=document.getElementById('dataChapterToggle');
const dataChapterMenu=document.getElementById('dataSubnav');
function closeDataChapters({restoreFocus=false}={}){
  if(!dataChapterMenu||!dataChapterToggle)return;
  dataChapterMenu.hidden=true;
  dataChapterToggle.setAttribute('aria-expanded','false');
  dataChapterToggle.setAttribute('aria-label','Abrir secciones de Data Territorio');
  if(restoreFocus)dataChapterToggle.focus();
}
dataChapterToggle?.addEventListener('click',()=>{
  const show=dataChapterMenu.hidden;
  dataChapterMenu.hidden=!show;
  dataChapterToggle.setAttribute('aria-expanded',String(show));
  dataChapterToggle.setAttribute('aria-label',show?'Cerrar secciones de Data Territorio':'Abrir secciones de Data Territorio');
});
document.addEventListener('click',event=>{
  if(dataChapterMenu&&!dataChapterMenu.hidden
    && !event.target.closest('#dataSubnav,#dataChapterToggle'))closeDataChapters();
  const dataTab=event.target.closest('#dataSubnav [data-module-panel]');
  if(dataTab){saveModuleSection(dataTab.dataset.modulePanel,'data');closeDataChapters();}
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
document.addEventListener('keydown',event=>{
  if(event.key==='Escape' && dataChapterMenu && !dataChapterMenu.hidden){
    event.preventDefault();
    closeDataChapters({restoreFocus:true});
  }
});
addEventListener('popstate',()=>{restoreModuleSection();closeDataChapters();});
addEventListener('hashchange',()=>{restoreModuleSection();closeDataChapters();});
document.addEventListener('DOMContentLoaded',()=>{restoreModuleSection();closeDataChapters();});
