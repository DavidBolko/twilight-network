import z from "zod";

const passwordSchema = z.string().min(6, "Password must be at least 6 characters.").regex(/[A-Z]/, "Password must contain at least one uppercase letter.").regex(/[0-9]/, "Password must contain at least one number.");
const nameSchema = z
  .string()
  .min(3, "Name must be at least 3 characters.")
  .max(30, "Name must be at most 30 characters.")
  .regex(/^[A-Za-z0-9 _-]+$/, "Name can only contain letters, numbers, spaces, _ and -.");

const emailSchema = z.string().email("Enter a valid email address.");

export const registerSchema = z
  .object({
    username: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    password2: z.string(),
  })
  .refine((d) => d.password === d.password2, { path: ["password2"], message: "Passwords do not match." });

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const changePasswordSchema = z
  .object({
    oldPassword: z.string(),
    newPassword: passwordSchema,
    newPassword2: z.string(),
  })
  .refine((d) => d.newPassword === d.newPassword2, { path: ["newPassword2"], message: "Passwords do not match." });
