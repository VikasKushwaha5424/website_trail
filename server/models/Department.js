const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  departmentName: {
    type: String,
    required: true,
  },
  departmentCode: {
    type: String,
    required: true,
    unique: true, // e.g., "CSE", "MECH"
  }
});

module.exports = mongoose.model("Department", departmentSchema);