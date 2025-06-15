import { Router } from "express";
import { createHaliSaha, getAllHaliSahalar, getHaliSahaById, updateHaliSaha, deleteHaliSaha } from "../controllers/haliSahaController";
import { authenticateToken } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";

const router = Router();

// Her saha işlemi yetki gerektirsin diye middleware ekleyebilirsin (isteğe bağlı)
router.post("/halisaha/create", authenticateToken,authorizeRoles("OWNER","ADMIN"), createHaliSaha);      // Halı saha oluştur
router.get("/halisaha", getAllHaliSahalar);                       // Tüm halı sahaları getir
router.get("/halisaha/:id", getHaliSahaById);                      // ID'ye göre getir
router.put("/halisaha/update/:id", authenticateToken, updateHaliSaha);    // Güncelle
router.delete("/halisaha/delete/:id", authenticateToken, deleteHaliSaha); // Sil

export default router;
