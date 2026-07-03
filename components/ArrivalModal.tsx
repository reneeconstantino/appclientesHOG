"use client";
import { useState } from "react";
import type { Guest } from "@/types";

// Pregunta cuántos del grupo llegaron. Precarga el conteo actual para que una
// segunda vuelta (el resto del grupo llegando más tarde) continúe donde quedó.
// total = PAX (titular ya incluido).
export default function ArrivalModal({
  guest,
  onClose,
  onConfirm,
}: {
  guest: Guest;
  onClose: () => void;
  onConfirm: (llegaron: number) => Promise<void>;
}) {
  const total = guest.total;
  const [count, setCount] = useState(guest.llegaron > 0 ? guest.llegaron : total);
  const [saving, setSaving] = useState(false);
  const clamp = (n: number) => Math.max(0, Math.min(n, total));

  async function confirm() {
    setSaving(true);
    await onConfirm(count);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <button className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-label="Cerrar" />
      <div className="relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl border border-line bg-panel p-6 pb-8">
        <div className="font-mono text-[11px] tracking-[0.3em] text-steel">CHECK-IN · {guest.dia.toUpperCase()}</div>
        <h2 className="mt-1 font-display text-4xl tracking-wide text-bone">{guest.nombre}</h2>
        <p className="mt-1 text-sm text-steel">
          Grupo esperado: <span className="text-bone">{total}</span> pax · PR {guest.pr}
        </p>

        <p className="mt-6 text-sm text-bone">¿Cuántos llegaron?</p>
        <div className="mt-3 flex items-center gap-4">
          <button onClick={() => setCount((c) => clamp(c - 1))}
            className="h-14 w-14 rounded-full border border-line text-2xl text-bone active:scale-95" aria-label="Menos">−</button>
          <div className="flex-1 text-center">
            <div className="font-display text-6xl leading-none text-ice">{count}</div>
            <div className="font-mono text-[11px] text-steel">de {total}</div>
          </div>
          <button onClick={() => setCount((c) => clamp(c + 1))}
            className="h-14 w-14 rounded-full border border-line text-2xl text-bone active:scale-95" aria-label="Más">+</button>
        </div>

        {count > 0 && count < total && (
          <p className="mt-4 rounded-lg border border-ember/30 bg-ember/5 px-3 py-2 text-xs text-ember">
            Grupo parcial. Queda abierto para ingresar al resto si llegan más tarde.
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-line py-3.5 text-sm text-steel active:scale-[0.99]">Cancelar</button>
          <button onClick={confirm} disabled={saving}
            className="flex-1 rounded-xl bg-ice py-3.5 text-sm font-semibold text-void active:scale-[0.99] disabled:opacity-50">
            {saving ? "Guardando…" : count >= total ? "Marcar completa" : "Registrar llegada"}
          </button>
        </div>
      </div>
    </div>
  );
}
