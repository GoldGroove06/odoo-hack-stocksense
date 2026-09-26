import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./router/authRoutes.js";
import companyRoutes from "./router/companyRoutes.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/company", companyRoutes);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
