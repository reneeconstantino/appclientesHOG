"use client";

import type { Targets } from "@/lib/types";
import { DEFAULT_TARGETS, fmt } from "@/lib/config";

function Stepper({
  label,
  hint,
  value,
  step,
  min = 0,
  max = 99999,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  step: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
}) {
  const set = (v: number) => onChange(Math.max(min, Math.min(max, v)));
  return (
    <div className="glass flex items-center justify-between rounded-xl2 p-4 shadow-glass">
      <div className="pr-3">
        <div className="text-sm font-medium text-white">{label}</div>
        <div className="text-[11px] text-white/40">{hint}</div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => set(value - step)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-lg text-white/70 active:scale-95"
          aria-label="menos"
        >
          −
        </button>
        <span className="w-14 text-center font-mono text-lg font-medium tnum text-white">
          {fmt(value)}
        </span>
        <button
          onClick={() => set(value + step)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/25 bg-gold/[0.08] text-lg text-gold-soft active:scale-95"
          aria-label="más"
        >
          +
        </button>
      </div>
    </div>
  );
}

export function MetasView({
  targets,
  setTargets,
}: {
  targets: Targets;
  setTargets: (t: Targets) => void;
}) {
  const patch = (p: Partial<Targets>) => setTargets({ ...targets, ...p });

  return (
    <div className="space-y-3">
      <div className="px-1">
        <h2 className="font-display text-2xl font-light text-white">Anexo Bruma</h2>
        <p className="mt-1 text-xs text-white/45">
          Mínimos contractuales. Ajusta cada valor a tu acuerdo vigente; el
          tablero recalcula el cumplimiento al instante.
        </p>
      </div>

      <Stepper
        label="Meta mensual"
        hint="PAX comprometidos al mes"
        value={targets.metaMensualPax}
        step={10}
        onChange={(v) => patch({ metaMensualPax: v })}
      />
      <Stepper
        label="Meta semanal"
        hint="PAX mínimos por semana operativa"
        value={targets.metaSemanalPax}
        step={5}
        onChange={(v) => patch({ metaSemanalPax: v })}
      />
      <Stepper
        label="Reservas / mes"
        hint="Número mínimo de registros"
        value={targets.metaReservasMes}
        step={2}
        onChange={(v) => patch({ metaReservasMes: v })}
      />
      <Stepper
        label="PAX promedio"
        hint="Objetivo por reserva"
        value={targets.paxPromObjetivo}
        step={1}
        min={1}
        onChange={(v) => patch({ paxPromObjetivo: v })}
      />
      <Stepper
        label="Semanas operativas"
        hint="Semanas con operación en el mes"
        value={targets.semanasOperativas}
        step={1}
        min={1}
        max={6}
        onChange={(v) => patch({ semanasOperativas: v })}
      />

      <button
        onClick={() => setTargets({ ...DEFAULT_TARGETS })}
        className="w-full rounded-xl2 border border-white/10 py-3 text-sm text-white/50 active:scale-[0.99]"
      >
        Restablecer valores del Anexo
      </button>
    </div>
  );
}
