# Decisiones de diseño e historial — Territorio Inteligente Web

> **Vigencia operativa actualizada (16/11/2026):** este documento conserva decisiones de versiones anteriores (incluida V5.1). Para código y publicación la única rama oficial es `main`; las ramas V5 mencionadas abajo fueron eliminadas. Véanse [README](../README.md) y [auditoría maestra de 63 ramas](AUDITORIA_MAESTRA_RAMAS_20261116.md). Las instrucciones históricas de ramas no se deben ejecutar como si estuvieran vigentes.

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

## Regla histórica de estabilidad V5.1 (ya no vigente para ramas)

- `main` no se modifica durante la estabilización.
- `web-v5-delivery-baseline` se conserva intacta como rollback.
- Los cambios V5.1 se trabajan en `web-v5.1-stabilization`.
- Autenticación y Supabase quedan fuera de V5.1 para no mezclar estabilización de frontend con backend.

**Decisión posterior (16/11/2026):** el repositorio usa solo `main` en producción; `web-v5-delivery-baseline` y `web-v5.1-stabilization` no son ramas operativas. Toda recuperación se compara primero contra la versión actual y las nueve etiquetas históricas preservadas.
