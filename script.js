// ==========================================
// SCRIPT.JS - VERSI FINAL (AI BACA SEMUA DATA: CHECKLIST + LINGKUNGAN)
// ==========================================

let filteredReports = [];
window.currentUser = window.currentUser || { name: 'User', email: 'user@example.com' };

document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 Script berhasil dimuat");

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const supabase = window.supabaseClient;

    if (!supabase) {
        console.error("❌ Supabase client tidak ditemukan. Pastikan config.js dimuat.");
        return;
    }

    // Cek Sesi & Routing Halaman
    supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (!session && currentPage !== 'index.html' && currentPage !== 'register.html') {
            window.location.replace('index.html');
            return;
        }
        if (session && (currentPage === 'index.html' || currentPage === 'register.html')) {
            window.location.replace('checklist.html');
            return;
        }

        if (currentPage === 'laporan.html') initLaporanPage(session);
        else if (currentPage === 'index.html') initLoginPage();
        else if (currentPage === 'register.html') initRegisterPage();
        else if (currentPage === 'dashboard.html') initDashboardPage(session);
        else if (currentPage === 'checklist.html') initChecklistPage(session);
        else if (currentPage === 'lingkungan.html') initEnvironmentPage(session);
    });

    // Inisialisasi AI Assistant (tunggu sidebar/HTML siap)
    setTimeout(() => {
        if (document.getElementById('aiFloatingBtn') || document.getElementById('aiAssistantBtn')) {
            initAiAssistant();
        }
    }, 1000);
});

// ==========================================
// FUNGSI UPDATE SIDEBAR
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
        const html = await response.text();
        slot.innerHTML = html;
        
        highlightActiveMenu();
        setupSidebarToggle();
        setupSidebarNavigation();
        setupCategoryFilter();
        
        updateSidebarUserInfo();
        updateSidebarProgress();
    } catch (error) {
        console.error('Error loading sidebar:', error);
    }
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
    // Gunakan pathname (lebih aman, mengabaikan ?query string di belakang URL)
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(link => {
        // 1. Reset semua class styling dulu agar bersih
        link.classList.remove('active', 'bg-white/10', 'text-white', 'border', 'border-white/10', 'shadow-lg', 'menu-disabled');
        link.classList.add('text-white/70');

        // 2. Cek apakah link ini mengarah ke halaman checklist
        const href = link.getAttribute('href') || '';
        const isChecklistLink = href.includes('checklist.html');

        // 3. Cek apakah kita SEDANG BERADA di halaman checklist (aman untuk URL dengan ?query)
        const isCurrentlyOnChecklist = currentPath.includes('checklist.html');

        // 4. LOGIKA UTAMA:
        if (isCurrentlyOnChecklist) {
            // JIKA SEDANG DI HALAMAN CHECKLIST: Menu checklist AKTIF & bisa diklik
            if (isChecklistLink) {
                link.classList.remove('text-white/70');
                link.classList.add('text-white');
                
                // Beri highlight khusus (background & border) pada menu yang persis sedang dibuka
                if (href === currentPath || (currentPath.endsWith('checklist.html') && href.includes('checklist.html'))) {
                    link.classList.add('active', 'bg-white/10', 'text-white', 'border', 'border-white/10', 'shadow-lg');
                }
            }
        } else {
            // JIKA DI HALAMAN LAIN (Dashboard, Laporan, dll): Menu checklist NON-AKTIF (abu-abu)
            if (isChecklistLink) {
                link.classList.add('menu-disabled');
            }
        }
    });
}

function setupSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');
    const overlay = document.getElementById('sidebarOverlay');
    if (toggle && sidebar) {
        toggle.addEventListener('click', () => {
            sidebar.classList.add('open');
            if (overlay) overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    if (overlay && sidebar) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
}

function setupCategoryFilter() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const checklistCards = document.querySelectorAll('.checklist-card');
    if (categoryButtons.length === 0) return;
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryButtons.forEach(b => {
                b.classList.remove('active', 'bg-white/10', 'text-white', 'border', 'border-white/10');
                b.classList.add('text-white/60');
            });
            btn.classList.add('active', 'bg-white/10', 'text-white', 'border', 'border-white/10');
            btn.classList.remove('text-white/60');
            checklistCards.forEach(card => {
                card.classList.toggle('hidden-card', btn.dataset.category !== 'all' && card.dataset.category !== btn.dataset.category);
            });
        });
    });
}

// ==========================================
// 1. HALAMAN CHECKLIST
// ==========================================
function initChecklistPage(session) {
    window.currentUser = {
        name: session.user.user_metadata?.full_name || session.user.email || 'User',
        email: session.user.email
    };

    const dateDisplay = document.getElementById('currentDate');
    if (dateDisplay) {
        dateDisplay.textContent = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    loadSidebar();

    const checkboxes = document.querySelectorAll('.glass-checkbox');
    const totalItems = checkboxes.length;
    const totalCountEl = document.getElementById('totalCount');
    const completedCountEl = document.getElementById('completedCount');
    const progressTextEl = document.getElementById('overallProgressText');
    const progressBarEl = document.getElementById('overallProgressBar');
    const statPendingEl = document.getElementById('statPending');
    const statTotalEl = document.getElementById('statTotal');
    const statCompletedEl = document.getElementById('statCompleted');
    const statProgressEl = document.getElementById('statProgress');

    if (totalCountEl) totalCountEl.textContent = totalItems;
    if (statTotalEl) statTotalEl.textContent = totalItems;

    function updateProgress() {
        const completed = document.querySelectorAll('.glass-checkbox:checked').length;
        const percentage = totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0;
        if (completedCountEl) completedCountEl.textContent = completed;
        if (statCompletedEl) statCompletedEl.textContent = completed;
        if (progressTextEl) progressTextEl.textContent = percentage + '%';
        if (statProgressEl) statProgressEl.textContent = percentage + '%';
        if (progressBarEl) progressBarEl.style.width = percentage + '%';
        if (statPendingEl) statPendingEl.textContent = totalItems - completed;
        updateSidebarProgress();
    }

    checkboxes.forEach(cb => cb.addEventListener('change', () => {
        const listItem = cb.closest('.checklist-item');
        if (listItem) {
            if (cb.checked) listItem.classList.add('completed');
            else listItem.classList.remove('completed');
        }
        updateProgress();
    }));
    
    updateProgress();
    checkDailySubmission(session.user.email);

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
        const { data, error } = await window.supabaseClient
            .from('checklist_submissions')
            .select('id, submission_time, created_at')
            .eq('user_email', userEmail)
            .gte('created_at', `${today}T00:00:00`)
            .lte('created_at', `${today}T23:59:59`)
            .limit(1);
        if (error) throw error;
        if (data && data.length > 0) disableSubmitButtonUI(data[0]);
    } catch (error) {
        console.error("Gagal cek submission harian:", error);
    }
}

function disableSubmitButtonUI(submission) {
    const btn = document.getElementById('submitChecklistBtn');
    const infoBox = document.getElementById('dailySubmissionInfo');
    const timeDisplay = document.getElementById('submissionTimeDisplay');
    if (btn) {
        btn.disabled = true;
        btn.classList.add('opacity-50', 'cursor-not-allowed');
        btn.innerHTML = '<span>✅ Sudah Submit Hari Ini</span>';
    }
    if (infoBox) infoBox.classList.remove('hidden');
    if (timeDisplay) {
        timeDisplay.textContent = submission.submission_time || new Date(submission.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    }
}

// ==========================================
// 2. AI ASSISTANT (DENGAN AKSES FULL DATABASE: CHECKLIST + LINGKUNGAN)
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

    aiBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        setTimeout(() => panel.classList.remove('translate-x-full'), 10);
        input.focus();
    });

    function closeModal() {
        panel.classList.add('translate-x-full');
        setTimeout(() => { 
            modal.classList.add('hidden');
            chatHistory = [];
        }, 300);
    }
    closeBtn?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', closeModal);

    document.querySelectorAll('.quick-action').forEach(btn => {
        btn.addEventListener('click', () => {
            input.value = btn.textContent.replace(/^[^\s]+\s/, '').trim();
            handleAiSend();
        });
    });

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
        } finally {
            sendBtn.disabled = false;
        }
    }

    function addMessage(text, sender, isError = false) {
        const div = document.createElement('div');
        div.className = 'flex gap-3 ' + (sender === 'user' ? 'flex-row-reverse' : '');
        const avatar = sender === 'user' 
            ? `<div class="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0"><svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>`
            : `<div class="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0"><svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg></div>`;
        const bubbleClass = sender === 'user' ? 'bg-blue-500/20 border border-blue-500/30 rounded-2xl rounded-tr-none' : (isError ? 'bg-red-500/20 border border-red-500/30 rounded-2xl rounded-tl-none' : 'bg-white/5 border border-white/10 rounded-2xl rounded-tl-none');
        div.innerHTML = `${avatar}<div class="flex-1 ${bubbleClass} p-4"><p class="text-white text-sm whitespace-pre-wrap">${text}</p></div>`;
        messagesContainer.appendChild(div);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function addTypingIndicator() {
        const id = 'typing-' + Date.now();
        const div = document.createElement('div');
        div.id = id;
        div.className = 'flex gap-3';
        div.innerHTML = `<div class="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0"><svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg></div><div class="flex-1 bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-4"><div class="flex gap-1"><div class="w-2 h-2 bg-white/50 rounded-full animate-bounce" style="animation-delay: 0ms"></div><div class="w-2 h-2 bg-white/50 rounded-full animate-bounce" style="animation-delay: 150ms"></div><div class="w-2 h-2 bg-white/50 rounded-full animate-bounce" style="animation-delay: 300ms"></div></div></div>`;
        messagesContainer.appendChild(div);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return id;
    }

    function removeTypingIndicator(id) { 
        const el = document.getElementById(id); 
        if (el) el.remove(); 
    }

    async function executeDeleteSubmission(submissionId, reason) {
        const supabase = window.supabaseClient;
        try {
            const isConfirmed = confirm(`⚠️ KONFIRMASI KEAMANAN\n\nAI meminta izin untuk MENGHAPUS data submission.\nID: ${submissionId}\nAlasan: ${reason}\n\nLanjutkan?`);
            if (!isConfirmed) return "Penghapusan dibatalkan.";
            const { error } = await supabase.from('checklist_submissions').delete().eq('id', submissionId);
            if (error) throw error;
            return `Berhasil! Data ID ${submissionId} telah dihapus.`;
        } catch (error) {
            return `Gagal: ${error.message}`;
        }
    }

    // ✅ FUNGSI INI SUDAH DIUPDATE UNTUK MENGAMBIL DATA LINGKUNGAN
    async function getFullSupabaseContext() {
        const supabase = window.supabaseClient;
        if (!supabase) return "Tidak ada koneksi database.";
        try {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            const todayStr = today.toISOString().split('T')[0];
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            // 1. Data Checklist
            const { count: todayCount } = await supabase.from('checklist_submissions').select('*', { count: 'exact', head: true }).gte('created_at', todayStr + 'T00:00:00');
            const { count: totalCount } = await supabase.from('checklist_submissions').select('*', { count: 'exact', head: true });
            const { count: completedCount } = await supabase.from('checklist_submissions').select('*', { count: 'exact', head: true }).eq('status', 'completed');
            const { count: yesterdayCount } = await supabase.from('checklist_submissions').select('*', { count: 'exact', head: true }).gte('created_at', yesterdayStr + 'T00:00:00').lte('created_at', yesterdayStr + 'T23:59:59');
            const { data: yesterdayDetails } = await supabase.from('checklist_submissions').select('id, user_name, progress_percentage, status, created_at, submission_time').gte('created_at', yesterdayStr + 'T00:00:00').lte('created_at', yesterdayStr + 'T23:59:59');
            
            let yesterdayAvg = 0;
            if (yesterdayDetails && yesterdayDetails.length > 0) {
                yesterdayAvg = Math.round(yesterdayDetails.reduce((acc, curr) => acc + (curr.progress_percentage || 0), 0) / yesterdayDetails.length);
            }
            const { data: allSubmissions } = await supabase.from('checklist_submissions').select('progress_percentage');
            let avgProgress = 0;
            if (allSubmissions && allSubmissions.length > 0) {
                avgProgress = Math.round(allSubmissions.reduce((acc, curr) => acc + (curr.progress_percentage || 0), 0) / allSubmissions.length);
            }
            const { data: recent } = await supabase.from('checklist_submissions').select('id, user_name, progress_percentage, status, created_at, submission_time').order('created_at', { ascending: false }).limit(5);

            // 2. Data Lingkungan (BARU: Agar AI bisa baca suhu & kelembapan)
            const { data: recentEnvironment } = await supabase
                .from('environment_readings')
                .select('user_name, temperature, humidity, notes, submission_time, created_at')
                .order('created_at', { ascending: false })
                .limit(5);

            // 3. Data User Saat Ini
            const currentUserEmail = window.currentUser?.email || '';
            const { data: myTodaySubmission } = await supabase.from('checklist_submissions').select('id, user_name, progress_percentage, status, submission_time, created_at').eq('user_email', currentUserEmail).gte('created_at', todayStr + 'T00:00:00').lte('created_at', todayStr + 'T23:59:59').order('created_at', { ascending: false }).limit(1);

            let hasSubmittedToday = false;
            let mySubmissionInfo = "User belum submit checklist hari ini.";
            if (myTodaySubmission && myTodaySubmission.length > 0) {
                hasSubmittedToday = true;
                const sub = myTodaySubmission[0];
                mySubmissionInfo = `✅ User ${sub.user_name || currentUserEmail} SUDAH submit checklist hari ini (${todayStr}) pukul ${sub.submission_time || '-'} dengan progress ${sub.progress_percentage}%. ID: ${sub.id}`;
            }

            const { data: myYesterdaySubmission } = await supabase.from('checklist_submissions').select('id, user_name, progress_percentage, status, submission_time, created_at').eq('user_email', currentUserEmail).gte('created_at', yesterdayStr + 'T00:00:00').lte('created_at', yesterdayStr + 'T23:59:59').order('created_at', { ascending: false }).limit(1);
            let myYesterdayInfo = "User tidak ada submission kemarin.";
            if (myYesterdaySubmission && myYesterdaySubmission.length > 0) {
                const sub = myYesterdaySubmission[0];
                myYesterdayInfo = `Submission kemarin (${yesterdayStr}): ID ${sub.id}, progress ${sub.progress_percentage}%, jam ${sub.submission_time || '-'}.`;
            }

            // 4. Gabungkan Semua Data ke dalam JSON
            return JSON.stringify({
                today_submissions: todayCount || 0, 
                total_submissions: totalCount || 0, 
                average_progress: avgProgress + '%', 
                completed_submissions: completedCount || 0, 
                recent_activity: recent || [],
                
                // Data Lingkungan (BARU)
                recent_environment_readings: recentEnvironment || [],

                yesterday_date_str: yesterday.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), 
                yesterday_submissions_count: yesterdayCount || 0, 
                yesterday_avg_progress: yesterdayAvg + '%', 
                yesterday_details: yesterdayDetails || [],
                
                current_user: window.currentUser?.name || 'User', 
                current_user_email: currentUserEmail, 
                current_date: today.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                has_submitted_today: hasSubmittedToday, 
                my_today_submission: mySubmissionInfo, 
                my_yesterday_submission: myYesterdayInfo
            }, null, 2);
        } catch (error) {
            return 'Error mengambil data: ' + error.message;
        }
    }

    // ✅ SYSTEM PROMPT DIUPDATE AGAR AI TAHU CARA PAKAI DATA LINGKUNGAN
    async function getGroqResponse(history, context) {
        if (!GROQ_API_KEY || GROQ_API_KEY === 'gsk_API_KEY_ANDA_DISINI') return "⚠️ API Key Groq belum diatur.";
        
        const systemPrompt = `Anda adalah AI Assistant "Gudang Clean". Jawab ramah, profesional, pakai emoji. Maks 150 kata.
ATURAN: 
1. Gunakan DATA KONTEKS di bawah ini. JANGAN mengarang angka.
2. Anda memiliki akses ke data checklist DAN data lingkungan (suhu, kelembapan). Jika ditanya tentang suhu/kelembapan, gunakan data "recent_environment_readings".
3. Ingat riwayat chat. 
4. Jika diminta hapus data, pakai tool 'delete_submission'. 
5. Cek 'has_submitted_today' untuk status checklist hari ini.
DATA KONTEKS:\n${context}`;

        const tools = [{
            type: "function",
            function: {
                name: "delete_submission",
                description: "Hapus data submission berdasarkan ID.",
                parameters: { type: "object", properties: { submission_id: { type: "string" }, reason: { type: "string" } }, required: ["submission_id", "reason"] }
            }
        }];

        try {
            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: GROQ_MODEL, messages: [{ role: 'system', content: systemPrompt }, ...history], tools: tools, tool_choice: "auto" })
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            const message = data.choices[0].message;

            if (message.tool_calls && message.tool_calls.length > 0) {
                const toolCall = message.tool_calls[0];
                history.push(message);
                if (toolCall.function.name === "delete_submission") {
                    const args = JSON.parse(toolCall.function.arguments);
                    const result = await executeDeleteSubmission(args.submission_id, args.reason);
                    history.push({ role: "tool", tool_call_id: toolCall.id, content: result });
                    const finalRes = await fetch(GROQ_API_URL, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ model: GROQ_MODEL, messages: [{ role: 'system', content: systemPrompt }, ...history] })
                    });
                    const finalData = await finalRes.json();
                    return finalData.choices[0].message.content;
                }
            }
            return message.content;
        } catch (error) {
            throw new Error('Gagal menghubungi AI: ' + error.message);
        }
    }
}

// ==========================================
// 3. HALAMAN LAPORAN
// ==========================================
function initLaporanPage(session) {
    window.currentUser = { name: session.user.user_metadata?.full_name || session.user.email || 'User', email: session.user.email };
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const filterFrom = document.getElementById('filterFrom');
    const filterTo = document.getElementById('filterTo');
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
    if (tableBody) tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-8"><div class="spinner mx-auto"></div></td></tr>`;
    try {
        const { data, error } = await supabase.from('checklist_submissions').select('*').gte('created_at', from + 'T00:00:00').lte('created_at', to + 'T23:59:59').order('created_at', { ascending: false });
        if (error) throw error;
        filteredReports = data || [];
        renderReports(filteredReports);
        updateReportStats(filteredReports);
    } catch (error) {
        if (tableBody) tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-red-400 py-8">Gagal: ${error.message}</td></tr>`;
    }
}

function renderReports(reports) {
    const tableBody = document.getElementById('reportsTableBody');
    if (!tableBody) return;
    if (reports.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-white/50 py-8">Tidak ada laporan</td></tr>`;
        return;
    }
    tableBody.innerHTML = reports.map(r => {
        const date = new Date(r.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
        const time = r.submission_time || new Date(r.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const statusColor = r.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400';
        const progressColor = r.progress_percentage === 100 ? 'text-green-400' : (r.progress_percentage >= 50 ? 'text-amber-400' : 'text-red-400');
        return `<tr>
            <td class="px-4 py-3 text-sm">${date}</td>
            <td class="px-4 py-3 text-sm font-mono text-white/70">${time}</td>
            <td class="px-4 py-3 text-sm">${r.user_name || '-'}</td>
            <td class="px-4 py-3 text-sm text-center">${r.total_items || 0}</td>
            <td class="px-4 py-3 text-sm text-center text-green-400 font-medium">${r.completed_items || 0}</td>
            <td class="px-4 py-3 text-sm font-semibold text-center ${progressColor}">${r.progress_percentage || 0}%</td>
            <td class="px-4 py-3 text-center"><span class="px-2 py-1 rounded-full text-xs font-medium ${statusColor}">${r.status === 'completed' ? 'Selesai' : 'Proses'}</span></td>
        </tr>`;
    }).join('');
}

function updateReportStats(reports) {
    const total = reports.length;
    const completed = reports.filter(r => r.status === 'completed').length;
    const avg = total > 0 ? Math.round(reports.reduce((s, r) => s + (r.progress_percentage || 0), 0) / total) : 0;
    const users = new Set(reports.map(r => r.user_email)).size;
    const elTotal = document.getElementById('statTotalReports');
    const elCompleted = document.getElementById('statCompletedReports');
    const elAvg = document.getElementById('statAvgProgress');
    const elUsers = document.getElementById('statActiveUsers');
    if (elTotal) elTotal.textContent = total;
    if (elCompleted) elCompleted.textContent = completed;
    if (elAvg) elAvg.textContent = avg + '%';
    if (elUsers) elUsers.textContent = users;
}

function downloadPDF() {
    if (filteredReports.length === 0 || typeof window.jspdf === 'undefined') return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const from = document.getElementById('filterFrom').value;
    const to = document.getElementById('filterTo').value;
    doc.setFontSize(18); doc.text('Laporan Kebersihan Gudang', 14, 20);
    doc.setFontSize(10); doc.text(`Periode: ${from} s/d ${to}`, 14, 28);
    if (typeof doc.autoTable === 'function') {
        doc.autoTable({
            startY: 35, head: [['Tanggal', 'Jam', 'User', 'Total', 'Selesai', 'Progress', 'Status']],
            body: filteredReports.map(r => [new Date(r.created_at).toLocaleDateString('id-ID'), r.submission_time || '-', r.user_name || '-', r.total_items || 0, r.completed_items || 0, (r.progress_percentage || 0) + '%', r.status === 'completed' ? 'Selesai' : 'Proses']),
            theme: 'grid', headStyles: { fillColor: [102, 126, 234] }
        });
        doc.save(`Laporan-${from}-to-${to}.pdf`);
        showNotification('PDF diunduh! ✅', 'success');
    }
}

function downloadExcel() {
    if (filteredReports.length === 0 || typeof window.XLSX === 'undefined') return;
    const from = document.getElementById('filterFrom').value;
    const to = document.getElementById('filterTo').value;
    const data = filteredReports.map(r => ({ 'Tanggal': new Date(r.created_at).toLocaleDateString('id-ID'), 'Jam': r.submission_time || '-', 'User': r.user_name || '-', 'Total': r.total_items || 0, 'Selesai': r.completed_items || 0, 'Progress': (r.progress_percentage || 0) + '%', 'Status': r.status === 'completed' ? 'Selesai' : 'Proses' }));
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, window.XLSX.utils.json_to_sheet(data), 'Laporan');
    window.XLSX.writeFile(wb, `Laporan-${from}-to-${to}.xlsx`);
    showNotification('Excel diunduh! ✅', 'success');
}

// ==========================================
// 4. HALAMAN DASHBOARD
// ==========================================
async function initDashboardPage(session) {
    console.log("📊 Memuat halaman Dashboard...");
    
    window.currentUser = { 
        name: session.user.user_metadata?.full_name || session.user.email || 'User', 
        email: session.user.email 
    };
    
    const nameEl = document.getElementById('dashboardUserName');
    if (nameEl) {
        nameEl.textContent = session.user.user_metadata?.full_name || session.user.email.split('@')[0] || 'User';
    }
    
    loadSidebar();
    updateDashboardStats();
    loadDashboardEnvironmentHistory();
    
    const tbody = document.getElementById('recentActivityBody');
    if (!tbody) {
        console.error("❌ Element #recentActivityBody tidak ditemukan di dashboard.html!");
        return;
    }
    
    tbody.innerHTML = '<tr><td colspan="4" class="text-center py-8"><div class="spinner mx-auto"></div><p class="text-white/50 mt-2">Memuat data...</p></td></tr>';
    
    try {
        const { data, error } = await window.supabaseClient
            .from('checklist_submissions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center py-6 text-white/50">Belum ada aktivitas checklist</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.map(row => {
            const timeStr = row.submission_time || new Date(row.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            const dateStr = new Date(row.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
            const statusColor = row.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400';
            const progressColor = row.progress_percentage === 100 ? 'text-green-400' : (row.progress_percentage >= 50 ? 'text-amber-400' : 'text-red-400');
            
            return `<tr class="border-b border-white/5 hover:bg-white/5 transition">
                <td class="px-4 py-3 text-sm">${row.user_name || 'User'}</td>
                <td class="px-4 py-3 text-sm text-white/60">${dateStr} ${timeStr}</td>
                <td class="px-4 py-3 text-sm font-semibold text-center ${progressColor}">${row.progress_percentage}%</td>
                <td class="px-4 py-3 text-center"><span class="px-2 py-1 rounded-full text-xs font-medium ${statusColor}">${row.status === 'completed' ? 'Selesai' : 'Proses'}</span></td>
            </tr>`;
        }).join('');
        
    } catch (error) {
        console.error("❌ Error memuat aktivitas dashboard:", error);
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-red-400">Gagal memuat: ${error.message}</td></tr>`;
    }
}

async function updateDashboardStats() {
    const supabase = window.supabaseClient;
    try {
        const { count: totalLaporan } = await supabase.from('checklist_submissions').select('*', { count: 'exact', head: true });
        
        const { data: submissions } = await supabase.from('checklist_submissions').select('progress_percentage');
        let avgProgress = 0;
        if (submissions && submissions.length > 0) {
            const sum = submissions.reduce((acc, curr) => acc + (curr.progress_percentage || 0), 0);
            avgProgress = Math.round(sum / submissions.length);
        }
        
        const today = new Date().toISOString().split('T')[0];
        const { count: todayLaporan } = await supabase.from('checklist_submissions').select('*', { count: 'exact', head: true }).gte('created_at', today + 'T00:00:00');
        
        const { data: allSubs } = await supabase.from('checklist_submissions').select('user_email');
        const activeUsers = allSubs ? new Set(allSubs.map(r => r.user_email)).size : 0;

        const elTotal = document.getElementById('statTotalLaporan');
        const elAvg = document.getElementById('statAvgProgress');
        const elToday = document.getElementById('statTodayLaporan');
        const elUsers = document.getElementById('statActiveUsers');
        
        if (elTotal) elTotal.textContent = totalLaporan || 0;
        if (elAvg) elAvg.textContent = avgProgress + '%';
        if (elToday) elToday.textContent = todayLaporan || 0;
        if (elUsers) elUsers.textContent = activeUsers;
        
    } catch (error) {
        console.error("❌ Error memuat statistik dashboard:", error);
    }
}

async function loadDashboardEnvironmentHistory() {
    const tbody = document.getElementById('dashboardEnvironmentBody');
    if (!tbody) return;

    try {
        const { data, error } = await window.supabaseClient
            .from('environment_readings')
            .select('temperature, humidity, submission_time, created_at')
            .order('created_at', { ascending: false })
            .limit(4);

        if (error) throw error;

        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center py-6 text-white/50 text-sm">Belum ada data</td></tr>';
            return;
        }

        tbody.innerHTML = data.map(row => {
            const timeStr = row.submission_time || new Date(row.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            const dateStr = new Date(row.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
            
            const tempStatus = (row.temperature >= 20 && row.temperature <= 27) ? 'text-green-400' : 'text-amber-400';
            const humStatus = (row.humidity >= 50 && row.humidity <= 70) ? 'text-green-400' : 'text-amber-400';
            
            return `<tr class="border-b border-white/5 hover:bg-white/5 transition">
                <td class="px-4 py-3 text-sm text-white/60">${dateStr}<br><span class="text-xs">${timeStr}</span></td>
                <td class="px-4 py-3 text-sm text-center font-semibold ${tempStatus}">${row.temperature}°C</td>
                <td class="px-4 py-3 text-sm text-center font-semibold ${humStatus}">${row.humidity}%</td>
            </tr>`;
        }).join('');

    } catch (error) {
        console.error("❌ Error memuat data lingkungan dashboard:", error);
        tbody.innerHTML = `<tr><td colspan="3" class="text-center py-6 text-red-400 text-sm">Gagal memuat</td></tr>`;
    }
}

// ==========================================
// 5. HALAMAN LINGKUNGAN
// ==========================================
function initEnvironmentPage(session) {
    console.log("🌡️ Memuat halaman Lingkungan...");
    
    window.currentUser = {
        name: session.user.user_metadata?.full_name || session.user.email || 'User',
        email: session.user.email
    };

    const dateDisplay = document.getElementById('currentDate');
    if (dateDisplay) {
        dateDisplay.textContent = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    loadSidebar();
    checkEnvironmentSubmission(session.user.email);
    loadEnvironmentHistory();

    const form = document.getElementById('environmentForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitEnvironmentBtn');
            if (submitBtn.disabled) return;

            const temperature = parseFloat(document.getElementById('temperature').value);
            const humidity = parseFloat(document.getElementById('humidity').value);
            const notes = document.getElementById('notes').value.trim();

            if (isNaN(temperature) || isNaN(humidity)) {
                showNotification('Suhu dan kelembapan harus diisi!', 'warning');
                return;
            }

            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px;"></div> Menyimpan...';

            const environmentData = {
                user_name: window.currentUser.name,
                user_email: window.currentUser.email,
                temperature: temperature,
                humidity: humidity,
                notes: notes || null,
                submission_time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            };

            try {
                const { error } = await window.supabaseClient
                    .from('environment_readings')
                    .insert([environmentData]);
                
                if (error) throw error;

                showNotification('✅ Data lingkungan berhasil disimpan!', 'success');
                disableEnvironmentButton(environmentData);

                setTimeout(() => {
                    form.reset();
                    loadEnvironmentHistory();
                }, 1500);

            } catch (error) {
                console.error("❌ Gagal menyimpan:", error);
                showNotification('❌ Gagal: ' + error.message, 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }
}

async function checkEnvironmentSubmission(userEmail) {
    const today = new Date().toISOString().split('T')[0];
    try {
        const { data, error } = await window.supabaseClient
            .from('environment_readings')
            .select('id, submission_time, created_at')
            .eq('user_email', userEmail)
            .gte('created_at', `${today}T00:00:00`)
            .lte('created_at', `${today}T23:59:59`)
            .limit(1);
        
        if (error) throw error;
        if (data && data.length > 0) disableEnvironmentButton(data[0]);
    } catch (error) {
        console.error("Gagal cek submission lingkungan:", error);
    }
}

function disableEnvironmentButton(submission) {
    const btn = document.getElementById('submitEnvironmentBtn');
    const infoBox = document.getElementById('dailySubmissionInfo');
    const timeDisplay = document.getElementById('submissionTimeDisplay');
    
    if (btn) {
        btn.disabled = true;
        btn.classList.add('opacity-50', 'cursor-not-allowed');
        btn.innerHTML = '<span>✅ Sudah Submit Hari Ini</span>';
    }
    if (infoBox) infoBox.classList.remove('hidden');
    if (timeDisplay) {
        timeDisplay.textContent = submission.submission_time || new Date(submission.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    }
}

async function loadEnvironmentHistory() {
    const tbody = document.getElementById('environmentHistoryBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="4" class="text-center py-8"><div class="spinner mx-auto"></div></td></tr>';

    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

        const { data, error } = await window.supabaseClient
            .from('environment_readings')
            .select('*')
            .gte('created_at', sevenDaysAgoStr + 'T00:00:00')
            .order('created_at', { ascending: false })
            .limit(7);

        if (error) throw error;

        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-white/50">Belum ada riwayat data</td></tr>';
            return;
        }

        tbody.innerHTML = data.map(row => {
            const date = new Date(row.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
            const tempStatus = row.temperature >= 20 && row.temperature <= 27 ? 'text-green-400' : 'text-amber-400';
            const humStatus = row.humidity >= 50 && row.humidity <= 70 ? 'text-green-400' : 'text-amber-400';
            
            return `<tr class="border-b border-white/5 hover:bg-white/5 transition">
                <td class="px-4 py-3 text-sm">${date}</td>
                <td class="px-4 py-3 text-sm text-center font-semibold ${tempStatus}">${row.temperature}°C</td>
                <td class="px-4 py-3 text-sm text-center font-semibold ${humStatus}">${row.humidity}%</td>
                <td class="px-4 py-3 text-sm text-white/60">${row.notes || '-'}</td>
            </tr>`;
        }).join('');

    } catch (error) {
        console.error("Error loading environment history:", error);
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-red-400">Gagal memuat: ${error.message}</td></tr>`;
    }
}

// ==========================================
// 6. LOGIN & REGISTER
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
            if (error) {
                showNotification("Login gagal: " + error.message, 'error');
                submitBtn.disabled = false;
                btnText.textContent = 'Masuk';
            } else {
                showNotification('Login berhasil!', 'success');
                setTimeout(() => window.location.replace('checklist.html'), 1000);
            }
        });
    }
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            passwordInput.setAttribute('type', passwordInput.getAttribute('type') === 'password' ? 'text' : 'password');
        });
    }
}

function initRegisterPage() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const submitBtn = document.getElementById('submitBtn');
            const btnText = document.getElementById('btnText');
            submitBtn.disabled = true;
            btnText.textContent = 'Mendaftar...';
            const { error } = await window.supabaseClient.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
            if (error) {
                showNotification("Registrasi gagal: " + error.message, 'error');
                submitBtn.disabled = false;
                btnText.textContent = 'Daftar';
            } else {
                showNotification('Registrasi berhasil! Silakan login.', 'success');
                setTimeout(() => window.location.replace('index.html'), 2000);
            }
        });
    }
}

// ==========================================
// 7. UTILS & GLOBAL LOGOUT
// ==========================================
document.addEventListener('click', async function(event) {
    const logoutBtn = event.target.closest('#logoutBtn');
    if (logoutBtn) {
        event.preventDefault();
        if (!confirm('Yakin ingin keluar?')) return;
        try {
            await window.supabaseClient.auth.signOut();
            localStorage.removeItem('gudang_clean_state');
            window.location.replace('index.html');
        } catch (error) {
            console.error("Error logout:", error);
        }
    }
});

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
    setTimeout(() => {
        el.style.animation = 'slideOut 0.4s ease forwards';
        setTimeout(() => el.remove(), 400);
    }, 3000);
}

if (!document.getElementById('notif-styles')) {
    const s = document.createElement('style');
    s.id = 'notif-styles';
    s.textContent = `@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }`;
    document.head.appendChild(s);
}
