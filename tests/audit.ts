/* Auditoría del parser y del motor de KPIs (GUEST LIST HOG). */
import { parseSheet, monthIsEmpty } from "../src/lib/sheet";
import { buildSnapshot } from "../src/lib/kpi";
import { DEMO, isEmptyMonth } from "../src/lib/seed";
import { DEFAULT_TARGETS } from "../src/lib/config";

let pass = 0;
let fail = 0;
function ok(cond: boolean, msg: string) {
  if (cond) {
    pass++;
  } else {
    fail++;
    console.error("  ✗ " + msg);
  }
}
function eq(a: unknown, b: unknown, msg: string) {
  ok(JSON.stringify(a) === JSON.stringify(b), `${msg} (esperado ${JSON.stringify(b)}, obtuve ${JSON.stringify(a)})`);
}

/* ---------- 1) Parser con estructura real (RP + propias + fecha) ---------- */
const CSV = [
  "JUNIO ,,,,,SUMA MENSUAL",
  "BRUMA ,,,,,0",
  "SEMANA 1 (05 & 06) ,,SEMANA 2 (12 & 13) ,,SUMA TOTALES,",
  "RP1 - RENEE,,RP1 - RENEE,,0,",
  "NOMBRE ,PAX ,NOMBRE ,PAX ,,",
  "Ana (05),8,Beto,5,,",
  "Carlos,4,,,,",
  "RP2,,RP2,,,",
  "NOMBRE ,PAX ,NOMBRE ,PAX ,,",
  "Diana,10,Elena,6,,",
  "TOTAL SEMANA 1 ,12,TOTAL SEMANA 2 ,11,,",
  "CALMA ,,,,,",
  "SEMANA 1 (02 & 06) ,,,,SUMA TOTALES,",
  "NOMBRE ,PAX ,,,,",
  "Propio Uno,7,,,,",
  "Propio Dos,3,,,,",
  "TOTAL SEMANA 1 ,10,,,,",
].join("\n");

const months = parseSheet(CSV);
ok(months.length === 1, "un solo mes");
eq(months[0].mes, "JUNIO", "mes = JUNIO");
const [bruma, calma] = months[0].venues;
eq(bruma?.nombre, "BRUMA", "venue 1 = BRUMA");
eq(calma?.nombre, "CALMA", "venue 2 = CALMA");

const b1 = bruma.weeks.find((w) => w.index === 1)!;
const b2 = bruma.weeks.find((w) => w.index === 2)!;
eq(b1.fechas, ["05", "06"], "fechas semana 1");
// Semana 1 (col 0): Ana(RP1,05), Carlos(RP1), Diana(RP2)
eq(b1.entries.length, 3, "semana1 BRUMA: 3 reservas");
const ana = b1.entries.find((e) => e.nombre === "Ana")!;
ok(!!ana, "nombre 'Ana' sin el sufijo (05)");
eq(ana.fecha, "05", "fecha exacta de Ana = 05");
eq(ana.rp, "RP1", "Ana es RP1");
eq(b1.entries.find((e) => e.nombre === "Diana")!.rp, "RP2", "Diana es RP2");
eq(b1.entries.reduce((s, e) => s + e.pax, 0), 22, "PAX semana1 BRUMA = 22");
// Semana 2 (col 2): Beto(RP1), Elena(RP2)
eq(b2.entries.length, 2, "semana2 BRUMA: 2 reservas");
eq(b2.entries.find((e) => e.nombre === "Beto")!.rp, "RP1", "Beto es RP1 (semana 2)");

// CALMA: propias (rp null)
const c1 = calma.weeks[0];
eq(c1.entries.length, 2, "CALMA semana1: 2 reservas propias");
ok(c1.entries.every((e) => e.rp === null), "CALMA: todas las entradas son propias (rp null)");

ok(!monthIsEmpty(months[0]), "mes con datos no está vacío");

/* ---------- 2) Plantilla vacía ---------- */
const EMPTY = [
  "JUNIO ,,,,,SUMA MENSUAL",
  "BRUMA ,,,,,0",
  "SEMANA 1 (05 & 06) ,,,,,",
  "RP1 - RENEE,,,,,",
  "NOMBRE ,PAX ,,,,",
  ",,,,,",
  ",,,,,",
  "TOTAL SEMANA 1 ,0,,,,",
].join("\n");
ok(monthIsEmpty(parseSheet(EMPTY)[0]), "plantilla vacía detectada como vacía");

/* ---------- 3) Motor de KPIs sobre el CSV ---------- */
const snap = buildSnapshot(months[0], DEFAULT_TARGETS, "live");
eq(snap.totalPax, 43, "total PAX = 43 (33 BRUMA + 10 CALMA)");
eq(snap.propiasPax, 10, "propias = 10 (CALMA)");
eq(snap.rpPax, 33, "vía RP = 33");
eq(snap.byRp[0].id, "RP1", "RP líder del mes = RP1");
eq(snap.byRp[0].pax, 17, "RP1 acumula 17 PAX");
eq(snap.winners.mes.rp?.id, "RP1", "campeón del mes = RP1");
ok(snap.hasDayData, "hay datos por día (fecha exacta presente)");
ok(snap.byRp.length === 2, "dos RPs detectados");

// BRUMA venue
const vBruma = snap.venues.find((v) => v.nombre === "BRUMA")!;
eq(vBruma.topRpMes?.id, "RP1", "BRUMA top RP del mes = RP1");
eq(vBruma.pax, 33, "BRUMA pax = 33");
eq(vBruma.weeks.find((w) => w.index === 1)!.topRp?.id, "RP1", "BRUMA semana1: gana RP1");
eq(vBruma.weeks.find((w) => w.index === 2)!.topRp?.id, "RP2", "BRUMA semana2: gana RP2");

const vCalma = snap.venues.find((v) => v.nombre === "CALMA")!;
eq(vCalma.propiasPax, 10, "CALMA propias = 10");
eq(vCalma.byRp.length, 0, "CALMA no tiene RPs");

/* ---------- 4) Motor sobre datos DEMO ---------- */
ok(!isEmptyMonth(DEMO), "DEMO tiene datos");
const dsnap = buildSnapshot(DEMO, DEFAULT_TARGETS, "demo");
ok(dsnap.totalPax > 0, "DEMO: PAX total > 0");
ok(dsnap.byRp.length >= 4, "DEMO: al menos 4 RPs");
ok(dsnap.winners.mes.rp !== null, "DEMO: hay campeón del mes");
ok(dsnap.winners.finde.rp !== null, "DEMO: hay campeón de fin de semana");
ok(dsnap.hasDayData, "DEMO: datos por día activos");
ok(dsnap.venues.length === 2, "DEMO: 2 venues");
ok(dsnap.venues[0].nombre === "BRUMA", "DEMO: BRUMA va primero");
const sumByRp = dsnap.byRp.reduce((s, r) => s + r.pax, 0) + dsnap.propiasPax;
eq(sumByRp, dsnap.totalPax, "DEMO: suma de RPs + propias = total");

/* ---------- Resultado ---------- */
console.log(`\n${pass} pruebas OK, ${fail} fallidas (de ${pass + fail}).`);
if (fail > 0) process.exit(1);
