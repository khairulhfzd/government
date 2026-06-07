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
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

async function callGemini(prompt) {
  const res = await fetch(`${BASE_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.candidates[0].content.parts[0].text.trim();
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
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
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

async function getChatbotResponse(pertanyaan, konteks = {}) {
  try {
    const ctx = konteks.totalLaporan
      ? `Info sistem: ada ${konteks.totalLaporan} laporan aktif.`
      : "";

    const prompt = `Kamu adalah asisten virtual Portal Pengaduan Masyarakat pemerintah Indonesia.
Bantu warga dengan ramah, singkat, dan informatif dalam Bahasa Indonesia maksimal 3 kalimat.
Jam operasional: Senin-Jumat 08.00-16.00 WIB. ${ctx}

Pertanyaan: ${pertanyaan}`;

    const reply = await callGemini(prompt);
    return { success: true, reply };
  } catch (err) {
    console.error("Gemini chatbot error:", err.message);
    return {
      success: false,
      reply:
        "Maaf, asisten sedang tidak tersedia. Hubungi petugas di kantor terdekat.",
    };
  }
}

module.exports = { analyzeComplaint, getChatbotResponse, KATEGORI_LIST };
