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

    // reason and word are supplied by the socket contract for future turn-end UI.
    // eslint-disable-next-line no-unused-vars
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
    <div className="container game-shell">
      {!room ? (
        <Lobby onRoomJoined={handleRoomJoined} />
      ) : room.gameState === 'LOBBY' ? (
        <WaitingRoom roomCode={roomCode} room={room} currentSocketId={socket.id} />
      ) : (
        <div className="game-layout">
          {/* Header Bar with Round, Timer & Masked Word */}
          <GameHeader room={room} timer={timer} secretWord={secretWord} isDrawer={isDrawer} />

          {/* Main Layout Grid */}
          <div className="game-grid">
            {/* Word Chooser Overlay for Drawer */}
            {room.gameState === 'CHOOSING' && isDrawer && (
              <WordChooser wordOptions={wordOptions} onSelectWord={handleSelectWord} />
            )}

            {/* Scoreboard Left */}
            <div className="card scoreboard-card">
              <div className="panel-title panel-title-amber">
                <Trophy size={18} /> Scoreboard
              </div>
              <div className="scoreboard-list">
                {room.players
                  .slice()
                  .sort((a, b) => b.score - a.score)
                  .map((p, idx) => (
                    <div key={p.id} className={`score-row ${p.hasGuessed ? 'has-guessed' : ''} ${p.id === room.currentDrawer ? 'is-drawer' : ''}`}>
                      <div className="score-player">
                        <span className={`rank-badge rank-${idx + 1}`}>#{idx + 1}</span>
                        <User size={14} />
                        <span className={p.id === socket.id ? 'current-player' : ''}>
                          {p.username} {p.id === room.currentDrawer && '✏️'}
                        </span>
                      </div>
                      <span className="score-value">{p.score}pt</span>
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