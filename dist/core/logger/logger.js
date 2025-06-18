"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const { combine, timestamp, printf, errors, json, colorize } = winston_1.format;
// 1️⃣ Özel format (isteğe bağlı)
const customFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack ?? message}`;
});
const logger = (0, winston_1.createLogger)({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), // `error` nesnelerinin stack trace’ini de yaz
    json() // JSON formatta logla
    ),
    transports: [
        // Hata loglarını bir dosyaya yaz
        new winston_1.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5 * 1024 * 1024, // 5 MB
            maxFiles: 5,
        }),
        // Tüm seviyeler için bir dosya
        new winston_1.transports.File({
            filename: 'logs/combined.log',
            maxsize: 10 * 1024 * 1024, // 10 MB
            maxFiles: 5,
        }),
        // Günlük rotasyonlu dosya (opsiyonel)
        new winston_daily_rotate_file_1.default({
            filename: 'logs/app-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '14d',
            zippedArchive: true,
        })
    ]
});
// 2️⃣ Geliştirme ortamında console’a da yaz
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston_1.transports.Console({
        format: combine(colorize(), timestamp({ format: 'HH:mm:ss' }), customFormat)
    }));
}
exports.default = logger;
//# sourceMappingURL=logger.js.map