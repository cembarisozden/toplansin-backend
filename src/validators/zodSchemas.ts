import { z } from "zod";

// 🔐 Kayıt (register) şeması
export const RegisterSchema = z.object({
  name: z.string().min(1, "İsim boş olamaz."),
  email: z.string().email("Geçerli bir email giriniz."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı."),
});

// 🔑 Giriş (login) şeması
export const LoginSchema = z.object({
  email: z.string().email("Geçerli bir email giriniz."),
  password: z.string().min(1, "Şifre girilmelidir."),
});
