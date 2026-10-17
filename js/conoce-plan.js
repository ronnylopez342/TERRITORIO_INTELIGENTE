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
    dialog.querySelector('#cn-pet-dialog-document').href = 'assets/docs/plan-estadistico-territorial-2025-2029-consulta.pdf#page=' + topic.page;
  }
  root.addEventListener('click', event => {
    const trigger = event.target.closest('[data-cn-plan-topic]');
    if (trigger && root.contains(trigger)) {
      const topic = topics[trigger.dataset.cnPlanTopic];
      if (!topic) return;
      fill(topic);
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    }
    if (event.target.closest('[data-cn-plan-close]')) dialog.close();
  });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
})();
