const express = require('express');
const router = express.Router();
const {
  getKPIs, getMonthlyVolume, getByDoctor, getByVisitType, getByTimeSlot,
} = require('../controllers/analyticsController');
const { protect, staffOnly } = require('../middleware/authMiddleware');

router.use(protect);
router.use(staffOnly);

router.get('/kpis', getKPIs);
router.get('/monthly', getMonthlyVolume);
router.get('/by-doctor', getByDoctor);
router.get('/by-visit-type', getByVisitType);
router.get('/by-time-slot', getByTimeSlot);

module.exports = router;
