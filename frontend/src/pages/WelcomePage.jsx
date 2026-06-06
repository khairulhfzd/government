import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, FileText, CheckCircle2, Clock, ArrowRight, 
  MapPin, Phone, Users, Activity, FileCheck, Lock, 
  Layers, Check, Sparkles, MessageSquare, Award, ArrowUpRight
} from 'lucide-react';

export default function WelcomePage() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStartLapor = () => {
    if (token) {
      navigate(user?.role === 'admin' ? '/admin/dashboard' : '/warga/lapor');
    } else {
      navigate('/login');
    }
  };

  const handleStartPengajuan = () => {
    if (token) {
      navigate(user?.role === 'admin' ? '/admin/dashboard' : '/warga/pengajuan');
    } else {
      navigate('/login');
    }
  };

  const handleNav = (path) => {
    if (token) {
      navigate(user?.role === 'admin' ? '/admin/dashboard' : path);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFCFF] text-slate-900 font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden">
      
      {/* ── HEADER NAVIGATION ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-100 py-4' : 'bg-transparent py-6'
      }`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-extrabold text-sm text-slate-900 leading-none tracking-tight">KOTA DIGITAL</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Portal Warga</p>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <button onClick={() => handleNav('/warga/lapor')} className="hover:text-blue-600 transition-colors font-semibold bg-transparent border-none cursor-pointer p-0">
              Laporkan Kendala
            </button>
            <button onClick={() => handleNav('/warga/riwayat')} className="hover:text-blue-600 transition-colors font-semibold bg-transparent border-none cursor-pointer p-0">
              Riwayat Laporan
            </button>
            <button onClick={() => handleNav('/warga/pengajuan')} className="hover:text-blue-600 transition-colors font-semibold bg-transparent border-none cursor-pointer p-0">
              Pengajuan Surat
            </button>
          </div>

          {/* CTA Button */}
          <div>
            {token ? (
              <div className="flex items-center gap-3">
                {user?.role === 'warga' && (
                  <span className="hidden lg:inline text-xs text-slate-500 font-bold bg-slate-100 px-3 py-1.5 rounded-full">
                    Warga: {user.name}
                  </span>
                )}
                {user?.role === 'admin' ? (
                  <Link to="/admin/dashboard"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-full shadow-md shadow-blue-600/10 hover:shadow-lg transition-all flex items-center gap-1.5">
                    Dashboard Admin <ArrowRight size={13} />
                  </Link>
                ) : (
                  <button onClick={logout}
                    className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-full transition-all">
                    Keluar
                  </button>
                )}
              </div>
            ) : (
              <Link to="/login"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-full hover:shadow-md transition-all">
                Masuk / Daftar
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="relative pt-36 pb-20 bg-gradient-to-b from-blue-50/40 via-sky-50/10 to-transparent overflow-hidden">
        
        {/* Soft Background Gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-sky-400/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          
          {/* Centered Badge */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold mb-6">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
            Layanan Terpadu Satu Pintu Kota Digital
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-slate-900 font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight mb-6">
            Layanan Administrasi & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">
              Aduan Warga Lebih Cepat
            </span>
          </motion.h1>

          {/* Supporting Text */}
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8 max-w-2xl mx-auto">
            Satu platform resmi untuk memproses surat keterangan, kependudukan, pengaduan masalah fasilitas publik secara transparan, akuntabel, dan diproses langsung oleh dinas terkait kota.
          </motion.p>

          {/* Two CTA Buttons */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <button onClick={handleStartPengajuan}
              className="px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-full shadow-lg shadow-blue-600/20 hover:shadow-xl hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2">
              <FileCheck size={15} /> Mulai Pengajuan Surat
            </button>
            <button onClick={handleStartLapor}
              className="px-7 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-full border border-slate-200 shadow-sm hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2">
              <FileText size={15} /> Laporkan Kendala Fasilitas
            </button>
          </motion.div>

          {/* Floating Application Mockup */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, type: 'spring', stiffness: 50 }}
            className="relative mx-auto max-w-5xl rounded-[2.5rem] bg-white p-3.5 shadow-2xl border border-slate-100/50 backdrop-blur-sm">
            <div className="rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-900/5 aspect-[16/10] relative shadow-inner">
              
              {/* Fake Application Window UI */}
              <div className="absolute inset-0 flex flex-col bg-slate-50 text-left">
                {/* Window top bar */}
                <div className="bg-white border-b border-slate-150 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-red-400 rounded-full" />
                    <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full" />
                    <span className="w-2.5 h-2.5 bg-green-400 rounded-full" />
                    <span className="text-[10px] font-bold text-slate-400 ml-3">portal.kotadigital.go.id/warga/dashboard</span>
                  </div>
                  <div className="w-32 h-6 bg-slate-100 rounded-lg flex items-center justify-center text-[9px] text-slate-400 font-bold">
                    🔒 Sambungan Aman
                  </div>
                </div>

                {/* Main app body */}
                <div className="flex-1 grid grid-cols-4 divide-x divide-slate-150">
                  {/* Left Sidebar */}
                  <div className="p-4 space-y-3 bg-white hidden sm:block">
                    <div className="h-4 w-20 bg-blue-100 rounded" />
                    <div className="space-y-2 pt-4">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-slate-200 rounded-md" />
                          <div className="h-3 w-16 bg-slate-150 rounded" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Main Grid Content */}
                  <div className="col-span-4 sm:col-span-3 p-5 space-y-4 overflow-hidden">
                    {/* Header welcome */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="h-4 w-36 bg-slate-300 rounded" />
                        <div className="h-3 w-48 bg-slate-200 rounded" />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-blue-100" />
                    </div>

                    {/* Dashboard cards */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { val: '12', label: 'Laporan Masuk', color: 'bg-blue-500/10 text-blue-600' },
                        { val: '8', label: 'Sedang Diproses', color: 'bg-amber-500/10 text-amber-600' },
                        { val: '4', label: 'Telah Selesai', color: 'bg-emerald-500/10 text-emerald-600' },
                      ].map((item, idx) => (
                        <div key={idx} className="p-3 bg-white border border-slate-150 rounded-xl space-y-1.5 shadow-sm">
                          <p className={`text-base font-black ${item.color.split(' ')[1]}`}>{item.val}</p>
                          <p className="text-[9px] font-bold text-slate-400">{item.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Table / List representation */}
                    <div className="bg-white border border-slate-150 rounded-xl p-4 space-y-3 shadow-sm">
                      <div className="h-3.5 w-24 bg-slate-250 rounded mb-2 bg-slate-355 bg-slate-300" />
                      {[
                        { title: 'Perbaikan Jalan Berlubang Margonda', status: 'Selesai', color: 'bg-emerald-100 text-emerald-700' },
                        { title: 'Pengajuan Surat Keterangan Domisili', status: 'Diproses', color: 'bg-amber-100 text-amber-700' },
                        { title: 'Lampu Penerangan Jalan Padam', status: 'Menunggu', color: 'bg-slate-100 text-slate-600' },
                      ].map((row, rIdx) => (
                        <div key={rIdx} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 last:border-0">
                          <span className="font-semibold text-slate-700 truncate max-w-xs">{row.title}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${row.color}`}>{row.status}</span>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>

              </div>

            </div>
          </motion.div>

        </div>
      </section>

      {/* ── CLIENT/PARTNER LOGOS ── */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
            Mitra Integrasi & Sertifikasi Keamanan Publik
          </p>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-50 grayscale hover:opacity-75 transition-all">
            <div className="text-slate-800 font-extrabold text-sm tracking-wide">🛡️ BADAN SIBER NASIONAL</div>
            <div className="text-slate-800 font-extrabold text-sm tracking-wide">🏛️ KEMENTERIAN KOMINFO</div>
            <div className="text-slate-800 font-extrabold text-sm tracking-wide">📊 SATU DATA INDONESIA</div>
            <div className="text-slate-800 font-extrabold text-sm tracking-wide">✅ ISO 27001 SECURITY</div>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ("Unlock Premium Benefits") ── */}
      <section id="fitur" className="py-24 bg-[#FAFCFF] relative">
        <div className="max-w-6xl mx-auto px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Fitur Portal Kota</span>
            <h2 className="text-slate-900 font-black text-3xl sm:text-4xl mt-3 leading-tight">
              Nikmati Kemudahan Layanan Publik dalam Satu Genggaman
            </h2>
            <p className="text-slate-500 text-sm mt-4">
              Kami mendesain fitur terpadu yang membantu menyingkat waktu proses birokrasi, memberikan laporan yang transparan, dan melacak penyelesaian secara real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1: Pengaduan Fasilitas */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between shadow-card hover:shadow-lg transition-all group">
              <div>
                <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <MapPin size={20} />
                </div>
                <h3 className="text-slate-900 font-extrabold text-lg mb-3">Pengaduan Fasilitas</h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-6">
                  Laporkan kendala di lapangan seperti jalan rusak, pohon tumbang, lampu mati, atau sampah liar dalam 2 menit.
                </p>
              </div>
              
              {/* Miniature Card Widget inside */}
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-[10px] space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Tiket Laporan #0921</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-bold rounded-full">Diproses</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 w-2/3" />
                </div>
                <p className="text-slate-400 font-medium">Tim dinas tata kota dalam perjalanan menuju lokasi.</p>
              </div>
            </div>

            {/* Card 2: Pengajuan Dokumen */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between shadow-card hover:shadow-lg transition-all group">
              <div>
                <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <FileText size={20} />
                </div>
                <h3 className="text-slate-900 font-extrabold text-lg mb-3">Administrasi Kependudukan</h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-6">
                  Buat Surat Domisili, SKTM, perbaikan Kartu Keluarga secara instan dengan mengunggah berkas pendukung langsung dari rumah.
                </p>
              </div>

              {/* Miniature Card Widget inside */}
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                    <FileCheck size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-800">Surat Pengantar Domisili</p>
                    <p className="text-[8px] text-slate-455 text-slate-500">Telah diterbitkan & siap diunduh</p>
                  </div>
                </div>
                <div className="h-7 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center text-[9px] font-bold cursor-pointer transition-colors">
                  Unduh Dokumen Resmi
                </div>
              </div>
            </div>

            {/* Card 3: Keamanan & Notifikasi */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between shadow-card hover:shadow-lg transition-all group">
              <div>
                <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Lock size={20} />
                </div>
                <h3 className="text-slate-900 font-extrabold text-lg mb-3">Keamanan Enskripsi Data</h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-6">
                  Seluruh data kependudukan dan lampiran dilindungi dengan standar keamanan tinggi sesuai peraturan perlindungan data pribadi.
                </p>
              </div>

              {/* Miniature Card Widget inside */}
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-[10px] space-y-2">
                <div className="flex items-center gap-1.5 text-indigo-600 font-bold">
                  <Shield size={12} />
                  <span>Sertifikat Valid (SSL 256-bit)</span>
                </div>
                <p className="text-slate-500 leading-normal">
                  Identitas NIK terverifikasi secara enkripsi dua arah untuk mencegah penyalahgunaan.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── LAYANAN / SERVICES SHOWCASE ── */}
      <section id="layanan" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Pusat Layanan Warga</span>
              <h2 className="text-slate-900 font-black text-3xl sm:text-4xl mt-3 leading-tight">
                Layanan Kelurahan Online Tanpa Antre, Buka 24 Jam
              </h2>
              <p className="text-slate-600 text-sm mt-4 leading-relaxed">
                Kami mendigitalisasi layanan tingkat RT/RW dan Kelurahan sehingga warga tidak perlu lagi mengantre fisik untuk urusan surat menyurat atau pelaporan fasilitas. Semua proses dilacak transparan.
              </p>
              
              <div className="mt-8 space-y-4">
                {[
                  'Pengurusan Surat Pengantar RT/RW & Domisili',
                  'Permohonan Kartu Keluarga Baru & KTP Hilang',
                  'Pengajuan Surat Keterangan Tidak Mampu (SKTM)',
                  'Laporan Kerusakan Jalan & Lampu Penerangan Jalan',
                  'Aduan Gangguan Keamanan & Kebersihan Lingkungan'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mt-0.5">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span className="text-slate-700 text-sm font-semibold">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-[-10%] right-[-10%] w-48 h-48 bg-blue-100/40 rounded-full blur-2xl" />
              
              <h3 className="text-slate-900 font-extrabold text-base mb-6">Permohonan Administrasi Terbaru</h3>
              <div className="space-y-4">
                {[
                  { user: 'Budi Santoso', type: 'Surat Domisili', date: 'Hari ini', status: 'Selesai', color: 'bg-emerald-100 text-emerald-700' },
                  { user: 'Siti Rahma', type: 'KK Baru', date: 'Kemarin', status: 'Diproses', color: 'bg-amber-100 text-amber-700' },
                  { user: 'Joko Widodo', type: 'SKTM Pendidikan', date: '2 hari lalu', status: 'Selesai', color: 'bg-emerald-100 text-emerald-700' },
                  { user: 'Ani Wijaya', type: 'KTP Rusak', date: '3 hari lalu', status: 'Menunggu', color: 'bg-slate-100 text-slate-600' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white border border-slate-150 rounded-2xl p-4 flex items-center justify-between text-xs shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center font-bold">
                        {item.user.charAt(0)}
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-800">{item.user}</p>
                        <p className="text-[10px] text-slate-400">{item.type} • {item.date}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${item.color}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── STATS COUNTERS ("Why Citizens Choose Us") ── */}
      <section id="statistik" className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6 text-center">
          
          <div className="max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Kinerja Pelayanan</span>
            <h2 className="text-slate-900 font-black text-3xl mt-3">Statistik Penanganan Layanan Kota</h2>
            <p className="text-slate-500 text-sm mt-3">
              Kinerja aparatur kelurahan dipantau secara berkala melalui indikator efektivitas penyelesaian masalah warga.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { val: '98.4%', label: 'Laporan Selesai', desc: 'Indeks penyelesaian aduan fisik' },
              { val: '2 Hari', label: 'Rata-rata Respon', desc: 'Durasi birokrasi verifikasi berkas' },
              { val: '42K+', label: 'Warga Terdaftar', desc: 'Jumlah akun terverifikasi NIK' },
              { val: '24 Jam', label: 'Sistem Siap Saji', desc: 'Layanan administrasi tanpa henti' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-3xl sm:text-4xl font-black text-blue-600 tracking-tight">{stat.val}</p>
                <p className="text-slate-800 font-extrabold text-sm mt-3">{stat.label}</p>
                <p className="text-slate-400 text-[10px] mt-1 leading-normal">{stat.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 3-STEP PROCESS ("Get Started In Just 3 Easy Steps") ── */}
      <section id="alur" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Alur Pelayanan</span>
            <h2 className="text-slate-900 font-black text-3xl mt-3">Mulai Layanan Dalam 3 Langkah Mudah</h2>
            <p className="text-slate-500 text-sm mt-3">
              Tidak perlu antre ke kantor kelurahan. Anda dapat memproses aduan atau dokumen dalam waktu singkat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Horizontal line for steps (desktop only) */}
            <div className="absolute top-10 left-[15%] right-[15%] h-0.5 bg-slate-100 hidden md:block z-0" />
            
            {[
              {
                step: '01',
                title: 'Daftar & Verifikasi Akun',
                desc: 'Buat akun warga dengan memasukkan email aktif, NIK, dan nomor telepon. Akun terverifikasi instan.',
                icon: Users
              },
              {
                step: '02',
                title: 'Isi Formulir & Berkas',
                desc: 'Pilih jenis permohonan surat atau tulis pengaduan baru. Unggah berkas dokumen (PDF/gambar) persyaratan.',
                icon: FileText
              },
              {
                step: '03',
                title: 'Terima Solusi / Dokumen',
                desc: 'Admin kelurahan memproses berkas Anda. Dapatkan notifikasi saat dokumen resmi siap diunduh atau diambil.',
                icon: Award
              }
            ].map((st, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center space-y-4">
                <div className="w-14 h-14 bg-white border-2 border-blue-600 rounded-full flex items-center justify-center text-blue-600 font-black text-base shadow-lg shadow-blue-600/5">
                  <st.icon size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">Langkah {st.step}</span>
                  <h3 className="text-slate-900 font-extrabold text-base mt-1.5 mb-2">{st.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed max-w-xs mx-auto">
                    {st.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── CITIZEN SUCCESS STORIES (TESTIMONIALS) ── */}
      <section id="testimoni" className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Suara Warga</span>
            <h2 className="text-slate-900 font-black text-3xl mt-3">Hasil Nyata Layanan Kota Digital</h2>
            <p className="text-slate-500 text-sm mt-3">
              Cerita nyata dari warga kota yang telah menggunakan portal digital untuk menyelesaikan keperluan mereka.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Budi Santoso',
                role: 'Warga Kelurahan Pondok Cina',
                text: 'Lampu jalan di gang rumah kami padam berbulan-bulan. Saya laporkan lewat web ini hari Senin, Rabu paginya tim teknis dinas langsung datang mengganti bohlam baru. Transparan dan cepat sekali!',
                avatar: 'B'
              },
              {
                name: 'Sri Wahyuni',
                role: 'Warga Kelurahan Margonda',
                text: 'Biasanya buat Surat Keterangan Domisili harus minta pengantar RT/RW lalu antre pagi-pagi di kantor lurah. Kemarin saya buat online di portal ini malam hari, besok siangnya surat sudah siap diunduh.',
                avatar: 'S'
              },
              {
                name: 'Joko Susilo',
                role: 'Pelaku UMKM Kota',
                text: 'Pengajuan SKTM anak sekolah sangat terbantu. Upload syarat foto rumah dan pengantar, langsung diverifikasi admin secara berkala. Dashboard pelacakannya sangat membantu warga awam.',
                avatar: 'J'
              }
            ].map((tst, idx) => (
              <div key={idx} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <p className="text-slate-600 text-xs leading-relaxed italic">
                  "{tst.text}"
                </p>
                <div className="flex items-center gap-3.5 mt-6 border-t border-slate-50 pt-4">
                  <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
                    {tst.avatar}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs">{tst.name}</h4>
                    <p className="text-slate-400 text-[10px]">{tst.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield size={14} className="text-white" />
              </div>
              <span className="text-white font-extrabold text-sm">PEMERINTAH KOTA DIGITAL</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Sistem Portal Pelayanan Publik Terpadu Daerah. Berkomitmen menyelenggarakan administrasi pemerintahan yang transparan, bersih, dan berorientasi melayani warga.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Kontak Darurat Kota</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2"><Phone size={11} /> Panggilan Darurat: 112</li>
              <li className="flex items-center gap-2"><Phone size={11} /> Ambulans Gawat: 118</li>
              <li className="flex items-center gap-2"><Phone size={11} /> Pemadam Kebakaran: 113</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Sekretariat Daerah</h4>
            <p className="text-xs leading-relaxed text-slate-500">
              Gedung Balai Kota Terpadu Lantai 1-2<br />
              Jl. Merdeka Nomor 45, Kota Digital 16424<br />
              Email: pengaduan@kotadigital.go.id
            </p>
          </div>

        </div>

        <div className="max-w-6xl mx-auto px-6 border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Pemerintah Kota Digital. Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Kebijakan Privasi</a>
            <a href="#" className="hover:text-white">Syarat & Ketentuan</a>
            <a href="#" className="hover:text-white">Hubungi Kami</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
