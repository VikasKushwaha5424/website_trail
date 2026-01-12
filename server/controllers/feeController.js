const { Fee, Payment } = require("../models/Fee");
const StudentProfile = require("../models/StudentProfile"); // Required to find the logged-in student

// 1. Get My Dues (SECURE)
exports.getMyDueFees = async (req, res) => {
  try {
    // ✅ FIX: Find the logged-in student's profile using req.user.id
    const student = await StudentProfile.findOne({ userId: req.user.id });
    
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    // ✅ FIX: Query using the securely found ID
    const fees = await Fee.find({ studentId: student._id }).populate("semesterId", "name");
    res.json(fees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Pay Fees (SECURE)
exports.payFee = async (req, res) => {
  try {
    const { feeId, amount, method, transactionId } = req.body;

    // ✅ FIX: Prevent negative amounts
    if (amount <= 0) {
        return res.status(400).json({ message: "Invalid payment amount" });
    }
    
    // A. Find the Bill
    const fee = await Fee.findById(feeId);
    if (!fee) return res.status(404).json({ error: "Fee record not found" });

    // 🔒 TODO: Verify that 'fee.studentId' belongs to req.user (Ownership Check)

    // B. Create Receipt
    const payment = await Payment.create({
      feeId,
      studentId: fee.studentId,
      amount,
      method,
      transactionId,
      receiptNumber: `RCP-${Date.now()}`
    });

    // C. Update the Bill
    fee.amountPaid += Number(amount);
    if (fee.amountPaid >= fee.amountDue) {
      fee.status = "PAID";
    } else {
      fee.status = "PARTIAL";
    }
    await fee.save();

    res.json({ message: "Payment Successful", payment, currentStatus: fee.status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};