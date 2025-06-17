import { Request, Response } from "express";
import { HttpStatusCode } from "../core/enums/httpStatusCode";
import { sendResponse } from "../core/response/apiResponse";
import { createReservationSchema, updateReservationSchema } from "../validators/zodSchemas";
import { prisma } from "../lib/prisma";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import logger from "../core/logger/logger"; // ← ekledik

export const createReservation = async (req: AuthenticatedRequest, res: Response) => {
  logger.info("createReservation çağrıldı by user %s", req.user?.id);

  const result = createReservationSchema.safeParse(req.body);
  if (!result.success) {
    logger.warn("createReservation: Geçersiz veri – %s", result.error.errors[0].message);
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

    // Her durumda ekle
    await updateBookedSlots(reservation.haliSahaId, reservation.reservationDateTime, "add");
    logger.info("createReservation başarılı – id: %s", reservation.id);

    sendResponse(res, HttpStatusCode.CREATED, {
      message: "Rezervasyon başarıyla oluşturuldu.",
      data: reservation,
    });
    return;
  } catch (error) {
    logger.error("createReservation hatası: %o", error);
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Rezervasyon oluşturulamadı.",
    });
    return;
  }
};

export const getAllReservations = async (req: AuthenticatedRequest, res: Response) => {
  logger.info("getAllReservations çağrıldı by user %s (role: %s)", req.user?.id, req.user?.role);
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
        where: { haliSaha: { ownerId: userId } },
        include: { haliSaha: true },
        orderBy: { createdAt: "desc" },
      });
    } else if (role === "ADMIN") {
      reservations = await prisma.reservation.findMany({
        include: { haliSaha: true },
        orderBy: { createdAt: "desc" },
      });
    } else {
      logger.warn("getAllReservations: yetkisiz erişim attempt by %s", userId);
      sendResponse(res, HttpStatusCode.FORBIDDEN, {
        success: false,
        message: "Rezervasyonları görüntüleme yetkiniz yok.",
      });
      return;
    }

    logger.info("getAllReservations başarılı – count: %d", reservations.length);
    sendResponse(res, HttpStatusCode.OK, { data: reservations });
    return;
  } catch (error) {
    logger.error("getAllReservations hatası: %o", error);
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Rezervasyonlara erişilemedi.",
    });
    return;
  }
};

export const getReservationById = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  logger.info("getReservationById çağrıldı – id: %s by user %s", id, req.user?.id);
  const userId = req.user?.id;
  const userRole = req.user?.role;

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { haliSaha: { select: { ownerId: true } } },
    });

    if (!reservation) {
      logger.warn("getReservationById: bulunamadı – id: %s", id);
      sendResponse(res, HttpStatusCode.NOT_FOUND, {
        success: false,
        message: "Rezervasyon bulunamadı.",
      });
      return;
    }

    const isUser = userRole === "USER" && reservation.userId === userId;
    const isOwner = userRole === "OWNER" && reservation.haliSaha.ownerId === userId;
    if (!isUser && !isOwner && userRole !== "ADMIN") {
      logger.warn("getReservationById: yetkisiz erişim by %s on %s", userId, id);
      sendResponse(res, HttpStatusCode.FORBIDDEN, {
        success: false,
        message: "Bu rezervasyona erişim yetkiniz yok.",
      });
      return;
    }

    logger.info("getReservationById başarılı – id: %s", id);
    sendResponse(res, HttpStatusCode.OK, { data: reservation });
    return;
  } catch (error) {
    logger.error("getReservationById hatası: %o", error);
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Rezervasyona erişilemedi.",
    });
    return;
  }
};

export const updateReservation = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  logger.info("updateReservation çağrıldı – id: %s by user %s", id, req.user?.id);
  const userId = req.user?.id;
  const userRole = req.user?.role;

  const result = updateReservationSchema.safeParse(req.body);
  if (!result.success) {
    logger.warn("updateReservation: Geçersiz veri – %s", result.error.errors[0].message);
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
      include: { haliSaha: { select: { ownerId: true } } },
    });
    if (!existing) {
      logger.warn("updateReservation: bulunamadı – id: %s", id);
      sendResponse(res, HttpStatusCode.NOT_FOUND, {
        success: false,
        message: "Rezervasyon bulunamadı.",
      });
      return;
    }

    const isUser = userRole === "USER" && existing.userId === userId;
    const isOwner = userRole === "OWNER" && existing.haliSaha.ownerId === userId;
    if (!isUser && !isOwner && userRole !== "ADMIN") {
      logger.warn("updateReservation: yetkisiz erişim by %s on %s", userId, id);
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

    if (updated.status === "cancelled") {
      await updateBookedSlots(updated.haliSahaId, updated.reservationDateTime, "remove");
    }

    logger.info("updateReservation başarılı – id: %s", id);
    sendResponse(res, HttpStatusCode.OK, {
      message: "Rezervasyon güncellendi.",
      data: updated,
    });
    return;
  } catch (error) {
    logger.error("updateReservation hatası: %o", error);
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Rezervasyon güncellenemedi.",
    });
    return;
  }
};

export const deleteReservation = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  logger.info("deleteReservation çağrıldı – id: %s by user %s", id, req.user?.id);

  try {
    await prisma.reservation.delete({ where: { id } });
    logger.info("deleteReservation başarılı – id: %s", id);
    sendResponse(res, HttpStatusCode.OK, { message: "Rezervasyon silindi." });
    return;
  } catch (error) {
    logger.error("deleteReservation hatası: %o", error);
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Rezervasyon silinemedi.",
    });
    return;
  }
};

async function updateBookedSlots(
  haliSahaId: string,
  slotTime: Date,
  action: "add" | "remove"
) {
  logger.info(
    "updateBookedSlots çağrıldı – action: %s, slot: %s, haliSahaId: %s",
    action,
    slotTime.toISOString(),
    haliSahaId
  );

  const haliSaha = await prisma.haliSaha.findUnique({
    where: { id: haliSahaId },
    select: { bookedSlots: true },
  });
  if (!haliSaha) {
    logger.warn("updateBookedSlots: haliSaha bulunamadı – id: %s", haliSahaId);
    return;
  }

  const updatedSlots =
    action === "add"
      ? Array.from(
          new Set([
            ...haliSaha.bookedSlots.map((d) => d.toISOString()),
            slotTime.toISOString(),
          ])
        ).map((str) => new Date(str))
      : haliSaha.bookedSlots.filter(
          (slot) => slot.toISOString() !== slotTime.toISOString()
        );

  await prisma.haliSaha.update({
    where: { id: haliSahaId },
    data: { bookedSlots: updatedSlots },
  });

  logger.info(
    "updateBookedSlots başarılı – yeni bookedSlots count: %d",
    updatedSlots.length
  );
}
