import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styles from "../styles/Rating.module.css";
import {
  createBookingReview,
  fetchUserBookings,
  getReviewByBookingId,
} from "../api/ratingApi";

const Rating = () => {
  const [searchParams] = useSearchParams();
  const queryBookingId = searchParams.get("bookingId");
  const [overallRating, setOverallRating] = useState(0);
  const [aspects, setAspects] = useState({
    Quality: 0,
    Punctuality: 0,
    Communication: 0,
    Professionalism: 0,
    Value: 0,
  });
  const [selectedTags, setSelectedTags] = useState([]);
  const [comment, setComment] = useState(""); // Added state for comment
  const [bookingId, setBookingId] = useState(queryBookingId || "");
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);

  const tags = [
    "Friendly",
    "Thorough",
    "On Time",
    "Clean",
    "Professional",
    "Great Value",
    "Highly Recommend",
  ];

  useEffect(() => {
    const loadBookings = async () => {
      setIsLoadingBookings(true);
      setError("");
      try {
        const data = await fetchUserBookings();
        setBookings(data || []);
      } catch (err) {
        setError(err.message || "Failed to load bookings.");
      } finally {
        setIsLoadingBookings(false);
      }
    };
    loadBookings();
  }, []);

  useEffect(() => {
    const checkReviewed = async () => {
      if (!bookingId) return;
      try {
        await getReviewByBookingId(bookingId);
        setError("This booking has already been reviewed.");
      } catch (_) {
        // 404 means not reviewed yet; nothing to show.
      }
    };
    checkReviewed();
  }, [bookingId]);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleRating = (aspect, value) => {
    setAspects({ ...aspects, [aspect]: value });
  };

  // Logic to handle the click
  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (overallRating === 0) {
      setError("Please provide an overall rating before submitting.");
      return;
    }
    if (!bookingId) {
      setError("Please select a booking to review.");
      return;
    }

    const aspectsText = Object.entries(aspects)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
    const tagsText = selectedTags.length ? `Tags: ${selectedTags.join(", ")}` : "";
    const note = [comment.trim(), tagsText, `Aspect Ratings: ${aspectsText}`]
      .filter(Boolean)
      .join(" | ");

    setIsSubmitting(true);
    try {
      await createBookingReview({
        booking_id: Number(bookingId),
        rating: overallRating,
        note,
      });
      setSuccess("Thank you! Your review was submitted.");
      setComment("");
      setSelectedTags([]);
      setOverallRating(0);
      setAspects({
        Quality: 0,
        Punctuality: 0,
        Communication: 0,
        Professionalism: 0,
        Value: 0,
      });
    } catch (err) {
      setError(err.message || "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const bookingOptions = useMemo(
    () =>
      bookings.map((item) => ({
        value: String(item.booking_id),
        label: `${item.service_name || item.title || "Service"} - ${new Date(
          item.start_at
        ).toLocaleDateString()}`,
      })),
    [bookings]
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.ratingCard}>
        <h2>Rate Your Experience</h2>
        <p className={styles.subtitle}>Your honest feedback helps improve our platform for everyone.</p>
        {error && <p className={styles.subtitle}>{error}</p>}
        {success && <p className={styles.status}>{success}</p>}

        <div className={styles.commentSection}>
          <h4>Booking</h4>
          {isLoadingBookings ? (
            <p className={styles.subtitle}>Loading bookings...</p>
          ) : (
            <select value={bookingId} onChange={(e) => setBookingId(e.target.value)}>
              <option value="">Select booking</option>
              {bookingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>

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
            {tags.map((tag) => (
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
        <button className={styles.submitBtn} onClick={handleSubmit} disabled={isSubmitting}>
          <span>✈️</span> Submit Review
        </button>
      </div>
    </div>
  );
};

export default Rating;