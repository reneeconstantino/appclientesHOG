"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import type { Snapshot } from "@/lib/types";
import { Segmented, StatusDot, ESTADO_COLOR, ESTADO_LABEL } from "./primitives";
import { fmt, pct } from "@/lib/config";

const WeeklyChart = dynamic(() => import("./WeeklyChart"), {
  ssr: false,
  loading: () => <div className="h-[220px] animate-pulse rounded-xl2 bg-white/[0.03]" />,
});

export function SemanasView({
  snapshot,
  venueIdx,
  setVenueIdx,
}: {
  snapshot: Snapshot;
  venueIdx: number;
  setVenueIdx: (i: number) => void;
}) {
  const venue = snapshot.venues[venueIdx];

  return (
    <div className="space-y-4">
      {snapshot.venues.length > 1 && (
        <Segmented
          value={String(venueIdx)}
          onChange={(v) => setVenueIdx(Number(v))}
          options={snapshot.venues.map((vn, i) => ({
            value: String(i),
            label: vn.nombre,
          }))}
        />
      )}

      <div className="glass rounded-xl2 p-4 pt-3 shadow-glass">
        <div className="mb-1 text-[11px] uppercase tracking-[0.14em] text-white/40">
          PAX por semana · {snapshot.mes}
        </div>
        <WeeklyChart weeks={venue.weeks} meta={venue.weeks[0]?.meta ?? 0} />
      </div>

      <div className="space-y-2.5">
        {venue.weeks.map((w, i) => {
          const color = ESTADO_COLOR[w.estado];
          return (
            <motion.div
              key={w.index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="glass rounded-xl2 p-4 shadow-glass"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <StatusDot estado={w.estado} size={9} />
                  <div>
                    <div className="text-sm font-medium text-white">
                      Semana {w.index}
                    </div>
                    <div className="text-[11px] text-white/40">{w.dias}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xl font-medium tnum text-white">
                    {fmt(w.pax)}
                  </div>
                  <div className="text-[11px]" style={{ color }}>
                    {pct(w.cumplimiento)} · {ESTADO_LABEL[w.estado]}
                  </div>
                </div>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, w.cumplimiento * 100)}%`,
                    background: color,
                  }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-white/40">
                <span>
                  {fmt(w.reservas)} reservas · meta {fmt(w.meta)} PAX
                </span>
                {w.deltaPax !== 0 && (
                  <span style={{ color: w.deltaPax > 0 ? "#5FD0A0" : "#E8836B" }}>
                    {w.deltaPax > 0 ? "▲" : "▼"} {fmt(Math.abs(w.deltaPax))} vs S{w.index - 1}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
