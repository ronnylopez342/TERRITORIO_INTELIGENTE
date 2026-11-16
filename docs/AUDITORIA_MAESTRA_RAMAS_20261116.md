# AUDITORÍA MAESTRA — UNIFICACIÓN DE LAS 63 RAMAS
## Territorio Inteligente · corte del 16 de noviembre de 2026

**Propósito.** Revisar todas las ramas históricas y conservar en una sola versión oficial **cada mejora útil**, sin recuperar por accidente pantallas antiguas, cifras demostrativas, archivos desactualizados o funciones sustituidas por otras mejores.

**Fuente única del código:** [`main`](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/tree/main). **Línea base funcional auditada:** `fb5de4ae8395ba233c6eb42280b8a70cc0dad32a`. Este documento y su [matriz CSV de 63 ramas](./MATRIZ_RAMAS_20261116.csv) son evidencia y planificación; **no constituyen por sí mismos una migración de funcionalidades**.

## Actualización posterior: recuperación implementada y probada

**Este apartado prevalece sobre los estados «pendiente» de las tablas de inventario originales, que se conservan como fotografía del diagnóstico inicial.** Para consultar los estados operativos actualizados y los pendientes reales, utilizar el [CHECKLIST VIVO DE RECUPERACIÓN](CHECKLIST_RECUPERACION_FUNCIONAL_20261116.md).

| Hallazgo de la primera auditoría | Acción posterior comprobada | Estado |
|---|---|---|
| Doce capítulos históricos sin entrada | Visor integrado y navegable desde 2.1, sin reinstalar antiguas pestañas | **RECUPERADA** |
| DANE 2005/2018 desacoplado | Comparación censal con fuentes y conciliación urbana/rural | **RECUPERADA** |
| Gestor local del Plan Estadístico desconectado | Nuevo gestor compatible con antigua clave, CRUD/fórmulas/import/export | **RECUPERADA** |
| Memoria municipal local histórica no accesible | Consultar, filtrar, crear, editar, adjuntar y descargar en Publicaciones | **RECUPERADA** |
| Importaciones estadísticas Data por fuente ocultas | Reutilizado TIWorkspace para DANE/nacional/departamental/municipal | **RECUPERADA** |
| Incongruencia de altura del mapa 4.2 | Retirada una regla posterior que forzaba el mapa a 270px en móvil | **CORREGIDA** |
| M1 sin verificadores de integridad actuales | Nuevo control de nueve fuentes críticas originales | **RECONSTRUIDA** |
| M2 registry antiguo incompatible | Registro de 19 localizadores del DOM actual con prueba de unicidad | **RECONSTRUIDA** |
| Cambios anteriores 3.3/4.2 | Se conserva la implementación posterior; nuevos smokes en escritorio/móvil | **SUSTITUIDA CON MEJORA EN CASOS PROBADOS** |
| Demos antiguas de encuesta, PDFs reconstruidos y CSS azul | Rechazadas para no perder procedencia ni reintroducir regresiones | **DESCARTADAS CON MOTIVO** |

**Pruebas:** [GitHub Actions tras recuperación](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/actions/runs/43909553297) (SUCCESS); [pruebas iniciales y capturas 3.3/4.2](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/actions/runs/43906381954).

**Límites que continúan abiertos:** comparación semántica de cada modificación histórica de 455 commits, QA manual de todas las vistas/tamaños, fuentes institucionales faltantes, permisos multiusuario y protección de `main`. Estas no son condiciones resueltas por el despliegue automático.

---

### 1. Resumen ejecutivo

| Indicador | Comprobado | Interpretación |
|---|---:|---|
| Ramas activas | **1** | Solo `main`; no se recrearon otras ramas |
| Ramas secundarias eliminadas | **63** | Registro de limpieza: 0 omitidas |
| Antiguas ramas sin commits exclusivos al borrar | **54** | Sus commits estaban alcanzables en `main`; la funcionalidad puede haber evolucionado |
| Ramas divergentes con respaldo | **9** | Conservadas como etiquetas `archivo-20261116/...` |
| Archivos en línea base | **214** | 37 JS, 59 CSS, 35 datos, 38 assets, 15 docs, 23 scripts y demás archivos |
| Scripts JS históricos sin carga directa desde el HTML | **7** | Requieren comparación funcional antes de restaurarlos |
| CSS históricos sin carga directa desde el HTML | **5** | No reactivar globalmente sin adaptar al DOM vigente |
| Commits analizados en barrido histórico anterior | **455** | 14 rutas borradas alguna vez, 12 ausentes y 2 restablecidas |
| Estado global de recuperación | **ABIERTA** | No existe evidencia para afirmar que el 100 % de los cambios útiles está visible |

**Evidencia:** [limpieza de ramas](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/actions/runs/43893816267) · [barrido de historia](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/actions/runs/43899881522) · [validación CI de la línea base](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/actions/runs/43900377927) · [código consolidado](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/tree/main).

### 2. Estados normalizados

Cada rama y cada capacidad se evalúan **por separado**. Los estados de historial Git no son certificados de funcionalidad.

| Estado | Significado | ¿Cierra auditoría funcional? |
|---|---|---|
| `HISTORIAL_EN_MAIN` | El commit de la antigua rama es ancestro de `main` | **No** |
| `DIVERGENTE_RESPALDADA` | Hay commits exclusivos conservados en etiqueta histórica | **No** |
| `PRESENTE_VERIFICADA` | Función accesible, probada y respaldada por fuente | Sí, con prueba registrada |
| `SUSTITUIDA_CON_MEJORA` | La solución actual cubre los casos antiguos y mejora resultados | Sí, con comparativa |
| `PÉRDIDA_CONFIRMADA` | La capacidad valiosa ya no está disponible | No, exige recuperación |
| `RECUPERACIÓN_PENDIENTE` | Hay evidencia de pérdida potencial, sin implementación cerrada | No |
| `RECONSTRUIR` | La idea sigue siendo útil, pero su código depende de estructuras obsoletas | No |
| `DESCARTADA_CON_MOTIVO` | Retirada intencional, duplicación o riesgo de regresión | Sí, dejando motivo |
| `NO_VERIFICADO` | No hay prueba suficiente para decidir | No |

Las **63 filas completas** están en el archivo [`MATRIZ_RAMAS_20261116.csv`](./MATRIZ_RAMAS_20261116.csv), con área, evidencia, prioridad y decisión pendiente. Para las 54 ramas sin commits exclusivos se usa `COMMIT_INCLUIDO_EN_MAIN` en historial y `POR_VALIDAR_FUNCIONALIDAD` como estado funcional: **no se han marcado fraudulentamente como 100 % implementadas**.

### 3. Revisión de los nueve respaldos divergentes

| Respaldo histórico | Commits exclusivos | Estado de capacidades y evidencias | Próxima decisión | Prioridad |
|---|---:|---|---|---|
| `delivery/02-data-territorio` | 15 | Tenía `js/data-viewer-chrome.js`, `css/data-delivery-02.css` y flujo documental que dependían de pestañas e IDs antiguos como `#data-fuentes` | **Reconstruir selectivamente** lo que falte en las cuatro vistas actuales | P1 |
| `feature/data-fuentes-capitulos-07-12` | 1 | `main` conserva 12 capítulos, archivos SVG y un visor histórico; la página principal **no enlaza actualmente ese visor** | Evaluar y recuperar acceso funcional sin reinstalar pestañas antiguas | P1 |
| `fix/plan33-summary-two-column-charts-20261107` | 2 | El dashboard vigente ya tiene indicadores y series de ejecución física/presupuestal; los cambios antiguos usan clases distintas | **Comparar paridad** de métricas, leyendas y disposición, no copiar el JS entero | P1 |
| `fix/plan33-two-graphs-only-20261107` | 3 | El CSS antiguo `plan-accion-summary-paired-charts.css` fue sustituido por `plan-accion-summary-2x2.css`; no se demuestra equivalencia visual solo por esa sustitución | Comprobar layout 2×2 y visibilidad real de las gráficas | P1 |
| `fix/uc42-indicadores-fidelidad-visual-20261109` | 1 | La versión actual mejora los filtros compartidos, textos de fuente y comportamiento sin mediciones acreditadas | Conservar integridad; revisar fidelidad visual y accesibilidad | P1 |
| `m1/refactor-zero-change` | 2 | `package.json`, `.gitattributes`, `verify-m1.mjs` y guía M1 no están en `main` | Recuperar pruebas/herramientas útiles tras revisión de compatibilidad | P2 |
| `m2/editorial-identity` | 3 | `editor/registry.json` y scripts de identidades no están; apuntaban a IDs retirados como `planDashboard` | **Reconstruir** un registro editorial compatible con DOM vigente si se necesita | P2 |
| `production/v2.3-canonical` | 1 | Instantánea previa a la actual; varios componentes posteriores la superan | **No sobrescribir main**; conservar etiqueta histórica | P4 |
| `redesign/plan33-editorial-azul` | 2 | Hoja CSS oscura con abundantes `!important`, anterior a correcciones de contraste y legibilidad | **No restaurar en bloque**; solo extraer mejoras comprobables | P3 |

**Referencias históricas:** [`archivo-20261116/delivery/02-data-territorio`](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/tree/archivo-20261116/delivery/02-data-territorio) · [`archivo-20261116/feature/data-fuentes-capitulos-07-12`](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/tree/archivo-20261116/feature/data-fuentes-capitulos-07-12) · [`archivo-20261116/fix/plan33-summary-two-column-charts-20261107`](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/tree/archivo-20261116/fix/plan33-summary-two-column-charts-20261107) · [`archivo-20261116/fix/plan33-two-graphs-only-20261107`](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/tree/archivo-20261116/fix/plan33-two-graphs-only-20261107) · [`archivo-20261116/fix/uc42-indicadores-fidelidad-visual-20261109`](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/tree/archivo-20261116/fix/uc42-indicadores-fidelidad-visual-20261109) · [`archivo-20261116/m1/refactor-zero-change`](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/tree/archivo-20261116/m1/refactor-zero-change) · [`archivo-20261116/m2/editorial-identity`](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/tree/archivo-20261116/m2/editorial-identity) · [`archivo-20261116/production/v2.3-canonical`](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/tree/archivo-20261116/production/v2.3-canonical) · [`archivo-20261116/redesign/plan33-editorial-azul`](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/tree/archivo-20261116/redesign/plan33-editorial-azul).

### 4. Revisión de las otras 54 ramas

Se verificaron **las 63 eliminaciones individualmente** contra el registro de GitHub Actions. Las 54 no etiquetadas tenían 0 commits exclusivos frente a `main` al borrarse. Incluyen puntos de respaldo, correcciones de Data, Memoria, encuestas, Publicaciones, Plan de Acción, Cumplimiento y diseño editorial.

Esto permite **descartar una rama adicional pendiente de fusión en Git**, pero **no** garantiza que una funcionalidad antigua siga visible: un commit posterior de `main` pudo eliminarla o sustituirla. Por eso la matriz distingue `historia contenida` de `función verificada`, y la Fase 5 analiza eliminaciones a nivel de **función dentro de archivos**, no solo la desaparición de archivos.

### 5. Funciones de riesgo o revisión prioritaria

| ID | Área | Situación comprobada en el código actual | Estado |
|---|---|---|---|
| FUN-01 | Plan Estadístico | `#cn-plan-territorial` presenta PDF e información en 2.1; el antiguo gestor `js/plan-estadistico.js` no se carga desde `index.html` | **RECUPERACIÓN PENDIENTE DE DECISIÓN** |
| FUN-02 | Fuentes/capítulos | Están los 12 capítulos y el visor histórico; no hay `src`/enlace al visor en `index.html` | **ACCESO NO ACREDITADO** |
| FUN-03 | DANE | `js/dane-subachoque.js` y sus gráficos no se cargan desde el HTML, pero Data Subachoque actual contiene datos por dimensiones | **COMPARACIÓN FUNCIONAL PENDIENTE** |
| FUN-04 | Memoria | `js/memoria-alcaldia.js` y `js/memoria-alcaldia-demo.js` siguen en Git, no cargan en el documento principal | **COMPARACIÓN FUNCIONAL PENDIENTE** |
| FUN-05 | Encuesta | `js/encuesta-municipal.js` es histórico y no cargado; actual 2.3 usa agregados KoBo 324/4 dimensiones | **PRESERVAR FUENTE REAL / REVISAR HERRAMIENTAS** |
| FUN-06 | Publicaciones | `js/publicaciones-editorial.js` no se carga; revisar si búsqueda, gestión y filtros están cubiertos por `js/conoce-publicaciones.js` | **COMPARACIÓN FUNCIONAL PENDIENTE** |
| FUN-07 | Planes de Acción 3.3 | `js/plan-accion-dashboard.js` y `css/plan-accion-summary-2x2.css` presentes; no hay prueba visual completa contra las variantes históricas | **PARIDAD POR DEMOSTRAR** |
| FUN-08 | Unidad de Cumplimiento 4.2 | Vista dinámica, 30 registros de la hoja original, pines referenciales y nombres de veredas; falta QA visual con filtros y estados | **PARCIALMENTE VERIFICADO** |
| FUN-09 | Herramientas M1 | Faltan scripts de refactorización y validación del histórico | **EVALUACIÓN TÉCNICA PENDIENTE** |
| FUN-10 | Editor M2 | Registro `editor/registry.json` ausente; IDs históricos incompatible con DOM actual | **RECONSTRUIR SI APORTA VALOR** |
| FUN-11 | CI / Git | Workflow actual valida `main`, pero la rama **no está protegida**, y un push puede publicar automáticamente en Vercel | **RIESGO OPERATIVO** |
| FUN-12 | Documentación | El README principal todavía refería `production/v2.6-canonical`, rama eliminada | **CORREGIR EN ESTA AUDITORÍA** |

**JS históricos no cargados:** `js/dane-subachoque-charts.js`, `js/dane-subachoque.js`, `js/encuesta-municipal.js`, `js/memoria-alcaldia-demo.js`, `js/memoria-alcaldia.js`, `js/plan-estadistico.js`, `js/publicaciones-editorial.js`.

**CSS históricos no cargados:** `css/dane-subachoque.css`, `css/encuesta-municipal.css`, `css/memoria-alcaldia.css`, `css/plan-estadistico.css`, `css/publicaciones-editorial.css`.

**No equivale a archivos basura:** se conservan hasta verificar si sus funciones fueron portadas, sustituidas o realmente perdidas. Tampoco deben reactivarse sin analizar dependencias, privacidad y procedencia de los datos.

### 6. Eliminaciones deliberadas: no confundir pérdida con actualización

El barrido documentado de 455 commits encontró 14 rutas eliminadas alguna vez (12 ausentes, 2 restablecidas). Varias **no deben recuperarse**: la transcripción reconstruida del Plan Estadístico (sustituida por el PDF original), `css/plan-accion-azul.css` (paleta revertida), seis páginas HTML del portal anterior (unificadas en `index.html`), `js/principal.js`, `css/estilos.css`, un logotipo retirado deliberadamente y el workflow temporal de borrado de ramas.

Esto evita una falsa consolidación por simple copia de archivos obsoletos. Fuente: [auditoría anterior, sección de rutas](./AUDITORIA_UNIFICACION_HISTORICA_20261116.md).

### 7. Plan de implementación por fases

| Fase | Qué hacemos | Estado | Criterio de aceptación |
|---|---|---|---|
| **0. Inventario Git** | 63 ramas, 9 tags, 455 commits, matriz de estados | **REALIZADA** | Historial trazable y una única `main` |
| **1. Data Territorio** | FUN-01–06: Plan, capítulos, DANE, Memoria, Encuesta, Publicaciones | **PENDIENTE** | Cada capacidad clasificada y validada en 2.1–2.4 |
| **2. Planes de Acción** | Contraste de gráficas, cálculos, filtros, tablas, recursos y responsive | **PENDIENTE** | Misma o mejor función con test, fuente y comparación visual |
| **3. Cumplimiento** | Contraste de indicadores, filtros, proyectos, etiquetas cartográficas | **PENDIENTE** | 30 registros conciliados y mapas comprobados |
| **4. M1/M2 y gobernanza** | Herramientas de calidad, identidad editorial y checks de rama | **PENDIENTE** | Scripts vigentes y referencias DOM verificadas |
| **5. Regresiones de 54 ramas heredadas** | Comparar funciones eliminadas dentro de JS/CSS todavía existentes | **PENDIENTE** | No queda función candidata sin decisión y prueba |
| **6. Consolidación** | Pruebas, accesibilidad, responsive, previews y versión oficial | **PENDIENTE** | CI verde, validación visual y producción mismo commit |

**Estados de ejecución de cada tarea:** `PENDIENTE` → `EN ANÁLISIS` → `EN IMPLEMENTACIÓN` → `EN PRUEBAS` → uno de `RECUPERADA`, `SUSTITUIDA CON MEJORA` o `DESCARTADA CON MOTIVO`. Solo estos tres últimos cierran una tarea, con evidencia.

### 8. Política para integrar lo mejor de todas las versiones

1. **No reinstalar una rama completa sobre `main`.** Comparar cada cambio por comportamiento, datos y compatibilidad con la interfaz vigente.
2. **No revertir mejoras posteriores.** Una solución antigua se descarta si la actual cubre lo mismo mejor y está probada.
3. **Recuperar pérdidas reales como componentes pequeños.** Si una función antigua falta, adaptar sus partes al código actual sin duplicar rutas, gráficos ni estilos.
4. **Mantener la información territorial verificable.** Los valores de demostración, las coordenadas referenciales y los indicadores no certificados deben mantenerse identificados; nunca fingir que son oficiales.
5. **Cerrar cada tarea con commit, CI, evidencia visual y registro en la matriz.** No declarar 100 % por un despliegue `READY` sin verificar funcionalidades.
6. **Publicar exclusivamente desde `main`** mientras continúe la decisión de tener una sola rama. Revisar protección de rama y checks antes de cambios arriesgados. No borrar las 9 etiquetas históricas.
7. **Actualizar el inventario en cada fase.** Conservar columna de estado e introducir prueba/commit de cierre para garantizar trazabilidad.

### 9. Resultado y límite honesto

**Completado aquí:** segundo recuento real de las 63 ramas; nueve tags recomparadas; una matriz de 63 estados publicada; riesgos y fases estructurados. **No completado todavía:** reimplementar las mejoras candidatas, comparar cada línea históricamente retirada, auditar visualmente 3.3/4.2 y demostrar cobertura funcional de todas las secciones. La unificación Git está hecha; **la unificación funcional todavía no está certificada**.

La versión maestra permanece en [GitHub `main`](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/tree/main). Este reporte no reemplaza fuentes originales ni autoriza restaurar datos ilustrativos como institucionales.
