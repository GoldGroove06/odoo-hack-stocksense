import express from "express";
import {
  getAllMovements,
  createMovement
} from "../controllers/movementController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getAllMovements);
// Prefer creating transfers; keep createMovement as manager-only ledger note
router.post("/", authorize("OWNER", "INVENTORY_MANAGER"), createMovement);

export default router;
