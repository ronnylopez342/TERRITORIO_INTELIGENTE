'use strict';
(() => {
  const image = document.getElementById('chapterImage');
  const canvas = document.getElementById('canvas');
  const hits = document.getElementById('hotspots');
  const menu = document.getElementById('chapters');
  const toggle = document.getElementById('chapterToggle');
  const detail = document.getElementById('detail');
  const loading = document.getElementById('loading');
  let chapters = {}, originals = {}, current = '01', opener = null;
  const ids = Array.from({length:12},(_,i)=>String(i+1).padStart(2,'0'));

  function menuState(open, returnFocus = false) {
    menu.hidden = !open;
    menu.inert = !open;
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar capítulos' : 'Abrir capítulos');
    try { localStorage.setItem('ti-visor-chapters-open',String(open)); } catch (_) {}
    if (returnFocus) toggle.focus();
  }
  toggle.addEventListener('click',()=>menuState(menu.hidden));

  function requestedChapter() {
    try {
      const fragment = window.parent === window ? location.hash : parent.location.hash;
      const params = new URLSearchParams(fragment.includes('?') ? fragment.split('?')[1] : fragment.slice(1));
      const id = params.get('capitulo');
      return ids.includes(id) ? id : '01';
    } catch (_) { return '01'; }
  }
  function saveChapter(id) {
    try {
      if (parent !== window && parent.location.origin === location.origin) {
        const [route, query = ''] = parent.location.hash.slice(1).split('?');
        const params = new URLSearchParams(query);
        params.set('seccion','data-fuentes'); params.set('capitulo',id);
        parent.history.replaceState(parent.history.state,'',`#${route || 'data'}?${params}`);
      } else history.replaceState(null,'',`#capitulo=${id}`);
    } catch (_) {}
  }
  function openDetail(item, button) {
    opener = button;
    const chapter = chapters[current];
    document.getElementById('detailChapter').textContent = `${current} · ${chapter.name}`;
    document.getElementById('detailTitle').textContent = item.label;
    document.getElementById('detailText').textContent = item.description;
    document.getElementById('detailUnit').textContent = item.unit;
    document.getElementById('detailStatus').textContent = chapter.reference
      ? 'La imagen es una referencia. Sus cifras y periodos requieren validación con la base oficial.'
      : 'Sin base territorial validada para este indicador. No se asignan cifras de ejemplo.';
    const source = document.getElementById('detailSource');
    source.textContent = `Consultar ${chapter.source[0]} ↗`;
    source.href = chapter.source[1];
    detail.showModal();
  }
  document.getElementById('detailClose').addEventListener('click',()=>detail.close());
  detail.addEventListener('close',()=>{ if (opener && opener.isConnected) opener.focus(); });
  detail.addEventListener('click',event=>{ if (event.target === detail) {
    const r = detail.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) detail.close();
  }});
  document.addEventListener('keydown',event=>{
    if (event.key === 'Escape' && !detail.open && !menu.hidden) menuState(false,true);
  });
  function button(label, rect, action) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'hit'; b.setAttribute('aria-label',label); b.title = label;
    ['left','top','width','height'].forEach((key,i)=>b.style[key]=`${rect[i]}%`);
    b.addEventListener('click',()=>action(b)); hits.appendChild(b);
  }
  function render(id, save = true) {
    if (!chapters[id]) return;
    if (detail.open) detail.close();
    current = id;
    const chapter = chapters[id];
    canvas.setAttribute('aria-busy','true');
    image.onload = ()=>{canvas.setAttribute('aria-busy','false');loading.hidden=true;image.hidden=false;};
    image.onerror = ()=>{canvas.setAttribute('aria-busy','false');loading.hidden=false;loading.textContent='No se pudo cargar la visual. Recarga para volver a intentarlo.';};
    image.alt = `${id} · ${chapter.name}`;
    image.src = chapter.uri || originals[id].uri;
    document.getElementById('currentChapter').textContent = `${id} / 12 · ${chapter.name}`;
    document.querySelectorAll('.chapter').forEach(b=>{
      if (b.dataset.chapter === id) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current');
    });
    hits.replaceChildren();
    const rects = [[0,0,100,34],[2,54,68,22],[72,54,26,43],[2,77,47,21],[50,77,22,21],[73,81,24,16]];
    chapter.hotspots.forEach((item,i)=>button(item.label,id === '01' ? rects[i] : item.rect,b=>openDetail(item,b)));
    if (id === '01') {
      // Make the chapter strip and arrows drawn in the original image navigable.
      ids.forEach((destination,i)=>button(`Ir a ${chapters[destination].name}`,[3.4+i*7.9,40,7.7,13],()=>render(destination)));
      button('Capítulo anterior',[90.5,35,3.2,5],()=>step(-1));
      button('Capítulo siguiente',[94,35,3.3,5],()=>step(1));
      const mask=document.createElement('span');mask.className='image-menu-mask';mask.setAttribute('aria-hidden','true');mask.textContent='SUBACHOQUE';hits.appendChild(mask);
    }
    if (save) saveChapter(id);
  }
  function step(delta) {
    render(ids[(ids.indexOf(current)+delta+ids.length)%ids.length]);
  }
  document.getElementById('previous').addEventListener('click',()=>step(-1));
  document.getElementById('next').addEventListener('click',()=>step(1));
  const list = document.getElementById('chapterList');
  list.addEventListener('keydown',event=>{
    if (!['ArrowDown','ArrowUp','Home','End'].includes(event.key)) return;
    const buttons = Array.from(list.querySelectorAll('button'));
    const index = buttons.indexOf(document.activeElement);
    const next = event.key==='Home'?0:event.key==='End'?11:(index+(event.key==='ArrowDown'?1:-1)+12)%12;
    event.preventDefault(); buttons[next].focus();
  });
  async function init() {
    const fetchOk = async url => {const r=await fetch(url);if(!r.ok)throw new Error(`HTTP ${r.status}`);return r;};
    const [data, html] = await Promise.all([
      fetchOk('data-fuentes-capitulos.json').then(r=>r.json()),
      fetchOk('data-fuentes-visual.html').then(r=>r.text())
    ]);
    const match = html.match(/const chapters = (\{.*?\});\s*const names =/s);
    if (!match) throw new Error('Original visuals unavailable');
    originals=JSON.parse(match[1]); chapters=data;
    ids.forEach(id=>{
      const b=document.createElement('button');b.type='button';b.className='chapter';b.dataset.chapter=id;
      const number=document.createElement('b');number.textContent=id;
      const name=document.createElement('span');name.textContent=chapters[id].name;
      b.append(number,name);b.addEventListener('click',()=>{render(id);if(matchMedia('(max-width:900px)').matches)menuState(false,true);});list.appendChild(b);
    });
    let open=false;try{open=localStorage.getItem('ti-visor-chapters-open')==='true';}catch(_){}
    menuState(open);render(requestedChapter(),false);
    try { (parent === window ? window : parent).addEventListener('hashchange',()=>render(requestedChapter(),false)); } catch (_) {}
  }
  init().catch(error=>{canvas.setAttribute('aria-busy','false');loading.textContent='No se pudieron cargar los capítulos. Recarga para volver a intentarlo.';console.error(error);});
})();
