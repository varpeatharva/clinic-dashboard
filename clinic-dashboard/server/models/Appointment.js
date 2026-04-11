const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    appointment_id: { type: Number, required: true, unique: true },
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: {
      type: String,
      enum: ['Dr Shah', 'Dr Lewis', 'Dr Ahmed'],
      required: [true, 'Doctor is required'],
    },
    appointment_date: { type: Date, required: [true, 'Appointment date is required'] },
    appointment_time: {
      type: String,
      enum: ['09:00', '09:30', '10:00', '11:00', '12:00', '14:00', '15:30', '16:00'],
      required: [true, 'Appointment time is required'],
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled', 'No Show'],
      default: 'Scheduled',
    },
    visit_type: {
      type: String,
      enum: ['Check-up', 'Vaccination', 'Follow-up', 'Consultation'],
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
