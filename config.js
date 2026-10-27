// Inisialisasi Supabase
const SUPABASE_URL = 'https://nluyhswnrhbuwahwromq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sdXloc3ducmhidXdhaHdyb21xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwNDI4NTYsImV4cCI6MjEwODYxODg1Nn0.4RlSNdAnT2DK4__L7YPF091dnUZgZa1LrddR8G2j0Z0';

window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.currentUser = null;

console.log('✅ Supabase ready');
