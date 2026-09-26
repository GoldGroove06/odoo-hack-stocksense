import express from "express";
import {
  listLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation
} from "../controllers/locationController.js";

const router = express.Router();

// GET /locations - List locations
// POST /locations - Create location
router.route("/")
  .get(listLocations)
  .post(createLocation);

// GET /locations/:id - Get location
// PATCH /locations/:id - Update location
// DELETE /locations/:id - Delete location
router.route("/:id")
  .get(getLocationById)
  .patch(updateLocation)
  .delete(deleteLocation);

export default router;
