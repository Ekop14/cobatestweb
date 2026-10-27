/* ============================================
   INISIALISASI UTAMA
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('loginForm')) initLoginPage();
    if (document.getElementById('registerForm')) initRegisterPage();
    if (document.getElementById('checklistGrid')) initChecklistPage();
});

/* ============================================
   HALAMAN LOGIN
   ============================================ */
function initLoginPage() {
    const supabase = window.supabaseClient;
    if (!supabase) { showNotification('Koneksi database gagal', 'error'); return; }

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

        submitBtn.disabled = true;
        btnText.innerText = 'Memproses...';
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        submitBtn.appendChild(spinner);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;

            showNotification('Login berhasil! Mengalihkan...', 'success');
            setTimeout(() => { window.location.href = 'checklist.html'; }, 1000);
        } catch (error) {
            showNotification(error.message || 'Login gagal. Periksa email dan password.', 'error');
            submitBtn.disabled = false;
            btnText.innerText = 'Masuk';
            if (spinner.parentNode) spinner.remove();
        }
    });
}

/* ============================================
   HALAMAN REGISTER
   ============================================ */
function initRegisterPage() {
    const supabase = window.supabaseClient;
    if (!supabase) { showNotification('Koneksi database gagal', 'error'); return; }

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

        submitBtn.disabled = true;
        btnText.innerText = 'Mendaftar...';
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        submitBtn.appendChild(spinner);

        try {
            const { error } = await supabase.auth.signUp({
                email, password,
                options: { data: { full_name: fullName } }
            });
            if (error) throw error;

            showNotification('Registrasi berhasil! Silakan login.', 'success');
            setTimeout(() => { window.location.href = 'index.html'; }, 2000);
        } catch (error) {
            let message = error.message.includes('already registered') ? 'Email sudah terdaftar.' : error.message;
            showNotification(message || 'Registrasi gagal', 'error');
            submitBtn.disabled = false;
            btnText.innerText = 'Daftar Sekarang';
            if (spinner.parentNode) spinner.remove();
        }
    });
}

/* ============================================
   HALAMAN CHECKLIST
   ============================================ */
function initChecklistPage() {
    const supabase = window.supabaseClient;
    if (!supabase) { showNotification('Database belum terhubung', 'error'); return; }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (!session) {
            window.location.href = 'index.html';
            return;
        }
        
        // 1. Coba ambil nama dari metadata (saat register)
        let userName = session.user.user_metadata?.full_name;
        
        // 2. Jika kosong, ambil dari tabel profiles (lebih akurat)
        if (!userName) {
            try {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', session.user.id)
                    .single();
                if (profile && profile.full_name) userName = profile.full_name;
            } catch (e) { console.log('Gagal mengambil profil'); }
        }

        // Simpan ke global & update tampilan sidebar
        window.currentUser = {
            name: userName || 'Pengguna Gudang',
            email: session.user.email
        };

        // Update UI Sidebar dengan nama yang benar
        const nameEl = document.getElementById('sidebarUserName');
        const emailEl = document.getElementById('sidebarUserEmail');
        const avatarEl = document.getElementById('userAvatar');
        
        if (nameEl) nameEl.textContent = window.currentUser.name;
        if (emailEl) emailEl.textContent = window.currentUser.email;
        if (avatarEl) avatarEl.textContent = window.currentUser.name.charAt(0).toUpperCase();

        initChecklistLogic();
    });
}

function initChecklistLogic() {
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

    function getSupabase() { return window.supabaseClient; }

    function updateCardProgress(category) {
        const card = document.querySelector(`.checklist-card[data-category="${category}"]`);
        if (!card) return;
        const total = card.querySelectorAll('.glass-checkbox').length;
        const checked = card.querySelectorAll('.glass-checkbox:checked').length;
        const fill = card.querySelector('.card-progress-fill');
        if (fill) fill.style.width = total ? (checked / total * 100) + '%' : '0%';
    }

    function updateOverallProgress() {
        const total = allCheckboxes.length;
        const checked = document.querySelectorAll('.checklist-card .glass-checkbox:checked').length;
        const percent = total ? Math.round((checked / total) * 100) : 0;
        
        if (document.getElementById('overallProgressBar')) document.getElementById('overallProgressBar').style.width = percent + '%';
        if (document.getElementById('overallProgressText')) document.getElementById('overallProgressText').textContent = percent + '%';
        if (document.getElementById('completedCount')) document.getElementById('completedCount').textContent = checked;
        if (document.getElementById('totalCount')) document.getElementById('totalCount').textContent = total;
    }

    function updateStats() {
        const total = allCheckboxes.length;
        const checked = document.querySelectorAll('.checklist-card .glass-checkbox:checked').length;
        if (document.getElementById('statTotal')) document.getElementById('statTotal').textContent = total;
        if (document.getElementById('statCompleted')) document.getElementById('statCompleted').textContent = checked;
        if (document.getElementById('statPending')) document.getElementById('statPending').textContent = total - checked;
        if (document.getElementById('statProgress')) document.getElementById('statProgress').textContent = (total ? Math.round((checked / total) * 100) : 0) + '%';
    }

    function saveToLocalStorage() {
        const state = {};
        allCheckboxes.forEach((cb, i) => state[`cb_${i}`] = cb.checked);
        localStorage.setItem('gudang_clean_state', JSON.stringify(state));
    }

    function loadFromLocalStorage() {
        const saved = localStorage.getItem('gudang_clean_state');
        if (!saved) return;
        try {
            const state = JSON.parse(saved);
            allCheckboxes.forEach((cb, i) => {
                if (state[`cb_${i}`]) {
                    cb.checked = true;
                    cb.closest('.checklist-item').classList.add('completed');
                }
            });
            ['floor', 'rack', 'dock', 'facility'].forEach(updateCardProgress);
            updateOverallProgress();
            updateStats();
        } catch (e) { console.error(e); }
    }

    // --- SIDEBAR MOBILE ---
    sidebarToggle?.addEventListener('click', () => {
        sidebar.classList.add('open');
        sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    const closeSidebar = () => {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    sidebarOverlay?.addEventListener('click', closeSidebar);
    document.querySelectorAll('.nav-item, .category-btn').forEach(item => {
        item.addEventListener('click', () => { if (window.innerWidth < 1024) closeSidebar(); });
    });

    // --- FILTER & SEARCH ---
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            checklistCards.forEach(card => {
                card.classList.toggle('hidden-card', btn.dataset.category !== 'all' && card.dataset.category !== btn.dataset.category);
            });
        });
    });

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

    // --- CHECKBOX LOGIC ---
    allCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            checkbox.closest('.checklist-item').classList.toggle('completed', checkbox.checked);
            updateCardProgress(checkbox.dataset.card);
            updateOverallProgress();
            updateStats();
            saveToLocalStorage();
        });
    });

    resetAllBtn?.addEventListener('click', () => {
        if (!confirm('Reset semua checklist?')) return;
        allCheckboxes.forEach(cb => {
            cb.checked = false;
            cb.closest('.checklist-item').classList.remove('completed');
        });
        ['floor', 'rack', 'dock', 'facility'].forEach(updateCardProgress);
        updateOverallProgress();
        updateStats();
        localStorage.removeItem('gudang_clean_state');
        showNotification('Checklist berhasil direset', 'info');
    });

    // --- SUPABASE SAVE ---
    async function saveToSupabase(data) {
        const supabase = getSupabase();
        if (!supabase) return null;
        try {
            const { data: submission, error } = await supabase.from('checklist_submissions').insert({
                user_name: window.currentUser?.name || 'Unknown',
                user_email: window.currentUser?.email || 'unknown@test.com',
                floor_items: data.floor, rack_items: data.rack, dock_items: data.dock, facility_items: data.facility,
                total_items: data.total, completed_items: data.completed, progress_percentage: data.progress,
                status: data.progress === 100 ? 'completed' : 'in_progress'
            }).select().single();
            if (error) throw error;
            return submission;
        } catch (error) {
            showNotification('Gagal menyimpan: ' + error.message, 'error');
            return null;
        }
    }

    // --- SUBMIT BUTTON ---
    submitChecklistBtn?.addEventListener('click', async () => {
        const total = allCheckboxes.length;
        const completed = document.querySelectorAll('.checklist-card .glass-checkbox:checked').length;
        if (completed < total) {
            showNotification(`Selesaikan semua tugas dulu (${completed}/${total})`, 'warning');
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
            showNotification('Laporan berhasil dikirim! ✅', 'success');
            setTimeout(() => {
                allCheckboxes.forEach(cb => { cb.checked = false; cb.closest('.checklist-item').classList.remove('completed'); });
                ['floor', 'rack', 'dock', 'facility'].forEach(updateCardProgress);
                updateOverallProgress(); updateStats();
                localStorage.removeItem('gudang_clean_state');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 1500);
        }
    });

    // --- LOGOUT BUTTON (DIPERBAIKI UNTUK MOBILE) ---
    logoutBtn?.addEventListener('click', async (e) => {
        e.preventDefault();       // Mencegah perilaku default link/button
        e.stopPropagation();      // Mencegah event "bubbling" ke parent (sidebar)
        
        if (!confirm('Yakin ingin keluar dari akun?')) return;
        
        const supabase = getSupabase();
        if (supabase) await supabase.auth.signOut();
        
        window.location.href = 'index.html';
    });

    loadFromLocalStorage();
    updateStats();
}

/* ============================================
   NOTIFICATION SYSTEM
   ============================================ */
function showNotification(message, type = 'info') {
    const colors = {
        success: { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.3)', icon: '#22c55e' },
        warning: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', icon: '#f59e0b' },
        error: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', icon: '#ef4444' },
        info: { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)', icon: '#3b82f6' }
    };
    const c = colors[type] || colors.info;
    const notification = document.createElement('div');
    notification.className = 'fixed top-6 right-6 z-50 px-6 py-4 rounded-xl text-white font-medium';
    notification.style.cssText = `background: ${c.bg}; backdrop-filter: blur(20px); border: 1px solid ${c.border}; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);`;
    notification.innerHTML = `<div class="flex items-center gap-3"><svg class="h-5 w-5" style="color: ${c.icon}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="${type === 'success' ? 'M5 13l4 4L19 7' : type === 'error' ? 'M6 18L18 6M6 6l12 12' : 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'}" /></svg><span>${message}</span></div>`;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.4s ease forwards';
        setTimeout(() => notification.remove(), 400);
    }, 3000);
}

if (!document.getElementById('notif-styles')) {
    const style = document.createElement('style');
    style.id = 'notif-styles';
    style.textContent = `@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }`;
    document.head.appendChild(style);
}
