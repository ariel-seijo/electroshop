"use server";

import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";

interface SaveCartItem {
  productId: number;
  quantity: number;
}

interface SaveCartWarning {
  productId: number;
  requested: number;
  capped: number;
  maxStock: number;
}

interface SaveCartResult {
  warnings: SaveCartWarning[];
}

export async function saveCart(items: SaveCartItem[]): Promise<SaveCartResult> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.userId) {
    return { warnings: [] };
  }

  const userId = session.userId;

  const result = await prisma.$transaction(async (tx) => {
    const warnings: SaveCartWarning[] = [];

    if (items.length === 0) {
      await tx.cartItem.deleteMany({ where: { userId } });
      return { warnings };
    }

    const productIds = items.map((i) => i.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, stock: true, active: true },
    });
    const stockMap = new Map(
      products.map((p) => [p.id, { stock: p.stock, active: p.active }])
    );

    await tx.cartItem.deleteMany({
      where: { userId, productId: { notIn: productIds } },
    });

    for (const item of items) {
      const product = stockMap.get(item.productId);

      if (!product || !product.active || product.stock <= 0) {
        await tx.cartItem.deleteMany({
          where: { userId, productId: item.productId },
        });
        continue;
      }

      const finalQty = Math.min(item.quantity, product.stock);

      if (finalQty < item.quantity) {
        warnings.push({
          productId: item.productId,
          requested: item.quantity,
          capped: finalQty,
          maxStock: product.stock,
        });
      }

      if (finalQty <= 0) {
        await tx.cartItem.deleteMany({
          where: { userId, productId: item.productId },
        });
        continue;
      }

      await tx.cartItem.upsert({
        where: { userId_productId: { userId, productId: item.productId } },
        create: { userId, productId: item.productId, quantity: finalQty },
        update: { quantity: finalQty },
      });
    }

    return { warnings };
  });

  return result;
}
