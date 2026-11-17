# Auditoría documental integral · 3.3 Plan de Acción 2026 · tercer trimestre

**Fuente exacta:** `Plan de Acción 2026 3T.xlsx` · hoja `1. Plan de Acción 2026` · columnas Z (`Soporte de cumplimiento`) y AC (`Link de soportes de la actividad`). Se inspeccionaron **tanto los textos como los hipervínculos nativos de las celdas Excel**. Huella SHA-256: `c67b3c9ad06c184208ceb563cd3669ccbbb5ac3d6cb3364c89695828b1e00206`. Corte físico: enero–septiembre de 2026.

## Resultado: documentos registrables, faltantes y acceso

| Indicador | Resultado comprobado |
|---|---:|
| Metas revisadas | 109 |
| Actividades revisadas | 379 |
| Actividades con al menos un enlace | **222** |
| Actividades sin URL en columna AC | **157** |
| Metas con al menos un enlace | **75** |
| Metas sin enlaces | **34** |
| Referencias de enlaces por actividad | **227** |
| Actividades que mencionan dos enlaces | **5** |
| Identificadores únicos de archivos/carpetas Drive | **160** |
| Hipervínculos nativos en Excel (no necesariamente visibles como texto) | **218** |
| Identificadores con metadatos consultables en Drive | **150** |
| Identificadores sin metadatos consultables | **10** |
| Identificadores cuya ficha señala permiso «anyone» | **141** |
| Referencias únicas verificadas como carpetas | **138** |
| Referencias únicas verificadas como archivos individuales | **12** |
| Identificadores con metadatos consultables pero sin acceso público corroborado | **9** |

**Interpretación estricta:** 150 metadatos consultables ≠ 150 archivos cargados; 138 carpetas ≠ 138 documentos individuales. La fecha de modificación del archivo ≠ fecha de ejecución de la actividad. La vigencia de una carpeta puede incluir documentos 2T, incluso cuando está enlazada desde el Excel 3T.

## Correcciones implementadas

- Datos completos de columna AC: todos los enlaces declarados en celdas, incluidos aquellos almacenados solo en el atributo `hyperlink`, que se perdían si se leía únicamente `cell.value`.
- Cada referencia se vincula a número de meta, número de actividad, fila de Excel, documento esperado y ubicación territorial. Una misma carpeta compartida por varias actividades se muestra **una sola vez** con todas las actividades relacionadas.
- Se preservan múltiples enlaces de una misma actividad, en lugar de tomar únicamente el primero.
- Se corrige en el inventario el código `83.1 ` con espacio final, normalizado a `83.1` para coincidir con el Plan de Acción ya publicado; se conserva la fila Excel 379.
- Se agregan estados explícitos: enlace declarado, metadatos consultables, metadatos no disponibles y documento sin URL de soporte.
- La pestaña Soportes muestra indicadores por meta sin atribuir documentos desconocidos a una carpeta.
- El panel de Contratación muestra un **cruce documental** para actividades que mencionan actas, contratos, pólizas, convenios o resoluciones, pero no incorpora estos soportes como contratos registrados ni cambia sus valores contables.
- Se preserva la base previa 2025 y se impide mezclar los listados de archivos verificados en 2026 segundo trimestre con el nuevo inventario 3T.

## Evidencias documentales que requieren revisión por vigencia

- Un repositorio asociado a la meta 3 contiene archivos rotulados `Segundo Trimestre 2026`; no se pueden atribuir automáticamente al 3T.
- Un repositorio de la meta 39 contiene subcarpetas identificadas como julio, agosto y septiembre. Es necesario inspeccionar el contenido y la correspondencia de documentos con cada actividad antes de certificar su completitud.
- Diez enlaces carecieron de metadatos consultables. Son **accesos por verificar**, no archivos declarados inexistentes.
- En varias carpetas, Google Drive informó permisos `anyone`, incluso `writer` para algunos repositorios. Es prioritario revisar permisos con la Alcaldía antes de enlazar contenido sensible en sitios públicos. **No se modificaron permisos.**

## Contratación — límite de la fuente

El Excel 3T **no incluye un inventario individualizado de contratos** (número, contratista, valor actualizado, adiciones, fechas y estado contractual). Los datos de Contratación de Inversión provienen de una fuente diferente `data/plan-accion-contratacion-2024-2026.b64.txt`, que se conserva sin ser sustituida por documentos de soporte.

**Por tanto NO se afirma** que todos los contratos estén actualizados a 30/09/2026, ni se infieren contratos desde `Proceso contractual`, `Pólizas` o `Actas` de columna Z. Para actualizar esos contratos se requiere una base contractual oficial con corte 3T, o confirmación individual contra SECOP.

## Archivos del repositorio

- `data/plan-accion-2026-3t-soportes-enlaces.json`: inventario de 379 actividades y sus 227 enlaces, procedencia por fila de Excel.
- `data/plan-accion-2026-3t-drive-audit.json`: auditoría de los 160 ID de Drive; los títulos no públicos se ocultan cuando no hay confirmación de acceso.
- `docs/PLAN_ACCION_2026_3T_SOPORTES_PENDIENTES.csv`: **157 solicitudes documentales listas** para remitir a dependencias.
- `scripts/test_plan33_evidencias_2026_3t.cjs`: comprobación reproducible de datos, identificadores, fechas, enlaces y ausencia de duplicación.
- `scripts/smoke_plan33_full_tabs.cjs`: inspección real de Soportes y Contratación en navegador.

## Pendientes que no deben marcarse como terminados

- [ ] Incorporar los documentos o URL de soporte de 157 actividades cuya columna AC está vacía.
- [ ] Verificar con sus propietarios los 10 enlaces con metadatos no disponibles.
- [ ] Inspeccionar los archivos internos y subcarpetas de los 138 repositorios accesibles como carpetas; verificar contenido, actividad y trimestre (no asumir que un enlace equivale a todos los soportes requeridos).
- [ ] Revisar privacidad y permisos de las carpetas compartidas con «anyone», especialmente si tienen permisos de edición o datos personales.
- [ ] Solicitar y reconciliar base contractual oficial al corte del tercer trimestre, con identificadores de contrato o de proceso SECOP.
- [ ] Obtener confirmación institucional de que la hoja de cálculo con encabezados internos 2025 corresponde efectivamente a la vigencia 2026 3T.

**Regla de publicación:** no agregar PDFs, fotos, archivos personales o números de contrato ficticios; solo usar enlaces de la fuente y metadatos comprobados. Los datos no verificados deben permanecer claramente señalados como pendientes.

_Actualización del 17 de noviembre de 2026._
