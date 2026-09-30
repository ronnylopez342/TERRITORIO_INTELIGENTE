# Territorio Inteligente — Matriz funcional V2

Esta versión agrega la **capa funcional** de los requisitos sin cambiar la identidad visual Delivery Associates ya adoptada.

## Cobertura incluida

- HOME: 10 capacidades / 40 RF.
- DATA TERRITORIO: 10 capacidades / 50 RF.
- PLAN DE DESARROLLO: 11 capacidades / 55 RF.
- UNIDAD DE CUMPLIMIENTO: 13 capacidades / 65 RF.
- Transversal: mapa de infraestructura y asistente virtual de consulta estructurada.

Total de RF documentados en la matriz principal: **210**.

## Qué queda funcional en frontend

- Navegación por módulos y capacidades.
- Registro y metadatos de fuentes.
- Alertas de vigencia cuando existe fecha de actualización.
- Repositorio local de documentos/publicaciones.
- Importación CSV/JSON; XLSX/XLS cuando el parser SheetJS CDN está disponible.
- Vista tabular y gráfica automática de bases importadas.
- Filtros sectoriales.
- Mapa real de 17 veredas desde `data/veredas-subachoque.geojson`, con detalle por vereda e importación de puntos/registros.
- Glosario buscable y exportable.
- Portafolio de servicios con requisitos, tiempos, costos, canales y enlaces configurables.
- Workspace de las 11 capacidades del PDM y 13 componentes de Unidad de Cumplimiento, cada uno con su checklist RF y carga/exportación de registros.
- Asistente TI local que busca sobre servicios, glosario y requisitos sin inventar respuestas.
- Modo editor local `?editor=1` para importar/exportar snapshots JSON.

## Integraciones que requieren credenciales o fuentes que no estaban en los archivos

No se inventaron endpoints, credenciales, noticias, cifras o datos municipales. Para pasar de frontend funcional a integración institucional faltan: feeds/API de noticias, base central de funcionarios, persistencia Supabase para contenido, datasets oficiales Excel, URL de resultados de Práctica País, integraciones SECOP y sistemas municipales. La interfaz y los puntos de conexión quedan preparados.

## Reconciliación Data Territorio

Los documentos entregados tienen dos versiones de numeración. La matriz general separa DANE, fuentes nacionales y fuentes departamentales (2.3/2.4/2.5), mientras el documento específico de Data agrupa nacionales+departamentales y desplaza los módulos siguientes. Para no eliminar ningún requisito, V2 conserva DANE como 2.3 y presenta 2.4–2.5 en un único workspace visual con selector Nacional/Departamental; internamente mantiene C4 y C5 separados en la matriz.
