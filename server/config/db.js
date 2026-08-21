const mongoose = require('mongoose');
const { seedDefaultData } = require('../utils/seedData');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kevalon_tech_db';
    const conn = await mongoose.connect(mongoUri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Seed initial system data
    await seedDefaultData();
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // If local MongoDB is unavailable, allow server startup in fallback mode
  }
};

module.exports = connectDB;
