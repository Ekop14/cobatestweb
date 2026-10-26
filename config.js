function initSupabase() {
    // URL Project - HANYA sampai .co (JANGAN tambah /rest/v1)
    const SUPABASE_URL = 'https://nluyhswnrhbuwahwromq.supabase.co';
    
    // ANON Key (dari dashboard Supabase)
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sdXloc3ducmhidXdhaHdyb21xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwNDI4NTYsImV4cCI6MjEwODYxODg1Nn0.4RlSNdAnT2DK4__L7YPF091dnUZgZa1LrddR8G2j0Z0';

    // Inisialisasi Supabase Client
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // User Info
    window.currentUser = {
        name: 'Kepala Gudang',
        email: 'gudang@company.com'
    };
    
    console.log('✅ Supabase connected!');
    console.log('📍 URL:', SUPABASE_URL);
    console.log('👤 User:', window.currentUser);
}

// Jalankan setelah DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSupabase);
} else {
    initSupabase();
}
