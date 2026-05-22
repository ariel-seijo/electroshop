import { z } from "zod";

const checkoutItemSchema = z.object({
  id: z.number().int().positive(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  title: z.string().min(1).max(120, "El título del producto es demasiado largo"),
  thumbnail: z.string().max(500, "La URL de la imagen es demasiado larga").optional(),
  sku: z.string().max(80, "El SKU es demasiado largo").optional(),
});

const checkoutShippingSchema = z.object({
  fullName: z.string().min(1, "El nombre es obligatorio").max(100, "El nombre es demasiado largo"),
  email: z
    .string()
    .min(1, "El email es obligatorio")
    .email("Email inválido")
    .max(255, "El email es demasiado largo"),
  address: z.string().min(1, "La dirección es obligatoria").max(150, "La dirección es demasiado larga"),
  phone: z.string().max(30, "El teléfono es demasiado largo").optional(),
  city: z.string().max(80, "La ciudad es demasiado larga").optional(),
  department: z.string().max(80, "La provincia es demasiado larga").optional(),
  zip: z.string().max(20, "El código postal es demasiado largo").optional(),
  notes: z.string().max(500, "Las notas son demasiado largas").optional(),
});

const cardDetailsSchema = z
  .object({
    cardNumber: z.string().max(19, "El número de tarjeta es demasiado largo").optional(),
    cardExpiry: z.string().max(5, "La fecha de expiración es inválida").optional(),
    cardCvc: z.string().max(4, "El CVC es inválido").optional(),
    cardHolder: z.string().max(100, "El nombre del titular es demasiado largo").optional(),
  })
  .nullable()
  .optional();

export const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, "El carrito está vacío"),
  shipping: checkoutShippingSchema,
  paymentMethod: z.string().min(1, "El método de pago es obligatorio").max(50, "El método de pago es inválido"),
  cardDetails: cardDetailsSchema,
  notes: z.string().max(500, "Las notas son demasiado largas").nullable().optional(),
});

export type CheckoutItem = z.infer<typeof checkoutItemSchema>;
export type CheckoutShipping = z.infer<typeof checkoutShippingSchema>;
export type CardDetails = z.infer<typeof cardDetailsSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
