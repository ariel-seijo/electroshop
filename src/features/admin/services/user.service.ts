import "server-only";

import { prisma } from "@/lib/prisma";

const VALID_ROLES = ["CUSTOMER", "ADMIN"];
const VALID_STATUSES = ["ACTIVE", "BANNED"];
import { type OrderStatus } from "@prisma/client";

const SUCCESSFUL_ORDER_STATUSES: OrderStatus[] = ["PAID", "SHIPPED", "DELIVERED"] as OrderStatus[];

const USER_LIST_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
  deletedAt: true,
  _count: {
    select: { orders: true },
  },
} as const;

const ORDER_HISTORY_SELECT = {
  id: true,
  orderNumber: true,
  status: true,
  subtotal: true,
  shippingCost: true,
  total: true,
  createdAt: true,
  _count: {
    select: { items: true },
  },
} as const;

interface UserFilters {
  page?: string | number;
  limit?: string | number;
  search?: string;
  role?: string;
  status?: string;
  sort?: string;
  order?: string;
}

export async function getAllUsers(params: UserFilters = {}) {
  const page = Math.max(1, parseInt(String(params.page)) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(String(params.limit)) || 10));
  const skip = (page - 1) * limit;
  const sortDir = params.order === "asc" ? "asc" : "desc";

  const where: Record<string, unknown> = {};

  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { email: { contains: params.search, mode: "insensitive" } },
    ];
  }

  if (params.role && VALID_ROLES.includes(params.role)) {
    where.role = params.role;
  }

  if (params.status) {
    if (params.status === "DELETED") {
      where.deletedAt = { not: null };
    } else if (VALID_STATUSES.includes(params.status)) {
      where.deletedAt = null;
      where.status = params.status;
    }
  } else {
    where.__softDeleteBypass = true;
  }

  const orderBy: Record<string, unknown> = {};
  if (params.sort === "name") {
    orderBy.name = sortDir;
  } else if (params.sort === "email") {
    orderBy.email = sortDir;
  } else if (params.sort === "orders") {
    orderBy.orders = { _count: sortDir };
  } else {
    orderBy.createdAt = sortDir;
  }

  const isLtvSort = params.sort === "lifetimeValue";

  if (isLtvSort) {
    const [allUsers, total, ltvRows] = await Promise.all([
      prisma.user.findMany({
        where,
        select: USER_LIST_SELECT,
      }),
      prisma.user.count({ where }),
      prisma.order.groupBy({
        by: ["userId"],
        where: { status: { in: SUCCESSFUL_ORDER_STATUSES } },
        _sum: { total: true },
      }),
    ]);

    const ltvMap = new Map(
      ltvRows.map((row) => [row.userId, (row._sum?.total || 0)])
    );

    const enriched = allUsers
      .map((user) => ({
        ...user,
        lifetimeValue: ltvMap.get(user.id) || 0,
      }))
      .sort((a, b) =>
        sortDir === "asc"
          ? a.lifetimeValue - b.lifetimeValue
          : b.lifetimeValue - a.lifetimeValue
      );

    return {
      users: enriched.slice(skip, skip + limit),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  const [users, total, ltvRows] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: USER_LIST_SELECT,
    }),
    prisma.user.count({ where }),
    prisma.order.groupBy({
      by: ["userId"],
      where: { status: { in: SUCCESSFUL_ORDER_STATUSES } },
      _sum: { total: true },
    }),
  ]);

  const ltvMap = new Map(
    ltvRows.map((row) => [row.userId, (row._sum.total || 0)])
  );

  const enrichedUsers = users.map((user) => ({
    ...user,
    lifetimeValue: ltvMap.get(user.id) || 0,
  }));

  return {
    users: enrichedUsers,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getUserOrderHistory(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  const orders = await prisma.order.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
    select: ORDER_HISTORY_SELECT,
  });

  return { user, orders };
}

export async function softDeleteUser(id: string) {
  const existing = await prisma.user.findUnique({
    where: { id },
    select: { id: true, deletedAt: true },
  });

  if (!existing) {
    throw new Error("Usuario no encontrado");
  }

  if (existing.deletedAt) {
    throw new Error("El usuario ya fue eliminado");
  }

  const now = new Date();
  const anonymousTag = `deleted_${now.getTime()}_${id.slice(-8)}`;

  const user = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id },
      data: {
        name: "Usuario eliminado",
        email: `${anonymousTag}@deleted.local`,
        password: "DELETED",
        status: "BANNED",
        deletedAt: now,
        anonymizedAt: now,
        resetToken: null,
        resetTokenExpires: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        deletedAt: true,
      },
    });

    return updated;
  });

  return user;
}

export async function toggleUserStatus(id: string) {
  const existing = await prisma.user.findUnique({
    where: { id },
    select: { id: true, status: true, deletedAt: true },
  });

  if (!existing) {
    throw new Error("Usuario no encontrado");
  }

  if (existing.deletedAt) {
    throw new Error("No se puede modificar un usuario eliminado");
  }

  const newStatus = existing.status === "ACTIVE" ? "BANNED" : "ACTIVE";

  const user = await prisma.user.update({
    where: { id },
    data: { status: newStatus },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  });

  return user;
}

export async function updateUserRole(id: string, newRole: string) {
  if (!VALID_ROLES.includes(newRole)) {
    throw new Error("Rol no válido");
  }

  const existing = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true, deletedAt: true },
  });

  if (!existing) {
    throw new Error("Usuario no encontrado");
  }

  if (existing.deletedAt) {
    throw new Error("No se puede modificar un usuario eliminado");
  }

  if (existing.role === newRole) {
    throw new Error("El usuario ya tiene este rol");
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role: newRole as "CUSTOMER" | "ADMIN" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  });

  return user;
}
