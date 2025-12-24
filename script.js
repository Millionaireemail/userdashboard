// script.js - Pure JS for GitHub Pages

const API_BASE = 'https://mail.millionaire.email/api';
const API_KEY = 'api_d2l4Zm9ybToyOUdDVlFiQjhzNHEwcDhLeVFyTmZDcmNkOThLWmQ='; // Your user-dashboard key

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

/* LOGIN PAGE */
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value.trim();

        if (!email) {
            document.getElementById('loginError').textContent = 'Enter your email.';
            return;
        }

        // Check if account exists
        try {
            const data = await apiFetch(`/principal/${encodeURIComponent(email)}`);

            if (data.type === "individual") {
                localStorage.setItem('userEmail', email);
                window.location.href = 'dashboard.html';
            } else {
                document.getElementById('loginError').textContent = 'Account not found.';
            }
        } catch (err) {
            document.getElementById('loginError').textContent = 'Invalid account.';
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

    // Load data
    const loadData = async () => {
        try {
            const data = await apiFetch(`/principal/${encodeURIComponent(userEmail)}`);

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
        } catch (err) {
            console.error(err);
        }
    };

    loadData();
}
