import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';
import { getStatusClass, getUrgencyClass, formatDateShort } from '../../utils/constants';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, Area, AreaChart
} from 'recharts';
import {
  FileText, Clock, CheckCircle, AlertTriangle, TrendingUp,
  ArrowRight, Users, Eye
} from 'lucide-react';

// Sparkline mini data
const sparkData = (base, n=8) =>
  Array.from({length:n},(_,i)=>({ v: base + Math.round((Math.random()-0.4)*base*0.4 + i*1.2) }));

// Weekly dummy data (bisa diganti API real)
const weeklyData = [
  {day:'Sen',laporan:4},{day:'Sel',laporan:7},{day:'Rab',laporan:5},
  {day:'Kam',laporan:9},{day:'Jum',laporan:6},{day:'Sab',laporan:3},{day:'Min',laporan:2},
];

const CATEGORY_COLORS = {
  Infrastruktur:'#3b82f6', Lingkungan:'#22c55e', Keamanan:'#ef4444',
  Kesehatan:'#ec4899', Pendidikan:'#a855f7', Administrasi:'#f97316', Lainnya:'#94a3b8',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs shadow-lg">
      <p className="text-slate-500 font-bold mb-1">{label}</p>
      {payload.map((p,i) => (
        <p key={i} style={{color:p.color}} className="font-extrabold">{p.value} laporan</p>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs shadow-lg">
      <p className="font-extrabold text-slate-800">{payload[0].name}</p>
      <p style={{color:payload[0].payload.fill}} className="font-extrabold">{payload[0].value} laporan</p>
    </div>
  );
};

const card = (delay=0) => ({
  initial:{opacity:0,y:20}, animate:{opacity:1,y:0},
  transition:{duration:0.4,delay}
});

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_,i) => (
          <div key={i} className="admin-card h-32 shimmer rounded-2xl" />
        ))}
      </div>
    </AdminLayout>
  );

  const { stats, categoryStats, recentComplaints } = data;

  const pieData = categoryStats.map(c => ({
    name: c.category, value: parseInt(c.count),
    fill: CATEGORY_COLORS[c.category] || '#94a3b8'
  }));

  // High urgency complaints for attention table
  const highUrgency = recentComplaints.filter(c => c.ai_urgency_level === 'High').slice(0,5);
  const attentionList = highUrgency.length > 0 ? highUrgency : recentComplaints.slice(0,5);

  const metrics = [
    { label:'Total Laporan',  value:stats.total,       icon:FileText,      color:'blue',   spark:sparkData(stats.total,8)  },
    { label:'Menunggu',       value:stats.menunggu,    icon:Clock,         color:'amber',  spark:sparkData(stats.menunggu,8)},
    { label:'Selesai',        value:stats.selesai,     icon:CheckCircle,   color:'emerald',spark:sparkData(stats.selesai,8) },
    { label:'Urgensi Tinggi', value:stats.highUrgency, icon:AlertTriangle, color:'red',    spark:sparkData(stats.highUrgency,8)},
  ];

  const colorMap = {
    blue:   {bg:'bg-blue-500/10',   text:'text-blue-400',    line:'#3b82f6'},
    amber:  {bg:'bg-amber-500/10',  text:'text-amber-400',   line:'#f59e0b'},
    emerald:{bg:'bg-emerald-500/10',text:'text-emerald-400', line:'#10b981'},
    red:    {bg:'bg-red-500/10',    text:'text-red-400',     line:'#ef4444'},
  };

  return (
    <AdminLayout title="Command Center" subtitle="Ringkasan data pengaduan masyarakat secara real-time">

      {/* ── METRIC CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map(({ label, value, icon: Icon, color, spark }, i) => {
          const c = colorMap[color];
          return (
            <motion.div key={label} {...card(i*0.08)} className="metric-card admin-card-hover">
              {/* Sparkline BG */}
              <div className="absolute bottom-0 left-0 right-0 h-14 opacity-30">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={spark} margin={{top:0,right:0,left:0,bottom:0}}>
                    <defs>
                      <linearGradient id={`sg-${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={c.line} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={c.line} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke={c.line} strokeWidth={1.5} fill={`url(#sg-${i})`} dot={false}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${c.bg}`}>
                <Icon className={`w-5 h-5 ${c.text}`} />
              </div>
              <p className="text-3xl font-extrabold text-slate-800 tracking-tight">{value}</p>
              <p className={`text-sm font-bold mt-0.5 ${c.text}`}>{label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* ── CHARTS ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        {/* Bar Chart */}
        <motion.div {...card(0.3)} className="admin-card p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-slate-800 font-extrabold text-sm">Laporan Per Hari</h3>
              <p className="text-slate-450 text-slate-400 text-xs mt-0.5 font-bold">7 hari terakhir</p>
            </div>
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              <TrendingUp size={11}/> Live
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} barSize={28} margin={{top:0,right:0,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false}/>
              <XAxis dataKey="day" tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip />} cursor={{fill:'rgba(0,0,0,0.02)',radius:6}}/>
              <Bar dataKey="laporan" fill="url(#barGrad)" radius={[6,6,0,0]}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#3b82f6"/>
                    <stop offset="100%" stopColor="#1d4ed8"/>
                  </linearGradient>
                </defs>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Donut Chart */}
        <motion.div {...card(0.4)} className="admin-card p-5 lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-slate-800 font-extrabold text-sm">Distribusi Kategori</h3>
            <p className="text-slate-400 text-xs mt-0.5 font-bold">Berdasarkan total laporan</p>
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={80}
                  paddingAngle={3} dataKey="value" stroke="none">
                  {pieData.map((e,i) => <Cell key={i} fill={e.fill}/>)}
                </Pie>
                <Tooltip content={<PieTooltip/>}/>
                <Legend iconType="circle" iconSize={8}
                  formatter={v => <span className="text-slate-600 text-[11px] font-semibold">{v}</span>}/>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-slate-600 text-sm">Belum ada data</div>
          )}
        </motion.div>
      </div>

      {/* ── ATTENTION TABLE ── */}
      <motion.div {...card(0.5)} className="admin-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="text-slate-800 font-extrabold text-sm">⚡ Tiket Membutuhkan Perhatian Segera</h3>
            <p className="text-slate-400 text-xs mt-0.5 font-bold">Prioritas urgensi tertinggi</p>
          </div>
          <Link to="/admin/tiket"
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-bold transition-colors">
            Lihat Semua <ArrowRight size={13}/>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="gov-th">Laporan</th>
                <th className="gov-th">Pelapor</th>
                <th className="gov-th">Kategori</th>
                <th className="gov-th">Urgensi</th>
                <th className="gov-th">Status</th>
                <th className="gov-th">Tanggal</th>
                <th className="gov-th"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {attentionList.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/40 transition-colors group">
                  <td className="gov-td max-w-xs">
                    <p className="text-slate-700 font-bold text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {c.title}
                    </p>
                  </td>
                  <td className="gov-td text-slate-600 font-medium">{c.reporter?.name}</td>
                  <td className="gov-td">
                    <span className="text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200/50">{c.category}</span>
                  </td>
                  <td className="gov-td">
                    <span className={getUrgencyClass(c.ai_urgency_level)}>{c.ai_urgency_level}</span>
                  </td>
                  <td className="gov-td">
                    <span className={getStatusClass(c.status)}>{c.status}</span>
                  </td>
                  <td className="gov-td text-slate-400 text-xs font-bold">{formatDateShort(c.createdAt)}</td>
                  <td className="gov-td">
                    <Link to={`/admin/tiket/${c.id}`}
                      className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-bold transition-all">
                      <Eye size={13}/> Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
