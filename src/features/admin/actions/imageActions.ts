"use server";

import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";
import { getErrorMessage } from "@/lib/errors";
import {
  generateSignature,
  generateBlurDataURL,
  deleteAsset,
} from "@/lib/cloudinary";
import { saveProductImagesSchema, formatZodError } from "@/lib/validations";

export async function getCloudinarySignatureAction(paramsToSign?: Record<string, string | number>): Promise<{ timestamp: number; signature: string; cloudName: string; apiKey: string } | { error: string }> {
  try {
    await requireAdmin();

    const params = paramsToSign || {};
    const { timestamp, signature, cloudName, apiKey } = generateSignature(params);

    return { timestamp, signature, cloudName, apiKey };
  } catch (error) {
    if (getErrorMessage(error) === "Unauthorized") {
      return { error: "No autorizado" };
    }
    console.error("[SIGNATURE ERROR]", error);
    return { error: "Error al generar la firma de subida" };
  }
}

interface CloudinaryImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

export async function saveProductImagesAction(productId: number, images: CloudinaryImage[]) {
  try {
    await requireAdmin();

    if (!productId || !images || !images.length) {
      return { error: "Faltan datos: productId e images son requeridos" };
    }

    if (images.length > 10) {
      return { error: "Máximo 10 imágenes por producto" };
    }

    const parsed = saveProductImagesSchema.safeParse({ productId, images });
    if (!parsed.success) {
      return { error: formatZodError(parsed.error) };
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, slug: true, featured: true },
    });

    if (!product) {
      return { error: "Producto no encontrado" };
    }

    const existingCount = await prisma.productImage.count({
      where: { productId },
    });

    const imagesWithBlur = await Promise.all(
      images.map(async (img, i) => {
        let blurDataURL = "";

        try {
          blurDataURL = await generateBlurDataURL(img.url);
        } catch (blurError) {
          console.error("[BLUR ERROR]", blurError);
        }

        return {
          url: img.url,
          publicId: img.publicId,
          width: img.width,
          height: img.height,
          format: img.format,
          blurDataURL,
          sortOrder: existingCount + i,
          productId,
        };
      })
    );

    const imageRecords = await prisma.$transaction(
      imagesWithBlur.map((data) =>
        prisma.productImage.create({ data })
      )
    );

    revalidateTag(`product-${product.slug}`, "max");
    if (product.featured) {
      revalidateTag("home-featured", "max");
    }

    return { images: imageRecords };
  } catch (error) {
    if (getErrorMessage(error) === "Unauthorized") {
      return { error: "No autorizado" };
    }
    console.error("[SAVE IMAGES ERROR]", error);
    return { error: "Error al guardar las imágenes en la base de datos" };
  }
}

export async function deleteProductImageAction(imageId: string) {
  try {
    await requireAdmin();

    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
      select: { id: true, publicId: true, productId: true },
    });

    if (!image) {
      return { error: "Imagen no encontrada" };
    }

    try {
      const result = await deleteAsset(image.publicId);

      if (result.result !== "ok" && result.result !== "not found") {
        console.error("[CLOUDINARY DELETE]", result);
        return { error: "Error al eliminar la imagen de Cloudinary" };
      }
    } catch (cloudinaryError) {
      console.error("[CLOUDINARY DELETE ERROR]", cloudinaryError);
      return { error: "Error al eliminar la imagen de Cloudinary" };
    }

    await prisma.productImage.delete({
      where: { id: imageId },
    });

    const product = await prisma.product.findUnique({
      where: { id: image.productId },
      select: { slug: true, featured: true },
    });
    if (product) {
      revalidateTag(`product-${product.slug}`, "max");
      if (product.featured) {
        revalidateTag("home-featured", "max");
      }
    }

    return { success: true as const };
  } catch (error) {
    if (getErrorMessage(error) === "Unauthorized") {
      return { error: "No autorizado" };
    }
    console.error("[DELETE IMAGE ERROR]", error);
    return { error: "Error al eliminar la imagen" };
  }
}

export async function reorderProductImagesAction(productId: number, imageIds: string[]) {
  try {
    await requireAdmin();

    if (!productId || !imageIds || !imageIds.length) {
      return { error: "Faltan datos" };
    }

    await prisma.$transaction(
      imageIds.map((imageId, index) =>
        prisma.productImage.update({
          where: { id: imageId, productId },
          data: { sortOrder: index },
        })
      )
    );

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { slug: true, featured: true },
    });
    if (product) {
      revalidateTag(`product-${product.slug}`, "max");
      if (product.featured) {
        revalidateTag("home-featured", "max");
      }
    }

    return { success: true as const };
  } catch (error) {
    if (getErrorMessage(error) === "Unauthorized") {
      return { error: "No autorizado" };
    }
    console.error("[REORDER IMAGES ERROR]", error);
    return { error: "Error al reordenar las imágenes" };
  }
}
