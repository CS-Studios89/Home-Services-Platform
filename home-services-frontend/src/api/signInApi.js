import { apiRequest } from "./http";

export async function loginWithEmail({ email, password }) {
  return apiRequest("/auth/login", {
    method: "POST",
    auth: false,
    body: { email, password },
  });
}

export async function fetchProfile() {
  return apiRequest("/profile");
}
