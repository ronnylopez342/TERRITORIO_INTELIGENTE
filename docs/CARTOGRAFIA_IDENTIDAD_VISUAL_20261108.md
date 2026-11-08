# Cartografía editorial de Subachoque — correspondencia visual

## Referencia y versión
- Referencia gráfica: imagen del usuario `download(20261108-073545).png` (1262 × 1246 píxeles, exterior RGBA transparente).
- Este trabajo cambia colores, tipografías, trazos y ruido SVG; no modifica coordenadas ni geometrías de los archivos GeoJSON locales.
- El mapa usa geometrías **referenciales**, sin certificación independiente de exactitud catastral.

## Paleta medida directamente en zonas interiores de la imagen
| Etiqueta en referencia | Entidad en GeoJSON | Color de diseño |
|---|---|---|
| El Guamal | El Guamal | #F995AE |
| La Unión | La Union | #FB924E |
| Pantano de Arce | Pantano De Arce | #8ABEE0 |
| El Tobal | El Tobal | #C49FD8 |
| Rincón Santo | Rincon Santo | #8CCCC6 |
| El Páramo | El Paramo | #A4C069 |
| Subachoque (región central ilustrada) | Cascajal (NO renombrar como Subachoque) | #FCDE85 |
| Altania | Altania | #FA9D6D |
| Santa Rosa | Santa Rosa | #B0CE7D |
| El Valle | El Valle | #CFAADD |
| El Centro (Llanitos) | El Centro (Llanitos) | #8ACFC8 |
| Cánica Alta | Canica Alta | #DDB4DD |
| Cánica Baja | Canica Baja | #93C5E7 |
| Casco Urbano | Casco Urbano (archivo independiente) | #C7A6DB |
| La Pradera (ilustrada) | La Yeguera (NO renombrar) | #FCD97C |
| Tibagotá | Tibagota | #A6C26C |
| Gómez (ilustrada) | Galdamez (NO renombrar) | #FBC751 |
| No representada de forma separada con ese nombre | Santuario La Cuesta | #F1B88E |

## Regla de fidelidad
La imagen proporciona una identidad gráfica aproximable por color, tinta, textura y tamaño de etiquetas. Las diferencias en distribución, nombres y formas de la ilustración NO autorizan a cambiar los límites geo-referenciados.

## Verificaciones realizadas antes de integrar
- Muestras de color extraídas de la imagen original con análisis de píxeles, evitando fondo transparente y texto oscuro.
- Filtro SVG fractalNoise comprobado mediante una prueba aislada en Chromium (no constituye captura del sitio de producción).
- La geometría fuente se conserva y su recorte visual permanece en una máscara SVG.
- La tipografía se escala dinámicamente según el tamaño del polígono en pantalla, sin desplazar la coordenada de anclaje.
- Validación sintáctica integral de JavaScript. La validación de funcionamiento en navegador real de producción sigue siendo necesaria.

## Información no demostrada
No se ha certificado que todos los límites de veredas sean oficiales o actuales, ni existe un error posicional documentado para viviendas o predios. No se declara identidad píxel a píxel con una ilustración que no usa exactamente las mismas geometrías.