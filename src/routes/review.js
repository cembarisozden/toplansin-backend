"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reviewController_1 = require("../controllers/reviewController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const authorizeRoles_1 = require("../middlewares/authorizeRoles");
const router = express_1.default.Router();
router.post("/review/create", authMiddleware_1.authenticateToken, (0, authorizeRoles_1.authorizeRoles)("USER", "ADMIN"), reviewController_1.createReview);
router.get("/review", reviewController_1.getAllReviews);
router.get("/review/:id", reviewController_1.getReviewById);
router.put("/review/update/:id", authMiddleware_1.authenticateToken, (0, authorizeRoles_1.authorizeRoles)("USER", "ADMIN"), reviewController_1.updateReview);
router.delete("/review/delete/:id", authMiddleware_1.authenticateToken, (0, authorizeRoles_1.authorizeRoles)("USER", "ADMIN"), reviewController_1.deleteReview);
exports.default = router;
