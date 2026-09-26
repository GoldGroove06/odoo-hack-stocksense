import express from "express";
import {
  getAllDeliveries,
  createDelivery,
  getDeliveryById,
  updateDelivery,
  deleteDelivery,
  pickDelivery,
  packDelivery,
  validateDelivery
} from "../controllers/deliveryController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();
const managers = authorize("OWNER", "INVENTORY_MANAGER");

router.use(protect);

router.get("/", getAllDeliveries);
router.get("/:id", getDeliveryById);
router.post("/", managers, createDelivery);
router.patch("/:id", managers, updateDelivery);
router.delete("/:id", managers, deleteDelivery);
router.post("/:id/pick", managers, pickDelivery);
router.post("/:id/pack", managers, packDelivery);
router.post("/:id/validate", managers, validateDelivery);

export default router;
