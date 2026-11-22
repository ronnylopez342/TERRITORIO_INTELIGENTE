# Sistema TI-DS de identificación de fichas de Data Subachoque (2.2)

**Ámbito:** identificadores propios de Territorio Inteligente para los nueve archivos Excel de Data Subachoque. **No son códigos oficiales de DANE ni de la Gobernación o las dependencias municipales.**

## Formato estable

**TI-DS-DD.AA.CC-NNN**

- TI-DS: prefijo Territorio Inteligente – Data Subachoque.
- DD: 01 Social, 02 Económica, 03 Ambiental y Territorial, 04 Institucional.
- AA: número de área, dos dígitos (01–99).
- CC: número de categoría, dos dígitos (01–99).
- NNN: consecutivo permanente de ficha dentro de una categoría (001–999).

Ejemplos de asignaciones reales: **TI-DS-01.01.02-011** corresponde a Eventos de salud mental (Social/Salud y Protección Social/Salud pública). **TI-DS-04.01.01-002** corresponde al Índice de Desempeño Institucional (Institucional/Gobierno Territorial/Desempeño institucional). **TI-DS-03.02.03-005** corresponde a Fuentes hídricas que abastecen PTAP.

Los valores 00 en el área o la categoría son reservas para **clasificación por confirmar**, no categorías oficiales. Se identificaron cinco fichas con niveles pendientes. Los nombres/códigos reales de Excel se conservan aparte.

## Reglas de asignación, persistencia y cambios

- 341 fichas consolidadas; 341 códigos únicos; 319 indicadores con datos y 22 sin publicación habilitada.
- 336 códigos con jerarquía completa; cinco con área o categoría pendiente de confirmación.
- Campos inmutables: catalogCode y catalogCodeScheme. catalogCodeStatus describe si corresponde a la clasificación vigente o si hay una migración pendiente.
- Registro persistente data/codigos-data-subachoque.json: une cada ID original del indicador con el código asignado; los códigos anteriores NO se reciclan.
- Script scripts/asignar_codigos_data_subachoque.cjs: preserva códigos ante reordenaciones de libros Excel; añade nuevos consecutivos libres cuando llegan nuevos indicadores.
- El validador scripts/validar_clasificacion_subachoque.cjs reaplica el registro al reconstruir el dataset. Nunca modifica ni reemplaza el código original de cada Excel (meta.code).
- Si una dependencia reclasifica la ficha, el código anterior permanece por trazabilidad y se marca para revisión/migración documentada; no se cambia silenciosamente.
- La interfaz muestra el código TI en el encabezado, ficha técnica, tarjetas relacionadas y resultados de búsqueda; acepta búsqueda por código.
- La exportación PDF incluye el código en su cabecera, campo de ficha técnica y nombre de archivo.
- Las fichas sin datos reciben código en el registro, pero no se habilitan como indicadores en las pestañas públicas.

## Verificación

Ejecutar:
1. node scripts/validar_clasificacion_subachoque.cjs
2. node scripts/test_codigos_data_subachoque.cjs
3. PLAYWRIGHT_HOST_PLATFORM_OVERRIDE=ubuntu24.04-x64 node scripts/test_codigos_data_subachoque_ui.cjs

Se verifican unicidad, formato, pertenencia jerárquica, conservación de valores y códigos originales, estabilidad al reimportar, búsqueda por los 290 códigos activos y exportación PDF. Se mantiene la suite independiente de gráficas, sus 435 series y las 246 imágenes JPG originales de Caracterización (2.3).


## Códigos cortos para consulta cotidiana (TI-SHORT-v1)

Se conserva íntegramente el identificador técnico TI-DS-DD.AA.CC-NNN anterior,
pero la interfaz da prioridad al código corto pronunciable y descriptivo.

- Ejemplos: IDI, POL05, PREDIAL, SAL-MENT, AGUA-PTAP, IRCA, REC-TRIB.
- Cobertura: 341 fichas = 341 códigos cortos únicos (290 publicables y 51 sin datos).
- Longitud máxima: 11 caracteres, incluyendo guiones.
- Se prefieren acrónimos conocidos, nombres de impuestos y términos de trabajo
  reconocibles; números adicionales solo cuando un alias equivalente ya existe.
- El registro inmutable data/codigos-amigables-subachoque.json enlaza id,
  shortCode y catalogCode; nunca se recalcula o recicla una clave existente.
- El generador determinista scripts/asignar_codigos_amigables_subachoque.cjs
  prioriza nomenclatura clara y garantiza la exclusividad.
- Se aplica durante scripts/validar_clasificacion_subachoque.cjs después del
  registro técnico. Los códigos de las dependencias (meta.code) siguen intactos.
- Aparece en encabezado, búsqueda, tarjetas relacionadas, ficha técnica y PDF.
  El código TI-DS histórico queda accesible en la ficha técnica y PDF, y sigue
  siendo buscable junto con el código corto.
- Estos alias no son códigos oficiales de DANE, la Gobernación o la Alcaldía.
  Son etiquetas de uso interno para localizar fichas.
- Pruebas: node scripts/test_codigos_amigables_subachoque.cjs
  y PLAYWRIGHT_HOST_PLATFORM_OVERRIDE=ubuntu24.04-x64 node scripts/test_codigos_data_subachoque_ui.cjs.
