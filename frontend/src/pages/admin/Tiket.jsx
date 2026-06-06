import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';
import { getStatusClass, getUrgencyClass, formatDateShort, CATEGORIES, STATUSES, URGENCY_LEVELS } from '../../utils/constants';
import { Search, SlidersHorizontal, ChevronUp, ChevronDown, Eye, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

const SORT_COLS = ['createdAt','title','status','ai_urgency_level','category'];

const FilterPill = ({ label, value, options, onChange }) => (
  <div className="relative">
    <select value={value} onChange={e => onChange(e.target.value)}
      className="appearance-none pl-3 pr-7 py-1.5 text-xs font-bold rounded-lg border transition-all duration-200 cursor-pointer
        bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-slate-50
        focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20">
      <option value="" className="text-slate-800 font-semibold bg-white">{label}</option>
      {options.map(o => <option key={o.value||o} value={o.value||o} className="text-slate-800 font-semibold bg-white">{o.label||o}</option>)}
    </select>
    <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"/>
  </div>
);

export default function AdminTiket() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total:0, page:1, totalPages:1 });
  const [filters, setFilters] = useState({ status:'', category:'', urgency:'', search:'' });
  const [searchInput, setSearchInput] = useState('');
  const [sort, setSort] = useState({ by:'createdAt', order:'DESC' });

  const fetchTickets = useCallback(async (page=1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page, limit:15, sortBy:sort.by, sortOrder:sort.order,
        ...(filters.status   && { status:   filters.status }),
        ...(filters.category && { category: filters.category }),
        ...(filters.urgency  && { urgency:  filters.urgency }),
        ...(filters.search   && { search:   filters.search }),
      });
      const r = await api.get(`/admin/tickets?${params}`);
      setComplaints(r.data.complaints);
      setPagination(r.data.pagination);
    } catch(e){ console.error(e); }
    finally{ setLoading(false); }
  }, [filters, sort]);

  useEffect(() => { fetchTickets(1); }, [fetchTickets]);

  const handleSort = col => setSort(p => ({
    by: col, order: p.by===col && p.order==='DESC' ? 'ASC' : 'DESC'
  }));

  const SortBtn = ({ col, label }) => (
    <button onClick={() => handleSort(col)}
      className="flex items-center gap-0.5 hover:text-white transition-colors">
      {label}
      {sort.by===col
        ? sort.order==='DESC' ? <ChevronDown size={11} className="text-blue-400"/> : <ChevronUp size={11} className="text-blue-400"/>
        : <span className="text-slate-700 text-[10px]">↕</span>
      }
    </button>
  );

  const reset = () => { setFilters({status:'',category:'',urgency:'',search:''}); setSearchInput(''); };
  const hasFilter = filters.status || filters.category || filters.urgency || filters.search;

  return (
    <AdminLayout title="Tiket Laporan" subtitle={`${pagination.total} laporan ditemukan`}>

      {/* Filter Bar */}
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
        className="admin-card p-4 mb-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <form onSubmit={e=>{e.preventDefault();setFilters(p=>({...p,search:searchInput}));}}
            className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
              <input type="text" value={searchInput} onChange={e=>setSearchInput(e.target.value)}
                placeholder="Cari judul atau deskripsi laporan..."
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
            <FilterPill label="Semua Status"   value={filters.status}   onChange={v=>setFilters(p=>({...p,status:v}))}
              options={STATUSES.map(s=>({value:s.value,label:s.label}))}/>
            <FilterPill label="Semua Kategori" value={filters.category} onChange={v=>setFilters(p=>({...p,category:v}))}
              options={CATEGORIES.map(c=>({value:c.value,label:c.value}))}/>
            <FilterPill label="Semua Urgensi"  value={filters.urgency}  onChange={v=>setFilters(p=>({...p,urgency:v}))}
              options={URGENCY_LEVELS.map(u=>({value:u.value,label:u.label}))}/>
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
      <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
        className="admin-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="gov-th"><SortBtn col="title" label="Laporan"/></th>
                <th className="gov-th">Pelapor</th>
                <th className="gov-th"><SortBtn col="category" label="Kategori"/></th>
                <th className="gov-th"><SortBtn col="ai_urgency_level" label="Urgensi"/></th>
                <th className="gov-th"><SortBtn col="status" label="Status"/></th>
                <th className="gov-th"><SortBtn col="createdAt" label="Tanggal"/></th>
                <th className="gov-th w-16"/>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {loading ? (
                [...Array(8)].map((_,i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_,j) => (
                      <td key={j} className="gov-td">
                        <div className="h-3.5 rounded shimmer opacity-30" style={{width:`${50+Math.random()*40}%`}}/>
                      </td>
                    ))}
                  </tr>
                ))
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-500">
                    <div className="text-4xl mb-2">🔍</div>
                    <p className="font-bold text-sm">Tidak ada laporan yang cocok</p>
                  </td>
                </tr>
              ) : (
                complaints.map((c,i) => (
                  <motion.tr key={c.id}
                    initial={{opacity:0,x:-4}} animate={{opacity:1,x:0}}
                    transition={{delay:i*0.025}}
                    className="hover:bg-slate-50/40 transition-colors group cursor-pointer"
                    onClick={()=>window.location.href=`/admin/tiket/${c.id}`}>
                    <td className="gov-td max-w-xs">
                      <p className="text-slate-700 font-bold line-clamp-1 group-hover:text-blue-600 transition-colors text-sm">
                        {c.title}
                      </p>
                    </td>
                    <td className="gov-td">
                      <p className="text-slate-600 text-sm font-semibold truncate max-w-32">{c.reporter?.name}</p>
                    </td>
                    <td className="gov-td">
                      <span className="text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200/50">
                        {c.category}
                      </span>
                    </td>
                    <td className="gov-td">
                      <span className={getUrgencyClass(c.ai_urgency_level)}>{c.ai_urgency_level}</span>
                    </td>
                    <td className="gov-td">
                      <span className={getStatusClass(c.status)}>{c.status}</span>
                    </td>
                    <td className="gov-td text-slate-400 text-xs font-bold whitespace-nowrap">
                      {formatDateShort(c.createdAt)}
                    </td>
                    <td className="gov-td" onClick={e=>e.stopPropagation()}>
                      <Link to={`/admin/tiket/${c.id}`}
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

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-white">
            <p className="text-xs text-slate-400 font-bold">
              Menampilkan {complaints.length} dari {pagination.total} laporan
            </p>
            <div className="flex items-center gap-2">
              <button disabled={pagination.page<=1} onClick={()=>fetchTickets(pagination.page-1)}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-blue-600
                  hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <ChevronLeft size={14}/>
              </button>
              <span className="text-xs text-slate-500 font-bold px-2">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button disabled={pagination.page>=pagination.totalPages} onClick={()=>fetchTickets(pagination.page+1)}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-blue-600
                  hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <ChevronRight size={14}/>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
}
