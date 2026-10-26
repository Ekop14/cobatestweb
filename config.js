// Tunggu sampai Supabase CDN ter-load
function initSupabase() {
    // Ganti dengan URL dan key dari project Supabase kamu
    const SUPABASE_URL = 'https://nluyhswnrhbuwahwromq.supabase.co/rest/v1/';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sdXloc3ducmhidXdhaHdyb21xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwNDI4NTYsImV4cCI6MjEwODYxODg1Nn0.4RlSNdAnT2DK4__L7YPF091dnUZgZa1LrddR8G2j0Z0';
    
    // Inisialisasi Supabase client
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // User info
    window.currentUser = {
        name: 'Kepala Gudang',
        email: 'gudang@company.com'
    };
    
    console.log('✅ Supabase connected!');
}

// Jalankan setelah DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSupabase);
} else {
    initSupabase();
}
