"use client";

import { forwardRef } from "react";
import type { VenueKpi, Source } from "@/lib/types";
import { ComplianceRing } from "./ComplianceRing";
import { ESTADO_COLOR, ESTADO_LABEL } from "./primitives";
import { fmt, pct } from "@/lib/config";

interface Props {
  venue: VenueKpi;
  mes: string;
  source: Source;
  fecha: string;
}

export const ExecutiveCard = forwardRef<HTMLDivElement, Props>(
  ({ venue, mes, source, fecha }, ref) => {
    const color = ESTADO_COLOR[venue.estado];
    return (
      <div
        ref={ref}
        style={{
          background:
            "linear-gradient(160deg,#10131A 0%,#0A0C11 55%,#0C0F14 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
        className="overflow-hidden rounded-xl3 p-6 shadow-glass"
      >
        {/* header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="font-display text-3xl font-light tracking-wide text-white">
              {venue.nombre}
            </div>
            <div className="mt-0.5 text-[11px] uppercase tracking-[0.22em] text-white/40">
              Anexo · Cumplimiento {mes}
            </div>
          </div>
          <span
            className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
            style={{
              color: source === "live" ? "#5FD0A0" : "#E8C56B",
              border: `1px solid ${source === "live" ? "#5FD0A033" : "#E8C56B33"}`,
              background: source === "live" ? "#5FD0A012" : "#E8C56B12",
            }}
          >
            {source === "live" ? "En vivo" : "Demo"}
          </span>
        </div>

        {/* ring */}
        <div className="mt-5 flex justify-center">
          <ComplianceRing
            ratio={venue.cumplimiento}
            estado={venue.estado}
            centerTop="Cumplimiento"
            centerMain={pct(venue.cumplimiento)}
            centerSub={`${fmt(venue.pax)} / ${fmt(venue.meta)} PAX`}
            size={196}
          />
        </div>

        {/* status line */}
        <div
          className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-full px-3 py-1.5"
          style={{ background: `${color}14`, border: `1px solid ${color}33` }}
        >
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: color }}
          />
          <span className="text-xs font-medium" style={{ color }}>
            {ESTADO_LABEL[venue.estado]}
          </span>
          <span className="text-xs text-white/40">·</span>
          <span className="text-xs text-white/55">
            {venue.deficit > 0
              ? `Faltan ${fmt(venue.deficit)} PAX`
              : `Superávit ${fmt(-venue.deficit)} PAX`}
          </span>
        </div>

        {/* mini stats */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { l: "Proyección", v: pct(venue.proyeccionPct), c: "#fff" },
            { l: "Reservas", v: fmt(venue.reservas), c: "#fff" },
            { l: "PAX prom.", v: fmt(venue.paxProm), c: "#fff" },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-xl2 p-3 text-center"
              style={{
                background: "rgba(255,255,255,0.035)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="text-[10px] uppercase tracking-wider text-white/40">
                {s.l}
              </div>
              <div className="mt-1 font-mono text-lg font-medium tnum text-white">
                {s.v}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between text-[10px] text-white/30">
          <span className="font-display tracking-wide">BRUMA</span>
          <span className="tnum">{fecha}</span>
        </div>
      </div>
    );
  },
);
ExecutiveCard.displayName = "ExecutiveCard";
