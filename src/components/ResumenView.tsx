"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import type { Snapshot } from "@/lib/types";
import { ExecutiveCard } from "./ExecutiveCard";
import { Segmented, StatCard, ESTADO_COLOR } from "./primitives";
import { fmt, pct, dec1 } from "@/lib/config";

export function ResumenView({
  snapshot,
  venueIdx,
  setVenueIdx,
}: {
  snapshot: Snapshot;
  venueIdx: number;
  setVenueIdx: (i: number) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const venue = snapshot.venues[venueIdx];
  const fecha = new Date(snapshot.generadoEn).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  async function exportPng() {
    if (!cardRef.current) return;
    const { toPng } = await import("html-to-image");
    const dataUrl = await toPng(cardRef.current, {
      pixelRatio: 3,
      cacheBust: true,
      backgroundColor: "#07080A",
    });
    const a = document.createElement("a");
    a.download = `BRUMA-${snapshot.mes}-${venue.nombre}.png`;
    a.href = dataUrl;
    a.click();
  }

  const projFill = Math.min(1, venue.proyeccionPct);
  const actualFill = Math.min(1, venue.cumplimiento);

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

      <ExecutiveCard
        ref={cardRef}
        venue={venue}
        mes={snapshot.mes}
        source={snapshot.source}
        fecha={fecha}
      />

      <button
        onClick={exportPng}
        className="glass flex w-full items-center justify-center gap-2 rounded-xl2 py-3.5 text-sm font-medium text-gold-soft shadow-glass active:scale-[0.99]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Exportar tarjeta ejecutiva (PNG)
      </button>

      {/* projection bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass rounded-xl2 p-4 shadow-glass"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-[0.14em] text-white/40">
            Proyección de cierre
          </span>
          <span className="font-mono text-sm tnum text-white">
            {fmt(venue.proyeccion)} / {fmt(venue.meta)} PAX
          </span>
        </div>
        <div className="relative mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ background: ESTADO_COLOR[venue.estado] }}
            initial={{ width: 0 }}
            animate={{ width: `${actualFill * 100}%` }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          />
          <div
            className="absolute inset-y-[-3px] w-[2px] bg-gold"
            style={{ left: `calc(${projFill * 100}% - 1px)` }}
            title="Proyección"
          />
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-white/40">
          <span>Real {pct(venue.cumplimiento)}</span>
          <span className="text-gold-soft">Proyectado {pct(venue.proyeccionPct)}</span>
        </div>
      </motion.div>

      {/* secondary KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label={venue.deficit > 0 ? "Déficit" : "Superávit"}
          value={
            <span style={{ color: venue.deficit > 0 ? "#E8836B" : "#5FD0A0" }}>
              {fmt(Math.abs(venue.deficit))}
            </span>
          }
          sub="PAX vs meta mensual"
          delay={0.05}
        />
        <StatCard
          label="Ritmo semanal"
          value={fmt(venue.ritmoSemanal)}
          sub="PAX / semana activa"
          delay={0.1}
        />
        <StatCard
          label="Reservas"
          value={fmt(venue.reservas)}
          sub={`${pct(venue.reservasCumplimiento)} de meta`}
          delay={0.15}
        />
        <StatCard
          label="PAX promedio"
          value={dec1(venue.paxProm)}
          sub="por reserva"
          delay={0.2}
        />
      </div>

      <div className="px-1 pt-1 text-center text-[11px] text-white/30">
        {venue.semanasEnMeta} de {venue.semanasTotales} semanas en meta
      </div>
    </div>
  );
}
