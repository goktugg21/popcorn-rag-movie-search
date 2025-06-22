import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MovieCard from '../components/MovieCard';
import MovieFilter from '../components/MovieFilter';
import Pagination from '../components/Pagination';

/**
 * Movie Browser page with filtering capabilities
 */
const MovieBrowser = () => {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [filterMode, setFilterMode] = useState(window.innerWidth > 1024 ? 'sidebar' : 'dropdown');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [moviesPerPage] = useState(8);

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

  // Handle viewport size changes
  useEffect(() => {
    const handleResize = () => {
      setFilterMode(window.innerWidth > 1024 ? 'sidebar' : 'dropdown');
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch movies data
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        // In a real app, you would call your API here
        // const data = await api.movies.getAll();
        
        // For now, use mock data
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
          {
            id: 3,
            imdb_id: 'tt0816692',
            original_title: 'Interstellar',
            overview: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
            release_date: '2014-11-07',
            vote_average: 8.6,
            genres: 'Adventure, Drama, Sci-Fi',
            director: 'Christopher Nolan',
            poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
            popularity: 80
          },
          {
            id: 4,
            imdb_id: 'tt1853728',
            original_title: 'Django Unchained',
            overview: 'With the help of a German bounty hunter, a freed slave sets out to rescue his wife from a brutal Mississippi plantation owner.',
            release_date: '2012-12-25',
            vote_average: 8.4,
            genres: 'Western, Drama',
            director: 'Quentin Tarantino',
            poster: 'https://image.tmdb.org/t/p/w500/7oWLIGZFujUp0HMe2SuIDT6m1rh.jpg',
            popularity: 75
          },
          {
            id: 5,
            imdb_id: 'tt0110912',
            original_title: 'Pulp Fiction',
            overview: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
            release_date: '1994-10-14',
            vote_average: 8.9,
            genres: 'Crime, Drama',
            director: 'Quentin Tarantino',
            poster: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
            popularity: 70
          },
          {
            id: 6,
            imdb_id: 'tt0109830',
            original_title: 'Forrest Gump',
            overview: 'The presidencies of Kennedy and Johnson, the events of Vietnam, Watergate, and other history unfold through the perspective of an Alabama man with an IQ of 75.',
            release_date: '1994-07-06',
            vote_average: 8.8,
            genres: 'Drama, Romance, Comedy',
            director: 'Robert Zemeckis',
            poster: 'https://image.tmdb.org/t/p/w500/h5J4W4veyxMXDMjeNxZI46TsHOb.jpg',
            popularity: 65
          },
          {
            id: 7,
            imdb_id: 'tt0133093',
            original_title: 'The Matrix',
            overview: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
            release_date: '1999-03-31',
            vote_average: 8.7,
            genres: 'Action, Sci-Fi',
            director: 'Lana Wachowski, Lilly Wachowski',
            poster: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
            popularity: 60
          },
          {
            id: 8,
            imdb_id: 'tt0088763',
            original_title: 'Back to the Future',
            overview: 'Marty McFly, a 17-year-old high school student, is accidentally sent thirty years into the past in a time-traveling DeLorean invented by his close friend, the eccentric scientist Doc Brown.',
            release_date: '1985-07-03',
            vote_average: 8.5,
            genres: 'Adventure, Comedy, Sci-Fi',
            director: 'Robert Zemeckis',
            poster: 'https://image.tmdb.org/t/p/w500/7lyBcpYB0Qt8gYhXYaEZUNlNQAv.jpg',
            popularity: 55
          },
          {
            id: 9,
            imdb_id: 'tt0111161',
            original_title: 'The Shawshank Redemption',
            overview: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
            release_date: '1994-09-23',
            vote_average: 9.3,
            genres: 'Drama, Crime',
            director: 'Frank Darabont',
            poster: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
            popularity: 50
          },
          {
            id: 10,
            imdb_id: 'tt0068646',
            original_title: 'The Godfather',
            overview: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
            release_date: '1972-03-14',
            vote_average: 9.2,
            genres: 'Crime, Drama',
            director: 'Francis Ford Coppola',
            poster: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
            popularity: 45
          },
          {
            id: 11,
            imdb_id: 'tt0167260',
            original_title: 'The Lord of the Rings: The Return of the King',
            overview: 'Gandalf and Aragorn lead the World of Men against Sauron\'s army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.',
            release_date: '2003-12-17',
            vote_average: 8.9,
            genres: 'Adventure, Fantasy, Action',
            director: 'Peter Jackson',
            poster: 'https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg',
            popularity: 40
          },
          {
            id: 12,
            imdb_id: 'tt0080684',
            original_title: 'Star Wars: Episode V - The Empire Strikes Back',
            overview: 'After the Rebels are brutally overpowered by the Empire on the ice planet Hoth, Luke Skywalker begins Jedi training with Yoda, while his friends are pursued by Darth Vader and a bounty hunter named Boba Fett all over the galaxy.',
            release_date: '1980-05-21',
            vote_average: 8.7,
            genres: 'Adventure, Action, Sci-Fi',
            director: 'Irvin Kershner',
            poster: 'https://image.tmdb.org/t/p/w500/7BuH8itoSrLExs2YZSsM01Qk2no.jpg',
            popularity: 35
          }
        ];
        
        setMovies(mockMovies);
        setFilteredMovies(mockMovies);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError('Failed to fetch movies. Please try again later.');
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Handle filtered movies change
  const handleFilteredMoviesChange = (movies) => {
    setFilteredMovies(movies);
    // Reset to first page when filters change
    setCurrentPage(1);
  };

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

  // Handle view mode change
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
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Movies</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Discover and explore movies from our collection
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filter (on large screens) */}
        {filterMode === 'sidebar' && (
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

          {/* Content */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : filteredMovies.length === 0 ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 text-center">
              <h3 className="text-xl font-medium text-yellow-800 dark:text-yellow-200 mb-2">No movies found</h3>
              <p className="text-yellow-600 dark:text-yellow-400">Try adjusting your filters to find what you're looking for</p>
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
                  className="flex flex-col sm:flex-row bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                  onClick={() => window.location.href = `/movie/${movie.imdb_id || movie.id}`}
                >
                  <div className="sm:w-1/4 md:w-1/5">
                    <div className="relative pb-[150%] sm:pb-0 sm:h-full">
                      <img 
                        src={movie.poster} 
                        alt={movie.original_title}
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
                        {movie.original_title}
                      </h3>
                      {movie.vote_average && (
                        <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full text-sm font-semibold flex items-center">
                          <span className="mr-1">★</span> {movie.vote_average.toFixed(1)}
                        </div>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {typeof movie.genres === 'string' ? 
                        movie.genres.split(',').map((genre, index) => (
                          <span 
                            key={index}
                            className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium"
                          >
                            {genre.trim()}
                          </span>
                        )) :
                        Array.isArray(movie.genres) && movie.genres.map((genre, index) => (
                          <span 
                            key={index}
                            className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium"
                          >
                            {genre}
                          </span>
                        ))
                      }
                    </div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300 line-clamp-2">
                      {movie.overview}
                    </p>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="mr-4">
                          {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown year'}
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

export default MovieBrowser;
