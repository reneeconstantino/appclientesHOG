import { parseSheet } from "../src/lib/sheet";
import { buildSnapshot } from "../src/lib/kpi";
import { isEmptyMonth } from "../src/lib/seed";
import { DEFAULT_TARGETS } from "../src/lib/config";

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, extra = "") {
  if (cond) {
    pass++;
    console.log(`  ✓ ${name}`);
  } else {
    fail++;
    console.log(`  ✗ ${name} ${extra}`);
  }
}

// ---- 1. CSV real provisto (JUNIO vacío) ----
const REAL = `JUNIO ,,,,,SUMA MENSUAL
BRUMA ,,,,,0
SEMANA 1 (05 & 06) ,,SEMANA 2 (12 & 13) ,,SUMA TOTALES
NOMBRE ,PAX ,NOMBRE ,PAX ,0

TOTAL SEMANA 1 ,0,TOTAL SEMANA 2 ,0
SEMANA 3 (19 & 20) ,,SEMANA 4  (26 & 27) 
NOMBRE ,PAX ,NOMBRE ,PAX 

TOTAL SEMANA 3 ,0,TOTAL SEMANA 4 ,0
CALMA 
SEMANA 1 (02 & 06) ,,SEMANA 2 (09 & 13) ,,SUMA TOTALES
NOMBRE ,PAX ,NOMBRE ,PAX ,0

TOTAL SEMANA 1 ,0,TOTAL SEMANA 2 ,0
SEMANA 3 (16 & 20) ,,SEMANA 4  (23 & 27) 
NOMBRE ,PAX ,NOMBRE ,PAX 

TOTAL SEMANA 3 ,0,TOTAL SEMANA 4 ,0
SEMANA 5 (30) 
NOMBRE ,PAX 

TOTAL SEMANA 5,0`;

console.log("\n[1] CSV real (JUNIO vacío)");
const m1 = parseSheet(REAL);
check("1 mes detectado", m1.length === 1, `got ${m1.length}`);
check("mes = JUNIO", m1[0]?.mes === "JUNIO", m1[0]?.mes);
const vNames = m1[0].venues.map((v) => v.nombre);
check("sedes BRUMA + CALMA", JSON.stringify(vNames) === '["BRUMA","CALMA"]', vNames.join(","));
const bruma1 = m1[0].venues[0];
check("BRUMA tiene 4 semanas", bruma1.weeks.length === 4, `got ${bruma1.weeks.length}`);
check("BRUMA semanas 1..4", bruma1.weeks.map((w) => w.index).join() === "1,2,3,4");
check("BRUMA fechas S1 = 05 & 06", bruma1.weeks[0].dias === "05 & 06", bruma1.weeks[0].dias);
const calma1 = m1[0].venues[1];
check("CALMA tiene 5 semanas", calma1.weeks.length === 5, `got ${calma1.weeks.length}`);
check("CALMA S5 fechas = 30", calma1.weeks[4].dias === "30", calma1.weeks[4].dias);
check("mes vacío detectado", isEmptyMonth(m1[0]) === true);

// ---- 2. CSV poblado (verifica sumas, reservas, KPIs) ----
const POP = `JULIO ,,,,,SUMA MENSUAL
BRUMA ,,,,,0
SEMANA 1 (03 & 04) ,,SEMANA 2 (10 & 11) ,,SUMA TOTALES
NOMBRE ,PAX ,NOMBRE ,PAX ,0
Mesa A,10,Mesa C,5
Mesa B,8,Mesa D,12
,,Mesa E,3
TOTAL SEMANA 1 ,18,TOTAL SEMANA 2 ,20
SEMANA 3 (17 & 18) ,,SEMANA 4 (24 & 25) 
NOMBRE ,PAX ,NOMBRE ,PAX 
Mesa F,30,,
TOTAL SEMANA 3 ,30,TOTAL SEMANA 4 ,0`;

console.log("\n[2] CSV poblado (JULIO)");
const m2 = parseSheet(POP);
const b2 = m2[0].venues[0];
check("S1 pax = 18 (10+8)", b2.weeks[0].pax === 18, `got ${b2.weeks[0].pax}`);
check("S1 reservas = 2", b2.weeks[0].reservas === 2, `got ${b2.weeks[0].reservas}`);
check("S2 pax = 20 (5+12+3)", b2.weeks[1].pax === 20, `got ${b2.weeks[1].pax}`);
check("S2 reservas = 3", b2.weeks[1].reservas === 3, `got ${b2.weeks[1].reservas}`);
check("S3 pax = 30", b2.weeks[2].pax === 30, `got ${b2.weeks[2].pax}`);
check("BRUMA total pax = 68", b2.pax === 68, `got ${b2.pax}`);
check("BRUMA total reservas = 6", b2.reservas === 6, `got ${b2.reservas}`);
check("mes poblado NO vacío", isEmptyMonth(m2[0]) === false);

// ---- 3. Motor de KPIs ----
console.log("\n[3] Motor de KPIs (buildSnapshot)");
const snap = buildSnapshot(m2[0], DEFAULT_TARGETS, "live");
const k = snap.venues[0];
check("cumplimiento = 68/320", Math.abs(k.cumplimiento - 68 / 320) < 1e-9, `${k.cumplimiento}`);
check("deficit = 252", k.deficit === 320 - 68, `${k.deficit}`);
check("paxProm = 68/6", Math.abs(k.paxProm - 68 / 6) < 1e-9, `${k.paxProm}`);
check("ritmo = 68/3 semanas activas", Math.abs(k.ritmoSemanal - 68 / 3) < 1e-9, `${k.ritmoSemanal}`);
check("proyeccion = ritmo*4", Math.abs(k.proyeccion - (68 / 3) * 4) < 1e-9, `${k.proyeccion}`);
check("estado risk (<75%)", k.estado === "risk", k.estado);
check("BRUMA ordenado primero", snap.venues[0].nombre === "BRUMA");
check("deltaPax S2 = +2", k.weeks[1].deltaPax === 2, `${k.weeks[1].deltaPax}`);

console.log(`\n==== AUDITORÍA: ${pass} pasaron, ${fail} fallaron ====\n`);
if (fail > 0) process.exit(1);
