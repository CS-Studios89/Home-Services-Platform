import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Added for navigation
import styles from '../styles/Workers.module.css';

const Workers = () => {
  const navigate = useNavigate(); // Initialize the navigate function

  // 1. Worker Data
  const allWorkers = [
    {
      id: 1,
      name: 'Rami Mansour',
      initials: 'RM',
      category: 'Cleaning',
      description: 'Expert in residential and commercial deep cleaning. Reliable and punctual.',
      rating: '4.9',
      reviews: '142',
      years: '6 years',
      location: 'Beirut, Achrafieh',
      price: 15,
      status: 'Available'
    },
    {
      id: 2,
      name: 'Layla Haddad',
      initials: 'LH',
      category: 'Babysitting',
      description: 'Experienced preschool teacher offering weekend and evening childcare.',
      rating: '5.0',
      reviews: '88',
      years: '8 years',
      location: 'Jounieh, Keserwan',
      price: 10,
      status: 'Available'
    },
    {
      id: 3,
      name: 'Chef Ahmad Zein',
      initials: 'AZ',
      category: 'Cooking',
      description: 'Specializing in authentic Lebanese cuisine and healthy meal prep for families.',
      rating: '4.7',
      reviews: '56',
      years: '12 years',
      location: 'Saida, South',
      price: 25,
      status: 'Busy'
    },
    {
      id: 4,
      name: 'Nour El-Khoury',
      initials: 'NK',
      category: 'Cleaning',
      description: 'Detailed-oriented home organizer and eco-friendly cleaning specialist.',
      rating: '4.8',
      reviews: '34',
      years: '3 years',
      location: 'Byblos (Jbeil)',
      price: 12,
      status: 'Available'
    },
    {
      id: 5,
      name: 'Omar Tabbara',
      initials: 'OT',
      category: 'Cooking',
      description: 'Pastry chef available for private events and dessert catering.',
      rating: '4.9',
      reviews: '110',
      years: '15 years',
      location: 'Hamra, Beirut',
      price: 30,
      status: 'Available'
    },
    {
      id: 6,
      name: 'Sana Merhi',
      initials: 'SM',
      category: 'Babysitting',
      description: 'Patient and creative caregiver. Fluent in Arabic, French, and English.',
      rating: '4.6',
      reviews: '42',
      years: '4 years',
      location: 'Tripoli, North',
      price: 8,
      status: 'Busy'
    }
  ];

  // 2. States for filtering
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  // 3. Filtering Logic
  const filteredWorkers = allWorkers.filter((worker) => {
    const matchesCategory = activeFilter === 'All' || worker.category === activeFilter;
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          worker.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAvailability = showOnlyAvailable ? worker.status === 'Available' : true;

    return matchesCategory && matchesSearch && matchesAvailability;
  });

  // 4. Navigation Logic
  const handleBookNow = (worker) => {
    // This passes the worker object to the /checkout route
    navigate('/checkout', { state: { worker } });
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1>Find Your Worker in Lebanon</h1>
        <p>Browse verified local professionals for your home service needs.</p>
      </section>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search name or city (e.g. Beirut, Tripoli)..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.filterGroup}>
          {['All', 'Cleaning', 'Babysitting', 'Cooking'].map((cat) => (
            <button
              key={cat}
              className={`${styles.filterBtn} ${activeFilter === cat ? styles.active : ''}`}
              onClick={() => setActiveFilter(cat)}
            >
              {cat}
            </button>
          ))}
          
          <button
            className={`${styles.filterBtn} ${showOnlyAvailable ? styles.active : ''}`}
            onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
          >
            Available Now
          </button>
        </div>
      </div>

      <main className={styles.container}>
        <p className={styles.resultsText}>{filteredWorkers.length} workers found in Lebanon</p>
        
        <div className={styles.grid}>
          {filteredWorkers.map((worker) => (
            <div key={worker.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.avatar}>{worker.initials}</div>
                <div className={styles.nameInfo}>
                  <div className={styles.titleRow}>
                    <h3>{worker.name}</h3>
                  </div>
                  <span className={`${styles.categoryBadge} ${styles[worker.category.toLowerCase()]}`}>
                    {worker.category}
                  </span>
                </div>
                <div className={`${styles.statusBadge} ${worker.status === 'Available' ? styles.available : styles.busy}`}>
                  ● {worker.status}
                </div>
              </div>

              <p className={styles.description}>{worker.description}</p>

              <div className={styles.metaInfo}>
                <div className={styles.metaItem}>⭐ <strong>{worker.rating}</strong> ({worker.reviews})</div>
                <div className={styles.metaItem}>🕒 {worker.years}</div>
              </div>
              
              <div className={styles.location}>📍 {worker.location}</div>

              <div className={styles.cardFooter}>
                <div className={styles.price}>${worker.price}/hr</div>
                {worker.status === 'Available' ? (
                  <button 
                    className={styles.bookBtn}
                    onClick={() => handleBookNow(worker)} // Updated: Triggers navigation
                  >
                    Book Now
                  </button>
                ) : (
                  <button className={styles.unavailableBtn} disabled>Unavailable</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Workers;