# Documento original del Plan Estadístico Territorial — 2.1 Conoce

## Ruta permanente del archivo

`assets/docs/plan-estadistico-territorial-original.pdf`

Esta es la **única ruta** que utiliza el botón «Ver documento» y el visor integrado de **2.1 Conoce**.

**No se debe subir una transcripción, una reconstrucción ni una imagen del PDF.** Subir el archivo PDF original completo, conservando texto, tablas, fotografías, gráficos, paginación y maquetación.

## Incorporación inicial, una sola vez

1. Abrir el repositorio `ronnylopez342/TERRITORIO_INTELIGENTE` en GitHub.
2. Seleccionar la rama `production/v2.6-canonical`.
3. Abrir la carpeta `assets/docs` y usar **Add file → Upload files**.
4. Adjuntar el PDF original, nombrado exactamente `plan-estadistico-territorial-original.pdf`. Confirmar el commit.
5. Publicar en Vercel la nueva revisión de esa rama en producción. La página detectará el PDF original por su tipo de archivo.

A partir de esa publicación, el documento estará disponible permanentemente para todas las visitas, en la misma ruta y para futuros despliegues. El usuario no tiene que cargarlo de nuevo ni en su tableta ni en su celular. Git mantiene el historial del archivo.

## Funcionamiento

- «Ver documento»: abre un visor PDF en un diálogo de la propia aplicación, sin abrir otra pestaña.
- «Descargar PDF»: descarga exclusivamente el original.
- Los cuatro «Ver más» permiten abrir el mismo visor en la página correspondiente del documento.
- Si el PDF no existe o no es servido como `application/pdf`, aparece el estado «PDF original pendiente de incorporar», sin mostrar una transcripción como si fuera el documento.
- No cambiar la ruta desde HTML o JavaScript al subir versiones posteriores del sitio.
- No sobrescribir el archivo existente salvo que el responsable del proyecto apruebe expresamente sustituirlo por una actualización oficial.

Documento recibido en la conversación: `Plan Territorial Estadistico.pdf`, 45 páginas, SHA-256: `201b487335dfcf3daab1a7f637208fc12dd835d95b8ded711bef8c7b7ac52e9c`.

## Respaldo

Rama antes de implementar este visor: `backup/antes-visor-original-conoce-20261017`.
