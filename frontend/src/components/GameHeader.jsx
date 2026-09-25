import { Clock, Eye } from 'lucide-react';

export default function GameHeader({ room, timer, secretWord, isDrawer }) {
  const renderWordDisplay = () => {
    if (isDrawer && secretWord) {
      return <span style={{ color: '#10b981', letterSpacing: '2px', fontWeight: 'bold' }}>{secretWord}</span>;
    }

    if (room.gameState === 'DRAWING' && room.currentWordLength) {
      return (
        <span style={{ letterSpacing: '8px', fontSize: '1.4rem', fontWeight: 'bold', color: '#38bdf8' }}>
          {'_ '.repeat(room.currentWordLength)}
        </span>
      );
    }

    if (room.gameState === 'CHOOSING') {
      return <span style={{ color: '#f59e0b', italic: 'true' }}>Drawer is choosing a word...</span>;
    }

    return <span>Waiting...</span>;
  };

  return (
    <div className="card" style={{ padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>ROUND</span>
        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{room.currentRound || 1} / {room.totalRounds || 3}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
          {isDrawer ? 'YOUR WORD TO DRAW' : 'GUESS THE WORD'}
        </span>
        <div>{renderWordDisplay()}</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0f172a', padding: '8px 16px', borderRadius: '8px' }}>
        <Clock size={20} color={timer <= 10 ? '#ef4444' : '#38bdf8'} />
        <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: timer <= 10 ? '#ef4444' : '#f8fafc' }}>
          {timer}s
        </span>
      </div>
    </div>
  );
}