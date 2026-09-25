import { useState, useEffect } from 'react';
import { socket } from './socket';
import Lobby from './components/Lobby';
import WaitingRoom from './components/WaitingRoom';
import Canvas from './components/Canvas';
import Chat from './components/Chat';
import GameHeader from './components/GameHeader';
import WordChooser from './components/WordChooser';
import GameOver from './components/GameOver';
import { Trophy, User } from 'lucide-react';
import './App.css';

export default function App() {
  const [roomCode, setRoomCode] = useState(null);
  const [room, setRoom] = useState(null);
  const [timer, setTimer] = useState(0);
  const [wordOptions, setWordOptions] = useState([]);
  const [secretWord, setSecretWord] = useState('');
  const [podium, setPodium] = useState(null);

  useEffect(() => {
    const handlePlayerJoined = ({ players }) => setRoom((prev) => (prev ? { ...prev, players } : prev));
    const handlePlayerLeft = ({ players, newHostId }) => {
      setRoom((prev) => (prev ? { ...prev, players, host: newHostId || prev.host } : prev));
    };
    const handleUpdatePlayers = ({ players }) => setRoom((prev) => (prev ? { ...prev, players } : prev));

    const handleTurnStarted = (data) => {
      setRoom((prev) => ({
        ...prev,
        gameState: data.gameState,
        currentDrawer: data.currentDrawer,
        currentRound: data.currentRound,
        totalRounds: data.totalRounds,
        players: data.players,
      }));
      setTimer(data.timer);
      setWordOptions(data.wordOptions || []);
      setSecretWord('');
    };

    const handleWordSelected = (data) => {
      setRoom((prev) => ({
        ...prev,
        gameState: data.gameState,
        currentWordLength: data.wordLength,
      }));
      setTimer(data.timer);
      setWordOptions([]);
    };

    const handleSecretWord = ({ word }) => setSecretWord(word);
    const handleTimerTick = ({ timer }) => setTimer(timer);

    const handleTurnEnded = ({ reason, word, players }) => {
      setRoom((prev) => ({
        ...prev,
        gameState: 'TURN_END',
        players,
      }));
    };

    const handleGameOver = ({ podium }) => {
      setPodium(podium);
      setRoom((prev) => ({ ...prev, gameState: 'GAME_OVER' }));
    };

    socket.on('player_joined', handlePlayerJoined);
    socket.on('player_left', handlePlayerLeft);
    socket.on('update_players', handleUpdatePlayers);
    socket.on('turn_started', handleTurnStarted);
    socket.on('word_selected', handleWordSelected);
    socket.on('secret_word', handleSecretWord);
    socket.on('timer_tick', handleTimerTick);
    socket.on('turn_ended', handleTurnEnded);
    socket.on('game_over', handleGameOver);

    return () => {
      socket.off('player_joined', handlePlayerJoined);
      socket.off('player_left', handlePlayerLeft);
      socket.off('update_players', handleUpdatePlayers);
      socket.off('turn_started', handleTurnStarted);
      socket.off('word_selected', handleWordSelected);
      socket.off('secret_word', handleSecretWord);
      socket.off('timer_tick', handleTimerTick);
      socket.off('turn_ended', handleTurnEnded);
      socket.off('game_over', handleGameOver);
    };
  }, []);

  const handleRoomJoined = (code, roomData) => {
    setRoomCode(code);
    setRoom(roomData);
  };

  const handleSelectWord = (word) => {
    socket.emit('select_word', { roomCode, word });
  };

  const handlePlayAgain = () => {
    setRoom(null);
    setRoomCode(null);
    setPodium(null);
  };

  const isDrawer = room?.currentDrawer === socket.id;

  if (room?.gameState === 'GAME_OVER' && podium) {
    return <GameOver podium={podium} onPlayAgain={handlePlayAgain} />;
  }

  return (
    <div className="container" style={{ maxWidth: '1200px' }}>
      {!room ? (
        <Lobby onRoomJoined={handleRoomJoined} />
      ) : room.gameState === 'LOBBY' ? (
        <WaitingRoom roomCode={roomCode} room={room} currentSocketId={socket.id} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
          {/* Header Bar with Round, Timer & Masked Word */}
          <GameHeader room={room} timer={timer} secretWord={secretWord} isDrawer={isDrawer} />

          {/* Main Layout Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 320px', gap: '16px', alignItems: 'start', position: 'relative' }}>
            {/* Word Chooser Overlay for Drawer */}
            {room.gameState === 'CHOOSING' && isDrawer && (
              <WordChooser wordOptions={wordOptions} onSelectWord={handleSelectWord} />
            )}

            {/* Scoreboard Left */}
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#f59e0b', fontWeight: 'bold' }}>
                <Trophy size={18} /> Scoreboard
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {room.players
                  .slice()
                  .sort((a, b) => b.score - a.score)
                  .map((p, idx) => (
                    <div key={p.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px',
                      borderRadius: '6px',
                      background: p.hasGuessed ? 'rgba(16, 185, 129, 0.15)' : '#0f172a',
                      border: p.id === room.currentDrawer ? '1px solid #38bdf8' : '1px solid #334155'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                        <span>#{idx + 1}</span>
                        <User size={14} color="#94a3b8" />
                        <span style={{ fontWeight: p.id === socket.id ? 'bold' : 'normal' }}>
                          {p.username} {p.id === room.currentDrawer && '✏️'}
                        </span>
                      </div>
                      <span style={{ fontWeight: 'bold', color: '#10b981', fontSize: '0.9rem' }}>{p.score}pt</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Canvas Center */}
            <Canvas roomCode={roomCode} isDrawer={isDrawer && room.gameState === 'DRAWING'} />

            {/* Chat Right */}
            <Chat roomCode={roomCode} isDrawer={isDrawer} currentSocketId={socket.id} />
          </div>
        </div>
      )}
    </div>
  );
}