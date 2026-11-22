# Codificación pública homogénea de gráficas de Data Subachoque (2.2)

## Formato único

GRA-XX-NNN, sin año ni área ni categoría. GRA siempre significa gráfica/ficha de indicador. XX identifica la dimensión, con exactamente dos letras. NNN es un consecutivo permanente desde 001 en cada dimensión.

| Dimensión | Prefijo | Fichas |
|---|---|---:|
| Social | GRA-SO | 174 |
| Económica | GRA-EC | 57 |
| Ambiental y Territorial | GRA-AM | 82 |
| Institucional (solo Data Subachoque) | GRA-IN | 28 |

Cada indicador conserva el mismo código para sus series, años, vistas, gráficas, descarga PDF y futuras actualizaciones. Los códigos no contienen 25 porque no expresan la vigencia 2025 y nunca deben cambiar por actualizar un dato.

## Correspondencia y trazabilidad

- Todos los 341 registros tienen un código único graphCode, incluido el inventario de 22 fichas sin información publicable. Las 319 fichas consultables muestran graphCode en encabezado, ficha, búsqueda, tarjetas relacionadas y PDF.
- El registro permanente data/codigos-gra-subachoque.json vincula id original con código público, dimensión de emisión y equivalencias anteriores.
- Los antiguos TI-DS-... (catalogCode), IDI, POL05, SAL-MENT (shortCode) y meta.code de Excel no se borran ni se muestran como código de gráfica; se conservan internamente para trazabilidad y búsqueda histórica.
- Las reclasificaciones mantienen el código original, marcan requiere_migracion y requieren una migración explícita si se decide cambiar el prefijo, con alias para no romper referencias previas.
- La numeración es estable al reordenar los libros Excel y crece con el siguiente consecutivo disponible.
- El código es propio de Territorio Inteligente; no es un código oficial DANE, Gobernación o entidad municipal.
- Las seis representaciones de una misma gráfica —si existen— utilizan el mismo identificador porque corresponden al mismo indicador, sin crear códigos adicionales por tipo.
- La dimensión Institucional pertenece exclusivamente a Data Subachoque (2.2). En Caracterización 2.3 la cuarta dimensión sigue siendo Percepción ciudadana; este cambio no modifica ese módulo.

## Regenerar y verificar

1. node scripts/validar_clasificacion_subachoque.cjs
2. node scripts/test_codigos_gra_subachoque.cjs
3. node scripts/test_codigos_data_subachoque_ui.cjs

La regeneración reaplica los registros de equivalencia previos, los códigos públicos y la validación de datos. No modifica ningún dato estadístico.
