import { Trophy, Medal, RotateCcw } from 'lucide-react';

export default function GameOver({ podium, onPlayAgain }) {
  const winner = podium[0];

  return (
    <div className="card" style={{ maxWidth: '500px', margin: '40px auto', textAlign: 'center', padding: '32px' }}>
      <Trophy size={64} color="#f59e0b" style={{ margin: '0 auto 16px' }} />
      <h2 style={{ color: '#38bdf8', marginBottom: '8px' }}>Game Over!</h2>
      <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
        Winner: <strong style={{ color: '#10b981' }}>{winner?.username}</strong> with {winner?.score} points!
      </p>

      {/* Leaderboard */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px' }}>
        {podium.map((player, idx) => (
          <div key={player.id} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 16px',
            borderRadius: '8px',
            background: idx === 0 ? 'rgba(245, 158, 11, 0.2)' : '#0f172a',
            border: idx === 0 ? '1px solid #f59e0b' : '1px solid #334155'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Medal size={18} color={idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : '#b45309'} />
              <span>{player.username}</span>
            </div>
            <strong style={{ color: '#10b981' }}>{player.score} pts</strong>
          </div>
        ))}
      </div>

      <button onClick={onPlayAgain} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
        <RotateCcw size={18} /> Return to Lobby
      </button>
    </div>
  );
}