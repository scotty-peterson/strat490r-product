// ─────────────────────────────────────────────
// The Dead Evening — app.js
// Replace the two placeholders below with your
// Supabase project URL and anon key.
// ─────────────────────────────────────────────

const SUPABASE_URL = 'https://xnxpsictdivuqkzssyfp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhueHBzaWN0ZGl2dXFrenNzeWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NzM5MTUsImV4cCI6MjA4ODE0OTkxNX0.dewwsfY0QrxVJA5AhhLEBt7ca36Iozh_JZx647Jn_Rk';

// ─── State ───────────────────────────────────
let supabase;
let currentUser    = null;
let allActivities  = [];
let savedIds       = new Set();
let currentView    = 'browse';
let filters        = { energy: 'all', time: 'all' };

// ─── Boot ────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // React to sign-in / sign-out
  supabase.auth.onAuthStateChange(async (_event, session) => {
    currentUser = session?.user ?? null;
    updateAuthUI();
    if (currentUser) {
      await loadSavedIds();
    } else {
      savedIds.clear();
    }
    renderCurrentView();
  });

  // Restore existing session on page load
  const { data: { session } } = await supabase.auth.getSession();
  currentUser = session?.user ?? null;
  updateAuthUI();

  // Load activity data
  await loadActivities();
  if (currentUser) await loadSavedIds();

  renderActivities();

  // Close modal on overlay click
  document.getElementById('auth-modal').addEventListener('click', e => {
    if (e.target.id === 'auth-modal') closeAuthModal();
  });
});

// ─── Auth ─────────────────────────────────────
async function signIn() {
  const email    = document.getElementById('signin-email').value.trim();
  const password = document.getElementById('signin-password').value;
  const errorEl  = document.getElementById('signin-error');
  errorEl.classList.add('hidden');

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    errorEl.textContent = error.message;
    errorEl.classList.remove('hidden');
    return;
  }
  closeAuthModal();
}

async function signUp() {
  const email     = document.getElementById('signup-email').value.trim();
  const password  = document.getElementById('signup-password').value;
  const errorEl   = document.getElementById('signup-error');
  const successEl = document.getElementById('signup-success');
  errorEl.classList.add('hidden');
  successEl.classList.add('hidden');

  const { error } = await supabase.auth.signUp({ email, password });
  if (error) {
    errorEl.textContent = error.message;
    errorEl.classList.remove('hidden');
    return;
  }
  successEl.classList.remove('hidden');
}

async function signOut() {
  await supabase.auth.signOut();
}

function updateAuthUI() {
  const out     = document.getElementById('auth-signed-out');
  const inEl    = document.getElementById('auth-signed-in');
  const emailEl = document.getElementById('user-email');
  if (currentUser) {
    out.classList.add('hidden');
    inEl.classList.remove('hidden');
    emailEl.textContent = currentUser.email;
  } else {
    out.classList.remove('hidden');
    inEl.classList.add('hidden');
  }
}

// ─── Auth Modal ───────────────────────────────
function openAuthModal()  { document.getElementById('auth-modal').classList.remove('hidden'); }
function closeAuthModal() { document.getElementById('auth-modal').classList.add('hidden'); }

function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`.auth-tab[data-tab="${tab}"]`).classList.add('active');
  document.getElementById('signin-form').classList.toggle('hidden', tab !== 'signin');
  document.getElementById('signup-form').classList.toggle('hidden', tab !== 'signup');
}

// ─── Data ─────────────────────────────────────
async function loadActivities() {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error loading activities:', error);
    document.getElementById('activities-grid').innerHTML =
      '<p class="loading">Could not load activities. Check your Supabase connection.</p>';
    return;
  }
  allActivities = data || [];
}

async function loadSavedIds() {
  if (!currentUser) return;
  const { data, error } = await supabase
    .from('saved_activities')
    .select('activity_id')
    .eq('user_id', currentUser.id);

  if (error) { console.error('Error loading saved:', error); return; }
  savedIds = new Set((data || []).map(r => r.activity_id));
}

// ─── Save / Unsave ────────────────────────────
async function toggleSave(activityId) {
  if (!currentUser) { openAuthModal(); return; }

  if (savedIds.has(activityId)) {
    const { error } = await supabase
      .from('saved_activities')
      .delete()
      .eq('user_id', currentUser.id)
      .eq('activity_id', activityId);
    if (error) { console.error('Error unsaving:', error); return; }
    savedIds.delete(activityId);
  } else {
    const { error } = await supabase
      .from('saved_activities')
      .insert({ user_id: currentUser.id, activity_id: activityId });
    if (error) { console.error('Error saving:', error); return; }
    savedIds.add(activityId);
  }
  renderCurrentView();
}

// ─── Filtering ────────────────────────────────
function setFilter(type, value, btn) {
  filters[type] = value;
  document.querySelectorAll(`.pill[data-filter="${type}"]`).forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  renderActivities();
}

function getFiltered() {
  return allActivities.filter(a => {
    if (filters.energy !== 'all' && a.energy_level !== filters.energy) return false;
    if (filters.time !== 'all') {
      const m = a.duration_minutes;
      if (filters.time === 'quick' && m > 30)           return false;
      if (filters.time === 'hour'  && (m <= 30 || m > 90)) return false;
      if (filters.time === 'long'  && m <= 90)           return false;
    }
    return true;
  });
}

// ─── Views ────────────────────────────────────
function switchView(view) {
  currentView = view;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.nav-btn[data-view="${view}"]`).classList.add('active');
  document.getElementById('browse-view').classList.toggle('hidden', view !== 'browse');
  document.getElementById('saved-view').classList.toggle('hidden', view !== 'saved');
  renderCurrentView();
}

function renderCurrentView() {
  if (currentView === 'browse') renderActivities();
  else renderSaved();
}

function renderActivities() {
  const grid     = document.getElementById('activities-grid');
  const filtered = getFiltered();

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🌙</span>
        <p>Nothing matches those filters.<br>Try loosening them up.</p>
      </div>`;
    return;
  }
  grid.innerHTML = filtered.map(activityCard).join('');
}

function renderSaved() {
  const container = document.getElementById('saved-content');

  if (!currentUser) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🔒</span>
        <p>Sign in to save activities<br>and build your list.</p>
        <button class="btn-primary inline" onclick="openAuthModal()">Sign in</button>
      </div>`;
    return;
  }

  const saved = allActivities.filter(a => savedIds.has(a.id));

  if (saved.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">♡</span>
        <p>No saved activities yet.<br>Browse and tap ♡ to save your favorites.</p>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="saved-header">
      <h2>Your saved evenings</h2>
      <p>${saved.length} idea${saved.length !== 1 ? 's' : ''} saved</p>
    </div>
    <div class="activities-grid">
      ${saved.map(activityCard).join('')}
    </div>`;
}

// ─── Card Template ────────────────────────────
function activityCard(a) {
  const isSaved = savedIds.has(a.id);
  const dur = a.duration_minutes < 60
    ? `${a.duration_minutes}m`
    : `${Math.floor(a.duration_minutes / 60)}h${a.duration_minutes % 60 ? (a.duration_minutes % 60) + 'm' : ''}`;

  return `
    <div class="activity-card">
      <div class="card-top">
        <div class="card-name">${esc(a.name)}</div>
        <button class="save-btn ${isSaved ? 'saved' : ''}"
                onclick="toggleSave('${a.id}')"
                title="${isSaved ? 'Remove from saved' : 'Save this'}">
          ${isSaved ? '♥' : '♡'}
        </button>
      </div>
      <p class="card-desc">${esc(a.description)}</p>
      <div class="card-meta">
        <span class="badge badge-energy-${a.energy_level}">
          ${a.energy_level.charAt(0).toUpperCase() + a.energy_level.slice(1)}
        </span>
        <span class="badge badge-time">${dur}</span>
        <span class="badge badge-cost">${a.cost_tier}</span>
      </div>
    </div>`;
}

// ─── Utility ──────────────────────────────────
function esc(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}
