import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CitizenLayout from '../../components/CitizenLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { CATEGORIES } from '../../utils/constants';
import { FiUploadCloud, FiX, FiSend, FiAlertCircle, FiFileText, FiInfo, FiCheckCircle } from 'react-icons/fi';

export default function WargaLapor() {
  const navigate = useNavigate();
  const fileRef = useRef();
  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    images: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const processImages = (files) => {
    const totalFiles = form.images.length + files.length;
    if (totalFiles > 5) {
      toast.error('Maksimal unggah 5 berkas sekaligus.');
      return;
    }

    const validFiles = [];
    const newPreviews = [];

    for (let file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Berkas ${file.name} terlalu besar. Maksimal 5MB.`);
        continue;
      }
      validFiles.push(file);
      if (file.type === 'application/pdf') {
        newPreviews.push({ isPdf: true, name: file.name });
      } else {
        newPreviews.push({ isPdf: false, url: URL.createObjectURL(file) });
      }
    }

    setForm(prev => ({ ...prev, images: [...prev.images, ...validFiles] }));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    processImages(files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;
    processImages(files);
  };

  const removeImage = (index) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index)
    }));
    setImagePreviews(prev => prev.filter((_, idx) => idx !== index));
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Judul dan deskripsi wajib diisi!');
      return;
    }
    if (form.description.trim().length < 20) {
      toast.error('Deskripsi minimal 20 karakter.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('title', form.title.trim());
    formData.append('description', form.description.trim());
    if (form.category) formData.append('category', form.category);
    
    form.images.forEach(file => {
      formData.append('images', file);
    });

    try {
      await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('🎉 Laporan berhasil dikirim! Terima kasih telah melaporkan.');
      navigate('/warga/riwayat');
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mengirim laporan. Coba lagi.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CitizenLayout title="Buat Laporan Baru">
      <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FORM SIDE (LEFT) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info banner */}
          <div className="flex items-start gap-3.5 p-4 bg-blue-50/50 border border-blue-100 rounded-3xl">
            <FiAlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-extrabold text-blue-900">Analisis Otomatis</p>
              <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                Sistem kami akan memindai dan mengklasifikasikan laporan Anda menggunakan teknologi verifikasi data. Silakan isi form di bawah dengan informasi yang valid.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-slate-100 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
            {/* Judul */}
            <div>
              <label className="block text-sm font-extrabold text-slate-800 mb-2">
                Judul Kendala / Laporan <span className="text-red-500">*</span>
              </label>
              <input
                id="title" name="title" type="text"
                value={form.title} onChange={handleChange}
                placeholder="Contoh: Jalan berlubang di depan SD Negeri 1"
                className="citizen-input" maxLength={255} required
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1.5 font-bold">
                <span>Gunakan bahasa yang jelas dan ringkas</span>
                <span>{form.title.length}/255 karakter</span>
              </div>
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-sm font-extrabold text-slate-800 mb-1">
                Kategori Masalah
              </label>
              <p className="text-[11px] font-bold text-slate-400 mb-3">Opsional — Kategori akan otomatis terdeteksi jika dikosongkan</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value} type="button"
                    onClick={() => setForm(prev => ({ ...prev, category: prev.category === cat.value ? '' : cat.value }))}
                    className={`px-4 py-3 rounded-2xl text-xs font-bold text-center border-2 transition-all duration-200
                      ${form.category === cat.value
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20'
                        : 'bg-white border-slate-100 text-slate-6 text-slate-600 hover:border-blue-300'}`}>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-sm font-extrabold text-slate-800 mb-2">
                Kronologi & Deskripsi Detail <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description" name="description"
                value={form.description} onChange={handleChange}
                placeholder="Ceritakan kronologi lengkap, lokasi detail, dan dampaknya. Deskripsi yang jelas memudahkan petugas melakukan verifikasi lapangan."
                className="citizen-input resize-none"
                rows={6} maxLength={5000} required
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1.5 font-bold">
                <span>Minimal 20 karakter</span>
                <span>{form.description.length}/5000 karakter</span>
              </div>
            </div>

            {/* Upload Foto */}
            <div>
              <label className="block text-sm font-extrabold text-slate-800 mb-2">
                Unggah Foto / Berkas Bukti <span className="text-slate-400 font-normal text-xs">(Opsional, Maks. 5 file)</span>
              </label>
              
              {imagePreviews.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {imagePreviews.map((prev, idx) => (
                      <div key={idx} className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 p-4 flex flex-col justify-between gap-3 shadow-sm">
                        {prev.isPdf ? (
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 border border-blue-100">
                              <FiFileText size={22} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-slate-800 font-extrabold text-xs truncate">{prev.name}</p>
                              <p className="text-slate-400 text-[10px] mt-0.5 font-bold">Dokumen PDF Terlampir</p>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center">
                            <img src={prev.url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <button type="button" onClick={() => removeImage(idx)}
                          className="absolute top-2.5 right-2.5 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors cursor-pointer">
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {imagePreviews.length < 5 && (
                    <button type="button" onClick={() => fileRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      className="w-full py-3.5 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50/20 transition-all font-extrabold text-xs cursor-pointer">
                      <FiUploadCloud size={14} /> Tambah Berkas Lainnya
                    </button>
                  )}
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="w-full py-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center gap-3 
                             hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 group cursor-pointer focus:outline-none focus:border-blue-500">
                  <div className="w-12 h-12 bg-slate-50 group-hover:bg-blue-100/50 rounded-2xl flex items-center justify-center transition-colors">
                    <FiUploadCloud className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="text-slate-700 font-bold text-xs">Ketuk atau Seret dokumen / foto di sini</p>
                    <p className="text-slate-400 text-[10px] mt-0.5">Maksimal 5 berkas • Format JPG, PNG, atau PDF • Ukuran Maks. 5MB</p>
                  </div>
                </button>
              )}
              
              <input ref={fileRef} type="file" multiple accept="image/*,application/pdf" onChange={handleImageChange} className="hidden" />
            </div>

            {/* Submit */}
            <button id="btn-submit-laporan" type="submit" disabled={loading}
              className="citizen-btn-primary disabled:opacity-60 disabled:cursor-not-allowed mt-4">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Memproses Laporan Anda...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <FiSend className="w-4 h-4" />
                  Kirim Laporan Resmi
                </span>
              )}
            </button>
          </form>
        </div>

        {/* INFORMATION SIDEBAR (RIGHT) */}
        <div className="space-y-6">
          
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-slate-900 font-extrabold text-sm flex items-center gap-2">
              <FiInfo className="text-blue-600" /> Panduan Pelaporan
            </h3>
            
            <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed pt-2">
              <div className="flex gap-3">
                <FiCheckCircle className="text-emerald-500 w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>Lokasi Jelas:</strong> Sebutkan alamat jalan, RT/RW, kelurahan, atau patokan terdekat.
                </p>
              </div>
              <div className="flex gap-3">
                <FiCheckCircle className="text-emerald-500 w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>Deskripsi Obyektif:</strong> Ceritakan kronologi kejadian tanpa bahasa emosional.
                </p>
              </div>
              <div className="flex gap-3">
                <FiCheckCircle className="text-emerald-500 w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>Bukti Foto:</strong> Pastikan foto bukti memiliki pencahayaan yang cukup dan jelas fokusnya.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-4">
            <h3 className="font-extrabold text-sm text-blue-400">Pemberitahuan Hukum</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Setiap laporan yang dikirimkan dilindungi oleh Undang-Undang Perlindungan Data Pribadi. Penyalahgunaan sistem berupa laporan palsu atau SARA dapat dikenakan sanksi hukum sesuai ketentuan yang berlaku.
            </p>
          </div>

        </div>

      </div>
    </CitizenLayout>
  );
}
