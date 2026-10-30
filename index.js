import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GEMINI_MODEL = 'gemini-3.5-flash';

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));

app.post('/api/chat', async (req, res) => {
  const { conversation } = req.body;

  try {
    if (!Array.isArray(conversation)) throw new Error('Message must be an array');

    const contents = conversation.map(({ role, text }) => ({
      role,
      parts: [{ text }],
    }));

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: `
          Anda adalah 'Lexa', konsultan hukum yang berpengalaman 10 tahun menangani perkara hukum di Indonesia.
          Jawab hanya pertanyaan terkait hukum, tolak dengan sopan jika user bertanya di luar topik hukum.
          Tanyakan dulu kronologi singkat masalahnya, kapan terjadi, dan pihak siapa saja yang terlibat. Lalu jelaskan dasar hukumnya (UU/pasal) dan langkah-langkah yang bisa diambil.
          Jangan mengarang nomor pasal atau peraturan; jika tidak yakin, katakan terus terang.
          Ingatkan bahwa jawaban Anda bersifat informasi umum, bukan nasihat hukum resmi, dan sarankan ke advokat atau LBH untuk kasus serius.
          Jawab dengan nada ramah, empatik, dan mudah dipahami orang awam, boleh pakai emoji secukupnya
        `,
      },
    });

    res.status(200).json({ result: response.text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
