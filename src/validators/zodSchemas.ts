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

export const createHaliSahaSchema = z.object({
  name: z.string().min(1, "İsim boş olamaz"),
  location: z.string().min(1, "Konum boş olamaz"),
  latitude: z.number().refine(val => val >= -90 && val <= 90, "Geçerli bir enlem girin"),
  longitude: z.number().refine(val => val >= -180 && val <= 180, "Geçerli bir boylam girin"),
  phone: z.string().min(10, "Telefon numarası en az 10 karakter olmalı"),
  description: z.string().optional(),

  pricePerHour: z.number().positive("Pozitif bir saatlik ücret girin"),

  startHour: z.string().min(1, "Başlangıç saati boş olamaz"), // İsteğe bağlı olarak regex eklenebilir
  endHour: z.string().min(1, "Bitiş saati boş olamaz"),

  size: z.string().min(1),
  surface: z.string().min(1),
  maxPlayers: z.number().int().positive(),

  hasParking: z.boolean().optional().default(false),
  hasShowers: z.boolean().optional().default(false),
  hasShoeRental: z.boolean().optional().default(false),
  hasCafeteria: z.boolean().optional().default(false),
  hasNightLighting: z.boolean().optional().default(false),

  imagesUrl: z.array(z.string()).optional().default([]),
  bookedSlots: z.array(z.string()).optional().default([]),

  ownerId: z.string().uuid("Geçerli bir UUID girin")
});

export const updateHaliSahaSchema = z.object({
  name: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  latitude: z.number().refine(val => val >= -90 && val <= 90).optional(),
  longitude: z.number().refine(val => val >= -180 && val <= 180).optional(),
  phone: z.string().min(10).optional(),
  description: z.string().optional(),

  pricePerHour: z.number().positive().optional(),

  startHour: z.string().min(1).optional(),
  endHour: z.string().min(1).optional(),

  size: z.string().min(1).optional(),
  surface: z.string().min(1).optional(),
  maxPlayers: z.number().int().positive().optional(),

  hasParking: z.boolean().optional(),
  hasShowers: z.boolean().optional(),
  hasShoeRental: z.boolean().optional(),
  hasCafeteria: z.boolean().optional(),
  hasNightLighting: z.boolean().optional(),

  imagesUrl: z.array(z.string()).optional(),
  bookedSlots: z.array(z.string()).optional(),

  ownerId: z.string().uuid().optional()
});

export const createReservationSchema = z.object({
  userId: z.string().uuid({ message: "Geçerli bir kullanıcı ID'si girin." }),
  haliSahaId: z.string().uuid({ message: "Geçerli bir halı saha ID'si girin." }),
  status: z.enum(["pending", "approved", "cancelled"]).optional(),
  reservationDateTime: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Geçerli bir tarih formatı girin (ISO format önerilir)."
  }),
  isRecurring: z.boolean().optional(),
  subscriptionId: z.string().uuid().optional(),
  lastUpdatedById: z.string().uuid().optional(),
});


export const updateReservationSchema = createReservationSchema.partial();


export const createReviewSchema = z.object({
  userId: z.string().uuid({ message: "Geçerli bir kullanıcı ID'si girin." }),
  haliSahaId: z.string().uuid({ message: "Geçerli bir halı saha ID'si girin." }),
  rating: z.number().int().min(1).max(5, { message: "Puan 1 ile 5 arasında olmalı." }),
  comment: z.string().min(1, "Yorum boş olamaz."),
});

export const updateReviewSchema = createReviewSchema.partial();
