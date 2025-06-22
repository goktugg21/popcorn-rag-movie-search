// Global variables
let currentUser = null;
let userFavorites = new Set();
let currentTab = 'ai-search';

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadUserInfo();
});

// Check if user is authenticated
function checkAuth() {
    const token = getCookie('token');
    if (!token) {
        window.location.href = '/';
        return;
    }
    
    // Load user info from localStorage
    const userInfo = localStorage.getItem('currentUser');
    if (userInfo) {
        currentUser = JSON.parse(userInfo);
        document.getElementById('userName').textContent = currentUser.username;
    }
}

// Get cookie by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Update username in header utility
function updateHeaderUsername() {
    const userInfo = localStorage.getItem('currentUser');
    const userNameSpan = document.getElementById('userName');
    if (userInfo && userNameSpan) {
        const user = JSON.parse(userInfo);
        userNameSpan.textContent = user.username || 'User';
    } else if (userNameSpan) {
        userNameSpan.textContent = 'User';
    }
}

// Call this on every page load
window.addEventListener('DOMContentLoaded', updateHeaderUsername);

// Load user information
async function loadUserInfo() {
    try {
        const response = await fetch('http://localhost:5001/user_info', {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            const userData = await response.json();
            currentUser = userData;
            localStorage.setItem('currentUser', JSON.stringify(userData));
            updateHeaderUsername();
            
            // Load user favorites after getting user info
            await loadUserFavorites();
        } else {
            // If backend call fails, use localStorage data
            const userInfo = localStorage.getItem('currentUser');
            if (userInfo) {
                currentUser = JSON.parse(userInfo);
                updateHeaderUsername();
            }
        }
    } catch (error) {
        console.error('Error loading user info:', error);
        // If there's an error, use localStorage data
        const userInfo = localStorage.getItem('currentUser');
        if (userInfo) {
            currentUser = JSON.parse(userInfo);
            updateHeaderUsername();
        }
    }
}

// Tab switching
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
    
    currentTab = tabName;
}

// AI Search functionality
async function performAISearch(event) {
    event.preventDefault();
    
    const query = document.getElementById('aiQuery').value.trim();
    if (!query) {
        alert('Please enter a search query');
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch('http://localhost:5001/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ query })
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Display AI response and movies
            await displayAISearchResults(data.response, data.movie_ids, query);
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'AI search failed');
        }
    } catch (error) {
        console.error('AI Search error:', error);
        alert(error.message || 'AI search failed. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Display AI search results with response text and movies
async function displayAISearchResults(aiResponse, movieIds, query) {
    const moviesGrid = document.getElementById('moviesGrid');
    const resultsSection = document.getElementById('resultsSection');
    const resultsCount = document.getElementById('resultNumber');
    
    moviesGrid.innerHTML = '';
    
    // Add AI response section
    const aiResponseSection = document.createElement('div');
    aiResponseSection.className = 'ai-response-section';
    aiResponseSection.innerHTML = `
        <div class="ai-response-card">
            <h3>🤖 AI Analysis</h3>
            <p class="ai-query">"${query}"</p>
            <div class="ai-response-text">${aiResponse}</div>
        </div>
    `;
    moviesGrid.appendChild(aiResponseSection);
    
    if (movieIds.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.innerHTML = '<p>No movies found matching your criteria.</p>';
        moviesGrid.appendChild(noResults);
        resultsSection.style.display = 'block';
        resultsCount.textContent = '0';
        return;
    }
    
    // Limit to 6 movies
    const limitedIds = movieIds.slice(0, 6);
    resultsCount.textContent = limitedIds.length;
    
    // Add movies section header
    const moviesHeader = document.createElement('div');
    moviesHeader.className = 'movies-section-header';
    moviesHeader.innerHTML = `
        <h3>🎬 Recommended Movies</h3>
        <p>Based on your query, here are the best matches:</p>
    `;
    moviesGrid.appendChild(moviesHeader);
    
    // Create movies container
    const moviesContainer = document.createElement('div');
    moviesContainer.className = 'movies-container';
    moviesGrid.appendChild(moviesContainer);
    
    for (const movieId of limitedIds) {
        try {
            const movie = await fetchMovieDetails(movieId);
            if (movie) {
                const movieCard = createMovieCard(movie);
                moviesContainer.appendChild(movieCard);
            }
        } catch (error) {
            console.error(`Error fetching movie ${movieId}:`, error);
        }
    }
    
    resultsSection.style.display = 'block';
}

// Filtered Search functionality
async function performFilterSearch(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const filters = {
        query: formData.get('query') || '',
        genres: formData.get('genres') ? [formData.get('genres')] : [],
        year: formData.get('year') ? [parseInt(formData.get('year'))] : [],
        rating: formData.get('rating') ? parseFloat(formData.get('rating')) : 0.0,
        director: formData.get('director') || '',
        keyword: formData.get('keyword') ? [formData.get('keyword')] : []
    };
    console.log('Sending filter search:', filters);
    showLoading(true);
    
    try {
        const response = await fetch('http://localhost:5001/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(filters)
        });
        console.log('Filter search response:', response.status);
        if (response.ok) {
            const movies = await response.json();
            console.log('Movies received:', movies);
            const movieIds = Object.keys(movies);
            await displayMovies(movieIds, `Found ${movieIds.length} movies matching your filters`);
        } else {
            const errorData = await response.json();
            alert('Filtered search failed: ' + (errorData.error || response.status));
            throw new Error(errorData.error || 'Filtered search failed');
        }
    } catch (error) {
        alert('Filtered search error: ' + error);
        console.error('Filtered Search error:', error);
    } finally {
        showLoading(false);
    }
}

// Display movies in grid
async function displayMovies(movieIds, message) {
    const moviesGrid = document.getElementById('moviesGrid');
    const resultsSection = document.getElementById('resultsSection');
    const resultsCount = document.getElementById('resultNumber');
    
    moviesGrid.innerHTML = '';
    
    if (movieIds.length === 0) {
        moviesGrid.innerHTML = '<p style="text-align: center; color: #b0b0b0; grid-column: 1 / -1;">No movies found matching your criteria.</p>';
        resultsSection.style.display = 'block';
        resultsCount.textContent = '0';
        return;
    }
    
    // Limit to 6 movies
    const limitedIds = movieIds.slice(0, 6);
    resultsCount.textContent = limitedIds.length;
    
    // For filtered search, use a simple grid layout
    if (currentTab === 'filter-search') {
        moviesGrid.style.display = 'grid';
        moviesGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
        moviesGrid.style.gap = '1.5rem';
        
        for (const movieId of limitedIds) {
            try {
                const movie = await fetchMovieDetails(movieId);
                if (movie) {
                    const movieCard = createMovieCard(movie);
                    moviesGrid.appendChild(movieCard);
                }
            } catch (error) {
                console.error(`Error fetching movie ${movieId}:`, error);
            }
        }
    } else {
        // For AI search, use the column layout (handled by displayAISearchResults)
        moviesGrid.style.display = 'flex';
        moviesGrid.style.flexDirection = 'column';
        moviesGrid.style.gap = '2rem';
    }
    
    resultsSection.style.display = 'block';
}

// Fetch movie details from backend
async function fetchMovieDetails(movieId) {
    try {
        const response = await fetch(`http://localhost:5001/movie?id=${movieId}`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.error('Error fetching movie details:', error);
    }
    return null;
}

// Create movie card element
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    // Use a placeholder image since we don't have poster_path in our data
    const posterUrl = 'https://via.placeholder.com/300x450/333/666?text=Movie';
    
    const isFavorited = userFavorites.has(movie.id);
    
    card.innerHTML = `
        <div class="movie-poster-container">
            <img src="${posterUrl}" alt="${movie.original_title}" class="movie-poster">
            <button class="favorite-btn-card ${isFavorited ? 'favorited' : ''}" onclick="event.stopPropagation(); toggleFavorite(${movie.id})">
                ${isFavorited ? '❤️' : '🤍'}
            </button>
        </div>
        <div class="movie-info">
            <h3 class="movie-title">${movie.original_title}</h3>
            <div class="movie-meta">
                <span>${movie.release_year || 'N/A'}</span>
                <div class="movie-rating">
                    <span class="star">★</span>
                    <span>${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                </div>
            </div>
            <div class="movie-genre">${movie.genres ? movie.genres.split('|')[0] : 'Unknown'}</div>
        </div>
    `;
    
    // Add click handler for the movie poster
    const poster = card.querySelector('.movie-poster');
    poster.addEventListener('click', () => showMovieDetail(movie));
    
    return card;
}

// Show movie detail modal
async function showMovieDetail(movie) {
    const modal = document.getElementById('movieModal');
    const content = document.getElementById('movieDetailContent');
    
    // Use a placeholder image since we don't have poster_path in our data
    const posterUrl = 'https://via.placeholder.com/300x450/333/666?text=Movie';
    
    const isFavorited = userFavorites.has(movie.id);
    
    content.innerHTML = `
        <div class="movie-detail-poster">
            <img src="${posterUrl}" alt="${movie.original_title}" style="width: 100%; border-radius: 8px;">
        </div>
        <div class="movie-detail-info">
            <h2>${movie.original_title}</h2>
            <div class="movie-detail-meta">
                <span>${movie.release_year || 'N/A'}</span>
                <span>${movie.runtime ? `${movie.runtime} min` : 'N/A'}</span>
                <div class="movie-rating">
                    <span class="star">★</span>
                    <span>${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                </div>
            </div>
            <p class="movie-detail-description">${movie.overview || 'No description available.'}</p>
            <button class="favorite-btn ${isFavorited ? 'favorited' : ''}" onclick="toggleFavorite(${movie.id})">
                ${isFavorited ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}
            </button>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Toggle favorite status
async function toggleFavorite(movieId) {
    const isFavorited = userFavorites.has(movieId);
    
    try {
        const response = await fetch(`http://localhost:5001/${isFavorited ? 'delete_favourite' : 'add_favourite'}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ movie_id: movieId })
        });
        
        if (response.ok) {
            if (isFavorited) {
                userFavorites.delete(movieId);
            } else {
                userFavorites.add(movieId);
            }
            
            // Update the button in the modal
            const modalBtn = document.querySelector('.favorite-btn');
            if (modalBtn) {
                modalBtn.textContent = userFavorites.has(movieId) ? '❤️ Remove from Favorites' : '🤍 Add to Favorites';
                modalBtn.classList.toggle('favorited', userFavorites.has(movieId));
            }
            
            // Update all favorite buttons on movie cards for this movie
            const cardBtns = document.querySelectorAll(`.favorite-btn-card[onclick*="${movieId}"]`);
            cardBtns.forEach(btn => {
                btn.textContent = userFavorites.has(movieId) ? '❤️' : '🤍';
                btn.classList.toggle('favorited', userFavorites.has(movieId));
            });
        } else {
            throw new Error('Failed to update favorite');
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
        alert('Failed to update favorite. Please try again.');
    }
}

// Close movie modal
function closeMovieModal() {
    document.getElementById('movieModal').style.display = 'none';
}

// Show loading state
function showLoading(show) {
    const loading = document.getElementById('loading');
    const resultsSection = document.getElementById('resultsSection');
    
    if (show) {
        loading.style.display = 'block';
        resultsSection.style.display = 'none';
    } else {
        loading.style.display = 'none';
    }
}

// Logout functionality
async function logout() {
    try {
        console.log('Attempting logout...');
        const response = await fetch('http://localhost:5001/logout', {
            method: 'GET',
            credentials: 'include'
        });
        console.log('Logout response:', response.status);
        if (!response.ok) {
            alert('Logout failed: ' + response.status);
        }
    } catch (error) {
        alert('Logout error: ' + error);
        console.error('Logout error:', error);
    }
    // Clear all localStorage data regardless of response
    localStorage.removeItem('userInfo');
    localStorage.removeItem('currentUser');
    userFavorites.clear();
    currentUser = null;
    // Hide logout button
    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) logoutBtn.style.display = 'none';
    // Redirect to start page
    window.location.href = 'index.html';
}

// Profile functionality
function showProfile() {
    document.getElementById('profileModal').style.display = 'block';
    loadProfileInfo();
    
    // Load favorites for display in profile modal
    loadUserFavoritesForProfile();
}

function closeProfileModal() {
    document.getElementById('profileModal').style.display = 'none';
}

function switchProfileTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.profile-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="switchProfileTab('${tabName}')"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.profile-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`profile-${tabName}`).classList.add('active');
}

async function loadProfileInfo() {
    if (currentUser) {
        document.getElementById('profileUsername').textContent = currentUser.username || 'Unknown';
        document.getElementById('memberSince').textContent = '2024'; // You can add this to your user model
        document.getElementById('totalFavorites').textContent = userFavorites.size;
    } else {
        // Fallback to localStorage if currentUser is not set
        const userInfo = localStorage.getItem('currentUser');
        if (userInfo) {
            const user = JSON.parse(userInfo);
            document.getElementById('profileUsername').textContent = user.username || 'Unknown';
            document.getElementById('memberSince').textContent = '2024';
            document.getElementById('totalFavorites').textContent = userFavorites.size;
        }
    }
}

async function loadUserFavorites() {
    try {
        const response = await fetch('http://localhost:5001/favorites', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const favorites = await response.json();
            
            // Update the global favorites set
            userFavorites.clear();
            favorites.forEach(movie => userFavorites.add(movie.id));
            
            // Update the favorites count in profile info if profile modal is open
            const totalFavoritesElement = document.getElementById('totalFavorites');
            if (totalFavoritesElement) {
                totalFavoritesElement.textContent = favorites.length;
            }
            
            // Update favorites display if profile modal is open
            const favoritesGrid = document.getElementById('favoritesGrid');
            if (favoritesGrid) {
                displayFavorites(favorites);
            }
        } else {
            console.error('Failed to load favorites');
        }
    } catch (error) {
        console.error('Error loading favorites:', error);
    }
}

function displayFavorites(favorites) {
    const favoritesGrid = document.getElementById('favoritesGrid');
    
    if (favorites.length === 0) {
        favoritesGrid.innerHTML = '<p class="loading-text">No favorite movies yet. Start adding some!</p>';
        return;
    }
    
    favoritesGrid.innerHTML = '';
    
    favorites.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'favorite-card';
        card.innerHTML = `
            <h4>${movie.title}</h4>
            <p>${movie.release_year || 'N/A'} • ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'} ★</p>
        `;
        favoritesGrid.appendChild(card);
    });
}

function showDeleteAccountModal() {
    document.getElementById('deleteAccountModal').style.display = 'block';
}

function closeDeleteModal() {
    document.getElementById('deleteAccountModal').style.display = 'none';
    document.getElementById('deletePassword').value = '';
}

async function deleteAccount(event) {
    event.preventDefault();
    
    const password = document.getElementById('deletePassword').value;
    
    if (!password) {
        alert('Please enter your password');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:5001/delete_account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                username: currentUser.username,
                password: password
            })
        });
        
        if (response.ok) {
            alert('Account deleted successfully');
            localStorage.removeItem('userInfo');
            window.location.href = '/';
        } else {
            const error = await response.text();
            alert(`Failed to delete account: ${error}`);
        }
    } catch (error) {
        console.error('Error deleting account:', error);
        alert('Failed to delete account. Please try again.');
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    const profileModal = document.getElementById('profileModal');
    const deleteModal = document.getElementById('deleteAccountModal');
    const movieModal = document.getElementById('movieModal');
    
    if (event.target === profileModal) {
        closeProfileModal();
    }
    if (event.target === deleteModal) {
        closeDeleteModal();
    }
    if (event.target === movieModal) {
        closeMovieModal();
    }
}

async function loadUserFavoritesForProfile() {
    const favoritesGrid = document.getElementById('favoritesGrid');
    favoritesGrid.innerHTML = '<p class="loading-text">Loading your favorites...</p>';
    
    try {
        const response = await fetch('http://localhost:5001/favorites', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const favorites = await response.json();
            displayFavorites(favorites);
            
            // Update the favorites count in profile info
            document.getElementById('totalFavorites').textContent = favorites.length;
        } else {
            favoritesGrid.innerHTML = '<p class="loading-text">Error loading favorites</p>';
        }
    } catch (error) {
        console.error('Error loading favorites:', error);
        favoritesGrid.innerHTML = '<p class="loading-text">Error loading favorites</p>';
    }
}

// On page load, hide logout button if not logged in
window.addEventListener('DOMContentLoaded', function() {
    const token = getCookie('token');
    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
        logoutBtn.style.display = token ? 'inline-block' : 'none';
    }
});