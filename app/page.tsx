"use client";
import { useMemo, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useRoster } from "@/lib/useRoster";
import TopBar from "@/components/TopBar";
import GuestCard from "@/components/GuestCard";
import ArrivalModal from "@/components/ArrivalModal";
import WeeklyNotes from "@/components/WeeklyNotes";
import type { Guest } from "@/types";

export default function DoorPage() {
  const { status } = useSession();
  const router = useRouter();
  const { guests, notes, loading, error, checkin, saveNote } = useRoster();

  const [mes, setMes] = useState<string>("");
  const [semana, setSemana] = useState<string>("");
  const [dia, setDia] = useState<"Viernes" | "Sábado">("Viernes");
  const [target, setTarget] = useState<Guest | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  // Meses y semanas presentes en la hoja, en orden de aparición.
  const meses = useMemo(() => {
    const seen: string[] = [];
    for (const g of guests) if (g.mes && !seen.includes(g.mes)) seen.push(g.mes);
    return seen;
  }, [guests]);

  const semanas = useMemo(() => {
    const seen: string[] = [];
    for (const g of guests) if (g.mes === mes && g.semana && !seen.includes(g.semana)) seen.push(g.semana);
    return seen;
  }, [guests, mes]);

  useEffect(() => { if (!mes && meses.length) setMes(meses[0]); }, [meses, mes]);
  useEffect(() => { if (semanas.length && !semanas.includes(semana)) setSemana(semanas[0]); }, [semanas, semana]);

  const nightGuests = useMemo(
    () => guests.filter((g) => g.mes === mes && g.semana === semana && g.dia === dia),
    [guests, mes, semana, dia]
  );

  const weekNote = useMemo(
    () => notes.find((n) => n.mes === mes && n.semana === semana) || null,
    [notes, mes, semana]
  );

  // Contadores en vivo: cabezas esperadas, ingresadas, grupos abiertos.
  const counters = useMemo(() => {
    let esperados = 0, llegados = 0, abiertas = 0;
    for (const g of nightGuests) {
      esperados += g.total;
      llegados += g.llegaron;
      if (g.asistencia === "Parcial") abiertas++;
    }
    return { esperados, llegados, abiertas };
  }, [nightGuests]);

  if (status !== "authenticated") {
    return <div className="grid min-h-dvh place-items-center font-mono text-sm text-steel">Verificando acceso…</div>;
  }

  return (
    <div className="min-h-dvh pb-24">
      <TopBar />
      <main className="mx-auto max-w-xl px-4">
        {/* Selector Mes / Semana */}
        <div className="mt-4 flex gap-2">
          <select value={mes} onChange={(e) => setMes(e.target.value)}
            className="rounded-xl border border-line bg-panel px-3 py-2.5 text-sm text-bone">
            {meses.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={semana} onChange={(e) => setSemana(e.target.value)}
            className="flex-1 rounded-xl border border-line bg-panel px-3 py-2.5 text-sm text-bone">
            {semanas.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Día */}
        <div className="mt-3 flex rounded-xl border border-line p-1">
          {(["Viernes", "Sábado"] as const).map((d) => (
            <button key={d} onClick={() => setDia(d)}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium ${dia === d ? "bg-ice text-void" : "text-steel"}`}>
              {d}
            </button>
          ))}
        </div>

        {/* Contadores */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Counter label="ESPERADOS" value={counters.esperados} />
          <Counter label="INGRESADOS" value={counters.llegados} accent />
          <Counter label="ABIERTAS" value={counters.abiertas} warn={counters.abiertas > 0} />
        </div>

        {loading && <p className="py-10 text-center font-mono text-sm text-steel">Cargando lista…</p>}
        {error && (
          <p className="mt-4 rounded-xl border border-ember/30 bg-ember/5 p-4 text-sm text-ember">
            {error}. Revisa que la hoja esté compartida con la cuenta de servicio.
          </p>
        )}

        {!loading && !error && (
          <>
            {/* Notas de la semana */}
            {weekNote && (
              <div className="mt-5">
                <WeeklyNotes note={weekNote} onSave={(t) => saveNote(weekNote.notaRow, t)} />
              </div>
            )}

            {/* Lista */}
            <div className="mt-4 space-y-3">
              {nightGuests.length === 0 && (
                <p className="py-10 text-center text-sm text-steel">
                  Sin invitados para {dia} · {semana}. La lista aún no tiene filas aquí.
                </p>
              )}
              {nightGuests.map((g) => (
                <GuestCard key={g.id} guest={g} onCheckin={() => setTarget(g)} />
              ))}
            </div>
          </>
        )}
      </main>

      {target && (
        <ArrivalModal
          guest={target}
          onClose={() => setTarget(null)}
          onConfirm={async (n) => { await checkin(target.rowIndex, target.side, n); setTarget(null); }}
        />
      )}
    </div>
  );
}

function Counter({ label, value, accent, warn }: { label: string; value: number; accent?: boolean; warn?: boolean }) {
  return (
    <div className="rounded-xl border border-line bg-panel px-3 py-3 text-center">
      <div className={`font-display text-4xl leading-none ${warn ? "text-ember" : accent ? "text-ice" : "text-bone"}`}>{value}</div>
      <div className="mt-1 font-mono text-[10px] tracking-wider text-steel">{label}</div>
    </div>
  );
}
