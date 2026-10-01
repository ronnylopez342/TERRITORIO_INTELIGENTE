# Territorio Inteligente

## Baseline productiva

- Rama: `production/v2.3-canonical`
- Commit: `cd898beab794815a69c6516e1dbeb672f0ccc20e`
- Build: `territorio-demo-functional-v2.3-realista-editorial`

La rama `main` es historica y no debe asumirse como produccion.

## Estructura actual

- `index.html` - estructura principal
- `css/app.css` - estilos
- `js/app.js` - navegacion y comportamiento base
- `js/requirements.js` - funcionalidades y render dinamico
- `data/` - datos JSON y GeoJSON
- `assets/` - imagenes y video
- `scripts/` - validadores de desarrollo

## Ejecutar localmente

`python -m http.server 8080`

Luego abrir `http://localhost:8080`.

## Validacion

`npm run verify:m1`

## Regla del Modo Diseno

Git y los archivos fuente son la fuente de verdad.
El futuro editor visual debe modificar HTML/CSS real mediante transformaciones estructuradas.
Supabase no reemplaza el codigo fuente.
Vercel produccion no se edita directamente.
