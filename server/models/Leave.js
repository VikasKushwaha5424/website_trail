const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
  facultyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "FacultyProfile", 
    required: true 
  },
  leaveType: { 
    type: String, 
    enum: ["SICK", "CASUAL", "OFFICIAL", "OTHER"], 
    required: true 
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  reason: { 
    type: String, 
    required: true,
    maxLength: 300
  },
  status: { 
    type: String, 
    enum: ["PENDING", "APPROVED", "REJECTED"], 
    default: "PENDING" 
  },
  adminComment: { 
    type: String 
  },
  appliedAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Leave", leaveSchema);