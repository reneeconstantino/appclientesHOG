"use client";

import type { Targets, Notes } from "@/lib/types";
import { SectionLabel } from "./primitives";

export function MetasView({
  targets,
  setTargets,
  notes,
  setNotes,
}: {
  targets: Targets;
  setTargets: (t: Targets) => void;
  notes: Notes;
  setNotes: (n: Notes) => void;
}) {
  const num = (k: keyof Targets) => (v: string) =>
    setTargets({ ...targets, [k]: Math.max(0, parseInt(v.replace(/[^\d]/g, ""), 10) || 0) });
  const note = (k: keyof Notes) => (v: string) => setNotes({ ...notes, [k]: v });

  return (
    <div className="space-y-6">
      {/* Metas numéricas */}
      <section className="glass rounded-xl3 p-5 shadow-glass">
        <SectionLabel>Metas del KPI</SectionLabel>
        <div className="space-y-3">
          <NumberField label="KPI · Visitas por mes (por venue)" hint="El famoso “150 Visitas”." value={targets.metaVisitasMes} onChange={num("metaVisitasMes")} />
          <NumberField label="Meta de visitas por fin de semana" value={targets.metaVisitasSemana} onChange={num("metaVisitasSemana")} />
          <NumberField label="Fines de semana operativos / mes" value={targets.semanasOperativas} onChange={num("semanasOperativas")} />
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-white/40">
          Se guardan en este dispositivo. La meta total del mes = KPI por venue × número de venues.
        </p>
      </section>

      {/* Plan de comunicación */}
      <section className="glass rounded-xl3 p-5 shadow-glass">
        <SectionLabel>Plan de Comunicación</SectionLabel>
        <div className="space-y-3">
          <TextField label="Ejes narrativos del mes" value={notes.plan} onChange={note("plan")} placeholder="Historia y mensajes clave para Bruma Records…" />
          <TextField label="Perfil de audiencia objetivo" value={notes.audiencia} onChange={note("audiencia")} placeholder="A quién hablamos este mes…" />
          <TextField label="Canales y momentos de activación" value={notes.canales} onChange={note("canales")} placeholder="Instagram, prensa, aliados… fechas clave…" />
        </div>
      </section>

      {/* Presencia de marca */}
      <section className="glass rounded-xl3 p-5 shadow-glass">
        <SectionLabel>Presencia de Marca</SectionLabel>
        <div className="space-y-3">
          <TextField label="Menciones obtenidas" value={notes.menciones} onChange={note("menciones")} placeholder="Medios, perfiles, alcance…" />
          <TextField label="Gestiones con medios / curadores" value={notes.medios} onChange={note("medios")} />
          <TextField label="Temperatura de percepción" value={notes.percepcion} onChange={note("percepcion")} placeholder="Cómo se percibe el venue en su segmento…" />
          <TextField label="Momentos destacados" value={notes.highlights} onChange={note("highlights")} />
        </div>
      </section>

      {/* Performance */}
      <section className="glass rounded-xl3 p-5 shadow-glass">
        <SectionLabel>Cierre de Performance</SectionLabel>
        <div className="space-y-3">
          <TextField label="Alertas detectadas" value={notes.alertas} onChange={note("alertas")} placeholder="Si lo dejas vacío, se generan automáticamente." />
          <TextField label="Compromisos para el siguiente período" value={notes.compromisos} onChange={note("compromisos")} />
        </div>
      </section>
    </div>
  );
}

function NumberField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <div className="text-sm text-white/70">{label}</div>
      {hint && <div className="text-[11px] text-white/35">{hint}</div>}
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-xl2 border border-white/10 bg-white/[0.04] px-4 py-3 font-mono text-lg tnum text-white outline-none transition-colors focus:border-gold/40"
      />
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <div className="text-sm text-white/70">{label}</div>
      <textarea
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full resize-y rounded-xl2 border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-relaxed text-white outline-none transition-colors placeholder:text-white/25 focus:border-gold/40"
      />
    </label>
  );
}
