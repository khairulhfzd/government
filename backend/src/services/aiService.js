/**
 * AI Service using Google Gemini API
 * ==================================
 * Integrasi API Gemini (@google/generative-ai) untuk:
 * 1. Menganalisis laporan warga secara otomatis (Kategori, Urgensi, Ringkasan).
 * 2. Menjawab pertanyaan warga sebagai "Asisten Digital Pemerintah Kota".
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Inisialisasi API Gemini (Gunakan fallback jika key tidak tersedia)
const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;

if (apiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('[AI Service] Google Generative AI berhasil diinisialisasi.');
  } catch (error) {
    console.error('[AI Service] Gagal menginisialisasi Gemini API:', error.message);
  }
} else {
  console.warn('[AI Service] GEMINI_API_KEY tidak ditemukan di environment. Menggunakan Mock AI.');
}

// ==========================================
// 1. FALLBACK MOCK AI LOGIC (FOR ROBUSTNESS)
// ==========================================

const CATEGORY_KEYWORDS = {
  'Infrastruktur': ['jalan', 'jembatan', 'berlubang', 'rusak', 'gedung', 'bangunan', 'saluran', 'drainase', 'got', 'trotoar'],
  'Lingkungan': ['sampah', 'limbah', 'polusi', 'bau', 'pencemaran', 'banjir', 'genangan', 'pohon', 'taman'],
  'Keamanan': ['pencurian', 'maling', 'kriminal', 'gelap', 'lampu', 'rawan', 'premanisme', 'geng', 'perkelahian'],
  'Kesehatan': ['penyakit', 'wabah', 'rumah sakit', 'puskesmas', 'obat', 'nyamuk', 'demam', 'sanitasi', 'air bersih'],
  'Pendidikan': ['sekolah', 'guru', 'siswa', 'buku', 'kelas', 'pendidikan', 'belajar', 'mengajar', 'beasiswa'],
  'Administrasi': ['ktp', 'surat', 'pelayanan', 'birokrasi', 'antrian', 'lambat', 'dokumen', 'akta', 'izin', 'administrasi']
};

const AI_SUMMARIES_TEMPLATES = {
  'Infrastruktur': [
    'Laporan kerusakan infrastruktur yang memerlukan perhatian dan perbaikan segera oleh dinas terkait.',
    'Kondisi infrastruktur yang buruk berpotensi mengganggu mobilitas warga dan dapat menimbulkan kecelakaan.',
    'Kerusakan sarana publik yang membutuhkan evaluasi dan tindak lanjut dari pemerintah daerah setempat.'
  ],
  'Lingkungan': [
    'Masalah lingkungan yang dapat berdampak pada kesehatan masyarakat dan kualitas hidup warga sekitar.',
    'Permasalahan kebersihan dan sanitasi lingkungan yang memerlukan penanganan dari dinas kebersihan.',
    'Isu lingkungan yang berpotensi mencemari ekosistem dan mengganggu kenyamanan warga setempat.'
  ],
  'Keamanan': [
    'Laporan gangguan keamanan yang memerlukan peningkatan patroli dan pengawasan dari aparat keamanan setempat.',
    'Potensi ancaman keamanan di lingkungan warga yang membutuhkan respons cepat dari pihak kepolisian.',
    'Kondisi keamanan yang mengkhawatirkan dan memerlukan koordinasi antara warga dan petugas keamanan.'
  ],
  'Kesehatan': [
    'Permasalahan kesehatan masyarakat yang memerlukan intervensi segera dari dinas kesehatan setempat.',
    'Isu sanitasi dan kesehatan yang dapat berdampak luas pada kondisi kesehatan warga di sekitar lokasi.',
    'Laporan terkait fasilitas atau layanan kesehatan yang membutuhkan perhatian dan perbaikan sistematis.'
  ],
  'Pendidikan': [
    'Permasalahan di sektor pendidikan yang berpengaruh pada kualitas pembelajaran generasi muda.',
    'Isu fasilitas atau tenaga pendidik yang memerlukan perhatian dari dinas pendidikan setempat.',
    'Kondisi pendidikan yang membutuhkan peningkatan untuk memastikan hak atas pendidikan terpenuhi.'
  ],
  'Administrasi': [
    'Keluhan terkait layanan administrasi pemerintahan yang perlu ditingkatkan kualitas dan kecepatannya.',
    'Permasalahan birokrasi yang menghambat pelayanan publik dan perlu diperbaiki secara sistematis.',
    'Isu pelayanan administrasi yang memerlukan evaluasi prosedur dan peningkatan SDM aparatur.'
  ],
  'Lainnya': [
    'Laporan pengaduan yang memerlukan kajian lebih lanjut untuk menentukan instansi yang berwenang.',
    'Permasalahan yang dihadapi warga dan memerlukan koordinasi antar dinas untuk penyelesaiannya.',
    'Pengaduan yang perlu ditindaklanjuti dengan koordinasi multi-sektor oleh pemerintah daerah.'
  ]
};

function detectCategory(text) {
  const lowerText = text.toLowerCase();
  let maxScore = 0;
  let detectedCategory = 'Lainnya';

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter(keyword => lowerText.includes(keyword)).length;
    if (score > maxScore) {
      maxScore = score;
      detectedCategory = category;
    }
  }

  return detectedCategory;
}

function detectUrgencyLevel(text, category) {
  const lowerText = text.toLowerCase();
  
  const highKeywords = ['segera', 'darurat', 'bahaya', 'mendesak', 'kritis', 'fatal', 
                        'kecelakaan', 'meninggal', 'luka', 'kebakaran', 'banjir', 'ambruk'];
  const lowKeywords = ['kecil', 'minor', 'ringan', 'tidak terlalu', 'sedikit', 'kadang'];

  const highScore = highKeywords.filter(k => lowerText.includes(k)).length;
  const lowScore = lowKeywords.filter(k => lowerText.includes(k)).length;

  if (category === 'Keamanan' || category === 'Kesehatan') {
    if (highScore > 0) return 'High';
    return 'Medium';
  }

  if (highScore >= 2) return 'High';
  if (highScore === 1) return 'Medium';
  if (lowScore >= 2) return 'Low';

  const random = Math.random();
  if (random < 0.20) return 'High';
  if (random < 0.70) return 'Medium';
  return 'Low';
}

function mockAnalyzeComplaint(title, description, userCategory = null) {
  const combinedText = `${title} ${description}`;
  const category = userCategory && userCategory !== 'Lainnya' 
    ? userCategory 
    : detectCategory(combinedText);

  const ai_urgency_level = detectUrgencyLevel(combinedText, category);
  const templates = AI_SUMMARIES_TEMPLATES[category] || AI_SUMMARIES_TEMPLATES['Lainnya'];
  const baseTemplate = templates[Math.floor(Math.random() * templates.length)];
  const ai_summary = `[Mock AI - ${ai_urgency_level} Priority] ${baseTemplate} Laporan berjudul "${title}" telah dianalisis secara otomatis.`;

  return { category, ai_summary, ai_urgency_level };
}

// ==========================================
// 2. TUGAS 1: AI BACKEND INTEGRATION
// ==========================================

/**
 * Menganalisis laporan menggunakan Google Gemini API.
 * @param {string} title - Judul laporan
 * @param {string} description - Deskripsi laporan
 * @param {string} [userCategory] - Kategori yang dipilih user (opsional)
 * @returns {Object} { category, ai_summary, ai_urgency_level }
 */
async function analyzeComplaint(title, description, userCategory = null) {
  if (!genAI) {
    console.log('[AI Service] API key tidak terkonfigurasi. Menggunakan fallback Mock AI.');
    return mockAnalyzeComplaint(title, description, userCategory);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const systemPrompt = `Anda adalah AI penganalisis laporan warga. Analisis teks pelaporan dan kembalikan output WAJIB dalam format JSON murni (tanpa markdown backticks) dengan struktur:
{
  "category": "Infrastruktur | Lingkungan | Transportasi | Kesehatan | Keamanan | Sosial | Lainnya",
  "urgency": "High | Medium | Low",
  "ai_summary": "Ringkasan 3 poin utama (bullet points) yang padat dan jelas dari masalah pelapor untuk dibaca oleh Admin"
}

Aturan Penentuan:
1. category harus dipilih dari salah satu opsi yang diberikan (Infrastruktur, Lingkungan, Transportasi, Kesehatan, Keamanan, Sosial, atau Lainnya).
2. urgency harus dipilih dari High, Medium, atau Low berdasarkan sentimen dan tingkat bahaya/kedaruratan dari laporan.
3. ai_summary harus berisi 3 poin utama (bullet points) yang padat dan jelas dari masalah pelapor.`;

    const userPrompt = `Judul Laporan: ${title}\nDeskripsi Laporan: ${description}`;
    const fullPrompt = `${systemPrompt}\n\nLaporan untuk dianalisis:\n${userPrompt}`;

    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text().trim();
    
    // Parse JSON
    const parsedData = JSON.parse(responseText);

    // Pemetaan kategori Gemini ke Kategori ENUM Database MySQL
    // DB ENUM: 'Infrastruktur', 'Lingkungan', 'Keamanan', 'Kesehatan', 'Pendidikan', 'Administrasi', 'Lainnya'
    const allowedDBValues = ['Infrastruktur', 'Lingkungan', 'Keamanan', 'Kesehatan', 'Pendidikan', 'Administrasi', 'Lainnya'];
    let dbCategory = 'Lainnya';
    const geminiCategory = parsedData.category;

    if (allowedDBValues.includes(geminiCategory)) {
      dbCategory = geminiCategory;
    } else if (geminiCategory === 'Transportasi') {
      dbCategory = 'Infrastruktur'; // Transportasi dipetakan ke Infrastruktur
    } else if (geminiCategory === 'Sosial') {
      dbCategory = 'Lainnya'; // Sosial dipetakan ke Lainnya
    }

    // Jika user menginput kategori tersendiri (dan valid), utamakan kategori dari user
    if (userCategory && userCategory !== 'Lainnya' && allowedDBValues.includes(userCategory)) {
      dbCategory = userCategory;
    }

    return {
      category: dbCategory,
      ai_summary: parsedData.ai_summary || `Laporan tentang: ${title}`,
      ai_urgency_level: parsedData.urgency || 'Medium'
    };

  } catch (error) {
    console.error('[AI Service] Gemini API Error during analyzeComplaint:', error.message);
    return mockAnalyzeComplaint(title, description, userCategory);
  }
}

// ==========================================
// 3. TUGAS 2: SMART CITY CHATBOT LOGIC
// ==========================================

/**
 * Menangani query chat dari warga menggunakan Gemini API.
 * @param {string} userMessage - Pesan dari user
 * @param {Array} history - Riwayat percakapan [{ role: 'user'|'model', parts: [{ text: string }] }]
 * @returns {string} - Respons teks dari chatbot
 */
async function handleChatbotQuery(userMessage, history = []) {
  if (!genAI) {
    return 'Halo! Maaf, saat ini asisten AI sedang offline karena masalah konfigurasi server. Silakan hubungi kami kembali nanti atau ajukan laporan langsung melalui formulir pengaduan.';
  }

  try {
    const systemInstruction = `Anda adalah "Asisten Digital Pemerintah Kota" (digital city portal assistant) yang ramah, sopan, dan sangat solutif.

Tugas Utama Anda:
1. Membantu warga awam mendapatkan informasi terkait layanan birokrasi, pembuatan/persyaratan dokumen (seperti KTP, Kartu Keluarga/KK, Surat Domisili, akta lahir, dll.), serta tata cara membuat laporan pengaduan di website ini.
2. JANGAN menjawab pertanyaan di luar topik layanan pemerintahan kota (seperti cara memasak, tips bisnis, cara menjual ikan, pemrograman, curhat, dll.). Jika pengguna bertanya di luar topik tersebut, tolak dengan sopan dan arahkan mereka kembali untuk bertanya seputar layanan publik kota.

Format Jawaban yang Wajib Diikuti:
- Gunakan bahasa Indonesia yang ramah, sopan, dan natural.
- Jawaban harus terstruktur, ringkas, dan langsung pada intinya (jangan bertele-tele).
- Gunakan poin-poin (bullet points/numbered list) untuk menjelaskan syarat atau tahapan agar warga paham dengan cepat.
- Gunakan format cetak tebal (bold) dengan markdown **kata_kunci** untuk kata-kata atau berkas penting.
- Akhiri dengan kalimat pendek yang menawarkan bantuan lebih lanjut yang relevan.`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      systemInstruction: systemInstruction
    });

    // Format chat history untuk SDK Gemini (harus role: 'user' atau 'model')
    const formattedHistory = [];
    if (Array.isArray(history)) {
      for (const item of history) {
        const text = item.text || (item.parts && item.parts[0]?.text);
        if (item.role && text) {
          formattedHistory.push({
            role: item.role === 'model' || item.role === 'bot' ? 'model' : 'user',
            parts: [{ text: text }]
          });
        }
      }
    }

    const chat = model.startChat({
      history: formattedHistory
    });

    const result = await chat.sendMessage(userMessage);
    const responseText = result.response.text();
    return responseText;
  } catch (error) {
    console.error('[AI Service] Gemini API Error during handleChatbotQuery:', error.message);
    return 'Maaf, terjadi kesalahan saat memproses pesan Anda. Hubungi kami beberapa saat lagi.';
  }
}

module.exports = {
  analyzeComplaint,
  handleChatbotQuery
};
