import type { Targets } from "./types";

// ID del Sheet del proyecto (de la URL provista). Override vía env.
export const SHEET_ID =
  process.env.NEXT_PUBLIC_SHEET_ID ??
  "1cXi_Wkw-2Sqk4k4Dta1vfLoqP99w2JNZ4ubqx2Lb5GE";

export const SHEET_GID = process.env.NEXT_PUBLIC_SHEET_GID ?? "0";

// URL pública de exportación CSV (requiere "Publicar en la web" en Google Sheets).
export function sheetCsvUrl(gid: string = SHEET_GID): string {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;
}

// Metas por defecto del "Anexo Bruma". AJUSTAR a los mínimos contractuales reales.
// Se pueden editar en la app (pestaña Metas) y quedan guardadas en el dispositivo.
export const DEFAULT_TARGETS: Targets = {
  metaMensualPax: 320,
  metaSemanalPax: 80,
  metaReservasMes: 48,
  paxPromObjetivo: 6,
  semanasOperativas: 4,
};

export const TARGETS_STORAGE_KEY = "bruma.targets.v1";

// Formateadores es-MX
const nf = new Intl.NumberFormat("es-MX");
export const fmt = (n: number) => nf.format(Math.round(n));
export const pct = (n: number) =>
  `${new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(n * 100)}%`;
export const pct1 = (n: number) =>
  `${new Intl.NumberFormat("es-MX", { maximumFractionDigits: 1 }).format(n * 100)}%`;
export const dec1 = (n: number) =>
  new Intl.NumberFormat("es-MX", { maximumFractionDigits: 1 }).format(n);
