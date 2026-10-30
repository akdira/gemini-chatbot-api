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

Mengirim seluruh riwayat percakapan; server meneruskannya ke Gemini dengan system instruction konsultan hukum.

Request body:

```json
{
  "messages": [
    { "role": "user", "text": "Saya di-PHK tanpa pesangon, apa hak saya?" },
    { "role": "model", "text": "..." },
    {
      "role": "user",
      "text": "Tolong cek kontrak kerja saya ini",
      "files": [{ "mimeType": "application/pdf", "data": "<base64>" }]
    }
  ]
}
```

- `role`: `user` atau `model`
- `text`: isi pesan (opsional jika ada `files`)
- `files`: lampiran opsional; `data` berupa base64 tanpa prefix `data:`. Total body maksimal 20 MB.

Response:

```json
{ "reply": "Berdasarkan UU Ketenagakerjaan ..." }
```

Contoh dengan curl:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","text":"Apa itu somasi?"}]}'
```

## Struktur proyek

```
.
├── index.js          # Server Express + integrasi Gemini
├── public/           # Frontend chat (HTML/CSS/JS statis)
├── .env.example      # Template variabel lingkungan
├── AGENTS.md         # Panduan untuk AI coding agent
└── README.md
```
