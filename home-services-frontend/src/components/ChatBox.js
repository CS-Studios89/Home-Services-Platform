import React, { useState } from "react";
import styles from "../styles/ChatBox.module.css";

/**
 * ChatBox
 * - `embed` (boolean): if true, renders inline instead of as a floating widget
 */
const ChatBox = ({ embed = false }) => {
  const [isOpen, setIsOpen] = useState(embed); // inline is always "open"
  const [messages, setMessages] = useState([
    { id: 1, from: "worker", text: "Hi! How can I help you with your booking?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), from: "me", text: trimmed },
    ]);
    setInput("");
  };

  const containerClass = embed
    ? styles.embedContainer
    : styles.floatingContainer;

  return (
    <div className={containerClass}>
      {!embed && (
        <button
          type="button"
          className={styles.toggleButton}
          onClick={() => setIsOpen((open) => !open)}
        >
          💬 Messages
        </button>
      )}

      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.header}>
            <span>Real-time Chat</span>
            {!embed && (
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
            )}
          </div>

          <div className={styles.messages}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={
                  msg.from === "me" ? styles.messageMe : styles.messageOther
                }
              >
                <span>{msg.text}</span>
              </div>
            ))}
          </div>

          <form className={styles.inputBar} onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBox;

