"use client";

import { motion } from "framer-motion";
import type { RpStat } from "@/lib/types";
import { fmt, pct } from "@/lib/config";
import { ShareBar, Crown } from "./primitives";

/** Fila de ranking de un RP con barra de proporción contra el líder. */
export function RpRow({
  rank,
  rp,
  leaderPax,
  delay = 0,
}: {
  rank: number;
  rp: RpStat;
  leaderPax: number;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-3 py-2"
    >
      <span className="w-5 shrink-0 text-center font-mono text-sm tnum text-white/35">
        {rank}
      </span>
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ background: rp.color, boxShadow: `0 0 8px ${rp.color}77` }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="flex items-center gap-1.5 truncate text-sm text-white/90">
            {rank === 1 && rp.pax > 0 && <Crown size={13} color={rp.color} />}
            {rp.label}
          </span>
          <span className="shrink-0 font-mono text-sm tnum text-white">{fmt(rp.pax)}</span>
        </div>
        <div className="mt-1.5">
          <ShareBar value={leaderPax ? rp.pax / leaderPax : 0} color={rp.color} height={6} />
        </div>
        <div className="mt-1 text-[11px] text-white/40">
          {fmt(rp.guests)} reservas · {fmt(rp.paxProm)} PAX/reserva · {pct(rp.sharePct)} del total
        </div>
      </div>
    </motion.div>
  );
}

/** Tarjeta de campeón de un ámbito (día / fin de semana / mes). */
export function WinnerCard({
  scopeLabel,
  rp,
  detail,
  emphasis = false,
}: {
  scopeLabel: string;
  rp: RpStat | null;
  detail: string;
  emphasis?: boolean;
}) {
  const color = rp?.color ?? "rgba(255,255,255,0.4)";
  return (
    <div
      className="glass flex flex-col gap-1 rounded-xl2 p-3.5 shadow-glass"
      style={emphasis ? { borderColor: `${color}44`, background: `${color}0E` } : undefined}
    >
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-white/40">
        <Crown size={12} color={color} />
        {scopeLabel}
      </div>
      <div className="truncate font-display text-lg leading-tight" style={{ color }}>
        {rp ? rp.label : "—"}
      </div>
      <div className="text-[11px] text-white/45">{detail}</div>
      {rp && (
        <div className="mt-0.5 font-mono text-sm tnum text-white/80">{fmt(rp.pax)} PAX</div>
      )}
    </div>
  );
}

/** Los tres campeones lado a lado. */
export function WinnerTriptych({
  dia,
  finde,
  mes,
}: {
  dia: { rp: RpStat | null; detail: string };
  finde: { rp: RpStat | null; detail: string };
  mes: { rp: RpStat | null; detail: string };
}) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      <WinnerCard scopeLabel="Por día" rp={dia.rp} detail={dia.detail} />
      <WinnerCard scopeLabel="Fin de semana" rp={finde.rp} detail={finde.detail} />
      <WinnerCard scopeLabel="Del mes" rp={mes.rp} detail={mes.detail} emphasis />
    </div>
  );
}

/** Tally de victorias: dado un set de "cubos" con su mejor RP, devuelve el campeón. */
export function tallyWins(
  buckets: { topRp: RpStat | null }[],
): { rp: RpStat | null; wins: number; played: number; noun: string } {
  const wins = new Map<string, { n: number; pax: number; rp: RpStat }>();
  let played = 0;
  for (const b of buckets) {
    if (!b.topRp) continue;
    played += 1;
    const cur = wins.get(b.topRp.id) ?? { n: 0, pax: 0, rp: b.topRp };
    cur.n += 1;
    cur.pax += b.topRp.pax;
    wins.set(b.topRp.id, cur);
  }
  const top = [...wins.values()].sort((a, b) => b.n - a.n || b.pax - a.pax)[0];
  return { rp: top?.rp ?? null, wins: top?.n ?? 0, played, noun: "" };
}
