import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import { getDashboardStats } from "../controllers/dashboardController.js";

const router = express.Router();

router.use(protect);


router.get("/stats", getDashboardStats);

export default router;
