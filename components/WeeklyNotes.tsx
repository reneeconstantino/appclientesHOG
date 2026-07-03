"use client";
import { useState, useEffect } from "react";
import type { WeekNote } from "@/types";

// Módulo de Notas Semanales — escribe la columna I del bloque de la semana.
// Aquí se registran walk-ins, VIPs fuera de lista, incidencias de la noche.
export default function WeeklyNotes({ note, onSave }: { note: WeekNote; onSave: (t: string) => Promise<void> }) {
  const [text, setText] = useState(note.nota);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => { setText(note.nota); setDirty(false); }, [note.notaRow, note.nota]);

  async function save() {
    setSaving(true);
    await onSave(text);
    setSaving(false);
    setDirty(false);
  }

  return (
    <div className="rounded-2xl border border-line bg-panel p-4">
      <div className="flex items-center justify-between">
        <div className="font-mono text-[11px] tracking-[0.3em] text-steel">NOTAS · {note.semana}</div>
        {dirty && <span className="font-mono text-[10px] text-ember">sin guardar</span>}
      </div>
      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); setDirty(true); }}
        rows={3}
        placeholder="Walk-in, VIP fuera de lista, incidencia de la noche…"
        className="mt-3 w-full resize-none rounded-xl border border-line bg-void px-4 py-3 text-sm text-bone placeholder:text-steel/60 focus:border-ice/40"
      />
      <button onClick={save} disabled={saving || !dirty}
        className="mt-3 w-full rounded-xl border border-line py-2.5 text-sm text-bone disabled:opacity-40 active:scale-[0.99]">
        {saving ? "Guardando…" : "Guardar nota de la semana"}
      </button>
    </div>
  );
}
