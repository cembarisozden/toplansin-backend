"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReservation = exports.updateReservation = exports.getReservationById = exports.getAllReservations = exports.createReservation = void 0;
const httpStatusCode_1 = require("../core/enums/httpStatusCode");
const apiResponse_1 = require("../core/response/apiResponse");
const zodSchemas_1 = require("../validators/zodSchemas");
const prisma_1 = require("../lib/prisma");
const logger_1 = __importDefault(require("../core/logger/logger")); // ← ekledik
const createReservation = async (req, res) => {
    logger_1.default.info("createReservation çağrıldı by user %s", req.user?.id);
    const result = zodSchemas_1.createReservationSchema.safeParse(req.body);
    if (!result.success) {
        logger_1.default.warn("createReservation: Geçersiz veri – %s", result.error.errors[0].message);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.BAD_REQUEST, {
            success: false,
            message: "Geçersiz rezervasyon verisi.",
            error: result.error.errors[0].message,
        });
        return;
    }
    const data = result.data;
    try {
        const reservation = await prisma_1.prisma.reservation.create({ data });
        // Her durumda ekle
        await updateBookedSlots(reservation.haliSahaId, reservation.reservationDateTime, "add");
        logger_1.default.info("createReservation başarılı – id: %s", reservation.id);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.CREATED, {
            message: "Rezervasyon başarıyla oluşturuldu.",
            data: reservation,
        });
        return;
    }
    catch (error) {
        logger_1.default.error("createReservation hatası: %o", error);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR, {
            success: false,
            message: "Rezervasyon oluşturulamadı.",
        });
        return;
    }
};
exports.createReservation = createReservation;
const getAllReservations = async (req, res) => {
    logger_1.default.info("getAllReservations çağrıldı by user %s (role: %s)", req.user?.id, req.user?.role);
    const userId = req.user?.id;
    const role = req.user?.role;
    try {
        let reservations;
        if (role === "USER") {
            reservations = await prisma_1.prisma.reservation.findMany({
                where: { userId },
                include: { haliSaha: true },
                orderBy: { createdAt: "desc" },
            });
        }
        else if (role === "OWNER") {
            reservations = await prisma_1.prisma.reservation.findMany({
                where: { haliSaha: { ownerId: userId } },
                include: { haliSaha: true },
                orderBy: { createdAt: "desc" },
            });
        }
        else if (role === "ADMIN") {
            reservations = await prisma_1.prisma.reservation.findMany({
                include: { haliSaha: true },
                orderBy: { createdAt: "desc" },
            });
        }
        else {
            logger_1.default.warn("getAllReservations: yetkisiz erişim attempt by %s", userId);
            (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.FORBIDDEN, {
                success: false,
                message: "Rezervasyonları görüntüleme yetkiniz yok.",
            });
            return;
        }
        logger_1.default.info("getAllReservations başarılı – count: %d", reservations.length);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.OK, { data: reservations });
        return;
    }
    catch (error) {
        logger_1.default.error("getAllReservations hatası: %o", error);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR, {
            success: false,
            message: "Rezervasyonlara erişilemedi.",
        });
        return;
    }
};
exports.getAllReservations = getAllReservations;
const getReservationById = async (req, res) => {
    const { id } = req.params;
    logger_1.default.info("getReservationById çağrıldı – id: %s by user %s", id, req.user?.id);
    const userId = req.user?.id;
    const userRole = req.user?.role;
    try {
        const reservation = await prisma_1.prisma.reservation.findUnique({
            where: { id },
            include: { haliSaha: { select: { ownerId: true } } },
        });
        if (!reservation) {
            logger_1.default.warn("getReservationById: bulunamadı – id: %s", id);
            (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.NOT_FOUND, {
                success: false,
                message: "Rezervasyon bulunamadı.",
            });
            return;
        }
        const isUser = userRole === "USER" && reservation.userId === userId;
        const isOwner = userRole === "OWNER" && reservation.haliSaha.ownerId === userId;
        if (!isUser && !isOwner && userRole !== "ADMIN") {
            logger_1.default.warn("getReservationById: yetkisiz erişim by %s on %s", userId, id);
            (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.FORBIDDEN, {
                success: false,
                message: "Bu rezervasyona erişim yetkiniz yok.",
            });
            return;
        }
        logger_1.default.info("getReservationById başarılı – id: %s", id);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.OK, { data: reservation });
        return;
    }
    catch (error) {
        logger_1.default.error("getReservationById hatası: %o", error);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR, {
            success: false,
            message: "Rezervasyona erişilemedi.",
        });
        return;
    }
};
exports.getReservationById = getReservationById;
const updateReservation = async (req, res) => {
    const { id } = req.params;
    logger_1.default.info("updateReservation çağrıldı – id: %s by user %s", id, req.user?.id);
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const result = zodSchemas_1.updateReservationSchema.safeParse(req.body);
    if (!result.success) {
        logger_1.default.warn("updateReservation: Geçersiz veri – %s", result.error.errors[0].message);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.BAD_REQUEST, {
            success: false,
            message: "Geçersiz güncelleme verisi.",
            error: result.error.errors[0].message,
        });
        return;
    }
    const updates = result.data;
    try {
        const existing = await prisma_1.prisma.reservation.findUnique({
            where: { id },
            include: { haliSaha: { select: { ownerId: true } } },
        });
        if (!existing) {
            logger_1.default.warn("updateReservation: bulunamadı – id: %s", id);
            (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.NOT_FOUND, {
                success: false,
                message: "Rezervasyon bulunamadı.",
            });
            return;
        }
        const isUser = userRole === "USER" && existing.userId === userId;
        const isOwner = userRole === "OWNER" && existing.haliSaha.ownerId === userId;
        if (!isUser && !isOwner && userRole !== "ADMIN") {
            logger_1.default.warn("updateReservation: yetkisiz erişim by %s on %s", userId, id);
            (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.FORBIDDEN, {
                success: false,
                message: "Bu rezervasyonu güncellemeye yetkiniz yok.",
            });
            return;
        }
        const updated = await prisma_1.prisma.reservation.update({
            where: { id },
            data: updates,
        });
        if (updated.status === "cancelled") {
            await updateBookedSlots(updated.haliSahaId, updated.reservationDateTime, "remove");
        }
        logger_1.default.info("updateReservation başarılı – id: %s", id);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.OK, {
            message: "Rezervasyon güncellendi.",
            data: updated,
        });
        return;
    }
    catch (error) {
        logger_1.default.error("updateReservation hatası: %o", error);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR, {
            success: false,
            message: "Rezervasyon güncellenemedi.",
        });
        return;
    }
};
exports.updateReservation = updateReservation;
const deleteReservation = async (req, res) => {
    const { id } = req.params;
    logger_1.default.info("deleteReservation çağrıldı – id: %s by user %s", id, req.user?.id);
    try {
        await prisma_1.prisma.reservation.delete({ where: { id } });
        logger_1.default.info("deleteReservation başarılı – id: %s", id);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.OK, { message: "Rezervasyon silindi." });
        return;
    }
    catch (error) {
        logger_1.default.error("deleteReservation hatası: %o", error);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR, {
            success: false,
            message: "Rezervasyon silinemedi.",
        });
        return;
    }
};
exports.deleteReservation = deleteReservation;
async function updateBookedSlots(haliSahaId, slotTime, action) {
    logger_1.default.info("updateBookedSlots çağrıldı – action: %s, slot: %s, haliSahaId: %s", action, slotTime.toISOString(), haliSahaId);
    const haliSaha = await prisma_1.prisma.haliSaha.findUnique({
        where: { id: haliSahaId },
        select: { bookedSlots: true },
    });
    if (!haliSaha) {
        logger_1.default.warn("updateBookedSlots: haliSaha bulunamadı – id: %s", haliSahaId);
        return;
    }
    const updatedSlots = action === "add"
        ? Array.from(new Set([
            ...haliSaha.bookedSlots.map((d) => d.toISOString()),
            slotTime.toISOString(),
        ])).map((str) => new Date(str))
        : haliSaha.bookedSlots.filter((slot) => slot.toISOString() !== slotTime.toISOString());
    await prisma_1.prisma.haliSaha.update({
        where: { id: haliSahaId },
        data: { bookedSlots: updatedSlots },
    });
    logger_1.default.info("updateBookedSlots başarılı – yeni bookedSlots count: %d", updatedSlots.length);
}
//# sourceMappingURL=reservationController.js.map