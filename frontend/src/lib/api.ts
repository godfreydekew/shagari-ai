import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/v1"; 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types matching the FastAPI models
export interface UserPublic {
  id: string;
  email: string;
  full_name: string | null;
  phone_number: string | null;
  address: string | null;
  is_active: boolean;
  is_superuser: boolean;
  is_admin: boolean;
  created_at: string | null;
}

export interface Token {
  access_token: string;
  token_type: string;
}

// ─── Auth ───────────────────────────────────────────────────────────────────

export async function loginApi(email: string, password: string): Promise<Token> {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);
  const { data } = await api.post<Token>("/login/access-token", formData, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return data;
}

export async function signupApi(email: string, password: string, fullName?: string): Promise<UserPublic> {
  const { data } = await api.post<UserPublic>("/users/signup", {
    email,
    password,
    full_name: fullName || null,
  });
  return data;
}

export async function getMeApi(): Promise<UserPublic> {
  const { data } = await api.get<UserPublic>("/users/me");
  return data;
}

// ─── Profile ────────────────────────────────────────────────────────────────

export async function updateMeApi(updates: { full_name?: string; email?: string }): Promise<UserPublic> {
  const { data } = await api.patch<UserPublic>("/users/me", updates);
  return data;
}

export async function updatePasswordApi(currentPassword: string, newPassword: string): Promise<{ message: string }> {
  const { data } = await api.patch<{ message: string }>("/users/me/password", {
    current_password: currentPassword,
    new_password: newPassword,
  });
  return data;
}

export async function deleteMeApi(): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>("/users/me");
  return data;
}

// ─── Password Recovery ──────────────────────────────────────────────────────

export async function requestPasswordRecoveryApi(email: string): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(`/password-recovery/${email}`);
  return data;
}

export async function resetPasswordApi(token: string, newPassword: string): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>("/reset-password/", {
    token,
    new_password: newPassword,
  });
  return data;
}

export default api;
