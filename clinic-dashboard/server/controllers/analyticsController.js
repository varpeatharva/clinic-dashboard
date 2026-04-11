const Appointment = require('../models/Appointment');
const { sendResponse } = require('../utils/apiResponse');

// Build a shared filter from query params
const buildFilter = (query) => {
  const { doctor, status, visit_type, startDate, endDate } = query;
  const filter = {};
  if (doctor && doctor !== 'All') filter.doctor = doctor;
  if (status && status !== 'All') filter.status = status;
  if (visit_type && visit_type !== 'All') filter.visit_type = visit_type;
  if (startDate || endDate) {
    filter.appointment_date = {};
    if (startDate) filter.appointment_date.$gte = new Date(startDate);
    if (endDate) filter.appointment_date.$lte = new Date(endDate);
  }
  return filter;
};

// @desc  Get all 5 KPIs
// @route GET /api/analytics/kpis
// @access Private
const getKPIs = async (req, res) => {
  try {
    const filter = buildFilter(req.query);

    const [totalResult, statusResult, peakResult] = await Promise.all([
      // Total appointments + unique patients
      Appointment.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalAppointments: { $sum: 1 },
            uniquePatients: { $addToSet: '$patient_id' },
            noShow: { $sum: { $cond: [{ $eq: ['$status', 'No Show'] }, 1, 0] } },
            cancelled: { $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] } },
          },
        },
        {
          $project: {
            totalAppointments: 1,
            uniquePatients: { $size: '$uniquePatients' },
            noShow: 1,
            cancelled: 1,
          },
        },
      ]),
      // Status breakdown
      Appointment.aggregate([
        { $match: filter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      // Peak hour
      Appointment.aggregate([
        { $match: filter },
        { $group: { _id: '$appointment_time', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]),
    ]);

    const stats = totalResult[0] || {
      totalAppointments: 0,
      uniquePatients: 0,
      noShow: 0,
      cancelled: 0,
    };

    const total = stats.totalAppointments;
    const noShowRate = total > 0 ? ((stats.noShow / total) * 100).toFixed(1) : '0.0';
    const nonCompletionRate =
      total > 0 ? (((stats.noShow + stats.cancelled) / total) * 100).toFixed(1) : '0.0';
    const peakHour = peakResult[0]?._id || 'N/A';
    const peakHourCount = peakResult[0]?.count || 0;

    // Status breakdown map
    const statusMap = {};
    statusResult.forEach((s) => (statusMap[s._id] = s.count));

    return sendResponse(res, 200, true, 'KPIs fetched.', {
      totalPatients: stats.uniquePatients,
      totalAppointments: total,
      noShowRate: parseFloat(noShowRate),
      nonCompletionRate: parseFloat(nonCompletionRate),
      peakHour,
      peakHourCount,
      statusBreakdown: {
        Completed: statusMap['Completed'] || 0,
        Scheduled: statusMap['Scheduled'] || 0,
        Cancelled: statusMap['Cancelled'] || 0,
        'No Show': statusMap['No Show'] || 0,
      },
    });
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// @desc  Monthly appointment volume
// @route GET /api/analytics/monthly
// @access Private
const getMonthlyVolume = async (req, res) => {
  try {
    const filter = buildFilter(req.query);

    const data = await Appointment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { year: { $year: '$appointment_date' }, month: { $month: '$appointment_date' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const result = months.map((name, i) => {
      const found = data.find((d) => d._id.month === i + 1);
      return { month: name, count: found ? found.count : 0 };
    });

    return sendResponse(res, 200, true, 'Monthly volume fetched.', result);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// @desc  Appointments by doctor
// @route GET /api/analytics/by-doctor
// @access Private
const getByDoctor = async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    const data = await Appointment.aggregate([
      { $match: filter },
      { $group: { _id: '$doctor', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const result = data.map((d) => ({ doctor: d._id, count: d.count }));
    return sendResponse(res, 200, true, 'Doctor workload fetched.', result);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// @desc  Appointments by visit type
// @route GET /api/analytics/by-visit-type
// @access Private
const getByVisitType = async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    const data = await Appointment.aggregate([
      { $match: filter },
      { $group: { _id: '$visit_type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const result = data.map((d) => ({ visitType: d._id, count: d.count }));
    return sendResponse(res, 200, true, 'Visit type data fetched.', result);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// @desc  Appointments by time slot
// @route GET /api/analytics/by-time-slot
// @access Private
const getByTimeSlot = async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    const ALL_SLOTS = ['09:00','09:30','10:00','11:00','12:00','14:00','15:30','16:00'];

    const data = await Appointment.aggregate([
      { $match: filter },
      { $group: { _id: '$appointment_time', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    data.forEach((d) => (countMap[d._id] = d.count));

    const result = ALL_SLOTS.map((slot) => ({
      time: slot,
      count: countMap[slot] || 0,
      isPeak: ['11:00', '14:00', '10:00'].includes(slot),
    }));

    return sendResponse(res, 200, true, 'Time slot data fetched.', result);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

module.exports = { getKPIs, getMonthlyVolume, getByDoctor, getByVisitType, getByTimeSlot };
