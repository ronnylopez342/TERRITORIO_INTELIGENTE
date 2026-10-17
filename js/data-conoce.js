/* 2.1 Conoce: recorrido gráfico del dato a la decisión. */
(() => {
  'use strict';
  const root=document.getElementById('data-conoce'); if(!root)return;
  const steps=root.querySelector('#cn-process-steps'); if(!steps)return;
  const paths={fuentes:'M3 6c0-4 18-4 18 0s-18 4-18 0Z M3 6v12c0 4 18 4 18 0V6 M3 12c0 4 18 4 18 0',recopilacion:'M5 2h10l5 5v15H5Z M15 2v6h5 M8 12h9 M8 16h9',validacion:'M12 2 3 6v7c0 5 9 9 9 9s9-4 9-9V6Z m-5 10 3 3 7-7',organizacion:'M3 6c0-4 18-4 18 0s-18 4-18 0Z M3 6v12c0 4 18 4 18 0V6 M3 12c0 4 18 4 18 0',analisis:'M3 13h4v8H3z M10 8h4v13h-4z M17 3h4v18h-4z',decision:'M9 18h6 M9 21h6 M8 15c-7-8 1-17 8-11 4 4 2 7 0 11l-1 3H9Z'};
  function icon(key){return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[key]}"></path></svg>`;}
  steps.innerHTML=[['fuentes','Fuentes'],['recopilacion','Recopilación'],['validacion','Validación'],['organizacion','Organización'],['analisis','Análisis'],['decision','Decisión']].map(([k,n])=>`<li><span class="cn-step-icon">${icon(k)}</span><span>${n}</span></li>`).join('');
})();
