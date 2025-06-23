import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import SearchPanel from '../components/SearchPanel';
import CategorySection from '../components/CategorySection';
import MovieDetailModal from '../components/MovieDetailModal';
import TropeModal from '../components/TropeModal';
import MovieCard from '../components/MovieCard';

const API_BASE_URL = 'http://127.0.0.1:5000';

function SApp() {
  // States
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [categorizedMovies, setCategorizedMovies] = useState({
    comedy: [], action: [], scienceFiction: [], drama: [],
    history: [], family: [], animation: [], thriller: [], others: []
  });
  
  // Search States
  const [searchFilters, setSearchFilters] = useState({
    keyword: '', genres: [], year: [2015], rating: null
  });
  const [activeSearchTab, setActiveSearchTab] = useState('filters');
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Modal States
  const [showMovieModal, setShowMovieModal] = useState(false);
  const [selectedMovieDetail, setSelectedMovieDetail] = useState(null);
  const [showTropeModal, setShowTropeModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [tropeText, setTropeText] = useState('');

  useEffect(() => {
    checkLoginStatus();
    fetchCategorizedMovies();
  }, []);

  // API Functions
  const checkLoginStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_favourites`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        setIsLoggedIn(true);
        const favData = await response.json();
        setFavorites(favData.map(fav => fav.id));
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) setUsername(storedUsername);
      } else {
        setIsLoggedIn(false);
        setUsername('');
        setFavorites([]);
      }
    } catch (error) {
      setIsLoggedIn(false);
      setUsername('');
      setFavorites([]);
    }
  };

  const fetchCategorizedMovies = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          query: '', keyword: [], genres: [], year: [2015], director: [], rating: null
        })
      });

      const movieData = await response.json();
      
      // Unique movies based on title and vote_average
      const uniqueMovies = {};
      Object.values(movieData).forEach(movie => {
        const uniqueKey = `${movie.title}_${movie.vote_average}`;
        if (!uniqueMovies[uniqueKey]) {
          uniqueMovies[uniqueKey] = {
            id: movie.id,
            title: movie.title,
            director: movie.director,
            genres: Array.isArray(movie.genres) ? movie.genres : [],
            genresString: Array.isArray(movie.genres) ? movie.genres.join(', ') : movie.genres,
            release_year: movie.release_year,
            vote_average: movie.vote_average,
            vote_count: movie.vote_count,
            runtime: movie.runtime,
            overview: movie.hidden_details?.overview || '',
            character_tropes: movie.hidden_details?.character_tropes || '',
            hidden_details: movie.hidden_details || {}
          };
        }
      });
      
      const movieArray = Object.values(uniqueMovies);

      //Favourites filter
      const categories = {
        comedy: [], action: [], scienceFiction: [], drama: [],
        history: [], family: [], animation: [], thriller: [], others: []
      };

      movieArray.forEach(movie => {
        const genres = movie.genres.map(g => g.toLowerCase());
        
        if (genres.includes('animation')) {
          categories.animation.push(movie);
        } else if (genres.includes('comedy')) {
          categories.comedy.push(movie);
        } else if (genres.includes('action')) {
          categories.action.push(movie);
        } else if (genres.includes('science fiction') || genres.includes('sci-fi')) {
          categories.scienceFiction.push(movie);
        } else if (genres.includes('thriller')) {
          categories.thriller.push(movie);
        } else if (genres.includes('drama')) {
          categories.drama.push(movie);
        } else if (genres.includes('history')) {
          categories.history.push(movie);
        } else if (genres.includes('family')) {
          categories.family.push(movie);
        } else {
          categories.others.push(movie);
        }
      });

      // Sort each category by vote_average
      Object.keys(categories).forEach(key => {
        categories[key].sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
      });

      setCategorizedMovies(categories);
      setMovies(movieArray);
    } catch (error) {
      console.error('Error fetching movies:', error);
      setMessage('Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  // Handler Functions
  const handleLogin = () => {
    window.location.href = '/login';
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/logout`, { credentials: 'include' });
      setIsLoggedIn(false);
      setUsername('');
      setFavorites([]);
      localStorage.removeItem('username');
      setMessage('Logged out successfully');
    } catch (error) {
      setMessage('Logout error');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const addToFavorites = async (movieId) => {
    if (!isLoggedIn) {
      setMessage('Please login first');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const isAlreadyFavorite = favorites.includes(movieId);

    try {
      const endpoint = isAlreadyFavorite ? '/delete_favourite' : '/add_favourite';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ movie_id: movieId })
      });

      if (response.ok) {
        if (isAlreadyFavorite) {
          setFavorites(prev => prev.filter(id => id !== movieId));
          setMessage('Removed from favorites!');
        } else {
          setFavorites(prev => [...prev, movieId]);
          setMessage('Added to favorites!');
        }
      } else {
        setMessage(`Failed to ${isAlreadyFavorite ? 'remove from' : 'add to'} favorites`);
      }
    } catch (error) {
      setMessage('Error with favorites');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const openMovieModal = (movie) => {
    setSelectedMovieDetail(movie);
    setShowMovieModal(true);
  };

  const closeMovieModal = () => {
    setShowMovieModal(false);
    setSelectedMovieDetail(null);
  };

  const openTropeModal = (movie) => {
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

    try {
      const response = await fetch(`${API_BASE_URL}/add_trope`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          user_trope: tropeText.trim(),
          selected_movie_id: selectedMovie.id
        })
      });

      if (response.ok) {
        setMessage('Trope added successfully!');
        setShowTropeModal(false);
        setTropeText('');
        fetchCategorizedMovies();
      } else {
        setMessage('Failed to add trope');
      }
    } catch (error) {
      setMessage('Error adding trope');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const applyFilters = async () => {
    setLoading(true);
    setIsSearchMode(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          query: searchFilters.keyword,
          keyword: [],
          genres: searchFilters.genres,
          year: searchFilters.year,
          director: [],
          rating: searchFilters.rating
        })
      });

      const movieData = await response.json();
      
      const uniqueMovies = {};
      Object.values(movieData).forEach(movie => {
        const uniqueKey = `${movie.title}_${movie.vote_average}`;
        if (!uniqueMovies[uniqueKey]) {
          uniqueMovies[uniqueKey] = {
            id: movie.id,
            title: movie.title,
            director: movie.director,
            genres: Array.isArray(movie.genres) ? movie.genres : [],
            genresString: Array.isArray(movie.genres) ? movie.genres.join(', ') : movie.genres,
            release_year: movie.release_year,
            vote_average: movie.vote_average,
            vote_count: movie.vote_count,
            runtime: movie.runtime,
            overview: movie.hidden_details?.overview || '',
            character_tropes: movie.hidden_details?.character_tropes || '',
            hidden_details: movie.hidden_details || {}
          };
        }
      });
      
      let movieArray = Object.values(uniqueMovies);
      
      // Filter by favorites 
      if (showFavoritesOnly && isLoggedIn) {
        movieArray = movieArray.filter(movie => favorites.includes(movie.id));
      }
      
      if (movieArray.length > 500) {
        movieArray = movieArray.slice(0, 500);
        setMessage('Showing first 500 movies');
        setTimeout(() => setMessage(''), 5000);
      }

      setSearchResults(movieArray);
    } catch (error) {
      setMessage('Search failed');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleAiSearch = async () => {
    if (!aiQuery.trim()) {
      setMessage('Please enter a search query');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setAiLoading(true);
    setIsSearchMode(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ query: aiQuery })
      });

      if (response.ok) {
        const data = await response.json();
        setAiResponse(data.response || '');
        
        // movies.length control
        if (data.movie_ids && data.movie_ids.length > 0 && movies && Array.isArray(movies) && movies.length > 0) {
          const aiMovies = movies.filter(movie => 
            data.movie_ids.includes(movie.id.toString())
          );
          setSearchResults(aiMovies);
        } else {
          setSearchResults([]);
        }
      } else {
        setMessage('AI search failed');
        setAiResponse('');
        setSearchResults([]);
      }
    } catch (error) {
      setMessage('AI search error');
      setAiResponse('');
      setSearchResults([]);
    } finally {
      setAiLoading(false);
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const clearSearch = () => {
    setIsSearchMode(false);
    setSearchResults([]);
    setSearchFilters({ keyword: '', genres: [], year: [2015], rating: null });
    setShowFavoritesOnly(false);
    setAiQuery('');
    setAiResponse('');
    setActiveSearchTab('filters');
    setMessage('Returned to category view');
    setTimeout(() => setMessage(''), 2000);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        minHeight: '100vh', fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px', height: '50px', border: '4px solid #f3f3f3',
            borderTop: '4px solid #007bff', borderRadius: '50%',
            animation: 'spin 1s linear infinite', margin: '0 auto 20px'
          }}></div>
          <div>Loading movies...</div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', maxWidth: '1400px', margin: '0 auto', 
      padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh'
    }}>
      <Header 
        isLoggedIn={isLoggedIn}
        username={username}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
      />

      {message && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', padding: '15px 20px',
          backgroundColor: message.includes('Failed') || message.includes('Error') ? '#dc3545' : '#28a745',
          color: 'white', borderRadius: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 1000, maxWidth: '300px'
        }}>
          {message}
        </div>
      )}

      <SearchPanel
        activeSearchTab={activeSearchTab}
        setActiveSearchTab={setActiveSearchTab}
        searchFilters={searchFilters}
        setSearchFilters={setSearchFilters}
        aiQuery={aiQuery}
        setAiQuery={setAiQuery}
        aiResponse={aiResponse}
        aiLoading={aiLoading}
        isSearchMode={isSearchMode}
        applyFilters={applyFilters}
        handleAiSearch={handleAiSearch}
        clearSearch={clearSearch}
        isLoggedIn={isLoggedIn}
        showFavoritesOnly={showFavoritesOnly}
        setShowFavoritesOnly={setShowFavoritesOnly}
      />

      {isSearchMode ? (
        <div>
          <h2 style={{ marginBottom: '20px', color: '#333' }}>
            {activeSearchTab === 'ai' ? '🤖 AI Search Results' : '🔍 Search Results'} ({searchResults.length} movies found)
          </h2>
          
          {searchResults.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '40px', backgroundColor: 'white',
              borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <p>No movies found. Try adjusting your search.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px'
            }}>
              {searchResults.map((movie, index) => (
                <MovieCard 
                  key={`${movie.title}_${movie.vote_average}_${index}`} 
                  movie={movie}
                  favorites={favorites}
                  addToFavorites={addToFavorites}
                  openTropeModal={openTropeModal}
                  openMovieModal={openMovieModal}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <CategorySection title="🎭 Comedy" movies={categorizedMovies.comedy} favorites={favorites} addToFavorites={addToFavorites} openTropeModal={openTropeModal} openMovieModal={openMovieModal} />
          <CategorySection title="🎬 Action" movies={categorizedMovies.action} favorites={favorites} addToFavorites={addToFavorites} openTropeModal={openTropeModal} openMovieModal={openMovieModal} />
          <CategorySection title="🚀 Science Fiction" movies={categorizedMovies.scienceFiction} favorites={favorites} addToFavorites={addToFavorites} openTropeModal={openTropeModal} openMovieModal={openMovieModal} />
          <CategorySection title="🎭 Drama" movies={categorizedMovies.drama} favorites={favorites} addToFavorites={addToFavorites} openTropeModal={openTropeModal} openMovieModal={openMovieModal} />
          <CategorySection title="🏛️ History" movies={categorizedMovies.history} favorites={favorites} addToFavorites={addToFavorites} openTropeModal={openTropeModal} openMovieModal={openMovieModal} />
          <CategorySection title="👨‍👩‍👧‍👦 Family" movies={categorizedMovies.family} favorites={favorites} addToFavorites={addToFavorites} openTropeModal={openTropeModal} openMovieModal={openMovieModal} />
          <CategorySection title="🎨 Animation" movies={categorizedMovies.animation} favorites={favorites} addToFavorites={addToFavorites} openTropeModal={openTropeModal} openMovieModal={openMovieModal} />
          <CategorySection title="😱 Thriller" movies={categorizedMovies.thriller} favorites={favorites} addToFavorites={addToFavorites} openTropeModal={openTropeModal} openMovieModal={openMovieModal} />
          <CategorySection title="🎪 Others" movies={categorizedMovies.others} favorites={favorites} addToFavorites={addToFavorites} openTropeModal={openTropeModal} openMovieModal={openMovieModal} />
          
          {Object.values(categorizedMovies).every(cat => cat.length === 0) && (
            <div style={{
              textAlign: 'center', padding: '40px', backgroundColor: 'white',
              borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <p>No movies available. Please check your connection and try again.</p>
              <button onClick={fetchCategorizedMovies} style={{
                padding: '10px 20px', backgroundColor: '#007bff', color: 'white',
                border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px'
              }}>
                🔄 Reload Movies
              </button>
            </div>
          )}
        </div>
      )}

      <MovieDetailModal
        showMovieModal={showMovieModal}
        selectedMovieDetail={selectedMovieDetail}
        closeMovieModal={closeMovieModal}
        favorites={favorites}
        addToFavorites={addToFavorites}
        openTropeModal={openTropeModal}
      />

      <TropeModal
        showTropeModal={showTropeModal}
        selectedMovie={selectedMovie}
        tropeText={tropeText}
        setTropeText={setTropeText}
        addTrope={addTrope}
        setShowTropeModal={setShowTropeModal}
      />
    </div>
  );
}

export default SApp;