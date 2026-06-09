"use client";

import type { Snapshot, Notes } from "@/lib/types";
import { fmt, pct } from "@/lib/config";
import { Exportable } from "./Exportable";
import { SectionLabel, ShareBar, StatusDot, Crown } from "./primitives";

export function ReportesView({ snapshot, notes }: { snapshot: Snapshot; notes: Notes }) {
  const s = snapshot;
  const fecha = safeDate(s.generadoEn);
  return (
    <div className="space-y-6">
      <p className="px-1 text-xs leading-relaxed text-white/45">
        Cuatro entregables del mes. Cada tarjeta se descarga como imagen (PNG) lista
        para compartir desde el iPhone.
      </p>

      {/* 1 · Guest List y Visitas (KPI) */}
      <div>
        <SectionLabel>1 · Guest List y Visitas</SectionLabel>
        <Exportable filename={`HOG-GuestList-${s.mes}`}>
          <ReportFrame title="Guest List y Visitas" subtitle="KPI del mes" mes={s.mes} source={s.source} fecha={fecha}>
            <div className="grid grid-cols-2 gap-3">
              <Metric label="Visitas (PAX)" value={fmt(s.totalPax)} sub={`${fmt(s.totalGuests)} reservas`} />
              <Metric label="KPI 150" value={pct(s.cumplimientoVisitas)} sub={`meta ${fmt(s.metaVisitas)}`} tone={estTone(s.estadoVisitas)} />
              <Metric label="Propias" value={fmt(s.propiasPax)} sub={pct(s.totalPax ? s.propiasPax / s.totalPax : 0)} tone="#D8B777" />
              <Metric label="Vía RP" value={fmt(s.rpPax)} sub={`${s.byRp.length} RPs activos`} tone="#7FD8D0" />
            </div>
            <div className="mt-4">
              <div className="mb-1.5 flex justify-between text-[11px] text-white/45">
                <span>Avance al KPI de 150 visitas</span>
                <span className="font-mono tnum">{fmt(s.totalPax)} / {fmt(s.metaVisitas)}</span>
              </div>
              <ShareBar value={s.cumplimientoVisitas} color={estTone(s.estadoVisitas)} height={9} />
            </div>
            {s.byRp.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 text-[10px] uppercase tracking-[0.16em] text-white/40">Top RPs</div>
                <div className="space-y-1.5">
                  {s.byRp.slice(0, 4).map((r, i) => (
                    <div key={r.id} className="flex items-center gap-2 text-sm">
                      <span className="w-4 text-white/35">{i + 1}</span>
                      <span className="h-2 w-2 rounded-full" style={{ background: r.color }} />
                      <span className="flex-1 truncate text-white/80">{r.label}</span>
                      <span className="font-mono tnum text-white/90">{fmt(r.pax)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ReportFrame>
        </Exportable>
      </div>

      {/* 2 · Performance Mensual */}
      <div>
        <SectionLabel>2 · Performance Mensual</SectionLabel>
        <Exportable filename={`HOG-Performance-${s.mes}`}>
          <ReportFrame title="Performance Mensual" subtitle="Documento integrador" mes={s.mes} source={s.source} fecha={fecha}>
            <div className="space-y-2">
              {s.venues.map((v) => (
                <div key={v.nombre} className="flex items-center justify-between rounded-xl2 bg-white/[0.03] px-3.5 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <StatusDot estado={v.estado} />
                    <span className="font-display text-base tracking-wide" style={{ color: v.color }}>{v.nombre}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm tnum text-white">{fmt(v.pax)} / {fmt(v.meta)}</div>
                    <div className="text-[11px] text-white/45">{pct(v.cumplimiento)} · {v.topRpMes ? `top ${v.topRpMes.label}` : "lista propia"}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <WinnerMini label="Mejor RP del mes" rp={s.winners.mes.rp} />
              <WinnerMini label="Mejor en fin de semana" rp={s.winners.finde.rp} />
            </div>
            <Block label="Alertas" text={notes.alertas || autoAlertas(s)} />
            <Block label="Compromisos siguiente período" text={notes.compromisos} />
          </ReportFrame>
        </Exportable>
      </div>

      {/* 3 · Presencia de Marca */}
      <div>
        <SectionLabel>3 · Presencia de Marca</SectionLabel>
        <Exportable filename={`HOG-Marca-${s.mes}`}>
          <ReportFrame title="Presencia de Marca" subtitle="Actividad de comunicación" mes={s.mes} source={s.source} fecha={fecha} accent="#C9A8E0">
            <div className="space-y-3">
              <Block label="Menciones obtenidas" text={notes.menciones} />
              <Block label="Gestiones con medios / curadores" text={notes.medios} />
              <Block label="Temperatura de percepción" text={notes.percepcion} />
              <Block label="Momentos destacados" text={notes.highlights} />
            </div>
          </ReportFrame>
        </Exportable>
      </div>

      {/* 4 · Plan de Comunicación */}
      <div>
        <SectionLabel>4 · Plan de Comunicación</SectionLabel>
        <Exportable filename={`HOG-PlanComunicacion-${s.mes}`}>
          <ReportFrame title="Plan de Comunicación" subtitle="Guía de intención operativa" mes={s.mes} source={s.source} fecha={fecha} accent="#E8C56B">
            <div className="space-y-3">
              <Block label="Ejes narrativos del mes" text={notes.plan} />
              <Block label="Perfil de audiencia objetivo" text={notes.audiencia} />
              <Block label="Canales y momentos de activación" text={notes.canales} />
            </div>
          </ReportFrame>
        </Exportable>
      </div>
    </div>
  );
}

/* ---------- piezas ---------- */

function ReportFrame({
  title,
  subtitle,
  mes,
  source,
  fecha,
  children,
  accent = "#7FD8D0",
}: {
  title: string;
  subtitle?: string;
  mes: string;
  source: "live" | "demo";
  fecha: string;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <div
      style={{
        background: "linear-gradient(160deg,#10131A 0%,#0A0C11 58%,#0C0F14 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
      className="overflow-hidden rounded-xl3 p-6 shadow-glass"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.24em] text-white/35">HOG · Guest List</div>
          <div className="mt-1 font-display text-2xl font-light tracking-wide text-white">{title}</div>
          {subtitle && <div className="text-xs text-white/45">{subtitle}</div>}
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
          style={{
            color: source === "live" ? "#5FD0A0" : "#E8C56B",
            border: `1px solid ${source === "live" ? "#5FD0A033" : "#E8C56B33"}`,
            background: source === "live" ? "#5FD0A012" : "#E8C56B12",
          }}
        >
          {source === "live" ? "En vivo" : "Demo"}
        </span>
      </div>
      <div className="mt-3 h-px w-full" style={{ background: `linear-gradient(90deg, ${accent}55, transparent)` }} />
      <div className="mt-4">{children}</div>
      <div className="mt-6 flex items-center justify-between text-[10px] text-white/30">
        <span className="font-display tracking-wide">BRUMA RECORDS · HOG</span>
        <span className="tnum">{mes} · {fecha}</span>
      </div>
    </div>
  );
}

function Metric({ label, value, sub, tone = "#fff" }: { label: string; value: string; sub?: string; tone?: string }) {
  return (
    <div className="rounded-xl2 bg-white/[0.035] p-3.5" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="text-[10px] uppercase tracking-wider text-white/40">{label}</div>
      <div className="mt-1 font-mono text-2xl font-medium tnum" style={{ color: tone }}>{value}</div>
      {sub && <div className="text-[11px] text-white/45">{sub}</div>}
    </div>
  );
}

function WinnerMini({ label, rp }: { label: string; rp: Snapshot["winners"]["mes"]["rp"] }) {
  const color = rp?.color ?? "rgba(255,255,255,0.4)";
  return (
    <div className="rounded-xl2 bg-white/[0.03] p-3" style={{ border: `1px solid ${color}33` }}>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/40">
        <Crown size={11} color={color} /> {label}
      </div>
      <div className="truncate font-display text-base" style={{ color }}>{rp ? rp.label : "—"}</div>
      {rp && <div className="font-mono text-xs tnum text-white/70">{fmt(rp.pax)} PAX</div>}
    </div>
  );
}

function Block({ label, text }: { label: string; text: string }) {
  return (
    <div className="mt-3">
      <div className="text-[10px] uppercase tracking-[0.16em] text-white/40">{label}</div>
      <div className={`mt-0.5 whitespace-pre-line text-sm leading-relaxed ${text ? "text-white/80" : "italic text-white/30"}`}>
        {text || "Pendiente · captúralo en la pestaña Metas."}
      </div>
    </div>
  );
}

function estTone(e: "ok" | "warn" | "risk") {
  return e === "ok" ? "#5FD0A0" : e === "warn" ? "#E8C56B" : "#E8836B";
}

function autoAlertas(s: Snapshot): string {
  const risk = s.venues.filter((v) => v.estado === "risk").map((v) => `${v.nombre} al ${pct(v.cumplimiento)} del KPI`);
  if (!risk.length) return s.totalPax ? "Sin alertas: todos los venues en ritmo." : "";
  return `Por debajo de meta: ${risk.join("; ")}.`;
}

function safeDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}
