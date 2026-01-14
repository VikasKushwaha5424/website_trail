import api from "../utils/api";

export const loginUser = async (rollNumber, password) => {
  try {
    // Matches your Backend: POST /api/auth/login
    const response = await api.post("/auth/login", { rollNumber, password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Login failed";
  }
};

export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};