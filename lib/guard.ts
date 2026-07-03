import { getServerSession } from "next-auth";
import { authOptions, isAllowed } from "@/lib/auth";

// Every data route calls this first. No session or off-allowlist -> 401.
export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session || !isAllowed(session.user?.email)) {
    return null;
  }
  return session;
}
