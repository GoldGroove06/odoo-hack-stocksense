import express from "express";
import {
  getAllSuppliers,
  createSupplier,
  deleteSupplier
} from "../controllers/supplierController.js";

const router = express.Router();

router.get("/", getAllSuppliers);
router.post("/", createSupplier);
router.delete("/:id", deleteSupplier);

export default router;
