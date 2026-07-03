import { google } from "googleapis";
import type { Guest, WeekNote, Side, AsistenciaStatus } from "@/types";

// ── Auth: service account con acceso de Editor a la hoja. ───────────────────
// Los usuarios entran por NextAuth (Google) y el server hace TODAS las
// operaciones. Único punto donde se aplican las reglas de escritura por columna.
//
// GOOGLE_SA_PRIVATE_KEY acepta dos formatos:
//   - Base64 de la llave PEM completa (recomendado: una sola línea sin \n
//     ni comillas, resistente a copiar/pegar mal en la UI de Vercel).
//   - PEM crudo con \n literales, tal como viene en el JSON de Google.
function normalizePrivateKey(raw: string): string {
  const value = (raw || "").trim();
  if (value.includes("BEGIN PRIVATE KEY")) {
    return value.replace(/\\n/g, "\n");
  }
  return Buffer.from(value, "base64").toString("utf8");
}

function getSheetsClient() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SA_EMAIL,
    key: normalizePrivateKey(process.env.GOOGLE_SA_PRIVATE_KEY || ""),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

const SHEET_ID = process.env.SHEET_ID!;
const YEAR = Number(process.env.SHEET_YEAR || new Date().getFullYear());

// Pestaña: usa SHEET_TAB si está definida; si no, descubre la primera pestaña
// real de la hoja, para que un nombre distinto de "bruma" no rompa la lectura.
let cachedTab: string | null = null;
async function resolveTab(sheets: ReturnType<typeof getSheetsClient>): Promise<string> {
  const envTab = (process.env.SHEET_TAB || "").trim();
  if (envTab) return envTab;
  if (cachedTab) return cachedTab;
  const meta = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
    fields: "sheets.properties.title",
  });
  cachedTab = meta.data.sheets?.[0]?.properties?.title || "Hoja 1";
  return cachedTab;
}

// A1 notation exige comillas simples si el nombre lleva espacios/acentos.
function quoteTab(tab: string): string {
  return `'${tab.replace(/'/g, "''")}'`;
}

const MONTHS: Record<string, number> = {
  ENERO: 1, FEBRERO: 2, MARZO: 3, ABRIL: 4, MAYO: 5, JUNIO: 6,
  JULIO: 7, AGOSTO: 8, SEPTIEMBRE: 9, OCTUBRE: 10, NOVIEMBRE: 11, DICIEMBRE: 12,
};

// Solo estas columnas se escriben. El resto es de solo lectura.
//   Viernes: ASISTENCIA = D · Sábado: ASISTENCIA = H · NOTAS = I
const ASIST_COL: Record<Side, string> = { V: "D", S: "H" };
const NOTAS_COL = "I";

function cell(row: string[] | undefined, i: number): string {
  return ((row?.[i] ?? "") + "").trim();
}

function dayDate(label: string, mesNum: number): string {
  const m = /(\d{1,2})/.exec(label || "");
  if (!m || !mesNum) return "";
  return `${YEAR}-${String(mesNum).padStart(2, "0")}-${String(parseInt(m[1], 10)).padStart(2, "0")}`;
}

// ── Codificación del estatus dentro de la única celda ASISTENCIA ────────────
// "" = nadie · "x/total" = parcial (conserva el conteo) · "COMPLETA" = cuota llena.
// Así se soporta el flujo parcial SIN agregar columnas nuevas a tu Excel.
function decodeAsistencia(raw: string, total: number): { llegaron: number; asistencia: AsistenciaStatus } {
  const v = (raw || "").trim();
  if (!v) return { llegaron: 0, asistencia: "" };
  if (/^(completa|si|sí|ok|x|listo|✓)$/i.test(v)) return { llegaron: total, asistencia: "Completa" };
  const frac = /^(\d+)\s*\/\s*(\d+)$/.exec(v);
  if (frac) {
    const n = Math.min(parseInt(frac[1], 10), total);
    return { llegaron: n, asistencia: n >= total ? "Completa" : "Parcial" };
  }
  if (/^\d+$/.test(v)) {
    const n = Math.min(parseInt(v, 10), total);
    return { llegaron: n, asistencia: n <= 0 ? "" : n >= total ? "Completa" : "Parcial" };
  }
  // Texto libre desconocido: asumimos que marcaron asistencia.
  return { llegaron: total, asistencia: "Completa" };
}

function encodeAsistencia(llegaron: number, total: number): string {
  if (llegaron <= 0) return "";
  if (llegaron >= total) return "COMPLETA";
  return `${llegaron}/${total}`;
}

function parseTotal(raw: string): number {
  const n = parseInt((raw || "").replace(/[^\d.]/g, ""), 10);
  return isNaN(n) || n < 1 ? 1 : n;
}

async function readGrid(): Promise<string[][]> {
  const sheets = getSheetsClient();
  const tab = await resolveTab(sheets);
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${quoteTab(tab)}!A1:I5000`,
  });
  return (res.data.values || []) as string[][];
}

// ── Parser de bloques. Espeja exactamente el layout del Excel. ──────────────
export async function getRoster(): Promise<{ guests: Guest[]; notes: WeekNote[] }> {
  const grid = await readGrid();
  return parseGrid(grid);
}

// Parser puro (sin red) — testeable de forma aislada.
export function parseGrid(grid: string[][]): { guests: Guest[]; notes: WeekNote[] } {
  const guests: Guest[] = [];
  const notes: WeekNote[] = [];

  let mes = "", mesNum = 0, semana = "";
  let leftActive = false, rightActive = false;
  let fV = "", fS = "";

  for (let idx = 0; idx < grid.length; idx++) {
    const row = grid[idx];
    const rowIndex = idx + 1; // 1-based físico
    const a = cell(row, 0), au = a.toUpperCase();
    const e = cell(row, 4), eu = e.toUpperCase();

    if (MONTHS[au]) { mes = au; mesNum = MONTHS[au]; continue; }
    if (au.startsWith("SEMANA")) { semana = a; leftActive = rightActive = false; continue; }

    const isDayHdr =
      /^(VIERNES|SABADO|SÁBADO)/.test(au) || /^(VIERNES|SABADO|SÁBADO)/.test(eu);
    if (isDayHdr) { fV = dayDate(a, mesNum); fS = dayDate(e, mesNum); continue; }

    const isSubHdr = au === "PR" || eu === "PR";
    if (isSubHdr) {
      leftActive = au === "PR";
      rightActive = eu === "PR";
      // Ancla de nota semanal: primera fila de datos del bloque, columna I.
      notes.push({ key: `${mes}·${semana}`, mes, semana, notaRow: rowIndex + 1, nota: "" });
      continue;
    }

    // Fila de datos.
    if (leftActive) {
      const nombre = cell(row, 1);
      if (nombre) {
        const total = parseTotal(cell(row, 2));
        const dec = decodeAsistencia(cell(row, 3), total);
        guests.push({
          id: `${rowIndex}-V`, rowIndex, side: "V", mes, semana, fecha: fV, dia: "Viernes",
          pr: cell(row, 0), nombre, total, ...dec,
        });
      }
    }
    if (rightActive) {
      const nombre = cell(row, 5);
      if (nombre) {
        const total = parseTotal(cell(row, 6));
        const dec = decodeAsistencia(cell(row, 7), total);
        guests.push({
          id: `${rowIndex}-S`, rowIndex, side: "S", mes, semana, fecha: fS, dia: "Sábado",
          pr: cell(row, 4), nombre, total, ...dec,
        });
      }
    }
  }

  // Rellena el texto real de cada nota semanal desde la columna I.
  for (const n of notes) {
    const r = grid[n.notaRow - 1];
    n.nota = cell(r, 8); // col I = índice 8
  }

  return { guests, notes };
}

async function writeCell(a1: string, value: string) {
  const sheets = getSheetsClient();
  const tab = await resolveTab(sheets);
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${quoteTab(tab)}!${a1}`,
    valueInputOption: "RAW",
    requestBody: { values: [[value]] },
  });
}

// Check-in: escribe SOLO la celda ASISTENCIA correspondiente (D o H).
// El estatus se calcula aquí desde la cuota; el cliente no lo puede desincronizar.
export async function recordCheckin(guest: Guest, llegaron: number) {
  const clamped = Math.max(0, Math.min(llegaron, guest.total));
  const encoded = encodeAsistencia(clamped, guest.total);
  await writeCell(`${ASIST_COL[guest.side]}${guest.rowIndex}`, encoded);
  const asistencia: AsistenciaStatus =
    clamped === 0 ? "" : clamped >= guest.total ? "Completa" : "Parcial";
  return { llegaron: clamped, asistencia };
}

// Nota semanal: escribe SOLO la columna I en la fila ancla del bloque.
export async function writeWeekNote(notaRow: number, nota: string) {
  await writeCell(`${NOTAS_COL}${notaRow}`, nota);
  return { nota };
}
