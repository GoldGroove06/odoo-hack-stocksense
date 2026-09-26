import express from "express";
import {
  getAllAdjustments,
  createAdjustment,
  getAdjustmentById,
  updateAdjustment,
  deleteAdjustment,
  validateAdjustment
} from "../controllers/adjustmentController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();
const staffOrManagers = authorize("OWNER", "INVENTORY_MANAGER", "WAREHOUSE_STAFF");
const managers = authorize("OWNER", "INVENTORY_MANAGER");

router.use(protect);

router.get("/", staffOrManagers, getAllAdjustments);
router.get("/:id", staffOrManagers, getAdjustmentById);
router.post("/", staffOrManagers, createAdjustment);
router.patch("/:id", staffOrManagers, updateAdjustment);
router.delete("/:id", managers, deleteAdjustment);
router.post("/:id/validate", managers, validateAdjustment);

export default router;
