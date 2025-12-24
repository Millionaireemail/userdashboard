// script.js - Shared logic for login and dashboard

const API_BASE = 'https://mail.millionaire.email/api';
const API_KEY = 'YOUR_DASHBOARD_API_KEY_SECRET_HERE'; // Replace with your Stalwart user-dashboard API key secret

// Helper for authenticated API calls
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

        // Check if email belongs to allowed domains
        const allowedDomains = ['millionaire.email', 'affluent.email', 'billionaires.me'];
        const domain = email.split('@')[1];
        if (!allowedDomains.includes(domain)) {
            document.getElementById('loginError').textContent = 'Use your @millionaire.email, @affluent.email, or @billionaires.me address.';
            return;
        }

        // In production, verify password via backend IMAP or Stalwart auth
        // For now, accept any password for allowed domains
        localStorage.setItem('userEmail', email);
        window.location.href = 'dashboard.html';
    });
}

/* ================= DASHBOARD PAGE ================= */
if (document.getElementById('userEmail')) {
    const userEmail = localStorage.getItem('userEmail');

    if (!userEmail) {
        // Not logged in — redirect to login
        window.location.href = 'index.html';
    }

    // Display user email
    document.getElementById('userEmail').textContent = userEmail;

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('userEmail');
        window.location.href = 'index.html';
    });

    // Load user data from Stalwart (example: storage quota)
    const loadUserData = async () => {
        try {
            const data = await apiFetch(`/principal/${encodeURIComponent(userEmail)}`);

            // Update storage bar (example)
            const used = data.usedQuota || 0;
            const quota = data.quota || 5368709120; // 5 GB default
            const percent = Math.min(100, (used / quota) * 100);

            const storageFill = document.getElementById('storageUsed');
            const storageText = document.getElementById('storageText');

            if (storageFill && storageText) {
                storageFill.style.width = `${percent}%`;
                storageText.textContent = `${(used / 1073741824).toFixed(2)} GB of ${(quota / 1073741824).toFixed(0)} GB used`;
            }

            // You can add more UI updates here (aliases, 2FA status, etc.)
            console.log('User data loaded:', data);
        } catch (error) {
            console.error('Failed to load user data:', error);
            // Optional: show error in UI
        }
    };

    loadUserData();
}
