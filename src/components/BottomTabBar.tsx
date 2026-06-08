"use client";

export type Tab = "resumen" | "semanas" | "metas";

const ICONS: Record<Tab, React.ReactNode> = {
  resumen: (
    <path
      d="M4 13h7V4H4v9zm0 7h7v-5H4v5zm9 0h7v-9h-7v9zm0-16v5h7V4h-7z"
      fill="currentColor"
    />
  ),
  semanas: (
    <path
      d="M4 20V10m5 10V4m5 16v-7m5 7V8"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      fill="none"
    />
  ),
  metas: (
    <path
      d="M12 3v3m0 12v3m9-9h-3M6 12H3m13.5-6.5l-2 2m-7 7l-2 2m11 0l-2-2m-7-7l-2-2M12 9a3 3 0 100 6 3 3 0 000-6z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      fill="none"
    />
  ),
};

const LABELS: Record<Tab, string> = {
  resumen: "Resumen",
  semanas: "Semanas",
  metas: "Metas",
};

export function BottomTabBar({
  tab,
  setTab,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
}) {
  const tabs: Tab[] = ["resumen", "semanas", "metas"];
  return (
    <nav
      className="glass fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-white/10 px-4 pt-2"
      style={{ paddingBottom: "calc(var(--safe-bottom) + 0.5rem)" }}
    >
      {tabs.map((t) => {
        const active = t === tab;
        return (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex flex-1 flex-col items-center gap-1 py-1 transition-colors"
            style={{ color: active ? "#D8B777" : "rgba(255,255,255,0.4)" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24">
              {ICONS[t]}
            </svg>
            <span className="text-[10px] font-medium tracking-wide">
              {LABELS[t]}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
