const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // ⚠️ TEMPORARY FIX: Force connection to IPv4 to match seed.js
    const conn = await mongoose.connect("mongodb://127.0.0.1:27017/college_portal");
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;