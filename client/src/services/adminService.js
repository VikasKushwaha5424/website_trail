import api from "../utils/api";

// Fetch users with pagination, filtering, and search
// Updated to accept 'search' parameter (default is empty string)
export const fetchUsersList = async (role, page = 1, limit = 10, search = "") => {
  try {
    // Append search query if it exists
    const queryParams = `role=${role}&page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
    
    const response = await api.get(`/admin/users?${queryParams}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch users";
  }
};

// Add a new user
export const addUser = async (userData) => {
  try {
    const response = await api.post("/admin/add-user", userData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to add user";
  }
};

// Update an existing user
export const updateUser = async (userData) => {
  try {
    const response = await api.put("/admin/update-user", userData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to update user";
  }
};

// Delete a user
export const deleteUser = async (userId) => {
  try {
    // RESTful Standard: DELETE /admin/users/:id (No body required)
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to delete user";
  }
};