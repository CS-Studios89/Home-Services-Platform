import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "../styles/SignIn.module.css";
import { fetchProfile, loginWithEmail } from "../api/signInApi";

const SignIn = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const auth = await loginWithEmail({ email, password });
      localStorage.setItem("authToken", auth.token);

      const profile = await fetchProfile();
      setUser({
        id: profile.id,
        name: profile.name,
        role: profile.role,
      });

      const roleRoute =
        profile.role === "provider"
          ? "/worker-dashboard"
          : profile.role === "admin"
            ? "/admin"
            : "/";
      navigate(roleRoute);
    } catch (err) {
      setError(err.message || "Sign in failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* LEFT PANEL */}
      <div className={styles.leftSide}>
        <Link to="/" className={styles.brand}>
          <div className={styles.homeIconBox}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <span className={styles.brandName}>HomeServe</span>
        </Link>
        <h1>Welcome back to your trusted home services platform</h1>
        <p>Manage bookings, track services, and connect with trusted professionals.</p>
        <ul className={styles.statsList}>
          <li><span className={styles.dot}></span> 5,000+ satisfied customers</li>
          <li><span className={styles.dot}></span> 1,200+ verified workers</li>
          <li><span className={styles.dot}></span> 98% satisfaction rate</li>
        </ul>
      </div>

      {/* RIGHT PANEL */}
      <div className={styles.rightSide}>
        <div className={styles.formBox}>
          <h2>Sign In</h2>
          <p className={styles.subtitle}>Choose your account type to continue.</p>

          {/* STACKED SOCIAL LINKS */}
          <div className={styles.socialRow}>
            <button type="button" className={styles.socialBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>
            <button type="button" className={styles.socialBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05 1.72-3.11 1.72-1.01 0-1.43-.64-2.6-.64-1.19 0-1.66.62-2.55.62-.96 0-2.12-.86-3.23-1.98-2.26-2.28-3.48-6.1-3.48-9.04 0-4.14 2.33-6.4 5.25-6.4 1.11 0 1.93.43 2.72.43.71 0 1.83-.49 3.09-.49 1.25 0 2.45.54 3.19 1.49-3.15 1.63-2.64 6.13.72 7.64-.78 2.05-1.93 4.27-3.07 5.25zm-2.45-16.14c.64-.81 1.11-1.94 1.11-3.14 0-.15-.02-.3-.04-.45-1.07.05-2.13.78-2.81 1.62-.62.74-1.13 1.89-1.13 3.08 0 .17.02.35.06.5.1.01.21.02.33.02 1.01 0 1.95-.71 2.48-1.63z"/></svg>
              Continue with Apple
            </button>
          </div>

          <div className={styles.divider}><span>or use email</span></div>

          {/* ROLE TOGGLE */}
          <div className={styles.roleToggle}>
            <button className={role === "client" ? styles.activeTab : ""} onClick={() => setRole("client")}>Client</button>
            <button className={role === "worker" ? styles.activeTab : ""} onClick={() => setRole("worker")}>Worker</button>
            <button className={role === "admin" ? styles.activeTab : ""} onClick={() => setRole("admin")}>Admin</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label>Email Address</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span>
                <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.labelRow}>
                <label>Password</label>
                <a href="#" className={styles.forgotPass}>Forgot password?</a>
              </div>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <span className={styles.eyeIcon} onClick={() => setShowPassword(!showPassword)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={showPassword ? "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" : "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"}/><circle cx="12" cy="12" r="3"/></svg>
                </span>
              </div>
            </div>

            <button type="submit" className={styles.signInBtn} disabled={isSubmitting}>
              {isSubmitting ? "Signing In..." : `➜ Sign In as ${role}`}
            </button>
          </form>
          {error && (
            <p className={styles.subtitle} role="alert">
              {error}
            </p>
          )}
          <p className={styles.signupText}>Don’t have an account? <Link to="/signup">Sign Up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;