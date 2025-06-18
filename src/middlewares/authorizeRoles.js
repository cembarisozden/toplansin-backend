"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = void 0;
const apiResponse_1 = require("../core/response/apiResponse");
const httpStatusCode_1 = require("../core/enums/httpStatusCode");
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        var _a;
        const userRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
        if (!userRole || !allowedRoles.includes(userRole)) {
            (0, apiResponse_1.sendResponse)(res, httpStatusCode_1.HttpStatusCode.FORBIDDEN, {
                success: false,
                message: "Bu işlemi yapmaya yetkiniz yok.",
            });
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
