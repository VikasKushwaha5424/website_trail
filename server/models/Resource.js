const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  fileUrl: { 
    type: String, 
    required: true 
  },
  fileType: { 
    type: String, // e.g. 'pdf', 'docx'
    default: "file" 
  },
  courseOfferingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "CourseOffering", 
    required: true 
  },
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Resource", resourceSchema);