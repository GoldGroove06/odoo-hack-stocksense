import express from "express";
import {
  getAllTransfers,
  createTransfer,
  getTransferById,
  updateTransfer,
  deleteTransfer,
  validateTransfer
} from "../controllers/transferController.js";

const router = express.Router();

router.get("/", getAllTransfers);
router.post("/", createTransfer);
router.get("/:id", getTransferById);
router.patch("/:id", updateTransfer);
router.delete("/:id", deleteTransfer);
router.post("/:id/validate", validateTransfer);

export default router;
