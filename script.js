// ==========================================
// SCRIPT.JS - FINAL ALL-IN-ONE
// (Checklist + APD + Dashboard + Lingkungan + Supervisor + Kelola User + Biometric + AI + Kendaraan + Laporan Kendaraan)
// ==========================================

let filteredReports = [];
window.currentUser = window.currentUser || { name: 'User', email: 'user@example.com' };

const SUPERVISOR_EMAILS = ['admin@gudang.com', 'supervisor@gudang.com']; 
const BIO_KEY = 'GudangClean2024!BioKey';
let currentVehicleHeaderId = null;

// ==========================================
// KONSTANTA LAPORAN KENDARAAN
// ==========================================
const VEHICLES_PER_PAGE = 9;
const INSPECTION_ITEMS = [
    'Secara Umum Bagian Luar Kendaraan Dalam Kondisi Bersih',
    'Lantai Dan Dinding Bak / Box Mobil / Container Harus Bersih Dari Kotoran',
    'Tidak Ada Tanda Keberadaan Tikus Dan Serangga (Kecoa, Kutu Dll) Dalam Bak / Box Mobil / Container',
    'Tidak Ada Paku Atau Baut Dari Bak / Box Mobil / Container Yang Keluar/Lepas',
    'Bak / Box Mobil / Container Tidak Berlubang Atau Bocor',
    'Bak / Box Mobil / Container Tidak Berbau Asing (Bau Harus Normal)',
    'Bak / Box Mobil / Container Harus Dalam Keadaan Kering Dan Tidak Basah / Berminyak',
    'Semua Barang Yang Dikirim / Diterima Harus Utuh, Kemasan Tidak Rusak Atau Penyok, Berlabel Jelas Dan Mudah Di Baca',
    'Pengiriman / Penerimaan Produk Tidak Disatukan Dengan Bahan Kimia / Bahan Dari Gelas / Bahan Yang Diragukan Kehalalanya / Bahan Yang Berbau Tajam',
    'Kondisi Pintu Bak / Box ( Terkunci dan seal tidak rusak, nomor seal harus sesuai surat jalan )',
    'Jenis Barang ( Material / Kemasan / Produk )',
    'Apabila container memiliki lampu atau kaca di bagian dalam, pastikan lampu dan kaca tersebut dalam kondisi baik (tidak retak, tidak pecah)'
];

function isSupervisor(session) {
    if (!session) return false;
    if (session.user.user_metadata?.role === 'supervisor') return true;
    if (SUPERVISOR_EMAILS.includes(session.user.email)) return true;
    return false;
}

function getSpvStatusText(status) {
    if (status === 'approved') return 'Disetujui';
    if (status === 'rejected') return 'Ditolak';
    return 'Menunggu';
}

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 Script berhasil dimuat");

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const supabase = window.supabaseClient;

    if (!supabase) {
        console.error("❌ Supabase client tidak ditemukan. Pastikan config.js dimuat.");
        return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (!session && currentPage !== 'index.html' && currentPage !== 'register.html') {
            window.location.replace('index.html');
            return;
        }
        
        if (session && (currentPage === 'index.html' || currentPage === 'register.html')) {
            const userRole = session.user.user_metadata?.role || 'staff';
            window.location.replace(userRole === 'supervisor' ? 'supervisor.html' : 'checklist.html');
            return;
        }

        console.log("📄 Halaman aktif:", currentPage);

        if (currentPage === 'laporan.html') initLaporanPage(session);
        else if (currentPage === 'laporan-kendaraan.html') initLaporanKendaraanPage(session); // ✅ BARU
        else if (currentPage === 'index.html') initLoginPage();
        else if (currentPage === 'register.html') initRegisterPage();
        else if (currentPage === 'dashboard.html') initDashboardPage(session);
        else if (currentPage === 'checklist.html') initChecklistPage(session);
        else if (currentPage === 'apd.html') initApdPage(session);
        else if (currentPage === 'lingkungan.html') initEnvironmentPage(session);
        else if (currentPage === 'supervisor.html') initSupervisorPage(session);
        else if (currentPage === 'kelola-user.html') initKelolaUserPage(session);
        else if (currentPage === 'kendaraan.html') initKendaraanPage(session);
        else if (currentPage === 'laporan-suhu.html') initLaporanSuhuPage(session);
    });

    setTimeout(() => {
        if (document.getElementById('aiFloatingBtn') || document.getElementById('aiAssistantBtn')) {
            initAiAssistant();
        }
    }, 1000);
});

// ==========================================
// FUNGSI SIDEBAR
// ==========================================
function updateSidebarUserInfo() {
    if (!window.currentUser) return;
    const nameEl = document.getElementById('sidebarUserName');
    const emailEl = document.getElementById('sidebarUserEmail');
    const avatarEl = document.getElementById('userAvatar');
    if (nameEl) nameEl.textContent = window.currentUser.name || 'User';
    if (emailEl) emailEl.textContent = window.currentUser.email || 'user@example.com';
    if (avatarEl) avatarEl.textContent = (window.currentUser.name || 'U').charAt(0).toUpperCase();
}

function updateSidebarProgress() {
    const allCheckboxes = document.querySelectorAll('.checklist-card .glass-checkbox');
    const total = allCheckboxes.length;
    const checked = document.querySelectorAll('.checklist-card .glass-checkbox:checked').length;
    const percent = total ? Math.round((checked / total) * 100) : 0;
    const bar = document.getElementById('overallProgressBar');
    const text = document.getElementById('overallProgressText');
    const completed = document.getElementById('completedCount');
    const totalEl = document.getElementById('totalCount');
    if (bar) bar.style.width = percent + '%';
    if (text) text.textContent = percent + '%';
    if (completed) completed.textContent = checked;
    if (totalEl) totalEl.textContent = total;
}

async function loadSidebar() {
    const slot = document.getElementById('sidebar-slot');
    if (!slot) return;
    try {
        const response = await fetch('sidebar.html');
        if (!response.ok) throw new Error('Gagal memuat sidebar');
        slot.innerHTML = await response.text();
        highlightActiveMenu();
        setupSidebarToggle();
        setupSidebarNavigation();
        setupCategoryFilter();
        updateSidebarUserInfo();
        updateSidebarProgress();
    } catch (error) { console.error('Error loading sidebar:', error); }
}

function setupSidebarNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            if (window.innerWidth < 1024) {
                const sidebar = document.getElementById('sidebar');
                const overlay = document.getElementById('sidebarOverlay');
                if (sidebar) sidebar.classList.remove('open');
                if (overlay) overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
}

function highlightActiveMenu() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-item').forEach(link => {
        link.classList.remove('active', 'bg-white/10', 'text-white', 'border', 'border-white/10', 'shadow-lg');
        link.classList.add('text-white/70');
        if (link.getAttribute('data-page') === currentPage) {
            link.classList.add('active', 'bg-white/10', 'text-white', 'border', 'border-white/10', 'shadow-lg');
            link.classList.remove('text-white/70');
        }
    });
}

function setupSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');
    const overlay = document.getElementById('sidebarOverlay');
    if (toggle && sidebar) toggle.addEventListener('click', () => { sidebar.classList.add('open'); if (overlay) overlay.classList.add('active'); document.body.style.overflow = 'hidden'; });
    if (overlay && sidebar) overlay.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('active'); document.body.style.overflow = ''; });
}

function setupCategoryFilter() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const checklistCards = document.querySelectorAll('.checklist-card');
    if (categoryButtons.length === 0) return;
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryButtons.forEach(b => { b.classList.remove('active', 'bg-white/10', 'text-white', 'border', 'border-white/10'); b.classList.add('text-white/60'); });
            btn.classList.add('active', 'bg-white/10', 'text-white', 'border', 'border-white/10');
            btn.classList.remove('text-white/60');
            checklistCards.forEach(card => { card.classList.toggle('hidden-card', btn.dataset.category !== 'all' && card.dataset.category !== btn.dataset.category); });
        });
    });
}

// ==========================================
// 1. HALAMAN CHECKLIST
// ==========================================
// ==========================================
// 1. HALAMAN CHECKLIST (DIPERBAIKI)
// ==========================================
function initChecklistPage(session) {
    window.currentUser = { name: session.user.user_metadata?.full_name || session.user.email || 'User', email: session.user.email };
    
    const dateDisplay = document.getElementById('currentDate');
    if (dateDisplay) {
        dateDisplay.textContent = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
    
    loadSidebar();

    const checkboxes = document.querySelectorAll('.glass-checkbox');
    const totalItems = checkboxes.length;
    
    // 🔥 PERBAIKAN: Sesuaikan variabel dengan ID yang ada di HTML Anda
    const statTotalEl = document.getElementById('statTotal');
    const statCompletedEl = document.getElementById('statCompleted');
    const statPendingEl = document.getElementById('statPending');
    const statProgressEl = document.getElementById('statProgress');

    // Set nilai awal total
    if (statTotalEl) statTotalEl.textContent = totalItems;

    function updateProgress() {
        const completed = document.querySelectorAll('.glass-checkbox:checked').length;
        const pending = totalItems - completed; // Hitung sisa yang belum dicentang
        const percentage = totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0;
        
        // 🔥 Update tampilan Stat Cards di bagian atas
        if (statTotalEl) statTotalEl.textContent = totalItems;
        if (statCompletedEl) statCompletedEl.textContent = completed;
        if (statPendingEl) statPendingEl.textContent = pending;
        if (statProgressEl) statProgressEl.textContent = percentage + '%';
        
        // Update progress bar di dalam masing-masing card (jika ada)
        document.querySelectorAll('.checklist-card').forEach(card => {
            const cardCheckboxes = card.querySelectorAll('.glass-checkbox');
            const cardTotal = cardCheckboxes.length;
            const cardCompleted = card.querySelectorAll('.glass-checkbox:checked').length;
            const cardPercent = cardTotal > 0 ? Math.round((cardCompleted / cardTotal) * 100) : 0;
            const progressBar = card.querySelector('.card-progress-fill');
            if (progressBar) progressBar.style.width = cardPercent + '%';
        });

        // Update sidebar progress (jika sidebar memilikinya)
        updateSidebarProgress();
    }

    // Event listener untuk setiap checkbox
    checkboxes.forEach(cb => cb.addEventListener('change', () => {
        const listItem = cb.closest('.checklist-item');
        if (listItem) { 
            if (cb.checked) listItem.classList.add('completed'); 
            else listItem.classList.remove('completed'); 
        }
        updateProgress();
    }));
    
    // Jalankan sekali saat halaman dimuat
    updateProgress();
    
    // Cek apakah user sudah submit hari ini
    checkDailySubmission(session.user.email);

    // Logic Tombol Submit
    const submitBtn = document.getElementById('submitChecklistBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (submitBtn.disabled) return;
            
            const completed = document.querySelectorAll('.glass-checkbox:checked').length;
            const percentage = totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0;
            
            if (completed < totalItems) { 
                showNotification(`Selesaikan semua tugas dulu ya! (${completed}/${totalItems})`, 'warning'); 
                return; 
            }

            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px;"></div> Mengirim...';

            const submissionData = {
                user_name: window.currentUser.name, 
                user_email: window.currentUser.email,
                total_items: totalItems, 
                completed_items: completed, 
                progress_percentage: percentage,
                status: percentage === 100 ? 'completed' : 'in_progress',
                submission_time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                created_at: new Date().toISOString()
            };

            try {
                const { error } = await window.supabaseClient.from('checklist_submissions').insert([submissionData]);
                if (error) throw error;
                
                showNotification('✅ Laporan berhasil dikirim!', 'success');
                disableSubmitButtonUI(submissionData);
                
                setTimeout(() => {
                    checkboxes.forEach(cb => { 
                        cb.checked = false; 
                        const listItem = cb.closest('.checklist-item'); 
                        if (listItem) listItem.classList.remove('completed'); 
                    });
                    updateProgress();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 1500);
            } catch (error) {
                console.error("❌ Gagal mengirim:", error);
                showNotification('❌ Gagal: ' + error.message, 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }
}
async function checkDailySubmission(userEmail) {
    const today = new Date().toISOString().split('T')[0];
    try {
        const { data, error } = await window.supabaseClient.from('checklist_submissions').select('id, submission_time, created_at').eq('user_email', userEmail).gte('created_at', `${today}T00:00:00`).lte('created_at', `${today}T23:59:59`).limit(1);
        if (error) throw error;
        if (data && data.length > 0) disableSubmitButtonUI(data[0]);
    } catch (error) { console.error("Gagal cek submission harian:", error); }
}

function disableSubmitButtonUI(submission) {
    const btn = document.getElementById('submitChecklistBtn');
    const infoBox = document.getElementById('dailySubmissionInfo');
    const timeDisplay = document.getElementById('submissionTimeDisplay');
    if (btn) { btn.disabled = true; btn.classList.add('opacity-50', 'cursor-not-allowed'); btn.innerHTML = '<span>✅ Sudah Submit Hari Ini</span>'; }
    if (infoBox) infoBox.classList.remove('hidden');
    if (timeDisplay) timeDisplay.textContent = submission.submission_time || new Date(submission.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

// ==========================================
// 2. AI ASSISTANT
// ==========================================
function initAiAssistant() {
    const modal = document.getElementById('aiChatModal');
    const panel = document.getElementById('aiChatPanel');
    const overlay = document.getElementById('aiChatOverlay');
    const closeBtn = document.getElementById('closeAiChat');
    const input = document.getElementById('aiChatInput');
    const sendBtn = document.getElementById('aiChatSend');
    const messagesContainer = document.getElementById('aiChatMessages');
    const aiBtn = document.getElementById('aiFloatingBtn') || document.getElementById('aiAssistantBtn');
    if (!modal || !aiBtn) return;

    let chatHistory = []; 
    aiBtn.addEventListener('click', () => { modal.classList.remove('hidden'); setTimeout(() => panel.classList.remove('translate-x-full'), 10); input.focus(); });
    function closeModal() { panel.classList.add('translate-x-full'); setTimeout(() => { modal.classList.add('hidden'); chatHistory = []; }, 300); }
    closeBtn?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', closeModal);

    document.querySelectorAll('.quick-action').forEach(btn => { btn.addEventListener('click', () => { input.value = btn.textContent.replace(/^[^\s]+\s/, '').trim(); handleAiSend(); }); });
    input?.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleAiSend(); });
    sendBtn?.addEventListener('click', handleAiSend);

    async function handleAiSend() {
        const question = input.value.trim();
        if (!question) return;
        addMessage(question, 'user');
        input.value = '';
        sendBtn.disabled = true;
        const typingId = addTypingIndicator();
        try {
            const context = await getFullSupabaseContext();
            chatHistory.push({ role: 'user', content: question });
            const answer = await getGroqResponse(chatHistory, context);
            removeTypingIndicator(typingId);
            addMessage(answer, 'ai');
            chatHistory.push({ role: 'assistant', content: answer });
        } catch (error) {
            removeTypingIndicator(typingId);
            addMessage('Maaf, terjadi kesalahan: ' + error.message, 'ai', true);
        } finally { sendBtn.disabled = false; }
    }

    function addMessage(text, sender, isError = false) {
        const div = document.createElement('div');
        div.className = 'flex gap-3 ' + (sender === 'user' ? 'flex-row-reverse' : '');
        const avatar = sender === 'user' ? `<div class="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0"><svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>` : `<div class="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0"><svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg></div>`;
        const bubbleClass = sender === 'user' ? 'bg-blue-500/20 border border-blue-500/30 rounded-2xl rounded-tr-none' : (isError ? 'bg-red-500/20 border border-red-500/30 rounded-2xl rounded-tl-none' : 'bg-white/5 border border-white/10 rounded-2xl rounded-tl-none');
        div.innerHTML = `${avatar}<div class="flex-1 ${bubbleClass} p-4"><p class="text-white text-sm whitespace-pre-wrap">${text}</p></div>`;
        messagesContainer.appendChild(div);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function addTypingIndicator() {
        const id = 'typing-' + Date.now();
        const div = document.createElement('div');
        div.id = id; div.className = 'flex gap-3';
        div.innerHTML = `<div class="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0"><svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg></div><div class="flex-1 bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-4"><div class="flex gap-1"><div class="w-2 h-2 bg-white/50 rounded-full animate-bounce" style="animation-delay: 0ms"></div><div class="w-2 h-2 bg-white/50 rounded-full animate-bounce" style="animation-delay: 150ms"></div><div class="w-2 h-2 bg-white/50 rounded-full animate-bounce" style="animation-delay: 300ms"></div></div></div>`;
        messagesContainer.appendChild(div);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return id;
    }
    function removeTypingIndicator(id) { const el = document.getElementById(id); if (el) el.remove(); }

    async function executeDeleteSubmission(submissionId, reason) {
        const supabase = window.supabaseClient;
        try {
            const isConfirmed = confirm(`⚠️ KONFIRMASI KEAMANAN\n\nAI meminta izin untuk MENGHAPUS data submission.\nID: ${submissionId}\nAlasan: ${reason}\n\nLanjutkan?`);
            if (!isConfirmed) return "Penghapusan dibatalkan.";
            const { error } = await supabase.from('checklist_submissions').delete().eq('id', submissionId);
            if (error) throw error;
            return `Berhasil! Data ID ${submissionId} telah dihapus.`;
        } catch (error) { return `Gagal: ${error.message}`; }
    }

    async function getFullSupabaseContext() {
        const supabase = window.supabaseClient;
        if (!supabase) return "Tidak ada koneksi database.";
        try {
            const today = new Date(); const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
            const todayStr = today.toISOString().split('T')[0]; const yesterdayStr = yesterday.toISOString().split('T')[0];

            const { count: todayCount } = await supabase.from('checklist_submissions').select('*', { count: 'exact', head: true }).gte('created_at', todayStr + 'T00:00:00');
            const { count: totalCount } = await supabase.from('checklist_submissions').select('*', { count: 'exact', head: true });
            const { count: completedCount } = await supabase.from('checklist_submissions').select('*', { count: 'exact', head: true }).eq('status', 'completed');
            const { count: yesterdayCount } = await supabase.from('checklist_submissions').select('*', { count: 'exact', head: true }).gte('created_at', yesterdayStr + 'T00:00:00').lte('created_at', yesterdayStr + 'T23:59:59');
            const { data: yesterdayDetails } = await supabase.from('checklist_submissions').select('id, user_name, progress_percentage, status, created_at, submission_time').gte('created_at', yesterdayStr + 'T00:00:00').lte('created_at', yesterdayStr + 'T23:59:59');
            
            let yesterdayAvg = 0;
            if (yesterdayDetails && yesterdayDetails.length > 0) yesterdayAvg = Math.round(yesterdayDetails.reduce((acc, curr) => acc + (curr.progress_percentage || 0), 0) / yesterdayDetails.length);
            
            const { data: allSubmissions } = await supabase.from('checklist_submissions').select('progress_percentage');
            let avgProgress = 0;
            if (allSubmissions && allSubmissions.length > 0) avgProgress = Math.round(allSubmissions.reduce((acc, curr) => acc + (curr.progress_percentage || 0), 0) / allSubmissions.length);
            
            const { data: recent } = await supabase.from('checklist_submissions').select('id, user_name, progress_percentage, status, created_at, submission_time').order('created_at', { ascending: false }).limit(5);
            const { data: recentEnvironment } = await supabase.from('environment_readings').select('user_name, temperature, humidity, notes, submission_time, created_at').order('created_at', { ascending: false }).limit(5);

            const currentUserEmail = window.currentUser?.email || '';
            const { data: myTodaySubmission } = await supabase.from('checklist_submissions').select('id, user_name, progress_percentage, status, submission_time, created_at').eq('user_email', currentUserEmail).gte('created_at', todayStr + 'T00:00:00').lte('created_at', todayStr + 'T23:59:59').order('created_at', { ascending: false }).limit(1);

            let hasSubmittedToday = false;
            let mySubmissionInfo = "User belum submit checklist hari ini.";
            if (myTodaySubmission && myTodaySubmission.length > 0) {
                hasSubmittedToday = true;
                const sub = myTodaySubmission[0];
                mySubmissionInfo = `✅ User ${sub.user_name || currentUserEmail} SUDAH submit hari ini (${todayStr}) pukul ${sub.submission_time || '-'} dengan progress ${sub.progress_percentage}%. ID: ${sub.id}`;
            }

            return JSON.stringify({
                today_submissions: todayCount || 0, total_submissions: totalCount || 0, average_progress: avgProgress + '%', completed_submissions: completedCount || 0, recent_activity: recent || [],
                recent_environment_readings: recentEnvironment || [],
                yesterday_date_str: yesterday.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), yesterday_submissions_count: yesterdayCount || 0, yesterday_avg_progress: yesterdayAvg + '%', yesterday_details: yesterdayDetails || [],
                current_user: window.currentUser?.name || 'User', current_user_email: currentUserEmail, current_date: today.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                has_submitted_today: hasSubmittedToday, my_today_submission: mySubmissionInfo
            }, null, 2);
        } catch (error) { return 'Error mengambil data: ' + error.message; }
    }

    async function getGroqResponse(history, context) {
        if (!GROQ_API_KEY || GROQ_API_KEY === 'gsk_API_KEY_ANDA_DISINI') return "⚠️ API Key Groq belum diatur.";
        const systemPrompt = `Anda adalah AI Assistant "Gudang Clean". Jawab ramah, profesional, pakai emoji. Maks 150 kata.
ATURAN: 1. Gunakan DATA KONTEKS. 2. Anda punya akses ke checklist DAN lingkungan (suhu/kelembapan). 3. Ingat riwayat chat. 4. Jika diminta hapus data, pakai tool 'delete_submission'.
DATA KONTEKS:\n${context}`;

        const tools = [{ type: "function", function: { name: "delete_submission", description: "Hapus data submission berdasarkan ID.", parameters: { type: "object", properties: { submission_id: { type: "string" }, reason: { type: "string" } }, required: ["submission_id", "reason"] } } }];

        try {
            const response = await fetch(GROQ_API_URL, { method: 'POST', headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: GROQ_MODEL, messages: [{ role: 'system', content: systemPrompt }, ...history], tools: tools, tool_choice: "auto" }) });
            if (!response.ok) {
                if (response.status === 429) throw new Error("Batas permintaan (Rate Limit) Groq tercapai. Silakan tunggu 1-2 menit.");
                throw new Error(`HTTP ${response.status}`);
            }
            const data = await response.json();
            const message = data.choices[0].message;

            if (message.tool_calls && message.tool_calls.length > 0) {
                const toolCall = message.tool_calls[0];
                history.push(message);
                if (toolCall.function.name === "delete_submission") {
                    const args = JSON.parse(toolCall.function.arguments);
                    const result = await executeDeleteSubmission(args.submission_id, args.reason);
                    history.push({ role: "tool", tool_call_id: toolCall.id, content: result });
                    const finalRes = await fetch(GROQ_API_URL, { method: 'POST', headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: GROQ_MODEL, messages: [{ role: 'system', content: systemPrompt }, ...history] }) });
                    const finalData = await finalRes.json();
                    return finalData.choices[0].message.content;
                }
            }
            return message.content;
        } catch (error) { throw new Error('Gagal menghubungi AI: ' + error.message); }
    }
}

// ==========================================
// 3. HALAMAN LAPORAN
// ==========================================
function initLaporanPage(session) {
    window.currentUser = { name: session.user.user_metadata?.full_name || session.user.email || 'User', email: session.user.email };
    const today = new Date(); const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(today.getDate() - 30);
    const filterFrom = document.getElementById('filterFrom'); const filterTo = document.getElementById('filterTo');
    if (filterFrom) filterFrom.value = thirtyDaysAgo.toISOString().split('T')[0];
    if (filterTo) filterTo.value = today.toISOString().split('T')[0];
    loadReports();
    document.getElementById('applyFilterBtn')?.addEventListener('click', loadReports);
    document.getElementById('downloadPdfBtn')?.addEventListener('click', downloadPDF);
    document.getElementById('downloadExcelBtn')?.addEventListener('click', downloadExcel);
}

async function loadReports() {
    const supabase = window.supabaseClient;
    const from = document.getElementById('filterFrom')?.value || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const to = document.getElementById('filterTo')?.value || new Date().toISOString().split('T')[0];
    const tableBody = document.getElementById('reportsTableBody');
    if (tableBody) tableBody.innerHTML = `<tr><td colspan="8" class="text-center py-8"><div class="spinner mx-auto"></div></td></tr>`;
    try {
        const { data, error } = await supabase.from('checklist_submissions').select('*').gte('created_at', from + 'T00:00:00').lte('created_at', to + 'T23:59:59').order('created_at', { ascending: false });
        if (error) throw error;
        filteredReports = data || [];
        renderReports(filteredReports);
        updateReportStats(filteredReports);
    } catch (error) { if (tableBody) tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-red-400 py-8">Gagal: ${error.message}</td></tr>`; }
}

function renderReports(reports) {
    const tableBody = document.getElementById('reportsTableBody');
    const reportCountText = document.getElementById('reportCountText');
    if (!tableBody) return;
    if (reportCountText) reportCountText.textContent = `Menampilkan ${reports.length} laporan`;
    
    const hasData = reports.length > 0;
    const pdfBtn = document.getElementById('downloadPdfBtn');
    const excelBtn = document.getElementById('downloadExcelBtn');
    if (pdfBtn) pdfBtn.disabled = !hasData;
    if (excelBtn) excelBtn.disabled = !hasData;

    if (reports.length === 0) { tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-white/50 py-8">Tidak ada laporan</td></tr>`; return; }
    
    tableBody.innerHTML = reports.map(r => {
        const date = new Date(r.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
        const time = r.submission_time || new Date(r.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const statusColor = r.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400';
        const progressColor = r.progress_percentage === 100 ? 'text-green-400' : (r.progress_percentage >= 50 ? 'text-amber-400' : 'text-red-400');
        
        let spvBadge = '<span class="px-2 py-1 rounded-full text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">⏳ Menunggu</span>';
        if (r.supervisor_status === 'approved') spvBadge = '<span class="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">✅ Disetujui</span>';
        if (r.supervisor_status === 'rejected') spvBadge = '<span class="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400 border border-red-500/30">❌ Ditolak</span>';

        return `<tr>
            <td class="px-4 py-3 text-sm">${date}</td>
            <td class="px-4 py-3 text-sm font-mono text-white/70">${time}</td>
            <td class="px-4 py-3 text-sm">${r.user_name || '-'}</td>
            <td class="px-4 py-3 text-sm text-center">${r.total_items || 0}</td>
            <td class="px-4 py-3 text-sm text-center text-green-400 font-medium">${r.completed_items || 0}</td>
            <td class="px-4 py-3 text-sm font-semibold text-center ${progressColor}">${r.progress_percentage || 0}%</td>
            <td class="px-4 py-3 text-center"><span class="px-2 py-1 rounded-full text-xs font-medium ${statusColor}">${r.status === 'completed' ? 'Selesai' : 'Proses'}</span></td>
            <td class="px-4 py-3 text-center">${spvBadge}</td>
        </tr>`;
    }).join('');
}

function updateReportStats(reports) {
    const total = reports.length; const completed = reports.filter(r => r.status === 'completed').length;
    const avg = total > 0 ? Math.round(reports.reduce((s, r) => s + (r.progress_percentage || 0), 0) / total) : 0;
    const users = new Set(reports.map(r => r.user_email)).size;
    const elTotal = document.getElementById('statTotalReports'); const elCompleted = document.getElementById('statCompletedReports');
    const elAvg = document.getElementById('statAvgProgress'); const elUsers = document.getElementById('statActiveUsers');
    if (elTotal) elTotal.textContent = total; if (elCompleted) elCompleted.textContent = completed;
    if (elAvg) elAvg.textContent = avg + '%'; if (elUsers) elUsers.textContent = users;
}

function downloadPDF() {
    if (filteredReports.length === 0 || typeof window.jspdf === 'undefined') return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const from = document.getElementById('filterFrom').value;
    const to = document.getElementById('filterTo').value;
    
    doc.setFontSize(18); doc.text('Laporan Kebersihan Gudang', 14, 20);
    doc.setFontSize(10); doc.text(`Periode: ${from} s/d ${to}`, 14, 28);
    doc.setFontSize(8); doc.setTextColor(100);
    doc.text(`Total Data: ${filteredReports.length} laporan | Dicetak: ${new Date().toLocaleString('id-ID')}`, 14, 33);
    doc.setTextColor(0);

    if (typeof doc.autoTable === 'function') {
        doc.autoTable({
            startY: 38,
            head: [['Tanggal', 'Jam', 'User', 'Total', 'Selesai', 'Progress', 'Status', 'Konfirmasi SPV']],
            body: filteredReports.map(r => [
                new Date(r.created_at).toLocaleDateString('id-ID'),
                r.submission_time || '-',
                r.user_name || '-',
                r.total_items || 0,
                r.completed_items || 0,
                (r.progress_percentage || 0) + '%',
                r.status === 'completed' ? 'Selesai' : 'Proses',
                getSpvStatusText(r.supervisor_status)
            ]),
            theme: 'grid',
            headStyles: { fillColor: [102, 126, 234], fontSize: 8, cellPadding: 2 },
            bodyStyles: { fontSize: 8, cellPadding: 2 },
            didParseCell: function(data) {
                if (data.section === 'body' && data.column.index === 7) {
                    const val = data.cell.raw;
                    if (val === 'Disetujui') { data.cell.styles.textColor = [34, 197, 94]; data.cell.styles.fontStyle = 'bold'; } 
                    else if (val === 'Ditolak') { data.cell.styles.textColor = [239, 68, 68]; data.cell.styles.fontStyle = 'bold'; } 
                    else { data.cell.styles.textColor = [245, 158, 11]; data.cell.styles.fontStyle = 'bold'; }
                }
            }
        });
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(9); doc.setTextColor(100);
        doc.text('Catatan: Kolom "Konfirmasi SPV" menunjukkan status validasi oleh Supervisor.', 14, finalY);
        doc.text('Disetujui = Valid | Ditolak = Perlu Perbaikan | Menunggu = Belum Divalidasi', 14, finalY + 5);
        doc.save(`Laporan-Kebersihan-${from}-to-${to}.pdf`);
        showNotification('PDF diunduh dengan kolom SPV! ✅', 'success');
    }
}

function downloadExcel() {
    if (filteredReports.length === 0 || typeof window.XLSX === 'undefined') return;
    const from = document.getElementById('filterFrom').value;
    const to = document.getElementById('filterTo').value;
    
    const data = filteredReports.map(r => ({
        'Tanggal': new Date(r.created_at).toLocaleDateString('id-ID'),
        'Jam': r.submission_time || '-',
        'User': r.user_name || '-',
        'Total Item': r.total_items || 0,
        'Selesai': r.completed_items || 0,
        'Progress': (r.progress_percentage || 0) + '%',
        'Status Checklist': r.status === 'completed' ? 'Selesai' : 'Proses',
        'Konfirmasi SPV': getSpvStatusText(r.supervisor_status),
        'Catatan SPV': r.supervisor_notes || '-'
    }));
    
    const wb = window.XLSX.utils.book_new();
    const ws = window.XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 30 }];
    
    window.XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
    window.XLSX.writeFile(wb, `Laporan-Kebersihan-${from}-to-${to}.xlsx`);
    showNotification('Excel diunduh dengan kolom SPV! ✅', 'success');
}

// ==========================================
// 4. HALAMAN DASHBOARD
// ==========================================
async function initDashboardPage(session) {
    window.currentUser = { name: session.user.user_metadata?.full_name || session.user.email || 'User', email: session.user.email };
    const nameEl = document.getElementById('dashboardUserName');
    if (nameEl) nameEl.textContent = session.user.user_metadata?.full_name || session.user.email.split('@')[0] || 'User';
    
    loadSidebar(); 
    updateDashboardStats(); 
    loadDashboardEnvironmentHistory();
    loadDashboardApdHistory();
    
    const tbody = document.getElementById('recentActivityBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4" class="text-center py-8"><div class="spinner mx-auto"></div><p class="text-white/50 mt-2">Memuat data...</p></td></tr>';
    try {
        const { data, error } = await window.supabaseClient.from('checklist_submissions').select('*').order('created_at', { ascending: false }).limit(10);
        if (error) throw error;
        if (!data || data.length === 0) { tbody.innerHTML = '<tr><td colspan="4" class="text-center py-6 text-white/50">Belum ada aktivitas checklist</td></tr>'; return; }
        tbody.innerHTML = data.map(row => {
            const timeStr = row.submission_time || new Date(row.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            const dateStr = new Date(row.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
            const statusColor = row.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400';
            const progressColor = row.progress_percentage === 100 ? 'text-green-400' : (row.progress_percentage >= 50 ? 'text-amber-400' : 'text-red-400');
            return `<tr class="border-b border-white/5 hover:bg-white/5 transition"><td class="px-4 py-3 text-sm">${row.user_name || 'User'}</td><td class="px-4 py-3 text-sm text-white/60">${dateStr} ${timeStr}</td><td class="px-4 py-3 text-sm font-semibold text-center ${progressColor}">${row.progress_percentage}%</td><td class="px-4 py-3 text-center"><span class="px-2 py-1 rounded-full text-xs font-medium ${statusColor}">${row.status === 'completed' ? 'Selesai' : 'Proses'}</span></td></tr>`;
        }).join('');
    } catch (error) { tbody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-red-400">Gagal memuat: ${error.message}</td></tr>`; }
}

async function updateDashboardStats() {
    const supabase = window.supabaseClient;
    try {
        const { count: totalLaporan } = await supabase.from('checklist_submissions').select('*', { count: 'exact', head: true });
        const { data: submissions } = await supabase.from('checklist_submissions').select('progress_percentage');
        let avgProgress = 0;
        if (submissions && submissions.length > 0) avgProgress = Math.round(submissions.reduce((acc, curr) => acc + (curr.progress_percentage || 0), 0) / submissions.length);
        const today = new Date().toISOString().split('T')[0];
        const { count: todayLaporan } = await supabase.from('checklist_submissions').select('*', { count: 'exact', head: true }).gte('created_at', today + 'T00:00:00');
        const { data: allSubs } = await supabase.from('checklist_submissions').select('user_email');
        const activeUsers = allSubs ? new Set(allSubs.map(r => r.user_email)).size : 0;
        const elTotal = document.getElementById('statTotalLaporan'); const elAvg = document.getElementById('statAvgProgress');
        const elToday = document.getElementById('statTodayLaporan'); const elUsers = document.getElementById('statActiveUsers');
        if (elTotal) elTotal.textContent = totalLaporan || 0; if (elAvg) elAvg.textContent = avgProgress + '%';
        if (elToday) elToday.textContent = todayLaporan || 0; if (elUsers) elUsers.textContent = activeUsers;
    } catch (error) { console.error("❌ Error memuat statistik dashboard:", error); }
}

async function loadDashboardEnvironmentHistory() {
    const tbody = document.getElementById('dashboardEnvironmentBody');
    if (!tbody) return;
    try {
        const { data, error } = await window.supabaseClient.from('environment_readings').select('temperature, humidity, submission_time, created_at').order('created_at', { ascending: false }).limit(4);
        if (error) throw error;
        if (!data || data.length === 0) { tbody.innerHTML = '<tr><td colspan="3" class="text-center py-6 text-white/50 text-sm">Belum ada data</td></tr>'; return; }
        tbody.innerHTML = data.map(row => {
            const timeStr = row.submission_time || new Date(row.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            const dateStr = new Date(row.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
            const tempStatus = (row.temperature >= 20 && row.temperature <= 27) ? 'text-green-400' : 'text-amber-400';
            const humStatus = (row.humidity >= 50 && row.humidity <= 70) ? 'text-green-400' : 'text-amber-400';
            return `<tr class="border-b border-white/5 hover:bg-white/5 transition"><td class="px-4 py-3 text-sm text-white/60">${dateStr}<br><span class="text-xs">${timeStr}</span></td><td class="px-4 py-3 text-sm text-center font-semibold ${tempStatus}">${row.temperature}°C</td><td class="px-4 py-3 text-sm text-center font-semibold ${humStatus}">${row.humidity}%</td></tr>`;
        }).join('');
    } catch (error) { tbody.innerHTML = `<tr><td colspan="3" class="text-center py-6 text-red-400 text-sm">Gagal memuat</td></tr>`; }
}

async function loadDashboardApdHistory() {
    const tbody = document.getElementById('recentApdActivityBody');
    if (!tbody) return;
    try {
        const { data, error } = await window.supabaseClient
            .from('apd_checklist')
            .select('user_name, progress_percentage, status, submission_time, created_at')
            .order('created_at', { ascending: false })
            .limit(5);
        if (error) throw error;
        if (!data || data.length === 0) { 
            tbody.innerHTML = '<tr><td colspan="4" class="text-center py-6 text-white/50 text-sm">Belum ada data APD</td></tr>'; 
            return; 
        }
        tbody.innerHTML = data.map(row => {
            const timeStr = row.submission_time || new Date(row.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            const dateStr = new Date(row.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
            const statusColor = row.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400';
            const progressColor = row.progress_percentage === 100 ? 'text-green-400' : 'text-amber-400';
            return `<tr class="border-b border-white/5 hover:bg-white/5 transition">
                <td class="px-4 py-3 text-sm text-white">${row.user_name || 'User'}</td>
                <td class="px-4 py-3 text-sm text-white/60">${dateStr} <span class="text-xs">${timeStr}</span></td>
                <td class="px-4 py-3 text-sm font-semibold text-center ${progressColor}">${row.progress_percentage}%</td>
                <td class="px-4 py-3 text-center"><span class="px-2 py-1 rounded-full text-xs font-medium ${statusColor}">${row.status === 'completed' ? 'Selesai' : 'Proses'}</span></td>
            </tr>`;
        }).join('');
    } catch (error) { 
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-red-400 text-sm">Gagal memuat data APD</td></tr>`; 
    }
}

// ==========================================
// 5. HALAMAN LINGKUNGAN
// ==========================================
function initEnvironmentPage(session) {
    window.currentUser = { name: session.user.user_metadata?.full_name || session.user.email || 'User', email: session.user.email };
    const dateDisplay = document.getElementById('currentDate');
    if (dateDisplay) dateDisplay.textContent = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    loadSidebar(); checkEnvironmentSubmission(session.user.email); loadEnvironmentHistory();

    const form = document.getElementById('environmentForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('submitEnvironmentBtn');
            if (submitBtn.disabled) return;
            const temperature = parseFloat(document.getElementById('temperature').value);
            const humidity = parseFloat(document.getElementById('humidity').value);
            const notes = document.getElementById('notes').value.trim();
            if (isNaN(temperature) || isNaN(humidity)) { showNotification('Suhu dan kelembapan harus diisi!', 'warning'); return; }

            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true; submitBtn.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px;"></div> Menyimpan...';
            const environmentData = { user_name: window.currentUser.name, user_email: window.currentUser.email, temperature: temperature, humidity: humidity, notes: notes || null, submission_time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) };

            try {
                const { error } = await window.supabaseClient.from('environment_readings').insert([environmentData]);
                if (error) throw error;
                showNotification('✅ Data lingkungan berhasil disimpan!', 'success');
                disableEnvironmentButton(environmentData);
                setTimeout(() => { form.reset(); loadEnvironmentHistory(); }, 1500);
            } catch (error) { showNotification('❌ Gagal: ' + error.message, 'error'); submitBtn.disabled = false; submitBtn.innerHTML = originalBtnText; }
        });
    }
}

async function checkEnvironmentSubmission(userEmail) {
    const today = new Date().toISOString().split('T')[0];
    try {
        const { data, error } = await window.supabaseClient.from('environment_readings').select('id, submission_time, created_at').eq('user_email', userEmail).gte('created_at', `${today}T00:00:00`).lte('created_at', `${today}T23:59:59`).limit(1);
        if (error) throw error;
        if (data && data.length > 0) disableEnvironmentButton(data[0]);
    } catch (error) { console.error("Gagal cek submission lingkungan:", error); }
}

function disableEnvironmentButton(submission) {
    const btn = document.getElementById('submitEnvironmentBtn');
    const infoBox = document.getElementById('dailySubmissionInfo');
    const timeDisplay = document.getElementById('submissionTimeDisplay');
    if (btn) { btn.disabled = true; btn.classList.add('opacity-50', 'cursor-not-allowed'); btn.innerHTML = '<span>✅ Sudah Submit Hari Ini</span>'; }
    if (infoBox) infoBox.classList.remove('hidden');
    if (timeDisplay) timeDisplay.textContent = submission.submission_time || new Date(submission.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

async function loadEnvironmentHistory() {
    const tbody = document.getElementById('environmentHistoryBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4" class="text-center py-8"><div class="spinner mx-auto"></div></td></tr>';
    try {
        const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { data, error } = await window.supabaseClient.from('environment_readings').select('*').gte('created_at', sevenDaysAgo.toISOString().split('T')[0] + 'T00:00:00').order('created_at', { ascending: false }).limit(7);
        if (error) throw error;
        if (!data || data.length === 0) { tbody.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-white/50">Belum ada riwayat data</td></tr>'; return; }
        tbody.innerHTML = data.map(row => {
            const date = new Date(row.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
            const tempStatus = row.temperature >= 20 && row.temperature <= 27 ? 'text-green-400' : 'text-amber-400';
            const humStatus = row.humidity >= 50 && row.humidity <= 70 ? 'text-green-400' : 'text-amber-400';
            return `<tr class="border-b border-white/5 hover:bg-white/5 transition"><td class="px-4 py-3 text-sm">${date}</td><td class="px-4 py-3 text-sm text-center font-semibold ${tempStatus}">${row.temperature}°C</td><td class="px-4 py-3 text-sm text-center font-semibold ${humStatus}">${row.humidity}%</td><td class="px-4 py-3 text-sm text-white/60">${row.notes || '-'}</td></tr>`;
        }).join('');
    } catch (error) { tbody.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-red-400">Gagal memuat: ${error.message}</td></tr>`; }
}

// ==========================================
// 6. HALAMAN APD CEKLIST
// ==========================================
function ensureApdUI() {
    const container = document.querySelector('.max-w-4xl') || document.querySelector('main .px-4') || document.querySelector('main > div');
    if (!container) { 
        console.error('❌ APD: container konten tidak ditemukan'); 
        return; 
    }
    container.style.overflow = 'visible';

    let notesEl = document.getElementById('apdNotes');
    if (!notesEl) {
        const notesCard = document.createElement('div');
        notesCard.className = 'glass-card !p-5 mb-6';
        notesCard.innerHTML = `<h3 class="text-white font-semibold mb-3">Catatan Tambahan</h3><textarea id="apdNotes" class="glass-input w-full px-4 py-3 text-white placeholder-white/30" rows="4" placeholder="Tulis catatan jika ada kondisi khusus..."></textarea><p class="text-white/40 text-xs mt-2">💡 Opsional</p>`;
        container.appendChild(notesCard);
        notesEl = document.getElementById('apdNotes');
    } else {
        const card = notesEl.closest('.glass-card');
        if (card && card.parentElement !== container) container.appendChild(card);
    }

    let btn = document.getElementById('submitApdBtn');
    if (!btn) {
        btn = document.createElement('button');
        btn.type = 'button'; 
        btn.id = 'submitApdBtn'; 
        btn.className = 'glass-button w-full !py-4 text-base font-semibold mb-4';
        btn.innerHTML = '<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span>Kirim Laporan APD</span>';
        container.appendChild(btn);
    }
    
    // 🔥 PERBAIKAN: Pindahkan style.cssText ke luar blok if (!btn) 
    // agar tombol yang sudah ada di HTML (tapi ter-hidden) dipaksa muncul.
    btn.style.cssText = `display:flex !important; visibility:visible !important; opacity:1 !important; height:auto !important; min-height:52px !important; position:relative !important; z-index:9999 !important; overflow:visible !important; align-items:center !important; justify-content:center !important; gap:8px !important; width:100% !important; margin:16px 0 !important; padding:16px 24px !important; background:linear-gradient(135deg,#a855f7 0%,#f97316 100%) !important; color:#fff !important; font-weight:700 !important; font-size:17px !important; border-radius:14px !important; border:none !important; cursor:pointer !important; box-shadow:0 6px 22px rgba(168,85,247,.45),0 4px 14px rgba(249,115,22,.4) !important;`;

    let info = document.getElementById('dailyApdInfo');
    if (!info) {
        info = document.createElement('div'); 
        info.id = 'dailyApdInfo'; 
        info.className = 'glass-card !p-4 mb-6 text-center'; 
        info.style.display = 'none';
        info.innerHTML = '<p class="text-green-400 font-semibold">✅ Sudah Submit APD Hari Ini</p><p class="text-white/60 text-xs mt-1">Waktu: <span id="apdSubmissionTime">-</span></p>';
        container.appendChild(info);
    }
    info.style.overflow = 'visible';
}

function initApdPage(session) {
    window.currentUser = { name: session.user.user_metadata?.full_name || session.user.email || 'User', email: session.user.email };
    const dateDisplay = document.getElementById('currentDate');
    if (dateDisplay) dateDisplay.textContent = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    loadSidebar();
    ensureApdUI();

    const checkboxes = document.querySelectorAll('.apd-checkbox');
    const totalItems = 5;
    const totalCountEl = document.getElementById('apdTotalCount');
    const completedCountEl = document.getElementById('apdCompletedCount');
    const progressTextEl = document.getElementById('apdProgressText');
    const progressBarEl = document.getElementById('apdProgressBar');
    if (totalCountEl) totalCountEl.textContent = totalItems;

    function updateProgress() {
        const completed = document.querySelectorAll('.apd-checkbox:checked').length;
        const percentage = totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0;
        if (completedCountEl) completedCountEl.textContent = completed;
        if (progressTextEl) progressTextEl.textContent = percentage + '%';
        if (progressBarEl) progressBarEl.style.width = percentage + '%';
    }

    checkboxes.forEach(cb => cb.addEventListener('change', () => {
        const listItem = cb.closest('.checklist-item');
        if (listItem) {
            if (cb.checked) { listItem.classList.add('completed'); listItem.style.background = 'rgba(34, 197, 94, 0.1)'; listItem.style.borderColor = 'rgba(34, 197, 94, 0.3)'; } 
            else { listItem.classList.remove('completed'); listItem.style.background = 'rgba(255, 255, 255, 0.05)'; listItem.style.borderColor = 'transparent'; }
        }
        updateProgress();
    }));
    
    updateProgress();
    checkDailyApdSubmission(session.user.email);

    const submitBtn = document.getElementById('submitApdBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (submitBtn.disabled) return;
            const completed = document.querySelectorAll('.apd-checkbox:checked').length;
            const percentage = totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0;
            if (completed < totalItems) { showNotification(`⚠️ Lengkapi semua APD dulu ya! (${completed}/${totalItems})`, 'warning'); return; }

            const checkedItems = [];
            document.querySelectorAll('.apd-checkbox:checked').forEach(cb => {
                const itemName = cb.getAttribute('data-item') || (cb.closest('.checklist-item')?.querySelector('.checklist-text')?.textContent.trim()) || 'Item';
                checkedItems.push(itemName);
            });

            const notesEl = document.getElementById('apdNotes');
            const notes = notesEl ? notesEl.value.trim() : null;
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px;"></div> Mengirim...';

            const submissionData = {
                user_name: window.currentUser.name, user_email: window.currentUser.email, total_items: totalItems, completed_items: completed,
                progress_percentage: percentage, status: percentage === 100 ? 'completed' : 'in_progress', checked_items: checkedItems,
                notes: notes || null, submission_time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }), created_at: new Date().toISOString()
            };

            try {
                const { error } = await window.supabaseClient.from('apd_checklist').insert([submissionData]);
                if (error) throw error;
                showNotification('✅ Laporan APD berhasil dikirim!', 'success');
                disableApdSubmitButtonUI(submissionData);
                setTimeout(() => {
                    checkboxes.forEach(cb => {
                        cb.checked = false;
                        const listItem = cb.closest('.checklist-item');
                        if (listItem) { listItem.classList.remove('completed'); listItem.style.background = 'rgba(255, 255, 255, 0.05)'; listItem.style.borderColor = 'transparent'; }
                    });
                    if (notesEl) notesEl.value = '';
                    updateProgress();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 1500);
            } catch (error) {
                console.error("❌ Gagal mengirim APD:", error);
                showNotification('❌ Gagal: ' + error.message, 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }
}

async function checkDailyApdSubmission(userEmail) {
    const today = new Date().toISOString().split('T')[0];
    try {
        const { data, error } = await window.supabaseClient.from('apd_checklist').select('id, submission_time, created_at').eq('user_email', userEmail).gte('created_at', `${today}T00:00:00`).lte('created_at', `${today}T23:59:59`).limit(1);
        if (error) throw error;
        if (data && data.length > 0) disableApdSubmitButtonUI(data[0]);
    } catch (error) { console.error("Gagal cek submission APD harian:", error); }
}

function disableApdSubmitButtonUI(submission) {
    const btn = document.getElementById('submitApdBtn');
    const infoBox = document.getElementById('dailyApdInfo');
    const timeDisplay = document.getElementById('apdSubmissionTime');
    if (btn) { btn.disabled = true; btn.classList.add('opacity-50', 'cursor-not-allowed'); btn.innerHTML = '<span>✅ Sudah Submit APD Hari Ini</span>'; }
    if (infoBox) { infoBox.classList.remove('hidden'); infoBox.style.display = 'block'; }
    if (timeDisplay) timeDisplay.textContent = submission.submission_time || new Date(submission.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

// ==========================================
// 7. HALAMAN SUPERVISOR
// ==========================================
let currentSupervisorFilter = 'pending';
let currentReportType = 'kebersihan';
let currentActionId = null;
let currentActionType = null;
let currentActionTable = 'checklist_submissions';

const ALL_APD_ITEMS = ['1. Menggunakan Seragam Sesuai Peraturan', '2. Menggunakan Sepatu Safety', '3. Menggunakan Topi Pelindung Kepala', '4. Tidak Memakai Aksesories yang Dilarang', '5. Kondisi Sehat dan Fit Saat Bertugas'];

function initSupervisorPage(session) {
    if (!isSupervisor(session)) { showNotification("⛔ Akses Ditolak: Halaman ini hanya untuk Supervisor.", 'error'); setTimeout(() => window.location.replace('dashboard.html'), 2000); return; }
    window.currentUser = { name: session.user.user_metadata?.full_name || 'Supervisor', email: session.user.email };
    loadSidebar();
    switchReportType('kebersihan');
}

function switchReportType(type) {
    currentReportType = type;
    document.querySelectorAll('.type-tab').forEach(tab => {
        if (tab.dataset.type === type) { tab.classList.add('bg-amber-500/20', 'text-amber-300', 'border', 'border-amber-500/30'); tab.classList.remove('bg-white/5', 'text-white/60'); } 
        else { tab.classList.remove('bg-amber-500/20', 'text-amber-300', 'border', 'border-amber-500/30'); tab.classList.add('bg-white/5', 'text-white/60'); }
    });
    const titleEl = document.getElementById('tableTitleText');
    if (titleEl) titleEl.textContent = type === 'apd' ? 'Daftar Laporan APD' : 'Daftar Laporan Kebersihan';
    loadSupervisorReports(currentSupervisorFilter);
}

function filterSupervisorReports(status) {
    currentSupervisorFilter = status;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.dataset.filter === status) { btn.classList.add('bg-amber-500/20', 'text-amber-300', 'border', 'border-amber-500/30'); btn.classList.remove('bg-white/5', 'text-white/60'); }
        else { btn.classList.remove('bg-amber-500/20', 'text-amber-300', 'border', 'border-amber-500/30'); btn.classList.add('bg-white/5', 'text-white/60'); }
    });
    loadSupervisorReports(status);
}

async function loadSupervisorReports(status) {
    if (currentReportType === 'apd') await loadApdReports(status); else await loadKebersihanReports(status);
}

async function loadKebersihanReports(status) {
    const tbody = document.getElementById('supervisorTableBody');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8"><div class="spinner mx-auto"></div></td></tr>`;
    try {
        const { data: allData, error: allError } = await window.supabaseClient.from('checklist_submissions').select('id, supervisor_status');
        if (!allError && allData) updateSupervisorCounts(allData);
        const { data, error } = await window.supabaseClient.from('checklist_submissions').select('id, user_name, user_email, progress_percentage, status, supervisor_status, supervisor_notes, created_at, submission_time').eq('supervisor_status', status).order('created_at', { ascending: false });
        if (error) throw error;
        if (!data || data.length === 0) { tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-white/50">Tidak ada laporan "${status}"</td></tr>`; return; }
        tbody.innerHTML = data.map(row => {
            const date = new Date(row.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
            const time = row.submission_time || new Date(row.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            const actionButtons = status === 'pending' ? `<button type="button" onclick="openActionModal('${row.id}', 'approved', 'checklist_submissions')" class="px-3 py-1 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 text-xs font-medium mr-1 transition">✓ Setuju</button><button type="button" onclick="openActionModal('${row.id}', 'rejected', 'checklist_submissions')" class="px-3 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-medium transition">✕ Tolak</button>` : `<span class="text-white/40 text-xs">Diproses</span>`;
            const statusBadge = row.supervisor_status === 'approved' ? '<span class="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">Disetujui</span>' : (row.supervisor_status === 'rejected' ? '<span class="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400">Ditolak</span>' : '<span class="px-2 py-1 rounded-full text-xs bg-amber-500/20 text-amber-400">Pending</span>');
            return `<tr class="border-b border-white/5 hover:bg-white/5 transition"><td class="px-4 py-3"><div class="text-sm font-medium text-white">${row.user_name || 'User'}</div><div class="text-xs text-white/50">${date} • ${time}</div></td><td class="px-4 py-3 text-center text-sm font-semibold ${row.progress_percentage === 100 ? 'text-green-400' : 'text-amber-400'}">${row.progress_percentage}%</td><td class="px-4 py-3 text-sm text-white/60 max-w-xs truncate">${row.supervisor_notes || '-'}</td><td class="px-4 py-3 text-center">${statusBadge}</td><td class="px-4 py-3 text-center">${actionButtons}</td></tr>`;
        }).join('');
    } catch (error) { tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-red-400">Gagal memuat: ${error.message}</td></tr>`; }
}

async function loadApdReports(status) {
    const tbody = document.getElementById('supervisorTableBody');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8"><div class="spinner mx-auto"></div></td></tr>`;
    try {
        const { data: allData, error: allError } = await window.supabaseClient.from('apd_checklist').select('id, supervisor_status');
        if (!allError && allData) updateSupervisorCounts(allData);
        const { data, error } = await window.supabaseClient.from('apd_checklist').select('id, user_name, user_email, total_items, completed_items, progress_percentage, notes, checked_items, supervisor_status, supervisor_notes, supervisor_name, created_at, submission_time').eq('supervisor_status', status).order('created_at', { ascending: false });
        if (error) throw error;
        if (!data || data.length === 0) { tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-white/50">Tidak ada laporan APD "${status}"</td></tr>`; return; }
        tbody.innerHTML = data.map(row => {
            const date = new Date(row.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
            const time = row.submission_time || new Date(row.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            const itemBadge = `<button type="button" onclick='showApdDetail(${JSON.stringify(row.id)}, ${JSON.stringify(row.checked_items || [])}, ${row.progress_percentage}, ${JSON.stringify(row.user_name || 'User')}, ${JSON.stringify(row.submission_time || '')}, ${JSON.stringify(row.notes || '')})' class="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition cursor-pointer" title="Klik untuk lihat detail">👁️ ${row.completed_items}/${row.total_items} item</button>`;
            const catatanUser = row.notes ? `<div class="text-xs text-white/70 mb-1">👤 ${row.notes}</div>` : '';
            const catatanSpv = row.supervisor_notes ? `<div class="text-xs text-amber-300">👑 ${row.supervisor_notes}</div>` : (row.supervisor_status === 'pending' ? `<div class="text-xs text-white/40">Belum ada catatan</div>` : '');
            const actionButtons = status === 'pending' ? `<button type="button" onclick="openActionModal('${row.id}', 'approved', 'apd_checklist')" class="px-3 py-1 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 text-xs font-medium mr-1 transition">✓ Setuju</button><button type="button" onclick="openActionModal('${row.id}', 'rejected', 'apd_checklist')" class="px-3 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-medium transition">✕ Tolak</button>` : `<span class="text-white/40 text-xs">${row.supervisor_name ? 'oleh ' + row.supervisor_name : 'Diproses'}</span>`;
            const statusBadge = row.supervisor_status === 'approved' ? '<span class="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">Disetujui</span>' : (row.supervisor_status === 'rejected' ? '<span class="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400">Ditolak</span>' : '<span class="px-2 py-1 rounded-full text-xs bg-amber-500/20 text-amber-400">Pending</span>');
            return `<tr class="border-b border-white/5 hover:bg-white/5 transition"><td class="px-4 py-3"><div class="text-sm font-medium text-white">${row.user_name || 'User'}</div><div class="text-xs text-white/50">${date} • ${time}</div></td><td class="px-4 py-3 text-center">${itemBadge}</td><td class="px-4 py-3 text-sm max-w-xs">${catatanUser}${catatanSpv}</td><td class="px-4 py-3 text-center">${statusBadge}</td><td class="px-4 py-3 text-center">${actionButtons}</td></tr>`;
        }).join('');
    } catch (error) { tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-red-400">Gagal memuat: ${error.message}</td></tr>`; }
}

function updateSupervisorCounts(allData) {
    const pending = allData.filter(r => (r.supervisor_status || 'pending') === 'pending').length;
    const approved = allData.filter(r => r.supervisor_status === 'approved').length;
    const rejected = allData.filter(r => r.supervisor_status === 'rejected').length;
    const elPending = document.getElementById('countPending');
    const elApproved = document.getElementById('countApproved');
    const elRejected = document.getElementById('countRejected');
    if (elPending) elPending.textContent = pending;
    if (elApproved) elApproved.textContent = approved;
    if (elRejected) elRejected.textContent = rejected;
}

function showApdDetail(id, checkedItems, progress, userName, submissionTime, notes) {
    const modal = document.getElementById('apdDetailModal');
    if (!modal) return;
    document.getElementById('apdDetailUserName').textContent = userName;
    document.getElementById('apdDetailProgress').textContent = progress + '%';
    document.getElementById('apdDetailTime').textContent = submissionTime ? `Diajukan pada ${submissionTime}` : '-';
    const listEl = document.getElementById('apdDetailItemsList');
    listEl.innerHTML = '';
    ALL_APD_ITEMS.forEach(itemName => {
        const isChecked = checkedItems.some(ci => ci.includes(itemName) || itemName.includes(ci));
        const row = document.createElement('div');
        row.className = 'flex items-center gap-3 p-3 rounded-lg ' + (isChecked ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30');
        row.innerHTML = `<div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isChecked ? 'bg-green-500/30 text-green-400' : 'bg-red-500/30 text-red-400'}">${isChecked ? '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>' : '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>'}</div><span class="text-sm text-white flex-1">${itemName}</span>`;
        listEl.appendChild(row);
    });
    const notesBox = document.getElementById('apdDetailNotesBox');
    const notesEl = document.getElementById('apdDetailNotes');
    if (notes && notes.trim()) { notesEl.textContent = notes; notesBox.classList.remove('hidden'); } else { notesBox.classList.add('hidden'); }
    modal.classList.remove('hidden');
}

function closeApdDetailModal() { const modal = document.getElementById('apdDetailModal'); if (modal) modal.classList.add('hidden'); }
document.addEventListener('click', function(event) { const modal = document.getElementById('apdDetailModal'); if (modal && !modal.classList.contains('hidden') && event.target === modal) closeApdDetailModal(); });

function openActionModal(id, type, table) {
    currentActionId = id; currentActionType = type; currentActionTable = table || 'checklist_submissions';
    const modal = document.getElementById('actionModal'); const title = document.getElementById('modalTitle');
    const btn = document.getElementById('confirmActionBtn'); const noteInput = document.getElementById('supervisorNoteInput');
    noteInput.value = '';
    if (type === 'approved') { title.textContent = 'Setujui Laporan Ini?'; title.className = 'text-xl font-bold text-green-400 mb-2'; btn.className = 'px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition'; btn.textContent = 'Setujui'; } 
    else { title.textContent = 'Tolak Laporan Ini?'; title.className = 'text-xl font-bold text-red-400 mb-2'; btn.className = 'px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition'; btn.textContent = 'Tolak'; }
    modal.classList.remove('hidden');
}

function closeActionModal() { document.getElementById('actionModal').classList.add('hidden'); currentActionId = null; currentActionType = null; currentActionTable = 'checklist_submissions'; }

document.addEventListener('click', async function(event) {
    if (event.target.id === 'confirmActionBtn') {
        if (!currentActionId || !currentActionType) return;
        const notes = document.getElementById('supervisorNoteInput').value.trim();
        const btn = document.getElementById('confirmActionBtn');
        const originalText = btn.textContent;
        btn.disabled = true; btn.textContent = 'Menyimpan...';
        try {
            let payload = { supervisor_status: currentActionType, supervisor_notes: notes };
            if (currentActionTable === 'apd_checklist') { payload.supervisor_name = window.currentUser?.name || 'Supervisor'; payload.supervisor_time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }); }
            const { error } = await window.supabaseClient.from(currentActionTable).update(payload).eq('id', currentActionId);
            if (error) throw error;
            const typeName = currentReportType === 'apd' ? 'APD ' : '';
            showNotification(`Laporan ${typeName}berhasil ${currentActionType === 'approved' ? 'disetujui' : 'ditolak'}!`, 'success');
            closeActionModal(); loadSupervisorReports(currentSupervisorFilter);
        } catch (error) { showNotification("Gagal menyimpan: " + error.message, 'error'); }
        finally { btn.disabled = false; btn.textContent = originalText; }
    }
});

// ==========================================
// 8. LOGIN & REGISTER
// ==========================================
function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const submitBtn = document.getElementById('submitBtn');
            const btnText = document.getElementById('btnText');
            submitBtn.disabled = true;
            btnText.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px;"></div> Memproses...';
            const { error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
            if (error) { showNotification("Login gagal: " + error.message, 'error'); submitBtn.disabled = false; btnText.textContent = 'Masuk'; } 
            else { 
                showNotification('Login berhasil!', 'success');
                const hasBiometric = localStorage.getItem('biometric_data');
                if (!hasBiometric) { const regBtn = document.getElementById('registerBiometricBtn'); if (regBtn) regBtn.classList.remove('hidden'); }
                setTimeout(() => window.location.replace('checklist.html'), 1000); 
            }
        });
    }
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    if (togglePassword && passwordInput) { togglePassword.addEventListener('click', () => { passwordInput.setAttribute('type', passwordInput.getAttribute('type') === 'password' ? 'text' : 'password'); }); }
    initBiometricLogin();
}

function initRegisterPage() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('userRole') ? document.getElementById('userRole').value : 'staff';
            const submitBtn = document.getElementById('submitBtn');
            const btnText = document.getElementById('btnText');
            submitBtn.disabled = true; btnText.textContent = 'Mendaftar...';
            const { error } = await window.supabaseClient.auth.signUp({ email, password, options: { data: { full_name: fullName, role: role } } });
            if (error) { showNotification("Registrasi gagal: " + error.message, 'error'); submitBtn.disabled = false; btnText.textContent = 'Daftar Sekarang'; }
            else { showNotification('Registrasi berhasil! Silakan login.', 'success'); setTimeout(() => window.location.replace('index.html'), 2000); }
        });
    }
}

// ==========================================
// 9. BIOMETRIC AUTHENTICATION
// ==========================================
function obfuscate(text) {
    let result = '';
    for (let i = 0; i < text.length; i++) { result += String.fromCharCode(text.charCodeAt(i) ^ BIO_KEY.charCodeAt(i % BIO_KEY.length)); }
    return btoa(result);
}

function deobfuscate(encoded) {
    try {
        const decoded = atob(encoded); let result = '';
        for (let i = 0; i < decoded.length; i++) { result += String.fromCharCode(decoded.charCodeAt(i) ^ BIO_KEY.charCodeAt(i % BIO_KEY.length)); }
        return result;
    } catch (e) { return null; }
}

function isBiometricSupported() { return window.PublicKeyCredential !== undefined && navigator.credentials !== undefined; }
async function checkBiometricAvailability() { if (!isBiometricSupported()) return false; try { return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(); } catch (error) { return false; } }
function generateChallenge() { const array = new Uint8Array(32); crypto.getRandomValues(array); return array; }
function bufferToBase64(buffer) { return btoa(String.fromCharCode(...new Uint8Array(buffer))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function base64ToBuffer(base64) { const clean = base64.replace(/-/g, '+').replace(/_/g, '/'); const binary = atob(clean); const bytes = new Uint8Array(binary.length); for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i); return bytes.buffer; }

async function registerBiometric(email, password) {
    try {
        const challenge = generateChallenge();
        const userIdBuffer = new TextEncoder().encode(email);
        const credential = await navigator.credentials.create({ publicKey: { challenge: challenge, rp: { name: "Gudang Clean", id: window.location.hostname }, user: { id: userIdBuffer, name: email, displayName: email }, pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }], authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required", requireResidentKey: false }, timeout: 60000, attestation: "none" } });
        if (!credential) throw new Error("Pendaftaran dibatalkan");
        const bioData = { credentialId: credential.id, credentialRawId: bufferToBase64(credential.rawId), email: obfuscate(email), password: obfuscate(password), registeredAt: new Date().toISOString() };
        localStorage.setItem('biometric_data', JSON.stringify(bioData));
        showNotification('✅ Sidik jari berhasil didaftarkan!', 'success');
        return true;
    } catch (error) { console.error("Error registering biometric:", error); showNotification('❌ Gagal mendaftar sidik jari: ' + error.message, 'error'); return false; }
}

async function loginWithBiometric() {
    try {
        const storedData = localStorage.getItem('biometric_data');
        if (!storedData) { showNotification('⚠️ Tidak ada sidik jari terdaftar.', 'warning'); return; }
        const bioData = JSON.parse(storedData);
        const email = deobfuscate(bioData.email);
        const password = deobfuscate(bioData.password);
        if (!email || !password) { showNotification('⚠️ Data sidik jari rusak.', 'warning'); return; }
        const assertion = await navigator.credentials.get({ publicKey: { challenge: generateChallenge(), allowCredentials: [{ id: base64ToBuffer(bioData.credentialRawId), type: 'public-key', transports: ['internal'] }], timeout: 60000, userVerification: "required" } });
        if (!assertion) throw new Error("Verifikasi dibatalkan");
        showNotification('🔐 Verifikasi sidik jari berhasil!', 'info');
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email: email, password: password });
        if (error) {
            if (error.message.includes('Invalid')) { showNotification('⚠️ Password berubah. Hapus sidik jari.', 'warning'); localStorage.removeItem('biometric_data'); setTimeout(() => window.location.reload(), 2000); } 
            else { showNotification('❌ Login gagal: ' + error.message, 'error'); }
            return;
        }
        showNotification('✅ Login berhasil!', 'success');
        setTimeout(() => { const userRole = data.user.user_metadata?.role || 'staff'; window.location.replace(userRole === 'supervisor' ? 'supervisor.html' : 'checklist.html'); }, 800);
    } catch (error) { console.error("Error logging in with biometric:", error); showNotification(error.name === 'NotAllowedError' ? '⚠️ Verifikasi dibatalkan.' : '❌ Gagal login: ' + error.message, 'error'); }
}

function removeBiometric() {
    if (confirm('Yakin ingin menghapus sidik jari?')) { localStorage.removeItem('biometric_data'); showNotification('✅ Sidik jari dihapus.', 'success'); setTimeout(() => window.location.reload(), 1000); }
}

async function initBiometricLogin() {
    const biometricBtn = document.getElementById('biometricLoginBtn');
    if (!biometricBtn) return;
    const isSupported = await checkBiometricAvailability();
    const hasBiometric = localStorage.getItem('biometric_data');
    if (!isSupported) { const biometricStatus = document.getElementById('biometricStatus'); if (biometricStatus) { biometricStatus.textContent = '⚠️ Perangkat tidak mendukung'; biometricStatus.classList.remove('hidden'); } return; }
    if (hasBiometric) {
        const bioData = JSON.parse(hasBiometric);
        biometricBtn.classList.remove('hidden');
        document.getElementById('biometricBtnText').textContent = '🔐 Masuk Cepat';
        biometricBtn.addEventListener('click', loginWithBiometric);
        const biometricStatus = document.getElementById('biometricStatus');
        if (biometricStatus) { biometricStatus.textContent = `✓ Terdaftar: ${deobfuscate(bioData.email)}`; biometricStatus.classList.remove('hidden'); }
        const removeBiometricBtn = document.getElementById('removeBiometricBtn');
        if (removeBiometricBtn) { removeBiometricBtn.classList.remove('hidden'); removeBiometricBtn.addEventListener('click', removeBiometric); }
        const registerBiometricBtn = document.getElementById('registerBiometricBtn');
        if (registerBiometricBtn) registerBiometricBtn.classList.add('hidden');
    } else {
        const registerBiometricBtn = document.getElementById('registerBiometricBtn');
        if (registerBiometricBtn) {
            registerBiometricBtn.classList.remove('hidden');
            registerBiometricBtn.addEventListener('click', async () => {
                const email = document.getElementById('email')?.value;
                const password = document.getElementById('password')?.value;
                if (!email || !password) { showNotification('⚠️ Masukkan email dan password dulu.', 'warning'); return; }
                const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
                if (error) { showNotification('❌ Email/password salah.', 'error'); return; }
                const success = await registerBiometric(email, password);
                if (success) setTimeout(() => window.location.reload(), 1500);
            });
        }
        const biometricStatus = document.getElementById('biometricStatus');
        if (biometricStatus) { biometricStatus.textContent = 'Login dulu untuk mendaftar.'; biometricStatus.classList.remove('hidden'); }
        biometricBtn.classList.add('hidden');
        const removeBiometricBtn = document.getElementById('removeBiometricBtn');
        if (removeBiometricBtn) removeBiometricBtn.classList.add('hidden');
    }
}

// ==========================================
// 10. HALAMAN KELOLA USER
// ==========================================
let allUsersData = [];
let deleteTargetId = null;

function initKelolaUserPage(session) {
    if (!isSupervisor(session)) { showNotification("⛔ Akses Ditolak.", 'error'); setTimeout(() => window.location.replace('dashboard.html'), 2000); return; }
    window.currentUser = { name: session.user.user_metadata?.full_name || 'Supervisor', email: session.user.email };
    loadSidebar();
    loadAllUsers();
    const searchInput = document.getElementById('searchUser');
    if (searchInput) searchInput.addEventListener('input', (e) => filterUsers(e.target.value));
    const refreshBtn = document.getElementById('refreshUsersBtn');
    if (refreshBtn) refreshBtn.addEventListener('click', loadAllUsers);
}

async function loadAllUsers() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8"><div class="spinner mx-auto"></div><p class="text-white/50 mt-2">Memuat data...</p></td></tr>`;
    try {
        const { data: { session }, error: sessionError } = await window.supabaseClient.auth.getSession();
        if (sessionError) throw new Error("Gagal membaca sesi: " + sessionError.message);
        if (!session || !session.access_token) throw new Error("Sesi tidak ditemukan.");
        const response = await fetch(LIST_USERS_FUNCTION_URL, { method: 'GET', headers: { 'Authorization': `Bearer ${session.access_token}`, 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' } });
        const responseText = await response.text();
        let result;
        try { result = JSON.parse(responseText); } catch (e) { throw new Error(`Server tidak mengembalikan JSON.`); }
        if (!response.ok) throw new Error(result.details || result.error || result.hint || `HTTP Error ${response.status}`);
        allUsersData = result.users || [];
        updateUsersStats(allUsersData);
        renderUsersTable(allUsersData);
    } catch (error) {
        console.error("❌ Error loading users:", error);
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-red-400">Gagal memuat data.<br><span style="font-size: 0.9em; font-weight: bold;">${error.message}</span><br><small style="opacity: 0.8;">💡 Solusi: Logout lalu Login ulang.</small></td></tr>`;
    }
}

function updateUsersStats(users) {
    const total = users.length;
    const staff = users.filter(u => u.role === 'staff').length;
    const supervisor = users.filter(u => u.role === 'supervisor').length;
    if (document.getElementById('statTotalUsers')) document.getElementById('statTotalUsers').textContent = total;
    if (document.getElementById('statStaffUsers')) document.getElementById('statStaffUsers').textContent = staff;
    if (document.getElementById('statSupervisorUsers')) document.getElementById('statSupervisorUsers').textContent = supervisor;
}

function renderUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    if (users.length === 0) { tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-white/50">Tidak ada user ditemukan</td></tr>`; return; }
    tbody.innerHTML = users.map(user => {
        const date = new Date(user.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
        const roleBadge = user.role === 'supervisor' ? '<span class="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30">👑 Supervisor</span>' : '<span class="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">👷 Staff</span>';
        const isCurrentUser = user.email === window.currentUser.email;
        const deleteBtn = isCurrentUser ? '<span class="text-xs text-white/30 italic">Anda</span>' : `<button type="button" onclick="openDeleteModal('${user.id}', '${(user.full_name || 'User').replace(/'/g, "")}', '${user.email}')" class="px-3 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-medium transition">🗑️ Hapus</button>`;
        const initial = (user.full_name || user.email).charAt(0).toUpperCase();
        return `<tr class="border-b border-white/5 hover:bg-white/5 transition"><td class="px-4 py-3"><div class="flex items-center gap-3"><div class="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">${initial}</div><div class="text-sm font-medium text-white">${user.full_name || 'User'}</div></div></td><td class="px-4 py-3 text-sm text-white/70">${user.email}</td><td class="px-4 py-3 text-center">${roleBadge}</td><td class="px-4 py-3 text-sm text-white/60">${date}</td><td class="px-4 py-3 text-center">${deleteBtn}</td></tr>`;
    }).join('');
}

function filterUsers(query) {
    const q = query.toLowerCase().trim();
    if (!q) { renderUsersTable(allUsersData); return; }
    const filtered = allUsersData.filter(u => (u.full_name || '').toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    renderUsersTable(filtered);
}

function openDeleteModal(userId, userName, userEmail) {
    deleteTargetId = userId;
    document.getElementById('deleteUserName').textContent = userName;
    document.getElementById('deleteUserEmail').textContent = userEmail;
    document.getElementById('deleteModal').classList.remove('hidden');
}

function closeDeleteModal() { document.getElementById('deleteModal').classList.add('hidden'); deleteTargetId = null; }

// ==========================================
// 11. GLOBAL EVENT HANDLERS
// ==========================================
document.addEventListener('click', async function(event) {
    // === DELETE USER ===
    if (event.target.id === 'confirmDeleteBtn') {
        if (!deleteTargetId) return;
        const btn = document.getElementById('confirmDeleteBtn');
        const originalText = btn.textContent;
        btn.disabled = true; btn.textContent = 'Menghapus...';
        try {
            const response = await fetch(DELETE_USER_FUNCTION_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }, body: JSON.stringify({ userId: deleteTargetId }) });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Gagal menghapus user');
            showNotification('✅ User berhasil dihapus.', 'success');
            closeDeleteModal();
            loadAllUsers();
        } catch (error) { console.error("Error deleting user:", error); showNotification('❌ Gagal: ' + error.message, 'error'); }
        finally { btn.disabled = false; btn.textContent = originalText; }
    }
    
    // === LOGOUT ===
    const logoutBtn = event.target.closest('#logoutBtn');
    if (logoutBtn) {
        event.preventDefault();
        if (!confirm('Yakin ingin keluar?')) return;
        try { await window.supabaseClient.auth.signOut(); localStorage.removeItem('gudang_clean_state'); window.location.replace('index.html'); } catch (error) { console.error("Error logout:", error); }
    }

    // === SIMPAN DETAIL KENDARAAN ===
    if (event.target.id === 'saveVehicleDetailBtn') {
        const headerId = document.getElementById('detail_header_id').value;
        const btn = document.getElementById('saveVehicleDetailBtn');
        if (!headerId) return;

        btn.disabled = true;
        btn.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px;"></div> Menyimpan...';

        const detailData = {
            header_id: headerId,
            item_luar_bersih: document.getElementById('d_luar').value,
            item_lantai_bersih: document.getElementById('d_lantai').value,
            item_hama: document.getElementById('d_hama').value,
            item_paku_baut: document.getElementById('d_paku').value,
            item_lubang_bocor: document.getElementById('d_bocor').value,
            item_bau: document.getElementById('d_bau').value,
            item_kering: document.getElementById('d_kering').value,
            item_barang_utuh: document.getElementById('d_utuh').value,
            item_pemisahan_bahan: document.getElementById('d_pisah').value,
            item_pintu_seal: document.getElementById('d_pintu').value,
            jenis_barang: document.getElementById('d_jenis_barang').value,
            item_lampu_kaca: document.getElementById('d_lampu').value
        };

        try {
            const { data: existing } = await window.supabaseClient.from('vehicle_checklist_detail').select('id').eq('header_id', headerId).single();
            let error;
            if (existing) {
                const res = await window.supabaseClient.from('vehicle_checklist_detail').update(detailData).eq('id', existing.id);
                error = res.error;
            } else {
                const res = await window.supabaseClient.from('vehicle_checklist_detail').insert([detailData]);
                error = res.error;
            }
            if (error) throw error;

            showNotification('✅ Checklist detail kendaraan berhasil disimpan!', 'success');
            closeVehicleDetailModal();
            loadVehicleHistory();
        } catch (err) {
            console.error("Gagal simpan detail:", err);
            showNotification('❌ Gagal: ' + err.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = `<svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg> Simpan Checklist Detail`;
        }
    }

    // === TUTUP MODAL KENDARAAN KLIK DI LUAR ===
    const vehicleModal = document.getElementById('vehicleDetailModal');
    if (vehicleModal && !vehicleModal.classList.contains('hidden') && event.target === vehicleModal) {
        closeVehicleDetailModal();
    }
});

// ==========================================
// 12. HALAMAN CEKLIST KENDARAAN
// ==========================================
function initKendaraanPage(session) {
    window.currentUser = { name: session.user.user_metadata?.full_name || session.user.email || 'User', email: session.user.email };
    loadSidebar();
    
    const today = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    document.getElementById('v_hari').value = days[today.getDay()];
    document.getElementById('v_tanggal').value = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
    
    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0].substring(0, 5);
    document.getElementById('v_jam').value = timeString;
    document.getElementById('v_checker').value = window.currentUser.name;
    document.getElementById('v_dibuat_oleh').value = window.currentUser.name;

    getNextVehicleNo();
    loadVehicleHistory();

    document.getElementById('saveVehicleHeaderBtn').addEventListener('click', async () => {
        const btn = document.getElementById('saveVehicleHeaderBtn');
        const nopol = document.getElementById('v_nopol').value.trim();
        const keputusan = document.getElementById('v_keputusan').value;
        
        if (!nopol) { showNotification('⚠️ Nomor Kendaraan wajib diisi!', 'warning'); return; }
        if (!keputusan) { showNotification('⚠️ Keputusan wajib dipilih!', 'warning'); return; }

        btn.disabled = true;
        btn.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px;"></div> Menyimpan...';

        const headerData = {
            no_urut: parseInt(document.getElementById('v_no').value) || 1,
            hari: document.getElementById('v_hari').value,
            tanggal: today.toISOString().split('T')[0],
            jam: document.getElementById('v_jam').value,
            supplier: document.getElementById('v_supplier').value.toUpperCase(),
            nomor_kendaraan: nopol.toUpperCase(),
            jenis_kendaraan: document.getElementById('v_jenis').value,
            no_coa: document.getElementById('v_coa').value.toUpperCase(),
            no_do: document.getElementById('v_do').value.toUpperCase(),
            nomor_container: document.getElementById('v_container').value.toUpperCase(),
            nomor_seal: document.getElementById('v_seal').value.toUpperCase(),
            ttd_checker: document.getElementById('v_checker').value.toUpperCase(),
            keputusan: keputusan,
            dibuat_oleh: document.getElementById('v_dibuat_oleh').value.toUpperCase(),
            keterangan: document.getElementById('v_keterangan').value.toUpperCase(),
            user_email: window.currentUser.email
        };

        try {
            const { data, error } = await window.supabaseClient.from('vehicle_checklist_header').insert([headerData]).select();
            if (error) throw error;
            
            showNotification('✅ Data kendaraan berhasil disimpan!', 'success');
            
            document.getElementById('vehicleHeaderForm').reset();
            document.getElementById('v_hari').value = days[new Date().getDay()];
            document.getElementById('v_tanggal').value = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
            document.getElementById('v_jam').value = new Date().toTimeString().split(' ')[0].substring(0, 5);
            document.getElementById('v_checker').value = window.currentUser.name;
            document.getElementById('v_dibuat_oleh').value = window.currentUser.name;
            
            getNextVehicleNo();
            openVehicleDetailModal(data[0].id, data[0].nomor_kendaraan);
            loadVehicleHistory();
            
        } catch (error) {
            console.error("Gagal simpan header:", error);
            showNotification('❌ Gagal: ' + error.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = `<svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg> Simpan Data Kendaraan`;
        }
    });
}

async function getNextVehicleNo() {
    try {
        const { data, error } = await window.supabaseClient.from('vehicle_checklist_header').select('no_urut').order('no_urut', { ascending: false }).limit(1);
        if (error) throw error;
        const nextNo = data && data.length > 0 ? data[0].no_urut + 1 : 1;
        document.getElementById('v_no').value = nextNo;
    } catch (error) {
        console.error("Gagal get next no:", error);
        document.getElementById('v_no').value = 1;
    }
}

async function loadVehicleHistory() {
    const tbody = document.getElementById('vehicleHistoryBody');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8"><div class="spinner mx-auto"></div><p class="text-white/50 mt-2">Memuat data...</p></td></tr>`;

    try {
        const { data, error } = await window.supabaseClient
            .from('vehicle_checklist_header')
            .select(`id, no_urut, tanggal, jam, supplier, nomor_kendaraan, jenis_kendaraan, ttd_checker, vehicle_checklist_detail (id)`)
            .order('created_at', { ascending: false });
        if (error) throw error;
        if (!data || data.length === 0) { tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-white/50">Belum ada riwayat ceklist kendaraan.</td></tr>`; return; }

        tbody.innerHTML = data.map(row => {
            const dateStr = row.tanggal ? new Date(row.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
            const timeStr = row.jam ? row.jam.substring(0, 5) : '-';
            const isDetailFilled = row.vehicle_checklist_detail && row.vehicle_checklist_detail.length > 0;
            const statusBadge = isDetailFilled 
                ? '<span class="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">✅ Lengkap</span>'
                : '<span class="px-2 py-1 rounded-full text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">⏳ Pending</span>';

            return `<tr class="border-b border-white/5 hover:bg-white/5 transition">
                <td class="px-4 py-3 text-sm text-white/80">${row.no_urut || '-'}</td>
                <td class="px-4 py-3 text-sm text-white/80">${dateStr}<br><span class="text-xs text-white/50">${timeStr}</span></td>
                <td class="px-4 py-3 text-sm text-white">${row.supplier || '-'}</td>
                <td class="px-4 py-3 text-center">
                    <button onclick="openVehicleDetailModal('${row.id}', '${row.nomor_kendaraan}')" class="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition text-sm font-bold flex items-center gap-2 mx-auto cursor-pointer">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        ${row.nomor_kendaraan}
                    </button>
                </td>
                <td class="px-4 py-3 text-center text-sm text-white/70">${row.jenis_kendaraan || '-'}</td>
                <td class="px-4 py-3 text-center text-sm text-white/70">${row.ttd_checker || '-'}</td>
                <td class="px-4 py-3 text-center">${statusBadge}</td>
            </tr>`;
        }).join('');
    } catch (error) {
        console.error("Gagal load history:", error);
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-red-400">Gagal memuat data: ${error.message}</td></tr>`;
    }
}

async function openVehicleDetailModal(headerId, nopol) {
    currentVehicleHeaderId = headerId;
    document.getElementById('modalVehicleNo').textContent = nopol;
    document.getElementById('detail_header_id').value = headerId;
    document.getElementById('vehicleDetailForm').reset();

    try {
        const { data, error } = await window.supabaseClient.from('vehicle_checklist_detail').select('*').eq('header_id', headerId).single();
        if (data && !error) {
            document.getElementById('d_luar').value = data.item_luar_bersih || '';
            document.getElementById('d_lantai').value = data.item_lantai_bersih || '';
            document.getElementById('d_hama').value = data.item_hama || '';
            document.getElementById('d_paku').value = data.item_paku_baut || '';
            document.getElementById('d_bocor').value = data.item_lubang_bocor || '';
            document.getElementById('d_bau').value = data.item_bau || '';
            document.getElementById('d_kering').value = data.item_kering || '';
            document.getElementById('d_utuh').value = data.item_barang_utuh || '';
            document.getElementById('d_pisah').value = data.item_pemisahan_bahan || '';
            document.getElementById('d_pintu').value = data.item_pintu_seal || '';
            document.getElementById('d_jenis_barang').value = data.jenis_barang || '';
            document.getElementById('d_lampu').value = data.item_lampu_kaca || '';
        }
    } catch (e) { console.log("Belum ada data detail."); }

    document.getElementById('vehicleDetailModal').classList.remove('hidden');
}

function closeVehicleDetailModal() {
    document.getElementById('vehicleDetailModal').classList.add('hidden');
    currentVehicleHeaderId = null;
}

// ==========================================
// 13. HALAMAN LAPORAN KENDARAAN (FORM PT URC)
// ==========================================
function initLaporanKendaraanPage(session) {
    window.currentUser = { name: session.user.user_metadata?.full_name || session.user.email || 'User', email: session.user.email };
    loadSidebar();
    
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    document.getElementById('filterDateFrom').value = thirtyDaysAgo.toISOString().split('T')[0];
    document.getElementById('filterDateTo').value = today.toISOString().split('T')[0];
    
    loadUserDropdown();
}

async function loadUserDropdown() {
    try {
        const { data, error } = await window.supabaseClient
            .from('vehicle_checklist_header')
            .select('ttd_checker')
            .order('ttd_checker');
        if (error) throw error;
        
        const uniqueUsers = [...new Set(data.map(r => r.ttd_checker).filter(n => n))];
        const select = document.getElementById('filterUser');
        uniqueUsers.forEach(user => {
            const opt = document.createElement('option');
            opt.value = user;
            opt.textContent = user;
            select.appendChild(opt);
        });
    } catch (error) {
        console.error("Gagal load user dropdown:", error);
    }
}

function resetFilters() {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    document.getElementById('filterDateFrom').value = thirtyDaysAgo.toISOString().split('T')[0];
    document.getElementById('filterDateTo').value = today.toISOString().split('T')[0];
    document.getElementById('filterShift').value = '';
    document.getElementById('filterUser').value = '';
    document.getElementById('reportPreview').innerHTML = `
        <div class="glass-card !p-10 text-center">
            <svg class="h-16 w-16 mx-auto text-white/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <p class="text-white/60 text-sm">Silakan pilih filter dan klik <span class="text-cyan-400 font-semibold">"Generate Laporan"</span> untuk melihat preview form.</p>
        </div>`;
    document.getElementById('reportInfo').classList.add('hidden');
}

function getShiftFromTime(timeStr) {
    if (!timeStr) return '';
    const hour = parseInt(timeStr.split(':')[0]);
    if (hour >= 6 && hour < 14) return 'Pagi';
    if (hour >= 14 && hour < 22) return 'Siang';
    return 'Malam';
}

async function generateReport() {
    const dateFrom = document.getElementById('filterDateFrom').value;
    const dateTo = document.getElementById('filterDateTo').value;
    const shift = document.getElementById('filterShift').value;
    const user = document.getElementById('filterUser').value;
    
    if (!dateFrom || !dateTo) {
        showNotification('⚠️ Tanggal mulai dan akhir wajib diisi!', 'warning');
        return;
    }
    
    const preview = document.getElementById('reportPreview');
    preview.innerHTML = `<div class="glass-card !p-10 text-center"><div class="spinner mx-auto"></div><p class="text-white/60 text-sm mt-3">Memuat data...</p></div>`;
    
    try {
        let query = window.supabaseClient
            .from('vehicle_checklist_header')
            .select(`*, vehicle_checklist_detail (*)`)
            .gte('tanggal', dateFrom)
            .lte('tanggal', dateTo)
            .order('tanggal', { ascending: true })
            .order('jam', { ascending: true });
        
        if (user) query = query.eq('ttd_checker', user);
        
        const { data, error } = await query;
        if (error) throw error;
        
        let filteredData = data || [];
        if (shift) {
            filteredData = filteredData.filter(row => getShiftFromTime(row.jam) === shift);
        }
        
        if (filteredData.length === 0) {
            preview.innerHTML = `<div class="glass-card !p-10 text-center"><p class="text-white/60 text-sm">Tidak ada data untuk filter yang dipilih.</p></div>`;
            document.getElementById('reportInfo').classList.add('hidden');
            return;
        }
        
        // Group by user
        const groupedByUser = {};
        filteredData.forEach(row => {
            const checker = row.ttd_checker || 'Unknown';
            if (!groupedByUser[checker]) groupedByUser[checker] = [];
            groupedByUser[checker].push(row);
        });
        
        const uniqueUsers = Object.keys(groupedByUser);
        document.getElementById('infoTotalData').textContent = filteredData.length;
        document.getElementById('infoTotalUser').textContent = uniqueUsers.length;
        document.getElementById('reportInfo').classList.remove('hidden');
        
        // Generate pages: 1 user = minimal 1 halaman, max 9 kendaraan per halaman
        let allPagesHTML = '';
        let globalPageNum = 1;
        const totalPages = uniqueUsers.reduce((sum, usr) => {
            return sum + Math.ceil(groupedByUser[usr].length / VEHICLES_PER_PAGE);
        }, 0);
        
        uniqueUsers.forEach(checkerName => {
            const userVehicles = groupedByUser[checkerName];
            const userPages = Math.ceil(userVehicles.length / VEHICLES_PER_PAGE);
            
            for (let pageIdx = 0; pageIdx < userPages; pageIdx++) {
                const startIdx = pageIdx * VEHICLES_PER_PAGE;
                const endIdx = Math.min(startIdx + VEHICLES_PER_PAGE, userVehicles.length);
                const pageVehicles = userVehicles.slice(startIdx, endIdx);
                const pageOfUser = pageIdx + 1;
                
                allPagesHTML += buildFormPage(pageVehicles, checkerName, globalPageNum, totalPages, pageOfUser, userPages);
                globalPageNum++;
            }
        });
        
        preview.innerHTML = allPagesHTML;
        
    } catch (error) {
        console.error("Gagal generate laporan:", error);
        preview.innerHTML = `<div class="glass-card !p-10 text-center text-red-400">Gagal memuat data: ${error.message}</div>`;
    }
}

function buildFormPage(vehicles, checkerName, currentPage, totalPages, pageOfUser, totalUserPages) {
    const today = new Date();
    const dateStr = today.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    
    // Build header rows
    let headerRows = '';
    vehicles.forEach((v, idx) => {
        const no = idx + 1;
        const hari = v.hari || '';
        const tanggal = v.tanggal ? new Date(v.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
        const jam = v.jam || '';
        const supplier = v.supplier || '';
        const nopol = v.nomor_kendaraan || '';
        const jenis = v.jenis_kendaraan || '';
        const coa = v.no_coa || '';
        const doNo = v.no_do || '';
        const container = v.nomor_container || '';
        const seal = v.nomor_seal || '';
        const ttd = v.ttd_checker || '';
        const ket = v.keterangan || '';
        
        headerRows += `<tr>
            <td style="text-align:center">${no}</td>
            <td>${hari}</td>
            <td>${tanggal}</td>
            <td style="text-align:center">${jam}</td>
            <td>${supplier}</td>
            <td style="font-weight:bold">${nopol}</td>
            <td>${jenis}</td>
            <td>${coa}</td>
            <td>${doNo}</td>
            <td>${container}</td>
            <td>${seal}</td>
            <td>${ttd}</td>
            <td>${ket}</td>
        </tr>`;
    });
    
    // Fill empty rows to make it 9 rows
    for (let i = vehicles.length; i < VEHICLES_PER_PAGE; i++) {
        headerRows += `<tr>
            <td style="text-align:center">${i + 1}</td>
            <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
        </tr>`;
    }
    
    // Build inspection rows
    let inspectionRows = '';
    INSPECTION_ITEMS.forEach((item, itemIdx) => {
        let cells = `<td style="font-weight:500">${item}</td>`;
        for (let vIdx = 0; vIdx < VEHICLES_PER_PAGE; vIdx++) {
            const v = vehicles[vIdx];
            let value = '';
            if (v && v.vehicle_checklist_detail && v.vehicle_checklist_detail.length > 0) {
                const detail = v.vehicle_checklist_detail[0];
                const keys = ['item_luar_bersih', 'item_lantai_bersih', 'item_hama', 'item_paku_baut', 
                              'item_lubang_bocor', 'item_bau', 'item_kering', 'item_barang_utuh', 
                              'item_pemisahan_bahan', 'item_pintu_seal', 'jenis_barang', 'item_lampu_kaca'];
                value = detail[keys[itemIdx]] || '';
            }
            cells += `<td style="text-align:center">${value}</td>`;
        }
        inspectionRows += `<tr>${cells}</tr>`;
    });
    
    const dibuatOleh = vehicles[0]?.dibuat_oleh || checkerName;
    
    return `
    <div class="print-page">
        <div class="header-form">
            <div class="header-left">
                <div class="logo-box">
                    <div style="text-align:center">
                        <div style="font-size:18px;font-weight:900;color:#c00">UR</div>
                        <div style="font-size:7px">Universal<br>Robina</div>
                    </div>
                </div>
                <div class="company-info">
                    <div class="name">PT URC INDONESIA</div>
                    <div class="sub">A Company of<br>JG Summit Holdings</div>
                </div>
            </div>
            <div class="header-right">
                <table>
                    <tr><td class="label">FORM TITLE</td><td colspan="3" style="font-weight:bold;font-size:11px">FORM PEMERIKSAAN KENDARAAN</td></tr>
                    <tr><td class="label">FORM NO</td><td>FM-SPC-GN-01</td><td class="label">PAGE NO</td><td>${currentPage} OF ${totalPages}</td></tr>
                    <tr><td class="label">EFFECTIVE DATE</td><td>June 15, 2020</td><td class="label">REVISION NO</td><td>1</td></tr>
                </table>
            </div>
        </div>
        
        <div class="form-title">FORM PEMERIKSAAN KENDARAAN</div>
        
        <table class="report-table-print">
            <thead>
                <tr>
                    <th style="width:30px">No</th>
                    <th style="width:70px">Hari</th>
                    <th style="width:90px">Tanggal Pemeriksaan</th>
                    <th style="width:80px">Jam Kedatangan / Pemeriksaan</th>
                    <th style="width:110px">Nama Supplier / Expedisi</th>
                    <th style="width:90px">Nomor Kendaraan</th>
                    <th style="width:80px">Jenis Kendaraan</th>
                    <th style="width:50px">No CoA</th>
                    <th style="width:50px">No Do</th>
                    <th style="width:110px">Nomor Container (Khusus Container)</th>
                    <th style="width:70px">Nomor Seal</th>
                    <th style="width:80px">Ttd checker</th>
                    <th style="width:100px">Keterangan</th>
                </tr>
            </thead>
            <tbody>${headerRows}</tbody>
        </table>
        
        <table class="report-table-print" style="margin-top:8px">
            <thead>
                <tr>
                    <th rowspan="2" style="width:300px;vertical-align:middle">STANDARD PEMERIKSAAN KENDARAAN</th>
                    <th colspan="${VEHICLES_PER_PAGE}">Nomor kedatangan</th>
                </tr>
                <tr>
                    ${Array.from({length: VEHICLES_PER_PAGE}, (_, i) => `<th style="width:60px">${i + 1}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${inspectionRows}
                <tr class="footer-row">
                    <td>KEPUTUSAN : Dipakai / Ditolak</td>
                    ${Array.from({length: VEHICLES_PER_PAGE}, (_, i) => {
                        const v = vehicles[i];
                        const kep = v?.keputusan || '';
                        return `<td style="text-align:center;font-weight:bold">${kep}</td>`;
                    }).join('')}
                </tr>
                <tr class="footer-row">
                    <td>Dibuat Oleh (Team WH)</td>
                    ${Array.from({length: VEHICLES_PER_PAGE}, (_, i) => {
                        const v = vehicles[i];
                        const dibuat = v?.dibuat_oleh || dibuatOleh;
                        return `<td style="text-align:center">${dibuat}</td>`;
                    }).join('')}
                </tr>
            </tbody>
        </table>
        
        <div style="margin-top:10px;font-size:9px;color:#555;display:flex;justify-content:space-between">
            <span>Checker: <strong>${checkerName}</strong></span>
            <span>Halaman ${pageOfUser} dari ${totalUserPages} (User ini)</span>
            <span>Dicetak: ${dateStr}</span>
        </div>
    </div>`;
}

// ==========================================
// 14. UTILS
// ==========================================
function showNotification(message, type = 'info') {
    const colors = { 
        success: { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.3)', icon: '#22c55e' }, 
        warning: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', icon: '#f59e0b' }, 
        error: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', icon: '#ef4444' }, 
        info: { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)', icon: '#3b82f6' } 
    };
    const c = colors[type] || colors.info;
    const el = document.createElement('div');
    el.className = 'fixed top-6 right-6 z-[100] px-6 py-4 rounded-xl text-white font-medium';
    el.style.cssText = `background: ${c.bg}; backdrop-filter: blur(20px); border: 1px solid ${c.border}; box-shadow: 0 8px 32px rgba(0,0,0,0.3); animation: slideIn 0.4s ease;`;
    el.innerHTML = `<div class="flex items-center gap-3"><svg class="h-5 w-5" style="color: ${c.icon}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="${type === 'success' ? 'M5 13l4 4L19 7' : type === 'error' ? 'M6 18L18 6M6 6l12 12' : 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'}" /></svg><span>${message}</span></div>`;
    document.body.appendChild(el);
    setTimeout(() => { el.style.animation = 'slideOut 0.4s ease forwards'; setTimeout(() => el.remove(), 400); }, 3000);
}

if (!document.getElementById('notif-styles')) {
    const s = document.createElement('style'); s.id = 'notif-styles';
    s.textContent = `@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }`;
    document.head.appendChild(s);
}
// ==========================================
// SIDEBAR DROPDOWN TOGGLE (REKAP LAPORAN)
// ==========================================
function toggleSidebarDropdown(id) {
    const dropdown = document.getElementById(`dropdown-${id}`);
    const chevron = document.getElementById(`chevron-${id}`);
    
    if (dropdown && chevron) {
        if (dropdown.classList.contains('hidden')) {
            dropdown.classList.remove('hidden');
            chevron.style.transform = 'rotate(180deg)';
        } else {
            dropdown.classList.add('hidden');
            chevron.style.transform = 'rotate(0deg)';
        }
    }
}
// ==========================================
// 15. HALAMAN LAPORAN SUHU & KELEMBAPAN
// ==========================================
function initLaporanSuhuPage(session) {
    window.currentUser = { name: session.user.user_metadata?.full_name || session.user.email || 'User', email: session.user.email };
    loadSidebar();
    
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    document.getElementById('filterDateFrom').value = firstDayOfMonth.toISOString().split('T')[0];
    document.getElementById('filterDateTo').value = today.toISOString().split('T')[0];
    
    loadSuhuUserDropdown();
}

async function loadSuhuUserDropdown() {
    try {
        const { data, error } = await window.supabaseClient
            .from('environment_readings')
            .select('user_name')
            .order('user_name');
        if (error) throw error;
        
        const uniqueUsers = [...new Set(data.map(r => r.user_name).filter(n => n))];
        const select = document.getElementById('filterUser');
        uniqueUsers.forEach(user => {
            const opt = document.createElement('option');
            opt.value = user;
            opt.textContent = user;
            select.appendChild(opt);
        });
    } catch (error) {
        console.error("Gagal load user dropdown suhu:", error);
    }
}

function resetSuhuFilters() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    document.getElementById('filterDateFrom').value = firstDayOfMonth.toISOString().split('T')[0];
    document.getElementById('filterDateTo').value = today.toISOString().split('T')[0];
    document.getElementById('filterUser').value = '';
    document.getElementById('suhuReportPreview').innerHTML = `
        <div class="glass-card !p-10 text-center">
            <svg class="h-16 w-16 mx-auto text-white/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <p class="text-white/60 text-sm">Silakan pilih filter dan klik <span class="text-cyan-400 font-semibold">"Generate Laporan"</span> untuk melihat preview form.</p>
        </div>`;
    document.getElementById('suhuReportInfo').classList.add('hidden');
}

async function generateSuhuReport() {
    const dateFrom = document.getElementById('filterDateFrom').value;
    const dateTo = document.getElementById('filterDateTo').value;
    const user = document.getElementById('filterUser').value;
    
    if (!dateFrom || !dateTo) {
        showNotification('⚠️ Tanggal mulai dan akhir wajib diisi!', 'warning');
        return;
    }
    
    const preview = document.getElementById('suhuReportPreview');
    preview.innerHTML = `<div class="glass-card !p-10 text-center"><div class="spinner mx-auto"></div><p class="text-white/60 text-sm mt-3">Memuat data...</p></div>`;
    
    try {
        let query = window.supabaseClient
            .from('environment_readings')
            .select('*')
            .gte('created_at', dateFrom + 'T00:00:00')
            .lte('created_at', dateTo + 'T23:59:59')
            .order('created_at', { ascending: true });
        
        if (user) query = query.eq('user_name', user);
        
        const { data, error } = await query;
        if (error) throw error;
        
        const filteredData = data || [];
        
        if (filteredData.length === 0) {
            preview.innerHTML = `<div class="glass-card !p-10 text-center"><p class="text-white/60 text-sm">Tidak ada data untuk filter yang dipilih.</p></div>`;
            document.getElementById('suhuReportInfo').classList.add('hidden');
            return;
        }
        
        // Group by user
        const groupedByUser = {};
        filteredData.forEach(row => {
            const userName = row.user_name || 'Unknown';
            if (!groupedByUser[userName]) groupedByUser[userName] = [];
            groupedByUser[userName].push(row);
        });
        
        const uniqueUsers = Object.keys(groupedByUser);
        document.getElementById('suhuInfoTotal').textContent = filteredData.length;
        document.getElementById('suhuInfoUser').textContent = uniqueUsers.length;
        document.getElementById('suhuReportInfo').classList.remove('hidden');
        
        // Generate 1 halaman per user
        let allPagesHTML = '';
        uniqueUsers.forEach((userName, idx) => {
            allPagesHTML += buildSuhuFormPage(groupedByUser[userName], userName, idx + 1, uniqueUsers.length);
        });
        
        preview.innerHTML = allPagesHTML;
        
    } catch (error) {
        console.error("Gagal generate laporan suhu:", error);
        preview.innerHTML = `<div class="glass-card !p-10 text-center text-red-400">Gagal memuat data: ${error.message}</div>`;
    }
}

// Helper: bulatkan angka (22.0857 -> 22.1, 25 -> 25) tanpa ".0" berlebih
function fmtSuhu(v) {
    if (v === '' || v === null || v === undefined) return '';
    const n = parseFloat(v);
    if (isNaN(n)) return v;
    return (Math.round(n * 10) / 10).toString();
}

function buildSuhuFormPage(dataRows, userName, currentPage, totalPages) {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const firstDate = new Date(dataRows[0].created_at);
    const periodeStr = `${months[firstDate.getMonth()]} ${firstDate.getFullYear()}`;

    const TOTAL_ROWS = 31;
    const maxRows = Math.min(dataRows.length, TOTAL_ROWS);

    // ✅ URUTAN DATA DISINKRONKAN DENGAN HEADER:
    // No | DATE | Temp(deg C) | RH(%) | PIC Sign | Time of Checking | Remark
    let tableRows = '';
    for (let i = 0; i < TOTAL_ROWS; i++) {
        const row = dataRows[i];
        if (row) {
            const dateObj = new Date(row.created_at);
            const dateStr = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
            const temp = fmtSuhu(row.temperature);
            const rh = fmtSuhu(row.humidity);
            const pic = row.user_name || userName || '';
            const timeStr = row.submission_time || dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            const remark = row.notes || '';
            tableRows += `<tr>
                <td class="suhu-cell">${i + 1}</td>
                <td class="suhu-cell">${dateStr}</td>
                <td class="suhu-cell">${temp}</td>
                <td class="suhu-cell">${rh}</td>
                <td class="suhu-cell">${pic}</td>
                <td class="suhu-cell">${timeStr}</td>
                <td class="suhu-cell">${remark}</td>
            </tr>`;
        } else {
            tableRows += `<tr>
                <td class="suhu-cell">${i + 1}</td>
                <td class="suhu-cell"></td>
                <td class="suhu-cell"></td>
                <td class="suhu-cell"></td>
                <td class="suhu-cell"></td>
                <td class="suhu-cell"></td>
                <td class="suhu-cell"></td>
            </tr>`;
        }
    }

    return `
    <div class="print-page-suhu">
        <!-- HEADER FORM -->
        <div class="suhu-header-form">
            <div class="suhu-header-left">
                <div class="suhu-logo-box">
                    <div style="text-align:center">
                        <div style="font-size:20px;font-weight:900;color:#c00">UR</div>
                        <div style="font-size:8px">Universal<br>Robina</div>
                    </div>
                </div>
                <div class="suhu-company-info">
                    <div class="suhu-company-name">PT URC INDONESIA</div>
                    <div class="suhu-company-sub">A Company of<br>JG Summit Holdings</div>
                </div>
            </div>
            <div class="suhu-header-right">
                <table>
                    <tr><td class="suhu-label" colspan="3" style="font-weight:bold;font-size:9px">CONTROL SHEET MONITORING RH&TEMPERATURS</td></tr>
                    <tr><td class="suhu-label">PAGE NO</td><td colspan="2">${currentPage} OF ${totalPages}</td></tr>
                    <tr><td class="suhu-label">REV NO</td><td colspan="2">0</td></tr>
                </table>
            </div>
        </div>

        <div class="suhu-form-title">CONTROL SHEET MONITORING RH&TEMPERATURS</div>

        <!-- INFO -->
        <div class="suhu-info-box">
            <div class="suhu-info-row"><span class="suhu-info-label">Location :</span><span>WH-FG</span></div>
            <div class="suhu-info-row"><span class="suhu-info-label">Section :</span><span>STORAGE 1 (AREA POSM)</span></div>
            <div class="suhu-info-row"><span class="suhu-info-label">Periode :</span><span>${periodeStr}</span></div>
        </div>

        <!-- TABEL: 1 BARIS HEADER, TANPA MERGED "Time of Checking" -->
        <table class="suhu-table">
            <thead>
                <tr>
                    <th class="suhu-th">No</th>
                    <th class="suhu-th">DATE</th>
                    <th class="suhu-th">Temp(deg C)</th>
                    <th class="suhu-th">RH(%)</th>
                    <th class="suhu-th">PIC Sign</th>
                    <th class="suhu-th">Time of Checking</th>
                    <th class="suhu-th">Remark</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>

        <!-- FOOTER -->
        <div class="suhu-footer">
            <div class="suhu-footer-box">
                <p class="suhu-footer-label">Verified by</p>
                <div class="suhu-footer-space"></div>
                <p class="suhu-footer-name">SPV WHFG</p>
            </div>
        </div>
    </div>`;
}
