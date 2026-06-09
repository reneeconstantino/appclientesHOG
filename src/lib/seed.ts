import type { MonthData, Week, Entry } from "./types";

// rp helper: [nombre, pax, dia?]
type Row = [string, number, string?];

function mk(rows: Row[], rp: string | null, rpLabel: string | null): Entry[] {
  return rows.map(([nombre, pax, fecha]) => ({
    nombre,
    pax,
    rp,
    rpLabel,
    fecha: fecha ?? null,
  }));
}

function fechasOf(dias: string): string[] {
  return dias
    .split(/&|,/)
    .map((s) => (s.match(/\d{1,2}/)?.[0] ?? "").padStart(2, "0"))
    .filter(Boolean);
}

function w(index: number, dias: string, entries: Entry[]): Week {
  return {
    index,
    label: `SEMANA ${index} (${dias})`,
    dias,
    fechas: fechasOf(dias),
    entries,
  };
}

const RENEE = "RP1 - RENEE";

/**
 * Mes demo (JUNIO). Cuenta una historia: RP3 domina los fines de semana,
 * RENEE (RP1) es la base estable de la casa, CALMA corre con lista propia.
 * Las fechas (05/06...) permiten ver el desglose por día.
 */
export const DEMO_MONTH: MonthData = {
  mes: "JUNIO",
  venues: [
    {
      nombre: "BRUMA",
      weeks: [
        w(1, "05 & 06", [
          ...mk(
            [
              ["Mesa Casa Lumen", 12, "05"],
              ["Alejandra V.", 8, "05"],
              ["R. Ibáñez", 6, "06"],
              ["Grupo Polanco", 10, "06"],
            ],
            "RP1",
            RENEE,
          ),
          ...mk(
            [
              ["Lista B. Ríos", 9, "05"],
              ["Mesa VIP 1", 11, "06"],
              ["J. Peralta", 5, "06"],
            ],
            "RP2",
            "RP2 - DANIELA",
          ),
          ...mk(
            [
              ["Grupo Roma Norte", 14, "05"],
              ["Mesa Condesa", 12, "05"],
              ["F. Lozano", 8, "06"],
              ["Grupo BBVA", 13, "06"],
            ],
            "RP3",
            "RP3 - MAURICIO",
          ),
          ...mk(
            [["S. Castro", 4, "06"], ["Mesa 12", 7, "06"]],
            "RP4",
            "RP4 - PAOLA",
          ),
          ...mk([["D. Montes", 5, "05"]], "RP5", "RP5 - IVÁN"),
        ]),
        w(2, "12 & 13", [
          ...mk(
            [
              ["Embajada NL", 8, "12"],
              ["P. Aguirre", 6, "12"],
              ["C. Bárcena", 5, "13"],
            ],
            "RP1",
            RENEE,
          ),
          ...mk(
            [["M. Treviño", 6, "12"], ["Mesa Lumen", 8, "13"], ["A. Garza", 4, "13"]],
            "RP2",
            "RP2 - DANIELA",
          ),
          ...mk(
            [
              ["Grupo Santa Fe", 13, "12"],
              ["Mesa VIP 2", 10, "12"],
              ["R. Mejía", 7, "13"],
              ["Lista G. Vela", 9, "13"],
            ],
            "RP3",
            "RP3 - MAURICIO",
          ),
          ...mk([["E. Saldívar", 6, "13"], ["Mesa 7", 7, "13"]], "RP4", "RP4 - PAOLA"),
          ...mk([["N. Quintana", 6, "12"]], "RP5", "RP5 - IVÁN"),
        ]),
        w(3, "19 & 20", [
          ...mk([["L. Domínguez", 5, "19"], ["Mesa Jardín", 10, "20"]], "RP1", RENEE),
          ...mk([["V. Olvera", 6, "19"], ["Mesa Terraza", 9, "20"]], "RP2", "RP2 - DANIELA"),
          ...mk(
            [["Grupo Interlomas", 12, "19"], ["Mesa 9", 8, "20"], ["S. Rentería", 6, "20"]],
            "RP3",
            "RP3 - MAURICIO",
          ),
          ...mk([["D. Fuentes", 5, "19"]], "RP4", "RP4 - PAOLA"),
        ]),
        w(4, "26 & 27", [
          ...mk([["Mesa Reforma", 11, "26"], ["H. Pineda", 7, "27"]], "RP1", RENEE),
          ...mk([["Grupo Sur", 9, "26"]], "RP2", "RP2 - DANIELA"),
          ...mk([["Mesa VIP 5", 8, "27"], ["C. Navarro", 5, "27"]], "RP3", "RP3 - MAURICIO"),
        ]),
      ],
    },
    {
      nombre: "CALMA",
      weeks: [
        w(1, "02 & 06", [
          ...mk(
            [
              ["Mesa Jardín", 10, "02"],
              ["P. Cárdenas", 6, "02"],
              ["Grupo Santa Fe", 12, "06"],
              ["A. Bravo", 4, "06"],
            ],
            null,
            null,
          ),
        ]),
        w(2, "09 & 13", [
          ...mk(
            [
              ["Grupo Reforma", 14, "09"],
              ["V. Olvera", 6, "09"],
              ["Mesa Terraza", 9, "13"],
            ],
            null,
            null,
          ),
        ]),
        w(3, "16 & 20", [
          ...mk([["Mesa 9", 8, "16"], ["S. Rentería", 6, "20"]], null, null),
        ]),
        w(4, "23 & 27", [...mk([["Grupo Interlomas", 11, "23"]], null, null)]),
      ],
    },
  ],
};

export const DEMO = DEMO_MONTH;

/** True si el mes vivo no trae PAX real (la plantilla trae nombres sueltos con 0). */
export function isEmptyMonth(m: MonthData | undefined): boolean {
  if (!m) return true;
  return m.venues.every((v) =>
    v.weeks.every((w) => w.entries.every((e) => e.pax <= 0)),
  );
}
