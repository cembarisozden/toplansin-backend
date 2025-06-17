import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { signToken } from "../utils/jwt";
import { sendResponse } from "../core/response/apiResponse";
import { HttpStatusCode } from "../core/enums/httpStatusCode";
import { RegisterSchema, LoginSchema } from "../validators/zodSchemas";
import { prisma } from "../lib/prisma";
import logger from "../core/logger/logger";   // ← logger’ı ekledik

export const register = async (req: Request, res: Response) => {
  logger.info("register endpoint çağrıldı, body: %o", req.body);

  const result = RegisterSchema.safeParse(req.body);
  if (!result.success) {
    logger.warn(
      "register: Geçersiz veri – %s",
      result.error.errors[0].message
    );
    sendResponse(res, HttpStatusCode.BAD_REQUEST, {
      success: false,
      message: "Geçersiz kayıt verisi.",
      error: result.error.errors[0].message,
    });
    return;
  }

  const { name, email, password, } = result.data;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      logger.warn("register: Çakışma – email zaten kayıtlı (%s)", email);
      sendResponse(res, HttpStatusCode.CONFLICT, {
        success: false,
        message: "Email zaten kayıtlı.",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 8);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword},
    });

    logger.info("register başarılı – userId: %s", user.id);
    sendResponse(res, HttpStatusCode.CREATED, {
      message: "Kayıt başarılı.",
      data: { userId: user.id },
    });
    return;
  } catch (err) {
    logger.error("register hatası: %o", err);
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Bir hata oluştu.",
    });
    return;
  }
};

export const login = async (req: Request, res: Response) => {
  logger.info("login endpoint çağrıldı, body: %o", req.body);

  const result = LoginSchema.safeParse(req.body);
  if (!result.success) {
    logger.warn(
      "login: Geçersiz veri – %o",
      result.error.errors
    );
    sendResponse(res, HttpStatusCode.BAD_REQUEST, {
      success: false,
      message: "Geçersiz giriş verisi.",
      error: result.error.errors,
    });
    return;
  }

  const { email, password } = result.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      logger.warn("login: Başarısız – email bulunamadı (%s)", email);
      sendResponse(res, HttpStatusCode.UNAUTHORIZED, {
        success: false,
        message: "Geçersiz email veya şifre.",
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn("login: Başarısız – şifre uyuşmuyor (userId: %s)", user.id);
      sendResponse(res, HttpStatusCode.UNAUTHORIZED, {
        success: false,
        message: "Geçersiz email veya şifre.",
      });
      return;
    }

    const token = signToken({ id: user.id, role: user.role });
    const { password: _, ...userWithoutPassword } = user;

    logger.info("login başarılı – userId: %s", user.id);
    sendResponse(res, HttpStatusCode.OK, {
      message: "Giriş başarılı.",
      data: {
        user: userWithoutPassword,
        token,
      },
    });
    return;
  } catch (err) {
    logger.error("login hatası: %o", err);
    sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Bir hata oluştu.",
    });
    return;
  }
};
