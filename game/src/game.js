// game.js — logika utama game "Pasar Pagi" (cari perbedaan).
// Satu-satunya tugas file ini: state permainan, input klik/keyboard, timer,
// hint, level, skor, dan menggambar papan (dua panel + penanda + overlay).
// Gambar tiap level tinggal di scenes.js; data perbedaan di differences.js;
// bunyi di audio.js; mode shot (?shot=) dibaca dari shots.js.

import { LEVELS, PANEL_W, PANEL_H, TOTAL_LEVELS, SHOT_PRESETS } from './differences.js';
import { drawLevelScene, levelName, levelSub } from './scenes.js';
import { playFound, playWrong, playHint, playLevelUp, playWin, playLose, playClick, playStart, setMuted, isMuted } from './audio.js';
import { parseShot } from './shots.js';

// ---- tata letak kanvas (1280 x 656, di bawah header DOM 64px) -------------
export const CANVAS_W = 1280;
export const CANVAS_H = 656;
const PANEL_X = [24, 660];
const PANEL_Y = 24;
const WRONG_PENALTY = 3;
const HINTS_PER_LEVEL = 3;
const HINT_MS = 2500;
const LEVEL_DONE_MS = 1700;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const elCounter = document.getElementById('counter');
const elTimer = document.getElementById('timer');
const elLevel = document.getElementById('level-label');
const elMessage = document.getElementById('message');
const elScore = document.getElementById('score');
const btnHint = document.getElementById('hint-btn');
const btnRestart = document.getElementById('restart-btn');
const btnMute = document.getElementById('mute-btn');

// ---- state -----------------------------------------------------------------
const state = {
  levelIndex: 0,
  found: new Set(),
  hintsLeft: HINTS_PER_LEVEL,
  hint: null, // { diffId, until }
  timeLeft: LEVELS[0].timeLimit,
  status: 'playing', // playing | levelDone | won | lost
  score: 0,
  totalFound: 0,
  levelDoneAt: 0,
  flashes: [], // { x, y, panel, until, ok }
  lastTick: performance.now(),
  shotMode: false,
  shotName: '',
  frozenTime: null,
};

function level() {
  return LEVELS[state.levelIndex];
}

function remaining() {
  return level().diffs.length - state.found.size;
}

function fmtTime(sec) {
  const s = Math.max(0, Math.ceil(sec));
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}

// ---- HUD -------------------------------------------------------------------
function updateHud() {
  elLevel.textContent = 'Level ' + (state.levelIndex + 1) + '/' + TOTAL_LEVELS + ' — ' + levelName(state.levelIndex);
  elCounter.textContent = 'Tersisa ' + remaining() + ' dari ' + level().diffs.length;
  elTimer.textContent = fmtTime(state.timeLeft);
  elTimer.classList.toggle('danger', state.timeLeft <= 15 && state.status === 'playing');
  elScore.textContent = 'Skor ' + state.score;
  btnHint.textContent = 'Hint (H) — ' + state.hintsLeft + ' tersisa';
  btnHint.disabled = state.hintsLeft <= 0 || state.status !== 'playing';
  document.getElementById('level-sub').textContent = levelSub(state.levelIndex);
}

function say(text) {
  elMessage.textContent = text;
  document.getElementById('status').textContent = text;
}

// ---- alur permainan ----------------------------------------------------------
function startLevel(index) {
  state.levelIndex = index;
  state.found = new Set();
  state.hint = null;
  state.hintsLeft = HINTS_PER_LEVEL;
  state.timeLeft = level().timeLimit;
  state.status = 'playing';
  state.flashes = [];
  say('Level ' + (index + 1) + ': ' + levelName(index) + ' — temukan 7 perbedaan!');
  updateHud();
}

function restart() {
  state.score = 0;
  state.totalFound = 0;
  startLevel(0);
  playStart();
}

function levelComplete() {
  const bonus = Math.round(state.timeLeft) * 5;
  state.score += bonus;
  state.status = 'levelDone';
  state.levelDoneAt = performance.now();
  playLevelUp();
  say('Level selesai! Bonus waktu +' + bonus + ' poin.');
  updateHud();
}

function gameWon() {
  state.status = 'won';
  playWin();
  say('Selamat! Kamu menemukan semua ' + (TOTAL_LEVELS * 7) + ' perbedaan.');
  updateHud();
}

function gameLost() {
  state.status = 'lost';
  state.timeLeft = 0;
  playLose();
  say('Waktu habis! Kamu menemukan ' + state.totalFound + ' perbedaan. Tekan R untuk coba lagi.');
  updateHud();
}

function advanceLevel() {
  if (state.levelIndex + 1 >= TOTAL_LEVELS) {
    gameWon();
  } else {
    startLevel(state.levelIndex + 1);
  }
}

// ---- input: klik ---------------------------------------------------------------
function panelOf(px, py) {
  for (let p = 0; p < 2; p++) {
    if (px >= PANEL_X[p] && px < PANEL_X[p] + PANEL_W && py >= PANEL_Y && py < PANEL_Y + PANEL_H) {
      return { panel: p, x: px - PANEL_X[p], y: py - PANEL_Y };
    }
  }
  return null;
}

function checkClick(px, py) {
  if (state.status !== 'playing') return;
  const hit = panelOf(px, py);
  if (!hit) return;
  const now = performance.now();
  for (const diff of level().diffs) {
    if (state.found.has(diff.id)) continue;
    const dx = hit.x - diff.x;
    const dy = hit.y - diff.y;
    if (dx * dx + dy * dy <= diff.r * diff.r) {
      state.found.add(diff.id);
      state.totalFound++;
      state.score += 100;
      state.flashes.push({ x: diff.x, y: diff.y, panel: 0, until: now + 700, ok: true });
      state.flashes.push({ x: diff.x, y: diff.y, panel: 1, until: now + 700, ok: true });
      playFound();
      say('Ketemu! ' + diff.label + ' (+100)');
      if (remaining() === 0) levelComplete();
      updateHud();
      return;
    }
  }
  // Klik kosong: penalti waktu + tanda silang merah.
  state.timeLeft = Math.max(0, state.timeLeft - WRONG_PENALTY);
  state.flashes.push({ x: hit.x, y: hit.y, panel: hit.panel, until: now + 600, ok: false });
  playWrong();
  say('Belum ketemu di situ (−' + WRONG_PENALTY + ' detik). Perhatikan baik-baik!');
  updateHud();
}

canvas.addEventListener('click', (ev) => {
  const rect = canvas.getBoundingClientRect();
  const px = ((ev.clientX - rect.left) / rect.width) * CANVAS_W;
  const py = ((ev.clientY - rect.top) / rect.height) * CANVAS_H;
  checkClick(px, py);
});

// ---- input: keyboard -----------------------------------------------------------
document.addEventListener('keydown', (ev) => {
  const k = ev.key.toLowerCase();
  if (k === 'h') useHint();
  else if (k === 'r') restart();
  else if (k === 'm') toggleMute();
});

function useHint() {
  if (state.status !== 'playing') return;
  if (state.hintsLeft <= 0) {
    say('Hint habis untuk level ini.');
    return;
  }
  const left = level().diffs.filter((d) => !state.found.has(d.id));
  if (left.length === 0) return;
  const pick = left[Math.floor(Math.random() * left.length)];
  state.hintsLeft--;
  state.hint = { diffId: pick.id, until: performance.now() + HINT_MS };
  playHint();
  say('Hint: perhatikan sekitar ' + pick.label.toLowerCase() + '…');
  updateHud();
}

function toggleMute() {
  setMuted(!isMuted());
  btnMute.textContent = isMuted() ? 'Suara: Mati (M)' : 'Suara: Hidup (M)';
}

btnHint.addEventListener('click', useHint);
btnRestart.addEventListener('click', restart);
btnMute.addEventListener('click', toggleMute);

// ---- gambar --------------------------------------------------------------------
function drawPanel(panel, now) {
  const x0 = PANEL_X[panel];
  const applied = new Set();
  if (panel === 1) {
    for (const d of level().diffs) applied.add(d.id);
  }
  ctx.save();
  ctx.beginPath();
  ctx.rect(x0, PANEL_Y, PANEL_W, PANEL_H);
  ctx.clip();
  ctx.translate(x0, PANEL_Y);
  drawLevelScene(ctx, state.levelIndex, PANEL_W, PANEL_H, applied);
  ctx.restore();

  // Bingkai panel + label kiri/kanan.
  ctx.strokeStyle = panel === 0 ? '#2f6db3' : '#c0392b';
  ctx.lineWidth = 4;
  ctx.strokeRect(x0, PANEL_Y, PANEL_W, PANEL_H);
  ctx.fillStyle = panel === 0 ? '#2f6db3' : '#c0392b';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(panel === 0 ? 'GAMBAR A' : 'GAMBAR B', x0 + 10, PANEL_Y + 8);

  // Penanda hijau untuk perbedaan yang sudah ditemukan.
  for (const diff of level().diffs) {
    if (!state.found.has(diff.id)) continue;
    ctx.beginPath();
    ctx.arc(x0 + diff.x, PANEL_Y + diff.y, diff.r + 7, 0, Math.PI * 2);
    ctx.strokeStyle = '#27ae60';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x0 + diff.x, PANEL_Y + diff.y, diff.r + 7, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(39,174,96,0.35)';
    ctx.lineWidth = 11;
    ctx.stroke();
    // Tanda centang kecil di tengah lingkaran.
    ctx.beginPath();
    ctx.moveTo(x0 + diff.x - 9, PANEL_Y + diff.y);
    ctx.lineTo(x0 + diff.x - 2, PANEL_Y + diff.y + 8);
    ctx.lineTo(x0 + diff.x + 11, PANEL_Y + diff.y - 8);
    ctx.strokeStyle = '#1e8449';
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  // Cincin hint berdenyut pada kedua panel.
  if (state.hint && now < state.hint.until) {
    const diff = level().diffs.find((d) => d.id === state.hint.diffId);
    if (diff) {
      const pulse = 1 + 0.18 * Math.sin(now / 160);
      ctx.beginPath();
      ctx.arc(x0 + diff.x, PANEL_Y + diff.y, (diff.r + 12) * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 7]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // Kilatan klik (hijau saat kena, silang merah saat meleset).
  for (const f of state.flashes) {
    if (f.panel !== panel || now > f.until) continue;
    const alpha = (f.until - now) / 600;
    const cx = x0 + f.x;
    const cy = PANEL_Y + f.y;
    ctx.globalAlpha = Math.max(0, alpha);
    if (f.ok) {
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.strokeStyle = '#27ae60';
      ctx.lineWidth = 4;
      ctx.stroke();
    } else {
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx - 12, cy - 12);
      ctx.lineTo(cx + 12, cy + 12);
      ctx.moveTo(cx + 12, cy - 12);
      ctx.lineTo(cx - 12, cy + 12);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}

function drawBottomStrip(now) {
  const y = PANEL_Y + PANEL_H + 14;
  ctx.fillStyle = '#3d2b1f';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  // Titik progres 7 perbedaan level ini.
  let x = 24;
  ctx.fillText('Ditemukan:', x, y + 12);
  x += 108;
  for (const diff of level().diffs) {
    ctx.beginPath();
    ctx.arc(x, y + 12, 9, 0, Math.PI * 2);
    ctx.fillStyle = state.found.has(diff.id) ? '#27ae60' : '#e0d6c8';
    ctx.fill();
    ctx.strokeStyle = '#3d2b1f';
    ctx.lineWidth = 2;
    ctx.stroke();
    x += 26;
  }
  // Titik progres level 1-3.
  x += 30;
  ctx.fillStyle = '#3d2b1f';
  ctx.fillText('Level:', x, y + 12);
  x += 62;
  for (let i = 0; i < TOTAL_LEVELS; i++) {
    ctx.beginPath();
    ctx.arc(x, y + 12, 9, 0, Math.PI * 2);
    ctx.fillStyle = i < state.levelIndex || (i === state.levelIndex && state.status === 'won') ? '#27ae60' : i === state.levelIndex ? '#f1c40f' : '#e0d6c8';
    ctx.fill();
    ctx.strokeStyle = '#3d2b1f';
    ctx.lineWidth = 2;
    ctx.stroke();
    x += 26;
  }
  ctx.fillStyle = '#6b5a48';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('Klik perbedaan di gambar A atau B  •  H = hint  •  R = ulang  •  M = suara', CANVAS_W - 24, y + 12);
}

function drawOverlay() {
  if (state.status === 'playing') return;
  const cx = CANVAS_W / 2;
  const cy = 300;
  ctx.save();
  ctx.fillStyle = 'rgba(20, 16, 10, 0.72)';
  ctx.beginPath();
  ctx.roundRect(cx - 330, cy - 95, 660, 190, 18);
  ctx.fill();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (state.status === 'levelDone') {
    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText('Level ' + (state.levelIndex + 1) + ' Selesai!', cx, cy - 48);
    ctx.fillStyle = '#fdf6e3';
    ctx.font = '20px sans-serif';
    ctx.fillText('Semua 7 perbedaan ditemukan. Level berikutnya…', cx, cy + 2);
  } else if (state.status === 'won') {
    ctx.fillStyle = '#2ecc71';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('Kamu Menang!', cx, cy - 52);
    ctx.fillStyle = '#fdf6e3';
    ctx.font = '20px sans-serif';
    ctx.fillText('Semua 21 perbedaan di 3 suasana pasar ditemukan.', cx, cy - 8);
    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = '#f1c40f';
    ctx.fillText('Skor akhir: ' + state.score, cx, cy + 34);
    ctx.fillStyle = '#fdf6e3';
    ctx.font = '16px sans-serif';
    ctx.fillText('Tekan R untuk main lagi', cx, cy + 66);
  } else if (state.status === 'lost') {
    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('Waktu Habis!', cx, cy - 52);
    ctx.fillStyle = '#fdf6e3';
    ctx.font = '20px sans-serif';
    ctx.fillText('Kamu menemukan ' + state.totalFound + ' dari 21 perbedaan.', cx, cy - 8);
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('Skor: ' + state.score + '  •  Tekan R untuk coba lagi', cx, cy + 34);
  }
  ctx.restore();
}

// ---- loop utama ---------------------------------------------------------------
let shotReadySent = false;

function frame(now) {
  const dt = Math.min(0.1, (now - state.lastTick) / 1000);
  state.lastTick = now;

  if (state.status === 'playing' && !state.shotMode) {
    state.timeLeft -= dt;
    if (state.timeLeft <= 0) gameLost();
  }
  if (state.status === 'levelDone' && !state.shotMode && now - state.levelDoneAt >= LEVEL_DONE_MS) {
    advanceLevel();
  }
  if (state.hint && now >= state.hint.until) state.hint = null;
  state.flashes = state.flashes.filter((f) => now < f.until);

  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#f6ead6';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  drawPanel(0, now);
  drawPanel(1, now);
  drawBottomStrip(now);
  drawOverlay();
  if (state.status === 'playing' && !state.shotMode) updateHud();

  // Sinyal untuk screenshot otomatis: frame pertama sudah ter-render.
  if (!shotReadySent) {
    shotReadySent = true;
    window.__shotReady = true;
  }
  requestAnimationFrame(frame);
}

// ---- mode shot (?shot=...) ----------------------------------------------------
function applyShotMode(shot) {
  state.shotMode = true;
  state.shotName = shot.name;
  setMuted(true);
  const ids = level().diffs.map((d) => d.id);
  if (shot.name === 'start') {
    state.found = new Set(ids.slice(0, SHOT_PRESETS.start));
    state.timeLeft = level().timeLimit;
    state.score = 200;
    state.totalFound = SHOT_PRESETS.start;
    say('Temukan 7 perbedaan antara gambar A dan B!');
  } else if (shot.name === 'play') {
    state.found = new Set(ids.slice(0, SHOT_PRESETS.play));
    state.timeLeft = 97;
    state.score = 400;
    state.totalFound = SHOT_PRESETS.play;
    say('Bagus! 4 ketemu, 3 lagi.');
  } else if (shot.name === 'almost') {
    state.found = new Set(ids.slice(0, SHOT_PRESETS.almost));
    state.timeLeft = 48;
    state.score = 600;
    state.totalFound = SHOT_PRESETS.almost;
    say('Tinggal 1 lagi! Perhatikan baik-baik.');
  } else if (shot.name === 'win') {
    state.levelIndex = TOTAL_LEVELS - 1;
    const lastIds = level().diffs.map((d) => d.id);
    state.found = new Set(lastIds);
    state.timeLeft = 32;
    state.score = 2450;
    state.totalFound = TOTAL_LEVELS * 7;
    state.status = 'won';
    say('Selamat! Kamu menemukan semua 21 perbedaan.');
  }
  updateHud();
}

// ---- mulai -------------------------------------------------------------------
const shot = parseShot();
if (shot) applyShotMode(shot);
else say('Temukan 7 perbedaan antara gambar A dan B!');
updateHud();
requestAnimationFrame(frame);

// Kait untuk pengujian otomatis (klik nyata via Playwright).
window.__game = {
  state,
  panelPos: { x: PANEL_X, y: PANEL_Y, w: PANEL_W, h: PANEL_H },
  headerHeight: 64,
  restart,
  useHint,
};
