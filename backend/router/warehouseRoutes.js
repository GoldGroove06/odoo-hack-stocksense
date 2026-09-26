import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  listWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse
} from "../controllers/warehouseController.js";

const router = express.Router();

router.use(protect);


// GET /warehouses - List warehouses
// POST /warehouses - Create warehouse
router.route("/")
  .get(listWarehouses)
  .post(createWarehouse);

// GET /warehouses/:id - Get warehouse
// PATCH /warehouses/:id - Update warehouse
// DELETE /warehouses/:id - Delete warehouse
router.route("/:id")
  .get(getWarehouseById)
  .patch(updateWarehouse)
  .delete(deleteWarehouse);

export default router;
