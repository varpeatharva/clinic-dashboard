import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { sendResponse } from "./utils/apiResponse.js";

// Connect DB
connectDB();

const app = express();

// Security
app.use(helmet());

// ✅ CORS (frontend URL)
app.use(
  cors({
    origin: "https://healix-erdos.vercel.app",
    credentials: true,
  })
);

// Body parser
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// Cookies
app.use(cookieParser());

// Sanitize
app.use((req, _res, next) => {
  const sanitize = (obj) => {
    if (obj && typeof obj === "object") {
      for (const key of Object.keys(obj)) {
        if (key.startsWith("$") || key.includes(".")) {
          delete obj[key];
        } else {
          sanitize(obj[key]);
        }
      }
    }
  };
  sanitize(req.body);
  sanitize(req.params);
  next();
});

// Logger
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/users", userRoutes);

// Health check
app.get("/api/health", (req, res) => {
  sendResponse(res, 200, true, "API running", {
    env: process.env.NODE_ENV,
  });
});

// 404
app.use((req, res) => {
  sendResponse(res, 404, false, `Route ${req.originalUrl} not found`);
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  sendResponse(res, 500, false, err.message);
});

// ✅ PORT (IMPORTANT FOR RENDER)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});