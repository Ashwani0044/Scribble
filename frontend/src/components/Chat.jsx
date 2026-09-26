import { useState, useEffect, useRef } from 'react';
import { socket } from '../socket';
import { Send } from 'lucide-react';

// currentSocketId remains part of the shared Chat prop contract.
// eslint-disable-next-line no-unused-vars
export default function Chat({ roomCode, isDrawer, currentSocketId }) {
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    const handleChatMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on('chat_message', handleChatMessage);

    return () => {
      socket.off('chat_message', handleChatMessage);
    };
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    socket.emit('send_message', {
      roomCode,
      message: inputMsg.trim(),
    });

    setInputMsg('');
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <span>Game Chat</span>
        <span className="chat-status">LIVE</span>
      </div>

      {/* Message Feed */}
      <div className="message-feed">
        {messages.map((m, idx) => (
          <div key={idx} className={`chat-message message-${m.type || 'user'}`}>
            {m.type === 'user' || m.type === 'guessed' ? (
              <>
                <strong className="message-sender">{m.sender}: </strong>
                <span>{m.text}</span>
              </>
            ) : (
              <span>{m.text}</span>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="chat-form">
        <input
          type="text"
          placeholder={isDrawer ? "You are drawing (chat disabled)" : "Type your guess here..."}
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          disabled={isDrawer}
          className="chat-input"
        />
        <button type="submit" className="btn btn-primary btn-send" disabled={isDrawer}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}