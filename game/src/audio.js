// audio.js — semua bunyi game "Pasar Pagi" dibuat dengan WebAudio.
// Tidak ada file suara: tiap efek adalah osilator + penguatan yang naik-turun.
// AudioContext baru dibuat saat interaksi pertama (aturan autoplay browser);
// bila browser menolak, game tetap jalan tanpa bunyi.

let ctx = null;
let muted = false;

function ensureContext() {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  } catch {
    return null;
  }
  return ctx;
}

// Satu nada: frekuensi, durasi detik, jeda mulai, bentuk gelombang, volume.
function tone(freq, dur, delay, type, vol) {
  const ac = ensureContext();
  if (!ac || muted) return;
  if (ac.state === 'suspended') ac.resume().catch(() => {});
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

// Bunyi saat perbedaan ditemukan: dua nada naik yang memuaskan.
export function playFound() {
  tone(660, 0.14, 0, 'sine', 0.22);
  tone(990, 0.22, 0.09, 'sine', 0.22);
}

// Bunyi klik salah: dengung rendah pendek.
export function playWrong() {
  tone(160, 0.18, 0, 'sawtooth', 0.10);
  tone(120, 0.22, 0.05, 'sawtooth', 0.10);
}

// Bunyi hint: nada tunggal lembut.
export function playHint() {
  tone(520, 0.16, 0, 'triangle', 0.16);
}

// Bunyi ganti level: tiga nada naik.
export function playLevelUp() {
  tone(523, 0.12, 0, 'sine', 0.20);
  tone(659, 0.12, 0.10, 'sine', 0.20);
  tone(784, 0.24, 0.20, 'sine', 0.20);
}

// Bunyi menang: arpeggio ceria empat nada.
export function playWin() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((f, i) => tone(f, 0.22, i * 0.11, 'sine', 0.20));
}

// Bunyi kalah: tiga nada turun.
export function playLose() {
  const notes = [392, 330, 262];
  notes.forEach((f, i) => tone(f, 0.26, i * 0.14, 'triangle', 0.16));
}

// Bunyi klik tombol biasa.
export function playClick() {
  tone(440, 0.06, 0, 'sine', 0.12);
}

// Bunyi mulai level baru: satu nada naik pendek.
export function playStart() {
  tone(523, 0.10, 0, 'sine', 0.16);
  tone(784, 0.14, 0.08, 'sine', 0.16);
}

export function setMuted(value) {
  muted = !!value;
}

export function isMuted() {
  return muted;
}
