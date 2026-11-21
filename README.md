# Pasar Pagi — Cari Perbedaan

![make.fun competition](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)
![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/JACKETAGENT-ID/spotdiff21-nurz/rank.svg)
![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/JACKETAGENT-ID/spotdiff21-nurz/reward.svg)

Game cari perbedaan orisinal untuk kompetisi [best-spot-the-difference-game-20261121-0451](https://make.fun/c/best-spot-the-difference-game-20261121-0451) di [make.fun](https://make.fun). Deadline kompetisi: 21 November 2026, 23:51 WIB.

## Cara main

Dua gambar nyaris identik berdampingan (A dan B). Klik 7 perbedaan di tiap
level sebelum waktu habis. Perbedaan yang ketemu ditandai lingkaran hijau di
kedua gambar, lengkap dengan penghitung "Tersisa X dari 7".

- **3 level** suasana Indonesia, makin sulit: **Pasar Pagi** (120 detik),
  **Pelabuhan Ikan** (105 detik), **Sawah Panen** (90 detik).
- **Hint** (tombol atau `H`): maks 3 per level, menandai satu perbedaan yang
  belum ketemu dengan cincin kuning berdenyut.
- **Klik salah** mengurangi waktu 3 detik.
- **Keyboard**: `H` hint, `R` ulang, `M` suara hidup/mati.
- **Bunyi** WebAudio (tanpa file suara): nada ketemu, dengung salah, arpeggio
  menang.
- Semua gambar digambar murni dengan kode canvas — tanpa aset eksternal,
  tanpa jaringan.

## Menjalankan

```sh
node serve.ts
# buka http://localhost:8080
```

Screenshot deterministik untuk entri (`?shot=start|play|almost|win&seed=1`):

```sh
python3 shoot.py
```

## Struktur

- `game/index.html` — halaman + HUD (penghitung, timer, skor, tombol).
- `game/styles.css` — tampilan header dan bingkai.
- `game/src/differences.js` — data 7 perbedaan tiap level (posisi, radius, label).
- `game/src/scenes.js` — gambar tiap level dengan canvas (pasar, pelabuhan, sawah).
- `game/src/game.js` — logika klik, penanda, timer, hint, level, skor.
- `game/src/audio.js` — bunyi WebAudio tanpa file suara.
- `game/src/shots.js` — dukungan `?shot=` untuk screenshot deterministik.
- `main.ts` — menyalin `game/` + `screenshots/` ke `/output` dan menulis
  `dossier.json` via `vendor/makefun-game.ts`.

## Lisensi

MIT — lihat `LICENSE`.
