/* Cabecera de Caracterización Municipal en Práctica País.
 * Siete imágenes ORIGINALES, publicadas una única vez por espacio.
 * La autenticación permanece en la plataforma madre; no se envían credenciales al iframe.
 */
(() => {
  'use strict';
  const ORIGIN = 'https://subachoque-platform.vercel.app';
  const PUBLIC_BASE = 'https://nlhbedssakkafrvvbqyt.supabase.co/storage/v1/object/public/practica-pais-cabecera/caracterizacion/foto-';
  const SLOT_COUNT = 7;
  if (!document.documentElement.classList.contains('ti-practica-embed')) return;
  let canUpload = false;
  let mounted = false;
  const status = Array(SLOT_COUNT).fill(false);
  const busy = new Set();
  function pictureUrl(slot) { return PUBLIC_BASE + String(slot).padStart(2, '0'); }
  function slotEl(slot) { return document.getElementById('pp-char-photo-' + slot); }
  function updateSlot(slot) {
    const cell = slotEl(slot);
    if (!cell) return;
    const exists = status[slot - 1];
    cell.classList.toggle('pp-char-photo--ready', exists);
    cell.classList.toggle('pp-char-photo--empty', !exists);
    const input = cell.querySelector('input[type=file]');
    const add = cell.querySelector('.pp-char-photo-add');
    const img = cell.querySelector('img');
    const num = cell.querySelector('.pp-char-photo-num');
    if (input) input.disabled = !canUpload || exists || busy.has(slot);
    if (add) add.hidden = !canUpload || exists || busy.has(slot);
    if (img) { img.hidden = !exists; if(exists && img.getAttribute('src') !== pictureUrl(slot)) img.src = pictureUrl(slot); }
    if(num) num.hidden = exists;
    cell.setAttribute('aria-label', exists ? 'Fotografía original ' + slot + ' publicada' : 'Espacio de fotografía ' + slot + (canUpload ? '. Agregar foto' : '. Pendiente'));
  }
  function notifyHeight() {
    if (window.parent !== window) window.parent.postMessage({type: 'TI_DATA_EMBED_HEIGHT', height: Math.max(540, Math.ceil((document.querySelector('[data-panel-group="data"]:not([hidden])')?.getBoundingClientRect().bottom || 540) + window.scrollY + 12))}, ORIGIN);
  }
  async function refresh(slot) {
    try {
      const res = await fetch(pictureUrl(slot), {method:'HEAD', cache:'no-store'});
      status[slot-1] = res.ok && (res.headers.get('content-type') || '').startsWith('image/');
    } catch (_) { /* No asumir que falta una imagen si falla la conexión */ }
    updateSlot(slot);
  }
  function announce(text) { const el=document.getElementById('pp-char-photo-message'); if(el) el.textContent=text; }
  async function submitPhoto(slot, file) {
    if (!file || busy.has(slot) || status[slot-1] || !canUpload) return;
    const allowed=['image/jpeg','image/png','image/webp'];
    if (!allowed.includes(file.type) || file.size < 100 || file.size > 8*1024*1024) {
      announce('Selecciona una imagen JPG, PNG o WebP de hasta 8 MB.');
      return;
    }
    busy.add(slot); updateSlot(slot);
    announce('Publicando fotografía ' + slot + '…');
    try {
      const bytes=await file.arrayBuffer();
      window.parent.postMessage({type:'PP_HEADER_UPLOAD',slot,mime:file.type,bytes},ORIGIN,[bytes]);
    } catch (_) {
      busy.delete(slot);updateSlot(slot);
      announce('No fue posible leer la fotografía seleccionada.');
    }
  }
  function createSlot(slot) {
    const label = String(slot).padStart(2,'0');
    const cell = document.createElement('div');
    cell.id='pp-char-photo-' + slot;
    cell.className='pp-char-photo pp-char-photo--empty';
    cell.innerHTML='<img alt="Fotografía original del trabajo de caracterización, espacio '+label+'" hidden>'+
      '<span class="pp-char-photo-num" aria-hidden="true">'+label+'</span>'+
      '<label class="pp-char-photo-add" hidden><span class="pp-char-photo-plus" aria-hidden="true">+</span><span>Agregar foto</span>'+
      '<input type="file" accept="image/jpeg,image/png,image/webp" aria-label="Publicar fotografía '+label+' (una sola vez)"></label>';
    cell.querySelector('input').addEventListener('change',function() {
      const file=this.files && this.files[0];
      this.value='';
      if(file)void submitPhoto(slot,file);
    });
    return cell;
  }
  function mount() {
    if(mounted) return;
    const section=document.getElementById('data-conoce');
    if(!section || section.dataset.ppRevistaMounted !== '1')return;
    mounted=true;
    const hero=document.createElement('header');
    hero.id='pp-char-header';
    hero.className='pp-char-header';
    hero.innerHTML='<div class="pp-char-copy"><p class="pp-char-eyebrow">SUBACHOQUE · PRÁCTICA PAÍS</p>'+
      '<h1>Caracterización<br>Municipal</h1>'+
      '<span class="pp-char-rule" aria-hidden="true"></span>'+
      '<p class="pp-char-lead">Un recorrido por el trabajo de campo y el encuentro con las comunidades de Subachoque.</p>'+
      '<p class="pp-char-photo-status" id="pp-char-photo-message" role="status" aria-live="polite">Fotografías originales del proceso de caracterización.</p></div>'+
      '<div class="pp-char-photos" id="pp-char-photos" aria-label="Siete fotografías del trabajo de campo"></div>';
    const grid=hero.querySelector('#pp-char-photos');
    for(let i=1;i<=SLOT_COUNT;i++)grid.appendChild(createSlot(i));
    section.insertBefore(hero,section.firstChild);
    // El panel de revista ya existente permanece intacto bajo esta cabecera.
    for(let i=1;i<=SLOT_COUNT;i++)void refresh(i);
    window.parent.postMessage({type:'PP_HEADER_REQUEST_AUTH'},ORIGIN);
    requestAnimationFrame(notifyHeight);
  }
  window.addEventListener('message',event=>{
    if(event.origin!==ORIGIN || event.source!==window.parent || !event.data)return;
    if(event.data.type==='PP_HEADER_AUTH') {
      canUpload=event.data.canUpload===true;
      for(let i=1;i<=SLOT_COUNT;i++)updateSlot(i);
    }
    if(event.data.type==='PP_HEADER_UPLOAD_RESULT') {
      const slot=Number(event.data.slot);
      if(!Number.isInteger(slot)||slot<1||slot>SLOT_COUNT)return;
      busy.delete(slot);
      if(event.data.ok) {
        status[slot-1]=true;
        announce('Fotografía '+slot+' publicada. Este espacio quedó bloqueado permanentemente.');
        updateSlot(slot);
        requestAnimationFrame(notifyHeight);
      } else {
        announce(String(event.data.error||'No se pudo publicar la fotografía.'));
        void refresh(slot);
      }
    }
  });
  // La revista se monta desde index.html en DOMContentLoaded o load.
  const observer=new MutationObserver(()=>{if(!mounted)mount();else observer.disconnect();});
  observer.observe(document.documentElement,{childList:true,subtree:true});
  mount();
  window.addEventListener('load',()=>{mount();requestAnimationFrame(notifyHeight);});
})();
