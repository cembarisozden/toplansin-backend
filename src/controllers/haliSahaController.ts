import { Request, Response } from "express";
import { sendResponse } from "../core/response/apiResponse";
import { HttpStatusCode } from "../core/enums/httpStatusCode";
import { createHaliSahaSchema, updateHaliSahaSchema } from "../validators/zodSchemas";
import { prisma } from "../lib/prisma";
import { cacheOrFetch } from "../utils/cache";
import logger from "../core/logger/logger";   // ← logger’ı ekledik

export const createHaliSaha = async (req: Request, res: Response) => {
  logger.info("createHaliSaha çağrıldı, body: %o", req.body);

  const result = createHaliSahaSchema.safeParse(req.body);
  if (!result.success) {
    logger.warn("createHaliSaha: Geçersiz veri – %s", result.error.errors[0].message);
    sendResponse(res, HttpStatusCode.BAD_REQUEST, {
      success: false,
      message: "Geçersiz giriş verisi.",
      error: result.error.errors[0].message,
    });
    return;
  }

  const data = result.data;
  try {
    const haliSaha = await prisma.haliSaha.create({ data });
    logger.info("createHaliSaha başarılı – id: %s", haliSaha.id);
    sendResponse(res, HttpStatusCode.CREATED, {
      message: "Halı saha başarıyla oluşturuldu.",
      data: haliSaha,
    });
    return;
  } catch (error) {
    logger.error("createHaliSaha hatası: %o", error);
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Halı saha oluşturulamadı.",
    });
    return;
  }
};

export const getAllHaliSahalar = async (req: Request, res: Response) => {
  logger.info("getAllHaliSahalar çağrıldı");

  try {
    const sahalar = await cacheOrFetch(
      "haliSahalar:all",
      60,
      () => prisma.haliSaha.findMany()
    );
    logger.info("getAllHaliSahalar başarılı – count: %d", sahalar.length);
    sendResponse(res, HttpStatusCode.OK, { message: "Başarılı", data: sahalar });
    return;
  } catch (error) {
    logger.error("getAllHaliSahalar hatası: %o", error);
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Hata oluştu",
    });
    return;
  }
};

export const getHaliSahaById = async (req: Request, res: Response) => {
  const { id } = req.params;
  logger.info("getHaliSahaById çağrıldı – id: %s", id);

  try {
    const saha = await prisma.haliSaha.findUnique({ where: { id } });
    if (!saha) {
      logger.warn("getHaliSahaById: bulunamadı – id: %s", id);
      sendResponse(res, HttpStatusCode.NOT_FOUND, {
        success: false,
        message: "Halı saha bulunamadı.",
      });
      return;
    }

    logger.info("getHaliSahaById başarılı – id: %s", id);
    sendResponse(res, HttpStatusCode.OK, { data: saha });
    return;
  } catch (error) {
    logger.error("getHaliSahaById hatası: %o", error);
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Halı sahaya erişilemedi.",
    });
    return;
  }
};

export const updateHaliSaha = async (req: Request, res: Response) => {
  const { id } = req.params;
  logger.info("updateHaliSaha çağrıldı – id: %s, body: %o", id, req.body);

  const result = updateHaliSahaSchema.safeParse(req.body);
  if (!result.success) {
    logger.warn("updateHaliSaha: Geçersiz veri – %s", result.error.errors[0].message);
    sendResponse(res, HttpStatusCode.BAD_REQUEST, {
      success: false,
      message: "Geçersiz giriş verisi.",
      error: result.error.errors[0].message,
    });
    return;
  }

  const updates = result.data;
  try {
    const updated = await prisma.haliSaha.update({
      where: { id },
      data: updates,
    });
    logger.info("updateHaliSaha başarılı – id: %s", id);
    sendResponse(res, HttpStatusCode.OK, {
      message: "Halı saha güncellendi.",
      data: updated,
    });
    return;
  } catch (error) {
    logger.error("updateHaliSaha hatası: %o", error);
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Güncelleme sırasında hata oluştu.",
    });
    return;
  }
};

export const deleteHaliSaha = async (req: Request, res: Response) => {
  const { id } = req.params;
  logger.info("deleteHaliSaha çağrıldı – id: %s", id);

  try {
    await prisma.haliSaha.delete({ where: { id } });
    logger.info("deleteHaliSaha başarılı – id: %s", id);
    sendResponse(res, HttpStatusCode.OK, {
      message: "Halı saha silindi.",
    });
    return;
  } catch (error) {
    logger.error("deleteHaliSaha hatası: %o", error);
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Silme sırasında hata oluştu.",
    });
    return;
  }
};
