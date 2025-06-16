import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { HttpStatusCode } from "../core/enums/httpStatusCode";
import { sendResponse } from "../core/response/apiResponse";
import { createReviewSchema, updateReviewSchema } from "../validators/zodSchemas";

/**
 * Bir halı sahanın ortalama puanını ve toplam yorum sayısını hesaplayıp
 * veritabanında güncelleyen yardımcı fonksiyon.
 * @param haliSahaId Güncellenecek halı sahanın ID'si.
 */// reviewController.ts dosyanızdaki mevcut updateHaliSahaStats fonksiyonunu bununla değiştirin.

/**
 * Bir halı sahanın ortalama puanını ve toplam yorum sayısını hesaplayıp
 * veritabanında güncelleyen yardımcı fonksiyon.
 * @param haliSahaId Güncellenecek halı sahanın ID'si.
 */
const updateHaliSahaStats = async (haliSahaId: string) => {
  try {
    // İlgili halı sahanın tüm yorumları üzerinden istatistikleri hesapla
    const stats = await prisma.review.aggregate({
      where: { haliSahaId },
      _count: { _all: true },
      _avg: { rating: true },
    });

    const reviewCount = stats._count._all || 0;
    // Ortalamayı bir ondalık basamağa yuvarla
    const newRating = stats._avg.rating ? parseFloat(stats._avg.rating.toFixed(1)) : 0;

    // HaliSaha tablosunu yeni istatistiklerle güncelle
    await prisma.haliSaha.update({
      where: { id: haliSahaId },
      data: {
        reviewCount,
        rating: newRating, // <-- DEĞİŞİKLİK BURADA: 'averageRating' yerine 'rating' kullanıldı.
      },
    });

  } catch (error) {
    console.error(`Halı Saha ${haliSahaId} için istatistikler güncellenirken hata oluştu:`, error);
  }
};
export const createReview = async (req: Request, res: Response) => {
  const result = createReviewSchema.safeParse(req.body);
  if (!result.success) {
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

    // Yorum oluşturulduktan sonra ilgili halı sahanın istatistiklerini güncelle
    await updateHaliSahaStats(review.haliSahaId);

    sendResponse(res, HttpStatusCode.CREATED, {
      message: "Yorum başarıyla oluşturuldu.",
      data: review,
    });
  } catch (error) {
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Yorum oluşturulamadı.",
    });
  }
};

export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    sendResponse(res, HttpStatusCode.OK, { data: reviews });
  } catch (error) {
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Yorumlara erişilemedi.",
    });
  }
};

export const getReviewById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
       sendResponse(res, HttpStatusCode.NOT_FOUND, {
        success: false,
        message: "Yorum bulunamadı.",
      });
      return;
    }

    sendResponse(res, HttpStatusCode.OK, { data: review });
  } catch (error) {
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Yoruma erişilemedi.",
    });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = updateReviewSchema.safeParse(req.body);

  if (!result.success) {
    sendResponse(res, HttpStatusCode.BAD_REQUEST, {
      success: false,
      message: "Geçersiz güncelleme verisi.",
      error: result.error.errors[0].message,
    });
    return;
  }

  const data = result.data;

  try {
    const updated = await prisma.review.update({
      where: { id },
      data,
    });

    // Yorum güncellendikten sonra ilgili halı sahanın istatistiklerini güncelle
    await updateHaliSahaStats(updated.haliSahaId);

    sendResponse(res, HttpStatusCode.OK, {
      message: "Yorum başarıyla güncellendi.",
      data: updated,
    });
  } catch (error) {
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Yorum güncellenemedi.",
    });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Silmeden önce, hangi halı sahaya ait olduğunu öğrenmemiz gerekiyor
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      sendResponse(res, HttpStatusCode.NOT_FOUND, {
        success: false,
        message: "Silinecek yorum bulunamadı.",
      });
      return;
    }
    
    // Yorumu veritabanından sil
    await prisma.review.delete({ where: { id } });

    // Yorum silindikten sonra ilgili halı sahanın istatistiklerini güncelle
    await updateHaliSahaStats(review.haliSahaId);

    sendResponse(res, HttpStatusCode.OK, { message: "Yorum silindi." });
  } catch (error) {
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Yorum silinemedi.",
    });
  }
};