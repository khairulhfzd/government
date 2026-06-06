import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import CitizenLayout from '../../components/CitizenLayout';
import api from '../../services/api';
import { formatDateShort } from '../../utils/constants';
import { Plus, Search, MapPin, Clock, CheckCircle, Cpu, ArrowRight, Newspaper } from 'lucide-react';

// Static city news
const CITY_NEWS = [
  { id:1, icon:'🏗️', title:'Perbaikan Jalan Sudirman Dimulai', date:'3 Jun 2026', tag:'Infrastruktur', color:'bg-blue-50 text-blue-600' },
  { id:2, icon:'🌿', title:'Program Tanam Pohon 1000 Bibit', date:'2 Jun 2026', tag:'Lingkungan',   color:'bg-green-50 text-green-600' },
  { id:3, icon:'🏥', title:'Posko Kesehatan Gratis RW 07',   date:'1 Jun 2026', tag:'Kesehatan',    color:'bg-pink-50 text-pink-600'  },
];

// Progress tracker steps
const STEPS = [
  { key:'sent',     label:'Dikirim',     icon:Clock },
  { key:'ai',       label:'Analisis AI', icon:Cpu   },
  { key:'process',  label:'Ditangani',   icon:ArrowRight },
  { key:'done',     label:'Selesai',     icon:CheckCircle },
];

function getStep(status) {
  if (status === 'Selesai')  return 4;
  if (status === 'Diproses') return 3;
  if (status === 'Menunggu') return 2;
  return 1;
}

function ProgressTracker({ status }) {
  const step = getStep(status);
  if (status === 'Ditolak') {
    return <p className="text-xs text-red-400 font-semibold mt-2">❌ Laporan ditolak</p>;
  }
  return (
    <div className="flex items-center gap-0 mt-3">
      {STEPS.map((s, i) => {
        const done = i < step;
        const active = i === step - 1;
        return (
          <div key={s.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all
                ${done && !active ? 'bg-blue-600 text-white' : active ? 'bg-blue-600 text-white ring-4 ring-blue-600/20' : 'bg-slate-200 text-slate-400'}`}>
                <s.icon size={11}/>
              </div>
              <p className={`text-[9px] font-semibold mt-0.5 whitespace-nowrap ${done || active ? 'text-blue-600':'text-slate-400'}`}>
                {s.label}
              </p>
            </div>
            {i < STEPS.length-1 && (
              <div className={`flex-1 h-0.5 mx-0.5 mb-4 rounded transition-all ${i < step-1 ? 'bg-blue-600' : 'bg-slate-200'}`}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function WargaDashboard() {
  const { user } = useAuth();
  const [recent, setRecent] = useState([]);
  const [stats, setStats] = useState({ total:0, menunggu:0, selesai:0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/complaints/my?limit=3')
      .then(r => {
        const c = r.data.complaints;
        setRecent(c);
        setStats({
          total: r.data.pagination.total,
          menunggu: c.filter(x=>x.status==='Menunggu').length,
          selesai: c.filter(x=>x.status==='Selesai').length,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <CitizenLayout title="Beranda">
      {/* ── HERO SECTION ── */}
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
        className="relative rounded-3xl overflow-hidden mb-6 bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 shadow-lg shadow-blue-500/20">
        {/* BG pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full -translate-y-1/2 translate-x-1/4"/>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/4"/>
        </div>
        <div className="relative p-6 pb-5">
          <div className="flex items-center gap-1.5 mb-3">
            <MapPin size={12} className="text-blue-200"/>
            <span className="text-blue-200 text-xs font-semibold">Layanan Terpadu Kota</span>
          </div>
          <h2 className="text-white font-extrabold text-xl leading-tight mb-1">
            Selamat Datang,<br/>{user?.name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-blue-100 text-sm mb-5">
            Portal layanan aspirasi masyarakat digital yang cepat dan transparan.
          </p>

          {/* Search bar */}
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input readOnly placeholder="Cari layanan, informasi kota..."
              className="w-full pl-9 pr-4 py-3 rounded-2xl bg-white text-slate-500 text-sm
                cursor-pointer placeholder-slate-400 font-medium shadow-lg"/>
          </div>

          {/* CTA Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Link to="/warga/lapor"
              className="flex items-center justify-center gap-2 py-3.5 bg-white text-blue-700
                font-bold text-sm rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5
                transition-all duration-200 active:translate-y-0">
              <Plus size={16}/> Tulis Laporan
            </Link>
            <Link to="/warga/riwayat"
              className="flex items-center justify-center gap-2 py-3.5 bg-white/15 backdrop-blur
                text-white font-bold text-sm rounded-2xl border border-white/30
                hover:bg-white/25 transition-all duration-200">
              <Clock size={15}/> Lacak Tiket
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── STATS ── */}
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.15}}
        className="grid grid-cols-3 gap-3 mb-6">
        {[
          {label:'Total',    value:stats.total,    color:'text-blue-600',   bg:'bg-blue-50'},
          {label:'Menunggu', value:stats.menunggu, color:'text-amber-600',  bg:'bg-amber-50'},
          {label:'Selesai',  value:stats.selesai,  color:'text-emerald-600',bg:'bg-emerald-50'},
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-3.5 text-center`}>
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className={`text-xs font-semibold ${s.color} opacity-70 mt-0.5`}>{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* ── CITY NEWS ── */}
      <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Newspaper size={15} className="text-slate-500"/> Info Kota Terkini
          </h3>
        </div>
        <div className="space-y-2.5">
          {CITY_NEWS.map((n,i) => (
            <motion.div key={n.id} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}}
              transition={{delay:0.25+i*0.07}}
              className="bg-white rounded-2xl p-4 shadow-card flex items-center gap-3 border border-slate-100">
              <div className="text-2xl w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl flex-shrink-0">
                {n.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-800 font-semibold text-sm leading-tight">{n.title}</p>
                <p className="text-slate-400 text-xs mt-0.5">{n.date}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${n.color} flex-shrink-0`}>
                {n.tag}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── RECENT COMPLAINTS ── */}
      <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.3}}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-800">Laporan Terbaru Saya</h3>
          <Link to="/warga/riwayat" className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:text-blue-700">
            Lihat semua <ArrowRight size={12}/>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2].map(i => (
              <div key={i} className="bg-white rounded-2xl p-4 h-28 shimmer"/>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-card">
            <div className="text-4xl mb-2">📭</div>
            <p className="font-bold text-slate-700">Belum ada laporan</p>
            <p className="text-slate-400 text-sm mt-1">Buat laporan pertama Anda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((c,i) => (
              <motion.div key={c.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
                transition={{delay:0.35+i*0.08}}
                className="bg-white rounded-2xl p-4 shadow-card border border-slate-100">
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <p className="font-bold text-slate-800 text-sm flex-1 leading-tight">{c.title}</p>
                </div>
                <p className="text-slate-400 text-xs mb-1">{formatDateShort(c.createdAt)} · {c.category}</p>
                <ProgressTracker status={c.status}/>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </CitizenLayout>
  );
}
