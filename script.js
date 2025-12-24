// script.js - Full standalone script for Millionaire.email user dashboard (GitHub Pages/Netlify)

const API_BASE = 'https://mail.millionaire.email/api';
const API_KEY = 'api_d2l4Zm9ybToyOUdDVlFiQjhzNHEwcDhLeVFyTmZDcmNkOThLWmQ='; // Replace with your user-dashboard API key secret

async function apiFetch(path) {
    const response = await fetch(`${API_BASE}${path}`, {
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Accept': 'application/json'
        }
    });
    if (!response.ok) throw new Error('API error');
    return response.json();
}

/* ================= LOGIN PAGE ================= */
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
            const data = await apiFetch(`/principal/${encodeURIComponent(email)}`);

            if (data.type === "individual") {
                localStorage.setItem('userEmail', email);
                window.location.href = 'dashboard.html';
            } else {
                document.getElementById('loginError').textContent = 'Account not found.';
            }
        } catch (err) {
            document.getElementById('loginError').textContent = 'Invalid account or connection error.';
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

    // Load user data from Stalwart
    const loadUserData = async () => {
        try {
            const data = await apiFetch(`/principal/${encodeURIComponent(userEmail)}`);

            // Storage Usage
            const used = data.usedQuota || 0;
            const quota = data.quota || 5368709120; // default 5 GB
            const percent = Math.min(100, (used / quota) * 100);

            const storageFill = document.getElementById('storageUsed');
            const storageText = document.getElementById('storageText');

            if (storageFill && storageText) {
                storageFill.style.width = `${percent}%`;
                storageText.textContent = `${(used / 1073741824).toFixed(2)} GB of ${(quota / 1073741824).toFixed(0)} GB used`;
            }

            // Email Aliases
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

            // Placeholder for other features (2FA, language, encryption, etc.)
            document.getElementById('2faStatus').textContent = 'Not available';
            document.getElementById('encryptionStatus').textContent = 'Server-side enabled';

        } catch (error) {
            console.error('Failed to load user data:', error);
            // Optional: show error in UI
        }
    };

    loadUserData();
}
