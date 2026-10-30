# AGENTS.md

Panduan untuk AI coding agent yang bekerja di repo ini.

## Ringkasan proyek

Chatbot konsultasi hukum (fokus hukum Indonesia). Backend Node.js + Express (ES modules) memanggil Gemini 2.5 Flash lewat `@google/genai`. Frontend statis di `public/` disajikan oleh Express yang sama.

## Perintah

- Install: `npm install`
- Jalankan: `npm start`
- Dev (auto-reload): `npm run dev`
- Docker: `cd infra/localhost && docker compose up -d` (port 13000, container `gemini-chatbot-api-localhost-app`)
- Belum ada test suite; verifikasi manual via UI di http://localhost:3000 atau `curl` ke `POST /api/chat`.

## Struktur

- `index.js` — seluruh backend: konfigurasi, `SYSTEM_INSTRUCTION`, konversi riwayat (`toContents`), endpoint `POST /api/chat`.
- `public/index.html`, `public/style.css`, `public/script.js` — UI chat bergaya gemini.google.com (vanilla JS, tanpa build step, mendukung light/dark mode). Balasan bot dirender sebagai Markdown via `marked` + `DOMPurify` dari CDN jsDelivr; jangan render HTML dari Gemini tanpa sanitasi.

## Konvensi

- ES modules (`"type": "module"`), `async/await`, tanpa TypeScript dan tanpa framework frontend.
- Teks yang dilihat pengguna (UI, pesan error API) dalam Bahasa Indonesia.
- Server bersifat stateless: klien mengirim seluruh riwayat percakapan di setiap request.
- Lampiran dikirim sebagai base64 di JSON (`inlineData`), bukan multipart — jangan menambah `multer` kecuali ada kebutuhan file besar.
- Perubahan perilaku chatbot (nada, cakupan, batasan) dilakukan di `SYSTEM_INSTRUCTION` pada `index.js`. Pertahankan disclaimer "bukan nasihat hukum resmi" dan larangan mengarang pasal.

## Keamanan

- Jangan pernah commit `.env` atau API key. Tambahkan variabel baru ke `.env.example` dan tabel di `README.md`.
- Jangan log isi percakapan atau lampiran pengguna — bisa berisi data pribadi/sensitif.

## Git

- Jangan menambahkan trailer `Co-Authored-By` (termasuk `Co-Authored-By: Claude ...`) atau atribusi AI lain di pesan commit maupun deskripsi PR.
