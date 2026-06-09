// === GUEST LIST HOG · Modelo de dominio ===
// El Sheet agrupa, por venue y por semana (un fin de semana de 2 fechas),
// las reservas que trae cada RP (Relaciones Públicas). Las entradas sin RP
// asignado son "propias" (directas de la casa).

export type Source = "live" | "demo";
export type Estado = "ok" | "warn" | "risk";

/** Id canónico de RP ("RP1", "RP2"...) o `null` para entradas propias/directas. */
export type RpId = string | null;

/** Una reserva en la lista: nombre + PAX (personas), atribuida a un RP o propia. */
export interface Entry {
  nombre: string;
  pax: number;
  rp: RpId;            // "RP1" | "RP2" | ... | null (propia)
  rpLabel: string | null; // "RP1 - RENEE" tal cual aparece en el Sheet
  fecha: string | null;   // día exacto "05" si se capturó "Nombre (05)", si no null
}

export interface Week {
  index: number;     // 1..5
  label: string;     // "SEMANA 1 (05 & 06)"
  dias: string;      // "05 & 06"
  fechas: string[];  // ["05","06"]
  entries: Entry[];
}

export interface Venue {
  nombre: string;    // "BRUMA", "CALMA"
  weeks: Week[];
}

export interface MonthData {
  mes: string;       // "JUNIO"
  venues: Venue[];
}

// === Metas / configuración contractual (editable en la app) ===
export interface Targets {
  metaVisitasMes: number;     // KPI insignia "150 Visitas" por venue (PAX/mes)
  metaVisitasSemana: number;  // referencia semanal por venue
  semanasOperativas: number;  // # de fines de semana operativos del mes
}

// === Notas cualitativas (no vienen del Sheet; se editan en la app) ===
// Alimentan los entregables: Plan de Comunicación y Presencia de Marca.
export interface Notes {
  plan: string;        // ejes narrativos del mes
  audiencia: string;   // perfil de audiencia objetivo
  canales: string;     // canales y momentos de activación
  menciones: string;   // menciones obtenidas
  medios: string;      // gestiones con medios / curadores
  percepcion: string;  // temperatura de percepción del venue
  highlights: string;  // momentos destacados
  alertas: string;     // alertas detectadas
  compromisos: string; // compromisos para el siguiente período
}

// === Modelo agregado (snapshot que consume la UI) ===

/** Una fila de ranking: un RP (o el agregado "propias") con sus números. */
export interface RpStat {
  id: string;        // "RP1".. | "PROPIAS"
  label: string;     // "RP1 · RENEE" | "Propias"
  color: string;
  isPropia: boolean;
  pax: number;       // PAX (personas) atribuidas
  guests: number;    // # de reservas/nombres
  paxProm: number;   // pax / guests
  sharePct: number;  // pax / total del ámbito (0..1)
}

export interface WeekStat {
  index: number;
  label: string;
  dias: string;
  fechas: string[];
  pax: number;
  guests: number;
  meta: number;
  cumplimiento: number; // pax / metaVisitasSemana
  estado: Estado;
  deltaPax: number;     // vs semana anterior
  byRp: RpStat[];       // RPs (sin propias) ordenados desc
  propias: RpStat | null;
  topRp: RpStat | null; // mejor RP del fin de semana
}

export interface DayStat {
  fecha: string;        // "05"
  pax: number;
  guests: number;
  byRp: RpStat[];
  topRp: RpStat | null;
}

export interface VenueStat {
  nombre: string;
  color: string;
  pax: number;          // PAX total del mes (todas las fuentes)
  guests: number;
  propiasPax: number;
  propiasGuests: number;
  rpPax: number;        // PAX vía RPs (no propias)
  paxProm: number;
  meta: number;         // metaVisitasMes
  cumplimiento: number; // pax / meta
  estado: Estado;
  deficit: number;      // meta - pax
  proyeccion: number;   // cierre estimado al ritmo actual
  proyeccionPct: number;
  ritmoSemanal: number;
  semanasEnMeta: number;
  semanasTotales: number;
  byRp: RpStat[];       // RPs del venue (sin propias) desc
  propias: RpStat | null;
  weeks: WeekStat[];
  days: DayStat[];      // jornadas con fecha exacta (si las hay)
  topRpMes: RpStat | null;
}

/** Quién gana en cada ámbito + el detalle. */
export interface ScopeWinner {
  scope: "dia" | "finde" | "mes";
  rp: RpStat | null;          // el RP campeón del ámbito
  detail: string;             // texto legible ("3 de 4 fines de semana")
  breakdown: { label: string; rp: RpStat | null; pax: number }[];
}

export interface Snapshot {
  mes: string;
  source: Source;
  generadoEn: string;   // ISO

  // Totales globales (todas las venues)
  totalPax: number;
  totalGuests: number;
  propiasPax: number;
  rpPax: number;
  byRp: RpStat[];        // ranking global de RPs (sin propias)
  propias: RpStat | null;

  // KPI 150 Visitas (suma de venues)
  metaVisitas: number;   // meta total = metaVisitasMes * #venues
  cumplimientoVisitas: number;
  estadoVisitas: Estado;

  // Campeones por ámbito
  winners: { dia: ScopeWinner; finde: ScopeWinner; mes: ScopeWinner };

  venues: VenueStat[];
  hasDayData: boolean;   // ¿hay entradas con fecha exacta?
}
