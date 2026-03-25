import React, { useState } from 'react';
import styles from '../styles/Rating.module.css';

const Rating = () => {
  const [overallRating, setOverallRating] = useState(0);
  const [aspects, setAspects] = useState({
    Quality: 0, Punctuality: 0, Communication: 0, Professionalism: 0, Value: 0
  });
  const [selectedTags, setSelectedTags] = useState([]);
  const [comment, setComment] = useState(""); // Added state for comment

  const tags = ["Friendly", "Thorough", "On Time", "Clean", "Professional", "Great Value", "Highly Recommend"];

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleRating = (aspect, value) => {
    setAspects({ ...aspects, [aspect]: value });
  };

  // Logic to handle the click
  const handleSubmit = () => {
    if (overallRating === 0) {
      alert("Please provide an overall rating before submitting.");
      return;
    }

    alert("Thank you for your feedback!");
    
    // Optional: Reset form here or redirect user
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.ratingCard}>
        <h2>Rate Your Experience</h2>
        <p className={styles.subtitle}>Your honest feedback helps improve our platform for everyone.</p>

        {/* Overall Rating Section */}
        <div className={styles.sectionCenter}>
          <h4>Overall Rating</h4>
          <div className={styles.largeStars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} onClick={() => setOverallRating(star)} 
                className={overallRating >= star ? styles.starActive : styles.starInactive}>
                {overallRating >= star ? '★' : '☆'}
              </span>
            ))}
          </div>
          <p className={styles.tapNote}>Tap to rate</p>
        </div>

        {/* Specific Aspects Section */}
        <div className={styles.aspectsSection}>
          <h4>Rate Specific Aspects</h4>
          {Object.keys(aspects).map((aspect) => (
            <div key={aspect} className={styles.aspectRow}>
              <span>{aspect}</span>
              <div className={styles.smallStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} onClick={() => handleRating(aspect, star)}
                    className={aspects[aspect] >= star ? styles.starActive : styles.starInactive}>
                    {aspects[aspect] >= star ? '★' : '☆'}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Tags Section */}
        <div className={styles.tagsSection}>
          <h4>What stood out? (Optional)</h4>
          <div className={styles.tagContainer}>
            {tags.map(tag => (
              <button key={tag} 
                className={`${styles.tagChip} ${selectedTags.includes(tag) ? styles.tagActive : ''}`}
                onClick={() => toggleTag(tag)}>
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Comment Section */}
        <div className={styles.commentSection}>
          <h4>Leave a Comment (Optional)</h4>
          <textarea 
            placeholder="Tell others about your experience..." 
            rows="4" 
            value={comment}
            onChange={(e) => setComment(e.target.value)} // Track comment input
          />
        </div>

        {/* Added onClick handler here */}
        <button className={styles.submitBtn} onClick={handleSubmit}>
          <span>✈️</span> Submit Review
        </button>
      </div>
    </div>
  );
};

export default Rating;