import type { MonthData, Venue, Week, Entry } from "./types";

const MESES = [
  "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
  "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE",
];

/** RFC-tolerant CSV → string[][] (handles quotes, commas, CRLF). */
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
      // swallow; \n handles the break
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

const SEMANA_RE = /SEMANA\s+(\d+)\s*(?:\(([^)]*)\))?/i;

interface ActiveWeek {
  nameCol: number;
  paxCol: number;
  week: Week;
}

/**
 * Parse the published sheet CSV into structured months/venues/weeks.
 * Layout: month header → venue header (CAPS) → "SEMANA n (dd & dd)" rows that
 * place up to two weeks side by side → "NOMBRE,PAX" header → entry rows →
 * "TOTAL SEMANA n" row.
 */
export function parseSheet(csv: string): MonthData[] {
  const rows = parseCsv(csv);
  const months: MonthData[] = [];
  let month: MonthData | null = null;
  let venue: Venue | null = null;
  let active: ActiveWeek[] = [];

  const looksLikeVenue = (cells: string[]) => {
    const head = clean(cells[0]);
    if (!head) return false;
    if (isMonth(head)) return false;
    if (/^(SEMANA|NOMBRE|TOTAL|PAX)/i.test(head)) return false;
    // venue rows are short labels (a single CAPS-ish word/brand)
    const rest = cells.slice(1).map(clean).filter(Boolean);
    const restNonNumeric = rest.some((v) => !/^\d+$/.test(v));
    return head.length <= 24 && !restNonNumeric && head === head.toUpperCase();
  };

  for (const cells of rows) {
    const c0 = clean(cells[0]);

    // Month boundary
    if (isMonth(c0)) {
      month = { mes: c0.toUpperCase(), venues: [] };
      months.push(month);
      venue = null;
      active = [];
      continue;
    }
    if (!month) {
      // Allow data before an explicit month header by synthesizing one.
      month = { mes: "MES", venues: [] };
      months.push(month);
    }

    // Venue boundary
    if (looksLikeVenue(cells)) {
      venue = { nombre: c0.toUpperCase(), weeks: [], pax: 0, reservas: 0 };
      month.venues.push(venue);
      active = [];
      continue;
    }
    if (!venue) continue;

    // Week header(s) — may place two weeks side by side. A header cell *starts*
    // with "SEMANA n"; "TOTAL SEMANA n" rows must NOT be caught here (they begin
    // with TOTAL and are handled below), otherwise they spawn phantom weeks.
    const isWeekHeader =
      !/^TOTAL/i.test(c0) &&
      cells.some((cell) => /^SEMANA\s+\d+/i.test(clean(cell)));
    if (isWeekHeader) {
      active = [];
      cells.forEach((cell, col) => {
        const cc = clean(cell);
        if (!/^SEMANA\s+\d+/i.test(cc)) return; // skip blanks & TOTAL cells
        const m = cc.match(SEMANA_RE);
        if (!m) return;
        const week: Week = {
          index: parseInt(m[1], 10),
          label: cc,
          dias: (m[2] ?? "").trim(),
          entries: [],
          pax: 0,
          reservas: 0,
        };
        venue!.weeks.push(week);
        active.push({ nameCol: col, paxCol: col + 1, week });
      });
      continue;
    }

    // Column header row "NOMBRE,PAX,..." → skip
    if (/^NOMBRE$/i.test(c0)) continue;

    // Totals row — records the official total, then closes the block
    if (/^TOTAL/i.test(c0)) {
      active.forEach((a) => {
        // TOTAL value sits in the cell right after each "TOTAL SEMANA n" label
        const totalCell = cells[a.nameCol + 1];
        const total = toInt(totalCell);
        if (a.week.entries.length === 0 && total > 0) a.week.pax = total;
      });
      active = [];
      continue;
    }

    // Entry rows
    if (active.length) {
      for (const a of active) {
        const nombre = clean(cells[a.nameCol]);
        if (!nombre || /^(NOMBRE|TOTAL)/i.test(nombre)) continue;
        const pax = toInt(cells[a.paxCol]);
        const entry: Entry = { nombre, pax };
        a.week.entries.push(entry);
      }
    }
  }

  // Aggregate weeks → venues
  for (const m of months) {
    for (const v of m.venues) {
      for (const w of v.weeks) {
        if (w.entries.length) {
          w.pax = w.entries.reduce((s, e) => s + e.pax, 0);
          w.reservas = w.entries.length;
        }
      }
      v.pax = v.weeks.reduce((s, w) => s + w.pax, 0);
      v.reservas = v.weeks.reduce((s, w) => s + w.reservas, 0);
    }
  }

  return months;
}
