import { z } from "zod";

export const createProductSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(120, "El título es demasiado largo"),
  slug: z.string().min(1, "El slug es obligatorio").max(140, "El slug es demasiado largo"),
  description: z.string().max(3000, "La descripción es demasiado larga").optional().default(""),
  price: z.coerce.number().positive("El precio debe ser mayor a 0"),
  oldPrice: z.preprocess(
    (v) => (v === null ? null : v === undefined ? undefined : Number(v)),
    z.number().nullable().optional()
  ),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo"),
  brand: z.string().max(80, "La marca es demasiado larga").optional().default("Generic"),
  categoryId: z.coerce.number().int().positive("La categoría es obligatoria"),
  thumbnail: z.string().min(1, "La imagen principal es obligatoria").max(500, "La URL de la imagen es demasiado larga"),
  images: z.array(z.string()).optional().default([]),
  rating: z.coerce.number().min(0).max(5).optional().default(0),
  sold: z.coerce.number().int().min(0).optional().default(0),
  featured: z.coerce.boolean().optional().default(false),
  active: z.coerce.boolean().optional().default(true),
  sku: z.string().max(80, "El SKU es demasiado largo").optional(),
});

export const updateProductSchema = z.object({
  title: z.string().min(1).max(120, "El título es demasiado largo").optional(),
  slug: z.string().min(1).max(140, "El slug es demasiado largo").optional(),
  description: z.string().max(3000, "La descripción es demasiado larga").optional(),
  price: z.coerce.number().positive("El precio debe ser mayor a 0").optional(),
  oldPrice: z.preprocess(
    (v) => (v === null ? null : v === undefined ? undefined : Number(v)),
    z.number().nullable().optional()
  ),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo").optional(),
  brand: z.string().max(80, "La marca es demasiado larga").optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  thumbnail: z.string().max(500, "La URL de la imagen es demasiado larga").optional(),
  images: z.array(z.string()).optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  sold: z.coerce.number().int().min(0).optional(),
  featured: z.coerce.boolean().optional(),
  active: z.coerce.boolean().optional(),
  sku: z.string().max(80, "El SKU es demasiado largo").optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
