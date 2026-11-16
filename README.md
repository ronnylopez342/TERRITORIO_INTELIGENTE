# TERRITORIO INTELIGENTE — CÓDIGO OPERATIVO

**Fuente oficial del proyecto (16/11/2026):** rama única [`main`](https://github.com/ronnylopez342/TERRITORIO_INTELIGENTE/tree/main). **Producción:** https://territorio-inteligente.vercel.app. Los despliegues de Vercel deben comprobarse contra el SHA exacto de `main`, además de verificar las pruebas GitHub Actions.

**Auditoría histórica:** [informe maestro de 63 ramas](docs/AUDITORIA_MAESTRA_RAMAS_20261116.md) · [matriz CSV de ramas y estados](docs/MATRIZ_RAMAS_20261116.csv) · [checklist vivo de recuperación](docs/CHECKLIST_RECUPERACION_FUNCIONAL_20261116.md) · [auditoría inicial y decisiones](docs/AUDITORIA_UNIFICACION_HISTORICA_20261116.md).

La limpieza del 16/11/2026 eliminó 63 ramas secundarias; 9 que tenían commits exclusivos se conservaron como etiquetas `archivo-20261116/...`. La historia completa permanece accesible en Git. **No está certificado que el 100 % de las capacidades históricas esté recuperado**: consultar los estados de la auditoría antes de reincorporar código antiguo.

## Referencia histórica: versión V2.3 Realista Editorial

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


## Flujo vigente de trabajo (actualizado 16/11/2026)

1. **Rama única:** `main` es la fuente de verdad. No utilizar `production/v2.6-canonical` ni otros nombres de ramas eliminadas.
2. **Auditar primero:** consultar la matriz de 63 ramas y comparar cada capacidad antigua con la implementación vigente. Un commit viejo no es necesariamente una mejora vigente.
3. **Cambios pequeños y trazables:** modificar solo la funcionalidad necesaria, añadir pruebas de regresión y registrar qué se recuperó, mejoró o descartó.
4. **Verificación automatizada:** revisar que el workflow de validación en `main` finalice con éxito. `READY` de Vercel no certifica la cobertura funcional ni visual.
5. **Producción:** confirmar que `https://territorio-inteligente.vercel.app` esté en `READY` y corresponda al mismo SHA que `main`. Los cambios de `main` pueden publicarse automáticamente por la integración Git de Vercel.
6. **Sin datos ficticios:** conservar procedencia y distinguir demostraciones de registros oficiales. Los cambios destructivos de datos requieren confirmación explícita.
7. **Recuperación histórica:** conservar intactas las nueve etiquetas `archivo-20261116/...` hasta que se cierre la auditoría funcional; nunca restaurar una instantánea antigua completa sobre el código nuevo.
8. **Seguridad operativa:** `main` no está protegida actualmente; habilitar protección y verificaciones obligatorias cuando la configuración del repositorio lo permita.

> Nota histórica: los apartados V2.3 anteriores describen una versión antigua y se mantienen para referencia. No constituyen instrucciones vigentes sobre ramas, CI o producción.
