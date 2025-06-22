import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import Button from '../components/Button';

/**
 * Movie Detail page component
 * Displays detailed information about a movie
 */
const MovieDetail = () => {
  const { id } = useParams(); // Get movie ID from URL params
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch movie details when component mounts
  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        // Determine if we have an IMDB ID (starts with 'tt') or a numeric ID
        const params = id.startsWith('tt') ? { imdb_id: id } : { id: parseInt(id) };
        const data = await api.movies.getMovie(params);
        setMovie(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching movie details:', err);
        setError('Failed to load movie details. Please try again later.');
        setLoading(false);
      }
    };

    if (id) {
      fetchMovieDetails();
    }
  }, [id]);

  // Animation variants
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    in: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3
      }
    }
  };

  // Handle back button click
  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  // Format release date
  const formatReleaseDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format runtime
  const formatRuntime = (minutes) => {
    if (!minutes) return 'Unknown';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Format budget and revenue
  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <motion.div 
      className="container mx-auto px-4 py-8"
      initial="initial"
      animate="in"
      exit="exit"
      variants={pageVariants}
    >
      {/* Back button */}
      <div className="mb-6">
        <Button 
          variant="secondary" 
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" 
              clipRule="evenodd" 
            />
          </svg>
          Back
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-light"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <Button variant="primary" className="mt-4" onClick={handleBack}>
            Go Back
          </Button>
        </div>
      ) : movie ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-xl">
          {/* Movie header with poster and basic info */}
          <div className="flex flex-col md:flex-row">
            {/* Poster */}
            <div className="md:w-1/3 lg:w-1/4">
              <div className="relative pb-[150%]">
                <img 
                  src={movie.poster} 
                  alt={movie.original_title}
                  className="absolute h-full w-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
                  }}
                />
              </div>
            </div>
            
            {/* Basic info */}
            <div className="md:w-2/3 lg:w-3/4 p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                    {movie.original_title}
                  </h1>
                  
                  {movie.tagline && (
                    <p className="mt-2 text-lg italic text-gray-600 dark:text-gray-300">
                      "{movie.tagline}"
                    </p>
                  )}
                </div>
                
                {movie.vote_average && (
                  <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-2 rounded-full text-lg font-bold flex items-center">
                    <span className="mr-1">★</span> {movie.vote_average.toFixed(1)}
                    {movie.vote_count && (
                      <span className="ml-1 text-sm font-normal">
                        ({movie.vote_count} votes)
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {/* Movie metadata */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="block text-gray-500 dark:text-gray-400">Release Date</span>
                  <span className="font-medium text-gray-800 dark:text-white">{formatReleaseDate(movie.release_date)}</span>
                </div>
                
                {movie.runtime && (
                  <div>
                    <span className="block text-gray-500 dark:text-gray-400">Runtime</span>
                    <span className="font-medium text-gray-800 dark:text-white">{formatRuntime(movie.runtime)}</span>
                  </div>
                )}
                
                {movie.director && (
                  <div>
                    <span className="block text-gray-500 dark:text-gray-400">Director</span>
                    <span className="font-medium text-gray-800 dark:text-white">{movie.director}</span>
                  </div>
                )}
              </div>
              
              {/* Genres */}
              {movie.genres && (
                <div className="mt-6">
                  <div className="flex flex-wrap gap-2">
                    {typeof movie.genres === 'string' ? 
                      movie.genres.split(',').map((genre, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                        >
                          {genre.trim()}
                        </span>
                      )) :
                      Array.isArray(movie.genres) && movie.genres.map((genre, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                        >
                          {genre}
                        </span>
                      ))
                    }
                  </div>
                </div>
              )}
              
              {/* Overview */}
              {movie.overview && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Overview</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{movie.overview}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Additional details */}
          <div className="px-6 md:px-8 py-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Cast */}
              {movie.cast && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Cast</h3>
                  <p className="text-gray-600 dark:text-gray-300">{movie.cast}</p>
                </div>
              )}
              
              {/* Financial info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Financial</h3>
                <div className="space-y-1">
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Budget:</span> {formatCurrency(movie.budget)}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Revenue:</span> {formatCurrency(movie.revenue)}
                  </p>
                </div>
              </div>
              
              {/* Keywords or character tropes */}
              {(movie.keywords || movie.character_tropes) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    {movie.character_tropes ? 'Character Tropes' : 'Keywords'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.character_tropes && Array.isArray(movie.character_tropes) ? 
                      movie.character_tropes.map((trope, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs"
                        >
                          {trope}
                        </span>
                      )) : 
                      movie.keywords && typeof movie.keywords === 'string' && movie.keywords.split(',').map((keyword, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs"
                        >
                          {keyword.trim()}
                        </span>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="px-6 md:px-8 py-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-4">
              {movie.imdb_id && (
                <a 
                  href={`https://www.imdb.com/title/${movie.imdb_id}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-md font-medium transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.31 9.588v.005c-.077-.048-.227-.07-.42-.07v4.815c.27 0 .44-.023.488-.048.155-.084.233-.298.233-.663v-3.39c0-.36-.078-.575-.3-.65z" />
                    <path d="M22.416 0H1.62C.742 0 .032.698.032 1.56v20.88c0 .862.71 1.56 1.588 1.56h20.796c.877 0 1.588-.698 1.588-1.56V1.56c0-.862-.71-1.56-1.588-1.56zM7.7 15.975H5.09V8.03H7.7v7.945zm7.306-7.312c.51.286.775.687.775 1.273v5.22c0 .42-.13.748-.388.994-.259.246-.65.374-1.19.374-.425 0-.854-.118-1.266-.36v-1.392c.293.24.622.36.99.36.284 0 .425-.088.425-.265V12.9h-1.413v-1.476h1.413v-.893c-.155.061-.39.093-.683.093-.313 0-.573-.06-.806-.17-.233-.11-.437-.276-.605-.485-.168-.21-.3-.45-.395-.72-.096-.27-.145-.563-.145-.878 0-.6.21-1.082.621-1.444.413-.363.885-.545 1.414-.545.12 0 .266.008.436.023.168.016.32.034.46.057.137.023.25.048.34.08.89.03.158.048.202.057v1.37c-.226-.143-.493-.215-.8-.215-.242 0-.418.068-.526.207-.109.139-.162.329-.162.567 0 .27.058.496.17.675.114.18.3.27.563.27.222 0 .4-.047.54-.14.139-.93.226-.208.262-.343v-.63zm4.882 7.258a1.962 1.962 0 0 1-.741.516 2.897 2.897 0 0 1-.916.14c-.34 0-.643-.054-.913-.17a1.661 1.661 0 0 1-.627-.425 1.591 1.591 0 0 1-.358-.625 2.418 2.418 0 0 1-.116-.745c0-.588.148-1.04.44-1.355.294-.316.69-.472 1.182-.472.094 0 .22.008.384.026.16.018.33.064.507.14v-.516c0-.227-.008-.418-.026-.57a.834.834 0 0 0-.145-.37.607.607 0 0 0-.335-.195c-.15-.033-.34-.05-.572-.05-.133 0-.288.014-.468.042-.18.029-.368.069-.562.12v-1.41c.18-.043.393-.08.64-.113.25-.033.51-.05.79-.05.407 0 .757.052 1.053.159.296.106.536.26.72.46.185.201.32.45.407.745.86.296.13.634.13 1.016v3.691h-1.413l.019-.92z" />
                  </svg>
                  View on IMDb
                </a>
              )}
              
              {movie.homepage && (
                <a 
                  href={movie.homepage} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md font-medium transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Official Website
                </a>
              )}
              
              <Button variant="primary" className="inline-flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Add to Favorites
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center">
          <p className="text-yellow-600 dark:text-yellow-400">Movie not found</p>
          <Button variant="primary" className="mt-4" onClick={handleBack}>
            Go Back
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default MovieDetail;
