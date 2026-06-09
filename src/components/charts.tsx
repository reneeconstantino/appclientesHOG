"use client";

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RpStat, WeekStat } from "@/lib/types";
import { ESTADO_COLOR } from "./primitives";
import { fmt, pct } from "@/lib/config";

/* ---------- PAX por RP (barras horizontales) ---------- */

export function RpBarChart({ rows }: { rows: RpStat[] }) {
  const data = rows.map((r) => ({ ...r, name: r.label }));
  const h = Math.max(120, data.length * 42 + 12);
  return (
    <div style={{ width: "100%", height: h }}>
      <ResponsiveContainer>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 4, right: 44, left: 6, bottom: 4 }}
          barCategoryGap={10}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            tickLine={false}
            axisLine={false}
            width={104}
            tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
          />
          <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} content={<RpTooltip />} />
          <Bar dataKey="pax" radius={[0, 6, 6, 0]} maxBarSize={26}
            label={{ position: "right", fill: "rgba(255,255,255,0.85)", fontSize: 12,
              formatter: (v: number) => fmt(v) }}>
            {data.map((r) => (
              <Cell key={r.id} fill={r.color} fillOpacity={0.92} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function RpTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const r: RpStat = payload[0].payload;
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs shadow-glass">
      <div className="font-medium text-white">{r.label}</div>
      <div className="mt-1 font-mono tnum text-white">
        {fmt(r.pax)} PAX · {fmt(r.guests)} reservas
      </div>
      <div className="text-white/50">{pct(r.sharePct)} del total</div>
    </div>
  );
}

/* ---------- Tendencia semanal (barras verticales) ---------- */

export function WeeklyTrend({ weeks, meta }: { weeks: WeekStat[]; meta: number }) {
  const data = weeks.map((w) => ({ ...w, name: `S${w.index}` }));
  return (
    <div style={{ width: "100%", height: 210 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 18, right: 10, left: -18, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
            width={36}
          />
          <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} content={<WeekTooltip />} />
          {meta > 0 && (
            <ReferenceLine
              y={meta}
              stroke="#D8B777"
              strokeDasharray="4 4"
              strokeOpacity={0.7}
              label={{ value: `Meta ${fmt(meta)}`, position: "right", fill: "#D8B777", fontSize: 10 }}
            />
          )}
          <Bar dataKey="pax" radius={[6, 6, 0, 0]} maxBarSize={46}>
            {data.map((w) => (
              <Cell key={w.index} fill={ESTADO_COLOR[w.estado]} fillOpacity={0.92} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function WeekTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const w: WeekStat = payload[0].payload;
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs shadow-glass">
      <div className="font-medium text-white">Semana {w.index}</div>
      <div className="text-white/50">{w.dias}</div>
      <div className="mt-1 font-mono tnum text-white">
        {fmt(w.pax)} PAX · {fmt(w.guests)} reservas
      </div>
      {w.topRp && (
        <div className="mt-0.5" style={{ color: w.topRp.color }}>
          Mejor: {w.topRp.label}
        </div>
      )}
    </div>
  );
}

/* ---------- Dona de reparto (propias + RPs) ---------- */

export interface Slice {
  label: string;
  value: number;
  color: string;
}

export function ShareDonut({
  slices,
  centerMain,
  centerSub,
}: {
  slices: Slice[];
  centerMain: string;
  centerSub?: string;
}) {
  const data = slices.filter((s) => s.value > 0);
  return (
    <div className="relative" style={{ width: "100%", height: 200 }}>
      <ResponsiveContainer>
        <PieChart>
          <Tooltip content={<SliceTooltip />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius={62}
            outerRadius={92}
            paddingAngle={2}
            stroke="none"
            startAngle={90}
            endAngle={-270}
          >
            {data.map((s) => (
              <Cell key={s.label} fill={s.color} fillOpacity={0.92} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="font-mono text-3xl font-semibold tnum text-white">{centerMain}</div>
        {centerSub && <div className="mt-0.5 text-[11px] text-white/45">{centerSub}</div>}
      </div>
    </div>
  );
}

function SliceTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const s = payload[0];
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs shadow-glass">
      <div className="font-medium text-white">{s.name}</div>
      <div className="mt-0.5 font-mono tnum text-white">{fmt(s.value)} PAX</div>
    </div>
  );
}
