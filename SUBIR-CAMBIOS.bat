@echo off
REM BRUMA - Sube el proyecto completo a GitHub con doble clic (Windows)
cd /d "%~dp0"

where git >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Git no esta instalado. Descargalo de: https://git-scm.com/downloads
  pause
  exit /b 1
)

echo --- Preparando el proyecto...
rmdir /s /q .git 2>nul
git init -b main
git add -A
git -c user.name="Renee Constantino" -c user.email="rene.constantino12@gmail.com" commit -m "App BRUMA completa: estructura Next.js, login Google, dashboard y APIs"

echo --- Subiendo a GitHub...
git remote remove origin 2>nul
git remote add origin https://github.com/reneeconstantino/appclientesHOG.git
git push -f origin main

echo.
echo [OK] Listo. Si Vercel esta conectado al repo, el deploy arranca solo.
echo      Revisa: https://vercel.com/dashboard
pause
