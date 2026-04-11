const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const { sendResponse } = require('../utils/apiResponse');

// Build filter query from request params
const buildFilterQuery = (query) => {
  const { doctor, status, visit_type, startDate, endDate } = query;
  const filter = {};

  if (doctor && doctor !== 'All') filter.doctor = doctor;
  if (status && status !== 'All') filter.status = status;
  if (visit_type && visit_type !== 'All') filter.visit_type = visit_type;

  if (startDate || endDate) {
    filter.appointment_date = {};
    if (startDate) filter.appointment_date.$gte = new Date(`${startDate}T00:00:00.000Z`);
    if (endDate) filter.appointment_date.$lte = new Date(`${endDate}T23:59:59.999Z`);
  }

  return filter;
};

// @desc  Get all appointments with filters, sort, pagination
// @route GET /api/appointments
// @access Private
const getAppointments = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'appointment_date', sortOrder = 'desc' } = req.query;
    const filter = buildFilterQuery(req.query);

    let populateFields = 'name patient_id';

    if (req.user.role === 'patient') {
      if (req.query.scope === 'mine') {
        filter.patient_id = req.user.patient_ref;
      } else {
        // Force viewing to today only for general clinic schedules
        const todayStr = req.query.localToday || new Date().toISOString().split('T')[0];
        filter.appointment_date = {
          $gte: new Date(`${todayStr}T00:00:00.000Z`),
          $lte: new Date(`${todayStr}T23:59:59.999Z`),
        };
        // Security: Don't send other patients' names to a patient user
        populateFields = 'patient_id'; 
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate('patient_id', populateFields)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Appointment.countDocuments(filter),
    ]);

    return sendResponse(res, 200, true, 'Appointments fetched.', {
      appointments,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// @desc  Get single appointment
// @route GET /api/appointments/:id
// @access Private
const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('patient_id');
    if (!appointment) return sendResponse(res, 404, false, 'Appointment not found.');
    return sendResponse(res, 200, true, 'Appointment fetched.', appointment);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// @desc  Create appointment (with double-booking check)
// @route POST /api/appointments
// @access Private
const createAppointment = async (req, res) => {
  try {
    const { doctor, appointment_date, appointment_time, visit_type, status } = req.body;
    let { patient_id } = req.body;

    // Patients can only book for themselves
    if (req.user.role === 'patient') {
      patient_id = req.user.patient_ref;
    }

    if (!patient_id || !doctor || !appointment_date || !appointment_time || !visit_type) {
      return sendResponse(res, 400, false, 'All fields are required.');
    }

    // Check double-booking
    const dateOnly = new Date(appointment_date);
    dateOnly.setHours(0, 0, 0, 0);
    const nextDay = new Date(dateOnly);
    nextDay.setDate(nextDay.getDate() + 1);

    const conflict = await Appointment.findOne({
      doctor,
      appointment_date: { $gte: dateOnly, $lt: nextDay },
      appointment_time,
    });

    if (conflict) {
      return sendResponse(
        res, 409, false,
        `${doctor} already has an appointment at ${appointment_time} on this date.`
      );
    }

    // Auto-generate appointment_id
    const lastAppt = await Appointment.findOne().sort({ appointment_id: -1 });
    const appointment_id = lastAppt ? lastAppt.appointment_id + 1 : 1;

    // Verify patient exists
    const patient = await Patient.findById(patient_id);
    if (!patient) return sendResponse(res, 404, false, 'Patient not found.');

    const appointment = await Appointment.create({
      appointment_id,
      patient_id,
      doctor,
      appointment_date: new Date(appointment_date),
      appointment_time,
      visit_type,
      status: status || 'Scheduled',
    });

    const populated = await appointment.populate('patient_id', 'name patient_id');
    return sendResponse(res, 201, true, 'Appointment booked successfully.', populated);
  } catch (error) {
    if (error.code === 11000) {
      return sendResponse(res, 409, false, 'This time slot is already booked for this doctor.');
    }
    return sendResponse(res, 500, false, error.message);
  }
};

// @desc  Update appointment (reschedule, status change)
// @route PUT /api/appointments/:id
// @access Private
const updateAppointment = async (req, res) => {
  try {
    const { doctor, appointment_date, appointment_time } = req.body;

    const existingObj = await Appointment.findById(req.params.id);
    if (!existingObj) return sendResponse(res, 404, false, 'Appointment not found.');

    if (req.user.role === 'patient' && String(existingObj.patient_id) !== String(req.user.patient_ref)) {
      return sendResponse(res, 403, false, 'You can only update your own appointments.');
    }

    // If rescheduling, check for conflicts
    if (doctor && appointment_date && appointment_time) {
      const dateOnly = new Date(appointment_date);
      dateOnly.setHours(0, 0, 0, 0);
      const nextDay = new Date(dateOnly);
      nextDay.setDate(nextDay.getDate() + 1);

      const conflict = await Appointment.findOne({
        _id: { $ne: req.params.id },
        doctor,
        appointment_date: { $gte: dateOnly, $lt: nextDay },
        appointment_time,
      });

      if (conflict) {
        return sendResponse(
          res, 409, false,
          `${doctor} already has an appointment at ${appointment_time} on this date.`
        );
      }
    }

    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('patient_id', 'name patient_id');

    if (!appointment) return sendResponse(res, 404, false, 'Appointment not found.');
    return sendResponse(res, 200, true, 'Appointment updated.', appointment);
  } catch (error) {
    if (error.code === 11000) {
      return sendResponse(res, 409, false, 'This time slot is already booked for this doctor.');
    }
    return sendResponse(res, 500, false, error.message);
  }
};

// @desc  Delete appointment
// @route DELETE /api/appointments/:id
// @access Private (Admin only)
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return sendResponse(res, 404, false, 'Appointment not found.');

    if (req.user.role === 'patient' && String(appointment.patient_id) !== String(req.user.patient_ref)) {
      return sendResponse(res, 403, false, 'You can only delete your own appointments.');
    }

    await Appointment.findByIdAndDelete(req.params.id);
    return sendResponse(res, 200, true, 'Appointment deleted.');
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

module.exports = {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};
