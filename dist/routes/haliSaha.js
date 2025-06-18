"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const haliSahaController_1 = require("../controllers/haliSahaController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const authorizeRoles_1 = require("../middlewares/authorizeRoles");
const router = (0, express_1.Router)();
// Her saha işlemi yetki gerektirsin diye middleware ekleyebilirsin (isteğe bağlı)
router.post("/halisaha/create", authMiddleware_1.authenticateToken, (0, authorizeRoles_1.authorizeRoles)("OWNER", "ADMIN"), haliSahaController_1.createHaliSaha); // Halı saha oluştur
router.get("/halisaha", haliSahaController_1.getAllHaliSahalar); // Tüm halı sahaları getir
router.get("/halisaha/:id", haliSahaController_1.getHaliSahaById); // ID'ye göre getir
router.put("/halisaha/update/:id", authMiddleware_1.authenticateToken, haliSahaController_1.updateHaliSaha); // Güncelle
router.delete("/halisaha/delete/:id", authMiddleware_1.authenticateToken, haliSahaController_1.deleteHaliSaha); // Sil
exports.default = router;
