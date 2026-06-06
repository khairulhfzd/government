import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiPhone, FiShield, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Konfirmasi password tidak cocok!');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password minimal 6 karakter!');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password
      });
      toast.success('Pendaftaran berhasil! Silakan login.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Pendaftaran gagal. Coba lagi.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col items-center justify-center p-4 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-100 rounded-full opacity-50 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-bold mb-6 transition-colors">
          <FiArrowLeft className="w-3.5 h-3.5" /> Kembali ke Beranda
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 mb-4">
            <FiShield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Daftar Akun Warga</h1>
          <p className="text-slate-500 mt-1">Portal Pengaduan Masyarakat</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 p-8 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Lengkap</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  id="name" name="name" type="text"
                  value={form.name} onChange={handleChange}
                  placeholder="Masukkan nama lengkap" className="citizen-input pl-12" required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Alamat Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  id="email" name="email" type="email"
                  value={form.email} onChange={handleChange}
                  placeholder="nama@email.com" className="citizen-input pl-12" required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nomor Telepon <span className="text-slate-400 font-normal">(opsional)</span>
              </label>
              <div className="relative">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  id="phone" name="phone" type="tel"
                  value={form.phone} onChange={handleChange}
                  placeholder="08xx-xxxx-xxxx" className="citizen-input pl-12"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  id="password" name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password} onChange={handleChange}
                  placeholder="Minimal 6 karakter" className="citizen-input pl-12 pr-12" required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Konfirmasi Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  id="confirmPassword" name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={form.confirmPassword} onChange={handleChange}
                  placeholder="Ulangi password" className="citizen-input pl-12" required
                />
              </div>
            </div>

            <button id="btn-register" type="submit" disabled={loading}
              className="citizen-btn-primary disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Mendaftar...
                </span>
              ) : 'Daftar Sekarang'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 mt-6 text-sm">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
