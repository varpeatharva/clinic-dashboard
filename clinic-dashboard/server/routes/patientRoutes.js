const express = require('express');
const router = express.Router();
const {
  getPatients, getPatient, createPatient, updatePatient, deletePatient,
} = require('../controllers/patientController');
const { protect, adminOnly, staffOnly } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', staffOnly, getPatients);
router.get('/:id', getPatient); // Patients can view their own, logic is in controller
router.post('/', staffOnly, createPatient);
router.put('/:id', adminOnly, updatePatient);
router.delete('/:id', adminOnly, deletePatient);

module.exports = router;
