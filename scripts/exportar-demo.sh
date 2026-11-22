#!/usr/bin/env bash
# Genera la versión estática de demostración en ./out (sin API ni base de datos).
set -euo pipefail
cd "$(dirname "$0")/.."
# Sin argumento: subcarpeta de github.io. Con "" (dominio propio reformamejor.es): raíz.
BASE="${1-/Aplicaci-n-reformas}"
apartado="$(mktemp -d)"
mv src/app/api "$apartado/api"
trap 'mv "$apartado/api" src/app/api' EXIT
rm -rf .next out
EXPORTAR=1 NEXT_PUBLIC_ESTATICA=1 NEXT_PUBLIC_BASE_PATH="$BASE" NEXT_PUBLIC_SUPABASE_URL= NEXT_PUBLIC_SUPABASE_ANON_KEY= npx next build
touch out/.nojekyll
