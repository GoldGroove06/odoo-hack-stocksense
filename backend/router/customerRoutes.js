import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  getAllCustomers,
  createCustomer,
  deleteCustomer
} from "../controllers/customerController.js";

const router = express.Router();

router.use(protect);


router.get("/", getAllCustomers);
router.post("/", createCustomer);
router.delete("/:id", deleteCustomer);

export default router;
