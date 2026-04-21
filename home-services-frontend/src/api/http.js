import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api/v1";

const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export function getStoredToken() {
  return (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozLCJpYXQiOjE3NzY3OTQ5NzgsImV4cCI6ODY0MDE3NzY3MDg1Nzh9.74ER7OxqIt_M2SBDs1hHQL6r-luldvoGxwhFvFO5oMI"
    // localStorage.getItem("authToken") ||
    // sessionStorage.getItem("authToken") ||
    // ""
  );
}


// Generic API request
export async function apiRequest(path, { method = "GET", body, auth = true } = {}) {
  const headers = {};

  if (auth) {
    const token = getStoredToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  try {
    const response = await http.request({
      url: path,
      method,
      headers,
      data: body,
    });
    return response.data;
  } catch (error) {
    const message =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error.message ||
      "Request failed";
    throw new Error(message);
  }
}
