const Leave = require("../models/Leave");
const FacultyProfile = require("../models/FacultyProfile");

// 1. FACULTY: Apply for Leave
exports.applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    // Get Faculty Profile ID
    const faculty = await FacultyProfile.findOne({ userId: req.user.id });
    if (!faculty) return res.status(404).json({ error: "Faculty profile not found" });

    // Validate Dates
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ error: "Start date cannot be after End date" });
    }

    const leave = await Leave.create({
      facultyId: faculty._id,
      leaveType,
      startDate,
      endDate,
      reason
    });

    res.status(201).json({ message: "Leave Applied Successfully", leave });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. FACULTY: Get My Leaves (History)
exports.getMyLeaves = async (req, res) => {
  try {
    const faculty = await FacultyProfile.findOne({ userId: req.user.id });
    if (!faculty) return res.status(404).json({ error: "Faculty profile not found" });

    const leaves = await Leave.find({ facultyId: faculty._id }).sort({ appliedAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. ADMIN: Get All Pending Leaves
exports.getAllLeaves = async (req, res) => {
  try {
    const { status } = req.query; // Optional filter ?status=PENDING
    const query = status ? { status } : {};

    const leaves = await Leave.find(query)
      .populate("facultyId", "firstName lastName designation")
      .sort({ appliedAt: -1 });

    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. ADMIN: Approve/Reject Leave
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { leaveId, status, adminComment } = req.body; // status: "APPROVED" or "REJECTED"

    const leave = await Leave.findByIdAndUpdate(
      leaveId,
      { status, adminComment },
      { new: true }
    );

    if (!leave) return res.status(404).json({ error: "Leave request not found" });

    res.json({ message: `Leave ${status}`, leave });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};