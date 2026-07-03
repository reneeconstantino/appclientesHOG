import { NextResponse } from "next/server";
import { writeWeekNote } from "@/lib/sheets";
import { requireSession } from "@/lib/guard";

export const dynamic = "force-dynamic"; // writes must never be cached

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { notaRow, nota } = (await req.json()) as { notaRow: number; nota: string };
    if (typeof notaRow !== "number" || typeof nota !== "string") {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const result = await writeWeekNote(notaRow, nota);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Error al guardar la nota" }, { status: 500 });
  }
}
