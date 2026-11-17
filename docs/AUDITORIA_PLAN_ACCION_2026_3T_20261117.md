# Actualización de 3.3 Plan de Acción — Corte 2026 T3

**Fuente aportada:** `Plan de Acción 2026 3T.xlsx`; hoja `1. Plan de Acción 2026`.
**Huella SHA-256 del archivo:** `c67b3c9ad06c184208ceb563cd3669ccbbb5ac3d6cb3364c89695828b1e00206`.
**Corte:** enero a septiembre de 2026 (tercer trimestre). **Ningún valor de octubre a diciembre**.

## Decisiones de alcance

- La navegación de **3.3 Plan de Acción** queda en **10 pestañas**: Resumen, Información General, Actividades, Avance Físico, Beneficiarios, Ejecución Presupuestal, Territorio, Contratación de Inversión, Soportes y Observaciones.
- Se elimina de esta sección el **Totalizador del Plan** (pestaña, cinta, enlace y recursos JS/CSS), sin eliminar la selección y búsqueda por metas ni sus gráficos de detalle.
- Se conserva intacto el archivo anterior **2025** y se sustituye únicamente el periodo **2026** de la capa de datos del visor mediante `data/plan-accion-2026-3t.gz.b64.txt`.
- La información general, responsables y observaciones 2026 provienen del nuevo archivo y no se mezclan con versiones 2T. En Contratación pueden existir fuentes anteriores, y sus fechas deben examinarse separadamente; el Excel 3T no incorpora una tabla detallada de contratos.

## Conciliación con el Excel (sin duplicar filas de actividad)

| Concepto | Dato 2026 al tercer trimestre |
|---|---:|
| Metas producto únicas (N) | **109** |
| Actividades con identificador (T) | **379** |
| Observaciones en BD | **89** (3 de meta y 86 de actividad) |
| Meses con cifras físicas | Enero–septiembre |
| Octubre, noviembre y diciembre | No reportados |
| Saldo definitivo (AW), COP | **36.773.137.993,15** |
| CDP (AX), COP | **32.494.080.882,14** |
| Compromiso RP (AY), COP | **22.270.574.421,38** |
| Obligaciones (AZ), COP | **15.098.401.070,85** |
| Pagos (BA), COP | **14.098.537.045,85** |
| Saldo disponible (BB), COP | **4.279.057.111,01** |

**Método presupuestal:** La columna BC es **RP / saldo definitivo** (AY/AW), no pagos / saldo definitivo (BA/AW). Los valores financieros son totales acumulados al corte del libro; **no hay mensualidad presupuestal verificable**, y no deben distribuirse artificialmente.

**Método físico:** Cada porcentaje de avance de meta se reproduce desde **AU** tal como está guardado en el Excel. Las actividades conservan sus celdas mensuales **AD:AO** y su total **AP**, aunque difieran, para que no cambie silenciosamente la cifra fuente. Los porcentajes mensuales derivados solo usan series conciliadas.

## Hallazgos de calidad que no se ocultan

- **49 actividades:** suma de meses enero–septiembre distinta del total AP guardado. Se conserva AP y la serie original; la pestaña muestra un aviso por meta cuando corresponde.
- **1 mes:** septiembre de la fila 435 tiene el número `0.1` almacenado como texto; se normaliza para presentación con incidencia registrada.
- **2 metas:** entradas incompletas para recomputar algunas fórmulas físicas sin supuestos.
- **1 meta:** diferencia de fórmula física ponderada respecto a AU almacenado.
- **Encabezados heredados:** T1, U2 y AW1 del archivo recibido **todavía mencionan 2025**, aunque el nombre del libro y la hoja indican Plan de Acción 2026. Antes de tratarlo como documento oficialmente validado, confirmar la vigencia con la Alcaldía.

## Checklist

- [x] Extraer 109 metas y 379 actividades sin doble conteo.
- [x] Preservar 2025.
- [x] Sustituir fuente 2026 con fecha de corte 30 de septiembre y 9 meses observados.
- [x] Diferenciar los seis conceptos presupuestales y el porcentaje RP/saldo.
- [x] Conservar anomalías originales y visibilizar discrepancias al consultar meta.
- [x] Incorporar 89 observaciones y responsables por actividad desde el nuevo libro.
- [x] Eliminar Totalizador en 3.3 sin borrar navegación por metas.
- [x] Comprobar GitHub Actions en verde para la versión funcional: [ejecución 44034387431](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/actions/runs/44034387431) → **SUCCESS**.
- [x] Comprobar Vercel `READY` con la versión funcional: commit `052d35d366cfd60c6462811282b8be9f16c7cab3`, rama `main` y dominio oficial en **READY**. Al modificar este informe, verificar el nuevo SHA antes del cierre.
- [ ] Confirmación municipal de la discrepancia `2025`/2026 en los encabezados del libro.
- [ ] Auditoría de vigencia del catálogo de contratación, dado que este XLSX no contiene contratos individualizados.

**Pruebas automatizadas:** `scripts/test_plan_accion_2026_3t.cjs`, `scripts/smoke_plan_cumplimiento.cjs`. Mantener intacta Unidad de Cumplimiento 4.2.
