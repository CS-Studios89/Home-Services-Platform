import React, { useEffect, useMemo, useState } from "react";
import styles from "../styles/WorkerDashboard.module.css";
import {
  acceptProviderBooking,
  fetchProviderBookingRequests,
  rejectProviderBooking,
} from "../api/workerDashboardApi";

const WorkerDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadRequests = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await fetchProviderBookingRequests();
      setRequests(data || []);
    } catch (err) {
      setError(err.message || "Failed to load booking requests.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAction = async (bookingId, action) => {
    setActionLoadingId(bookingId);
    setError("");
    try {
      if (action === "accept") {
        await acceptProviderBooking(bookingId);
      } else {
        await rejectProviderBooking(bookingId);
      }
      await loadRequests();
    } catch (err) {
      setError(err.message || "Failed to update booking status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const totalRevenue = useMemo(
    () => requests.reduce((sum, req) => sum + Number(req.total || 0), 0),
    [requests]
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Worker Dashboard</h1>
          <p>Track your upcoming jobs and manage your availability.</p>
        </div>
        <div className={styles.chip}>Today • Worker View</div>
      </header>

      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Pending Requests</span>
          <strong className={styles.statValue}>{requests.length}</strong>
          <span className={styles.statHint}>Waiting for your response</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Potential Revenue</span>
          <strong className={styles.statValue}>${totalRevenue.toFixed(2)}</strong>
          <span className={styles.statHint}>From current pending requests</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Accepted Jobs</span>
          <strong className={styles.statValue}>0</strong>
          <span className={styles.statHint}>Placeholder until accepted list endpoint</span>
        </div>
      </section>
      {error && <p>{error}</p>}
      {isLoading && <p>Loading booking requests...</p>}

      <section className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Booking Requests</h2>
          </div>
          <ul className={styles.requestList}>
            {!requests.length && !isLoading && <p>No pending requests right now.</p>}
            {requests.map((req) => (
              <li key={req.booking_id} className={styles.requestItem}>
                <div className={styles.requestMain}>
                  <div>
                    <h3>{req.service_name || req.title || "Service Request"}</h3>
                    <p className={styles.clientName}>Client: {req.client_name || "-"}</p>
                    <p className={styles.meta}>
                      {new Date(req.start_at).toLocaleDateString()} •{" "}
                      {new Date(req.start_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className={styles.badgeRow}>
                    <span
                      className={
                        req.booking_status === "requested"
                          ? styles.statusNew
                          : styles.statusConfirmed
                      }
                    >
                      {req.booking_status}
                    </span>
                    <span className={styles.price}>${Number(req.total || 0).toFixed(2)}</span>
                  </div>
                </div>
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => handleAction(req.booking_id, "reject")}
                    disabled={actionLoadingId === req.booking_id}
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    className={styles.primaryBtn}
                    onClick={() => handleAction(req.booking_id, "accept")}
                    disabled={actionLoadingId === req.booking_id}
                  >
                    Accept
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Availability</h2>
          </div>
          <p className={styles.helperText}>
            Calendar integration will appear here. For now, this is a preview of
            how your weekly schedule could look.
          </p>
          <div className={styles.availabilityGrid}>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className={styles.dayBlock}>
                <span className={styles.dayLabel}>{day}</span>
                <span className={styles.slot}>09:00 – 13:00</span>
                <span className={styles.slotMuted}>+ Add slot</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default WorkerDashboard;