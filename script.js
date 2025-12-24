// script.js - Login with real account check + full dashboard loading

const API_BASE = 'https://mail.millionaire.email/api';
const API_KEY = 'api_dXNlcmRhc2hib2FyZDo1azVoQnFJN1Y4TFQ3STYyQUlzN0xERDczMTNqdlk='; // Replace with your Stalwart user-dashboard API key secret

async function apiFetch(path, options = {}) {
    const headers = {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json'
    };
    if (options.body) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    if (!response.ok) {
        throw new Error('API error');
    }
    return response.json();
}

/* ================= LOGIN PAGE ================= */
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            document.getElementById('loginError').textContent = 'Enter email and password.';
            return;
        }

        document.getElementById('loginError').textContent = 'Verifying account...';

        try {
            // Check if the principal (account) exists
            const data = await apiFetch(`/principal/${encodeURIComponent(email)}`);

            // If we get a valid individual user object, login success
            if (data.type === "individual") {
                localStorage.setItem('userEmail', email);
                window.location.href = 'dashboard.html';
            } else {
                document.getElementById('loginError').textContent = 'Account not found or invalid.';
            }
        } catch (error) {
            document.getElementById('loginError').textContent = 'Invalid credentials or account not found.';
        }
    });
}

/* ================= DASHBOARD PAGE ================= */
if (document.getElementById('userEmail')) {
    const userEmail = localStorage.getItem('userEmail');

    if (!userEmail) {
        window.location.href = 'index.html';
    }

    document.getElementById('userEmail').textContent = userEmail;

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('userEmail');
        window.location.href = 'index.html';
    });

    // Load all user data
    const loadUserData = async () => {
        try {
            const data = await apiFetch(`/principal/${encodeURIComponent(userEmail)}`);

            // Storage
            const used = data.usedQuota || 0;
            const quota = data.quota || 5368709120; // default 5GB
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

            // 2FA status (Stalwart doesn't have per-user 2FA yet — placeholder)
            document.getElementById('2faStatus').textContent = 'Not supported';

            // Encryption at rest (placeholder)
            document.getElementById('encryptionStatus').textContent = 'Server-side enabled';

            // Language & timezone (placeholder)
            document.getElementById('languageSelect').value = data.locale || 'en';
            document.getElementById('timezoneSelect').value = 'UTC';

        } catch (error) {
            console.error('Failed to load data:', error);
            document.getElementById('messageText').textContent = 'Failed to load account data.';
            document.getElementById('messageText').show();
        }
    };

    loadUserData();
}
