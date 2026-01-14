const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // 1. Use Environment Variable, fallback to local IPv4 for dev safety
    const connStr = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/college_portal";
    
    const conn = await mongoose.connect(connStr);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;