import { apiRequest } from "./http";

export async function fetchProviderBookingRequests() {
  return apiRequest("/booking/pending");
}

export async function fetchProviderBookings() {
  return apiRequest("/booking/provider");
}

export async function acceptProviderBooking(bookingId) {
  return apiRequest(`/booking/${bookingId}/accept`);
}

export async function rejectProviderBooking(bookingId) {
  return apiRequest(`/booking/${bookingId}/reject`, { method: "DELETE" });
}
