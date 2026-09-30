# Auditoría y alcance — V5.1 Stabilization

Base auditada: `web-v5-delivery-baseline` en `f0f72eff93c22cfd38b021f57c802f175f761fbc`.

## Corregido en este parche

- Hero local declarado pero nunca activado.
- Prioridad de medios distinta a la documentada.
- MP4 con autoplay aun estando oculto.
- Navegación sin URL compartible.
- Recarga que regresaba a Home.
- Atrás/Adelante sin comportamiento de vistas.
- Título de documento fijo.
- Banner móvil con altura fija susceptible a solapamiento.
- Menú móvil enfocable estando cerrado.
- Falta de `aria-expanded`, `aria-current`, focus trap y cierre con Escape.
- Falta de enlace para saltar al contenido.
- Animaciones y slideshow sin respeto a `prefers-reduced-motion`.
- Botones de identidad/institucionales que aparentaban funcionar sin destino.
- Login sin validación ni comunicación de estado.
- CSS y JavaScript incrustados dentro de `index.html`.
- Ausencia de un chequeo estático automatizado.

## No incluido a propósito

- Supabase.
- Autenticación real.
- Persistencia.
- Datos dinámicos.
- Verificación de las cifras institucionales hardcodeadas.
- Descarga/localización de fotografías Wikimedia.
- Reemplazo de contenido provisional por contenido oficial.

Estos puntos requieren una fase funcional y fuentes oficiales; incluirlos en el mismo parche aumentaría el riesgo de romper la baseline visual.
