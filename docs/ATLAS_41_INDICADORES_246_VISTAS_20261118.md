# Atlas estadístico integral — integración a Caracterización

Fuente original adjunta:
SUBACHOQUE_ATLAS_ESTADISTICO_INTEGRAL_41_PREGUNTAS_246_GRAFICAS_2026.ipynb

## Alcance

- 41 preguntas G01–G35 y G37–G42 (G36 no figura en el notebook).
- 6 visualizaciones por pregunta: barras horizontales, puntos, proporciones, mosaico, circular y columnas (246 vistas).
- 13 indicadores sociales, 5 económicos, 13 ambientales y territoriales, 10 de percepción ciudadana.
- No se introduce la dimensión institucional.
- La subárea ambiental Vivienda, Hábitat y Ordenamiento Territorial se añade al atlas cuando no figura en los agregados KoBo.

## Fuente y denominadores

Los valores congelados proceden de las tablas del notebook, NO de una consulta nueva a KoBo. Cada pregunta conserva: código, título, dimensión, área, universo global, base elegible, marcas originales, marcas estimadas, estado documental, comentario metodológico y series. Las series incluyen categorías, recuentos publicados, porcentaje global cuando está disponible y componentes estimados.

G27 y G32 incluyen dos series cada una, con un selector propio.

El notebook distingue datos originales y estimados, y preguntas con estados de conciliación. No presentar las marcas estimadas como nuevas respuestas reales ni como representatividad municipal de la encuesta.

Se preservan todos los indicadores KoBo previos: 48 subtemas y 49 métricas, en sus categorías originales.

## Navegación y diseño

No modificar encabezado, cuatro tarjetas superiores ni distribución. Cada pregunta se incorpora como categoría de la dimensión y área correspondiente. Al elegirla, aparecen seis botones para alternar la visualización sin cambiar de pregunta.

Los SVG mantienen fondo blanco y paleta verde, como el notebook, pero son reconstrucciones interactivas de las tablas congeladas, NO imágenes idénticas a las JPG originales. Las JPG siguen en el notebook del usuario.

Interpretación analítica, principales hallazgos y fuente cambian con la pregunta y serie. Las seis variantes no representan seis muestras distintas.

## Límites

- Clasificación temática funcional: no implica equivalencia entre todas las categorías del atlas y KoBo.
- Fuente y escenarios: 17–18 de noviembre de 2026.
- Sin respuestas individuales ni identificadores.
- Las categorías pequeñas del atlas reflejan el cuadro documental recibido, distinto a la supresión bajo cinco registros aplicada a las vistas KoBo.

## Pruebas

- node scripts/test_atlas_41.cjs
- PLAYWRIGHT_HOST_PLATFORM_OVERRIDE=ubuntu24.04-x64 node scripts/smoke_kobo_layout.cjs
- node scripts/test_current_modules.cjs
- node scripts/test_data_core.cjs
- node scripts/test_uc42.cjs
- python3 scripts/verify_static.py
