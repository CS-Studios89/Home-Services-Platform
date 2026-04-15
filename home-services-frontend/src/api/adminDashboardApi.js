import { apiRequest } from "./http";

export async function fetchAdminUsers() {
  return apiRequest("/admin/users?limit=200");
}

export async function fetchAdminServices() {
  return apiRequest("/admin/services?limit=200");
}
