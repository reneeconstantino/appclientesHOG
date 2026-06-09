"use client";

import type { Snapshot } from "@/lib/types";
import { fmt, pct } from "@/lib/config";
import { ComplianceRing } from "./ComplianceRing";
import { ShareDonut, type Slice } from "./charts";
import { StatCard, SectionLabel, StatusDot } from "./primitives";
import { WinnerTriptych } from "./RpBits";

export function ResumenView({ snapshot }: { snapshot: Snapshot }) {
  const s = snapshot;
  const slices: Slice[] = [
    ...(s.propias ? [{ label: "Propias", value: s.propias.pax, color: s.propias.color }] : []),
    ...s.byRp.map((r) => ({ label: r.label, value: r.pax, color: r.color })),
  ];
  const propiaShare = s.totalPax ? s.propiasPax / s.totalPax : 0;

  return (
    <div className="space-y-5">
      {/* KPI 150 Visitas */}
      <section className="glass rounded-xl3 p-5 shadow-glass">
        <div className="flex items-center justify-between">
          <SectionLabel>KPI · 150 Visitas (mes)</SectionLabel>
          <span className="font-mono text-[11px] tnum text-white/40">
            meta {fmt(s.metaVisitas)}
          </span>
        </div>
        <div className="flex justify-center">
          <ComplianceRing
            ratio={s.cumplimientoVisitas}
            estado={s.estadoVisitas}
            centerTop="Cumplimiento"
            centerMain={pct(s.cumplimientoVisitas)}
            centerSub={`${fmt(s.totalPax)} / ${fmt(s.metaVisitas)} visitas`}
            size={208}
          />
        </div>
      </section>

      {/* Totales */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Visitas (PAX)" value={fmt(s.totalPax)} sub={`${fmt(s.totalGuests)} reservas`} delay={0.02} />
        <StatCard
          label="Propias"
          value={fmt(s.propiasPax)}
          sub={`${pct(propiaShare)} del total`}
          subTone="#D8B777"
          delay={0.06}
        />
        <StatCard
          label="Vía RP"
          value={fmt(s.rpPax)}
          sub={`${pct(1 - propiaShare)} · ${s.byRp.length} RPs`}
          subTone="#7FD8D0"
          delay={0.1}
        />
        <StatCard
          label="Mejor RP del mes"
          value={s.winners.mes.rp ? s.winners.mes.rp.label : "—"}
          sub={s.winners.mes.rp ? `${fmt(s.winners.mes.rp.pax)} PAX` : "sin datos"}
          subTone={s.winners.mes.rp?.color}
          delay={0.14}
        />
      </div>

      {/* Reparto propias vs RP */}
      <section className="glass rounded-xl3 p-5 shadow-glass">
        <SectionLabel>Reparto de visitas</SectionLabel>
        <ShareDonut slices={slices} centerMain={fmt(s.totalPax)} centerSub="PAX totales" />
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
          {slices.map((sl) => (
            <div key={sl.label} className="flex items-center gap-1.5 text-xs text-white/55">
              <span className="h-2 w-2 rounded-full" style={{ background: sl.color }} />
              {sl.label}
              <span className="font-mono tnum text-white/40">{fmt(sl.value)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Campeones por ámbito */}
      <section>
        <SectionLabel>¿Quién la rompe?</SectionLabel>
        <WinnerTriptych dia={s.winners.dia} finde={s.winners.finde} mes={s.winners.mes} />
      </section>

      {/* Por venue */}
      <section>
        <SectionLabel>Por venue</SectionLabel>
        <div className="space-y-2.5">
          {s.venues.map((v) => (
            <div
              key={v.nombre}
              className="glass flex items-center justify-between rounded-xl2 px-4 py-3 shadow-glass"
            >
              <div className="flex items-center gap-2.5">
                <StatusDot estado={v.estado} />
                <span className="font-display text-lg tracking-wide" style={{ color: v.color }}>
                  {v.nombre}
                </span>
              </div>
              <div className="text-right">
                <div className="font-mono text-base tnum text-white">
                  {fmt(v.pax)} <span className="text-white/35">/ {fmt(v.meta)}</span>
                </div>
                <div className="text-[11px] text-white/45">
                  {pct(v.cumplimiento)} · {v.topRpMes ? `top ${v.topRpMes.label}` : "lista propia"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
