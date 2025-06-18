"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reservationLimiter = exports.authLimiter = exports.globalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const logger_1 = __importDefault(require("../core/logger/logger"));
const apiResponse_1 = require("../core/response/apiResponse");
const httpStatusCode_1 = require("../core/enums/httpStatusCode");
// 5 dakika içinde en fazla 100 istek → global limiter
exports.globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000, // 5 dakika
    max: 100, // her IP için maksimum 100 istek
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger_1.default.warn('Rate limit aşıldı (global): %s %s from %s', req.method, req.originalUrl, req.ip);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.TOO_MANY_REQUESTS, {
            success: false,
            message: "Çok fazla istek yaptınız. Lütfen bir süre sonra tekrar deneyin."
        });
    }
});
// 15 dakika içinde max 5 login/register denemesi → auth limiter
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000, // 5 dakika
    max: 5, // max 5 deneme
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger_1.default.warn('Rate limit aşıldı (auth): %s %s from %s', req.method, req.originalUrl, req.ip);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.TOO_MANY_REQUESTS, {
            success: false,
            message: "Çok fazla oturum açma denemesi. Lütfen 5 dakika sonra tekrar deneyin."
        });
    }
});
exports.reservationLimiter = (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000, // 10 dakika
    // role bazlı max ayarı:
    max: (req, _res) => {
        var _a;
        const role = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
        if (role === "ADMIN") {
            return 1000; // admin çok yüksek kota
        }
        else if (role === "OWNER") {
            return 50; // owner biraz daha fazla
        }
        return 10; // normal user için 10
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        var _a;
        logger_1.default.warn("Rate limit aşıldı (reservation, role=%s): %s %s from %s", (_a = req.user) === null || _a === void 0 ? void 0 : _a.role, req.method, req.originalUrl, req.ip);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.TOO_MANY_REQUESTS, {
            success: false,
            message: "Çok fazla rezervasyon isteği yaptınız. Lütfen bir süre sonra tekrar deneyin."
        });
    }
});
