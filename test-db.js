require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Validasi environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error("❌ Error: SUPABASE_URL atau SUPABASE_ANON_KEY tidak ditemukan di .env");
  process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function testConnection() {
  console.log("🗄️  FinAI Tester - Supabase Connection Test");
  console.log("═".repeat(45));
  console.log(`🔗 URL      : ${process.env.SUPABASE_URL}`);
  console.log("⏳ Menguji koneksi ke tabel 'transactions'...\n");

  const startTime = Date.now();

  const { data, error, count } = await supabase
    .from('transactions')
    .select('*', { count: 'exact' })
    .limit(5);

  const elapsed = Date.now() - startTime;

  if (error) {
    console.error("❌ Koneksi Gagal!");
    console.error(`   Kode  : ${error.code}`);
    console.error(`   Pesan : ${error.message}`);
    process.exit(1);
  }

  console.log("✅ Koneksi Supabase Berhasil!");
  console.log(`⚡ Response time : ${elapsed}ms`);
  console.log(`📊 Total data    : ${count ?? "tidak diketahui"} baris`);

  if (data && data.length > 0) {
    console.log("\n📋 Preview data (maks 5 baris):");
    data.forEach((row, i) => {
      const icon = row.type === "income" ? "💰" : "💸";
      console.log(`  [${i + 1}] ${icon} ${row.description ?? "-"} — Rp ${(row.amount ?? 0).toLocaleString("id-ID")}`);
    });
  } else {
    console.log("\n📭 Tabel masih kosong, belum ada data.");
  }

  console.log("\n" + "═".repeat(45));
  console.log("✔  Test selesai.");
}

testConnection();