import { Request, Response } from "express";
import { HttpStatusCode } from "../core/enums/httpStatusCode";
import { sendResponse } from "../core/response/apiResponse";
import { createReservationSchema, updateReservationSchema } from "../validators/zodSchemas";
import { prisma } from "../lib/prisma";


export const createReservation = async (req: Request, res: Response) => {
  const result = createReservationSchema.safeParse(req.body);
  if (!result.success) {
    sendResponse(res, HttpStatusCode.BAD_REQUEST, {
      success: false,
      message: "Geçersiz rezervasyon verisi.",
      error: result.error.errors[0].message,
    });
    return;
  }

  const data = result.data;
  try {
    const reservation = await prisma.reservation.create({ data });
    sendResponse(res, HttpStatusCode.CREATED, {
      message: "Rezervasyon başarıyla oluşturuldu.",
      data: reservation,
    });
  } catch (error) {
    console.error("Rezervasyon oluşturulamadı:", error);
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Rezervasyon oluşturulamadı.",
    });
  }
};

export const getAllReservations = async (req: Request, res: Response) => {
  try {
    const reservations = await prisma.reservation.findMany();
    sendResponse(res, HttpStatusCode.OK, { data: reservations });
  } catch (error) {
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Rezervasyonlara erişilemedi.",
    });
  }
};

export const getReservationById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const reservation = await prisma.reservation.findUnique({ where: { id } });

    if (!reservation) {
        sendResponse(res, HttpStatusCode.NOT_FOUND, {
        success: false,
        message: "Rezervasyon bulunamadı.",
      });
    }

    sendResponse(res, HttpStatusCode.OK, { data: reservation });
  } catch (error) {
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Rezervasyona erişilemedi.",
    });
  }
};

export const updateReservation = async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = updateReservationSchema.safeParse(req.body);
  if (!result.success) {
     sendResponse(res, HttpStatusCode.BAD_REQUEST, {
      success: false,
      message: "Geçersiz güncelleme verisi.",
      error: result.error.errors[0].message,
    });
    return;
  }

  const updates = result.data;

  try {
    const updated = await prisma.reservation.update({
      where: { id },
      data: updates,
    });

    sendResponse(res, HttpStatusCode.OK, {
      message: "Rezervasyon güncellendi.",
      data: updated,
    });
  } catch (error) {
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Rezervasyon güncellenemedi.",
    });
  }
};

export const deleteReservation = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.reservation.delete({ where: { id } });
    sendResponse(res, HttpStatusCode.OK, { message: "Rezervasyon silindi." });
  } catch (error) {
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Rezervasyon silinemedi.",
    });
  }
};
