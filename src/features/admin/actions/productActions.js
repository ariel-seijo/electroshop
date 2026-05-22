"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth-guards";
import * as productService from "@/features/products/services/product.service";

/**
 * Fetches a paginated, filtered, and sorted product list for the admin panel.
 *
 * @param {object} [filters]
 * @returns {{ success: true, products: Array, total: number, page: number, totalPages: number } | { error: string }}
 */
export async function getProductsAction(filters) {
  try {
    await requireAdmin();
    const result = await productService.getAllProducts(filters);
    return { success: true, ...result };
  } catch (error) {
    if (error.message === "Unauthorized") {
      return { error: "No autorizado" };
    }
    console.error("[GET PRODUCTS ERROR]", error);
    return { error: error.message || "Error al obtener productos" };
  }
}

/**
 * Fetches a single product by ID for the admin panel.
 *
 * @param {number} id
 * @returns {{ success: true, product: object } | { error: string }}
 */
export async function getProductAction(id) {
  try {
    await requireAdmin();
    const product = await productService.getProductById(id);
    return { success: true, product };
  } catch (error) {
    if (error.message === "Unauthorized") {
      return { error: "No autorizado" };
    }
    if (error.message === "Product not found") {
      return { error: "Producto no encontrado" };
    }
    console.error("[GET PRODUCT ERROR]", error);
    return { error: error.message || "Error al obtener el producto" };
  }
}

/**
 * Creates a new product. Automatically generates an SKU if none is provided.
 *
 * @param {object} data
 * @returns {{ success: true, product: object } | { error: string }}
 */
export async function createProductAction(data) {
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
    return { success: true, product };
  } catch (error) {
    if (error.message === "Unauthorized") {
      return { error: "No autorizado" };
    }
    console.error("[CREATE PRODUCT ERROR]", error);
    return { error: error.message || "Error al crear el producto" };
  }
}

/**
 * Updates an existing product. Only the provided fields are modified.
 *
 * @param {number} id
 * @param {object} data
 * @returns {{ success: true, product: object } | { error: string }}
 */
export async function updateProductAction(id, data) {
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
    return { success: true, product };
  } catch (error) {
    if (error.message === "Unauthorized") {
      return { error: "No autorizado" };
    }
    if (error.message === "Product not found") {
      return { error: "Producto no encontrado" };
    }
    console.error("[UPDATE PRODUCT ERROR]", error);
    return { error: error.message || "Error al actualizar el producto" };
  }
}

/**
 * Hard-deletes a product and attempts to clean up associated Cloudinary assets.
 *
 * @param {number} id
 * @returns {{ success: true } | { error: string }}
 */
export async function deleteProductAction(id) {
  try {
    await requireAdmin();
    const product = await productService.deleteProduct(id);
    revalidatePath("/admin/products");
    revalidateTag("admin-dashboard", "max");
    revalidateTag("category-products", "max");
    revalidateTag(`product-${product.slug}`, "max");
    if (product.featured) {
      revalidateTag("home-featured", "max");
    }
    return { success: true };
  } catch (error) {
    if (error.message === "Unauthorized") {
      return { error: "No autorizado" };
    }
    if (error.message === "Product not found") {
      return { error: "Producto no encontrado" };
    }
    console.error("[DELETE PRODUCT ERROR]", error);
    return { error: error.message || "Error al eliminar el producto" };
  }
}

/**
 * Toggles the active status of a product (enable/disable for storefront).
 *
 * @param {number} id
 * @param {boolean} active
 * @returns {{ success: true, product: object } | { error: string }}
 */
export async function toggleProductActiveAction(id, active) {
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
    return { success: true, product };
  } catch (error) {
    if (error.message === "Unauthorized") {
      return { error: "No autorizado" };
    }
    if (error.message === "Product not found") {
      return { error: "Producto no encontrado" };
    }
    console.error("[TOGGLE ACTIVE ERROR]", error);
    return { error: error.message || "Error al cambiar el estado del producto" };
  }
}

/**
 * Toggles the featured flag of a product.
 *
 * @param {number} id
 * @param {boolean} featured
 * @returns {{ success: true, product: object } | { error: string }}
 */
export async function toggleProductFeaturedAction(id, featured) {
  try {
    await requireAdmin();
    const product = await productService.toggleProductFeatured(id, featured);
    revalidatePath("/admin/products");
    revalidateTag("admin-dashboard", "max");
    revalidateTag("home-featured", "max");
    revalidateTag("category-products", "max");
    revalidateTag(`product-${product.slug}`, "max");
    return { success: true, product };
  } catch (error) {
    if (error.message === "Unauthorized") {
      return { error: "No autorizado" };
    }
    if (error.message === "Product not found") {
      return { error: "Producto no encontrado" };
    }
    console.error("[TOGGLE FEATURED ERROR]", error);
    return { error: error.message || "Error al cambiar el destacado del producto" };
  }
}

/**
 * Atomically updates only the stock field of a product.
 * Used for inline stock editing in the product table.
 *
 * @param {number} id
 * @param {number} stock
 * @returns {{ success: true, product: object } | { error: string }}
 */
export async function updateProductStockAction(id, stock) {
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
    return { success: true, product };
  } catch (error) {
    if (error.message === "Unauthorized") {
      return { error: "No autorizado" };
    }
    if (error.message === "Product not found") {
      return { error: "Producto no encontrado" };
    }
    console.error("[UPDATE STOCK ERROR]", error);
    return { error: error.message || "Error al actualizar el inventario" };
  }
}

/**
 * Generates a preview SKU for the admin form's "Generate SKU" button.
 * This SKU is a preview — the final atomic SKU is generated during createProduct.
 *
 * @param {number|string} categoryId
 * @param {string} brand
 * @param {string} title
 * @returns {{ success: true, sku: string } | { error: string }}
 */
export async function generateSkuAction(categoryId, brand, title) {
  try {
    await requireAdmin();
    const sku = await productService.generateSku(parseInt(categoryId), brand, title);
    return { success: true, sku };
  } catch (error) {
    if (error.message === "Unauthorized") {
      return { error: "No autorizado" };
    }
    console.error("[GENERATE SKU ERROR]", error);
    return { error: error.message || "Error al generar el SKU" };
  }
}
