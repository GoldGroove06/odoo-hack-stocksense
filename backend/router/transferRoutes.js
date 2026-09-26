import express from "express";
import {
  getAllTransfers,
  createTransfer,
  getTransferById,
  updateTransfer,
  deleteTransfer,
  validateTransfer,
  pickTransfer,
  dropTransfer
} from "../controllers/transferController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();
const managers = authorize("OWNER", "INVENTORY_MANAGER");
const staffOrManagers = authorize("OWNER", "INVENTORY_MANAGER", "WAREHOUSE_STAFF");

router.use(protect);

router.get("/", staffOrManagers, getAllTransfers);
router.get("/:id", staffOrManagers, getTransferById);
router.post("/", managers, createTransfer);
router.patch("/:id", managers, updateTransfer);
router.delete("/:id", managers, deleteTransfer);
router.post("/:id/pick", staffOrManagers, pickTransfer);
router.post("/:id/drop", staffOrManagers, dropTransfer);
router.post("/:id/validate", managers, validateTransfer);

export default router;
