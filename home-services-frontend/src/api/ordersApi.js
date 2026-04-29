import { apiRequest } from "./http";

export async function fetchUserOrders() {
  return apiRequest("/orders");
}

export async function cancelUserOrder(orderId) {
  return apiRequest(`/orders/${orderId}`, {
    method: "DELETE",
  });
}

export async function fetchOrderItems(orderId) {
  return apiRequest(`/orders/${orderId}/items`);
}

export async function payOrder(paymentInfo) {
  return apiRequest("/payments", {
    method: "POST",
    body: { info: paymentInfo },
  });
}
