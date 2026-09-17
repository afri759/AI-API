import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';

const app = express();

// PERBAIKAN: Tambahkan limit ukuran file untuk mencegah Out Of Memory (Contoh: 10 MB)
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Catatan: Pastikan nama model valid. Saat ini yang umum adalah "gemini-2.5-flash" atau "gemini-1.5-flash"
const GEMINI_MODEL = "gemini-3.5-flash";

app.use(express.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));

// ENDPOINT TEXT GENERATION
app.post('/generate-text', async (req, res) => {
    const { prompt } = req.body;
    
    // PERBAIKAN: Validasi prompt
    if (!prompt) return res.status(400).json({ message: "Prompt teks wajib diisi." });

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt
        });
        res.status(200).json({ result: response.text });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: e.message });
    }
});

// ENDPOINT IMAGE GENERATION
app.post('/generate-image', upload.single('image'), async (req, res) => {
    const { prompt } = req.body;
    
    // PERBAIKAN: Cek ketersediaan file sebelum memproses buffer
    if (!req.file) return res.status(400).json({ message: "File gambar tidak ditemukan." });

    const base64Image = req.file.buffer.toString('base64');

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                // PERBAIKAN: Hapus key `type` yang tidak diizinkan API
                { text: prompt ?? 'Tolong jelaskan gambar ini.' },
                { inlineData: { mimeType: req.file.mimetype, data: base64Image } }
            ],
        });
        res.status(200).json({ result: response.text });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: e.message });
    }
});

// ENDPOINT DOCUMENT
app.post('/generate-document', upload.single('document'), async (req, res) => {
    const { prompt } = req.body;
    
    // PERBAIKAN: Cek ketersediaan file
    if (!req.file) return res.status(400).json({ message: "File dokumen tidak ditemukan." });

    const base64Document = req.file.buffer.toString('base64'); 

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                // PERBAIKAN: Hapus key `type`
                { text: prompt ?? 'Tolong buat ringkasan dari dokumen berikut.' },
                { inlineData: { data: base64Document, mimeType: req.file.mimetype } }
            ]
        });
        res.status(200).json({ result: response.text });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: e.message });
    }
});

// ENDPOINT AUDIO
app.post('/generate-from-audio', upload.single('audio'), async (req, res) => {
    const { prompt } = req.body;
    
    // PERBAIKAN: Cek ketersediaan file
    if (!req.file) return res.status(400).json({ message: "File audio tidak ditemukan." });

    const base64Audio = req.file.buffer.toString('base64'); 

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                // PERBAIKAN: Hapus key `type`
                { text: prompt ?? 'Tolong buatkan transkrip dari rekaman berikut.' },
                { inlineData: { data: base64Audio, mimeType: req.file.mimetype } }
            ]
        });
        res.status(200).json({ result: response.text });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: e.message });
    }
});