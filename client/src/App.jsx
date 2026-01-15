import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/auth/Login";
import ProtectedRoute from "./components/ProtectedRoute";

// Layouts
import AdminLayout from "./components/AdminLayout";
import StudentLayout from "./components/StudentLayout";
import FacultyLayout from "./components/FacultyLayout";

// Import Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import AcademicStructure from "./pages/admin/AcademicStructure";
import ClassOperations from "./pages/admin/ClassOperations";
import TimetableScheduler from "./pages/admin/TimetableScheduler";
import FeeManagement from "./pages/admin/FeeManagement";
import AnnouncementPage from "./pages/admin/AnnouncementPage";
import HostelAllocation from "./pages/admin/HostelAllocation";
import ExamScheduler from "./pages/admin/ExamScheduler";
import AttendanceMonitor from "./pages/admin/AttendanceMonitor";
import BatchPromotion from "./pages/admin/BatchPromotion";
import FeedbackStats from "./pages/admin/FeedbackStats";
import LeaveManager from "./pages/admin/LeaveManager";

// Import Student Pages
import StudentFeedback from "./pages/student/StudentFeedback";
import ElectiveSelector from "./pages/student/ElectiveSelector";
import IDCardGenerator from "./pages/student/IDCardGenerator";
import StudentDashboard from "./pages/student/StudentDashboard"; 
import ViewResults from "./pages/student/ViewResults"; 

// Import Faculty Pages
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import MyCourses from "./pages/faculty/MyCourses";
import AttendanceEntry from "./pages/faculty/AttendanceEntry";
import MarksEntry from "./pages/faculty/MarksEntry";
import ApplyLeave from "./pages/faculty/ApplyLeave";
import MySchedule from "./pages/faculty/MySchedule";
import MyPerformance from "./pages/faculty/MyPerformance"; // 👈 1. Added Import

// Import Shared Pages
import CourseResources from "./pages/shared/CourseResources";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />
          
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* ============================== */}
          {/* 🛡️ ADMIN PROTECTED ROUTES      */}
          {/* ============================== */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="academics" element={<AcademicStructure />} />
              <Route path="classes" element={<ClassOperations />} />
              <Route path="timetable" element={<TimetableScheduler />} />
              <Route path="exams" element={<ExamScheduler />} />
              <Route path="attendance" element={<AttendanceMonitor />} />
              <Route path="promote" element={<BatchPromotion />} />
              <Route path="fees" element={<FeeManagement />} />
              <Route path="hostel" element={<HostelAllocation />} />
              <Route path="notices" element={<AnnouncementPage />} />
              <Route path="feedback" element={<FeedbackStats />} />
              <Route path="leaves" element={<LeaveManager />} />
            </Route>
          </Route>

          {/* ============================== */}
          {/* 🛡️ FACULTY PROTECTED ROUTES    */}
          {/* ============================== */}
          <Route element={<ProtectedRoute allowedRoles={['faculty']} />}>
            <Route path="/faculty" element={<FacultyLayout />}>
              <Route index element={<FacultyDashboard />} />
              
              <Route path="schedule" element={<MySchedule />} />
              <Route path="courses" element={<MyCourses />} />
              <Route path="resources/:offeringId" element={<CourseResources />} />
              <Route path="attendance/:offeringId" element={<AttendanceEntry />} />
              <Route path="marks" element={<MarksEntry />} />
              <Route path="performance" element={<MyPerformance />} /> {/* 👈 2. Added Route */}
              <Route path="leave" element={<ApplyLeave />} />
            </Route>
          </Route>

          {/* ============================== */}
          {/* 🛡️ STUDENT PROTECTED ROUTES    */}
          {/* ============================== */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<StudentDashboard />} />
              
              <Route path="feedback" element={<StudentFeedback />} />
              <Route path="electives" element={<ElectiveSelector />} />
              <Route path="resources/:offeringId" element={<CourseResources />} />
              <Route path="id-card" element={<IDCardGenerator />} />
              <Route path="results" element={<ViewResults />} />
            </Route>
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<div>Page Not Found</div>} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;