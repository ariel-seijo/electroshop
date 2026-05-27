import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { VALID_STATUSES, canTransitionOrderStatus, type OrderStatus } from "@/lib/order-state";

const VALID_SORT_FIELDS = ["createdAt", "total", "status"];

const ORDER_LIST_SELECT = {
  id: true,
  orderNumber: true,
  status: true,
  subtotal: true,
  shippingCost: true,
  total: true,
  createdAt: true,
  user: {
    select: { id: true, name: true, email: true },
  },
  _count: {
    select: { items: true },
  },
} as const;

const ORDER_DETAIL_INCLUDE = {
  items: {
    select: {
      id: true,
      quantity: true,
      unitPrice: true,
      totalPrice: true,
      productTitle: true,
      productSku: true,
      productImage: true,
      productId: true,
    },
  },
  user: {
    select: { id: true, name: true, email: true },
  },
} as const;

interface OrderFilters {
  page?: string | number;
  limit?: string | number;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: string;
  order?: string;
}

export interface DashboardMetrics {
  totalRevenue: number;
  pendingCount: number;
  totalOrders: number;
  cancelledCount: number;
  cancellationRate: number;
  averageTicket: number;
}

export async function getAllOrders(params: OrderFilters = {}) {
  const page = Math.max(1, parseInt(String(params.page)) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(String(params.limit)) || 10));
  const skip = (page - 1) * limit;

  const where: Prisma.OrderWhereInput = {};

  if (params.status && VALID_STATUSES.includes(params.status as OrderStatus)) {
    where.status = params.status as OrderStatus;
  }

  if (params.search) {
    where.OR = [
      { orderNumber: { contains: params.search, mode: "insensitive" } },
      { user: { email: { contains: params.search, mode: "insensitive" } } },
    ];
  }

  if (params.dateFrom || params.dateTo) {
    const createdAt: Prisma.DateTimeFilter = {};
    if (params.dateFrom) {
      createdAt.gte = new Date(params.dateFrom);
    }
    if (params.dateTo) {
      const endDate = new Date(params.dateTo);
      endDate.setHours(23, 59, 59, 999);
      createdAt.lte = endDate;
    }
    where.createdAt = createdAt;
  }

  const sortField: string = VALID_SORT_FIELDS.includes(params.sort || "") ? params.sort as string : "createdAt";
  const sortDir = params.order === "asc" ? "asc" : "desc";
  const orderBy: Prisma.OrderOrderByWithRelationInput = { [sortField]: sortDir };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: ORDER_LIST_SELECT,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getOrderById(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: ORDER_DETAIL_INCLUDE,
  });

  if (!order) {
    throw new Error("Pedido no encontrado");
  }

  return order;
}

export async function updateOrderStatus(id: string, newStatus: string) {
  if (!VALID_STATUSES.includes(newStatus as OrderStatus)) {
    throw new Error("Estado no válido");
  }

  const order = await prisma.$transaction(async (tx) => {
    const existing = await tx.order.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!existing) {
      throw new Error("Pedido no encontrado");
    }

    if (existing.status === newStatus) {
      throw new Error("El pedido ya tiene este estado");
    }

    if (!canTransitionOrderStatus(existing.status as OrderStatus, newStatus as OrderStatus)) {
      throw new Error(
        `Transición inválida: no se puede cambiar de ${existing.status} a ${newStatus}`
      );
    }

    if (newStatus === "CANCELLED") {
      const orderItems = await tx.orderItem.findMany({
        where: { orderId: id },
        select: { productId: true, quantity: true },
      });

      for (const item of orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
            sold: { decrement: item.quantity },
          },
        });
      }
    }

    const updated = await tx.order.update({
      where: { id },
      data: { status: newStatus as OrderStatus },
      include: ORDER_DETAIL_INCLUDE,
    });

    return updated;
  });

  return order;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [revenueAgg, pendingCount, totalOrders, cancelledCount, completedCount] = await Promise.all([
    prisma.order.aggregate({
      where: {
        OR: [
          { status: "PAID" },
          { status: "SHIPPED" },
          { status: "DELIVERED" },
        ],
      },
      _sum: { total: true },
    }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "CANCELLED" } }),
    prisma.order.count({
      where: {
        OR: [
          { status: "PAID" },
          { status: "SHIPPED" },
          { status: "DELIVERED" },
        ],
      },
    }),
  ]);

  const totalRevenue = revenueAgg._sum.total || 0;
  const cancellationRate = totalOrders > 0 ? (cancelledCount / totalOrders) * 100 : 0;
  const averageTicket = completedCount > 0 ? totalRevenue / completedCount : 0;

  return {
    totalRevenue,
    pendingCount,
    totalOrders,
    cancelledCount,
    cancellationRate: Math.round(cancellationRate * 100) / 100,
    averageTicket: Math.round(averageTicket * 100) / 100,
  };
}
