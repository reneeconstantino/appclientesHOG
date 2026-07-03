"use client";
import type { Guest } from "@/types";
import QuotaMeter from "./QuotaMeter";

// Sin botón de nota por invitado: en el Excel real las NOTAS son semanales
// (columna I), así que viven en el panel de notas de la noche, no por persona.
export default function GuestCard({ guest, onCheckin }: { guest: Guest; onCheckin: () => void }) {
  const total = guest.total;
  const open = guest.asistencia === "Parcial";
  const done = guest.asistencia === "Completa";

  return (
    <div className={`rounded-2xl border bg-panel p-4 ${open ? "border-ember/40" : done ? "border-ice/30" : "border-line"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate font-display text-2xl tracking-wide text-bone">{guest.nombre}</div>
          <div className="mt-0.5 font-mono text-[11px] text-steel">PR {guest.pr || "—"} · {total} pax</div>
        </div>
        <div className="shrink-0 text-right">
          <div className="font-mono text-2xl text-ice">{guest.llegaron}<span className="text-steel">/{total}</span></div>
          <div className="font-mono text-[10px] tracking-wider text-steel">
            {done ? "COMPLETA" : open ? "ABIERTA" : "PENDIENTE"}
          </div>
        </div>
      </div>

      <div className="mt-3"><QuotaMeter total={total} arrived={guest.llegaron} /></div>

      <button onClick={onCheckin}
        className={`mt-4 w-full rounded-xl py-3 text-sm font-semibold active:scale-[0.99] ${
          done ? "border border-line text-steel" : "bg-ice text-void"}`}>
        {done ? "Editar" : open ? "Ingresar resto" : "Registrar"}
      </button>
    </div>
  );
}
