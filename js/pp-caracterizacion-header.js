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
  const verifiedUrls = Array(SLOT_COUNT).fill('');
  const busy = new Set();
  const errors = Array(SLOT_COUNT).fill('');
  const timeouts = new Map();
  function slotMessage(slot, message) {
    errors[slot-1] = String(message || '');
    updateSlot(slot);
  }
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
    const feedback = cell.querySelector('.pp-char-photo-feedback');
    if (feedback) {
      const message = errors[slot - 1] || (busy.has(slot) ? 'Publicando fotografía…' : '');
      feedback.textContent = message;
      feedback.hidden = !message;
      feedback.dataset.state = errors[slot - 1] ? 'error' : 'progress';
    }
    if (input) input.disabled = !canUpload || exists || busy.has(slot);
    if (add) add.hidden = !canUpload || exists || busy.has(slot);
    if (img) {
      const verifiedUrl = verifiedUrls[slot - 1];
      // Nunca reutilizar la URL que pudo quedar cacheada como 404 antes de la carga.
      if (exists && verifiedUrl && img.getAttribute('src') !== verifiedUrl) img.src = verifiedUrl;
      img.hidden = !exists || !verifiedUrl;
    }
    if(num) num.hidden = exists || busy.has(slot);
    cell.setAttribute('aria-label', exists ? 'Fotografía original ' + slot + ' publicada' : 'Espacio de fotografía ' + slot + (canUpload ? '. Agregar foto' : '. Pendiente'));
  }
  function notifyHeight() {
    if (window.parent !== window) window.parent.postMessage({type: 'TI_DATA_EMBED_HEIGHT', height: Math.max(540, Math.ceil((document.querySelector('[data-panel-group="data"]:not([hidden])')?.getBoundingClientRect().bottom || 540) + window.scrollY + 12))}, ORIGIN);
  }
  function preflightImage(url) {
    // Una respuesta HTTP 200 no basta: comprobar que el navegador pueda mostrar la imagen.
    return new Promise(resolve => {
      const probe = new Image();
      probe.onload = () => resolve(probe.naturalWidth > 0 && probe.naturalHeight > 0);
      probe.onerror = () => resolve(false);
      probe.src = url;
    });
  }
  async function refresh(slot) {
    try {
      const checkUrl = pictureUrl(slot) + '?check=' + Date.now();
      const res = await fetch(checkUrl, {method:'HEAD', cache:'no-store'});
      if (!res.ok) {
        if (res.status === 400 || res.status === 404) {
          // Un espacio sin imagen permanece editable hasta publicarse correctamente.
          status[slot-1] = false;
          verifiedUrls[slot-1] = '';
          errors[slot-1] = '';
        } else {
          errors[slot-1] = 'No se pudo comprobar el almacenamiento (' + res.status + ').';
        }
        updateSlot(slot);
        return false;
      }
      // Ya existe un archivo remoto: nunca habilitar reemplazo, incluso si falla su descarga.
      status[slot-1] = true;
      for (let attempt = 0; attempt < 3; attempt++) {
        const url = pictureUrl(slot) + '?image=' + Date.now() + '-' + attempt;
        if (await preflightImage(url)) {
          verifiedUrls[slot-1] = url;
          errors[slot-1] = '';
          updateSlot(slot);
          return true;
        }
      }
      verifiedUrls[slot-1] = '';
      errors[slot-1] = 'Imagen almacenada, pero no se pudo mostrar. Vuelve a cargar la página.';
      updateSlot(slot);
      return false;
    } catch (_) {
      slotMessage(slot, 'No se pudo verificar el servidor. Revisa tu conexión.');
      return false;
    }
  }
  async function verifyPublished(slot) {
    for (let attempt = 0; attempt < 3; attempt++) {
      if (await refresh(slot)) return true;
      await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
    }
    return false;
  }
  function announce(text) { const el=document.getElementById('pp-char-photo-message'); if(el) el.textContent=text; }
  async function submitPhoto(slot, file) {
    if (!file || busy.has(slot) || status[slot-1] || !canUpload) return;
    const allowed=['image/jpeg','image/png','image/webp'];
    if (!allowed.includes(file.type) || file.size < 100 || file.size > 8*1024*1024) {
      slotMessage(slot, 'Solo JPG, PNG o WebP de hasta 8 MB.');
      return;
    }
    // Evitar confiar en la selección hasta que Supabase confirme la publicación.
    errors[slot-1] = '';
    busy.add(slot); updateSlot(slot);
    announce('Publicando fotografía ' + slot + '…');
    try {
      const bytes=await file.arrayBuffer();
      // Si el iframe/host pierde la respuesta, no dejar el espacio bloqueado.
      timeouts.set(slot, setTimeout(() => {
        if (!busy.has(slot)) return;
        busy.delete(slot); timeouts.delete(slot);
        slotMessage(slot, 'Sin confirmación del servidor. Recarga para verificar antes de reintentar.');
      }, 30000));
      window.parent.postMessage({type:'PP_HEADER_UPLOAD',slot,mime:file.type,bytes},ORIGIN,[bytes]);
    } catch (_) {
      if (timeouts.has(slot)) clearTimeout(timeouts.get(slot));
      timeouts.delete(slot);busy.delete(slot);
      slotMessage(slot, 'No se pudo enviar la fotografía. Inténtalo nuevamente.');
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
      '<input type="file" accept="image/jpeg,image/png,image/webp" aria-label="Publicar fotografía '+label+' (una sola vez)"></label>'+
      '<span class="pp-char-photo-feedback" role="status" aria-live="polite" hidden></span>';
    cell.querySelector('img').addEventListener('error', () => {
      if (status[slot-1]) {
        verifiedUrls[slot-1] = '';
        slotMessage(slot, 'La imagen está almacenada, pero falló su visualización. Recarga la página.');
      }
    });
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
    hero.innerHTML='<div class="pp-char-copy"><p class="pp-char-eyebrow">SUBACHOQUE PLATFORM</p>'+
      '<h1>Caracterización<br>Municipal</h1>'+
      '<span class="pp-char-rule" aria-hidden="true"></span>'+
      '<p class="pp-char-lead">Levantamiento y análisis de información<br class="pp-char-break">del municipio a través de <strong>encuestas<br class="pp-char-break">técnicas y no técnicas</strong>, con el propósito<br class="pp-char-break">de conocer las condiciones, necesidades<br class="pp-char-break">y realidades de su población.</p>'+
      '<p class="pp-char-photo-status" id="pp-char-photo-message" role="status" aria-live="polite"></p></div>'+
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
      if (timeouts.has(slot)) clearTimeout(timeouts.get(slot));
      timeouts.delete(slot);
      busy.delete(slot);
      if(event.data.ok) {
        // Solo se confirma al constatar que la URL pública ya existe.
        void verifyPublished(slot).then(exists => {
          if (exists) {
            announce('Fotografía '+slot+' guardada y verificada.');
          } else {
            slotMessage(slot, 'El servidor aceptó la carga, pero aún no se puede verificar. Recarga antes de intentar de nuevo.');
          }
          requestAnimationFrame(notifyHeight);
        });
      } else {
        const message=String(event.data.error||'No se pudo publicar la fotografía.');
        slotMessage(slot,message);
        announce(message);
        // Si otro dispositivo la publicó primero, se recupera la foto existente.
        if(/ya tiene una foto|no se puede sustituir/i.test(message)) void refresh(slot);
      }
    }
  });
  // La revista se monta desde index.html en DOMContentLoaded o load.
  const observer=new MutationObserver(()=>{if(!mounted)mount();else observer.disconnect();});
  observer.observe(document.documentElement,{childList:true,subtree:true});
  mount();
  window.addEventListener('load',()=>{mount();requestAnimationFrame(notifyHeight);});
})();
