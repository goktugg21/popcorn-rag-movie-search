const API_BASE = 'http://localhost:5000';

const filtersBtn = document.getElementById('filters-btn');
const filtersModal = document.getElementById('filters-modal');
const closeFiltersModal = document.getElementById('close-filters-modal');
const filtersForm = document.getElementById('filters-form');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const resultsList = document.getElementById('results-list');
const aiSearchBtn = document.getElementById('ai-search-btn');
const tropeSearchBtn = document.getElementById('trope-search-btn');
const profileBtn = document.getElementById('profile-btn');
const userModal = document.getElementById('user-modal');
const closeUserModal = document.getElementById('close-user-modal');
const registerLink = document.getElementById('register-link');
const userModalTitle = document.getElementById('user-modal-title');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');
const registerLinkContainer = document.getElementById('register-link-container');

// Add profile section to the modal (hidden by default)
// (Add this in index.html inside #user-modal .user-modal-content)
// <div id="profile-section" class="hidden">
//   <h2>Welcome, <span id="profile-username"></span>!</h2>
//   <button id="logout-btn" class="purple-btn">Logout</button>
//   <button id="switch-account-btn" class="purple-btn">Switch Account</button>
//   <h3>Your Favorite Movies</h3>
//   <ul id="favourites-list"></ul>
// </div>

// --- Profile Modal Logic ---
const profileSection = document.getElementById('profile-section');
const profileUsername = document.getElementById('profile-username');
const favouritesList = document.getElementById('favourites-list');
const logoutBtn = document.getElementById('logout-btn');
const switchAccountBtn = document.getElementById('switch-account-btn');

let filters = {};
let aiMode = false;
let tropeMode = false;

// Show/hide filters modal
filtersBtn.addEventListener('click', () => filtersModal.classList.remove('hidden'));
closeFiltersModal.addEventListener('click', () => filtersModal.classList.add('hidden'));

// Apply filters
filtersForm.addEventListener('submit', e => {
    e.preventDefault();
    filters = {
        year: document.getElementById('filter-year').value.trim(),
        genres: document.getElementById('filter-genre').value.trim(),
        keyword: document.getElementById('filter-name').value.trim(),
        director: document.getElementById('filter-director') ? document.getElementById('filter-director').value.trim() : '',
        rating: document.getElementById('filter-rating') ? document.getElementById('filter-rating').value.trim() : '',
    };
    filtersModal.classList.add('hidden');
    doSearch();
});

// Trope Search toggle logic
if (tropeSearchBtn) {
    tropeSearchBtn.addEventListener('click', function() {
        tropeMode = !tropeMode;
        tropeSearchBtn.classList.toggle('active-trope', tropeMode);
        if (tropeMode) {
            searchInput.placeholder = 'Search movies by trope...';
            aiMode = false;
            aiSearchBtn.classList.remove('active-ai');
        } else {
            searchInput.placeholder = 'Search movies or ask AI...';
        }
    });
}

// Search on button click or enter
searchBtn.addEventListener('click', function() {
    if (tropeMode) {
        const trope = searchInput.value.trim();
        if (!trope) return;
        resultsList.innerHTML = '<li class="loading-spinner"></li>';
        fetch(`${API_BASE}/movies_with_trope`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', 
            body: JSON.stringify({ user_trope: trope })
        })
        .then(async res => {
            if (res.status === 401) {
                resultsList.innerHTML = '<li>User not logged in</li>';
                return null;
            }
            if (!res.ok) {
                // If not logged in, backend may return 401 or 403, but if not, check for empty result
                const data = await res.json().catch(() => null);
                if (data && data.detail && data.detail.toLowerCase().includes('not logged')) {
                    resultsList.innerHTML = '<li>User not logged in</li>';
                    return null;
                }
                resultsList.innerHTML = '<li>User not logged in</li>';
                return null;
            }
            return res.json();
        })
        .then(data => {
            if (data) renderResults(Object.values(data));
        })
        .catch(() => resultsList.innerHTML = '<li>User not logged in</li>');
        return;
    }
    if (aiMode) {
        // AI search mode
        const query = searchInput.value.trim();
        if (!query) return;
        aiSearchBtn.textContent = 'Searching with AI...';
        aiSearchBtn.disabled = true;
        resultsList.innerHTML = '<li class="loading-spinner"></li>';
        fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        })
        .then(res => res.json())
        .then(async data => {
            let html = '';
            // If movie_ids are present, fetch their details
            if (data.movie_ids && Array.isArray(data.movie_ids) && data.movie_ids.length) {
                const movieDetails = await Promise.all(
                    data.movie_ids.slice(0, 2).map(id =>
                        fetch(`${API_BASE}/movie?imdb_id=${encodeURIComponent(id)}`)
                            .then(res => res.json())
                            .catch(() => null)
                    )
                );
                movieDetails.forEach(movie => {
                    if (movie && movie.original_title) {
                        const movieId = movie.imdb_id || movie.id || '';
                        html += `<li>
                            <a href="movie.html?id=${encodeURIComponent(movieId)}" class="movie-link">
                                <div style='display:flex;align-items:baseline;gap:10px;'>
                                    <strong style='font-size:1.15rem;'>${movie.original_title}</strong>
                                    ${movie.popularity || movie.vote_average ? `<span style='color:#7c3aed;font-size:0.98rem;'>(Rating: ${movie.popularity || movie.vote_average})</span>` : ''}
                                </div>
                                ${movie.overview ? `<div style='font-size:0.95rem;color:#444;margin-top:2px;'>${movie.overview}</div>` : ''}
                            </a>
                        </li>`;
                    }
                });
            }
            // Show AI description/response after the movies
            if (data.response) {
                html += `<li style='margin-top:10px;'><em>${data.response}</em></li>`;
            }
            if (!html) html = '<li>No movies found.</li>';
            resultsList.innerHTML = html;
        })
        .catch(() => {
            resultsList.innerHTML = '<li>AI search failed.</li>';
        })
        .finally(() => {
            aiSearchBtn.textContent = 'AI Search';
            aiSearchBtn.disabled = false;
        });
    } else {
        // Normal search
        doSearch();
    }
});
searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        e.preventDefault();
        doSearch();
    }
});

// Main search function
function doSearch() {
    const query = searchInput.value.trim();
    // Parse year as interval if comma present, else as single year
    let year = filters.year;
    let yearArr = [];
    if (year) {
        if (year.includes(',')) {
            yearArr = year.split(',').map(y => parseInt(y.trim())).filter(y => !isNaN(y));
        } else {
            const y = parseInt(year);
            if (!isNaN(y)) yearArr = [y];
        }
    }
    // Parse genres and director as list
    const genresArr = filters.genres ? filters.genres.split(',').map(g => g.trim()).filter(Boolean) : [];
    const keywordArr = filters.keyword ? filters.keyword.split(',').map(k => k.trim()).filter(Boolean) : [];
    const directorArr = filters.director ? filters.director.split(',').map(d => d.trim()).filter(Boolean) : [];
    const rating = filters.rating ? parseFloat(filters.rating) : undefined;
    const tropeArr = filters.trope ? filters.trope.split(',').map(t => t.trim()).filter(Boolean) : [];

    const body = {
        query: query || "",
        keyword: keywordArr,
        genres: genresArr,
        year: yearArr,
        director: directorArr,
        rating: rating,
        trope: tropeArr
    };

    fetch(`${API_BASE}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then(data => renderResults(Object.values(data)))
    .catch(() => renderResults([]));
}

// AI Search button logic
aiSearchBtn.addEventListener('click', function() {
    aiMode = !aiMode;
    if (aiMode) {
        aiSearchBtn.classList.add('active-ai');
        searchInput.placeholder = 'Ask the AI about movies...';
        searchInput.focus();
    } else {
        aiSearchBtn.classList.remove('active-ai');
        searchInput.placeholder = 'Search movies or ask AI...';
    }
});

// --- Add Profile Modal Section Dynamically ---
(function addProfileModalHTML() {
    if (!document.getElementById('profile-modal')) {
        const modal = document.createElement('div');
        modal.id = 'profile-modal';
        modal.className = 'modal hidden';
        modal.innerHTML = `
            <div class="modal-content user-modal-content">
                <span class="close" id="close-profile-modal">&times;</span>
                <h2 style="color:#7c3aed;">Welcome, <span id="profile-username"></span>!</h2>
                <button id="logout-btn" class="purple-btn" style="margin-bottom:8px;">Logout</button>
                <button id="switch-account-btn" class="purple-btn" style="margin-bottom:18px;">Switch Account</button>
                <h3 style="margin-bottom:8px;">Your Favorite Movies</h3>
                <ul id="favourites-list" style="margin-bottom:0;"></ul>
            </div>
        `;
        document.body.appendChild(modal);
    }
})();

// --- User Modal State ---
let currentUser = null;

// --- Auth State Check ---
async function checkAuth() {
    try {
        const res = await fetch('/get_favourites', { credentials: 'include' });
        if (res.ok) {
            // If we get a 200, user is logged in. But we don't get username from backend, so use localStorage or prompt after login.
            currentUser = localStorage.getItem('username') || null;
        } else {
            currentUser = null;
        }
    } catch {
        currentUser = null;
    }
}

// --- User Details Page ---
// Create a new page: user.html
// This page will show user info and their favourites
// Add a button in the profile modal to go to this page
(function addUserDetailsPageButton() {
    if (document.getElementById('profile-modal')) {
        let btn = document.createElement('button');
        btn.textContent = 'View Profile & Favourites';
        btn.className = 'purple-btn';
        btn.style.marginBottom = '12px';
        btn.onclick = function() {
            window.location.href = 'user.html';
        };
        let modalContent = document.querySelector('#profile-modal .modal-content');
        if (modalContent && !document.getElementById('view-profile-btn')) {
            btn.id = 'view-profile-btn';
            modalContent.insertBefore(btn, modalContent.children[3]);
        }
    }
})();

// --- Show Profile Modal ---
function showProfileModal() {
    let profileModal = document.getElementById('profile-modal');
    document.getElementById('profile-username').textContent = currentUser || '';
    profileModal.classList.remove('hidden');
    // Fetch and display favourites
    fetch('/get_favourites', { credentials: 'include' })
        .then(res => res.json())
        .then(favs => {
            const favouritesList = document.getElementById('favourites-list');
            favouritesList.innerHTML = '';
            if (!favs.length) {
                favouritesList.innerHTML = '<li>No favorites yet.</li>';
            } else {
                favs.forEach(movie => {
                    const li = document.createElement('li');
                    li.textContent = movie.original_title || movie.title || 'Untitled';
                    favouritesList.appendChild(li);
                });
            }
        });
    // Close modal
    document.getElementById('close-profile-modal').onclick = () => profileModal.classList.add('hidden');
    // Logout
    document.getElementById('logout-btn').onclick = async () => {
        await fetch('/logout', { credentials: 'include' });
        currentUser = null;
        profileModal.classList.add('hidden');
    };
    // Switch account
    document.getElementById('switch-account-btn').onclick = () => {
        currentUser = null;
        profileModal.classList.add('hidden');
        userModal.classList.remove('hidden');
        loginForm.style.display = '';
        registerForm.style.display = 'none';
    };
}

// --- Profile Button Logic ---
if (profileBtn) {
    profileBtn.addEventListener('click', () => {
        // Check login state by calling /get_favourites
        fetch('/get_favourites', { credentials: 'include' })
            .then(res => {
                if (res.status === 401) {
                    // Not logged in: show login/register modal
                    if (userModal) userModal.classList.remove('hidden');
                    if (loginForm) loginForm.style.display = '';
                    if (registerForm) registerForm.style.display = 'none';
                } else {
                    // Logged in: go to user details page
                    window.location.href = 'user.html';
                }
            })
            .catch(() => {
                // On error, show login modal as fallback
                if (userModal) userModal.classList.remove('hidden');
                if (loginForm) loginForm.style.display = '';
                if (registerForm) registerForm.style.display = 'none';
            });
    });
}

// --- Registration: Redirect to Login After Success ---
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        registerError.textContent = '';
        registerError.style.display = 'none';
        const username = document.getElementById('register-username').value.trim();
        const password = document.getElementById('register-password').value;
        if (!username || !password) {
            registerError.textContent = 'Please enter both username and password.';
            registerError.style.display = 'block';
            return;
        }
        try {
            const res = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });
            if (res.ok) {
                // Auto-login after successful registration
                const loginRes = await fetch(`${API_BASE}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                if (loginRes.ok) {
                    userModal.classList.add('hidden');
                    currentUser = username;
                    localStorage.setItem('username', username); // <-- Ensure username is saved
                    defineCurrentUser();
                    // Show message in login box
                    loginError.textContent = 'User logged in correctly';
                    loginError.style.display = 'block';
                    loginError.style.color = '#22c55e'; // green
                    setTimeout(() => {
                        loginError.textContent = '';
                        loginError.style.display = 'none';
                        loginError.style.color = '';
                    }, 2000);
                    // Optionally, update UI to show user is logged in
                } else {
                    // Fallback: show login form if auto-login fails
                    registerForm.style.display = 'none';
                    loginForm.style.display = '';
                    userModalTitle.textContent = 'User Login';
                    registerLinkContainer.style.display = '';
                }
            } else {
                const data = await res.json().catch(() => ({}));
                registerError.textContent = data.detail || 'Registration failed.';
                registerError.style.display = 'block';
            }
        } catch (err) {
            registerError.textContent = 'Network error.';
            registerError.style.display = 'block';
        }
    });
}

// --- Render Results: Prefer original_title for tropes ---
function renderResults(movies) {
    // Store id, name, and other info for each movie in lastSearchResults
    lastSearchResults = movies.map(movie => ({
        ...movie,
        id: movie.id,
        name: movie.original_title || movie.title || movie.name || 'Untitled'
    }));
    resultsList.innerHTML = '';
    if (!movies || !movies.length) {
        resultsList.innerHTML = '<li>No movies found.</li>';
        return;
    }
    movies.forEach(movie => {
        // Prefer original_title, then title, then name, then fallback
        const movieTitle = movie.original_title || movie.title || movie.name || 'Untitled';
        const movieId = movie.id || '';
        // Store id and name as data attributes
        resultsList.innerHTML += `<li>
            <div class="movie-card" data-movie-id="${encodeURIComponent(movieId)}" data-movie-name="${encodeURIComponent(movieTitle)}" tabindex="0">
                <strong>${movieTitle}${movie.release_year ? ` <span style='color:#7c3aed;font-weight:400;font-size:1rem;'>(${movie.release_year})</span>` : ''}</strong>
                ${movie.genres && movie.genres.length ? `<span> - ${Array.isArray(movie.genres) ? movie.genres.join(', ') : movie.genres}</span>` : ''}
            </div>
        </li>`;
    });
}

// --- Movie Modal Logic ---
const movieModal = document.getElementById('movie-modal');
const closeMovieModal = document.getElementById('close-movie-modal');
const modalMovieTitle = document.getElementById('modal-movie-title');
const modalMovieDirector = document.getElementById('modal-movie-director');
const modalMovieWriters = document.getElementById('modal-movie-writers');
const modalMovieStars = document.getElementById('modal-movie-stars');
const modalMovieGenres = document.getElementById('modal-movie-genres');
const modalMovieOverview = document.getElementById('modal-movie-overview');
const modalMovieKeywords = document.getElementById('modal-movie-keywords');
const modalMovieKeyInfo = document.getElementById('modal-movie-key-info');
const addFavouriteBtn = document.getElementById('add-favourite-btn');

async function showMovieModal(movieId, anchorElement) {
    try {
        const res = await fetch(`${API_BASE}/movie?id=${encodeURIComponent(movieId)}`);
        if (!res.ok) throw new Error('Movie not found');
        const movie = await res.json();
        // Set the movie title from original_title (fallback to title or Untitled)
        modalMovieTitle.textContent = movie.original_title || movie.title || 'Untitled';
        // Director: keep as is
        modalMovieDirector.textContent = movie.director || (movie.hidden_details && movie.hidden_details.director) || 'N/A';
        // Writers: show label 'Release Date' and value as release_date
        modalMovieWriters.previousElementSibling.textContent = 'Release Date:';
        modalMovieWriters.textContent = movie.release_date || 'N/A';
        // Stars: show label 'Rating' and value as vote_average
        modalMovieStars.previousElementSibling.textContent = 'Rating:';
        modalMovieStars.textContent = movie.vote_average !== undefined && movie.vote_average !== null ? `⭐ ${movie.vote_average}` : 'N/A';
        // Overview (description)
        modalMovieOverview.textContent = movie.overview || (movie.hidden_details && movie.hidden_details.overview) || '';
        // Keywords: show label 'Genres' and value as genres
        modalMovieKeywords.previousElementSibling.textContent = 'Genres:';
        modalMovieKeywords.textContent = (movie.genres && movie.genres.length) ? (Array.isArray(movie.genres) ? movie.genres.join(', ') : movie.genres) : 'N/A';
        // Key info
        modalMovieKeyInfo.innerHTML = '';
        if (movie.release_year) modalMovieKeyInfo.innerHTML += `<span class="movie-tag">${movie.release_year}</span>`;
        if (movie.vote_average) modalMovieKeyInfo.innerHTML += `<span class="movie-tag">⭐ ${movie.vote_average}</span>`;
        if (movie.runtime) modalMovieKeyInfo.innerHTML += `<span class="movie-tag">${movie.runtime} min</span>`;
        // Genres tags
        modalMovieGenres.innerHTML = '';
        
        movieModal.classList.remove('hidden');
        // Position the modal next to the clicked button
        if (anchorElement) {
            // Temporarily show modal offscreen to measure its size
            movieModal.style.visibility = 'hidden';
            movieModal.style.display = 'block';
            movieModal.style.position = 'absolute';
            movieModal.style.left = '-9999px';
            movieModal.style.top = '-9999px';
            // Measure
            const modalWidth = movieModal.offsetWidth;
            const modalHeight = movieModal.offsetHeight;
            // Get anchor position
            const rect = anchorElement.getBoundingClientRect();
            const scrollX = window.scrollX || window.pageXOffset;
            const scrollY = window.scrollY || window.pageYOffset;
            let left = rect.right + scrollX + 8; // 8px gap
            let top = rect.top + scrollY;
            // If modal would overflow right, show to left of button
            if (left + modalWidth > scrollX + window.innerWidth) {
                left = rect.left + scrollX - modalWidth - 8;
            }
            // Clamp left to 0
            if (left < 0) left = 0;
            // If modal would overflow bottom, adjust up
            if (top + modalHeight > scrollY + window.innerHeight) {
                top = scrollY + window.innerHeight - modalHeight - 10;
            }
            if (top < 0) top = 0;
            // Set final position
            movieModal.style.position = 'absolute';
            movieModal.style.left = left + 'px';
            movieModal.style.top = top + 'px';
            movieModal.style.right = 'auto';
            movieModal.style.transform = 'none';
            movieModal.style.maxHeight = '90vh';
            movieModal.style.overflowY = 'auto';
            movieModal.style.zIndex = 1000;
            movieModal.style.visibility = 'visible';
        } else {
            // Fallback: center modal if no anchor
            movieModal.style.position = 'fixed';
            movieModal.style.left = '50%';
            movieModal.style.top = '50%';
            movieModal.style.right = 'auto';
            movieModal.style.transform = 'translate(-50%, -50%)';
            movieModal.style.maxHeight = '90vh';
            movieModal.style.overflowY = 'auto';
            movieModal.style.zIndex = 1000;
            movieModal.style.visibility = 'visible';
        }

        // --- Favourites Logic ---
        if (addFavouriteBtn) {
            addFavouriteBtn.disabled = true;
            addFavouriteBtn.textContent = '...';
            // Check if this movie is already a favourite
            fetch('/get_favourites', { credentials: 'include' })
                .then(res => res.ok ? res.json() : [])
                .then(favs => {
                    let isFav = favs.some(f => String(f.id) === String(movie.id));
                    function updateBtn() {
                        addFavouriteBtn.textContent = isFav ? 'Remove from Favourites' : 'Add to Favourites';
                        addFavouriteBtn.classList.toggle('is-fav', isFav);
                    }
                    function refreshFavouritesList() {
                        const favouritesList = document.getElementById('favourites-list');
                        if (favouritesList) {
                            fetch('/get_favourites', { credentials: 'include' })
                                .then(res => res.ok ? res.json() : [])
                                .then(favs => {
                                    favouritesList.innerHTML = '';
                                    if (!favs.length) {
                                        favouritesList.innerHTML = '<li>No favorites yet.</li>';
                                    } else {
                                        favs.forEach(movie => {
                                            const li = document.createElement('li');
                                            li.textContent = movie.original_title || movie.title || 'Untitled';
                                            favouritesList.appendChild(li);
                                        });
                                    }
                                });
                        }
                    }
                    updateBtn();
                    addFavouriteBtn.disabled = false;
                    addFavouriteBtn.onclick = async function() {
                        addFavouriteBtn.disabled = true;
                        if (!isFav) {
                            // Add to favourites
                            const resp = await fetch('/add_favourite', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify({ movie_id: movie.id })
                            });
                            if (resp.ok) {
                                isFav = true;
                                updateBtn();
                                refreshFavouritesList();
                            }
                        } else {
                            // Remove from favourites
                            const resp = await fetch('/delete_favourite', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify({ movie_id: movie.id })
                            });
                            if (resp.ok) {
                                isFav = false;
                                updateBtn();
                                refreshFavouritesList();
                            }
                        }
                        addFavouriteBtn.disabled = false;
                    };
                })
                .catch(() => {
                    addFavouriteBtn.textContent = 'Add to Favourites';
                    addFavouriteBtn.disabled = false;
                    addFavouriteBtn.classList.remove('is-fav');
                });
        }
    } catch (e) {
        console.log(e)
        modalMovieTitle.textContent = 'Movie not found.';
        movieModal.classList.remove('hidden');
        // Center error modal
        movieModal.style.position = 'fixed';
        movieModal.style.left = '50%';
        movieModal.style.top = '50%';
        movieModal.style.right = 'auto';
        movieModal.style.transform = 'translate(-50%, -50%)';
        movieModal.style.maxHeight = '90vh';
        movieModal.style.overflowY = 'auto';
        movieModal.style.zIndex = 1000;
        movieModal.style.visibility = 'visible';
    }
}

closeMovieModal.addEventListener('click', () => {
    movieModal.classList.add('hidden');
});

// Update event delegation for movie-card

document.addEventListener('click', (e) => {
    let target = e.target;
    // Traverse up to find the closest .movie-card (the movie button)
    const movieButton = target.closest && target.closest('.movie-card');
    if (movieButton) {
        e.preventDefault();
        const movieId = movieButton.getAttribute('data-movie-id');
        showMovieModal(movieId, movieButton); // Pass the actual movie button as anchor
    } else if (!movieModal.contains(e.target) && !e.target.classList.contains('movie-card')) {
        movieModal.classList.add('hidden');
    }
});

// User login modal logic
if (profileBtn) {
    profileBtn.addEventListener('click', () => {
        userModal.classList.remove('hidden');
    });
}
if (closeUserModal) {
    closeUserModal.addEventListener('click', () => {
        userModal.classList.add('hidden');
    });
}
// User modal logic (login/register design unification)
if (registerLink) {
    registerLink.addEventListener('click', () => {
        userModalTitle.textContent = 'User Registration';
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        registerError.textContent = '';
        loginError.textContent = '';
        registerLinkContainer.style.display = 'none';
        // Copy login form layout (height, width, spacing) to register form
        registerForm.style.width = getComputedStyle(loginForm).width;
        registerForm.style.margin = getComputedStyle(loginForm).margin;
        registerForm.style.padding = getComputedStyle(loginForm).padding;
        registerForm.style.gap = getComputedStyle(loginForm).gap;
        // Copy label/input spacing
        Array.from(registerForm.querySelectorAll('label')).forEach((label, i) => {
            const loginLabel = loginForm.querySelectorAll('label')[i];
            if (loginLabel) label.style.marginBottom = getComputedStyle(loginLabel).marginBottom;
        });
    });
}
if (closeUserModal) {
    closeUserModal.addEventListener('click', () => {
        userModal.classList.add('hidden');
        userModalTitle.textContent = 'User Login';
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        registerLinkContainer.style.display = 'block';
        loginError.textContent = '';
        registerError.textContent = '';
        // Copy register form layout (height, width, spacing) to login form
        loginForm.style.width = getComputedStyle(registerForm).width;
        loginForm.style.margin = getComputedStyle(registerForm).margin;
        loginForm.style.padding = getComputedStyle(registerForm).padding;
        loginForm.style.gap = getComputedStyle(registerForm).gap;
        Array.from(loginForm.querySelectorAll('label')).forEach((label, i) => {
            const regLabel = registerForm.querySelectorAll('label')[i];
            if (regLabel) label.style.marginBottom = getComputedStyle(regLabel).marginBottom;
        });
    });
}
// User modal logic (login/register design unification)
if (registerLink) {
    registerLink.addEventListener('click', () => {
        userModalTitle.textContent = 'User Registration';
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        registerError.textContent = '';
        loginError.textContent = '';
        registerLinkContainer.style.display = 'none';
        // Copy login form layout (height, width, spacing) to register form
        registerForm.style.width = getComputedStyle(loginForm).width;
        registerForm.style.margin = getComputedStyle(loginForm).margin;
        registerForm.style.padding = getComputedStyle(loginForm).padding;
        registerForm.style.gap = getComputedStyle(loginForm).gap;
        // Copy label/input spacing
        Array.from(registerForm.querySelectorAll('label')).forEach((label, i) => {
            const loginLabel = loginForm.querySelectorAll('label')[i];
            if (loginLabel) label.style.marginBottom = getComputedStyle(loginLabel).marginBottom;
        });
    });
}
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.textContent = '';
        loginError.style.display = 'none';
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        if (!username || !password) {
            loginError.textContent = 'Please enter both username and password.';
            loginError.style.display = 'block';
            return;
        }
        try {
            const res = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                loginError.textContent = data.detail || 'Login failed.';
                loginError.style.display = 'block';
                return;
            }
            currentUser = username;
            localStorage.setItem('username', username); // <-- Ensure username is saved
            defineCurrentUser();
            // Show message in login box, then hide modal after delay
            loginError.textContent = 'User logged in correctly';
            loginError.style.display = 'block';
            loginError.style.color = '#22c55e'; // green
            setTimeout(() => {
                loginError.textContent = '';
                loginError.style.display = 'none';
                loginError.style.color = '';
                userModal.classList.add('hidden');
            }, 1500);
        } catch (err) {
            loginError.textContent = 'Network error.';
            loginError.style.display = 'block';
        }
    });
}
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        registerError.textContent = '';
        registerError.style.display = 'none';
        const username = document.getElementById('register-username').value.trim();
        const password = document.getElementById('register-password').value;
        if (!username || !password) {
            registerError.textContent = 'Please enter both username and password.';
            registerError.style.display = 'block';
            return;
        }
        try {
            const res = await fetch(`${API_BASE}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                registerError.textContent = data.detail || 'Registration failed.';
                registerError.style.display = 'block';
                return;
            }
            // Registration successful: automatically log in
            const loginRes = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (loginRes.ok) {
                currentUser = username;
                localStorage.setItem('username', username); // <-- Ensure username is saved
                defineCurrentUser();
                // Show message in login box, then hide modal after delay
                loginError.textContent = 'User logged in correctly';
                loginError.style.display = 'block';
                loginError.style.color = '#22c55e'; // green
                setTimeout(() => {
                    loginError.textContent = '';
                    loginError.style.display = 'none';
                    loginError.style.color = '';
                    userModal.classList.add('hidden');
                }, 1500);
            } else {
                // Fallback: show login form if auto-login fails
                registerForm.style.display = 'none';
                loginForm.style.display = '';
                userModalTitle.textContent = 'User Login';
                registerLinkContainer.style.display = '';
            }
        } catch (err) {
            registerError.textContent = 'Network error.';
            registerError.style.display = 'block';
        }
    });
}
// When modal is closed, reset to login view
if (closeUserModal) {
    closeUserModal.addEventListener('click', () => {
        userModal.classList.add('hidden');
        userModalTitle.textContent = 'User Login';
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        registerLinkContainer.style.display = 'block';
        loginError.textContent = '';
        registerError.textContent = '';
        // Copy register form layout (height, width, spacing) to login form
        loginForm.style.width = getComputedStyle(registerForm).width;
        loginForm.style.margin = getComputedStyle(registerForm).margin;
        loginForm.style.padding = getComputedStyle(registerForm).padding;
        loginForm.style.gap = getComputedStyle(registerForm).gap;
        Array.from(loginForm.querySelectorAll('label')).forEach((label, i) => {
            const regLabel = registerForm.querySelectorAll('label')[i];
            if (regLabel) label.style.marginBottom = getComputedStyle(regLabel).marginBottom;
        });
        // But keep login color palette (do not override background, border, etc.)
    });
}

// Track login state and username
defineCurrentUser(); // Call this on page load or after login

function defineCurrentUser() {
    // Try to get username from backend (e.g., /me endpoint or after login)
    fetch('/get_favourites', { credentials: 'include' })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
            if (data && data.username) {
                currentUser = data.username;
            } else {
                currentUser = null;
            }
        })
        .catch(() => { currentUser = null; });
}

profileBtn.addEventListener('click', function() {
    if (currentUser) {
        // Show profile section, hide forms
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'none';
        if (profileSection) profileSection.classList.remove('hidden');
        if (profileUsername) profileUsername.textContent = currentUser;
        if (userModal) userModal.classList.remove('hidden');
        // Fetch and display favourites
        fetch('/get_favourites', { credentials: 'include' })
            .then(res => res.json())
            .then(favs => {
                if (favouritesList) {
                    favouritesList.innerHTML = '';
                    if (!favs.length) {
                        favouritesList.innerHTML = '<li>No favorites yet.</li>';
                    } else {
                        favs.forEach(movie => {
                            const li = document.createElement('li');
                            li.textContent = movie.original_title || movie.title || 'Untitled';
                            favouritesList.appendChild(li);
                        });
                    }
                }
            });
    } else {
        // Not logged in: show login/register as usual
        if (profileSection) profileSection.classList.add('hidden');
        if (loginForm) loginForm.style.display = '';
        if (registerForm) registerForm.style.display = 'none';
        if (userModal) userModal.classList.remove('hidden');
    }
});

if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
        fetch('/logout', { credentials: 'include' })
            .then(() => {
                currentUser = null;
                userModal.classList.add('hidden');
                // Optionally, refresh the page or UI
            });
    });
}
if (switchAccountBtn) {
    switchAccountBtn.addEventListener('click', function() {
        currentUser = null;
        profileSection.classList.add('hidden');
        loginForm.style.display = '';
        registerForm.style.display = 'none';
    });
}

// --- Make Movie Modal Draggable ---
(function makeMovieModalDraggable() {
    const dragHandle = document.getElementById('modal-movie-title');
    if (!movieModal || !dragHandle) return;
    let isDragging = false;
    let offsetX = 0, offsetY = 0;

    dragHandle.style.cursor = 'move';

    dragHandle.addEventListener('mousedown', function(e) {
        isDragging = true;
        // Calculate offset between mouse and modal top-left
        const rect = movieModal.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        // Bring modal to front
        movieModal.style.zIndex = 2000;
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        // Move modal to follow mouse, keeping offset
        let left = e.clientX - offsetX + window.scrollX;
        let top = e.clientY - offsetY + window.scrollY;
        // Clamp to viewport
        left = Math.max(0, Math.min(left, window.innerWidth - movieModal.offsetWidth));
        top = Math.max(0, Math.min(top, window.innerHeight - movieModal.offsetHeight));
        movieModal.style.position = 'absolute';
        movieModal.style.left = left + 'px';
        movieModal.style.top = top + 'px';
        movieModal.style.right = 'auto';
        movieModal.style.transform = 'none';
    });

    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            document.body.style.userSelect = '';
        }
    });
})();
