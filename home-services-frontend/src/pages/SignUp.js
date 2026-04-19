import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/SignUp.module.css";

export default function SignUp() {
  const navigate = useNavigate();

  const [role, setRole] = useState("client");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    adminPassword: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Admin validation
    if (role === "admin" && !formData.adminPassword) {
      alert("Admin secret password is required!");
      return;
    }

    console.log("Creating Account:", { role, ...formData });

    alert(`Account created successfully as ${role}!`);
    navigate("/signin");
  };

  return (
    <div className={styles.authContainer}>
      {/* LEFT PANEL */}
      <div className={styles.authLeft}>
        <Link to="/" className={styles.brand}>
          <div className={styles.logoBox}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span className={styles.brandName}>HomeServe</span>
        </Link>

        <div className={styles.heroContent}>
          <h1>
            Join thousands of <br />
            people who trust <br />
            HomeServe daily
          </h1>
          <p>Create a free account to book trusted home services.</p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className={styles.authRight}>
        <div className={styles.formWrapper}>
          <h2>Create Account</h2>
          <p className={styles.subText}>Join HomeServe — it's free!</p>

          <form onSubmit={handleSubmit}>
            {/* ROLE TOGGLE */}
            <div className={styles.roleToggle}>
              <button
                type="button"
                className={role === "client" ? styles.activeRole : ""}
                onClick={() => setRole("client")}
              >
                Client
              </button>

              <button
                type="button"
                className={role === "worker" ? styles.activeRole : ""}
                onClick={() => setRole("worker")}
              >
                Worker
              </button>

              <button
                type="button"
                className={role === "admin" ? styles.activeRole : ""}
                onClick={() => setRole("admin")}
              >
                Admin
              </button>
            </div>

            {/* FULL NAME */}
            <div className={styles.inputGroup}>
              <label>Full Name</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  👤
                </span>
                <input
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className={styles.inputGroup}>
              <label>Email Address</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>✉️</span>
                <input
                  name="email"
                  type="email"
                  placeholder="email@example.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* PHONE */}
            <div className={styles.inputGroup}>
              <label>Phone Number</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>📞</span>
                <input
                  name="phone"
                  type="tel"
                  placeholder="+961..."
                  required
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className={styles.inputGroup}>
              <label>Password</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>🔒</span>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  👁️
                </button>
              </div>
            </div>

            {/* ADMIN PASSWORD */}
            {role === "admin" && (
              <div className={styles.inputGroup}>
                <label>Admin Secret Password</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>🛡️</span>
                  <input
                    name="adminPassword"
                    type="password"
                    placeholder="Enter admin secret"
                    required
                    value={formData.adminPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {/* SUBMIT */}
            <button type="submit" className={styles.submitBtn}>
              Create {role.charAt(0).toUpperCase() + role.slice(1)} Account
            </button>
          </form>

          <p className={styles.signInLink}>
            Already have an account? <Link to="/signin">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}