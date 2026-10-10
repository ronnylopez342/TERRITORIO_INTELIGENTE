# Data Territorio 2.2 — Plan Estadístico Municipal

Referencia: propuesta visual elegida del 9 de octubre de 2026 (Delivery Associates como lenguaje editorial).

## Incluido
- Portada 2.2 con cuatro accesos (documentos, indicadores, fichas, seguimiento), responsive y con teclado.
- Documento oficial: catálogo `data/plan-estadistico.json` con URL HTTPS verificada, autoría, actualización y descripción. Solo mostrar enlaces cuando exista evidencia oficial y el registro tenga `verified: true`, URL HTTPS, fuente, fecha y resumen.
- Documentos de trabajo: biblioteca local existente (IndexedDB) preservada y relocalizada desde 2.3 a 2.2. Los archivos del navegador no son públicos ni se sincronizan.
- Indicadores: captura manual, 10 sectores, fuente, variable, periodicidad, responsable, metodología, cálculo automático por fórmula, validación simple, alertas temporales, fichas y exportación CSV / vista de impresión PDF.
- Importación CSV, XLSX y XLS (XLSX usa la librería de lectura ya referenciada por el portal).
- Navegación por menú Data Territorio, botón volver e historial hash.
- Video: el recuadro funciona como espacio informativo. Al añadir una URL de video verificada en el manifiesto, permite reproducir MP4/WEBM o abrir enlace HTTPS.

## Diferencias entre prototipo local y servicio institucional
El registro de indicadores se almacena únicamente en localStorage, y los archivos de trabajo usan la capa local existente (IndexedDB). No existe aún sincronización, registro institucional de usuarios, validación de autoridad, aprobaciones de funcionarios ni infraestructura de cálculos centrales. Las alertas se basan en fecha + periodicidad de cada registro local. La descarga 'MIPG' es un reporte de trabajo, no una presentación oficial aprobada.

## Completar contenido aprobado
Agregar objetos a `documents` en `data/plan-estadistico.json`, con campos `title`, `type`, `description`, `source`, `updated`, `url`, `verified`. No añadir URLs no verificadas. `videoUrl` debe apuntar a un contenido explicativo oficial aprobado. Para trabajo institucional multiusuario requiere backend, autenticación y repositorio de archivos compartido.

## Alcance
Solo cambia el contenido/estilo de la pestaña 2.2, su enlace en la navegación y traslada el repositorio de documentos que estaba dentro de Memoria de la Alcaldía. No se sustituyen Home ni las pantallas restantes.

## Comprobación
- Abrir `#data?seccion=data-plan-estadistico` y navegar las cuatro tarjetas y el regreso.
- Registrar un indicador, editarlo, comprobar validación de fórmula, exportar ficha, buscar, importar plantilla CSV, revisar alertas y exportar MIPG/Imprimir.
- Probar PDF con archivo cargado, refrescar página y comprobar persistencia.
- Abrir `#data?seccion=data-fuentes` para comprobar que el visor 2.2 anterior permanece disponible como visor de fuentes externas (ahora sección 2.3).
