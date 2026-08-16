// ========== Storage helpers ==========
function getUsers() {
  const data = localStorage.getItem('mysite_users');
  return data ? JSON.parse(data) : [];
}

function saveUsers(users) {
  localStorage.setItem('mysite_users', JSON.stringify(users));
}

function getCurrentUser() {
  const data = localStorage.getItem('mysite_current');
  return data ? JSON.parse(data) : null;
}

function setCurrentUser(user) {
  if (user) {
    localStorage.setItem('mysite_current', JSON.stringify(user));
  } else {
    localStorage.removeItem('mysite_current');
  }
}

// ========== Auth functions ==========
function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById('regUsername').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirm = document.getElementById('regConfirm').value;
  const msg = document.getElementById('registerMessage');

  if (password !== confirm) {
    showMessage(msg, 'Passwords do not match', 'error');
    return;
  }

  const users = getUsers();
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    showMessage(msg, 'Username already exists', 'error');
    return;
  }

  const newUser = {
    id: Date.now(),
    username,
    email,
    password,
    role: 'user',
    created: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  showMessage(msg, 'Account created! Redirecting to login...', 'success');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 1200);
}

function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const msg = document.getElementById('loginMessage');

  const users = getUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);

  // Built-in admin
  if (username === 'admin' && password === 'admin123') {
    const adminUser = { username: 'admin', role: 'admin', email: 'admin@mysite.com' };
    setCurrentUser(adminUser);
    showMessage(msg, 'Welcome Admin! Redirecting...', 'success');
    setTimeout(() => window.location.href = 'admin.html', 1000);
    return;
  }

  if (!user) {
    showMessage(msg, 'Invalid username or password', 'error');
    return;
  }

  setCurrentUser({ username: user.username, email: user.email, role: user.role });
  showMessage(msg, 'Login successful! Redirecting...', 'success');
  setTimeout(() => {
    window.location.href = user.role === 'admin' ? 'admin.html' : 'index.html';
  }, 1000);
}

function logout() {
  setCurrentUser(null);
  sessionStorage.removeItem('adminUnlocked');
  window.location.href = 'index.html';
}

// ========== Admin ==========
function checkAdminPassword(e) {
  e.preventDefault();
  const pass = document.getElementById('adminPass').value;
  const msg = document.getElementById('adminGateMessage');

  if (pass === 'admin123') {
    sessionStorage.setItem('adminUnlocked', 'true');
    showAdminPanel();
  } else {
    showMessage(msg, 'Wrong admin password', 'error');
  }
}

function showAdminPanel() {
  document.getElementById('adminGate').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'block';

  const current = getCurrentUser();
  document.getElementById('adminUserDisplay').textContent = current ? current.username : 'Admin';

  renderUsersTable();
}

function renderUsersTable() {
  const users = getUsers();
  const tbody = document.getElementById('usersBody');
  const noUsers = document.getElementById('noUsers');
  const totalUsers = document.getElementById('totalUsers');

  totalUsers.textContent = users.length;

  if (users.length === 0) {
    tbody.innerHTML = '';
    noUsers.style.display = 'block';
    return;
  }

  noUsers.style.display = 'none';
  tbody.innerHTML = users.map(u => `
    <tr>
      <td>${escapeHtml(u.username)}</td>
      <td>${escapeHtml(u.email)}</td>
      <td>${u.role}</td>
      <td><button class="btn btn-danger" onclick="deleteUser(${u.id})">Delete</button></td>
    </tr>
  `).join('');
}

function deleteUser(id) {
  if (!confirm('Delete this user?')) return;
  let users = getUsers();
  users = users.filter(u => u.id !== id);
  saveUsers(users);
  renderUsersTable();
}

function clearAllUsers() {
  if (!confirm('Delete ALL registered users? This cannot be undone.')) return;
  saveUsers([]);
  renderUsersTable();
}

// ========== UI helpers ==========
function showMessage(el, text, type) {
  el.textContent = text;
  el.className = 'message ' + type;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}

// ========== On every page load ==========
document.addEventListener('DOMContentLoaded', function() {
  const current = getCurrentUser();
  const loginLink = document.getElementById('loginLink');
  const registerLink = document.getElementById('registerLink');
  const adminLink = document.getElementById('adminLink');
  const logoutLink = document.getElementById('logoutLink');
  const heroButtons = document.getElementById('heroButtons');
  const welcomeUser = document.getElementById('welcomeUser');
  const currentUserEl = document.getElementById('currentUser');
  const goAdminBtn = document.getElementById('goAdminBtn');

  if (current) {
    if (loginLink) loginLink.style.display = 'none';
    if (registerLink) registerLink.style.display = 'none';
    if (logoutLink) logoutLink.style.display = 'block';
    if (adminLink) adminLink.style.display = 'block';

    if (heroButtons) heroButtons.style.display = 'none';
    if (welcomeUser) {
      welcomeUser.style.display = 'block';
      if (currentUserEl) currentUserEl.textContent = current.username;
      if (goAdminBtn && (current.role === 'admin' || sessionStorage.getItem('adminUnlocked'))) {
        goAdminBtn.style.display = 'inline-block';
      }
    }
  } else {
    if (logoutLink) logoutLink.style.display = 'none';
    if (adminLink) adminLink.style.display = 'none';
  }

  // Close mobile menu when clicking a link
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => {
      document.getElementById('navLinks').classList.remove('open');
    });
  });
});