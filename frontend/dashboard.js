// Dashboard logic
const username = localStorage.getItem('username');
const dashboardUsername = document.getElementById('dashboard-username');
const profileUsername = document.getElementById('profile-username');
const profileBtn = document.getElementById('profile-btn');
const profileModal = document.getElementById('profile-modal');
const closeProfileModal = document.getElementById('close-profile-modal');
const favoritesList = document.getElementById('favorites-list');
const logoutBtn = document.getElementById('logout-btn');

// Show username
if (dashboardUsername) dashboardUsername.textContent = username || 'User';
if (profileUsername) profileUsername.textContent = username || 'User';

// Profile modal open/close
profileBtn.addEventListener('click', () => {
    profileModal.style.display = 'flex';
    loadFavorites();
});
closeProfileModal.addEventListener('click', () => {
    profileModal.style.display = 'none';
});
window.addEventListener('click', (e) => {
    if (e.target === profileModal) {
        profileModal.style.display = 'none';
    }
});

// Load favorites from backend
async function loadFavorites() {
    favoritesList.innerHTML = '<li>Loading...</li>';
    try {
        const res = await fetch('http://localhost:5001/get_favourites', {
            method: 'GET',
            credentials: 'include'
        });
        if (res.status === 401) {
            favoritesList.innerHTML = '<li>You must be logged in to see favorites.</li>';
            return;
        }
        if (res.ok) {
            const favs = await res.json();
            if (favs.length === 0) {
                favoritesList.innerHTML = '<li>No favorites yet.</li>';
            } else {
                favoritesList.innerHTML = '';
                favs.forEach(movie => {
                    const li = document.createElement('li');
                    li.textContent = movie.original_title || movie.title || 'Untitled';
                    li.classList.add('favorite-movie-link');
                    li.style.cursor = 'pointer';
                    li.setAttribute('data-movie-id', movie.id);
                    li.addEventListener('click', () => {
                        showMovieDetails(movie.id);
                    });
                    favoritesList.appendChild(li);
                });
            }
        } else {
            favoritesList.innerHTML = '<li>Could not load favorites.</li>';
        }
    } catch (err) {
        favoritesList.innerHTML = '<li>Network error.</li>';
    }
}

// Logout
logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault(); // Prevent default button behavior
    try {
        await fetch('http://localhost:5001/logout', { method: 'GET', credentials: 'include' });
    } catch (err) {} // Ignore errors, just clear local storage
});
document.getElementById('logout-btn').onclick = function() {
    localStorage.removeItem('username');
    window.location.replace('index.html');
};

// Filtered Search Modal Logic
const filteredSearchBtn = document.getElementById('filtered-search-btn');
const filteredSearchModal = document.getElementById('filtered-search-modal');
const closeFilteredSearchModal = document.getElementById('close-filtered-search-modal');
const filteredSearchForm = document.getElementById('filtered-search-form');
const filteredSearchResults = document.getElementById('filtered-search-results');
const clearFiltersBtn = document.getElementById('clear-filters-btn');

// Movie Details Modal Logic
const movieDetailsModal = document.getElementById('movie-details-modal');
const closeMovieDetailsModal = document.getElementById('close-movie-details-modal');
const movieDetailsTitle = document.getElementById('movie-details-title');
const movieDetailsInfo = document.getElementById('movie-details-info');

// Add Character Trope filter logic
const filterTrope = document.getElementById('filter-trope');

// Fetch available tropes and populate the combo box
async function populateTropeCombo() {
    if (!filterTrope) return;
    try {
        const res = await fetch('http://localhost:5001/trope_filter', {
            method: 'GET',
            credentials: 'include'
        });
        if (res.ok) {
            const data = await res.json();
            // Extract unique tropes
            const tropes = Array.from(new Set(data.map(m => m.character_tropes).filter(Boolean)));
            // Clear existing options except placeholder
            filterTrope.innerHTML = '<option value="">Character Trope (choose one)</option>';
            tropes.forEach(trope => {
                const opt = document.createElement('option');
                opt.value = trope;
                opt.textContent = trope;
                filterTrope.appendChild(opt);
            });
        }
    } catch {}
}
populateTropeCombo();

// Update filterFields to include the trope combo box
const filterFields = [
    document.getElementById('filter-keywords'),
    document.getElementById('filter-genres'),
    document.getElementById('filter-year'),
    document.getElementById('filter-director'),
    filterTrope,
    document.getElementById('filter-rating')
];

// Clear filters functionality
if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
        filterFields.forEach(field => {
            if (field) {
                if (field.tagName === 'SELECT') {
                    field.value = '';
                } else {
                    field.value = '';
                }
                field.disabled = false;
            }
        });
        filteredSearchResults.innerHTML = '';
    });
}

// Disable other fields when one is filled or selected
filterFields.forEach((field, idx) => {
    if (!field) return;
    field.addEventListener('input', () => {
        if ((field.tagName === 'SELECT' && field.value) || (field.tagName !== 'SELECT' && field.value.trim() !== '')) {
            filterFields.forEach((f, i) => { if (i !== idx && f) f.disabled = true; });
        } else {
            filterFields.forEach(f => { if (f) f.disabled = false; });
        }
    });
    if (field.tagName === 'SELECT') {
        field.addEventListener('change', () => {
            if (field.value) {
                filterFields.forEach((f, i) => { if (i !== idx && f) f.disabled = true; });
            } else {
                filterFields.forEach(f => { if (f) f.disabled = false; });
            }
        });
    }
});

filteredSearchBtn.addEventListener('click', () => {
    filteredSearchModal.style.display = 'flex';
    filteredSearchResults.innerHTML = '';
});
closeFilteredSearchModal.addEventListener('click', () => {
    filteredSearchModal.style.display = 'none';
});
window.addEventListener('click', (e) => {
    if (e.target === filteredSearchModal) {
        filteredSearchModal.style.display = 'none';
    }
});

filteredSearchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
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
    const selectedTrope = filterTrope ? filterTrope.value : '';
    const rating = parseFloat(document.getElementById('filter-rating').value);

    // Count how many filters are filled
    const filled = [
        keywords.length > 0,
        genres.length > 0,
        year.length > 0,
        director.length > 0,
        selectedTrope,
        !isNaN(rating)
    ].filter(Boolean);
    if (filled.length !== 1) {
        filteredSearchResults.innerHTML = '<div>Please fill in only one filter field.</div>';
        return;
    }

    // Determine which filter to use and build endpoint/body
    let endpoint = '';
    let body = {};
    let useGet = false;
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
    } else if (selectedTrope) {
        endpoint = `http://localhost:5001/movies_with_trope?user_trope=${encodeURIComponent(selectedTrope)}`;
        useGet = true;
    } else if (!isNaN(rating)) {
        endpoint = 'http://localhost:5001/search_per_filter';
        body = { rating };
    }

    try {
        let res;
        if (useGet) {
            res = await fetch(endpoint, {
                method: 'GET',
                credentials: 'include'
            });
        } else {
            res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body)
            });
        }
        if (!res.ok) {
            filteredSearchResults.innerHTML = '<div>Search failed. Please try again.</div>';
            return;
        }
        const data = await res.json();
        let movieIds = [];
        if (selectedTrope && Array.isArray(data)) {
            movieIds = data.map(m => m.id);
        } else {
            movieIds = Object.keys(data).slice(0, 9);
        }
        if (movieIds.length === 0) {
            filteredSearchResults.innerHTML = '<div>No movies found.</div>';
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
        // Get current favorites
        let favIds = [];
        try {
            const favRes = await fetch('http://localhost:5001/get_favourites', {
                method: 'GET',
                credentials: 'include'
            });
            if (favRes.ok) {
                const favs = await favRes.json();
                favIds = favs.map(m => m.id);
            }
        } catch {}
        // Render movie cards
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
                    <button class="fav-btn heart-btn${favIds.includes(movie.id) ? ' favorited' : ''}" data-movie-id="${movie.id}" title="Add to Favorites" aria-label="Add to Favorites">
                        <span class="heart-icon">&#10084;</span>
                    </button>
                    <button class="more-info-btn gradient-btn" data-movie-id="${movie.id}">More Info</button>
                    ${!movie.character_tropes ? `
                    <button class="add-trope-trigger-btn gradient-btn" data-movie-id="${movie.id}">Add Trope</button>
                    <div class="add-trope-form-container" data-movie-id="${movie.id}" style="display:none; margin-top:0;">
                        <input type="text" class="trope-input" placeholder="Add main character trope" data-movie-id="${movie.id}" style="margin-right:4px;">
                        <button class="confirm-add-trope-btn gradient-btn" data-movie-id="${movie.id}">Confirm</button>
                        <button class="cancel-add-trope-btn gradient-btn" data-movie-id="${movie.id}">Cancel</button>
                        <span class="trope-status" data-movie-id="${movie.id}" style="margin-left:8px;font-size:0.95em;"></span>
                    </div>
                    ` : ''}
                </div>
            `;
            filteredSearchResults.appendChild(card);
        });
        // Add event listeners for favorite buttons
        filteredSearchResults.querySelectorAll('.fav-btn').forEach(btn => {
            btn.addEventListener('click', async function() {
                const movieId = this.getAttribute('data-movie-id');
                if (this.classList.contains('favorited')) return;
                try {
                    const favRes = await fetch('http://localhost:5001/add_favourite', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ movie_id: movieId })
                    });
                    if (favRes.ok) {
                        this.classList.add('favorited');
                    } else {
                        const errorText = await favRes.text();
                        alert('Could not add to favorites: ' + errorText);
                    }
                } catch (err) {
                    alert('Network error.');
                }
            });
        });
        // Add event listeners for More Info buttons
        filteredSearchResults.querySelectorAll('.more-info-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const movieId = this.getAttribute('data-movie-id');
                showMovieDetails(movieId);
            });
        });
        // Add event listeners for Add Trope trigger buttons
        filteredSearchResults.querySelectorAll('.add-trope-trigger-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                // Hide all other forms
                filteredSearchResults.querySelectorAll('.add-trope-form-container').forEach(form => form.style.display = 'none');
                // Show this form
                const movieId = this.getAttribute('data-movie-id');
                const form = filteredSearchResults.querySelector(`.add-trope-form-container[data-movie-id='${movieId}']`);
                if (form) form.style.display = 'inline-block';
            });
        });
        // Add event listeners for Cancel buttons
        filteredSearchResults.querySelectorAll('.cancel-add-trope-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const movieId = this.getAttribute('data-movie-id');
                const form = filteredSearchResults.querySelector(`.add-trope-form-container[data-movie-id='${movieId}']`);
                if (form) form.style.display = 'none';
            });
        });
        // Add event listeners for Confirm Add Trope buttons
        filteredSearchResults.querySelectorAll('.confirm-add-trope-btn').forEach(btn => {
            btn.addEventListener('click', async function() {
                const movieId = this.getAttribute('data-movie-id');
                const input = filteredSearchResults.querySelector(`.trope-input[data-movie-id='${movieId}']`);
                const status = filteredSearchResults.querySelector(`.trope-status[data-movie-id='${movieId}']`);
                const userTrope = input.value.trim();
                if (!userTrope) {
                    status.textContent = 'Please enter a trope.';
                    status.style.color = '#ff6666';
                    return;
                }
                this.disabled = true;
                status.textContent = 'Adding...';
                status.style.color = '#b0b3b8';
                try {
                    const res = await fetch('http://localhost:5001/add_trope', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ user_trope: userTrope, selected_movie_id: movieId })
                    });
                    if (res.ok) {
                        status.textContent = 'Trope added!';
                        status.style.color = '#66ff66';
                        input.value = '';
                    } else {
                        const errText = await res.text();
                        status.textContent = errText || 'Error adding trope.';
                        status.style.color = '#ff6666';
                    }
                } catch {
                    status.textContent = 'Network error.';
                    status.style.color = '#ff6666';
                }
                this.disabled = false;
            });
        });
    } catch (err) {
        filteredSearchResults.innerHTML = '<div>Network error. Please try again.</div>';
    }
});

closeMovieDetailsModal.addEventListener('click', () => {
    movieDetailsModal.style.display = 'none';
});
window.addEventListener('click', (e) => {
    if (e.target === movieDetailsModal) {
        movieDetailsModal.style.display = 'none';
    }
});

// Function to show movie details
async function showMovieDetails(movieId) {
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
}

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
            // Get current favorites
            let favIds = [];
            try {
                const favRes = await fetch('http://localhost:5001/get_favourites', {
                    method: 'GET',
                    credentials: 'include'
                });
                if (favRes.ok) {
                    const favs = await favRes.json();
                    favIds = favs.map(m => m.id);
                }
            } catch {}
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
                        <button class="fav-btn heart-btn${favIds.includes(movie.id) ? ' favorited' : ''}" data-movie-id="${movie.id}" title="Add to Favorites" aria-label="Add to Favorites">
                            <span class="heart-icon">&#10084;</span>
                        </button>
                        <button class="more-info-btn gradient-btn" data-movie-id="${movie.id}">More Info</button>
                        ${!movie.character_tropes ? `
                        <button class="add-trope-trigger-btn gradient-btn" data-movie-id="${movie.id}">Add Trope</button>
                        <div class="add-trope-form-container" data-movie-id="${movie.id}" style="display:none; margin-top:0;">
                            <input type="text" class="trope-input" placeholder="Add main character trope" data-movie-id="${movie.id}" style="margin-right:4px;">
                            <button class="confirm-add-trope-btn gradient-btn" data-movie-id="${movie.id}">Confirm</button>
                            <button class="cancel-add-trope-btn gradient-btn" data-movie-id="${movie.id}">Cancel</button>
                            <span class="trope-status" data-movie-id="${movie.id}" style="margin-left:8px;font-size:0.95em;"></span>
                        </div>
                        ` : ''}
                    </div>
                `;
                aiSearchResults.appendChild(card);
            });
            // Add event listeners for favorite buttons
            aiSearchResults.querySelectorAll('.fav-btn').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const movieId = this.getAttribute('data-movie-id');
                    if (this.classList.contains('favorited')) return;
                    try {
                        const favRes = await fetch('http://localhost:5001/add_favourite', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ movie_id: movieId })
                        });
                        if (favRes.ok) {
                            this.classList.add('favorited');
                        } else {
                            const errorText = await favRes.text();
                            alert('Could not add to favorites: ' + errorText);
                        }
                    } catch (err) {
                        alert('Network error.');
                    }
                });
            });
            // Add event listeners for More Info buttons
            aiSearchResults.querySelectorAll('.more-info-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const movieId = this.getAttribute('data-movie-id');
                    showMovieDetails(movieId);
                });
            });
            // Add event listeners for Add Trope trigger buttons
            aiSearchResults.querySelectorAll('.add-trope-trigger-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    // Hide all other forms
                    aiSearchResults.querySelectorAll('.add-trope-form-container').forEach(form => form.style.display = 'none');
                    // Show this form
                    const movieId = this.getAttribute('data-movie-id');
                    const form = aiSearchResults.querySelector(`.add-trope-form-container[data-movie-id='${movieId}']`);
                    if (form) form.style.display = 'inline-block';
                });
            });
            // Add event listeners for Cancel buttons
            aiSearchResults.querySelectorAll('.cancel-add-trope-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const movieId = this.getAttribute('data-movie-id');
                    const form = aiSearchResults.querySelector(`.add-trope-form-container[data-movie-id='${movieId}']`);
                    if (form) form.style.display = 'none';
                });
            });
            // Add event listeners for Confirm Add Trope buttons
            aiSearchResults.querySelectorAll('.confirm-add-trope-btn').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const movieId = this.getAttribute('data-movie-id');
                    const input = aiSearchResults.querySelector(`.trope-input[data-movie-id='${movieId}']`);
                    const status = aiSearchResults.querySelector(`.trope-status[data-movie-id='${movieId}']`);
                    const userTrope = input.value.trim();
                    if (!userTrope) {
                        status.textContent = 'Please enter a trope.';
                        status.style.color = '#ff6666';
                        return;
                    }
                    this.disabled = true;
                    status.textContent = 'Adding...';
                    status.style.color = '#b0b3b8';
                    try {
                        const res = await fetch('http://localhost:5001/add_trope', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ user_trope: userTrope, selected_movie_id: movieId })
                        });
                        if (res.ok) {
                            status.textContent = 'Trope added!';
                            status.style.color = '#66ff66';
                            input.value = '';
                        } else {
                            const errText = await res.text();
                            status.textContent = errText || 'Error adding trope.';
                            status.style.color = '#ff6666';
                        }
                    } catch {
                        status.textContent = 'Network error.';
                        status.style.color = '#ff6666';
                    }
                    this.disabled = false;
                });
            });
        } catch (err) {
            console.error('AI search error:', err);
            aiSearchResults.innerHTML = '<div>Network error. Please try again.</div>';
        }
    });
}

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