import React from "react";
import { Link } from "react-router-dom";
import styles from "../styles/Home.module.css";
import heroImage from "../assets/hero-home.png";

const Home = () => {
  return (
    <div className={styles.wrapper}>
      <section
        className={styles.hero}
        style={{ backgroundImage: `url(${heroImage})` }}
        aria-label="Hero"
      >
        <div className={styles.heroOverlay}>
          <p className={styles.heroEyebrow}>Home services, simplified</p>
          <h1 className={styles.heroTitle}>
            Trusted home services,
            <br />
            right at your door
          </h1>
          <p className={styles.heroLead}>
            Book verified cleaners, babysitters, and personal chefs in minutes.
            Professional, safe, and affordable—everything you need in one place.
          </p>
          <div className={styles.heroActions}>
            <Link to="/services" className={styles.btnPrimary}>
              Browse services
            </Link>
            <Link to="/offerings" className={styles.btnSecondary}>
              Find workers
            </Link>
          </div>
          <div className={styles.trustBadges}>
            <span>Background checked</span>
            <span>Insured providers</span>
            <span>Satisfaction guaranteed</span>
          </div>
        </div>
      </section>

      <section className={styles.statsBar} aria-label="Platform stats">
        <div className={styles.statItem}>
          <h2>5,000+</h2>
          <p>Happy clients</p>
        </div>
        <div className={styles.statItem}>
          <h2>1,200+</h2>
          <p>Verified workers</p>
        </div>
        <div className={styles.statItem}>
          <h2>98%</h2>
          <p>Satisfaction rate</p>
        </div>
        <div className={styles.statItem}>
          <h2>24/7</h2>
          <p>Support</p>
        </div>
      </section>

      <section className={styles.section}>
        <span className={styles.subtitle}>What we offer</span>
        <h2 className={styles.sectionTitle}>Our services</h2>
        <p className={styles.sectionDesc}>
          Professional home services tailored to your schedule and budget.
        </p>
        <div className={styles.servicesGrid}>
          <article className={styles.serviceCard}>
            <span className={styles.serviceIcon} aria-hidden>
              🧹
            </span>
            <h3>House cleaning</h3>
            <p>Deep and regular cleaning from vetted professionals.</p>
            <span className={styles.price}>From $45/hr</span>
            <Link to="/services" className={styles.bookBtn}>
              Book now
            </Link>
          </article>

          <article className={styles.serviceCard}>
            <span className={styles.serviceIcon} aria-hidden>
              👶
            </span>
            <h3>Babysitting</h3>
            <p>Trusted childcare when you need it most.</p>
            <span className={styles.price}>From $20/hr</span>
            <Link to="/services" className={styles.bookBtn}>
              Book now
            </Link>
          </article>

          <article className={styles.serviceCard}>
            <span className={styles.serviceIcon} aria-hidden>
              🍳
            </span>
            <h3>Home cooking</h3>
            <p>Personal chefs for fresh, healthy meals at home.</p>
            <span className={styles.price}>From $35/hr</span>
            <Link to="/services" className={styles.bookBtn}>
              Book now
            </Link>
          </article>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionMuted}`}>
        <span className={styles.subtitle}>Simple process</span>
        <h2 className={styles.sectionTitle}>How it works</h2>
        <div className={styles.processGrid}>
          <div className={styles.processStep}>
            <div className={styles.stepIcon}>
              <span className={styles.stepNum}>1</span>
            </div>
            <h4>Choose a service</h4>
            <p>Browse cleaning, babysitting, or home cooking.</p>
          </div>
          <div className={styles.processStep}>
            <div className={styles.stepIcon}>
              <span className={styles.stepNum}>2</span>
            </div>
            <h4>Pick a time</h4>
            <p>Select date, time, and location that work for you.</p>
          </div>
          <div className={styles.processStep}>
            <div className={styles.stepIcon}>
              <span className={styles.stepNum}>3</span>
            </div>
            <h4>Confirm &amp; pay</h4>
            <p>Review your booking and pay securely online.</p>
          </div>
          <div className={styles.processStep}>
            <div className={styles.stepIcon}>
              <span className={styles.stepNum}>4</span>
            </div>
            <h4>Rate your visit</h4>
            <p>Share feedback to help our community improve.</p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.featuresGrid}>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon} aria-hidden>
              🛡️
            </div>
            <h4>Background verified</h4>
            <p>Every provider is vetted before joining the platform.</p>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon} aria-hidden>
              🕒
            </div>
            <h4>On-time guarantee</h4>
            <p>We stand behind punctual arrivals and clear communication.</p>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon} aria-hidden>
              👥
            </div>
            <h4>Experienced pros</h4>
            <p>Skilled workers with relevant training and reviews.</p>
          </div>
        </div>
      </section>

      <section className={styles.ctaBand} aria-label="Get started">
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>Ready to book your first service?</h2>
          <p className={styles.ctaText}>
            Create a free account and connect with trusted professionals in your area.
          </p>
          <div className={styles.ctaActions}>
            <Link to="/signup" className={styles.btnPrimaryLight}>
              Get started
            </Link>
            <Link to="/contact" className={styles.btnGhost}>
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
