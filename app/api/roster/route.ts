import { NextResponse } from "next/server";
import { getRoster } from "@/lib/sheets";
import { requireSession } from "@/lib/guard";

export const dynamic = "force-dynamic"; // always live, never cached at the door

export async function GET() {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { guests, notes } = await getRoster();
    return NextResponse.json({ guests, notes });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Error al leer la hoja" }, { status: 500 });
  }
}
