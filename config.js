/* ============================================
   KONFIGURASI GLOBAL (Bisa diakses oleh semua file)
   ============================================ */

// 1. Konfigurasi Supabase
const SUPABASE_URL = 'https://nluyhswnrhbuwahwromq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sdXloc3ducmhidXdhaHdyb21xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwNDI4NTYsImV4cCI6MjEwODYxODg1Nn0.4RlSNdAnT2DK4__L7YPF091dnUZgZa1LrddR8G2j0Z0';

// 2. Konfigurasi Groq AI (GRATIS & SANGAT CEPAT)
// PENTING: Ganti 'gsk_...' di bawah ini dengan API Key ASLI dari console.groq.com
window.GROQ_API_KEY = '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'; 
window.GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
window.GROQ_MODEL = 'llama-3.3-70b-versatile'; // Model gratis Groq yang paling cerdas & cepat saat ini

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
