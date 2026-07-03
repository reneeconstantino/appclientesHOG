"use client";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// Mensajes legibles para los errores que NextAuth manda como ?error=...
const ERRORES: Record<string, string> = {
  Configuration: "Falta configuración en el servidor. Revisa las variables de entorno en Vercel.",
  AccessDenied: "Ese correo no está en la lista de autorizados.",
  OAuthSignin: "No se pudo conectar con Google. Intenta de nuevo.",
  OAuthCallback: "Google rechazó el acceso. Revisa la URI de redireccionamiento.",
  Verification: "El enlace de acceso expiró o ya se usó.",
};

function LoginCard() {
  const params = useSearchParams();
  const error = params.get("error");
  const callbackUrl = params.get("callbackUrl") || "/";
  const msg = error ? ERRORES[error] || "No se pudo iniciar sesión. Intenta de nuevo." : null;

  return (
    <div className="w-full max-w-sm rounded-3xl border border-line bg-panel p-8">
      <div className="font-mono text-[11px] tracking-[0.3em] text-steel">CONTROL DE ACCESOS</div>
      <h1 className="mt-2 font-display text-5xl tracking-widest text-bone">
        BRU<span className="text-ice">MA</span>
      </h1>
      <p className="mt-2 text-sm text-steel">
        Ingresa con tu cuenta autorizada para abrir la lista de la noche.
      </p>

      {msg && (
        <p className="mt-5 rounded-xl border border-ember/30 bg-ember/5 px-4 py-3 text-sm text-ember">
          {msg}
        </p>
      )}

      <button
        onClick={() => signIn("google", { callbackUrl })}
        className="mt-6 w-full rounded-xl bg-ice py-3.5 text-sm font-semibold text-void active:scale-[0.99]"
      >
        Entrar con Google
      </button>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh place-items-center px-4">
      <Suspense fallback={<div className="font-mono text-sm text-steel">Cargando…</div>}>
        <LoginCard />
      </Suspense>
    </div>
  );
}
