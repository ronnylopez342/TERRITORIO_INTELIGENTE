# Cobertura del Word: Así cumplimos 3.2

Revisión: 17 de noviembre de 2026. Esta matriz complementa, y para el cierre del Word sustituye, el resumen inicial de `ASI_CUMPLIMOS_32_FASES.md`. El mapa de la página 6 está excluido. **La implementación disponible no equivale al 100 % de las visualizaciones del Word**: siguen pendientes el acumulado oficial, los estados de riesgo, facturación independiente, fotografías atribuibles, certificación de logros y el distintivo fiscal de portada.

Se inspeccionaron visualmente las imágenes originales de las cinco páginas. Las páginas 2–5 son referencias de diseño con cifras ilustrativas de 2026 y horizonte 2024–2028. La fuente de seguimiento es el Excel 2024–2027, con ejecución almacenada en 2024 y 2025. No se trasladan las cifras del diseño.

## Fuentes y comprobaciones

| Clave | Fuente y alcance |
|---|---|
| W | ASI CUMPLIMOS.docx; SHA256 `5d850ae027c9ac0c6e541a83fd8da4405641c31dcfe1dbc142264987bd6eb324`. Páginas 1, 2, 3, 4 y 5: imágenes image1, image2, image5, image6 e image7 del adjunto |
| PI | Matriz de Control Cuatrienio 2024–2027; SHA256 `09a2cf3a3d2f9527c88b74511a8920ef492fce493e9c8d6186202bb3efbeeac2`. Hoja 3. Plan Indicativo: clasificación A:N, indicador K:L, meta N, tipo P, ODS S:U, acumulación V, programación física y presupuesto anual |
| PA | Hojas 3.1 Plan de Acción 2024 y 3.2 Plan de Acción 2025. Filas resumen por meta: físico AG/AP; finanzas AI:AM/AR:AV. Las actividades conservan sus campos originales y enlaces de soporte. Hojas 2026/2027 vacías |
| X15 | Archivo completo: 15 hojas y 60.948 celdas con valor; consulta y CSV con referencia hoja–fila–columna. El archivo y el modelo analítico no se modificaron en este cierre |
| D | Cinco PDF leídos en carpetas enlazadas desde PA 2025; entidad, actividad, periodo y procedencia en `data/asi-cumplimos-32-evidencias.json`. Su fecha no cambia el corte del Excel |
| N | Publicación municipal del 28/08/2025 y directorio de atención; enlaces originales en el mismo JSON. No hay correspondencia acreditada con una meta |
| T | `scripts/test_asi_cumplimos32.cjs`: cifras, tipos, ausencias, fechas, documentos y separación de conceptos |
| B | `scripts/smoke_asi_cumplimos32.cjs`: interacción Chromium, nueve vistas, ocho entidades, filtros, todas las hojas, CSV, paginación y móvil; mismo recorrido disponible sobre el dominio público |
| C | `scripts/test_asi32_excel_coverage.py`: comparación independiente de cada celda con el libro original |
| M | `scripts/audit_asi32_methodology.py`: auditoría reproducible de fórmulas, valores almacenados, formatos condicionales, nombres definidos y criterios textuales del Excel |

Las capturas citadas son archivos `screenshots/asi32-*.png`, conservados también en el artefacto **evidencia-asi-cumplimos-32** de Actions. «Prueba» verifica comportamiento y datos; una captura no demuestra por sí sola la fórmula o la procedencia.

## Página 1: identidad y portada

| ID / elemento | Función | Ubicación actual | Fuente / vigencia | Diferencia detectada | Acción realizada o necesaria | Estado final | Prueba y captura |
|---|---|---|---|---|---|---|---|
| 1.01 Identidad municipal / Así cumplimos | Identificar municipio y sección | Cabecera compacta de 3.2 y cabecera global | W; municipio del portal; PI 2024–2027 | Portada grande repetía contenido | Conservar una identificación compacta y visible bajo la barra fija | Adaptado y verificado, con explicación | B: una cabecera, altura y posición; `asi32-inicio-desktop.png` |
| 1.02 Collage fotográfico de obras y comunidad | Dar contexto a resultados concretos | Inicio → disponibilidad de fotografías | W sin originales atribuibles | Imagen compuesta sin autor, fecha o relación de meta verificable | Solicitar originales con autorización, fecha, lugar y meta; no usar fotografías genéricas | Pendiente de fuente identificada | B: no collage antiguo; estado visible; `asi32-inicio-desktop.png` |
| 1.03 Distintivo fiscal #1 Cundinamarca 2024 | Acreditar reconocimiento | Inicio → Reconocimiento fiscal de la portada | W; consulta pública DNP revisada, sin tabla/certificación incorporable | El diseño no certifica posición ni universo comparado | Obtener tabla oficial IDF 2024 con puntaje, universo y regla de clasificación o certificación del puesto | Pendiente de fuente identificada | JSON `reconocimiento`; estado visible; `asi32-inicio-desktop.png` |

## Página 2: estructura, controles, indicadores y módulos

| ID / elemento | Función | Ubicación actual | Fuente / vigencia | Diferencia detectada | Acción realizada o necesaria | Estado final | Prueba y captura |
|---|---|---|---|---|---|---|---|
| 2.01 Cabecera institucional con horizonte | Identificar el visor y periodo | Cabecera única de 3.2 | PI 2024–2027 | W dice 2024–2028 | Corregir horizonte a la matriz, sin duplicar encabezados | Adaptado y verificado, con explicación | T/B; `asi32-inicio-desktop.png` |
| 2.02 Buscador | Localizar metas, códigos o clasificación | Búsqueda compartida, junto a filtros | PI y catálogo real | Búsqueda se aplica al conjunto de vistas relacionadas | Mantener búsqueda y persistencia, sin segundo buscador interno | Implementado y verificado | B: búsqueda, resultados y cambio de pestaña; `asi32-inicio-desktop.png` |
| 2.03 Campana / selector «Ciudadano» | Contexto de acceso público | Identificación pública del portal y ayuda metodológica de 3.2 | W, sin cuentas ni notificaciones en las fuentes | Son accesorios del mockup, sin información o servicio autenticado definido | Adaptar al visor público; no simular mensajes, cuentas o permisos. No constituyen un sistema de notificaciones implementado | Adaptado y verificado, con explicación | B: portal accesible sin sesión; `asi32-inicio-desktop.png` |
| 2.04 Vigencia | Elegir periodo de análisis | Filtro global | PI/PA 2024–2027 | W incluye 2028 y ejemplos 2026 | Predeterminado todo el cuatrienio; 2026/27 conservan «sin reporte» | Adaptado y verificado, con explicación | B: all/2024/2025/2026; `asi32-inicio-desktop.png` |
| 2.05 Línea estratégica | Acotar metas | Filtro global | PI; seis líneas | W ilustra cinco | Mantener catálogo real y relación por meta | Implementado y verificado | T/B: seis líneas y filtros persistentes; `asi32-lineas-desktop.png` |
| 2.06 Sector | Acotar metas | Filtro global | PI; 19 sectores | W ilustra 18 | Usar clasificación original | Implementado y verificado | T/B: 19 sectores |
| 2.07 Programa | Acotar metas | Filtro global | PI; 29 programas | W ilustra 45 | Usar programas únicos de la fuente | Implementado y verificado | T/B: 29 programas |
| 2.08 Dependencia | Acotar responsable | Filtro global | PI; ocho responsables | Alias corto/largo de Gobierno | Unir por meta y normalizar únicamente la presentación de ficha | Implementado y verificado | T/B: listas exactas de las ocho entidades; `asi32-secretaria-desktop.png` |
| 2.09 Aplicar filtros | Actualizar resultados | Actualización inmediata de filtros globales | PI/PA/D/N | No se necesita un segundo paso manual | Aplicación automática; documentos solo de metas/vigencia seleccionadas; noticias sin meta no se asignan por inferencia | Adaptado y verificado, con explicación | B: filtros, resultados documentales y ausencia en 2026 |
| 2.10 Limpiar | Restaurar selección | Botón global de limpieza | Estado del visor | Debe recuperar todo el cuatrienio | Restablecer filtros y búsqueda; navegación conservada | Implementado y verificado | B: limpieza y selección `all` |
| 2.11 KPI metas | Contar metas únicas | Franja global de indicadores | PI N: 109 | No contar actividades ni iniciativas | Conteo único de metas de la selección | Implementado y verificado | T/B: 109 |
| 2.12 KPI líneas | Contar líneas | Misma franja global | PI: seis | Ejemplo W: cinco | Mostrar seis reales y responder a filtros | Adaptado y verificado, con explicación | T/B: seis |
| 2.13 KPI sectores | Contar sectores | Misma franja global | PI: 19 | Ejemplo W: 18 | Mostrar 19 reales | Adaptado y verificado, con explicación | T/B: 19 |
| 2.14 KPI programas | Contar programas | Misma franja global | PI: 29 | Ejemplo W: 45 | Mostrar 29 reales | Adaptado y verificado, con explicación | T/B: 29 |
| 2.15 KPI entidades | Contar responsables | Misma franja global | PI: ocho | Sin diferencia numérica | Mantener ocho y conteo filtrado | Implementado y verificado | T/B: ocho |
| 2.16 KPI presupuesto cuatrienal | Mostrar programación | Misma franja global | PI: sumas anuales, ~97,6 mil millones COP | W ilustra $3,91 billones | Identificar Plan Indicativo; no sumar POAI ni etapas financieras | Adaptado y verificado, con explicación | T: conciliación PI; B: KPI real |
| 2.17 Inicio / Dashboard / Plan | Navegar sin duplicaciones | Tres primeras pestañas horizontales | PI/PA | Sidebar vertical en W | Conservar nueve pestañas compartidas; una activa y sin reconstruir otra navegación | Adaptado y verificado, con explicación | B: nueve vistas, un nav; `asi32-inicio-desktop.png` |
| 2.18 Líneas estratégicas | Comparar y profundizar | Pestaña Líneas estratégicas | PI/PA | En W también aparece un resumen en Inicio | Una gráfica de barras por línea y año con acceso a metas, sin duplicarla en Inicio | Adaptado y verificado, con explicación | B: seis grupos, 24 filas analíticas; `asi32-lineas-desktop.png` |
| 2.19 Sectores | Analizar clasificación sectorial | Pestaña Sectores | PI/PA | W lo muestra como submenú | Barras, presupuesto, cobertura y acceso a metas con la misma navegación | Adaptado y verificado, con explicación | B: 19 grupos y desglose anual |
| 2.20 Programas | Analizar programas | Pestaña Programas | PI/PA | W lo muestra como submenú | Barras, presupuesto, cobertura y acceso a metas | Adaptado y verificado, con explicación | B: 29 grupos y desglose anual |
| 2.21 Metas | Consultar detalle completo | Pestaña Metas y tarjetas enlazadas | PI/PA/X15 | Debe conservar datos originales, no solo un total | Código, indicador, unidades, programación, reporte, actividades, ODS y procedencia | Implementado y verificado | T/B: 109 metas y consulta por meta |
| 2.22 Indicadores | Consultar metodología y fuentes | Pestaña Indicadores | PI K:L; X15 | 14 códigos de resumen PA difieren de PI | Catálogo PI explícito; unión de seguimiento por número de meta | Implementado y verificado | T/B: 109 indicadores, ODS y 15 hojas; `asi32-cobertura-excel-desktop.png` |
| 2.23 Plan de Acción | Acceder al módulo relacionado | Acceso funcional a 3.3 desde 3.2 | Módulo vigente 3.3, fuente independiente | No incorporar sus contratos a la matriz de 3.2 | Mantener destino real y separación de fuentes | Adaptado y verificado, con explicación | B y smoke de regresión 3.3 |
| 2.24 Dependencias | Entrar a cada ficha | Pestaña Dependencias; clic en gráfica ejecutiva | PI/PA | Sin una décima pestaña al abrir ficha | Ocho responsables y regreso con filtros | Implementado y verificado | B: las ocho listas exactas |
| 2.25 Gestión financiera | Acceder al análisis presupuestal | Dashboard ejecutivo → cinco etapas | PA AI:AM / AR:AV | No abrir otra navegación para los mismos datos | Integrar gráfica completa en Dashboard | Adaptado y verificado, con explicación | T/B; `asi32-finanzas-desktop.png` |
| 2.26 Analítica comparativa | Comparar entidades | Dashboard ejecutivo | PA 2024/2025 | W tiene resumen horizontal y gráfica completa en p.4 | Un comparativo agrupado; tabla solo complementaria | Adaptado y verificado, con explicación | B: ocho grupos / 16 columnas; `asi32-consolidado-desktop.png` |
| 2.27 Logros y evidencias | Leer resultados con soporte | Inicio y ficha institucional → Resultados y documentos de seguimiento | D: cinco PDF, cuatro responsables | Había un aviso genérico sin documentos leídos | Publicar resúmenes atribuibles y alcance, enlace PDF y acceso a meta; no titularlos «logros certificados» | Adaptado y verificado, con explicación | T/B: cinco, fechas, entidad exacta y cero en 2026; `asi32-resultados-desktop.png` |
| 2.28 Rendición de cuentas | Consultar respaldo de gestión | Resultados documentados + consulta de las fuentes | D/PA/X15 | Los cinco soportes no son un informe anual de rendición aprobado | Adaptación limitada a consulta documental de gestión, identificada como tal; no se anuncia una rendición oficial ni aprobación ciudadana | Adaptado y verificado, con explicación | B: enlaces de soporte y procedencia; `asi32-resultados-desktop.png` |
| 2.29 Datos abiertos | Consultar / descargar datos | Indicadores → 15 hojas; CSV de metas | X15 | No crear otra copia incompleta | Consulta completa y descarga del ámbito entero, no solo página visible | Implementado y verificado | C/B: 60.948 celdas, paginación final y CSV; `asi32-fuentes-desktop.png` |
| 2.30 Documentos | Abrir soportes y fuente por meta | Cinco PDF en Inicio/fichas; originales en Metas/Indicadores | D/X15 | Antes solo había enlaces sin curaduría | Resumen leído, fecha documental y procedencia verificable | Adaptado y verificado, con explicación | T/B; `asi32-resultados-desktop.png` |
| 2.31 Ayuda / iconos de información | Explicar lectura y límites | Notas visibles, metodología desplegable y procedencia | PI/PA/M | W usa iconos de información | Explicaciones junto al dato; desplegables legibles y operables | Adaptado y verificado, con explicación | B: abrir metodología y contraste; `asi32-metodologia-desktop.png` |
| 2.32 Circular de avance acumulado | Expresar cumplimiento cuatrienal | Inicio → alcance anual/acumulado; gráfica circular no activada | PI P/V; PA AG/AP; M | No se encontró agregación institucional entre metas y años | Obtener fórmula, pesos, cantidades ejecutadas, corte y blancos; no sustituir esta circular por tarjetas | Pendiente de fuente identificada | M/T/B; `asi32-metodologia-desktop.png` |
| 2.33 Barras por vigencia al lado del circular | Leer avance de cada año | Inicio → columnas anuales | PA AG/AP; promedios simples | W mezcla 2028 y cifras ilustrativas | Cuatro columnas independientes, conteo de reportes, sin sumar promedios | Adaptado y verificado, con explicación | T/B: 103 y 108 reportes; `asi32-inicio-desktop.png` |
| 2.34 Fecha de corte | Conocer vigencia del reporte | Notas de fuente en todas las gráficas; fecha de documentos en fichas | PA almacenado y D | El corte 14/11/2026 del W no está certificado por la matriz | Mostrar año de fuente; no usar fecha de revisión como corte de ejecución. Falta certificación institucional del corte para un acumulado oficial | Pendiente de fuente identificada | M/B: años reales, sin ejecución 2026 |
| 2.35 Dos columnas física/presupuestal | Comparar medidas distintas | Dashboard y ficha por entidad | PA AG/AP; pagos/saldo de metas con ambos valores | W ilustra ejecución 2026 | Dos columnas por año, escala y denominadores explícitos | Adaptado y verificado, con explicación | T/B; `asi32-ejecucion-entidad-desktop.png` |
| 2.36 Cinco columnas financieras | Diferenciar etapas reales | Dashboard → Gestión financiera | PA AI:AM / AR:AV | W usa Apropiación/RPC/Facturado; Excel tiene saldo/CDP/RP/obligaciones/pagos | Conservar cinco columnas, valores y nombres reales; no sumar etapas entre sí | Adaptado y verificado, con explicación | T/B: cinco sumas por año; `asi32-finanzas-desktop.png` |
| 2.37 Facturado | Medir facturación independiente | Dashboard → fuente pendiente de facturación | Campo inexistente en matriz | Obligaciones no equivale a facturas | Obtener registro de facturas por meta/año, ID, fecha, importe y relación RP/obligación/pago y definición | Pendiente de fuente identificada | T/B: obligaciones conservadas; `asi32-fuentes-pendientes-desktop.png` |
| 2.38 Barras por línea + Ver detalle | Comparar líneas y acceder a metas | Líneas estratégicas, con desglose anual | PI/PA | No repetir el mismo resumen de Inicio | Mantener gráfica completa en su pestaña y detalle real por meta | Adaptado y verificado, con explicación | B: barras, 6 líneas y drilldown; `asi32-lineas-desktop.png` |
| 2.39 Barras por secretaría + Ver detalle | Comparar responsables | Dashboard, misma gráfica de p.4 | PA; año elegido o último reportado | Evitar duplicar resumen horizontal y agrupado con igual finalidad | Usar gráfico completo de 16 columnas, tabla desplegable y ficha | Adaptado y verificado, con explicación | B; `asi32-consolidado-desktop.png` |
| 2.40 Circular por estado / leyenda / conteos | Clasificar avance, riesgo, rezago | Dashboard → Metas en avance, riesgo o retraso | M: sin regla oficial encontrada | Un porcentaje aislado no determina riesgo o retraso | Obtener umbrales, cronograma, avance esperado al corte y reglas de blancos/futuros, o estados validados por meta/año | Pendiente de fuente identificada | M/B: aviso individual y criterio exacto; `asi32-fuentes-pendientes-desktop.png` |
| 2.41 Últimos logros / Ver todos | Leer actividades y resultados | Inicio y fichas por responsable | D 2025, con referencia expresa a hecho 2024 en meta105 | Programación no es ejecución; acto de apertura no es entrega | Cinco fichas documentales con alcance delimitado. Certificación de logros globales requiere soporte adicional | Adaptado y verificado, con explicación | T/B; `asi32-resultados-desktop.png` |
| 2.42 Fotografías de vías, educación y agua | Ilustrar resultados atribuibles | Inicio → disponibilidad de fotografías | W sin originales acreditados | No se comprueba identidad de obra/personas o permiso | Archivo, autor/autorización, fecha, lugar y vínculo a meta | Pendiente de fuente identificada | B: no fotos de relleno; `asi32-inicio-desktop.png` |
| 2.43 Noticias / actualizaciones / Ver todas | Leer publicaciones institucionales | Inicio → Publicaciones institucionales | N, 28/08/2025 | Faltaba contenido editorial verificable | Incorporar publicación municipal real con fecha y enlace; estado vacío al filtrar 2026 o metas sin relación acreditada | Adaptado y verificado, con explicación | T/B; `asi32-publicaciones-desktop.png` |
| 2.44 Acceso Consulta de Metas | Entrar al catálogo | Inicio → Accesos rápidos | PI | Debía conservar filtros | Botón a pestaña Metas | Implementado y verificado | B: clic y pestaña activa |
| 2.45 Acceso Descarga de Datos | Obtener datos completos | CSV general y consulta de 15 hojas vía Indicadores y fuentes | PI/PA/X15 | La descarga no debe limitarse a 20 filas visibles | CSV del ámbito seleccionado; CSV completo de consulta original | Implementado y verificado | B: contenido y descarga, últimas filas |
| 2.46 Acceso Informes PDF | Abrir documentos legibles | Botones Leer documento PDF en resultados | D | No hay un único informe oficial compilado en las fuentes | Acceso directo a cinco PDF reales; no generar un informe que se presente como certificado | Adaptado y verificado, con explicación | D/T/B; `asi32-resultados-desktop.png` |
| 2.47 Acceso Mapa de Inversiones | Ver componente territorial | No existe en 3.2 | Exclusión expresa | En W aparece también como acceso rápido | Mantener excluido, sin remisión disfrazada ni pendiente | Excluido expresamente por el usuario | B: cero pestañas Territorio |
| 2.48 Acceso Comparar Entidades | Abrir gráfico comparativo | Inicio → Comparar entidades | PI/PA | Debía ser un acceso real | Botón a Dashboard con filtros persistentes | Implementado y verificado | B: navegación y gráfico |
| 2.49 Acceso Participa Ciudadano | Orientar a contacto institucional | Inicio → Canales de atención ciudadana | N: directorio municipal verificado | No hay foro ni formulario propio definido | Enlazar directorio externo real y explicar alcance; no simular un envío | Adaptado y verificado, con explicación | T/B: destino exacto; fuente externa abierta y leída |

## Página 3: programación y avance

| ID / elemento | Función | Ubicación actual | Fuente / vigencia | Diferencia detectada | Acción realizada o necesaria | Estado final | Prueba y captura |
|---|---|---|---|---|---|---|---|
| 3.01 Columna verde 100 % | Dar referencia de cumplimiento | Inicio → gráfica principal | Escala anual, no presupuesto | En W se compara programación con acumulado | Conservar columna de referencia, rotulada «Escala, no ejecución» | Adaptado y verificado, con explicación | B: referencia explícita; `asi32-inicio-desktop.png` |
| 3.02 Columna apilada por vigencias | Representar avance cuatrienal acumulado | No activada; explicación en Inicio | PI/PA/M | 69,89 % del W no puede reproducirse con metodología acreditada | Obtener agregación oficial y cantidades; las columnas anuales independientes no se declaran equivalentes al apilado | Pendiente de fuente identificada | M/T/B; `asi32-metodologia-desktop.png` |
| 3.03 Leyenda, valores y años | Leer componentes sin confundir ausencia/cero | Inicio → columnas y cobertura anual | PA 2024/25; vacíos 2026/27 | W usa colores/cifras ilustrativas | Valores legibles, colores por año y sin reporte explícito | Adaptado y verificado, con explicación | T/B; `asi32-inicio-mobile.png` |

## Página 4: comparación completa de entidades

| ID / elemento | Función | Ubicación actual | Fuente / vigencia | Diferencia detectada | Acción realizada o necesaria | Estado final | Prueba y captura |
|---|---|---|---|---|---|---|---|
| 4.01 Grupos de dos columnas por entidad | Comparar físico y presupuesto | Dashboard, único comparativo institucional | PA AG/AP y pagos/saldo | W ilustra 2026 sin fuente real | Ocho grupos, 16 columnas; por defecto último año reportado 2025, selección anual explícita | Adaptado y verificado, con explicación | T/B; `asi32-consolidado-desktop.png` |
| 4.02 Eje, valores y leyenda | Entender escala y medidas | Misma gráfica | PA; escala base0 hasta máximo ≥100 % | Las medidas tienen distintos denominadores | Leyenda física promedio / pagos-saldo, porcentajes y escala compartida | Implementado y verificado | B: dos elementos de leyenda y valores; captura anterior |
| 4.03 Nombres completos y número de metas | Identificar responsables | Misma gráfica y tabla complementaria | PI y alias PA | Etiquetas largas no deben cortarse | Etiquetas completas, contenedor desplazable en móvil | Implementado y verificado | B: ocho entidades; `asi32-consolidado-mobile.png` |
| 4.04 Selección de entidad | Profundizar en las metas correctas | Clic en grupo abre ficha | PI N/responsable | La ficha no debe añadir otra pestaña | Activar Dependencias y regresar a origen conservando filtros | Implementado y verificado | B: ocho conjuntos exactos, regreso |

## Página 5: ficha institucional

| ID / elemento | Función | Ubicación actual | Fuente / vigencia | Diferencia detectada | Acción realizada o necesaria | Estado final | Prueba y captura |
|---|---|---|---|---|---|---|---|
| 5.01 Nombre e identidad institucional | Identificar la ficha | Dependencias → ocho fichas | PI y PA; Gobierno corto/largo | PI utiliza «Secretaría de Gobierno» | Mostrar «Secretaría General y de Gobierno» y conservar nota del alias original | Adaptado y verificado, con explicación | T/B: nombre por responsable; `asi32-secretaria-desktop.png` |
| 5.02 Fotografías de entidad / actividades | Ilustrar actividad concreta | Disponibilidad de fotografías en Inicio, compartida por las fichas | W/D sin originales atribuibles publicables | No inferir permiso o identidad desde collage/PDF | Obtener originales, autor/autorización, fecha, lugar, meta y entidad | Pendiente de fuente identificada | Sin fotos genéricas; capturas Inicio y ficha |
| 5.03 Conteos de líneas, sectores, programas y metas | Explicar alcance de entidad | Ficha → conteos propios de la selección | PI | No copiar los números de ejemplo | Calcular del subconjunto exacto de metas; franja global permanece única | Implementado y verificado | T/B: ocho conjuntos; `asi32-secretaria-desktop.png` |
| 5.04 Dos columnas ejecución física / financiera | Comparar medidas de entidad | Ficha → ejecución por vigencia | PA; promedio informado y pagos/saldo | W ilustra otra vigencia | Gráfica de dos columnas por año, sin sumar porcentajes | Adaptado y verificado, con explicación | T/B; `asi32-ejecucion-entidad-desktop.png` |
| 5.05 Presupuesto asignado | Mostrar recursos y contexto | Ficha → programación, saldo y pagos | PI separado de PA | No mezclar programación con saldo, compromisos o pagos | Etiquetas, vigencia, cobertura y fuente diferenciadas | Implementado y verificado | T/B; `asi32-secretaria-desktop.png` |
| 5.06 Logros y resultados de Gobierno | Explicar acciones verificables | Ficha → Resultados y soportes; documentos abajo de la gráfica | D; dos documentos Gobierno y tres de otros responsables | Aviso genérico no aportaba evidencia | Mostrar únicamente soportes de sus metas/año; vacíos explicados para otras selecciones | Adaptado y verificado, con explicación | B: conteo por las ocho entidades; `asi32-resultados-desktop.png` |
| 5.07 Gráfica completa por meta | Comparar todas las metas de entidad | Ficha → gráfico agrupado de metas | PI/PA por ID de meta | Tarjetas no sustituyen esta gráfica | Dos series por meta, etiquetas, desplazamiento interno; clic dirige a tarjeta | Implementado y verificado | B: gráfico completo y clic; `asi32-metas-entidad-desktop.png`, `asi32-metas-entidad-mobile.png` |
| 5.08 Tarjetas grandes de metas | Leer indicador y seguimiento | Ficha debajo de gráfico/documentos | PI/PA/X15 | Necesitan unidad, programación y procedencia | Conservar detalle ampliado, actividades originales, ODS y fuentes por meta | Implementado y verificado | T/B: campos originales, unidad y origen |
| 5.09 Regreso al consolidado | Mantener contexto de consulta | Botón Volver de ficha | Estado del visor | No debe perder filtros ni año | Restaurar pestaña de entrada y conservar selección | Implementado y verificado | B: regreso y filtro persistente |

## Exclusión de página 6

| ID / elemento | Función | Ubicación actual | Fuente / vigencia | Diferencia detectada | Acción | Estado final | Prueba |
|---|---|---|---|---|---|---|---|
| 6.01 Mapa territorial y accesos al mapa | Localizar inversiones | Ausente en 3.2 por instrucción | Exclusión del usuario | No es una carencia documental ni una fase futura | No construirlo ni remitir al mapa de 4.2 para simularlo | Excluido expresamente por el usuario | B: nueve pestañas, cero Territorio; regresión 4.2 permanece sin cambios |

## Qué se completó en este cierre

- Se auditó la metodología en fórmulas, formatos condicionales, nombres definidos y textos, en lugar de deducir un acumulado desde promedios.
- Se incorporaron cinco documentos de cuatro responsables, leídos y con permisos públicos de lectura comprobados. No se divulgan los relatos de casos personales del soporte social ni se reproducen fotografías.
- Se incorporó una noticia municipal real y un directorio ciudadano verificable; se distinguieron de los informes de seguimiento.
- Se individualizaron los faltantes documentales en la interfaz y se mejoró el acceso a Metas, comparativo, fuentes y Planes de Acción.
- Se corrigió la presentación del nombre de Gobierno, manteniendo la denominación original en su procedencia.
- Se amplió la prueba funcional a los documentos, las fechas precisas, la pertenencia de cada entidad, ausencia de contenido 2026 y contraste de los desplegables.

## Cálculos, hallazgos metodológicos y límites

PI contiene **35 metas acumulativas y 74 no acumulativas**, además de **37 de incremento y 72 de mantenimiento**. Las dos clasificaciones no son intercambiables. La auditoría encuentra 7.704 fórmulas en PI, 101 en Acción2024 y 588 en Acción2025. No hay reglas de formato condicional en esas tres hojas, y los nombres definidos son catálogos, no una fórmula de cumplimiento global.

Ejemplos originales: Acción2024 AG3 `((AF4*AE4)/Y4)`; Acción2025 AP3 `((AK4*Q4)/T4)+((AK5*Q5)/T5)`. Calculan seguimiento anual a actividades según sus columnas de ponderación/programación. No acreditan cantidades ejecutadas del indicador producto ni ponderación común entre metas y años. Los porcentajes almacenados se conservan como reportados. El promedio simple solo incluye valores numéricos de la selección; no es un acumulado ni un resultado oficial certificado. No se asigna 25 % a cada año ni se suman promedios.

La búsqueda textual encuentra 181 menciones amplias de «riesgo», asociadas a sectores, ODS y gestión del riesgo, **sin criterios estrictos de semáforo, umbral, rezago, retraso, ponderación global o acumulado**. Esto no prueba que la institución carezca de metodología: indica que no está documentada en las fuentes inspeccionadas. Hay 21 resultados textuales en resúmenes AH2024; AQ2025 está vacío. Los resultados originales siguen consultables por meta; no son automáticamente noticias, fotografías o certificados.

Finanzas, millones COP visibles; cálculos en valores originales: saldo definitivo, CDP, RP, obligaciones, pagos. Totales 2024: `13063984853.36; 11874985552.67; 11874985552.67; 11759485552.67; 11520781967.57`. Totales 2025: `18363274897; 14840016603; 6998238041.64; 2235061772.86; 2224991233.86`. El cociente financiero incluye las mismas metas con saldo y pagos numéricos, y exige denominador positivo. No suma etapas entre sí. El presupuesto del KPI procede de PI; POAI conserva su propia programación, incluso cuando difiere.

Los 109 espacios de meta de la hoja contractual no son 109 contratos: sus identificadores están vacíos. Las 64 filas de contenido de Hoja6 no son 64 proyectos únicos. Las 12 iniciativas de Lista no son logros. El total original de Gestión no se vuelve a sumar a sus registros. La meta63 conserva «ODS no informado» donde la fuente no tiene nombre. Estos controles anteriores se mantienen.

## Evidencia editorial y documental recuperada

| Meta / responsable | Fuente y fecha comprobada | Afirmación publicada / límite |
|---|---|---|
| 3 / Gobierno / actividad3.1 | [Plan de desarrollo abril](https://drive.google.com/file/d/1rEJpTKhgP_twMdGIrshjy4MYCqcv-O7D/view), 30/04/2025; PA2025 X13 | Instrumentos y cinco programas de gestión documental. No importar el porcentaje de esta actividad como avance global de meta3 |
| 3 / Gobierno / actividad3.2 | [Informe abril](https://drive.google.com/file/d/1UWMKdqTzLquBl5vmi904jiXeeoBdOxp9/view), 30/04/2025; carpeta X13 y actividad O14 | El informe reporta20 funcionarios capacitados. X14 está vacío: no se inventa esa referencia. No agregar personas entre informes |
| 24 / Desarrollo Social / actividad24.2 | [Informe noviembre](https://drive.google.com/file/d/1JJWz_e5SbWLkyjMFjMD3dKkjwUTWiRZI/view), noviembre2025, sin día conocido; PA2025 X135 | Campo de beneficiarios/asistentes42, no personas únicas. No usar 21/11/2024 del formato como fecha del informe ni publicar detalles de casos |
| 42 / IDCTS / actividad42.2 | [Resolución107](https://drive.google.com/file/d/13bkK17dBDZeTzaseuRx-CDeiJI_eIWiS/view), 21/11/2025; PA2025 X215 | Apertura de estímulo cultural; no es entrega del estímulo ni ejecución del proyecto |
| 105 / AAS / actividad105.1 | [Informe Meta105.1](https://drive.google.com/file/d/1OQAL_snIiZcnly0XxJQQFrwJrehhaTFT/view), 07/03/2025; PA2025 X488 | Refiere radicación20/06/2024 y gestión posterior; no acredita financiación aprobada ni obra terminada |
| Sin meta asignada / publicación municipal | [Lanzamiento de Ventanilla Única Virtual](https://subachoque.101tramites.com/noticias/Paginas/Subachoque-lanza-su-Ventanilla-%C3%9Anica-Virtual-.aspx), 28/08/2025 | Noticia con fecha original. No se clasifica por entidad/meta a partir de su categoría editorial «Gobierno» |
| Canal ciudadano | [Directorio de atención municipal](https://subachoque.101tramites.com/Paginas/canales-de-atencion.aspx), revisado17/11/2026 | Destino externo de contacto, sin simular un foro ni recepción propia de solicitudes |

Se revisaron enlaces explícitos de PA2025 X por responsable. Gobierno, Social, IDCTS y AAS permiten respaldar las fichas anteriores. Planeación, Hacienda y Obras Públicas no tienen enlaces HTTP en esa columna. El enlace de Ambiente en X150/X151 (`1JKPR36KlX-yn_ALR41Xuoz_Kzz5PlusA`) devolvió `404 NOT_FOUND` al conector; se necesita enlace accesible o documento actualizado. No se concluye que esas entidades carezcan de soportes en otros archivos o sistemas. No se afirma haber revisado exhaustivamente cada subcarpeta externa de Drive; sí todas las hojas/celdas del Excel y cada elemento útil de estas páginas del Word.

## Fuentes exactas todavía necesarias

| Documento / campo / criterio requerido | Componente afectado | Qué habilitará |
|---|---|---|
| Metodología institucional aprobada, fórmula y pesos entre metas y años; tratamiento de acumulación y mantenimiento; cantidades ejecutadas de indicadores, denominador, fecha de corte y blancos | 2.32, 2.34, 3.02 | Circular de avance y columna apilada cuatrienal; corte oficial verificable |
| Umbrales oficiales, cronograma por meta y avance esperado a ese corte; reglas para futuras/sin reporte/no aplicables, o estados validados por meta/año | 2.40 | Circular de estados, leyenda, conteos/porcentajes y consulta de metas por categoría |
| Facturas por meta y vigencia con ID, fecha, importe y correspondencia RP–obligación–pago; definición institucional de facturación | 2.37 | Etapa independiente de facturación, conservando obligaciones |
| Originales fotográficos, autor/autorización, fecha, lugar y relación con entidad/meta/actividad; soporte institucional de resultado si se quiere llamar «logro certificado» | 1.02, 2.42, 5.02; alcance certificado de 2.41/5.06 | Collage/fotos por entidad y afirmaciones certificadas, sin imágenes de relleno |
| Tabla oficial IDF2024 del DNP con puntaje, universo/criterio departamental o certificación del puesto de Subachoque | 1.03 | Distintivo fiscal con alcance y vigencia acreditados |
| Enlaces/documentos de Planeación, Hacienda y Obras; actualización del soporte Ambiente X150/X151; otros informes con entidad/meta/periodo | Cobertura editorial de las ocho entidades | Ampliar resultados documentales; las fichas y sus gráficas ya funcionan para las ocho |

La [página oficial DNP sobre resultados fiscales](https://www.dnp.gov.co/LaEntidad_/subdireccion-general-descentralizacion-desarrollo-territorial/direccion-descentralizacion-fortalecimiento-fiscal/Paginas/informacion-fiscal-y-financiera.aspx) remite la consulta2024 a CIFFIT. Esa referencia general no se publicó como prueba de un primer puesto específico de Subachoque.

## Verificación y publicación

El cierre conserva una cabecera, cinco filtros, búsqueda, seis indicadores generales, nueve pestañas y todo el cuatrienio predeterminado. No modifica el modelo financiero, los datos importados ni otras secciones. La validación final y los enlaces de Actions, PR y SHA público se registran en `ASI_CUMPLIMOS_32_FASES.md` después de observar sus resultados, no anticipadamente.
