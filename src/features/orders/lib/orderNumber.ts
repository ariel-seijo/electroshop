import { prisma } from "@/lib/prisma";

interface PrismaTx {
  order: {
    findFirst(args: {
      where: { orderNumber: { startsWith: string } };
      orderBy: { orderNumber: "desc" };
      select: { orderNumber: true };
    }): Promise<{ orderNumber: string } | null>;
  };
}

export async function generateOrderNumber(tx?: PrismaTx): Promise<string> {
  const db = tx || prisma;
  const year = new Date().getFullYear();
  const prefix = `#ORD-${year}-`;

  const lastOrder = await db.order.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });

  if (!lastOrder) {
    return `${prefix}0001`;
  }

  const lastNumber = parseInt(lastOrder.orderNumber.split("-").pop()!, 10);
  const nextNumber = lastNumber + 1;
  return `${prefix}${String(nextNumber).padStart(4, "0")}`;
}
