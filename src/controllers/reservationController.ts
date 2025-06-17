import { Request, Response } from "express";
import { HttpStatusCode } from "../core/enums/httpStatusCode";
import { sendResponse } from "../core/response/apiResponse";
import { createReservationSchema, updateReservationSchema } from "../validators/zodSchemas";
import { prisma } from "../lib/prisma";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";





export const createReservation = async (req: AuthenticatedRequest, res: Response) => {
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

    await updateBookedSlots(reservation.haliSahaId, reservation.reservationDateTime, "add");

    sendResponse(res, HttpStatusCode.CREATED, {
      message: "Rezervasyon başarıyla oluşturuldu.",
      data: reservation,
    });
    return;
  } catch (error) {
    console.error("Rezervasyon oluşturulamadı:", error);
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Rezervasyon oluşturulamadı.",
    });
    return;
  }
};


export const getAllReservations = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const role = req.user?.role;

  try {
    let reservations;

    if (role === "USER") {
      reservations = await prisma.reservation.findMany({
        where: { userId },
        include: { haliSaha: true },
        orderBy: { createdAt: "desc" },
      });

    } else if (role === "OWNER") {
      reservations = await prisma.reservation.findMany({
        where: {
          haliSaha: {
            ownerId: userId,
          },
        },
        include: { haliSaha: true },
        orderBy: { createdAt: "desc" },
      });

    } else if (role === "ADMIN") {
      reservations = await prisma.reservation.findMany({
        include: { haliSaha: true },
        orderBy: { createdAt: "desc" },
      });

    } else {
      sendResponse(res, HttpStatusCode.FORBIDDEN, {
        success: false,
        message: "Rezervasyonları görüntüleme yetkiniz yok.",
      });
      return;
    }

    sendResponse(res, HttpStatusCode.OK, { data: reservations });
    return;
  } catch (error) {
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Rezervasyonlara erişilemedi.",
    });
    return;
  }
};

export const getReservationById = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        haliSaha: { select: { ownerId: true } }
      }
    });

    if (!reservation) {
      sendResponse(res, HttpStatusCode.NOT_FOUND, {
        success: false,
        message: "Rezervasyon bulunamadı.",
      });
      return;
    }

    const isUser = userRole === "USER" && reservation.userId === userId;
    const isOwner = userRole === "OWNER" && reservation.haliSaha.ownerId === userId;

    if (!isUser && !isOwner && userRole !== "ADMIN") {
      sendResponse(res, HttpStatusCode.FORBIDDEN, {
        success: false,
        message: "Bu rezervasyona erişim yetkiniz yok.",
      });
      return;
    }

    sendResponse(res, HttpStatusCode.OK, { data: reservation });
    return;
  } catch (error) {
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Rezervasyona erişilemedi.",
    });
    return;
  }
};



export const updateReservation = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;

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
    const existing = await prisma.reservation.findUnique({
      where: { id },
      include: {
        haliSaha: { select: { ownerId: true } }
      }
    });

    if (!existing) {
      sendResponse(res, HttpStatusCode.NOT_FOUND, {
        success: false,
        message: "Rezervasyon bulunamadı.",
      });
      return;
    }

    const isUser = userRole === "USER" && existing.userId === userId;
    const isOwner = userRole === "OWNER" && existing.haliSaha.ownerId === userId;

    if (!isUser && !isOwner && userRole !== "ADMIN") {
      sendResponse(res, HttpStatusCode.FORBIDDEN, {
        success: false,
        message: "Bu rezervasyonu güncellemeye yetkiniz yok.",
      });
      return;
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: updates,
    });

    // Sadece cancelled durumunda bookedSlots'tan çıkar
    if (updated.status === "CANCELLED") {
      await updateBookedSlots(updated.haliSahaId, updated.reservationDateTime, "remove");
    }

    sendResponse(res, HttpStatusCode.OK, {
      message: "Rezervasyon güncellendi.",
      data: updated,
    });
    return;
  } catch (error) {
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Rezervasyon güncellenemedi.",
    });
    return;
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



async function updateBookedSlots(
  haliSahaId: string,
  slotTime: Date,
  action: "add" | "remove"
) {
  const haliSaha = await prisma.haliSaha.findUnique({
    where: { id: haliSahaId },
    select: { bookedSlots: true }
  });

  if (!haliSaha) return;

  const updatedSlots =
    action === "add"
      ? Array.from(new Set([...haliSaha.bookedSlots.map(d => d.toISOString()), slotTime.toISOString()]))
          .map(dateStr => new Date(dateStr)) // Set → string → Date geri çevir
      : haliSaha.bookedSlots.filter(slot => slot.getTime() !== slotTime.getTime());

  await prisma.haliSaha.update({
    where: { id: haliSahaId },
    data: { bookedSlots: updatedSlots }
  });
  console.log("Yeni bookedSlots:", updatedSlots);
}

