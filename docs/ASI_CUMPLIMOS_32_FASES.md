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
| Hoja6 | 65 | Proyectos viales; fuera del visor 3.2 y del mapa excluido |
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
- [ ] Fase 1: navegación única, sin Territorio ni pestaña adicional al abrir ficha; filtros persistentes.
- [ ] Fase 2: Inicio con columnas anuales verificables y cobertura complementaria.
- [ ] Fase 3: Dashboard con entidades, dos columnas generales y cinco etapas financieras.
- [ ] Fase 4: Plan de Desarrollo analítico sin repetir gráfica de Inicio.
- [ ] Fase 5: ficha por entidad con dos columnas y comparativo completo de metas.
- [ ] Fase 6: barras y desgloses por líneas, sectores y programas.
- [ ] Fase 7: metas e indicadores con campos, unidades y procedencia reales.
- [ ] Fase 8: regresión, capturas, Actions y SHA de Vercel iguales a main.

Pendientes documentales: metodología oficial de acumulado; reglas oficiales para estados de riesgo/retraso; certificación y fecha de corte de los avances; facturación si se desea mostrarla como etapa independiente; logros/noticias y fotos atribuibles. Estos faltantes no se resuelven con cifras o textos ilustrativos.
