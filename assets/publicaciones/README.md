# Publicaciones municipales · 2.1 Conoce

Esta carpeta almacena los archivos **originales** que se muestran en la biblioteca de Publicaciones.

## Publicar un documento para todos los visitantes

1. Adjuntar el archivo original (PDF, PNG, JPG o WebP) a `assets/publicaciones/` en la rama `production/v2.6-canonical`.
2. Registrar el título y la ruta del archivo en `data/publicaciones.json`. Ejemplo de estructura:

```json
{
  "version": 1,
  "publicaciones": [
    {
      "titulo": "TÍTULO OFICIAL DEL DOCUMENTO",
      "tipo": "revista",
      "fecha": "AAAA-MM-DD",
      "resumen": "Resumen aprobado y verificable.",
      "archivo": "assets/publicaciones/NOMBRE-REAL.pdf",
      "portada": "assets/publicaciones/PORTADA-REAL.webp",
      "autor": "Dependencia responsable"
    }
  ]
}
```

La estructura anterior es **una plantilla**, no un documento existente. No crear registros ficticios ni publicar metadatos sin verificar.

Tipos reconocidos: `revista`, `boletin`, `paper`, `informe`, `grafico`, `ficha`, `serie`, `visualizacion`, `galeria`, `estudio`, `encuesta`.

El sistema valida que el archivo original apunte a esta carpeta y se sirva desde el mismo dominio. Cuando se publica una revisión en Vercel, las piezas reales aparecen en el catálogo y pueden leerse dentro de la misma aplicación.

## Diferencia importante con el gestor local

El botón «Gestionar publicaciones originales» sigue usando el almacenamiento local de `TIWorkspace` / `TIData`. Esos archivos y sus fichas permanecen en el navegador que los cargó; no se publican para el resto de ciudadanos hasta que el responsable incorpore los documentos al repositorio y al manifiesto.

La interfaz muestra seis portadas de ejemplo claramente marcadas como **DEMO / MUESTRA**, mientras no existan suficientes publicaciones reales. Son una referencia visual, no revistas o papers institucionales originales. No se permite descargarlas como si existiera el documento.

## Navegación

- Publicaciones está al final de **Data Territorio → 2.1 Conoce**, inmediatamente después de Plan Estadístico Territorial.
- La antigua pestaña `2.5 Publicaciones` fue retirada.
- Los vínculos antiguos se redirigen a `#data?seccion=data-conoce&bloque=publicaciones`.
- Los PDF auténticos se abren en un visor de la misma aplicación, sin pestañas adicionales.

## Respaldo

Rama de respaldo anterior a la migración: `backup/antes-publicaciones-dentro-conoce-20261017`.
