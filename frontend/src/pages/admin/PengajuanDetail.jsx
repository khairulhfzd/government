import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';
import { getStatusClass, formatDate, resolveFileUrl } from '../../utils/constants';
import toast from 'react-hot-toast';
import { ArrowLeft, User, Phone, Mail, FileText, Check, Save, ExternalLink } from 'lucide-react';

export default function AdminPengajuanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/submissions/${id}`)
      .then(r => {
        setSubmission(r.data.submission);
        setStatus(r.data.submission.status);
        setAdminNotes(r.data.submission.admin_notes || '');
      })
      .catch(e => {
        console.error(e);
        toast.error('Gagal memuat detail pengajuan.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/submissions/${id}/status`, {
        status,
        admin_notes: adminNotes
      });
      toast.success('Status pengajuan berhasil diperbarui!');
      // Update local state
      setSubmission(p => ({ ...p, status, admin_notes: adminNotes }));
    } catch(err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui status.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Detail Pengajuan" subtitle="Memuat data...">
        <div className="h-96 bg-white border border-slate-200 rounded-3xl shimmer opacity-30" />
      </AdminLayout>
    );
  }

  if (!submission) {
    return (
      <AdminLayout title="Detail Pengajuan" subtitle="Error">
        <div className="admin-card p-6 text-center py-12">
          <p className="text-red-600 font-bold">Data pengajuan tidak ditemukan.</p>
          <Link to="/admin/pengajuan" className="text-blue-600 font-bold hover:underline mt-2 inline-block">
            Kembali ke Daftar
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const fileList = submission.document_url ? submission.document_url.split(',') : [];

  return (
    <AdminLayout title="Detail Pengajuan" subtitle={`Layanan: ${submission.type}`}>
      
      {/* Back button */}
      <div className="mb-4">
        <Link to="/admin/pengajuan" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors">
          <ArrowLeft size={14}/> Kembali ke Daftar Pengajuan
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Details & File Viewer */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card info */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="admin-card p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-655 text-slate-600 border border-slate-200/50">
                  {submission.type}
                </span>
                <h2 className="text-slate-800 font-extrabold text-lg mt-2">{submission.title}</h2>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusClass(submission.status)}`}>
                {submission.status}
              </span>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Keterangan Pemohon:</h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap font-medium">{submission.description}</p>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between text-xs text-slate-400 font-bold">
              <span>Diajukan pada: {formatDate(submission.createdAt)}</span>
            </div>
          </motion.div>

          {/* Document Attachment Viewer */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="admin-card p-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">Dokumen Persyaratan ({fileList.length})</h3>
            
            {fileList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fileList.map((url, idx) => {
                  const isPdf = url.toLowerCase().endsWith('.pdf');
                  const absoluteUrl = resolveFileUrl(url);
                  return (
                    <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden p-3.5 bg-slate-50 flex flex-col justify-between gap-3">
                      {isPdf ? (
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-100">
                            <FileText size={20} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-slate-800 font-bold text-xs truncate">{url.split('/').pop()}</p>
                            <p className="text-slate-400 text-[10px] font-bold mt-0.5">Dokumen PDF</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 flex-1">
                          <div className="rounded-xl overflow-hidden border border-slate-200 shadow-inner h-32 flex items-center justify-center bg-white">
                            <img src={absoluteUrl} alt={`Lampiran ${idx+1}`} className="object-cover w-full h-full" />
                          </div>
                          <p className="text-slate-800 font-bold text-[10px] truncate">{url.split('/').pop()}</p>
                        </div>
                      )}
                      <a href={absoluteUrl} target="_blank" rel="noopener noreferrer"
                        className="w-full text-center py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1">
                        Buka Berkas <ExternalLink size={11} />
                      </a>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm">
                <p>Tidak ada berkas yang dilampirkan.</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar – Warga Profile & Review Form */}
        <div className="space-y-6">
          {/* Profile Card */}
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, y: 0 }}
            className="admin-card p-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">Profil Pemohon</h3>
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-12 h-12 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center justify-center font-extrabold text-base">
                {submission.applicant?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-slate-800 font-extrabold text-sm truncate">{submission.applicant?.name}</p>
                <p className="text-blue-600 text-xs font-bold">Pemohon Layanan</p>
              </div>
            </div>

            <div className="space-y-3.5 border-t border-slate-100 pt-4 text-xs font-bold">
              <div className="flex items-center gap-2.5 text-slate-600">
                <Mail size={13} className="text-slate-400" />
                <span className="truncate">{submission.applicant?.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <Phone size={13} className="text-slate-400" />
                <span>{submission.applicant?.phone || '-'}</span>
              </div>
            </div>
          </motion.div>

          {/* Action Review Form */}
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="admin-card p-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">Proses Permohonan</h3>
            <form onSubmit={handleSave} className="space-y-4">
              
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Status Permohonan</label>
                <select value={status} onChange={e => setStatus(e.target.value)}
                  className="admin-input">
                  <option value="Menunggu" className="text-slate-800 font-semibold bg-white">Menunggu Verifikasi</option>
                  <option value="Diproses" className="text-slate-800 font-semibold bg-white">Diproses / Dikerjakan</option>
                  <option value="Selesai" className="text-slate-800 font-semibold bg-white">Selesai / Terbit</option>
                  <option value="Ditolak" className="text-slate-800 font-semibold bg-white">Ditolak</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Catatan Kelurahan</label>
                <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={4}
                  placeholder="Contoh: Berkas Anda disetujui. Dokumen resmi dapat diambil di Kantor Kelurahan pada jam kerja."
                  className="admin-input resize-none"/>
              </div>

              <button type="submit" disabled={saving} className="admin-btn-primary py-2.5 flex items-center justify-center gap-2">
                {saving ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                ) : (
                  <><Save size={13}/> Simpan Perubahan</>
                )}
              </button>
            </form>
          </motion.div>
        </div>

      </div>
    </AdminLayout>
  );
}
