import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { HttpStatusCode } from "../core/enums/httpStatusCode";
import { sendResponse } from "../core/response/apiResponse";
import { createReviewSchema, updateReviewSchema } from "../validators/zodSchemas";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import logger from "../core/logger/logger"; // ← logger eklendi

/**
 * Bir halı sahanın ortalama puanını ve toplam yorum sayısını hesaplayıp
 * veritabanında güncelleyen yardımcı fonksiyon.
 */
const updateHaliSahaStats = async (haliSahaId: string) => {
  try {
    const stats = await prisma.review.aggregate({
      where: { haliSahaId },
      _count: { _all: true },
      _avg: { rating: true },
    });

    const reviewCount = stats._count._all || 0;
    const newRating = stats._avg.rating
      ? parseFloat(stats._avg.rating.toFixed(1))
      : 0;

    await prisma.haliSaha.update({
      where: { id: haliSahaId },
      data: {
        reviewCount,
        rating: newRating,
      },
    });

    logger.info("updateHaliSahaStats başarılı – haliSahaId: %s, count: %d, rating: %f",
      haliSahaId, reviewCount, newRating);

  } catch (error) {
    logger.error("updateHaliSahaStats hatası – haliSahaId: %s: %o", haliSahaId, error);
  }
};

export const createReview = async (req: AuthenticatedRequest, res: Response) => {
  logger.info("createReview çağrıldı by user %s", req.user?.id);

  const result = createReviewSchema.safeParse(req.body);
  if (!result.success) {
    logger.warn("createReview: validation failed – %s", result.error.errors[0].message);
    sendResponse(res, HttpStatusCode.BAD_REQUEST, {
      success: false,
      message: "Geçersiz yorum verisi.",
      error: result.error.errors[0].message,
    });
    return;
  }

  const data = result.data;
  try {
    const review = await prisma.review.create({ data });

    await updateHaliSahaStats(review.haliSahaId);

    logger.info("createReview başarılı – id: %s", review.id);
    sendResponse(res, HttpStatusCode.CREATED, {
      message: "Yorum başarıyla oluşturuldu.",
      data: review,
    });
    return;
  } catch (error) {
    logger.error("createReview hatası: %o", error);
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Yorum oluşturulamadı.",
    });
    return;
  }
};

export const getAllReviews = async (req: Request, res: Response) => {
  logger.info("getAllReviews çağrıldı");

  try {
    const reviews = await prisma.review.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
    logger.info("getAllReviews başarılı – count: %d", reviews.length);
    sendResponse(res, HttpStatusCode.OK, { data: reviews });
    return;
  } catch (error) {
    logger.error("getAllReviews hatası: %o", error);
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Yorumlara erişilemedi.",
    });
    return;
  }
};

export const getReviewById = async (req: Request, res: Response) => {
  const { id } = req.params;
  logger.info("getReviewById çağrıldı – id: %s", id);

  try {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      logger.warn("getReviewById: bulunamadı – id: %s", id);
      sendResponse(res, HttpStatusCode.NOT_FOUND, {
        success: false,
        message: "Yorum bulunamadı.",
      });
      return;
    }
    logger.info("getReviewById başarılı – id: %s", id);
    sendResponse(res, HttpStatusCode.OK, { data: review });
    return;
  } catch (error) {
    logger.error("getReviewById hatası: %o", error);
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Yoruma erişilemedi.",
    });
    return;
  }
};

export const updateReview = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  logger.info("updateReview çağrıldı – id: %s by user %s", id, req.user?.id);

  const result = updateReviewSchema.safeParse(req.body);
  if (!result.success) {
    logger.warn("updateReview: validation failed – %s", result.error.errors[0].message);
    sendResponse(res, HttpStatusCode.BAD_REQUEST, {
      success: false,
      message: "Geçersiz güncelleme verisi.",
      error: result.error.errors[0].message,
    });
    return;
  }

  try {
    const existingReview = await prisma.review.findUnique({ where: { id } });
    if (!existingReview) {
      logger.warn("updateReview: bulunamadı – id: %s", id);
      sendResponse(res, HttpStatusCode.NOT_FOUND, {
        success: false,
        message: "Yorum bulunamadı.",
      });
      return;
    }
    if (existingReview.userId !== req.user?.id && req.user?.role !== "ADMIN") {
      logger.warn("updateReview: yetkisiz erişim by %s on %s", req.user?.id, id);
      sendResponse(res, HttpStatusCode.FORBIDDEN, {
        success: false,
        message: "Bu yorumu güncellemeye yetkiniz yok.",
      });
      return;
    }

    const updated = await prisma.review.update({
      where: { id },
      data: result.data,
    });
    await updateHaliSahaStats(updated.haliSahaId);

    logger.info("updateReview başarılı – id: %s", id);
    sendResponse(res, HttpStatusCode.OK, {
      message: "Yorum başarıyla güncellendi.",
      data: updated,
    });
    return;
  } catch (error) {
    logger.error("updateReview hatası: %o", error);
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Yorum güncellenemedi.",
    });
    return;
  }
};

export const deleteReview = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  logger.info("deleteReview çağrıldı – id: %s by user %s", id, req.user?.id);

  try {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      logger.warn("deleteReview: bulunamadı – id: %s", id);
      sendResponse(res, HttpStatusCode.NOT_FOUND, {
        success: false,
        message: "Silinecek yorum bulunamadı.",
      });
      return;
    }
    if (review.userId !== req.user?.id && req.user?.role !== "ADMIN") {
      logger.warn("deleteReview: yetkisiz erişim by %s on %s", req.user?.id, id);
      sendResponse(res, HttpStatusCode.FORBIDDEN, {
        success: false,
        message: "Bu yorumu silmeye yetkiniz yok.",
      });
      return;
    }

    await prisma.review.delete({ where: { id } });
    await updateHaliSahaStats(review.haliSahaId);

    logger.info("deleteReview başarılı – id: %s", id);
    sendResponse(res, HttpStatusCode.OK, { message: "Yorum silindi." });
    return;
  } catch (error) {
    logger.error("deleteReview hatası: %o", error);
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Yorum silinemedi.",
    });
    return;
  }
};
