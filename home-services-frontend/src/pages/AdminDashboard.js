import React, { useEffect, useMemo, useState } from "react";
import styles from "../styles/AdminDashboard.module.css";
import { fetchAdminServices, fetchAdminUsers } from "../api/adminDashboardApi";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [usersData, servicesData] = await Promise.all([
          fetchAdminUsers(),
          fetchAdminServices(),
        ]);
        setUsers(usersData.items || []);
        setServices(servicesData.items || []);
      } catch (err) {
        setError(err.message || "Failed to load admin dashboard.");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const totalBookings = useMemo(
    () => services.reduce((sum, service) => sum + Number(service.offering_count || 0), 0),
    [services]
  );
  const activeWorkers = useMemo(
    () => users.filter((u) => u.role === "provider" && u.status === "active").length,
    [users]
  );
  const pendingVerifications = useMemo(
    () => users.filter((u) => u.status !== "active").length,
    [users]
  );

  if (isLoading) {
    return (
      <div className={styles.page}>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

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
          <span className={styles.statLabel}>Total Active Offerings</span>
          <strong className={styles.statValue}>{totalBookings}</strong>
          <span className={styles.statHint}>Across all service categories</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Active Workers</span>
          <strong className={styles.statValue}>{activeWorkers}</strong>
          <span className={styles.statHint}>Verified and ready to work</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Pending Verifications</span>
          <strong className={styles.statValue}>{pendingVerifications}</strong>
          <span className={styles.statHint}>Review required</span>
        </div>
      </section>
      {error && <p>{error}</p>}

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
                        user.status === "active"
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
                  <td>{service.offering_count}</td>
                  <td>n/a</td>
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