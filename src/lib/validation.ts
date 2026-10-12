import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email("Ingresá un email válido.");

export const passwordSchema = z
  .string()
  .min(10, "Usá al menos 10 caracteres.")
  .regex(/[a-z]/, "Incluí una letra minúscula.")
  .regex(/[A-Z]/, "Incluí una letra mayúscula.")
  .regex(/[0-9]/, "Incluí un número.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Ingresá tu contraseña."),
});

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Ingresá tu nombre completo.").max(100),
  email: emailSchema,
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmation: z.string(),
  })
  .refine((value) => value.password === value.confirmation, {
    path: ["confirmation"],
    message: "Las contraseñas no coinciden.",
  });

export const onboardingSchema = z.object({
  organizationName: z.string().trim().min(2).max(120),
  organizationSlug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(48)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usá letras minúsculas, números y guiones."),
  warehouseName: z.string().trim().min(2).max(120),
  warehouseCode: z
    .string()
    .trim()
    .toUpperCase()
    .min(2)
    .max(20)
    .regex(/^[A-Z0-9_-]+$/, "Usá letras, números, guiones o guion bajo."),
  requestId: z.string().uuid(),
});

export const scanCodeSchema = z.object({
  code: z.string().trim().min(1, "Ingresá o escaneá un código.").max(256),
});

export type FormState = {
  status: "idle" | "error" | "success";
  message: string;
  fields: Record<string, string[]>;
};

export const initialFormState: FormState = { status: "idle", message: "", fields: {} };

export function zodErrors(error: z.ZodError): FormState {
  const flattened = z.flattenError(error);
  return {
    status: "error",
    message: "Revisá los campos marcados.",
    fields: flattened.fieldErrors as Record<string, string[]>,
  };
}
