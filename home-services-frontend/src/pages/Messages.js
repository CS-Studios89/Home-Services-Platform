import React from "react";
import "../styles/Messages.css";
import ChatBox from "../components/ChatBox";

const Messages = () => {
  return (
    <div className="messages-page">
      <div className="messages-header">
        <h1>Messages</h1>
        <p>Chat in real-time with your worker or client.</p>
      </div>

      <div className="messages-content">
        <div className="messages-sidebar">
          <h2>Active Conversations</h2>
          <ul>
            <li className="active">
              Cleaning with Rami <span>Today • 4:30 PM</span>
            </li>
            <li>
              Babysitting with Layla <span>Yesterday • 8:00 PM</span>
            </li>
            <li>
              Cooking with Ahmad <span>Mon • 6:15 PM</span>
            </li>
          </ul>
        </div>

        <div className="messages-chat">
          <ChatBox embed />
        </div>
      </div>
    </div>
  );
};

export default Messages;

