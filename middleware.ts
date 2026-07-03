import { withAuth } from "next-auth/middleware";

// Server-side gate: unauthenticated hits to these paths bounce to /login.
// (API routes additionally re-check the allowlist in lib/guard.)
// pages.signIn se declara también aquí: el middleware no lee authOptions,
// y sin esto mandaría a la pantalla genérica de NextAuth en vez de /login.
export default withAuth({ pages: { signIn: "/login" } });

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
