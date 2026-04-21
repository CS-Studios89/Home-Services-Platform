import React, { useEffect, useState } from "react";
import styles from "../styles/Orders.module.css";
import { cancelUserOrder, fetchOrderItems, fetchUserOrders } from "../api/ordersApi";

const FINAL_STATUSES = ["cancelled", "completed"];

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionOrderId, setActionOrderId] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderItemsById, setOrderItemsById] = useState({});
  const [itemsLoadingId, setItemsLoadingId] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchUserOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleCancel = async (orderId) => {
    setActionOrderId(orderId);
    setError("");
    try {
      await cancelUserOrder(orderId);
      await loadOrders();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to cancel order.");
    } finally {
      setActionOrderId(null);
    }
  };

  const handleToggleItems = async (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }

    setExpandedOrderId(orderId);
    if (orderItemsById[orderId]) return;

    setItemsLoadingId(orderId);
    setError("");
    try {
      const items = await fetchOrderItems(orderId);
      setOrderItemsById((prev) => ({ ...prev, [orderId]: Array.isArray(items) ? items : [] }));
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load order items.");
      setOrderItemsById((prev) => ({ ...prev, [orderId]: [] }));
    } finally {
      setItemsLoadingId(null);
    }
  };

  return (
    <div className={styles.wrapper}>
      <section className={styles.hero}>
        <h1>My Orders</h1>
        <p>View your service orders and cancel active ones when needed.</p>
      </section>

      {loading && <p className={styles.info}>Loading your orders...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !orders.length && <div className={styles.emptyCard}>No orders found yet.</div>}

      <div className={styles.list}>
        {orders.map((order) => {
          const status = (order.status || "").toLowerCase();
          const canCancel = !FINAL_STATUSES.includes(status);
          const createdAt = order.created_at
            ? new Date(order.created_at).toLocaleString()
            : "N/A";

          return (
            <article key={order.id} className={styles.card}>
              <div className={styles.cardTop}>
                <h3>Order #{order.id}</h3>
                <span className={`${styles.badge} ${styles[status] || styles.defaultStatus}`}>
                  {order.status || "Unknown"}
                </span>
              </div>

              <div className={styles.metaGrid}>
                <p>
                  <strong>Total:</strong> {order.curr || "$"} {order.total || 0}
                </p>
                <p>
                  <strong>Created:</strong> {createdAt}
                </p>
              </div>

              <button
                type="button"
                className={styles.itemsBtn}
                onClick={() => handleToggleItems(order.id)}
              >
                {expandedOrderId === order.id ? "Hide Items" : "Show Items"}
              </button>

              {expandedOrderId === order.id && (
                <div className={styles.itemsBox}>
                  {itemsLoadingId === order.id && <p className={styles.info}>Loading items...</p>}
                  {!itemsLoadingId && !(orderItemsById[order.id] || []).length && (
                    <p className={styles.info}>No items found for this order.</p>
                  )}
                  {!itemsLoadingId &&
                    (orderItemsById[order.id] || []).map((item) => (
                      <div key={item.id} className={styles.itemRow}>
                        <p>
                          <strong>{item.title || item.service_name || "Service Item"}</strong>
                        </p>
                        <p>Provider: {item.provider_name || "-"}</p>
                        <p>
                          {item.hours || 0}h x {order.curr || "$"} {item.price || 0}
                        </p>
                        <p>
                          Item Total: {order.curr || "$"} {item.total || 0}
                        </p>
                      </div>
                    ))}
                </div>
              )}

              {canCancel && (
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => handleCancel(order.id)}
                  disabled={actionOrderId === order.id}
                >
                  {actionOrderId === order.id ? "Cancelling..." : "Cancel Order"}
                </button>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default Orders;
