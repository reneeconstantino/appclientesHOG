import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// The only accounts allowed into the panel. Anyone else is bounced at sign-in.
// Managed here (env-overridable) so adding a host is a one-line change + redeploy.
const ALLOWLIST = (
  process.env.ALLOWED_EMAILS ||
  "rene.constantino12@gmail.com,sibiladelanoche@gmail.com,valkyria.sibiladelanoche@gmail.com"
)
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    // Gate access by email. Reject before a session is ever created.
    async signIn({ user }) {
      const email = (user.email || "").toLowerCase();
      return ALLOWLIST.includes(email);
    },
  },
  pages: { signIn: "/login", error: "/login" },
};

export function isAllowed(email?: string | null) {
  return !!email && ALLOWLIST.includes(email.toLowerCase());
}
