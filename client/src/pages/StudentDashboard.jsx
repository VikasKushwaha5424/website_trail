// client/src/pages/StudentDashboard.jsx
import { useEffect, useState, useContext } from "react";
import API from "../utils/api";
import { AuthContext } from "../context/AuthContext";

const StudentDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // Fetch Profile Data
    API.get("/student/profile")
      .then((res) => setProfile(res.data))
      .catch((err) => console.error("Failed to load profile", err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-md mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome, {user?.name} 👋
        </h1>
        <button 
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h2 className="text-xl font-bold mb-4 text-gray-700">Student Profile</h2>
          {profile ? (
            <div className="space-y-2">
              <p><span className="font-semibold">Name:</span> {profile.firstName} {profile.lastName}</p>
              <p><span className="font-semibold">Roll Number:</span> {profile.rollNumber}</p>
              <p><span className="font-semibold">Department:</span> {profile.departmentId?.name || "N/A"}</p>
              <p><span className="font-semibold">Current Semester:</span> {profile.currentSemester}</p>
            </div>
          ) : (
            <p className="text-gray-500 animate-pulse">Loading profile...</p>
          )}
        </div>

        {/* Quick Actions (Placeholder) */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <h2 className="text-xl font-bold mb-4 text-gray-700">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-semibold">
              View Attendance
            </button>
            <button className="p-4 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 font-semibold">
              Check Results
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;