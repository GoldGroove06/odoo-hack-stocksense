import express from "express";
import authRoutes from "./authRoutes.js";
import productRoutes from "./productRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import uomRoutes from "./uomRoutes.js";
import warehouseRoutes from "./warehouseRoutes.js";
import locationRoutes from "./locationRoutes.js";

const router = express.Router();

// 1. Authentication
router.use("/auth", authRoutes);

// 2. Product & Master Data (as requested in specifications)
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/uoms", uomRoutes);
router.use("/warehouses", warehouseRoutes);
router.use("/locations", locationRoutes);

export default router;
