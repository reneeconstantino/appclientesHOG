import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Monta todos los endpoints de NextAuth (/api/auth/signin, /callback/google,
// /session, /error, ...). Sin este handler el login no existe.
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
