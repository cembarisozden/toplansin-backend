import rateLimit from 'express-rate-limit';
import logger from '../core/logger/logger';
import { sendResponse } from '../core/response/apiResponse';
import { HttpStatusCode } from '../core/enums/httpStatusCode';
import { AuthenticatedRequest } from './authMiddleware';

// 5 dakika içinde en fazla 100 istek → global limiter
export const globalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,     // 5 dakika
  max: 100,                    // her IP için maksimum 100 istek
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(
      'Rate limit aşıldı (global): %s %s from %s',
      req.method,
      req.originalUrl,
      req.ip
    );
    sendResponse(res, HttpStatusCode.TOO_MANY_REQUESTS, {
      success: false,
      message: "Çok fazla istek yaptınız. Lütfen bir süre sonra tekrar deneyin."
    });
  }
});

// 15 dakika içinde max 5 login/register denemesi → auth limiter
export const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,    // 5 dakika
  max: 5,                      // max 5 deneme
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(
      'Rate limit aşıldı (auth): %s %s from %s',
      req.method,
      req.originalUrl,
      req.ip
    );
    sendResponse(res, HttpStatusCode.TOO_MANY_REQUESTS, {
      success: false,
      message: "Çok fazla oturum açma denemesi. Lütfen 5 dakika sonra tekrar deneyin."
    });
  }
});

export const reservationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 dakika
  // role bazlı max ayarı:
  max: (req: AuthenticatedRequest, _res) => {
    const role = req.user?.role;
    if (role === "ADMIN") {
      return 1000;  // admin çok yüksek kota
    } else if (role === "OWNER") {
      return 50;   // owner biraz daha fazla
    }
    return 10;      // normal user için 10
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: AuthenticatedRequest, res) => {
    logger.warn(
      "Rate limit aşıldı (reservation, role=%s): %s %s from %s",
      req.user?.role,
      req.method,
      req.originalUrl,
      req.ip
    );
    sendResponse(res, HttpStatusCode.TOO_MANY_REQUESTS, {
      success: false,
      message: "Çok fazla rezervasyon isteği yaptınız. Lütfen bir süre sonra tekrar deneyin."
    });
  }
});


