require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createClient } = require('@supabase/supabase-js');

// ─── Validasi ENV ────────────────────────────────────────────────────────────
const REQUIRED_ENVS = ['GEMINI_API_KEY', 'SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missing = REQUIRED_ENVS.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.error(`❌ ENV tidak lengkap! Missing: ${missing.join(', ')}`);
  process.exit(1);
}

// ─── Inisialisasi Client ──────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// ─── System Prompt AI ────────────────────────────────────────────────────────
const SYSTEM_INSTRUCTION = `
  Kamu adalah asisten keuangan pintar untuk UMKM Indonesia.
  Ekstrak SEMUA transaksi dari pesan berikut ke dalam format JSON array.
  Setiap objek harus memiliki:
  - "type"        : "income" atau "expense"
  - "amount"      : angka integer murni (tanpa titik/koma/Rp)
  - "category"    : salah satu dari [Bahan Baku, Operasional, Gaji, Penjualan, Lainnya]
  - "description" : ringkasan singkat transaksi dalam bahasa Indonesia
  Kembalikan HANYA JSON array, tanpa teks lain.
`;

// ─── Fungsi: Ekstrak Transaksi dari Teks ─────────────────────────────────────
async function extractTransactions(userMessage) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `${SYSTEM_INSTRUCTION}\n\nPesan: "${userMessage}"`;
  const result = await model.generateContent(prompt);
  const raw = result.response.text();

  try {
    const parsed = JSON.parse(raw);
    // Handle kasus AI mengembalikan object tunggal, bukan array
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    throw new Error(`Gagal parse respons AI: ${raw}`);
  }
}

// ─── Fungsi: Simpan Transaksi ke Supabase ────────────────────────────────────
async function saveTransactions(transactions) {
  const rows = transactions.map(tx => ({
    type: tx.type,
    amount: tx.amount,
    category: tx.category,
    description: tx.description,
    created_at: new Date().toISOString(),
    source: 'finai-pipeline'
  }));

  const { data, error } = await supabase
    .from('transactions')
    .insert(rows)
    .select();

  if (error) throw new Error(`Supabase error: ${error.message}`);
  return data;
}

// ─── Main Pipeline ───────────────────────────────────────────────────────────
async function runPipeline(userMessage) {
  console.log("\n🚀 FinFlow AI — Transaction Pipeline");
  console.log("═".repeat(50));
  console.log("📩 Input:", userMessage);
  console.log("═".repeat(50));

  // Step 1: Ekstrak dengan AI
  console.log("\n🤖 [Step 1/2] Mengekstrak transaksi dengan Gemini AI...");
  const transactions = await extractTransactions(userMessage);
  console.log(`✅ Ditemukan ${transactions.length} transaksi:`);
  transactions.forEach((tx, i) => {
    const icon = tx.type === 'income' ? '💰' : '💸';
    console.log(`   ${i + 1}. ${icon} ${tx.description} — Rp ${tx.amount.toLocaleString('id-ID')} [${tx.category}]`);
  });

  // Step 2: Simpan ke Supabase
  console.log("\n🗄️  [Step 2/2] Menyimpan ke Supabase...");
  const saved = await saveTransactions(transactions);
  console.log(`✅ ${saved.length} transaksi berhasil disimpan!`);
  console.log("\n📋 Data tersimpan:");
  saved.forEach((row, i) => {
    console.log(`   [ID: ${row.id}] ${row.description} — Rp ${row.amount.toLocaleString('id-ID')}`);
  });

  // Summary
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  console.log("\n" + "═".repeat(50));
  console.log("📊 RINGKASAN TRANSAKSI:");
  console.log(`   💰 Total Pemasukan  : Rp ${totalIncome.toLocaleString('id-ID')}`);
  console.log(`   💸 Total Pengeluaran: Rp ${totalExpense.toLocaleString('id-ID')}`);
  console.log(`   📈 Net Cash Flow    : Rp ${(totalIncome - totalExpense).toLocaleString('id-ID')}`);
  console.log("═".repeat(50));
  console.log("✔  Pipeline selesai.\n");
}

// ─── Jalankan dengan contoh pesan UMKM ──────────────────────────────────────
const contohPesan = process.argv[2] ||
  "Tadi pagi laku daster 3 potong dapet 150rb, terus barusan beli token listrik warung 50 rebu sekalian bayar kang parkir 5000.";

runPipeline(contohPesan).catch(err => {
  console.error("\n❌ Pipeline error:", err.message);
  process.exit(1);
});
