// Platform state & utilities
const state = {
  currentGameId: null,
  gameInstance: null,
  lbKeyPrefix: 'gamefari:leaderboard:',
  games: {
    'astro-dodge': { id: 'astro-dodge', title: 'Astro Dodge', best: 0 },
    'breakout': { id: 'breakout', title: 'Neon Breakout', best: 0 },
    'flappy': { id: 'flappy', title: 'Flappy Comet', best: 0 }
  }
};

const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

const yearEl = $('#year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

// Leaderboard (localStorage)
function lbKey(gameId) { return state.lbKeyPrefix + gameId; }
function readLB(gameId) {
  try { return JSON.parse(localStorage.getItem(lbKey(gameId)) || '[]'); } catch { return []; }
}
function writeLB(gameId, rows) { localStorage.setItem(lbKey(gameId), JSON.stringify(rows.slice(0, 50))); }
function addScore(gameId, name, score) {
  const rows = readLB(gameId);
  rows.push({ name: name || 'Player', score, at: Date.now() });
  rows.sort((a,b) => b.score - a.score);
  writeLB(gameId, rows);
  return rows;
}

function renderLeaderboards() {
  const host = $('#lb-tables'); if (!host) return; host.innerHTML = '';
  for (const gameId of Object.keys(state.games)) {
    const rows = readLB(gameId);
    const table = document.createElement('div');
    table.className = 'card';
    table.innerHTML = `
      <div class="row" style="margin-bottom:8px">
        <h3 style="margin:0">${state.games[gameId].title}</h3>
        <button class="btn ghost" data-clear="${gameId}">Clear</button>
      </div>
      <div class="muted" style="margin-bottom:8px">Top ${Math.min(rows.length, 10) || 0} of ${rows.length}</div>
      <div style="overflow:auto; max-height: 320px">
        <table aria-label="${state.games[gameId].title} leaderboard">
          <thead><tr><th>#</th><th>Name</th><th>Score</th><th>Date</th></tr></thead>
          <tbody>
            ${rows.slice(0, 50).map((r, i)=>`<tr><td>${i+1}</td><td>${escapeHtml(r.name)}</td><td>${r.score}</td><td>${new Date(r.at).toLocaleString()}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>`;
    host.appendChild(table);
  }
  $$('[data-clear]').forEach(btn=>{
    btn.onclick = () => { localStorage.removeItem(lbKey(btn.dataset.clear)); renderLeaderboards(); }
  });
}

function escapeHtml(str='') { return str.replace(/[&<>"']/g, s=>({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[s])); }

// Views
const libraryView = $('#library');
const gameArea = $('#game-area');
const lbsView = $('#leaderboards');

$('#view-library')?.addEventListener('click', ()=>showView('library'));
$('#view-leaderboard')?.addEventListener('click', ()=>{ renderLeaderboards(); showView('leaderboards'); });
$('#view-game')?.addEventListener('click', ()=>{ if (state.currentGameId) showView('game'); });

function showView(name) {
  if (libraryView) libraryView.hidden = name !== 'library';
  if (gameArea) gameArea.hidden = name !== 'game';
  if (lbsView) lbsView.hidden = name !== 'leaderboards';
}

// Library interactions
$$('#library .play').forEach(btn => btn.addEventListener('click', () => startGame(btn.dataset.game)));
$$('#library .scores').forEach(btn => btn.addEventListener('click', () => { renderLeaderboards(); showView('leaderboards'); }));
$$('#library [data-game]').forEach(card => card.addEventListener('keydown', (e)=>{ if (e.key==='Enter' || e.key===' ') { startGame(card.dataset.game); e.preventDefault(); }}));

// Game instance lifecycle
const canvas = $('#game-canvas');
const scoreEl = $('#score');
const bestEl = $('#best');
let raf = 0;

function startGame(gameId) {
  stopGame();
  state.currentGameId = gameId;
  const playBtn = $('#view-game'); if (playBtn) playBtn.disabled = false;
  showView('game');

  const best = readLB(gameId)[0]?.score || 0;
  if (bestEl) bestEl.textContent = best;

  if (gameId === 'astro-dodge') {
    state.gameInstance = new AstroDodge(canvas, (finalScore) => { if (bestEl) bestEl.textContent = Math.max(best, finalScore); promptScore(finalScore); }, (liveScore) => { if (scoreEl) scoreEl.textContent = liveScore; });
  }
  if (gameId === 'breakout') {
    state.gameInstance = new NeonBreakout(canvas, (finalScore) => { if (bestEl) bestEl.textContent = Math.max(best, finalScore); promptScore(finalScore); }, (liveScore) => { if (scoreEl) scoreEl.textContent = liveScore; });
  }
  if (gameId === 'flappy') {
    state.gameInstance = new FlappyComet(canvas, (finalScore) => { if (bestEl) bestEl.textContent = Math.max(best, finalScore); promptScore(finalScore); }, (liveScore) => { if (scoreEl) scoreEl.textContent = liveScore; });
  }
  state.gameInstance.start();
}

function stopGame() {
  cancelAnimationFrame(raf);
  if (state.gameInstance && state.gameInstance.destroy) state.gameInstance.destroy();
  state.gameInstance = null;
  if (scoreEl) scoreEl.textContent = '0';
}

// Pause/quit
$('#pause-btn')?.addEventListener('click', ()=>{ if (!state.gameInstance) return; state.gameInstance.togglePause(); });
$('#quit-btn')?.addEventListener('click', ()=>{ stopGame(); showView('library'); });

// Score modal
const scoreModal = $('#score-modal');
const nameInput = $('#player-name');

function promptScore(score) {
  if (typeof score !== 'number' || !(score > 0)) return;
  scoreModal?.showModal?.();
  if (nameInput) nameInput.value = localStorage.getItem('gamefari:lastName') || '';
  $('#save-score')?.addEventListener('click', ()=>{
    const name = (nameInput?.value?.trim()?.slice(0, 20)) || 'Player';
    localStorage.setItem('gamefari:lastName', name);
    const rows = addScore(state.currentGameId, name, score);
    if (bestEl) bestEl.textContent = rows[0]?.score || score;
    scoreModal?.close?.();
    renderLeaderboards();
    showView('leaderboards');
  }, { once:true });
  $('#skip-score')?.addEventListener('click', ()=> scoreModal?.close?.(), { once:true });
}

// Resize handling
function fitCanvasToCssPixels(canvas){ if (!canvas) return; const rect = canvas.getBoundingClientRect(); const dpr = Math.max(1, window.devicePixelRatio || 1); const w = Math.round(rect.width * dpr); const h = Math.round(rect.height * dpr); if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; } }
const ro = canvas ? new ResizeObserver(()=>fitCanvasToCssPixels(canvas)) : null; ro?.observe?.(canvas);
window.addEventListener('orientationchange', ()=>setTimeout(()=>fitCanvasToCssPixels(canvas), 200));

// initial
renderLeaderboards();
showView('library');
fitCanvasToCssPixels(canvas);

renderLeaderboards();
showView('library');
fitCanvasToCssPixels(canvas);

// (Optional) Backend persistence: replace read/add/write with fetch calls to your API.
