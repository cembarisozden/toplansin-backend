"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signToken = signToken;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const secret = process.env.JWT_SECRET;
const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
if (!secret) {
    throw new Error("JWT_SECRET .env dosyasında tanımlanmalı");
}
const options = {
    expiresIn: expiresIn, // bu string aslında geçerli
    algorithm: "HS256",
};
// Token üretimi
function signToken(payload) {
    return jsonwebtoken_1.default.sign(payload, secret, options);
}
// Token doğrulama
function verifyToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, secret);
    }
    catch (err) {
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
