const express = require("express");
const router = express.Router();

// 1. Import Middleware (Security & Validation)
const { protect, authorize } = require("../middleware/authMiddleware");
const { validateSemester } = require("../middleware/validators");
const { ROLES } = require("../config/roles"); // 👈 Import Role Constants

// 2. Import Controller Functions
const { 
  // A. Create Actions
  addUser, 
  addDepartment, 
  addCourse, 
  createSemester,
  assignFaculty,
  enrollStudent,
  broadcastNotice,

  // B. View / Read Data
  getAllUsers,
  getAllCourses,
  getAllDepartments,
  getDashboardStats,

  // C. Update / Delete Maintenance
  updateUser,
  deleteUser,
  updateCourse,
  deleteCourse,

  // D. Fee Management
  createFeeStructure,
  getPendingPayments,
  verifyPayment,
  getFeeStats,

  // E. Timetable Management
  createTimetableEntry,
  getTimetable,
  deleteTimetableEntry,

  // F. Room Logic (Finding Free Slots)
  findFreeRooms,

  // G. Classroom Inventory (Physical Rooms)
  addClassroom,
  getAllClassrooms,
  deleteClassroom,

  // H. Exam Scheduler
  addExamSlot,
  getExamSchedule,
  deleteExamSlot,

  // I. Attendance Oversight
  getAdminAttendance,
  updateAttendanceOverride,

  // J. Batch Operations
  promoteBatch

} = require("../controllers/adminController");

// ==========================================
// 🛡️ SECURITY: All Admin Routes are Protected
// Using ROLES.ADMIN constant instead of hardcoded string
// ==========================================

// ------------------------------------------
// A. ACTION ROUTES (Create Data)
// ------------------------------------------

// POST /api/admin/add-user (Student/Faculty)
router.post("/add-user", protect, authorize(ROLES.ADMIN), addUser);

// POST /api/admin/add-department
router.post("/add-department", protect, authorize(ROLES.ADMIN), addDepartment);

// POST /api/admin/add-course
router.post("/add-course", protect, authorize(ROLES.ADMIN), addCourse);

// POST /api/admin/create-semester (Active/Inactive logic)
router.post(
  "/create-semester", 
  protect, 
  authorize(ROLES.ADMIN), 
  validateSemester, // Validation Middleware
  createSemester
);

// POST /api/admin/assign-faculty
router.post("/assign-faculty", protect, authorize(ROLES.ADMIN), assignFaculty);

// POST /api/admin/enroll-student (Manual Enrollment)
router.post("/enroll-student", protect, authorize(ROLES.ADMIN), enrollStudent);

// POST /api/admin/broadcast (Alerts)
router.post("/broadcast", protect, authorize(ROLES.ADMIN), broadcastNotice);

// ------------------------------------------
// B. VIEW ROUTES (Fetch Data for Dashboard)
// ------------------------------------------

// GET /api/admin/users?role=student&page=1
router.get("/users", protect, authorize(ROLES.ADMIN), getAllUsers);

// GET /api/admin/courses
router.get("/courses", protect, authorize(ROLES.ADMIN), getAllCourses);

// GET /api/admin/departments
router.get("/departments", protect, authorize(ROLES.ADMIN), getAllDepartments);

// GET /api/admin/stats (Dashboard Widgets)
router.get("/stats", protect, authorize(ROLES.ADMIN), getDashboardStats);

// ------------------------------------------
// C. MAINTENANCE ROUTES (Edit / Delete)
// ------------------------------------------

// PUT /api/admin/update-user (Edit Profile/Role)
router.put("/update-user", protect, authorize(ROLES.ADMIN), updateUser);

// DELETE /api/admin/users/:id (Cascading Delete)
router.delete("/users/:id", protect, authorize(ROLES.ADMIN), deleteUser);

// PUT /api/admin/update-course (Edit Subject)
router.put("/update-course", protect, authorize(ROLES.ADMIN), updateCourse);

// DELETE /api/admin/delete-course
router.delete("/delete-course", protect, authorize(ROLES.ADMIN), deleteCourse);

// ------------------------------------------
// D. FEE MANAGEMENT ROUTES
// ------------------------------------------

// POST /api/admin/fees/assign (Bulk Assign)
router.post("/fees/assign", protect, authorize(ROLES.ADMIN), createFeeStructure);

// GET /api/admin/fees/pending (View Offline Payments)
router.get("/fees/pending", protect, authorize(ROLES.ADMIN), getPendingPayments);

// POST /api/admin/fees/verify (Approve/Reject)
router.post("/fees/verify", protect, authorize(ROLES.ADMIN), verifyPayment);

// GET /api/admin/fees/stats (Dashboard Widget)
router.get("/fees/stats", protect, authorize(ROLES.ADMIN), getFeeStats);

// ------------------------------------------
// E. TIMETABLE MANAGEMENT ROUTES
// ------------------------------------------

// GET /api/admin/timetable?semesterId=123&day=MONDAY (View Schedule)
router.get("/timetable", protect, authorize(ROLES.ADMIN), getTimetable);

// POST /api/admin/timetable (Add Slot + Clash Check)
router.post("/timetable", protect, authorize(ROLES.ADMIN), createTimetableEntry);

// DELETE /api/admin/timetable/:id (Remove Slot)
router.delete("/timetable/:id", protect, authorize(ROLES.ADMIN), deleteTimetableEntry);

// ------------------------------------------
// F. ROOM LOGIC ROUTES
// ------------------------------------------

// POST /api/admin/find-free-rooms
// Body: { "dayOfWeek": "MONDAY", "startTime": 900, "endTime": 1000 }
router.post("/find-free-rooms", protect, authorize(ROLES.ADMIN), findFreeRooms);

// ------------------------------------------
// G. CLASSROOM INVENTORY ROUTES
// ------------------------------------------

// POST /api/admin/add-classroom (Create Physical Room)
router.post("/add-classroom", protect, authorize(ROLES.ADMIN), addClassroom);

// GET /api/admin/classrooms (List All Rooms)
router.get("/classrooms", protect, authorize(ROLES.ADMIN), getAllClassrooms);

// DELETE /api/admin/delete-classroom/:id
router.delete("/delete-classroom/:id", protect, authorize(ROLES.ADMIN), deleteClassroom);

// ------------------------------------------
// H. EXAM SCHEDULER ROUTES
// ------------------------------------------

// POST /api/admin/exams (Schedule Exam + Clash Check)
router.post("/exams", protect, authorize(ROLES.ADMIN), addExamSlot);

// GET /api/admin/exams?date=YYYY-MM-DD
router.get("/exams", protect, authorize(ROLES.ADMIN), getExamSchedule);

// DELETE /api/admin/exams/:id
router.delete("/exams/:id", protect, authorize(ROLES.ADMIN), deleteExamSlot);

// ------------------------------------------
// I. ATTENDANCE ROUTES
// ------------------------------------------

// GET /api/admin/attendance?courseOfferingId=...&date=...
router.get("/attendance", protect, authorize(ROLES.ADMIN), getAdminAttendance);

// POST /api/admin/attendance/fix (Admin Override)
router.post("/attendance/fix", protect, authorize(ROLES.ADMIN), updateAttendanceOverride);

// ------------------------------------------
// J. BATCH OPERATIONS
// ------------------------------------------

// POST /api/admin/promote (Bulk Promote/Graduate)
router.post("/promote", protect, authorize(ROLES.ADMIN), promoteBatch);

module.exports = router;