const mongoose = require('mongoose');
const User = require('../models/User');
const Patient = require('../models/Patient');
require('dotenv').config({ path: '../.env' });

async function assignEmailsAndUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/clinic-dashboard');
    console.log('Connected to DB');

    const patients = await Patient.find({});
    console.log(`Found ${patients.length} patients. Processing...`);

    let createdUsers = 0;
    let updatedUsers = 0;
    const defaultPassword = '12345678'; // Will be hashed by pre-save hook on User model

    for (const patient of patients) {
      // 1. Ensure Patient has an email
      const email = `patient${patient.patient_id}@clinic.com`;
      if (patient.email !== email) {
        patient.email = email;
        await patient.save();
      }

      // 2. Ensure User account exists or is updated
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        const newUser = new User({
          name: patient.name,
          email: email,
          password: defaultPassword,
          role: 'patient',
          patient_ref: patient._id
        });
        await newUser.save();
        createdUsers++;
      } else {
        // Update password for existing dummy patients
        existingUser.password = defaultPassword;
        await existingUser.save(); // Trigger Mongoose pre-save to re-hash the password
        updatedUsers++;
      }
    }

    console.log(`Successfully assigned emails. Created ${createdUsers} and updated ${updatedUsers} User accounts.`);
    console.log('Login mapping example:');
    console.log('- Email: patient1@clinic.com (or patient2, patient3, etc.)');
    console.log('- Password: ' + defaultPassword);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    mongoose.disconnect();
  }
}

assignEmailsAndUsers();
