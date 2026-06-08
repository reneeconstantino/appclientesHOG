import type { MonthData, Week, Entry } from "./types";

function w(index: number, label: string, dias: string, e: [string, number][]): Week {
  const entries: Entry[] = e.map(([nombre, pax]) => ({ nombre, pax }));
  return {
    index,
    label,
    dias,
    entries,
    pax: entries.reduce((s, x) => s + x.pax, 0),
    reservas: entries.length,
  };
}

/** Mes de muestra (DEMO). Cuenta una historia: BRUMA en curso, proyectando cerca de meta. */
export const DEMO_MONTH: MonthData = {
  mes: "JUNIO",
  venues: [
    {
      nombre: "BRUMA",
      pax: 0,
      reservas: 0,
      weeks: [
        w(1, "SEMANA 1 (05 & 06)", "05 & 06", [
          ["Alejandra V.", 8], ["Mesa Casa Lumen", 12], ["R. Ibáñez", 6],
          ["Grupo Polanco", 10], ["S. Castro", 4], ["Mesa VIP 3", 9],
          ["D. Montes", 5], ["Embajada NL", 8], ["P. Aguirre", 6],
          ["Mesa 12", 7], ["Lista F. Solís", 6], ["C. Bárcena", 5],
        ]),
        w(2, "SEMANA 2 (12 & 13)", "12 & 13", [
          ["Grupo Roma Norte", 10], ["M. Treviño", 6], ["Mesa Lumen", 8],
          ["A. Garza", 4], ["Lista B. Ríos", 9], ["Mesa VIP 1", 11],
          ["J. Peralta", 5], ["E. Saldívar", 6], ["Mesa 7", 7],
          ["N. Quintana", 6],
        ]),
        w(3, "SEMANA 3 (19 & 20)", "19 & 20", [
          ["Mesa Condesa", 9], ["F. Lozano", 6], ["Grupo BBVA", 12],
          ["L. Domínguez", 5], ["Mesa VIP 2", 10], ["R. Mejía", 4],
          ["Lista G. Vela", 8],
        ]),
        w(4, "SEMANA 4 (26 & 27)", "26 & 27", []),
      ],
    },
    {
      nombre: "CALMA",
      pax: 0,
      reservas: 0,
      weeks: [
        w(1, "SEMANA 1 (02 & 06)", "02 & 06", [
          ["Mesa Jardín", 10], ["P. Cárdenas", 6], ["Grupo Santa Fe", 12],
          ["A. Bravo", 4], ["Lista M. Solórzano", 8], ["Mesa 4", 6],
        ]),
        w(2, "SEMANA 2 (09 & 13)", "09 & 13", [
          ["Grupo Reforma", 14], ["V. Olvera", 6], ["Mesa Terraza", 9],
          ["C. Navarro", 5], ["Lista H. Pineda", 10], ["Mesa VIP 5", 8],
        ]),
        w(3, "SEMANA 3 (16 & 20)", "16 & 20", [
          ["Mesa 9", 8], ["S. Rentería", 6], ["Grupo Interlomas", 11],
          ["D. Fuentes", 5],
        ]),
        w(4, "SEMANA 4 (23 & 27)", "23 & 27", []),
        w(5, "SEMANA 5 (30)", "30", []),
      ],
    },
  ],
};

function refresh(m: MonthData): MonthData {
  for (const v of m.venues) {
    v.pax = v.weeks.reduce((s, x) => s + x.pax, 0);
    v.reservas = v.weeks.reduce((s, x) => s + x.reservas, 0);
  }
  return m;
}

export const DEMO = refresh(DEMO_MONTH);

/** True si el mes vivo no trae nada operativo aún. */
export function isEmptyMonth(m: MonthData | undefined): boolean {
  if (!m) return true;
  return m.venues.every((v) => v.pax === 0 && v.reservas === 0);
}
