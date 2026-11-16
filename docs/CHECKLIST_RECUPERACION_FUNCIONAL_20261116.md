# CHECKLIST VIVO — RECUPERACIÓN FUNCIONAL DE RAMAS

**Base:** [auditoría maestra](AUDITORIA_MAESTRA_RAMAS_20261116.md) · [63 ramas](MATRIZ_RAMAS_20261116.csv) · **rama única:** `main`.

## Política de clasificación

- **RECUPERAR:** herramienta útil desaparecida que no tiene equivalente operativo actual.
- **CONSERVAR:** la implementación actual es funcional y más completa; no sustituir por la antigua.
- **COMPARAR:** no hay pruebas suficientes para afirmar equivalencia; hacer test y auditoría visual antes de cerrar.
- **NO RECUPERAR:** mejora retirada intencionalmente, demo obsoleta, riesgo de falsedad o regresión.
- **[x]** significa código/decisión comprobados; los marcados **[ ]** no están cerrados. No marcar una mejora como implementada por el mero hecho de conservar su archivo en Git.

## Fase A · Capacidad y fuentes (pérdidas de alta confianza)

- [ ] **R-01 · Recuperar acceso al explorador de los 12 capítulos.** La visualización y JSON existen en el árbol pero el portal no los enlaza. Montarlo de forma accesible dentro de 2.1 sin reinstalar la antigua navegación 2.2. **Prueba:** abrir, cambiar a 12/12, ver fuente y cerrar; móvil y teclado.
- [ ] **R-02 · Recuperar comparación DANE 2005/2018.** Existen datos fuente y herramientas históricas no cargadas. Ofrecer una consulta contextual y cifras conciliadas en la interfaz vigente. **Prueba:** 12.972 y 14.874 habitantes, distribución urbana/rural y enlace fuente.
- [ ] **R-03 · Recuperar gestor local de indicadores del Plan Estadístico.** La versión antigua conserva CRUD/formulas/reportes, pero el panel fue retirado. Adaptarlo al 2.1 vigente, preservar registros locales con clave `ti-plan-estadistico-indicadores-v1` y no afirmar que son indicadores oficiales. **Prueba:** crear, editar, calcular, filtrar, exportar/importar, persistir y borrar con confirmación.
- [x] **C-04 · Conservar publicaciones actuales.** `#cn-publicaciones` ya ofrece filtros por categoría, búsqueda, catálogo, visor y administración local de originales. No reinstalar la demo `js/publicaciones-editorial.js` como una pestaña adicional.
- [x] **C-05 · Conservar 2.3 KoBo.** La versión vigente usa agregados de 324 encuestas; no reintroducir 1.248 respuestas ilustrativas de la encuesta histórica.
- [x] **C-06 · Conservar 2.2 Data Subachoque.** Dimensiones y filtros actuales (4 dimensiones, 21 áreas, 105 subtemas); no sobrescribir con la vieja estructura.

## Fase B · Planes y cumplimiento

- [ ] **V-07 · Equivalencia 3.3.** Contrastar dos gráficas, métricas, filtros, años y vista móvil con `archivo-20261116/fix/plan33-*`; conservar el dashboard posterior si los resultados coinciden. **Prueba:** comparación numérica y capturas.
- [ ] **V-08 · Integridad del mapa 4.2.** Los 17 nombres de veredas siguen visibles, los pines son referencias documentales y los registros se vinculan al Excel. **Prueba:** mapa completo, filtro, pines, popups y responsive.
- [ ] **V-09 · Indicadores 4.2.** Retener filtros compartidos, ausencia de series inventadas, etiquetas legibles y datos certificados separados de los proyectos; cotejar con la etiqueta histórica.

## Fase C · Ingeniería y regresiones antiguas

- [ ] **T-10 · M1 y M2.** Comparar verificadores/editorial ids de los respaldos con pruebas actuales. Recuperar sólo scripts todavía útiles, reconstruyendo selectores obsoletos.
- [ ] **T-11 · Regresiones internas de 54 ramas integradas.** Comprobar funciones suprimidas dentro de archivos existentes, además de las 12 rutas históricamente ausentes. Ninguna se considera perdida sin evidencia semántica.
- [x] **T-12 · CI actual sobre main.** Verificaciones estructurales, sintaxis JS, fuentes KoBo, 4.2 y smoke de las 4 vistas Data pasan en el último corte verificado de la auditoría.
- [ ] **T-13 · Pruebas de recuperación y regresión ampliadas.** Nuevos smoke tests del capítulo, DANE y gestor local; CI verde y captura del estado posterior.
- [ ] **T-14 · Producción alineada.** Confirmar `main`, GitHub Actions `success` y Vercel `READY` en el mismo commit final.

## Eliminaciones justificadas: NO restaurar

- [x] **D-15 · No reinstalar** `production/v2.3-canonical` ni el CSS azul oscuro revertido de 3.3.
- [x] **D-16 · No reinstalar** el PDF transcrito del Plan Estadístico cuando existe el documento original; no duplicar seis HTML antiguas en lugar de `index.html`.
- [x] **D-17 · No inventar** cifras de DANE, indicadores certificados, coordenadas exactas de proyectos o documentos institucionales.
- [x] **D-18 · Conservar** las nueve etiquetas Git históricas para comparación, sin crear ramas de código adicionales ni fusionar snapshots completos.

## Criterio de cierre

El proyecto no se declara `PERFECTO` ni `100 % RECUPERADO` hasta completar los elementos pendientes con pruebas de UI, datos y producción. Cada cambio debe indicar SHA, tests y motivo. Si un ítem es imposible o no corresponde, documentar `DESCARTADO CON MOTIVO` en vez de marcarlo como implementado.
