# Territorio Inteligente — Web

Repositorio de trabajo para la identidad y experiencia web de **Territorio Inteligente**.

## Estado actual

Esta base corresponde a la línea visual aprobada durante la exploración inspirada en Delivery Associates: hero audiovisual de gran formato, navegación oscura superpuesta, titulares de alto impacto, bloques editoriales y navegación interna sin abrir nuevas pestañas del navegador.

La aplicación actual está contenida en `index.html` y maneja sus vistas internas con JavaScript.

## Ejecutar en Windows

Desde PowerShell, dentro de la carpeta del proyecto:

```powershell
python -m http.server 8080
```

Luego abrir:

```text
http://localhost:8080
```

Para detener el servidor: `Ctrl + C`.

## Video de “ASÍ CUMPLIMOS”

La opción preferida es un archivo local para evitar controles, subtítulos y elementos propios de YouTube.

1. Descargar/exportar el video como MP4.
2. Renombrarlo exactamente:
   `asi-cumplimos.mp4`
3. Guardarlo en:
   `assets/video/asi-cumplimos.mp4`
4. Recargar la web.

No hay que editar el HTML. Si el MP4 no existe, el sitio intenta usar el video de YouTube configurado en el código y, como último respaldo, las fotografías del hero.

## Estructura

```text
.
├─ index.html
├─ assets/
│  ├─ img/
│  │  └─ territorio-inteligente-logo.png
│  └─ video/
│     └─ asi-cumplimos.mp4   # se agrega cuando esté disponible
├─ docs/
│  └─ DECISIONES.md
└─ README.md
```

## Flujo de trabajo

- `main`: versión estable.
- Para cambios grandes: crear una rama, probar y luego integrar.
- Hacer commits pequeños con mensajes claros.
- No borrar versiones funcionales antes de confirmar la nueva.

Ejemplo:

```powershell
git checkout -b ajuste-home
git add .
git commit -m "Ajusta hero y navegacion del Home"
git push -u origin ajuste-home
```
