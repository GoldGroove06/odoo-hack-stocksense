import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  listUoms,
  getUomById,
  createUom,
  updateUom,
  deleteUom
} from "../controllers/uomController.js";

const router = express.Router();

router.use(protect);


// GET /uoms - List units of measure
// POST /uoms - Create unit of measure
router.route("/")
  .get(listUoms)
  .post(createUom);

// GET /uoms/:id - Get unit of measure
// PATCH /uoms/:id - Update unit of measure
// DELETE /uoms/:id - Delete unit of measure
router.route("/:id")
  .get(getUomById)
  .patch(updateUom)
  .delete(deleteUom);

export default router;
