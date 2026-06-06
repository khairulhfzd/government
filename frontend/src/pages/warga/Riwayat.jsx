import { useEffect, useState } from 'react';
import CitizenLayout from '../../components/CitizenLayout';
import api from '../../services/api';
import { getStatusClass, getUrgencyClass, formatDate, STATUSES } from '../../utils/constants';
import { FiSearch, FiFileText, FiInfo, FiChevronRight } from 'react-icons/fi';

export default function WargaRiwayat() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, [filterStatus]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = filterStatus ? `?status=${filterStatus}&limit=50` : '?limit=50';
      const res = await api.get(`/complaints/my${params}`);
      setComplaints(res.data.complaints);
      // Auto select first complaint on desktop by default
      if (res.data.complaints.length > 0) {
        setSelectedComplaint(res.data.complaints[0]);
      } else {
        setSelectedComplaint(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CitizenLayout title="Riwayat Laporan Anda">
      <div className="animate-fade-in space-y-6">
        
        {/* Filters */}
        <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin">
          <FilterChip label="Semua Laporan" active={filterStatus === ''} onClick={() => setFilterStatus('')} />
          {STATUSES.map(s => (
            <FilterChip key={s.value} label={s.label} active={filterStatus === s.value} onClick={() => setFilterStatus(s.value)} />
          ))}
        </div>

        {/* Master-Detail Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LIST SIDE (LEFT - 2 cols on desktop) */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="space-y-3.5">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white border border-slate-100 p-5 rounded-3xl animate-pulse space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                    <div className="h-3 bg-slate-100 rounded w-1/3"></div>
                    <div className="h-3 bg-slate-100 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : complaints.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-sm">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-slate-800 font-extrabold text-base">Belum Ada Laporan</p>
                <p className="text-slate-400 text-xs mt-1.5">
                  {filterStatus ? `Tidak ditemukan laporan dengan status "${filterStatus}"` : 'Anda belum pernah membuat laporan pengaduan.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {complaints.map(c => {
                  const isSelected = selectedComplaint?.id === c.id;
                  return (
                    <div 
                      key={c.id} 
                      onClick={() => setSelectedComplaint(c)}
                      className={`p-5 rounded-3xl border cursor-pointer transition-all duration-200 shadow-sm flex items-center justify-between gap-4
                        ${isSelected 
                          ? 'bg-blue-50/40 border-blue-500 ring-1 ring-blue-500' 
                          : 'bg-white border-slate-100 hover:border-blue-200'}`}>
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-start gap-2.5">
                          <span className={getStatusClass(c.status)}>{c.status}</span>
                          {c.ai_urgency_level && (
                            <span className={getUrgencyClass(c.ai_urgency_level) + ' text-[10px]'}>
                              {c.ai_urgency_level}
                            </span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-slate-800 text-sm sm:text-base leading-tight truncate">
                          {c.title}
                        </h4>
                        <p className="text-slate-400 text-[11px] font-bold">
                          {c.category} • {formatDate(c.createdAt)}
                        </p>
                      </div>
                      <FiChevronRight className={`w-5 h-5 transition-transform duration-200 ${isSelected ? 'text-blue-600 translate-x-1' : 'text-slate-350'}`} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* DETAIL PANEL SIDE (RIGHT - 1 col on desktop) */}
          <div className="lg:col-span-1">
            {selectedComplaint ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5 sticky top-28">
                <div className="border-b border-slate-100 pb-4">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Detail Laporan Terpilih</span>
                  <h3 className="font-extrabold text-slate-900 text-base leading-snug mt-1">{selectedComplaint.title}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-slate-400 font-bold text-[10px] uppercase">Status</p>
                    <span className={getStatusClass(selectedComplaint.status) + ' mt-1 inline-block'}>{selectedComplaint.status}</span>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold text-[10px] uppercase">Kategori</p>
                    <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full mt-1 inline-block">
                      {selectedComplaint.category}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-slate-400 font-bold text-[10px] uppercase">Kronologi Kejadian</p>
                  <p className="text-slate-700 text-xs leading-relaxed font-medium bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    {selectedComplaint.description}
                  </p>
                </div>

                {selectedComplaint.ai_summary && (
                  <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-1">
                    <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wide">Ringkasan Otomatis</p>
                    <p className="text-xs text-blue-800 leading-relaxed font-medium">{selectedComplaint.ai_summary}</p>
                  </div>
                )}

                {(() => {
                  const fileList = selectedComplaint.image_url ? selectedComplaint.image_url.split(',') : [];
                  return fileList.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-slate-400 font-bold text-[10px] uppercase">Berkas Lampiran ({fileList.length})</p>
                      <div className="grid grid-cols-1 gap-2">
                        {fileList.map((url, idx) => {
                          const isPdf = url.toLowerCase().endsWith('.pdf');
                          const absoluteUrl = url.startsWith('http') ? url : `http://localhost:5000${url}`;
                          return (
                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                              <div className="flex items-center gap-2 min-w-0">
                                <FiFileText size={16} className="text-slate-400 flex-shrink-0" />
                                <span className="text-xs text-slate-700 font-semibold truncate flex-1">{url.split('/').pop()}</span>
                              </div>
                              <a href={absoluteUrl} target="_blank" rel="noopener noreferrer"
                                className="text-xs font-bold text-blue-600 hover:underline flex-shrink-0 ml-2">
                                Buka {isPdf ? 'PDF' : 'Gambar'}
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {selectedComplaint.admin_notes && (
                  <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-1">
                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">📝 Catatan Tindak Lanjut</p>
                    <p className="text-xs text-emerald-800 leading-relaxed font-medium">{selectedComplaint.admin_notes}</p>
                  </div>
                )}

                <div className="text-[10px] text-slate-400 font-bold pt-2 border-t border-slate-50 flex justify-between">
                  <span>ID Laporan: #{selectedComplaint.id.substring(0, 8)}</span>
                  <span>Dikirim: {formatDate(selectedComplaint.createdAt)}</span>
                </div>

              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200/50 border-dashed rounded-3xl p-12 text-center text-slate-400 sticky top-28">
                <FiInfo className="w-8 h-8 mx-auto mb-2 text-slate-350" />
                <p className="text-xs font-bold">Pilih laporan di sisi kiri untuk melihat detail penanganan</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </CitizenLayout>
  );
}

function FilterChip({ label, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`flex-shrink-0 px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-200 border
        ${active ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/10' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}>
      {label}
    </button>
  );
}
