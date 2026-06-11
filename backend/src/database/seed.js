require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('./db');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Submission = require('../models/Submission');


async function seed() {
  try {
    console.log('🔄 Menghubungkan ke database...');
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    // ============================================================
    // USERS
    // ============================================================
    const adminPassword  = await bcrypt.hash('admin123', 10);
    const wargaPassword  = await bcrypt.hash('warga123', 10);

    const usersData = [
      { id: uuidv4(), name: 'Administrator Sistem', email: 'admin@pengaduan.go.id', password: adminPassword, phone: '08001234567', role: 'admin' },
      { id: uuidv4(), name: 'Budi Santoso',         email: 'budi@email.com',        password: wargaPassword, phone: '08119876543', role: 'warga' },
      { id: uuidv4(), name: 'Siti Rahayu',          email: 'siti@email.com',        password: wargaPassword, phone: '08223344556', role: 'warga' },
      { id: uuidv4(), name: 'Ahmad Fauzi',          email: 'ahmad@email.com',       password: wargaPassword, phone: '08334455667', role: 'warga' },
      { id: uuidv4(), name: 'Dewi Lestari',         email: 'dewi@email.com',        password: wargaPassword, phone: '08445566778', role: 'warga' },
    ];

    const createdUsers = {};
    for (const u of usersData) {
      const [user, created] = await User.findOrCreate({ where: { email: u.email }, defaults: { ...u, is_active: true } });
      if (!created) {
        await user.update({ password: u.password, name: u.name, role: u.role, is_active: true });
        await user.reload();
      }
      createdUsers[u.email] = user;
      console.log(`✅ User: ${user.email} (verified/updated)`);
    }

    const w1 = createdUsers['budi@email.com'];
    const w2 = createdUsers['siti@email.com'];
    const w3 = createdUsers['ahmad@email.com'];
    const w4 = createdUsers['dewi@email.com'];

    // ============================================================
    // COMPLAINTS — 20 data beragam
    // ============================================================
    const complaintsData = [
      // --- INFRASTRUKTUR ---
      {
        user_id: w1.id,
        title: 'Jalan Berlubang di Jl. Merdeka No. 12',
        description: 'Terdapat lubang besar di tengah jalan yang sudah berlangsung 3 minggu dan sangat membahayakan pengendara motor maupun mobil. Sudah ada 2 motor yang jatuh akibat lubang ini. Lubang berdiameter sekitar 50cm dan kedalaman 20cm.',
        category: 'Infrastruktur',
        ai_summary: '[High Priority] Kerusakan jalan berlubang di area Jl. Merdeka yang berpotensi membahayakan keselamatan lalu lintas. Diperlukan perbaikan segera. Laporan berjudul "Jalan Berlubang di Jl. Merdeka No. 12" telah dianalisis secara otomatis.',
        ai_urgency_level: 'High',
        status: 'Menunggu',
        admin_notes: null,
      },
      {
        user_id: w2.id,
        title: 'Jembatan Kayu Rapuh di Desa Sukamaju',
        description: 'Jembatan kayu penghubung antar dusun sudah sangat rapuh dan beberapa papan telah patah. Warga takut untuk melintas terutama kendaraan bermotor. Diperlukan perbaikan darurat sebelum terjadi kecelakaan fatal.',
        category: 'Infrastruktur',
        ai_summary: '[High Priority] Infrastruktur jembatan yang kondisinya kritis dan membahayakan keselamatan warga. Laporan ini membutuhkan penanganan segera dari dinas PUPR.',
        ai_urgency_level: 'High',
        status: 'Diproses',
        admin_notes: 'Tim PUPR dijadwalkan survei pada tanggal 10 Juni 2026.',
      },
      {
        user_id: w3.id,
        title: 'Saluran Drainase Tersumbat di RW 04',
        description: 'Saluran drainase di sepanjang Jl. Kenanga tersumbat sampah dan lumpur. Setiap hujan lebat, air meluap ke jalan dan masuk ke halaman rumah warga. Sudah terjadi selama 2 bulan.',
        category: 'Infrastruktur',
        ai_summary: '[Medium Priority] Sarana drainase yang tidak berfungsi optimal menyebabkan genangan air dan potensi banjir di pemukiman warga.',
        ai_urgency_level: 'Medium',
        status: 'Selesai',
        admin_notes: 'Drainase telah dibersihkan oleh tim DPU pada 28 Mei 2026. Kasus ditutup.',
      },
      {
        user_id: w4.id,
        title: 'Trotoar Rusak dan Berlumut di Jl. Sudirman',
        description: 'Trotoar di sepanjang Jl. Sudirman banyak yang retak, berlumut, dan tidak rata. Sangat berbahaya untuk pejalan kaki terutama lansia dan anak-anak sekolah.',
        category: 'Infrastruktur',
        ai_summary: '[Low Priority] Kerusakan fasilitas trotoar yang mengurangi kenyamanan dan keamanan pejalan kaki di area publik.',
        ai_urgency_level: 'Low',
        status: 'Menunggu',
        admin_notes: null,
      },

      // --- LINGKUNGAN ---
      {
        user_id: w1.id,
        title: 'Tumpukan Sampah Tidak Diangkut 5 Hari',
        description: 'Sampah di RT 05 RW 02 sudah menumpuk selama 5 hari dan tidak diangkut oleh petugas kebersihan. Bau menyengat dan dikhawatirkan menjadi sarang nyamuk dan tikus. Warga sudah melaporkan ke ketua RT namun belum ada tindakan.',
        category: 'Lingkungan',
        ai_summary: '[Medium Priority] Penumpukan sampah di pemukiman warga yang berpotensi menimbulkan masalah kesehatan dan sanitasi lingkungan.',
        ai_urgency_level: 'Medium',
        status: 'Diproses',
        admin_notes: 'Dinas kebersihan sudah dijadwalkan pengangkutan hari Kamis.',
      },
      {
        user_id: w2.id,
        title: 'Limbah Pabrik Dibuang ke Sungai Ciawi',
        description: 'Sebuah pabrik tekstil di kawasan industri membuang limbah berwarna hitam pekat ke Sungai Ciawi setiap malam hari. Air sungai kini berbau busuk dan ikan-ikan banyak yang mati. Warga tidak bisa menggunakan air sungai seperti biasanya.',
        category: 'Lingkungan',
        ai_summary: '[High Priority] Pencemaran sungai akibat pembuangan limbah industri yang berdampak besar pada ekosistem dan kesehatan warga sekitar.',
        ai_urgency_level: 'High',
        status: 'Diproses',
        admin_notes: 'Dinas lingkungan hidup sedang melakukan investigasi dan pengambilan sampel air.',
      },
      {
        user_id: w3.id,
        title: 'Pohon Besar Tumbang Menghalangi Jalan',
        description: 'Pohon besar di pinggir Jl. Pahlawan tumbang akibat hujan deras dan angin kencang tadi malam. Pohon menghalangi setengah badan jalan dan menyebabkan kemacetan parah.',
        category: 'Lingkungan',
        ai_summary: '[High Priority] Pohon tumbang yang membahayakan keselamatan dan mengganggu arus lalu lintas. Perlu penanganan evakuasi segera.',
        ai_urgency_level: 'High',
        status: 'Selesai',
        admin_notes: 'Pohon berhasil dipotong dan jalan sudah bisa dilalui kembali pada pukul 08.00 WIB.',
      },
      {
        user_id: w4.id,
        title: 'Taman Kota Tidak Terawat dan Kotor',
        description: 'Taman kota di dekat alun-alun sudah lama tidak dirawat. Rumput tinggi, sampah berserakan, lampu taman banyak yang mati, dan fasilitas bermain anak rusak. Warga sudah enggan menggunakan taman.',
        category: 'Lingkungan',
        ai_summary: '[Low Priority] Kondisi taman kota yang tidak terawat menurunkan kualitas ruang publik dan fasilitas rekreasi warga.',
        ai_urgency_level: 'Low',
        status: 'Menunggu',
        admin_notes: null,
      },

      // --- KEAMANAN ---
      {
        user_id: w1.id,
        title: 'Lampu Jalan Mati di Gang Mawar Selama 2 Minggu',
        description: 'Lampu penerangan jalan di Gang Mawar dan Gang Melati sudah mati selama 2 minggu. Kondisi sangat gelap di malam hari. Sudah ada 1 kejadian jambret dan warga semakin resah.',
        category: 'Keamanan',
        ai_summary: '[Medium Priority] Kerusakan lampu penerangan jalan yang menyebabkan potensi gangguan keamanan dan keselamatan warga di malam hari.',
        ai_urgency_level: 'Medium',
        status: 'Selesai',
        admin_notes: 'Lampu jalan telah diperbaiki oleh PLN pada 1 Juni 2026.',
      },
      {
        user_id: w2.id,
        title: 'Maling Motor Meresahkan Warga Perumahan',
        description: 'Dalam 2 minggu terakhir sudah terjadi 4 kali pencurian motor di Perumahan Griya Asri. Pelaku beraksi dini hari antara pukul 02.00-04.00. Warga sudah lapor ke polsek namun belum ada patroli tambahan.',
        category: 'Keamanan',
        ai_summary: '[High Priority] Rangkaian kejadian pencurian kendaraan bermotor yang meresahkan warga dan memerlukan peningkatan patroli keamanan segera.',
        ai_urgency_level: 'High',
        status: 'Diproses',
        admin_notes: 'Koordinasi dengan Polsek sedang dilakukan untuk penambahan patroli malam.',
      },
      {
        user_id: w3.id,
        title: 'Judi Online dan Perjudian di Warung Angkringan',
        description: 'Terdapat aktivitas perjudian dan judi online yang dilakukan terang-terangan di sebuah warung angkringan di Jl. Kebon Jeruk No. 7. Kegiatan ini berlangsung setiap malam dan meresahkan warga sekitar.',
        category: 'Keamanan',
        ai_summary: '[Medium Priority] Dugaan aktivitas perjudian ilegal di area publik yang meresahkan masyarakat sekitar dan memerlukan penanganan aparat.',
        ai_urgency_level: 'Medium',
        status: 'Menunggu',
        admin_notes: null,
      },

      // --- KESEHATAN ---
      {
        user_id: w4.id,
        title: 'Wabah DBD Meningkat di Kelurahan Cempaka',
        description: 'Dalam satu bulan terakhir sudah ada 12 warga yang terdiagnosis Demam Berdarah Dengue di Kelurahan Cempaka. Fogging sudah diminta namun belum dilaksanakan. Kondisi darurat mengingat musim hujan masih berlanjut.',
        category: 'Kesehatan',
        ai_summary: '[High Priority] Peningkatan kasus DBD yang signifikan dan memerlukan intervensi fogging dan pemantauan kesehatan masyarakat secara mendesak.',
        ai_urgency_level: 'High',
        status: 'Diproses',
        admin_notes: 'Dinas kesehatan menjadwalkan fogging massal pada 7 Juni 2026 dan distribusi abate.',
      },
      {
        user_id: w1.id,
        title: 'Antrean BPJS di Puskesmas Sangat Panjang',
        description: 'Setiap hari antrean di Puskesmas Kecamatan sangat panjang, warga harus mengambil nomor antrean dari subuh. Banyak pasien lansia yang kelelahan. Kapasitas dokter tidak mencukupi jumlah pasien.',
        category: 'Kesehatan',
        ai_summary: '[Medium Priority] Pelayanan kesehatan puskesmas yang tidak memadai kapasitasnya dan menyebabkan antrean panjang yang merugikan warga.',
        ai_urgency_level: 'Medium',
        status: 'Menunggu',
        admin_notes: null,
      },
      {
        user_id: w2.id,
        title: 'Air PDAM Berbau dan Berwarna Kuning',
        description: 'Sudah 3 hari air PDAM yang mengalir ke rumah warga di Blok D berbau seperti besi dan berwarna kekuningan. Air tidak layak konsumsi. Warga terpaksa membeli air galon setiap hari yang memberatkan ekonomi.',
        category: 'Kesehatan',
        ai_summary: '[High Priority] Kualitas air bersih PDAM yang tidak layak konsumsi dan berpotensi membahayakan kesehatan warga secara langsung.',
        ai_urgency_level: 'High',
        status: 'Ditolak',
        admin_notes: 'Pengaduan diteruskan ke PDAM Tirta Mulia karena bukan kewenangan pemerintah daerah. Silakan hubungi call center PDAM: 0800-1234-5678.',
      },

      // --- PENDIDIKAN ---
      {
        user_id: w3.id,
        title: 'Atap SDN 02 Bocor Sudah Bertahun-tahun',
        description: 'Atap ruang kelas 4, 5, dan 6 di SDN 02 Kertosono bocor parah saat hujan. Siswa harus memindahkan meja dan bangku ke sudut kelas yang tidak bocor. Kondisi ini sudah berlangsung lebih dari 2 tahun namun belum diperbaiki.',
        category: 'Pendidikan',
        ai_summary: '[High Priority] Kerusakan fasilitas fisik sekolah yang mengganggu proses belajar mengajar dan berpotensi membahayakan keselamatan siswa.',
        ai_urgency_level: 'High',
        status: 'Diproses',
        admin_notes: 'Dinas pendidikan sudah meninjau lokasi dan akan menganggarkan perbaikan di APBD perubahan.',
      },
      {
        user_id: w4.id,
        title: 'Guru PNS Sering Tidak Masuk Mengajar',
        description: 'Terdapat seorang guru PNS di SMPN 3 yang sering tidak hadir mengajar tanpa keterangan yang jelas. Dalam sebulan terakhir, guru tersebut absen lebih dari 10 hari. Siswa kelas 8C sering tidak ada yang mengajar mata pelajaran Matematika.',
        category: 'Pendidikan',
        ai_summary: '[Medium Priority] Pelanggaran disiplin aparatur sipil negara yang berdampak langsung pada kualitas pendidikan siswa.',
        ai_urgency_level: 'Medium',
        status: 'Menunggu',
        admin_notes: null,
      },

      // --- ADMINISTRASI ---
      {
        user_id: w1.id,
        title: 'Pelayanan KTP di Disdukcapil Sangat Lambat',
        description: 'Proses pembuatan KTP di kantor Disdukcapil memakan waktu lebih dari 3 bulan. Warga sudah bolak-balik 5 kali namun selalu mendapat alasan berbeda (blanko habis, sistem error, dll). Padahal sudah ada aturan 14 hari kerja.',
        category: 'Administrasi',
        ai_summary: '[Medium Priority] Pelayanan dokumen administrasi kependudukan yang tidak sesuai standar waktu pelayanan yang ditetapkan pemerintah.',
        ai_urgency_level: 'Medium',
        status: 'Diproses',
        admin_notes: 'Sudah berkoordinasi dengan Disdukcapil. KTP akan selesai dalam 5 hari kerja.',
      },
      {
        user_id: w2.id,
        title: 'Pungli di Pelayanan Surat Keterangan',
        description: 'Petugas di kantor kelurahan meminta uang "sukarela" untuk pengurusan surat keterangan domisili dan surat tidak mampu. Besaran yang diminta Rp 50.000 - Rp 100.000 per surat. Warga tidak berani menolak karena takut surat tidak diproses.',
        category: 'Administrasi',
        ai_summary: '[High Priority] Dugaan praktik pungutan liar oleh oknum petugas pelayanan publik yang melanggar hukum dan merugikan masyarakat.',
        ai_urgency_level: 'High',
        status: 'Diproses',
        admin_notes: 'Laporan diteruskan ke Inspektorat Daerah untuk penyelidikan lebih lanjut. Terima kasih atas keberanian pelapor.',
      },
      {
        user_id: w3.id,
        title: 'Website Pelayanan Online Tidak Bisa Diakses',
        description: 'Website pelayanan administrasi online milik pemda sudah tidak bisa diakses selama 2 minggu terakhir. Warga yang ingin mengurus perizinan usaha secara online tidak bisa melakukannya dan harus datang langsung.',
        category: 'Administrasi',
        ai_summary: '[Low Priority] Gangguan layanan digital pemerintah yang menghambat kemudahan pelayanan publik berbasis teknologi.',
        ai_urgency_level: 'Low',
        status: 'Selesai',
        admin_notes: 'Website sudah diperbaiki oleh tim IT Pemda. Layanan online dapat diakses kembali.',
      },
      {
        user_id: w4.id,
        title: 'Bantuan Sosial Tidak Tepat Sasaran',
        description: 'Di Desa Tanjungsari, terdapat 15 keluarga mampu yang masih menerima bantuan sosial PKH dan BPNT. Sementara beberapa keluarga tidak mampu malah tidak terdaftar sebagai penerima. Warga sudah melapor ke RT dan RW namun tidak ada perubahan.',
        category: 'Administrasi',
        ai_summary: '[Medium Priority] Ketidaktepatan distribusi bantuan sosial yang perlu ditinjau ulang melalui pemutakhiran data penerima manfaat.',
        ai_urgency_level: 'Medium',
        status: 'Menunggu',
        admin_notes: null,
      },
    ];

    // Hapus complaints lama jika ada (untuk re-seed bersih)
    const existingCount = await Complaint.count();
    if (existingCount > 0) {
      console.log(`ℹ️  Melewati pembuatan complaints (sudah ada ${existingCount} data). Gunakan --force untuk reset.`);
    } else {
      for (const c of complaintsData) {
        await Complaint.create({ id: uuidv4(), ...c });
      }
      console.log(`✅ ${complaintsData.length} complaints berhasil di-seed.`);
    }

    const submissionsData = [
      {
        user_id: w1.id,
        type: 'Surat Pengantar Domisili',
        title: 'Pengajuan Pengantar Domisili - Budi Santoso',
        description: 'Saya membutuhkan surat pengantar domisili untuk keperluan pembukaan rekening bank baru di wilayah domisili saat ini.',
        status: 'Menunggu'
      },
      {
        user_id: w2.id,
        type: 'Kartu Keluarga Baru',
        title: 'Pengajuan KK Baru Karena Pernikahan - Siti Rahayu',
        description: 'Kami ingin membuat kartu keluarga baru terpisah dari orang tua karena baru saja melangsungkan pernikahan.',
        status: 'Diproses',
        admin_notes: 'Berkas sedang diverifikasi oleh Dinas Kependudukan.'
      },
      {
        user_id: w3.id,
        type: 'Surat Keterangan Tidak Mampu',
        title: 'Pengajuan SKTM Untuk Beasiswa Sekolah - Ahmad Fauzi',
        description: 'Pengajuan SKTM sebagai syarat kelengkapan pendaftaran beasiswa kelanjutan studi anak saya di perguruan tinggi.',
        status: 'Selesai',
        admin_notes: 'Surat Keterangan Tidak Mampu telah diterbitkan dan dikirim ke email pemohon.'
      },
      {
        user_id: w4.id,
        type: 'KTP Baru / Rusak',
        title: 'Pengajuan Cetak Ulang KTP Rusak - Dewi Lestari',
        description: 'KTP fisik saya patah di bagian ujung dan chip tidak terbaca. Saya melampirkan foto KTP lama yang rusak.',
        status: 'Menunggu'
      }
    ];

    const existingSubCount = await Submission.count();
    if (existingSubCount > 0) {
      console.log(`ℹ️  Melewati pembuatan submissions (sudah ada ${existingSubCount} data).`);
    } else {
      for (const s of submissionsData) {
        await Submission.create({ id: uuidv4(), ...s });
      }
      console.log(`✅ ${submissionsData.length} submissions berhasil di-seed.`);
    }

    console.log('\n🎉 Seeding selesai!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Admin  : admin@pengaduan.go.id / admin123');
    console.log('📧 Warga 1: budi@email.com / warga123');
    console.log('📧 Warga 2: siti@email.com / warga123');
    console.log('📧 Warga 3: ahmad@email.com / warga123');
    console.log('📧 Warga 4: dewi@email.com / warga123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding gagal:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seed();
