import express from "express";
import {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from "../controllers/productController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();
const managers = authorize("OWNER", "INVENTORY_MANAGER");

router.use(protect);

router.route("/")
  .get(listProducts)
  .post(managers, createProduct);

router.route("/:id")
  .get(getProductById)
  .patch(managers, updateProduct)
  .delete(managers, deleteProduct);

export default router;
