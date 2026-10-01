# M1 - Refactor cero-cambio

## Base

`production/v2.3-canonical`
`cd898beab794815a69c6516e1dbeb672f0ccc20e`

## Hallazgo

La V2.3 ya tiene CSS y JavaScript separados:

- `index.html`
- `css/app.css`
- `js/app.js`
- `js/requirements.js`

Por lo tanto M1 no necesita reescribir la aplicacion.

## Alcance

M1 solo prepara:

- higiene Git
- politica LF/CRLF
- package.json
- tooling de validacion
- documentacion

## Archivos protegidos

- `index.html`
- `css/`
- `js/`
- `data/`
- `assets/`

Estos archivos deben permanecer sin cambios durante M1.

## Gate

`npm run verify:m1` debe terminar con 0 FAIL.

## Siguiente fase

M2 agregara:

- `data-ti-id`
- `editor/registry.json`
- clasificacion protected/advanced
- validador de identidad editorial
