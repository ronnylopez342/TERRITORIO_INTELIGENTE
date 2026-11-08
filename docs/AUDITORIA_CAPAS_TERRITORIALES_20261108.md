# Inventario y criterios de capas temáticas — Territorio Inteligente
Fecha de revisión: 8 de noviembre de 2026.

## Fuentes inspeccionadas
- `data/plan-accion-2025-2026.b64.txt`, JSON derivado de los libros `plan de acción 2025 - copia.xlsx` (vigencia 2025) y `Plan de Acción 2026 2T.xlsx` (segundo trimestre 2026).
- `data/plan-accion-info-general-2025-2026.b64.txt`, fichas de meta vinculadas al mismo Excel.
- `data/plan-accion-territorio-completo.b64.txt`, campos territoriales completos por meta y actividad.
- `Territorio Inteligente - Capacidades.docx`: definición de integración de datos y georreferenciador.
- `data/cartografia-subachoque/{veredas,limite,casco-urbano,...}.geojson`, capa base de referencia.

Los libros .xlsx completos no fueron recibidos como archivos independientes en esta sesión. La auditoría numérica utiliza los datos estructurados que la aplicación declara extraídos de esos libros. No se afirma una validación forense de los Excel fuente.

## Cobertura comprobada de los JSON de actividad
| Periodo | Metas | Actividades | Actividades con un campo de territorio no vacío |
|---|---:|---:|---:|
| 2025 | 109 | 388 | 215 |
| 2026 (2T) | 109 | 379 | 159 |

No se debe confundir «campo territorial diligenciado» con lugar identificable, coordenadas, punto de obra o cobertura real de un servicio. Entre los valores encontrados están «Alcaldía Municipal», «Todo el municipio», «Centro» y nombres de veredas. Las referencias genéricas no se convierten en puntos.

## Capas independientes, mismo mapa WGS84
1. **Cobertura declarada**: polígonos de veredas expresamente mencionadas en el campo territorial de una actividad.
2. **Actividades/intervenciones**: indica que una actividad cita la zona, no que toda su superficie fue intervenida.
3. **Avance físico reportado**: exige valor numérico de avance mayor que cero y vereda nombrada. El valor corresponde a la actividad completa; no se multiplica, distribuye ni atribuye a cada vereda.
4. **Registros de beneficiarios**: exige valor positivo entero en alguna categoría (funcionarios/contratistas, comunidad o asistentes). El Excel no permite deduplicar personas ni asignarlas a su vivienda o exclusivamente a una vereda.
5. **Soportes enlazados**: requiere un enlace HTTP(S) consignado en el registro de la actividad. La existencia de un enlace o carpeta no acredita contenido verificable, obra construida o coordenada.

Las capas se activan simultánea e independientemente. La pestaña maestra «Territorio» comienza con el mapa base, sin capas temáticas habilitadas. Cada mapa pequeño usa la misma base con una capa documental predeterminada conforme a su tema.

## Disciplina geográfica y límites
- La geometría administrativa original se conserva intacta en los GeoJSON.
- No se generan marcadores GPS a partir de textos, de nombres de colegios ni de beneficiarios.
- Los nombres de veredas se reconocen por coincidencia explícita, con normalización de acentos. Casos ambiguos como «Centro», «Canica» o «El Pantano» se dejan sin asignación precisa.
- La Pradera NO se asocia sin justificación con La Yegüera. Las menciones generales no se geocodifican arbitrariamente.
- Una actividad puede citar varias veredas: esa relación se muestra en las zonas mencionadas, pero los valores de avance y personas **no** se contabilizan una vez por vereda.
- Las ubicaciones, la cantidad de registros sin lugar cartografiable y la ausencia de coordenadas quedan visibles en los avisos de cada mapa.
- El mapa base no implica acreditación catastral. El usuario puede consultar por separado los datos y las capas cartográficas fuente.

## Datos necesarios para futura georreferenciación puntual
Para incorporar puntos exactos: un identificador de registro de obra o prestación del servicio; latitud y longitud con CRS especificado; tipo de infraestructura; fecha de medición; precisión posicional; fuente documental; validación institucional; unidad y criterio de atribución de beneficiarios; consentimiento/base jurídica cuando haya datos personales.

No se recomienda interpolar, distribuir por área, ubicar en un centroide como si fuera un domicilio ni crear puntos sintéticos para cerrar indicadores faltantes.

## Validación y límites del despliegue
- Validar que se visualicen las 17 veredas originales y no cambie el posicionamiento geográfico.
- Cambiar meta y año debe actualizar las capas de la misma selección y mantener las reglas de navegación existentes.
- Probar superposición con cero, una y múltiples capas; desmarcar una no debe ocultar las demás.
- Cuando una capa carece de veredas identificables, debe aparecer un aviso de información faltante.
- La publicación del código no equivale a una auditoría exhaustiva de exactitud de las coordenadas ni a la inspección de todos los enlaces externos.
