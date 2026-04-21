import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Workers.module.css';
import axios from 'axios';

const Workers = () => {
  const navigate = useNavigate();

  // ✅ STATE FOR API DATA
  const [allWorkers, setAllWorkers] = useState([]);

  // Filters
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);


  // 3. Filtering Logic
  // const filteredWorkers = allWorkers.filter((worker) => {
  //   const matchesCategory = activeFilter === 'All' || worker.category === activeFilter;
  //   const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //                         worker.location.toLowerCase().includes(searchTerm.toLowerCase());

  // ✅ FETCH DATA FROM BACKEND
  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:5000/api/v1/offerings");

        console.log("OFFERS:", res.data);

        // ⚠️ adjust depending on backend response
        const data = res.data.data || res.data;

        // ✅ MAP BACKEND → FRONTEND STRUCTURE
        const mappedWorkers = data.map((item, index) => {
          const offer = item.offer || item;

          return {
            id: index,
            name: offer.title || "Service Provider",
            initials: (offer.title || "SP").slice(0, 2).toUpperCase(),
            category: "Cleaning", // ⚠️ fallback (backend doesn't send category)
            description: offer.title || "No description",
            rating: "4.5",
            reviews: "0",
            years: "N/A",
            location: "Lebanon",
            price: offer.rate || 0,
            status: offer.active ? "Available" : "Busy"
          };
        });

        setAllWorkers(mappedWorkers);

      } catch (error) {
        console.error("Error fetching workers:", error);
      }
    };

    fetchWorkers();
  }, []);

  // ✅ FILTERING (UNCHANGED)
  const filteredWorkers = allWorkers.filter((worker) => {
    const matchesCategory = activeFilter === 'All' || worker.category === activeFilter;
    const matchesSearch =
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAvailability = showOnlyAvailable ? worker.status === 'Available' : true;

    return matchesCategory && matchesSearch && matchesAvailability;
  });

  // 4. Navigation Logic
  // Navigation
  const handleBookNow = (worker) => {
    // navigate('/checkout', { state: { worker } });
    //Add to cart
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
            placeholder="Search country or city (e.g. Beirut, Tripoli)..."
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

        <p className={styles.resultsText}>
          {filteredWorkers.length} workers found
        </p>

        <div className={styles.grid}>
          {filteredWorkers.map((worker) => (
            <div key={worker.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.avatar}>{worker.initials}</div>


                <div className={styles.nameInfo}>
                  <h3>{worker.name}</h3>
                  <span className={`${styles.categoryBadge}`}>
                    {worker.category}
                  </span>
                </div>

                <div className={`${styles.statusBadge} ${worker.status === 'Available' ? styles.available : styles.busy}`}>
                  ● {worker.status}
                </div>
              </div>

              <p className={styles.description}>{worker.description}</p>

              <div className={styles.metaInfo}>

                <div className={styles.metaItem}>
                  ⭐ <strong>{worker.rating}</strong> ({worker.reviews})
                </div>
                <div className={styles.metaItem}>🕒 {worker.years}</div>
              </div>

              <div className={styles.location}>📍 {worker.location}</div>

              <div className={styles.cardFooter}>
                <div className={styles.price}>
                  ${worker.price}/hr
                </div>

                {worker.status === 'Available' ? (
                  <button
                    className={styles.bookBtn}
                    onClick={() => handleBookNow(worker)}
                  >
                    Book Now
                  </button>
                ) : (

                  <button className={styles.unavailableBtn} disabled>
                    Unavailable
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Offerings;