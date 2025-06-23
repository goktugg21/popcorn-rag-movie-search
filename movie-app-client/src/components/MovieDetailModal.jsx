import React from 'react';

const MovieDetailModal = ({ 
  showMovieModal, 
  selectedMovieDetail, 
  closeMovieModal, 
  favorites = [], 
  addToFavorites, 
  openTropeModal 
}) => {
  if (!showMovieModal || !selectedMovieDetail) return null;

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
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#333', flex: 1 }}>{selectedMovieDetail.title}</h2>
          <button
            onClick={closeMovieModal}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#999',
              padding: '0',
              marginLeft: '15px'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Director:</strong> {selectedMovieDetail.director || 'N/A'}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Release Year:</strong> {selectedMovieDetail.release_year || 'N/A'}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Rating:</strong> {selectedMovieDetail.vote_average ? Number(selectedMovieDetail.vote_average).toFixed(1) : 'N/A'} 
              {selectedMovieDetail.vote_count && ` (${selectedMovieDetail.vote_count} votes)`}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Runtime:</strong> {selectedMovieDetail.runtime ? `${selectedMovieDetail.runtime} minutes` : 'N/A'}
            </div>
          </div>
          
          <div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Genres:</strong> {selectedMovieDetail.genresString || 'N/A'}
            </div>
            {selectedMovieDetail.hidden_details?.release_date && (
              <div style={{ marginBottom: '10px' }}>
                <strong>Release Date:</strong> {selectedMovieDetail.hidden_details.release_date}
              </div>
            )}
            {selectedMovieDetail.character_tropes && (
              <div style={{ marginBottom: '10px' }}>
                <strong>Character Tropes:</strong> {selectedMovieDetail.character_tropes}
              </div>
            )}
            {selectedMovieDetail.hidden_details?.tagline && (
              <div style={{ marginBottom: '10px' }}>
                <strong>Tagline:</strong> <em>"{selectedMovieDetail.hidden_details.tagline}"</em>
              </div>
            )}
          </div>
        </div>

        {selectedMovieDetail.overview && (
          <div style={{ marginBottom: '20px' }}>
            <strong>Overview:</strong>
            <p style={{ marginTop: '5px', lineHeight: '1.6', color: '#555' }}>
              {selectedMovieDetail.overview}
            </p>
          </div>
        )}

        {selectedMovieDetail.hidden_details?.stars && selectedMovieDetail.hidden_details.stars.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <strong>Stars:</strong>
            <p style={{ marginTop: '5px', color: '#555' }}>
              {selectedMovieDetail.hidden_details.stars.join(', ')}
            </p>
          </div>
        )}

        {selectedMovieDetail.hidden_details?.keywords && selectedMovieDetail.hidden_details.keywords.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <strong>Keywords:</strong>
            <div style={{ marginTop: '5px' }}>
              {selectedMovieDetail.hidden_details.keywords.map((keyword, index) => (
                <span
                  key={index}
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#f8f9fa',
                    padding: '4px 8px',
                    margin: '2px',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    color: '#495057'
                  }}
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {selectedMovieDetail.hidden_details?.production_companies && selectedMovieDetail.hidden_details.production_companies.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <strong>Production Companies:</strong>
            <p style={{ marginTop: '5px', color: '#555' }}>
              {selectedMovieDetail.hidden_details.production_companies.join(', ')}
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToFavorites(selectedMovieDetail.id);
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: favorites.includes(selectedMovieDetail.id) ? '#28a745' : '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {favorites.includes(selectedMovieDetail.id) ? '✓ Remove from Favorites' : '❤ Add to Favorites'}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              closeMovieModal();
              openTropeModal(selectedMovieDetail);
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            + Add Trope
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailModal;