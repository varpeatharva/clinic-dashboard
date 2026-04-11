const mongoose = require('mongoose');
const User = require('./models/User');
const Patient = require('./models/Patient');
require('dotenv').config();

async function createDemoPatient() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/clinic-dashboard');
    console.log('Connected to DB');

    // 1. Create Patient Record
    const lastPatient = await Patient.findOne().sort({ patient_id: -1 });
    const patient_id = lastPatient ? lastPatient.patient_id + 1 : 1;
    
    // Check if patient exists first
    const existingUser = await User.findOne({ email: 'patient@clinic.com' });
    if (existingUser) {
      console.log('Demo patient user already exists!');
      return;
    }

    const newPatient = await Patient.create({
      patient_id,
      name: 'Demo Patient',
      email: 'patient@clinic.com',
    });
    console.log('Patient record created:', newPatient._id);

    // 2. Create User Account
    const newUser = new User({
      name: 'Demo Patient',
      email: 'patient@clinic.com',
      password: 'Patient@1234', // will be hashed by pre-save
      role: 'patient',
      patient_ref: newPatient._id
    });
    
    await newUser.save();
    console.log('User account created successfully!');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    mongoose.disconnect();
  }
}

createDemoPatient();
