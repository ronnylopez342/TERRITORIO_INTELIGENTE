# Auditoría integral de código histórico y recuperación funcional — Territorio Inteligente

**Corte:** 16 de noviembre de 2026. **Repositorio:** `ronnylopez342/TERRITORIO_INTELIGENTE`. **Rama operativa:** `main`.
**Objetivo:** recuperar mejoras realmente perdidas y preservar implementaciones más completas; no regresar al aspecto, cifras o componentes obsoletos.
**Naturaleza del documento:** inventario técnico y plan por fases. Una funcionalidad no se considera recuperada hasta estar conectada a la UI vigente y superar validación funcional y visual.

## 1. Base y trazabilidad

- GitHub contiene **una sola rama activa: `main`**. La limpieza automatizada del 16/11/2026 borró 63 secundarias, dejó 9 respaldos como etiquetas Git y registró 0 errores: [evidencia de ejecución](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/actions/runs/43893816267).
- El punto de partida verificado antes de esta auditoría fue `fc2f45197ca11a4f4a66ed6f14d11dbcfc7d8a04`. La rama estaba sincronizada con el despliegue de producción de Vercel. Los commits siguientes de esta auditoría cambian pruebas y documentación, no sustituyen diseños de la web.
- Inventario de punto de partida: **209 archivos** en Git, desglosados en 37 JavaScript, 59 CSS, 35 datos, 38 recursos `assets`, 22 scripts, 14 documentos, 2 API y configuración/HTML restante.
- Las 54 ramas eliminadas que no fueron etiquetadas no tenían commits por delante de `main` al momento de la limpieza. Eso **no** demuestra que todas sus funciones sigan presentes en la interfaz: pueden existir eliminaciones posteriores en el historial de `main`.
- Las otras 9 versiones divergentes se pueden inspeccionar mediante referencias `archivo-20261116/...`. **Etiqueta no equivale a rama ni a funcionalidad publicada.**

## 2. Fotografía funcional verificable del código actual

| Área | Evidencia de la versión actual | Advertencia |
|---|---|---|
| 2.1 Conoce Data | Panel actual y sección `cn-plan-territorial`, visor documental PDF y contenidos editoriales | La antigua aplicación CRUD del Plan Estadístico (`js/plan-estadistico.js`) no está cargada |
| 2.2 Data Subachoque | `js/data-subachoque.js`, datos JSON de 4 dimensiones, 21 áreas y 105 subtemas | El módulo histórico 2.2 era distinto; no reinstalar sus menús como pestañas nuevas |
| 2.3 Caracterización | `js/caracterizacion-kobo.js`: agregados KoBo, 324 encuestas, 4 dimensiones, 48 temas | No usar las cifras ilustrativas (1.248) del módulo de encuesta antiguo como datos reales |
| 2.4 Explorando mi Territorio | Leaflet/GeoJSON y 17 veredas en el catálogo cartográfico | No presentar centroides de referencia como ubicaciones puntuales verificadas |
| 3.3 Planes de Acción | 11 paneles; `js/plan-accion-dashboard.js` y `css/plan-accion-summary-2x2.css` actuales | Los CSS de resúmenes viejos utilizan clases del DOM anterior |
| 4.2 Unidad de Cumplimiento | Vista dinámica `cumplimiento-proyectos` montada por `js/ti-modules-34.js`; fuente de 30 registros de `Proyectos DEFINITIVO` | Los estados de obra, avances e indicadores acreditados NO son intercambiables |
| Navegación y despliegue | Una sola `main`; Vercel vinculado al repositorio y producción | La rama `main` estaba sin protección de escritura; debe cuidarse cada modificación |

## 3. Auditoría individual de los NUEVE respaldos con commits exclusivos

Los conteos `ahead` proceden de comparaciones Git. Comparar commits no equivale a comparar comportamiento o diseño del navegador.

| Respaldo `archivo-20261116/...` | Ahead (respecto a main al auditar) | Evidencia concreta | Decisión de recuperación |
|---|---:|---|---|
| `delivery/02-data-territorio` | 15 | `js/data-viewer-chrome.js` y `css/data-delivery-02.css` requieren `#data-fuentes` y pantallas 2.x antiguas, ya inexistentes; la vista actual tiene 4 paneles | **NO pegar entero**. Inventariar microfunciones útiles de menú, documentos y fuentes y migrarlas al módulo actual si faltan |
| `feature/data-fuentes-capitulos-07-12` | 1 | Modificó `assets/interactive/data-fuentes-visual.html`; `main` conserva un catálogo de **12 capítulos** y visor modular, pero no expone el visor antiguo desde `index.html` | **Candidato a recuperar acceso**, no reemplazar el HTML actual de 2.1/2.2 |
| `fix/plan33-summary-two-column-charts-20261107` | 2 | Antiguo `js/plan-accion-dashboard.js` genera cuatro tarjetas de métricas con clases diferentes; el código actual tiene gráficas y navegación posteriores | **Evolucionado**. Contrastar cálculos, leyendas y lectura, nunca sobrescribir el JS completo |
| `fix/plan33-two-graphs-only-20261107` | 3 | `css/plan-accion-summary-paired-charts.css` no existe en `main`; la versión actual usa `css/plan-accion-summary-2x2.css` y clase `.pa-summary-analytics` | **Evolucionado**. No restaurar CSS obsoleto por el solo hecho de estar ausente |
| `fix/uc42-indicadores-fidelidad-visual-20261109` | 1 | Archivos de indicadores difieren: la versión actual usa filtros compartidos de `TI42Summary`, mejora fuentes y evita dibujar series ficticias cuando no hay medición; CSS más legible | **Actual superior para integridad**. Comparar detalles de UI en una revisión visual sin restaurar cifras ni fuentes antiguas |
| `m1/refactor-zero-change` | 2 | Faltan `.gitattributes`, `package.json`, `scripts/verify-m1.mjs` y guía `M1_ZERO_CHANGE.md` del corte anterior | **Candidato técnico**, previo examen de compatibilidad; no modificar tratamiento de binarios ni dependencias por copia ciega |
| `m2/editorial-identity` | 3 | `editor/registry.json` y scripts de identificadores se perdieron del árbol vigente; el registro antiguo apunta a `planDashboard`, `complianceDashboard` y otros IDs retirados | **Reconstrucción requerida** si se decide recuperar gobernanza editorial; copiar el registro viejo rompería localizadores |
| `production/v2.3-canonical` | 1 | Instantánea del portal anterior al estado actual, con los recursos gráficos base | **Histórico/superado**. No publicar una versión más antigua sobre `main` |
| `redesign/plan33-editorial-azul` | 2 | CSS adicional con reglas globales `!important` y fondos azul muy oscuro sobre Planes de Acción | **No restaurar directamente**: incompatible con correcciones posteriores de legibilidad y diseño; extraer mejoras puntuales solo tras revisión visual |

**Importante:** estas nueve etiquetas conservan los commits. Sus diferencias no se aplicaron automáticamente; por eso evitamos reintroducir regresiones.

## 4. Pérdidas funcionales candidatas en el árbol principal (no confundir con archivos eliminados)

En `main` hay **siete JS y cinco CSS históricos que no aparecen cargados desde `index.html`**. Los JS son: `dane-subachoque-charts.js`, `dane-subachoque.js`, `encuesta-municipal.js`, `memoria-alcaldia-demo.js`, `memoria-alcaldia.js`, `plan-estadistico.js` y `publicaciones-editorial.js`. Los CSS correspondientes son `dane-subachoque.css`, `encuesta-municipal.css`, `memoria-alcaldia.css`, `plan-estadistico.css` y `publicaciones-editorial.css`.

**Confirmación:** no se referencian en el documento HTML principal. **Interpretación pendiente:** una función puede existir reescrita en módulos nuevos o haberse retirado deliberadamente. No afirmar pérdida funcional definitiva sin recorrer la aplicación y comparar el comportamiento.

### Puntos prioritarios de análisis visual y funcional

1. **Plan Estadístico:** el antiguo `plan-estadistico.js` implementa administración local de indicadores, documentos, fichas y seguimiento, pero depende de `#data-plan-estadistico`/`#peHome` eliminados. El Plan actual está incorporado como información y consulta documental en 2.1. Determinar qué herramientas hacen falta realmente y, si corresponden, integrarlas como funciones subordinadas sin restituir la pestaña antigua.
2. **Visor Fuentes (12 capítulos):** hay SVG de capítulos 07–12, un catálogo JSON de 12 capítulos, script y vista históricos; no hay vínculo a ese visor desde el `index.html` actual. Revisar si esta navegación debe estar disponible en Conoce Data o en un recurso independiente, manteniendo la portada actual.
3. **DANE 2005/2018:** el archivo estadístico y funciones de visualización permanecen, pero su JS no se carga en la página principal. Evaluar si las comparaciones DANE actuales cubren su funcionalidad o requieren acceso contextual dentro de Data Subachoque.
4. **Memoria de la Alcaldía:** la interfaz histórica de archivos/documentos está desacoplada; revisar específicamente búsqueda, carga de documentos, historial y permisos. No reincorporar sus datos ficticios como información oficial.
5. **Encuesta municipal antigua:** el producto actual 2.3 usa agregados reales KoBo; no recuperar automáticamente la demo antigua. Solo trasladar interacciones útiles (filtros, mapa, exportación, etc.) si hoy faltan y respetan procedencia.
6. **Publicaciones:** el flujo actual de archivos en Data Conoce y el módulo antiguo editorial deben compararse por búsqueda, filtros, descarga, edición y datos realmente verificables; no reactivar las nueve publicaciones demo como documentos oficiales.
7. **Mapas, rendimiento y accesibilidad:** revisar nombres de veredas legibles, marcadores de referencia, responsividad, estados sin datos y accesibilidad con pruebas de navegador, sin atribuir coordenadas certificadas a las obras.

## 5. Hallazgos de calidad y automatización reparados EN ESTA AUDITORÍA

- El anterior `.github/workflows/static-check.yml` vigilaba **ramas eliminadas**, no `main`.
- `scripts/verify_structure.py` exigía seis pestañas Data y comprobaba un elemento 4.2 fijo, aunque actualmente hay cuatro paneles Data y el componente 4.2 se monta dinámicamente. El antiguo hash rígido del Home no distingue edición intencional de regresión.
- `scripts/test_plan_estadistico.cjs` exigía un antiguo panel 2.2 ausente, en lugar de validar la integración vigente en 2.1.
- Los tests `test_dane_subachoque`, `test_memoria_alcaldia`, `test_encuesta_municipal`, `test_publicaciones_editorial` y sus smokes anteriores exigen pantallas 2.3–2.6 retiradas. **Se conservan en el repositorio como pruebas históricas**, sin hacerlas pasar falsamente por validación de la interfaz actual.
- Se añadió `scripts/test_current_modules.cjs`, que valida la estructura 2.1–2.4, 4 dimensiones, 21 áreas, 105 subtemas, 324 encuestas agregadas, 17 veredas, 12 capítulos y datos DANE conciliados.
- Se añadió `scripts/smoke_current_modules.cjs` para probar la navegación de los cuatro paneles actuales y carga de dimensiones y caracterización.
- El nuevo workflow prueba además sintaxis de todos los JS y 4.2 con datos originales. **Se logró al menos una ejecución completa con resultado success:** [GitHub Actions](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/actions/runs/43898459005). Cambios posteriores requieren revalidación en su propio commit.

## 6. Fases para recuperar mejoras sin deshacer versiones nuevas

| Fase | Contenido | Condición para dar por cerrado |
|---|---|---|
| **0. Base/CI** | Congelar inventario, hacer pruebas representativas de la UI actual, enlazar CI con `main`, documentar las nueve etiquetas | CI verde, una sola rama, production `READY`, reporte trazable |
| **1. Data 2.1–2.4** | Auditar acceso perdido a Plan Estadístico, Fuentes, DANE, Memoria, Encuesta y Publicaciones; priorizar herramientas útiles en la UI vigente | Pruebas de cada recurso y vista sin duplicar pestañas ni publicar cifras demo |
| **2. Planes de Acción 3.3** | Reconstruir decisiones cronológicas de gráficas, cuatro paneles, selector, mapa, tabulación y cálculos desde respaldos | Comparación visual actual+archivo y tests de métricas, años, móviles y filtros |
| **3. Unidad de Cumplimiento 4.2** | Comparar vistas e indicadores con el archivo original; preservar nombres de veredas, pines por referencia y estados sin evidencia ficticia | Pruebas de coherencia de datos y mapa, filtros compartidos, 30 registros de fuente |
| **4. Herramientas M1/M2** | Recuperar solo pruebas y estructura editorial todavía útiles, reconstruir localizadores en el DOM actual | Ningún script utiliza IDs retirados, todo validado contra `main` |
| **5. Auditoría de regresiones históricas** | Recorrer commits integrados en `main` para detectar funciones desaparecidas por ediciones posteriores, incluso de las 54 ramas sin commits únicos | Cada pérdida candidata clasificada como recuperada, reemplazada deliberadamente o pendiente |
| **6. Cierre integral** | Auditoría visual responsive, contraste con documentos originales, verificación CI y Vercel | Producción a commit de `main`, `READY`, logs sin errores críticos y lista de pendientes explícita |

## 7. Reglas de decisión y seguridad

- **RECUPERAR** solamente capacidades desaparecidas que aporten valor y tengan datos fiables; debe existir prueba funcional antes y después.
- **CONSERVAR** si la implementación nueva ya ofrece la función con mejor legibilidad, rendimiento o integridad.
- **RECONSTRUIR** si el concepto es útil pero depende de selectores, modelos de datos o estado ya eliminados.
- **NO REACTIVAR** demos o números ilustrativos como valores oficiales; nunca inventar puntos geográficos de obras.
- **NO COPIAR archivos completos de una etiqueta sobre `main`** si contienen estados anteriores. Recuperar por componentes con diferencias mínimas y verificables.
- **UNA RAMA**: `main` se mantiene como única rama operativa hasta nueva indicación. Etiquetas históricas no se eliminan. Cada intervención con código debe confirmar CI, despliegue y dominio de producción.
- El estado `READY` de Vercel acredita compilación/publicación, **no** la completitud funcional; para esa afirmación se necesitan pruebas y revisión visual.

## 8. Criterio de finalización de la auditoría integral

El objetivo `100 % recuperado` solo podrá declararse si cada candidato histórico está etiquetado explícitamente `recuperado`, `sustituido/mejorado` o `descartado con motivo`, con prueba y decisión. Este informe **no** declara todavía esa conclusión: la Fase 1 funcional (recuperación, no solo inventario) y las posteriores siguen abiertas.

### Fuentes reproducibles

- Comparación Git: `git log main..archivo-20261116/<nombre> --oneline` y `git diff main archivo-20261116/<nombre> -- <ruta>`.
- Catálogo y funcionamiento real: `index.html`, `js/data-subachoque.js`, `js/caracterizacion-kobo.js`, `js/plan-accion-dashboard.js`, `js/ti-cumplimiento-42-*` y `data/uc42-source.json`.
- Limpieza de ramas: GitHub Actions, ejecución `43893816267`; pruebas de control: workflows de `main`.
