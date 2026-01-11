const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const fixIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected...");

    const collection = mongoose.connection.collection("users");
    
    // Check current indexes
    const indexes = await collection.indexes();
    console.log("Current Indexes:", indexes.map(i => i.name));

    // Drop the problematic 'username' index
    // Note: The error message said the index name is 'username_1'
    try {
      await collection.dropIndex("username_1");
      console.log("✅ SUCCESS: Old 'username_1' index dropped!");
    } catch (err) {
      console.log("⚠️ Index 'username_1' not found (maybe already gone).");
    }

    console.log("Database fixed. You can now run testAdmin.js");
    process.exit();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

fixIndexes();