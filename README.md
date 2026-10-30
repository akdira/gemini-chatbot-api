# Asisten Konsultasi Hukum — Gemini Chatbot API

Chatbot konsultasi hukum berbasis **Node.js + Express** yang terintegrasi dengan **Gemini 2.5 Flash API** melalui package `@google/genai`. Mendukung input teks, gambar, audio, dan dokumen (misalnya PDF kontrak), serta menyimpan konteks percakapan.

> ⚠️ Jawaban chatbot bersifat informasi hukum umum, **bukan** nasihat hukum resmi. Untuk kasus serius, konsultasikan dengan advokat atau LBH.

## Tech stack

| Package | Fungsi |
| --- | --- |
| `express` | Menyiapkan REST API dan menyajikan frontend statis |
| `dotenv` | Memuat API key Gemini secara aman dari file `.env` |
| `@google/genai` | Menghubungkan aplikasi ke Gemini API (Gemini 2.5 Flash) |
| `cors` | Mengizinkan request dari origin lain ke endpoint server |

## Persiapan

Prasyarat: Node.js 20+ dan API key Gemini dari [Google AI Studio](https://aistudio.google.com/apikey).

```bash
npm install
cp .env.example .env   # lalu isi GEMINI_API_KEY
npm start              # atau: npm run dev (auto-reload)
```

Buka http://localhost:3000 untuk memakai antarmuka chat.

### Variabel lingkungan

| Nama | Wajib | Default | Keterangan |
| --- | --- | --- | --- |
| `GEMINI_API_KEY` | ya | — | API key Gemini |
| `GEMINI_MODEL` | tidak | `gemini-2.5-flash` | Model Gemini yang dipakai |
| `PORT` | tidak | `3000` | Port server |

## API

### `POST /api/chat`

Kirim seluruh riwayat percakapan di setiap request agar chatbot (Lexa) mengingat konteks. Balasan `model` diambil dari field `result` response sebelumnya.

Request body:

```json
{
  "conversation": [
    { "role": "user", "text": "Selamat malam" },
    { "role": "model", "text": "Selamat malam! 👋 Saya Lexa, ..." },
    { "role": "user", "text": "Saya di-PHK tanpa pesangon, apa hak saya?" }
  ]
}
```

- `role`: `user` atau `model`
- `text`: isi pesan

Response sukses (200):

```json
{ "result": "Berdasarkan UU Ketenagakerjaan ..." }
```

Response error (500), misalnya jika `conversation` bukan array:

```json
{ "error": "Message must be an array" }
```

### Postman

Import [`postman/law-consulting.postman_collection.json`](postman/law-consulting.postman_collection.json) ke Postman. Variabel `base_url` default-nya `http://localhost:3000`. Koleksi berisi request pesan pertama, percakapan multi-turn, pertanyaan di luar topik hukum, dan validasi error, masing-masing dengan test otomatis.

## Struktur proyek

```
.
├── index.js          # Server Express + integrasi Gemini
├── postman/          # Postman collection
├── public/           # Frontend chat (HTML/CSS/JS statis)
├── .env.example      # Template variabel lingkungan
├── AGENTS.md         # Panduan untuk AI coding agent
└── README.md
```
