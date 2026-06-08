import { NextResponse } from "next/server";
import { sheetCsvUrl } from "@/lib/config";
import { parseSheet } from "@/lib/sheet";
import { DEMO, isEmptyMonth } from "@/lib/seed";
import type { MonthData } from "@/lib/types";

export const revalidate = 60;

export async function GET() {
  try {
    const res = await fetch(sheetCsvUrl(), {
      next: { revalidate: 60 },
      headers: { "User-Agent": "bruma-app" },
    });

    if (!res.ok) throw new Error(`sheet status ${res.status}`);
    const csv = await res.text();

    // Guard: published-to-web returns CSV; a login/HTML page means it isn't public.
    if (/<html/i.test(csv.slice(0, 200))) {
      throw new Error("sheet not published (got HTML)");
    }

    const months: MonthData[] = parseSheet(csv);
    const hasData = months.some((m) => !isEmptyMonth(m));

    if (!months.length || !hasData) {
      return NextResponse.json({ source: "demo", months: [DEMO] });
    }
    return NextResponse.json({ source: "live", months });
  } catch {
    return NextResponse.json({ source: "demo", months: [DEMO] });
  }
}
