import { NextResponse } from "next/server";
import { getRoster, recordCheckin } from "@/lib/sheets";
import { requireSession } from "@/lib/guard";
import type { Side } from "@/types";

export const dynamic = "force-dynamic"; // writes must never be cached

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { rowIndex, side, llegaron } = (await req.json()) as {
      rowIndex: number;
      side: Side;
      llegaron: number;
    };
    if (typeof rowIndex !== "number" || (side !== "V" && side !== "S") || typeof llegaron !== "number") {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    // El total esperado se toma de la hoja, no del cliente: el servidor manda.
    const { guests } = await getRoster();
    const guest = guests.find((g) => g.rowIndex === rowIndex && g.side === side);
    if (!guest) return NextResponse.json({ error: "Invitado no encontrado" }, { status: 404 });

    const result = await recordCheckin(guest, llegaron);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Error al registrar la llegada" }, { status: 500 });
  }
}
