"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
const sendResponse = (res, statusCode, payload) => {
    return res.status(statusCode).json({
        success: payload.success ?? true,
        message: payload.message,
        data: payload.data ?? null,
        error: payload.error ?? null,
    });
};
exports.sendResponse = sendResponse;
//# sourceMappingURL=apiResponse.js.map