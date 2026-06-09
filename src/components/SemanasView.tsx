"use client";

import { useState } from "react";
import type { Snapshot, WeekStat } from "@/lib/types";
import { fmt, pct } from "@/lib/config";
import { WeeklyTrend } from "./charts";
import { Segmented, SectionLabel, StatusDot, ShareBar } from "./primitives";

export function SemanasView({ snapshot }: { snapshot: Snapshot }) {
  const [sel, setSel] = useState<string>(snapshot.venues[0]?.nombre ?? "");
  const venue = snapshot.venues.find((v) => v.nombre === sel) ?? snapshot.venues[0];
  if (!venue) return null;

  const semMeta = venue.weeks[0]?.meta ?? 0;
  const leaderPax = Math.max(1, ...venue.weeks.map((w) => w.pax));

  return (
    <div className="space-y-5">
      <Segmented
        value={sel}
        options={snapshot.venues.map((v) => ({ value: v.nombre, label: v.nombre }))}
        onChange={setSel}
      />

      {/* Tendencia */}
      <section className="glass rounded-xl3 p-5 shadow-glass">
        <div className="flex items-center justify-between">
          <SectionLabel>Tendencia semanal · {venue.nombre}</SectionLabel>
          <span className="font-mono text-[11px] tnum text-white/40">
            ritmo {fmt(venue.ritmoSemanal)}/sem
          </span>
        </div>
        <WeeklyTrend weeks={venue.weeks} meta={semMeta} />
      </section>

      {/* Jornadas por día (si hay fechas) */}
      {venue.days.length > 0 && (
        <section className="glass rounded-xl3 p-5 shadow-glass">
          <SectionLabel>Por día (jornadas)</SectionLabel>
          <div className="space-y-2.5">
            {venue.days.map((d) => (
              <div key={d.fecha} className="flex items-center gap-3">
                <span className="w-9 shrink-0 font-mono text-sm tnum text-white/60">
                  {d.fecha}
                </span>
                <div className="min-w-0 flex-1">
                  <ShareBar
                    value={d.pax / leaderPax}
                    color={d.topRp?.color ?? venue.color}
                    height={6}
                  />
                </div>
                <span className="shrink-0 text-xs" style={{ color: d.topRp?.color ?? "#aaa" }}>
                  {d.topRp?.label ?? "propias"}
                </span>
                <span className="w-10 shrink-0 text-right font-mono text-xs tnum text-white/80">
                  {fmt(d.pax)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Desglose por semana */}
      <section className="space-y-3">
        <SectionLabel>Detalle por fin de semana</SectionLabel>
        {venue.weeks.map((w) => (
          <WeekCard key={w.index} week={w} />
        ))}
      </section>
    </div>
  );
}

function WeekCard({ week: w }: { week: WeekStat }) {
  const leaderPax = Math.max(1, w.byRp[0]?.pax ?? 0, w.propias?.pax ?? 0);
  const rows = [...(w.propias ? [w.propias] : []), ...w.byRp]
    .filter((r) => r.pax > 0)
    .sort((a, b) => b.pax - a.pax);
  return (
    <div className="glass rounded-xl2 p-4 shadow-glass">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <StatusDot estado={w.estado} />
          <div>
            <div className="text-sm font-medium text-white">Semana {w.index}</div>
            <div className="text-[11px] text-white/40">{w.dias}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-base tnum text-white">{fmt(w.pax)} PAX</div>
          <div className="text-[11px] text-white/45">
            {fmt(w.guests)} reservas · {pct(w.cumplimiento)}
          </div>
        </div>
      </div>
      {rows.length > 0 && (
        <div className="mt-3 space-y-2">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center gap-2.5">
              <span className="w-24 shrink-0 truncate text-xs text-white/60">{r.label}</span>
              <div className="min-w-0 flex-1">
                <ShareBar value={r.pax / leaderPax} color={r.color} height={5} />
              </div>
              <span className="w-9 shrink-0 text-right font-mono text-xs tnum text-white/75">
                {fmt(r.pax)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
