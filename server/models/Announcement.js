const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  targetAudience: {
    type: String,
    enum: ["All", "Faculty", "Student"],
    default: "All"
  }
}, { timestamps: true });

module.exports = mongoose.model("Announcement", announcementSchema);