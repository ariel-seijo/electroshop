import { z } from "zod";

export const productImageSchema = z.object({
  url: z.string().url("URL de imagen inválida").max(500, "La URL de la imagen es demasiado larga"),
  publicId: z.string().min(1, "El publicId es obligatorio").max(200, "El publicId es demasiado largo"),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  format: z.string().min(1).max(10, "El formato es demasiado largo"),
});

export const saveProductImagesSchema = z.object({
  productId: z.number().int().positive("El ID del producto es obligatorio"),
  images: z
    .array(productImageSchema)
    .min(1, "Debe incluir al menos una imagen")
    .max(10, "Máximo 10 imágenes por producto"),
});

export type ProductImage = z.infer<typeof productImageSchema>;
export type SaveProductImagesInput = z.infer<typeof saveProductImagesSchema>;
