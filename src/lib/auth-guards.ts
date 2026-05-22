import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";

export async function requireAuth(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.userId) {
    throw new Error("Unauthorized");
  }

  return session;
}

export async function requireAdmin(): Promise<IronSession<SessionData>> {
  const session = await requireAuth();

  if (session.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  return session;
}
