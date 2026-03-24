import React from "react";
import "../styles/FAQ.css";

const items = [
  {
    q: "How do I book a service?",
    a: "Browse Services, pick a category, then choose a worker or go straight to checkout with your preferred date and time.",
  },
  {
    q: "How do I pay?",
    a: "You can pay securely online at checkout. Some providers may also accept cash on completion—details appear before you confirm.",
  },
  {
    q: "Are workers verified?",
    a: "Providers go through identity and background checks where applicable. Look for the verified badge on profiles.",
  },
  {
    q: "Can I cancel or reschedule?",
    a: "Yes. Open your booking from History or Notifications and follow the cancel or reschedule options. Fees may apply close to the appointment time.",
  },
  {
    q: "What if I’m not satisfied?",
    a: "Contact support within 24 hours. We’ll work with you and the provider to resolve the issue, including rebooking when appropriate.",
  },
];

function FAQ() {
  return (
    <div className="faq-container">
      <div className="faq-hero">
        <p className="faq-eyebrow">Help center</p>
        <h2>Frequently asked questions</h2>
        <p className="faq-intro">
          Quick answers about booking, payments, and safety on HomeServe.
        </p>
      </div>

      <div className="faq-list">
        {items.map(({ q, a }) => (
          <details key={q} className="faq-item">
            <summary className="faq-summary">{q}</summary>
            <p className="faq-answer">{a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

export default FAQ;
