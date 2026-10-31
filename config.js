/* ============================================
   KONFIGURASI GLOBAL (Bisa diakses oleh semua file)
   ============================================ */

// 1. Konfigurasi Supabase
const SUPABASE_URL = 'https://nluyhswnrhbuwahwromq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sdXloc3ducmhidXdhaHdyb21xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwNDI4NTYsImV4cCI6MjEwODYxODg1Nn0.4RlSNdAnT2DK4__L7YPF091dnUZgZa1LrddR8G2j0Z0';

// 2. Konfigurasi Groq AI (WAJIB DI LUAR FUNGSI!)
const GROQ_API_KEY = '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'; 
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

/* ============================================
   FUNGSI INISIALISASI
   ============================================ */
function initSupabase() {
    // Membuat client Supabase dan menyimpannya di 'window' agar global
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Data user default (akan di-update otomatis saat login berhasil)
    window.currentUser = { name: 'User', email: 'user@example.com' };
    
    console.log('✅ Supabase & Groq Config berhasil dimuat!');
}

// Jalankan saat halaman siap
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSupabase);
} else {
    initSupabase();
}
