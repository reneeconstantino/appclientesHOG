// Modelo alineado al Excel real de BRUMA:
//   Bloques por semana, con dos listas lado a lado (Viernes cols A-D / Sábado E-H)
//   y una columna NOTAS (I) por bloque semanal.
//   IMPORTANTE: PAX = total del grupo YA con el titular incluido
//   (ej. "RICARDO HERNANDEZ + 8" => PAX 9). Total esperado = PAX.

export type Dia = "Viernes" | "Sábado";
export type Side = "V" | "S"; // V = bloque Viernes (col D asistencia), S = Sábado (col H)

export type AsistenciaStatus = "" | "Parcial" | "Completa";

export interface Guest {
  id: string;            // `${rowIndex}-${side}` — único (V y S comparten fila física)
  rowIndex: number;      // fila física en la hoja
  side: Side;
  mes: string;           // "JULIO"
  semana: string;        // "SEMANA 1"
  fecha: string;         // "2026-07-04" (derivada de mes + día header)
  dia: Dia;
  pr: string;
  nombre: string;
  total: number;         // = PAX (titular incluido)
  llegaron: number;
  asistencia: AsistenciaStatus;
}

// Un bloque de notas por semana (columna I). notaRow = fila física donde vive.
export interface WeekNote {
  key: string;           // `${mes}·${semana}`
  mes: string;
  semana: string;
  notaRow: number;
  nota: string;
}

export interface RosterResponse {
  guests: Guest[];
  notes: WeekNote[];
}

export interface CheckinPayload {
  rowIndex: number;
  side: Side;
  llegaron: number;      // absoluto, no delta
}

export interface NotePayload {
  notaRow: number;
  nota: string;
}
