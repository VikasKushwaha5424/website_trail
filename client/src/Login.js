import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        userId,
        password,
      });

      // 1. Save user info to Local Storage (Browser memory)
      // This allows other pages to know who is logged in
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // 2. Redirect to Dashboard
      navigate("/dashboard"); 

    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div style={styles.container}>
      <h2>College Portal Login</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="text"
          placeholder="User ID (e.g., 21CSE045)"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Login</button>
        {error && <p style={styles.error}>{error}</p>}
      </form>
    </div>
  );
};

const styles = {
  container: { textAlign: "center", marginTop: "100px" },
  form: { display: "flex", flexDirection: "column", width: "300px", margin: "auto" },
  input: { padding: "10px", marginBottom: "10px", fontSize: "16px" },
  button: { padding: "10px", backgroundColor: "#007BFF", color: "white", border: "none", cursor: "pointer", fontSize: "16px" },
  error: { color: "red", marginTop: "10px" }
};

export default Login;