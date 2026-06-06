const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Nama tidak boleh kosong.' },
      len: { args: [2, 150], msg: 'Nama harus antara 2-150 karakter.' }
    }
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: { msg: 'Email sudah terdaftar.' },
    validate: {
      isEmail: { msg: 'Format email tidak valid.' },
      notEmpty: { msg: 'Email tidak boleh kosong.' }
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('warga', 'admin'),
    allowNull: false,
    defaultValue: 'warga'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'users',
  timestamps: true
});

module.exports = User;
