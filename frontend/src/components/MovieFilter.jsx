import React, { useState, useEffect, useCallback } from 'react';
import FilterPanel from './FilterPanel';

/**
 * MovieFilter component that filters the movie list
 * @param {Object} props - Component props
 * @param {Array} props.movies - List of movies to filter
 * @param {Function} props.onFilteredMoviesChange - Callback for when filtered movies change
 * @param {string} props.mode - Display mode for filter panel: 'sidebar' or 'dropdown'
 * @param {string} props.className - Additional CSS classes
 */
const MovieFilter = ({
  movies = [],
  onFilteredMoviesChange,
  mode = 'sidebar',
  className = '',
}) => {
  // Filter dropdown state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Filter configurations
  const filterConfigs = [
    {
      id: 'search',
      label: 'Search',
      type: 'search',
      placeholder: 'Search by title or director...'
    },
    {
      id: 'genres',
      label: 'Genres',
      type: 'checkbox',
      options: [
        { label: 'Action', value: 'action' },
        { label: 'Drama', value: 'drama' },
        { label: 'Comedy', value: 'comedy' },
        { label: 'Sci-Fi', value: 'sci-fi' },
        { label: 'Horror', value: 'horror' },
        { label: 'Romance', value: 'romance' },
        { label: 'Adventure', value: 'adventure' },
        { label: 'Thriller', value: 'thriller' },
        { label: 'Fantasy', value: 'fantasy' },
        { label: 'Animation', value: 'animation' },
      ]
    },
    {
      id: 'year',
      label: 'Release Year',
      type: 'range',
      min: 1900,
      max: 2025,
      unit: ''
    },
    {
      id: 'rating',
      label: 'Rating',
      type: 'range',
      min: 0,
      max: 10,
      unit: '★'
    },
    {
      id: 'sort',
      label: 'Sort By',
      type: 'select',
      options: [
        { label: 'Popularity (High to Low)', value: 'popularity_desc' },
        { label: 'Popularity (Low to High)', value: 'popularity_asc' },
        { label: 'Rating (High to Low)', value: 'rating_desc' },
        { label: 'Rating (Low to High)', value: 'rating_asc' },
        { label: 'Title (A-Z)', value: 'title_asc' },
        { label: 'Title (Z-A)', value: 'title_desc' },
        { label: 'Release Date (Newest First)', value: 'date_desc' },
        { label: 'Release Date (Oldest First)', value: 'date_asc' },
      ]
    },
  ];

  // Initialize selected filters
  const [selectedFilters, setSelectedFilters] = useState(() => ({
    search: '',
    genres: [],
    year: [1900, 2025],
    rating: [0, 10],
    sort: 'popularity_desc'
  }));

  // Filtered movies state
  const [filteredMovies, setFilteredMovies] = useState(movies);

  // Apply filters to movies
  const applyFilters = useCallback((filters) => {
    // Start with all movies
    let result = [...movies];
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(movie => 
        (movie.original_title && movie.original_title.toLowerCase().includes(searchLower)) ||
        (movie.director && movie.director.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply genre filter
    if (filters.genres && filters.genres.length > 0) {
      result = result.filter(movie => {
        const movieGenres = typeof movie.genres === 'string' 
          ? movie.genres.toLowerCase().split(',').map(g => g.trim()) 
          : Array.isArray(movie.genres) 
            ? movie.genres.map(g => g.toLowerCase())
            : [];
        
        return filters.genres.some(genre => 
          movieGenres.includes(genre.toLowerCase())
        );
      });
    }
    
    // Apply year filter
    if (filters.year && Array.isArray(filters.year)) {
      const [minYear, maxYear] = filters.year;
      result = result.filter(movie => {
        const releaseYear = movie.release_date 
          ? new Date(movie.release_date).getFullYear() 
          : movie.release_year || 0;
        return releaseYear >= minYear && releaseYear <= maxYear;
      });
    }
    
    // Apply rating filter
    if (filters.rating && Array.isArray(filters.rating)) {
      const [minRating, maxRating] = filters.rating;
      result = result.filter(movie => {
        const rating = movie.vote_average || 0;
        return rating >= minRating && rating <= maxRating;
      });
    }
    
    // Apply sorting
    if (filters.sort) {
      const [field, direction] = filters.sort.split('_');
      
      result.sort((a, b) => {
        let valueA, valueB;
        
        // Determine values based on sort field
        switch (field) {
          case 'title':
            valueA = a.original_title || '';
            valueB = b.original_title || '';
            break;
          case 'date':
            valueA = a.release_date ? new Date(a.release_date).getTime() : 0;
            valueB = b.release_date ? new Date(b.release_date).getTime() : 0;
            break;
          case 'rating':
            valueA = a.vote_average || 0;
            valueB = b.vote_average || 0;
            break;
          case 'popularity':
          default:
            valueA = a.popularity || 0;
            valueB = b.popularity || 0;
        }
        
        // Apply sort direction
        if (direction === 'asc') {
          return typeof valueA === 'string' 
            ? valueA.localeCompare(valueB) 
            : valueA - valueB;
        } else {
          return typeof valueA === 'string' 
            ? valueB.localeCompare(valueA) 
            : valueB - valueA;
        }
      });
    }
    
    return result;
  }, [movies]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setSelectedFilters(newFilters);
    const newFilteredMovies = applyFilters(newFilters);
    setFilteredMovies(newFilteredMovies);
    
    if (onFilteredMoviesChange) {
      onFilteredMoviesChange(newFilteredMovies);
    }
  };

  // Toggle filter dropdown
  const toggleFilterDropdown = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  // Initialize filtered movies on component mount
  useEffect(() => {
    const initialFilteredMovies = applyFilters(selectedFilters);
    setFilteredMovies(initialFilteredMovies);
    
    if (onFilteredMoviesChange) {
      onFilteredMoviesChange(initialFilteredMovies);
    }
  }, [movies, applyFilters]);

  return (
    <FilterPanel
      mode={mode}
      filters={filterConfigs}
      selectedFilters={selectedFilters}
      onFilterChange={handleFilterChange}
      isOpen={isFilterOpen}
      onToggle={toggleFilterDropdown}
      className={className}
    />
  );
};

export default MovieFilter;
