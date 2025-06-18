"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reservationController_1 = require("../controllers/reservationController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const authorizeRoles_1 = require("../middlewares/authorizeRoles");
const rateLimiter_1 = require("../middlewares/rateLimiter");
const router = express_1.default.Router();
router.post("/reservation/create", authMiddleware_1.authenticateToken, (0, authorizeRoles_1.authorizeRoles)("USER", "OWNER", "ADMIN"), rateLimiter_1.reservationLimiter, reservationController_1.createReservation);
router.get("/reservation", authMiddleware_1.authenticateToken, (0, authorizeRoles_1.authorizeRoles)("ADMIN", "OWNER", "USER"), reservationController_1.getAllReservations);
router.get("/reservation/:id", authMiddleware_1.authenticateToken, (0, authorizeRoles_1.authorizeRoles)("USER", "OWNER", "ADMIN"), reservationController_1.getReservationById);
router.put("/reservation/update/:id", authMiddleware_1.authenticateToken, (0, authorizeRoles_1.authorizeRoles)("OWNER", "ADMIN", "USER"), rateLimiter_1.reservationLimiter, reservationController_1.updateReservation);
router.delete("/reservation/delete/:id", authMiddleware_1.authenticateToken, (0, authorizeRoles_1.authorizeRoles)("ADMIN"), reservationController_1.deleteReservation);
exports.default = router;
//# sourceMappingURL=reservation.js.map