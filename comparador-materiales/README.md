# Comparador de materiales de obra (web aparte)

Web estática, separada de la app, con precios públicos de materiales básicos de reforma en almacenes de Madrid. Una página indexable por material, con título y descripción propios, datos estructurados `Product` + `AggregateOffer` y llamada a darse de alta como reformista en ReformaMejor.

- Datos: `datos/precios.json` (solo precios públicos de la web de cada almacén, IVA incluido, con enlace y fecha; nunca tarifas privadas).
- Generar: `node comparador-materiales/generar.mjs [carpeta]` (sin dependencias). Sale en `comparador-materiales/dist` por defecto.
- Variables: `SITE_URL` (dominio definitivo), `REGISTRO_URL` (alta de reformistas), `NOMBRE_WEB`, `INDEXAR=1` (solo en el dominio definitivo; la vista previa lleva `noindex`).
- Vista previa: el flujo de la demo la publica en `/comparador-materiales/` de GitHub Pages.
- Para el dominio propio: repositorio aparte con GitHub Pages (o Vercel/Netlify) que ejecute el generador con `SITE_URL=https://<dominio>` e `INDEXAR=1`.

Actualizar precios: editar `datos/precios.json` (precio, enlace) y cambiar `fecha`.
