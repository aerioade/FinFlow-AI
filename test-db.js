require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function testConnection() {
    // Mencoba mengambil 1 data dari tabel transactions yang kita buat tadi
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Koneksi Gagal:', error.message);
    } else {
        console.log('✅ Koneksi Supabase Berhasil!');
        console.log('Data saat ini:', data);
    }
}

testConnection();