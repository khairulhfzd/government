require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const sequelize = require('./db');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Submission = require('../models/Submission');

async function migrate() {
  try {
    console.log('🔄 Menghubungkan ke database...');
    await sequelize.authenticate();
    console.log('✅ Koneksi berhasil.');
    
    console.log('🔄 Membuat/memperbarui tabel...');
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Migrasi selesai! Tabel telah dibuat/diperbarui.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migrasi gagal:', error.message);
    process.exit(1);
  }
}

migrate();
