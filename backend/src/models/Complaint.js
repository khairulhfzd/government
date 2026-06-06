const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');
const User = require('./User');

const Complaint = sequelize.define('Complaint', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  user_id: {
    type: DataTypes.STRING(36),
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Judul laporan tidak boleh kosong.' },
      len: { args: [5, 255], msg: 'Judul harus antara 5-255 karakter.' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Deskripsi laporan tidak boleh kosong.' },
      len: { args: [20, 5000], msg: 'Deskripsi harus antara 20-5000 karakter.' }
    }
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM(
      'Infrastruktur',
      'Lingkungan',
      'Keamanan',
      'Kesehatan',
      'Pendidikan',
      'Administrasi',
      'Lainnya'
    ),
    allowNull: false,
    defaultValue: 'Lainnya'
  },
  ai_summary: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ai_urgency_level: {
    type: DataTypes.ENUM('High', 'Medium', 'Low'),
    allowNull: true,
    defaultValue: 'Medium'
  },
  status: {
    type: DataTypes.ENUM('Menunggu', 'Diproses', 'Selesai', 'Ditolak'),
    allowNull: false,
    defaultValue: 'Menunggu'
  },
  admin_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'complaints',
  timestamps: true
});

// Associations
Complaint.belongsTo(User, { foreignKey: 'user_id', as: 'reporter' });
User.hasMany(Complaint, { foreignKey: 'user_id', as: 'complaints' });

module.exports = Complaint;
