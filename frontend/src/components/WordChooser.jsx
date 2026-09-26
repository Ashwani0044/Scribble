export default function WordChooser({ wordOptions, onSelectWord }) {
    return (
      <div className="word-chooser-overlay">
        <div className="chooser-card">
          <span className="chooser-icon">✎</span>
          <h3>Pick a Word to Draw!</h3>
          <p>Choose quickly, then make it unmistakable.</p>
        <div className="word-options">
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
      </div>
    );
  }