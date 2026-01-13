// client/src/utils/api.js
import axios from "axios";

// This points to your RUNNING Backend Server
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// This automatically attaches your Login Token to every request
API.interceptors.request.use((req) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.token) {
    req.headers.Authorization = `Bearer ${user.token}`;
  }
  return req;
});

export default API;