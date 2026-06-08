// === BRUMA · Modelo de dominio ===

export type Source = "live" | "demo";

export interface Entry {
  nombre: string;
  pax: number;
}

export interface Week {
  index: number; // 1..5
  label: string; // "SEMANA 1 (05 & 06)"
  dias: string; // "05 & 06"
  entries: Entry[];
  pax: number; // suma de PAX de la semana
  reservas: number; // # de registros con nombre
}

export interface Venue {
  nombre: string; // "BRUMA", "CALMA"
  weeks: Week[];
  pax: number; // PAX acumulado del mes
  reservas: number;
}

export interface MonthData {
  mes: string; // "JUNIO"
  venues: Venue[];
}

// Metas contractuales del Anexo Bruma (editables en la app)
export interface Targets {
  metaMensualPax: number;
  metaSemanalPax: number;
  metaReservasMes: number;
  paxPromObjetivo: number;
  semanasOperativas: number; // # de semanas del mes con operación
}

export type Estado = "ok" | "warn" | "risk";

export interface WeekKpi {
  index: number;
  label: string;
  dias: string;
  pax: number;
  reservas: number;
  meta: number;
  cumplimiento: number; // 0..1+
  estado: Estado;
  deltaPax: number; // vs semana anterior
}

export interface VenueKpi {
  nombre: string;
  pax: number;
  reservas: number;
  paxProm: number;
  meta: number;
  cumplimiento: number; // 0..1+
  estado: Estado;
  deficit: number; // meta - pax (negativo = superávit)
  proyeccion: number; // cierre estimado al ritmo actual
  proyeccionPct: number; // proyeccion / meta
  ritmoSemanal: number; // pax / semanas con datos
  semanasEnMeta: number;
  semanasTotales: number;
  weeks: WeekKpi[];
  reservasCumplimiento: number; // reservas / metaReservasMes
}

export interface Snapshot {
  mes: string;
  source: Source;
  generadoEn: string; // ISO
  venues: VenueKpi[];
}
