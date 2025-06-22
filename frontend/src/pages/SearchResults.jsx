import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import MovieCard from '../components/MovieCard';
import MovieFilter from '../components/MovieFilter';
import Pagination from '../components/Pagination';
import api from '../utils/api';
import { withErrorBoundary } from '../components/ErrorBoundary';
import { SearchResultsSkeleton } from '../components/Skeletons';
import { Spinner } from '../components/LoadingAnimations';

/**
 * Search Results page component
 * Displays search results based on query parameters
 */
const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const isAiMode = searchParams.get('ai') === 'true';
  const genreFilter = searchParams.get('genre') || '';
  const yearFilter = searchParams.get('year') || '';
  const ratingFilter = searchParams.get('rating') || '';
  const directorFilter = searchParams.get('director') || '';
  
  // States
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiResponse, setAiResponse] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [filterMode, setFilterMode] = useState(window.innerWidth > 1024 ? 'sidebar' : 'dropdown');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [moviesPerPage] = useState(12);

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] } 
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      transition: { duration: 0.3 } 
    }
  };

  // Parse year filter - can be single year or range "1990-2000"
  const parseYearFilter = (yearFilter) => {
    if (!yearFilter) return undefined;
    
    // Check if it's a range (contains hyphen)
    if (yearFilter.includes('-')) {
      const [minYear, maxYear] = yearFilter.split('-').map(y => parseInt(y.trim()));
      return [minYear, maxYear];
    } else {
      // Single year - treat as exact year match (range of 1 year)
      const year = parseInt(yearFilter);
      return [year, year];
    }
  };

  // Handle viewport size changes
  useEffect(() => {
    const handleResize = () => {
      setFilterMode(window.innerWidth > 1024 ? 'sidebar' : 'dropdown');
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch search results when query changes
  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        setCurrentPage(1); // Reset to first page on new search
        setAiResponse(''); // Clear AI response
        
        if (query) {
          if (isAiMode) {
            // Handle AI search
            const { response, movie_ids } = await api.movies.aiSearch(query);
            setAiResponse(response || '');
            
            // If we have movie IDs, fetch the movie details
            let movieResults = [];
            if (Array.isArray(movie_ids) && movie_ids.length > 0) {
              // Limit to 30 movie IDs and fetch movie details in parallel
              const moviePromises = movie_ids.slice(0, 30).map(imdb_id => 
                api.movies.getMovie({ imdb_id }).catch(err => {
                  console.error(`Error fetching movie ${imdb_id}:`, err);
                  return null;
                })
              );
              
              // Wait for all movie details to be fetched
              const movies = await Promise.all(moviePromises);
              movieResults = movies.filter(movie => movie !== null);
            }
            
            setMovies(movieResults);
            setFilteredMovies(movieResults);
          } else {
            // Handle regular search with filters
            const searchFilters = {
              query,
              genres: genreFilter ? [genreFilter] : undefined,
              year: yearFilter ? parseYearFilter(yearFilter) : undefined,
              director: directorFilter ? [directorFilter] : undefined,
              rating: ratingFilter ? parseFloat(ratingFilter) : undefined
            };
            
            const data = await api.movies.searchMovies(searchFilters);
            
            // Check if the response is an array or has a results property
            let movieResults = [];
            if (Array.isArray(data)) {
              movieResults = data;
            } else if (data && Array.isArray(data.results)) {
              movieResults = data.results;
            } else if (data && Array.isArray(data.movies)) {
              movieResults = data.movies;
            }
            
            // Limit results to maximum of 30 movies
            movieResults = movieResults.slice(0, 30);
            
            console.log('Search API response:', data);
            console.log('Processed movie results:', movieResults);
            
            setMovies(movieResults);
            setFilteredMovies(movieResults);
          }
        } else {
          setMovies([]);
          setFilteredMovies([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError('Failed to fetch search results. Please try again later.');
        
        // Fallback to mock data if API fails
        const mockMovies = [
          {
            id: 1,
            imdb_id: 'tt1375666',
            original_title: 'Inception',
            overview: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
            release_date: '2010-07-16',
            vote_average: 8.8,
            genres: 'Action, Sci-Fi, Thriller',
            director: 'Christopher Nolan',
            poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
            popularity: 90
          },
          {
            id: 2,
            imdb_id: 'tt0468569',
            original_title: 'The Dark Knight',
            overview: 'When the menace known as The Joker emerges from his mysterious past, he wreaks havoc and chaos on the people of Gotham.',
            release_date: '2008-07-18',
            vote_average: 9.0,
            genres: 'Action, Crime, Drama',
            director: 'Christopher Nolan',
            poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
            popularity: 85
          },
        ];
        
        // Filter movies based on query for mock data
        const filteredResults = mockMovies.filter(movie => 
          (movie.title || movie.original_title || '').toLowerCase().includes(query.toLowerCase()) ||
          (movie.director && movie.director.toLowerCase().includes(query.toLowerCase())) ||
          (movie.genres && 
            (typeof movie.genres === 'string' ? movie.genres.toLowerCase().includes(query.toLowerCase()) :
             Array.isArray(movie.genres) ? movie.genres.some(g => g.toLowerCase().includes(query.toLowerCase())) : false))
        );
        
        // Limit mock results to maximum of 30 movies
        const limitedResults = filteredResults.slice(0, 30);
        
        setMovies(limitedResults);
        setFilteredMovies(limitedResults);
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, isAiMode, genreFilter, yearFilter, ratingFilter, directorFilter]);

  // Handle filtered movies change
  const handleFilteredMoviesChange = useCallback((newFilteredMovies) => {
    setFilteredMovies(newFilteredMovies);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  // Calculate current movies to display based on pagination
  const indexOfLastMovie = currentPage * moviesPerPage;
  const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
  const currentMovies = filteredMovies.slice(indexOfFirstMovie, indexOfLastMovie);
  const totalPages = Math.ceil(filteredMovies.length / moviesPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };

  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      initial="initial"
      animate="in"
      exit="exit"
      variants={pageVariants}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          {query ? `Search Results for: "${query}"` : 'Search Results'}
        </h1>
        {query && (
          <p className="text-gray-600 dark:text-gray-300">
            Found {filteredMovies.length} results for your search
          </p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filter (on large screens) */}
        {filterMode === 'sidebar' && movies.length > 0 && (
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <MovieFilter
                movies={movies}
                onFilteredMoviesChange={handleFilteredMoviesChange}
                mode="sidebar"
              />
            </div>
          </div>
        )}

        <div className="flex-grow">
          {/* Header with count, dropdown filter, and view toggle */}
          {movies.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="text-gray-600 dark:text-gray-300">
                {filteredMovies.length} {filteredMovies.length === 1 ? 'movie' : 'movies'} found
              </div>
              
              <div className="flex items-center gap-4">
                {/* Dropdown Filter (on small/medium screens) */}
                {filterMode === 'dropdown' && (
                  <MovieFilter
                    movies={movies}
                    onFilteredMoviesChange={handleFilteredMoviesChange}
                    mode="dropdown"
                  />
                )}
                
                {/* View toggle */}
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-md p-1">
                  <button
                    className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-500 dark:text-gray-400'}`}
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid view"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 8a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zm6-6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zm0 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-500 dark:text-gray-400'}`}
                    onClick={() => setViewMode('list')}
                    aria-label="List view"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
              <Spinner size="xl" color="primary" />
              <p className="mt-4 text-gray-600 dark:text-gray-400 animate-pulse">
                Searching for "{query}"...
              </p>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
              <h3 className="text-xl font-medium text-red-600 dark:text-red-400 mb-2">Search Error</h3>
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            </div>
          ) : !query ? (
            <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">Enter a search query</h3>
              <p className="text-gray-600 dark:text-gray-400">Use the search bar above to find movies</p>
            </div>
          ) : (!filteredMovies || filteredMovies.length === 0) ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 text-center">
              <h3 className="text-xl font-medium text-yellow-800 dark:text-yellow-200 mb-2">No results found</h3>
              <p className="text-yellow-600 dark:text-yellow-400">
                We couldn't find any movies matching "{query}". Try adjusting your filters or search terms.
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {currentMovies.map((movie) => (
                <div 
                  key={movie.id} 
                  className="flex flex-col sm:flex-row bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => window.location.href = `/movie/${movie.imdb_id || movie.id}`}
                >
                  <div className="sm:w-1/4 md:w-1/5">
                    <div className="relative pb-[150%] sm:pb-0 sm:h-full">
                      <img 
                        src={movie.poster || 'https://placehold.co/500x750?text=No+Image'} 
                        alt={movie.title || movie.original_title || 'Movie poster'}
                        className="absolute sm:relative h-full w-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/500x750?text=No+Image';
                        }}
                      />
                    </div>
                  </div>
                  <div className="p-4 sm:p-6 sm:w-3/4 md:w-4/5">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                        {movie.title || movie.original_title || 'N/A'}
                      </h3>
                      {movie.vote_average && (
                        <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full text-sm font-semibold flex items-center">
                          <span className="mr-1">★</span> {movie.vote_average.toFixed(1)}
                        </div>
                      )}
                    </div>
                    
                    {/* Tagline */}
                    {movie.hidden_details?.tagline && (
                      <p className="mt-1 text-sm italic text-gray-500 dark:text-gray-400">
                        "{movie.hidden_details.tagline}"
                      </p>
                    )}
                    
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Array.isArray(movie.genres) ? 
                        movie.genres.slice(0, 3).map((genre, index) => (
                          <span 
                            key={index}
                            className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium"
                          >
                            {genre || 'N/A'}
                          </span>
                        )) :
                        typeof movie.genres === 'string' && movie.genres.split(',').slice(0, 3).map((genre, index) => (
                          <span 
                            key={index}
                            className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium"
                          >
                            {genre.trim() || 'N/A'}
                          </span>
                        ))
                      }
                    </div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300 line-clamp-2">
                      {movie.hidden_details?.overview || movie.overview || 'No description available'}
                    </p>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="mr-4">
                          {movie.release_year || (movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown year')}
                        </span>
                        {movie.director && (
                          <span>Director: {movie.director}</span>
                        )}
                      </div>
                      <button className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:text-blue-800 dark:hover:text-blue-300">
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {filteredMovies.length > moviesPerPage && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                siblingCount={1}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Export with error boundary
export default withErrorBoundary(SearchResults);
