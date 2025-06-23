import React from 'react';

const TropeModal = ({ 
  showTropeModal, 
  selectedMovie, 
  tropeText, 
  setTropeText, 
  addTrope, 
  setShowTropeModal 
}) => {
  if (!showTropeModal) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        width: '400px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginTop: 0 }}>🎭 Add Character Trope</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Movie: <strong>{selectedMovie?.title}</strong>
        </p>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Character Trope:</label>
          <input
            type="text"
            value={tropeText}
            onChange={(e) => setTropeText(e.target.value)}
            placeholder="e.g., Anti-hero, Mentor, Comic relief..."
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={addTrope}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Add Trope
          </button>
          <button
            onClick={() => setShowTropeModal(false)}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TropeModal;