const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    patient_id: { type: Number, required: true, unique: true },
    name: { type: String, required: [true, 'Patient name is required'], trim: true },
    age: { type: Number, min: 0, max: 150 },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    contact: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
  },
  { timestamps: true }
);

patientSchema.index({ name: 'text' });
patientSchema.index({ patient_id: 1 }, { unique: true });

module.exports = mongoose.model('Patient', patientSchema);
