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

const router = express.Router();

router.get("/", getAllDeliveries);
router.post("/", createDelivery);
router.get("/:id", getDeliveryById);
router.patch("/:id", updateDelivery);
router.delete("/:id", deleteDelivery);
router.post("/:id/pick", pickDelivery);
router.post("/:id/pack", packDelivery);
router.post("/:id/validate", validateDelivery);

export default router;
