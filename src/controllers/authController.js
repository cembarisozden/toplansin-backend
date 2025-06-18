"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt_1 = require("../utils/jwt");
const apiResponse_1 = require("../core/response/apiResponse");
const httpStatusCode_1 = require("../core/enums/httpStatusCode");
const zodSchemas_1 = require("../validators/zodSchemas");
const prisma_1 = require("../lib/prisma");
const logger_1 = __importDefault(require("../core/logger/logger")); // ← logger’ı ekledik
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info("register endpoint çağrıldı, body: %o", req.body);
    const result = zodSchemas_1.RegisterSchema.safeParse(req.body);
    if (!result.success) {
        logger_1.default.warn("register: Geçersiz veri – %s", result.error.errors[0].message);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.BAD_REQUEST, {
            success: false,
            message: "Geçersiz kayıt verisi.",
            error: result.error.errors[0].message,
        });
        return;
    }
    const { name, email, password, } = result.data;
    try {
        const existingUser = yield prisma_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            logger_1.default.warn("register: Çakışma – email zaten kayıtlı (%s)", email);
            (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.CONFLICT, {
                success: false,
                message: "Email zaten kayıtlı.",
            });
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 8);
        const user = yield prisma_1.prisma.user.create({
            data: { name, email, password: hashedPassword },
        });
        logger_1.default.info("register başarılı – userId: %s", user.id);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.CREATED, {
            message: "Kayıt başarılı.",
            data: { userId: user.id },
        });
        return;
    }
    catch (err) {
        logger_1.default.error("register hatası: %o", err);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR, {
            success: false,
            message: "Bir hata oluştu.",
        });
        return;
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info("login endpoint çağrıldı, body: %o", req.body);
    const result = zodSchemas_1.LoginSchema.safeParse(req.body);
    if (!result.success) {
        logger_1.default.warn("login: Geçersiz veri – %o", result.error.errors);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.BAD_REQUEST, {
            success: false,
            message: "Geçersiz giriş verisi.",
            error: result.error.errors,
        });
        return;
    }
    const { email, password } = result.data;
    try {
        const user = yield prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            logger_1.default.warn("login: Başarısız – email bulunamadı (%s)", email);
            (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.UNAUTHORIZED, {
                success: false,
                message: "Geçersiz email veya şifre.",
            });
            return;
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            logger_1.default.warn("login: Başarısız – şifre uyuşmuyor (userId: %s)", user.id);
            (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.UNAUTHORIZED, {
                success: false,
                message: "Geçersiz email veya şifre.",
            });
            return;
        }
        const token = (0, jwt_1.signToken)({ id: user.id, role: user.role });
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        logger_1.default.info("login başarılı – userId: %s", user.id);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.OK, {
            message: "Giriş başarılı.",
            data: {
                user: userWithoutPassword,
                token,
            },
        });
        return;
    }
    catch (err) {
        logger_1.default.error("login hatası: %o", err);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR, {
            success: false,
            message: "Bir hata oluştu.",
        });
        return;
    }
});
exports.login = login;
