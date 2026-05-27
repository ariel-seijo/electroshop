export {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
} from "./auth.schema";
export type { LoginInput, RegisterInput, ForgotPasswordInput } from "./auth.schema";

export {
  createProductSchema,
  updateProductSchema,
} from "./product.schema";
export type { CreateProductInput, UpdateProductInput } from "./product.schema";

export { checkoutSchema } from "./order.schema";
export type { CheckoutItem, CheckoutShipping, CardDetails, CheckoutInput } from "./order.schema";

export {
  productImageSchema,
  saveProductImagesSchema,
} from "./upload.schema";
export type { ProductImage, SaveProductImagesInput } from "./upload.schema";

import { ZodError } from "zod";

export function formatZodError(error: ZodError): string {
  return error.issues.map((e) => e.message).join(". ");
}
