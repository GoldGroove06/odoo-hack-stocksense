import express from "express";
import {
  createCompany,
  getMyCompany,
  inviteMember,
  updateMember,
  removeMember,
} from "../controllers/companyController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createCompany);
router.get("/me", getMyCompany);
router.post("/members", authorize("OWNER"), inviteMember);
router.patch("/members/:userId", authorize("OWNER"), updateMember);
router.delete("/members/:userId", authorize("OWNER"), removeMember);

export default router;
