import { useState, useEffect, useRef } from 'react';
import { socket } from '../socket';
import { Send } from 'lucide-react';

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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '400px',
      background: '#1e293b',
      borderRadius: '8px',
      border: '1px solid #334155',
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '12px 16px',
        background: '#0f172a',
        borderBottom: '1px solid #334155',
        fontWeight: 'bold',
        color: '#94a3b8'
      }}>
         Game Chat
      </div>

      {/* Message Feed */}
      <div style={{
        flex: 1,
        padding: '12px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxHeight: '380px'
      }}>
        {messages.map((m, idx) => (
          <div key={idx} style={{
            fontSize: '0.9rem',
            padding: '6px 10px',
            borderRadius: '6px',
            backgroundColor:
              m.type === 'system-success' ? 'rgba(16, 185, 129, 0.2)' :
              m.type === 'system-info' ? 'rgba(56, 189, 248, 0.2)' :
              m.type === 'guessed' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
            color:
              m.type === 'system-success' ? '#10b981' :
              m.type === 'system-info' ? '#38bdf8' :
              m.type === 'guessed' ? '#f59e0b' : '#f8fafc',
            borderLeft: m.type?.startsWith('system') ? '3px solid currentColor' : 'none'
          }}>
            {m.type === 'user' || m.type === 'guessed' ? (
              <>
                <strong style={{ color: '#94a3b8' }}>{m.sender}: </strong>
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
      <form onSubmit={handleSendMessage} style={{ display: 'flex', borderTop: '1px solid #334155', padding: '8px' }}>
        <input
          type="text"
          placeholder={isDrawer ? "You are drawing (chat disabled)" : "Type your guess here..."}
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          disabled={isDrawer}
          style={{ flex: 1, border: 'none', background: 'transparent' }}
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '8px 12px' }} disabled={isDrawer}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}