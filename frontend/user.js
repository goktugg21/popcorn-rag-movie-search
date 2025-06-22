// user.js: Handles user details and favourites page

document.addEventListener('DOMContentLoaded', async () => {
    const usernameSpan = document.getElementById('user-details-username');
    const favouritesList = document.getElementById('favourites-list');
    const logoutBtn = document.getElementById('logout-btn');
    const switchAccountBtn = document.getElementById('switch-account-btn');
    const userError = document.getElementById('user-error');

    // Fetch username from backend (using /get_favourites as login check)
    let username = null;
    try {
        // Try to get favourites and infer login state
        const res = await fetch('/get_favourites', { credentials: 'include' });
        if (res.status === 401) {
            userError.textContent = 'You are not logged in.';
            favouritesList.innerHTML = '';
            usernameSpan.textContent = '(not logged in)';
            return;
        }
        const favs = await res.json();
        // Try to get username from localStorage (set after login)
        username = localStorage.getItem('username');
        if (!username) {
            // If not in localStorage, show generic
            usernameSpan.textContent = '(unknown)';
        } else {
            usernameSpan.textContent = username;
        }
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
    } catch (e) {
        userError.textContent = 'Failed to load favourites.';
        usernameSpan.textContent = '(unknown)';
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await fetch('/logout', { credentials: 'include' });
            localStorage.removeItem('username');
            window.location.href = '/';
        });
    }
    // Switch account
    if (switchAccountBtn) {
        switchAccountBtn.addEventListener('click', () => {
            localStorage.removeItem('username');
            window.location.href = '/';
        });
    }
    // Delete account
    const deleteBtn = document.getElementById('delete-account-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            if (!username) {
                alert('No username found. Please log in again.');
                return;
            }
            if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
            const password = prompt('Please enter your password to confirm account deletion:');
            if (!password) return;
            const res = await fetch('/delete_account', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });
            if (res.ok) {
                alert('Account deleted.');
                localStorage.removeItem('username');
                window.location.href = '/';
            } else {
                alert('Failed to delete account. Please check your password and try again.');
            }
        });
    }
});
