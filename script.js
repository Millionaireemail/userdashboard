// script.js - Shared for login and dashboard pages

const API_BASE = 'https://mail.millionaire.email/api';
const API_KEY = 'api_dXNlcmRhc2hib2FyZDo1azVoQnFJN1Y4TFQ3STYyQUlzN0xERDczMTNqdlk='; // Replace with your user-dashboard API key secret

// Helper to make authenticated API calls
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

    // Simple placeholder login — in production, use real auth or Stalwart OAuth
    // For now, we just store the email and go to dashboard
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
    return;
  }

  // Show user email
  document.getElementById('userEmail').textContent = userEmail;

  // Logout button
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
      const quota = data.quota || 5368709120; // default 5GB
      const percent = Math.min(100, (used / quota) * 100);

      const storageUsedEl = document.getElementById('storageUsed');
      const storageTextEl = document.getElementById('storageText');

      if (storageUsedEl && storageTextEl) {
        storageUsedEl.style.width = `${percent}%`;
        storageTextEl.textContent = `${(used / 1073741824).toFixed(2)} GB of ${(quota / 1073741824).toFixed(0)} GB used`;
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
