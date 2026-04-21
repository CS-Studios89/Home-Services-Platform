import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "../styles/Header.module.css";

const HouseIcon = () => (
  <svg
    className={styles.houseSvg}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    className={styles.closeIconSvg}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden
  >
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const Header = ({ user, setUser }) => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    if (menuOpen) {
      window.addEventListener("keydown", onKeyDown);
    }
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const handleLogout = () => {
    setUser(null);
    setMenuOpen(false);
  };

  const navLinkClass = (path) =>
    location.pathname === path ? styles.drawerLinkActive : styles.drawerLink;

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <div className={styles.logoIconWrap} aria-hidden>
          <HouseIcon />
        </div>
        <Link to="/" className={styles.logoText} onClick={() => setMenuOpen(false)}>
          Home<span className={styles.highlight}>Serve</span>
        </Link>
      </div>

      <nav className={styles.centerNav} aria-label="Main">
        <Link
          to="/"
          className={location.pathname === "/" ? styles.active : ""}
        >
          Home
        </Link>
        <Link
          to="/services"
          className={location.pathname === "/services" ? styles.active : ""}
        >
          Services
        </Link>
        <Link
          to="/workers"
          className={location.pathname === "/workers" ? styles.active : ""}
        >
          Find Workers
        </Link>
        <Link
          to="/cart"
          className={location.pathname === "/cart" ? styles.active : ""}
        >
          Cart
        </Link>
        <Link
          to="/orders"
          className={location.pathname === "/orders" ? styles.active : ""}
        >
          Orders
        </Link>
      </nav>

      <div className={styles.rightNav}>
        {user ? (
          <>
            {user.role === "worker" && (
              <Link to="/worker-dashboard">Dashboard</Link>
            )}
            {user.role === "admin" && <Link to="/admin">Admin</Link>}
            <button className={styles.logoutBtn} type="button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/signin" className={styles.signin}>
              Sign In
            </Link>
            <Link to="/signup" className={styles.getStarted}>
              Sign Up
            </Link>
          </>
        )}
      </div>

      <button
        type="button"
        className={styles.menuBtn}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        aria-controls="mobile-navigation"
        onClick={() => setMenuOpen((o) => !o)}
      >
        <span className={styles.menuBar} />
        <span className={styles.menuBar} />
        <span className={styles.menuBar} />
      </button>

      {menuOpen && (
        <div
          className={styles.overlay}
          role="presentation"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        id="mobile-navigation"
        className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ""}`}
        aria-hidden={!menuOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
      >
        <div className={styles.drawerHeader}>
          <div className={styles.logo}>
            <div className={styles.logoIconWrap} aria-hidden>
              <HouseIcon />
            </div>
            <Link
              to="/"
              className={styles.logoText}
              onClick={() => setMenuOpen(false)}
            >
              Home<span className={styles.highlight}>Serve</span>
            </Link>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          >
            <CloseIcon />
          </button>
        </div>

        <nav className={styles.drawerNav} aria-label="Mobile">
          <Link
            to="/"
            className={navLinkClass("/")}
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/services"
            className={navLinkClass("/services")}
            onClick={() => setMenuOpen(false)}
          >
            Services
          </Link>
          <Link
            to="/workers"
            className={navLinkClass("/workers")}
            onClick={() => setMenuOpen(false)}
          >
            Find Workers
          </Link>
          <Link
            to="/cart"
            className={navLinkClass("/cart")}
            onClick={() => setMenuOpen(false)}
          >
            Cart
          </Link>
          <Link
            to="/orders"
            className={navLinkClass("/orders")}
            onClick={() => setMenuOpen(false)}
          >
            Orders
          </Link>
        </nav>

        <div className={styles.drawerFooter}>
          {user ? (
            <div className={styles.drawerUserActions}>
              {user.role === "worker" && (
                <Link
                  to="/worker-dashboard"
                  className={styles.drawerOutlineBtn}
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className={styles.drawerOutlineBtn}
                  onClick={() => setMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
              <button
                type="button"
                className={styles.drawerOutlineBtn}
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className={styles.drawerAuthRow}>
              <Link
                to="/signin"
                className={styles.drawerOutlineBtn}
                onClick={() => setMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className={styles.drawerPrimaryBtn}
                onClick={() => setMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </aside>
    </header>
  );
};

export default Header;
