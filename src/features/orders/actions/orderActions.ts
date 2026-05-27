"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth-guards";
import { getErrorMessage } from "@/lib/errors";
import type { OrderFilters } from "@/types/order";
import * as orderService from "@/features/orders/services/order.service";

export async function getOrdersAction(filters?: OrderFilters) {
  try {
    await requireAdmin();
    const result = await orderService.getAllOrders(filters);
    return { success: true as const, ...result };
  } catch (error) {
    if (getErrorMessage(error) === "Unauthorized") {
      return { error: "No autorizado" };
    }
    console.error("[GET ORDERS ERROR]", error);
    return { error: getErrorMessage(error) || "Error al obtener pedidos" };
  }
}

export async function getOrderDetailAction(id: string) {
  try {
    await requireAdmin();
    const order = await orderService.getOrderById(id);
    return { success: true as const, order };
  } catch (error) {
    if (getErrorMessage(error) === "Unauthorized") {
      return { error: "No autorizado" };
    }
    if (getErrorMessage(error) === "Pedido no encontrado") {
      return { error: "Pedido no encontrado" };
    }
    console.error("[GET ORDER DETAIL ERROR]", error);
    return { error: getErrorMessage(error) || "Error al obtener el pedido" };
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
    if (getErrorMessage(error) === "Unauthorized") {
      return { error: "No autorizado" };
    }
    if (getErrorMessage(error) === "Pedido no encontrado") {
      return { error: "Pedido no encontrado" };
    }
    console.error("[UPDATE ORDER STATUS ERROR]", error);
    return { error: getErrorMessage(error) || "Error al actualizar el estado del pedido" };
  }
}

export async function getDashboardMetricsAction() {
  try {
    await requireAdmin();
    const metrics = await orderService.getDashboardMetrics();
    return { success: true as const, ...metrics };
  } catch (error) {
    if (getErrorMessage(error) === "Unauthorized") {
      return { error: "No autorizado" };
    }
    console.error("[GET DASHBOARD METRICS ERROR]", error);
    return { error: getErrorMessage(error) || "Error al obtener métricas" };
  }
}
