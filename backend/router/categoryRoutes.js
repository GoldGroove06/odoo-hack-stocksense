import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from "../controllers/categoryController.js";

const router = express.Router();

router.use(protect);


// GET /categories - List categories
// POST /categories - Create category
router.route("/")
  .get(listCategories)
  .post(createCategory);

// GET /categories/:id - Get category
// PATCH /categories/:id - Update category
// DELETE /categories/:id - Delete category
router.route("/:id")
  .get(getCategoryById)
  .patch(updateCategory)
  .delete(deleteCategory);

export default router;
