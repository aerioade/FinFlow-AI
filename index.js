require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Validasi environment variables sebelum jalan
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ Error: GEMINI_API_KEY tidak ditemukan di file .env");
  process.exit(1);
}

// Inisialisasi SDK dengan API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_INSTRUCTION = `
  Kamu adalah asisten keuangan pintar untuk UMKM Indonesia. Ekstrak data dari pesan berikut ke dalam format JSON array.
  Aturan:
  1. "type": isi dengan "income" atau "expense".
  2. "amount": total uang dalam bentuk angka integer murni (tanpa titik/koma/Rp).
  3. "category": pilih salah satu dari [Bahan Baku, Operasional, Gaji, Penjualan, Lainnya].
  4. "description": rangkuman singkat transaksinya.
  Jika ada lebih dari satu transaksi, kembalikan sebagai array. Contoh: [{ "type": "income", ... }, { "type": "expense", ... }]
`;

async function extractFinancialData(userMessage) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `${SYSTEM_INSTRUCTION}\n\nPesan User: "${userMessage}"`;
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function main() {
  // Simulasi chat berantakan dari pemilik UMKM
  const userMessage = "Bro tadi pagi laku daster 3 potong dapet 150rb, terus barusan beli token listrik warung 50 rebu sekalian bayar kang parkir 5000.";

  console.log("🤖 FinAI Tester - Gemini AI Extraction");
  console.log("═".repeat(45));
  console.log("📩 Pesan Input:");
  console.log(`   "${userMessage}"`);
  console.log("═".repeat(45));
  console.log("⏳ Memproses dengan Gemini AI...\n");

  try {
    const rawResult = await extractFinancialData(userMessage);
    const parsed = JSON.parse(rawResult);

    console.log("✅ [HASIL EKSTRAKSI AI]:");
    parsed.forEach((tx, i) => {
      const icon = tx.type === "income" ? "💰" : "💸";
      console.log(`\n  Transaksi ${i + 1} ${icon}`);
      console.log(`    Tipe      : ${tx.type}`);
      console.log(`    Jumlah    : Rp ${tx.amount.toLocaleString("id-ID")}`);
      console.log(`    Kategori  : ${tx.category}`);
      console.log(`    Deskripsi : ${tx.description}`);
    });

    console.log("\n" + "═".repeat(45));
    console.log(`📊 Total transaksi terdeteksi: ${parsed.length}`);

  } catch (error) {
    console.error("❌ Waduh, ada error:", error.message);
    process.exit(1);
  }
}

main();