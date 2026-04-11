const mongoose = require('mongoose');
const User = require('./models/User');
const Patient = require('./models/Patient');
require('dotenv').config();

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/clinic-dashboard');
    console.log('Connected');
    
    const u = new User({
      name: 'Test',
      email: 'test_debug@example.com',
      password: 'password123',
      role: 'patient'
    });
    
    await u.save();
    console.log('User created');
  } catch(e) {
    console.error('ERROR CATCHED:', e.message);
    console.error(e.stack);
  } finally {
    mongoose.disconnect();
  }
}
test();
