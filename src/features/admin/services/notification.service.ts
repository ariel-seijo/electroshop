import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const getAdminNotifications = unstable_cache(
  async () => {
    const [lowStockProducts, recentOrders] = await Promise.all([
      prisma.product.findMany({
        where: { stock: { lt: 5 } },
        select: { id: true, title: true, stock: true },
        orderBy: { stock: "asc" },
        take: 10,
      }),
      prisma.order.findMany({
        where: { status: { in: ["PENDING", "PAID"] } },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          createdAt: true,
          user: { select: { email: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    const lowStockCount = await prisma.product.count({ where: { stock: { lt: 5 } } });
    const pendingCount = await prisma.order.count({ where: { status: "PENDING" } });

    return {
      lowStock: { count: lowStockCount, products: lowStockProducts },
      recentOrders,
      pendingCount,
    };
  },
  ["admin-notifications"],
  { tags: ["admin-notifications"], revalidate: 60 }
);
