import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, Shield, ArrowRight, Building2, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Email dan password wajib diisi!'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.user, data.token);
      toast.success(`Selamat datang, ${data.user.name}!`);
      navigate(data.user.role === 'admin' ? '/admin/dashboard' : '/');
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors && errors.length > 0) {
        toast.error(errors[0].msg);
      } else {
        toast.error(err.response?.data?.message || 'Login gagal. Periksa kembali email dan password.');
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel – Branding */}
      <div className="hidden lg:flex w-2/5 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2"/>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full translate-y-1/2 -translate-x-1/2"/>
          <div className="absolute inset-0" style={{backgroundImage:'radial-gradient(circle at 20% 50%, rgba(59,130,246,0.08) 0%, transparent 60%)'}}/>
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
              <Shield size={20} className="text-white"/>
            </div>
            <span className="text-white font-bold text-sm">Portal Pengaduan</span>
          </div>
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}}>
            <h1 className="text-white font-extrabold text-4xl leading-tight mb-4">
              Sistem Layanan<br/>Aspirasi Warga<br/>
              <span className="text-blue-300">Digital</span>
            </h1>
            <p className="text-blue-200 text-base leading-relaxed max-w-xs">
              Platform pengaduan masyarakat berbasis AI untuk tata kelola pemerintahan yang transparan dan responsif.
            </p>
          </motion.div>
        </div>
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.4}}
          className="relative flex flex-col gap-3">
          {['Analisis AI Otomatis', 'Tracking Laporan Real-Time', 'Dashboard Analitik Pemerintah'].map((f,i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 bg-blue-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 bg-blue-400 rounded-full"/>
              </div>
              <span className="text-blue-200 text-sm font-medium">{f}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right panel – Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{duration:0.4}}
          className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <Shield size={18} className="text-white"/>
            </div>
            <div>
              <p className="text-slate-800 font-bold leading-tight">Portal Pengaduan</p>
              <p className="text-slate-400 text-xs">Layanan Aspirasi Masyarakat</p>
            </div>
          </div>

          <Link to="/" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-bold mb-6 transition-colors">
            <ArrowLeft size={14} /> Kembali ke Beranda
          </Link>

          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900">Masuk ke Akun Anda</h2>
            <p className="text-slate-500 text-sm mt-1">Gunakan email dan password yang terdaftar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Alamat Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)}
                  placeholder="nama@email.com" required
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-slate-200 bg-white text-slate-800 text-sm
                    font-medium placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"/>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input id="password" type={showPw?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}
                  placeholder="Masukkan password" required
                  className="w-full pl-10 pr-11 py-3.5 rounded-xl border-2 border-slate-200 bg-white text-slate-800 text-sm
                    font-medium placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"/>
                <button type="button" onClick={()=>setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            <button id="btn-login" type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700
                text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30
                hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 mt-2">
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
              ) : (
                <><span>Masuk Sekarang</span><ArrowRight size={15}/></>
              )}
            </button>
          </form>

          {/* Demo creds */}
          <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <Building2 size={13} className="text-blue-600"/>
              <p className="text-xs font-bold text-blue-700">Akun Demo</p>
            </div>
            <div className="space-y-1 text-xs text-blue-600">
              <p><span className="font-bold">👑 Admin:</span> admin@pengaduan.go.id · admin123</p>
              <p><span className="font-bold">👤 Warga:</span> budi@email.com · warga123</p>
            </div>
          </div>

          <p className="text-center text-slate-500 text-sm mt-6">
            Belum punya akun?{' '}
            <Link to="/register" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
              Daftar Sekarang
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
