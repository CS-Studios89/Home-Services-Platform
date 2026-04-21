import React, { useEffect, useState } from "react";
import { fetchUserPayments } from "../api/paymentsApi";
import styles from "../styles/Payments.module.css";

function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPayments = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchUserPayments();
        setPayments(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load payments.");
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, []);

  return (
    <div className={styles.wrapper}>
      <section className={styles.hero}>
        <h1>My Payments</h1>
        <p>Track all payment records for your orders.</p>
      </section>

      {loading && <p className={styles.info}>Loading your payments...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!loading && !payments.length && <div className={styles.emptyCard}>No payments found yet.</div>}

      <div className={styles.list}>
        {payments.map((payment) => {
          const createdAt = payment.created_at
            ? new Date(payment.created_at).toLocaleString()
            : "N/A";
          const status = (payment.status || "").toLowerCase();

          return (
            <article className={styles.card} key={payment.id}>
              <div className={styles.cardTop}>
                <h3>Payment #{payment.id}</h3>
                <span className={`${styles.badge} ${styles[status] || styles.defaultStatus}`}>
                  {payment.status || "Unknown"}
                </span>
              </div>

              <div className={styles.metaGrid}>
                <p>
                  <strong>Order ID:</strong> {payment.order_id}
                </p>
                <p>
                  <strong>Amount:</strong> {payment.curr || "USD"} {payment.amount || 0}
                </p>
                <p>
                  <strong>Method:</strong> {payment.method || "-"}
                </p>
                <p>
                  <strong>Type:</strong> {payment.type || "-"}
                </p>
                <p>
                  <strong>Reference:</strong> {payment.ref || "-"}
                </p>
                <p>
                  <strong>Created:</strong> {createdAt}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default Payments;
