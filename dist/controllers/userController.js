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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.createUser = void 0;
const httpStatusCode_1 = require("../core/enums/httpStatusCode");
const apiResponse_1 = require("../core/response/apiResponse");
const prisma_1 = require("../lib/prisma");
const logger_1 = __importDefault(require("../core/logger/logger")); // ← logger eklendi
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info("createUser çağrıldı, body: %o", req.body);
    const { name, id, email, password, role, phone } = req.body;
    try {
        const newUser = yield prisma_1.prisma.user.create({
            data: { name, id, email, password, role, phone },
        });
        logger_1.default.info("createUser başarılı – userId: %s", newUser.id);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.OK, {
            success: true,
            message: "User successfully added",
            data: newUser,
        });
        return;
    }
    catch (error) {
        logger_1.default.error("createUser hatası: %o", error);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR, {
            success: false,
            message: "User cannot be added",
        });
        return;
    }
});
exports.createUser = createUser;
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info("getAllUsers çağrıldı");
    try {
        const users = yield prisma_1.prisma.user.findMany();
        logger_1.default.info("getAllUsers başarılı – count: %d", users.length);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.OK, {
            success: true,
            data: users,
        });
        return;
    }
    catch (error) {
        logger_1.default.error("getAllUsers hatası: %o", error);
        (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR, {
            success: false,
            message: "Cannot list users",
        });
        return;
    }
});
exports.getAllUsers = getAllUsers;
