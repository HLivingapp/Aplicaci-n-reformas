# AyudasVivienda (web aparte)

Web estática, separada de la app, con las ayudas de vivienda más relevantes de España para comprar, reformar o alquilar: aval ICO hipoteca joven, Mi Primera Vivienda (Madrid), préstamo TU CASA, reforma en tu hipoteca, ayudas para ventanas, deducción IRPF por eficiencia, CAE, IVA del 10 %, subvenciones de rehabilitación, ventajas fiscales en Madrid y Bono Alquiler Joven.

Cada ficha tiene: en qué consiste, cifras clave, requisitos, bancos adheridos (lista oficial con buscador), checklist de documentación que se marca, se guarda en el dispositivo y se imprime con el banco elegido, pasos, preguntas frecuentes (FAQPage), enlaces oficiales, fuentes con fecha, hueco de vídeo y llamada a ReformaMejor.

- Datos: `datos/ayudas.mjs` (fuentes oficiales con fecha; al revisar, cambia `FECHA`, `comprobado` y `estado`).
- Vídeos: deja `public/videos/<slug>.mp4` (y `<slug>.jpg` de portada) y se incrustan solos en la ficha. Guiones HeyGen en la carpeta del proyecto `videos-heygen/ayudas-vivienda-heygen.md`.
- Generar: `node ayudas-vivienda/generar.mjs [carpeta]` (sin dependencias). Sale en `ayudas-vivienda/dist` por defecto.
- Variables: `SITE_URL` (dominio definitivo), `REFORMAMEJOR_URL`, `NOMBRE_WEB`, `INDEXAR=1` (solo en el dominio definitivo; la vista previa lleva `noindex`).
- Vista previa: el flujo de la demo la publica en `/ayudas-vivienda/` de GitHub Pages.
- Para el dominio propio: repositorio aparte con GitHub Pages (o Vercel/Netlify) que ejecute el generador con `SITE_URL=https://<dominio>` e `INDEXAR=1`.
