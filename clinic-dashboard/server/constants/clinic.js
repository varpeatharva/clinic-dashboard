/**
 * Clinic domain constants — single source of truth for all enumerated values.
 * Import these into Mongoose models and controllers to avoid duplication.
 */

const DOCTORS = ['Dr Shah', 'Dr Lewis', 'Dr Ahmed'];

const TIME_SLOTS = [
  '09:00',
  '09:30',
  '10:00',
  '11:00',
  '12:00',
  '14:00',
  '15:30',
  '16:00',
];

const VISIT_TYPES = ['Check-up', 'Vaccination', 'Follow-up', 'Consultation'];

const STATUSES = ['Scheduled', 'Completed', 'Cancelled', 'No Show'];

const PEAK_SLOTS = ['11:00', '14:00', '10:00'];

module.exports = { DOCTORS, TIME_SLOTS, VISIT_TYPES, STATUSES, PEAK_SLOTS };
