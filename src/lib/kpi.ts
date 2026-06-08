import type {
  MonthData,
  Targets,
  Snapshot,
  VenueKpi,
  WeekKpi,
  Estado,
} from "./types";

function estadoFromRatio(r: number): Estado {
  if (r >= 1) return "ok";
  if (r >= 0.75) return "warn";
  return "risk";
}

export function buildSnapshot(
  month: MonthData,
  targets: Targets,
  source: "live" | "demo",
): Snapshot {
  const venues: VenueKpi[] = month.venues.map((v) => {
    const weeksSorted = [...v.weeks].sort((a, b) => a.index - b.index);

    const weeks: WeekKpi[] = weeksSorted.map((w, i) => {
      const cumplimiento = targets.metaSemanalPax
        ? w.pax / targets.metaSemanalPax
        : 0;
      const prev = weeksSorted[i - 1];
      return {
        index: w.index,
        label: w.label,
        dias: w.dias,
        pax: w.pax,
        reservas: w.reservas,
        meta: targets.metaSemanalPax,
        cumplimiento,
        estado: estadoFromRatio(cumplimiento),
        deltaPax: prev ? w.pax - prev.pax : 0,
      };
    });

    const semanasConDatos = weeks.filter((w) => w.pax > 0).length;
    const ritmoSemanal = semanasConDatos ? v.pax / semanasConDatos : 0;
    const proyeccion = ritmoSemanal * targets.semanasOperativas;
    const meta = targets.metaMensualPax;
    const cumplimiento = meta ? v.pax / meta : 0;

    return {
      nombre: v.nombre,
      pax: v.pax,
      reservas: v.reservas,
      paxProm: v.reservas ? v.pax / v.reservas : 0,
      meta,
      cumplimiento,
      estado: estadoFromRatio(cumplimiento),
      deficit: meta - v.pax,
      proyeccion,
      proyeccionPct: meta ? proyeccion / meta : 0,
      ritmoSemanal,
      semanasEnMeta: weeks.filter((w) => w.cumplimiento >= 1).length,
      semanasTotales: targets.semanasOperativas || weeks.length,
      reservasCumplimiento: targets.metaReservasMes
        ? v.reservas / targets.metaReservasMes
        : 0,
      weeks,
    };
  });

  // BRUMA primero siempre, luego el resto por PAX desc.
  venues.sort((a, b) => {
    if (a.nombre === "BRUMA") return -1;
    if (b.nombre === "BRUMA") return 1;
    return b.pax - a.pax;
  });

  return {
    mes: month.mes,
    source,
    generadoEn: new Date().toISOString(),
    venues,
  };
}
