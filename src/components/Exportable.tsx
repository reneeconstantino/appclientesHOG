"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";

/**
 * Envuelve un bloque y ofrece un botón "Descargar PNG" (3x, fondo oscuro).
 * El botón queda FUERA del nodo capturado para no salir en la imagen.
 */
export function Exportable({
  filename,
  children,
  label = "Descargar PNG",
}: {
  filename: string;
  children: React.ReactNode;
  label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    const node = ref.current;
    if (!node) return;
    setBusy(true);
    try {
      const url = await toPng(node, {
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: "#0A0C11",
      });
      const a = document.createElement("a");
      a.download = filename.endsWith(".png") ? filename : `${filename}.png`;
      a.href = url;
      a.click();
    } catch (e) {
      console.error("Export PNG falló", e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div ref={ref}>{children}</div>
      <button
        onClick={save}
        disabled={busy}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl2 border border-gold/30 bg-gold/[0.08] py-3 text-sm font-medium text-gold-soft transition-colors active:bg-gold/[0.16] disabled:opacity-50"
      >
        {busy ? (
          "Generando…"
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {label}
          </>
        )}
      </button>
    </div>
  );
}
