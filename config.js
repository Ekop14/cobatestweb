/* ============================================
   KONFIGURASI GLOBAL (Bisa diakses oleh semua file)
   ============================================ */

// 1. Konfigurasi Supabase
const SUPABASE_URL = 'https://nluyhswnrhbuwahwromq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sdXloc3ducmhidXdhaHdyb21xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwNDI4NTYsImV4cCI6MjEwODYxODg1Nn0.4RlSNdAnT2DK4__L7YPF091dnUZgZa1LrddR8G2j0Z0';

// 2. Konfigurasi Groq AI
// ⚠️ PERINGATAN: Ganti API Key di bawah ini dengan yang BARU dari console.groq.com 
// karena key lama sudah terekspos di chat ini.
window.GROQ_API_KEY = 'gsk_GANTI_DENGAN_API_KEY_BARU_ANDA_DISINI'; 
window.GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
window.GROQ_MODEL = 'llama3-70b-8192'; 

// 3. URL Edge Functions
// ⚠️ PASTIKAN nama di akhir URL SAMA PERSIS dengan nama function yang Anda buat di Supabase Dashboard!
// Berdasarkan percakapan sebelumnya, Anda membuat function bernama 'list-users-v2' dan 'clever-action'
const LIST_USERS_FUNCTION_URL = 'https://nluyhswnrhbuwahwromq.supabase.co/functions/v1/list-users-v2'; 
const DELETE_USER_FUNCTION_URL = 'https://nluyhswnrhbuwahwromq.supabase.co/functions/v1/clever-action'; 

/* ============================================
   FUNGSI INISIALISASI
   ============================================ */
function initSupabase() {
    if (typeof window.supabase !== 'undefined') {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.error("❌ Library Supabase belum dimuat. Pastikan script Supabase ada di HTML sebelum config.js");
    }
    
    window.currentUser = { name: 'User', email: 'user@example.com' };
    console.log('✅ Supabase & Groq Config berhasil dimuat!');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSupabase);
} else {
    initSupabase();
}
