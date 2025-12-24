// script.js - Login with real account existence check

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
            document.getElementById('loginError').textContent = 'Please enter email and password.';
            return;
        }

        // Check if domain is allowed
        const allowedDomains = ['millionaire.email', 'affluent.email', 'billionaires.me'];
        const domain = email.split('@')[1];
        if (!allowedDomains.includes(domain)) {
            document.getElementById('loginError').textContent = 'Use your premium @millionaire.email address.';
            return;
        }

        document.getElementById('loginError').textContent = 'Verifying account...';

        try {
            const response = await apiFetch(`/principal/${encodeURIComponent(email)}`);

            if (response.ok) {
                // Account exists — allow login (in production, verify password too)
                localStorage.setItem('userEmail', email);
                window.location.href = 'dashboard.html';
            } else {
                document.getElementById('loginError').textContent = 'Account not found. Sign up first.';
            }
        } catch (err) {
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

                // Storage example
                const used = data.usedQuota || 0;
                const quota = data.quota || 5368709120;
                const percent = Math.min(100, (used / quota) * 100);

                const storageFill = document.getElementById('storageUsed');
                const storageText = document.getElementById('storageText');

                if (storageFill && storageText) {
                    storageFill.style.width = `${percent}%`;
                    storageText.textContent = `${(used / 1073741824).toFixed(2)} GB of ${(quota / 1073741824).toFixed(0)} GB used`;
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    loadUserData();
}
