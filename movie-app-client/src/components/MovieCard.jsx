import React from 'react';

const MovieCard = ({ 
  movie, 
  isHorizontal = false, 
  favorites = [], 
  addToFavorites, 
  openTropeModal, 
  openMovieModal 
}) => (
  <div
    onClick={() => openMovieModal(movie)}
    style={{
      minWidth: isHorizontal ? '280px' : '300px',
      maxWidth: isHorizontal ? '280px' : '300px',
      backgroundColor: 'white',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      border: '1px solid #eee',
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'scale(1.02)';
      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'scale(1)';
      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    }}
  >
    <h4 style={{ 
      margin: '0 0 8px 0', 
      color: '#333',
      fontSize: isHorizontal ? '0.95rem' : '1.1rem',
      height: isHorizontal ? '35px' : '40px',
      overflow: 'hidden',
      lineHeight: '1.2'
    }}>
      {movie.title}
    </h4>
    
    <div style={{ marginBottom: '12px', color: '#666', fontSize: '0.85rem' }}>
      <div><strong>Year:</strong> {movie.release_year || 'N/A'}</div>
      <div><strong>Rating:</strong> {movie.vote_average ? Number(movie.vote_average).toFixed(1) : 'N/A'}</div>
      <div><strong>Director:</strong> {movie.director ? (movie.director.length > 20 ? movie.director.substring(0, 20) + '...' : movie.director) : 'N/A'}</div>
      {!isHorizontal && (
        <>
          <div><strong>Runtime:</strong> {movie.runtime ? `${movie.runtime} min` : 'N/A'}</div>
          <div><strong>Genres:</strong> {movie.genresString || 'N/A'}</div>
        </>
      )}
      {movie.character_tropes && (
        <div style={{ 
          backgroundColor: '#e7f3ff', 
          padding: '4px 8px', 
          borderRadius: '4px', 
          marginTop: '5px',
          border: '1px solid #b3d9ff'
        }}>
          <strong>🎭 Tropes:</strong> {movie.character_tropes}
        </div>
      )}
    </div>

    {!isHorizontal && movie.overview && (
      <p style={{ 
        color: '#666', 
        fontSize: '0.85rem', 
        lineHeight: '1.4',
        marginBottom: '15px',
        maxHeight: '60px',
        overflow: 'hidden'
      }}>
        {movie.overview.substring(0, 150)}...
      </p>
    )}

    <div style={{ display: 'flex', gap: '8px' }}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          addToFavorites(movie.id);
        }}
        style={{
          padding: isHorizontal ? '6px 10px' : '8px 15px',
          backgroundColor: favorites.includes(movie.id) ? '#28a745' : '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.8rem',
          flex: 1
        }}
      >
        {favorites.includes(movie.id) ? (isHorizontal ? '✓' : '✓ Favorited') : (isHorizontal ? '❤' : '❤ Favorite')}
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          openTropeModal(movie);
        }}
        style={{
          padding: isHorizontal ? '6px 10px' : '8px 15px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.8rem',
          flex: 1
        }}
      >
        {isHorizontal ? '+T' : '+ Trope'}
      </button>
    </div>
  </div>
);

export default MovieCard;