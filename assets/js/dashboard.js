// dashboard.js
document.addEventListener('DOMContentLoaded', async () => {
  if (!getAuth()) {
    window.location.href = 'index.html';
    return;
  }

  document.getElementById('user-email').textContent = userEmail;

  // Load all data
  await Promise.all([
    loadStorage(),
    loadAliases(),
    loadOTPStatus()
  ]);

  // Event Listeners
  document.getElementById('logoutBtn').onclick = () => {
    logout();
    window.location.href = 'index.html';
  };

  document.getElementById('add-alias-btn').onclick = addAlias;
  document.getElementById('change-pw-btn').onclick = changePassword;
  document.getElementById('upload-key-btn').onclick = uploadEncryptionKey;
  document.getElementById('toggle-otp-btn').onclick = toggleOTP;
  document.getElementById('verify-otp-btn').onclick = verifyAndEnableOTP;
  document.getElementById('delete-request-btn').onclick = requestDelete;
});

async function loadStorage() {
  try {
    const body = {
      using: ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:quota"],
      methodCalls: [["Quota/get", { accountId: "singleton", ids: null }, "r1"]]
    };
    const res = await apiFetch(JMAP_BASE, 'POST', body);
    const data = await res.json();
    const quota = data.methodResponses[0][1].list[0];
    const used = quota.used || 0;
    const limit = quota.limit || 0;
    const remaining = limit - used;
    document.getElementById('storage-info').innerHTML = `
      <strong>Used:</strong> ${(used / 1024 / 1024).toFixed(1)} MB<br>
      <strong>Remaining:</strong> ${(remaining / 1024 / 1024).toFixed(1)} MB of ${(limit / 1024 / 1024).toFixed(0)} MB
    `;
  } catch (e) {
    document.getElementById('storage-info').textContent = 'Error loading storage';
  }
}

async function loadAliases() {
  try {
    const res = await apiFetch(`${API_BASE}/principal/${userEmail}`);
    const data = await res.json();
    const emails = data.emails || [];
    const primary = emails[0];
    const aliases = emails.slice(1);

    const list = document.getElementById('aliases-list');
    list.innerHTML = aliases.map(a => `
      <li>${a} <button class="btn-small btn-danger" onclick="deleteAlias('${a}')">Delete</button></li>
    `).join('');

    if (aliases.length >= 10) {
      document.getElementById('new-alias').disabled = true;
      document.getElementById('add-alias-btn').disabled = true;
    }
  } catch (e) {
    document.getElementById('aliases-error').textContent = 'Failed to load aliases';
  }
}

async function addAlias() {
  const input = document.getElementById('new-alias');
  const alias = input.value.trim();
  if (!alias) return;

  try {
    const body = [{ action: "add", field: "emails", value: alias }];
    await apiFetch(`${API_BASE}/principal/${userEmail}`, 'PATCH', body);
    input.value = '';
    loadAliases();
  } catch (e) {
    document.getElementById('aliases-error').textContent = 'Failed to add alias';
  }
}

async function deleteAlias(alias) {
  try {
    const body = [{ action: "remove", field: "emails", value: alias }];
    await apiFetch(`${API_BASE}/principal/${userEmail}`, 'PATCH', body);
    loadAliases();
  } catch (e) {
    document.getElementById('aliases-error').textContent = 'Failed to delete';
  }
}

async function changePassword() {
  const newPw = document.getElementById('new-password').value;
  if (!newPw) return;

  try {
    const body = [{ action: "set", field: "secrets", value: { password: newPw } }];
    await apiFetch(`${API_BASE}/principal/${userEmail}`, 'PATCH', body);
    document.getElementById('pw-success').textContent = 'Password updated!';
    document.getElementById('new-password').value = '';
    // Update stored auth
    const password = prompt('Please re-enter your OLD password to continue session:');
    if (password) setAuth(userEmail, password);
  } catch (e) {
    document.getElementById('pw-error').textContent = 'Failed to change password';
  }
}

async function uploadEncryptionKey() {
  const type = document.getElementById('enc-type').value.toUpperCase();
  const key = document.getElementById('public-key').value.trim();
  if (!key) return;

  try {
    const body = { type, algo: "Aes256", certs: [key] };
    await apiFetch(`${API_BASE}/account/crypto`, 'POST', body);
    document.getElementById('enc-success').textContent = 'Key uploaded successfully!';
  } catch (e) {
    document.getElementById('enc-error').textContent = 'Upload failed';
  }
}

let totpSecret = '';
async function loadOTPStatus() {
  try {
    const res = await apiFetch(`${API_BASE}/account/auth`);
    const data = await res.json();
    const enabled = data.otp?.enabled || false;
    document.getElementById('otp-status').textContent = enabled ? 'Two-Factor Authentication: Enabled' : 'Two-Factor Authentication: Disabled';
    document.getElementById('toggle-otp-btn').textContent = enabled ? 'Disable 2FA' : 'Enable 2FA';
    if (!enabled) document.getElementById('toggle-otp-btn').onclick = startOTPSetup;
  } catch (e) {
    document.getElementById('otp-error').textContent = 'Failed to load 2FA status';
  }
}

function startOTPSetup() {
  // Generate random Base32 secret
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  totpSecret = Array.from(crypto.getRandomValues(new Uint8Array(20)))
    .map(b => chars[b % chars.length]).join('');

  const otpauth = `otpauth://totp/${encodeURIComponent(userEmail)}?secret=${totpSecret}&issuer=Millionaire%20Email`;
  document.getElementById('qr-code').innerHTML = '';
  new QRCode(document.getElementById('qr-code'), { text: otpauth, width: 200, height: 200 });
  document.getElementById('otp-setup').classList.remove('hidden');
  document.getElementById('toggle-otp-btn').classList.add('hidden');
}

async function verifyAndEnableOTP() {
  const code = document.getElementById('otp-code').value.trim();
  if (!code || !totpSecret) return;

  try {
    const body = [{ type: "enableOTP", secret: totpSecret, code }];
    await apiFetch(`${API_BASE}/account/auth`, 'POST', body);
    document.getElementById('otp-setup').classList.add('hidden');
    loadOTPStatus();
  } catch (e) {
    document.getElementById('otp-error').textContent = 'Invalid code or failed to enable';
  }
}

function toggleOTP() {
  if (confirm('Disable 2FA?')) {
    // Add disable logic if Stalwart supports it
    alert('Disable not implemented in this version');
  }
}

function requestDelete() {
  const mailto = `mailto:info@millionaire.email?subject=Delete Account Request&body=Please permanently delete my account: ${userEmail}`;
  window.location.href = mailto;
  document.getElementById('delete-msg').classList.remove('hidden');
}
