import "server-only";

import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

function getStartOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

function getStartOfPreviousMonth(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
}

function getEndOfPreviousMonth(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59, 999));
}

const BA_TIMEZONE = "America/Argentina/Buenos_Aires";
const BA_UTC_OFFSET = 3;

function formatBuenosAiresDate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getBuenosAiresTodayMidnight(): Date {
  const now = new Date();
  const dateStr = formatBuenosAiresDate(now);
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, BA_UTC_OFFSET));
}

function getSevenDaysAgo(): Date {
  const todayMidnight = getBuenosAiresTodayMidnight();
  return new Date(todayMidnight.getTime() - 6 * 24 * 60 * 60 * 1000);
}

function generateDateRange(days = 7): string[] {
  const todayMidnight = getBuenosAiresTodayMidnight();
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(todayMidnight.getTime() - i * 24 * 60 * 60 * 1000);
    dates.push(formatBuenosAiresDate(d));
  }
  return dates;
}

export async function getCoreMetrics() {
  const [revenueAgg, totalOrders, totalUsers, lowStockCount] = await Promise.all([
    prisma.order.aggregate({
      where: {
        status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
      },
      _sum: { total: true },
    }),
    prisma.order.count(),
    prisma.user.count(),
    prisma.product.count({
      where: { stock: { lt: 5 } },
    }),
  ]);

  return {
    totalRevenue: Number(revenueAgg._sum.total || 0),
    totalOrders,
    totalUsers,
    lowStockCount,
  };
}

export async function getGrowthRate() {
  const startOfCurrentMonth = getStartOfCurrentMonth();
  const startOfPreviousMonth = getStartOfPreviousMonth();
  const endOfPreviousMonth = getEndOfPreviousMonth();

  const [
    currentRevenue,
    previousRevenue,
    currentOrders,
    previousOrders,
    currentUsers,
    previousUsers,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: {
        status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
        createdAt: { gte: startOfCurrentMonth },
      },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: {
        status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
        createdAt: { gte: startOfPreviousMonth, lte: endOfPreviousMonth },
      },
      _sum: { total: true },
    }),
    prisma.order.count({
      where: {
        status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
        createdAt: { gte: startOfCurrentMonth },
      },
    }),
    prisma.order.count({
      where: {
        status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
        createdAt: { gte: startOfPreviousMonth, lte: endOfPreviousMonth },
      },
    }),
    prisma.user.count({
      where: { createdAt: { gte: startOfCurrentMonth } },
    }),
    prisma.user.count({
      where: { createdAt: { gte: startOfPreviousMonth, lte: endOfPreviousMonth } },
    }),
  ]);

  const revenueCurrent = Number(currentRevenue._sum.total || 0);
  const revenuePrevious = Number(previousRevenue._sum.total || 0);
  const ordersCurrent = currentOrders;
  const ordersPrevious = previousOrders;
  const usersCurrent = currentUsers;
  const usersPrevious = previousUsers;

  function calculateGrowth(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Math.round(((current - previous) / previous) * 100 * 10) / 10;
  }

  return {
    revenueGrowth: calculateGrowth(revenueCurrent, revenuePrevious),
    ordersGrowth: calculateGrowth(ordersCurrent, ordersPrevious),
    usersGrowth: calculateGrowth(usersCurrent, usersPrevious),
  };
}

export async function getSalesTimeline() {
  const sevenDaysAgo = getSevenDaysAgo();
  const dateRange = generateDateRange(7);

  const orders = await prisma.order.findMany({
    where: {
      status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
      createdAt: { gte: sevenDaysAgo },
    },
    select: { total: true, createdAt: true },
  });

  const salesByDate: Record<string, number> = {};
  orders.forEach((order) => {
    const dateKey = formatBuenosAiresDate(order.createdAt);
    salesByDate[dateKey] = (salesByDate[dateKey] || 0) + Number(order.total);
  });

  const timeline = dateRange.map((date) => ({
    date,
    revenue: salesByDate[date] || 0,
  }));

  return timeline;
}

export async function getTopProducts() {
  return prisma.product.findMany({
    orderBy: { sold: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      sold: true,
      stock: true,
      price: true,
      brand: true,
    },
  });
}

export async function getLatestActivity() {
  const [latestOrders, latestUsers] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
        user: {
          select: { name: true, email: true },
        },
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    latestOrders: latestOrders.map((order) => ({
      ...order,
      total: Number(order.total),
    })),
    latestUsers,
  };
}

export async function getLowStockProducts() {
  return prisma.product.findMany({
    where: { stock: { lt: 5 } },
    orderBy: { stock: "asc" },
    take: 10,
    select: {
      id: true,
      title: true,
      stock: true,
    },
  });
}

export const getDashboardData = unstable_cache(
  async () => {
    const [core, growth, timeline, topProducts, latestActivity, lowStockProducts] =
      await Promise.all([
        getCoreMetrics(),
        getGrowthRate(),
        getSalesTimeline(),
        getTopProducts(),
        getLatestActivity(),
        getLowStockProducts(),
      ]);

    return {
      ...core,
      ...growth,
      timeline,
      topProducts,
      latestOrders: latestActivity.latestOrders,
      latestUsers: latestActivity.latestUsers,
      lowStockProducts,
    };
  },
  ["admin-dashboard"],
  { revalidate: 300, tags: ["admin-dashboard"] }
);
