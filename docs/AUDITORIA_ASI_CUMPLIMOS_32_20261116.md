# Auditoría e implementación — 3.2 Así cumplimos

> Informe inicial sustituido por [ASI_CUMPLIMOS_32_FASES.md](ASI_CUMPLIMOS_32_FASES.md). Sus estados iniciales no certifican la versión actual. La revisión posterior recupera las gráficas faltantes, elimina el acumulado artificial y excluye intencionalmente la página 6.

**Fecha:** 16 de noviembre de 2026 (Colombia). **Fuente real:** `Matriz de Control Cuatrienio 2024-2027 (1).xlsx`, adjuntada por el usuario. **Referencia visual:** `ASI CUMPLIMOS (1).docx`, seis páginas ilustradas. **Código de producción:** rama `main`, sección `#desarrollo-cumplimos` de Plan de Desarrollo.

## Fuente y reglas de cálculo

| Hoja del Excel | Uso | Limitación |
|---|---|---|
| 3. Plan Indicativo | Identificador y texto de cada meta, línea, sector, programa, dependencia, BPIN y presupuestos programados 2024–2027 | Programación NO equivale a pagos ni a ejecución |
| 3.1 Plan de Acción 2024 | Avance físico, saldo definitivo y pagos informados en 103 registros meta-año | Seis metas no tienen resumen de ejecución física en esa vigencia |
| 3.2 Plan de Acción 2025 | Avance físico, saldo definitivo y pagos en 108 registros meta-año | Una meta no tiene resumen físico de la vigencia |
| 3.3 Plan de Acción 2026 | Ninguna ejecución anual diligenciada | NO usar porcentajes ilustrativos del Word |
| 3.4 Plan de Acción 2027 | Ninguna ejecución anual diligenciada | NO presentar sin datos como 0% |

Los **109 identificadores de metas producto** se conservaron 1–109, con **6 líneas estratégicas, 19 sectores, 29 programas y 8 responsables**. La visualización muestra estas cantidades del Excel, en lugar de las cifras ilustrativas de la página 2 del Word (que muestra 5 líneas, 18 sectores, 45 programas).

| Año | Metas con porcentaje físico | Promedio simple de los porcentajes informados | Plan Indicativo, COP | Saldo definitivo de Plan Acción, COP | Pagos informados, COP |
|---|---:|---:|---:|---:|---:|
| 2024 | 103 | 96,9% | 13.063.984.853 | 13.063.984.853 | 11.520.781.968 |
| 2025 | 108 | 17,5% | 43.147.953.431 | 18.363.274.897 | 2.224.991.234 |
| 2026 | Sin registros | Sin reporte | 19.612.614.027 | Sin reporte | Sin reporte |
| 2027 | Sin registros | Sin reporte | 21.742.670.983 | Sin reporte | Sin reporte |

Las aproximaciones de COP son redondeos para lectura; la fuente completa conserva decimales. Los promedios son **descriptivos y no constituyen cumplimiento oficial**: metas heterogéneas pueden tener unidades y pesos diferentes. Las barras apiladas muestran una **lectura orientativa**, tomando 25% del promedio anual como segmento visual del cuatrienio; este procedimiento se explica dentro de la interfaz, no se presenta como indicador oficial certificado.

La denominación 2024–2027 proviene del Excel adjunto. Otras fuentes oficiales del plan pueden mencionar 2024–2028; esta diferencia requiere conciliación documental y no se sustituye silenciosamente una vigencia por otra.

## Checklist página por página del Word

| Página | Referencia visual | Resultado en 3.2 | Estado |
|---|---|---|---|
| 1 | Collage fotográfico, título «Así cumplimos», identidad municipal | Portada contextual y franja fotográfica con imágenes editoriales existentes del portal. No se atribuyen las fotos a obras concretas. | **Implementado con imágenes existentes** |
| 2 | Visor general, cifras, filtros, navegación, comparación por entidad | Filtros horizontales (años, línea, sector, programa, dependencia, búsqueda), diez botones internos **horizontales**, tarjetas KPI y módulos financieros/ejecución | **Implementado; cifras recalculadas del Excel** |
| 3 | Programado 100% contra avance anual acumulado en columnas | Gráfico vertical: referente 100% y segmentos 2024–2025 documentados; 2026–2027 sin reporte. Leyendas, fuente y limitación visibles | **Implementado sin reproducir porcentajes ilustrativos** |
| 4 | Comparación física y presupuestal por secretarías | Gráficas de barras agrupadas por las ocho entidades, cada fila abre ficha de responsable; se comparan promedio físico y pagos/saldo definitivo | **Implementado; muestra 2025 por defecto en cuatrienio** |
| 5 | Ficha de Secretaría General/Gobierno con presupuesto, números de metas y gráfica | Detalle por entidad con métricas estratégicas, saldo definitivo y pagos, porcentajes y **tarjetas grandes de metas** | **Implementado de forma navegable** |
| 6 | Distribución territorial e inversión vial | Excluida por instrucción del usuario. Se retiró Territorio de 3.2. | **Exclusión intencional; no es una tarea pendiente** |

## Arquitectura del visor

- `js/plan-desarrollo-landing.js` conserva la página 3.1 y 3.3; monta un componente en 3.2 en lugar del contenido demostrativo.
- `js/asi-cumplimos-32.js` administra navegación, consultas, métricas y gráficos del visor de **solo lectura**.
- `css/asi-cumplimos-32.css` contiene estilos específicos de 3.2 para escritorio y móvil, sin modificar otras pestañas.
- `data/asi-cumplimos-32.gz.b64.txt` conserva una estructura compacta de los 109 registros construida a partir de la matriz adjunta. No contiene otros datos personales del libro de Excel.
- `scripts/test_asi_cumplimos32.cjs` concilia conteos, sumas, años y restricciones de ausencia de ejecución 2026–2027.
- `scripts/smoke_asi_cumplimos32.cjs` verifica navegación horizontal, filtros, secretarías, detalle, metas y móvil en navegador.

## Criterios que todavía requieren evidencia adicional

- [x] Identificar 109 metas, 6 líneas, 19 sectores, 29 programas y 8 responsables.
- [x] Vista predeterminada del cuatrienio completo, con filtro de 2024 a 2027.
- [x] Pestañas internas horizontales en lugar del menú vertical del Word.
- [x] Visual de avance programado comparado con reportes reales de 2024–2025.
- [x] Comparación por entidad y detalle de metas, presupuesto y avance.
- [x] No inventar ejecución física o pagos de 2026–2027.
- [x] Mantener código y datos propios de 3.3 Planes de Acción y 4.2 Proyectos Estratégicos intactos.
- [ ] Obtener series de avance oficialmente ponderadas por cada meta para reemplazar comparativas orientativas por un indicador institucional de cuatrienio.
- [ ] Documentos oficiales de ejecución y evidencias fotográficas de obras por entidad, con atribución y fecha verificable.
- [x] Página 6 excluida intencionalmente del alcance de 3.2.
- [ ] Evaluación editorial individual de todas las fotografías de la página 1 y sus permisos de publicación.
- [ ] Validación visual humana en varios navegadores y dispositivos más allá de los smokes automáticos.

**Regla de publicación:** ejecutar GitHub Actions, revisar capturas y confirmar Vercel `READY` en la misma revisión SHA de `main`. No declarar las tareas de fuente adicional como realizadas.
