import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../styles/Checkout.module.css";

const Checkout = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    address: '',
    instructions: '',
    cardName: '',
    cardNumber: '',
    expiry: '',
    securityCode: ''
  });

  const navigate = useNavigate();
  
  // 2. Extract the worker data from the router state
  const location = useLocation();
  const worker = location.state?.worker;

  // 3. Set up dynamic pricing (defaulting to 2 hours)
  const hourlyRate = worker?.price || 45; 
  const [hours, setHours] = useState(2);
  const subtotal = hourlyRate * hours;
  const serviceFee = 5;
  const total = subtotal + serviceFee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => setStep(2);
  const handleBack = () => setStep(1);

  const handleConfirm = (e) => {
    e.preventDefault();
    alert('Booking confirmed!');
    navigate('/rating');
  };

  return (
    <div className={styles.wrapper}>
      <nav className={styles.breadcrumb}>
        <span className={styles.backLink} onClick={() => navigate(-1)} style={{cursor: 'pointer'}}>
          &lt; Services / Checkout
        </span>
        <div className={styles.stepper}>
          <div className={`${styles.step} ${step >= 1 ? styles.activeStep : ''}`}>1</div>
          <div className={styles.line}></div>
          <div className={`${styles.step} ${step >= 2 ? styles.activeStep : ''}`}>2</div>
          <div className={styles.line}></div>
          <div className={styles.step}>3</div>
          <span className={styles.stepLabel}>{step === 1 ? 'Service Details' : 'Payment'}</span>
        </div>
      </nav>

      <div className={styles.mainContent}>
        <div className={styles.formSection}>
          {step === 1 ? (
            <div className={styles.card}>
              <h2>Booking Details</h2>
              <label>Service Type</label>
              {/* Updated dropdown to show dynamic category and rate */}
              <select className={styles.inputFull} disabled>
                <option>{worker?.category || 'Service'} — ${hourlyRate}/hr</option>
              </select>

              <div className={styles.row}>
                <div className={styles.col}>
                  <label>Date</label>
                  <input 
                    type="date" 
                    name="date"
                    value={formData.date} 
                    onChange={handleChange} 
                  />
                </div>
                 <div className={styles.col}>
                   <label>Time</label>
                       <input 
                         type="time" 
                         name="time"
                         
                         value={formData.time} 
                         onChange={handleChange} 
                          />
                  </div>
              </div>

              <label>Service Address</label>
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
              />

              <div className={styles.row}>
                <div className={styles.col}>
                  <label>Hours</label>
                  <input
                    type="number"
                    min="1"
                    value={hours}
                    onChange={(e) => setHours(Math.max(1, Number(e.target.value) || 1))}
                  />
                </div>
              </div>

              <label>Special Instructions (Optional)</label>
              <textarea
                name="instructions"
                placeholder="Any specific requirements..."
                rows="4"
                value={formData.instructions}
                onChange={handleChange}
              ></textarea>


              <button className={styles.primaryBtn} onClick={handleNext}>Continue to Payment</button>
            </div>
          ) : (
            <div className={styles.card}>
              <h2>Payment Details</h2>
              <label>Cardholder Name</label>
              <input 
                type="text" 
                name="cardName"
                placeholder="" 
                value={formData.cardName}
                onChange={handleChange}
              />
              
              <label>Card Number</label>
              <div className={styles.inputWithIcon}>
                <input 
                  type="text" 
                  name="cardNumber"
                  placeholder="" 
                  value={formData.cardNumber}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.row}>
                <div className={styles.col}>
                  <label>Expiry Date</label>
                  <input 
                    type="text" 
                    name="expiry"
                    placeholder="MM/YY" 
                    value={formData.expiry}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.col}>
                  <label>Security Code</label>
                  <input 
                    type="text"
                    name="securityCode"
                    placeholder="123" 
                    value={formData.securityCode}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className={styles.secureNote}>
                🛡️ Your payment info is encrypted and secure.
              </div>

              <div className={styles.buttonRow}>
                <button className={styles.secondaryBtn} onClick={handleBack}>Back</button>
                {/* Updated total button */}
                <button className={styles.primaryBtn} onClick={handleConfirm}>Confirm Booking — ${total}</button>
              </div>
            </div>
          )}
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.summaryCard}>
            <h3>Booking Summary</h3>
            <div className={styles.serviceInfo}>
              <span className={styles.icon}>
                {/* Optional: make emoji dynamic based on category */}
                {worker?.category === 'Cleaning' ? '🧹' : worker?.category === 'Cooking' ? '🍳' : '👶'}
              </span>
              <div>
                {/* 4. Using the dynamic worker data here! */}
                <strong>{worker?.category || 'House Cleaning'}</strong>
                <p>⭐ with {worker?.name || 'Sarah Johnson'}</p>
              </div>
            </div>
            <hr />
            <div className={styles.priceRow}>
              <span>${hourlyRate}/hr × {hours} hrs</span>
              <span>${subtotal}</span>
            </div>
            <div className={styles.priceRow}>
              <span>Service Fee</span>
              <span>${serviceFee}</span>
            </div>
            <div className={`${styles.priceRow} ${styles.total}`}>
              <span>Total</span>
              <span>${total}</span>
            </div>

          </div>

          <div className={styles.policyCard}>
            <h4>Cancellation Policy</h4>
            <p>Free cancellation up to 24 hours before your scheduled service.</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;