import express from "express";
import {
  getAllMovements,
  createMovement
} from "../controllers/movementController.js";

const router = express.Router();

router.get("/", getAllMovements);
router.post("/", createMovement);

export default router;
