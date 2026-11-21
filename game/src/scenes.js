// scenes.js — menggambar tiap level "Pasar Pagi" murni dengan kode canvas.
// Tidak ada aset gambar luar: langit, lapak, perahu, sawah, dan semua tokoh
// digambar dari primitif canvas (persegi, lingkaran, segitiga, busur).
//
// drawLevelScene(ctx, levelIndex, W, H, appliedDiffs):
//   menggambar satu panel. appliedDiffs adalah Set berisi id perbedaan yang
//   SUDAH diterapkan pada panel itu (panel kiri: Set kosong; panel kanan:
//   ketujuh id level itu). Jadi kedua panel nyaris identik, kecuali tepat
//   pada 7 titik perbedaan.

import { LEVELS } from './differences.js';

// ---- pembantu gambar kecil -----------------------------------------------

function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function triangle(ctx, x1, y1, x2, y2, x3, y3, fill) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, color, width) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function cloud(ctx, x, y, scale, color) {
  ctx.fillStyle = color;
  circle(ctx, x, y, 16 * scale, color);
  circle(ctx, x + 18 * scale, y - 6 * scale, 13 * scale, color);
  circle(ctx, x + 36 * scale, y, 15 * scale, color);
  circle(ctx, x + 18 * scale, y + 6 * scale, 14 * scale, color);
}

function seagull(ctx, x, y, color) {
  ctx.beginPath();
  ctx.moveTo(x - 12, y);
  ctx.quadraticCurveTo(x - 5, y - 8, x, y);
  ctx.quadraticCurveTo(x + 5, y - 8, x + 12, y);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.stroke();
}

function bunting(ctx, y, colors) {
  line(ctx, 0, y, 596, y, '#5b4636', 2);
  for (let i = 0; i < 12; i++) {
    const x = 24 + i * 48;
    triangle(ctx, x, y + 2, x + 22, y + 2, x + 11, y + 22, colors[i % colors.length]);
  }
}

// ---- LEVEL 1: Pasar Pagi ---------------------------------------------------

function drawMarket(ctx, W, H, d) {
  // Langit pagi: gradasi oranye lembut.
  const sky = ctx.createLinearGradient(0, 0, 0, 190);
  sky.addColorStop(0, '#ffd9a0');
  sky.addColorStop(1, '#ff9e6e');
  rect(ctx, 0, 0, W, 190, sky);

  // Matahari — atau awan yang menutupinya (perbedaan d1-matahari).
  if (d.has('d1-matahari')) {
    cloud(ctx, 48, 66, 1.4, '#fff4e0');
  } else {
    circle(ctx, 70, 70, 34, '#ffdf6b');
    circle(ctx, 70, 70, 26, '#ffe98a');
  }
  cloud(ctx, 300, 58, 1.0, '#fff4e0');
  cloud(ctx, 452, 92, 0.8, '#ffe9d2');

  // Atap rumah di kejauhan.
  rect(ctx, 0, 168, W, 34, '#8a5a3b');
  for (const [x, w] of [[20, 120], [170, 150], [350, 130], [500, 90]]) {
    triangle(ctx, x, 170, x + w / 2, 132, x + w, 170, '#6e4527');
  }

  // Tanah pasar.
  rect(ctx, 0, 360, W, H - 360, '#d9a066');
  for (let i = 0; i < 26; i++) {
    const x = (i * 53 + 17) % W;
    const y = 380 + ((i * 37) % 160);
    circle(ctx, x, y, 3, 'rgba(120,70,30,0.25)');
  }
  bunting(ctx, 186, ['#e74c3c', '#f1c40f', '#27ae60', '#2980b9']);

  // --- Lapak A (kiri): buah-buahan.
  rect(ctx, 40, 250, 8, 90, '#7a4a21');
  rect(ctx, 252, 250, 8, 90, '#7a4a21');
  for (let i = 0; i < 6; i++) {
    rect(ctx, 40 + i * 37, 205, 37, 45, i % 2 === 0 ? '#e74c3c' : '#fdf6e3');
  }
  rect(ctx, 40, 330, 220, 14, '#a5692e');
  rect(ctx, 48, 344, 204, 56, '#8a5a2b');
  // Piramida jeruk — jeruk puncak bisa hilang (d1-oranye).
  const orangeRows = [[150, 296], [134, 312], [166, 312], [118, 328], [150, 328], [182, 328]];
  for (const [x, y] of orangeRows) {
    if (d.has('d1-oranye') && x === 150 && y === 296) continue;
    circle(ctx, x, y, 13, '#f39c12');
    circle(ctx, x - 4, y - 4, 4, '#f8c471');
  }
  // Pisang — setandan bisa hilang (d1-pisang).
  if (!d.has('d1-pisang')) {
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(215, 312, 16 - i * 2, Math.PI * 0.15, Math.PI * 0.85);
      ctx.strokeStyle = '#f7dc6f';
      ctx.lineWidth = 5;
      ctx.stroke();
    }
  }
  // Keranjang apel.
  rect(ctx, 74, 312, 34, 20, '#9c6b30');
  circle(ctx, 82, 306, 8, '#c0392b');
  circle(ctx, 96, 302, 8, '#e74c3c');
  circle(ctx, 104, 310, 8, '#c0392b');

  // --- Lapak B (kanan): sayuran.
  rect(ctx, 340, 250, 8, 90, '#7a4a21');
  rect(ctx, 552, 250, 8, 90, '#7a4a21');
  for (let i = 0; i < 6; i++) {
    const stripe = d.has('d1-tenda') && i === 2 ? '#2980b9' : i % 2 === 0 ? '#27ae60' : '#fdf6e3';
    rect(ctx, 340 + i * 37, 205, 37, 45, stripe);
  }
  rect(ctx, 340, 330, 220, 14, '#a5692e');
  rect(ctx, 348, 344, 204, 56, '#8a5a2b');
  // Cabai merah di lapak B (bagian dasar, sama di kedua panel).
  circle(ctx, 362, 312, 7, '#c0392b');
  circle(ctx, 374, 310, 7, '#e74c3c');
  circle(ctx, 368, 318, 7, '#c0392b');
  // Kubis, wortel, keranjang.
  circle(ctx, 395, 312, 14, '#58a447');
  circle(ctx, 415, 316, 13, '#6abf5a');
  triangle(ctx, 462, 328, 472, 296, 482, 328, '#e67e22');
  triangle(ctx, 484, 328, 494, 298, 504, 328, '#e67e22');
  rect(ctx, 508, 312, 34, 20, '#9c6b30');
  circle(ctx, 516, 306, 7, '#7cb342');
  circle(ctx, 530, 304, 7, '#8bc34a');

  // --- Penjual di tengah, memakai caping.
  ellipse(ctx, 300, 372, 26, 34, '#3e6fb0');
  circle(ctx, 300, 326, 16, '#f1c27d');
  triangle(ctx, 272, 322, 328, 322, 300, 296, '#d9b23a');
  line(ctx, 300, 296, 300, 288, '#8a6d1f', 3);
  line(ctx, 282, 356, 262, 340, '#f1c27d', 7);
  line(ctx, 318, 356, 338, 340, '#f1c27d', 7);

  // Papan harga — angkanya bisa berubah (d1-harga).
  rect(ctx, 238, 252, 36, 26, '#fdf6e3');
  line(ctx, 238, 252, 274, 252, '#5b4636', 2);
  line(ctx, 238, 278, 274, 278, '#5b4636', 2);
  ctx.fillStyle = '#c0392b';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(d.has('d1-harga') ? '8' : '5', 256, 266);

  // Ayam mematuk di tanah (d1-ayam).
  if (!d.has('d1-ayam')) {
    ellipse(ctx, 120, 498, 20, 14, '#fff8e1');
    circle(ctx, 138, 484, 9, '#fff8e1');
    triangle(ctx, 146, 482, 154, 485, 146, 488, '#e67e22');
    circle(ctx, 140, 481, 2, '#222');
    line(ctx, 114, 510, 112, 522, '#e67e22', 2);
    line(ctx, 126, 510, 128, 522, '#e67e22', 2);
    triangle(ctx, 100, 494, 106, 486, 112, 496, '#e67e22');
  }

  // Kucing duduk di atas peti (d1-kucing).
  rect(ctx, 505, 462, 52, 48, '#9c6b30');
  line(ctx, 505, 478, 557, 478, '#7a4a21', 3);
  line(ctx, 505, 494, 557, 494, '#7a4a21', 3);
  if (!d.has('d1-kucing')) {
    ellipse(ctx, 531, 452, 16, 13, '#7d6b8a');
    circle(ctx, 531, 434, 11, '#7d6b8a');
    triangle(ctx, 522, 428, 524, 418, 530, 426, '#7d6b8a');
    triangle(ctx, 536, 426, 540, 418, 542, 428, '#7d6b8a');
    ctx.beginPath();
    ctx.arc(548, 452, 10, 0, Math.PI * 1.2);
    ctx.strokeStyle = '#7d6b8a';
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  // Keranjang di tanah.
  rect(ctx, 56, 516, 44, 22, '#9c6b30');
  circle(ctx, 66, 512, 7, '#c0392b');
  circle(ctx, 82, 510, 7, '#f39c12');
  circle(ctx, 94, 514, 6, '#27ae60');
  rect(ctx, 330, 516, 44, 22, '#9c6b30');
  circle(ctx, 342, 512, 7, '#f39c12');
  circle(ctx, 358, 510, 7, '#e74c3c');
}

// ---- LEVEL 2: Pelabuhan Ikan -------------------------------------------------

function drawHarbor(ctx, W, H, d) {
  const sky = ctx.createLinearGradient(0, 0, 0, 200);
  sky.addColorStop(0, '#7ec8f7');
  sky.addColorStop(1, '#d8f1ff');
  rect(ctx, 0, 0, W, 200, sky);
  circle(ctx, 510, 60, 30, '#fff3a0');
  circle(ctx, 510, 60, 22, '#ffedb0');
  cloud(ctx, 140, 62, 1.0, '#ffffff');
  cloud(ctx, 320, 44, 0.8, '#ffffff');
  seagull(ctx, 150, 90, '#33506b');
  seagull(ctx, 300, 70, '#33506b');
  seagull(ctx, 450, 110, '#33506b');
  if (d.has('d2-burung')) seagull(ctx, 380, 85, '#33506b');

  // Laut bergelombang.
  const sea = ctx.createLinearGradient(0, 200, 0, H);
  sea.addColorStop(0, '#2a7fc2');
  sea.addColorStop(1, '#155a8a');
  rect(ctx, 0, 200, W, H - 200, sea);
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 3;
  for (let row = 0; row < 4; row++) {
    const y = 240 + row * 42;
    for (let x = 20; x < W; x += 90) {
      ctx.beginPath();
      ctx.arc(x, y, 22, Math.PI, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Mercusuar di kiri.
  rect(ctx, 42, 150, 38, 180, '#f5f0e6');
  rect(ctx, 42, 180, 38, 22, '#d64541');
  rect(ctx, 42, 240, 38, 22, '#d64541');
  rect(ctx, 42, 300, 38, 22, '#d64541');
  rect(ctx, 36, 128, 50, 24, '#33506b');
  if (d.has('d2-mercusuar')) {
    circle(ctx, 61, 140, 9, '#5b6b7a');
  } else {
    circle(ctx, 61, 140, 16, 'rgba(255, 240, 130, 0.55)');
    circle(ctx, 61, 140, 9, '#ffe98a');
  }
  rect(ctx, 30, 148, 62, 6, '#2c3e50');

  // Perahu layar kiri.
  line(ctx, 170, 330, 170, 228, '#5b4636', 6);
  triangle(ctx, 170, 238, 170, 322, 238, 322, '#fdf6e3');
  if (!d.has('d2-layar')) line(ctx, 182, 268, 214, 268, '#d64541', 8);
  triangle(ctx, 170, 228, 196, 234, 170, 242, d.has('d2-bendera') ? '#f1c40f' : '#d64541');
  ellipse(ctx, 170, 348, 86, 24, '#7a4a21');
  rect(ctx, 96, 330, 148, 12, '#8a5a2b');
  circle(ctx, 120, 322, 8, '#f39c12');
  circle(ctx, 200, 320, 8, '#27ae60');

  // Perahu muat ikan kanan.
  ellipse(ctx, 445, 372, 92, 24, '#6e4527');
  rect(ctx, 360, 352, 170, 12, '#8a5a2b');
  rect(ctx, 380, 330, 52, 22, '#9c6b30');
  rect(ctx, 452, 330, 52, 22, '#9c6b30');
  for (const [x, y] of [[392, 326], [406, 324], [420, 326], [464, 324], [478, 326], [492, 324]]) {
    ellipse(ctx, x, y, 9, 5, '#b8d4e8');
    triangle(ctx, x + 8, y, x + 14, y - 5, x + 14, y + 5, '#9fc3dd');
  }

  // Dermaga kayu melintang.
  rect(ctx, 0, 430, W, 40, '#8a5a2b');
  for (let x = 0; x < W; x += 42) line(ctx, x, 430, x, 470, '#6e4527', 2);
  for (const x of [60, 200, 340, 480, 560]) rect(ctx, x, 470, 12, 34, '#5b4636');

  // Peti ikan di dermaga — seekor ikan bisa hilang (d2-ikan).
  rect(ctx, 220, 424, 90, 30, '#9c6b30');
  const crateFish = [[236, 420], [252, 418], [268, 420], [284, 418], [298, 420]];
  for (const [x, y] of crateFish) {
    if (d.has('d2-ikan') && x === 268 && y === 420) continue;
    ellipse(ctx, x, y, 9, 5, '#d7e9f7');
    triangle(ctx, x + 8, y, x + 14, y - 5, x + 14, y + 5, '#b8d4e8');
  }

  // Ember (d2-ember) dan jangkar (d2-jangkar).
  if (!d.has('d2-ember')) {
    rect(ctx, 468, 432, 26, 24, '#d64541');
    rect(ctx, 464, 428, 34, 6, '#b03a37');
    line(ctx, 472, 428, 490, 412, '#7f8c8d', 3);
  }
  if (!d.has('d2-jangkar')) {
    line(ctx, 545, 424, 545, 452, '#5b6b7a', 5);
    ctx.beginPath();
    ctx.arc(545, 452, 10, Math.PI * 0.15, Math.PI * 0.85);
    ctx.strokeStyle = '#5b6b7a';
    ctx.lineWidth = 5;
    ctx.stroke();
    circle(ctx, 545, 422, 5, '#5b6b7a');
  }

  // Jaring gantung dan gulungan tali.
  ctx.strokeStyle = 'rgba(240,240,220,0.85)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    line(ctx, 350 + i * 18, 470, 350 + i * 18, 512, 'rgba(240,240,220,0.85)', 2);
    line(ctx, 350, 478 + i * 8, 430, 478 + i * 8, 'rgba(240,240,220,0.85)', 2);
  }
  ctx.beginPath();
  ctx.arc(150, 486, 16, 0, Math.PI * 2);
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(150, 486, 8, 0, Math.PI * 2);
  ctx.stroke();
}

// ---- LEVEL 3: Sawah Panen ----------------------------------------------------

function drawHarvest(ctx, W, H, d) {
  const sky = ctx.createLinearGradient(0, 0, 0, 170);
  sky.addColorStop(0, '#a8d8f0');
  sky.addColorStop(1, '#fff3bf');
  rect(ctx, 0, 0, W, 170, sky);
  // Matahari — sinarnya bisa hilang (d3-matahari).
  if (!d.has('d3-matahari')) {
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 4;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      line(ctx, 90 + Math.cos(a) * 38, 65 + Math.sin(a) * 38, 90 + Math.cos(a) * 50, 65 + Math.sin(a) * 50, '#f1c40f', 4);
    }
  }
  circle(ctx, 90, 65, 30, '#ffdf6b');
  cloud(ctx, 250, 60, 1.0, '#ffffff');
  cloud(ctx, 470, 46, 0.8, '#ffffff');
  seagull(ctx, 200, 80, '#33506b');
  seagull(ctx, 350, 60, '#33506b');
  if (d.has('d3-burung')) seagull(ctx, 430, 75, '#33506b');

  // Pegunungan.
  triangle(ctx, 0, 220, 130, 130, 270, 220, '#7fb069');
  triangle(ctx, 220, 220, 380, 120, 540, 220, '#6a9e5f');
  triangle(ctx, 460, 220, 540, 150, 596, 220, '#7fb069');
  circle(ctx, 380, 122, 14, '#fff8e1');
  circle(ctx, 130, 132, 10, '#fff8e1');

  // Sawah menguning dengan alur menuju titik hilang.
  const field = ctx.createLinearGradient(0, 220, 0, H);
  field.addColorStop(0, '#e8c85a');
  field.addColorStop(1, '#c9a13a');
  rect(ctx, 0, 220, W, H - 220, field);
  ctx.strokeStyle = 'rgba(120, 85, 20, 0.4)';
  ctx.lineWidth = 2;
  for (let i = -4; i <= 4; i++) {
    line(ctx, 300 + i * 40, 220, 300 + i * 130, H, 'rgba(120,85,20,0.4)', 2);
  }
  for (let y = 250; y < H; y += 46) line(ctx, 0, y, W, y, 'rgba(120,85,20,0.25)', 2);
  // Jalan tanah tengah.
  ctx.beginPath();
  ctx.moveTo(272, H);
  ctx.lineTo(328, H);
  ctx.lineTo(314, 220);
  ctx.lineTo(286, 220);
  ctx.closePath();
  ctx.fillStyle = '#c98f4e';
  ctx.fill();

  // Pohon di kiri — buahnya bisa hilang (d3-buah).
  rect(ctx, 72, 300, 16, 120, '#6e4527');
  circle(ctx, 55, 268, 34, '#4e9b47');
  circle(ctx, 105, 258, 36, '#58a447');
  circle(ctx, 80, 232, 32, '#6abf5a');
  if (!d.has('d3-buah')) {
    circle(ctx, 62, 252, 6, '#e74c3c');
    circle(ctx, 96, 244, 6, '#e74c3c');
    circle(ctx, 80, 268, 6, '#e74c3c');
    circle(ctx, 112, 272, 6, '#e74c3c');
  }

  // Petani dengan caping di tengah.
  line(ctx, 292, 380, 288, 430, '#5b4636', 8);
  line(ctx, 308, 380, 312, 430, '#5b4636', 8);
  ellipse(ctx, 300, 356, 24, 30, '#e74c3c');
  circle(ctx, 300, 318, 15, '#f1c27d');
  triangle(ctx, 274, 314, 326, 314, 300, 290, '#d9b23a');
  line(ctx, 316, 350, 336, 336, '#f1c27d', 7);
  line(ctx, 336, 336, 348, 322, '#b8b8b8', 3);

  // Orang-orangan sawah — topinya bisa ganti warna (d3-topi).
  line(ctx, 500, 300, 500, 430, '#6e4527', 7);
  line(ctx, 452, 330, 548, 330, '#6e4527', 6);
  rect(ctx, 478, 330, 44, 62, '#8e44ad');
  circle(ctx, 500, 306, 15, '#f1c27d');
  circle(ctx, 494, 304, 2, '#222');
  circle(ctx, 506, 304, 2, '#222');
  triangle(ctx, 472, 300, 528, 300, 500, 276, d.has('d3-topi') ? '#2980b9' : '#d9b23a');
  line(ctx, 488, 392, 484, 430, '#5b4636', 7);
  line(ctx, 512, 392, 516, 430, '#5b4636', 7);

  // Tumpukan jerami — satu bisa hilang (d3-tumpukan).
  if (!d.has('d3-tumpukan')) {
    triangle(ctx, 84, 470, 120, 392, 156, 470, '#d9a441');
    line(ctx, 100, 430, 140, 430, '#b98a2e', 3);
    line(ctx, 106, 448, 134, 448, '#b98a2e', 3);
  }
  triangle(ctx, 398, 482, 432, 414, 466, 482, '#d9a441');
  line(ctx, 414, 448, 450, 448, '#b98a2e', 3);

  // Karung padi — satu bisa hilang (d3-karung).
  ellipse(ctx, 366, 508, 20, 16, '#e8dcc0');
  line(ctx, 366, 492, 366, 500, '#b09a6a', 3);
  if (!d.has('d3-karung')) {
    ellipse(ctx, 396, 508, 20, 16, '#e8dcc0');
    line(ctx, 396, 492, 396, 500, '#b09a6a', 3);
  }
  ellipse(ctx, 426, 508, 20, 16, '#e8dcc0');
  line(ctx, 426, 492, 426, 500, '#b09a6a', 3);

  // Kerbau di pematang (d3-kerbau).
  if (!d.has('d3-kerbau')) {
    ellipse(ctx, 180, 502, 44, 24, '#5b6b7a');
    circle(ctx, 226, 490, 16, '#5b6b7a');
    ctx.beginPath();
    ctx.arc(216, 478, 10, Math.PI, Math.PI * 1.6);
    ctx.strokeStyle = '#e8dcc0';
    ctx.lineWidth = 4;
    ctx.stroke();
    line(ctx, 150, 522, 148, 540, '#4a5866', 6);
    line(ctx, 210, 522, 212, 540, '#4a5866', 6);
    circle(ctx, 230, 486, 2, '#222');
  }
}

// ---- pintu masuk gambar ------------------------------------------------------

const DRAWERS = [drawMarket, drawHarbor, drawHarvest];

// Gambar satu panel level ke-`levelIndex` (0-based). `appliedDiffs` berisi id
// perbedaan yang diterapkan pada panel ini. Panel kiri memakai Set kosong.
export function drawLevelScene(ctx, levelIndex, W, H, appliedDiffs) {
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  DRAWERS[levelIndex](ctx, W, H, appliedDiffs);
  ctx.restore();
}

// Nama level untuk HUD, dari data perbedaan.
export function levelName(levelIndex) {
  return LEVELS[levelIndex].name;
}

export function levelSub(levelIndex) {
  return LEVELS[levelIndex].sub;
}
