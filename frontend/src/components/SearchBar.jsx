import React, { useState } from 'react';

/**
 * SearchBar component for searching movies with two modes:
 * 1. Simple keyword search with filters
 * 2. AI-powered search
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onSearch - Function called when keyword search is submitted
 * @param {Function} props.onAiSearch - Function called when AI search is submitted
 */
const SearchBar = ({ onSearch, onAiSearch }) => {
  const [isAiMode, setIsAiMode] = useState(false);
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [genre, setGenre] = useState('');
  const [yearRange, setYearRange] = useState([1900, 2025]);
  const [rating, setRating] = useState('');
  const [director, setDirector] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    if (isAiMode) {
      onAiSearch(query);
    } else {
      onSearch({
        query,
        filters: {
          genre: genre || undefined,
          year: yearRange[0] !== 1900 || yearRange[1] !== 2025 ? `${yearRange[0]}-${yearRange[1]}` : undefined,
          rating: rating || undefined,
          director: director || undefined,
        }
      });
    }
  };

  const toggleSearchMode = () => {
    setIsAiMode(!isAiMode);
    setQuery('');
    setShowFilters(false);
  };

  const toggleFilters = () => {
    if (!isAiMode) {
      setShowFilters(!showFilters);
    }
  };

  return (
    <div className="w-full max-w-3xl">
      {/* Search mode toggle */}
      <div className="flex justify-end mb-2">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setIsAiMode(false)}
            className={`px-4 py-1 text-sm font-medium rounded-l-lg ${
              !isAiMode 
                ? 'bg-primary-light text-white dark:bg-primary-dark' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Keyword Search
          </button>
          <button
            type="button"
            onClick={() => setIsAiMode(true)}
            className={`px-4 py-1 text-sm font-medium rounded-r-lg ${
              isAiMode 
                ? 'bg-primary-light text-white dark:bg-primary-dark' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            AI Search
          </button>
        </div>
      </div>

      {/* Search form */}
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center">
          {/* Search input */}
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder={isAiMode ? "Ask something about movies..." : "Search for movies..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`w-full px-4 py-3 pr-20 text-sm rounded-lg border-2 
                ${isAiMode ? 'border-purple-400 focus:ring-purple-500 focus:border-purple-500' : 'border-gray-300 focus:ring-primary-light focus:border-primary-light'}
                focus:outline-none focus:ring-2
                dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
            />
            
            {/* Filter button (only in keyword mode) */}
            {!isAiMode && (
              <button
                type="button"
                onClick={toggleFilters}
                className="absolute right-12 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                aria-label="Toggle filters"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
            )}
            
            {/* Search button */}
            <button
              type="submit"
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg 
                ${isAiMode ? 'text-purple-500 hover:bg-purple-100 dark:hover:bg-purple-900' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600'}
                dark:text-gray-400`}
              aria-label="Search"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Filters section (only shown in keyword mode when filters are toggled) */}
        {!isAiMode && showFilters && (
          <div className="mt-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Genre dropdown */}
              <div>
                <label htmlFor="genre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Genre
                </label>
                <select
                  id="genre"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">All Genres</option>
                  <option value="Action">Action</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Comedy">Comedy</option>
                  <option value="Drama">Drama</option>
                  <option value="Horror">Horror</option>
                  <option value="Sci-Fi">Sci-Fi</option>
                  <option value="Thriller">Thriller</option>
                </select>
              </div>

              {/* Year Range Slider */}
              <div>
                <label htmlFor="yearRange" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Release Year Range
                </label>
                <div className="px-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{yearRange[0]}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{yearRange[1]}</span>
                  </div>
                  
                  {/* Range Slider Track */}
                  <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4">
                    {/* Active range highlight */}
                    <div 
                      className="absolute h-2 bg-blue-500 rounded-lg"
                      style={{
                        left: `${((yearRange[0] - 1900) / (2025 - 1900)) * 100}%`,
                        width: `${((yearRange[1] - yearRange[0]) / (2025 - 1900)) * 100}%`
                      }}
                    />
                    
                    {/* Min thumb */}
                    <div
                      className="absolute w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-md cursor-pointer transform -translate-y-1 hover:bg-blue-700"
                      style={{
                        left: `${((yearRange[0] - 1900) / (2025 - 1900)) * 100}%`,
                        transform: 'translateX(-50%) translateY(-25%)'
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const rect = e.currentTarget.parentElement.getBoundingClientRect();
                        const handleMouseMove = (moveEvent) => {
                          const x = moveEvent.clientX - rect.left;
                          const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
                          const newYear = Math.round(1900 + (percentage / 100) * (2025 - 1900));
                          setYearRange([Math.min(newYear, yearRange[1]), yearRange[1]]);
                        };
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    />
                    
                    {/* Max thumb */}
                    <div
                      className="absolute w-4 h-4 bg-red-600 border-2 border-white rounded-full shadow-md cursor-pointer transform -translate-y-1 hover:bg-red-700"
                      style={{
                        left: `${((yearRange[1] - 1900) / (2025 - 1900)) * 100}%`,
                        transform: 'translateX(-50%) translateY(-25%)'
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const rect = e.currentTarget.parentElement.getBoundingClientRect();
                        const handleMouseMove = (moveEvent) => {
                          const x = moveEvent.clientX - rect.left;
                          const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
                          const newYear = Math.round(1900 + (percentage / 100) * (2025 - 1900));
                          setYearRange([yearRange[0], Math.max(newYear, yearRange[0])]);
                        };
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    />
                  </div>
                  
                  {/* Year input fields */}
                  <div className="flex justify-between mt-2">
                    <input
                      type="number"
                      min="1900"
                      max="2025"
                      value={yearRange[0]}
                      onChange={(e) => {
                        const newMin = parseInt(e.target.value) || 1900;
                        setYearRange([Math.min(newMin, yearRange[1]), yearRange[1]]);
                      }}
                      className="w-20 px-2 py-1 text-xs rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400 self-center">to</span>
                    <input
                      type="number"
                      min="1900"
                      max="2025"
                      value={yearRange[1]}
                      onChange={(e) => {
                        const newMax = parseInt(e.target.value) || 2025;
                        setYearRange([yearRange[0], Math.max(newMax, yearRange[0])]);
                      }}
                      className="w-20 px-2 py-1 text-xs rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Rating dropdown */}
              <div>
                <label htmlFor="rating" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Minimum Rating
                </label>
                <select
                  id="rating"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Any Rating</option>
                  <option value="9">9+ ⭐</option>
                  <option value="8">8+ ⭐</option>
                  <option value="7">7+ ⭐</option>
                  <option value="6">6+ ⭐</option>
                  <option value="5">5+ ⭐</option>
                </select>
              </div>

              {/* Director input */}
              <div>
                <label htmlFor="director" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Director
                </label>
                <input
                  type="text"
                  id="director"
                  value={director}
                  onChange={(e) => setDirector(e.target.value)}
                  placeholder="Director name"
                  className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
