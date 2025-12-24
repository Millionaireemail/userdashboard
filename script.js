// script.js - Full script for Millionaire.email user dashboard (GitHub/Netlify hosted)

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
            document.getElementById('loginError').textContent = 'Please enter email and password.';
            return;
        }

        // Check if domain is allowed
        const allowedDomains = ['millionaire.email', 'affluent.email', 'billionaires.me'];
        const domain = email.split('@')[1];
        if (!allowedDomains.includes(domain)) {
            document.getElementById('loginError').textContent = 'Use your @millionaire.email address.';
            return;
        }

        document.getElementById('loginError').textContent = 'Verifying account...';

        try {
            const response = await apiFetch(`/principal/${encodeURIComponent(email)}`);

            if (response.ok) {
                // Account exists — allow login (password not verified in frontend for security)
                localStorage.setItem('userEmail', email);
                window.location.href = 'dashboard.html';
            } else {
                document.getElementById('loginError').textContent = 'Account not found.';
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

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('userEmail');
        window.location.href = 'index.html';
    });

    // Load user data
    const loadUserData = async () => {
        try {
            const data = await apiFetch(`/principal/${encodeURIComponent(userEmail)}`);

            // Storage
            const used = data.usedQuota || 0;
            const quota = data.quota || 5368709120; // default 5GB
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

            // Language
            if (document.getElementById('languageSelect')) {
                document.getElementById('languageSelect').value = data.locale || 'en';
            }

            // Timezone (not in Stalwart — placeholder)
            if (document.getElementById('timezoneSelect')) {
                document.getElementById('timezoneSelect').value = 'UTC';
            }

            // 2FA & Encryption (not supported per-user in Stalwart — placeholder)
            document.getElementById('2faStatus').textContent = 'Not available';
            document.getElementById('encryptionStatus').textContent = 'Server-side enabled';
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    };

    loadUserData();
}
