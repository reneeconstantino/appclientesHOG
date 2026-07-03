"use client";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function TopBar() {
  const path = usePathname();
  const onDash = path?.startsWith("/dashboard");
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-void/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-display text-2xl tracking-widest text-bone">
          BRU<span className="text-ice">MA</span>
        </Link>
        <nav className="flex items-center gap-1 font-mono text-[11px]">
          <Link
            href="/"
            className={`rounded-lg px-3 py-1.5 ${!onDash ? "bg-panel text-bone" : "text-steel"}`}
          >
            PUERTA
          </Link>
          <Link
            href="/dashboard"
            className={`rounded-lg px-3 py-1.5 ${onDash ? "bg-panel text-bone" : "text-steel"}`}
          >
            MÉTRICAS
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="px-2 py-1.5 text-steel">
            Salir
          </button>
        </nav>
      </div>
    </header>
  );
}
