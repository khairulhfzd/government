const express = require('express');
const { Op, fn, col, literal } = require('sequelize');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// Semua route admin harus authenticate dan authorizeAdmin
router.use(authenticate, authorizeAdmin);

// GET /api/admin/dashboard - Statistik untuk dashboard admin
router.get('/dashboard', async (req, res) => {
  try {
    const totalComplaints = await Complaint.count();
    const menunggu = await Complaint.count({ where: { status: 'Menunggu' } });
    const diproses = await Complaint.count({ where: { status: 'Diproses' } });
    const selesai = await Complaint.count({ where: { status: 'Selesai' } });
    const ditolak = await Complaint.count({ where: { status: 'Ditolak' } });
    const highUrgency = await Complaint.count({ where: { ai_urgency_level: 'High' } });
    const totalWarga = await User.count({ where: { role: 'warga' } });

    // Statistik per kategori
    const categoryStats = await Complaint.findAll({
      attributes: ['category', [fn('COUNT', col('id')), 'count']],
      group: ['category'],
      raw: true
    });

    // 5 laporan terbaru
    const recentComplaints = await Complaint.findAll({
      include: [{ model: User, as: 'reporter', attributes: ['name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    // Statistik 7 hari terakhir
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklyComplaints = await Complaint.count({
      where: { createdAt: { [Op.gte]: sevenDaysAgo } }
    });

    res.json({
      stats: {
        total: totalComplaints,
        menunggu,
        diproses,
        selesai,
        ditolak,
        highUrgency,
        totalWarga,
        weeklyComplaints
      },
      categoryStats,
      recentComplaints
    });
  } catch (error) {
    console.error('Admin dashboard error:', error.message);
    res.status(500).json({ message: 'Gagal mengambil data dashboard.' });
  }
});

// GET /api/admin/tickets - Daftar semua laporan dengan filter & sort
router.get('/tickets', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      urgency,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build WHERE clause
    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (urgency) where.ai_urgency_level = urgency;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    // Whitelist sort columns
    const allowedSortColumns = ['createdAt', 'updatedAt', 'title', 'status', 'ai_urgency_level', 'category'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'createdAt';
    const safeSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    const { count, rows } = await Complaint.findAndCountAll({
      where,
      include: [{ model: User, as: 'reporter', attributes: ['id', 'name', 'email', 'phone'] }],
      order: [[safeSortBy, safeSortOrder]],
      limit: parseInt(limit),
      offset
    });

    res.json({
      complaints: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Admin tickets error:', error.message);
    res.status(500).json({ message: 'Gagal mengambil daftar laporan.' });
  }
});

// GET /api/admin/tickets/:id - Detail laporan
router.get('/tickets/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findByPk(req.params.id, {
      include: [{ model: User, as: 'reporter', attributes: ['id', 'name', 'email', 'phone'] }]
    });

    if (!complaint) {
      return res.status(404).json({ message: 'Laporan tidak ditemukan.' });
    }

    res.json({ complaint });
  } catch (error) {
    console.error('Admin ticket detail error:', error.message);
    res.status(500).json({ message: 'Gagal mengambil detail laporan.' });
  }
});

// PATCH /api/admin/tickets/:id/status - Update status laporan
router.patch('/tickets/:id/status', async (req, res) => {
  try {
    const { status, admin_notes } = req.body;
    const validStatuses = ['Menunggu', 'Diproses', 'Selesai', 'Ditolak'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: `Status tidak valid. Pilih: ${validStatuses.join(', ')}` });
    }

    const complaint = await Complaint.findByPk(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Laporan tidak ditemukan.' });
    }

    await complaint.update({ status, admin_notes: admin_notes || complaint.admin_notes });

    res.json({
      message: `Status laporan berhasil diubah ke "${status}".`,
      complaint
    });
  } catch (error) {
    console.error('Update status error:', error.message);
    res.status(500).json({ message: 'Gagal mengubah status laporan.' });
  }
});

// GET /api/admin/users - Daftar semua warga
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await User.findAndCountAll({
      where: { role: 'warga' },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      users: rows,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / parseInt(limit)) }
    });
  } catch (error) {
    console.error('Admin users error:', error.message);
    res.status(500).json({ message: 'Gagal mengambil daftar pengguna.' });
  }
});

module.exports = router;
