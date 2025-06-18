"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.updateReview = exports.getReviewById = exports.getAllReviews = exports.createReview = void 0;
const prisma_1 = require("../lib/prisma");
const httpStatusCode_1 = require("../core/enums/httpStatusCode");
const apiResponse_1 = require("../core/response/apiResponse");
const zodSchemas_1 = require("../validators/zodSchemas");
const logger_1 = __importDefault(require("../core/logger/logger")); // ← logger eklendi
/**
 * Bir halı sahanın ortalama puanını ve toplam yorum sayısını hesaplayıp
 * veritabanında güncelleyen yardımcı fonksiyon.
 */
const updateHaliSahaStats = (haliSahaId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = yield prisma_1.prisma.review.aggregate({
            where: { haliSahaId },
            _count: { _all: true },
            _avg: { rating: true },
        });
        const reviewCount = stats._count._all || 0;
        const newRating = stats._avg.rating
            ? parseFloat(stats._avg.rating.toFixed(1))
            : 0;
        yield prisma_1.prisma.haliSaha.update({
            where: { id: haliSahaId },
            data: {
                reviewCount,
                rating: newRating,
            },
        });
        logger_1.default.info("updateHaliSahaStats başarılı – haliSahaId: %s, count: %d, rating: %f", haliSahaId, reviewCount, newRating);
    }
    catch (error) {
        logger_1.default.error("updateHaliSahaStats hatası – haliSahaId: %s: %o", haliSahaId, error);
    }
});
const createReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    logger_1.default.info("createReview çağrıldı by user %s", (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    const result = zodSchemas_1.createReviewSchema.safeParse(req.body);
    if (!result.success) {
        logger_1.default.warn("createReview: validation failed – %s", result.error.errors[0].message);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.BAD_REQUEST, {
            success: false,
            message: "Geçersiz yorum verisi.",
            error: result.error.errors[0].message,
        });
        return;
    }
    const data = result.data;
    try {
        const review = yield prisma_1.prisma.review.create({ data });
        yield updateHaliSahaStats(review.haliSahaId);
        logger_1.default.info("createReview başarılı – id: %s", review.id);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.CREATED, {
            message: "Yorum başarıyla oluşturuldu.",
            data: review,
        });
        return;
    }
    catch (error) {
        logger_1.default.error("createReview hatası: %o", error);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR, {
            success: false,
            message: "Yorum oluşturulamadı.",
        });
        return;
    }
});
exports.createReview = createReview;
const getAllReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info("getAllReviews çağrıldı");
    try {
        const reviews = yield prisma_1.prisma.review.findMany({
            include: { user: true },
            orderBy: { createdAt: "desc" },
        });
        logger_1.default.info("getAllReviews başarılı – count: %d", reviews.length);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.OK, { data: reviews });
        return;
    }
    catch (error) {
        logger_1.default.error("getAllReviews hatası: %o", error);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR, {
            success: false,
            message: "Yorumlara erişilemedi.",
        });
        return;
    }
});
exports.getAllReviews = getAllReviews;
const getReviewById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    logger_1.default.info("getReviewById çağrıldı – id: %s", id);
    try {
        const review = yield prisma_1.prisma.review.findUnique({ where: { id } });
        if (!review) {
            logger_1.default.warn("getReviewById: bulunamadı – id: %s", id);
            (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.NOT_FOUND, {
                success: false,
                message: "Yorum bulunamadı.",
            });
            return;
        }
        logger_1.default.info("getReviewById başarılı – id: %s", id);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.OK, { data: review });
        return;
    }
    catch (error) {
        logger_1.default.error("getReviewById hatası: %o", error);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR, {
            success: false,
            message: "Yoruma erişilemedi.",
        });
        return;
    }
});
exports.getReviewById = getReviewById;
const updateReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const { id } = req.params;
    logger_1.default.info("updateReview çağrıldı – id: %s by user %s", id, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    const result = zodSchemas_1.updateReviewSchema.safeParse(req.body);
    if (!result.success) {
        logger_1.default.warn("updateReview: validation failed – %s", result.error.errors[0].message);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.BAD_REQUEST, {
            success: false,
            message: "Geçersiz güncelleme verisi.",
            error: result.error.errors[0].message,
        });
        return;
    }
    try {
        const existingReview = yield prisma_1.prisma.review.findUnique({ where: { id } });
        if (!existingReview) {
            logger_1.default.warn("updateReview: bulunamadı – id: %s", id);
            (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.NOT_FOUND, {
                success: false,
                message: "Yorum bulunamadı.",
            });
            return;
        }
        if (existingReview.userId !== ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) && ((_c = req.user) === null || _c === void 0 ? void 0 : _c.role) !== "ADMIN") {
            logger_1.default.warn("updateReview: yetkisiz erişim by %s on %s", (_d = req.user) === null || _d === void 0 ? void 0 : _d.id, id);
            (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.FORBIDDEN, {
                success: false,
                message: "Bu yorumu güncellemeye yetkiniz yok.",
            });
            return;
        }
        const updated = yield prisma_1.prisma.review.update({
            where: { id },
            data: result.data,
        });
        yield updateHaliSahaStats(updated.haliSahaId);
        logger_1.default.info("updateReview başarılı – id: %s", id);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.OK, {
            message: "Yorum başarıyla güncellendi.",
            data: updated,
        });
        return;
    }
    catch (error) {
        logger_1.default.error("updateReview hatası: %o", error);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR, {
            success: false,
            message: "Yorum güncellenemedi.",
        });
        return;
    }
});
exports.updateReview = updateReview;
const deleteReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const { id } = req.params;
    logger_1.default.info("deleteReview çağrıldı – id: %s by user %s", id, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    try {
        const review = yield prisma_1.prisma.review.findUnique({ where: { id } });
        if (!review) {
            logger_1.default.warn("deleteReview: bulunamadı – id: %s", id);
            (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.NOT_FOUND, {
                success: false,
                message: "Silinecek yorum bulunamadı.",
            });
            return;
        }
        if (review.userId !== ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) && ((_c = req.user) === null || _c === void 0 ? void 0 : _c.role) !== "ADMIN") {
            logger_1.default.warn("deleteReview: yetkisiz erişim by %s on %s", (_d = req.user) === null || _d === void 0 ? void 0 : _d.id, id);
            (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.FORBIDDEN, {
                success: false,
                message: "Bu yorumu silmeye yetkiniz yok.",
            });
            return;
        }
        yield prisma_1.prisma.review.delete({ where: { id } });
        yield updateHaliSahaStats(review.haliSahaId);
        logger_1.default.info("deleteReview başarılı – id: %s", id);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.OK, { message: "Yorum silindi." });
        return;
    }
    catch (error) {
        logger_1.default.error("deleteReview hatası: %o", error);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR, {
            success: false,
            message: "Yorum silinemedi.",
        });
        return;
    }
});
exports.deleteReview = deleteReview;
