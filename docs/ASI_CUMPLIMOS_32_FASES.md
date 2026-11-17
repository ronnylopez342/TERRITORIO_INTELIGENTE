# Auditoría y recuperación de Así cumplimos 3.2

Fecha de trabajo: 16 de noviembre de 2026. Base: `869fad700aaae8ac17c6a3e61f77b9f683cf795a` de main, coincidente con producción al iniciar. Este informe sustituye los estados excesivamente optimistas de la auditoría anterior. La rama canónica solicitada es main.

## Fase 0 Fuentes y comparación visual

Se leyeron las 15 hojas completas por sus celdas XML con contenido, incluyendo valores almacenados de fórmulas. La dimensión declarada de Acción 2024 llega a 1.048.576 filas, pero su último valor está en la fila 584. El importador no recorre ni crea esas filas vacías y nunca escribe sobre el Excel.

Fuente: `Matriz de Control Cuatrienio 2024-2027 (1)(2).xlsx`, SHA256 `09a2cf3a3d2f9527c88b74511a8920ef492fce493e9c8d6186202bb3efbeeac2`. Se revisaron visualmente las seis imágenes del Word en su orden de inserción: image1, image2, image5, image6, image7 e image8.

| Hoja | Filas con contenido | Uso o hallazgo |
|---|---:|---|
| 1. Resumen | 5 | Etiquetas sin conteos almacenados; no usar como cifras |
| 2. POAI | 111 | Programación e indicadores de resultado; no mezclar sus importes con Plan Indicativo |
| 3. Plan Indicativo | 112 | 109 metas únicas 1–109; 6 líneas, 19 sectores, 29 programas, 8 responsables |
| 3.1 Plan de Acción 2024 | 584 | 109 resúmenes únicos y filas de actividades repetidas por meta |
| 3.2 Plan de Acción 2025 | 501 | 109 resúmenes únicos y actividades; avance mensual incompleto |
| 3.3 Plan de Acción 2026 | 0 | Sin ejecución documentada |
| 3.4 Plan de Acción 2027 | 0 | Sin ejecución documentada |
| 4. Contratos Cuatrienio | 111 | Fuente contractual distinta; no sumar como pagos del plan |
| 5. Proyectos Estrategicos | 0 | Sin registros |
| 6. Gestión | 19 | Gestión de recursos; no equivale a ejecución certificada por meta |
| Hoja6 | 65 | Registros viales y otros conceptos; consulta en tabla sin mapa |
| Lista | 13 | Iniciativas; no resultados ejecutados |
| Despegable | 13 | Catálogo auxiliar |
| ODS | 17 | Catálogo auxiliar |
| Formula | 102 | Catálogos de validación; no indicadores de avance |

Regla de extracción: una fila resumen por identificador, sin número de actividad (U en 2024, O en 2025). Nunca sumar el mismo presupuesto por cada actividad. No hay identificadores de metas duplicados ni resúmenes duplicados. Las repeticiones de identificador entre actividades son una relación válida de uno a varios.

| Año | Reportes físicos | Promedio descriptivo | Programación Plan Indicativo COP | Saldo definitivo COP | CDP COP | RP COP | Obligaciones COP | Pagos COP |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 2024 | 103/109 | 96,9 % | 13.063.984.853,36 | 13.063.984.853,36 | 11.874.985.552,67 | 11.874.985.552,67 | 11.759.485.552,67 | 11.520.781.967,57 |
| 2025 | 108/109 | 17,5 % | 43.147.953.431,13 | 18.363.274.897 | 14.840.016.603 | 6.998.238.041,64 | 2.235.061.772,86 | 2.224.991.233,86 |
| 2026 | Sin reporte | Sin reporte | 19.612.614.026,61 | Sin reporte | Sin reporte | Sin reporte | Sin reporte | Sin reporte |
| 2027 | Sin reporte | Sin reporte | 21.742.670.982,90 | Sin reporte | Sin reporte | Sin reporte | Sin reporte | Sin reporte |

Avance físico: AG de Acción 2024 y AP de Acción 2025. Faltan metas 6, 7, 12, 47, 93 y 95 en 2024; meta 7 en 2025. No convertir blancos en cero. Promedio simple solo sobre valores numéricos informados; no es cumplimiento oficial ni acumulado cuatrienal. Finanzas: AI:AM en 2024 y AR:AV en 2025. La columna AX 2025 se corresponde con compromisos/saldo en casos revisados (meta 2: 60 %); no usarla como pagos/saldo (20 %). Las unidades heterogéneas y tipos de acumulación impiden sumar metas físicas o promedios entre años.

Inconsistencias a conciliar: POAI y Plan Indicativo contienen importes diferentes (meta 1, 2024: POAI BP3 = 625.560.655; Indicativo AV3 = 0). Se conserva la fuente elegida y se identifica su procedencia. El Word usa 2024–2028 y ejemplos de 2026, mientras que este Excel programa 2024–2027 y no reporta ejecución 2026. No se trasladan cifras del Word. Los resúmenes almacenados se muestran como reportados, sin afirmar que se hayan certificado o recalculado las fórmulas originales.

Conciliación de catálogos: los códigos de indicador de las filas resumen de metas 2–14 y 19 difieren del Plan Indicativo en 2024 y 2025 (14 metas). El catálogo de indicadores usa explícitamente Plan Indicativo K:L, y el seguimiento se une por número de meta, no por esos códigos discrepantes. En 2025 hay 22 diferencias textuales de responsable: todas corresponden al alias «Secretaría de Gobierno» / «Secretaría General y de Gobierno»; los identificadores de metas y su pertenencia institucional coinciden. No se crean entidades adicionales por ese alias. El catálogo del visor conserva el nombre del Plan Indicativo.

| Página | Elemento | Estado inicial comprobado en código | Tratamiento |
|---|---|---|---|
| 1 | Portada y fotos | Encabezado compacto ya existente; quedan fotos genéricas en otras vistas | Conservar encabezado; retirar relleno fotográfico sin atribución a logros |
| 2 | Filtros, indicadores, navegación | Una franja global ya existe; 10 botones incluyen Territorio | Conservar estructura; excluir Territorio; estabilizar ficha sin agregar botones |
| 2 | Circular de acumulado y vigencias | Barras anuales y cobertura; falta circular válida de acumulado | Conservar cobertura; no activar acumulado sin método oficial |
| 2 | Dos columnas física/financiera | Faltan; hay barras horizontales | Recuperar dos columnas y explicar ambos denominadores |
| 2 | Cinco etapas financieras | Sustituidas por programación/pagos | Recuperar cinco conceptos exactos del Excel; obligaciones no se renombran facturación |
| 2 | Avance por líneas | Tarjetas de conteos | Recuperar barras porcentuales, reporte, año y acceso a metas |
| 2 y 4 | Comparativo de entidades | Ya existen 16 columnas agrupadas con ficha | Conservar y mejorar selección de vigencias sin perder filtros |
| 2 | Circular por estados | Falta | Pendiente de criterios oficiales de riesgo y retraso; no inventar semáforos |
| 2 | Logros, noticias, accesos | No hay noticias certificadas | Accesos funcionales; señalar fuente pendiente; no crear noticias |
| 3 | Programación/avance en columnas | Inicio usa barras pequeñas; Plan suma promedios/4 | Recuperar columnas anuales independientes en Inicio; retirar acumulado artificial |
| 5 | Ficha dinámica | Existe para las 8 entidades | Conservar, corregir regreso al consolidado y correspondencia del filtro |
| 5 | Dos columnas de entidad | Barras pequeñas | Recuperar columnas grandes |
| 5 | Presupuesto por entidad | Existe saldo y pagos | Conservar con cobertura y vigencia explícitas |
| 5 | Gráfica por meta | Falta; hay tarjetas | Recuperar comparación física/pagos por cada meta, desplazable y enlazada a su tarjeta |
| 5 | Tarjetas grandes | Existen | Conservar y ampliar con indicador, unidad, programación física y procedencia |
| 6 | Mapa | Hay pestaña territorial con remisiones | Exclusión intencional; retirar pestaña y remisiones en 3.2; no es una tarea pendiente |

## Fases y comprobaciones

- [x] Fase 0: auditoría completa de fuentes y referencias; importación reproducible conciliada con las 109 filas publicadas (tolerancia de precisión, sin diferencias sustantivas).
- [x] Fase 1: navegación única, sin Territorio ni pestaña adicional al abrir ficha; filtros persistentes.
- [x] Fase 2: Inicio con columnas anuales verificables y cobertura complementaria.
- [x] Fase 3: Dashboard con entidades, dos columnas generales y cinco etapas financieras.
- [x] Fase 4: Plan de Desarrollo analítico sin repetir gráfica de Inicio.
- [x] Fase 5: ficha por entidad con dos columnas y comparativo completo de metas.
- [x] Fase 6: barras y desgloses por líneas, sectores y programas.
- [x] Fase 7: metas e indicadores con campos, unidades y procedencia reales.
- [x] Fase 8: regresión, capturas, Actions y SHA de Vercel iguales a main; publicación verificada de la integración `68d5c25746c717771fe81f91c76e8412e4fac6e3`.

Pendientes documentales: metodología oficial de acumulado; reglas oficiales para estados de riesgo/retraso; certificación y fecha de corte de los avances; facturación si se desea mostrarla como etapa independiente; logros/noticias y fotos atribuibles. Estos faltantes no se resuelven con cifras o textos ilustrativos.

## Evidencia de verificación local

Pruebas de datos: 109 filas conciliadas, 15 hojas, cinco sumas financieras por año, ausencias 2026–2027, unidades y procedencia de todos los indicadores. Pruebas en Chromium: nueve pestañas, cinco filtros y búsqueda, navegación por teclado, persistencia entre vistas, las ocho entidades con sus listas exactas de metas, acceso desde gráfica a tarjeta, tablas analíticas, cinco etapas, campos vacíos y cero informado. Se revisaron capturas de Inicio, consolidado, finanzas, Plan, líneas, ficha de entidad y su comparativo de metas, incluyendo móvil de 390 px y las secciones inferiores. Las nueve vistas no desbordan el documento móvil; las gráficas y tablas amplias se desplazan dentro de su contenedor.

Regresión local aprobada: verificación estática y de estructura; sintaxis de todos los JS; datos Data, UC42, Plan Estadístico, módulos actuales y registro editorial; nueve recursos originales protegidos; smokes de 2.1–2.4, 3.3 y 4.2. El control de huellas detectó inicialmente conversión local de saltos de línea de Windows; se restauraron los bytes exactos de Git en este checkout sin modificar los recursos versionados ni sus huellas. Red: el video remoto global de Supabase no resolvió en este equipo; el portal dispone del respaldo MP4 local verificado. La precarga de un PDF externo a 3.2 puede cancelarse al navegar. No se observaron errores de ejecución del navegador ni fallos de carga de los recursos propios de 3.2.

Las capturas se conservan en `screenshots/asi32-*.png` localmente y el workflow las adjunta al resultado de Actions.

## Publicación comprobada

La [PR 9](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/pull/9) pasó [Actions del candidato](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/actions/runs/44018485234) y pruebas sobre el preview de Vercel `READY` antes de integrarse. El acceso temporal creado para revisar el preview protegido fue revocado después de la prueba.

La integración `68d5c25746c717771fe81f91c76e8412e4fac6e3` quedó en main y en producción con Vercel `READY`, sin error de alias. [Actions de main](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/actions/runs/44018894351) terminó en SUCCESS. Se ejecutó el smoke completo contra [el dominio público](https://territorio-inteligente.vercel.app/#desarrollo?seccion=desarrollo-cumplimos), incluyendo las ocho entidades, filtros, tablas y las nueve vistas móviles: PASS. El ajuste final reserva espacio al encabezado institucional para que la barra fija no oculte su identificación, con una aserción específica y el smoke nuevamente aprobado.

Gráficas disponibles: columnas físicas anuales y cobertura en Inicio; consolidado de entidades, dos medidas de ejecución por vigencia y cinco etapas financieras en Dashboard; matriz de programación y ejecución por línea/año en Plan; barras anuales con desglose en Líneas, Sectores y Programas; dos medidas de ejecución y comparación completa por meta en cada ficha institucional. Las tarjetas grandes y el catálogo de indicadores añaden programación física, unidad y fuente. Una sola estructura global permanece durante toda la navegación.

Las circulares de acumulado y de estados no se activaron sin metodología oficial. Las noticias, logros certificados, fotos atribuibles y la etapa independiente de facturación requieren fuentes adicionales. La página 6 está excluida; no es un faltante. No se publican porcentajes de ejemplo del Word ni ejecución de 2026/2027.

## Cierre de cobertura de todas las hojas

La publicación inicial auditó las 15 hojas, pero solo integró el núcleo de seguimiento de Plan Indicativo y los resúmenes de Acción 2024/2025. Eso no equivalía a tener todo el Excel consultable. La ampliación de cobertura incorpora los contenidos restantes sin crear nuevas pestañas de navegación.

Se preservaron las **60.948 celdas con valor almacenado** de las 15 hojas, incluidos encabezados, filas resumen, actividades, totales y campos auxiliares. Una prueba compara cada hoja, fila, columna y valor del archivo original con la consulta publicada. No hay un límite de filas que descarte contenido: la interfaz pagina de 20 en 20 y permite desplegar todos los campos de cada fila, con su referencia original. El CSV descarga todas las celdas del ámbito consultado, no únicamente la página visible. Los textos que podrían interpretarse como fórmulas en un CSV se escapan al exportar; el valor almacenado permanece visible sin cambios en la consulta.

| Hoja | Dónde se consulta y qué se preserva |
|---|---|
| 1. Resumen | Indicadores → Cobertura: cinco etiquetas originales sin cifras almacenadas; no se rellenan con resultados de otra fuente |
| 2. POAI | Plan de desarrollo: 109 asociaciones meta producto–resultado, indicadores de resultado, línea base y presupuesto por vigencia; todos los campos de la fila quedan accesibles |
| 3. Plan Indicativo | Vistas existentes y consulta completa: programación, financiación por origen, indicadores, articulación ODS, unidades, fuentes y fila de totales |
| 3.1 Plan de Acción 2024 | Cada tarjeta de meta abre sus actividades y soportes; la consulta completa conserva las 584 filas con contenido |
| 3.2 Plan de Acción 2025 | Cada tarjeta abre sus actividades, meses, soportes, población y finanzas; consulta completa de 501 filas con contenido |
| 3.3 Plan de Acción 2026 | Estado explícito de hoja vacía; sin avances inventados |
| 3.4 Plan de Acción 2027 | Estado explícito de hoja vacía; sin avances inventados |
| 4. Contratos Cuatrienio | Metas: consulta contractual específica de este archivo y acceso a sus 109 filas de meta. No hay números de contrato diligenciados en ninguna vigencia; no se cuentan esos espacios como contratos |
| 5. Proyectos Estrategicos | Estado explícito de hoja vacía |
| 6. Gestión | Plan de desarrollo: 17 registros con vigencia y valores de gestión; el total original se conserva en fuente, pero no se suma otra vez a los registros |
| Hoja6 | Plan de desarrollo: 64 filas de contenido posterior al encabezado, con nombres, vigencia, valor estimado, vereda, metros, cooperantes y observaciones. No se afirma que sean 64 proyectos únicos; hay conceptos complementarios e información incompleta. Sin mapa |
| Lista | Plan de desarrollo: las 12 iniciativas originales, sin presentarlas como ejecución o logros certificados |
| Despegable | Indicadores → Cobertura: catálogo original de tipos de compromiso |
| ODS | Indicadores: distribución de metas según ODS consignado y tabla de objetivo/meta ODS; consulta del catálogo original y sus listas auxiliares, sin relacionarlas por posición |
| Formula | Indicadores → Cobertura: catálogos originales de ejes, sectores, programas, organigrama, ODS y financiación; no se interpretan como avance |

El botón «Consultar las 15 hojas y su cobertura» está en Inicio. Las consultas documentales completas conservan el archivo original sin filtros del visor y lo explican en su encabezado. Los listados analíticos POAI/contratos y ODS sí responden a las metas filtradas. Gestión, Hoja6 e iniciativas carecen de número de meta: no se vinculan por inferencia a una línea o responsable. Con filtros de clasificación o búsqueda activos se explica la falta de relación y se ofrece la fuente; con una vigencia seleccionada solo se muestran registros que la identifican. Las iniciativas no tienen vigencia. Los encabezados, totales y registros sin fecha siguen accesibles en la consulta completa.

Hallazgos adicionales: la meta 63 tiene descripción y meta ODS pero no tiene diligenciado el nombre del ODS en Plan Indicativo S; se muestra «ODS no informado», sin completar el campo por inferencia. Los códigos contractuales están vacíos; las hojas de ejecución 2026/2027 y Proyectos Estrategicos están vacías. Esto es ausencia en la fuente, no funcionalidad pendiente de construir.

- [x] Todas las hojas tienen ubicación, tratamiento y consulta completa.
- [x] POAI, Gestión, registros complementarios e iniciativas incorporados a las vistas existentes.
- [x] Actividades y campos originales consultables por meta.
- [x] Contratos del archivo diferenciados de los de otras fuentes de 3.3.
- [x] Articulación ODS por meta y catálogo original accesibles.
- [x] Las 60.948 celdas con valor conciliadas contra el archivo original.
- [x] Quince consultas, paginación hasta la fila 584, descarga CSV y móvil verificados localmente.
- [x] Ampliación de cobertura verificada en Actions y dominio público: integración `79ef37915f48a31b410dc683a961252e6bd0a7af`, Vercel READY y smoke completo aprobado sobre el dominio público.

La [PR 10](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/pull/10) pasó [Actions del candidato](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/actions/runs/44021005504), revisión del preview protegido y [Actions de main](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/actions/runs/44021221954). El smoke de producción comprobó las quince hojas, las descargas, el acceso por meta, POAI, paginación hasta la última fila y móvil, junto con las comprobaciones anteriores del visor. El acceso temporal al preview fue revocado tras la revisión. Las capturas adicionales de cobertura, POAI y consulta de fuentes quedan en el artefacto de Actions y en `screenshots/asi32-*.png`.

La integración del contenido del Excel puede cerrarse sin afirmar que los datos vacíos estén completos o que se hayan certificado resultados. Continúan las limitaciones documentales ya identificadas sobre acumulados oficiales, estados de riesgo, noticias y logros certificados.

## Cierre de recuperación del Word — revisión 17/11/2026

La [matriz individual de cobertura](ASI32_COBERTURA_WORD.md) registra los elementos útiles de las páginas 1–5: función, ubicación, fuente/vigencia, diferencia, acción, estado y evidencia. Los estados y publicaciones anteriores de este documento son históricos; para el alcance final del Word prevalece esa matriz y esta actualización.

Novedades verificadas localmente: cinco documentos PDF de cuatro responsables recuperados desde enlaces de la matriz y leídos; una publicación municipal fechada y un directorio real de atención ciudadana; filtros de resultados por meta/año sin atribuciones inferidas; nombre completo de Gobierno con alias original preservado; fuentes pendientes individualizadas; controles desplegables con contraste revisado; accesos rápidos funcionales. La noticia conserva el 28/08/2025, y los informes no se presentan como noticias recientes o logros globales certificados.

La auditoría reproducible de metodología (`scripts/audit_asi32_methodology.py`) inspeccionó fórmulas, caché, formatos condicionales, nombres y criterios. Diferenció 35 metas acumulativas/74 no acumulativas y 37 de incremento/72 de mantenimiento. Las fórmulas de actividades no definen el acumulado entre metas y años. No se encontró regla oficial de estados de riesgo. La explicación y los requisitos concretos están en la interfaz y en la matriz de cobertura.

- [x] Páginas 1–5 revisadas visualmente y elementos individualmente localizados.
- [x] Datos, cinco etapas financieras y 60.948 celdas originales preservados y conciliados.
- [x] Resultados documentales atribuibles, fechas y alcance revisados; cinco PDF con enlaces públicos comprobados.
- [x] Noticia original y acceso ciudadano verificados, sin inventar relación con una meta.
- [x] Nueve vistas, ocho entidades, filtros, búsqueda, regreso, CSV, quince consultas, últimas filas y móvil: PASS local.
- [x] Regresión de Data 2.1–2.4, Plan de Acción 3.3 y Cumplimiento4.2: PASS local.
- [x] Sintaxis, estructura, integridad de nueve fuentes críticas y registro editorial: PASS local.
- [x] Capturas de Inicio, Dashboard, Plan, Líneas, ficha, gráfico completo de metas, metodología, resultados, noticia, fuentes pendientes y móvil conservadas; workflow ampliado para adjuntar las nuevas.
- [x] Candidato: Actions SUCCESS y Vercel READY, verificados antes de integrar.
- [x] Publicación: SHA de main igual al dominio público y smoke completo de producción aprobado.
- [ ] Acumulado oficial y corte certificado: fuente pendiente; no activados.
- [ ] Estados de riesgo/retraso: criterio oficial pendiente; circular no activada.
- [ ] Facturación independiente: registro y definición pendientes; obligaciones conservadas.
- [ ] Fotos atribuibles, certificación de logros globales y distintivo fiscal: soportes pendientes.

El mapa de la página6 y su acceso rápido están excluidos, sin anotarlos como un pendiente. La recuperación con fuentes disponibles puede publicarse; **el Word no se declara completo al100 %** mientras falten los soportes anteriores. El informe identifica exactamente qué fuente activa cada componente y distingue las adaptaciones de las gráficas todavía no implementadas.

### Publicación de este cierre, comprobada el 17/11/2026

La [PR11](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/pull/11) integró el cambio funcional `246ad01d6ddfece5d99f6e7cae204215eccc044d` después de [Actions SUCCESS del candidato](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/actions/runs/44028956641) y prueba del preview Vercel READY. La prueba comprobó además los cinco documentos, la publicación con su fecha, el destino ciudadano, el contraste de metodología y la ausencia de documentos/noticias al seleccionar2026. El acceso temporal se revocó al terminar.

La integración `6df7e21e3f7dc493a75d6474545bfed9716d9a28` pasó [Actions de main](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/actions/runs/44029153095). El dominio [territorio-inteligente.vercel.app](https://territorio-inteligente.vercel.app/#desarrollo?seccion=desarrollo-cumplimos) apuntó a ese mismo SHA en Vercel READY, sin error de alias, despliegue `dpl_H9k9yBscYtQXz7B5pptXZvT37jVE`. El smoke completo se repitió contra ese dominio y terminó en PASS: navegación, filtros, fechas/alcance editorial, ocho entidades y metas exactas, comparativos, cobertura de las quince hojas, última fila, CSV y nueve vistas móviles. Esta actualización posterior solo documenta la evidencia observada, sin modificar la aplicación.

Capturas reales del smoke de producción: `screenshots/asi32-inicio-desktop.png`, `asi32-consolidado-desktop.png`, `asi32-plan-desktop.png`, `asi32-lineas-desktop.png`, `asi32-secretaria-desktop.png`, `asi32-metas-entidad-desktop.png`, `asi32-metas-entidad-mobile.png`, `asi32-metodologia-desktop.png`, `asi32-resultados-desktop.png`, `asi32-resultados-mobile.png`, `asi32-publicaciones-desktop.png`, `asi32-fuentes-pendientes-desktop.png`, `asi32-cobertura-excel-desktop.png`, `asi32-poai-desktop.png` y `asi32-fuentes-mobile.png`. Actions adjunta las capturas al artefacto de esta sección. Los componentes nuevos se revisaron visualmente en escritorio y móvil; los desplegables quedaron legibles, sin texto blanco sobre fondo blanco.

Durante las pruebas de este equipo no resolvió el host del video remoto global de Supabase; existe el respaldo MP4 local y su integridad se comprobó. También se registraron cancelaciones de precargas al navegar. No se observaron excepciones de ejecución de 3.2 ni errores de carga de sus nuevos datos o módulos. Esta limitación externa preexistente no se presenta como un resultado documental pendiente del Word.
