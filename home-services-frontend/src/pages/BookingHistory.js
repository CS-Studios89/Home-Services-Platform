import React from "react";
import "../styles/BookingHistory.css";
import StatusTracker from "../components/StatusTracker";

function BookingHistory() {
  return (
    <div className="history-container">
      <h2>My bookings</h2>
      <p className="history-lead">
        Track progress for each visit. Status updates appear here as your provider moves through the job.
      </p>

      <div className="booking-list">
        <article className="booking-card">
          <h3>
            <span>House cleaning</span>
            <span className="statusBadge statusDone">Completed</span>
          </h3>
          <p>
            <strong>Date:</strong> 10 March 2026
          </p>
          <StatusTracker currentStep={3} />
        </article>

        <article className="booking-card">
          <h3>
            <span>Babysitting</span>
            <span className="statusBadge statusPending">Pending</span>
          </h3>
          <p>
            <strong>Date:</strong> 15 March 2026
          </p>
          <StatusTracker currentStep={1} />
        </article>
      </div>
    </div>
  );
}

export default BookingHistory;
