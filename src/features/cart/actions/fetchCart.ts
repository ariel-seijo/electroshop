"use server";

import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";
import type { SyncedCartItem } from "./syncCart";

export async function fetchCart(): Promise<SyncedCartItem[]> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.userId) {
    throw new Error("Not authenticated");
  }

  return prisma.cartItem.findMany({
    where: { userId: session.userId },
    include: { product: true },
  });
}
