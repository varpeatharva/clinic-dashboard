const mongoose = require('mongoose');
const { DOCTORS, TIME_SLOTS, VISIT_TYPES, STATUSES } = require('../constants/clinic');

const appointmentSchema = new mongoose.Schema(
  {
    appointment_id: { type: Number, required: true, unique: true },
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: {
      type: String,
      enum: DOCTORS,
      required: [true, 'Doctor is required'],
    },
    appointment_date: { type: Date, required: [true, 'Appointment date is required'] },
    appointment_time: {
      type: String,
      enum: TIME_SLOTS,
      required: [true, 'Appointment time is required'],
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'Scheduled',
    },
    visit_type: {
      type: String,
      enum: VISIT_TYPES,
      required: [true, 'Visit type is required'],
    },
  },
  { timestamps: true }
);

appointmentSchema.index({ patient_id: 1 });
appointmentSchema.index({ appointment_date: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ doctor: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
