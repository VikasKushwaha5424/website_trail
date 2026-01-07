import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Check if user is logged in
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/"); // If not logged in, kick them back to Login
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user"); // Clear data
    navigate("/"); // Go back to login
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <h1>Welcome, {user.username}!</h1>
        <span style={styles.roleTag}>{user.role}</span>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>

      {/* Role-Based Content Section */}
      <div style={styles.content}>
        
        {/* If user is a STUDENT */}
        {user.role === "STUDENT" && (
            <div style={styles.card}>
                <h3>🎓 Student Portal</h3>
                <p>View your marks, attendance, and schedule here.</p>
                <button style={styles.actionBtn}>View My Marks</button>
            </div>
        )}

        {/* If user is a TEACHER */}
        {user.role === "TEACHER" && (
            <div style={styles.card}>
                <h3>👨‍🏫 Teacher Portal</h3>
                <p>Upload marks and manage student attendance.</p>
                <button style={styles.actionBtn}>Upload Marks</button>
            </div>
        )}

         {/* If user is PRINCIPAL */}
         {user.role === "PRINCIPAL" && (
            <div style={styles.card}>
                <h3>🏛️ Principal Dashboard</h3>
                <p>View college statistics and faculty reports.</p>
                <button style={styles.actionBtn}>View Reports</button>
            </div>
        )}
        
      </div>
    </div>
  );
};

const styles = {
  container: { padding: "20px", fontFamily: "Arial, sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #333", paddingBottom: "10px" },
  roleTag: { backgroundColor: "#eee", padding: "5px 10px", borderRadius: "5px", fontWeight: "bold" },
  logoutBtn: { backgroundColor: "red", color: "white", border: "none", padding: "8px 15px", cursor: "pointer" },
  content: { marginTop: "20px" },
  card: { border: "1px solid #ddd", padding: "20px", borderRadius: "8px", maxWidth: "400px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" },
  actionBtn: { marginTop: "10px", padding: "10px 15px", backgroundColor: "#007BFF", color: "white", border: "none", cursor: "pointer" }
};

export default Dashboard;