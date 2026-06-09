import type {
  MonthData,
  Targets,
  Source,
  Snapshot,
  VenueStat,
  WeekStat,
  DayStat,
  RpStat,
  ScopeWinner,
  Estado,
} from "./types";
import { rpColor, venueColor, PROPIAS_COLOR } from "./config";

function estadoFromRatio(r: number): Estado {
  if (r >= 1) return "ok";
  if (r >= 0.75) return "warn";
  return "risk";
}

/** Entrada aplanada con todo su contexto, base de todos los agregados. */
interface Flat {
  venue: string;
  weekIndex: number;
  weekLabel: string;
  fecha: string | null;
  rpId: string | null;
  rpLabel: string | null;
  nombre: string;
  pax: number;
}

function flatten(month: MonthData): Flat[] {
  const out: Flat[] = [];
  for (const v of month.venues) {
    for (const w of v.weeks) {
      for (const e of w.entries) {
        out.push({
          venue: v.nombre,
          weekIndex: w.index,
          weekLabel: w.label,
          fecha: e.fecha,
          rpId: e.rp,
          rpLabel: e.rpLabel,
          nombre: e.nombre,
          pax: e.pax,
        });
      }
    }
  }
  return out;
}

function groupBy<T>(arr: T[], key: (t: T) => string): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const x of arr) {
    const k = key(x);
    (m.get(k) ?? m.set(k, []).get(k)!).push(x);
  }
  return m;
}

const sumPax = (es: Flat[]) => es.reduce((s, e) => s + e.pax, 0);

function prettyRp(id: string, label: string | null): string {
  const l = (label || id).replace(/\s*-\s*/g, " · ").replace(/\s+/g, " ").trim();
  return l || id;
}

function shortWeek(label: string): string {
  const m = label.match(/SEMANA\s+(\d+)\s*(?:\(([^)]*)\))?/i);
  if (!m) return label;
  return `S${m[1]}${m[2] ? ` · ${m[2].trim()}` : ""}`;
}

/** RPs (sin propias, desc) + agregado de propias, para un ámbito de entradas. */
function buildRpStats(
  entries: Flat[],
  scopeTotal: number,
): { byRp: RpStat[]; propias: RpStat | null } {
  const map = new Map<string, { pax: number; guests: number; label: string | null }>();
  let propiaPax = 0;
  let propiaGuests = 0;
  for (const e of entries) {
    if (e.rpId == null) {
      propiaPax += e.pax;
      propiaGuests += 1;
      continue;
    }
    const cur = map.get(e.rpId) ?? { pax: 0, guests: 0, label: e.rpLabel };
    cur.pax += e.pax;
    cur.guests += 1;
    if (!cur.label && e.rpLabel) cur.label = e.rpLabel;
    map.set(e.rpId, cur);
  }
  const total = scopeTotal || 1;
  const byRp: RpStat[] = [...map.entries()]
    .map(([id, v]) => ({
      id,
      label: prettyRp(id, v.label),
      color: rpColor(id),
      isPropia: false,
      pax: v.pax,
      guests: v.guests,
      paxProm: v.guests ? v.pax / v.guests : 0,
      sharePct: v.pax / total,
    }))
    .sort((a, b) => b.pax - a.pax || a.id.localeCompare(b.id, "es", { numeric: true }));
  const propias: RpStat | null =
    propiaGuests || propiaPax
      ? {
          id: "PROPIAS",
          label: "Propias",
          color: PROPIAS_COLOR,
          isPropia: true,
          pax: propiaPax,
          guests: propiaGuests,
          paxProm: propiaGuests ? propiaPax / propiaGuests : 0,
          sharePct: propiaPax / total,
        }
      : null;
  return { byRp, propias };
}

/** Mejor RP (no propia, pax>0) de un conjunto de entradas. */
function winnerOf(entries: Flat[]): RpStat | null {
  const { byRp } = buildRpStats(entries, sumPax(entries));
  return byRp.find((r) => r.pax > 0) ?? null;
}

/** Construye el campeón de un ámbito a partir de "cubos" (semanas o días). */
function scopeWinner(
  scope: "dia" | "finde",
  buckets: Map<string, Flat[]>,
  labelOf: (key: string) => string,
  globalById: Map<string, RpStat>,
): ScopeWinner {
  const wins = new Map<string, { wins: number; pax: number }>();
  const breakdown: { label: string; rp: RpStat | null; pax: number }[] = [];
  for (const [key, es] of buckets) {
    const w = winnerOf(es);
    breakdown.push({ label: labelOf(key), rp: w, pax: w?.pax ?? 0 });
    if (w) {
      const cur = wins.get(w.id) ?? { wins: 0, pax: 0 };
      cur.wins += 1;
      cur.pax += w.pax;
      wins.set(w.id, cur);
    }
  }
  breakdown.sort((a, b) => b.pax - a.pax);
  const champ = [...wins.entries()].sort(
    (a, b) => b[1].wins - a[1].wins || b[1].pax - a[1].pax,
  )[0];
  const played = breakdown.filter((b) => b.rp).length;
  const noun = scope === "dia" ? "jornadas" : "fines de semana";
  return {
    scope,
    rp: champ ? globalById.get(champ[0]) ?? null : null,
    detail: champ ? `Ganó ${champ[1].wins} de ${played} ${noun}` : "Sin datos aún",
    breakdown,
  };
}

function buildVenue(
  nombre: string,
  vflat: Flat[],
  weeksMeta: { index: number; label: string; dias: string; fechas: string[] }[],
  targets: Targets,
  idx: number,
): VenueStat {
  const pax = sumPax(vflat);
  const guests = vflat.length;
  const { byRp, propias } = buildRpStats(vflat, pax);

  // Semanas (ordenadas por índice)
  const weeksMetaSorted = [...weeksMeta].sort((a, b) => a.index - b.index);
  const weeks: WeekStat[] = weeksMetaSorted.map((wm, i) => {
    const wes = vflat.filter((e) => e.weekIndex === wm.index);
    const wpax = sumPax(wes);
    const r = buildRpStats(wes, wpax);
    const cumplimiento = targets.metaVisitasSemana
      ? wpax / targets.metaVisitasSemana
      : 0;
    const prevPax = i > 0
      ? sumPax(vflat.filter((e) => e.weekIndex === weeksMetaSorted[i - 1].index))
      : 0;
    return {
      index: wm.index,
      label: wm.label,
      dias: wm.dias,
      fechas: wm.fechas,
      pax: wpax,
      guests: wes.length,
      meta: targets.metaVisitasSemana,
      cumplimiento,
      estado: estadoFromRatio(cumplimiento),
      deltaPax: i > 0 ? wpax - prevPax : 0,
      byRp: r.byRp,
      propias: r.propias,
      topRp: r.byRp.find((x) => x.pax > 0) ?? null,
    };
  });

  // Jornadas con fecha exacta (si las hay)
  const datedVenue = vflat.filter((e) => e.fecha);
  const days: DayStat[] = [...groupBy(datedVenue, (e) => e.fecha!).entries()]
    .map(([fecha, es]) => {
      const dpax = sumPax(es);
      const r = buildRpStats(es, dpax);
      return {
        fecha,
        pax: dpax,
        guests: es.length,
        byRp: r.byRp,
        topRp: r.byRp.find((x) => x.pax > 0) ?? null,
      };
    })
    .sort((a, b) => a.fecha.localeCompare(b.fecha, "es", { numeric: true }));

  const meta = targets.metaVisitasMes;
  const cumplimiento = meta ? pax / meta : 0;
  const semanasConDatos = weeks.filter((w) => w.pax > 0).length;
  const ritmoSemanal = semanasConDatos ? pax / semanasConDatos : 0;
  const proyeccion = ritmoSemanal * targets.semanasOperativas;

  return {
    nombre,
    color: venueColor(nombre, idx),
    pax,
    guests,
    propiasPax: propias?.pax ?? 0,
    propiasGuests: propias?.guests ?? 0,
    rpPax: pax - (propias?.pax ?? 0),
    paxProm: guests ? pax / guests : 0,
    meta,
    cumplimiento,
    estado: estadoFromRatio(cumplimiento),
    deficit: meta - pax,
    proyeccion,
    proyeccionPct: meta ? proyeccion / meta : 0,
    ritmoSemanal,
    semanasEnMeta: weeks.filter((w) => w.cumplimiento >= 1).length,
    semanasTotales: targets.semanasOperativas || weeks.length,
    byRp,
    propias,
    weeks,
    days,
    topRpMes: byRp.find((x) => x.pax > 0) ?? null,
  };
}

export function buildSnapshot(
  month: MonthData,
  targets: Targets,
  source: Source,
): Snapshot {
  const flat = flatten(month);
  const totalPax = sumPax(flat);
  const totalGuests = flat.length;
  const { byRp, propias } = buildRpStats(flat, totalPax);
  const globalById = new Map(byRp.map((r) => [r.id, r]));

  // KPI 150 Visitas (suma de venues)
  const metaVisitas = targets.metaVisitasMes * Math.max(1, month.venues.length);
  const cumplimientoVisitas = metaVisitas ? totalPax / metaVisitas : 0;

  // Ámbitos de campeones
  const mesWinner: ScopeWinner = {
    scope: "mes",
    rp: byRp.find((r) => r.pax > 0) ?? null,
    detail: byRp[0]?.pax
      ? `${Math.round(byRp[0].sharePct * 100)}% del total del mes`
      : "Sin datos aún",
    breakdown: byRp.slice(0, 6).map((r) => ({ label: r.label, rp: r, pax: r.pax })),
  };

  const findeBuckets = groupBy(flat, (e) => `${e.venue}||${e.weekLabel}`);
  const findeWinner = scopeWinner(
    "finde",
    findeBuckets,
    (k) => {
      const [venue, label] = k.split("||");
      return `${venue} · ${shortWeek(label)}`;
    },
    globalById,
  );

  const dated = flat.filter((e) => e.fecha);
  const hasDayData = dated.length > 0;
  const diaWinner: ScopeWinner = hasDayData
    ? scopeWinner(
        "dia",
        groupBy(dated, (e) => e.fecha!),
        (k) => `Día ${k}`,
        globalById,
      )
    : {
        scope: "dia",
        rp: mesWinner.rp,
        detail: "Agrega (DD) al nombre en el Sheet para activar el detalle por día",
        breakdown: [],
      };

  // Venues
  const venues: VenueStat[] = month.venues.map((v, i) => {
    const vflat = flat.filter((e) => e.venue === v.nombre);
    const weeksMeta = v.weeks.map((w) => ({
      index: w.index,
      label: w.label,
      dias: w.dias,
      fechas: w.fechas,
    }));
    return buildVenue(v.nombre, vflat, weeksMeta, targets, i);
  });
  venues.sort((a, b) => {
    if (/^BRUMA/i.test(a.nombre)) return -1;
    if (/^BRUMA/i.test(b.nombre)) return 1;
    return b.pax - a.pax;
  });

  return {
    mes: month.mes,
    source,
    generadoEn: new Date().toISOString(),
    totalPax,
    totalGuests,
    propiasPax: propias?.pax ?? 0,
    rpPax: totalPax - (propias?.pax ?? 0),
    byRp,
    propias,
    metaVisitas,
    cumplimientoVisitas,
    estadoVisitas: estadoFromRatio(cumplimientoVisitas),
    winners: { dia: diaWinner, finde: findeWinner, mes: mesWinner },
    venues,
    hasDayData,
  };
}
