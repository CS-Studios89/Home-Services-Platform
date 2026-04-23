import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Checkout.module.css";
import { fetchCartItems, checkoutCart } from "../api/checkoutApi";

const Checkout = () => {
  const [step, setStep] = useState(1);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    address: '',
    instructions: '',
    cardName: '',
    cardNumber: '',
    expiry: '',
    securityCode: ''
  });

  const navigate = useNavigate();

  // Fetch cart items on component mount
  useEffect(() => {
    const loadCartItems = async () => {
      try {
        setLoading(true);
        const items = await fetchCartItems();
        setCartItems(items);
        setError(null);
      } catch (err) {
        setError('Failed to load cart items. Please try again.');
        console.error('Error fetching cart items:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCartItems();
  }, []);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.hours * item.rate), 0);
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

  const handleConfirm = async (e) => {
    e.preventDefault();
    try {
      await checkoutCart();
      alert('Booking confirmed!');
      navigate('/orders');
    } catch (err) {
      console.error('Error during checkout:', err);
      alert('Failed to complete checkout. Please try again.');
    }
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
          {loading && <p>Loading cart items...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {!loading && !error && cartItems.length === 0 && (
            <div className={styles.card}>
              <p>Your cart is empty. <button onClick={() => navigate('/offerings')}>Browse offerings</button></p>
            </div>
          )}
          {!loading && !error && cartItems.length > 0 && (
            <>
              {step === 1 ? (
                <div className={styles.card}>
                  <h2>Booking Details</h2>
                  <label>Service Address</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    value={formData.address}
                    onChange={handleChange}
                  />

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
                    <button className={styles.primaryBtn} onClick={handleConfirm}>Confirm Booking — ${total}</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.summaryCard}>
            <h3>Booking Summary</h3>
            {cartItems.map((item, index) => (
              <div key={index} className={styles.serviceInfo}>
                <span className={styles.icon}>
                  {item.service_name === 'Cleaning' ? '🧹' : item.service_name === 'Cooking' ? '🍳' : '👶'}
                </span>
                <div>
                  <strong>{item.service_name || 'Service'}</strong>
                  <p>${item.rate}/hr × {item.hours} hrs</p>
                </div>
              </div>
            ))}
            <hr />
            <div className={styles.priceRow}>
              <span>Subtotal</span>
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