// login.js
document.addEventListener('DOMContentLoaded', () => {
  const allowedDomains = ['millionaire.email', 'affluent.email', 'billionaires.me'];

  document.getElementById('loginBtn').addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');

    if (!email || !password) {
      errorMsg.textContent = 'Please fill in all fields';
      return;
    }

    const domain = email.split('@')[1];
    if (!allowedDomains.includes(domain)) {
      errorMsg.textContent = 'Only @millionaire.email, @affluent.email, @billionaires.me allowed';
      return;
    }

    // Test authentication
    setAuth(email, password);
    const res = await apiFetch(`${API_BASE}/account/auth`);

    if (res.ok) {
      window.location.href = 'dashboard.html';
    } else {
      errorMsg.textContent = 'Invalid credentials';
    }
  });
});
