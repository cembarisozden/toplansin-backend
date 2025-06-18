"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
const sendResponse = (res, statusCode, payload) => {
    var _a, _b, _c;
    return res.status(statusCode).json({
        success: (_a = payload.success) !== null && _a !== void 0 ? _a : true,
        message: payload.message,
        data: (_b = payload.data) !== null && _b !== void 0 ? _b : null,
        error: (_c = payload.error) !== null && _c !== void 0 ? _c : null,
    });
};
exports.sendResponse = sendResponse;
