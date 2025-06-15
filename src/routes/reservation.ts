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

const router = express.Router();

router.post("/reservation/create", authenticateToken, authorizeRoles("USER", "OWNER", "ADMIN"), createReservation);
router.get("/reservation", authenticateToken, authorizeRoles("ADMIN", "OWNER"), getAllReservations);
router.get("/reservation/:id", authenticateToken, authorizeRoles("USER", "OWNER", "ADMIN"), getReservationById);
router.put("/reservation/update/:id", authenticateToken, authorizeRoles("OWNER", "ADMIN"), updateReservation);
router.delete("/reservation/delete/:id", authenticateToken, authorizeRoles("ADMIN"), deleteReservation);

export default router;
