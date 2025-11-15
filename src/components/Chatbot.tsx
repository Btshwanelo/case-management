import React, { useState } from 'react';
const Chatbot = () => {
  const [isChatVisible, setChatVisible] = useState(false);
  const [isOverlayVisible, setOverlayVisible] = useState(false);
  const toggleChat = () => {
    setChatVisible(!isChatVisible);
    setOverlayVisible(!isOverlayVisible);
  };
  const closeChat = () => {
    setChatVisible(false);
    setOverlayVisible(false);
  };
  return (
    <div className="z-40">
      {' '}
      {/* Chatbot Icon */}{' '}
      <div
        className="chatbot-icon"
        onClick={toggleChat}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '30px',
          width: '48px',
          height: '48px',
          backgroundColor: '#007BFF',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 1000,
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
        }}
      >
        {' '}
        <img src="https://img.icons8.com/ios/50/ffffff/chat.png" alt="Chatbot Icon" style={{ width: '20px', height: '20px' }} />{' '}
      </div>{' '}
      {/* Chatbot Popup iframe */}{' '}
      {isChatVisible && (
        <iframe
          className="chatbot-popup"
          src="https://copilotstudio.microsoft.com/environments/Default-3e50aa65-2819-4fa2-890c-6556e29623f5/bots/cr3fc_agent/webchat?__version__=2"
          title="Chatbot"
          frameBorder="0"
          style={{
            zIndex: 1000,
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            width: '350px',
            height: '500px',
            border: 'none',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
            borderRadius: '10px',
          }}
        />
      )}{' '}
    </div>
  );
};
export default Chatbot;
