const { Fee, Payment } = require("../models/Fee");

// 1. Get My Dues (For Student Dashboard)
exports.getMyDueFees = async (req, res) => {
  try {
    // Assuming req.user is populated by authMiddleware
    // We need to find the student profile first (omitted for brevity, usually middleware does this)
    const fees = await Fee.find({ studentId: req.params.studentId }).populate("semesterId", "name");
    res.json(fees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Pay Fees (The Transaction)
exports.payFee = async (req, res) => {
  try {
    const { feeId, amount, method, transactionId } = req.body;
    
    // A. Find the Bill
    const fee = await Fee.findById(feeId);
    if (!fee) return res.status(404).json({ error: "Fee record not found" });

    // B. Create Receipt
    const payment = await Payment.create({
      feeId,
      studentId: fee.studentId,
      amount,
      method,
      transactionId,
      receiptNumber: `RCP-${Date.now()}` // Simple auto-gen
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