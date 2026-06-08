"use client";

import { motion } from "framer-motion";
import type { Estado } from "@/lib/types";
import { ESTADO_COLOR } from "./primitives";

export function ComplianceRing({
  ratio,
  estado,
  centerTop,
  centerMain,
  centerSub,
  size = 220,
}: {
  ratio: number; // 0..1+
  estado: Estado;
  centerTop?: string;
  centerMain: string;
  centerSub?: string;
  size?: number;
}) {
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const fill = Math.max(0, Math.min(1, ratio));
  const offset = c * (1 - fill);
  const color = ESTADO_COLOR[estado];
  const id = `grad-${estado}`;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity={0.55} />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          style={{ filter: `drop-shadow(0 0 12px ${color}55)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {centerTop && (
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">
            {centerTop}
          </div>
        )}
        <div
          className="font-mono text-5xl font-semibold tnum leading-none"
          style={{ color }}
        >
          {centerMain}
        </div>
        {centerSub && (
          <div className="mt-1.5 text-xs text-white/45">{centerSub}</div>
        )}
      </div>
    </div>
  );
}
