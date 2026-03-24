import React, { useState } from "react";
import styles from "../styles/WorkerDashboard.module.css";

const WorkerDashboard = () => {
  const [requests] = useState([
    {
      id: 1,
      client: "Maya Khoury",
      service: "House Cleaning",
      date: "12 Mar 2026",
      time: "10:00 AM",
      status: "New",
      price: 60,
    },
    {
      id: 2,
      client: "Karim Nassar",
      service: "Deep Cleaning",
      date: "14 Mar 2026",
      time: "3:00 PM",
      status: "Confirmed",
      price: 90,
    },
  ]);

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
          <span className={styles.statLabel}>Upcoming Jobs</span>
          <strong className={styles.statValue}>{requests.length}</strong>
          <span className={styles.statHint}>In the next days</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Completed This Week</span>
          <strong className={styles.statValue}>4</strong>
          <span className={styles.statHint}>Great work, keep going</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Average Rating</span>
          <strong className={styles.statValue}>4.9⭐</strong>
          <span className={styles.statHint}>Based on recent clients</span>
        </div>
      </section>

      <section className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Booking Requests</h2>
          </div>
          <ul className={styles.requestList}>
            {requests.map((req) => (
              <li key={req.id} className={styles.requestItem}>
                <div className={styles.requestMain}>
                  <div>
                    <h3>{req.service}</h3>
                    <p className={styles.clientName}>Client: {req.client}</p>
                    <p className={styles.meta}>
                      {req.date} • {req.time}
                    </p>
                  </div>
                  <div className={styles.badgeRow}>
                    <span
                      className={
                        req.status === "New"
                          ? styles.statusNew
                          : styles.statusConfirmed
                      }
                    >
                      {req.status}
                    </span>
                    <span className={styles.price}>${req.price}</span>
                  </div>
                </div>
                <div className={styles.actions}>
                  <button type="button" className={styles.secondaryBtn}>
                    Decline
                  </button>
                  <button type="button" className={styles.primaryBtn}>
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