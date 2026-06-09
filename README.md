# GUEST LIST HOG — Centro de control de RPs

App web para **monitorear el guest list de HOG (BRUMA, CALMA…) y medir el desempeño de cada RP**. Lee tu Google Sheet, calcula visitas (PAX) totales, propias y por RP, identifica **quién la rompe por día, por fin de semana y por mes**, sigue el **KPI de 150 visitas**, y arma **tarjetas ejecutivas exportables en PNG** para leer desde el iPhone.

Diseño: estética *mist* oscura, vidrio esmerilado, acento champagne — nativa en iOS. Toda la complejidad vive en el motor de KPIs; la pantalla queda limpia.

---

## Qué mide

| Métrica | De dónde sale |
|---|---|
| **Visitas (PAX) totales** | suma de PAX de todas las reservas |
| **Propias vs Vía RP** | reservas sin promotor (propias) vs atribuidas a un RP |
| **Ranking por RP** | RP1, RP2… ordenados por PAX, con % de participación |
| **Mejor RP por día / fin de semana / mes** | quién acumula más en cada ventana |
| **KPI 150 Visitas** | avance de PAX del mes contra la meta (editable) |

## Estructura del Sheet que entiende

```
JUNIO
BRUMA
SEMANA 1 (05 & 06)        SEMANA 2 (12 & 13)
RP1 - RENEE              RP1 - RENEE
NOMBRE   PAX             NOMBRE   PAX
…reservas…
RP2 …
TOTAL SEMANA 1   TOTAL SEMANA 2
CALMA                     ← venue sin RP: sus reservas son "propias"
SEMANA 1 …
```

- Cada **venue** (BRUMA, CALMA…) se divide en **semanas** (un fin de semana de 2 fechas).
- En BRUMA cada semana se subdivide por **RP** (`RP1 - RENEE`, `RP2`…). Las reservas sin RP son **propias**.
- **Detalle por día (opcional):** agrega el día entre paréntesis al final del nombre —
  `María López (05)` — y la app separa el 05 del 06. Sin eso, todo cuenta al fin de semana.

## Stack

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind · framer-motion · recharts · html-to-image (PNG @3x) · datos del Sheet vía `/api/data` (server-side, sin CORS) · Vercel.

## Desarrollo local

```bash
npm install
./node_modules/.bin/next dev     # http://localhost:3000
./node_modules/.bin/tsx tests/audit.ts   # auditoría del parser + motor
./node_modules/.bin/next build   # build de producción
```

> Nota: la carpeta del proyecto contiene `:` en la ruta, lo que rompe `npm run …`
> en local (`next: command not found`). Por eso se llaman los binarios directo.
> En Vercel no aplica (la ruta de checkout es limpia).

## Despliegue: GitHub → Vercel

1. `git push` (la estructura se sube intacta — **no** uses "Upload files" de la web, aplana las carpetas).
2. Vercel detecta el push y re-deploya solo.

### Conectar tu Google Sheet (datos en vivo)
La app trae datos demo por defecto. Para alimentarla con tu hoja real:

1. En Google Sheets: **Archivo → Compartir → Publicar en la web → CSV** (o comparte como "Cualquiera con el enlace: Lector").
2. En Vercel → **Settings → Environment Variables**:
   - `NEXT_PUBLIC_SHEET_ID` = el ID del documento (entre `/d/` y `/edit`)
   - `NEXT_PUBLIC_SHEET_GID` = el `gid` de la pestaña (0 por defecto)
3. **Redeploy.** La etiqueta pasará de `Demo` a `En vivo`.

> El Sheet se relee cada 60 s. Si está vacío (sin PAX) o falla la lectura, la app
> cae con gracia a los datos demo para que el panel nunca se vea roto.

## Reportes exportables (PNG)

Pestaña **Reportes** → cuatro entregables, cada uno se descarga como imagen:
1. **Guest List y Visitas (KPI)** · 2. **Performance Mensual** · 3. **Presencia de Marca** · 4. **Plan de Comunicación**.

Las partes cualitativas (plan, menciones, compromisos) se capturan en la pestaña **Metas** y se guardan en el dispositivo.
