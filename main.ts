// main.ts — program penyerahan entri "Pasar Pagi" (Node 22, stdlib saja).
// Tugasnya satu: menyalin game/ dan screenshots/ dari samping file ini ke
// folder keluaran, lalu menulis /output/dossier.json memakai buildDossier
// dari vendor/makefun-game.ts (salinan kit, tanpa perubahan).
//
// Di luar container grader, MAKEFUN_OUTPUT_DIR menggantikan /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Program berjalan dua kali di grader; kedua run harus menulis byte yang sama.

import { cpSync, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

// Folder repo ini (tempat main.ts berada) dan folder keluaran.
const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// Batas-batas dari gate kompetisi: hanya text_max_bytes yang membentuk isi
// dossier; batas lain membuat program gagal di titik yang sama seperti
// scorer menolak entri (lebih dari 4 screenshot, satu di atas 256 KiB,
// game/ lebih dari 993 entri atau 48 MiB, path game/ di atas 1000 byte).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

// Pengaman terakhir: dossier yang ditulis harus di bawah batas gate 1,5 MiB,
// supaya kegagalan ketahuan di sini, bukan baru di tangan scorer.
const dossierBytes = statSync(join(out, 'dossier.json')).size;
if (dossierBytes > 1572864) throw new Error(`dossier.json ${dossierBytes} byte, di atas 1,5 MiB`);
