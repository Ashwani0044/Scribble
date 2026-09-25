export default function WordChooser({ wordOptions, onSelectWord }) {
    return (
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50,
        borderRadius: '8px'
      }}>
        <h3 style={{ color: '#38bdf8', marginBottom: '20px' }}>🎨 Pick a Word to Draw!</h3>
        <div style={{ display: 'flex', gap: '16px' }}>
          {wordOptions.map((word) => (
            <button
              key={word}
              onClick={() => onSelectWord(word)}
              className="btn btn-primary"
              style={{ fontSize: '1.1rem', padding: '12px 24px' }}
            >
              {word}
            </button>
          ))}
        </div>
      </div>
    );
  }