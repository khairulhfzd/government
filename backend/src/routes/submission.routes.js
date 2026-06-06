const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const Submission = require('../models/Submission');
const User = require('../models/User');
const { authenticate, authorizeWarga, authorizeAdmin } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

// GET /api/submissions/my - List all submissions for current warga
router.get('/my', authenticate, authorizeWarga, async (req, res) => {
  try {
    const { status } = req.query;
    const where = { user_id: req.user.id };
    if (status) where.status = status;

    const submissions = await Submission.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    res.json({ submissions });
  } catch (error) {
    console.error('Get my submissions error:', error.message);
    res.status(500).json({ message: 'Gagal mengambil data pengajuan.' });
  }
});

// POST /api/submissions - Create a new submission (Warga)
router.post('/',
  authenticate,
  authorizeWarga,
  upload.array('documents', 10),
  [
    body('type').trim().notEmpty().withMessage('Jenis pengajuan wajib dipilih.'),
    body('title').trim().notEmpty().withMessage('Judul pengajuan wajib diisi.'),
    body('description').trim().notEmpty().withMessage('Keterangan pengajuan wajib diisi.')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validasi gagal.', errors: errors.array() });
      }

      const { type, title, description } = req.body;
      const files = req.files || [];
      const document_url = files.length > 0
        ? files.map(file => `/uploads/${file.filename}`).join(',')
        : null;

      const submission = await Submission.create({
        id: uuidv4(),
        user_id: req.user.id,
        type,
        title,
        description,
        document_url,
        status: 'Menunggu'
      });

      res.status(201).json({
        message: 'Pengajuan berhasil diajukan! Silakan pantau status secara berkala.',
        submission
      });
    } catch (error) {
      console.error('Create submission error:', error.message);
      res.status(500).json({ message: 'Gagal mengirim pengajuan. Coba lagi.' });
    }
  }
);

// GET /api/submissions/admin - List all submissions for admin
router.get('/admin', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { status, type } = req.query;
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const submissions = await Submission.findAll({
      where,
      include: [{
        model: User,
        as: 'applicant',
        attributes: ['id', 'name', 'email', 'phone']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({ submissions });
  } catch (error) {
    console.error('Get admin submissions error:', error.message);
    res.status(500).json({ message: 'Gagal mengambil data pengajuan.' });
  }
});

// GET /api/submissions/:id - Get details of a single submission
router.get('/:id', authenticate, async (req, res) => {
  try {
    const submission = await Submission.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'applicant',
        attributes: ['id', 'name', 'email', 'phone']
      }]
    });

    if (!submission) {
      return res.status(404).json({ message: 'Pengajuan tidak ditemukan.' });
    }

    // Warga can only access their own
    if (req.user.role === 'warga' && submission.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Akses ditolak.' });
    }

    res.json({ submission });
  } catch (error) {
    console.error('Get submission detail error:', error.message);
    res.status(500).json({ message: 'Gagal mengambil detail pengajuan.' });
  }
});

// PATCH /api/submissions/:id/status - Update status (Admin)
router.patch('/:id/status',
  authenticate,
  authorizeAdmin,
  [
    body('status').isIn(['Menunggu', 'Diproses', 'Selesai', 'Ditolak']).withMessage('Status tidak valid.'),
    body('admin_notes').optional().trim()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validasi gagal.', errors: errors.array() });
      }

      const { status, admin_notes } = req.body;
      const submission = await Submission.findByPk(req.params.id);

      if (!submission) {
        return res.status(404).json({ message: 'Pengajuan tidak ditemukan.' });
      }

      submission.status = status;
      if (admin_notes !== undefined) {
        submission.admin_notes = admin_notes;
      }

      await submission.save();

      res.json({
        message: 'Status pengajuan berhasil diperbarui.',
        submission
      });
    } catch (error) {
      console.error('Update submission status error:', error.message);
      res.status(500).json({ message: 'Gagal memperbarui status pengajuan.' });
    }
  }
);

module.exports = router;
