/* ============================================
   INISIALISASI UTAMA
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('loginForm')) {
        initLoginPage();
    }
    if (document.getElementById('checklistGrid')) {
        initChecklistPage();
    }
});

/* ============================================
   HALAMAN LOGIN
   ============================================ */
function initLoginPage() {
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

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = passwordInput.value;

        if (email !== 'admin@mhe.com' || password !== 'admin123') {
            alert('Login Gagal!\nGunakan:\nEmail: admin@mhe.com\nPassword: admin123');
            submitBtn.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(0)' }], { duration: 300 });
            passwordInput.value = '';
            return;
        }

        submitBtn.disabled = true;
        btnText.innerText = 'Memproses...';
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        submitBtn.appendChild(spinner);

        setTimeout(() => {
            window.location.href = 'checklist.html';
        }, 1500);
    });
}

/* ============================================
   HALAMAN CHECKLIST
   ============================================ */
function initChecklistPage() {
    // 1. Ambil semua elemen DOM yang dibutuhkan
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

    // Helper: Dapatkan instance Supabase dengan aman
    function getSupabase() {
        if (!window.supabaseClient) {
            console.error('❌ Supabase client belum terinisialisasi. Cek config.js');
            return null;
        }
        return window.supabaseClient;
    }

    // Helper: Update Progress per Card
    function updateCardProgress(category) {
        const card = document.querySelector(`.checklist-card[data-category="${category}"]`);
        if (!card) return;
        const total = card.querySelectorAll('.glass-checkbox').length;
        const checked = card.querySelectorAll('.glass-checkbox:checked').length;
        const fill = card.querySelector('.card-progress-fill');
        if (fill) fill.style.width = total ? (checked / total * 100) + '%' : '0%';
    }

    // Helper: Update Overall Progress
    function updateOverallProgress() {
        const total = allCheckboxes.length;
        const checked = document.querySelectorAll('.checklist-card .glass-checkbox:checked').length;
        const percent = total ? Math.round((checked / total) * 100) : 0;
        
        const bar = document.getElementById('overallProgressBar');
        const text = document.getElementById('overallProgressText');
        const compCount = document.getElementById('completedCount');
        const totalCount = document.getElementById('totalCount');

        if (bar) bar.style.width = percent + '%';
        if (text) text.textContent = percent + '%';
        if (compCount) compCount.textContent = checked;
        if (totalCount) totalCount.textContent = total;
    }

    // Helper: Update Stats
    function updateStats() {
        const total = allCheckboxes.length;
        const checked = document.querySelectorAll('.checklist-card .glass-checkbox:checked').length;
        
        const statTotal = document.getElementById('statTotal');
        const statCompleted = document.getElementById('statCompleted');
        const statPending = document.getElementById('statPending');
        const statProgress = document.getElementById('statProgress');

        if (statTotal) statTotal.textContent = total;
        if (statCompleted) statCompleted.textContent = checked;
        if (statPending) statPending.textContent = total - checked;
        if (statProgress) statProgress.textContent = (total ? Math.round((checked / total) * 100) : 0) + '%';
    }

    // Helper: Local Storage
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

    // ========== SIDEBAR MOBILE ==========
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
        item.addEventListener('click', () => {
            if (window.innerWidth < 1024) closeSidebar();
        });
    });

    // ========== FILTER KATEGORI ==========
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const category = btn.dataset.category;
            checklistCards.forEach(card => {
                card.classList.toggle('hidden-card', category !== 'all' && card.dataset.category !== category);
            });
        });
    });

    // ========== SEARCH ==========
    searchInput?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        checklistCards.forEach(card => {
            const items = card.querySelectorAll('.checklist-text');
            let hasMatch = false;
            items.forEach(item => {
                const match = item.textContent.toLowerCase().includes(query);
                item.parentElement.style.display = query && !match ? 'none' : '';
                if (match) hasMatch = true;
            });
            card.classList.toggle('hidden-card', query && !hasMatch);
        });
    });

    // ========== CHECKBOX LOGIC ==========
    allCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            checkbox.closest('.checklist-item').classList.toggle('completed', checkbox.checked);
            updateCardProgress(checkbox.dataset.card);
            updateOverallProgress();
            updateStats();
            saveToLocalStorage();
        });
    });

    // ========== RESET ALL ==========
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

    // ========== SUPABASE: SAVE ==========
    async function saveToSupabase(data) {
        const supabase = getSupabase();
        if (!supabase) {
            showNotification('Database belum terhubung. Cek config.js', 'error');
            return null;
        }
        
        try {
            const { data: submission, error } = await supabase
                .from('checklist_submissions')
                .insert({
                    user_name: window.currentUser?.name || 'Unknown',
                    user_email: window.currentUser?.email || 'unknown@test.com',
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
            
            console.log('✅ Data saved to Supabase:', submission);
            showNotification('Data berhasil disimpan ke database! ✅', 'success');
            return submission;
        } catch (error) {
            console.error('❌ Error saving to Supabase:', error);
            showNotification('Gagal menyimpan: ' + error.message, 'error');
            return null;
        }
    }

    // ========== SUPABASE: LOAD ==========
    async function loadFromSupabase() {
        const supabase = getSupabase();
        if (!supabase) return null;
        
        try {
            const { data, error } = await supabase
                .from('checklist_submissions')
                .select('*')
                .eq('user_email', window.currentUser?.email || 'unknown@test.com')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            
            if (data) {
                console.log('📥 Loaded from Supabase:', data);
                return data;
            }
            return null;
        } catch (error) {
            console.error('❌ Error loading from Supabase:', error);
            return null;
        }
    }

    // ========== SUBMIT BUTTON ==========
    submitChecklistBtn?.addEventListener('click', async () => {
        const total = allCheckboxes.length;
        const completed = document.querySelectorAll('.checklist-card .glass-checkbox:checked').length;
        
        if (completed < total) {
            showNotification(`Selesaikan semua tugas dulu (${completed}/${total})`, 'warning');
            return;
        }
        
        const checklistData = {
            floor: Array.from(document.querySelectorAll('[data-card="floor"]')).map(cb => ({
                task: cb.nextElementSibling.textContent,
                checked: cb.checked
            })),
            rack: Array.from(document.querySelectorAll('[data-card="rack"]')).map(cb => ({
                task: cb.nextElementSibling.textContent,
                checked: cb.checked
            })),
            dock: Array.from(document.querySelectorAll('[data-card="dock"]')).map(cb => ({
                task: cb.nextElementSibling.textContent,
                checked: cb.checked
            })),
            facility: Array.from(document.querySelectorAll('[data-card="facility"]')).map(cb => ({
                task: cb.nextElementSibling.textContent,
                checked: cb.checked
            })),
            total: total,
            completed: completed,
            progress: 100
        };
        
        const result = await saveToSupabase(checklistData);
        if (result) {
            showNotification('Laporan berhasil dikirim! ID: ' + result.id.slice(0, 8), 'success');
        }
    });

    // ========== AUTO-SAVE SETIAP 30 DETIK ==========
    setInterval(async () => {
        const completed = document.querySelectorAll('.checklist-card .glass-checkbox:checked').length;
        const total = allCheckboxes.length;
        
        if (completed > 0) {
            const checklistData = {
                floor: Array.from(document.querySelectorAll('[data-card="floor"]')).map(cb => ({
                    task: cb.nextElementSibling.textContent,
                    checked: cb.checked
                })),
                rack: Array.from(document.querySelectorAll('[data-card="rack"]')).map(cb => ({
                    task: cb.nextElementSibling.textContent,
                    checked: cb.checked
                })),
                dock: Array.from(document.querySelectorAll('[data-card="dock"]')).map(cb => ({
                    task: cb.nextElementSibling.textContent,
                    checked: cb.checked
                })),
                facility: Array.from(document.querySelectorAll('[data-card="facility"]')).map(cb => ({
                    task: cb.nextElementSibling.textContent,
                    checked: cb.checked
                })),
                total: total,
                completed: completed,
                progress: Math.round((completed / total) * 100)
            };
            
            console.log('💾 Auto-saving to Supabase...');
            await saveToSupabase(checklistData);
        }
    }, 30000);

    // ========== LOAD SAAT HALAMAN DIBUKA ==========
    window.addEventListener('load', async () => {
        const savedData = await loadFromSupabase();
        if (savedData) {
            console.log('📥 Restored from Supabase');
        }
    });

    // ========== LOGOUT ==========
    logoutBtn?.addEventListener('click', () => {
        if (confirm('Logout?')) window.location.href = 'index.html';
    });

    // ========== INISIALISASI ==========
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
    notification.style.cssText = `
        background: ${c.bg};
        backdrop-filter: blur(20px);
        border: 1px solid ${c.border};
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    `;
    notification.innerHTML = `
        <div class="flex items-center gap-3">
            <svg class="h-5 w-5" style="color: ${c.icon}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="${type === 'success' ? 'M5 13l4 4L19 7' : type === 'error' ? 'M6 18L18 6M6 6l12 12' : 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'}" />
            </svg>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.4s ease forwards';
        setTimeout(() => notification.remove(), 400);
    }, 3000);
}

// Inject animation keyframes untuk notifikasi
if (!document.getElementById('notif-styles')) {
    const style = document.createElement('style');
    style.id = 'notif-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}
