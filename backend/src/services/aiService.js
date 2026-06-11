const KATEGORI_LIST = [
  "Infrastruktur & Jalan",
  "Kebersihan & Sampah",
  "Keamanan & Ketertiban",
  "Pelayanan Publik",
  "Pendidikan",
  "Kesehatan",
  "Air & Sanitasi",
  "Listrik & Penerangan",
  "Lainnya",
];

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

async function callGemini(prompt) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(`${BASE_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2000 },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini error ${res.status}: ${err}`);
    }

    const data = await res.json();
    console.log("[Gemini API Call] Raw Data:", JSON.stringify(data));
    return data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function analyzeComplaint(judulLaporan, deskripsi) {
  try {
    const prompt = `Kamu adalah sistem AI untuk Portal Pengaduan Masyarakat pemerintah Indonesia.
Analisis laporan pengaduan berikut dan jawab HANYA dalam format JSON tanpa teks lain, tanpa markdown:
{
  "kategori": "salah satu dari: ${KATEGORI_LIST.join(", ")}",
  "urgensi": "rendah | sedang | tinggi",
  "ringkasan": "ringkasan maks 100 karakter",
  "rekomendasi": "rekomendasi tindak lanjut untuk petugas 1-2 kalimat"
}
Panduan urgensi: tinggi=keselamatan jiwa/bencana, sedang=mengganggu aktivitas, rendah=keluhan umum.

Judul: ${judulLaporan}
Deskripsi: ${deskripsi}`;

    const text = await callGemini(prompt);
    console.log("[AI] Raw response from Gemini:", text);
    let cleaned = text.trim();
    const startIdx = cleaned.indexOf('{');
    const endIdx = cleaned.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      cleaned = cleaned.substring(startIdx, endIdx + 1);
    }
    const parsed = JSON.parse(cleaned);

    if (!["rendah", "sedang", "tinggi"].includes(parsed.urgensi))
      parsed.urgensi = "sedang";
    if (!KATEGORI_LIST.includes(parsed.kategori)) parsed.kategori = "Lainnya";

    return {
      success: true,
      kategori: parsed.kategori,
      urgensi: parsed.urgensi,
      ringkasan: (parsed.ringkasan || judulLaporan).substring(0, 100),
      rekomendasi: parsed.rekomendasi || "Ditinjau petugas.",
      ai_powered: true,
    };
  } catch (err) {
    console.error("Gemini analyzeComplaint error:", err.message);
    return {
      success: false,
      kategori: "Lainnya",
      urgensi: "sedang",
      ringkasan: judulLaporan.substring(0, 100),
      rekomendasi: "Harap ditinjau secara manual oleh petugas.",
      ai_powered: false,
    };
  }
}

function getLocalResponse(pertanyaan) {
  const q = pertanyaan.toLowerCase().trim();

  // 1. KTP
  if (q.includes('ktp') || (q.includes('kartu') && q.includes('tanda') && q.includes('penduduk'))) {
    return `Persyaratan mengurus KTP Baru:\n1. Berusia minimal 17 tahun.\n2. Surat Pengantar RT/RW.\n3. Fotokopi Kartu Keluarga (KK).\n4. Perekaman foto & sidik jari (biometrik) di Kantor Kecamatan.`;
  }

  // 2. Kartu Keluarga (KK)
  if (q.includes('kk') || q.includes('kartu keluarga')) {
    return `Persyaratan mengurus Kartu Keluarga (KK) Baru:\n1. Surat Pengantar RT/RW.\n2. Buku Nikah / Akta Perkawinan (bagi pengantin baru).\n3. Surat Keterangan Pindah Datang (jika pindah domisili).\n4. Mengisi Formulir F-1.01 di Kelurahan.`;
  }

  // 3. Surat Domisili
  if (q.includes('domisili') || q.includes('keterangan tempat tinggal')) {
    return `Persyaratan membuat Surat Keterangan Domisili:\n1. Surat Pengantar RT/RW.\n2. Fotokopi KTP dan Kartu Keluarga (KK).\n3. Surat Kuasa bermaterai jika diwakilkan.\n4. Mengajukan berkas di Kantor Kelurahan setempat.`;
  }

  // 4. Cara membuat pengaduan
  if (q.includes('cara buat') || q.includes('cara melapor') || q.includes('cara membuat laporan') || (q.includes('bagaimana') && q.includes('laporan')) || (q.includes('cara') && q.includes('pengaduan'))) {
    return `Cara membuat laporan pengaduan baru:\n1. Daftar/Masuk ke akun warga Anda.\n2. Pilih menu "Laporkan Kendala" di navigasi atas.\n3. Isi judul laporan, deskripsi kendala secara lengkap, pilih kategori, unggah foto bukti, lalu klik "Kirim Laporan".`;
  }

  // 5. Berkas pendukung pengaduan
  if (q.includes('berkas') || q.includes('dokumen pendukung') || q.includes('foto bukti') || q.includes('unggah')) {
    return `Berkas pendukung pengaduan:\n- Anda dapat melampirkan foto bukti fisik kendala (misal: jalan berlubang, sampah) berformat JPG, JPEG, atau PNG.\n- Ukuran file maksimal 5MB.\n- Foto bukti yang jelas akan mempercepat proses verifikasi oleh petugas.`;
  }

  // 6. Kerahasiaan pengaduan / rahasia / aman
  if (q.includes('rahasia') || q.includes('aman') || q.includes('identitas') || q.includes('dilindungi')) {
    return `Kerahasiaan Pengaduan:\nYa, identitas Anda dijamin aman dan dirahasiakan oleh sistem. Laporan Anda hanya diteruskan ke instansi terkait secara anonim demi perlindungan pelapor.`;
  }

  // 7. Cek status laporan
  if (q.includes('cek status') || q.includes('riwayat laporan') || q.includes('melihat status') || q.includes('pantau status')) {
    return `Cara mengecek status laporan:\n1. Masuk ke akun warga Anda.\n2. Klik menu "Riwayat Laporan" pada navigasi atas.\n3. Status laporan terbaru (Menunggu, Diproses, Selesai, Ditolak) akan tertera di setiap tiket.`;
  }

  // 8. Arti status / perbedaan status
  if (q.includes('arti status') || q.includes('perbedaan status') || q.includes('menunggu') || q.includes('diproses') || q.includes('selesai')) {
    return `Arti Status Laporan:\n- **Menunggu**: Menunggu verifikasi petugas.\n- **Diproses**: Sedang ditindaklanjuti oleh dinas terkait.\n- **Selesai**: Kendala sudah selesai ditangani.\n- **Ditolak**: Laporan tidak valid.`;
  }

  // 9. Berapa lama
  if (q.includes('berapa lama') || q.includes('waktu') || q.includes('durasi') || q.includes('hari')) {
    return `Waktu penanganan laporan:\nLaporan biasanya diverifikasi dalam 24 jam dan ditindaklanjuti dalam waktu 1 hingga 7 hari kerja tergantung tingkat kesulitan kendala di lapangan.`;
  }

  // 10. Salam / Greeting
  if (q === 'hi' || q === 'halo' || q === 'hello' || q === 'p' || q === 'pagi' || q === 'siang' || q === 'sore' || q === 'malam' || q === 'assalamualaikum' || q.includes('selamat')) {
    return `Halo! Saya Asisten Virtual Kota Digital. Ada yang bisa saya bantu hari ini? Anda bisa mengeklik tombol menu cepat di atas atau bertanya tentang syarat KTP, KK, Domisili, atau cara pengaduan.`;
  }

  return null;
}

async function getChatbotResponse(pertanyaan, konteks = {}) {
  try {
    // 1. Tentukan Prompt untuk Google Gemini LLM
    const { totalLaporan, history = [] } = konteks;
    const ctx = totalLaporan
      ? `Info sistem: ada ${totalLaporan} laporan aktif.`
      : "";

    let historyText = "";
    if (history && history.length > 0) {
      historyText = "Riwayat percakapan sebelumnya:\n" + history.map(h => `${h.role === 'model' ? 'Asisten' : 'Warga'}: ${h.text}`).join("\n") + "\n\n";
    }

    const prompt = `Kamu adalah asisten virtual Portal Pengaduan Masyarakat pemerintah Indonesia.
Bantu warga dengan ramah, singkat, dan informatif dalam Bahasa Indonesia maksimal 3 kalimat.
Jam operasional: Senin-Jumat 08.00-16.00 WIB. ${ctx}

${historyText}Warga: ${pertanyaan}
Asisten:`;

    // 2. Hubungi Google Gemini API (Real LLM)
    console.log("[LLM] Mengirim permintaan ke Google Gemini API...");
    const reply = await callGemini(prompt);
    return { success: true, reply };

  } catch (err) {
    console.warn("Gemini API error (menggunakan local fallback):", err.message);

    // 3. Fallback jika API Key bermasalah/offline
    const localReply = getLocalResponse(pertanyaan);
    if (localReply) {
      return { success: true, reply: localReply };
    }

    return {
      success: true,
      reply:
        "Halo! Mohon maaf, asisten AI sedang offline saat ini. Namun, Anda dapat menanyakan tentang persyaratan pembuatan KTP, KK, Surat Domisili, atau tata cara pengaduan warga.",
    };
  }
}

module.exports = { analyzeComplaint, getChatbotResponse, KATEGORI_LIST };
