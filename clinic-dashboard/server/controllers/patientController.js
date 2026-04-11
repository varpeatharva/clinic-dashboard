const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const { sendResponse } = require('../utils/apiResponse');

// @desc  Get all patients (with search and pagination)
// @route GET /api/patients?search=&page=&limit=
// @access Private
const getPatients = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        ...(isNaN(search) ? [] : [{ patient_id: Number(search) }]),
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [patients, total] = await Promise.all([
      Patient.find(query).sort({ patient_id: 1 }).skip(skip).limit(Number(limit)),
      Patient.countDocuments(query),
    ]);

    return sendResponse(res, 200, true, 'Patients fetched.', {
      patients,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// @desc  Get single patient + appointment history
// @route GET /api/patients/:id
// @access Private
const getPatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return sendResponse(res, 404, false, 'Patient not found.');

    if (req.user.role === 'patient' && String(patient._id) !== String(req.user.patient_ref)) {
      return sendResponse(res, 403, false, 'Access denied. You can only view your own profile.');
    }

    const appointments = await Appointment.find({ patient_id: patient._id })
      .sort({ appointment_date: -1 });

    return sendResponse(res, 200, true, 'Patient fetched.', { patient, appointments });
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// @desc  Create new patient
// @route POST /api/patients
// @access Private
const createPatient = async (req, res) => {
  try {
    const { name, age, gender, contact, email } = req.body;
    if (!name) return sendResponse(res, 400, false, 'Patient name is required.');

    // Auto-generate patient_id
    const lastPatient = await Patient.findOne().sort({ patient_id: -1 });
    const patient_id = lastPatient ? lastPatient.patient_id + 1 : 1;

    const patient = await Patient.create({ patient_id, name, age, gender, contact, email });
    return sendResponse(res, 201, true, 'Patient created successfully.', patient);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// @desc  Update patient
// @route PUT /api/patients/:id
// @access Private (Admin only)
const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!patient) return sendResponse(res, 404, false, 'Patient not found.');
    return sendResponse(res, 200, true, 'Patient updated.', patient);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// @desc  Delete patient
// @route DELETE /api/patients/:id
// @access Private (Admin only)
const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) return sendResponse(res, 404, false, 'Patient not found.');

    // Also delete related appointments
    await Appointment.deleteMany({ patient_id: patient._id });

    return sendResponse(res, 200, true, 'Patient and related appointments deleted.');
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

module.exports = { getPatients, getPatient, createPatient, updatePatient, deletePatient };
