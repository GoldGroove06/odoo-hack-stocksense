import express from "express";
import {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from "../controllers/productController.js";

const router = express.Router();

// GET /products - List & search products
// POST /products - Create product
router.route("/")
  .get(listProducts)
  .post(createProduct);

// GET /products/:id - Get product details
// PATCH /products/:id - Update product
// DELETE /products/:id - Delete product
router.route("/:id")
  .get(getProductById)
  .patch(updateProduct)
  .delete(deleteProduct);

export default router;
