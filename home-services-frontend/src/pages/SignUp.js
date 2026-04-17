import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/SignUp.module.css";
import axios from "axios";

export default function SignUp() {
  const navigate = useNavigate();
  const [role, setRole] = useState("client");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    bio: "",
    address: {
      country: "",
      city: "",
      street: "",
      building: "",
      floor: "",
      apartment: ""
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await axios.post(
      "http://127.0.0.1:5000/api/v1/auth/signup", 
      {
        name: formData.fullName, 
        email: formData.email,
        password: formData.password,
        role: role === "worker" ? "provider" : "client", // ⚠️ mapping
        bio: formData.bio,
        address: {
            country: formData.address.country,
            city: formData.address.city,
            street: formData.address.street,
            building: formData.address.building,
            floor: Number(formData.address.floor), // ✅ number
            apartment: formData.address.apartment
          }
        }
      );

    console.log("SUCCESS:", response.data);
    alert("Account created successfully!");

    navigate("/signin");

  } catch (error) {
    console.error("ERROR:", error.response?.data || error.message);
    alert(error.response?.data?.message || "Signup failed");
  }
};

  return (
    <div className={styles.authContainer}>
      {/* LEFT PANEL: HERO SECTION */}
      <div className={styles.authLeft}>
        <Link to="/" className={styles.brand}>
          <div className={styles.logoBox}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span className={styles.brandName}>HomeServe</span>
        </Link>
        <div className={styles.heroContent}>
          <h1>Join thousands of <br /> people who trust <br /> HomeServe daily</h1>
          <p>Create a free account to book trusted home services in your neighborhood.</p>
        </div>
      </div>

      {/* RIGHT PANEL: FORM SECTION */}
      <div className={styles.authRight}>
        <div className={styles.formWrapper}>
          <h2>Create Account</h2>
          <p className={styles.subText}>Join HomeServe — it's free!</p>

          {/* SOCIAL LOGIN LINKS */}
          <div className={styles.socialRow}>
            <button type="button" className={styles.socialBtn} onClick={() => window.location.href = '#'}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            <button type="button" className={styles.socialBtn} onClick={() => window.location.href = '#'}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05 1.72-3.11 1.72-1.01 0-1.43-.64-2.6-.64-1.19 0-1.66.62-2.55.62-.96 0-2.12-.86-3.23-1.98-2.26-2.28-3.48-6.1-3.48-9.04 0-4.14 2.33-6.4 5.25-6.4 1.11 0 1.93.43 2.72.43.71 0 1.83-.49 3.09-.49 1.25 0 2.45.54 3.19 1.49-3.15 1.63-2.64 6.13.72 7.64-.78 2.05-1.93 4.27-3.07 5.25zm-2.45-16.14c.64-.81 1.11-1.94 1.11-3.14 0-.15-.02-.3-.04-.45-1.07.05-2.13.78-2.81 1.62-.62.74-1.13 1.89-1.13 3.08 0 .17.02.35.06.5.1.01.21.02.33.02 1.01 0 1.95-.71 2.48-1.63z"/>
              </svg>
              Continue with Apple
            </button>
          </div>

          <div className={styles.divider}>
            <span>or sign up with email</span>
          </div>

          <form onSubmit={handleSubmit}>
            {/* ROLE TOGGLE */}
            <div className={styles.roleToggle}>
              <button 
                type="button" 
                className={role === "client" ? styles.activeRole : ""} 
                onClick={() => setRole("client")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                I'm a Client
              </button>
              <button 
                type="button" 
                className={role === "worker" ? styles.activeRole : ""} 
                onClick={() => setRole("worker")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                I'm a Worker
              </button>
            </div>

            <div className={styles.inputGroup}>
              <label>Full Name</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </span>
                <input name="fullName" type="text" placeholder="John Doe" required value={formData.fullName} onChange={handleChange} />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Email Address</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </span>
                <input name="email" type="email" placeholder="email@example.com" required value={formData.email} onChange={handleChange} />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Phone Number</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </span>
                <input name="phone" type="tel" placeholder="+1 (555) 000-0000" required value={formData.phone} onChange={handleChange} />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Password</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <input name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" required value={formData.password} onChange={handleChange} />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>



            {/* BIO */}
<div className={styles.inputGroup}>
  <label>Bio</label>
  <input name="bio" placeholder="Tell us about yourself" onChange={handleChange} />
</div>

{/* ADDRESS */}
<div className={styles.inputGroup}>
  <label>Country</label>
  <input name="address.country" onChange={handleChange} />
</div>

<div className={styles.inputGroup}>
  <label>City</label>
  <input name="address.city" onChange={handleChange} />
</div>

<div className={styles.inputGroup}>
  <label>Street</label>
  <input name="address.street" onChange={handleChange} />
</div>

<div className={styles.inputGroup}>
  <label>Building</label>
  <input name="address.building" onChange={handleChange} />
</div>

<div className={styles.inputGroup}>
  <label>Floor</label>
  <input name="address.floor" type="number" onChange={handleChange} />
</div>

<div className={styles.inputGroup}>
  <label>Apartment</label>
  <input name="address.apartment" onChange={handleChange} />
</div>





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