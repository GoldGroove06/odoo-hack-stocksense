import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  getAllSuppliers,
  createSupplier,
  deleteSupplier
} from "../controllers/supplierController.js";

const router = express.Router();

router.use(protect);


router.get("/", getAllSuppliers);
router.post("/", createSupplier);
router.delete("/:id", deleteSupplier);

export default router;
