console.log('Script.js loaded!');

// Modal elements and setup - wrapped in DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up all functionality...');
    
    const openLoginModalBtn = document.getElementById('open-login-modal');
    const authModal = document.getElementById('auth-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const loginFormSection = document.getElementById('login-form-section');
    const registerFormSection = document.getElementById('register-form-section');
    const showRegisterBtn = document.getElementById('show-register');
    const showLoginBtn = document.getElementById('show-login');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');

    // Only add event listeners if elements exist
    if (openLoginModalBtn && authModal) {
        // Open modal
        openLoginModalBtn.addEventListener('click', () => {
            authModal.style.display = 'flex';
            loginFormSection.style.display = 'block';
            registerFormSection.style.display = 'none';
            loginError.textContent = '';
            registerError.textContent = '';
        });
    }

    if (closeModalBtn && authModal) {
        // Close modal
        closeModalBtn.addEventListener('click', () => {
            authModal.style.display = 'none';
        });
        window.addEventListener('click', (e) => {
            if (e.target === authModal) {
                authModal.style.display = 'none';
            }
        });
    }

    if (showRegisterBtn && showLoginBtn && loginFormSection && registerFormSection) {
        // Switch to register
        showRegisterBtn.addEventListener('click', () => {
            loginFormSection.style.display = 'none';
            registerFormSection.style.display = 'block';
            loginError.textContent = '';
            registerError.textContent = '';
        });
        // Switch to login
        showLoginBtn.addEventListener('click', () => {
            loginFormSection.style.display = 'block';
            registerFormSection.style.display = 'none';
            loginError.textContent = '';
            registerError.textContent = '';
        });
    }

    if (loginForm && loginError) {
        // Login form submit
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            loginError.textContent = '';
            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value;
            if (!username || !password) {
                loginError.textContent = 'Please enter both username and password.';
                return;
            }
            try {
                const res = await fetch('http://localhost:5001/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ username, password })
                });
                console.log('Login response:', res);
                const text = await res.text();
                console.log('Login response text:', text);
                if (res.ok) {
                    localStorage.setItem('username', username);
                    window.location.href = 'dashboard.html';
                } else {
                    loginError.textContent = text || 'Login failed.';
                }
            } catch (err) {
                console.error('Login fetch error:', err);
                loginError.textContent = 'Network error. Please try again.';
            }
        });
    }

    if (registerForm && registerError) {
        // Register form submit
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            registerError.textContent = '';
            const username = document.getElementById('register-username').value.trim();
            const password = document.getElementById('register-password').value;
            const confirm = document.getElementById('register-confirm').value;
            if (!username || !password || !confirm) {
                registerError.textContent = 'Please fill in all fields.';
                return;
            }
            if (password !== confirm) {
                registerError.textContent = 'Passwords do not match.';
                return;
            }
            try {
                const res = await fetch('http://localhost:5001/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ username, password })
                });
                console.log('Register response:', res);
                const text = await res.text();
                console.log('Register response text:', text);
                if (res.ok) {
                    registerFormSection.style.display = 'none';
                    loginFormSection.style.display = 'block';
                    loginError.textContent = 'Registration successful! Please log in.';
                } else {
                    registerError.textContent = text || 'Registration failed.';
                }
            } catch (err) {
                console.error('Register fetch error:', err);
                registerError.textContent = 'Network error. Please try again.';
            }
        });
    }

    // Only add logout functionality if logoutBtn exists (dashboard.html)
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault(); // Prevent default button behavior
            window.clearLoginSession();
            try {
                await fetch('http://localhost:5001/logout', { method: 'GET', credentials: 'include' });
            } catch (err) {
                // Ignore network errors, always redirect
            }
            console.log('Redirecting to index.html after logout');
            window.location.replace('index.html'); // Use replace to force navigation
        });
    }

    // Filtered Search Modal Logic for index.html
    console.log('Setting up filtered search...');
    
    const filteredSearchBtn = document.getElementById('open-filtered-search-modal');
    const filteredSearchModal = document.getElementById('filtered-search-modal');
    const closeFilteredSearchModal = document.getElementById('close-filtered-search-modal');
    const filteredSearchForm = document.getElementById('filtered-search-form');
    const filteredSearchResults = document.getElementById('filtered-search-results');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');

    console.log('Filtered search button:', filteredSearchBtn);
    console.log('Filtered search modal:', filteredSearchModal);

    const filterFields = [
        document.getElementById('filter-keywords'),
        document.getElementById('filter-genres'),
        document.getElementById('filter-year'),
        document.getElementById('filter-director'),
        document.getElementById('filter-rating')
    ];

    filterFields.forEach((field, idx) => {
        if (field) {
            field.addEventListener('input', () => {
                if (field.value.trim() !== '') {
                    filterFields.forEach((f, i) => { if (i !== idx && f) f.disabled = true; });
                } else {
                    filterFields.forEach(f => { if (f) f.disabled = false; });
                }
            });
        }
    });

    // Clear filters functionality
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            filterFields.forEach(field => {
                if (field) {
                    field.value = '';
                    field.disabled = false;
                }
            });
            filteredSearchResults.innerHTML = '';
        });
    }

    if (filteredSearchBtn) {
        console.log('Adding click listener to filtered search button');
        filteredSearchBtn.addEventListener('click', () => {
            console.log('Filtered search button clicked!');
            if (filteredSearchModal) {
                console.log('Modal found, setting display to flex');
                filteredSearchModal.style.display = 'flex';
                if (filteredSearchResults) filteredSearchResults.innerHTML = '';
            } else {
                console.error('Modal not found!');
            }
        });
    } else {
        console.error('Filtered search button not found!');
    }
    
    if (closeFilteredSearchModal && filteredSearchModal) {
        closeFilteredSearchModal.addEventListener('click', () => {
            filteredSearchModal.style.display = 'none';
        });
    }
    
    if (filteredSearchModal) {
        window.addEventListener('click', (e) => {
            if (e.target === filteredSearchModal) {
                filteredSearchModal.style.display = 'none';
            }
        });
    }

    if (filteredSearchForm && filteredSearchResults) {
        filteredSearchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Filtered search form submitted');
            filteredSearchResults.innerHTML = '<div>Searching...</div>';
            // Collect filter values
            const keywords = document.getElementById('filter-keywords').value.split(',').map(s => s.trim()).filter(Boolean);
            const genres = document.getElementById('filter-genres').value.split(',').map(s => s.trim()).filter(Boolean);
            const yearInput = document.getElementById('filter-year').value.trim();
            let year = [];
            if (yearInput) {
                if (yearInput.includes('-')) {
                    year = yearInput.split('-').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
                } else {
                    const y = parseInt(yearInput, 10);
                    if (!isNaN(y)) year = [y];
                }
            }
            const director = document.getElementById('filter-director').value.trim();
            const rating = parseFloat(document.getElementById('filter-rating').value);

            // Count how many filters are filled
            const filled = [
                keywords.length > 0,
                genres.length > 0,
                year.length > 0,
                director.length > 0,
                !isNaN(rating)
            ].filter(Boolean);
            if (filled.length !== 1) {
                filteredSearchResults.innerHTML = '<div>Please fill in only one filter field.</div>';
                return;
            }

            // Determine which filter to use and build endpoint/body
            let endpoint = '';
            let body = {};
            if (keywords.length > 0) {
                endpoint = 'http://localhost:5001/search_per_filter';
                body = { keyword: keywords };
            } else if (genres.length > 0) {
                endpoint = 'http://localhost:5001/search_per_filter';
                body = { genres };
            } else if (year.length > 0) {
                endpoint = 'http://localhost:5001/search_per_filter';
                body = { year };
            } else if (director.length > 0) {
                endpoint = 'http://localhost:5001/search_per_filter';
                body = { director };
            } else if (!isNaN(rating)) {
                endpoint = 'http://localhost:5001/search_per_filter';
                body = { rating };
            }

            try {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(body)
                });
                if (!res.ok) {
                    filteredSearchResults.innerHTML = '<div>Search failed. Please try again.</div>';
                    return;
                }
                const data = await res.json();
                const movieIds = Object.keys(data).slice(0, 9);
                if (movieIds.length === 0) {
                    filteredSearchResults.innerHTML = '<div>No movies found.</div>';
                    return;
                }
                // Fetch movie details for each movie
                const movieDetails = await Promise.all(movieIds.map(async (id) => {
                    const resp = await fetch(`http://localhost:5001/movie_display?id=${id}`, {
                        method: 'GET',
                        credentials: 'include'
                    });
                    if (resp.ok) return await resp.json();
                    return null;
                }));
                // Render movie cards (no favorites or add trope)
                filteredSearchResults.innerHTML = '';
                movieDetails.forEach(movie => {
                    if (!movie) return;
                    const card = document.createElement('div');
                    card.className = 'filtered-movie-card';
                    card.innerHTML = `
                        <h4>${movie.title || movie.original_title || 'Untitled'}</h4>
                        <p><strong>Director:</strong> ${movie.director || 'N/A'}</p>
                        <p><strong>Genres:</strong> ${movie.genres || 'N/A'}</p>
                        <p><strong>Rating:</strong> ${movie.rating || 'N/A'}</p>
                        <p>${movie.tagline ? `<em>${movie.tagline}</em>` : ''}</p>
                        <p>${movie.character_tropes ? `<strong>Main character trope:</strong> ${movie.character_tropes}` : '<strong>Main character trope:</strong> None'}</p>
                        <div class="movie-actions-row" style="display:flex;gap:8px;align-items:center;margin-top:8px;">
                            <button class="more-info-btn gradient-btn" data-movie-id="${movie.id}">More Info</button>
                        </div>
                    `;
                    filteredSearchResults.appendChild(card);
                });
                // Add event listeners for More Info buttons
                document.querySelectorAll('.more-info-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const movieId = this.getAttribute('data-movie-id');
                        showMovieDetails(movieId);
                    });
                });
            } catch (err) {
                console.error('Search error:', err);
                filteredSearchResults.innerHTML = '<div>Network error. Please try again.</div>';
            }
        });
    }

    // Movie Details Modal Logic (shared)
    const movieDetailsModal = document.getElementById('movie-details-modal');
    const closeMovieDetailsModal = document.getElementById('close-movie-details-modal');
    const movieDetailsTitle = document.getElementById('movie-details-title');
    const movieDetailsInfo = document.getElementById('movie-details-info');

    if (closeMovieDetailsModal && movieDetailsModal) {
        closeMovieDetailsModal.addEventListener('click', () => {
            movieDetailsModal.style.display = 'none';
        });
    }
    
    if (movieDetailsModal) {
        window.addEventListener('click', (e) => {
            if (e.target === movieDetailsModal) {
                movieDetailsModal.style.display = 'none';
            }
        });
    }

    // Function to show movie details (shared)
    window.showMovieDetails = async function(movieId) {
        try {
            const res = await fetch(`http://localhost:5001/movie_display_extra?id=${movieId}`, {
                method: 'GET',
                credentials: 'include'
            });
            if (res.ok) {
                const movie = await res.json();
                movieDetailsTitle.textContent = movie.original_title || 'Movie Details';
                
                const detailsHTML = `
                    <div class="movie-details-grid">
                        <div class="detail-item">
                            <strong>Title:</strong> ${movie.original_title || 'N/A'}
                        </div>
                        <div class="detail-item">
                            <strong>IMDb ID:</strong> ${movie.imdb_id || 'N/A'}
                        </div>
                        <div class="detail-item">
                            <strong>Director:</strong> ${movie.director || 'N/A'}
                        </div>
                        <div class="detail-item">
                            <strong>Stars:</strong> ${movie.stars || 'N/A'}
                        </div>
                        <div class="detail-item">
                            <strong>Genres:</strong> ${movie.genres || 'N/A'}
                        </div>
                        <div class="detail-item">
                            <strong>Release Date:</strong> ${movie.release_date || 'N/A'}
                        </div>
                        <div class="detail-item">
                            <strong>Release Year:</strong> ${movie.release_year || 'N/A'}
                        </div>
                        <div class="detail-item">
                            <strong>Runtime:</strong> ${movie.runtime ? `${movie.runtime} minutes` : 'N/A'}
                        </div>
                        <div class="detail-item">
                            <strong>Rating:</strong> ${movie.vote_average ? `${movie.vote_average}/10 (${movie.vote_count} votes)` : 'N/A'}
                        </div>
                        <div class="detail-item">
                            <strong>Popularity:</strong> ${movie.popularity || 'N/A'}
                        </div>
                        <div class="detail-item">
                            <strong>Budget:</strong> ${movie.budget ? `$${(movie.budget / 1000000).toFixed(1)}M` : 'N/A'}
                        </div>
                        <div class="detail-item">
                            <strong>Revenue:</strong> ${movie.revenue ? `$${(movie.revenue / 1000000).toFixed(1)}M` : 'N/A'}
                        </div>
                        <div class="detail-item">
                            <strong>Tagline:</strong> ${movie.tagline || 'N/A'}
                        </div>
                        <div class="detail-item">
                            <strong>Keywords:</strong> ${movie.keywords || 'N/A'}
                        </div>
                        <div class="detail-item">
                            <strong>Main Character Trope:</strong> ${movie.character_tropes || 'None'}
                        </div>
                        <div class="detail-item">
                            <strong>Homepage:</strong> ${movie.homepage ? `<a href="${movie.homepage}" target="_blank">${movie.homepage}</a>` : 'N/A'}
                        </div>
                        <div class="detail-item full-width">
                            <strong>Overview:</strong> ${movie.text || 'N/A'}
                        </div>
                    </div>
                `;
                
                movieDetailsInfo.innerHTML = detailsHTML;
                movieDetailsModal.style.display = 'flex';
            } else {
                alert('Could not load movie details.');
            }
        } catch (err) {
            alert('Network error loading movie details.');
        }
    };

    // AI Search Modal Logic
    const openAISearchBtn = document.getElementById('open-ai-search-modal');
    const aiSearchModal = document.getElementById('ai-search-modal');
    const closeAISearchModal = document.getElementById('close-ai-search-modal');
    const aiSearchForm = document.getElementById('ai-search-form');
    const aiSearchQuery = document.getElementById('ai-search-query');
    const aiSearchResponse = document.getElementById('ai-search-response');
    const aiSearchResults = document.getElementById('ai-search-results');

    if (openAISearchBtn && aiSearchModal) {
        openAISearchBtn.addEventListener('click', () => {
            aiSearchModal.style.display = 'flex';
            aiSearchResponse.textContent = '';
            aiSearchResults.innerHTML = '';
            aiSearchQuery.value = '';
        });
    }
    if (closeAISearchModal && aiSearchModal) {
        closeAISearchModal.addEventListener('click', () => {
            aiSearchModal.style.display = 'none';
        });
    }
    if (aiSearchModal) {
        window.addEventListener('click', (e) => {
            if (e.target === aiSearchModal) {
                aiSearchModal.style.display = 'none';
            }
        });
    }
    if (aiSearchForm && aiSearchQuery && aiSearchResponse && aiSearchResults) {
        aiSearchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            aiSearchResponse.textContent = '';
            aiSearchResults.innerHTML = '<div>Searching...</div>';
            const query = aiSearchQuery.value.trim();
            if (!query) {
                aiSearchResults.innerHTML = '<div>Please enter a description.</div>';
                return;
            }
            try {
                const res = await fetch('http://localhost:5001/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ query })
                });
                if (!res.ok) {
                    aiSearchResults.innerHTML = '<div>AI search failed. Please try again.</div>';
                    return;
                }
                const data = await res.json();
                aiSearchResponse.textContent = data.response || '';
                const movieIds = data.movie_ids || [];
                if (movieIds.length === 0) {
                    aiSearchResults.innerHTML = '<div>No movies found for your query.</div>';
                    return;
                }
                // Fetch movie details for each movie using /movie?imdb_id=... then /movie_display?id=...
                const movieDetails = await Promise.all(movieIds.slice(0, 9).map(async (imdb_id) => {
                    // Step 1: get numeric movie ID
                    const resp = await fetch(`http://localhost:5001/movie?imdb_id=${imdb_id}`, {
                        method: 'GET',
                        credentials: 'include'
                    });
                    if (!resp.ok) return null;
                    const movieMeta = await resp.json();
                    if (!movieMeta || !movieMeta.id) return null;
                    // Step 2: get full details
                    const resp2 = await fetch(`http://localhost:5001/movie_display?id=${movieMeta.id}`, {
                        method: 'GET',
                        credentials: 'include'
                    });
                    if (!resp2.ok) return null;
                    return await resp2.json();
                }));
                aiSearchResults.innerHTML = '';
                movieDetails.forEach(movie => {
                    if (!movie) return;
                    const card = document.createElement('div');
                    card.className = 'filtered-movie-card';
                    card.innerHTML = `
                        <h4>${movie.title || movie.original_title || 'Untitled'}</h4>
                        <p><strong>Director:</strong> ${movie.director || 'N/A'}</p>
                        <p><strong>Genres:</strong> ${movie.genres || 'N/A'}</p>
                        <p><strong>Rating:</strong> ${typeof movie.rating !== 'undefined' ? movie.rating : 'N/A'}</p>
                        <p>${movie.tagline ? `<em>${movie.tagline}</em>` : ''}</p>
                        <p>${movie.character_tropes ? `<strong>Main character trope:</strong> ${movie.character_tropes}` : '<strong>Main character trope:</strong> None'}</p>
                        <div class="movie-actions-row" style="display:flex;gap:8px;align-items:center;margin-top:8px;">
                            <button class="more-info-btn gradient-btn" data-movie-id="${movie.id}">More Info</button>
                        </div>
                    `;
                    aiSearchResults.appendChild(card);
                });
                // Add event listeners for More Info buttons
                document.querySelectorAll('.more-info-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const movieId = this.getAttribute('data-movie-id');
                        showMovieDetails(movieId);
                    });
                });
            } catch (err) {
                console.error('AI search error:', err);
                aiSearchResults.innerHTML = '<div>Network error. Please try again.</div>';
            }
        });
    }
});

// Rating field functionality - set to 10 when focused and empty
const filterRating = document.getElementById('filter-rating');
if (filterRating) {
    filterRating.addEventListener('focus', function() {
        if (!this.value) {
            this.value = 10;
        }
        // For browsers that support it, scroll to top
        try { this.scrollTop = 0; } catch {}
    });
}

// Utility for logout (to be called from dashboard.js)
function clearLoginSession() {
    localStorage.removeItem('username');
}
window.clearLoginSession = clearLoginSession;
