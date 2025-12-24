// script.js

const API_BASE = 'https://mail.millionaire.email/api';
const API_KEY = 'api_dXNlcmRhc2hib2FyZDo1azVoQnFJN1Y4TFQ3STYyQUlzN0xERDczMTNqdlk='; // Use Wix Secrets in production

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

// Login page
if (document.getElementById('loginForm')) {
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Example: check if user exists (Stalwart doesn't have login API, so use your own auth or skip for demo)
    try {
      const response = await apiFetch(`/principal/${encodeURIComponent(email)}`);
      if (response.ok) {
        localStorage.setItem('userEmail', email);
        window.location.href = 'dashboard.html';
      } else {
        document.getElementById('loginError').textContent = 'Invalid credentials';
      }
    } catch (err) {
      document.getElementById('loginError').textContent = 'Login failed';
    }
  });
}

// Dashboard page
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

  // Load user data (example: storage)
  const loadData = async () => {
    try {
      const response = await apiFetch(`/principal/${encodeURIComponent(userEmail)}`);
      if (response.ok) {
        const data = await response.json();
        const used = data.usedQuota || 0;
        const quota = data.quota || 5368709120;
        const percent = (used / quota) * 100;
        document.getElementById('storageUsed').style.width = `${percent}%`;
        document.getElementById('storageText').textContent = `${(used / 1073741824).toFixed(2)} GB of ${(quota / 1073741824).toFixed(0)} GB used`;
      }
    } catch (e) {
      console.error(e);
    }
  };

  loadData();
}
