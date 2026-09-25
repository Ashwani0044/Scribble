import { useState } from 'react';
import { socket } from '../socket';
import { LogIn, PlusCircle } from 'lucide-react';

export default function Lobby({ onRoomJoined }) {
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    setError('');

    // Check if socket is connected
    if (!socket.connected) {
      console.warn('Socket not connected yet, connecting manually...');
      socket.connect();
    }

    console.log('Emitting create_room for username:', username.trim());

    socket.emit('create_room', { username: username.trim() }, (res) => {
      console.log('create_room response:', res);
      if (res && res.success) {
        onRoomJoined(res.roomCode, res.room);
      } else {
        setError(res?.error || 'Failed to create room');
      }
    });
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }
    setError('');

    if (!socket.connected) {
      socket.connect();
    }

    console.log('Emitting join_room for code:', roomCode.trim());

    socket.emit('join_room', { roomCode: roomCode.trim(), username: username.trim() }, (res) => {
      console.log('join_room response:', res);
      if (res && res.success) {
        onRoomJoined(res.roomCode, res.room);
      } else {
        setError(res?.error || 'Failed to join room');
      }
    });
  };

  return (
    <div className="card" style={{ maxWidth: '420px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '24px', color: '#38bdf8' }}>✏️ Scribble Clone</h1>

      <div className="input-group">
        <label>Your Name</label>
        <input
          type="text"
          placeholder="e.g. Alice"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={15}
        />
      </div>

      {error && <div className="error-text">{error}</div>}

      <div style={{ marginTop: '20px' }}>
        <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={handleCreateRoom}>
          <PlusCircle size={18} /> Create Private Room
        </button>

        <div className="divider">OR JOIN EXISTING</div>

        <form onSubmit={handleJoinRoom} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <input
              type="text"
              placeholder="Enter 6-char Room Code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
            />
          </div>
          <button type="submit" className="btn btn-success" style={{ width: '100%' }}>
            <LogIn size={18} /> Join Room
          </button>
        </form>
      </div>
    </div>
  );
}