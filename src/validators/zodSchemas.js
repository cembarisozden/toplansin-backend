"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReviewSchema = exports.createReviewSchema = exports.updateReservationSchema = exports.createReservationSchema = exports.updateHaliSahaSchema = exports.createHaliSahaSchema = exports.LoginSchema = exports.RegisterSchema = void 0;
const zod_1 = require("zod");
// 🔐 Kayıt (register) şeması
exports.RegisterSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "İsim boş olamaz."),
    email: zod_1.z.string().email("Geçerli bir email giriniz."),
    password: zod_1.z.string().min(6, "Şifre en az 6 karakter olmalı."),
});
// 🔑 Giriş (login) şeması
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Geçerli bir email giriniz."),
    password: zod_1.z.string().min(1, "Şifre girilmelidir."),
});
exports.createHaliSahaSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "İsim boş olamaz"),
    location: zod_1.z.string().min(1, "Konum boş olamaz"),
    latitude: zod_1.z.number().refine(val => val >= -90 && val <= 90, "Geçerli bir enlem girin"),
    longitude: zod_1.z.number().refine(val => val >= -180 && val <= 180, "Geçerli bir boylam girin"),
    phone: zod_1.z.string().min(10, "Telefon numarası en az 10 karakter olmalı"),
    description: zod_1.z.string().min(1, "Açıklama boş olamaz"),
    pricePerHour: zod_1.z.number().positive("Pozitif bir saatlik ücret girin"),
    startHour: zod_1.z.string().min(1, "Başlangıç saati boş olamaz"), // İsteğe bağlı olarak regex eklenebilir
    endHour: zod_1.z.string().min(1, "Bitiş saati boş olamaz"),
    size: zod_1.z.string().min(1),
    surface: zod_1.z.string().min(1),
    maxPlayers: zod_1.z.number().int().positive(),
    hasParking: zod_1.z.boolean().optional().default(false),
    hasShowers: zod_1.z.boolean().optional().default(false),
    hasShoeRental: zod_1.z.boolean().optional().default(false),
    hasCafeteria: zod_1.z.boolean().optional().default(false),
    hasNightLighting: zod_1.z.boolean().optional().default(false),
    imagesUrl: zod_1.z.array(zod_1.z.string()).optional().default([]),
    bookedSlots: zod_1.z.array(zod_1.z.string()).optional().default([]),
    ownerId: zod_1.z.string().uuid("Geçerli bir UUID girin")
});
exports.updateHaliSahaSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    location: zod_1.z.string().min(1).optional(),
    latitude: zod_1.z.number().refine(val => val >= -90 && val <= 90).optional(),
    longitude: zod_1.z.number().refine(val => val >= -180 && val <= 180).optional(),
    phone: zod_1.z.string().min(10).optional(),
    description: zod_1.z.string().optional(),
    pricePerHour: zod_1.z.number().positive().optional(),
    // Yeni eklenen alanlar
    averageRating: zod_1.z.number().optional(),
    reviewCount: zod_1.z.number().int().optional(),
    startHour: zod_1.z.string().min(1).optional(),
    endHour: zod_1.z.string().min(1).optional(),
    size: zod_1.z.string().min(1).optional(),
    surface: zod_1.z.string().min(1).optional(),
    maxPlayers: zod_1.z.number().int().positive().optional(),
    hasParking: zod_1.z.boolean().optional(),
    hasShowers: zod_1.z.boolean().optional(),
    hasShoeRental: zod_1.z.boolean().optional(),
    hasCafeteria: zod_1.z.boolean().optional(),
    hasNightLighting: zod_1.z.boolean().optional(),
    imagesUrl: zod_1.z.array(zod_1.z.string()).optional(),
    bookedSlots: zod_1.z.array(zod_1.z.string()).optional(),
    ownerId: zod_1.z.string().uuid().optional()
});
exports.createReservationSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid({ message: "Geçerli bir kullanıcı ID'si girin." }),
    haliSahaId: zod_1.z.string().uuid({ message: "Geçerli bir halı saha ID'si girin." }),
    status: zod_1.z.enum(["pending", "approved", "cancelled"]).optional(),
    reservationDateTime: zod_1.z.string().refine(val => !isNaN(Date.parse(val)), {
        message: "Geçerli bir tarih formatı girin (ISO format önerilir)."
    }),
    isRecurring: zod_1.z.boolean().optional(),
    subscriptionId: zod_1.z.string().uuid().optional(),
    lastUpdatedById: zod_1.z.string().uuid().optional(),
});
exports.updateReservationSchema = exports.createReservationSchema.partial();
exports.createReviewSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid({ message: "Geçerli bir kullanıcı ID'si girin." }),
    haliSahaId: zod_1.z.string().uuid({ message: "Geçerli bir halı saha ID'si girin." }),
    rating: zod_1.z.number().int().min(1).max(5, { message: "Puan 1 ile 5 arasında olmalı." }),
    comment: zod_1.z.string().min(1, "Yorum boş olamaz."),
});
exports.updateReviewSchema = exports.createReviewSchema.partial();
