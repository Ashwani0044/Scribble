import { useState } from 'react';
import { socket } from '../socket';
import { LogIn, PlusCircle, Palette, MessageSquare, Trophy, Sparkles } from 'lucide-react';
import './Lobby.css';

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
    <div className="lobby-wrapper">
      {/* Floating Animated Background Doodles */}
      <div className="floating-doodle float-1">✏️</div>
      <div className="floating-doodle float-2">🎨</div>
      <div className="floating-doodle float-3">💬</div>
      <div className="floating-doodle float-4">🏆</div>
      <div className="floating-doodle float-5">💡</div>

      {/* Main Container */}
      <div className="lobby-content">
        {/* Lobby Card */}
        <div className="card lobby-card">
          <div className="brand-mark">
            <span>✦</span> Scribble
          </div>
          <p className="lobby-kicker">A quick-draw party game</p>
          <h1 className="lobby-title">Draw it. Guess it. Win it.</h1>
          <p className="lobby-subtitle">Gather your friends and turn a blank canvas into chaos.</p>

          <div className="input-group">
            <label htmlFor="username">Your Name</label>
            <input
              id="username"
              type="text"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={15}
            />
          </div>

          {error && <div className="error-text">{error}</div>}

          <div className="lobby-actions">
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={handleCreateRoom}
            >
              <PlusCircle size={18} /> Create Private Room
            </button>

            <div className="divider">OR JOIN EXISTING</div>

            <form onSubmit={handleJoinRoom} className="join-form">
              <div className="input-group input-group-compact">
                <label htmlFor="room-code">Room Code</label>
                <input
                  id="room-code"
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

        {/* How To Play Section Below Card */}
        <div className="how-to-play-container">
          <div className="how-to-play-header">
            <Sparkles size={20} className="accent-sparkle" />
            <h2>How to Play</h2>
          </div>

          <div className="instructions-grid">
            {/* Step 1 */}
            <div className="instruction-card">
              <div className="step-badge">1</div>
              <div className="step-icon">
                <Palette size={26} />
              </div>
              <h3>Draw Your Secret Word</h3>
              <p>When it's your turn, pick a secret word and draw it on the shared canvas before time expires.</p>
            </div>

            {/* Step 2 */}
            <div className="instruction-card">
              <div className="step-badge">2</div>
              <div className="step-icon">
                <MessageSquare size={26} />
              </div>
              <h3>Guess in Live Chat</h3>
              <p>Watch other players draw in real time and type your guesses into the chat as fast as you can.</p>
            </div>

            {/* Step 3 */}
            <div className="instruction-card">
              <div className="step-badge">3</div>
              <div className="step-icon">
                <Trophy size={26} />
              </div>
              <h3>Earn Speed Points</h3>
              <p>The faster you guess the correct answer, the more points you score. Highest score wins the game!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}