const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { authenticate, authorizeWarga } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const { analyzeComplaint } = require('../services/aiService');

const router = express.Router();

// POST /api/complaints - Submit laporan baru (Warga)
router.post('/',
  authenticate,
  authorizeWarga,
  upload.array('images', 10),
  [
    body('title').trim().notEmpty().withMessage('Judul laporan wajib diisi.').isLength({ min: 5, max: 255 }),
    body('description').trim().notEmpty().withMessage('Deskripsi laporan wajib diisi.').isLength({ min: 20, max: 5000 }),
    body('category').optional().isIn(['Infrastruktur', 'Lingkungan', 'Keamanan', 'Kesehatan', 'Pendidikan', 'Administrasi', 'Lainnya'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validasi gagal.', errors: errors.array() });
      }

      const { title, description, category: userCategory } = req.body;
      const files = req.files || [];
      const image_url = files.length > 0
        ? files.map(file => `/uploads/${file.filename}`).join(',')
        : null;

      // Jalankan AI Analysis
      console.log('[AI] Menganalisis laporan...');
      const aiResult = await analyzeComplaint(title, description);

      // Map AI kategori to DB category
      let mappedCategory = 'Lainnya';
      if (aiResult.kategori) {
        const kat = aiResult.kategori.toLowerCase();
        if (kat.includes('infrastruktur') || kat.includes('jalan')) {
          mappedCategory = 'Infrastruktur';
        } else if (kat.includes('lingkungan') || kat.includes('kebersihan') || kat.includes('sampah')) {
          mappedCategory = 'Lingkungan';
        } else if (kat.includes('keamanan') || kat.includes('ketertiban')) {
          mappedCategory = 'Keamanan';
        } else if (kat.includes('kesehatan')) {
          mappedCategory = 'Kesehatan';
        } else if (kat.includes('pendidikan')) {
          mappedCategory = 'Pendidikan';
        } else if (kat.includes('administrasi') || kat.includes('pelayanan') || kat.includes('air') || kat.includes('sanitasi') || kat.includes('listrik')) {
          mappedCategory = 'Administrasi';
        }
      }

      // Map AI urgensi to DB urgency level
      let mappedUrgency = 'Medium';
      if (aiResult.urgensi) {
        const urg = aiResult.urgensi.toLowerCase();
        if (urg === 'tinggi') {
          mappedUrgency = 'High';
        } else if (urg === 'rendah') {
          mappedUrgency = 'Low';
        } else {
          mappedUrgency = 'Medium';
        }
      }

      const complaint = await Complaint.create({
        id: uuidv4(),
        user_id: req.user.id,
        title,
        description,
        image_url,
        category: mappedCategory,
        ai_summary: aiResult.ringkasan || title.substring(0, 100),
        ai_urgency_level: mappedUrgency,
        status: 'Menunggu'
      });

      res.status(201).json({
        message: 'Laporan berhasil dikirim! Kami akan segera menindaklanjutinya.',
        complaint
      });
    } catch (error) {
      console.error('Create complaint error:', error.message);
      res.status(500).json({ message: 'Gagal mengirim laporan. Coba lagi.' });
    }
  }
);

// GET /api/complaints/my - Riwayat laporan warga (Warga)
router.get('/my', authenticate, authorizeWarga, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const where = { user_id: req.user.id };
    if (status) where.status = status;

    const { count, rows } = await Complaint.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      complaints: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get my complaints error:', error.message);
    res.status(500).json({ message: 'Gagal mengambil data laporan.' });
  }
});

// GET /api/complaints/:id - Detail laporan (Warga - hanya miliknya sendiri)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const complaint = await Complaint.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'reporter',
        attributes: ['id', 'name', 'email', 'phone']
      }]
    });

    if (!complaint) {
      return res.status(404).json({ message: 'Laporan tidak ditemukan.' });
    }

    // Warga hanya bisa lihat laporan sendiri
    if (req.user.role === 'warga' && complaint.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Akses ditolak.' });
    }

    res.json({ complaint });
  } catch (error) {
    console.error('Get complaint detail error:', error.message);
    res.status(500).json({ message: 'Gagal mengambil detail laporan.' });
  }
});

module.exports = router;
