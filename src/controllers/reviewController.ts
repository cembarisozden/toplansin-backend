import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { HttpStatusCode } from "../core/enums/httpStatusCode";
import { sendResponse } from "../core/response/apiResponse";
import { createReviewSchema,updateReviewSchema } from "../validators/zodSchemas";

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
    const reviews = await prisma.review.findMany();
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
    await prisma.review.delete({ where: { id } });
    sendResponse(res, HttpStatusCode.OK, { message: "Yorum silindi." });
  } catch (error) {
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Yorum silinemedi.",
    });
  }
};



