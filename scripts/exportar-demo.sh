#!/usr/bin/env bash
# Genera la versión estática de demostración en ./out (sin API ni servidor).
# Con NUBE_SUPABASE_URL y NUBE_SUPABASE_ANON_KEY (variables del repositorio en GitHub), quien entra con
# su email guarda sus datos en Supabase directamente desde el navegador (protegidos por RLS).
# Sin ellas, todo se guarda en el navegador como siempre. Nunca pongas aquí la clave service_role.
set -euo pipefail
cd "$(dirname "$0")/.."
BASE="${1:-/Aplicaci-n-reformas}"
apartado="$(mktemp -d)"
mv src/app/api "$apartado/api"
trap 'mv "$apartado/api" src/app/api' EXIT
rm -rf .next out
EXPORTAR=1 NEXT_PUBLIC_ESTATICA=1 NEXT_PUBLIC_BASE_PATH="$BASE" NEXT_PUBLIC_SUPABASE_URL="${NUBE_SUPABASE_URL:-}" NEXT_PUBLIC_SUPABASE_ANON_KEY="${NUBE_SUPABASE_ANON_KEY:-}" npx next build
touch out/.nojekyll
