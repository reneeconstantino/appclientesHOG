import type { Targets, Notes } from "./types";

// === Fuente de datos ===
// Sheet "GUEST LIST HOG". Override vía variables de entorno en Vercel.
export const SHEET_ID =
  process.env.NEXT_PUBLIC_SHEET_ID ??
  "1rPj4VpNoXqqS6YK-V-yc2535T3tIfygiy765NgIaW5w";

export const SHEET_GID = process.env.NEXT_PUBLIC_SHEET_GID ?? "0";

/** URL pública de exportación CSV (requiere "Publicar en la web" o acceso por enlace). */
export function sheetCsvUrl(gid: string = SHEET_GID): string {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;
}

// === Metas (KPI 150 Visitas). Editables en la app, se guardan en el dispositivo. ===
export const DEFAULT_TARGETS: Targets = {
  metaVisitasMes: 150, // KPI insignia por venue
  metaVisitasSemana: 40,
  semanasOperativas: 4,
};

export const TARGETS_STORAGE_KEY = "hog.targets.v2";
export const NOTES_STORAGE_KEY = "hog.notes.v2"; // plan de comunicación + presencia de marca

export const DEFAULT_NOTES: Notes = {
  plan: "",
  audiencia: "",
  canales: "",
  menciones: "",
  medios: "",
  percepcion: "",
  highlights: "",
  alertas: "",
  compromisos: "",
};

// === Paleta para RPs y propias ===
// "Propias" siempre en oro (la casa). Los RP en tonos menta/fríos, distinguibles.
export const PROPIAS_COLOR = "#D8B777";
const RP_PALETTE = [
  "#7FD8D0", // menta
  "#A9C7D6", // niebla azul
  "#C9A8E0", // lavanda
  "#7FB0E8", // azul
  "#8FD99C", // verde
  "#E89FB0", // rosa
  "#E8C56B", // ámbar
  "#9FB8C0", // acero
];

/** Color estable por id de RP. "RP1" → palette[0], etc. PROPIAS → oro. */
export function rpColor(id: string): string {
  if (id === "PROPIAS") return PROPIAS_COLOR;
  const m = id.match(/(\d+)/);
  const n = m ? parseInt(m[1], 10) - 1 : 0;
  return RP_PALETTE[((n % RP_PALETTE.length) + RP_PALETTE.length) % RP_PALETTE.length];
}

/** Color por venue (BRUMA menta, CALMA niebla, resto rotando). */
const VENUE_PALETTE = ["#7FD8D0", "#A9C7D6", "#C9A8E0", "#8FD99C"];
export function venueColor(nombre: string, idx = 0): string {
  if (/^BRUMA/i.test(nombre)) return "#7FD8D0";
  if (/^CALMA/i.test(nombre)) return "#A9C7D6";
  return VENUE_PALETTE[idx % VENUE_PALETTE.length];
}

// === Formateadores es-MX ===
const nf = new Intl.NumberFormat("es-MX");
export const fmt = (n: number) => nf.format(Math.round(n));
export const pct = (n: number) =>
  `${new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(n * 100)}%`;
export const pct1 = (n: number) =>
  `${new Intl.NumberFormat("es-MX", { maximumFractionDigits: 1 }).format(n * 100)}%`;
export const dec1 = (n: number) =>
  new Intl.NumberFormat("es-MX", { maximumFractionDigits: 1 }).format(n);
