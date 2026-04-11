require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ─── Models ───────────────────────────────────────────────────────────────────
const User = require('../models/User');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');

// ─── Raw CSV data (all 180 records exactly as dataset) ─────────────────────────
const RAW_APPOINTMENTS = [
  { appointment_id: 1,  patient_id: 2,  patient_name: 'Aisha',   doctor: 'Dr Shah',  appointment_date: '2025-05-17', appointment_time: '10:00', status: 'Scheduled',  visit_type: 'Check-up' },
  { appointment_id: 2,  patient_id: 2,  patient_name: 'Aisha',   doctor: 'Dr Lewis', appointment_date: '2025-08-23', appointment_time: '09:30', status: 'Scheduled',  visit_type: 'Check-up' },
  { appointment_id: 3,  patient_id: 18, patient_name: 'Quinn',   doctor: 'Dr Ahmed', appointment_date: '2025-09-17', appointment_time: '09:30', status: 'Completed',  visit_type: 'Check-up' },
  { appointment_id: 4,  patient_id: 7,  patient_name: 'Faisal',  doctor: 'Dr Lewis', appointment_date: '2025-03-22', appointment_time: '12:00', status: 'Cancelled',  visit_type: 'Vaccination' },
  { appointment_id: 5,  patient_id: 4,  patient_name: 'Clara',   doctor: 'Dr Ahmed', appointment_date: '2025-11-28', appointment_time: '14:00', status: 'Completed',  visit_type: 'Follow-up' },
  { appointment_id: 6,  patient_id: 4,  patient_name: 'Clara',   doctor: 'Dr Ahmed', appointment_date: '2025-08-13', appointment_time: '15:30', status: 'Cancelled',  visit_type: 'Check-up' },
  { appointment_id: 7,  patient_id: 8,  patient_name: 'Georgia', doctor: 'Dr Lewis', appointment_date: '2025-06-24', appointment_time: '12:00', status: 'Completed',  visit_type: 'Check-up' },
  { appointment_id: 8,  patient_id: 9,  patient_name: 'Hamza',   doctor: 'Dr Lewis', appointment_date: '2025-08-01', appointment_time: '14:00', status: 'No Show',    visit_type: 'Follow-up' },
  { appointment_id: 9,  patient_id: 5,  patient_name: 'Deepak',  doctor: 'Dr Shah',  appointment_date: '2025-08-04', appointment_time: '11:00', status: 'Completed',  visit_type: 'Vaccination' },
  { appointment_id: 10, patient_id: 14, patient_name: 'Mason',   doctor: 'Dr Lewis', appointment_date: '2025-08-23', appointment_time: '14:00', status: 'Scheduled',  visit_type: 'Vaccination' },
  { appointment_id: 11, patient_id: 5,  patient_name: 'Deepak',  doctor: 'Dr Ahmed', appointment_date: '2025-09-22', appointment_time: '09:30', status: 'Completed',  visit_type: 'Consultation' },
  { appointment_id: 12, patient_id: 13, patient_name: 'Lina',    doctor: 'Dr Ahmed', appointment_date: '2025-08-11', appointment_time: '09:00', status: 'Completed',  visit_type: 'Check-up' },
  { appointment_id: 13, patient_id: 5,  patient_name: 'Deepak',  doctor: 'Dr Shah',  appointment_date: '2025-01-30', appointment_time: '12:00', status: 'Completed',  visit_type: 'Consultation' },
  { appointment_id: 14, patient_id: 11, patient_name: 'Jasmin',  doctor: 'Dr Lewis', appointment_date: '2025-01-05', appointment_time: '12:00', status: 'Scheduled',  visit_type: 'Follow-up' },
  { appointment_id: 15, patient_id: 13, patient_name: 'Lina',    doctor: 'Dr Lewis', appointment_date: '2025-11-26', appointment_time: '11:00', status: 'Scheduled',  visit_type: 'Vaccination' },
  { appointment_id: 16, patient_id: 12, patient_name: 'Karan',   doctor: 'Dr Shah',  appointment_date: '2025-07-27', appointment_time: '11:00', status: 'Scheduled',  visit_type: 'Check-up' },
  { appointment_id: 17, patient_id: 2,  patient_name: 'Aisha',   doctor: 'Dr Shah',  appointment_date: '2025-06-21', appointment_time: '15:30', status: 'Cancelled',  visit_type: 'Follow-up' },
  { appointment_id: 18, patient_id: 17, patient_name: 'Pooja',   doctor: 'Dr Shah',  appointment_date: '2025-05-26', appointment_time: '11:00', status: 'Completed',  visit_type: 'Consultation' },
  { appointment_id: 19, patient_id: 17, patient_name: 'Pooja',   doctor: 'Dr Lewis', appointment_date: '2025-11-22', appointment_time: '10:00', status: 'Completed',  visit_type: 'Consultation' },
  { appointment_id: 20, patient_id: 8,  patient_name: 'Georgia', doctor: 'Dr Lewis', appointment_date: '2025-08-05', appointment_time: '09:30', status: 'Cancelled',  visit_type: 'Consultation' },
  { appointment_id: 21, patient_id: 9,  patient_name: 'Hamza',   doctor: 'Dr Shah',  appointment_date: '2025-09-17', appointment_time: '14:00', status: 'Completed',  visit_type: 'Check-up' },
  { appointment_id: 22, patient_id: 15, patient_name: 'Nadia',   doctor: 'Dr Lewis', appointment_date: '2025-10-21', appointment_time: '09:00', status: 'Completed',  visit_type: 'Follow-up' },
  { appointment_id: 23, patient_id: 19, patient_name: 'Riya',    doctor: 'Dr Shah',  appointment_date: '2025-11-18', appointment_time: '11:00', status: 'Completed',  visit_type: 'Consultation' },
  { appointment_id: 24, patient_id: 19, patient_name: 'Riya',    doctor: 'Dr Shah',  appointment_date: '2025-03-13', appointment_time: '15:30', status: 'Completed',  visit_type: 'Follow-up' },
  { appointment_id: 25, patient_id: 4,  patient_name: 'Clara',   doctor: 'Dr Lewis', appointment_date: '2025-09-22', appointment_time: '11:00', status: 'Scheduled',  visit_type: 'Consultation' },
  { appointment_id: 26, patient_id: 15, patient_name: 'Nadia',   doctor: 'Dr Ahmed', appointment_date: '2025-03-17', appointment_time: '15:30', status: 'Scheduled',  visit_type: 'Check-up' },
  { appointment_id: 27, patient_id: 3,  patient_name: 'Ben',     doctor: 'Dr Ahmed', appointment_date: '2025-08-06', appointment_time: '10:00', status: 'Completed',  visit_type: 'Vaccination' },
  { appointment_id: 28, patient_id: 3,  patient_name: 'Ben',     doctor: 'Dr Lewis', appointment_date: '2025-12-13', appointment_time: '15:30', status: 'No Show',    visit_type: 'Vaccination' },
  { appointment_id: 29, patient_id: 9,  patient_name: 'Hamza',   doctor: 'Dr Shah',  appointment_date: '2025-09-13', appointment_time: '15:30', status: 'Scheduled',  visit_type: 'Vaccination' },
  { appointment_id: 30, patient_id: 14, patient_name: 'Mason',   doctor: 'Dr Ahmed', appointment_date: '2025-03-15', appointment_time: '10:00', status: 'Completed',  visit_type: 'Vaccination' },
  { appointment_id: 31, patient_id: 5,  patient_name: 'Deepak',  doctor: 'Dr Shah',  appointment_date: '2025-09-20', appointment_time: '09:30', status: 'Cancelled',  visit_type: 'Vaccination' },
  { appointment_id: 32, patient_id: 16, patient_name: 'Oscar',   doctor: 'Dr Ahmed', appointment_date: '2025-03-22', appointment_time: '14:00', status: 'Scheduled',  visit_type: 'Check-up' },
  { appointment_id: 33, patient_id: 20, patient_name: 'Sam',     doctor: 'Dr Lewis', appointment_date: '2025-02-26', appointment_time: '09:30', status: 'Completed',  visit_type: 'Consultation' },
  { appointment_id: 34, patient_id: 2,  patient_name: 'Aisha',   doctor: 'Dr Shah',  appointment_date: '2025-03-20', appointment_time: '09:30', status: 'Completed',  visit_type: 'Consultation' },
  { appointment_id: 35, patient_id: 10, patient_name: 'Ivy',     doctor: 'Dr Lewis', appointment_date: '2025-09-06', appointment_time: '09:00', status: 'Cancelled',  visit_type: 'Follow-up' },
  { appointment_id: 36, patient_id: 19, patient_name: 'Riya',    doctor: 'Dr Lewis', appointment_date: '2025-01-25', appointment_time: '12:00', status: 'Scheduled',  visit_type: 'Follow-up' },
  { appointment_id: 37, patient_id: 6,  patient_name: 'Ella',    doctor: 'Dr Shah',  appointment_date: '2025-09-08', appointment_time: '09:00', status: 'Completed',  visit_type: 'Consultation' },
  { appointment_id: 38, patient_id: 3,  patient_name: 'Ben',     doctor: 'Dr Ahmed', appointment_date: '2025-08-02', appointment_time: '16:00', status: 'Completed',  visit_type: 'Vaccination' },
  { appointment_id: 39, patient_id: 11, patient_name: 'Jasmin',  doctor: 'Dr Lewis', appointment_date: '2025-09-01', appointment_time: '10:00', status: 'Cancelled',  visit_type: 'Vaccination' },
  { appointment_id: 40, patient_id: 15, patient_name: 'Nadia',   doctor: 'Dr Shah',  appointment_date: '2025-08-18', appointment_time: '10:00', status: 'Scheduled',  visit_type: 'Consultation' },
  { appointment_id: 41, patient_id: 3,  patient_name: 'Ben',     doctor: 'Dr Shah',  appointment_date: '2025-12-07', appointment_time: '15:30', status: 'Completed',  visit_type: 'Vaccination' },
  { appointment_id: 42, patient_id: 11, patient_name: 'Jasmin',  doctor: 'Dr Shah',  appointment_date: '2025-01-24', appointment_time: '16:00', status: 'Cancelled',  visit_type: 'Check-up' },
  { appointment_id: 43, patient_id: 6,  patient_name: 'Ella',    doctor: 'Dr Shah',  appointment_date: '2025-01-13', appointment_time: '12:00', status: 'Completed',  visit_type: 'Check-up' },
  { appointment_id: 44, patient_id: 18, patient_name: 'Quinn',   doctor: 'Dr Ahmed', appointment_date: '2025-04-09', appointment_time: '09:00', status: 'Scheduled',  visit_type: 'Follow-up' },
  { appointment_id: 45, patient_id: 16, patient_name: 'Oscar',   doctor: 'Dr Shah',  appointment_date: '2025-01-10', appointment_time: '09:30', status: 'No Show',    visit_type: 'Follow-up' },
  { appointment_id: 46, patient_id: 1,  patient_name: 'Adam',    doctor: 'Dr Lewis', appointment_date: '2025-04-16', appointment_time: '11:00', status: 'Scheduled',  visit_type: 'Vaccination' },
  { appointment_id: 47, patient_id: 3,  patient_name: 'Ben',     doctor: 'Dr Shah',  appointment_date: '2025-11-07', appointment_time: '14:00', status: 'Completed',  visit_type: 'Check-up' },
  { appointment_id: 48, patient_id: 16, patient_name: 'Oscar',   doctor: 'Dr Ahmed', appointment_date: '2025-06-24', appointment_time: '15:30', status: 'Completed',  visit_type: 'Check-up' },
  { appointment_id: 49, patient_id: 17, patient_name: 'Pooja',   doctor: 'Dr Lewis', appointment_date: '2025-07-15', appointment_time: '12:00', status: 'Completed',  visit_type: 'Check-up' },
  { appointment_id: 50, patient_id: 18, patient_name: 'Quinn',   doctor: 'Dr Ahmed', appointment_date: '2025-05-27', appointment_time: '10:00', status: 'Completed',  visit_type: 'Check-up' },
  { appointment_id: 51, patient_id: 5,  patient_name: 'Deepak',  doctor: 'Dr Lewis', appointment_date: '2025-07-28', appointment_time: '10:00', status: 'Completed',  visit_type: 'Consultation' },
  { appointment_id: 52, patient_id: 6,  patient_name: 'Ella',    doctor: 'Dr Ahmed', appointment_date: '2025-01-30', appointment_time: '12:00', status: 'Completed',  visit_type: 'Consultation' },
  { appointment_id: 53, patient_id: 5,  patient_name: 'Deepak',  doctor: 'Dr Lewis', appointment_date: '2025-06-15', appointment_time: '12:00', status: 'Completed',  visit_type: 'Check-up' },
  { appointment_id: 54, patient_id: 2,  patient_name: 'Aisha',   doctor: 'Dr Ahmed', appointment_date: '2025-05-03', appointment_time: '11:00', status: 'Completed',  visit_type: 'Vaccination' },
  { appointment_id: 55, patient_id: 4,  patient_name: 'Clara',   doctor: 'Dr Lewis', appointment_date: '2025-02-01', appointment_time: '14:00', status: 'Completed',  visit_type: 'Vaccination' },
  { appointment_id: 56, patient_id: 3,  patient_name: 'Ben',     doctor: 'Dr Lewis', appointment_date: '2025-01-15', appointment_time: '15:30', status: 'No Show',    visit_type: 'Check-up' },
  { appointment_id: 57, patient_id: 9,  patient_name: 'Hamza',   doctor: 'Dr Shah',  appointment_date: '2025-10-28', appointment_time: '09:30', status: 'Completed',  visit_type: 'Follow-up' },
  { appointment_id: 58, patient_id: 10, patient_name: 'Ivy',     doctor: 'Dr Shah',  appointment_date: '2025-07-28', appointment_time: '16:00', status: 'Completed',  visit_type: 'Follow-up' },
  { appointment_id: 59, patient_id: 5,  patient_name: 'Deepak',  doctor: 'Dr Lewis', appointment_date: '2025-10-04', appointment_time: '10:00', status: 'Cancelled',  visit_type: 'Vaccination' },
  { appointment_id: 60, patient_id: 18, patient_name: 'Quinn',   doctor: 'Dr Lewis', appointment_date: '2025-01-22', appointment_time: '09:00', status: 'Scheduled',  visit_type: 'Consultation' },
  { appointment_id: 61, patient_id: 6,  patient_name: 'Ella',    doctor: 'Dr Ahmed', appointment_date: '2025-01-31', appointment_time: '16:00', status: 'Completed',  visit_type: 'Consultation' },
  { appointment_id: 62, patient_id: 13, patient_name: 'Lina',    doctor: 'Dr Lewis', appointment_date: '2025-11-20', appointment_time: '11:00', status: 'No Show',    visit_type: 'Consultation' },
  { appointment_id: 63, patient_id: 2,  patient_name: 'Aisha',   doctor: 'Dr Ahmed', appointment_date: '2025-10-01', appointment_time: '09:30', status: 'Completed',  visit_type: 'Vaccination' },
  { appointment_id: 64, patient_id: 4,  patient_name: 'Clara',   doctor: 'Dr Ahmed', appointment_date: '2025-10-12', appointment_time: '12:00', status: 'Scheduled',  visit_type: 'Follow-up' },
  { appointment_id: 65, patient_id: 20, patient_name: 'Sam',     doctor: 'Dr Shah',  appointment_date: '2025-06-12', appointment_time: '14:00', status: 'No Show',    visit_type: 'Vaccination' },
  { appointment_id: 66, patient_id: 9,  patient_name: 'Hamza',   doctor: 'Dr Ahmed', appointment_date: '2025-12-06', appointment_time: '14:00', status: 'Completed',  visit_type: 'Vaccination' },
  { appointment_id: 67, patient_id: 20, patient_name: 'Sam',     doctor: 'Dr Lewis', appointment_date: '2025-01-09', appointment_time: '10:00', status: 'No Show',    visit_type: 'Check-up' },
  { appointment_id: 68, patient_id: 20, patient_name: 'Sam',     doctor: 'Dr Lewis', appointment_date: '2025-01-03', appointment_time: '09:00', status: 'No Show',    visit_type: 'Vaccination' },
  { appointment_id: 69, patient_id: 18, patient_name: 'Quinn',   doctor: 'Dr Shah',  appointment_date: '2025-12-27', appointment_time: '16:00', status: 'Cancelled',  visit_type: 'Check-up' },
  { appointment_id: 70, patient_id: 3,  patient_name: 'Ben',     doctor: 'Dr Shah',  appointment_date: '2025-01-16', appointment_time: '16:00', status: 'No Show',    visit_type: 'Consultation' },
  { appointment_id: 71, patient_id: 13, patient_name: 'Lina',    doctor: 'Dr Shah',  appointment_date: '2025-07-03', appointment_time: '15:30', status: 'Completed',  visit_type: 'Check-up' },
  { appointment_id: 72, patient_id: 4,  patient_name: 'Clara',   doctor: 'Dr Lewis', appointment_date: '2025-07-09', appointment_time: '11:00', status: 'Completed',  visit_type: 'Follow-up' },
  { appointment_id: 73, patient_id: 1,  patient_name: 'Adam',    doctor: 'Dr Lewis', appointment_date: '2025-12-15', appointment_time: '14:00', status: 'Completed',  visit_type: 'Consultation' },
  { appointment_id: 74, patient_id: 8,  patient_name: 'Georgia', doctor: 'Dr Ahmed', appointment_date: '2025-09-10', appointment_time: '14:00', status: 'Completed',  visit_type: 'Vaccination' },
  { appointment_id: 75, patient_id: 20, patient_name: 'Sam',     doctor: 'Dr Ahmed', appointment_date: '2025-01-04', appointment_time: '11:00', status: 'Scheduled',  visit_type: 'Vaccination' },
  { appointment_id: 76, patient_id: 4,  patient_name: 'Clara',   doctor: 'Dr Lewis', appointment_date: '2025-10-19', appointment_time: '16:00', status: 'Completed',  visit_type: 'Follow-up' },
  { appointment_id: 77, patient_id: 19, patient_name: 'Riya',    doctor: 'Dr Shah',  appointment_date: '2025-12-16', appointment_time: '10:00', status: 'Completed',  visit_type: 'Follow-up' },
  { appointment_id: 78, patient_id: 3,  patient_name: 'Ben',     doctor: 'Dr Ahmed', appointment_date: '2025-05-13', appointment_time: '11:00', status: 'Scheduled',  visit_type: 'Consultation' },
  { appointment_id: 79, patient_id: 7,  patient_name: 'Faisal',  doctor: 'Dr Shah',  appointment_date: '2025-01-12', appointment_time: '12:00', status: 'Cancelled',  visit_type: 'Vaccination' },
  { appointment_id: 80, patient_id: 1,  patient_name: 'Adam',    doctor: 'Dr Lewis', appointment_date: '2025-11-25', appointment_time: '09:00', status: 'Scheduled',  visit_type: 'Consultation' },
  { appointment_id: 81, patient_id: 14, patient_name: 'Mason',   doctor: 'Dr Lewis', appointment_date: '2025-05-21', appointment_time: '09:30', status: 'Cancelled',  visit_type: 'Vaccination' },
  { appointment_id: 82, patient_id: 16, patient_name: 'Oscar',   doctor: 'Dr Lewis', appointment_date: '2025-09-22', appointment_time: '09:00', status: 'Scheduled',  visit_type: 'Follow-up' },
  { appointment_id: 83, patient_id: 2,  patient_name: 'Aisha',   doctor: 'Dr Lewis', appointment_date: '2025-08-04', appointment_time: '16:00', status: 'Completed',  visit_type: 'Vaccination' },
  { appointment_id: 84, patient_id: 7,  patient_name: 'Faisal',  doctor: 'Dr Lewis', appointment_date: '2025-02-11', appointment_time: '09:00', status: 'Scheduled',  visit_type: 'Follow-up' },
  { appointment_id: 85, patient_id: 14, patient_name: 'Mason',   doctor: 'Dr Ahmed', appointment_date: '2025-05-08', appointment_time: '11:00', status: 'Completed',  visit_type: 'Consultation' },
  { appointment_id: 86, patient_id: 3,  patient_name: 'Ben',     doctor: 'Dr Shah',  appointment_date: '2025-11-17', appointment_time: '09:30', status: 'Completed',  visit_type: 'Vaccination' },
  { appointment_id: 87, patient_id: 1,  patient_name: 'Adam',    doctor: 'Dr Shah',  appointment_date: '2025-11-17', appointment_time: '14:00', status: 'Scheduled',  visit_type: 'Follow-up' },
  { appointment_id: 88, patient_id: 4,  patient_name: 'Clara',   doctor: 'Dr Lewis', appointment_date: '2025-05-03', appointment_time: '14:00', status: 'Scheduled',  visit_type: 'Consultation' },
  { appointment_id: 89, patient_id: 17, patient_name: 'Pooja',   doctor: 'Dr Ahmed', appointment_date: '2025-02-07', appointment_time: '16:00', status: 'Cancelled',  visit_type: 'Vaccination' },
  { appointment_id: 90, patient_id: 19, patient_name: 'Riya',    doctor: 'Dr Ahmed', appointment_date: '2025-02-13', appointment_time: '09:00', status: 'Scheduled',  visit_type: 'Vaccination' },
  { appointment_id: 91, patient_id: 11, patient_name: 'Jasmin',  doctor: 'Dr Shah',  appointment_date: '2025-02-03', appointment_time: '10:00', status: 'Completed',  visit_type: 'Vaccination' },
  { appointment_id: 92, patient_id: 2,  patient_name: 'Aisha',   doctor: 'Dr Lewis', appointment_date: '2025-11-09', appointment_time: '15:30', status: 'Completed',  visit_type: 'Check-up' },
  { appointment_id: 93, patient_id: 18, patient_name: 'Quinn',   doctor: 'Dr Ahmed', appointment_date: '2025-05-31', appointment_time: '15:30', status: 'Completed',  visit_type: 'Vaccination' },
  { appointment_id: 94, patient_id: 8,  patient_name: 'Georgia', doctor: 'Dr Shah',  appointment_date: '2025-12-04', appointment_time: '09:00', status: 'Completed',  visit_type: 'Vaccination' },
  { appointment_id: 95, patient_id: 14, patient_name: 'Mason',   doctor: 'Dr Shah',  appointment_date: '2025-11-14', appointment_time: '09:30', status: 'Completed',  visit_type: 'Check-up' },
  { appointment_id: 96, patient_id: 15, patient_name: 'Nadia',   doctor: 'Dr Shah',  appointment_date: '2025-06-18', appointment_time: '11:00', status: 'Completed',  visit_type: 'Check-up' },
  { appointment_id: 97, patient_id: 20, patient_name: 'Sam',     doctor: 'Dr Shah',  appointment_date: '2025-02-04', appointment_time: '11:00', status: 'Scheduled',  visit_type: 'Follow-up' },
  { appointment_id: 98, patient_id: 17, patient_name: 'Pooja',   doctor: 'Dr Lewis', appointment_date: '2025-07-01', appointment_time: '15:30', status: 'Completed',  visit_type: 'Vaccination' },
  { appointment_id: 99, patient_id: 6,  patient_name: 'Ella',    doctor: 'Dr Ahmed', appointment_date: '2025-03-12', appointment_time: '09:00', status: 'Completed',  visit_type: 'Consultation' },
  { appointment_id: 100,patient_id: 19, patient_name: 'Riya',    doctor: 'Dr Lewis', appointment_date: '2025-09-20', appointment_time: '14:00', status: 'Completed',  visit_type: 'Follow-up' },
  { appointment_id: 101,patient_id: 5,  patient_name: 'Deepak',  doctor: 'Dr Lewis', appointment_date: '2025-06-08', appointment_time: '14:00', status: 'Completed',  visit_type: 'Check-up' },
  { appointment_id: 102,patient_id: 17, patient_name: 'Pooja',   doctor: 'Dr Shah',  appointment_date: '2025-12-03', appointment_time: '10:00', status: 'Completed',  visit_type: 'Check-up' },
  { appointment_id: 103,patient_id: 14, patient_name: 'Mason',   doctor: 'Dr Lewis', appointment_date: '2025-04-11', appointment_time: '11:00', status: 'No Show',    visit_type: 'Follow-up' },
  { appointment_id: 104,patient_id: 3,  patient_name: 'Ben',     doctor: 'Dr Lewis', appointment_date: '2025-04-07', appointment_time: '16:00', status: 'Cancelled',  visit_type: 'Vaccination' },
  { appointment_id: 105,patient_id: 20, patient_name: 'Sam',     doctor: 'Dr Shah',  appointment_date: '2025-06-19', appointment_time: '14:00', status: 'No Show',    visit_type: 'Vaccination' },
  { appointment_id: 106,patient_id: 11, patient_name: 'Jasmin',  doctor: 'Dr Ahmed', appointment_date: '2025-02-23', appointment_time: '16:00', status: 'Scheduled',  visit_type: 'Check-up' },
  { appointment_id: 107,patient_id: 16, patient_name: 'Oscar',   doctor: 'Dr Ahmed', appointment_date: '2025-01-02', appointment_time: '11:00', status: 'Cancelled',  visit_type: 'Vaccination' },
  { appointment_id: 108,patient_id: 20, patient_name: 'Sam',     doctor: 'Dr Ahmed', appointment_date: '2025-05-03', appointment_time: '16:00', status: 'Cancelled',  visit_type: 'Consultation' },
  { appointment_id: 109,patient_id: 13, patient_name: 'Lina',    doctor: 'Dr Ahmed', appointment_date: '2025-07-24', appointment_time: '10:00', status: 'Scheduled',  visit_type: 'Check-up' },
  { appointment_id: 110,patient_id: 12, patient_name: 'Karan',   doctor: 'Dr Ahmed', appointment_date: '2025-02-07', appointment_time: '14:00', status: 'Completed',  visit_type: 'Check-up' },
  { appointment_id: 111,patient_id: 5,  patient_name: 'Deepak',  doctor: 'Dr Lewis', appointment_date: '2025-08-14', appointment_time: '11:00', status: 'No Show',    visit_type: 'Consultation' },
  { appointment_id: 112,patient_id: 2,  patient_name: 'Aisha',   doctor: 'Dr Ahmed', appointment_date: '2025-04-12', appointment_time: '11:00', status: 'Completed',  visit_type: 'Follow-up' },
  { appointment_id: 113,patient_id: 9,  patient_name: 'Hamza',   doctor: 'Dr Shah',  appointment_date: '2025-03-31', appointment_time: '14:00', status: 'Scheduled',  visit_type: 'Follow-up' },
  { appointment_id: 114,patient_id: 6,  patient_name: 'Ella',    doctor: 'Dr Ahmed', appointment_date: '2025-01-12', appointment_time: '10:00', status: 'Scheduled',  visit_type: 'Check-up' },
  { appointment_id: 115,patient_id: 1,  patient_name: 'Adam',    doctor: 'Dr Shah',  appointment_date: '2025-03-12', appointment_time: '15:30', status: 'No Show',    visit_type: 'Check-up' },
  { appointment_id: 116,patient_id: 11, patient_name: 'Jasmin',  doctor: 'Dr Ahmed', appointment_date: '2025-06-06', appointment_time: '16:00', status: 'Completed',  visit_type: 'Consultation' },
  { appointment_id: 117,patient_id: 6,  patient_name: 'Ella',    doctor: 'Dr Shah',  appointment_date: '2025-11-16', appointment_time: '15:30', status: 'Scheduled',  visit_type: 'Check-up' },
  { appointment_id: 118,patient_id: 4,  patient_name: 'Clara',   doctor: 'Dr Ahmed', appointment_date: '2025-03-08', appointment_time: '11:00', status: 'Completed',  visit_type: 'Vaccination' },
  { appointment_id: 119,patient_id: 12, patient_name: 'Karan',   doctor: 'Dr Lewis', appointment_date: '2025-11-03', appointment_time: '15:30', status: 'Scheduled',  visit_type: 'Follow-up' },
  { appointment_id: 120,patient_id: 2,  patient_name: 'Aisha',   doctor: 'Dr Shah',  appointment_date: '2025-10-28', appointment_time: '11:00', status: 'Scheduled',  visit_type: 'Consultation' },
  { appointment_id: 121,patient_id: 5,  patient_name: 'Deepak',  doctor: 'Dr Lewis', appointment_date: '2025-05-07', appointment_time: '09:00', status: 'No Show',    visit_type: 'Consultation' },
  { appointment_id: 122,patient_id: 5,  patient_name: 'Deepak',  doctor: 'Dr Shah',  appointment_date: '2025-10-27', appointment_time: '16:00', status: 'Completed',  visit_type: 'Check-up' },
  { appointment_id: 123,patient_id: 16, patient_name: 'Oscar',   doctor: 'Dr Shah',  appointment_date: '2025-11-11', appointment_time: '09:30', status: 'Completed',  visit_type: 'Vaccination' },
  { appointment_id: 124,patient_id: 17, patient_name: 'Pooja',   doctor: 'Dr Lewis', appointment_date: '2025-09-13', appointment_time: '16:00', status: 'Completed',  visit_type: 'Consultation' },
  { appointment_id: 125,patient_id: 17, patient_name: 'Pooja',   doctor: 'Dr Shah',  appointment_date: '2025-09-05', appointment_time: '16:00', status: 'Completed',  visit_type: 'Vaccination' },
  { appointment_id: 126,patient_id: 19, patient_name: 'Riya',    doctor: 'Dr Shah',  appointment_date: '2025-01-19', appointment_time: '11:00', status: 'Completed',  visit_type: 'Follow-up' },
  { appointment_id: 127,patient_id: 15, patient_name: 'Nadia',   doctor: 'Dr Ahmed', appointment_date: '2025-07-22', appointment_time: '11:00', status: 'Completed',  visit_type: 'Vaccination' },
  { appointment_id: 128,patient_id: 19, patient_name: 'Riya',    doctor: 'Dr Ahmed', appointment_date: '2025-07-11', appointment_time: '12:00', status: 'Completed',  visit_type: 'Follow-up' },
  { appointment_id: 129,patient_id: 3,  patient_name: 'Ben',     doctor: 'Dr Lewis', appointment_date: '2025-08-16', appointment_time: '14:00', status: 'Completed',  visit_type: 'Check-up' },
  { appointment_id: 130,patient_id: 15, patient_name: 'Nadia',   doctor: 'Dr Shah',  appointment_date: '2025-11-15', appointment_time: '14:00', status: 'Completed',  visit_type: 'Vaccination' },
  { appointment_id: 131,patient_id: 14, patient_name: 'Mason',   doctor: 'Dr Lewis', appointment_date: '2025-07-08', appointment_time: '16:00', status: 'Completed',  visit_type: 'Vaccination' },
  { appointment_id: 132,patient_id: 1,  patient_name: 'Adam',    doctor: 'Dr Ahmed', appointment_date: '2025-08-15', appointment_time: '11:00', status: 'Completed',  visit_type: 'Check-up' },
  { appointment_id: 133,patient_id: 12, patient_name: 'Karan',   doctor: 'Dr Ahmed', appointment_date: '2025-05-31', appointment_time: '09:30', status: 'Cancelled',  visit_type: 'Follow-up' },
  { appointment_id: 134,patient_id: 4,  patient_name: 'Clara',   doctor: 'Dr Ahmed', appointment_date: '2025-02-06', appointment_time: '14:00', status: 'Completed',  visit_type: 'Follow-up' },
  { appointment_id: 135,patient_id: 11, patient_name: 'Jasmin',  doctor: 'Dr Ahmed', appointment_date: '2025-12-12', appointment_time: '14:00', status: 'Completed',  visit_type: 'Consultation' },
  { appointment_id: 136,patient_id: 7,  patient_name: 'Faisal',  doctor: 'Dr Shah',  appointment_date: '2025-11-06', appointment_time: '10:00', status: 'Scheduled',  visit_type: 'Consultation' },
  { appointment_id: 137,patient_id: 1,  patient_name: 'Adam',    doctor: 'Dr Lewis', appointment_date: '2025-05-25', appointment_time: '14:00', status: 'Cancelled',  visit_type: 'Vaccination' },
  { appointment_id: 138,patient_id: 13, patient_name: 'Lina',    doctor: 'Dr Shah',  appointment_date: '2025-12-02', appointment_time: '09:00', status: 'Completed',  visit_type: 'Follow-up' },
  { appointment_id: 139,patient_id: 13, patient_name: 'Lina',    doctor: 'Dr Ahmed', appointment_date: '2025-04-27', appointment_time: '11:00', status: 'Completed',  visit_type: 'Vaccination' },
  { appointment_id: 140,patient_id: 15, patient_name: 'Nadia',   doctor: 'Dr Lewis', appointment_date: '2025-02-13', appointment_time: '14:00', status: 'Scheduled',  visit_type: 'Vaccination' },
  { appointment_id: 141,patient_id: 14, patient_name: 'Mason',   doctor: 'Dr Ahmed', appointment_date: '2025-08-13', appointment_time: '16:00', status: 'Scheduled',  visit_type: 'Check-up' },
  { appointment_id: 142,patient_id: 12, patient_name: 'Karan',   doctor: 'Dr Ahmed', appointment_date: '2025-10-23', appointment_time: '10:00', status: 'Completed',  visit_type: 'Check-up' },
  { appointment_id: 143,patient_id: 16, patient_name: 'Oscar',   doctor: 'Dr Shah',  appointment_date: '2025-07-01', appointment_time: '14:00', status: 'Completed',  visit_type: 'Vaccination' },
  { appointment_id: 144,patient_id: 13, patient_name: 'Lina',    doctor: 'Dr Shah',  appointment_date: '2025-10-03', appointment_time: '12:00', status: 'Completed',  visit_type: 'Check-up' },
  { appointment_id: 145,patient_id: 19, patient_name: 'Riya',    doctor: 'Dr Ahmed', appointment_date: '2025-03-13', appointment_time: '10:00', status: 'Scheduled',  visit_type: 'Consultation' },
  { appointment_id: 146,patient_id: 19, patient_name: 'Riya',    doctor: 'Dr Shah',  appointment_date: '2025-11-05', appointment_time: '15:30', status: 'Scheduled',  visit_type: 'Follow-up' },
  { appointment_id: 147,patient_id: 13, patient_name: 'Lina',    doctor: 'Dr Ahmed', appointment_date: '2025-10-01', appointment_time: '15:30', status: 'Completed',  visit_type: 'Check-up' },
  { appointment_id: 148,patient_id: 11, patient_name: 'Jasmin',  doctor: 'Dr Shah',  appointment_date: '2025-08-20', appointment_time: '12:00', status: 'Completed',  visit_type: 'Check-up' },
  { appointment_id: 149,patient_id: 18, patient_name: 'Quinn',   doctor: 'Dr Ahmed', appointment_date: '2025-01-17', appointment_time: '16:00', status: 'Completed',  visit_type: 'Follow-up' },
  { appointment_id: 150,patient_id: 3,  patient_name: 'Ben',     doctor: 'Dr Lewis', appointment_date: '2025-05-26', appointment_time: '11:00', status: 'Completed',  visit_type: 'Check-up' },
  { appointment_id: 151,patient_id: 15, patient_name: 'Nadia',   doctor: 'Dr Ahmed', appointment_date: '2025-07-08', appointment_time: '09:00', status: 'Completed',  visit_type: 'Vaccination' },
  { appointment_id: 152,patient_id: 13, patient_name: 'Lina',    doctor: 'Dr Ahmed', appointment_date: '2025-02-26', appointment_time: '10:00', status: 'Completed',  visit_type: 'Vaccination' },
  { appointment_id: 153,patient_id: 3,  patient_name: 'Ben',     doctor: 'Dr Lewis', appointment_date: '2025-04-16', appointment_time: '10:00', status: 'Scheduled',  visit_type: 'Consultation' },
  { appointment_id: 154,patient_id: 14, patient_name: 'Mason',   doctor: 'Dr Shah',  appointment_date: '2025-12-07', appointment_time: '16:00', status: 'Completed',  visit_type: 'Consultation' },
  { appointment_id: 155,patient_id: 19, patient_name: 'Riya',    doctor: 'Dr Ahmed', appointment_date: '2025-09-15', appointment_time: '16:00', status: 'Completed',  visit_type: 'Check-up' },
  { appointment_id: 156,patient_id: 5,  patient_name: 'Deepak',  doctor: 'Dr Lewis', appointment_date: '2025-02-02', appointment_time: '15:30', status: 'No Show',    visit_type: 'Follow-up' },
  { appointment_id: 157,patient_id: 17, patient_name: 'Pooja',   doctor: 'Dr Lewis', appointment_date: '2025-10-19', appointment_time: '16:00', status: 'Completed',  visit_type: 'Check-up' },
  { appointment_id: 158,patient_id: 3,  patient_name: 'Ben',     doctor: 'Dr Lewis', appointment_date: '2025-11-27', appointment_time: '16:00', status: 'Completed',  visit_type: 'Consultation' },
  { appointment_id: 159,patient_id: 13, patient_name: 'Lina',    doctor: 'Dr Shah',  appointment_date: '2025-03-31', appointment_time: '15:30', status: 'Completed',  visit_type: 'Vaccination' },
  { appointment_id: 160,patient_id: 15, patient_name: 'Nadia',   doctor: 'Dr Lewis', appointment_date: '2025-12-04', appointment_time: '10:00', status: 'Cancelled',  visit_type: 'Check-up' },
  { appointment_id: 161,patient_id: 13, patient_name: 'Lina',    doctor: 'Dr Shah',  appointment_date: '2025-01-23', appointment_time: '11:00', status: 'Scheduled',  visit_type: 'Follow-up' },
  { appointment_id: 162,patient_id: 9,  patient_name: 'Hamza',   doctor: 'Dr Shah',  appointment_date: '2025-10-03', appointment_time: '12:00', status: 'No Show',    visit_type: 'Check-up' },
  { appointment_id: 163,patient_id: 7,  patient_name: 'Faisal',  doctor: 'Dr Lewis', appointment_date: '2025-07-30', appointment_time: '09:30', status: 'Scheduled',  visit_type: 'Check-up' },
  { appointment_id: 164,patient_id: 4,  patient_name: 'Clara',   doctor: 'Dr Shah',  appointment_date: '2025-06-16', appointment_time: '15:30', status: 'Completed',  visit_type: 'Consultation' },
  { appointment_id: 165,patient_id: 7,  patient_name: 'Faisal',  doctor: 'Dr Shah',  appointment_date: '2025-01-23', appointment_time: '16:00', status: 'Completed',  visit_type: 'Vaccination' },
  { appointment_id: 166,patient_id: 13, patient_name: 'Lina',    doctor: 'Dr Lewis', appointment_date: '2025-07-24', appointment_time: '11:00', status: 'Completed',  visit_type: 'Check-up' },
  { appointment_id: 167,patient_id: 9,  patient_name: 'Hamza',   doctor: 'Dr Ahmed', appointment_date: '2025-12-30', appointment_time: '10:00', status: 'Completed',  visit_type: 'Vaccination' },
  { appointment_id: 168,patient_id: 16, patient_name: 'Oscar',   doctor: 'Dr Lewis', appointment_date: '2025-02-04', appointment_time: '09:30', status: 'Completed',  visit_type: 'Follow-up' },
  { appointment_id: 169,patient_id: 15, patient_name: 'Nadia',   doctor: 'Dr Ahmed', appointment_date: '2025-08-30', appointment_time: '12:00', status: 'Scheduled',  visit_type: 'Follow-up' },
  { appointment_id: 170,patient_id: 1,  patient_name: 'Adam',    doctor: 'Dr Shah',  appointment_date: '2025-02-21', appointment_time: '10:00', status: 'Completed',  visit_type: 'Vaccination' },
  { appointment_id: 171,patient_id: 6,  patient_name: 'Ella',    doctor: 'Dr Ahmed', appointment_date: '2025-12-10', appointment_time: '09:00', status: 'No Show',    visit_type: 'Follow-up' },
  { appointment_id: 172,patient_id: 15, patient_name: 'Nadia',   doctor: 'Dr Lewis', appointment_date: '2025-04-02', appointment_time: '11:00', status: 'Cancelled',  visit_type: 'Follow-up' },
  { appointment_id: 173,patient_id: 15, patient_name: 'Nadia',   doctor: 'Dr Shah',  appointment_date: '2025-01-25', appointment_time: '09:30', status: 'Completed',  visit_type: 'Consultation' },
  { appointment_id: 174,patient_id: 15, patient_name: 'Nadia',   doctor: 'Dr Ahmed', appointment_date: '2025-11-03', appointment_time: '09:00', status: 'Completed',  visit_type: 'Vaccination' },
  { appointment_id: 175,patient_id: 7,  patient_name: 'Faisal',  doctor: 'Dr Ahmed', appointment_date: '2025-07-11', appointment_time: '11:00', status: 'Completed',  visit_type: 'Check-up' },
  { appointment_id: 176,patient_id: 14, patient_name: 'Mason',   doctor: 'Dr Ahmed', appointment_date: '2025-01-08', appointment_time: '14:00', status: 'Scheduled',  visit_type: 'Check-up' },
  { appointment_id: 177,patient_id: 8,  patient_name: 'Georgia', doctor: 'Dr Ahmed', appointment_date: '2025-12-07', appointment_time: '10:00', status: 'Cancelled',  visit_type: 'Check-up' },
  { appointment_id: 178,patient_id: 14, patient_name: 'Mason',   doctor: 'Dr Shah',  appointment_date: '2025-02-25', appointment_time: '14:00', status: 'Completed',  visit_type: 'Follow-up' },
  { appointment_id: 179,patient_id: 20, patient_name: 'Sam',     doctor: 'Dr Ahmed', appointment_date: '2025-10-05', appointment_time: '15:30', status: 'Scheduled',  visit_type: 'Check-up' },
  { appointment_id: 180,patient_id: 8,  patient_name: 'Georgia', doctor: 'Dr Ahmed', appointment_date: '2025-02-24', appointment_time: '14:00', status: 'Completed',  visit_type: 'Check-up' },
];

// ─── Unique patient map ────────────────────────────────────────────────────────
const PATIENT_MAP = {
  1:  'Adam',   2:  'Aisha',  3:  'Ben',    4:  'Clara',
  5:  'Deepak', 6:  'Ella',   7:  'Faisal', 8:  'Georgia',
  9:  'Hamza',  10: 'Ivy',    11: 'Jasmin', 12: 'Karan',
  13: 'Lina',   14: 'Mason',  15: 'Nadia',  16: 'Oscar',
  17: 'Pooja',  18: 'Quinn',  19: 'Riya',   20: 'Sam',
};

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // ── Drop existing data ──────────────────────────────────────────────────
    await Promise.all([
      User.deleteMany(),
      Patient.deleteMany(),
      Appointment.deleteMany(),
    ]);
    console.log('🗑  Cleared existing collections');

    // ── Seed Users ──────────────────────────────────────────────────────────
    const adminPass  = await bcrypt.hash('Admin@1234', 10);
    const staffPass  = await bcrypt.hash('Staff@1234', 10);

    await User.insertMany([
      { name: 'Admin Manager', email: 'admin@clinic.com', password: adminPass, role: 'admin' },
      { name: 'Staff Member',  email: 'staff@clinic.com', password: staffPass, role: 'staff' },
    ]);
    console.log('✅ Seeded 2 users  (admin@clinic.com / Admin@1234  |  staff@clinic.com / Staff@1234)');

    // ── Seed Patients ───────────────────────────────────────────────────────
    const patientDocs = Object.entries(PATIENT_MAP).map(([pid, name]) => ({
      patient_id: Number(pid),
      name,
    }));
    const insertedPatients = await Patient.insertMany(patientDocs);
    console.log(`✅ Seeded ${insertedPatients.length} patients`);

    // Build patient_id → ObjectId map
    const pidToOid = {};
    insertedPatients.forEach((p) => (pidToOid[p.patient_id] = p._id));

    // ── Seed Appointments ───────────────────────────────────────────────────
    const appointmentDocs = RAW_APPOINTMENTS.map((r) => ({
      appointment_id:   r.appointment_id,
      patient_id:       pidToOid[r.patient_id],
      doctor:           r.doctor,
      appointment_date: new Date(r.appointment_date),
      appointment_time: r.appointment_time,
      status:           r.status,
      visit_type:       r.visit_type,
    }));

    const insertedAppts = await Appointment.insertMany(appointmentDocs);
    console.log(`✅ Seeded ${insertedAppts.length} appointments`);

    // ── Validation ──────────────────────────────────────────────────────────
    const [totalAppts, totalPts] = await Promise.all([
      Appointment.countDocuments(),
      Patient.countDocuments(),
    ]);

    const statusBreakdown = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    console.log('\n📊 Validation:');
    console.log(`   Total Appointments : ${totalAppts}  (expected: 180) ${totalAppts === 180 ? '✅' : '❌'}`);
    console.log(`   Total Patients     : ${totalPts}   (expected: 20)  ${totalPts === 20 ? '✅' : '❌'}`);

    const statusMap = {};
    statusBreakdown.forEach((s) => (statusMap[s._id] = s.count));
    console.log(`   Completed          : ${statusMap['Completed'] || 0}  (expected: 99)  ${statusMap['Completed'] === 99 ? '✅' : '❌'}`);
    console.log(`   Scheduled          : ${statusMap['Scheduled'] || 0}  (expected: 43)  ${statusMap['Scheduled'] === 43 ? '✅' : '❌'}`);
    console.log(`   Cancelled          : ${statusMap['Cancelled'] || 0}  (expected: 21)  ${statusMap['Cancelled'] === 21 ? '✅' : '❌'}`);
    console.log(`   No Show            : ${statusMap['No Show'] || 0}   (expected: 17)  ${statusMap['No Show'] === 17 ? '✅' : '❌'}`);

    console.log('\n🎉 Seed completed successfully!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seedDB();
