import { apiClient } from "./apiClient";

export const SESSION_COOKIE = "ct_session";

export function login({ email, password }) {
  return apiClient.post("/auth/login", { email, password });
}

export function register({ name, email, password }) {
  return apiClient.post("/auth/register", { name, email, password });
}

export function logout() {
  return apiClient.post("/auth/logout");
}

