const express = require('express');
const { getChatbotResponse } = require('../services/aiService');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// POST /api/chat - Smart City Chatbot
router.post('/', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Pesan tidak boleh kosong.' });
    }

    const result = await getChatbotResponse(message, { history });

    res.json({ reply: result.reply || 'Maaf, asisten sedang tidak tersedia.' });
  } catch (error) {
    console.error('Chatbot route error:', error.message);
    res.status(500).json({ message: 'Terjadi kesalahan pada chatbot. Coba lagi nanti.' });
  }
});

module.exports = router;
