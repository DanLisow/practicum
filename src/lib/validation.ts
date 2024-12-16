import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов").max(100, "Пароль не должен превышать 100 символов"),
});

export const registerSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов").max(100, "Пароль не должен превышать 100 символов"),
  role: z.enum(["STUDENT", "EMPLOYER"], "Роль обязательна"),
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  phone: z.string().min(11, "Телефон должен содержать минимум 11 символов"),
});
