// shots.js — dukungan screenshot deterministik untuk pembuat entri.
// Membaca query ?shot=start|play|almost|win (&seed=1) dari URL dan
// mengembalikan keadaan yang harus dirender game.js, supaya tiap screenshot
// selalu menampilkan keadaan yang sama, apa pun waktu pengambilannya.
// Tanpa parameter shot, game berjalan normal (mode interaktif).

// Nama shot yang dikenal, sesuai shots.json di root repo.
export const SHOT_NAMES = ['start', 'play', 'almost', 'win'];

// Benar bila `name` salah satu shot yang dikenal.
export function isShotName(name) {
  return SHOT_NAMES.includes(name);
}

// Baca ?shot= dan ?seed= dari URL saat ini.
// Mengembalikan { name, seed } atau null bila tidak ada shot yang diminta.
export function parseShot() {
  let params;
  try {
    params = new URLSearchParams(window.location.search);
  } catch {
    return null;
  }
  const name = params.get('shot');
  if (!name || !SHOT_NAMES.includes(name)) return null;
  const rawSeed = Number.parseInt(params.get('seed') ?? '1', 10);
  const seed = Number.isFinite(rawSeed) ? rawSeed : 1;
  return { name, seed };
}

// Seed deterministik kecil (mulberry32) untuk pilihan acak apa pun yang
// bergantung pada shot, supaya render shot selalu sama.
export function seededRandom(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
