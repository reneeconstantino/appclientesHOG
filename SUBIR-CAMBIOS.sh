#!/usr/bin/env bash
# BRUMA · Sube el proyecto completo a GitHub con un solo comando (Mac / Linux)
# Uso:  doble clic no funciona en Mac para .sh — abre Terminal y ejecuta:
#       bash SUBIR-CAMBIOS.sh
set -e
cd "$(dirname "$0")"

if ! command -v git >/dev/null 2>&1; then
  echo "❌ Git no está instalado. Descárgalo de: https://git-scm.com/downloads"
  exit 1
fi

echo "── Preparando el proyecto…"
rm -rf .git
git init -b main >/dev/null
git add -A
git -c user.name="Renee Constantino" -c user.email="rene.constantino12@gmail.com" \
  commit -m "App BRUMA completa: estructura Next.js, login Google, dashboard y APIs" >/dev/null

echo "── Subiendo a GitHub (reemplaza el contenido actual de main)…"
git remote add origin https://github.com/reneeconstantino/appclientesHOG.git
git push -f origin main

echo ""
echo "✅ Listo. Vercel detectará el push y arrancará el deploy solo."
echo "   Revisa el progreso en: https://vercel.com/dashboard"
