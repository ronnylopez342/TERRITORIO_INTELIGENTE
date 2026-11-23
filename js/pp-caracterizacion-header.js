/* Cabecera exclusiva de Caracterización Municipal en Práctica País.
 * Las siete fotografías originales son inmutables. Se sirven con URLs estables,
 * sin HEAD ni preflight redundantes. El encuadre solo se guarda una vez y se
 * registra independientemente de los bytes de imagen en Supabase.
 */
(() => {
  'use strict';
  if (!document.documentElement.classList.contains('ti-practica-embed')) return;

  const HOST = 'https://subachoque-platform.vercel.app';
  const IMAGE_BASE = 'https://nlhbedssakkafrvvbqyt.supabase.co/storage/v1/object/public/practica-pais-cabecera/caracterizacion/foto-';
  const COUNT = 7;
  const slots = Array.from({ length: COUNT }, () => ({
    loaded: false, failed: false, busy: false, exists: false, error: '',
  }));
  const savedFramings = new Map();
  const uploadTimeouts = new Map();
  let mounted = false;
  let canUpload = false;
  let framingsLoaded = false;
  let modalSlot = null;
  let modalSaving = false;

  function imageUrl(slot) {
    return IMAGE_BASE + String(slot).padStart(2, '0');
  }
  function slotNode(slot) {
    return document.getElementById('pp-char-photo-' + slot);
  }
  function post(type, payload, transfers) {
    if (window.parent !== window) window.parent.postMessage(
      Object.assign({ type }, payload || {}), HOST, transfers || [],
    );
  }
  function announce(message) {
    const node = document.getElementById('pp-char-photo-message');
    if (node) node.textContent = message || '';
  }
  function setPosition(slot, x, y) {
    const tile = slotNode(slot);
    if (tile) {
      tile.style.setProperty('--pp-object-x', Number(x) + '%');
      tile.style.setProperty('--pp-object-y', Number(y) + '%');
    }
  }
  function renderSlot(slot) {
    const tile = slotNode(slot);
    if (!tile) return;
    const state = slots[slot-1];
    const add = tile.querySelector('.pp-char-photo-add');
    const adjust = tile.querySelector('.pp-char-photo-adjust');
    const feedback = tile.querySelector('.pp-char-photo-feedback');
    const input = tile.querySelector('input[type=file]');

    tile.classList.toggle('pp-char-photo--ready', state.loaded);
    tile.classList.toggle('pp-char-photo--empty', state.failed && !state.exists);
    tile.classList.toggle('pp-char-photo--loading', !state.loaded && !state.failed);
    if (add) add.hidden = !canUpload || !state.failed || state.busy || state.exists;
    if (input) input.disabled = !canUpload || state.busy || state.exists || !state.failed;
    if (adjust) {
      adjust.hidden = !(canUpload && state.loaded && framingsLoaded
        && !savedFramings.has(slot) && !state.busy);
    }
    if (feedback) {
      const message = state.error || (state.busy ? 'Publicando fotografía…' : '');
      feedback.textContent = message;
      feedback.hidden = !message;
      feedback.dataset.state = state.error ? 'error' : 'progress';
    }
  }

  function imageLoaded(slot) {
    const state = slots[slot-1];
    state.loaded = true;
    state.failed = false;
    state.busy = false;
    state.exists = true;
    state.error = '';
    renderSlot(slot);
  }
  function imageFailed(slot) {
    const state = slots[slot-1];
    state.loaded = false;
    state.failed = true;
    state.busy = false;
    // Antes de una carga nueva, un 404 significa que el espacio está libre.
    // Después de que la API confirme la carga, no ofrecer sustitución.
    if (state.exists) state.error = 'La imagen está guardada, pero no pudo mostrarse. Actualiza la página.';
    renderSlot(slot);
  }
  function createSlot(slot) {
    const number = String(slot).padStart(2, '0');
    const tile = document.createElement('div');
    tile.id = 'pp-char-photo-' + slot;
    tile.className = 'pp-char-photo pp-char-photo--loading';
    tile.setAttribute('aria-label', 'Fotografía original ' + number + ' del trabajo de campo');
    tile.innerHTML =
      '<img alt="Fotografía original del trabajo de caracterización, espacio ' + number + '" loading="eager" decoding="async">' +
      '<label class="pp-char-photo-add" hidden><span class="pp-char-photo-plus" aria-hidden="true">+</span><span>Agregar foto</span>' +
      '<input type="file" accept="image/jpeg,image/png,image/webp" aria-label="Publicar fotografía ' + number + ' por única vez"></label>' +
      '<button class="pp-char-photo-adjust" type="button" hidden aria-label="Ajustar una sola vez el encuadre de la foto ' + number + '">Ajustar encuadre</button>' +
      '<span class="pp-char-photo-feedback" role="status" aria-live="polite" hidden></span>';
    const img = tile.querySelector('img');
    img.addEventListener('load', () => imageLoaded(slot));
    img.addEventListener('error', () => imageFailed(slot));
    img.setAttribute('fetchpriority', slot <= 3 ? 'high' : 'auto');
    tile.querySelector('input').addEventListener('change', function () {
      const file = this.files && this.files[0];
      this.value = '';
      if (file) void uploadPhoto(slot, file);
    });
    tile.querySelector('.pp-char-photo-adjust').addEventListener('click', () => openFraming(slot));
    // Sin query única por recarga: la caché compartida conserva el PNG original.
    img.src = imageUrl(slot);
    return tile;
  }

  async function uploadPhoto(slot, file) {
    const state = slots[slot-1];
    if (!canUpload || state.busy || state.exists) return;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)
      || file.size < 100 || file.size > 8 * 1024 * 1024) {
      state.error = 'Solo se admiten JPG, PNG o WebP de hasta 8 MB.';
      renderSlot(slot);
      return;
    }
    state.error = '';
    state.busy = true;
    renderSlot(slot);
    try {
      const bytes = await file.arrayBuffer();
      uploadTimeouts.set(slot, setTimeout(() => {
        state.busy = false;
        state.error = 'Sin confirmación del servidor. Recarga para comprobar el archivo antes de reintentar.';
        uploadTimeouts.delete(slot);
        renderSlot(slot);
      }, 30000));
      post('PP_HEADER_UPLOAD', { slot, mime:file.type, bytes }, [bytes]);
    } catch {
      clearTimeout(uploadTimeouts.get(slot));
      uploadTimeouts.delete(slot);
      state.busy = false;
      state.error = 'No se pudo leer o enviar la fotografía.';
      renderSlot(slot);
    }
  }

  function createFramingDialog() {
    if (document.getElementById('pp-char-frame-dialog')) return;
    const dialog = document.createElement('dialog');
    dialog.id = 'pp-char-frame-dialog';
    dialog.className = 'pp-char-frame-dialog';
    dialog.setAttribute('aria-labelledby', 'pp-char-frame-title');
    dialog.innerHTML =
      '<div class="pp-char-frame-panel">' +
      '<p class="pp-char-frame-kicker">CARACTERIZACIÓN MUNICIPAL</p>' +
      '<h2 id="pp-char-frame-title">Ajustar fotografía</h2>' +
      '<p class="pp-char-frame-description">Mueve la fotografía hasta que las personas se vean completas. Solo se cambia el encuadre, no la imagen original. Puedes guardarlo una sola vez.</p>' +
      '<div class="pp-char-frame-viewport" aria-label="Vista previa del encuadre. También puedes arrastrar la fotografía">' +
      '<img alt="Vista previa de la fotografía original"></div>' +
      '<div class="pp-char-frame-controls">' +
      '<label>Horizontal <input data-axis="x" type="range" min="0" max="100" step="1" value="50"></label>' +
      '<label>Vertical <input data-axis="y" type="range" min="0" max="100" step="1" value="50"></label>' +
      '</div>' +
      '<p class="pp-char-frame-status" role="status" aria-live="polite"></p>' +
      '<div class="pp-char-frame-actions">' +
      '<button type="button" data-action="cancel">Cancelar</button>' +
      '<button type="button" data-action="save">Guardar encuadre definitivo</button>' +
      '</div>' +
      '</div>';
    document.body.appendChild(dialog);
    const xSlider = dialog.querySelector('input[data-axis=x]');
    const ySlider = dialog.querySelector('input[data-axis=y]');
    const preview = dialog.querySelector('.pp-char-frame-viewport');
    const img = preview.querySelector('img');
    function paint() {
      img.style.objectPosition = xSlider.value + '% ' + ySlider.value + '%';
    }
    xSlider.addEventListener('input', paint);
    ySlider.addEventListener('input', paint);
    let dragStart = null;
    preview.addEventListener('pointerdown', event => {
      if (modalSaving || modalSlot === null) return;
      dragStart = {
        id: event.pointerId, x: event.clientX, y: event.clientY,
        ox: Number(xSlider.value), oy: Number(ySlider.value),
      };
      preview.setPointerCapture(event.pointerId);
      preview.classList.add('dragging');
    });
    preview.addEventListener('pointermove', event => {
      if (!dragStart || event.pointerId !== dragStart.id) return;
      const rect = preview.getBoundingClientRect();
      const nx = dragStart.ox - (event.clientX - dragStart.x) / Math.max(1,rect.width) * 110;
      const ny = dragStart.oy - (event.clientY - dragStart.y) / Math.max(1,rect.height) * 110;
      xSlider.value = String(Math.max(0,Math.min(100,Math.round(nx))));
      ySlider.value = String(Math.max(0,Math.min(100,Math.round(ny))));
      paint();
    });
    const stopDrag = () => {
      dragStart = null;
      preview.classList.remove('dragging');
    };
    preview.addEventListener('pointerup', stopDrag);
    preview.addEventListener('pointercancel', stopDrag);
    dialog.querySelector('[data-action=cancel]').addEventListener('click', () => {
      if (modalSaving) return;
      dialog.close();
    });
    dialog.querySelector('[data-action=save]').addEventListener('click', () => {
      if (modalSaving || modalSlot === null || savedFramings.has(modalSlot) || !canUpload) return;
      modalSaving = true;
      dialog.querySelector('[data-action=save]').disabled = true;
      dialog.querySelector('[data-action=cancel]').disabled = true;
      dialog.querySelector('.pp-char-frame-status').textContent = 'Guardando encuadre…';
      post('PP_HEADER_SAVE_FRAMING', {
        slot: modalSlot, x: Number(xSlider.value), y: Number(ySlider.value),
      });
    });
    dialog.addEventListener('close', () => {
      if (modalSaving) return;
      modalSlot = null;
      dialog.querySelector('.pp-char-frame-status').textContent = '';
    });
    dialog._paintPreview = paint;
  }

  function openFraming(slot) {
    if (!canUpload || !framingsLoaded || savedFramings.has(slot) || !slots[slot-1].loaded) return;
    createFramingDialog();
    const tile = slotNode(slot);
    const dialog = document.getElementById('pp-char-frame-dialog');
    modalSlot = slot;
    modalSaving = false;
    dialog.querySelector('#pp-char-frame-title').textContent = 'Ajustar fotografía ' + String(slot).padStart(2,'0');
    const preview = dialog.querySelector('.pp-char-frame-viewport');
    const crop = getComputedStyle(tile).getPropertyValue('--clip').trim();
    preview.style.clipPath = crop ? 'polygon(' + crop + ')' : 'none';
    dialog.querySelector('.pp-char-frame-viewport img').src = tile.querySelector('img').currentSrc || imageUrl(slot);
    dialog.querySelector('input[data-axis=x]').value = '50';
    dialog.querySelector('input[data-axis=y]').value = '50';
    dialog.querySelector('[data-action=save]').disabled = false;
    dialog.querySelector('[data-action=cancel]').disabled = false;
    dialog.querySelector('.pp-char-frame-status').textContent = '';
    dialog._paintPreview();
    dialog.showModal();
  }

  function handleFramings(rows) {
    if (!Array.isArray(rows)) return;
    savedFramings.clear();
    for (const row of rows) {
      const slot = Number(row.slot), x = Number(row.x_percent), y = Number(row.y_percent);
      if (!Number.isInteger(slot) || slot < 1 || slot > COUNT
        || !Number.isInteger(x) || x < 0 || x > 100
        || !Number.isInteger(y) || y < 0 || y > 100) continue;
      savedFramings.set(slot, { x, y });
      setPosition(slot, x, y);
    }
    framingsLoaded = true;
    for (let slot=1; slot<=COUNT; slot++) renderSlot(slot);
  }

  function onFramingSaved(data) {
    const slot = Number(data.slot);
    if (!Number.isInteger(slot) || slot < 1 || slot > COUNT || modalSlot !== slot) return;
    const dialog = document.getElementById('pp-char-frame-dialog');
    modalSaving = false;
    if (data.ok === true) {
      const x = Number(data.x), y = Number(data.y);
      if (Number.isInteger(x) && Number.isInteger(y)) {
        savedFramings.set(slot, {x, y});
        setPosition(slot, x, y);
      }
      dialog.close();
      modalSlot = null;
      announce('El encuadre de la fotografía ' + slot + ' quedó guardado permanentemente.');
      renderSlot(slot);
    } else {
      dialog.querySelector('[data-action=save]').disabled = false;
      dialog.querySelector('[data-action=cancel]').disabled = false;
      dialog.querySelector('.pp-char-frame-status').textContent =
        String(data.error || 'No se pudo guardar el encuadre.');
    }
  }

  function notifyHeight() {
    post('TI_DATA_EMBED_HEIGHT', {
      height: Math.max(540, Math.ceil(
        (document.querySelector('[data-panel-group="data"]:not([hidden])')?.getBoundingClientRect().bottom || 540)
          + window.scrollY + 12
      ))
    });
  }
  /* La plantilla antigua reserva ~80px bajo las pestañas para un header
   * que se ha eliminado. El CSS de la página fuente contiene reglas tardías
   * para .view-shell: esta reparación actúa sobre el DOM real, sin alterar
   * el tamaño ni los píxeles de las siete fotografías.
   */
  let flushQueued = false;
  function queueFlush() {
    if (flushQueued) return;
    flushQueued = true;
    requestAnimationFrame(() => {
      flushQueued = false;
      flushHeaderAgainstTabs();
      requestAnimationFrame(() => {
        flushHeaderAgainstTabs();
        notifyHeight();
      });
    });
  }

  function flushHeaderAgainstTabs() {
    const nav = document.getElementById('tiEmbedTabs');
    const main = document.getElementById('mainContent');
    const view = main?.querySelector('.app-view.view-shell[data-view="data"]');
    const shell = view?.querySelector('.view-body');
    const inner = shell?.querySelector('.inner');
    const section = document.getElementById('data-conoce');
    const hero = document.getElementById('pp-char-header');
    if (!nav || !main || !view || !section || !hero) return;

    const charTab = nav.querySelector('button[data-embed-destination="data-conoce"]');
    const active = charTab?.getAttribute('aria-selected') === 'true' && !section.hidden;
    // El desplazamiento compensatorio afecta ÚNICAMENTE a Caracterización.
    if (!active) {
      main.style.removeProperty('margin-top');
      return;
    }

    // Quitar la reserva del encabezado global, aunque se restablezca por
    // cascada dinámica del CSS del portal o de la piel de la plataforma.
    for (const element of [main, view, shell, inner, section]) {
      if (!element) continue;
      element.style.setProperty('padding-top', '0px', 'important');
    }
    for (const element of [view, shell, inner, section]) {
      if (!element) continue;
      element.style.setProperty('margin-top', '0px', 'important');
    }

    // Eliminar primero la compensación previa para medir el espacio real;
    // así no se acumulan márgenes negativos en recargas o al cambiar pestaña.
    main.style.removeProperty('margin-top');
    const navBottom = nav.getBoundingClientRect().bottom;
    const heroTop = hero.getBoundingClientRect().top;
    const gap = Math.round(heroTop - navBottom);
    if (gap > 2 && gap < 241 && navBottom >= 0 && navBottom < 240
      && heroTop > navBottom && heroTop < 500) {
      main.style.setProperty('margin-top', '-' + gap + 'px', 'important');
    }
    document.documentElement.dataset.ppCharGap = String(Math.max(0,
      Math.round(hero.getBoundingClientRect().top - nav.getBoundingClientRect().bottom)));
  }

  function mount() {
    if (mounted) return;
    const section = document.getElementById('data-conoce');
    if (!section || section.dataset.ppRevistaMounted !== '1') return;
    mounted = true;
    const hero = document.createElement('header');
    hero.id = 'pp-char-header';
    hero.className = 'pp-char-header';
    hero.innerHTML =
      '<div class="pp-char-copy">' +
      '<p class="pp-char-eyebrow">SUBACHOQUE PLATFORM</p>' +
      '<h1>Caracterización<br>Municipal</h1>' +
      '<span class="pp-char-rule" aria-hidden="true"></span>' +
      '<p class="pp-char-lead">Levantamiento y análisis de información<br class="pp-char-break">del municipio a través de <strong>encuestas<br class="pp-char-break">técnicas y no técnicas</strong>, con el propósito<br class="pp-char-break">de conocer las condiciones, necesidades<br class="pp-char-break">y realidades de su población.</p>' +
      '<p class="pp-char-photo-status" id="pp-char-photo-message" role="status" aria-live="polite"></p>' +
      '</div><div class="pp-char-photos" id="pp-char-photos" aria-label="Siete fotografías del trabajo de campo"></div>';
    const grid = hero.querySelector('#pp-char-photos');
    for (let slot=1; slot<=COUNT; slot++) grid.appendChild(createSlot(slot));
    section.insertBefore(hero, section.firstChild);
    post('PP_HEADER_REQUEST_AUTH');
    post('PP_HEADER_REQUEST_FRAMINGS');
    // La pestaña y el hero deben quedar contiguos: cero franja crema.
    const nav = document.getElementById('tiEmbedTabs');
    if (nav) {
      nav.addEventListener('click', () => queueFlush());
      new MutationObserver(queueFlush).observe(nav, {
        subtree: true, attributes: true, attributeFilter: ['aria-selected'],
      });
    }
    queueFlush();
  }
  window.addEventListener('message', event => {
    if (event.origin !== HOST || event.source !== window.parent || !event.data) return;
    const data=event.data;
    if (data.type === 'PP_HEADER_AUTH') {
      canUpload = data.canUpload === true;
      for (let slot=1;slot<=COUNT;slot++) renderSlot(slot);
    }
    if (data.type === 'PP_HEADER_FRAMINGS') {
      if (data.ok === true) handleFramings(data.rows);
      else {
        framingsLoaded = false;
        announce(String(data.error || 'Sin acceso al estado de los encuadres.'));
      }
    }
    if (data.type === 'PP_HEADER_FRAMING_SAVED') onFramingSaved(data);
    if (data.type === 'PP_HEADER_UPLOAD_RESULT') {
      const slot=Number(data.slot);
      if (!Number.isInteger(slot) || slot<1 || slot>COUNT) return;
      const state=slots[slot-1];
      clearTimeout(uploadTimeouts.get(slot));
      uploadTimeouts.delete(slot);
      state.busy = false;
      if (data.ok === true) {
        state.exists = true;
        state.failed = false;
        state.error = '';
        // Solo la imagen recién publicada necesita un único cache-buster.
        const img=slotNode(slot)?.querySelector('img');
        if (img) img.src = imageUrl(slot) + '?first=' + Date.now();
        announce('Fotografía ' + slot + ' recibida; comprobando visualización.');
      } else {
        state.error = String(data.error || 'No se pudo publicar la fotografía.');
        if (/ya tiene una foto|no se puede sustituir/i.test(state.error)) {
          state.exists=true;
          const img=slotNode(slot)?.querySelector('img');
          if (img) img.src = imageUrl(slot) + '?reload=' + Date.now();
        }
        renderSlot(slot);
        announce(state.error);
      }
    }
  });
  const observer = new MutationObserver(() => { if (!mounted) mount(); else observer.disconnect(); });
  observer.observe(document.documentElement, {childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded', mount, {once:true});
  window.addEventListener('load', mount, {once:true});
  mount();
})();
