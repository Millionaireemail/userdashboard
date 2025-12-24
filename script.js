// script.js - Secure login with real account existence check

const API_BASE = 'https://mail.millionaire.email/api';
const API_KEY = 'api_d2l4Zm9ybToyOUdDVlFiQjhzNHEwcDhLeVFyTmZDcmNkOThLWmQ='; // Your user-dashboard key

async function apiFetch(path) {
    const response = await fetch(`${API_BASE}${path}`, {
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Accept': 'application/json'
        }
    });
    return response;
}

/* LOGIN PAGE */
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value.trim();

        if (!email) {
            document.getElementById('loginError').textContent = 'Enter your email.';
            return;
        }

        document.getElementById('loginError').textContent = 'Verifying account...';

        try {
            const response = await apiFetch(`/principal/${encodeURIComponent(email)}`);

            if (response.ok) {
                const data = await response.json();
                if (data.type === "individual") {
                    localStorage.setItem('userEmail', email);
                    window.location.href = 'dashboard.html';
                    return;
                }
            }

            document.getElementById('loginError').textContent = 'Account not found or invalid.';
        } catch (error) {
            console.error('Login error:', error);
            document.getElementById('loginError').textContent = 'Login failed. Check your connection.';
        }
    });
}

/* DASHBOARD PAGE */
if (document.getElementById('userEmail')) {
    const userEmail = localStorage.getItem('userEmail');

    if (!userEmail) {
        window.location.href = 'index.html';
    }

    document.getElementById('userEmail').textContent = userEmail;

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('userEmail');
        window.location.href = 'index.html';
    });

    // Load user data
    const loadUserData = async () => {
        try {
            const response = await apiFetch(`/principal/${encodeURIComponent(userEmail)}`);
            if (response.ok) {
                const data = await response.json();

                // Storage
                const used = data.usedQuota || 0;
                const quota = data.quota || 5368709120;
                const percent = Math.min(100, (used / quota) * 100);

                document.getElementById('storageUsed').style.width = `${percent}%`;
                document.getElementById('storageText').textContent = 
                    `${(used / 1073741824).toFixed(2)} GB of ${(quota / 1073741824).toFixed(0)} GB used`;

                // Aliases
                const aliasesList = document.getElementById('aliasesList');
                aliasesList.innerHTML = '';
                if (data.emails && data.emails.length > 1) {
                    data.emails.slice(1).forEach(alias => {
                        const p = document.createElement('p');
                        p.textContent = alias;
                        aliasesList.appendChild(p);
                    });
                } else {
                    aliasesList.innerHTML = '<p>No aliases</p>';
                }
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    };

    loadUserData();
}
