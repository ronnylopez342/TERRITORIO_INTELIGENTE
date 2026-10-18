/* 2.2 Data Subachoque: navegacion en tres modulos existentes.
   Conserva sus IDs, almacenamiento local y sistemas de graficas. */
(() => {
  'use strict';
  const root = document.getElementById('data-subachoque');
  if (!root) return;
  const sections = Object.freeze({
    plan: document.getElementById('data-plan-estadistico'),
    dane: document.getElementById('data-fuentes'),
    memoria: document.getElementById('data-municipales')
  });
  const home = document.getElementById('ds-home');
  const toolbar = document.getElementById('ds-toolbar');
  if (!home || !toolbar || Object.values(sections).some(node => !node)) return;
  let selected = '';
  function show(section, options = {}) {
    const next = Object.prototype.hasOwnProperty.call(sections, section) ? section : '';
    const changed = selected !== next;
    selected = next;
    home.hidden = Boolean(next);
    toolbar.hidden = !next;
    Object.entries(sections).forEach(([key, panel]) => {
      const active = key === next;
      panel.hidden = !active;
      panel.classList.toggle('active', active);
      panel.setAttribute('aria-hidden', String(!active));
    });
    root.querySelectorAll('[data-ds-tab]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.dsTab === next));
    });
    if (options.history !== false && location.hash.startsWith('#data')) {
      const params = new URLSearchParams(location.hash.split('?')[1] || '');
      params.set('seccion', 'data-subachoque');
      if (next) params.set('sub', next);
      else params.delete('sub');
      if (next !== 'plan' && next !== 'dane') params.delete('vista');
      if (changed || location.hash !== '#data?' + params.toString()) {
        history.pushState({route:'data'}, '', '#data?' + params.toString());
      }
    }
    if (options.scroll !== false && (changed || options.focus)) {
      requestAnimationFrame(() => {
        const bar = document.getElementById('siteHeader');
        const offset = (bar?.getBoundingClientRect().height || 76) + 15;
        const target = next ? toolbar : home;
        const y = window.scrollY + target.getBoundingClientRect().top - offset;
        window.scrollTo({top: Math.max(0, y), behavior:'auto'});
        if (options.focus !== false) {
          const heading = next ? toolbar.querySelector('.ds-back') : document.getElementById('ds-title');
          heading?.focus({preventScroll:true});
        }
      });
    }
    if (changed) document.dispatchEvent(new CustomEvent('ti:data-subachoque-changed', {detail:{sub:next}}));
  }
  function syncFromHash() {
    const [route, query] = location.hash.slice(1).split('?');
    if (route !== 'data') return;
    const params = new URLSearchParams(query || '');
    if (params.get('seccion') !== 'data-subachoque') return;
    show(params.get('sub') || '', {history:false,scroll:false,focus:false});
  }
  root.addEventListener('click', event => {
    const trigger = event.target.closest('[data-ds-open], [data-ds-tab], [data-ds-back]');
    if (!trigger || !root.contains(trigger)) return;
    const choice = trigger.hasAttribute('data-ds-back') ? '' : (trigger.dataset.dsOpen ?? trigger.dataset.dsTab);
    show(choice, {history:true,scroll:true,focus:true});
  });
  window.TIDataSubachoque = Object.freeze({show, syncFromHash, current: () => selected});
  window.addEventListener('popstate',syncFromHash);
  window.addEventListener('hashchange',syncFromHash);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',syncFromHash,{once:true});
  else syncFromHash();
})();