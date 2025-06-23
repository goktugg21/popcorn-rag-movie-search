import React from 'react';
import MovieCard from './MovieCard';

const CategorySection = ({ 
  title, 
  movies, 
  showCount = 20, 
  favorites, 
  addToFavorites, 
  openTropeModal, 
  openMovieModal 
}) => {
  if (movies.length === 0) return null;
  
  return (
    <div style={{ marginBottom: '40px' }}>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#333',
        marginBottom: '20px'
      }}>
        {title} ({Math.min(movies.length, showCount)} / {movies.length} movies)
      </h2>
      
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        gap: '15px',
        paddingBottom: '10px'
      }}>
        {movies.slice(0, showCount).map((movie, index) => (
          <MovieCard 
            key={`${movie.title}_${movie.vote_average}_${index}`} 
            movie={movie} 
            isHorizontal={true}
            favorites={favorites}
            addToFavorites={addToFavorites}
            openTropeModal={openTropeModal}
            openMovieModal={openMovieModal}
          />
        ))}
      </div>
    </div>
  );
};

export default CategorySection;