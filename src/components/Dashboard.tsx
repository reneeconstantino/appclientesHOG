"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { MonthData, Source, Targets } from "@/lib/types";
import { buildSnapshot } from "@/lib/kpi";
import { isEmptyMonth } from "@/lib/seed";
import { DEFAULT_TARGETS, TARGETS_STORAGE_KEY } from "@/lib/config";
import { Pill } from "./primitives";
import { ResumenView } from "./ResumenView";
import { SemanasView } from "./SemanasView";
import { MetasView } from "./MetasView";
import { BottomTabBar, type Tab } from "./BottomTabBar";

interface ApiResponse {
  source: Source;
  months: MonthData[];
}

export function Dashboard() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState(false);
  const [targets, setTargets] = useState<Targets>(DEFAULT_TARGETS);
  const [monthIdx, setMonthIdx] = useState(0);
  const [venueIdx, setVenueIdx] = useState(0);
  const [tab, setTab] = useState<Tab>("resumen");

  // Load persisted targets (client only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(TARGETS_STORAGE_KEY);
      if (raw) setTargets({ ...DEFAULT_TARGETS, ...JSON.parse(raw) });
    } catch {
      /* noop */
    }
  }, []);

  // Persist targets
  useEffect(() => {
    try {
      localStorage.setItem(TARGETS_STORAGE_KEY, JSON.stringify(targets));
    } catch {
      /* noop */
    }
  }, [targets]);

  // Fetch data
  useEffect(() => {
    let alive = true;
    fetch("/api/data")
      .then((r) => r.json())
      .then((d: ApiResponse) => {
        if (!alive) return;
        setData(d);
        const firstWithData = d.months.findIndex((m) => !isEmptyMonth(m));
        setMonthIdx(firstWithData >= 0 ? firstWithData : 0);
      })
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, []);

  const month = data?.months[monthIdx];
  const snapshot = useMemo(
    () => (month ? buildSnapshot(month, targets, data!.source) : null),
    [month, targets, data],
  );

  // Clamp venue index
  useEffect(() => {
    if (snapshot && venueIdx >= snapshot.venues.length) setVenueIdx(0);
  }, [snapshot, venueIdx]);

  return (
    <div className="mx-auto min-h-[100dvh] w-full max-w-md px-4 pb-28">
      {/* Header */}
      <header
        className="sticky top-0 z-30 -mx-4 mb-4 px-4 pb-3"
        style={{ paddingTop: "calc(var(--safe-top) + 0.85rem)" }}
      >
        <div className="glass -mx-1 rounded-b-xl3 px-4 py-3.5 shadow-glass">
          <div className="flex items-end justify-between">
            <div>
              <div className="font-display text-[2rem] font-light leading-none tracking-[0.04em] text-white">
                BRUMA
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.26em] text-white/35">
                Centro de cumplimiento
              </div>
            </div>
            {snapshot && (
              <Pill tone={snapshot.source === "live" ? "mist" : "gold"}>
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{
                    background: snapshot.source === "live" ? "#7FD8D0" : "#D8B777",
                  }}
                />
                {snapshot.source === "live" ? "Datos en vivo" : "Datos demo"}
              </Pill>
            )}
          </div>

          {data && data.months.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-0.5">
              {data.months.map((m, i) => (
                <button
                  key={m.mes + i}
                  onClick={() => setMonthIdx(i)}
                  className="whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors"
                  style={{
                    color: i === monthIdx ? "#07080A" : "rgba(255,255,255,0.55)",
                    background:
                      i === monthIdx
                        ? "linear-gradient(180deg,#E8D2A4,#D8B777)"
                        : "rgba(255,255,255,0.05)",
                  }}
                >
                  {m.mes}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Body */}
      {error && (
        <div className="glass rounded-xl2 p-6 text-center text-sm text-white/60 shadow-glass">
          No se pudo cargar la fuente de datos. Revisa la conexión y reintenta.
        </div>
      )}

      {!data && !error && (
        <div className="space-y-4">
          <div className="h-80 animate-pulse rounded-xl3 bg-white/[0.03]" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl2 bg-white/[0.03]" />
            ))}
          </div>
        </div>
      )}

      {snapshot && (
        <AnimatePresence mode="wait">
          <motion.div
            key={tab + monthIdx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {tab === "resumen" && (
              <ResumenView
                snapshot={snapshot}
                venueIdx={venueIdx}
                setVenueIdx={setVenueIdx}
              />
            )}
            {tab === "semanas" && (
              <SemanasView
                snapshot={snapshot}
                venueIdx={venueIdx}
                setVenueIdx={setVenueIdx}
              />
            )}
            {tab === "metas" && (
              <MetasView targets={targets} setTargets={setTargets} />
            )}
          </motion.div>
        </AnimatePresence>
      )}

      <BottomTabBar tab={tab} setTab={setTab} />
    </div>
  );
}
