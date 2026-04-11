require('dotenv').config();
const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const docs = await Appointment.distinct('doctor');
    const statuses = await Appointment.distinct('status');
    const visitTypes = await Appointment.distinct('visit_type');
    console.log("DOCTORS IN DB:", docs);
    console.log("STATUSES IN DB:", statuses);
    console.log("VISIT TYPES IN DB:", visitTypes);
    mongoose.disconnect();
});
