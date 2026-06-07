const router = require("express").Router();
const { analyzeComplaint, getChatbotResponse } = require("../services/aiService");
const { authenticate } = require('../middleware/auth.middleware');

// POST /api/ai/analyze — dipanggil saat warga submit laporan
// Diproteksi JWT, hanya user login
router.post("/analyze", authenticate, async (req, res) => {
  try {
    const { judul, deskripsi } = req.body;
    if (!judul || !deskripsi) {
      return res.status(400).json({ error: "judul dan deskripsi wajib diisi" });
    }
    const result = await analyzeComplaint(judul, deskripsi);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/chat — chatbot publik, tidak perlu login
router.post("/chat", async (req, res) => {
  try {
    const { pertanyaan, totalLaporan } = req.body;
    if (!pertanyaan) return res.status(400).json({ error: "pertanyaan wajib diisi" });

    const result = await getChatbotResponse(pertanyaan, { totalLaporan });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
