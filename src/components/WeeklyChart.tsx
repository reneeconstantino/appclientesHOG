"use client";

import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeekKpi } from "@/lib/types";
import { ESTADO_COLOR } from "./primitives";
import { fmt } from "@/lib/config";

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const w: WeekKpi = payload[0].payload;
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs shadow-glass">
      <div className="font-medium text-white">Semana {w.index}</div>
      <div className="text-white/50">{w.dias}</div>
      <div className="mt-1 font-mono tnum text-white">
        {fmt(w.pax)} PAX · {fmt(w.reservas)} reservas
      </div>
    </div>
  );
}

export default function WeeklyChart({
  weeks,
  meta,
}: {
  weeks: WeekKpi[];
  meta: number;
}) {
  const data = weeks.map((w) => ({ ...w, name: `S${w.index}` }));
  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 18, right: 8, left: -18, bottom: 0 }}>
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
          <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} content={<ChartTooltip />} />
          {meta > 0 && (
            <ReferenceLine
              y={meta}
              stroke="#D8B777"
              strokeDasharray="4 4"
              strokeOpacity={0.7}
              label={{
                value: `Meta ${fmt(meta)}`,
                position: "right",
                fill: "#D8B777",
                fontSize: 10,
              }}
            />
          )}
          <Bar dataKey="pax" radius={[6, 6, 0, 0]} maxBarSize={42}>
            {data.map((w) => (
              <Cell key={w.index} fill={ESTADO_COLOR[w.estado]} fillOpacity={0.92} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
