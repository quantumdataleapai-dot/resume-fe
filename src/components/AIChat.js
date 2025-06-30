import React, { useState } from "react";

const AIChat = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      text: "Hello! I can help you analyze resumes and job descriptions. What would you like to know?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const sendMessage = () => {
    if (inputMessage.trim()) {
      const userMessage = {
        id: messages.length + 1,
        type: "user",
        text: inputMessage,
      };

      const aiResponse = {
        id: messages.length + 2,
        type: "ai",
        text: "Thank you for your message! This is a demo response. In a real application, this would connect to an AI service.",
      };

      setMessages([...messages, userMessage, aiResponse]);
      setInputMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="ai-chat-content">
        <div className="ai-chat-header">
          <h3 style={{ color: "#fff" }}>AI Assistant</h3>
          <span className="close" onClick={onClose}>
            &times;
          </span>
        </div>
        <div className="ai-chat-body">
          <div className="chat-messages">
            {messages.map((message) => (
              <div key={message.id} className={`${message.type}-message`}>
                {message.type === "ai" && <i className="fas fa-robot"></i>}
                <span>{message.text}</span>
              </div>
            ))}
          </div>
          <div className="chat-input-container">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about resume matching..."
            />
            <button onClick={sendMessage}>
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
