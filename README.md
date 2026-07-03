# BRUMA · Panel de Accesos

Control de accesos mobile-first para after-club. Lee la lista de invitados desde
Google Sheets y escribe **solo** las columnas `Asistencia` y `Notas`. Login por
Google restringido a cuentas en lista blanca.

Stack: **Next.js 14 (App Router) · TypeScript · Tailwind · NextAuth (Google) · Google Sheets API (service account)**.

---

## 1. Estructura de la hoja (pestaña `bruma`)

La app se adapta **exactamente** a tu Excel actual — no hay que reestructurarlo.
El layout es por bloques, con dos listas lado a lado por semana:

```
JULIO                                            <- Mes (fila título)
SEMANA 1                                          <- Semana
VIERNES 3        |  ...  | SABADO 4      | ... | NOTAS   <- encabezado de día
PR NOMBRE PAX ASISTENCIA | PR NOMBRE PAX ASISTENCIA      <- sub-encabezado
RENEE  Ivar...  1        | RENEE  Ricardo... 9           <- datos
```

- **Columnas A–D** = lista del **Viernes** · **Columnas E–H** = lista del **Sábado**.
- **Columna I** = **NOTAS** (una por bloque de semana → "Notas de la semana" en la app).
- **PAX = total del grupo, titular incluido** (ej. "RICARDO HERNANDEZ + 8" → PAX 9).
  El total esperado de la app = PAX (no PAX+1).
- **ASISTENCIA** (col D para Viernes, col H para Sábado) la escribe la app y codifica
  el estatus en la misma celda, sin agregar columnas:
  - vacío = nadie llegó
  - `3/9` = grupo **parcial** (conserva el conteo, queda abierto)
  - `COMPLETA` = cuota llena
- La app solo escribe **D, H e I**. `PR`, `NOMBRE`, `PAX` quedan intactos (solo lectura).
- Los meses (JULIO, AGOSTO…) y semanas (SEMANA 1–5) se detectan solos; puedes
  seguir agregando bloques con el mismo formato y aparecerán en el selector.


---

## 2. Google Cloud — una sola vez

**a) Service account (lectura/escritura de la hoja)**
1. Google Cloud Console → crea proyecto → habilita **Google Sheets API**.
2. IAM & Admin → Service Accounts → crea una → Keys → **Add key (JSON)**.
3. Del JSON copia `client_email` → `GOOGLE_SA_EMAIL` y `private_key` → `GOOGLE_SA_PRIVATE_KEY`.
4. **Comparte la hoja** con ese `client_email` como **Editor**.

**b) OAuth (login de los hosts)**
1. APIs & Services → OAuth consent screen (External) → agrega los 3 correos como *Test users*.
2. Credentials → **Create OAuth client ID** → *Web application*.
3. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://TU-APP.vercel.app/api/auth/callback/google`
4. Copia Client ID/Secret a las env vars.

---

## 3. Local

```bash
npm install
cp .env.example .env.local   # y llena los valores
npm run dev                  # http://localhost:3000
```

---

## 4. Deploy en Vercel

1. Sube el repo a GitHub e impórtalo en Vercel.
2. En **Settings → Environment Variables** carga todo lo de `.env.example`
   (incluye `GOOGLE_SA_PRIVATE_KEY` completa entre comillas).
3. Fija `NEXTAUTH_URL` a la URL final de Vercel y agrega esa URL como redirect URI en Google.
4. Deploy.

---

## Cómo agregar o quitar un host
Edita `ALLOWED_EMAILS` (env var), agrégalo como *Test user* en OAuth, y redeploy.
Sin tocar código.

## Notas de seguridad
- Los usuarios nunca tocan Sheets: el server es el único que escribe, y solo en
  `Asistencia` / `Notas` (allowlist en `lib/sheets.ts`).
- Cada ruta de datos revalida sesión + lista blanca (`lib/guard.ts`).
- El estatus (`Parcial`/`Completa`) se calcula en el server desde la cuota, así el
  cliente no puede desincronizarlo.
