import React, { useState, useEffect } from 'react';
import { fetchOfferingAvailableTime } from '../api/offeringsApi';
import styles from '../styles/TimeSelectionModal.module.css';

const TimeSelectionModal = ({ isOpen, onClose, offering, onAddToCart }) => {
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedStartTime, setSelectedStartTime] = useState('');
  const [selectedEndTime, setSelectedEndTime] = useState('');

  useEffect(() => {
    if (isOpen && offering) {
      fetchAvailableTimes();
    }
  }, [isOpen, offering]);

  const fetchAvailableTimes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch available times from API
      const freeTimes = await fetchOfferingAvailableTime(offering.id);
      
      // Convert the API response to time slots
      const slots = freeTimes.map((timeRange, index) => {
        const startDate = new Date(timeRange[0]);
        const endDate = new Date(timeRange[1]);
        
        return {
          start: timeRange[0],
          end: timeRange[1],
          dateStr: startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          timeStr: `${startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
        };
      });
      
      setAvailableTimes(slots);
    } catch (err) {
      setError('Failed to load available times');
      console.error('Error fetching available times:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setSelectedStartTime(slot.start);
    setSelectedEndTime(slot.end);
  };

  const handleAddToCart = () => {
    if (!selectedSlot) {
      setError('Please select a time slot');
      return;
    }

    console.log('Adding to cart:', {
      offeringId: offering.id,
      start_at: selectedStartTime,
      end_at: selectedEndTime
    });

    onAddToCart({
      offeringId: offering.id,
      start_at: selectedStartTime,
      end_at: selectedEndTime
    });
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Select Time Slot</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.modalBody}>
          {loading && <p className={styles.loadingText}>Loading available times...</p>}
          {error && <p className={styles.errorText}>{error}</p>}
          
          {!loading && !error && (
            <>
              <div className={styles.offeringInfo}>
                <h3>{offering.name}</h3>
                <p>{offering.category}</p>
                <p className={styles.price}>${offering.price}/hr</p>
              </div>
              
              <div className={styles.timeSlots}>
                <h4>Available Time Slots</h4>
                <div className={styles.slotsGrid}>
                  {availableTimes.map((slot, index) => (
                    <button
                      key={index}
                      className={`${styles.slotBtn} ${selectedSlot === slot ? styles.selected : ''}`}
                      onClick={() => handleSlotSelect(slot)}
                    >
                      <div className={styles.slotDate}>{slot.dateStr}</div>
                      <div className={styles.slotTime}>{slot.timeStr}</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button 
            className={styles.addBtn} 
            onClick={handleAddToCart}
            disabled={!selectedSlot}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeSelectionModal;
