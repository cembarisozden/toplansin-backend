"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHaliSaha = exports.updateHaliSaha = exports.getHaliSahaById = exports.getAllHaliSahalar = exports.createHaliSaha = void 0;
const apiResponse_1 = require("../core/response/apiResponse");
const httpStatusCode_1 = require("../core/enums/httpStatusCode");
const zodSchemas_1 = require("../validators/zodSchemas");
const prisma_1 = require("../lib/prisma");
const cache_1 = require("../utils/cache");
const logger_1 = __importDefault(require("../core/logger/logger")); // ← logger’ı ekledik
const createHaliSaha = async (req, res) => {
    logger_1.default.info("createHaliSaha çağrıldı, body: %o", req.body);
    const result = zodSchemas_1.createHaliSahaSchema.safeParse(req.body);
    if (!result.success) {
        logger_1.default.warn("createHaliSaha: Geçersiz veri – %s", result.error.errors[0].message);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.BAD_REQUEST, {
            success: false,
            message: "Geçersiz giriş verisi.",
            error: result.error.errors[0].message,
        });
        return;
    }
    const data = result.data;
    try {
        const haliSaha = await prisma_1.prisma.haliSaha.create({ data });
        logger_1.default.info("createHaliSaha başarılı – id: %s", haliSaha.id);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.CREATED, {
            message: "Halı saha başarıyla oluşturuldu.",
            data: haliSaha,
        });
        return;
    }
    catch (error) {
        logger_1.default.error("createHaliSaha hatası: %o", error);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR, {
            success: false,
            message: "Halı saha oluşturulamadı.",
        });
        return;
    }
};
exports.createHaliSaha = createHaliSaha;
const getAllHaliSahalar = async (req, res) => {
    logger_1.default.info("getAllHaliSahalar çağrıldı");
    try {
        const sahalar = await (0, cache_1.cacheOrFetch)("haliSahalar:all", 60, () => prisma_1.prisma.haliSaha.findMany());
        logger_1.default.info("getAllHaliSahalar başarılı – count: %d", sahalar.length);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.OK, { message: "Başarılı", data: sahalar });
        return;
    }
    catch (error) {
        logger_1.default.error("getAllHaliSahalar hatası: %o", error);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR, {
            success: false,
            message: "Hata oluştu",
        });
        return;
    }
};
exports.getAllHaliSahalar = getAllHaliSahalar;
const getHaliSahaById = async (req, res) => {
    const { id } = req.params;
    logger_1.default.info("getHaliSahaById çağrıldı – id: %s", id);
    try {
        const saha = await prisma_1.prisma.haliSaha.findUnique({ where: { id } });
        if (!saha) {
            logger_1.default.warn("getHaliSahaById: bulunamadı – id: %s", id);
            (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.NOT_FOUND, {
                success: false,
                message: "Halı saha bulunamadı.",
            });
            return;
        }
        logger_1.default.info("getHaliSahaById başarılı – id: %s", id);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.OK, { data: saha });
        return;
    }
    catch (error) {
        logger_1.default.error("getHaliSahaById hatası: %o", error);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR, {
            success: false,
            message: "Halı sahaya erişilemedi.",
        });
        return;
    }
};
exports.getHaliSahaById = getHaliSahaById;
const updateHaliSaha = async (req, res) => {
    const { id } = req.params;
    logger_1.default.info("updateHaliSaha çağrıldı – id: %s, body: %o", id, req.body);
    const result = zodSchemas_1.updateHaliSahaSchema.safeParse(req.body);
    if (!result.success) {
        logger_1.default.warn("updateHaliSaha: Geçersiz veri – %s", result.error.errors[0].message);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.BAD_REQUEST, {
            success: false,
            message: "Geçersiz giriş verisi.",
            error: result.error.errors[0].message,
        });
        return;
    }
    const updates = result.data;
    try {
        const updated = await prisma_1.prisma.haliSaha.update({
            where: { id },
            data: updates,
        });
        logger_1.default.info("updateHaliSaha başarılı – id: %s", id);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.OK, {
            message: "Halı saha güncellendi.",
            data: updated,
        });
        return;
    }
    catch (error) {
        logger_1.default.error("updateHaliSaha hatası: %o", error);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR, {
            success: false,
            message: "Güncelleme sırasında hata oluştu.",
        });
        return;
    }
};
exports.updateHaliSaha = updateHaliSaha;
const deleteHaliSaha = async (req, res) => {
    const { id } = req.params;
    logger_1.default.info("deleteHaliSaha çağrıldı – id: %s", id);
    try {
        await prisma_1.prisma.haliSaha.delete({ where: { id } });
        logger_1.default.info("deleteHaliSaha başarılı – id: %s", id);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.OK, {
            message: "Halı saha silindi.",
        });
        return;
    }
    catch (error) {
        logger_1.default.error("deleteHaliSaha hatası: %o", error);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR, {
            success: false,
            message: "Silme sırasında hata oluştu.",
        });
        return;
    }
};
exports.deleteHaliSaha = deleteHaliSaha;
//# sourceMappingURL=haliSahaController.js.map