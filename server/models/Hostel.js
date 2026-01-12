const mongoose = require("mongoose");

// 1. The Physical Building
const hostelSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "Boys Hostel A"
  type: { type: String, enum: ["BOYS", "GIRLS", "STAFF"], required: true },
  wardenName: { type: String, default: "TBA" }
});

// 2. The Room inside the building
const roomSchema = new mongoose.Schema({
  hostelId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Hostel", 
    required: true 
  },
  
  roomNumber: { type: String, required: true }, // e.g., "101"
  capacity: { type: Number, default: 2 }, // Double sharing
  
  // Who lives here?
  occupants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "StudentProfile"
  }]
}, { timestamps: true });

// Virtual to check vacancy
roomSchema.virtual("vacancies").get(function() {
  return this.capacity - this.occupants.length;
});

module.exports = {
  Hostel: mongoose.model("Hostel", hostelSchema),
  Room: mongoose.model("Room", roomSchema)
};