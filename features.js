// ═══ NOTES SYSTEM ═══
let notes = JSON.parse(localStorage.getItem('sf_notes') || '[]');
function addNote() {
  const t = document.getElementById('note-title'), b = document.getElementById('note-body'), s = document.getElementById('note-subject');
  if (!t || !b) return; const title = t.value.trim(), body = b.value.trim();
  if (!title && !body) { showToast('⚠️ Please enter note content'); return }
  notes.unshift({ id: Date.now(), title: title || 'Untitled', body, subject: s ? s.value : '📌 General', date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) });
  localStorage.setItem('sf_notes', JSON.stringify(notes)); t.value = ''; b.value = ''; renderNotes(); showToast('📝 Note saved!');
}
function deleteNote(id) { notes = notes.filter(n => n.id !== id); localStorage.setItem('sf_notes', JSON.stringify(notes)); renderNotes(); showToast('🗑️ Note deleted') }
function renderNotes() {
  const g = document.getElementById('notes-grid'); if (!g) return;
  if (!notes.length) { g.innerHTML = '<div class="empty-state"><div class="empty-icon">📝</div><p>No notes yet. Start writing!</p></div>'; return }
  g.innerHTML = notes.map(n => `<div class="note-card"><button class="note-del" onclick="deleteNote(${n.id})">✕</button><div class="note-card-title">${escHtml(n.title)}</div><div class="note-card-body">${escHtml(n.body).replace(/\n/g, '<br>')}</div><div class="note-card-footer"><span class="note-tag" style="background:rgba(167,139,250,.15);color:var(--purple);border:1px solid rgba(167,139,250,.2)">${escHtml(n.subject)}</span><span class="note-date">${n.date}</span></div></div>`).join('');
}

// ═══ GOALS SYSTEM ═══
let goals = JSON.parse(localStorage.getItem('sf_goals') || '[]');
const CIRC_GOAL = 2 * Math.PI * 42;
function addGoal() {
  const t = document.getElementById('goal-title'), tgt = document.getElementById('goal-target');
  if (!t) return; const title = t.value.trim(); if (!title) { showToast('⚠️ Enter a goal name'); return }
  goals.push({ id: Date.now(), title, target: parseInt(tgt?.value || 10), current: 0, color: ['var(--gold)', 'var(--teal)', 'var(--purple)', 'var(--green)', 'var(--red)'][goals.length % 5] });
  localStorage.setItem('sf_goals', JSON.stringify(goals)); t.value = ''; renderGoals(); showToast('🎯 Goal added!');
}
function incrementGoal(id) { const g = goals.find(g => g.id === id); if (g && g.current < g.target) { g.current++; localStorage.setItem('sf_goals', JSON.stringify(goals)); renderGoals(); if (g.current >= g.target) { showToast('🎉 Goal completed!'); fireConfetti() } } }
function deleteGoal(id) { goals = goals.filter(g => g.id !== id); localStorage.setItem('sf_goals', JSON.stringify(goals)); renderGoals(); showToast('🗑️ Goal removed') }
function renderGoals() {
  const c = document.getElementById('goals-grid'); if (!c) return;
  if (!goals.length) { c.innerHTML = '<div class="empty-state"><div class="empty-icon">🎯</div><p>Set your first goal!</p></div>'; return }
  c.innerHTML = goals.map(g => {
    const pct = g.target > 0 ? Math.min(g.current / g.target, 1) : 0; const offset = CIRC_GOAL * (1 - pct);
    return `<div class="goal-card"><div class="goal-ring"><svg viewBox="0 0 100 100"><circle class="gr-bg" cx="50" cy="50" r="42" stroke="var(--bg3)"/><circle class="gr-fg" cx="50" cy="50" r="42" stroke="${g.color}" stroke-dasharray="${CIRC_GOAL}" stroke-dashoffset="${offset}"/></svg><div class="goal-ring-val">${Math.round(pct * 100)}%</div></div><div class="goal-title">${escHtml(g.title)}</div><div class="goal-sub">${g.current} / ${g.target}</div><div class="goal-actions"><button class="goal-btn" onclick="incrementGoal(${g.id})">+1 Progress</button><button class="goal-del" onclick="deleteGoal(${g.id})">✕</button></div></div>`
  }).join('');
}

// ═══ FLASHCARDS ═══
let flashcards = JSON.parse(localStorage.getItem('sf_flash') || '[{"q":"What is the derivative of x²?","a":"2x"},{"q":"Newton s Second Law?","a":"F = ma"},{"q":"What is photosynthesis?","a":"Process by which plants convert light energy into chemical energy"},{"q":"Quadratic Formula?","a":"x = (-b ± √(b²-4ac)) / 2a"}]');
let fcIndex = 0, fcFlipped = false;
function renderFlashcard() {
  const card = document.getElementById('flashcard'); const counter = document.getElementById('fc-counter');
  if (!card || !flashcards.length) return; card.classList.remove('flipped'); fcFlipped = false;
  document.getElementById('fc-front-text').textContent = flashcards[fcIndex].q;
  document.getElementById('fc-back-text').textContent = flashcards[fcIndex].a;
  if (counter) counter.textContent = (fcIndex + 1) + ' / ' + flashcards.length;
}
function flipCard() { const c = document.getElementById('flashcard'); if (c) { c.classList.toggle('flipped'); fcFlipped = !fcFlipped } }
function nextCard() { fcIndex = (fcIndex + 1) % flashcards.length; renderFlashcard() }
function prevCard() { fcIndex = (fcIndex - 1 + flashcards.length) % flashcards.length; renderFlashcard() }
function addFlashcard() {
  const q = document.getElementById('fc-q'), a = document.getElementById('fc-a');
  if (!q || !a) return; if (!q.value.trim() || !a.value.trim()) { showToast('⚠️ Fill both sides'); return }
  flashcards.push({ q: q.value.trim(), a: a.value.trim() }); localStorage.setItem('sf_flash', JSON.stringify(flashcards));
  q.value = ''; a.value = ''; renderFlashcard(); showToast('🃏 Flashcard added!');
}

// ═══ COMMAND PALETTE ═══
const CMD_ITEMS = [
  { icon: '🏠', label: 'Dashboard', action: () => showView('dashboard', document.querySelectorAll('.nav-item')[0]) },
  { icon: '✅', label: 'Task Planner', action: () => showView('tasks', document.querySelectorAll('.nav-item')[1]) },
  { icon: '📅', label: 'Schedule', action: () => showView('schedule', document.querySelectorAll('.nav-item')[2]) },
  { icon: '⏱️', label: 'Pomodoro Timer', action: () => showView('pomodoro', document.querySelectorAll('.nav-item')[3]) },
  { icon: '📖', label: 'Subjects', action: () => showView('subjects', document.querySelectorAll('.nav-item')[4]) },
  { icon: '📊', label: 'Analytics', action: () => showView('analytics', document.querySelectorAll('.nav-item')[5]) },
  { icon: '📝', label: 'Notes', action: () => showView('notes', document.querySelectorAll('.nav-item')[6]) },
  { icon: '🎯', label: 'Goals', action: () => showView('goals', document.querySelectorAll('.nav-item')[7]) },
  { icon: '🃏', label: 'Flashcards', action: () => showView('flashcards', document.querySelectorAll('.nav-item')[8]) },
  { icon: '🎵', label: 'Toggle Ambient Music', action: () => { toggleAmbient(); closeCmdPalette() } },
  { icon: '📤', label: 'Export Data', action: () => { exportData(); closeCmdPalette() } },
  { icon: '🗑️', label: 'Clear All Tasks', action: () => { if (confirm('Delete all tasks?')) { tasks = []; saveTasks(); renderTasks(); updateStats(); showToast('🗑️ All tasks cleared') } closeCmdPalette() } },
];
function openCmdPalette() { const o = document.getElementById('cmd-overlay'); if (o) { o.classList.add('open'); document.getElementById('cmd-search').value = ''; filterCmds(''); document.getElementById('cmd-search').focus() } }
function closeCmdPalette() { const o = document.getElementById('cmd-overlay'); if (o) o.classList.remove('open') }
function filterCmds(q) {
  const r = document.getElementById('cmd-results'); if (!r) return;
  const f = CMD_ITEMS.filter(c => c.label.toLowerCase().includes(q.toLowerCase()));
  r.innerHTML = f.map((c, i) => `<div class="cmd-item${i === 0 ? ' selected' : ''}" onclick="CMD_ITEMS.find(x=>x.label==='${c.label}').action();closeCmdPalette()"><span class="ci-icon">${c.icon}</span><span class="ci-label">${c.label}</span></div>`).join('') || '<div style="padding:20px;text-align:center;color:var(--text3)">No results</div>';
}
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); const o = document.getElementById('cmd-overlay'); o && o.classList.contains('open') ? closeCmdPalette() : openCmdPalette() }
  if (e.key === 'Escape') closeCmdPalette();
});

// ═══ CONFETTI ═══
function fireConfetti() {
  const colors = ['#e8b84b', '#2dd4bf', '#a78bfa', '#4ade80', '#f87171', '#f5d07a'];
  for (let i = 0; i < 40; i++) {
    const c = document.createElement('div'); c.className = 'confetti-piece';
    c.style.cssText = `left:${Math.random() * 100}vw;top:-10px;background:${colors[i % colors.length]};border-radius:${Math.random() > .5 ? '50%' : '2px'};width:${Math.random() * 8 + 5}px;height:${Math.random() * 8 + 5}px;animation-duration:${Math.random() * 2 + 1.5}s;animation-delay:${Math.random() * .5}s`;
    document.body.appendChild(c); setTimeout(() => c.remove(), 4000)
  }
}

// ═══ AMBIENT SOUNDS ═══
let ambientActive = false;
let currentAudio = null;
let currentSoundId = null;

const AMBIENT_URLS = {
  rain: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Rain_against_the_window.ogg',
  waves: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Oceanwavescrushing.ogg',
  fire: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Dry_grass_burning_in_open_fireplace.ogg',
  forest: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Forest_birds.ogg',
  cafe: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Nl-restaurant-2.oga'
};

function toggleAmbient() {
  const bar = document.getElementById('ambient-bar');
  const main = document.querySelector('.main');
  if (!bar) return;
  ambientActive = !ambientActive;
  bar.classList.toggle('show', ambientActive);
  if (main) main.classList.toggle('amb-active', ambientActive);

  if (!ambientActive && currentAudio) {
    currentAudio.pause();
    document.querySelectorAll('.amb-btn').forEach(b => b.classList.remove('active'));
    currentSoundId = null;
  }
}

function playAmbient(soundId, btnElement) {
  if (currentSoundId === soundId && currentAudio && !currentAudio.paused) {
    // If clicking the same active button, pause it
    currentAudio.pause();
    btnElement.classList.remove('active');
    currentSoundId = null;
    return;
  }

  if (currentAudio) {
    currentAudio.pause();
  }

  document.querySelectorAll('.amb-btn').forEach(b => b.classList.remove('active'));
  btnElement.classList.add('active');

  currentAudio = new Audio(AMBIENT_URLS[soundId]);
  currentAudio.loop = true;
  const volSlider = document.getElementById('amb-vol-slider');
  currentAudio.volume = volSlider ? volSlider.value / 100 : 0.6;

  currentAudio.play().catch(e => {
    console.error("Audio playback failed:", e);
    showToast("⚠️ Could not play audio. Please check your connection.");
  });

  currentSoundId = soundId;
}

function changeAmbientVolume(val) {
  if (currentAudio) {
    currentAudio.volume = val / 100;
  }
}

// ═══ EXPORT DATA ═══
function exportData() {
  const data = { tasks, notes, goals, flashcards, sessions: focusSessions, hours: studyHours, exported: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'studyflow-backup-' + new Date().toISOString().split('T')[0] + '.json'; a.click();
  showToast('📤 Data exported!');
}

// ═══ ANIMATED COUNTERS ═══
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count); let current = 0; const step = Math.max(1, Math.floor(target / 30));
    const interval = setInterval(() => { current += step; if (current >= target) { current = target; clearInterval(interval) } el.textContent = current }, 30);
  });
}

// ═══ SPLASH SCREEN (handled inline in HTML) ═══

// ═══ INIT NEW FEATURES ═══
// DOM is already ready by the time this external script loads
renderNotes(); renderGoals(); renderFlashcard();

// Update VIEW_TITLES for new views
if (typeof VIEW_TITLES !== 'undefined') {
  VIEW_TITLES.notes = 'Notes <span>— Quick Capture</span>';
  VIEW_TITLES.goals = 'Goals <span>— Track Progress</span>';
  VIEW_TITLES.flashcards = 'Flashcards <span>— Study Mode</span>';
}

// ═══ THEME TOGGLE ═══
let currentTheme = localStorage.getItem('sf_theme') || 'dark';
document.documentElement.setAttribute('data-theme', currentTheme);

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('theme-btn');
  if (btn) btn.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
});

function toggleAppTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  localStorage.setItem('sf_theme', currentTheme);

  const btn = document.getElementById('theme-btn');
  if (btn) btn.textContent = currentTheme === 'dark' ? '☀️' : '🌙';

  if (typeof window.updateParticlesTheme === 'function') {
    window.updateParticlesTheme(currentTheme);
  }
}
