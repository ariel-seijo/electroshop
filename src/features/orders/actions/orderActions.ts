"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth-guards";
import * as orderService from "@/features/orders/services/order.service";

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

export async function getOrdersAction(filters?: OrderFilters) {
  try {
    await requireAdmin();
    const result = await orderService.getAllOrders(filters);
    return { success: true as const, ...result };
  } catch (error) {
    if ((error as Error).message === "Unauthorized") {
      return { error: "No autorizado" };
    }
    console.error("[GET ORDERS ERROR]", error);
    return { error: (error as Error).message || "Error al obtener pedidos" };
  }
}

export async function getOrderDetailAction(id: string) {
  try {
    await requireAdmin();
    const order = await orderService.getOrderById(id);
    return { success: true as const, order };
  } catch (error) {
    if ((error as Error).message === "Unauthorized") {
      return { error: "No autorizado" };
    }
    if ((error as Error).message === "Pedido no encontrado") {
      return { error: "Pedido no encontrado" };
    }
    console.error("[GET ORDER DETAIL ERROR]", error);
    return { error: (error as Error).message || "Error al obtener el pedido" };
  }
}

export async function updateOrderStatusAction(id: string, status: string) {
  try {
    await requireAdmin();
    const order = await orderService.updateOrderStatus(id, status);
    revalidatePath("/admin/orders");
    revalidateTag("admin-dashboard", "max");
    return { success: true as const, order };
  } catch (error) {
    if ((error as Error).message === "Unauthorized") {
      return { error: "No autorizado" };
    }
    if ((error as Error).message === "Pedido no encontrado") {
      return { error: "Pedido no encontrado" };
    }
    console.error("[UPDATE ORDER STATUS ERROR]", error);
    return { error: (error as Error).message || "Error al actualizar el estado del pedido" };
  }
}

export async function getDashboardMetricsAction() {
  try {
    await requireAdmin();
    const metrics = await orderService.getDashboardMetrics();
    return { success: true as const, ...metrics };
  } catch (error) {
    if ((error as Error).message === "Unauthorized") {
      return { error: "No autorizado" };
    }
    console.error("[GET DASHBOARD METRICS ERROR]", error);
    return { error: (error as Error).message || "Error al obtener métricas" };
  }
}
