import React, { useState } from "react";
import styles from "../styles/MapPicker.module.css";

/**
 * Simple visual map placeholder that lets the user
 * "drop a pin" by clicking inside the box.
 *
 * Props:
 * - onLocationSelect({ xPercent, yPercent }): optional callback
 */
const MapPicker = ({ onLocationSelect }) => {
  const [pin, setPin] = useState(null);

  const handleClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const xPercent = ((event.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((event.clientY - rect.top) / rect.height) * 100;

    const nextPin = { xPercent, yPercent };
    setPin(nextPin);
    if (onLocationSelect) {
      onLocationSelect(nextPin);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.labelRow}>
        <h3>Location</h3>
        <span className={styles.helperText}>
          Click on the map to drop a pin.
        </span>
      </div>
      <div className={styles.mapBox} onClick={handleClick}>
        <div className={styles.gridOverlay} />
        {pin && (
          <div
            className={styles.pin}
            style={{
              left: `${pin.xPercent}%`,
              top: `${pin.yPercent}%`,
            }}
          >
            📍
          </div>
        )}
      </div>
      {pin && (
        <p className={styles.coords}>
          Selected: {pin.xPercent.toFixed(1)}%, {pin.yPercent.toFixed(1)}%
        </p>
      )}
    </div>
  );
};

export default MapPicker;

