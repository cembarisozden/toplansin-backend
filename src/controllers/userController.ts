import { Request, Response } from "express";
import { HttpStatusCode } from "../core/enums/httpStatusCode";
import { sendResponse } from "../core/response/apiResponse";
import { prisma } from "../lib/prisma";
import logger from "../core/logger/logger";   // ← logger eklendi

export const createUser = async (req: Request, res: Response) => {
  logger.info("createUser çağrıldı, body: %o", req.body);

  const { name, id, email, password, role, phone } = req.body;
  try {
    const newUser = await prisma.user.create({
      data: { name, id, email, password, role, phone },
    });

    logger.info("createUser başarılı – userId: %s", newUser.id);
    sendResponse(res, HttpStatusCode.OK, {
      success: true,
      message: "User successfully added",
      data: newUser,
    });
    return;
  } catch (error) {
    logger.error("createUser hatası: %o", error);
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "User cannot be added",
    });
    return;
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  logger.info("getAllUsers çağrıldı");

  try {
    const users = await prisma.user.findMany();

    logger.info("getAllUsers başarılı – count: %d", users.length);
    sendResponse(res, HttpStatusCode.OK, {
      success: true,
      data: users,
    });
    return;
  } catch (error) {
    logger.error("getAllUsers hatası: %o", error);
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Cannot list users",
    });
    return;
  }
};
