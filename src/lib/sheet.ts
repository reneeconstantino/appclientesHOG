import type { MonthData, Venue, Week, Entry } from "./types";

const MESES = [
  "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
  "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE",
];

/** RFC-tolerant CSV → string[][] (comillas, comas, CRLF). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c === "\r") {
      // swallow; \n cierra la línea
    } else {
      field += c;
    }
  }
  row.push(field);
  rows.push(row);
  return rows;
}

const clean = (s: string | undefined) => (s ?? "").trim();
const isMonth = (s: string) => MESES.includes(clean(s).toUpperCase());
const toInt = (s: string | undefined) => {
  const n = parseInt(clean(s).replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
};

const SEMANA_RE = /^SEMANA\s+(\d+)\s*(?:\(([^)]*)\))?/i;
const RP_RE = /^RP\s*\d+/i;        // "RP1", "RP2", "RP1 - RENEE"
const RP_ID_RE = /^RP\s*(\d+)/i;
const KEYWORD_RE = /^(SEMANA|NOMBRE|TOTAL|PAX|RP\s*\d|SUMA)/i;
// día exacto opcional al final del nombre: "María López (05)"
const FECHA_RE = /\((\d{1,2})\)\s*$/;

interface Col {
  nameCol: number;
  paxCol: number;
  week: Week;
  rpId: string | null;     // "RP1".. o null (propia)
  rpLabel: string | null;
}

/** Extrae fechas de un label de semana: "SEMANA 1 (05 & 06)" → ["05","06"]. */
function parseFechas(dias: string): string[] {
  return dias
    .split(/&|,|\s+y\s+/i)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const m = s.match(/\d{1,2}/);
      return m ? m[0].padStart(2, "0") : s;
    });
}

/**
 * Parsea el CSV del Sheet "GUEST LIST HOG".
 * Estructura: mes → venue (BRUMA/CALMA) → cabecera de semana(s) lado a lado →
 * (opcional) sub-cabecera por RP ("RP1 - RENEE", "RP2"...) → "NOMBRE,PAX" →
 * filas de reservas → "TOTAL SEMANA n". Las entradas sin RP son propias.
 */
export function parseSheet(csv: string): MonthData[] {
  const rows = parseCsv(csv);
  const months: MonthData[] = [];
  let month: MonthData | null = null;
  let venue: Venue | null = null;
  let cols: Col[] = [];

  const looksLikeVenue = (cells: string[]) => {
    const head = clean(cells[0]);
    if (!head || KEYWORD_RE.test(head) || isMonth(head)) return false;
    if (!/[A-ZÁÉÍÓÚÑ]/.test(head)) return false;            // debe tener letras
    if (head !== head.toUpperCase()) return false;          // venues en MAYÚSCULAS
    if (head.length > 24) return false;
    const rest = cells.slice(1).map(clean).filter(Boolean);
    return rest.every((v) => /^\d+$/.test(v));              // resto numérico o vacío
  };

  for (const cells of rows) {
    const c0 = clean(cells[0]);

    // 1) Mes
    if (isMonth(c0)) {
      month = { mes: c0.toUpperCase(), venues: [] };
      months.push(month);
      venue = null;
      cols = [];
      continue;
    }
    if (!month) {
      month = { mes: "MES", venues: [] };
      months.push(month);
    }

    // 2) Cabecera de semana(s) — puede haber dos lado a lado
    const isWeekHeader =
      !/^TOTAL/i.test(c0) &&
      cells.some((cell) => SEMANA_RE.test(clean(cell)));
    if (isWeekHeader) {
      if (!venue) {
        venue = { nombre: "GENERAL", weeks: [] };
        month.venues.push(venue);
      }
      cols = [];
      cells.forEach((cell, col) => {
        const cc = clean(cell);
        const m = cc.match(SEMANA_RE);
        if (!m) return;
        const dias = (m[2] ?? "").trim();
        const week: Week = {
          index: parseInt(m[1], 10),
          label: cc,
          dias,
          fechas: parseFechas(dias),
          entries: [],
        };
        venue!.weeks.push(week);
        cols.push({ nameCol: col, paxCol: col + 1, week, rpId: null, rpLabel: null });
      });
      continue;
    }

    // 3) Sub-cabecera por RP (actualiza el RP activo de cada columna)
    if (cols.length && cols.some((col) => RP_RE.test(clean(cells[col.nameCol])))) {
      for (const col of cols) {
        const cc = clean(cells[col.nameCol]);
        const m = cc.match(RP_ID_RE);
        if (m) {
          col.rpId = `RP${parseInt(m[1], 10)}`;
          col.rpLabel = cc;
        }
      }
      continue;
    }

    // 4) Cabecera de columnas "NOMBRE,PAX" → ignorar
    if (/^NOMBRE$/i.test(c0)) continue;

    // 5) Totales → cierra el bloque
    if (/^TOTAL/i.test(c0)) {
      cols = [];
      continue;
    }

    // 6) Cabecera de venue (solo cuando no estamos dentro de un bloque)
    if (cols.length === 0 && looksLikeVenue(cells)) {
      venue = { nombre: c0.toUpperCase(), weeks: [] };
      month.venues.push(venue);
      continue;
    }

    // 7) Filas de reservas
    if (cols.length) {
      for (const col of cols) {
        let nombre = clean(cells[col.nameCol]);
        if (!nombre || KEYWORD_RE.test(nombre)) continue;
        let fecha: string | null = null;
        const fm = nombre.match(FECHA_RE);
        if (fm) {
          fecha = fm[1].padStart(2, "0");
          nombre = nombre.replace(FECHA_RE, "").trim();
        }
        const entry: Entry = {
          nombre,
          pax: toInt(cells[col.paxCol]),
          rp: col.rpId,
          rpLabel: col.rpLabel,
          fecha,
        };
        col.week.entries.push(entry);
      }
    }
  }

  // Limpieza: descarta venues sin reservas reales (plantilla vacía) salvo que
  // sean los únicos, para que la app no muestre meses fantasma.
  return months;
}

/** True si el mes no trae PAX real (plantilla vacía o nombres sueltos sin PAX). */
export function monthIsEmpty(m: MonthData | undefined): boolean {
  if (!m) return true;
  return m.venues.every((v) =>
    v.weeks.every((w) => w.entries.every((e) => e.pax <= 0)),
  );
}
