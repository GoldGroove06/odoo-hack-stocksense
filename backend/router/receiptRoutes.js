import express from "express";
import {
  getAllReceipts,
  createReceipt,
  getReceiptById,
  updateReceipt,
  deleteReceipt,
  validateReceipt
} from "../controllers/receiptController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();
const managers = authorize("OWNER", "INVENTORY_MANAGER");

router.use(protect);

router.get("/", getAllReceipts);
router.get("/:id", getReceiptById);
router.post("/", managers, createReceipt);
router.patch("/:id", managers, updateReceipt);
router.delete("/:id", managers, deleteReceipt);
router.post("/:id/validate", managers, validateReceipt);

export default router;
