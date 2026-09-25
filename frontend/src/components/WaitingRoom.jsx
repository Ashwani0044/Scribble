import { useState } from 'react';
import { Copy, Check, Play, User } from 'lucide-react';
import { socket } from '../socket';

export default function WaitingRoom({ roomCode, room, currentSocketId }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const isHost = room.host === currentSocketId;

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = () => {
    setError('');
    socket.emit('start_game', { roomCode }, (res) => {
      if (!res?.success) {
        setError(res?.error || 'Failed to start game');
      }
    });
  };

  return (
    <div className="card">
      <div className="room-header">
        <div>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>PRIVATE ROOM CODE</span>
          <div className="code-box">
            {roomCode}
            <button
              onClick={copyCode}
              className="btn"
              style={{ background: 'transparent', color: '#94a3b8', padding: '4px' }}
              title="Copy Room Code"
            >
              {copied ? <Check size={20} color="#10b981" /> : <Copy size={20} />}
            </button>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>PLAYERS</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{room.players.length} / 8</div>
        </div>
      </div>

      <h3 style={{ marginBottom: '16px', color: '#cbd5e1' }}>Joined Players</h3>
      <div className="players-grid">
        {room.players.map((p) => (
          <div key={p.id} className="player-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} color="#94a3b8" />
              <span>{p.username}</span>
            </div>
            {p.isHost && <span className="badge">HOST</span>}
          </div>
        ))}
      </div>

      {isHost ? (
        <button
          className="btn btn-success"
          style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}
          onClick={handleStartGame}
          disabled={room.players.length < 2}
        >
          <Play size={20} /> {room.players.length < 2 ? 'Need at least 2 players to start' : 'Start Game'}
        </button>
      ) : (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '12px' }}>
          ⏳ Waiting for host to start the game...
        </div>
      )}

      {error && <div className="error-text">{error}</div>}
    </div>
  );
}