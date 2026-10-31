function initSupabase() {
    const SUPABASE_URL = 'https://nluyhswnrhbuwahwromq.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sdXloc3ducmhidXdhaHdyb21xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwNDI4NTYsImV4cCI6MjEwODYxODg1Nn0.4RlSNdAnT2DK4__L7YPF091dnUZgZa1LrddR8G2j0Z0';
// Tambahkan di config.js
const GROQ_API_KEY = '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'; // Ganti dengan API key dari console.groq.com
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile'; // Model gratis & cepat
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.currentUser = { name: 'User', email: 'user@example.com' };
    
    console.log('✅ Supabase connected!');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSupabase);
} else {
    initSupabase();
}
