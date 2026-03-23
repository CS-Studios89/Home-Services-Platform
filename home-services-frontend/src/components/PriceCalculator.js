import React, { useMemo, useState } from "react";
import styles from "../styles/PriceCalculator.module.css";

/**
 * Simple dynamic pricing widget.
 *
 * Props:
 * - baseRate (number): hourly base rate in dollars
 * - onTotalChange(total: number): optional callback when total updates
 */
const PriceCalculator = ({ baseRate = 15, onTotalChange }) => {
  const [hours, setHours] = useState(2);
  const [extras, setExtras] = useState({
    supplies: false,
    weekend: false,
    deepClean: false,
  });

  const total = useMemo(() => {
    let subtotal = baseRate * hours;
    if (extras.supplies) subtotal += 8;
    if (extras.weekend) subtotal *= 1.2;
    if (extras.deepClean) subtotal += 20;
    const rounded = Math.round(subtotal * 100) / 100;
    if (onTotalChange) onTotalChange(rounded);
    return rounded;
  }, [baseRate, hours, extras, onTotalChange]);

  const handleHoursChange = (e) => {
    const value = Number(e.target.value) || 0;
    setHours(value < 1 ? 1 : value);
  };

  const toggleExtra = (key) => {
    setExtras((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Price Calculator</h3>
      <p className={styles.subtitle}>
        Estimate your booking cost in real time.
      </p>

      <div className={styles.row}>
        <label htmlFor="hours">Hours</label>
        <input
          id="hours"
          type="number"
          min="1"
          value={hours}
          onChange={handleHoursChange}
        />
      </div>

      <div className={styles.row}>
        <span className={styles.baseRate}>
          Base rate: ${baseRate.toFixed(2)}/hr
        </span>
      </div>

      <div className={styles.extras}>
        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={extras.supplies}
            onChange={() => toggleExtra("supplies")}
          />
          <span>Include cleaning supplies (+$8)</span>
        </label>
        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={extras.weekend}
            onChange={() => toggleExtra("weekend")}
          />
          <span>Weekend booking (+20%)</span>
        </label>
        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={extras.deepClean}
            onChange={() => toggleExtra("deepClean")}
          />
          <span>Deep cleaning (+$20)</span>
        </label>
      </div>

      <div className={styles.totalRow}>
        <span>Estimated total</span>
        <strong>${total.toFixed(2)}</strong>
      </div>
    </div>
  );
};

export default PriceCalculator;

