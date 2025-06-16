import express from "express";
import {
  createReview,
  getAllReviews,
  getReviewById,
  deleteReview,
  updateReview,
} from "../controllers/reviewController";
import { authenticateToken } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";

const router = express.Router();

router.post("/review/create", authenticateToken, authorizeRoles("USER", "OWNER", "ADMIN"), createReview);
router.get("/review", authenticateToken, authorizeRoles("ADMIN", "OWNER","USER"), getAllReviews);
router.get("/review/:id", authenticateToken, authorizeRoles("USER", "OWNER", "ADMIN"), getReviewById);
router.put("/review/update/:id", authenticateToken, authorizeRoles("USER", "ADMIN","OWNER"), updateReview);
router.delete("/review/delete/:id", authenticateToken, authorizeRoles("USER","OWNER","ADMIN"), deleteReview);

export default router;
