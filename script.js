// script.js - Secure login with account existence check

const API_BASE = 'https://mail.millionaire.email/api';
const API_KEY = 'api_dXNlcmRhc2hib2FyZDo1azVoQnFJN1Y4TFQ3STYyQUlzN0xERDczMTNqdlk='; // Replace with your user-dashboard API key secret

async function apiFetch(path, options = {}) {
    const headers = {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json'
    };
    if (options.body) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    return response;
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
            const response = await apiFetch(`/principal/${encodeURIComponent(email)}`);

            if (response.ok) {
                // Account exists — login success
                localStorage.setItem('userEmail', email);
                window.location.href = 'dashboard.html';
            } else {
                document.getElementById('loginError').textContent = 'Invalid credentials or account not found.';
            }
        } catch (error) {
            document.getElementById('loginError').textContent = 'Login failed. Try again.';
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

                const storageFill = document.getElementById('storageUsed');
                const storageText = document.getElementById('storageText');

                if (storageFill && storageText) {
                    storageFill.style.width = `${percent}%`;
                    storageText.textContent = `${(used / 1073741824).toFixed(2)} GB of ${(quota / 1073741824).toFixed(0)} GB used`;
                }

                // Aliases
                const aliasesList = document.getElementById('aliasesList');
                if (aliasesList) {
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

                // Add more fields as needed
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    };

    loadUserData();
}
