document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('loginForm')) initLoginPage();
    if (document.getElementById('registerForm')) initRegisterPage();
    if (document.getElementById('checklistGrid')) initChecklistPage();
    if (document.getElementById('reportsTableBody')) initLaporanPage();
});

/* ============================================
   HALAMAN LOGIN
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
        eyeIcon.innerHTML = type === 'text' ? '<path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />' : '<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />';
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

/* ============================================
   HALAMAN REGISTER
   ============================================ */
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
        eyeIcon.innerHTML = type === 'text' ? '<path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />' : '<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />';
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
        if (!userName) { try { const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', session.user.id).single(); if (profile) userName = profile.full_name; } catch (e) {} }
        window.currentUser = { name: userName || 'User', email: session.user.email };
        updateSidebarUI();
        initChecklistLogic();
    });
}

function initChecklistLogic() {
    // PERBAIKAN: Deklarasikan supabase di sini agar bisa diakses saat logout
    const supabase = window.supabaseClient; 
    
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const checklistCards = document.querySelectorAll('.checklist-card');
    const allCheckboxes = document.querySelectorAll('.checklist-card .glass-checkbox');
    const resetAllBtn = document.getElementById('resetAllBtn');
    const submitChecklistBtn = document.getElementById('submitChecklistBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const searchInput = document.getElementById('searchInput');

    sidebarToggle?.addEventListener('click', () => { sidebar.classList.add('open'); sidebarOverlay.classList.add('active'); document.body.style.overflow = 'hidden'; });
    const closeSidebar = () => { sidebar.classList.remove('open'); sidebarOverlay.classList.remove('active'); document.body.style.overflow = ''; };
    sidebarOverlay?.addEventListener('click', closeSidebar);
    
    document.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', () => { if (window.innerWidth < 1024) closeSidebar(); });
    });

    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryButtons.forEach(b => b.classList.remove('active')); btn.classList.add('active');
            checklistCards.forEach(card => { card.classList.toggle('hidden-card', btn.dataset.category !== 'all' && card.dataset.category !== btn.dataset.category); });
        });
    });

    searchInput?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        checklistCards.forEach(card => {
            let hasMatch = false;
            card.querySelectorAll('.checklist-text').forEach(item => {
                const match = item.textContent.toLowerCase().includes(query);
                item.parentElement.style.display = query && !match ? 'none' : ''; if (match) hasMatch = true;
            });
            card.classList.toggle('hidden-card', query && !hasMatch);
        });
    });

    allCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            checkbox.closest('.checklist-item').classList.toggle('completed', checkbox.checked);
            updateProgress(); saveToLocalStorage();
        });
    });

    resetAllBtn?.addEventListener('click', () => {
        if (!confirm('Reset semua checklist?')) return;
        allCheckboxes.forEach(cb => { cb.checked = false; cb.closest('.checklist-item').classList.remove('completed'); });
        updateProgress(); localStorage.removeItem('gudang_clean_state'); showNotification('Checklist direset', 'info');
    });

    async function saveToSupabase(data) {
        try {
            const { data: submission, error } = await supabase.from('checklist_submissions').insert({ user_name: window.currentUser.name, user_email: window.currentUser.email, floor_items: data.floor, rack_items: data.rack, dock_items: data.dock, facility_items: data.facility, total_items: data.total, completed_items: data.completed, progress_percentage: data.progress, status: data.progress === 100 ? 'completed' : 'in_progress' }).select().single();
            if (error) throw error; return submission;
        } catch (error) { showNotification('Gagal simpan: ' + error.message, 'error'); return null; }
    }

    submitChecklistBtn?.addEventListener('click', async () => {
        const total = allCheckboxes.length; const completed = document.querySelectorAll('.checklist-card .glass-checkbox:checked').length;
        if (completed < total) { showNotification(`Selesaikan semua tugas (${completed}/${total})`, 'warning'); return; }
        const checklistData = { floor: Array.from(document.querySelectorAll('[data-card="floor"]')).map(cb => ({ task: cb.nextElementSibling.textContent, checked: cb.checked })), rack: Array.from(document.querySelectorAll('[data-card="rack"]')).map(cb => ({ task: cb.nextElementSibling.textContent, checked: cb.checked })), dock: Array.from(document.querySelectorAll('[data-card="dock"]')).map(cb => ({ task: cb.nextElementSibling.textContent, checked: cb.checked })), facility: Array.from(document.querySelectorAll('[data-card="facility"]')).map(cb => ({ task: cb.nextElementSibling.textContent, checked: cb.checked })), total, completed, progress: 100 };
        const result = await saveToSupabase(checklistData);
        if (result) {
            showNotification('Laporan terkirim! ✅', 'success');
            setTimeout(() => { allCheckboxes.forEach(cb => { cb.checked = false; cb.closest('.checklist-item').classList.remove('completed'); }); updateProgress(); localStorage.removeItem('gudang_clean_state'); window.scrollTo({ top: 0, behavior: 'smooth' }); }, 1500);
        }
    });

    // PERBAIKAN: Menggunakan window.location.replace agar tidak bisa di-back
    logoutBtn?.addEventListener('click', async (e) => {
        e.preventDefault(); 
        if (!confirm('Yakin ingin keluar dari akun?')) return;
        
        if (supabase) {
            await supabase.auth.signOut();
        }
        // replace() mencegah user kembali ke halaman checklist dengan tombol "Back" browser
        window.location.replace('index.html'); 
    });

    loadFromLocalStorage(); updateProgress();
}

function updateProgress() {
    const allCheckboxes = document.querySelectorAll('.checklist-card .glass-checkbox');
    const total = allCheckboxes.length; const checked = document.querySelectorAll('.checklist-card .glass-checkbox:checked').length;
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
        if (card) { const t = card.querySelectorAll('.glass-checkbox').length; const c = card.querySelectorAll('.glass-checkbox:checked').length; const fill = card.querySelector('.card-progress-fill'); if (fill) fill.style.width = t ? (c / t * 100) + '%' : '0%'; }
    });
}

function saveToLocalStorage() { const state = {}; document.querySelectorAll('.checklist-card .glass-checkbox').forEach((cb, i) => state[`cb_${i}`] = cb.checked); localStorage.setItem('gudang_clean_state', JSON.stringify(state)); }
function loadFromLocalStorage() { const saved = localStorage.getItem('gudang_clean_state'); if (!saved) return; try { const state = JSON.parse(saved); document.querySelectorAll('.checklist-card .glass-checkbox').forEach((cb, i) => { if (state[`cb_${i}`]) { cb.checked = true; cb.closest('.checklist-item').classList.add('completed'); } }); updateProgress(); } catch (e) {} }

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
        if (!userName) { try { const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', session.user.id).single(); if (profile) userName = profile.full_name; } catch (e) {} }
        window.currentUser = { name: userName || 'User', email: session.user.email };
        updateSidebarUI();

        const today = new Date(); const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(today.getDate() - 30);
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

        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        sidebarToggle?.addEventListener('click', () => { sidebar.classList.add('open'); sidebarOverlay.classList.add('active'); document.body.style.overflow = 'hidden'; });
        sidebarOverlay?.addEventListener('click', () => { sidebar.classList.remove('open'); sidebarOverlay.classList.remove('active'); document.body.style.overflow = ''; });
        
        document.querySelectorAll('.nav-item').forEach(link => {
            link.addEventListener('click', () => { if (window.innerWidth < 1024) { sidebar.classList.remove('open'); sidebarOverlay.classList.remove('active'); document.body.style.overflow = ''; } });
        });
    });
}

async function loadReports() {
    const supabase = window.supabaseClient;
    const from = document.getElementById('filterFrom').value; const to = document.getElementById('filterTo').value;
    const tableBody = document.getElementById('reportsTableBody');
    const pdfBtn = document.getElementById('downloadPdfBtn'); const excelBtn = document.getElementById('downloadExcelBtn');
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-8"><div class="spinner mx-auto"></div></td></tr>`;
    pdfBtn.disabled = true; excelBtn.disabled = true;
    try {
        const { data, error } = await supabase.from('checklist_submissions').select('*').gte('created_at', from + 'T00:00:00').lte('created_at', to + 'T23:59:59').order('created_at', { ascending: false });
        if (error) throw error;
        filteredReports = data || [];
        renderReports(filteredReports); updateReportStats(filteredReports);
        document.getElementById('reportCountText').textContent = `Menampilkan ${filteredReports.length} laporan`;
        pdfBtn.disabled = filteredReports.length === 0; excelBtn.disabled = filteredReports.length === 0;
    } catch (error) { tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-red-400 py-8">Gagal memuat: ${error.message}</td></tr>`; }
}

function renderReports(reports) {
    const tableBody = document.getElementById('reportsTableBody');
    if (reports.length === 0) { tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-white/50 py-8">Tidak ada laporan</td></tr>`; return; }
    tableBody.innerHTML = reports.map(r => {
        const date = new Date(r.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
        const statusColor = r.status === 'completed' ? 'bg-green-500/20 text-green-300' : 'bg-amber-500/20 text-amber-300';
        const progressColor = r.progress_percentage === 100 ? 'text-green-400' : r.progress_percentage >= 50 ? 'text-amber-400' : 'text-red-400';
        return `<tr><td class="px-4 py-3 text-sm">${date}</td><td class="px-4 py-3 text-sm">${r.user_name || '-'}</td><td class="px-4 py-3 text-sm text-center">${r.total_items || 0}</td><td class="px-4 py-3 text-sm text-center">${r.completed_items || 0}</td><td class="px-4 py-3 text-sm font-semibold text-center ${progressColor}">${r.progress_percentage || 0}%</td><td class="px-4 py-3 text-center"><span class="px-2 py-1 rounded-full text-xs font-medium ${statusColor}">${r.status === 'completed' ? 'Selesai' : 'Proses'}</span></td></tr>`;
    }).join('');
}

function updateReportStats(reports) {
    const total = reports.length; const completed = reports.filter(r => r.status === 'completed').length;
    const avg = total > 0 ? Math.round(reports.reduce((s, r) => s + (r.progress_percentage || 0), 0) / total) : 0;
    const users = new Set(reports.map(r => r.user_email)).size;
    if (document.getElementById('statTotalReports')) document.getElementById('statTotalReports').textContent = total;
    if (document.getElementById('statCompletedReports')) document.getElementById('statCompletedReports').textContent = completed;
    if (document.getElementById('statAvgProgress')) document.getElementById('statAvgProgress').textContent = avg + '%';
    if (document.getElementById('statActiveUsers')) document.getElementById('statActiveUsers').textContent = users;
}

function downloadPDF() {
    if (filteredReports.length === 0) return;
    const { jsPDF } = window.jspdf; const doc = new jsPDF();
    const from = document.getElementById('filterFrom').value; const to = document.getElementById('filterTo').value;
    doc.setFontSize(18); doc.text('Laporan Kebersihan Gudang', 14, 20);
    doc.setFontSize(10); doc.text(`Periode: ${from} s/d ${to}`, 14, 28);
    doc.autoTable({ startY: 35, head: [['Tanggal', 'User', 'Total', 'Selesai', 'Progress', 'Status']], body: filteredReports.map(r => [new Date(r.created_at).toLocaleDateString('id-ID'), r.user_name, r.total_items, r.completed_items, r.progress_percentage + '%', r.status === 'completed' ? 'Selesai' : 'Proses']), theme: 'grid', headStyles: { fillColor: [102, 126, 234] } });
    doc.save(`Laporan-${from}-to-${to}.pdf`); showNotification('PDF diunduh! ✅', 'success');
}

function downloadExcel() {
    if (filteredReports.length === 0) return;
    const from = document.getElementById('filterFrom').value; const to = document.getElementById('filterTo').value;
    const data = filteredReports.map(r => ({ 'Tanggal': new Date(r.created_at).toLocaleDateString('id-ID'), 'User': r.user_name, 'Total': r.total_items, 'Selesai': r.completed_items, 'Progress': r.progress_percentage + '%', 'Status': r.status === 'completed' ? 'Selesai' : 'Proses' }));
    const wb = XLSX.utils.book_new(); const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan'); XLSX.writeFile(wb, `Laporan-${from}-to-${to}.xlsx`);
    showNotification('Excel diunduh! ✅', 'success');
}

/* ============================================
   UTILS
   ============================================ */
function updateSidebarUI() {
    if (document.getElementById('sidebarUserName')) document.getElementById('sidebarUserName').textContent = window.currentUser.name;
    if (document.getElementById('sidebarUserEmail')) document.getElementById('sidebarUserEmail').textContent = window.currentUser.email;
    if (document.getElementById('userAvatar')) document.getElementById('userAvatar').textContent = window.currentUser.name.charAt(0).toUpperCase();
}

function showNotification(message, type = 'info') {
    const colors = { success: { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.3)', icon: '#22c55e' }, warning: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', icon: '#f59e0b' }, error: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', icon: '#ef4444' }, info: { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)', icon: '#3b82f6' } };
    const c = colors[type] || colors.info;
    const el = document.createElement('div'); el.className = 'fixed top-6 right-6 z-[100] px-6 py-4 rounded-xl text-white font-medium';
    el.style.cssText = `background: ${c.bg}; backdrop-filter: blur(20px); border: 1px solid ${c.border}; box-shadow: 0 8px 32px rgba(0,0,0,0.3); animation: slideIn 0.4s ease;`;
    el.innerHTML = `<div class="flex items-center gap-3"><svg class="h-5 w-5" style="color: ${c.icon}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="${type === 'success' ? 'M5 13l4 4L19 7' : type === 'error' ? 'M6 18L18 6M6 6l12 12' : 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'}" /></svg><span>${message}</span></div>`;
    document.body.appendChild(el); setTimeout(() => { el.style.animation = 'slideOut 0.4s ease forwards'; setTimeout(() => el.remove(), 400); }, 3000);
}
if (!document.getElementById('notif-styles')) { const s = document.createElement('style'); s.id = 'notif-styles'; s.textContent = `@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }`; document.head.appendChild(s); }
async function resendConfirmationEmail(email) {
    const supabase = window.supabaseClient;
    const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
    });

    if (error) {
        showNotification('Gagal mengirim ulang: ' + error.message, 'error');
    } else {
        showNotification('Link konfirmasi telah dikirim ulang ke email Anda!', 'success');
    }
}
