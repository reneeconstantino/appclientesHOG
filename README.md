# BRUMA — Panel de Cumplimiento del Anexo

App web especializada para **gestionar, monitorear y visualizar los KPIs de cumplimiento del Anexo Bruma**. Lee tu Google Sheet, calcula tus obligaciones contractuales (PAX y reservas por semana / por mes) y entrega una **tarjeta ejecutiva exportable en imagen** para lectura instantánea desde el iPhone.

Diseño: estética *mist* oscura, vidrio esmerilado, acento champagne — pensada para sentirse nativa en iOS. Arquitectura: datos crudos del Sheet escondidos detrás de una interfaz limpia; toda la complejidad vive en el motor de KPIs, no en la pantalla.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14.2.35 (App Router) + React 18 |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS 3.4 + variables CSS propias |
| Animación | framer-motion |
| Gráficas | recharts |
| Exportar a imagen | html-to-image (PNG @ 3x) |
| Datos | Google Sheets publicado como CSV → ruta `/api/data` (server-side, sin CORS) |
| Hosting | Vercel |

## Estructura

```
src/
  app/            layout, estilos globales, página, y /api/data (lee el Sheet)
  lib/            types · config · sheet (parser) · kpi (motor) · seed (demo)
  components/     Dashboard + vistas (Resumen / Semanas / Metas) + tarjeta exportable
public/           ícono, manifest PWA (Añadir a inicio)
tests/            auditoría del parser y del motor de KPIs (25 pruebas)
```

## Desarrollo local

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # corre la auditoría (25/25)
npm run build      # build de producción
```

---

## Despliegue: GitHub → Vercel

### 1. Subir a GitHub
```bash
git init
git add .
git commit -m "BRUMA: panel de cumplimiento del Anexo"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/bruma.git
git push -u origin main
```

### 2. Importar en Vercel
1. Entra a **vercel.com → Add New → Project** e importa el repo.
2. Framework: **Next.js** (autodetectado). No cambies nada del build.
3. Agrega las **Environment Variables** (paso 3) antes de *Deploy*.
4. **Deploy.**

### 3. Conectar tu Google Sheet (datos en vivo)
La app trae datos de demostración por defecto. Para alimentarla con tu hoja real:

1. En tu Google Sheet: **Archivo → Compartir → Publicar en la web → CSV** (publica la pestaña del mes).
2. Copia el **ID del documento** (el tramo largo en la URL entre `/d/` y `/edit`).
3. En Vercel → **Settings → Environment Variables**:
   - `NEXT_PUBLIC_SHEET_ID` = tu ID de documento
   - `NEXT_PUBLIC_SHEET_GID` = el `gid` de la pestaña (0 si es la primera)
4. **Redeploy.** La etiqueta de origen pasará de `demo` a `en vivo`.

> La hoja se relee cada 60 s. Si la pestaña del mes está vacía o falla la lectura, la app cae con gracia a los datos de demostración para que el panel nunca se vea roto.

### 4. Definir las metas del Anexo
Las cifras contractuales reales se configuran dentro de la app, en la pestaña **Metas** (se guardan en el dispositivo). Ajusta: PAX meta mensual, PAX meta semanal, reservas meta del mes, PAX promedio objetivo por reserva y semanas operativas. Esos números son la base contra la que se mide todo el cumplimiento.

---

## El motor de KPIs

Por cada sede calcula: cumplimiento (% de la meta mensual), déficit de PAX, PAX promedio por reserva, ritmo semanal, proyección a fin de mes, semanas en meta, cumplimiento de reservas y delta semana contra semana. El estado (en meta / en riesgo / crítico) se deriva de umbrales sobre el cumplimiento. La lógica completa está cubierta por la suite en `tests/` — 25 pruebas sobre el parser de la hoja y el motor.
