const mongoose = require("mongoose"); // ✅ Required for Transactions
const { Fee, Payment } = require("../models/Fee");
const StudentProfile = require("../models/StudentProfile"); 

// =========================================================
// 1. Get My Dues (SECURE)
// =========================================================
exports.getMyDueFees = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ userId: req.user.id });
    
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const fees = await Fee.find({ studentId: student._id }).populate("semesterId", "name");
    res.json(fees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================================================
// 2. Pay Fees (SECURE + TRANSACTION)
// =========================================================
exports.payFee = async (req, res) => {
  // 1. Start a Session for the Transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { feeId, amount, method, transactionId } = req.body;

    // 2. Validation
    if (amount <= 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Invalid payment amount" });
    }
    
    // 3. Find the Bill (Pass session)
    const fee = await Fee.findById(feeId).session(session);
    if (!fee) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ error: "Fee record not found" });
    }

    // 🔒 4. SECURITY CHECK: Verify Ownership
    const loggedInStudent = await StudentProfile.findOne({ userId: req.user.id }).session(session);
    
    if (!loggedInStudent) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ error: "Student profile not found" });
    }

    if (fee.studentId.toString() !== loggedInStudent._id.toString()) {
        await session.abortTransaction();
        session.endSession();
        return res.status(403).json({ error: "Unauthorized: You can only pay your own fees." });
    }

    // 5. Create Receipt (Pass session)
    // Note: When using transactions, .create() expects an array as the first argument
    const payment = await Payment.create([{
      feeId,
      studentId: fee.studentId,
      amount,
      method,
      transactionId,
      receiptNumber: `RCP-${Date.now()}`
    }], { session });

    // 6. Update the Bill (Pass session)
    fee.amountPaid += Number(amount);
    
    if (fee.amountPaid >= fee.amountDue) {
      fee.status = "PAID";
    } else {
      fee.status = "PARTIAL";
    }
    
    await fee.save({ session });

    // 7. Commit the Transaction (Success)
    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Payment Successful", payment: payment[0], currentStatus: fee.status });

  } catch (err) {
    // 🛑 8. Rollback on Any Error
    await session.abortTransaction();
    session.endSession();
    console.error("Payment Transaction Error:", err);
    res.status(500).json({ error: "Payment Failed: " + err.message });
  }
};