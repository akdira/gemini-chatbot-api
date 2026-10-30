import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 3000;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY belum diset. Salin .env.example ke .env lalu isi API key Anda.');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `Anda adalah "Asisten Konsultasi Hukum", chatbot yang membantu masyarakat memahami persoalan hukum, khususnya hukum Indonesia.

Pedoman:
- Jawab dalam bahasa yang digunakan pengguna (default: Bahasa Indonesia), dengan bahasa yang jelas dan mudah dipahami orang awam.
- Bila relevan, sebutkan dasar hukum (undang-undang, pasal, peraturan) dan jelaskan maksudnya. Jangan mengarang nomor pasal atau peraturan; jika tidak yakin, katakan demikian.
- Uraikan opsi langkah yang bisa diambil (misalnya mediasi, somasi, laporan polisi, gugatan) beserta gambaran prosesnya.
- Ajukan pertanyaan klarifikasi bila fakta kasus belum cukup.
- Jika pengguna mengirim dokumen, gambar, atau audio, analisis isinya dari sudut pandang hukum (misalnya klausul kontrak yang berisiko).
- Tolak membantu tindakan yang melanggar hukum, seperti memalsukan dokumen atau menghindari proses hukum secara ilegal.
- Tolak dengan sopan pertanyaan di luar topik hukum dan arahkan kembali ke konsultasi hukum.
- Selalu ingatkan bahwa jawaban Anda bersifat informasi umum, bukan nasihat hukum resmi, dan sarankan berkonsultasi dengan advokat atau LBH untuk kasus yang serius.`;

const app = express();

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Ubah riwayat percakapan dari klien menjadi format `contents` Gemini.
// Setiap pesan: { role: 'user' | 'model', text?: string, files?: [{ mimeType, data }] }
// `data` berisi base64 (tanpa prefix data URL).
function toContents(messages) {
  return messages.map(({ role, text, files = [] }) => {
    const parts = [];
    if (text) parts.push({ text });
    for (const file of files) {
      parts.push({ inlineData: { mimeType: file.mimeType, data: file.data } });
    }
    return { role: role === 'model' ? 'model' : 'user', parts };
  });
}

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body ?? {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: '`messages` harus berupa array yang tidak kosong.' });
  }

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: toContents(messages),
      config: { systemInstruction: SYSTEM_INSTRUCTION },
    });

    res.json({ reply: response.text ?? '' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Terjadi kesalahan pada server.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
