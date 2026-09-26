import { Trophy, Medal, RotateCcw } from 'lucide-react';

export default function GameOver({ podium, onPlayAgain }) {
  const winner = podium[0];

  return (
    <div className="card game-over-card">
      <Trophy className="winner-trophy" size={64} />
      <h2>Game Over!</h2>
      <p className="winner-copy">
        Winner: <strong>{winner?.username}</strong> with {winner?.score} points!
      </p>

      {/* Leaderboard */}
      <div className="leaderboard-list">
        {podium.map((player, idx) => (
          <div key={player.id} className={`leaderboard-row ${idx === 0 ? 'winner-row' : ''}`}>
            <div className="leaderboard-player">
              <Medal className={`medal medal-${idx + 1}`} size={18} />
              <span>{player.username}</span>
            </div>
            <strong className="score-value">{player.score} pts</strong>
          </div>
        ))}
      </div>

      <button onClick={onPlayAgain} className="btn btn-primary play-again-button">
        <RotateCcw size={18} /> Return to Lobby
      </button>
    </div>
  );
}