import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Ticket, LogOut, Shield, Menu, X,
  ChevronLeft, Bell, Search, ChevronRight, FileCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/tiket',     icon: Ticket,          label: 'Tiket Laporan' },
  { to: '/admin/pengajuan', icon: FileCheck,       label: 'Kelola Pengajuan' },
];

export default function AdminLayout({ children, title, subtitle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Berhasil keluar!');
    navigate('/login');
  };

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-5 py-5 border-b border-slate-100 ${collapsed && !mobile ? 'justify-center px-3' : ''}`}>
        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
          <Shield className="w-5 h-5 text-white" />
        </div>
        {(!collapsed || mobile) && (
          <motion.div initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} className="min-w-0">
            <p className="text-slate-800 font-extrabold text-sm leading-tight truncate">Portal Pengaduan</p>
            <p className="text-blue-600 text-[11px] font-bold truncate">Sistem Layanan Kota</p>
          </motion.div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 mt-2">
        {NAV.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to || 
            (to === '/admin/tiket' && location.pathname.startsWith('/admin/tiket')) ||
            (to === '/admin/pengajuan' && location.pathname.startsWith('/admin/pengajuan'));
          return (
            <Link key={to} to={to}
              onClick={() => setMobileOpen(false)}
              title={collapsed && !mobile ? label : ''}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
                transition-all duration-200 group relative
                ${active
                  ? 'bg-blue-50 text-blue-600 border border-blue-100/50 shadow-sm'
                  : 'text-slate-650 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                } ${collapsed && !mobile ? 'justify-center' : ''}`}>
              {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-600 rounded-r-full" />}
              <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} size={18} />
              {(!collapsed || mobile) && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className={`p-3 border-t border-slate-100 ${collapsed && !mobile ? 'flex justify-center' : ''}`}>
        {!collapsed || mobile ? (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-800 text-xs font-bold truncate">{user?.name}</p>
              <p className="text-slate-400 text-[10px] truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} title="Keluar"
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button onClick={handleLogout} title="Keluar"
            className="p-2 text-slate-450 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
            <LogOut size={16} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex admin-bg text-slate-700">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 68 : 240 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col flex-shrink-0 admin-sidebar border-r border-slate-200/80 relative z-30 overflow-hidden">
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute bottom-24 -right-3 w-6 h-6 bg-white hover:bg-blue-50 border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-650 hover:text-blue-600 transition-all duration-200 shadow-md z-40">
          <motion.div animate={{ rotate: collapsed ? 0 : 180 }}>
            <ChevronRight size={12} />
          </motion.div>
        </button>
      </motion.aside>

      {/* Mobile Sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={() => setMobileOpen(false)} />
            <motion.aside
              initial={{x:-240}} animate={{x:0}} exit={{x:-240}}
              transition={{type:'spring',damping:25,stiffness:200}}
              className="fixed left-0 top-0 bottom-0 z-50 w-60 admin-sidebar lg:hidden">
              <SidebarContent mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center gap-4 px-6 py-4 border-b border-slate-200/80 bg-white/95 backdrop-blur-md flex-shrink-0">
          <button onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-colors">
            <Menu size={18} />
          </button>
          <div className="flex-1">
            <h1 className="text-slate-800 font-extrabold text-base leading-tight">{title}</h1>
            {subtitle && <p className="text-slate-400 text-xs mt-0.5 font-bold">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-100">
              <Shield size={11} />
              Admin Pemerintah
            </span>
            <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <motion.div key={location.pathname}
            initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}
            transition={{duration:0.3}}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
