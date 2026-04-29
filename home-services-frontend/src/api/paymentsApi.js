import { apiRequest } from "./http";

export async function fetchUserPayments() {
  return apiRequest("/payments");
}
