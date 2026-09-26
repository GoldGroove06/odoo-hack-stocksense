import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRouter from "./router/index.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "StockSense ERP API"
  });
});

// Mount modular API routes under /api/v1
app.use("/api/v1", apiRouter);

// Also mount directly under root for convenient direct route access
app.use("/api", apiRouter);
app.use("/", apiRouter);

// 404 Handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.method} ${req.originalUrl} not found`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Application Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 StockSense Backend Server running on http://localhost:${PORT}`);
  console.log(`📦 Master Data Endpoints:`);
  console.log(`   - Products:   /products & /api/v1/products`);
  console.log(`   - Categories: /categories & /api/v1/categories`);
  console.log(`   - UOMs:       /uoms & /api/v1/uoms`);
  console.log(`   - Warehouses: /warehouses & /api/v1/warehouses`);
  console.log(`   - Locations:  /locations & /api/v1/locations`);
});

export default app;
