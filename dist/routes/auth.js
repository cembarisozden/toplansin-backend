"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const rateLimiter_1 = require("../middlewares/rateLimiter");
const router = express_1.default.Router();
router.post("/register", rateLimiter_1.authLimiter, authController_1.register);
router.post("/login", rateLimiter_1.authLimiter, authController_1.login);
exports.default = router;
//# sourceMappingURL=auth.js.map