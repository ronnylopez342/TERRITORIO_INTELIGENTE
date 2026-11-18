# Dimensiones y Atlas — cierre de integración visual y metodológica

## Alcance y referencias

Diseño aprobado por el usuario: cuatro tarjetas de dimensión y sus filtros existentes;
columna estadística blanca aproximadamente 63 % del ancho, dos tarjetas laterales 37 %;
selector «Tipo de gráfica» justo antes de la imagen, botón amarillo seleccionado.
No se modifica el encabezado global ni las otras secciones.

Se conserva el catálogo estadístico data/subachoque-atlas-41.json sin cambios:
41 preguntas G01–G35 y G37–G42, con sus series y cifras originales del notebook.

Los 246 JPG individuales y 41 paneles completos ya estaban incorporados en
assets/atlas-original/ con metadatos SHA-256 en data/atlas-original-manifest.json.
La interfaz utiliza ahora las seis rutas JPG por pregunta directamente desde ese
manifiesto; no genera SVG para las preguntas del Atlas.

Para KoBo se mantienen 48 temas y 49 métricas agregadas de 324 encuestas
sin respuestas individuales. Sus seis opciones visuales son derivaciones dinámicas
de los mismos agregados; no se hacen pasar por JPG del Atlas.

## Correspondencias oficiales

data/atlas-taxonomia-oficial.json conserva la correspondencia entre categorías
históricas y las cuatro dimensiones visibles, con áreas 6 / 6 / 4 / 4.

- G26: se reubica en Dimensión Ambiental y Territorial → Ambiente y Desarrollo
  Sostenible porque sus opciones son agua, aire, ruido, temperatura y áreas verdes.
  Continúa siendo una pregunta de prioridades declaradas, no una medición instrumental.
- G27: se reubica en Dimensión Económica → Turismo por sus dos series de atractivos
  y tradiciones. Se reconoce su relación con Cultura, sin duplicar el indicador.
- G34: se ubica en participación y relacionamiento ciudadano por tratar sobre
  asistencia a actividades públicas.
- Las seis agrupaciones anteriores de percepción se consolidan en cuatro áreas
  oficiales; las 15 categorías KoBo de percepción conservan sus IDs y métricas.

Las áreas oficiales que aún no tienen una medición publicable se presentan
sin datos, sin generar categorías o cifras artificiales.

## Interpretación de datos y privacidad

Los valores JPG originales se preservan sin edición. Las interpretaciones distinguen:
- universo publicado,
- base elegible,
- registros originales,
- estimaciones para completar cobertura,
- marcas estimadas por categoría de la serie seleccionada.

Cuando esas cantidades estimadas son diferentes, se explica que son conceptos
distintos, en lugar de reemplazar una por otra.

El estado documental original aparece en Interpretación: cinco indicadores tienen
cierre coherente con fuentes primarias parciales, 21 tienen reservas y 15 requieren
corrección o conciliación. No se hacen afirmaciones de cierre que el notebook no respalde.
Se respetan las cifras originales y los porcentajes con precisión hasta dos decimales.

Atención metodológica: el catálogo del Atlas contiene categorías con menos de cinco
marcas en algunas preguntas. Los JPG se habían publicado antes de esta implementación
y conservan sus valores originales. La UI no expone datos individuales ni crea cruces
personales; indica en la interpretación cuándo hay categorías de frecuencia reducida.
Esto no sustituye una aprobación formal de privacidad de la publicación original.
Si la revisión institucional exige suprimir esas celdas, deberán retirarse del acceso
público las imágenes afectadas y publicarse versiones seguras identificadas por separado,
sin sobrescribir los archivos originales.

## Pruebas

- node --check js/caracterizacion-kobo.js
- node scripts/test_atlas_41.cjs
- node scripts/test_current_modules.cjs
- node scripts/test_data_core.cjs
- node scripts/test_uc42.cjs
- python3 scripts/verify_static.py
- PLAYWRIGHT_HOST_PLATFORM_OVERRIDE=ubuntu24.04-x64 node scripts/test_atlas_original_browser.cjs

Este último confirma que las 246 imágenes reales se decodifican en el navegador
con los selectores correctos; valida las cuatro dimensiones y veinte áreas, G26/G27,
ausencia del resumen de tres tarjetas, indicadores KoBo existentes, visor ampliado,
navegación, diseño en escritorio/móvil y ausencia de errores JavaScript.
