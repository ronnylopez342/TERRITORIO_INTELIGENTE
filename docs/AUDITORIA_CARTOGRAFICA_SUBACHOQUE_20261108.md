# AUDITORÍA INICIAL — MAPA EDITORIAL DE SUBACHOQUE

Fecha: 2026-11-08. Cartografía leída de `ronnylopez342/subachoque-platform`, commit `5a588746d516b3de8e235aa0b7a087923248123f`.

## Alcance comprobado
- Los ocho archivos se copian sin modificar sus coordenadas, propiedades ni geometrías; se mantiene su sistema geográfico de entrada WGS84 / EPSG:4326 cuando así se declara.
- Las 17 entidades veredales se conservan. La geometría original, no la ilustración, es la base para dibujar los límites.
- Se comprueban rangos numéricos de coordenadas y cierre exacto de anillos de polígonos.
- Los polígonos del casco urbano indican método de origen `municipal_boundary_minus_vereda_union` en sus propiedades.

## Límites de esta auditoría
- **No es certificación de límites oficiales, ni exactitud catastral**. No se dispone aquí de fuente independiente con puntos de control, tolerancia posicional, fecha ni escala de captura verificadas.
- El cierre de anillos no garantiza ausencia de autointersecciones, solapes o huecos; se requiere contraste con cartografía institucional validada antes de usar para delimitación jurídica.
- Las fuentes para escuelas, servicios, cuerpos de agua, riesgo y vías proceden del repositorio de origen: **no atribuirles autoría oficial si no existe procedencia documental**.
- El mapa no debe modificar puntos GPS ni convertir puntos representativos de encuestas en ubicaciones residenciales.
- Las distancias entre puntos WGS84 requieren cálculo geodésico; no inferir distancia vial a partir de longitud directa.
- La representación será vectorial en Leaflet sin teselas de municipios exteriores; recortar visualmente los elementos lineales/poligonales al límite municipal.

## Inventario reproducible
- `veredas-subachoque.geojson`: 17 entidades, tipos Polygon/MultiPolygon, 9720 posiciones, bbox [-74.231710, 4.856550, -74.079710, 5.073620], coordenadas inválidas 0, anillos abiertos 0, SHA origen `02a31eb3c5bd0e8f35196327e0667234484b5a37`.
- `limite-subachoque.geojson`: 1 entidades, tipos Polygon, 4078 posiciones, bbox [-74.230870, 4.856740, -74.079710, 5.073620], coordenadas inválidas 0, anillos abiertos 0, SHA origen `bf11e7acba208054a47f57f466b50d18fbe586fd`.
- `casco-urbano-subachoque.geojson`: 1 entidades, tipos Polygon, 344 posiciones, bbox [-74.177700, 4.923370, -74.166770, 4.935230], coordenadas inválidas 0, anillos abiertos 0, SHA origen `afd3cd80a64fd5326878e0e47aba7027f34ba234`.
- `vias-terciarias.geojson`: 723 entidades, tipos LineString, 17443 posiciones, bbox [-74.238928, 4.856714, -74.070282, 5.095130], coordenadas inválidas 0, anillos abiertos 0, SHA origen `27d81d08236805fb8fbd96f008823a95623db469`.
- `cuerpos-agua-subachoque.geojson`: 7 entidades, tipos Polygon/Point/LineString, 17 posiciones, bbox [-74.211500, 4.895000, -74.149000, 4.962800], coordenadas inválidas 0, anillos abiertos 0, SHA origen `2cd8f5cdfacff210e24328113d916d1ff48f1dd2`.
- `escuelas-subachoque.geojson`: 17 entidades, tipos Point, 17 posiciones, bbox [-74.209836, 4.877096, -74.117677, 5.037358], coordenadas inválidas 0, anillos abiertos 0, SHA origen `b9d2df4af9b514f393b0826b16fcf8c4ff7458f9`.
- `servicios-subachoque.geojson`: 11 entidades, tipos Point, 11 posiciones, bbox [-74.173500, 4.928500, -74.171800, 4.930500], coordenadas inválidas 0, anillos abiertos 0, SHA origen `7d696bb77b8c27409f811229d85d56e93deb679f`.
- `amenaza-inundacion-subachoque.geojson`: 20 entidades, tipos Polygon, 1031 posiciones, bbox [-74.181595, 4.920259, -74.163271, 4.938124], coordenadas inválidas 0, anillos abiertos 0, SHA origen `8ea438b90451997d0a3f505f000a6e0f712b10ac`.

## Pendientes para validación geográfica formal
- Comprobar topología (autointersecciones, solapes, huecos entre veredas, coherencia del casco urbano) con GEOS/QGIS.
- Comparar la base municipal/veredal con cartografía de IGAC/DANE actualizada y registrar fecha, escala y error posicional.
- Verificar puntos de control externos con método geodésico y trazabilidad antes de afirmar exactitud de predios.
- Auditar las fuentes de colegios, vías y servicios: algunos atributos proceden de la base de encuestas y no prueban ubicación certificada.

## Límites visuales y privacidad
- El encuadre y los límites de navegación solo incluyen Subachoque; la ausencia de un mapa base evita mostrar otros municipios.
- No representar viviendas ni coordenadas particulares públicamente sin autorización y fundamento de tratamiento.
