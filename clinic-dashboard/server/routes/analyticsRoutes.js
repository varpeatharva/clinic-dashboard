import express from "express";

import {
  getKPIs,
  getMonthlyVolume,
  getByDoctor,
  getByVisitType,
  getByTimeSlot,
} from "../controllers/analyticsController.js";

import { protect, staffOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(staffOnly);

router.get("/kpis", getKPIs);
router.get("/monthly", getMonthlyVolume);
router.get("/by-doctor", getByDoctor);
router.get("/by-visit-type", getByVisitType);
router.get("/by-time-slot", getByTimeSlot);

export default router;   // ✅ IMPORTANT