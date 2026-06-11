import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { getStatusClass, getUrgencyClass, formatDate, resolveFileUrl } from '../../utils/constants';
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiCalendar, FiTag, FiSave, FiExternalLink, FiFileText } from 'react-icons/fi';

const STATUSES = ['Menunggu', 'Diproses', 'Selesai', 'Ditolak'];

export default function AdminTiketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [form, setForm] = useState({ status: '', admin_notes: '' });

  useEffect(() => {
    api.get(`/admin/tickets/${id}`)
      .then(res => {
        const c = res.data.complaint;
        setComplaint(c);
        setForm({ status: c.status, admin_notes: c.admin_notes || '' });
      })
      .catch(() => {
        toast.error('Laporan tidak ditemukan.');
        navigate('/admin/tiket');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const res = await api.patch(`/admin/tickets/${id}/status`, form);
      setComplaint(res.data.complaint);
      toast.success(`Status berhasil diubah ke "${form.status}"`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui status.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Detail Tiket">
        <div className="max-w-4xl mx-auto space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="admin-card animate-pulse h-32" />)}
        </div>
      </AdminLayout>
    );
  }

  const fileList = complaint.image_url ? complaint.image_url.split(',') : [];

  return (
    <AdminLayout
      title="Detail Tiket"
      subtitle={`ID: ${complaint.id.slice(0, 8).toUpperCase()}...`}>
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link to="/admin/tiket"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 text-sm font-bold mb-6 transition-colors group">
          <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Daftar Tiket
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Complaint Detail */}
          <div className="lg:col-span-2 space-y-4">
            {/* Header Card */}
            <div className="admin-card p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h2 className="text-slate-800 font-extrabold text-lg leading-tight flex-1">{complaint.title}</h2>
                <span className={getUrgencyClass(complaint.ai_urgency_level)}>{complaint.ai_urgency_level}</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className={getStatusClass(complaint.status)}>{complaint.status}</span>
                <span className="text-xs bg-slate-100 text-slate-600 border border-slate-200/50 px-2.5 py-1 rounded-full font-semibold">
                  <FiTag className="inline w-3 h-3 mr-1" />{complaint.category}
                </span>
                <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                  <FiCalendar className="w-3 h-3 text-slate-400" />
                  {formatDate(complaint.createdAt)}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="admin-card p-6">
              <h3 className="text-slate-800 font-bold text-sm mb-3">📝 Kronologi Pengaduan</h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">{complaint.description}</p>
            </div>

            {/* AI Analysis */}
            {complaint.ai_summary && (
              <div className="admin-card p-6 border border-blue-100 bg-blue-50/20">
                <h3 className="text-blue-700 font-bold text-sm mb-3">
                  Analisis Otomatis
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">{complaint.ai_summary}</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="text-xs text-slate-400 font-bold">Urgensi Terdeteksi:</div>
                  <span className={getUrgencyClass(complaint.ai_urgency_level) + ' text-xs'}>
                    {complaint.ai_urgency_level} Priority
                  </span>
                </div>
              </div>
            )}

            {/* Image/PDF Proof */}
            {fileList.length > 0 && (
              <div className="admin-card p-6">
                <h3 className="text-slate-800 font-bold text-sm mb-4">📁 Berkas Lampiran ({fileList.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {fileList.map((url, idx) => {
                    const isPdf = url.toLowerCase().endsWith('.pdf');
                    const absoluteUrl = resolveFileUrl(url);
                    return (
                      <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden p-3.5 bg-slate-50 flex flex-col justify-between gap-3">
                        {isPdf ? (
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-100">
                              <FiFileText size={20} />
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
                          Buka File <FiExternalLink size={11} />
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Reporter & Action */}
          <div className="space-y-4">
            {/* Reporter Info */}
            <div className="admin-card p-6">
              <h3 className="text-slate-800 font-bold text-sm mb-4">👤 Informasi Pelapor</h3>
              <div className="space-y-3">
                <InfoRow icon={<FiUser />} label="Nama" value={complaint.reporter?.name || '-'} />
                <InfoRow icon={<FiMail />} label="Email" value={complaint.reporter?.email || '-'} />
                <InfoRow icon={<FiPhone />} label="Telepon" value={complaint.reporter?.phone || '-'} />
              </div>
            </div>

            {/* Update Status */}
            <div className="admin-card p-6 border border-slate-200">
              <h3 className="text-slate-800 font-bold text-sm mb-4">⚙️ Ubah Status Laporan</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 font-bold mb-2">Status Baru</label>
                  <select value={form.status}
                    onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                    className="admin-input w-full">
                    {STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-bold mb-2">Catatan Admin (opsional)</label>
                  <textarea
                    value={form.admin_notes}
                    onChange={e => setForm(p => ({ ...p, admin_notes: e.target.value }))}
                    placeholder="Tambahkan catatan atau tindak lanjut untuk warga..."
                    className="admin-input w-full resize-none"
                    rows={4}
                  />
                </div>
                <button onClick={handleUpdate} disabled={updating}
                  className="w-full admin-btn-primary py-2.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {updating ? (
                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Menyimpan...</>
                  ) : (
                    <><FiSave className="w-4 h-4" /> Simpan Perubahan</>
                  )}
                </button>
              </div>
            </div>

            {/* Timeline placeholder */}
            <div className="admin-card p-6">
              <h3 className="text-slate-800 font-bold text-sm mb-3">📅 Riwayat Waktu</h3>
              <div className="space-y-2 text-xs text-slate-400 font-bold">
                <p><span className="text-slate-500 font-semibold">Dibuat:</span> {formatDate(complaint.createdAt)}</p>
                <p><span className="text-slate-500 font-semibold">Diperbarui:</span> {formatDate(complaint.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-slate-400 mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-slate-400 font-bold">{label}</p>
        <p className="text-slate-700 text-sm font-bold break-all">{value}</p>
      </div>
    </div>
  );
}
