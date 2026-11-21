// differences.js — data perbedaan game "Pasar Pagi".
// Satu-satunya tugas file ini: menyimpan daftar perbedaan tiap level.
// Koordinat memakai ruang panel lokal (lebar 596, tinggi 560); x,y adalah
// titik tengah area perbedaan, r adalah radius klik yang masih dihitung kena.
// Label berbahasa Indonesia, dipakai pesan HUD dan layar akhir.

export const PANEL_W = 596;
export const PANEL_H = 560;

// Tiap level: nama, suasana, batas waktu (detik), dan 7 perbedaannya.
export const LEVELS = [
  {
    id: 1,
    name: 'Pasar Pagi',
    sub: 'Suasana pasar tradisional saat matahari terbit',
    timeLimit: 120,
    diffs: [
      { id: 'd1-oranye', x: 150, y: 292, r: 26, label: 'Jeruk di puncak tumpukan hilang' },
      { id: 'd1-matahari', x: 70, y: 70, r: 30, label: 'Matahari tertutup awan' },
      { id: 'd1-ayam', x: 120, y: 495, r: 30, label: 'Ayam di tanah hilang' },
      { id: 'd1-tenda', x: 455, y: 225, r: 28, label: 'Warna garis tenda berubah' },
      { id: 'd1-harga', x: 255, y: 265, r: 24, label: 'Angka papan harga berubah' },
      { id: 'd1-pisang', x: 215, y: 315, r: 28, label: 'Setandan pisang hilang' },
      { id: 'd1-kucing', x: 530, y: 480, r: 30, label: 'Kucing di atas peti hilang' },
    ],
  },
  {
    id: 2,
    name: 'Pelabuhan Ikan',
    sub: 'Dermaga nelayan, perahu, dan mercusuar',
    timeLimit: 105,
    diffs: [
      { id: 'd2-burung', x: 380, y: 85, r: 26, label: 'Seekor burung camar tambahan' },
      { id: 'd2-bendera', x: 170, y: 235, r: 24, label: 'Warna bendera perahu berubah' },
      { id: 'd2-ikan', x: 265, y: 445, r: 26, label: 'Seekor ikan di peti hilang' },
      { id: 'd2-mercusuar', x: 60, y: 315, r: 26, label: 'Lampu mercusuar padam' },
      { id: 'd2-ember', x: 480, y: 448, r: 26, label: 'Ember di dermaga hilang' },
      { id: 'd2-layar', x: 170, y: 300, r: 28, label: 'Garis layar perahu hilang' },
      { id: 'd2-jangkar', x: 545, y: 452, r: 26, label: 'Jangkar di dermaga hilang' },
    ],
  },
  {
    id: 3,
    name: 'Sawah Panen',
    sub: 'Hamparan padi menguning saat panen raya',
    timeLimit: 90,
    diffs: [
      { id: 'd3-topi', x: 500, y: 265, r: 26, label: 'Warna topi orang-orangan berubah' },
      { id: 'd3-burung', x: 430, y: 75, r: 24, label: 'Seekor burung tambahan di langit' },
      { id: 'd3-tumpukan', x: 120, y: 430, r: 30, label: 'Setumpuk jerami hilang' },
      { id: 'd3-karung', x: 395, y: 505, r: 28, label: 'Satu karung padi hilang' },
      { id: 'd3-kerbau', x: 180, y: 500, r: 32, label: 'Kerbau di pematang hilang' },
      { id: 'd3-matahari', x: 90, y: 65, r: 30, label: 'Sinar matahari hilang' },
      { id: 'd3-buah', x: 80, y: 250, r: 26, label: 'Buah di pohon hilang' },
    ],
  },
];

export const DIFFS_PER_LEVEL = 7;
export const TOTAL_LEVELS = LEVELS.length;
export const TOTAL_DIFFS = LEVELS.length * DIFFS_PER_LEVEL;

// Berapa perbedaan yang sudah ditandai di tiap keadaan shot (?shot=):
// start = awal permainan (2 ketemu), play = tengah permainan (4 ketemu),
// almost = tinggal satu (6 ketemu). Win memakai semua perbedaan level 3.
export const SHOT_PRESETS = { start: 2, play: 4, almost: 6 };

// Cari data perbedaan berdasarkan id-nya (dipakai logika klik dan hint).
export function findDiff(levelIndex, diffId) {
  return LEVELS[levelIndex].diffs.find((d) => d.id === diffId) ?? null;
}

// Daftar id perbedaan sebuah level, sesuai urutan tetap (dipakai mode shot).
export function diffIdsOf(levelIndex) {
  return LEVELS[levelIndex].diffs.map((d) => d.id);
}
