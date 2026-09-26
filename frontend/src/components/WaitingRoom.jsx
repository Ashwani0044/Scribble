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
    <div className="card waiting-card">
      <div className="room-header">
        <div>
          <span className="eyebrow">PRIVATE ROOM CODE</span>
          <div className="code-box">
            {roomCode}
            <button
              onClick={copyCode}
              className="btn"
              style={{ background: 'transparent', color: '#64748b', padding: '4px' }}
              title="Copy Room Code"
            >
              {copied ? <Check size={20} color="#10b981" /> : <Copy size={20} />}
            </button>
          </div>
        </div>
        <div className="player-count">
          <div className="eyebrow">PLAYERS</div>
          <div className="player-count-number">{room.players.length} / 8</div>
        </div>
      </div>

      <h3 className="section-heading">Joined Players</h3>
      <div className="players-grid">
        {room.players.map((p) => (
          <div key={p.id} className="player-card">
            <div className="player-name">
              <User size={16} />
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
        <div className="waiting-message">
          ⏳ Waiting for host to start the game...
        </div>
      )}

      {error && <div className="error-text">{error}</div>}
    </div>
  );
}