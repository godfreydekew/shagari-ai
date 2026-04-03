import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/v1"; 

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;

/** Extract a human-readable message from any axios error. */
export function getApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return detail.map((d: any) => d.msg).join(", ");
    return error.message || "An unexpected error occurred";
  }
  return "An unexpected error occurred";
}
