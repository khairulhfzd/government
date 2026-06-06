const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');
const User = require('./User');

const Submission = sequelize.define('Submission', {
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
  type: {
    type: DataTypes.ENUM(
      'Surat Pengantar Domisili',
      'Kartu Keluarga Baru',
      'Surat Keterangan Tidak Mampu',
      'KTP Baru / Rusak',
      'Lainnya'
    ),
    allowNull: false,
    defaultValue: 'Lainnya'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Judul pengajuan tidak boleh kosong.' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Keterangan pengajuan tidak boleh kosong.' }
    }
  },
  document_url: {
    type: DataTypes.STRING(500),
    allowNull: true
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
  tableName: 'submissions',
  timestamps: true
});

// Associations
Submission.belongsTo(User, { foreignKey: 'user_id', as: 'applicant' });
User.hasMany(Submission, { foreignKey: 'user_id', as: 'submissions' });

module.exports = Submission;
