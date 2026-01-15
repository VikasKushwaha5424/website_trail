const express = require("express");
const router = express.Router();

// 1. Import Middleware (Security)
const { protect, authorize } = require("../middleware/authMiddleware");

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

  // J. Batch Operations 👈 ADDED HERE
  promoteBatch

} = require("../controllers/adminController");

// ==========================================
// 🛡️ SECURITY: All Admin Routes are Protected
// ==========================================

// ------------------------------------------
// A. ACTION ROUTES (Create Data)
// ------------------------------------------

// POST /api/admin/add-user (Student/Faculty)
router.post("/add-user", protect, authorize("admin"), addUser);

// POST /api/admin/add-department
router.post("/add-department", protect, authorize("admin"), addDepartment);

// POST /api/admin/add-course
router.post("/add-course", protect, authorize("admin"), addCourse);

// POST /api/admin/create-semester (Active/Inactive logic)
router.post("/create-semester", protect, authorize("admin"), createSemester);

// POST /api/admin/assign-faculty
router.post("/assign-faculty", protect, authorize("admin"), assignFaculty);

// POST /api/admin/enroll-student (Manual Enrollment)
router.post("/enroll-student", protect, authorize("admin"), enrollStudent);

// POST /api/admin/broadcast (Alerts)
router.post("/broadcast", protect, authorize("admin"), broadcastNotice);

// ------------------------------------------
// B. VIEW ROUTES (Fetch Data for Dashboard)
// ------------------------------------------

// GET /api/admin/users?role=student&page=1
router.get("/users", protect, authorize("admin"), getAllUsers);

// GET /api/admin/courses
router.get("/courses", protect, authorize("admin"), getAllCourses);

// GET /api/admin/departments
router.get("/departments", protect, authorize("admin"), getAllDepartments);

// GET /api/admin/stats (Dashboard Widgets)
router.get("/stats", protect, authorize("admin"), getDashboardStats);

// ------------------------------------------
// C. MAINTENANCE ROUTES (Edit / Delete)
// ------------------------------------------

// PUT /api/admin/update-user (Edit Profile/Role)
router.put("/update-user", protect, authorize("admin"), updateUser);

// DELETE /api/admin/delete-user (Cascading Delete)
router.delete("/delete-user", protect, authorize("admin"), deleteUser);

// PUT /api/admin/update-course (Edit Subject)
router.put("/update-course", protect, authorize("admin"), updateCourse);

// DELETE /api/admin/delete-course
router.delete("/delete-course", protect, authorize("admin"), deleteCourse);

// ------------------------------------------
// D. FEE MANAGEMENT ROUTES
// ------------------------------------------

// POST /api/admin/fees/assign (Bulk Assign)
router.post("/fees/assign", protect, authorize("admin"), createFeeStructure);

// GET /api/admin/fees/pending (View Offline Payments)
router.get("/fees/pending", protect, authorize("admin"), getPendingPayments);

// POST /api/admin/fees/verify (Approve/Reject)
router.post("/fees/verify", protect, authorize("admin"), verifyPayment);

// GET /api/admin/fees/stats (Dashboard Widget)
router.get("/fees/stats", protect, authorize("admin"), getFeeStats);

// ------------------------------------------
// E. TIMETABLE MANAGEMENT ROUTES
// ------------------------------------------

// GET /api/admin/timetable?semesterId=123&day=MONDAY (View Schedule)
router.get("/timetable", protect, authorize("admin"), getTimetable);

// POST /api/admin/timetable (Add Slot + Clash Check)
router.post("/timetable", protect, authorize("admin"), createTimetableEntry);

// DELETE /api/admin/timetable/:id (Remove Slot)
router.delete("/timetable/:id", protect, authorize("admin"), deleteTimetableEntry);

// ------------------------------------------
// F. ROOM LOGIC ROUTES
// ------------------------------------------

// POST /api/admin/find-free-rooms
// Body: { "dayOfWeek": "MONDAY", "startTime": 900, "endTime": 1000 }
router.post("/find-free-rooms", protect, authorize("admin"), findFreeRooms);

// ------------------------------------------
// G. CLASSROOM INVENTORY ROUTES
// ------------------------------------------

// POST /api/admin/add-classroom (Create Physical Room)
router.post("/add-classroom", protect, authorize("admin"), addClassroom);

// GET /api/admin/classrooms (List All Rooms)
router.get("/classrooms", protect, authorize("admin"), getAllClassrooms);

// DELETE /api/admin/delete-classroom/:id
router.delete("/delete-classroom/:id", protect, authorize("admin"), deleteClassroom);

// ------------------------------------------
// H. EXAM SCHEDULER ROUTES
// ------------------------------------------

// POST /api/admin/exams (Schedule Exam + Clash Check)
router.post("/exams", protect, authorize("admin"), addExamSlot);

// GET /api/admin/exams?date=YYYY-MM-DD
router.get("/exams", protect, authorize("admin"), getExamSchedule);

// DELETE /api/admin/exams/:id
router.delete("/exams/:id", protect, authorize("admin"), deleteExamSlot);

// ------------------------------------------
// I. ATTENDANCE ROUTES
// ------------------------------------------

// GET /api/admin/attendance?courseOfferingId=...&date=...
router.get("/attendance", protect, authorize("admin"), getAdminAttendance);

// POST /api/admin/attendance/fix (Admin Override)
router.post("/attendance/fix", protect, authorize("admin"), updateAttendanceOverride);

// ------------------------------------------
// J. BATCH OPERATIONS 👈 ADDED HERE
// ------------------------------------------

// POST /api/admin/promote (Bulk Promote/Graduate)
router.post("/promote", protect, authorize("admin"), promoteBatch);

module.exports = router;