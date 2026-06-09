"use client";

import { useMemo, useState } from "react";
import type { RpStat, Snapshot } from "@/lib/types";
import { fmt, pct } from "@/lib/config";
import { RpBarChart } from "./charts";
import { Segmented, SectionLabel, ShareBar } from "./primitives";
import { RpRow, WinnerTriptych, tallyWins } from "./RpBits";

export function RpsView({ snapshot }: { snapshot: Snapshot }) {
  const [sel, setSel] = useState<string>("ALL");

  const venueOpts = useMemo(
    () => [
      { value: "ALL", label: "Todos" },
      ...snapshot.venues.map((v) => ({ value: v.nombre, label: v.nombre })),
    ],
    [snapshot.venues],
  );

  const venue = sel === "ALL" ? null : snapshot.venues.find((v) => v.nombre === sel) ?? null;

  const byRp: RpStat[] = venue ? venue.byRp : snapshot.byRp;
  const propias = venue ? venue.propias : snapshot.propias;
  const leaderPax = byRp[0]?.pax ?? 0;

  const chartRows = useMemo(
    () =>
      [...(propias ? [propias] : []), ...byRp]
        .filter((r) => r.pax > 0)
        .sort((a, b) => b.pax - a.pax),
    [byRp, propias],
  );

  // Campeones por ámbito (global o por venue)
  const winners = useMemo(() => {
    if (!venue) return snapshot.winners;
    const mesRp = venue.topRpMes;
    const f = tallyWins(venue.weeks);
    const d = tallyWins(venue.days);
    return {
      mes: {
        rp: mesRp,
        detail: mesRp ? `${pct(mesRp.sharePct)} del venue` : "sin datos",
      },
      finde: {
        rp: f.rp,
        detail: f.rp ? `Ganó ${f.wins} de ${f.played} fines de semana` : "sin datos",
      },
      dia: venue.days.length
        ? { rp: d.rp, detail: d.rp ? `Ganó ${d.wins} de ${d.played} jornadas` : "sin datos" }
        : { rp: mesRp, detail: "agrega (DD) al nombre para el detalle por día" },
    };
  }, [venue, snapshot.winners]);

  // Detalle de fines de semana
  const findeBreakdown = useMemo(() => {
    if (!venue) return snapshot.winners.finde.breakdown.slice(0, 8);
    return venue.weeks
      .map((w) => ({ label: `S${w.index} · ${w.dias}`, rp: w.topRp, pax: w.topRp?.pax ?? 0 }))
      .filter((b) => b.rp)
      .sort((a, b) => b.pax - a.pax)
      .slice(0, 8);
  }, [venue, snapshot.winners]);

  return (
    <div className="space-y-5">
      <Segmented value={sel} options={venueOpts} onChange={setSel} />

      {/* Campeones */}
      <section>
        <SectionLabel>Mejor RP {venue ? `· ${venue.nombre}` : "(toda la operación)"}</SectionLabel>
        <WinnerTriptych dia={winners.dia} finde={winners.finde} mes={winners.mes} />
      </section>

      {/* PAX por RP */}
      <section className="glass rounded-xl3 p-5 shadow-glass">
        <SectionLabel>PAX por RP {propias ? "+ propias" : ""}</SectionLabel>
        {chartRows.length ? (
          <RpBarChart rows={chartRows} />
        ) : (
          <Empty />
        )}
      </section>

      {/* Ranking detallado */}
      <section className="glass rounded-xl3 p-5 shadow-glass">
        <SectionLabel>Ranking de RPs</SectionLabel>
        {byRp.length ? (
          <div className="divide-y divide-white/5">
            {byRp.map((r, i) => (
              <RpRow key={r.id} rank={i + 1} rp={r} leaderPax={leaderPax} delay={i * 0.04} />
            ))}
          </div>
        ) : (
          <Empty msg="Este venue corre con lista propia (sin RPs)." />
        )}
        {propias && (
          <div className="mt-3 flex items-center justify-between rounded-xl2 border border-gold/20 bg-gold/[0.06] px-3.5 py-2.5">
            <span className="flex items-center gap-2 text-sm text-gold-soft">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: propias.color }} />
              Propias (directo)
            </span>
            <span className="font-mono text-sm tnum text-white">
              {fmt(propias.pax)} PAX · {fmt(propias.guests)} reservas
            </span>
          </div>
        )}
      </section>

      {/* Detalle fin de semana */}
      {findeBreakdown.length > 0 && (
        <section className="glass rounded-xl3 p-5 shadow-glass">
          <SectionLabel>Quién ganó cada fin de semana</SectionLabel>
          <div className="space-y-2.5">
            {findeBreakdown.map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-28 shrink-0 truncate text-xs text-white/45">{b.label}</span>
                <div className="min-w-0 flex-1">
                  <ShareBar value={leaderPax ? b.pax / leaderPax : 0} color={b.rp?.color ?? "#888"} height={6} />
                </div>
                <span className="shrink-0 text-xs" style={{ color: b.rp?.color }}>
                  {b.rp?.label ?? "—"}
                </span>
                <span className="w-10 shrink-0 text-right font-mono text-xs tnum text-white/70">
                  {fmt(b.pax)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Empty({ msg = "Sin datos todavía." }: { msg?: string }) {
  return <div className="py-6 text-center text-sm text-white/40">{msg}</div>;
}
