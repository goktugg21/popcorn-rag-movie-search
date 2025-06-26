import React from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';

/**
 * Advanced search bar component that redirects to search page
 * @param {Object} props - Component props
 * @param {boolean} props.initialAiMode - Initial AI mode state (optional)
 * @param {Function} props.onAiModeChange - Callback when AI mode changes (optional)
 */
const PinnedSearchBar = ({ initialAiMode, onAiModeChange }) => {
  const navigate = useNavigate();

  /**
   * Handle regular search - redirect to search page
   * @param {Object} searchData - Search data including query and filters
   */
  const handleSearch = (searchData) => {
    const { query, filters } = searchData;
    
    // Build search query parameters
    const searchParams = new URLSearchParams();
    searchParams.set('q', query);
    
    // Add filters as query parameters if they exist
    if (filters?.genre) searchParams.set('genre', filters.genre);
    if (filters?.year) searchParams.set('year', filters.year);
    if (filters?.rating) searchParams.set('rating', filters.rating);
    if (filters?.director) searchParams.set('director', filters.director);
    
    // Navigate to search page with query parameters
    navigate(`/search?${searchParams.toString()}`);
  };

  /**
   * Handle AI search - redirect to search page with AI mode
   * @param {string} query - AI search query
   */
  const handleAiSearch = (query) => {
    const searchParams = new URLSearchParams();
    searchParams.set('q', query);
    searchParams.set('ai', 'true'); // Flag to indicate AI search mode
    
    // Navigate to search page with AI query
    navigate(`/search?${searchParams.toString()}`);
  };

  return (
    <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 shadow-md py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center">
          <SearchBar 
            onSearch={handleSearch} 
            onAiSearch={handleAiSearch}
            initialAiMode={initialAiMode}
            onAiModeChange={onAiModeChange}
          />
        </div>
      </div>
    </div>
  );
};

export default PinnedSearchBar;
