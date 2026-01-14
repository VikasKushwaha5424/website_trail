const mongoose = require("mongoose");

// =========================================================
// 1. THE BILL (What the student owes)
// =========================================================
const feeSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "StudentProfile", 
    required: true 
  },

  semesterId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Semester", 
    required: true 
  },

  // Breakdown of charges
  type: {
    type: String,
    enum: ["TUITION", "HOSTEL", "LIBRARY", "EXAM", "MISC"],
    required: true
  },

  amountDue: { type: Number, required: true },
  amountPaid: { type: Number, default: 0 },
  
  dueDate: { type: Date, required: true },

  status: {
    type: String,
    enum: ["PENDING", "PARTIAL", "PAID", "OVERDUE"],
    default: "PENDING"
  }
}, { timestamps: true });

// Virtual to check if full payment is cleared
feeSchema.virtual("isCleared").get(function() {
  return this.amountPaid >= this.amountDue;
});

// =========================================================
// 2. THE RECEIPT (Actual Money Transfer)
// =========================================================
const paymentSchema = new mongoose.Schema({
  feeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Fee", 
    required: true 
  },
  
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "StudentProfile", 
    required: true 
  },

  amount: { type: Number, required: true },
  
  // 🆕 Added 'OFFLINE' for manual upload (Cash/Cheque submitted to admin)
  method: { 
    type: String, 
    enum: ["CASH", "ONLINE", "CHEQUE", "OFFLINE"], 
    default: "ONLINE" 
  },
  
  // 🆕 Transaction ID is optional for Offline payments until verified
  transactionId: { 
    type: String, 
    default: null 
  }, 
  
  // 🆕 For Screenshots / Cheque Photos (Cloudinary URL)
  proofUrl: { 
    type: String, 
    default: null 
  },

  // 🆕 Payment Status (Online is instant Success; Offline is Pending)
  status: { 
    type: String, 
    enum: ["SUCCESS", "PENDING", "FAILED", "REFUNDED"], 
    default: "SUCCESS" 
  },

  paymentDate: { type: Date, default: Date.now },
  
  // Generated only after success/verification (e.g., RCP-2025-001)
  receiptNumber: { type: String } 

}, { timestamps: true });

module.exports = {
  Fee: mongoose.model("Fee", feeSchema),
  Payment: mongoose.model("Payment", paymentSchema)
};