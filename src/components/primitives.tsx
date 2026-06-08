"use client";

import { motion } from "framer-motion";
import type { Estado } from "@/lib/types";

export const ESTADO_COLOR: Record<Estado, string> = {
  ok: "#5FD0A0",
  warn: "#E8C56B",
  risk: "#E8836B",
};

export const ESTADO_LABEL: Record<Estado, string> = {
  ok: "Cumplido",
  warn: "En ritmo",
  risk: "Por debajo",
};

export function StatusDot({ estado, size = 8 }: { estado: Estado; size?: number }) {
  return (
    <span
      className="inline-block rounded-full"
      style={{
        width: size,
        height: size,
        background: ESTADO_COLOR[estado],
        boxShadow: `0 0 10px ${ESTADO_COLOR[estado]}66`,
      }}
    />
  );
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "gold" | "mist";
}) {
  const map = {
    neutral: "text-white/55 border-white/10 bg-white/[0.04]",
    gold: "text-gold-soft border-gold/25 bg-gold/[0.08]",
    mist: "text-mist border-mist/25 bg-mist/[0.07]",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide ${map[tone]}`}
    >
      {children}
    </span>
  );
}

export function StatCard({
  label,
  value,
  sub,
  subTone,
  delay = 0,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  subTone?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className="glass rounded-xl2 p-4 shadow-glass"
    >
      <div className="text-[11px] uppercase tracking-[0.14em] text-white/40">
        {label}
      </div>
      <div className="mt-1.5 font-mono text-2xl font-medium tnum text-white">
        {value}
      </div>
      {sub != null && (
        <div className="mt-0.5 text-xs" style={{ color: subTone ?? "rgba(255,255,255,0.45)" }}>
          {sub}
        </div>
      )}
    </motion.div>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="glass relative flex gap-1 rounded-full p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className="relative flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors"
            style={{ color: active ? "#07080A" : "rgba(255,255,255,0.6)" }}
          >
            {active && (
              <motion.span
                layoutId="seg-active"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "linear-gradient(180deg,#E8D2A4 0%,#D8B777 100%)",
                }}
              />
            )}
            <span className="relative z-10">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
