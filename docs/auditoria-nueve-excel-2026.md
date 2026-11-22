# Auditoría cruzada de Data Subachoque — 21 de noviembre de 2026

## Alcance de los archivos proporcionados

Se examinaron las nueve hojas de cálculo originales de las dependencias, todas con hash SHA-256 registrado a continuación. Suman **372 pestañas físicas**: contienen hojas índice, auxiliares, plantillas, duplicados y hojas con indicadores. El catálogo evita contar varias veces un mismo indicador presente en dos versiones de Hacienda o repetido en el archivo de Obras Públicas.

| Libro recibido | Pestañas físicas | Fichas principales en catálogo | Publicables al cierre | SHA-256 original |
|---|---:|---:|---:|---|
| INDICADORES GOBIERNO.xlsx | 155 | 148 | 144 | e6abeec267dffedd79a8f393ab631c93e11eb0cf303bc78d150dc506581f0aac |
| Fichas de indicadores INSTITUTO.xlsx | 33 | 32 | 29 | ce0163f4e421bb07ecea89179f8c127b9e28c864600106954aa8152faf81ffc6 |
| Fichas_indicadores_-_desarrollo_social.xlsx | 36 | 35 | 35 | a41237d462f1e85e5dca76927bf1af4dd63ddd5838eca5b5496a9e9b5dd6be4c |
| Fichas indicadores - Ambiente y Competitividad.xlsx | 49 | 48 | 43 | cfc2c658e90d88633ed1e1c478708f80f590a704ed0ed2bfa6c0d87b4d535a3f |
| Indicadores Obras Públicas.xlsx | 6 | 5 | 2 | f2437d013d2325aae1108f53d61db8600c1b50c24b5ab84b2c55c57a6d00db5c |
| Fichas HACIENDA.xlsx | 16 | 0 (versión de referencia de la siguiente) | 0 duplicados | 6b950b5643efb4833bdcd7456f8b5402cfa03557f0fa3068861d0a7c719d40ff |
| Indicadores Hcienda - Prueba.xlsx | 15 | 15 | 15 | 4986fad1fae48f02db1fc16c1fd4824c4072086f7694acd68687675ce1a9fa16 |
| Ficha indicadores PLANEACIÓN.xlsx | 35 | 32 | 31 | 2e54ec18e5a09f39220f62e2a1b4d8c617350f3a37f8427c41c577c838bf7b86 |
| Indicadores EMPRESA AGUAS Y ASEO.xlsx | 27 | 26 | 20 | cfa9b515c1a52e662af75bb67a9be5bbfa634f6c7cfb651f4ba26381a98fcea8 |
| **Total** | **372** | **341** | **319** | |

**Los otros 22 indicadores** mantienen ficha e identificador GRA en el registro, pero no se publican con gráficas inventadas por ausencia de valores verificables.

## Incidencia principal corregida

El convertidor previo ignoró las series de las 32 fichas del **Instituto de Deporte, Cultura y Turismo**, que utiliza años en la columna B y datos desde C. El catálogo antiguo conservaba los 32 nombres pero marcaba **todos como no disponibles**, incluso cuando la fuente traía cifras.

Se han restaurado **29 fichas con datos reales**, **82 series**, **218 puntos temporales** y **54 valores de categorías**, usando las hojas originales. Las hojas **10, 20 y 23** del Instituto no contienen valores en sus campos de serie; se mantienen como no publicables.

Las series recuperadas incluyen cobertura de escuelas, acceso a bibliotecas, formación deportiva, asistencias culturales y deportivas, contratos, incentivos y estadísticas turísticas. Para contratos e incentivos con varios registros del mismo año, los totales agregados se marcan expresamente como **sumatorias derivadas**. Las asistencias a eventos no se etiquetan como personas únicas. Las metas futuras y datos turísticos sin año cierto no se convierten en datos observados.

Se corregió una duplicación del identificador jerárquico **1.5.1** en las categorías deportivas del documento original, asignando **1.5.1–1.5.4** de forma única a sus cuatro temas. Las fichas del Instituto con códigos temáticos 1.4.6, 1.5.5 y 2.3.4 se asignaron a las categorías municipales válidas por su contenido, sin alterar sus códigos GRA ya emitidos. Los identificadores TI-DS históricos quedan archivados con trazabilidad.

## Verificación final del catálogo

- 341 fichas únicas y 341 códigos públicos inmutables con patrón GRA-XX-NNN.
- 319 fichas consultables, 22 sin valores verificables.
- 517 series y 1.430 puntos numéricos publicables, 152 valores en tablas de desagregación.
- 29 fichas del Instituto recuperadas y 3 mantenidas sin datos.
- 70 correcciones documentadas de clasificación en total, entre las heredadas y las nuevas.
- Búsqueda por GRA y alias históricos, cinco paneles de indicadores, selector de series/desagregaciones, interpretación, hallazgos y PDF.
- Las fuentes originales (incluido el código textual que consignó cada dependencia) permanecen almacenadas sin sustitución. Los códigos GRA no contienen el año, para no caducar al actualizar series.
- Los datos de KoBo y las 246 imágenes JPG originales del Atlas no deben alterarse.

## Matices metodológicos

- **No duplicar importes:** las distintas cifras para camas turísticas en 2025 son mediciones alternativas y no se suman.
- **No duplicar participantes:** la suma de asistencias a actividades es una suma de eventos, no un censo de habitantes.
- **No afirmar visitantes totales:** el valor parcial de eventos en el indicador turístico no equivale a toda la demanda municipal.
- **No crear series vacías:** las hojas sin cifra permanecen excluidas de las gráficas públicas.
- **No exponer datos personales ni enlaces internos:** algunas bases auxiliares o enlaces de SharePoint requieren permisos institucionales y no se incorporaron como registros públicos de personas.
- **Alcance del cotejo:** se verificó la cobertura estructural de las fichas y se cotejaron directamente las nuevas cifras restauradas del Instituto con el Excel recibido. Las otras ocho fuentes mantienen el consolidado previamente auditado; un cotejo totalmente nuevo de cada celda original de esas ocho fuentes requiere ejecutar el validador contra sus archivos fuente, no basta con la coincidencia de totales.

## Artefactos y replicabilidad

- data/fichas-2026-consolidadas.json
- data/fichas-2026-validadas.json
- data/instituto-datos-recuperados-2026.json
- data/codigos-gra-subachoque.json
- data/auditoria-indicadores-subachoque.csv
- scripts/restaurar_datos_instituto.cjs
- scripts/validar_clasificacion_subachoque.cjs
- scripts/test_instituto_2026.cjs
- scripts/test_data_subachoque_strict.cjs
- scripts/test_data_subachoque_chart_fill.cjs
