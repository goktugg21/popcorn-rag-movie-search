import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Movie card component for displaying movie information
 * @param {Object} props - Component props
 * @param {Object} props.movie - Movie data
 */
const MovieCard = ({ movie }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  // Handle navigation to movie details page
  const handleViewDetails = () => {
    const movieId = movie.imdb_id || movie.id;
    navigate(`/movie/${movieId}`);
  };

  // Handle image loading errors
  const handleImageError = (e) => {
    e.target.src = 'https://placehold.co/300x450?text=No+Movie+Poster';
  };

  // Format the release year
  const releaseYear = movie.release_year || (movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A');
  
  // Get main genre
  const mainGenre = Array.isArray(movie.genres) && movie.genres.length > 0
    ? movie.genres[0]
    : typeof movie.genres === 'string'
      ? movie.genres.split(',')[0]?.trim()
      : 'N/A';

  // Get title with fallback
  const movieTitle = movie.title || movie.original_title || 'N/A';
  
  // Get overview with fallback
  const movieOverview = movie.hidden_details?.overview || movie.overview || 'No description available';
  
  // Get tagline if available
  const tagline = movie.hidden_details?.tagline;

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewDetails}
    >
      {/* Poster Image with Overlay */}
      <div className="relative overflow-hidden pb-[150%]">
        {/* Movie Poster */}
        <img 
          src={movie.poster || (movie.poster_path ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}` : 'https://placehold.co/300x450?text=No+Movie+Poster')} 
          alt={movieTitle}
          className="absolute h-full w-full object-cover transform transition-transform duration-300"
          style={{ 
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          }}
          onError={handleImageError}
        />
        
        {/* Rating Badge */}
        {movie.vote_average && (
          <div className="absolute top-2 right-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full text-xs font-semibold flex items-center shadow-md">
            <span className="mr-1">★</span> {movie.vote_average.toFixed(1)}
          </div>
        )}
        
        {/* Hover Overlay */}
        <div 
          className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent transition-opacity duration-300 flex flex-col justify-end p-4 ${
            isHovered ? 'opacity-100' : 'opacity-80'
          }`}
        >
          <h3 className="font-bold text-xl text-white mb-1 line-clamp-1">
            {movieTitle}
          </h3>
          {/* Tagline (if available) */}
          {tagline && (
            <p className="text-sm text-white/90 italic mb-2 line-clamp-1">
              "{tagline}"
            </p>
          )}
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white/80">
              {releaseYear}
            </span>
            <span className="text-sm text-white/80 bg-black/30 px-2 py-0.5 rounded">
              {mainGenre}
            </span>
          </div>
          
          {/* View Details Button (only visible on hover) */}
          <div className={`transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <button 
              className="w-full mt-2 px-4 py-2 bg-primary-light text-white rounded-md hover:bg-primary-dark transition-colors text-sm font-medium"
              onClick={handleViewDetails}
            >
              View Details
            </button>
          </div>
        </div>
      </div>
      
      {/* Card Content (only visible when not hovered) */}
      <div className={`p-4 transition-all duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
          {movieOverview}
        </p>
        {movie.director && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Director: {movie.director}
          </p>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
