import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CitizenLayout from '../../components/CitizenLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, FileText, X, ShieldAlert } from 'lucide-react';
import { FiInfo, FiUploadCloud } from 'react-icons/fi';

const TYPES = [
  { value: 'Surat Pengantar Domisili', label: 'Surat Pengantar Domisili', req: 'KTP Asli Pemohon, Surat Pengantar RT/RW setempat, dan Bukti Kepemilikan Rumah atau Kontrak Sewa.' },
  { value: 'Kartu Keluarga Baru', label: 'Kartu Keluarga Baru', req: 'Buku Nikah / Akta Perkawinan, Akta Kelahiran seluruh anggota keluarga, dan Kartu Keluarga lama.' },
  { value: 'Surat Keterangan Tidak Mampu', label: 'Surat Keterangan Tidak Mampu (SKTM)', req: 'Surat Pengantar RT/RW, Slip Gaji atau Surat Keterangan Penghasilan, dan Foto Rumah tampak depan.' },
  { value: 'KTP Baru / Rusak', label: 'KTP Baru / Rusak', req: 'KTP lama yang rusak (jika rusak) atau Surat Keterangan Hilang dari Kepolisian (jika hilang), dan fotokopi KK.' },
  { value: 'Lainnya', label: 'Pengajuan Lainnya', req: 'Berkas atau dokumen pendukung yang relevan dengan jenis surat yang Anda butuhkan.' }
];

export default function WargaPengajuanBaru() {
  const navigate = useNavigate();
  const fileRef = useRef();
  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const selectedTypeObj = TYPES.find(t => t.value === type);

  const processFiles = (selectedFiles) => {
    const totalFiles = files.length + selectedFiles.length;
    if (totalFiles > 5) {
      toast.error('Maksimal unggah 5 berkas sekaligus.');
      return;
    }

    const validFiles = [];
    for (let f of selectedFiles) {
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`Berkas ${f.name} terlalu besar (maksimal 5MB).`);
        continue;
      }
      validFiles.push(f);
    }

    setFiles(prev => [...prev, ...validFiles]);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    processFiles(selectedFiles);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files || []);
    processFiles(droppedFiles);
  };

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, idx) => idx !== index));
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!type) { toast.error('Silakan pilih jenis pengajuan.'); return; }
    if (!title.trim() || !description.trim()) { toast.error('Semua kolom wajib diisi.'); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('type', type);
      fd.append('title', title.trim());
      fd.append('description', description.trim());
      
      files.forEach(f => {
        fd.append('documents', f);
      });

      await api.post('/submissions', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Pengajuan berhasil dikirim!');
      navigate('/warga/pengajuan');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim pengajuan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CitizenLayout title="Buat Pengajuan Surat">
      
      {/* Back button and title */}
      <div className="mb-6 flex items-center gap-3">
        <Link to="/warga/pengajuan" className="p-2.5 bg-white rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 text-slate-500 transition-colors">
          <ArrowLeft size={16}/>
        </Link>
        <div>
          <h3 className="text-slate-800 font-extrabold text-base">Kembali ke Daftar</h3>
          <p className="text-slate-400 text-[11px] font-bold">Lengkapi data di bawah untuk pengajuan baru</p>
        </div>
      </div>

      <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* FORM SIDE (LEFT - 2 cols) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-extrabold text-slate-800 mb-2">Jenis Surat / Dokumen <span className="text-red-500">*</span></label>
                <select value={type} onChange={e => setType(e.target.value)} required
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-150 bg-white text-slate-800 text-sm font-bold focus:outline-none focus:border-blue-500 transition-colors">
                  <option value="">-- Pilih Jenis Layanan Surat --</option>
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-extrabold text-slate-800 mb-2">Judul Pengajuan <span className="text-red-500">*</span></label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="Contoh: Permohonan SKTM a.n. Anak Budi" required
                  className="citizen-input"/>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-extrabold text-slate-800 mb-2">Keterangan Keperluan <span className="text-red-500">*</span></label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
                  placeholder="Tulis alasan, keperluan, atau penjelasan tambahan mengapa Anda mengajukan dokumen ini..." required
                  className="citizen-input resize-none"/>
              </div>

              {/* File Upload (Image or PDF) */}
              <div>
                <label className="block text-sm font-extrabold text-slate-800 mb-2">Unggah Berkas Persyaratan <span className="text-slate-400 font-bold text-xs">(Opsional, Maks. 5 file)</span></label>
                
                {files.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {files.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl relative group">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-100">
                              <FileText size={18} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-slate-800 font-bold text-xs truncate max-w-40">{file.name}</p>
                              <p className="text-slate-400 text-[10px] font-bold mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <button type="button" onClick={() => handleRemoveFile(idx)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                            <X size={15} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {files.length < 5 && (
                      <button type="button" onClick={() => fileRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50/20 transition-all font-extrabold text-xs cursor-pointer">
                        <FiUploadCloud size={14} /> Tambah Berkas Persyaratan
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="w-full border-2 border-dashed border-slate-200 hover:border-blue-500/50 rounded-2xl p-7 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-50 hover:bg-slate-50/50 focus:outline-none focus:border-blue-500"
                  >
                    <Upload size={22} className="text-slate-400 mb-2"/>
                    <p className="text-slate-700 font-bold text-xs">Pilih atau Seret dokumen / gambar persyaratan</p>
                    <p className="text-slate-400 text-[10px] mt-1">PDF, JPG, PNG, atau WebP (Maks. 5MB)</p>
                  </button>
                )}
                <input ref={fileRef} type="file" multiple accept="image/*,application/pdf" onChange={handleFileChange} className="hidden" />
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                ) : (
                  'Kirim Pengajuan Sekarang'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* INFO SIDEBAR (RIGHT - 1 col) */}
        <div className="space-y-6">
          
          {/* Dynamic Requirements Info */}
          {selectedTypeObj ? (
            <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 space-y-4">
              <h4 className="font-extrabold text-sm text-blue-900 flex items-center gap-2">
                <ShieldAlert className="text-blue-600" size={16} /> Berkas Persyaratan
              </h4>
              <p className="text-xs text-blue-800 leading-relaxed font-semibold">
                Untuk mempercepat persetujuan <strong>{selectedTypeObj.label}</strong>, pastikan Anda melampirkan berkas berikut:
              </p>
              <div className="p-4 bg-white/80 border border-blue-100 rounded-2xl text-xs text-slate-750 text-slate-700 leading-relaxed font-medium">
                {selectedTypeObj.req}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-3.5 shadow-sm">
              <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                <FiInfo className="text-blue-600" /> Informasi Berkas
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Silakan pilih jenis pengajuan surat untuk melihat persyaratan berkas dokumen yang perlu Anda siapkan.
              </p>
            </div>
          )}

          <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-3.5 shadow-sm">
            <h4 className="font-extrabold text-sm text-blue-400">Verifikasi Kelurahan</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
              Proses verifikasi dokumen memerlukan waktu 1x24 jam kerja. Setelah disetujui oleh kelurahan, berkas digital resmi Anda akan dapat diunduh langsung melalui menu detail pengajuan di halaman ini.
            </p>
          </div>

        </div>

      </div>

    </CitizenLayout>
  );
}
