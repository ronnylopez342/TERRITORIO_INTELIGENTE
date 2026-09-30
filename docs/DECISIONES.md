# Decisiones vigentes — Territorio Inteligente Web

## Referencia visual

- Delivery Associates es la referencia principal de composición y lenguaje visual.
- Evitar estética genérica de SaaS/IA: exceso de tarjetas, degradados, iconos decorativos y bordes redondeados sin función.
- Priorizar fotografía/video de gran formato, composición editorial, contraste fuerte y jerarquía tipográfica.

## Navegación principal

- Home
- Data Territorio
- Plan de Desarrollo
- Unidad de Cumplimiento
- Políticas Públicas
- Insights
- Iniciar sesión

Las vistas cambian dentro del mismo sitio; no deben abrir nuevas pestañas del navegador.

Desde V5.1 cada vista utiliza una ruta por hash para permitir enlaces compartibles, recarga y navegación Atrás/Adelante sin requerir reglas especiales del servidor.

## Interacciones

- Hover de navegación en amarillo.
- `INICIAR SESIÓN` sustituye a `CONTACTO`.
- Banner superior orientado a explorar servicios.
- Las acciones sin destino o contenido formalmente definido deben mostrarse como "PRÓXIMAMENTE"; no se crean enlaces falsos ni capacidades inventadas.

## Hero Home

- Titular: **ASÍ CUMPLIMOS**.
- Video casi a pantalla completa.
- Fuente vigente: MP4 público en Supabase Storage (`asi-cumplimos-v1.mp4`).
- Respaldo local idéntico dentro del proyecto.
- No usar YouTube ni fotografías como fallback del hero.
- Fotografías quedan como último fallback.
- Con preferencia de movimiento reducido no se inicia video ni rotación automática.

## Contenido del Home

El Home debe conservar como base de contenido:

1. Noticias nacionales y departamentales.
2. Actualidad de la entidad.
3. Portafolio de servicios.
4. Aprendamos de nuestro territorio / identidad territorial.
5. Información institucional y redes.

## Regla de contenido

No inventar capacidades funcionales que aún no estén definidas. Políticas Públicas puede tener estructura visual provisional, pero su contenido funcional debe esperar definición formal.

## Regla de estabilidad V5.1

- `main` no se modifica durante la estabilización.
- `web-v5-delivery-baseline` se conserva intacta como rollback.
- Los cambios V5.1 se trabajan en `web-v5.1-stabilization`.
- Autenticación y Supabase quedan fuera de V5.1 para no mezclar estabilización de frontend con backend.
