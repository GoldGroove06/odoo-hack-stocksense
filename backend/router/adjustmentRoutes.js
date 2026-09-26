import express from "express";
import {
  getAllAdjustments,
  createAdjustment,
  getAdjustmentById,
  updateAdjustment,
  deleteAdjustment,
  validateAdjustment
} from "../controllers/adjustmentController.js";

const router = express.Router();

router.get("/", getAllAdjustments);
router.post("/", createAdjustment);
router.get("/:id", getAdjustmentById);
router.patch("/:id", updateAdjustment);
router.delete("/:id", deleteAdjustment);
router.post("/:id/validate", validateAdjustment);

export default router;
