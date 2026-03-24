import React, { useState } from "react";
import styles from "../styles/AdminDashboard.module.css";

const AdminDashboard = () => {
  const [users] = useState([
    { id: 1, name: "Rami Mansour", role: "Worker", status: "Active" },
    { id: 2, name: "Layla Haddad", role: "Worker", status: "Pending" },
    { id: 3, name: "Admin User", role: "Admin", status: "Active" },
  ]);

  const [services] = useState([
    { id: 1, name: "House Cleaning", bookings: 128, rating: 4.8 },
    { id: 2, name: "Babysitting", bookings: 94, rating: 4.9 },
    { id: 3, name: "Home Cooking", bookings: 57, rating: 4.7 },
  ]);

  const totalBookings = services.reduce(
    (sum, service) => sum + service.bookings,
    0
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Admin Dashboard</h1>
          <p>Monitor your platform activity and manage users and services.</p>
        </div>
        <div className={styles.chip}>Today • Overview</div>
      </header>

      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Bookings</span>
          <strong className={styles.statValue}>{totalBookings}</strong>
          <span className={styles.statHint}>Across all services</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Active Workers</span>
          <strong className={styles.statValue}>
            {users.filter((u) => u.role === "Worker" && u.status === "Active").length}
          </strong>
          <span className={styles.statHint}>Verified and ready to work</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Pending Verifications</span>
          <strong className={styles.statValue}>
            {users.filter((u) => u.status === "Pending").length}
          </strong>
          <span className={styles.statHint}>Review required</span>
        </div>
      </section>

      <section className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Users</h2>
            <span className={styles.badge}>{users.length} total</span>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.role}</td>
                  <td>
                    <span
                      className={
                        user.status === "Active"
                          ? styles.statusActive
                          : styles.statusPending
                      }
                    >
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <button className={styles.linkButton}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Services</h2>
            <span className={styles.badge}>{services.length} active</span>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Service</th>
                <th>Bookings</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id}>
                  <td>{service.name}</td>
                  <td>{service.bookings}</td>
                  <td>⭐ {service.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;