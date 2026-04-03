import apiClient from "@/lib/apiClient";
import type { Token, UserPublic } from "./types";

export async function loginApi(email: string, password: string): Promise<Token> {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);
  const { data } = await apiClient.post<Token>("/login/access-token", formData, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return data;
}

export interface SignupPayload {
  email: string;
  password: string;
  full_name: string;
  garden_code?: string;
}

export async function signupApi(payload: SignupPayload): Promise<UserPublic> {
  const { data } = await apiClient.post<UserPublic>("/users/signup", payload);
  return data;
}

export async function getMeApi(): Promise<UserPublic> {
  const { data } = await apiClient.get<UserPublic>("/users/me");
  return data;
}

export async function updateMeApi(updates: {
  full_name?: string;
  email?: string;
}): Promise<UserPublic> {
  const { data } = await apiClient.patch<UserPublic>("/users/me", updates);
  return data;
}

export async function deleteMeApi(): Promise<{ message: string }> {
  const { data } = await apiClient.delete<{ message: string }>("/users/me");
  return data;
}

export async function updatePasswordApi(
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> {
  const { data } = await apiClient.patch<{ message: string }>("/users/me/password", {
    current_password: currentPassword,
    new_password: newPassword,
  });
  return data;
}
