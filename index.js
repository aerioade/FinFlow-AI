require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Inisialisasi SDK dengan API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testExtractFinancialData() {
  // Pilih model Gemini 1.5 Flash
const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", // UBAH KE VERSI TERBARU INI
      generationConfig: { responseMimeType: "application/json" }
  });
  // System prompt agar AI tahu tugasnya
  const systemInstruction = `
    Kamu adalah asisten keuangan pintar. Ekstrak data dari pesan berikut ke dalam format JSON.
    Aturan:
    1. "type": isi dengan "income" atau "expense".
    2. "amount": total uang dalam bentuk angka integer murni (tanpa titik/koma/Rp).
    3. "category": pilih salah satu dari [Bahan Baku, Operasional, Gaji, Penjualan, Lainnya].
    4. "description": rangkuman singkat transaksinya.
  `;

  // Simulasi chat berantakan dari pemilik UMKM di Solo (misalnya)
  const userMessage = "Bro tadi pagi laku daster 3 potong dapet 150rb, terus barusan beli token listrik warung 50 rebu sekalian bayar kang parkir 5000.";

  console.log("Memproses pesan user...");
  
  try {
    const prompt = `${systemInstruction}\n\nPesan User: "${userMessage}"`;
    const result = await model.generateContent(prompt);
    const response = result.response;
    
    // Hasilnya akan berupa JSON yang siap dimasukkan ke Database!
    console.log("\n[HASIL EKSTRAKSI AI]:");
    console.log(response.text());
    
  } catch (error) {
    console.error("Waduh, ada error:", error);
  }
}

testExtractFinancialData();