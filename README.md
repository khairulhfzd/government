# Portal Pengaduan Masyarakat Pintar

Aplikasi E-Government untuk pengelolaan pengaduan masyarakat secara digital.

## Struktur Proyek

```
government/
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── database/
│   │   │   ├── db.js         # Koneksi Sequelize MySQL
│   │   │   ├── schema.sql    # DDL Script (bisa dijalankan di HeidiSQL)
│   │   │   ├── migrate.js    # Script migrasi otomatis
│   │   │   └── seed.js       # Data awal (admin + contoh laporan)
│   │   ├── models/
│   │   │   ├── User.js       # Model pengguna
│   │   │   └── Complaint.js  # Model laporan
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js    # JWT + RBAC
│   │   │   └── upload.middleware.js  # Multer file upload
│   │   ├── routes/
│   │   │   ├── auth.routes.js        # /api/auth/*
│   │   │   ├── complaint.routes.js   # /api/complaints/*
│   │   │   └── admin.routes.js       # /api/admin/*
│   │   ├── services/
│   │   │   └── aiService.js  # Mock AI (analisis kategori & urgensi)
│   │   ├── app.js            # Express app setup
│   │   └── server.js         # Entry point
│   ├── uploads/              # Folder upload foto (dibuat otomatis)
│   ├── .env                  # Environment variables
│   └── package.json
│
└── frontend/                 # React + Vite + Tailwind CSS
    ├── src/
    │   ├── components/
    │   │   ├── CitizenLayout.jsx   # Layout mobile-first untuk warga
    │   │   └── AdminLayout.jsx     # Layout dark dashboard untuk admin
    │   ├── context/
    │   │   └── AuthContext.jsx     # Global auth state + JWT management
    │   ├── pages/
    │   │   ├── LoginPage.jsx       # /login
    │   │   ├── RegisterPage.jsx    # /register
    │   │   ├── warga/
    │   │   │   ├── Dashboard.jsx   # /warga/dashboard
    │   │   │   ├── Lapor.jsx       # /warga/lapor
    │   │   │   └── Riwayat.jsx     # /warga/riwayat
    │   │   └── admin/
    │   │       ├── Dashboard.jsx   # /admin/dashboard
    │   │       ├── Tiket.jsx       # /admin/tiket
    │   │       └── TiketDetail.jsx # /admin/tiket/:id
    │   ├── services/
    │   │   └── api.js              # Axios instance + interceptors
    │   └── utils/
    │       └── constants.js        # Konstanta & helper functions
    └── package.json
```

## Setup & Menjalankan

### 1. Persiapan Database MySQL

**Opsi A - Via HeidiSQL (Direkomendasikan):**
1. Buka HeidiSQL, connect ke localhost:3306
2. Buka `backend/src/database/schema.sql`
3. Jalankan seluruh script

**Opsi B - Via Command Line:**
```bash
mysql -u root -p < backend/src/database/schema.sql
```

### 2. Konfigurasi Backend

```bash
cd backend
# Salin dan sesuaikan .env
cp .env.example .env
# Edit .env: set DB_PASSWORD sesuai MySQL Anda

# Install dependencies
npm install

# Migrasi & seed otomatis (opsional, jika tidak pakai schema.sql)
npm run db:migrate
npm run db:seed

# Jalankan server
npm run dev
```

### 3. Jalankan Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Akses Aplikasi

| URL | Deskripsi |
|-----|-----------|
| http://localhost:5173 | Frontend React |
| http://localhost:5000/api/health | Backend health check |

## Akun Demo

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@pengaduan.go.id | admin123 |
| Warga | budi@email.com | warga123 |

## Fitur Utama

- ✅ Autentikasi JWT dengan RBAC (Role-Based Access Control)
- ✅ Portal Warga: Dashboard, Form Laporan, Riwayat
- ✅ Admin Dashboard: Statistik, Donut Chart, Tabel DataTable
- ✅ Mock AI: Analisis kategori & urgensi otomatis saat submit laporan
- ✅ Upload foto bukti (Multer)
- ✅ Filter multi-kolom + sorting pada tabel admin
- ✅ Design mobile-first untuk warga
- ✅ Dark analytics dashboard untuk admin

## Environment Variables

```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=pengaduan_db
DB_USER=root
DB_PASSWORD=          # <-- Isi sesuai MySQL Anda
JWT_SECRET=...        # <-- Ganti dengan string acak panjang
```
