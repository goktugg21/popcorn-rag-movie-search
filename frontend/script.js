// Modal functionality
function showLogin() {
    document.getElementById('loginModal').style.display = 'block';
}

function showAISearch() {
    document.getElementById('aiSearchModal').style.display = 'block';
}

function showFilterSearch() {
    document.getElementById('filterSearchModal').style.display = 'block';
}

function showSignup() {
    // Close login modal and show signup modal
    closeModal('loginModal');
    document.getElementById('signupModal').style.display = 'block';
}

function showLogin() {
    // Close signup modal and show login modal
    closeModal('signupModal');
    document.getElementById('loginModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Form submissions
document.addEventListener('DOMContentLoaded', function() {
    // Login form
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            try {
                const response = await fetch('http://localhost:5001/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                    credentials: 'include' // Include cookies
                });
                console.log('Login response status:', response.status);
                if (response.ok) {
                    // Store user data in localStorage for frontend use
                    const userData = {
                        username: username
                    };
                    localStorage.setItem('currentUser', JSON.stringify(userData));
                    // Redirect to dashboard
                    window.location.href = 'dashboard.html';
                } else {
                    const errorText = await response.text();
                    console.error('Login failed:', errorText);
                    alert(`Login failed: ${errorText}`);
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('Login failed. Please try again.');
            }
        });
    }

    // AI Search form
    const aiSearchForm = document.querySelector('.ai-search-form');
    if (aiSearchForm) {
        aiSearchForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const query = document.getElementById('aiQuery').value;
            if (!query.trim()) {
                alert('Please enter a search query');
                return;
            }
            try {
                const response = await fetch('http://localhost:5001/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query }),
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    // Show the AI response and movie IDs in an alert for now
                    alert('AI Response: ' + data.response + '\nMovie IDs: ' + data.movie_ids.join(', '));
                    closeModal('aiSearchModal');
                } else {
                    const errorData = await response.json();
                    alert('AI Search failed: ' + (errorData.error || response.status));
                }
            } catch (error) {
                console.error('AI Search error:', error);
                alert('AI Search failed. Please try again.');
            }
        });
    }

    // Filter Search form
    const filterForm = document.querySelector('.filter-form');
    if (filterForm) {
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(filterForm);
            const filters = Object.fromEntries(formData);
            
            // TODO: Connect to backend filter API
            console.log('Filter search:', filters);
            alert('Filter search will be connected to backend soon!');
        });
    }

    // Signup form
    const signupForm = document.querySelector('.signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const username = document.getElementById('signup-username').value;
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Validate passwords match
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            // Validate password length
            if (password.length < 6) {
                alert('Password must be at least 6 characters long!');
                return;
            }
            
            try {
                const response = await fetch('http://localhost:5001/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                    credentials: 'include'
                });
                
                if (response.ok) {
                    alert('Account created successfully! You can now login.');
                    // Close signup modal and show login modal
                    closeModal('signupModal');
                    showLogin();
                    // Clear the signup form
                    signupForm.reset();
                } else {
                    const errorText = await response.text();
                    alert(`Registration failed: ${errorText}`);
                }
            } catch (error) {
                console.error('Registration error:', error);
                alert('Registration failed. Please try again.');
            }
        });
    }
});

// Add some interactive effects
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});