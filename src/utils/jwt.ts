import jwt, { Secret, SignOptions, JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const secret: Secret = process.env.JWT_SECRET as Secret;
const expiresIn : string = process.env.JWT_EXPIRES_IN as string || "7d";

if (!secret) {
  throw new Error("JWT_SECRET .env dosyasında tanımlanmalı");
}

const options = {
  expiresIn: expiresIn, // bu string aslında geçerli
  algorithm: "HS256",
} as SignOptions;

// Token üretimi
export function signToken(payload: object): string {
  return jwt.sign(payload, secret, options);
}

// Token doğrulama
export function verifyToken(token: string): JwtPayload | string {
  try {
    return jwt.verify(token, secret);
  } catch (err: any) {
    // Daha detaylı hata analizi yapabilirsin
    if (err.name === "TokenExpiredError") {
      throw new Error("Token süresi dolmuş");
    }
    if (err.name === "JsonWebTokenError") {
      throw new Error("Token geçersiz");
    }
    throw new Error("Token doğrulanamadı");
  }
}
