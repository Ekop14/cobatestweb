// Konfigurasi Supabase
const SUPABASE_URL = 'https://nluyhswnrhbuwahwromq.supabase.co/rest/v1/'; // Ganti dengan URL project kamu
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sdXloc3ducmhidXdhaHdyb21xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwNDI4NTYsImV4cCI6MjEwODYxODg1Nn0.4RlSNdAnT2DK4__L7YPF091dnUZgZa1LrddR8G2j0Z0'; // Ganti dengan anon key kamu

// Inisialisasi Supabase Client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// User info (nanti bisa diganti dengan sistem login yang lebih aman)
const currentUser = {
    name: 'Kepala Gudang',
    email: 'gudang@company.com'
};

console.log('✅ Supabase connected!');
