# Territorio Inteligente — V2.3 Realista Editorial

Esta versión parte de V2.2 y conserva sus funciones, rutas, datasets, importación/exportación y video oficial.

## Objetivo

Hacer que la plataforma se sienta como una experiencia editorial institucional, no como un dashboard genérico: más fotografía local, más jerarquía, más gráficos, testimonios ilustrativos, proyectos reconocibles y cifras compactas.

## Cambios V2.3

- HOME con áreas de impacto, ficha territorial y voces del territorio.
- Fotografías extraídas del video oficial de Territorio Inteligente para mantener coherencia local.
- DATA con ficha territorial, fotografía, referencias públicas y mejor jerarquía de gráficos.
- PLAN con presupuesto compacto, avance radial, barras por eje, fotografía y programas destacados.
- CUMPLIMIENTO con tres proyectos prioritarios en formato editorial, portafolio completo y voces de implementación.
- POLÍTICAS, INSIGHTS y SERVICIOS con piezas destacadas y medios visuales.
- Datos demográficos de referencia: población proyectada 2025 cercana a 18 mil habitantes (DANE).
- Proyectos inspirados en prioridades públicas reportadas para Subachoque: saneamiento, aulas, centro de salud, plaza/centro de acopio, Casa de la Mujer, acueductos y vías rurales.
- Valores de avance, presupuesto, contratos y desempeño que no estén vinculados a fuente oficial permanecen como estimaciones ilustrativas del prototipo.

## Ejecutar

```powershell
python -m http.server 8080
```

Abrir:

```text
http://localhost:8080/#home
```

Antes de publicación institucional, sustituir las estimaciones por datos certificados y validar cada fuente.


## Fuente canonica operativa

Desde 2026-10-06 la fuente de verdad para cambios activos de Territorio Inteligente es:

- Rama canonica: `production/v2.6-canonical`
- Flujo: GitHub -> Preview Vercel -> verificacion -> Promocion a Produccion
- Produccion: `https://territorio-inteligente.vercel.app`

Reglas operativas:

1. No usar `main` como fuente de produccion.
2. No editar produccion directamente si el cambio puede quedar primero en GitHub.
3. Todo cambio funcional o visual debe quedar committeado en la rama canonica.
4. Todo cambio debe probarse en un deployment candidato antes de promoverse.
5. Supabase se modifica solo cuando el cambio lo requiere, con verificacion de RLS/seguridad y prueba posterior.
6. Los cambios destructivos de datos requieren confirmacion explicita del usuario.
