// stalwart.api.js - Shared API functions
const API_BASE = 'https://mail.millionaire.email/api/v1';
const JMAP_BASE = 'https://mail.millionaire.email/jmap';

let authToken = ''; // Base64(email:password)
let userEmail = '';

function setAuth(email, password) {
  userEmail = email.toLowerCase();
  authToken = btoa(`${userEmail}:${password}`);
  sessionStorage.setItem('authToken', authToken);
  sessionStorage.setItem('userEmail', userEmail);
}

function getAuth() {
  if (!authToken) {
    authToken = sessionStorage.getItem('authToken');
    userEmail = sessionStorage.getItem('userEmail');
  }
  return authToken ? `Basic ${authToken}` : null;
}

async function apiFetch(url, method = 'GET', body = null) {
  const headers = {
    'Authorization': getAuth(),
    'Content-Type': 'application/json'
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });

  if (res.status === 401) {
    logout();
    window.location.href = 'index.html';
  }

  return res;
}

function logout() {
  sessionStorage.clear();
}
