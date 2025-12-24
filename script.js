// script.js - Shared for login and dashboard

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
    if (!response.ok) {
        const err = await response.text();
        throw new Error(err || `HTTP ${response.status}`);
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
            document.getElementById('loginError').textContent = 'Please enter email and password.';
            return;
        }

        // Check domain
        const allowedDomains = ['millionaire.email', 'affluent.email', 'billionaires.me'];
        const domain = email.split('@')[1];
        if (!allowedDomains.includes(domain)) {
            document.getElementById('loginError').textContent = 'Use your premium email address.';
            return;
        }

        // Simple login — accept any password for allowed domains (for demo)
        // In production, use OAuth or backend IMAP check
        localStorage.setItem('userEmail', email);
        window.location.href = 'dashboard.html';
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

    // Load user data (storage example)
    const loadUserData = async () => {
        try {
            const data = await apiFetch(`/principal/${encodeURIComponent(userEmail)}`);

            const used = data.usedQuota || 0;
            const quota = data.quota || 5368709120;
            const percent = Math.min(100, (used / quota) * 100);

            const storageFill = document.getElementById('storageUsed');
            const storageText = document.getElementById('storageText');

            if (storageFill && storageText) {
                storageFill.style.width = `${percent}%`;
                storageText.textContent = `${(used / 1073741824).toFixed(2)} GB of ${(quota / 1073741824).toFixed(0)} GB used`;
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    };

    loadUserData();
}
