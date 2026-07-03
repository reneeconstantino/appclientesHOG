"use client";
import { useCallback, useEffect, useState } from "react";
import type { Guest, WeekNote, Side } from "@/types";

export function useRoster() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [notes, setNotes] = useState<WeekNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/roster", { cache: "no-store" });
      if (!res.ok) throw new Error((await res.json()).error || "Error");
      const data = await res.json();
      setGuests(Array.isArray(data.guests) ? data.guests : []);
      setNotes(Array.isArray(data.notes) ? data.notes : []);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const checkin = useCallback(async (rowIndex: number, side: Side, llegaron: number) => {
    try {
      const res = await fetch("/api/checkin", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rowIndex, side, llegaron }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "No se pudo registrar la llegada");
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
    await load();
  }, [load]);

  const saveNote = useCallback(async (notaRow: number, nota: string) => {
    try {
      const res = await fetch("/api/notes", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notaRow, nota }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "No se pudo guardar la nota");
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
    await load();
  }, [load]);

  return { guests, notes, loading, error, reload: load, checkin, saveNote };
}
