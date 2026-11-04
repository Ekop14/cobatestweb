/* ============================================
   KONFIGURASI GLOBAL (Bisa diakses oleh semua file)
   ============================================ */

// 1. Konfigurasi Supabase
const SUPABASE_URL = 'https://nluyhswnrhbuwahwromq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sdXloc3ducmhidXdhaHdyb21xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwNDI4NTYsImV4cCI6MjEwODYxODg1Nn0.4RlSNdAnT2DK4__L7YPF091dnUZgZa1LrddR8G2j0Z0';

// 2. Konfigurasi OpenRouter AI (GRATIS & TOKEN BESAR)
// PENTING: Ganti 'sk-or-v1-GANTI_...' di bawah ini dengan API Key ASLI dari openrouter.ai/keys
window.OPENROUTER_API_KEY = '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'; 
window.OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
window.OPENROUTER_MODEL = 'qwen/qwen-2.5-72b-instruct:free';

/* ============================================
   FUNGSI INISIALISASI
   ============================================ */
function initSupabase() {
    // Membuat client Supabase dan menyimpannya di 'window' agar global
    if (typeof window.supabase !== 'undefined') {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.error("❌ Library Supabase belum dimuat. Pastikan script Supabase ada di HTML sebelum config.js");
    }
    
    // Data user default (akan di-update otomatis saat login berhasil)
    window.currentUser = { name: 'User', email: 'user@example.com' };
    
    console.log('✅ Supabase & OpenRouter Config berhasil dimuat!');
}

// Jalankan saat halaman siap
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSupabase);
} else {
    initSupabase();
}
