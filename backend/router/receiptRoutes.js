import express from "express";
import {
  getAllReceipts,
  createReceipt,
  getReceiptById,
  updateReceipt,
  deleteReceipt,
  validateReceipt
} from "../controllers/receiptController.js";

const router = express.Router();

router.get("/", getAllReceipts);
router.post("/", createReceipt);
router.get("/:id", getReceiptById);
router.patch("/:id", updateReceipt);
router.delete("/:id", deleteReceipt);
router.post("/:id/validate", validateReceipt);

export default router;
