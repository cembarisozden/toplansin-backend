import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { signToken } from "../utils/jwt";
import { sendResponse } from "../core/response/apiResponse";
import { HttpStatusCode } from "../core/enums/httpStatusCode";
import {RegisterSchema,LoginSchema} from "../validators/zodSchemas";

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {

  const result = RegisterSchema.safeParse(req.body);
  if (!result.success) {
      sendResponse(res, HttpStatusCode.BAD_REQUEST, {
      success: false,
      message: "Geçersiz giriş verisi.",
      error: result.error.errors[0].message,
    });
  }
  const { name, email, password, role } = req.body;

  try {
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        sendResponse(res, HttpStatusCode.CONFLICT, {
        success: false,
        message: "Email zaten kayıtlı.",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 8);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
    });

     sendResponse(res, HttpStatusCode.CREATED, {
      message: "Kayıt başarılı.",
      data: { userId: user.id },
    });
  } catch (err) {
    console.error("Register error:", err);
     sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Bir hata oluştu.",
    });
  }
};

export const login = async (req: Request, res: Response) => {


  const result = LoginSchema.safeParse(req.body);
  if (!result.success) {
      sendResponse(res, HttpStatusCode.BAD_REQUEST, {
      success: false,
      message: "Geçersiz giriş verisi.",
      error: result.error.errors,
    });
    return;
  }

  const { email, password } = result.data;

  try {
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    if (!user) {
        sendResponse(res, HttpStatusCode.UNAUTHORIZED, {
        success: false,
        message: "Geçersiz email veya şifre.",
      });
      
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
       sendResponse(res, HttpStatusCode.UNAUTHORIZED, {
        success: false,
        message: "Geçersiz email veya şifre.",
      });
      return;
    }

    const token = signToken({ id: user?.id, role: user.role }); // roller varsa
     sendResponse(res, HttpStatusCode.OK, {
      message: "Giriş başarılı.",
      data: { token },
    });
  } catch (err) {
    console.error("Login error:", err);
     sendResponse(res, HttpStatusCode.INTERNAL_SERVER_ERROR, {
      success: false,
      message: "Bir hata oluştu.",
    });
  }
};
