import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Home, FileText, List, LogOut, Shield, FileCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/',               icon: Home,      label: 'Beranda' },
  { to: '/warga/lapor',     icon: FileText,  label: 'Lapor'   },
  { to: '/warga/pengajuan', icon: FileCheck, label: 'Pengajuan' },
  { to: '/warga/riwayat',   icon: List,      label: 'Riwayat' },
];

export default function CitizenLayout({ children, title }) {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Sampai jumpa!');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#FAFCFF] flex flex-col font-sans">
      
      {/* ── HEADER NAVIGATION (UNIFIED DESKTOP HEADER) ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-100 py-4' : 'bg-white py-6'
      }`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          {/* Logo - Clickable to Landing Page */}
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-extrabold text-sm text-slate-900 leading-none tracking-tight">KOTA DIGITAL</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Portal Warga</p>
            </div>
          </Link>

          {/* Desktop Nav Links (Same as Welcome Page, styled identically) */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <Link to="/warga/lapor" 
              className={`transition-colors hover:text-blue-600 ${location.pathname === '/warga/lapor' ? 'text-blue-600 font-extrabold' : ''}`}>
              Laporkan Kendala
            </Link>
            <Link to="/warga/riwayat" 
              className={`transition-colors hover:text-blue-600 ${location.pathname === '/warga/riwayat' ? 'text-blue-600 font-extrabold' : ''}`}>
              Riwayat Laporan
            </Link>
            <Link to="/warga/pengajuan" 
              className={`transition-colors hover:text-blue-600 ${location.pathname === '/warga/pengajuan' || location.pathname.startsWith('/warga/pengajuan/') ? 'text-blue-600 font-extrabold' : ''}`}>
              Pengajuan Surat
            </Link>
          </div>

          {/* Desktop Right Side - Profile and Keluar */}
          <div className="flex items-center gap-3">
            {user && (
              <span className="hidden lg:inline text-xs text-slate-500 font-bold bg-slate-100 px-3 py-1.5 rounded-full">
                Warga: {user.name}
              </span>
            )}
            <button onClick={handleLogout}
              className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-full transition-all">
              Keluar
            </button>
          </div>
        </div>
      </nav>

      {/* ── MAIN CONTENT CONTAINER (DESKTOP WIDE LAYOUT) ── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 pt-32 pb-24">
        <motion.div key={location.pathname}
          initial={{ opacity: 0, y: 12 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}>
          
          {/* Section title header */}
          <div className="mb-8 border-b border-slate-100 pb-5">
            <h2 className="text-2xl font-black text-slate-900 leading-tight">{title}</h2>
            <p className="text-slate-400 text-xs mt-1">Layanan Portal Digital Pemerintahan Kota Terpercaya</p>
          </div>

          {children}
        </motion.div>
      </main>

      {/* ── BOTTOM NAVIGATION (MOBILE ONLY) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-lg">
        <div className="flex py-1">
          {NAV.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to || (to === '/warga/pengajuan' && location.pathname.startsWith('/warga/pengajuan/'));
            return (
              <Link key={to} to={to}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 relative transition-all duration-200
                  ${active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                {active && (
                  <motion.div layoutId="nav-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-b-full"/>
                )}
                <Icon size={active ? 20 : 19} strokeWidth={active ? 2.5 : 2}
                  className="transition-all duration-200"/>
                <span className={`text-[9px] font-bold transition-all`}>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
