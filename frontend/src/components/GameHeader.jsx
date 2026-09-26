import { Clock } from 'lucide-react';

export default function GameHeader({ room, timer, secretWord, isDrawer }) {
  const renderWordDisplay = () => {
    if (isDrawer && secretWord) {
      return <span className="secret-word revealed-word">{secretWord}</span>;
    }

    if (room.gameState === 'DRAWING' && room.currentWordLength) {
      return (
        <span className="secret-word masked-word">
          {'_ '.repeat(room.currentWordLength)}
        </span>
      );
    }

    if (room.gameState === 'CHOOSING') {
      return <span className="word-status">Drawer is choosing a word...</span>;
    }

    return <span>Waiting...</span>;
  };

  return (
    <div className="card game-header">
      <div className="round-display">
        <span className="eyebrow">ROUND</span>
        <div className="round-number">{room.currentRound || 1} <span>/ {room.totalRounds || 3}</span></div>
      </div>

      <div className="word-display">
        <span className="eyebrow">
          {isDrawer ? 'YOUR WORD TO DRAW' : 'GUESS THE WORD'}
        </span>
        <div>{renderWordDisplay()}</div>
      </div>

      <div className={`timer-badge ${timer <= 10 ? 'timer-danger' : timer <= 20 ? 'timer-warning' : 'timer-default'}`}>
        <Clock size={20} />
        <span>
          {timer}s
        </span>
      </div>
    </div>
  );
}