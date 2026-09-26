import express from "express";
import authRoutes from "./authRoutes.js";
import productRoutes from "./productRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import uomRoutes from "./uomRoutes.js";
import warehouseRoutes from "./warehouseRoutes.js";
import locationRoutes from "./locationRoutes.js";
import receiptRoutes from "./receiptRoutes.js";
import deliveryRoutes from "./deliveryRoutes.js";
import transferRoutes from "./transferRoutes.js";
import adjustmentRoutes from "./adjustmentRoutes.js";
import movementRoutes from "./movementRoutes.js";
import supplierRoutes from "./supplierRoutes.js";
import customerRoutes from "./customerRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";

const router = express.Router();

// 1. Authentication
router.use("/auth", authRoutes);

// 2. Product & Master Data
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/uoms", uomRoutes);
router.use("/warehouses", warehouseRoutes);
router.use("/locations", locationRoutes);
router.use("/suppliers", supplierRoutes);
router.use("/customers", customerRoutes);

// 3. Inventory Operations
router.use("/receipts", receiptRoutes);
router.use("/deliveries", deliveryRoutes);
router.use("/transfers", transferRoutes);
router.use("/adjustments", adjustmentRoutes);
router.use("/movements", movementRoutes);

// 4. Dashboard Stats
router.use("/dashboard", dashboardRoutes);

export default router;
