/* ============================================
   KONFIGURASI GLOBAL (Bisa diakses oleh semua file)
   ============================================ */

// 1. Konfigurasi Supabase
const SUPABASE_URL = 'https://nluyhswnrhbuwahwromq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sdXloc3ducmhidXdhaHdyb21xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwNDI4NTYsImV4cCI6MjEwODYxODg1Nn0.4RlSNdAnT2DK4__L7YPF091dnUZgZa1LrddR8G2j0Z0';

// 2. Konfigurasi Google Gemini API (100% GRATIS, TANPA TOP-UP)
// PENTING: Ganti 'AIzaSy...' di bawah ini dengan API Key ASLI dari Google AI Studio
window.GEMINI_API_KEY = 'AQ.Ab8RN6Iga4YzkXY2qCr3od-oJ2cmT0IC1anUE2uVV1qE3wAoyQ'; 

// Kita gunakan endpoint OpenAI-compatible milik Google agar script.js tidak perlu diubah sama sekali
window.AI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
window.AI_MODEL = 'gemini-1.5-flash'; // Model cepat, gratis, dan batasnya sangat longgar

/* ============================================
   FUNGSI INISIALISASI
   ============================================ */
function initSupabase() {
    if (typeof window.supabase !== 'undefined') {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.error("❌ Library Supabase belum dimuat.");
    }
    
    window.currentUser = { name: 'User', email: 'user@example.com' };
    console.log('✅ Supabase & Google Gemini Config berhasil dimuat!');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSupabase);
} else {
    initSupabase();
}
