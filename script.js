/* ============================================
   GLOBAL & SIDEBAR LOADER (Berjalan di Semua Halaman)
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    loadSidebar();
    updateCurrentDate();
    
    if (document.getElementById('loginForm')) initLoginPage();
    if (document.getElementById('registerForm')) initRegisterPage();
    if (document.getElementById('checklistGrid')) initChecklistPage();
    if (document.getElementById('reportsTableBody')) initLaporanPage();
    if (document.getElementById('dashboardUserName')) initDashboardPage();
});

function updateCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const today = new Date().toLocaleDateString('id-ID', options);
        dateElement.textContent = today;
    }
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
        updateSidebarUserInfo();
        setupCategoryFilter();
        
        // Panggil AI Assistant setelah sidebar selesai dimuat
        initAiAssistant();
    } catch (error) {
        console.error('Error loading sidebar:', error);
        slot.innerHTML = '<div class="p-6 text-red-400 text-sm">Gagal memuat menu.</div>';
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
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-item').forEach(link => {
        link.classList.remove('active', 'bg-white/10', 'text-white', 'border', 'border-white/10', 'shadow-lg');
        link.classList.add('text-white/70');
        const page = link.getAttribute('data-page');
        if (page === currentPage) {
            link.classList.add('active', 'bg-white/10', 'text-white', 'border', 'border-white/10', 'shadow-lg');
            link.classList.remove('text-white/70');
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

function updateSidebarUserInfo() {
    if (window.currentUser) {
        const nameEl = document.getElementById('sidebarUserName');
        const emailEl = document.getElementById('sidebarUserEmail');
        const avatarEl = document.getElementById('userAvatar');
        if (nameEl) nameEl.textContent = window.currentUser.name || 'User';
        if (emailEl) emailEl.textContent = window.currentUser.email || 'user@email.com';
        if (avatarEl) avatarEl.textContent = (window.currentUser.name || 'U').charAt(0).toUpperCase();
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
                const show = btn.dataset.category === 'all' || card.dataset.category === btn.dataset.category;
                card.classList.toggle('hidden-card', !show);
            });
        });
    });
}

function updateSidebarProgress() {
    const allCheckboxes = document.querySelectorAll('.checklist-card .glass-checkbox');
    if (allCheckboxes.length === 0) return;
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

/* ============================================
   HALAMAN LOGIN & REGISTER
   ============================================ */
function initLoginPage() {
    const supabase = window.supabaseClient;
    if (!supabase) return;
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');
    const loginForm = document.getElementById('loginForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');

    togglePassword?.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        eyeIcon.innerHTML = type === 'text' 
            ? '<path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />' 
            : '<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />';
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = passwordInput.value;
        if (!email || !password) { showNotification('Email dan password harus diisi', 'error'); return; }
        submitBtn.disabled = true; btnText.innerText = 'Memproses...';
        const spinner = document.createElement('div'); spinner.className = 'spinner'; submitBtn.appendChild(spinner);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            showNotification('Login berhasil!', 'success');
            setTimeout(() => { window.location.replace('checklist.html'); }, 1000);
        } catch (error) {
            showNotification(error.message || 'Login gagal.', 'error');
            submitBtn.disabled = false; btnText.innerText = 'Masuk'; if (spinner.parentNode) spinner.remove();
        }
    });
}

function initRegisterPage() {
    const supabase = window.supabaseClient;
    if (!supabase) return;
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');
    const registerForm = document.getElementById('registerForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');

    togglePassword?.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        eyeIcon.innerHTML = type === 'text' 
            ? '<path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />' 
            : '<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />';
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = passwordInput.value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        if (!fullName || !email || !password || !confirmPassword) { showNotification('Semua field harus diisi', 'error'); return; }
        if (password !== confirmPassword) { showNotification('Password tidak cocok', 'error'); return; }
        if (password.length < 6) { showNotification('Password minimal 6 karakter', 'error'); return; }
        submitBtn.disabled = true; btnText.innerText = 'Mendaftar...';
        const spinner = document.createElement('div'); spinner.className = 'spinner'; submitBtn.appendChild(spinner);
        try {
            const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
            if (error) throw error;
            showNotification('Registrasi berhasil! Silakan login.', 'success');
            setTimeout(() => { window.location.replace('index.html'); }, 2000);
        } catch (error) {
            let message = error.message.includes('already registered') ? 'Email sudah terdaftar.' : error.message;
            showNotification(message || 'Registrasi gagal', 'error');
            submitBtn.disabled = false; btnText.innerText = 'Daftar Sekarang'; if (spinner.parentNode) spinner.remove();
        }
    });
}

/* ============================================
   HALAMAN CHECKLIST
   ============================================ */
function initChecklistPage() {
    const supabase = window.supabaseClient;
    if (!supabase) return;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (!session) { window.location.replace('index.html'); return; }
        let userName = session.user.user_metadata?.full_name;
        if (!userName) {
            try {
                const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', session.user.id).single();
                if (profile) userName = profile.full_name;
            } catch (e) {}
        }
        window.currentUser = { name: userName || 'User', email: session.user.email };
        updateSidebarUserInfo();
        initChecklistLogic();
    });
}

function initChecklistLogic() {
    const supabase = window.supabaseClient;
    const checklistCards = document.querySelectorAll('.checklist-card');
    const allCheckboxes = document.querySelectorAll('.checklist-card .glass-checkbox');
    const resetAllBtn = document.getElementById('resetAllBtn');
    const submitChecklistBtn = document.getElementById('submitChecklistBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const searchInput = document.getElementById('searchInput');

    // ===== FITUR: 1 USER = 1 SUBMISSION PER HARI =====
    async function checkDailySubmission() {
        const today = new Date().toISOString().split('T')[0];
        const todayStart = today + 'T00:00:00';
        const todayEnd = today + 'T23:59:59';

        try {
            const { data, error } = await supabase
                .from('checklist_submissions')
                .select('id, created_at, progress_percentage')
                .eq('user_email', window.currentUser.email)
                .gte('created_at', todayStart)
                .lte('created_at', todayEnd)
                .order('created_at', { ascending: false })
                .limit(1);

            if (error) throw error;

            if (data && data.length > 0) {
                disableSubmitButton(data[0]);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error checking daily submission:', error);
            return false;
        }
    }

    function disableSubmitButton(lastSubmission) {
        if (submitChecklistBtn) {
            submitChecklistBtn.disabled = true;
            submitChecklistBtn.classList.add('opacity-50', 'cursor-not-allowed');
            submitChecklistBtn.innerHTML = `
                <span>✅ Sudah Submit Hari Ini</span>
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            `;
        }
        const infoBox = document.getElementById('dailySubmissionInfo');
        if (infoBox) infoBox.classList.remove('hidden');
    }

    function enableSubmitButton() {
        if (submitChecklistBtn) {
            submitChecklistBtn.disabled = false;
            submitChecklistBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            submitChecklistBtn.innerHTML = `
                <span>Kirim Laporan</span>
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
            `;
        }
    }

    // Jalankan pengecekan saat halaman load
    checkDailySubmission();

    searchInput?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        checklistCards.forEach(card => {
            let hasMatch = false;
            card.querySelectorAll('.checklist-text').forEach(item => {
                const match = item.textContent.toLowerCase().includes(query);
                item.parentElement.style.display = query && !match ? 'none' : '';
                if (match) hasMatch = true;
            });
            card.classList.toggle('hidden-card', query && !hasMatch);
        });
    });

    allCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            checkbox.closest('.checklist-item').classList.toggle('completed', checkbox.checked);
            updateProgress();
            saveToLocalStorage();
        });
    });

    resetAllBtn?.addEventListener('click', () => {
        if (!confirm('Reset semua checklist?')) return;
        allCheckboxes.forEach(cb => {
            cb.checked = false;
            cb.closest('.checklist-item').classList.remove('completed');
        });
        updateProgress();
        localStorage.removeItem('gudang_clean_state');
        showNotification('Checklist direset', 'info');
    });

    async function saveToSupabase(data) {
        try {
            // Double check sebelum insert
            const today = new Date().toISOString().split('T')[0];
            const todayStart = today + 'T00:00:00';
            const todayEnd = today + 'T23:59:59';

            const { data: existing, error: checkError } = await supabase
                .from('checklist_submissions')
                .select('id')
                .eq('user_email', window.currentUser.email)
                .gte('created_at', todayStart)
                .lte('created_at', todayEnd)
                .limit(1);

            if (checkError) throw checkError;

            if (existing && existing.length > 0) {
                showNotification('Anda sudah submit checklist hari ini!', 'warning');
                disableSubmitButton(existing[0]);
                return null;
            }

            const { data: submission, error } = await supabase
                .from('checklist_submissions')
                .insert({
                    user_name: window.currentUser.name,
                    user_email: window.currentUser.email,
                    floor_items: data.floor,
                    rack_items: data.rack,
                    dock_items: data.dock,
                    facility_items: data.facility,
                    total_items: data.total,
                    completed_items: data.completed,
                    progress_percentage: data.progress,
                    status: data.progress === 100 ? 'completed' : 'in_progress'
                })
                .select()
                .single();

            if (error) throw error;
            return submission;
        } catch (error) {
            showNotification('Gagal simpan: ' + error.message, 'error');
            return null;
        }
    }

    submitChecklistBtn?.addEventListener('click', async () => {
        const total = allCheckboxes.length;
        const completed = document.querySelectorAll('.checklist-card .glass-checkbox:checked').length;
        
        if (completed < total) {
            showNotification(`Selesaikan semua tugas (${completed}/${total})`, 'warning');
            return;
        }

        const checklistData = {
            floor: Array.from(document.querySelectorAll('[data-card="floor"]')).map(cb => ({ task: cb.nextElementSibling.textContent, checked: cb.checked })),
            rack: Array.from(document.querySelectorAll('[data-card="rack"]')).map(cb => ({ task: cb.nextElementSibling.textContent, checked: cb.checked })),
            dock: Array.from(document.querySelectorAll('[data-card="dock"]')).map(cb => ({ task: cb.nextElementSibling.textContent, checked: cb.checked })),
            facility: Array.from(document.querySelectorAll('[data-card="facility"]')).map(cb => ({ task: cb.nextElementSibling.textContent, checked: cb.checked })),
            total, completed, progress: 100
        };

        const result = await saveToSupabase(checklistData);
        
        if (result) {
            showNotification('Laporan terkirim! ✅', 'success');
            disableSubmitButton(result);
            
            setTimeout(() => {
                allCheckboxes.forEach(cb => { 
                    cb.checked = false; 
                    cb.closest('.checklist-item').classList.remove('completed'); 
                });
                updateProgress();
                localStorage.removeItem('gudang_clean_state');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 1500);
        }
    });

    logoutBtn?.addEventListener('click', async (e) => {
        e.preventDefault();
        if (!confirm('Yakin ingin keluar dari akun?')) return;
        if (supabase) await supabase.auth.signOut();
        window.location.replace('index.html');
    });

    loadFromLocalStorage();
    updateProgress();
}

function updateProgress() {
    const allCheckboxes = document.querySelectorAll('.checklist-card .glass-checkbox');
    const total = allCheckboxes.length;
    const checked = document.querySelectorAll('.checklist-card .glass-checkbox:checked').length;
    const percent = total ? Math.round((checked / total) * 100) : 0;

    if (document.getElementById('overallProgressBar')) document.getElementById('overallProgressBar').style.width = percent + '%';
    if (document.getElementById('overallProgressText')) document.getElementById('overallProgressText').textContent = percent + '%';
    if (document.getElementById('completedCount')) document.getElementById('completedCount').textContent = checked;
    if (document.getElementById('totalCount')) document.getElementById('totalCount').textContent = total;
    if (document.getElementById('statTotal')) document.getElementById('statTotal').textContent = total;
    if (document.getElementById('statCompleted')) document.getElementById('statCompleted').textContent = checked;
    if (document.getElementById('statPending')) document.getElementById('statPending').textContent = total - checked;
    if (document.getElementById('statProgress')) document.getElementById('statProgress').textContent = percent + '%';

    ['floor', 'rack', 'dock', 'facility'].forEach(cat => {
        const card = document.querySelector(`.checklist-card[data-category="${cat}"]`);
        if (card) {
            const t = card.querySelectorAll('.glass-checkbox').length;
            const c = card.querySelectorAll('.glass-checkbox:checked').length;
            const fill = card.querySelector('.card-progress-fill');
            if (fill) fill.style.width = t ? (c / t * 100) + '%' : '0%';
        }
    });
    if (typeof updateSidebarProgress === 'function') updateSidebarProgress();
}

function saveToLocalStorage() {
    const state = {};
    document.querySelectorAll('.checklist-card .glass-checkbox').forEach((cb, i) => state[`cb_${i}`] = cb.checked);
    localStorage.setItem('gudang_clean_state', JSON.stringify(state));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('gudang_clean_state');
    if (!saved) return;
    try {
        const state = JSON.parse(saved);
        document.querySelectorAll('.checklist-card .glass-checkbox').forEach((cb, i) => {
            if (state[`cb_${i}`]) {
                cb.checked = true;
                cb.closest('.checklist-item').classList.add('completed');
            }
        });
        updateProgress();
    } catch (e) {}
}

/* ============================================
   HALAMAN LAPORAN
   ============================================ */
let filteredReports = [];
function initLaporanPage() {
    const supabase = window.supabaseClient;
    if (!supabase) return;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (!session) { window.location.replace('index.html'); return; }
        let userName = session.user.user_metadata?.full_name;
        if (!userName) {
            try {
                const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', session.user.id).single();
                if (profile) userName = profile.full_name;
            } catch (e) {}
        }
        window.currentUser = { name: userName || 'User', email: session.user.email };
        updateSidebarUserInfo();

        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        document.getElementById('filterFrom').value = thirtyDaysAgo.toISOString().split('T')[0];
        document.getElementById('filterTo').value = today.toISOString().split('T')[0];
        await loadReports();

        document.getElementById('applyFilterBtn').addEventListener('click', loadReports);
        document.getElementById('downloadPdfBtn').addEventListener('click', downloadPDF);
        document.getElementById('downloadExcelBtn').addEventListener('click', downloadExcel);

        const logoutBtn = document.getElementById('logoutBtn');
        logoutBtn?.addEventListener('click', async (e) => {
            e.preventDefault();
            if (!confirm('Yakin ingin keluar dari akun?')) return;
            await supabase.auth.signOut();
            window.location.replace('index.html');
        });
    });
}

async function loadReports() {
    const supabase = window.supabaseClient;
    const from = document.getElementById('filterFrom').value;
    const to = document.getElementById('filterTo').value;
    const tableBody = document.getElementById('reportsTableBody');
    const pdfBtn = document.getElementById('downloadPdfBtn');
    const excelBtn = document.getElementById('downloadExcelBtn');

    tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-8"><div class="spinner mx-auto"></div></td></tr>`;
    pdfBtn.disabled = true; excelBtn.disabled = true;

    try {
        const { data, error } = await supabase.from('checklist_submissions')
            .select('*')
            .gte('created_at', from + 'T00:00:00')
            .lte('created_at', to + 'T23:59:59')
            .order('created_at', { ascending: false });
        if (error) throw error;
        filteredReports = data || [];
        renderReports(filteredReports);
        updateReportStats(filteredReports);
        document.getElementById('reportCountText').textContent = `Menampilkan ${filteredReports.length} laporan`;
        pdfBtn.disabled = filteredReports.length === 0;
        excelBtn.disabled = filteredReports.length === 0;
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-red-400 py-8">Gagal memuat: ${error.message}</td></tr>`;
    }
}

function renderReports(reports) {
    const tableBody = document.getElementById('reportsTableBody');
    if (reports.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-white/50 py-8">Tidak ada laporan</td></tr>`;
        return;
    }
    tableBody.innerHTML = reports.map(r => {
        const date = new Date(r.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
        const statusColor = r.status === 'completed' ? 'bg-green-500/20 text-green-300' : 'bg-amber-500/20 text-amber-300';
        const progressColor = r.progress_percentage === 100 ? 'text-green-400' : r.progress_percentage >= 50 ? 'text-amber-400' : 'text-red-400';
        return `<tr>
            <td class="px-4 py-3 text-sm">${date}</td>
            <td class="px-4 py-3 text-sm">${r.user_name || '-'}</td>
            <td class="px-4 py-3 text-sm text-center">${r.total_items || 0}</td>
            <td class="px-4 py-3 text-sm text-center">${r.completed_items || 0}</td>
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
    if (document.getElementById('statTotalReports')) document.getElementById('statTotalReports').textContent = total;
    if (document.getElementById('statCompletedReports')) document.getElementById('statCompletedReports').textContent = completed;
    if (document.getElementById('statAvgProgress')) document.getElementById('statAvgProgress').textContent = avg + '%';
    if (document.getElementById('statActiveUsers')) document.getElementById('statActiveUsers').textContent = users;
}

function downloadPDF() {
    if (filteredReports.length === 0) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const from = document.getElementById('filterFrom').value;
    const to = document.getElementById('filterTo').value;
    doc.setFontSize(18); doc.text('Laporan Kebersihan Gudang', 14, 20);
    doc.setFontSize(10); doc.text(`Periode: ${from} s/d ${to}`, 14, 28);
    doc.autoTable({
        startY: 35,
        head: [['Tanggal', 'User', 'Total', 'Selesai', 'Progress', 'Status']],
        body: filteredReports.map(r => [new Date(r.created_at).toLocaleDateString('id-ID'), r.user_name, r.total_items, r.completed_items, r.progress_percentage + '%', r.status === 'completed' ? 'Selesai' : 'Proses']),
        theme: 'grid',
        headStyles: { fillColor: [102, 126, 234] }
    });
    doc.save(`Laporan-${from}-to-${to}.pdf`);
    showNotification('PDF diunduh! ✅', 'success');
}

function downloadExcel() {
    if (filteredReports.length === 0) return;
    const from = document.getElementById('filterFrom').value;
    const to = document.getElementById('filterTo').value;
    const data = filteredReports.map(r => ({
        'Tanggal': new Date(r.created_at).toLocaleDateString('id-ID'),
        'User': r.user_name,
        'Total': r.total_items,
        'Selesai': r.completed_items,
        'Progress': r.progress_percentage + '%',
        'Status': r.status === 'completed' ? 'Selesai' : 'Proses'
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
    XLSX.writeFile(wb, `Laporan-${from}-to-${to}.xlsx`);
    showNotification('Excel diunduh! ✅', 'success');
}

/* ============================================
   HALAMAN DASHBOARD
   ============================================ */
function initDashboardPage() {
    const supabase = window.supabaseClient;
    if (!supabase) return;
    
    supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (!session) { window.location.replace('index.html'); return; }
        
        let userName = session.user.user_metadata?.full_name;
        if (!userName) {
            try {
                const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', session.user.id).single();
                if (profile) userName = profile.full_name;
            } catch (e) { console.error("Gagal mengambil profil:", e); }
        }
        
        window.currentUser = { name: userName || 'User', email: session.user.email };
        const nameEl = document.getElementById('dashboardUserName');
        if (nameEl) nameEl.textContent = window.currentUser.name;
        
        updateSidebarUserInfo();
        loadDashboardStats();
    });

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (!confirm('Yakin ingin keluar dari akun?')) return;
            const supabase = window.supabaseClient;
            if (supabase) await supabase.auth.signOut();
            window.location.replace('index.html');
        });
    }
}

async function loadDashboardStats() {
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

        const elTotal = document.getElementById('statTotalLaporan');
        const elAvg = document.getElementById('statAvgProgress');
        const elToday = document.getElementById('statTodayLaporan');
        
        if (elTotal) elTotal.textContent = totalLaporan || 0;
        if (elAvg) elAvg.textContent = avgProgress + '%';
        if (elToday) elToday.textContent = todayLaporan || 0;
        
        const { data: recent } = await supabase.from('checklist_submissions')
            .select('user_name, progress_percentage, created_at, status')
            .order('created_at', { ascending: false })
            .limit(5);
            
        renderRecentActivity(recent || []);
    } catch (error) {
        console.error("Dashboard load error:", error);
        const tbody = document.getElementById('recentActivityBody');
        if (tbody) tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-red-400">Gagal memuat data.</td></tr>`;
    }
}

function renderRecentActivity(data) {
    const tbody = document.getElementById('recentActivityBody');
    if (!tbody) return;
    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-white/50">Belum ada aktivitas checklist</td></tr>`;
        return;
    }
    tbody.innerHTML = data.map(r => {
        const date = new Date(r.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
        const statusColor = r.status === 'completed' ? 'text-green-400' : 'text-amber-400';
        const badgeClass = r.status === 'completed' ? 'bg-green-500/20 text-green-300' : 'bg-amber-500/20 text-amber-300';
        return `<tr>
            <td class="px-4 py-3 text-sm">${r.user_name || 'User'}</td>
            <td class="px-4 py-3 text-sm text-white/70">${date}</td>
            <td class="px-4 py-3 text-sm font-semibold text-center ${statusColor}">${r.progress_percentage}%</td>
            <td class="px-4 py-3 text-center"><span class="px-2 py-1 rounded-full text-xs font-medium ${badgeClass}">${r.status === 'completed' ? 'Selesai' : 'Proses'}</span></td>
        </tr>`;
    }).join('');
}

/* ============================================
   UTILS
   ============================================ */
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
    el.innerHTML = `<div class="flex items-center gap-3">
        <svg class="h-5 w-5" style="color: ${c.icon}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="${type === 'success' ? 'M5 13l4 4L19 7' : type === 'error' ? 'M6 18L18 6M6 6l12 12' : 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'}" />
        </svg>
        <span>${message}</span>
    </div>`;
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

/* ============================================
   AI ASSISTANT (Dengan Rekap H-1)
   ============================================ */
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
        setTimeout(() => { panel.classList.remove('translate-x-full'); }, 10);
        input.focus();
    });

    function closeModal() {
        panel.classList.add('translate-x-full');
        setTimeout(() => { modal.classList.add('hidden'); }, 300);
    }

    closeBtn?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', closeModal);

    document.querySelectorAll('.quick-action').forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.textContent.replace(/^[^\s]+\s/, '');
            input.value = text;
            handleAiSend();
        });
    });

    input?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAiSend();
    });

    sendBtn?.addEventListener('click', handleAiSend);

    async function handleAiSend() {
        const question = input.value.trim();
        if (!question) return;

        addMessage(question, 'user');
        input.value = '';
        sendBtn.disabled = true;

        const typingId = addTypingIndicator();

        try {
            const context = await getSupabaseContext();
            const answer = await getAiResponse(question, context);
            
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
            ? `<div class="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                 <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                   <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                 </svg>
               </div>`
            : `<div class="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                 <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                   <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                 </svg>
               </div>`;

        const bubbleClass = sender === 'user'
            ? 'bg-blue-500/20 border border-blue-500/30 rounded-2xl rounded-tr-none'
            : (isError ? 'bg-red-500/20 border border-red-500/30 rounded-2xl rounded-tl-none' : 'bg-white/5 border border-white/10 rounded-2xl rounded-tl-none');

        div.innerHTML = `
            ${avatar}
            <div class="flex-1 ${bubbleClass} p-4">
                <p class="text-white text-sm whitespace-pre-wrap">${text}</p>
            </div>
        `;
        messagesContainer.appendChild(div);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function addTypingIndicator() {
        const id = 'typing-' + Date.now();
        const div = document.createElement('div');
        div.id = id;
        div.className = 'flex gap-3';
        div.innerHTML = `
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
            </div>
            <div class="flex-1 bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-4">
                <div class="flex gap-1">
                    <div class="w-2 h-2 bg-white/50 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                    <div class="w-2 h-2 bg-white/50 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                    <div class="w-2 h-2 bg-white/50 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                </div>
            </div>
        `;
        messagesContainer.appendChild(div);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return id;
    }

    function removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    async function getSupabaseContext() {
        const supabase = window.supabaseClient;
        if (!supabase) return 'Tidak ada koneksi database';

        try {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            
            const todayStr = today.toISOString().split('T')[0];
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            
            const yesterdayStart = yesterdayStr + 'T00:00:00';
            const yesterdayEnd = yesterdayStr + 'T23:59:59';

            const { count: todayCount } = await supabase.from('checklist_submissions').select('*', { count: 'exact', head: true }).gte('created_at', todayStr + 'T00:00:00');
            const { count: totalCount } = await supabase.from('checklist_submissions').select('*', { count: 'exact', head: true });
            
            // Data H-1 (Kemarin)
            const { count: yesterdayCount } = await supabase.from('checklist_submissions').select('*', { count: 'exact', head: true }).gte('created_at', yesterdayStart).lte('created_at', yesterdayEnd);
            const { data: yesterdayDetails } = await supabase.from('checklist_submissions').select('user_name, progress_percentage, status, created_at').gte('created_at', yesterdayStart).lte('created_at', yesterdayEnd);
            
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

            const { count: completedCount } = await supabase.from('checklist_submissions').select('*', { count: 'exact', head: true }).eq('status', 'completed');
            const { data: recent } = await supabase.from('checklist_submissions').select('user_name, progress_percentage, status, created_at').order('created_at', { ascending: false }).limit(5);

            return JSON.stringify({
                today_submissions: todayCount || 0,
                total_submissions: totalCount || 0,
                average_progress: avgProgress + '%',
                completed_submissions: completedCount || 0,
                recent_activity: recent || [],
                
                // Data H-1
                yesterday_date_str: yesterday.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                yesterday_submissions_count: yesterdayCount || 0,
                yesterday_avg_progress: yesterdayAvg + '%',
                yesterday_details: yesterdayDetails || [],
                
                current_user: window.currentUser?.name || 'User',
                current_date: today.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
            }, null, 2);
        } catch (error) {
            return 'Error mengambil data: ' + error.message;
        }
    }

    async function getAiResponse(question, context) {
        if (typeof GROQ_API_KEY === 'undefined' || !GROQ_API_KEY || GROQ_API_KEY === 'gsk_your_api_key_here') {
            return getRuleBasedResponse(question, context);
        }

        const systemPrompt = `Anda adalah AI Assistant untuk sistem "Gudang Clean". 
Jawab dalam bahasa Indonesia yang ramah, profesional, dan gunakan emoji. Maksimal 150 kata.

ATURAN KHUSUS:
- Jika user meminta "rekap H-1", "rekap kemarin", atau "laporan kemarin", WAJIB gunakan data dari variabel "yesterday_date_str", "yesterday_submissions_count", dan "yesterday_avg_progress" untuk membuat ringkasan yang detail.
- Sebutkan tanggal kemarinya secara eksplisit (contoh: "Berikut rekap untuk hari Minggu, 31 Oktober 2026:").

DATA DATABASE TERKINI:
${context}`;

        try {
            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: GROQ_MODEL,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: question }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(`HTTP ${response.status}: ${errData.error?.message || response.statusText}`);
            }
            
            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error("🔴 Groq API Error Detail:", error);
            throw new Error('Gagal menghubungi AI: ' + error.message);
        }
    }

    function getRuleBasedResponse(question, context) {
        try {
            const data = JSON.parse(context);
            const q = question.toLowerCase();

            // Rekap H-1 (Fallback)
            if (q.includes('h-1') || q.includes('kemarin') || q.includes('rekap kemarin')) {
                return `📅 **Rekap Laporan H-1 (${data.yesterday_date_str})**\n\n` +
                       `• Total laporan masuk: **${data.yesterday_submissions_count}**\n` +
                       `• Rata-rata progress tim: **${data.yesterday_avg_progress}**\n\n` +
                       `💡 *Data ini diambil otomatis dari sistem untuk evaluasi harian.*`;
            }

            if (q.includes('ringkasan') || q.includes('hari ini')) {
                return `📊 **Ringkasan Hari Ini (${data.current_date})**\n\n• Total laporan: **${data.today_submissions}**\n• Rata-rata progress: **${data.average_progress}**\n• Laporan selesai: **${data.completed_submissions}**`;
            }

            if (q.includes('progress') || q.includes('rata-rata')) {
                return `📈 Rata-rata progress semua laporan: **${data.average_progress}**. Dari ${data.total_submissions} total laporan, ${data.completed_submissions} sudah selesai.`;
            }

            if (q.includes('user') || q.includes('terbaik')) {
                const recent = data.recent_activity || [];
                if (recent.length === 0) return '🏆 Belum ada data aktivitas.';
                const topUser = recent.reduce((acc, curr) => (curr.progress_percentage || 0) > (acc.progress_percentage || 0) ? curr : acc);
                return `🏆 User terbaik: **${topUser.user_name}** dengan progress **${topUser.progress_percentage}%**.`;
            }

            return `🤖 Saya bisa bantu:\n• "Ringkasan hari ini"\n• "Rekap H-1 (kemarin)"\n• "Progress rata-rata"\n• "User terbaik"`;
        } catch (error) {
            return `🤖 Halo! Saya AI Assistant Gudang Clean. Silakan tanyakan tentang laporan atau progress checklist.`;
        }
    }
}
