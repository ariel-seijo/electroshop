"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth-guards";
import * as userService from "@/features/admin/services/user.service";

export async function getUsersAction(filters?: Record<string, unknown>) {
  try {
    await requireAdmin();
    const result = await userService.getAllUsers(filters);
    return { success: true as const, ...result };
  } catch (error) {
    if ((error as Error).message === "Unauthorized") {
      return { error: "No autorizado" };
    }
    console.error("[GET USERS ERROR]", error);
    return { error: (error as Error).message || "Error al obtener usuarios" };
  }
}

export async function getUserOrderHistoryAction(id: string) {
  try {
    await requireAdmin();
    const result = await userService.getUserOrderHistory(id);
    return { success: true as const, ...result };
  } catch (error) {
    if ((error as Error).message === "Unauthorized") {
      return { error: "No autorizado" };
    }
    if ((error as Error).message === "Usuario no encontrado") {
      return { error: "Usuario no encontrado" };
    }
    console.error("[GET USER ORDER HISTORY ERROR]", error);
    return { error: (error as Error).message || "Error al obtener el historial" };
  }
}

export async function deleteUserAction(id: string) {
  try {
    await requireAdmin();
    const user = await userService.softDeleteUser(id);
    revalidatePath("/admin/users");
    revalidateTag("admin-dashboard", "max");
    return { success: true as const, user };
  } catch (error) {
    if ((error as Error).message === "Unauthorized") {
      return { error: "No autorizado" };
    }
    if ((error as Error).message === "Usuario no encontrado") {
      return { error: "Usuario no encontrado" };
    }
    if ((error as Error).message === "El usuario ya fue eliminado") {
      return { error: "El usuario ya fue eliminado" };
    }
    console.error("[DELETE USER ERROR]", error);
    return { error: (error as Error).message || "Error al eliminar el usuario" };
  }
}

export async function toggleUserStatusAction(id: string) {
  try {
    await requireAdmin();
    const user = await userService.toggleUserStatus(id);
    revalidatePath("/admin/users");
    revalidateTag("admin-dashboard", "max");
    return { success: true as const, user };
  } catch (error) {
    if ((error as Error).message === "Unauthorized") {
      return { error: "No autorizado" };
    }
    if ((error as Error).message === "Usuario no encontrado") {
      return { error: "Usuario no encontrado" };
    }
    if ((error as Error).message === "No se puede modificar un usuario eliminado") {
      return { error: "No se puede modificar un usuario eliminado" };
    }
    console.error("[TOGGLE USER STATUS ERROR]", error);
    return { error: (error as Error).message || "Error al cambiar el estado del usuario" };
  }
}

export async function updateUserRoleAction(id: string, role: string) {
  try {
    await requireAdmin();
    const userData = await userService.updateUserRole(id, role);
    revalidatePath("/admin/users");
    revalidateTag("admin-dashboard", "max");
    return { success: true as const, user: userData };
  } catch (error) {
    if ((error as Error).message === "Unauthorized") {
      return { error: "No autorizado" };
    }
    if ((error as Error).message === "Usuario no encontrado") {
      return { error: "Usuario no encontrado" };
    }
    if ((error as Error).message === "Rol no válido") {
      return { error: "Rol no válido" };
    }
    if ((error as Error).message === "El usuario ya tiene este rol") {
      return { error: "El usuario ya tiene este rol" };
    }
    if ((error as Error).message === "No se puede modificar un usuario eliminado") {
      return { error: "No se puede modificar un usuario eliminado" };
    }
    console.error("[UPDATE USER ROLE ERROR]", error);
    return { error: (error as Error).message || "Error al cambiar el rol del usuario" };
  }
}
