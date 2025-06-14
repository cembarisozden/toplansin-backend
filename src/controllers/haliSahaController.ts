import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { sendResponse } from "../core/response/apiResponse";
import { HttpStatusCode } from "../core/enums/httpStatusCode";

const prisma = new PrismaClient();

export const createHaliSaha = async (req: Request, res: Response) => {
  const { name, location, phone, description, pricePerHour, startHour, endHour, size, surface, maxPlayers, ownerId,latitude,longitude } = req.body;

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
        longitude
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
    const sahalar = await prisma.haliSaha.findMany();
    sendResponse(res, HttpStatusCode.OK, {
      data: sahalar,
    });
  } catch (error) {
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Sahalara erişilemedi.",
    });
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
