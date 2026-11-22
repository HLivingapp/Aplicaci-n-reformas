# App Reformas

Aplicación web y móvil para gestionar los procesos de una empresa de reformas: desde que el cliente abre su proyecto hasta la entrega de la obra.

## Qué hace esta primera versión

**Cliente** (`/nuevo` y `/cliente`)
- Abre su proyecto de reforma en 7 pasos: dirección, vivienda, distribución (ahora / quiero), estado actual (techos, suelos, ventanas), instalaciones (climatización, agua caliente, fontanería, electricidad) y la reforma que quiere.
- Con la dirección se consulta el **Catastro** (m² construidos, año de construcción, referencia catastral). Si no se encuentra, se rellena a mano.
- Ve un **plano base orientativo** generado con sus m² y estancias, la parcela en la cartografía del Catastro y un enlace a Street View.
- Recibe una **estimación orientativa** (horquilla) calculada con el tarifario de la empresa.
- En su portal sigue el estado: solicitud, visita, presupuesto (que puede aceptar o rechazar) y el avance de la obra por fases, con las novedades que la empresa marca como visibles.
- Si quiere mantener una instalación con más de 20 años (configurable), la app no lo permite y explica por qué.

**Intranet de la obra** (`/obra/<clave>`)
- Se abre cuando el reformista mete el presupuesto acordado tras la visita. Cliente y reformista entran cada uno con su enlace privado (sin contraseña).
- **Contrato**: el contrato estándar de la app, que se firma ahí mismo.
- **Fases**: salen del plan de fases del presupuesto. El reformista empieza y termina cada fase; el cliente la valida o pide un repaso.
- En cada fase el reformista sube **fotos** (sin ubicación GPS), **certificados** (boletín eléctrico, residuos, garantías…) y **comentarios**; el cliente lo ve todo y también puede comentar y subir fotos.
- **Pagos**: los hitos del contrato. Se pagan fuera de la app; aquí el reformista los pide (al validar la fase que toca), el cliente marca que ha pagado y el reformista confirma el cobro.
- Demostración en `/obra` con una obra ficticia.

**Empresa** (`/empresa`)
- **Solicitudes**: datos de la vivienda, ficha catastral (búsqueda por dirección o referencia), cotización automática con costes y venta, plano y ubicación. Un clic crea el presupuesto con todas las partidas.
- **Presupuestos** por capítulos y partidas, con coste interno, margen, descuento, IVA (10% / 21%), impresión a PDF y envío al cliente.
- **Obras**: al aceptarse un presupuesto se crea la obra con fases tipo, diagrama de plazos, tareas y diario de obra.
- **Ajustes → Tarifario**: todas las medidas estándar y costes son editables. Precio de venta = coste × (1 + recargo, 40% por defecto). Se puede importar y exportar en JSON.

## Tarifario

El repositorio es público, así que solo incluye un **tarifario genérico de ejemplo** (`src/lib/tarifas.ts`). El tarifario real de la empresa se guarda fuera del repositorio y se importa desde *Ajustes → Tarifario → Importar*.

## Plataformas

Una sola aplicación web, adaptada al móvil e instalable como app (PWA: "Añadir a pantalla de inicio").

Para pasar a la base de datos real: [docs/puesta-en-marcha.md](docs/puesta-en-marcha.md).

## Desarrollo

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

Stack: Next.js (App Router) + TypeScript + Tailwind CSS.

## Limitaciones de esta versión

- Sin las variables de Supabase la app funciona en **modo demostración** (datos en el navegador). Con ellas, los datos van a la base de datos: el equipo entra con un enlace por email y cada cliente con su enlace privado `/p/<token>`, sin contraseñas.
- La consulta al Catastro usa los servicios públicos de la Sede Electrónica del Catastro desde el servidor (`/api/catastro`). País Vasco y Navarra tienen catastro foral y aún no están conectados.
- El plano es esquemático, no a escala.
