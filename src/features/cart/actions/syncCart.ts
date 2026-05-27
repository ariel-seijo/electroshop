"use server";

import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";

interface SyncItem {
  productId: number;
  quantity: number;
}

interface StockInfo {
  stock: number;
  active: boolean;
}

export interface SyncedCartItem {
  id: number;
  quantity: number;
  userId: string;
  productId: number;
  createdAt: Date;
  updatedAt: Date;
  product: {
    id: number;
    title: string;
    slug: string;
    description: string;
    price: number;
    oldPrice: number | null;
    thumbnail: string;
    images: string[];
    stock: number;
    brand: string;
    sku: string;
    rating: number;
    sold: number;
    featured: boolean;
    active: boolean;
    categoryId: number;
    createdAt: Date;
    updatedAt: Date;
  };
}

export async function syncCart(items: SyncItem[]): Promise<SyncedCartItem[]> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.userId) {
    throw new Error("Not authenticated");
  }

  const userId = session.userId;

  return prisma.$transaction(async (tx) => {
    const productIds = items.map((i) => i.productId);

    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, stock: true, active: true },
    });

    const stockMap = new Map<number, StockInfo>(
      products.map((p) => [p.id, { stock: p.stock, active: p.active }])
    );

    const existing = await tx.cartItem.findMany({
      where: { userId, productId: { in: productIds } },
    });

    const existingMap = new Map<number, number>(
      existing.map((e) => [e.productId, e.quantity])
    );

    for (const item of items) {
      const product = stockMap.get(item.productId);

      if (!product || !product.active || product.stock <= 0) {
        await tx.cartItem.deleteMany({
          where: { userId, productId: item.productId },
        });
        continue;
      }

      const existingQty = existingMap.get(item.productId) ?? 0;
      const requestedTotal = Math.max(item.quantity, existingQty);
      const finalQty = Math.min(requestedTotal, product.stock);

      if (finalQty <= 0) {
        await tx.cartItem.deleteMany({
          where: { userId, productId: item.productId },
        });
        continue;
      }

      await tx.cartItem.upsert({
        where: {
          userId_productId: { userId, productId: item.productId },
        },
        create: {
          userId,
          productId: item.productId,
          quantity: finalQty,
        },
        update: { quantity: finalQty },
      });
    }

    return tx.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });
  });
}
