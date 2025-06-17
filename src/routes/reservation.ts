import express from "express";
import {
  createReservation,
  getAllReservations,
  getReservationById,
  updateReservation,
  deleteReservation,
} from "../controllers/reservationController";
import { authenticateToken } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";
import { reservationLimiter } from "../middlewares/rateLimiter";

const router = express.Router();

router.post("/reservation/create", authenticateToken, authorizeRoles("USER", "OWNER", "ADMIN"),reservationLimiter, createReservation);
router.get("/reservation", authenticateToken, authorizeRoles("ADMIN", "OWNER","USER"),getAllReservations);
router.get("/reservation/:id", authenticateToken, authorizeRoles("USER", "OWNER", "ADMIN"), getReservationById);
router.put("/reservation/update/:id", authenticateToken, authorizeRoles("OWNER", "ADMIN","USER"),reservationLimiter,updateReservation);
router.delete("/reservation/delete/:id", authenticateToken, authorizeRoles("ADMIN"), deleteReservation);

export default router;
