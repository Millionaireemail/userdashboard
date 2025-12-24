// script.js

if (document.getElementById('loginForm')) {
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    if (email) {
      localStorage.setItem('userEmail', email);
      window.location.href = 'dashboard.html';
    }
  });
}

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
}
