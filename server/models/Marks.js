const mongoose = require("mongoose");

const marksSchema = new mongoose.Schema({
  // 1️⃣ THE STUDENT & CLASS
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "StudentProfile", 
    required: true 
  },
  
  courseOfferingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "CourseOffering", 
    required: true 
  },

  // 2️⃣ THE EXAM DETAILS
  examType: { 
    type: String, 
    enum: ["INTERNAL_1", "INTERNAL_2", "MID_TERM", "FINAL", "LAB", "ASSIGNMENT"], 
    required: true 
  },

  maxMarks: { 
    type: Number, 
    required: true 
  },

  marksObtained: { 
    type: Number, 
    required: true,
    min: 0,
    // 🛡️ VALIDATION: This replaces the faulty 'pre-save' hook
    validate: {
      validator: function(value) {
        // "this.maxMarks" access works during .create() and .save()
        return value <= this.maxMarks;
      },
      message: props => `Marks obtained (${props.value}) cannot be greater than Max Marks!`
    }
  },

  // 3️⃣ CONTROL
  isLocked: { 
    type: Boolean, 
    default: false 
  } 

}, { timestamps: true });

// 🛡️ INDEX: A student gets only ONE entry per Exam Type per Class
marksSchema.index({ studentId: 1, courseOfferingId: 1, examType: 1 }, { unique: true });

module.exports = mongoose.model("Marks", marksSchema);