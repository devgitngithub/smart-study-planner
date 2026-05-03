// ═══ AUTH SYSTEM — API-BACKED ═══
// Uses Flask backend API instead of localStorage

const API = 'http://localhost:5000/api';

const AUTH = {
  currentUser: null,

  async register(name, email, password, eduLevel, institution) {
    try {
      const res = await fetch(`${API}/register`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, eduLevel, institution })
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, msg: data.error || 'Registration failed' };
      this.currentUser = data.user;
      return { ok: true, user: data.user };
    } catch (e) { return { ok: false, msg: 'Server not reachable. Run: python server.py' }; }
  },

  async login(email, password) {
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, msg: data.error || 'Login failed' };
      this.currentUser = data.user;
      return { ok: true, user: data.user };
    } catch (e) { return { ok: false, msg: 'Server not reachable. Run: python server.py' }; }
  },

  async logout() {
    try { await fetch(`${API}/logout`, { method: 'POST', credentials: 'include' }); } catch (e) {}
    this.currentUser = null;
    location.reload();
  },

  async checkSession() {
    try {
      const res = await fetch(`${API}/me`, { credentials: 'include' });
      if (!res.ok) return null;
      const data = await res.json();
      this.currentUser = data.user;
      return data.user;
    } catch (e) { return null; }
  },

  getEduLabel(id) {
    const labels = { 'class5-8':'Class 5-8', 'class9-10':'Class 9-10', 'class11-12':'Class 11-12',
                     'ug':'Undergraduate', 'pg':'Postgraduate', 'phd':'PhD / Research' };
    return labels[id] || id;
  }
};

// ═══ DYNAMIC SUBJECTS CONFIGURATION ═══
const SUBJECT_CONFIG = {
  'class5-8': [
    { name: 'Mathematics', icon: '🧮', color: 'var(--gold)' },
    { name: 'Science', icon: '🧪', color: 'var(--teal)' },
    { name: 'English', icon: '📝', color: 'var(--green)' },
    { name: 'Social Studies', icon: '🌍', color: 'var(--red)' },
    { name: 'Computers', icon: '💻', color: 'var(--purple)' },
    { name: 'Art', icon: '🎨', color: '#60a5fa' }
  ],
  'class9-10': [
    { name: 'Mathematics', icon: '📐', color: 'var(--gold)' },
    { name: 'Physics', icon: '⚡', color: 'var(--teal)' },
    { name: 'Chemistry', icon: '🧪', color: 'var(--purple)' },
    { name: 'Biology', icon: '🌿', color: '#60a5fa' },
    { name: 'English', icon: '📝', color: 'var(--green)' },
    { name: 'History & Civics', icon: '🏛️', color: 'var(--red)' }
  ],
  'class11-12': [
    { name: 'Adv Mathematics', icon: '📐', color: 'var(--gold)' },
    { name: 'Physics', icon: '⚡', color: 'var(--teal)' },
    { name: 'Chemistry', icon: '🧪', color: 'var(--purple)' },
    { name: 'Computer Science', icon: '💻', color: '#60a5fa' },
    { name: 'Economics', icon: '📈', color: 'var(--green)' },
    { name: 'Biology', icon: '🧬', color: 'var(--red)' }
  ],
  'ug': [
    { name: 'Core Major 1', icon: '📚', color: 'var(--gold)' },
    { name: 'Core Major 2', icon: '📘', color: 'var(--teal)' },
    { name: 'Minor Subject', icon: '📗', color: 'var(--green)' },
    { name: 'Lab Work', icon: '🔬', color: 'var(--purple)' },
    { name: 'Electives', icon: '📝', color: '#60a5fa' },
    { name: 'Humanities', icon: '🗣️', color: 'var(--red)' }
  ],
  'pg': [
    { name: 'Advanced Core', icon: '📚', color: 'var(--gold)' },
    { name: 'Research Methods', icon: '📊', color: 'var(--teal)' },
    { name: 'Seminar', icon: '📝', color: 'var(--green)' },
    { name: 'Lab/Field Work', icon: '🔬', color: 'var(--purple)' },
    { name: 'Literature Review', icon: '📖', color: '#60a5fa' },
    { name: 'Thesis Prep', icon: '📑', color: 'var(--red)' }
  ],
  'phd': [
    { name: 'Dissertation', icon: '📑', color: 'var(--gold)' },
    { name: 'Literature Review', icon: '📖', color: 'var(--teal)' },
    { name: 'Lab Research', icon: '🔬', color: 'var(--purple)' },
    { name: 'Publications', icon: '✍️', color: 'var(--green)' },
    { name: 'Data Analysis', icon: '📊', color: '#60a5fa' },
    { name: 'Conferences', icon: '🗣️', color: 'var(--red)' }
  ]
};

// ═══ API HELPERS ═══
const api = {
  async get(path) {
    const res = await fetch(`${API}${path}`, { credentials: 'include' });
    return res.ok ? res.json() : [];
  },
  async post(path, body) {
    const res = await fetch(`${API}${path}`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
    return res.json();
  },
  async put(path, body) {
    const res = await fetch(`${API}${path}`, {
      method: 'PUT', credentials: 'include',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
    return res.json();
  },
  async del(path) {
    await fetch(`${API}${path}`, { method: 'DELETE', credentials: 'include' });
  }
};

// ═══ AUTH UI ═══
let selectedEdu = '';

function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
  document.getElementById('register-form').classList.toggle('hidden', tab !== 'register');
  hideAuthError();
}

function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  if (el) { el.textContent = '⚠️ ' + msg; el.classList.add('show'); }
}
function hideAuthError() {
  const el = document.getElementById('auth-error');
  if (el) el.classList.remove('show');
}

function selectEdu(id, el) {
  selectedEdu = id;
  document.querySelectorAll('.edu-option').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
}

async function handleLogin(e) {
  e.preventDefault();
  hideAuthError();
  const email = document.getElementById('login-email').value;
  const pass = document.getElementById('login-pass').value;
  const result = await AUTH.login(email, pass);
  if (!result.ok) { showAuthError(result.msg); return; }
  enterApp();
}

async function handleRegister(e) {
  e.preventDefault();
  hideAuthError();
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const pass = document.getElementById('reg-pass').value;
  const institution = document.getElementById('reg-institution').value;
  if (!selectedEdu) { showAuthError('Please select your education level'); return; }
  const result = await AUTH.register(name, email, pass, selectedEdu, institution);
  if (!result.ok) { showAuthError(result.msg); return; }
  enterApp();
}

async function enterApp() {
  const authScreen = document.getElementById('auth-screen');
  if (authScreen) {
    authScreen.classList.add('hide');
    setTimeout(() => authScreen.style.display = 'none', 500);
  }

  const user = AUTH.currentUser;
  if (user) {
    document.querySelectorAll('.avatar').forEach(a => { a.textContent = user.avatar; a.title = user.name; });
    const greet = document.getElementById('greet-text');
    if (greet) {
      const h = new Date().getHours();
      greet.textContent = (h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening') + ', ' + user.name.split(' ')[0] + '! ✨';
    }
    const pmName = document.getElementById('pm-name');
    const pmEmail = document.getElementById('pm-email');
    const pmLevel = document.getElementById('pm-level');
    if (pmName) pmName.textContent = user.name;
    if (pmEmail) pmEmail.textContent = user.email;
    if (pmLevel) pmLevel.textContent = AUTH.getEduLabel(user.eduLevel);
    
    renderDynamicSubjects(user.eduLevel);
  }

  await loadAllData();
}

let resources = [];

function renderDynamicSubjects(eduLevel) {
  const subjects = SUBJECT_CONFIG[eduLevel] || SUBJECT_CONFIG['ug'];
  
  // 1. Populate the "My Subjects" Grid
  const grid = document.getElementById('subjects-grid');
  if (grid) {
    grid.innerHTML = subjects.map(s => `
      <div class="subject-card" style="background:var(--bg3);border:1px solid rgba(255,255,255,0.05)">
        <div class="subj-icon">${s.icon}</div>
        <div class="subj-name" style="color:${s.color}">${s.name}</div>
        <div class="subj-hours" style="color:var(--text3)">0 hours studied</div>
        <div class="subj-prog-bar">
          <div class="subj-prog-fill" style="width:0%;background:${s.color}"></div>
        </div>
      </div>
    `).join('');
  }

  // 2. Populate Dropdowns (Tasks, Notes, Resources)
  const dropdownIds = ['task-subject', 'note-subject', 'res-subject'];
  dropdownIds.forEach(id => {
    const select = document.getElementById(id);
    if (select) {
      select.innerHTML = subjects.map(s => `<option value="${s.icon} ${s.name}">${s.icon} ${s.name}</option>`).join('') + '<option value="📌 Other">📌 Other</option>';
    }
  });

  // 3. Populate Dashboard Subject Progress
  const dashProg = document.getElementById('dash-subj-prog');
  if (dashProg) {
    dashProg.innerHTML = subjects.slice(0, 5).map(s => `
      <div class="prog-wrap">
        <div class="prog-label"><span>${s.name}</span><span>0%</span></div>
        <div class="prog-bar">
          <div class="prog-fill" style="width:0%;background:${s.color}"></div>
        </div>
      </div>
    `).join('');
  }

  // 4. Populate Analytics Subject Distribution
  const analyticsDist = document.getElementById('analytics-subj-dist');
  if (analyticsDist) {
    analyticsDist.innerHTML = subjects.slice(0, 4).map(s => `
      <div>
        <div class="prog-label"><span>${s.icon} ${s.name}</span><span style="color:${s.color}">0h — 0%</span></div>
        <div class="prog-bar" style="height:12px">
          <div class="prog-fill" style="width:0%;background:${s.color}"></div>
        </div>
      </div>
    `).join('');
  }
}

// ═══ LOAD ALL DATA FROM API ═══
async function loadAllData() {
  // Load tasks
  tasks = await api.get('/tasks');
  renderTasks(); updateStats();

  // Load stats
  const s = await api.get('/stats');
  focusSessions = s.focus_sessions || 0;
  studyHours = s.study_hours || 0;
  updateStats();

  // Load notes, goals, flashcards, resources
  notes = await api.get('/notes');
  goals = await api.get('/goals');
  const fc = await api.get('/flashcards');
  flashcards = fc.map(f => ({ id: f.id, q: f.question, a: f.answer }));
  resources = await api.get('/resources');

  renderNotes(); renderGoals(); renderFlashcard(); renderResources();
}

// ═══ OVERRIDE TASK FUNCTIONS FOR API ═══
const _origAddTask = window.addTask;
window.addTask = async function() {
  const input = document.getElementById('task-input');
  const name = input.value.trim();
  if (!name) { showToast('⚠️ Please enter a task name'); return; }
  const task = await api.post('/tasks', {
    name,
    subject: document.getElementById('task-subject').value,
    priority: document.getElementById('task-priority').value,
    due: document.getElementById('task-due').value
  });
  tasks.unshift(task);
  renderTasks(); updateStats();
  input.value = '';
  showToast('✅ Task added successfully!');
};

window.deleteTask = async function(id) {
  await api.del('/tasks/' + id);
  tasks = tasks.filter(t => t.id !== id);
  renderTasks(); updateStats();
  showToast('🗑️ Task deleted');
};

window.toggleTask = async function(id) {
  const t = tasks.find(t => t.id === id);
  if (t) {
    t.done = t.done ? 0 : 1;
    await api.put('/tasks/' + id, { done: t.done });
    renderTasks(); updateStats();
  }
};

window.saveTasks = function() { /* no-op — tasks saved via API now */ };

// ═══ OVERRIDE NOTE FUNCTIONS FOR API ═══
window.addNote = async function() {
  const t = document.getElementById('note-title'), b = document.getElementById('note-body'), s = document.getElementById('note-subject');
  if (!t || !b) return;
  const title = t.value.trim(), body = b.value.trim();
  if (!title && !body) { showToast('⚠️ Please enter note content'); return; }
  const note = await api.post('/notes', { title: title || 'Untitled', body, subject: s ? s.value : '📌 General' });
  note.date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  notes.unshift(note);
  t.value = ''; b.value = '';
  renderNotes(); showToast('📝 Note saved!');
};

window.deleteNote = async function(id) {
  await api.del('/notes/' + id);
  notes = notes.filter(n => n.id !== id);
  renderNotes(); showToast('🗑️ Note deleted');
};

// ═══ OVERRIDE GOAL FUNCTIONS FOR API ═══
window.addGoal = async function() {
  const t = document.getElementById('goal-title'), tgt = document.getElementById('goal-target');
  if (!t) return;
  const title = t.value.trim();
  if (!title) { showToast('⚠️ Enter a goal name'); return; }
  const goal = await api.post('/goals', { title, target: parseInt(tgt?.value || 10) });
  goals.push(goal);
  t.value = '';
  renderGoals(); showToast('🎯 Goal added!');
};

window.incrementGoal = async function(id) {
  const g = goals.find(g => g.id === id);
  if (g && g.current < g.target) {
    g.current++;
    await api.put('/goals/' + id, { current: g.current });
    renderGoals();
    if (g.current >= g.target) { showToast('🎉 Goal completed!'); fireConfetti(); }
  }
};

window.deleteGoal = async function(id) {
  await api.del('/goals/' + id);
  goals = goals.filter(g => g.id !== id);
  renderGoals(); showToast('🗑️ Goal removed');
};

// ═══ OVERRIDE FLASHCARD FUNCTIONS FOR API ═══
window.addFlashcard = async function() {
  const q = document.getElementById('fc-q'), a = document.getElementById('fc-a');
  if (!q || !a) return;
  if (!q.value.trim() || !a.value.trim()) { showToast('⚠️ Fill both sides'); return; }
  const fc = await api.post('/flashcards', { question: q.value.trim(), answer: a.value.trim() });
  flashcards.push({ id: fc.id, q: fc.question, a: fc.answer });
  q.value = ''; a.value = '';
  renderFlashcard(); showToast('🃏 Flashcard added!');
};

// ═══ RESOURCES FUNCTIONS FOR API ═══
window.addResource = async function() {
  const title = document.getElementById('res-title').value.trim();
  const url = document.getElementById('res-url').value.trim();
  const type = document.getElementById('res-type').value;
  const subject = document.getElementById('res-subject').value.trim();
  
  if (!title || !url) { showToast('⚠️ Enter title and URL'); return; }
  if (!url.startsWith('http')) { showToast('⚠️ URL must start with http:// or https://'); return; }
  
  const res = await api.post('/resources', { title, url, type, subject });
  resources.unshift(res);
  
  document.getElementById('res-title').value = '';
  document.getElementById('res-url').value = '';
  renderResources();
  showToast('📚 Resource added!');
};

window.deleteResource = async function(id) {
  await api.del('/resources/' + id);
  resources = resources.filter(r => r.id !== id);
  renderResources();
  showToast('🗑️ Resource deleted');
};

window.renderResources = function() {
  const grid = document.getElementById('resources-grid');
  if (!grid) return;
  if (!resources.length) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">📚</div><p>No study resources yet. Add some links or PDFs!</p></div>';
    return;
  }
  
  const icons = { 'Link': '🌐', 'PDF': '📄', 'Video': '🎥', 'Book': '📚' };
  
  grid.innerHTML = resources.map(r => `
    <div class="res-card">
      <button class="res-delete" onclick="deleteResource(${r.id})">✕</button>
      <div class="res-header">
        <div class="res-icon">${icons[r.type] || '🌐'}</div>
        <div class="res-info">
          <div class="res-title">${r.title}</div>
          ${r.subject ? `<div class="res-subject">${r.subject}</div>` : ''}
        </div>
      </div>
      <div class="res-actions">
        <a href="${r.url}" target="_blank" class="res-btn open">Open ${r.type} ↗</a>
      </div>
    </div>
  `).join('');
};

// ═══ OVERRIDE STATS SAVE ═══
window.saveStatsToAPI = async function() {
  await api.put('/stats', { focus_sessions: focusSessions, study_hours: studyHours, streak: 7 });
};

// Patch the pomodoro completion to save stats to API
const _origToggleTimer = window.toggleTimer;
if (_origToggleTimer) {
  // We'll patch the stats save in the timer completion callback
  // The original logSession already updates focusSessions and studyHours
  // We just need to persist them to the API after each session
  const _patchInterval = setInterval(() => {
    if (typeof logSession === 'function') {
      const _origLogSession = logSession;
      window.logSession = function() {
        _origLogSession();
        saveStatsToAPI();
      };
      clearInterval(_patchInterval);
    }
  }, 200);
}

// ═══ PROFILE DROPDOWN ═══
function toggleProfileMenu() {
  const menu = document.getElementById('profile-menu');
  if (menu) menu.classList.toggle('show');
}

document.addEventListener('click', (e) => {
  const menu = document.getElementById('profile-menu');
  const dropdown = document.querySelector('.profile-dropdown');
  if (menu && dropdown && !dropdown.contains(e.target)) menu.classList.remove('show');
});

// ═══ INIT AUTH ═══
document.addEventListener('DOMContentLoaded', async () => {
  const user = await AUTH.checkSession();
  if (user) {
    enterApp();
  } else {
    const authScreen = document.getElementById('auth-screen');
    if (authScreen) authScreen.style.display = 'flex';
  }
});
