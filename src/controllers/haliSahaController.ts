import { Request, Response } from "express";
import { sendResponse } from "../core/response/apiResponse";
import { HttpStatusCode } from "../core/enums/httpStatusCode";
import {createHaliSahaSchema,updateHaliSahaSchema} from "../validators/zodSchemas";
import { prisma } from "../lib/prisma";
import { cacheOrFetch } from "../utils/cache";


export const createHaliSaha = async (req: Request, res: Response) => {

  const result=createHaliSahaSchema.safeParse(req.body);
   if (!result.success) {
      sendResponse(res, HttpStatusCode.BAD_REQUEST, {
      success: false,
      message: "Geçersiz giriş verisi.",
      error: result.error.errors[0].message,
    });
  }

  const { name, location, phone, description, pricePerHour, startHour, endHour, size, surface, maxPlayers, ownerId,latitude,longitude,hasCafeteria,hasNightLighting,hasParking,hasShoeRental,hasShowers } = req.body;

  try {
    const haliSaha = await prisma.haliSaha.create({
      data: {
        name,
        location,
        phone,
        description,
        pricePerHour,
        startHour,
        endHour,
        size,
        surface,
        maxPlayers,
        ownerId,
        latitude,
        longitude,
        hasCafeteria,
        hasNightLighting,
        hasParking,
        hasShoeRental,
        hasShowers,
      },
    });

    sendResponse(res, HttpStatusCode.CREATED, {
      message: "Halı saha başarıyla oluşturuldu.",
      data: haliSaha,
    });
  } catch (error) {
    console.error("Halı saha oluşturma hatası:", error);
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Halı saha oluşturulamadı.",
    });
  }
};

export const getAllHaliSahalar = async (req: Request, res: Response) => {
  try {
    const sahalar = await cacheOrFetch("haliSahalar:all", 60, () => prisma.haliSaha.findMany());
    sendResponse(res, HttpStatusCode.OK, { message: "Başarılı", data: sahalar });
  } catch (err) {
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, { success: false, message: "Hata oluştu" });
  }
};

export const getHaliSahaById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const saha = await prisma.haliSaha.findUnique({ where: { id } });

    if (!saha) {
       sendResponse(res, HttpStatusCode.NOT_FOUND, {
        success: false,
        message: "Halı saha bulunamadı.",
      });
      return;
    }

    sendResponse(res, HttpStatusCode.OK, {
      data: saha,
    });
  } catch (error) {
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Halı sahaya erişilemedi.",
    });
  }
};

export const updateHaliSaha = async (req: Request, res: Response) => {

  const result=updateHaliSahaSchema.safeParse(req.body);
   if (!result.success) {
      sendResponse(res, HttpStatusCode.BAD_REQUEST, {
      success: false,
      message: "Geçersiz giriş verisi.",
      error: result.error.errors[0].message,
    });
  }

  const { id } = req.params;
  const updates = req.body;

  try {
    const updated = await prisma.haliSaha.update({
      where: { id },
      data: updates,
    });

    sendResponse(res, HttpStatusCode.OK, {
      message: "Halı saha güncellendi.",
      data: updated,
    });
  } catch (error) {
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Güncelleme sırasında hata oluştu.",
    });
  }
};

export const deleteHaliSaha = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.haliSaha.delete({ where: { id } });
    sendResponse(res, HttpStatusCode.OK, {
      message: "Halı saha silindi.",
    });
  } catch (error) {
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Silme sırasında hata oluştu.",
    });
  }
};
