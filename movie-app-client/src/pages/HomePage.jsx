// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000';

// Axios global config
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

function HomePage({ isLoggedIn }) {
  const [movies, setMovies] = useState({
    popular: [],
    action: [],
    science: [],
    others: []
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showTropeModal, setShowTropeModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [tropeText, setTropeText] = useState('');
  const [tropeLoading, setTropeLoading] = useState(false);
  
  // Search Filters
  const [searchFilters, setSearchFilters] = useState({
    keyword: 'action',
    genres: ['Action'],
    year: [2015],
    director: [],
    rating: null
  });
  const [searchLoading, setSearchLoading] = useState(false);

  // AI Search
  const [showAiSearch, setShowAiSearch] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiMovies, setAiMovies] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchMoviesWithFilters();
  }, []);

  const fetchMoviesWithFilters = async (customFilters = null) => {
    const filters = customFilters || searchFilters;
    setSearchLoading(true);
    
    try {
      console.log('Search request sent with:', filters);
      
      const response = await axios.post(`${API_BASE_URL}/search`, {
        query: filters.keyword || 'action',
        keyword: [],
        genres: filters.genres,
        year: filters.year,
        director: filters.director,
        rating: filters.rating
      });

      const movieData = response.data;
      console.log('Movies received:', movieData);

      // Data from backend comes in object of objects format, convert to array
      const allMovies = Object.values(movieData).map(movie => ({
        id: movie.id,
        original_title: movie.title,
        title: movie.title,
        director: movie.director,
        genres: Array.isArray(movie.genres) ? movie.genres.join(', ') : movie.genres,
        release_year: movie.release_year,
        vote_average: movie.vote_average,
        vote_count: movie.vote_count,
        runtime: movie.runtime,
        overview: movie.hidden_details?.overview || '',
        stars: movie.hidden_details?.stars || [],
        keywords: movie.hidden_details?.keywords || [],
        character_tropes: movie.hidden_details?.character_tropes || '',
        tagline: movie.hidden_details?.tagline || '',
        release_date: movie.hidden_details?.release_date || '',
        popularity: movie.vote_average * movie.vote_count
      }));

      console.log('Processed movies:', allMovies.length);
      
      // Categorize
      const categorizedMovies = {
        popular: allMovies
          .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
          .slice(0, 20),
        action: allMovies
          .slice(0, 20),
        science: allMovies
          .filter(movie => movie.genres && (
            movie.genres.toLowerCase().includes('science') || 
            movie.genres.toLowerCase().includes('sci-fi')
          ))
          .slice(0, 20),
        others: allMovies
          .filter(movie => movie.genres && !movie.genres.toLowerCase().includes('science') && 
                          !movie.genres.toLowerCase().includes('sci-fi'))
          .slice(0, 20)
      };

      setMovies(categorizedMovies);
    } catch (error) {
      console.error('Error fetching movies:', error);
      setMessage('Failed to load movies');
    } finally {
      setSearchLoading(false);
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    // Real-time search removed - only state is being updated
  };

  const applyFilters = () => {
    // At least 3 characters check
    if (searchFilters.keyword && searchFilters.keyword.length < 3) {
      setMessage('Keyword must be at least 3 characters');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    setLoading(true);
    fetchMoviesWithFilters();
  };

  const resetFilters = () => {
    const defaultFilters = {
      keyword: 'action',
      genres: ['Action'],
      year: [2015],
      director: [],
      rating: null
    };
    setSearchFilters(defaultFilters);
    setLoading(true);
    fetchMoviesWithFilters(defaultFilters);
  };

  // AI Search Functions
  const handleAiSearch = async () => {
    if (!aiQuery.trim()) {
      setMessage('Please enter an AI search query');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setAiLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        query: aiQuery.trim()
      });

      setAiResponse(response.data.response);
      
      // Get movie IDs found by AI
      const movieIds = response.data.movie_ids || [];
      
      // Use these IDs to fetch movie details
      const moviePromises = movieIds.map(async (imdbId) => {
        try {
          const movieResponse = await axios.get(`${API_BASE_URL}/movie?imdb_id=${imdbId}`);
          return movieResponse.data;
        } catch (error) {
          console.error('Error fetching movie:', error);
          return null;
        }
      });

      const aiMovieResults = await Promise.all(moviePromises);
      setAiMovies(aiMovieResults.filter(movie => movie !== null));
      
    } catch (error) {
      console.error('AI Search error:', error);
      setMessage(error.response?.data?.error || 'AI search failed');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setAiLoading(false);
    }
  };

  const addToFavorites = async (movieId, event) => {
    event.stopPropagation();
    
    if (!isLoggedIn) {
      setMessage('Please login to add favorites');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    try {
      console.log('Adding movie to favorites:', movieId);
      console.log('Login status:', isLoggedIn);
      
      const response = await axios.post(`${API_BASE_URL}/add_favourite`, 
        { movie_id: movieId },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Favorite added successfully:', response.data);
      setMessage('✅ Added to favorites!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Add favorite error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      
      if (error.response?.status === 401) {
        setMessage('🔒 Please login first - Session may have expired');
        // Update login status
        // setIsLoggedIn(false); // If this function exists in App.jsx
      } else if (error.response?.status === 400) {
        setMessage('❌ Invalid movie ID or request');
      } else {
        setMessage(`❌ ${error.response?.data || 'Failed to add to favorites'}`);
      }
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const openTropeModal = (movie, event) => {
    event.stopPropagation();
    
    if (!isLoggedIn) {
      setMessage('Please login to add tropes');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    setSelectedMovie(movie);
    setShowTropeModal(true);
    setTropeText('');
  };

  const addTrope = async () => {
    if (!tropeText.trim()) {
      setMessage('Please enter a trope');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setTropeLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/add_trope`, {
        user_trope: tropeText.trim(),
        selected_movie_id: selectedMovie.id
      }, { withCredentials: true });

      setMessage('Trope added successfully!');
      setShowTropeModal(false);
      setTropeText('');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Add trope error:', error);
      setMessage(error.response?.data || 'Failed to add trope');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setTropeLoading(false);
    }
  };

  const closeTropeModal = () => {
    setShowTropeModal(false);
    setSelectedMovie(null);
    setTropeText('');
  };

  // Search Filter Component
  const SearchFilters = () => (
    <div style={{
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: '20px',
      padding: '30px',
      marginBottom: '50px',
      border: '1px solid rgba(255,255,255,0.1)',
      backdropFilter: 'blur(10px)'
    }}>
      <h3 style={{
        color: '#ffffff',
        fontSize: '1.5rem',
        fontWeight: '700',
        marginBottom: '15px',
        textAlign: 'center'
      }}>🔍 Search & Filter Movies</h3>
      
      <div style={{
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderRadius: '12px',
        padding: '15px',
        marginBottom: '25px',
        border: '1px solid rgba(59, 130, 246, 0.3)'
      }}>
        <p style={{ color: '#60a5fa', margin: 0, fontSize: '0.9rem', lineHeight: '1.4' }}>
          ℹ️ <strong>How search works:</strong> All filters work together (AND logic). 
          Results are sorted by rating (highest first) and limited to 150 movies max.
        </p>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '25px'
      }}>
        {/* Keyword Input - KEYED SAFE VERSION */}
        <div>
          <label style={{ color: '#d1d5db', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>
            🔍 Keyword (min 3 characters)
          </label>
          <input
            key={`keyword-${Date.now()}`}
            type="text"
            defaultValue={searchFilters.keyword}
            onBlur={(e) => {
              setSearchFilters(prev => ({ ...prev, keyword: e.target.value }));
            }}
            placeholder="Search in title/overview: action, thriller, inception..."
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <small style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
            💡 Searches in movie titles and descriptions
          </small>
        </div>

        {/* Year Input - KEYED SAFE VERSION */}
        <div>
          <label style={{ color: '#d1d5db', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>
            📅 Year Range (comma separated)
          </label>
          <input
            key={`year-${Date.now()}`}
            type="text"
            defaultValue={Array.isArray(searchFilters.year) ? searchFilters.year.join(', ') : ''}
            onBlur={(e) => {
              const years = e.target.value.split(',').map(y => parseInt(y.trim())).filter(y => !isNaN(y));
              setSearchFilters(prev => ({ ...prev, year: years }));
            }}
            placeholder="2015, 2016, 2017 or 1990, 2000 (range)"
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <small style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
            💡 Single year: 2015 | Range: 1990, 2000 | Multiple: 2015, 2016, 2017
          </small>
        </div>

        {/* Genres Input - KEYED SAFE VERSION */}
        <div>
          <label style={{ color: '#d1d5db', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>
            🎭 Genres (max 5, comma separated)
          </label>
          <input
            key={`genres-${Date.now()}`}
            type="text"
            defaultValue={Array.isArray(searchFilters.genres) ? searchFilters.genres.join(', ') : ''}
            onBlur={(e) => {
              const genres = e.target.value.split(',').map(g => g.trim()).filter(g => g);
              setSearchFilters(prev => ({ ...prev, genres: genres }));
            }}
            placeholder="Action, Comedy, Drama, Horror, Romance..."
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <small style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
            💡 OR search: movies with ANY of these genres
          </small>
        </div>

        {/* Rating Input - KEYED SAFE VERSION */}
        <div>
          <label style={{ color: '#d1d5db', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>
            ⭐ Min Rating (0-10)
          </label>
          <input
            key={`rating-${Date.now()}`}
            type="number"
            min="0"
            max="10"
            step="0.1"
            defaultValue={searchFilters.rating || ''}
            onBlur={(e) => {
              const rating = e.target.value ? parseFloat(e.target.value) : null;
              setSearchFilters(prev => ({ ...prev, rating: rating }));
            }}
            placeholder="7.0, 8.5, 9.0..."
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <small style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
            💡 Shows movies with rating greater or equal to this value
          </small>
        </div>
      </div>

      {/* Buttons */}
      <div style={{
        display: 'flex',
        gap: '15px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={applyFilters}
          disabled={searchLoading || (searchFilters.keyword && searchFilters.keyword.length < 3)}
          style={{
            padding: '12px 30px',
            backgroundColor: searchLoading || (searchFilters.keyword && searchFilters.keyword.length < 3) ? '#6b7280' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '600',
            cursor: searchLoading || (searchFilters.keyword && searchFilters.keyword.length < 3) ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {searchLoading ? 'Searching...' : '🔍 Apply Filters'}
        </button>

        <button
          onClick={resetFilters}
          disabled={searchLoading}
          style={{
            padding: '12px 30px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '600',
            cursor: searchLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          🔄 Reset
        </button>
        
        {/* AI Search button removed */}
      </div>
    </div>
  );

  // AI Search Component
  const AiSearchPanel = () => (
    showAiSearch && (
      <div style={{
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderRadius: '20px',
        padding: '30px',
        marginBottom: '50px',
        border: '1px solid rgba(139, 92, 246, 0.3)'
      }}>
        <h3 style={{
          color: '#a855f7',
          fontSize: '1.5rem',
          fontWeight: '700',
          marginBottom: '20px',
          textAlign: 'center'
        }}>🤖 AI-Powered Movie Search</h3>
        
        <div style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          <input
            type="text"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            placeholder="Ask AI anything about movies... e.g., 'Find me action movies with Bruce Willis'"
            style={{
              flex: 1,
              minWidth: '300px',
              padding: '15px 20px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '12px',
              color: 'white',
              outline: 'none',
              fontSize: '1rem'
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleAiSearch()}
          />
          <button
            onClick={handleAiSearch}
            disabled={aiLoading}
            style={{
              padding: '15px 25px',
              background: aiLoading ? '#6b7280' : 'linear-gradient(135deg, #8b5cf6, #a855f7)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              cursor: aiLoading ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {aiLoading ? '🤔 Thinking...' : '🚀 Ask AI'}
          </button>
        </div>

        {aiResponse && (
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h4 style={{ color: '#a855f7', marginBottom: '10px', fontSize: '1.1rem' }}>🤖 AI Response:</h4>
            <p style={{ color: '#e5e7eb', lineHeight: '1.6', margin: 0 }}>{aiResponse}</p>
          </div>
        )}

        {aiMovies.length > 0 && (
          <div>
            <h4 style={{ color: '#a855f7', marginBottom: '15px', fontSize: '1.1rem' }}>
              🎬 AI Found {aiMovies.length} Movies:
            </h4>
            <div style={{
              display: 'flex',
              gap: '15px',
              overflowX: 'auto',
              paddingBottom: '10px'
            }}>
              {aiMovies.map((movie, index) => (
                <div key={index} style={{
                  minWidth: '200px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  padding: '15px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <h5 style={{ color: 'white', marginBottom: '8px', fontSize: '0.9rem' }}>
                    {movie.original_title}
                  </h5>
                  <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0 }}>
                    {movie.release_year} • ⭐ {movie.vote_average}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  );

  const MovieSlider = ({ title, movieList, categoryKey, gradientColors }) => (
    <div style={{ marginBottom: '60px' }}>
      <h2 style={{
        fontSize: '2.2rem',
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: '30px',
        paddingLeft: '60px',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
      }}>
        {title}
      </h2>
      
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        paddingLeft: '60px',
        paddingRight: '60px',
        gap: '25px',
        scrollBehavior: 'smooth',
        paddingBottom: '15px'
      }}>
        {movieList.map((movie) => (
          <div
            key={`${categoryKey}-${movie.id}`}
            style={{
              minWidth: '320px',
              maxWidth: '320px',
              height: '480px',
              backgroundColor: '#1a1a1a',
              borderRadius: '16px',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              position: 'relative',
              boxShadow: '0 10px 40px rgba(0,0,0,0.4)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05) translateY(-10px)';
              e.currentTarget.style.boxShadow = '0 25px 50px rgba(0,0,0,0.5)';
              e.currentTarget.style.zIndex = '10';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateY(0px)';
              e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.4)';
              e.currentTarget.style.zIndex = '1';
            }}
          >
            {/* Movie Poster */}
            <div style={{
              height: '350px',
              backgroundColor: '#2a2a2a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666',
              fontSize: '5rem',
              position: 'relative',
              border: '2px dashed #444'
            }}>
              📽️
              
              {/* Overlay for better text visibility */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 100%)'
              }}></div>

              {/* Rating Badge */}
              <div style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                backgroundColor: 'rgba(0,0,0,0.8)',
                color: '#ffd700',
                padding: '8px 12px',
                borderRadius: '20px',
                fontSize: '1rem',
                fontWeight: '700',
                backdropFilter: 'blur(10px)',
                zIndex: 2
              }}>
                ⭐ {movie.vote_average ? Number(movie.vote_average).toFixed(1) : 'N/A'}
              </div>

              {/* Year Badge */}
              <div style={{
                position: 'absolute',
                top: '15px',
                left: '15px',
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: '600',
                backdropFilter: 'blur(10px)',
                zIndex: 2
              }}>
                {movie.release_year || 'N/A'}
              </div>

              {/* Hover Actions */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                gap: '15px',
                opacity: 0,
                transition: 'opacity 0.3s ease',
                zIndex: 3
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.opacity = '1';
              }}>
                <button
                  onClick={(e) => addToFavorites(movie.id, e)}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: 'rgba(220, 38, 38, 0.9)',
                    color: 'white',
                    fontSize: '1.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = 'rgba(220, 38, 38, 1)';
                    e.target.style.transform = 'scale(1.1)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'rgba(220, 38, 38, 0.9)';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  ❤️
                </button>

                <button
                  onClick={(e) => openTropeModal(movie, e)}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: 'rgba(59, 130, 246, 0.9)',
                    color: 'white',
                    fontSize: '1.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = 'rgba(59, 130, 246, 1)';
                    e.target.style.transform = 'scale(1.1)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.9)';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  🏷️
                </button>
              </div>
            </div>

            {/* Movie Info */}
            <div style={{ padding: '25px', color: 'white' }}>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '10px',
                lineHeight: '1.3',
                height: '2.6em',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {movie.title || movie.original_title}
              </h3>

              {/* Director */}
              {movie.director && (
                <p style={{
                  fontSize: '0.9rem',
                  color: '#a1a1aa',
                  marginBottom: '12px',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis'
                }}>
                  🎬 {movie.director}
                </p>
              )}

              {/* Genres */}
              {movie.genres && (
                <div style={{ marginBottom: '0' }}>
                  {(Array.isArray(movie.genres) ? movie.genres : movie.genres.split(',')).slice(0, 2).map((genre, index) => (
                    <span key={index} style={{
                      display: 'inline-block',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: '#e4e4e7',
                      fontSize: '0.8rem',
                      padding: '6px 10px',
                      borderRadius: '12px',
                      marginRight: '8px',
                      marginBottom: '6px',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                      {typeof genre === 'string' ? genre.trim() : genre}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Custom Scrollbar */}
      <style>{`
        div[style*="overflowX: 'auto'"]::-webkit-scrollbar {
          height: 8px;
        }
        div[style*="overflowX: 'auto'"]::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
        div[style*="overflowX: 'auto'"]::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.3);
          border-radius: 4px;
        }
        div[style*="overflowX: 'auto'"]::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.5);
        }
      `}</style>
    </div>
  );

  // Trope Modal Component
  const TropeModal = () => (
    showTropeModal && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(5px)'
      }}
      onClick={closeTropeModal}>
        <div style={{
          backgroundColor: '#1f2937',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '500px',
          width: '90%',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
        onClick={(e) => e.stopPropagation()}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '10px'
            }}>
              Add Character Trope
            </h2>
            <p style={{
              color: '#9ca3af',
              fontSize: '1rem'
            }}>
              for "{selectedMovie?.title || selectedMovie?.original_title}"
            </p>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#d1d5db',
              marginBottom: '12px'
            }}>
              Character Trope
            </label>
            <input
              type="text"
              value={tropeText}
              onChange={(e) => setTropeText(e.target.value)}
              placeholder="e.g., Anti-hero, Mentor, Comic relief..."
              style={{
                width: '100%',
                padding: '16px 20px',
                fontSize: '1rem',
                border: '2px solid #374151',
                borderRadius: '12px',
                backgroundColor: '#111827',
                color: '#ffffff',
                transition: 'all 0.3s ease',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#374151';
                e.target.style.boxShadow = 'none';
              }}
              disabled={tropeLoading}
            />
          </div>

          <div style={{
            display: 'flex',
            gap: '15px',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={closeTropeModal}
              disabled={tropeLoading}
              style={{
                padding: '12px 24px',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#9ca3af',
                backgroundColor: 'transparent',
                border: '2px solid #374151',
                borderRadius: '10px',
                cursor: tropeLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                if (!tropeLoading) {
                  e.target.style.backgroundColor = '#374151';
                  e.target.style.color = '#ffffff';
                }
              }}
              onMouseOut={(e) => {
                if (!tropeLoading) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#9ca3af';
                }
              }}
            >
              Cancel
            </button>
            <button
              onClick={addTrope}
              disabled={tropeLoading || !tropeText.trim()}
              style={{
                padding: '12px 24px',
                fontSize: '1rem',
                fontWeight: '700',
                color: 'white',
                background: tropeLoading || !tropeText.trim() 
                  ? '#6b7280' 
                  : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                border: 'none',
                borderRadius: '10px',
                cursor: tropeLoading || !tropeText.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => {
                if (!tropeLoading && tropeText.trim()) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
                }
              }}
              onMouseOut={(e) => {
                if (!tropeLoading && tropeText.trim()) {
                  e.target.style.transform = 'translateY(0px)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              {tropeLoading && (
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
              )}
              {tropeLoading ? 'Adding...' : 'Add Trope'}
            </button>
          </div>
        </div>
      </div>
    )
  );

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #374151',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 30px'
          }}></div>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600',
            marginBottom: '10px'
          }}>Loading Movies...</h2>
          <p style={{ 
            color: '#9ca3af',
            fontSize: '1rem'
          }}>Preparing your cinematic experience</p>
          
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)',
      paddingTop: '60px',
      paddingBottom: '60px'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '60px',
        padding: '0 60px'
      }}>
        <h1 style={{
          fontSize: '4rem',
          fontWeight: '900',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ef4444)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '20px',
          textShadow: '0 0 30px rgba(59, 130, 246, 0.3)'
        }}>
          🎬 CineScope
        </h1>
        <p style={{
          fontSize: '1.4rem',
          color: '#9ca3af',
          maxWidth: '700px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Discover, explore, and curate your perfect movie collection with personalized tropes and favorites
        </p>
        
        {!isLoggedIn && (
          <div style={{
            marginTop: '30px',
            padding: '20px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '16px',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            maxWidth: '600px',
            margin: '30px auto 0'
          }}>
            <p style={{ 
              color: '#60a5fa', 
              margin: 0, 
              fontWeight: '600',
              fontSize: '1.1rem'
            }}>
              🔑 Login to unlock personalized features like favorites and character trope tagging!
            </p>
          </div>
        )}
      </div>

      {/* Search Filters */}
      <div style={{ padding: '0 60px' }}>
        <SearchFilters />
        {/* AI Search Panel removed */}
      </div>

      {/* Message Notification */}
      {message && (
        <div style={{
          position: 'fixed',
          top: '100px',
          right: '30px',
          backgroundColor: message.includes('Failed') || message.includes('Please') ? '#ef4444' : '#10b981',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          zIndex: 1000,
          fontSize: '1rem',
          fontWeight: '600',
          backdropFilter: 'blur(10px)',
          animation: 'slideIn 0.3s ease-out'
        }}>
          {message}
        </div>
      )}

      {/* Movie Sliders */}
      <MovieSlider 
        title="🔥 Trending Now" 
        movieList={movies.popular} 
        categoryKey="popular"
        gradientColors={['#ff6b6b', '#feca57']}
      />
      
      <MovieSlider 
        title="💥 Action & Adventure" 
        movieList={movies.action} 
        categoryKey="action"
        gradientColors={['#ff9ff3', '#f368e0']}
      />
      
      <MovieSlider 
        title="🚀 Sci-Fi Universe" 
        movieList={movies.science} 
        categoryKey="science"
        gradientColors={['#74b9ff', '#0984e3']}
      />
      
      <MovieSlider 
        title="🎭 More Genres" 
        movieList={movies.others} 
        categoryKey="others"
        gradientColors={['#a29bfe', '#6c5ce7']}
      />

      {/* Empty State */}
      {!loading && movies.popular.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '80px 60px',
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderRadius: '20px',
          margin: '0 60px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ 
            fontSize: '5rem', 
            marginBottom: '30px',
            filter: 'grayscale(1)'
          }}>🎬</div>
          <h3 style={{ 
            color: '#ffffff', 
            marginBottom: '15px',
            fontSize: '1.8rem'
          }}>No Movies Found</h3>
          <p style={{ 
            color: '#9ca3af',
            fontSize: '1.1rem'
          }}>Please make sure your backend is running on port 5000 and try again.</p>
        </div>
      )}

      {/* Trope Modal */}
      <TropeModal />

      {/* Global Animations */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default HomePage;