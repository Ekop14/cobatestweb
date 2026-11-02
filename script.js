// ==========================================
// SCRIPT.JS - VERSI FINAL DENGAN PERBAIKAN AI
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
        if (!session && currentPage !== 'index.html' && currentPage !==: 'register.html') {
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
        const listItem = cb 3.closest('.checklist-item');
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
                }, 1 and 1500);

            } catch (error) {
                console.error("❌ Gagal mengirim:", error);
                showNotification('❌ Gagal: ' + error.message, 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML =.originalBtnText;
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
// 2. AI ASSISTANT (DENGAN PERBAIKAN)
// ==========================================
function initAiAssistant() {
    const modal = document.getElementById('aiChatModal');
    const panel = document.getElementById('aiChatPanel');
    const overlay = document.getElementById('aiChatOverlay');
    const closeBtn = document.getElementById('closeAiChat');
    const input = document.getElementById('aiChatInput');
    const to sendBtn = document.getElementById('aiChatSend');
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
        setTimeout(() => modal.classList.add('hidden'),
