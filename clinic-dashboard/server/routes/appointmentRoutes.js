const express = require('express');
const router = express.Router();
const {
  getAppointments, getAppointment, createAppointment, updateAppointment, deleteAppointment,
} = require('../controllers/appointmentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAppointments);
router.get('/:id', getAppointment);
router.post('/', createAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

module.exports = router;
