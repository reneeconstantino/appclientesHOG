import type { Guest } from "@/types";

// A "real ingress" counts arrivals, not invitations — the metric that matters
// at the door and in the Vegas/NYC/London standard: heads through the rope.
export function realArrivals(g: Guest): number {
  return g.llegaron;
}

// ── Client segmentation ─────────────────────────────────────────────────────
export type Frecuencia = "Viernes" | "Sábado" | "Ambos";
export type Retencion = "Nuevo" | "Regular" | "Leal";

export interface ClientStat {
  nombre: string;
  visitas: number;        // distinct nights attended
  totalPax: number;       // cumulative heads brought (incl. titular)
  dias: Set<string>;      // "Viernes" | "Sábado"
  fechas: Set<string>;    // distinct dates attended
  prs: Set<string>;       // which PRs brought them
  frecuencia: Frecuencia;
  retencion: Retencion;
}

function attended(g: Guest): boolean {
  return g.llegaron > 0;
}

export function clientStats(guests: Guest[]): ClientStat[] {
  const byName = new Map<string, ClientStat>();
  for (const g of guests) {
    if (!attended(g)) continue;
    const key = g.nombre.toLowerCase();
    let s = byName.get(key);
    if (!s) {
      s = {
        nombre: g.nombre,
        visitas: 0,
        totalPax: 0,
        dias: new Set(),
        fechas: new Set(),
        prs: new Set(),
        frecuencia: "Viernes",
        retencion: "Nuevo",
      };
      byName.set(key, s);
    }
    s.fechas.add(g.fecha || `${g.semana}-${g.dia}`);
    s.dias.add(g.dia);
    if (g.pr) s.prs.add(g.pr);
    s.totalPax += g.llegaron;
  }

  const out: ClientStat[] = [];
  for (const s of byName.values()) {
    s.visitas = s.fechas.size;
    const vie = s.dias.has("Viernes");
    const sab = s.dias.has("Sábado");
    s.frecuencia = vie && sab ? "Ambos" : sab ? "Sábado" : "Viernes";
    // Retention tiers: Regular = repeat visitor; Leal = habit-formed core.
    s.retencion = s.visitas >= 4 ? "Leal" : s.visitas >= 2 ? "Regular" : "Nuevo";
    out.push(s);
  }
  return out.sort((a, b) => b.visitas - a.visitas || b.totalPax - a.totalPax);
}

// Relevance score used to weight a PR's book (cartera). Loyal clients are worth
// more than raw volume — quality of book over quantity of names.
export function relevanceScore(retencion: Retencion): number {
  return retencion === "Leal" ? 3 : retencion === "Regular" ? 2 : 1;
}

// ── PR ranking ──────────────────────────────────────────────────────────────
export interface PrStat {
  pr: string;
  volumen: number;        // total real heads ingressed
  invitados: number;      // distinct titulares in book
  leales: number;
  regulares: number;
  nuevos: number;
  cartera: { nombre: string; retencion: Retencion; visitas: number }[];
  poder: number;          // weighted power index
}

export function prStats(guests: Guest[]): PrStat[] {
  const clients = clientStats(guests);
  const retByName = new Map(clients.map((c) => [c.nombre.toLowerCase(), c]));

  const byPr = new Map<string, PrStat>();
  for (const g of guests) {
    if (!g.pr) continue;
    let p = byPr.get(g.pr);
    if (!p) {
      p = { pr: g.pr, volumen: 0, invitados: 0, leales: 0, regulares: 0, nuevos: 0, cartera: [], poder: 0 };
      byPr.set(g.pr, p);
    }
    p.volumen += g.llegaron;
  }

  // Build each PR's distinct book with the client's global retention tier.
  const seen = new Map<string, Set<string>>();
  for (const g of guests) {
    if (!g.pr) continue;
    const p = byPr.get(g.pr)!;
    const set = seen.get(g.pr) || new Set<string>();
    const nameKey = g.nombre.toLowerCase();
    if (!set.has(nameKey)) {
      set.add(nameKey);
      seen.set(g.pr, set);
      const c = retByName.get(nameKey);
      const ret = c?.retencion || "Nuevo";
      p.cartera.push({ nombre: g.nombre, retencion: ret, visitas: c?.visitas || 0 });
      if (ret === "Leal") p.leales++;
      else if (ret === "Regular") p.regulares++;
      else p.nuevos++;
    }
  }

  for (const p of byPr.values()) {
    p.invitados = p.cartera.length;
    // Power = real volume + weighted quality of book. Rewards PRs who bring
    // heads AND cultivate loyalty, not just long lists.
    p.poder =
      p.volumen +
      p.leales * relevanceScore("Leal") * 2 +
      p.regulares * relevanceScore("Regular") * 2 +
      p.nuevos * relevanceScore("Nuevo");
    p.cartera.sort((a, b) => b.visitas - a.visitas);
  }
  return [...byPr.values()].sort((a, b) => b.poder - a.poder);
}

// ── Period filtering ────────────────────────────────────────────────────────
export type Periodo = "Semanal" | "Mensual" | "Trimestral" | "Anual";

export function filterByPeriod(guests: Guest[], periodo: Periodo, ref = new Date()): Guest[] {
  const days = periodo === "Semanal" ? 7 : periodo === "Mensual" ? 31 : periodo === "Trimestral" ? 92 : 366;
  const cutoff = new Date(ref);
  cutoff.setDate(cutoff.getDate() - days);
  return guests.filter((g) => {
    const d = new Date(g.fecha);
    if (isNaN(d.getTime())) return true; // undated rows always included
    return d >= cutoff && d <= ref;
  });
}
