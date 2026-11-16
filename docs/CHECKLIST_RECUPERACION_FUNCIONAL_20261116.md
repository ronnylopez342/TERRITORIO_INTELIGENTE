# CHECKLIST VIVO DE CONSOLIDACIÓN — TERRITORIO INTELIGENTE

**Actualizado:** 16/11/2026 · **Única rama activa:** `main` · **Base:** [auditoría de 63 ramas](AUDITORIA_MAESTRA_RAMAS_20261116.md) · [matriz de las 63 ramas](MATRIZ_RAMAS_20261116.csv).

La marca **[x]** acredita una decisión o implementación concreta respaldada por una prueba. **No equivale a que toda la aplicación sea perfecta.** Si una mejora requiere otra validación, se registra en otro ítem abierto.

## A. Recuperaciones confirmadas — funcionalidades que faltaban en la interfaz

- [x] **R-01 · Volver a conectar los 12 capítulos territoriales.** Visor histórico accesible desde 2.1 Conoce Data, navegación 01–12, fichas con fuentes y cierre del diálogo, sin restaurar las pestañas antiguas. **Evidencia:** [smoke Data](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/actions/runs/43909553297).
- [x] **R-02 · Recuperar comparación censal DANE 2005/2018.** Poblaciones 12.972 y 14.874, totales urbanos/rurales conciliados, hogares y enlace a la ficha municipal 25769. Se identifican los cortes censales; no se presentan como proyección 2026. **Evidencia:** [CI](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/actions/runs/43909553297).
- [x] **R-03 · Recuperar gestor local de indicadores del Plan Estadístico.** Alta, edición, fórmulas, resultados, validación de fuente, fechas, búsqueda, borrado confirmado, importaciones JSON/CSV/Excel y exportación JSON/CSV. Compatible con la clave previa `ti-plan-estadistico-indicadores-v1`. No publica datos institucionales. **Evidencia:** prueba automatizada de CRUD, persistencia, cálculo, exportación/importación y eliminación, incluida en [CI](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/actions/runs/43909553297).
- [x] **R-04 · Recuperar Memoria de la Alcaldía local.** Entrada en Publicaciones; reutiliza `municipal-archive:v1` de IndexedDB, conserva documentos existentes, filtros por dependencia/año, altas, edición, archivo adjunto, descarga del original y exportación de índice. **No reintroduce cifras ni expedientes demostrativos.** **Evidencia:** smoke de archivo histórico en [CI](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/actions/runs/43909553297).
- [x] **R-05 · Recuperar importaciones estadísticas por nivel.** Reutiliza `TIWorkspace` y `TIData`: categorías DANE, nacional, departamental, municipal; carga Excel/CSV/JSON, filtro por sector, tabla/gráfico, plantilla, exportación y persistencia local sin publicar datos. Se corrigió el doble diálogo del módulo antiguo al reutilizarlo desde 2.1. **Evidencia:** smoke de importar CSV, recuperar base municipal anterior y exportar en [CI](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/actions/runs/43909553297).

## B. Implementaciones más recientes: conservar, no sobreescribir

- [x] **C-06 · Publicaciones actuales.** Conservar búsqueda, filtros, visor, catálogo real y administración local de originales de `#cn-publicaciones`. La nueva Memoria local es complementaria, no reinstala la demo de nueve publicaciones como documentos oficiales.
- [x] **C-07 · Caracterización KoBo 2.3.** Conservar agregados de **324 encuestas**, cuatro dimensiones y 48 temas. Rechazar la demo histórica de **1.248** respuestas como si fueran datos reales.
- [x] **C-08 · Data Subachoque 2.2.** Mantener cuatro dimensiones, 21 áreas, 105 subtemas y filtros por nivel; no restaurar el viejo esquema de seis pestañas.
- [x] **C-09 · Plan de Acción 3.3.** Mantener las 11 vistas y el resumen vigente de dos tarjetas compuestas con gráficas de ejecución física/presupuestal. El CSS de las variantes antiguas no encaja en el DOM moderno. **Evidencia de funcionalidad vigente:** 109 metas por año y estado sin datos en 2024, [smoke 3.3](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/actions/runs/43909553297).
- [x] **C-10 · Unidad de Cumplimiento 4.2.** Mantener 30 registros de la fuente original, 10 subpestañas, filtros compartidos, sin inventar series acreditadas ni coordenadas exactas de obras.
- [x] **C-11 · Eliminaciones intencionales.** No volver a `production/v2.3-canonical`, al CSS azul oscuro revertido de 3.3, a páginas HTML del portal inicial o al PDF reconstruido del Plan Estadístico.
- [x] **C-12 · Respaldo histórico.** Conservar las nueve etiquetas `archivo-20261116/...`; no crear nuevas ramas ni fusionar snapshots antiguos enteros sobre `main`.

## C. Incongruencias comprobadas y corregidas

- [x] **F-13 · Mapa de proyectos comprimido en móvil.** `css/ti-cumplimiento-42-shared.css` sobrescribía la altura del mapa con **270 px**; se eliminó esa regla, dejando el mapa ampliado de `ti-cumplimiento-42-resumen.css`. Nombres de veredas, pines y leyenda conservados.
- [x] **F-14 · Auditoría visual mínima 3.3/4.2.** Smoke Playwright de escritorio/móvil: tarjetas, número de metas, cambios de año, mapa completo, nombres de 17 veredas, pines, ausencia de botones de veredas debajo y estados de indicadores sin medición. Capturas disponibles como artefacto de [CI](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/actions/runs/43909553297).
- [x] **F-15 · M1: integridad de recursos.** Nuevo registro de huellas `docs/INTEGRIDAD_FUENTES_CRITICAS.json` y verificador `scripts/verify_critical_assets.cjs`; impide cambiar silenciosamente nueve archivos originales (video, PDF, cartografía, fuentes y datos).
- [x] **F-16 · M2: identidades editoriales.** Reconstruido `editor/registry.json` con 19 localizadores vigentes y verificación estática y de navegador; no copiar localizadores obsoletos como `planDashboard`/`complianceDashboard`.
- [x] **F-17 · Calidad continua.** Workflow de `main` comprueba estructura, sintaxis JavaScript, fuentes originales, encuestas, Unidad 4.2, herramientas 2.1, 3.3 y mapa 4.2; [último resultado validado](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/actions/runs/43909553297): **SUCCESS**.

## D. Pendientes que aún impiden certificar el 100 %

- [ ] **P-18 · Auditoría semántica exhaustiva de todo el historial.** Los 455 commits y las 54 ramas sin commits exclusivos se inventariaron a nivel de historia/archivos, **pero aún no se ha demostrado equivalencia función por función** para cada modificación intermedia.
- [ ] **P-19 · Comparación visual editorial exhaustiva.** Los smokes cubren componentes clave y dos anchos; faltan revisión humana de todos los módulos, navegadores alternos, textos largos, contraste y estados de error.
- [ ] **P-20 · Autenticación institucional y persistencia multiusuario.** Funciones recuperadas de archivos e indicadores son **locales por navegador**. No convertir su estado en «recurso compartido» sin backend, permisos y auditoría de datos.
- [ ] **P-21 · Fuentes oficiales por completar.** Una prueba `READY` no certifica las cifras, documentos y evidencias todavía vacíos o representados como ejemplo en otros módulos. Requieren fuentes institucionales verificadas.
- [ ] **P-22 · Protección de `main`.** Sigue sin protección de rama; valorar regla de CI obligatorio antes de despliegues peligrosos. Eliminar ramas históricas no protege el código frente a cambios futuros.

## E. Cierre de producción

- [ ] **PR-23 · Alinear último commit, CI y dominio de producción.** Al terminar este checklist, confirmar `main` como única rama, último workflow **SUCCESS** y Vercel `READY` en el **mismo SHA**. Registrar SHA final y enlaces de comprobación.

**Regla de cierre:** `RECUPERADA`, `SUSTITUIDA_CON_MEJORA` y `DESCARTADA_CON_MOTIVO` exigen referencia técnica y prueba. Lo que no está demostrado conserva estado `PENDIENTE`; no anunciar `PERFECTO` ni `100 % UNIFICADO FUNCIONALMENTE` hasta cerrar P-18–P-22 con evidencias.
