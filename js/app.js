'use strict';

const HERO_REMOTE_VIDEO = 'https://qnkjlfqulijqpjecfdpr.supabase.co/storage/v1/object/public/territorio-inteligente-media/asi-cumplimos-v1.mp4';
const HERO_LOCAL_VIDEO = 'assets/video/asi-cumplimos-v1.mp4';

const ROUTES = {
  equipo: { title: 'Nuestro equipo — Territorio Inteligente' },
  'perfil-jorge-alberto-camacho-lizarazo': { title: 'Jorge Alberto Camacho Lizarazo — Territorio Inteligente' },
  'perfil-luis-fernando-rey-tovar': { title: 'Luis Fernando Rey Tovar — Territorio Inteligente' },
  'perfil-marcos-giovanni-garzon-delgado': { title: 'Marcos Giovanni Garzón Delgado — Territorio Inteligente' },
  'perfil-liliana-carolina-garnica-lozano': { title: 'Liliana Carolina Garnica Lozano — Territorio Inteligente' },
  'perfil-fernando-nunez-cocunubo': { title: 'Fernando Núñez Cocunubo — Territorio Inteligente' },
  'perfil-nicolas-cortes-vasquez': { title: 'Nicolás Cortés Vásquez — Territorio Inteligente' },
  'perfil-maria-del-pilar-hurtado-uriarte': { title: 'María del Pilar Hurtado Uriarte — Territorio Inteligente' },
  'perfil-ana-lizeth-martinez-villalba': { title: 'Ana Lizeth Martínez Villalba — Territorio Inteligente' },

  home: { title: 'Territorio Inteligente' },
  data: { title: 'Data Territorio — Territorio Inteligente' },
  desarrollo: { title: 'Plan de Desarrollo — Territorio Inteligente' },
  cumplimiento: { title: 'Unidad de Cumplimiento — Territorio Inteligente' },
  politicas: { title: 'Políticas Públicas — Territorio Inteligente' },
  insights: { title: 'Insights — Territorio Inteligente' },
  servicios: { title: 'Servicios — Territorio Inteligente' },
  login: { title: 'Iniciar sesión — Territorio Inteligente' }
};

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const header = document.getElementById('siteHeader');
const menu = document.getElementById('mobileMenu');
const openBtn = document.getElementById('menuToggle');
const closeBtn = document.getElementById('mobileClose');
const toast = document.getElementById('toast');
const dataDropdown = document.getElementById('tiDataDropdown');
const dataDropdownTrigger = document.getElementById('tiDataDropdownTrigger');
const dataDropdownMenu = document.getElementById('tiDataDropdownMenu');
const mobileDataToggle = document.getElementById('tiMobileDataToggle');
const mobileDataMenu = document.getElementById('tiMobileDataMenu');
let currentRoute = 'home';
let observer;
let toastTimer;
let heroMode = 'none';

function validRoute(route) {
  return Object.prototype.hasOwnProperty.call(ROUTES, route);
}

function routeFromLocation() {
  let hash;
  try { hash = decodeURIComponent(location.hash.replace(/^#/, '').split('?')[0]).trim(); } catch { return 'home'; }
  return validRoute(hash) ? hash : 'home';
}

function getFocusable(container) {
  return [...container.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')]
    .filter(el => !el.hidden && el.offsetParent !== null);
}

function setMenu(state, { restoreFocus = true } = {}) {
  if (!menu || !openBtn) return;
  menu.classList.toggle('open', state);
  menu.setAttribute('aria-hidden', String(!state));
  menu.inert = !state;
  if (!state) setMobileDataDropdownOpen(false);
  openBtn.setAttribute('aria-expanded', String(state));
  document.body.style.overflow = state ? 'hidden' : '';
  if (state) {
    requestAnimationFrame(() => closeBtn?.focus());
  } else if (restoreFocus) {
    openBtn.focus();
  }
}


/* DATA TERRITORIO — menú de navegación editorial y acceso directo a pestañas. */
function setDataDropdownOpen(open, { focusFirst = false, restoreFocus = false } = {}) {
  if (!dataDropdownMenu || !dataDropdownTrigger) return;
  dataDropdownMenu.hidden = !open;
  dataDropdownTrigger.setAttribute('aria-expanded', String(open));
  dataDropdown?.classList.toggle('open', open);
  if (open && focusFirst) dataDropdownMenu.querySelector('[role="menuitem"]')?.focus();
  if (!open && restoreFocus) dataDropdownTrigger.focus();
}
function setMobileDataDropdownOpen(open) {
  if (!mobileDataMenu || !mobileDataToggle) return;
  mobileDataMenu.hidden = !open;
  mobileDataToggle.setAttribute('aria-expanded', String(open));
}
function selectDataPanel(panelId) {
  const tab = [...document.querySelectorAll('#dataSubnav [data-module-panel]')].find(el => el.dataset.modulePanel === panelId);
  const panel = document.getElementById(panelId);
  if (!tab || !panel || panel.dataset.panelGroup !== 'data') return false;
  document.querySelectorAll('[data-panel-group="data"]').forEach(el => {
    const selected = el === panel;
    el.classList.toggle('active', selected);
    el.hidden = !selected;
  });
  document.querySelectorAll('#dataSubnav [data-module-panel]').forEach(el => {
    const selected = el === tab;
    el.classList.toggle('active', selected);
    el.setAttribute('aria-selected', String(selected));
    el.tabIndex = selected ? 0 : -1;
  });
  document.querySelectorAll('[data-data-destination]').forEach(el => {
    el.classList.toggle('is-selected', el.dataset.dataDestination === panelId);
  });
  /* La barra secundaria ya no es visible: dirigir la vista al contenido real. */
  requestAnimationFrame(() => {
    const headerHeight = header?.getBoundingClientRect().height || 98;
    const view = document.querySelector('.app-view[data-view="data"]');
    const viewTop = window.scrollY + (view?.getBoundingClientRect().top ?? 0);
    // Keep the compact Data header and section menu accessible after switching panels.
    window.scrollTo({ top: Math.max(0, viewTop - headerHeight), behavior: 'instant' });
    panel.setAttribute('tabindex', '-1');
    panel.focus({ preventScroll: true });
  });
  return true;
}
dataDropdownTrigger?.addEventListener('click', e => {
  e.preventDefault();
  e.stopPropagation();
  setDataDropdownOpen(true);
});
dataDropdownTrigger?.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    setDataDropdownOpen(true);
    const items = [...dataDropdownMenu.querySelectorAll('[role="menuitem"]')];
    (e.key === 'ArrowDown' ? items[0] : items.at(-1))?.focus();
  }
});
dataDropdown?.addEventListener('pointerenter', e => {
  if (e.pointerType === 'mouse') setDataDropdownOpen(true);
});
dataDropdown?.addEventListener('pointerleave', e => {
  if (e.pointerType === 'mouse') setDataDropdownOpen(false);
});
dataDropdownMenu?.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    e.preventDefault();
    setDataDropdownOpen(false, { restoreFocus: true });
    return;
  }
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
  e.preventDefault();
  const items = [...dataDropdownMenu.querySelectorAll('[role="menuitem"]')];
  const index = items.indexOf(document.activeElement);
  let nextIndex = index;
  if (e.key === 'ArrowDown') nextIndex = (index + 1) % items.length;
  if (e.key === 'ArrowUp') nextIndex = (index - 1 + items.length) % items.length;
  if (e.key === 'Home') nextIndex = 0;
  if (e.key === 'End') nextIndex = items.length - 1;
  items[nextIndex]?.focus();
});
mobileDataToggle?.addEventListener('click', e => {
  e.preventDefault();
  e.stopPropagation();
  setMobileDataDropdownOpen(mobileDataMenu.hidden);
});
document.addEventListener('pointerdown', e => {
  if (dataDropdown && !dataDropdown.contains(e.target)) setDataDropdownOpen(false);
});
document.addEventListener('focusin', e => {
  if (dataDropdown && !dataDropdown.contains(e.target)) setDataDropdownOpen(false);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && dataDropdownMenu && !dataDropdownMenu.hidden) {
    e.preventDefault();
    setDataDropdownOpen(false, { restoreFocus: true });
  }
});

openBtn?.addEventListener('click', () => setMenu(true));
closeBtn?.addEventListener('click', () => setMenu(false));

document.addEventListener('keydown', event => {
  if (!menu?.classList.contains('open')) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    setMenu(false);
    return;
  }
  if (event.key !== 'Tab') return;
  const focusable = getFocusable(menu);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

function initReveals() {
  observer?.disconnect();
  const reveals = [...document.querySelectorAll('.app-view.active .reveal:not(.in)')];
  if (reducedMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('in'));
    return;
  }
  observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach(el => observer.observe(el));
}

function focusRouteHeading(target) {
  const heading = target.querySelector('h1');
  if (!heading) return;
  requestAnimationFrame(() => heading.focus({ preventScroll: true }));
}

function setRoute(route, { historyMode = 'push', focus = true, scroll = true } = {}) {
  if (!validRoute(route)) route = 'home';
  const target = document.querySelector(`.app-view[data-view="${route}"]`);
  if (!target) return;

  currentRoute = route;
  document.querySelectorAll('.app-view').forEach(view => view.classList.toggle('active', view === target));
  document.querySelectorAll('.route-link[data-route]').forEach(btn => {
    const active = btn.dataset.route === route;
    btn.classList.toggle('active', active);
    if (active) btn.setAttribute('aria-current', 'page');
    else btn.removeAttribute('aria-current');
  });

  setDataDropdownOpen(false);
  header?.classList.add('force-dark');
  document.title = ROUTES[route].title;
  setMenu(false, { restoreFocus: false });

  const nextHash = `#${route}`;
  if (historyMode === 'push' && location.hash !== nextHash) history.pushState({ route }, '', nextHash);
  if (historyMode === 'replace' && location.hash !== nextHash) history.replaceState({ route }, '', nextHash);

  if (scroll) window.scrollTo({ top: 0, behavior: 'auto' });
  requestAnimationFrame(initReveals);
  if (focus) focusRouteHeading(target);
}

document.addEventListener('click', event => {
  const destination = event.target.closest('[data-data-destination]');
  if (destination) {
    event.preventDefault();
    const panelId = destination.dataset.dataDestination;
    const tab = [...document.querySelectorAll('#dataSubnav [data-module-panel]')].find(el => el.dataset.modulePanel === panelId);
    if (!tab) return;
    setRoute('data', { historyMode: 'push', focus: false, scroll: true });
    setDataDropdownOpen(false);
    setMobileDataDropdownOpen(false);
    selectDataPanel(panelId);
    return;
  }
  if (event.target.closest('#dataSubnav [data-module-panel]')) {
    const tab = event.target.closest('#dataSubnav [data-module-panel]');
    document.querySelectorAll('[data-data-destination]').forEach(el => el.classList.toggle('is-selected', el.dataset.dataDestination === tab.dataset.modulePanel));
  }
  const routeBtn = event.target.closest('.route-link[data-route]');
  if (routeBtn) {
    event.preventDefault();
    setRoute(routeBtn.dataset.route, { historyMode: 'push', focus: true, scroll: true });
    return;
  }

  const pending = event.target.closest('[data-coming-soon]');
  if (pending) {
    event.preventDefault();
    showToast(`${pending.dataset.comingSoon}: contenido en preparación. No se abrió una ruta falsa.`);
  }
});

addEventListener('popstate', () => setRoute(routeFromLocation(), { historyMode: 'none', focus: true, scroll: true }));
addEventListener('hashchange', () => {
  const route = routeFromLocation();
  if (route !== currentRoute) setRoute(route, { historyMode: 'none', focus: true, scroll: true });
});
addEventListener('scroll', () => header?.classList.toggle('scrolled', scrollY > 24 || currentRoute !== 'home'), { passive: true });

function showToast(message) {
  if (!toast) return;
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3600);
}

function activateHeroMode(mode) {
  heroMode = mode;
  const media = document.getElementById('heroMedia');
  const localWrap = document.getElementById('heroLocalVideoWrap');
  localWrap?.classList.toggle('active', mode === 'video');
  media?.classList.toggle('video-active', mode === 'video');
}

function waitForVideoSource(video, source, timeoutMs = 12000) {
  return new Promise(resolve => {
    let done = false;
    const finish = ok => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      video.removeEventListener('canplay', onReady);
      video.removeEventListener('loadeddata', onReady);
      video.removeEventListener('error', onError);
      resolve(ok);
    };
    const onReady = () => finish(true);
    const onError = () => finish(false);
    const timer = setTimeout(() => finish(false), timeoutMs);
    video.addEventListener('canplay', onReady, { once: true });
    video.addEventListener('loadeddata', onReady, { once: true });
    video.addEventListener('error', onError, { once: true });
    video.src = source;
    video.load();
  });
}

async function tryHeroVideo(source, label) {
  const video = document.getElementById('heroLocalVideo');
  if (!video) return false;
  const ready = await waitForVideoSource(video, source);
  if (!ready) {
    console.warn(`Hero ${label} no disponible: ${source}`);
    video.removeAttribute('src');
    video.load();
    return false;
  }
  activateHeroMode('video');
  if (reducedMotion) {
    video.pause();
    try { video.currentTime = 0; } catch {}
    return true;
  }
  try {
    await video.play();
  } catch (error) {
    console.warn(`El navegador bloqueo autoplay del hero ${label}.`, error);
  }
  return true;
}

async function configureHeroMedia() {
  activateHeroMode('none');
  const saveData = Boolean(navigator.connection?.saveData);
  if (saveData) {
    console.info('Hero en modo ahorro de datos: se mantiene el poster estático.');
    return;
  }
  if (await tryHeroVideo(HERO_REMOTE_VIDEO, 'Supabase')) return;
  if (await tryHeroVideo(HERO_LOCAL_VIDEO, 'local')) return;
  activateHeroMode('none');
  console.warn('No se pudo cargar el hero desde Supabase ni desde el respaldo local. Se mantiene fondo oscuro.');
}

function initImageFallbacks() {
  document.querySelectorAll('img[data-fallback]').forEach(img => {
    img.addEventListener('error', () => img.classList.add('is-error'), { once: true });
  });
}

function initLoginPrototype() {
  // The public portal cannot establish an institutional session without an auth service.
  sessionStorage.removeItem('ti-demo-session');
}

setRoute(routeFromLocation(), { historyMode: location.hash ? 'none' : 'replace', focus: false, scroll: false });
initImageFallbacks();
initLoginPrototype();
configureHeroMedia();
initReveals();

// Directory controls mirror the reference while keeping profiles inside this site.
let teamVisibleLimit = 4;
function filterTeamDirectory() {
 const query = (document.getElementById('teamSearch')?.value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
 const areas = [...document.querySelectorAll('[name="team-area-chip"]:checked')].map(el=>el.value);
 const roles = [...document.querySelectorAll('[name="team-role-chip"]:checked')].map(el=>el.value);
 let count = 0;
 const filtering = query || areas.length || roles.length;
 document.querySelectorAll('.ti-person-item').forEach(card=>{
  const text = card.textContent.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const matches = (!query || text.includes(query)) && (!areas.length || areas.includes(card.dataset.area)) && (!roles.length || roles.includes(card.dataset.group));
  if (matches) count++;
  card.hidden = !matches || (!filtering && count > teamVisibleLimit);
 });
 document.getElementById('teamEmpty').hidden = count > 0;
 document.getElementById('teamLoadMore').hidden = Boolean(filtering) || count <= teamVisibleLimit;
}
document.getElementById('teamSearch')?.addEventListener('input',filterTeamDirectory);
document.querySelectorAll('.ti-filter-chips input').forEach(el=>el.addEventListener('change',filterTeamDirectory));
document.querySelectorAll('[data-team-reset]').forEach(el=>el.addEventListener('click',()=>{
 const group = el.dataset.teamReset === 'area' ? 'team-area-chip' : 'team-role-chip';
 document.querySelectorAll('[name="'+group+'"]').forEach(input=>input.checked=false);
 filterTeamDirectory();
}));
document.getElementById('teamReset')?.addEventListener('click',()=>{
 document.getElementById('teamSearch').value='';
 document.querySelectorAll('.ti-filter-chips input').forEach(el=>el.checked=false);
 teamVisibleLimit=4;filterTeamDirectory();
});
document.getElementById('teamLoadMore')?.addEventListener('click',()=>{teamVisibleLimit+=4;filterTeamDirectory();});
document.querySelectorAll('[data-team-scroll]').forEach(el=>el.addEventListener('click',()=>document.getElementById(el.dataset.teamScroll)?.scrollIntoView({behavior:reducedMotion?'auto':'smooth',block:'start'})));
filterTeamDirectory();
