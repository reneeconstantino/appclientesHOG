"use client";
import { useMemo, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import { useRoster } from "@/lib/useRoster";
import { clientStats, prStats, filterByPeriod, realArrivals, type Periodo } from "@/lib/analytics";

const PERIODOS: Periodo[] = ["Semanal", "Mensual", "Trimestral", "Anual"];

export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const { guests, loading, error } = useRoster();
  const [periodo, setPeriodo] = useState<Periodo>("Mensual");

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  const enPeriodo = useMemo(() => filterByPeriod(guests, periodo), [guests, periodo]);
  const clientes = useMemo(() => clientStats(enPeriodo), [enPeriodo]);
  const prs = useMemo(() => prStats(enPeriodo), [enPeriodo]);
  const ingresos = useMemo(() => enPeriodo.reduce((s, g) => s + realArrivals(g), 0), [enPeriodo]);

  if (status !== "authenticated") {
    return <div className="grid min-h-dvh place-items-center font-mono text-sm text-steel">Verificando acceso…</div>;
  }

  return (
    <div className="min-h-dvh pb-24">
      <TopBar />
      <main className="mx-auto max-w-xl px-4">
        {/* Periodo */}
        <div className="mt-4 flex rounded-xl border border-line p-1">
          {PERIODOS.map((p) => (
            <button key={p} onClick={() => setPeriodo(p)}
              className={`flex-1 rounded-lg px-2 py-2 text-xs font-medium ${periodo === p ? "bg-ice text-void" : "text-steel"}`}>
              {p}
            </button>
          ))}
        </div>

        {/* Totales del periodo */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat label="INGRESOS" value={ingresos} accent />
          <Stat label="CLIENTES" value={clientes.length} />
          <Stat label="PRS" value={prs.length} />
        </div>

        {loading && <p className="py-10 text-center font-mono text-sm text-steel">Cargando métricas…</p>}
        {error && (
          <p className="mt-4 rounded-xl border border-ember/30 bg-ember/5 p-4 text-sm text-ember">{error}</p>
        )}

        {!loading && !error && (
          <>
            {/* Ranking de PRs */}
            <Section title={`RANKING PRS · ${periodo.toUpperCase()}`}>
              {prs.length === 0 && <Empty>Aún no hay ingresos registrados en este periodo.</Empty>}
              {prs.map((p, i) => (
                <div key={p.pr} className="flex items-center gap-3 border-b border-line py-3 last:border-0">
                  <div className="w-6 text-center font-display text-xl text-steel">{i + 1}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-xl tracking-wide text-bone">{p.pr}</div>
                    <div className="font-mono text-[10px] text-steel">
                      {p.invitados} invitados · {p.leales} leales · {p.regulares} regulares
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xl text-ice">{p.volumen}</div>
                    <div className="font-mono text-[10px] tracking-wider text-steel">PODER {p.poder}</div>
                  </div>
                </div>
              ))}
            </Section>

            {/* Top clientes */}
            <Section title="CLIENTES · RETENCIÓN">
              {clientes.length === 0 && <Empty>Sin clientes con ingreso real todavía.</Empty>}
              {clientes.slice(0, 15).map((c) => (
                <div key={c.nombre} className="flex items-center gap-3 border-b border-line py-3 last:border-0">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-bone">{c.nombre}</div>
                    <div className="font-mono text-[10px] text-steel">{c.frecuencia} · {c.totalPax} pax acumulado</div>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-wider ${
                    c.retencion === "Leal" ? "border-ice/40 text-ice"
                    : c.retencion === "Regular" ? "border-bone/30 text-bone"
                    : "border-line text-steel"}`}>
                    {c.retencion.toUpperCase()} · {c.visitas}
                  </span>
                </div>
              ))}
            </Section>
          </>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-line bg-panel px-3 py-3 text-center">
      <div className={`font-display text-4xl leading-none ${accent ? "text-ice" : "text-bone"}`}>{value}</div>
      <div className="mt-1 font-mono text-[10px] tracking-wider text-steel">{label}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5 rounded-2xl border border-line bg-panel px-4 py-3">
      <div className="font-mono text-[11px] tracking-[0.3em] text-steel">{title}</div>
      <div className="mt-1">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-center text-sm text-steel">{children}</p>;
}
