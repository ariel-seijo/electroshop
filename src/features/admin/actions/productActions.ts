"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth-guards";
import * as productService from "@/features/products/services/product.service";
import type { CreateProductInput, UpdateProductInput } from "@/lib/validations";

interface ProductActionResult {
  success: true;
  products?: unknown[];
  total?: number;
  page?: number;
  totalPages?: number;
  product?: unknown;
  sku?: string;
}

interface ErrorResult {
  error: string;
}

type ActionResult<T extends Record<string, unknown> = Record<string, unknown>> =
  | { success: true } & T
  | { error: string };

interface ProductFilters {
  page?: string | number;
  limit?: string | number;
  search?: string;
  status?: string;
  featured?: string;
  categoryId?: string;
  sort?: string;
  order?: string;
}

export async function getProductsAction(filters?: ProductFilters) {
  try {
    await requireAdmin();
    const result = await productService.getAllProducts(filters);
    return { success: true as const, ...result };
  } catch (error) {
    if ((error as Error).message === "Unauthorized") {
      return { error: "No autorizado" };
    }
    console.error("[GET PRODUCTS ERROR]", error);
    return { error: (error as Error).message || "Error al obtener productos" };
  }
}

export async function getProductAction(id: number) {
  try {
    await requireAdmin();
    const product = await productService.getProductById(id);
    return { success: true as const, product };
  } catch (error) {
    if ((error as Error).message === "Unauthorized") {
      return { error: "No autorizado" };
    }
    if ((error as Error).message === "Product not found") {
      return { error: "Producto no encontrado" };
    }
    console.error("[GET PRODUCT ERROR]", error);
    return { error: (error as Error).message || "Error al obtener el producto" };
  }
}

export async function createProductAction(data: CreateProductInput) {
  try {
    await requireAdmin();
    const product = await productService.createProduct(data);
    revalidatePath("/admin/products");
    revalidateTag("admin-dashboard", "max");
    revalidateTag("category-products", "max");
    revalidateTag(`product-${product.slug}`, "max");
    if (product.featured) {
      revalidateTag("home-featured", "max");
    }
    return { success: true as const, product };
  } catch (error) {
    if ((error as Error).message === "Unauthorized") {
      return { error: "No autorizado" };
    }
    console.error("[CREATE PRODUCT ERROR]", error);
    return { error: (error as Error).message || "Error al crear el producto" };
  }
}

export async function updateProductAction(id: number, data: UpdateProductInput) {
  try {
    await requireAdmin();
    const product = await productService.updateProduct(id, data);
    revalidatePath("/admin/products");
    revalidateTag("admin-dashboard", "max");
    revalidateTag("category-products", "max");
    revalidateTag(`product-${product.slug}`, "max");
    if (product.featured || data.featured !== undefined) {
      revalidateTag("home-featured", "max");
    }
    return { success: true as const, product };
  } catch (error) {
    if ((error as Error).message === "Unauthorized") {
      return { error: "No autorizado" };
    }
    if ((error as Error).message === "Product not found") {
      return { error: "Producto no encontrado" };
    }
    console.error("[UPDATE PRODUCT ERROR]", error);
    return { error: (error as Error).message || "Error al actualizar el producto" };
  }
}

export async function deleteProductAction(id: number) {
  try {
    await requireAdmin();
    await productService.deleteProduct(id);
    revalidatePath("/admin/products");
    revalidateTag("admin-dashboard", "max");
    revalidateTag("category-products", "max");
    revalidateTag("home-featured", "max");
    return { success: true as const };
  } catch (error) {
    if ((error as Error).message === "Unauthorized") {
      return { error: "No autorizado" };
    }
    if ((error as Error).message === "Product not found") {
      return { error: "Producto no encontrado" };
    }
    console.error("[DELETE PRODUCT ERROR]", error);
    return { error: (error as Error).message || "Error al eliminar el producto" };
  }
}

export async function toggleProductActiveAction(id: number, active: boolean) {
  try {
    await requireAdmin();
    const product = await productService.toggleProductStatus(id, active);
    revalidatePath("/admin/products");
    revalidateTag("admin-dashboard", "max");
    revalidateTag("category-products", "max");
    revalidateTag(`product-${product.slug}`, "max");
    if (product.featured) {
      revalidateTag("home-featured", "max");
    }
    return { success: true as const, product };
  } catch (error) {
    if ((error as Error).message === "Unauthorized") {
      return { error: "No autorizado" };
    }
    if ((error as Error).message === "Product not found") {
      return { error: "Producto no encontrado" };
    }
    console.error("[TOGGLE ACTIVE ERROR]", error);
    return { error: (error as Error).message || "Error al cambiar el estado del producto" };
  }
}

export async function toggleProductFeaturedAction(id: number, featured: boolean) {
  try {
    await requireAdmin();
    const product = await productService.toggleProductFeatured(id, featured);
    revalidatePath("/admin/products");
    revalidateTag("admin-dashboard", "max");
    revalidateTag("home-featured", "max");
    revalidateTag("category-products", "max");
    revalidateTag(`product-${product.slug}`, "max");
    return { success: true as const, product };
  } catch (error) {
    if ((error as Error).message === "Unauthorized") {
      return { error: "No autorizado" };
    }
    if ((error as Error).message === "Product not found") {
      return { error: "Producto no encontrado" };
    }
    console.error("[TOGGLE FEATURED ERROR]", error);
    return { error: (error as Error).message || "Error al cambiar el destacado del producto" };
  }
}

export async function updateProductStockAction(id: number, stock: number) {
  try {
    await requireAdmin();
    const existing = await productService.getProductById(id);
    const product = await productService.updateProductStock(id, stock);
    revalidatePath("/admin/products");
    revalidateTag("admin-dashboard", "max");
    revalidateTag("category-products", "max");
    revalidateTag(`product-${existing.slug}`, "max");
    if (existing.featured) {
      revalidateTag("home-featured", "max");
    }
    return { success: true as const, product };
  } catch (error) {
    if ((error as Error).message === "Unauthorized") {
      return { error: "No autorizado" };
    }
    if ((error as Error).message === "Product not found") {
      return { error: "Producto no encontrado" };
    }
    console.error("[UPDATE STOCK ERROR]", error);
    return { error: (error as Error).message || "Error al actualizar el inventario" };
  }
}

export async function generateSkuAction(categoryId: string | number, brand: string, title: string) {
  try {
    await requireAdmin();
    const sku = await productService.generateSku(parseInt(String(categoryId)), brand, title);
    return { success: true as const, sku };
  } catch (error) {
    if ((error as Error).message === "Unauthorized") {
      return { error: "No autorizado" };
    }
    console.error("[GENERATE SKU ERROR]", error);
    return { error: (error as Error).message || "Error al generar el SKU" };
  }
}
