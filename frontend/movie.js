// movie.js: Handles fetching and displaying movie details on movie.html

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get('id');
    if (!movieId) return;

    const API_BASE = 'http://localhost:5000';
    try {
        const res = await fetch(`${API_BASE}/movie?imdb_id=${encodeURIComponent(movieId)}`);
        if (!res.ok) throw new Error('Movie not found');
        const movie = await res.json();

        // Title (prefer original_title)
        const titleElem = document.getElementById('movie-title');
        if (titleElem) {
            titleElem.textContent = movie.original_title || movie.title || 'Untitled';
        } else {
            console.warn('No element with id="movie-title" found in DOM');
        }
        // Year
        document.getElementById('movie-year').textContent = movie.release_year || movie.year || 'N/A';
        // Rating
        document.getElementById('movie-rating').textContent = movie.vote_average ? `⭐ ${movie.vote_average}` : '⭐ N/A';
        // Runtime
        document.getElementById('movie-runtime').textContent = movie.runtime ? `${movie.runtime} min` : 'N/A';
        // Popularity
        document.getElementById('movie-popularity').textContent = movie.popularity ? `🔥 ${movie.popularity}` : '';
        // Overview
        document.getElementById('movie-overview').textContent = movie.overview || 'No description available.';
        // Genres
        const genresDiv = document.getElementById('movie-genres');
        genresDiv.innerHTML = '';
        (movie.genres || []).forEach(g => {
            const span = document.createElement('span');
            span.className = 'genre-tag';
            span.textContent = g;
            genresDiv.appendChild(span);
        });
        // Directors
        const directorUl = document.getElementById('movie-director');
        directorUl.innerHTML = '';
        (movie.director || []).forEach(d => {
            const li = document.createElement('li');
            li.textContent = d;
            directorUl.appendChild(li);
        });
        // Writers
        const writersUl = document.getElementById('movie-writers');
        writersUl.innerHTML = '';
        (movie.writers || []).forEach(w => {
            const li = document.createElement('li');
            li.textContent = w;
            writersUl.appendChild(li);
        });
        // Stars
        const starsUl = document.getElementById('movie-stars');
        starsUl.innerHTML = '';
        (movie.stars || []).forEach(s => {
            const li = document.createElement('li');
            li.textContent = s;
            starsUl.appendChild(li);
        });
        // Vote count
        document.getElementById('movie-vote-count').textContent = movie.vote_count ? `Votes: ${movie.vote_count}` : '';
        // Additional meta
        document.getElementById('movie-additional-meta').textContent = movie.additional_meta || '';
    } catch (e) {
        const titleElem = document.getElementById('movie-title');
        if (titleElem) {
            titleElem.textContent = 'Movie not found.';
        }
    }
});
