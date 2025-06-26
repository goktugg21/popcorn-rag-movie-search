let isLoggedIn = false;

const messageDiv = document.getElementById('message');
const loginBtn = document.getElementById('login');
const logoutBtn = document.getElementById('logout');
const registerBtn = document.getElementById('register');
const favouritesBtn = document.getElementById('favourites');

function showMessage(msg) {
    messageDiv.textContent = msg;
}

document.getElementById('ai-search').onclick = () => showMessage('AI Search clicked!');
document.getElementById('normal-search').onclick = () => showMessage('Normal Search clicked!');
document.getElementById('trope-search').onclick = () => showMessage('Trope Search clicked!');
registerBtn.onclick = () => {
    showMessage('User Registration clicked! Simulating login...');
    isLoggedIn = true;
    updateUI();
};
loginBtn.onclick = () => {
    showMessage('User Login clicked! Simulating login...');
    isLoggedIn = true;
    updateUI();
};
logoutBtn.onclick = () => {
    showMessage('Logged out!');
    isLoggedIn = false;
    updateUI();
};
favouritesBtn.onclick = () => showMessage('User Favourites clicked!');

function updateUI() {
    if (isLoggedIn) {
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        logoutBtn.style.display = '';
        favouritesBtn.style.display = '';
    } else {
        loginBtn.style.display = '';
        registerBtn.style.display = '';
        logoutBtn.style.display = 'none';
        favouritesBtn.style.display = 'none';
    }
    messageDiv.textContent = '';
}

// Initialize UI on page load
updateUI();
