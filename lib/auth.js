import { apiClient } from "./apiClient";

// Nome do cookie httpOnly com a sessão JWT — mantido em sincronia com proxy.js,
// que só enxerga a presença do cookie (não o payload, que fica no back-end).
export const SESSION_COOKIE = "ct_session";

export function login({ email, password }) {
  return apiClient.post("/auth/login", { email, password });
}

export function verifyTotp({ challengeToken, code }) {
  return apiClient.post("/auth/2fa/verify", { challengeToken, code });
}

export function setupTotp() {
  return apiClient.post("/auth/2fa/setup");
}

export function register({ name, email, password }) {
  return apiClient.post("/auth/register", { name, email, password });
}

export function logout() {
  return apiClient.post("/auth/logout");
}

export function getCurrentUser() {
  return apiClient.get("/auth/me");
}
