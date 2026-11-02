// ==========================================
// SCRIPT.JS - VERSI FINAL (BEBAS ERROR SYNTAX)
// ==========================================

let filteredReports = [];

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
    });

    // Inisialisasi AI Assistant
    setTimeout(() => {
        if (document.getElementById('aiAssistantBtn')) {
            initAiAssistant();
        }
    }, 1000);
});

// ==========================================
// 1. HALAMAN CHECKLIST
// ==========================================
function initChecklistPage(session) {
    console.log("📋 Memuat halaman Checklist...");

    // Update Tanggal
    const dateDisplay = document.getElementById('currentDate');
    if (dateDisplay) {
        dateDisplay.textContent = new Date().toLocaleDateString('id-ID', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    // Logika Checkbox
    const checkboxes = document.querySelectorAll('.glass-checkbox');
    const totalItems = checkboxes.length;
    const totalCountEl = document.getElementById('totalCount');
    const completedCountEl = document.getElementById('completedCount');
    const progressTextEl = document.getElementById('overallProgressText');
    const progressBarEl = document.getElementById('overallProgressBar');
    const statPendingEl = document.getElementById('statPending');

    if (totalCountEl) totalCountEl.textContent = totalItems;

    function updateProgress() {
        const completed = document.querySelectorAll('.glass-checkbox:checked').length;
        const percentage = totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0;
        if (completedCountEl) completedCountEl.textContent = completed;
        if (progressTextEl) progressTextEl.textContent = percentage + '%';
        if (progressBarEl) progressBarEl.style.width = percentage + '%';
        if (statPendingEl) statPendingEl.textContent = totalItems - completed;
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

    // Cek Batasan Harian
    checkDailySubmission(session.user.email);

    // Logika Tombol Kirim
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
                user_name: session.user.user_metadata?.full_name || session.user.email,
                user_email: session.user.email,
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
// 2. AI ASSISTANT (DENGAN PERBAIKAN KONTEKS USER)
// ==========================================
function initAiAssistant() {
    const modal = document.getElementById('aiChatModal');
    const panel = document.getElementById('aiChatPanel');
    const overlay = document.getElementById('aiChatOverlay');
    const closeBtn = document.getElementById('closeAiChat');
    const input = document.getElementById('aiChatInput');
    const sendBtn = document.getElementById('aiChatSend');
    const messagesContainer = document.getElementById('aiChatMessages');
    const aiBtn = document.getElementById('aiAssistantBtn');

    if (!modal || !aiBtn) return;

    aiBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        setTimeout(() => panel.classList.remove('translate-x-full'), 10);
        input.focus();
    });

    function closeModal() {
        panel.classList.add('translate-x-full');
        setTimeout(() => modal.classList.add('hidden'), 300);
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
            const answer = await getGroqResponse(question, context);
            removeTypingIndicator(typingId);
            addMessage(answer, 'ai');
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

    async function getFullSupabaseContext() {
        const supabase = window.supabaseClient;
        if (!supabase) return "Tidak ada koneksi database.";
        
        try {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            
            const todayStr = today.toISOString().split('T')[0];
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            const { count: todayCount } = await supabase.from('checklist_submissions').select('*', { count: 'exact', head: true }).gte('created_at', todayStr + 'T00:00:00');
            const { count: totalCount } = await supabase.from('checklist_submissions').select('*', { count: 'exact', head: true });
            const { count: completedCount } = await supabase.from('checklist_submissions').select('*', { count: 'exact', head: true }).eq('status', 'completed');
            
            const { count: yesterdayCount } = await supabase.from('checklist_submissions').select('*', { count: 'exact', head: true }).gte('created_at', yesterdayStr + 'T00:00:00').lte('created_at', yesterdayStr + 'T23:59:59');
            const { data: yesterdayDetails } = await supabase.from('checklist_submissions').select('user_name, progress_percentage, status, created_at').gte('created_at', yesterdayStr + 'T00:00:00').lte('created_at', yesterdayStr + 'T23:59:59');
            
            let yesterdayAvg = 0;
            if (yesterdayDetails && yesterdayDetails.length > 0) {
                const sum = yesterdayDetails.reduce((acc, curr) => acc + (curr.progress_percentage || 0), 0);
                yesterdayAvg = Math.round(sum / yesterdayDetails.length);
            }

            const { data: allSubmissions } = await supabase.from('checklist_submissions').select('progress_percentage');
            let avgProgress = 0;
            if (allSubmissions && allSubmissions.length > 0) {
                const sum = allSubmissions.reduce((acc, curr) => acc + (curr.progress_percentage || 0), 0);
                avgProgress = Math.round(sum / allSubmissions.length);
            }

            const { data: recent } = await supabase.from('checklist_submissions').select('user_name, progress_percentage, status, created_at, submission_time').order('created_at', { ascending: false }).limit(5);

            // Cek submission user yang sedang login HARI INI
            const currentUserEmail = window.currentUser?.email || '';
            const { data: myTodaySubmission, error: myError } = await supabase
                .from('checklist_submissions')
                .select('id, user_name, progress_percentage, status, submission_time, created_at')
                .eq('user_email', currentUserEmail)
                .gte('created_at', todayStr + 'T00:00:00')
                .lte('created_at', todayStr + 'T23:59:59')
                .order('created_at', { ascending: false })
                .limit(1);

            let hasSubmittedToday = false;
            let mySubmissionInfo = "User belum submit checklist hari ini.";
            
            if (!myError && myTodaySubmission && myTodaySubmission.length > 0) {
                hasSubmittedToday = true;
                const sub = myTodaySubmission[0];
                mySubmissionInfo = `✅ User ${sub.user_name || currentUserEmail} SUDAH submit checklist hari ini (${todayStr}) pada pukul ${sub.submission_time || new Date(sub.created_at).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})} dengan progress ${sub.progress_percentage}% dan status "${sub.status}".`;
            }

            // Cek submission user H-1
            const { data: myYesterdaySubmission } = await supabase
                .from('checklist_submissions')
                .select('user_name, progress_percentage, status, submission_time, created_at')
                .eq('user_email', currentUserEmail)
                .gte('created_at', yesterdayStr + 'T00:00:00')
                .lte('created_at', yesterdayStr + 'T23:59:59')
                .order('created_at', { ascending: false })
                .limit(1);

            let myYesterdayInfo = "User tidak ada submission kemarin.";
            if (myYesterdaySubmission && myYesterdaySubmission.length > 0) {
                const sub = myYesterdaySubmission[0];
                myYesterdayInfo = `Submission user kemarin (${yesterdayStr}): progress ${sub.progress_percentage}%, status "${sub.status}", jam ${sub.submission_time || '-'}.`;
            }

            return JSON.stringify({
                today_submissions: todayCount || 0,
                total_submissions: totalCount || 0,
                average_progress: avgProgress + '%',
                completed_submissions: completedCount || 0,
                recent_activity: recent || [],
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

    async function getGroqResponse(question, context) {
        if (!GROQ_API_KEY || GROQ_API_KEY === 'gsk_API_KEY_ANDA_DISINI') {
            return "⚠️ API Key Groq belum diatur di config.js.";
        }
        
        const systemPrompt = `Anda adalah AI Assistant cerdas untuk sistem "Gudang Clean". Jawab dalam bahasa Indonesia yang ramah, profesional, dan gunakan emoji. Maksimal 150 kata.

ATURAN PENTING:
1. Gunakan DATA KONTEKS di bawah ini untuk menjawab. JANGAN mengarang angka.
2. Untuk pertanyaan "sudah submit hari ini?" atau "apakah hari ini sudah isi checklist?", WAJIB cek field "has_submitted_today" dan "my_today_submission" di konteks. Jika has_submitted_today = true, jawab YA dan sebutkan jamnya.
3. Jika ditanya "kemarin" atau "H-1", gunakan "yesterday_date_str", "yesterday_submissions_count", "yesterday_avg_progress", dan "my_yesterday_submission".
4. Jika ditanya "user terbaik", analisis "recent_activity" atau "yesterday_details" untuk mencari progress_percentage tertinggi.

DATA KONTEKS DATABASE (JSON):
${context}`;

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                model: GROQ_MODEL, 
                messages: [
                    { role: 'system', content: systemPrompt }, 
                    { role: 'user', content: question }
                ], 
                temperature: 0.7, 
                max_tokens: 400 
            })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(`HTTP ${response.status}: ${err.error?.message || response.statusText}`);
        }
        const data = await response.json();
        return data.choices[0].message.content;
    }
}

// ==========================================
// 3. HALAMAN LAPORAN
// ==========================================
function initLaporanPage(session) {
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
    const filterFrom = document.getElementById('filterFrom');
    const filterTo = document.getElementById('filterTo');
    const from = filterFrom ? filterFrom.value : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const to = filterTo ? filterTo.value : new Date().toISOString().split('T')[0];
    const tableBody = document.getElementById('reportsTableBody');

    if (tableBody) tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-8"><div class="spinner mx-auto"></div><p class="text-white/50 mt-2">Memuat data...</p></td></tr>`;

    try {
        const { data, error } = await supabase.from('checklist_submissions').select('*').gte('created_at', from + 'T00:00:00').lte('created_at', to + 'T23:59:59').order('created_at', { ascending: false });
        if (error) throw error;
        filteredReports = data || [];
        renderReports(filteredReports);
        updateReportStats(filteredReports);
    } catch (error) {
        console.error("Error loading reports:", error);
        if (tableBody) tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-red-400 py-8">Gagal memuat data: ${error.message}</td></tr>`;
    }
}

function renderReports(reports) {
    const tableBody = document.getElementById('reportsTableBody');
    if (!tableBody) return;
    if (reports.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-white/50 py-8">Tidak ada laporan pada periode ini</td></tr>`;
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
        doc.save(`Laporan-Kebersihan-${from}-to-${to}.pdf`);
        showNotification('PDF berhasil diunduh! ✅', 'success');
    }
}

function downloadExcel() {
    if (filteredReports.length === 0 || typeof window.XLSX === 'undefined') return;
    const from = document.getElementById('filterFrom').value;
    const to = document.getElementById('filterTo').value;
    const data = filteredReports.map(r => ({
        'Tanggal': new Date(r.created_at).toLocaleDateString('id-ID'), 'Jam': r.submission_time || '-', 'User': r.user_name || '-',
        'Total Item': r.total_items || 0, 'Selesai': r.completed_items || 0, 'Progress': (r.progress_percentage || 0) + '%', 'Status': r.status === 'completed' ? 'Selesai' : 'Proses'
    }));
    const wb = window.XLSX.utils.book_new();
    const ws = window.XLSX.utils.json_to_sheet(data);
    window.XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
    window.XLSX.writeFile(wb, `Laporan-Kebersihan-${from}-to-${to}.xlsx`);
    showNotification('Excel berhasil diunduh! ✅', 'success');
}

// ==========================================
// 4. HALAMAN DASHBOARD
// ==========================================
async function initDashboardPage(session) {
    const welcomeEl = document.getElementById('welcomeUser');
    if (welcomeEl) {
        const name = session.user.user_metadata?.full_name || session.user.email.split('@')[0];
        welcomeEl.textContent = `Selamat Datang, ${name}! 👋`;
    }
    const { data, error } = await window.supabaseClient.from('checklist_submissions').select('*').order('created_at', { ascending: false }).limit(5);
    if (!error && data) {
        const tbody = document.querySelector('#recentActivityTable tbody');
        if (tbody) {
            if (data.length === 0) tbody.innerHTML = '<tr><td colspan="4" class="text-center py-6 text-white/50">Belum ada aktivitas checklist</td></tr>';
            else {
                tbody.innerHTML = data.map(row => {
                    const timeStr = row.submission_time || new Date(row.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                    const dateStr = new Date(row.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
                    return `<tr class="border-b border-white/5 hover:bg-white/5 transition">
                        <td class="px-4 py-3 text-sm">${row.user_name || 'User'}</td>
                        <td class="px-4 py-3 text-sm text-white/60">${dateStr} ${timeStr}</td>
                        <td class="px-4 py-3 text-sm font-semibold ${row.progress_percentage === 100 ? 'text-green-400' : 'text-amber-400'}">${row.progress_percentage}%</td>
                        <td class="px-4 py-3 text-sm"><span class="px-2 py-1 rounded-full text-xs ${row.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}">${row.status === 'completed' ? 'Selesai' : 'Proses'}</span></td>
                    </tr>`;
                }).join('');
            }
        }
    }
}

// ==========================================
// 5. LOGIN & REGISTER
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
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
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
// 6. UTILS & GLOBAL LOGOUT
// ==========================================
document.addEventListener('click', async function(event) {
    const logoutBtn = event.target.closest('#logoutBtn');
    if (logoutBtn) {
        event.preventDefault();
        if (!confirm('Yakin ingin keluar dari akun?')) return;
        const supabase = window.supabaseClient;
        if (supabase) {
            try {
                await supabase.auth.signOut();
                localStorage.removeItem('gudang_clean_state');
                window.location.replace('index.html');
            } catch (error) {
                console.error("Error logout:", error);
            }
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
