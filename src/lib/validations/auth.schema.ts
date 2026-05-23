import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El email es obligatorio")
    .email("Formato de email inválido")
    .max(255, "El email es demasiado largo")
    .transform((e) => e.trim().toLowerCase()),
  password: z
    .string()
    .min(1, "La contraseña es obligatoria")
    .max(100, "La contraseña es demasiado larga"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .max(50, "El nombre es demasiado largo")
      .optional(),
    email: z
      .string()
      .min(1, "El email es obligatorio")
      .email("Formato de email inválido")
      .max(255, "El email es demasiado largo")
      .transform((e) => e.trim().toLowerCase()),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres")
      .max(100, "La contraseña es demasiado larga"),
    confirmPassword: z
      .string()
      .min(1, "La confirmación es obligatoria")
      .max(100, "La confirmación es demasiado larga"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "El email es obligatorio")
    .email("Formato de email inválido")
    .max(255, "El email es demasiado largo")
    .transform((e) => e.trim().toLowerCase()),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
