import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CitizenLayout from '../../components/CitizenLayout';
import api from '../../services/api';
import { getStatusClass, formatDateShort, resolveFileUrl } from '../../utils/constants';
import { Plus, Clock, FileText, ChevronRight, CheckCircle, AlertCircle, ExternalLink, Shield } from 'lucide-react';

export default function WargaPengajuan() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/submissions/my')
      .then(r => setSubmissions(r.data.submissions))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const total = submissions.length;
  const pending = submissions.filter(s => s.status === 'Menunggu' || s.status === 'Diproses').length;
  const done = submissions.filter(s => s.status === 'Selesai').length;

  return (
    <CitizenLayout title="Layanan Pengajuan Surat & Dokumen">
      <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: STATS & SUBMISSIONS LIST (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Header Info */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-slate-800 font-extrabold text-base">Permohonan Aktif</h3>
              <p className="text-slate-500 text-xs mt-0.5">Daftar berkas yang sedang diverifikasi pihak kelurahan</p>
            </div>
            <Link to="/warga/pengajuan/baru"
              className="flex items-center gap-1.5 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/10 hover:shadow-lg transition-all active:translate-y-0.5">
              <Plus size={14} /> Buat Permohonan Baru
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total', value: total, bg: 'bg-blue-50/50 text-blue-700 border-blue-100' },
              { label: 'Diproses', value: pending, bg: 'bg-amber-50/50 text-amber-700 border-amber-100' },
              { label: 'Selesai', value: done, bg: 'bg-emerald-50/50 text-emerald-700 border-emerald-100' },
            ].map(s => (
              <div key={s.label} className={`${s.bg.split(' ')[0]} ${s.bg.split(' ')[2]} rounded-2xl p-4 text-center border shadow-sm`}>
                <p className={`text-2xl font-black ${s.bg.split(' ')[1]}`}>{s.value}</p>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${s.bg.split(' ')[1]} opacity-80 mt-0.5`}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <div className="space-y-3.5">
              {[1, 2].map(i => <div key={i} className="h-32 bg-white border border-slate-100 rounded-3xl shimmer" />)}
            </div>
          ) : submissions.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm space-y-4">
              <div className="text-4xl">📁</div>
              <div className="space-y-1.5">
                <p className="font-extrabold text-slate-800 text-sm sm:text-base">Belum Ada Pengajuan Dokumen</p>
                <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
                  Anda dapat mengajukan permohonan penerbitan surat domisili, KK baru, atau surat keterangan tidak mampu (SKTM) langsung secara online.
                </p>
              </div>
              <Link to="/warga/pengajuan/baru"
                className="inline-block px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors">
                Buat Pengajuan Pertama
              </Link>
            </div>
          ) : (
            <div className="space-y-3.5">
              {submissions.map((sub, idx) => (
                <motion.div key={sub.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3 hover:border-blue-200 transition-colors">
                  
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 uppercase">
                        {sub.type}
                      </span>
                      <h4 className="font-extrabold text-slate-800 text-sm sm:text-base leading-tight pt-1.5">{sub.title}</h4>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${getStatusClass(sub.status)}`}>
                      {sub.status}
                    </span>
                  </div>

                  <p className="text-slate-500 text-xs leading-relaxed font-medium">
                    {sub.description}
                  </p>

                  {sub.document_url && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <FileText size={13} className="text-slate-400" />
                      <a href={resolveFileUrl(sub.document_url)} target="_blank" rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center gap-0.5">
                        Lihat Berkas Lampiran <ExternalLink size={11} />
                      </a>
                    </div>
                  )}

                  {sub.admin_notes && (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-medium space-y-0.5">
                      <p className="font-extrabold text-slate-800">Catatan Pihak Kelurahan:</p>
                      <p className="text-slate-600 leading-relaxed">{sub.admin_notes}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold border-t border-slate-50 pt-3">
                    <span>ID Berkas: #{sub.id.substring(0, 8)}</span>
                    <span>Tanggal Pengajuan: {formatDateShort(sub.createdAt)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: SERVICES DIRECTORY & HELP (1 col) */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
            <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
              <Shield className="text-blue-600" size={16} /> Layanan Tersedia
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Anda dapat mengurus dokumen-dokumen administrasi kependudukan di bawah ini secara instan:
            </p>
            
            <div className="space-y-2.5 pt-2 text-xs font-bold text-slate-700">
              <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center justify-between">
                <span>Surat Pengantar Domisili</span>
                <span className="text-[9px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">RT/RW</span>
              </div>
              <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center justify-between">
                <span>Kartu Keluarga Baru</span>
                <span className="text-[9px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Dukcapil</span>
              </div>
              <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center justify-between">
                <span>Surat Keterangan Tidak Mampu</span>
                <span className="text-[9px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Sosial</span>
              </div>
              <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center justify-between">
                <span>KTP Baru / Rusak</span>
                <span className="text-[9px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Kecamatan</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </CitizenLayout>
  );
}
