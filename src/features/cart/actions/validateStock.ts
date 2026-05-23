import { prisma } from "@/lib/prisma";

interface StockValidationResult {
  valid: boolean;
  maxAvailable: number;
  error?: string;
}

export async function validateStock(productId: number, requestedQuantity: number): Promise<StockValidationResult> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, stock: true, active: true },
  });

  if (!product) {
    return { valid: false, maxAvailable: 0, error: "Product not found" };
  }

  if (!product.active) {
    return {
      valid: false,
      maxAvailable: 0,
      error: "Product is no longer available",
    };
  }

  if (requestedQuantity > product.stock) {
    return {
      valid: false,
      maxAvailable: product.stock,
      error: `Only ${product.stock} units available`,
    };
  }

  return { valid: true, maxAvailable: product.stock };
}
