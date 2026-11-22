# AyudasParaVivienda (web aparte) · ayudasparavivienda.com

Web estática, separada de la app, con las ayudas de vivienda más relevantes de España para comprar, reformar o alquilar: aval ICO hipoteca joven, Mi Primera Vivienda (Madrid), préstamo TU CASA, reforma en tu hipoteca, ayudas para ventanas, deducción IRPF por eficiencia, CAE, IVA del 10 %, subvenciones de rehabilitación, ventajas fiscales en Madrid y Bono Alquiler Joven.

Cada ficha tiene: en qué consiste, cifras clave, requisitos, bancos adheridos (lista oficial con buscador), checklist de documentación que se marca, se guarda en el dispositivo y se imprime con el banco elegido, pasos, preguntas frecuentes (FAQPage), enlaces oficiales, fuentes con fecha, hueco de vídeo y llamada a ReformaMejor.

- Datos: `datos/ayudas.mjs` (fuentes oficiales con fecha; al revisar, cambia `FECHA`, `comprobado` y `estado`).
- Vídeos: deja `public/videos/<slug>.mp4` (y `<slug>.jpg` de portada) y se incrustan solos en la ficha. Guiones HeyGen en la carpeta del proyecto `videos-heygen/ayudas-vivienda-heygen.md`.
- Generar: `node ayudas-vivienda/generar.mjs [carpeta]` (sin dependencias). Sale en `ayudas-vivienda/dist` por defecto.
- Dominio: https://ayudasparavivienda.com (por defecto en canonical y sitemap).
- Variables: `SITE_URL` (otro dominio), `REFORMAMEJOR_URL`, `NOMBRE_WEB`, `INDEXAR=1` (solo en el dominio definitivo; la vista previa lleva `noindex`).
- Vista previa: el flujo de la demo la publica en `/ayudas-vivienda/` de GitHub Pages.
- Publicar en el dominio: repositorio aparte con GitHub Pages que ejecute `INDEXAR=1 node generar.mjs dist` (genera también el `CNAME`), y en el registrador del dominio los registros DNS de GitHub Pages (A a 185.199.108.153, .109, .110 y .111; CNAME de www a <usuario>.github.io).

## Flujo para el repositorio propio (`.github/workflows/publicar.yml`)

```yaml
name: Publicar ayudasparavivienda.com
on: { push: { branches: [main] }, workflow_dispatch: {} }
permissions: { contents: write }
jobs:
  publicar:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: INDEXAR=1 node generar.mjs dist
      - uses: JamesIves/github-pages-deploy-action@v4
        with: { folder: dist, branch: gh-pages, single-commit: true }
```
