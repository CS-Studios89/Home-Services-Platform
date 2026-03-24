import React from "react";
import "../styles/Notifications.css";

function Notifications() {
  return (
    <div className="notifications-container">
      <h2>Notifications</h2>
      <p className="notifications-lead">Recent updates about your bookings and messages.</p>

      <div className="notifications-list">
        <div className="notification">
          <div>✅ Your booking has been confirmed.</div>
          <span>Just now</span>
        </div>

        <div className="notification">
          <div>⭐ Please rate your last service.</div>
          <span>2 hours ago</span>
        </div>

        <div className="notification">
          <div>📩 New message from Rami (Cleaning).</div>
          <span>Yesterday</span>
        </div>
      </div>
    </div>
  );
}

export default Notifications;