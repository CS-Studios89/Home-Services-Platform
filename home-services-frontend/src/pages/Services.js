import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../styles/Services.module.css';

const SERVICES_DATA = [
  {
    id: 'house-cleaning',
    title: 'House Cleaning',
    icon: '🧹',
    rating: 4.9,
    reviews: 340,
    duration: '2—4 hours',
    price: 45,
    description: "Professional, thorough cleaning tailored to your home's needs — from regular maintenance to deep cleans.",
    features: ['Regular Cleaning', 'Deep Cleaning', 'Move-In/Out Cleaning', 'Eco-Friendly Options', 'Post-Renovation Cleaning'],
    colorTheme: styles.blueTheme
  },
  {
    id: 'babysitting',
    title: 'Babysitting',
    icon: '👶',
    rating: 4.8,
    reviews: 285,
    duration: 'Flexible',
    price: 20,
    isPopular: true,
    description: "Trusted, background-checked babysitters who create a safe, fun environment for children of all ages.",
    features: ['Newborn Care', 'Toddler Care', 'School-Age Care', 'CPR Certified Sitters', 'Evening & Weekend'],
    colorTheme: styles.pinkTheme
  },
  {
    id: 'home-cooking',
    title: 'Home Cooking',
    icon: '🍳',
    rating: 4.9,
    reviews: 198,
    duration: '1—3 hours',
    price: 35,
    description: "Personal chefs who prepare fresh, delicious meals in your kitchen — from daily meal prep to special occasions.",
    features: ['Daily Meal Prep', 'Special Occasion Dinners', 'Dietary Accommodations', 'Grocery Shopping', 'Kitchen Clean-Up'],
    colorTheme: styles.yellowTheme
  }
];

const Services = () => {
  const navigate = useNavigate();

  const goToWorkers = () => navigate("/workers");

  return (
    <div className={styles.pageWrapper}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <span className={styles.badge}>{SERVICES_DATA.length} Professional Services</span>
        <h1>Our Services</h1>
        <p>Choose from our range of professional home services. Every provider is verified, insured, and rated by real customers.</p>
      </section>

      {/* Services List */}
      <div className={styles.container}>
        <div className={styles.serviceList}>
          {SERVICES_DATA.map((service) => (
            <div key={service.id} className={`${styles.serviceCard} ${service.colorTheme}`}>
              <div className={styles.cardHeader}>
                <div className={styles.iconBox}>{service.icon}</div>
                <div className={styles.headerText}>
                  <h3>
                    {service.title} 
                    {service.isPopular && <span className={styles.popularBadge}>Most Popular</span>}
                  </h3>
                  <div className={styles.meta}>
                    <span className={styles.rating}>★ {service.rating} ({service.reviews} reviews)</span>
                    <span className={styles.duration}>• 🕒 {service.duration}</span>
                  </div>
                </div>
                <div className={styles.pricing}>
                  <small>Starting from</small>
                  <div className={styles.priceTag}>${service.price}<span>/hr</span></div>
                </div>
              </div>

              <p className={styles.description}>{service.description}</p>

              <div className={styles.featuresGrid}>
                {service.features.map(feature => (
                  <div key={feature} className={styles.featureItem}>✔️ {feature}</div>
                ))}
              </div>

              <div className={styles.actions}>
                {/* Direct Link to Checkout */}
                <Link to="/checkout" state={{ service: service.title }} className={styles.bookBtn}>
                  Book {service.title} →
                </Link>
                
                {/* Secondary Button to Browse Workers */}
                <button type="button" className={styles.browseBtn} onClick={goToWorkers}>
                  Browse Workers
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Satisfaction / CTA Section */}
      <section className={styles.satisfaction}>
        <h2>100% Satisfaction Guaranteed</h2>
        <p>Not happy with the service? We'll send another provider at no extra charge or give you a full refund.</p>
        <button type="button" className={styles.getStartedBtn} onClick={goToWorkers}>
          Get Started Today
        </button>
      </section>
    </div>
  );
};

export default Services;