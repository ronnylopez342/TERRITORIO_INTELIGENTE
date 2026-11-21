# Importación de fichas de indicadores — Data Subachoque (2.2)

**Fecha de integración:** 20 de noviembre de 2026  
**Procedencia:** nueve libros Excel aportados por el usuario.  
**Archivo público de datos:** `data/fichas-2026-consolidadas.json`  
**Módulos web:** `js/data-subachoque-fichas.js`, `js/data-subachoque-pdf.js`, `css/data-subachoque-fichas.css`

## Inventario

- 357 hojas con nombre de indicador detectadas.
- 305 hojas con al menos un valor numérico en la serie o tabla.
- 52 fichas sin valores numéricos detectados.
- 16 fichas consolidadas como duplicados evidentes, conservando referencias de procedencia.
- **341 indicadores distintos en el catálogo consolidado; 290 con valores y 51 sin serie publicable.**
- Se excluyeron siete hojas auxiliares sin nombre de ficha (índices y bases de apoyo).
- **212 enlaces de carpetas personales SharePoint fueron ocultados en el JSON público** y sustituidos por la indicación de soporte interno pendiente de revisión.

## Libros procesados

1. `Fichas_indicadores_-_desarrollo_social.xlsx`
2. `Fichas indicadores - Ambiente y Competitividad.xlsx`
3. `Fichas HACIENDA.xlsx`
4. `Fichas de indicadores INSTITUTO.xlsx`
5. `Ficha indicadores PLANEACIÓN.xlsx`
6. `Indicadores Obras Públicas.xlsx`
7. `INDICADORES GOBIERNO.xlsx`
8. `Indicadores EMPRESA AGUAS Y ASEO.xlsx`
9. `Indicadores Hcienda - Prueba.xlsx`

## Clasificación

Se conserva el catálogo oficial de cuatro dimensiones de Data Subachoque, incluidos sus 21 grupos de áreas y 105 subtemas. Primero se intenta la correspondencia por código del documento original (dimensión, área, subtema), luego por coincidencia textual y, si el subtema o área no existe, se crea uno nuevo usando las etiquetas del Excel. Cuando faltan dimensión o códigos, se propone una ubicación por afinidad temática (sin inventar una numeración oficial). La cuarta dimensión de **Data Subachoque es Institucional**; la cuarta de **Caracterización es Percepción Ciudadana**, sin cambios en esta última.

Las áreas y categorías sin indicadores con datos permanecen visibles, con controles deshabilitados y color atenuado. Las fichas sin serie no reciben gráficas inventadas.

## Contenido de cada ficha

- Cinco tarjetas de contexto calculadas sobre los puntos observados; no se inventa una meta.
- Gráfica anual o desglose de categorías a partir de los valores numéricos del Excel (no del Atlas de KoBo).
- Ficha técnica: nombre, código original (o «sin código asignado»), definición, unidad, fórmula, periodicidad, fuente, responsable, metodología, actualización, soporte y observaciones.
- Interpretación estrictamente descriptiva y hallazgos calculados, sin inferencias causales.
- Navegación a los demás indicadores disponibles del área.
- Descarga directa de PDF A4, con fallback al diálogo nativo de impresión.

El código preserva el valor numérico original. En la vista, **solo** convierte porcentajes expresados como fracción en los archivos o valores en pesos a millones cuando la unidad y la magnitud lo justifican; cada conversión debe mostrarse con nota metodológica.

## Limitaciones y verificaciones pendientes

- Las cifras y sus fuentes proceden de fichas entregadas: **no equivalen automáticamente a validación institucional o de DANE**.
- Fechas o años de actualización no confirman que todas las series sean anuales completas; revisar cortes parciales de 2026.
- Los indicadores con un solo punto no admiten una tendencia anual.
- Las 32 fichas del Instituto necesitan datos en sus series antes de habilitarse.
- Los enlaces privados y los códigos pendientes de asignación no deben presentarse como enlaces públicos ni códigos oficiales.
- Un control de calidad documental adicional con cada dependencia sigue siendo aconsejable antes del lanzamiento institucional.

## Pruebas de regresión

`node scripts/test_current_modules.cjs`  
`node scripts/test_data_core.cjs`  
`node scripts/test_atlas_41.cjs`  
`node scripts/test_uc42.cjs`  
`PLAYWRIGHT_HOST_PLATFORM_OVERRIDE=ubuntu24.04-x64 node scripts/test_data_subachoque_fichas.cjs`  
`PLAYWRIGHT_HOST_PLATFORM_OVERRIDE=ubuntu24.04-x64 node scripts/test_data_subachoque_pdf.cjs`

La sección 2.3 conserva las **246 imágenes JPG originales de los 41 indicadores del Atlas** y su navegación independiente.

## Actualización: validación exhaustiva y reclasificación (21 noviembre 2026)

La revisión de los **nueve libros Excel** produjo **357 hojas de indicador**, de las que quedan **341 fichas únicas** tras consolidar 16 duplicados. Se cotejaron **1.212 puntos temporales** y **98 valores categóricos** con las celdas de las hojas de origen; no se hallaron diferencias numéricas después de interpretar formatos textuales como porcentajes o pesos. Los libros NO contienen gráficos incrustados: la interfaz muestra sus series como visualizaciones interactivas, no se presentan como gráficos originales.

El archivo `data/fichas-2026-validadas.json` preserva los 341 registros y sus 290 fichas con datos, pero registra la clasificación de origen y una clasificación revisada; `scripts/validar_clasificacion_subachoque.cjs` vuelve a producirlo de forma determinista. Se han corregido **65 ubicaciones** temáticas y **16 enlaces internos de trazabilidad de duplicados**. El listado preciso de correcciones está en `data/auditoria-clasificacion-fichas.json`.

**Cambio de interfaz:** áreas y subcategorías sin indicadores publicables se **ocultan completamente**, ya no se muestran como botones deshabilitados. Las cuatro dimensiones se mantienen cuando cuentan con datos. Para las **siete fichas** que poseen simultáneamente serie temporal y datos por categorías hay selector para alternar las dos representaciones sin omitir filas categóricas.

**Advertencias pendientes:** algunos valores se registran como cortes parciales (2026), y unas fichas advierten que el soporte no permite demostrar directamente las cifras (por ejemplo, inversión pública o regalías), además de la serie de deuda pública de ceros. Las coincidencias de las celdas Excel no constituyen certificación institucional de la confiabilidad de las fuentes. Estas observaciones se conservan para verificación con las dependencias.

**Pruebas:** `node scripts/validar_clasificacion_subachoque.cjs`, `PLAYWRIGHT_HOST_PLATFORM_OVERRIDE=ubuntu24.04-x64 node scripts/test_data_subachoque_strict.cjs`, y los tests actuales de 2.1–2.4, Atlas KoBo, tabla/panel y exportación PDF.
