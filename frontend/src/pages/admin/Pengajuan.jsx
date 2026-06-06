import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';
import { getStatusClass, formatDateShort } from '../../utils/constants';
import { Search, SlidersHorizontal, ChevronDown, Eye, RotateCcw, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

const SUBMISSION_TYPES = [
  'Surat Pengantar Domisili',
  'Kartu Keluarga Baru',
  'Surat Keterangan Tidak Mampu',
  'KTP Baru / Rusak',
  'Lainnya'
];

export default function AdminPengajuan() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', type: '', search: '' });
  const [searchInput, setSearchInput] = useState('');

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(filters.status && { status: filters.status }),
        ...(filters.type && { type: filters.type }),
      });
      const r = await api.get(`/submissions/admin?${params}`);
      
      // Client-side search for simplicity
      let data = r.data.submissions;
      if (filters.search) {
        const query = filters.search.toLowerCase();
        data = data.filter(s => 
          s.title.toLowerCase().includes(query) || 
          s.description.toLowerCase().includes(query) ||
          s.applicant?.name?.toLowerCase().includes(query)
        );
      }
      setSubmissions(data);
    } catch(e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  }, [filters]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const reset = () => { setFilters({ status: '', type: '', search: '' }); setSearchInput(''); };
  const hasFilter = filters.status || filters.type || filters.search;

  return (
    <AdminLayout title="Kelola Pengajuan" subtitle={`${submissions.length} permohonan masuk`}>
      
      {/* Filter Bar */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="admin-card p-4 mb-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <form onSubmit={e => { e.preventDefault(); setFilters(p => ({ ...p, search: searchInput })); }}
            className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
              <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)}
                placeholder="Cari pengaju, judul, atau keterangan..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg
                  text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500/50
                  focus:ring-1 focus:ring-blue-500/20 transition-all"/>
            </div>
            <button type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
              Cari
            </button>
          </form>

          {/* Filter pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal size={14} className="text-slate-500 flex-shrink-0"/>
            
            {/* Status select */}
            <div className="relative">
              <select value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}
                className="appearance-none pl-3 pr-7 py-1.5 text-xs font-bold rounded-lg border transition-all duration-200 cursor-pointer
                  bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-slate-50
                  focus:outline-none focus:border-blue-500/50">
                <option value="" className="text-slate-800 bg-white">Semua Status</option>
                <option value="Menunggu" className="text-slate-800 bg-white">Menunggu</option>
                <option value="Diproses" className="text-slate-800 bg-white">Diproses</option>
                <option value="Selesai" className="text-slate-800 bg-white">Selesai</option>
                <option value="Ditolak" className="text-slate-800 bg-white">Ditolak</option>
              </select>
              <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"/>
            </div>

            {/* Type select */}
            <div className="relative">
              <select value={filters.type} onChange={e => setFilters(p => ({ ...p, type: e.target.value }))}
                className="appearance-none pl-3 pr-7 py-1.5 text-xs font-bold rounded-lg border transition-all duration-200 cursor-pointer
                  bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-slate-50
                  focus:outline-none focus:border-blue-500/50">
                <option value="" className="text-slate-800 bg-white">Semua Jenis</option>
                {SUBMISSION_TYPES.map(t => <option key={t} value={t} className="text-slate-800 bg-white">{t}</option>)}
              </select>
              <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"/>
            </div>

            {hasFilter && (
              <button onClick={reset}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-red-655
                  bg-white hover:bg-red-50 hover:text-red-600 rounded-lg border border-slate-200
                  hover:border-red-200 transition-all font-bold">
                <RotateCcw size={10}/> Reset
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="admin-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="gov-th">Judul Pengajuan</th>
                <th className="gov-th">Pengaju (Warga)</th>
                <th className="gov-th">Jenis Layanan</th>
                <th className="gov-th">Status</th>
                <th className="gov-th">Tanggal</th>
                <th className="gov-th w-16"/>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="gov-td">
                        <div className="h-3.5 rounded shimmer opacity-30" style={{ width: `${50 + Math.random() * 40}%` }}/>
                      </td>
                    ))}
                  </tr>
                ))
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-500">
                    <div className="text-4xl mb-2">📁</div>
                    <p className="font-bold text-sm">Tidak ada pengajuan yang cocok</p>
                  </td>
                </tr>
              ) : (
                submissions.map((sub, i) => (
                  <motion.tr key={sub.id}
                    initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.025 }}
                    className="hover:bg-slate-50/40 transition-colors group cursor-pointer"
                    onClick={() => window.location.href = `/admin/pengajuan/${sub.id}`}>
                    <td className="gov-td max-w-xs">
                      <p className="text-slate-700 font-bold line-clamp-1 group-hover:text-blue-600 transition-colors text-sm">
                        {sub.title}
                      </p>
                    </td>
                    <td className="gov-td">
                      <p className="text-slate-600 text-sm font-semibold truncate max-w-32">{sub.applicant?.name}</p>
                    </td>
                    <td className="gov-td">
                      <span className="text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200/50">
                        {sub.type}
                      </span>
                    </td>
                    <td className="gov-td">
                      <span className={getStatusClass(sub.status)}>{sub.status}</span>
                    </td>
                    <td className="gov-td text-slate-400 text-xs font-bold whitespace-nowrap">
                      {formatDateShort(sub.createdAt)}
                    </td>
                    <td className="gov-td" onClick={e => e.stopPropagation()}>
                      <Link to={`/admin/pengajuan/${sub.id}`}
                        className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-bold whitespace-nowrap transition-all">
                        <Eye size={12}/> Detail
                      </Link>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
