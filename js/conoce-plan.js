/* Ventanas informativas del Plan Estadistico Territorial: contenido fiel al documento facilitado. */
(() => {
  'use strict';
  const root = document.getElementById('cn-plan-territorial');
  if (!root) return;
  const dialog = root.querySelector('#cn-pet-dialog');
  if (!dialog) return;
  const topics = {
    proposito: {
      title: '¿De qué trata el Plan Estadístico Territorial?',
      page: 6, ref: 'Presentación e introducción · páginas 6–7',
      paragraphs: [
        'El Plan Estadístico Territorial de Subachoque 2025–2029 es un instrumento técnico de planificación que busca fortalecer la gestión y el aprovechamiento de la información estadística en el municipio.',
        'Se formuló para responder a la necesidad de contar con información confiable, oportuna y organizada que respalde el diseño, seguimiento y evaluación de planes, programas y políticas públicas.'
      ],
      points: ['Diagnosticar la oferta y la demanda de información.', 'Mejorar la producción, calidad, uso y difusión de datos.', 'Articularse con los lineamientos del DANE y el Sistema Estadístico Nacional.']
    },
    alcance: {
      title: 'Alcance del plan',
      page: 14, ref: 'Marco metodológico · página 14',
      paragraphs: [
        'El alcance del plan comprende la producción, gestión, análisis y difusión de información estadística confiable, pertinente y oportuna para la gestión pública municipal.',
        'Plantea un marco técnico y operativo con criterios unificados, articulación entre actores y fortalecimiento de las capacidades técnicas de las dependencias municipales.'
      ],
      points: ['Fortalecimiento de los procesos de diagnóstico, evaluación y seguimiento.', 'Organización y estandarización de los flujos de información.', 'Divulgación de indicadores estratégicos para instituciones y ciudadanía.']
    },
    marco: {
      title: 'Marco conceptual',
      page: 10, ref: 'Marco conceptual · páginas 10–12',
      paragraphs: [
        'La planificación estadística estratégica es un proceso técnico, continuo y articulado para organizar la actividad estadística y mejorar la producción, gestión y uso de datos.',
        'El documento se orienta por las herramientas y lineamientos del DANE, incluyendo los planes estadísticos territoriales y las líneas base de indicadores.'
      ],
      points: ['Ecosistema estadístico: interacción entre quienes producen y utilizan datos.', 'Planes estadísticos: diagnóstico de necesidades, fortalezas, debilidades y estrategias.', 'Línea base de indicadores: referencia para seguimiento y comparación.']
    },
    definiciones: {
      title: 'Definiciones clave del documento',
      page: 11, ref: 'Marco conceptual · página 11',
      paragraphs: [
        'El documento diferencia los conceptos fundamentales que permiten entender qué información se genera, cómo se obtiene y cómo se utiliza en el municipio.'
      ],
      points: ['Indicador: expresión observable y verificable para describir o medir un fenómeno.', 'Información estadística: resultados y documentación que describen características de un objeto de estudio.', 'Operación estadística: actividades de diseño, recolección, procesamiento, análisis, difusión y evaluación.', 'Registro administrativo: datos que las entidades recopilan y conservan durante sus funciones.', 'Línea base de indicadores: indicadores medidos sistemáticamente para comparar avances.']
    }
  };
  function fill(topic) {
    dialog.querySelector('#cn-pet-dialog-title').textContent = topic.title;
    const container = dialog.querySelector('#cn-pet-dialog-description');
    container.replaceChildren();
    for (const value of topic.paragraphs) {
      const p = document.createElement('p'); p.textContent = value; container.append(p);
    }
    if (topic.points.length) {
      const list = document.createElement('ul');
      for (const value of topic.points) {
        const item = document.createElement('li'); item.textContent = value; list.append(item);
      }
      container.append(list);
    }
    dialog.querySelector('#cn-pet-dialog-reference').textContent = topic.ref;
    dialog.querySelector('#cn-pet-dialog-document').dataset.cnPage = String(topic.page);
  }
// Ruta versionada por Git: la primera carga del original queda persistente
  // para todos los visitantes y para los futuros despliegues.
  const pdfPath = 'assets/docs/plan-estadistico-territorial-original.pdf';
  const pdfUrl = new URL(pdfPath, document.baseURI).href;
  const viewer = root.querySelector('#cn-pet-viewer');
  const frame = root.querySelector('#cn-pet-viewer-frame');
  const loading = root.querySelector('#cn-pet-viewer-loading');
  const empty = root.querySelector('#cn-pet-viewer-empty');
  const documentPane = root.querySelector('#cn-pet-viewer-document');
  const status = root.querySelector('#cn-pet-document-status');
  const downloadLinks = [
    root.querySelector('#cn-pet-download'),
    root.querySelector('#cn-pet-viewer-download')
  ];
  let pdfAvailable = false;
  let checkPromise = null;

  const showModal = element => {
    if (typeof element.showModal === 'function') {
      if (!element.open) element.showModal();
    } else {
      element.setAttribute('open', '');
    }
  };
  const closeModal = element => {
    if (typeof element.close === 'function' && element.open) element.close();
    else element.removeAttribute('open');
  };
  function updateAvailability(available) {
    pdfAvailable = available;
    status.textContent = available
      ? 'PDF original disponible · 45 páginas · Sin transcripción'
      : 'PDF original pendiente de incorporar';
    for (const link of downloadLinks) {
      if (!link) continue;
      link.classList.toggle('is-unavailable', !available);
      link.setAttribute('aria-disabled', String(!available));
      link.href = pdfUrl;
    }
  }
  // Comprobamos tanto el estado como el tipo de archivo: evita mostrar la
  // portada HTML de una SPA como si fuera un documento PDF.
  function checkOriginalPdf() {
    if (checkPromise) return checkPromise;
    checkPromise = fetch(pdfUrl, {
      method: 'HEAD',
      cache: 'no-store',
      credentials: 'same-origin'
    }).then(response => {
      const contentType = response.headers.get('content-type') || '';
      const isPDF = response.ok && /application\/pdf/i.test(contentType);
      updateAvailability(isPDF);
      return isPDF;
    }).catch(() => {
      updateAvailability(false);
      return false;
    }).finally(() => { checkPromise = null; });
    return checkPromise;
  }
  async function openViewer(page = 1) {
    const safePage = Math.max(1, Math.min(45, Number(page) || 1));
    closeModal(dialog);
    showModal(viewer);
    loading.hidden = false;
    empty.hidden = true;
    documentPane.hidden = true;
    const isReady = await checkOriginalPdf();
    if (!viewer.open) return;
    loading.hidden = true;
    if (!isReady) {
      frame.removeAttribute('src');
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    documentPane.hidden = false;
    frame.src = pdfUrl + '#page=' + safePage + '&view=FitH';
  }
  root.addEventListener('click', event => {
    const more = event.target.closest('[data-cn-plan-topic]');
    if (more && root.contains(more)) {
      const topic = topics[more.dataset.cnPlanTopic];
      if (!topic) return;
      fill(topic);
      showModal(dialog);
      return;
    }
    if (event.target.closest('[data-cn-plan-close]')) {
      closeModal(dialog);
      return;
    }
    if (event.target.closest('[data-cn-open-document]')) {
      event.preventDefault();
      void openViewer(1);
      return;
    }
    const reference = event.target.closest('#cn-pet-dialog-document');
    if (reference) {
      event.preventDefault();
      void openViewer(Number(reference.dataset.cnPage) || 1);
      return;
    }
    if (event.target.closest('[data-cn-viewer-close]')) {
      closeModal(viewer);
      return;
    }
    const download = event.target.closest('#cn-pet-download, #cn-pet-viewer-download');
    if (download && !pdfAvailable) {
      event.preventDefault();
      void openViewer(1);
    }
  });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) closeModal(dialog);
  });
  viewer.addEventListener('click', event => {
    if (event.target === viewer) closeModal(viewer);
  });
  viewer.addEventListener('close', () => {
    // Detener el lector integrado al cerrar sin reiniciar toda la app.
    frame.removeAttribute('src');
    documentPane.hidden = true;
  });
  updateAvailability(false);
  void checkOriginalPdf();
})();
