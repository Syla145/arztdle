/* ================================================
   profil.js – Globales Profil-Modal
   Einbinden in jede Seite:
     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
     <script src="profil.js"></script>
   ================================================ */

const PROFIL_SUPABASE_URL  = 'https://tyxbabxjjrcqarqxmgoc.supabase.co';
const PROFIL_SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5eGJhYnhqanJjcWFycXhtZ29jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNTcyODQsImV4cCI6MjA4OTgzMzI4NH0.4Tz5zSIClabWP6Q3RbhuRmdxvENAEV1mI3mZYczjOSw';

// Supabase Client (nutzt bestehenden falls schon initialisiert)
const _sb = (typeof sb !== 'undefined') ? sb : supabase.createClient(PROFIL_SUPABASE_URL, PROFIL_SUPABASE_KEY);

let _profilUser = null;
let _profilSignUp = false;

// ── CSS ──────────────────────────────────────────
const _style = document.createElement('style');
_style.textContent = `
  #profil-btn {
    background: none;
    border: none;
    font-size: 1.4rem;
    cursor: pointer;
    line-height: 1;
    padding: 0 4px;
    transition: transform 0.2s;
    position: absolute;
    right: 56px;
    top: 50%;
    transform: translateY(-50%);
  }
  #profil-btn:hover { transform: translateY(-50%) scale(1.15); }
  @media (max-width: 600px) {
    #profil-btn {
      position: static !important;
      transform: none !important;
      order: 99;
    }
  }

  #profil-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.45);
    z-index: 9999;
    align-items: center;
    justify-content: center;
  }
  #profil-overlay.visible { display: flex; }

  #profil-modal {
    background: #fff;
    border-radius: 18px;
    padding: 2rem;
    width: 100%;
    max-width: 380px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    position: relative;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #2c3e50;
    max-height: 90vh;
    overflow-y: auto;
  }

  body.dark #profil-modal {
    background: #252b3b;
    color: #e8eaf0;
  }

  #profil-modal h3 {
    font-size: 1.2rem;
    margin-bottom: 1.2rem;
    font-weight: 700;
  }

  #profil-modal input {
    width: 100%;
    padding: 11px 13px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 0.95rem;
    margin-bottom: 10px;
    outline: none;
    font-family: inherit;
    background: #fff;
    color: #2c3e50;
    transition: border 0.2s;
    box-sizing: border-box;
  }

  body.dark #profil-modal input {
    background: #1a1f2e;
    color: #e8eaf0;
    border-color: #444;
  }

  #profil-modal input:focus { border-color: #2a9d8f; }

  #profil-modal .btn-primary {
    width: 100%;
    background: #2a9d8f;
    color: #fff;
    border: none;
    padding: 12px;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    transition: opacity 0.2s;
    margin-top: 2px;
  }
  #profil-modal .btn-primary:hover { opacity: 0.88; }

  #profil-modal .btn-secondary {
    width: 100%;
    background: none;
    border: 1.5px solid #ddd;
    padding: 10px;
    border-radius: 8px;
    font-size: 0.88rem;
    cursor: pointer;
    font-family: inherit;
    color: #888;
    margin-top: 8px;
    transition: border-color 0.2s, color 0.2s;
  }
  #profil-modal .btn-secondary:hover { border-color: #c0392b; color: #c0392b; }

  #profil-modal .switch-link {
    text-align: center;
    margin-top: 12px;
    font-size: 0.83rem;
    color: #888;
    cursor: pointer;
    text-decoration: underline;
  }
  #profil-modal .switch-link:hover { color: #2a9d8f; }

  #profil-modal .close-btn {
    position: absolute;
    top: 14px; right: 16px;
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: #aaa;
  }

  /* Stats Grid */
  #profil-modal .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin: 1rem 0;
  }

  #profil-modal .stat-card {
    background: #f0f7ff;
    border-radius: 10px;
    padding: 12px;
    text-align: center;
  }

  body.dark #profil-modal .stat-card { background: #1a1f2e; }

  #profil-modal .stat-card .num {
    font-size: 1.6rem;
    font-weight: 800;
    color: #2a9d8f;
  }

  #profil-modal .stat-card .lbl {
    font-size: 0.75rem;
    color: #aaa;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-top: 2px;
  }

  /* Leaderboard */
  #profil-modal .lb-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
    margin-top: 0.5rem;
  }

  #profil-modal .lb-table th {
    padding: 6px 8px;
    text-align: left;
    color: #aaa;
    font-weight: 600;
    border-bottom: 1.5px solid #eee;
    font-size: 0.78rem;
  }

  #profil-modal .lb-table td {
    padding: 7px 8px;
    border-bottom: 1px solid #f0f0f0;
  }

  #profil-modal .lb-table tr.me td {
    background: #f0f7ff;
    font-weight: 700;
  }

  body.dark #profil-modal .lb-table tr.me td { background: #1a1f2e; }

  #profil-modal .section-title {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #aaa;
    margin: 1.2rem 0 0.5rem;
  }

  #profil-modal .username-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #e8f4f2;
    color: #2a9d8f;
    font-weight: 700;
    padding: 5px 14px;
    border-radius: 999px;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
`;
document.head.appendChild(_style);

// ── HTML ─────────────────────────────────────────
const _overlay = document.createElement('div');
_overlay.id = 'profil-overlay';
_overlay.innerHTML = `
  <div id="profil-modal">
    <button class="close-btn" onclick="profilClose()">✕</button>
    <div id="profil-content"></div>
  </div>
`;
_overlay.addEventListener('click', e => { if (e.target === _overlay) profilClose(); });
document.body.appendChild(_overlay);

// ── Profil-Button in Nav einfügen ─────────────────
function _insertProfilBtn() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  if (document.getElementById('profil-btn')) return; // schon drin

  const btn = document.createElement('button');
  btn.id = 'profil-btn';
  btn.title = 'Profil';
  btn.onclick = profilOpen;
  btn.textContent = '👤';
  nav.appendChild(btn);
}

// ── Modal rendern ─────────────────────────────────
function _renderContent() {
  const c = document.getElementById('profil-content');
  if (!_profilUser) {
    _renderLogin(c);
  } else {
    _renderProfil(c);
  }
}

function _renderLogin(c) {
  c.innerHTML = `
    <h3 id="profil-auth-title">Anmelden</h3>
    <input type="text" id="profil-username" placeholder="Anzeigename" autocomplete="off" style="display:none">
    <input type="email" id="profil-email" placeholder="E-Mail" autocomplete="email">
    <input type="password" id="profil-pw" placeholder="Passwort (min. 6 Zeichen)" autocomplete="current-password">
    <button class="btn-primary" onclick="_profilHandleAuth()">Weiter</button>
    <div class="switch-link" id="profil-switch" onclick="_profilToggleMode()">Noch kein Konto? Hier registrieren</div>
  `;
  _profilSignUp = false;
}

async function _renderProfil(c) {
  const name   = localStorage.getItem('leaderboardName') || '–';
  const total  = parseInt(localStorage.getItem('statTotal')  || '0');
  const solved = parseInt(localStorage.getItem('statSolved') || '0');
  const hints  = parseInt(localStorage.getItem('statHints')  || '0');
  const streak = parseInt(localStorage.getItem('streak')     || '0');
  const avg    = solved > 0 ? (hints / solved).toFixed(1) : '–';

  c.innerHTML = `
    <div class="username-badge">👤 ${name}</div>

    <div class="section-title">Deine Statistiken</div>
    <div class="stats-grid">
      <div class="stat-card"><div class="num">${total}</div><div class="lbl">Gespielt</div></div>
      <div class="stat-card"><div class="num">${solved}</div><div class="lbl">Gelöst</div></div>
      <div class="stat-card"><div class="num">${streak} 🔥</div><div class="lbl">Streak</div></div>
      <div class="stat-card"><div class="num">${avg}</div><div class="lbl">Ø Hinweise</div></div>
    </div>

    <div class="section-title">Bestenliste</div>
    <p style="font-size:0.85rem;color:#aaa;text-align:center;padding:10px 0;">🔧 Wird gerade überarbeitet – bald wieder verfügbar!</p>

    <button class="btn-secondary" onclick="_profilLogout()">Abmelden</button>
  `;

  _loadLeaderboard();
}

async function _loadLeaderboard() {
  const el = document.getElementById('profil-lb');
  if (!el) return;
  try {
    const { data, error } = await _sb
      .from('leaderboard')
      .select('*')
      .order('solved', { ascending: false })
      .order('avg_hints', { ascending: true })
      .limit(10);

    if (error) {
      el.innerHTML = '<p style="color:#aaa;font-size:0.85rem">Das Leaderboard ist zurzeit nicht verfügbar.</p>';
      return;
    }
    if (!data || data.length === 0) {
      el.innerHTML = '<p style="color:#aaa;font-size:0.85rem">Noch keine Einträge.</p>';
      return;
    }

    const myId = _profilUser ? _profilUser.id : null;
    let html = `<table class="lb-table">
      <thead><tr>
        <th>#</th><th>Name</th><th>Gelöst</th><th>Ø Hints</th><th>🔥</th>
      </tr></thead><tbody>`;

    data.forEach((row, i) => {
      const isMe = row.user_id === myId;
      html += `<tr class="${isMe ? 'me' : ''}">
        <td>${i + 1}</td>
        <td>${row.name}${isMe ? ' ⭐' : ''}</td>
        <td style="text-align:center">${row.solved}</td>
        <td style="text-align:center">${row.avg_hints}</td>
        <td style="text-align:center">${row.streak}</td>
      </tr>`;
    });

    html += '</tbody></table>';
    el.innerHTML = html;
  } catch(e) {
    el.innerHTML = '<p style="color:#aaa;font-size:0.85rem">Das Leaderboard ist zurzeit nicht verfügbar.</p>';
  }
}

// ── Auth ──────────────────────────────────────────
function _profilToggleMode() {
  _profilSignUp = !_profilSignUp;
  document.getElementById('profil-auth-title').textContent = _profilSignUp ? 'Registrieren' : 'Anmelden';
  document.getElementById('profil-username').style.display = _profilSignUp ? 'block' : 'none';
  document.getElementById('profil-switch').textContent = _profilSignUp
    ? 'Schon ein Konto? Hier einloggen'
    : 'Noch kein Konto? Hier registrieren';
}

async function _profilHandleAuth() {
  const email = document.getElementById('profil-email').value.trim();
  const pw    = document.getElementById('profil-pw').value;
  if (!email || !pw) return alert('Bitte E-Mail und Passwort eingeben.');
  if (pw.length < 6) return alert('Passwort muss mindestens 6 Zeichen lang sein.');

  try {
    if (_profilSignUp) {
      const username = document.getElementById('profil-username').value.trim();
      if (!username) return alert('Bitte gib einen Anzeigenamen ein.');

      const { data: existing } = await _sb.from('leaderboard').select('user_id').eq('name', username).maybeSingle();
      if (existing) return alert('Dieser Name ist bereits vergeben.');

      const { data, error } = await _sb.auth.signUp({ email, password: pw });
      if (error) throw error;
      _profilUser = data.user;
      localStorage.setItem('leaderboardName', username);

      await _sb.from('leaderboard').insert({
        user_id: _profilUser.id, name: username,
        total: 0, solved: 0, avg_hints: 0, streak: 0,
        updated_at: new Date().toISOString()
      });
    } else {
      const { data, error } = await _sb.auth.signInWithPassword({ email, password: pw });
      if (error) throw error;
      _profilUser = data.user;
      const { data: lb } = await _sb.from('leaderboard').select('name').eq('user_id', _profilUser.id).maybeSingle();
      if (lb) localStorage.setItem('leaderboardName', lb.name);
    }
    _updateProfilBtn();
    _renderContent();
  } catch(e) {
    alert('Fehler: ' + e.message);
  }
}

async function _profilLogout() {
  await _sb.auth.signOut();
  _profilUser = null;
  localStorage.removeItem('leaderboardName');
  _updateProfilBtn();
  _renderContent();
}

function _updateProfilBtn() {
  const btn = document.getElementById('profil-btn');
  if (!btn) return;
  const name = localStorage.getItem('leaderboardName');
  btn.textContent = _profilUser && name ? '👤' : '👤';
  btn.title = _profilUser && name ? `Profil: ${name}` : 'Anmelden';
  btn.style.opacity = _profilUser ? '1' : '0.55';
}

// ── Public API ────────────────────────────────────
function profilOpen() {
  _renderContent();
  document.getElementById('profil-overlay').classList.add('visible');
}

function profilClose() {
  document.getElementById('profil-overlay').classList.remove('visible');
}

// ── Init ──────────────────────────────────────────
async function _profilInit() {
  // Warten bis DOM fertig
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _profilInit);
    return;
  }

  try {
    const { data: { user } } = await _sb.auth.getUser();
    _profilUser = user;
    if (user && !localStorage.getItem('leaderboardName')) {
      const { data } = await _sb.from('leaderboard').select('name').eq('user_id', user.id).maybeSingle();
      if (data) localStorage.setItem('leaderboardName', data.name);
    }
  } catch(e) {}

  _insertProfilBtn();
  _updateProfilBtn();
}

_profilInit();
