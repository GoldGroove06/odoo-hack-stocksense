import express from "express";
import cors from 'cors';
import authRoutes from "./router/authRoutes.js";

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true               
}));

app.use(express.json());

app.use("/api/v1/auth", authRoutes);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
