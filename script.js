document.addEventListener('DOMContentLoaded', () => {
    
    // ============================================
    // HALAMAN LOGIN (index.html)
    // ============================================
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        initLoginPage();
    }

    // ============================================
    // HALAMAN CHECKLIST (checklist.html)
    // ============================================
    const checklistGrid = document.getElementById('checklistGrid');
    
    if (checklistGrid) {
        initChecklistPage();
    }
});

/* ============================================
   LOGIC HALAMAN LOGIN
   ============================================ */
function initLoginPage() {
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');
    const loginForm = document.getElementById('loginForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnArrow = document.getElementById('btnArrow');

    // Toggle Show/Hide Password
    togglePassword?.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        if (type === 'text') {
            eyeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />`;
        } else {
            eyeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />`;
        }
    });

    // Form Submit
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            shakeButton(submitBtn);
            return;
        }

        // Validasi hardcoded
        const validEmail = "admin@mhe.com";
        const validPassword = "admin123";

        if (email !== validEmail || password !== validPassword) {
            alert('Email atau Password salah!\n\nGunakan:\nEmail: admin@mhe.com\nPassword: admin123');
            shakeButton(submitBtn);
            passwordInput.value = '';
            return;
        }

        // Loading State
        submitBtn.disabled = true;
        btnText.innerText = 'Signing in...';
        if (btnArrow) btnArrow.style.display = 'none';
        
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        submitBtn.appendChild(spinner);

        setTimeout(() => {
            submitBtn.removeChild(spinner);
            btnText.innerText = 'Sign In';
            if (btnArrow) btnArrow.style.display = 'block';
            submitBtn.disabled = false;
            
            showNotification('Login berhasil! Mengalihkan...', 'success');
            
            setTimeout(() => {
                window.location.href = 'checklist.html';
            }, 1000);
        }, 1500);
    });
}

/* ============================================
   LOGIC HALAMAN CHECKLIST
   ============================================ */
function initChecklistPage() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const searchInput = document.getElementById('searchInput');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const checklistCards = document.querySelectorAll('.checklist-card');
    const allCheckboxes = document.querySelectorAll('.checklist-card .glass-checkbox');
    const resetAllBtn = document.getElementById('resetAllBtn');
    const submitChecklistBtn = document.getElementById('submitChecklistBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    // Sidebar Toggle (Mobile)
    sidebarToggle?.addEventListener('click', () => {
        sidebar.classList.add('open');
        sidebarOverlay.classList.add('active');
    });

    sidebarOverlay?.addEventListener('click', () => {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
    });

    // Auto-close sidebar saat klik menu (mobile)
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth < 1024) {
                sidebar.classList.remove('open');
                sidebarOverlay.classList.remove('active');
            }
        });
    });

    // Category Filter
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.dataset.category;
            
            checklistCards.forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.classList.remove('hidden-card');
                } else {
                    card.classList.add('hidden-card');
                }
            });
        });
    });

    // Search Filter
    searchInput?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        checklistCards.forEach(card => {
            const items = card.querySelectorAll('.checklist-text');
            let hasMatch = false;
            
            items.forEach(item => {
                if (item.textContent.toLowerCase().includes(query)) {
                    hasMatch = true;
                    item.parentElement.style.display = '';
                } else {
                    item.parentElement.style.display = query ? 'none' : '';
                }
            });
            
            card.classList.toggle('hidden-card', query && !hasMatch);
        });
    });

    // Checkbox Handler
    allCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const item = checkbox.closest('.checklist-item');
            item.classList.toggle('completed', checkbox.checked);
            
            updateCardProgress(checkbox.dataset.card);
            updateOverallProgress();
            updateStats();
            saveToLocalStorage();
        });
    });

    function updateCardProgress(category) {
        const card = document.querySelector(`.checklist-card[data-category="${category}"]`);
        if (!card) return;
        
        const checkboxes = card.querySelectorAll('.glass-checkbox');
        const checked = card.querySelectorAll('.glass-checkbox:checked');
        const percent = checkboxes.length ? (checked.length / checkboxes.length) * 100 : 0;
        
        const progressBar = card.querySelector('.card-progress-fill');
        if (progressBar) progressBar.style.width = percent + '%';
    }

    function updateOverallProgress() {
        const total = allCheckboxes.length;
        const completed = document.querySelectorAll('.checklist-card .glass-checkbox:checked').length;
        const percent = total ? Math.round((completed / total) * 100) : 0;
        
        const overallBar = document.getElementById('overallProgressBar');
        const overallText = document.getElementById('overallProgressText');
        const completedCount = document.getElementById('completedCount');
        const totalCount = document.getElementById('totalCount');
        
        if (overallBar) overallBar.style.width = percent + '%';
        if (overallText) overallText.textContent = percent + '%';
        if (completedCount) completedCount.textContent = completed;
        if (totalCount) totalCount.textContent = total;
    }

    function updateStats() {
        const total = allCheckboxes.length;
        const completed = document.querySelectorAll('.checklist-card .glass-checkbox:checked').length;
        const pending = total - completed;
        const percent = total ? Math.round((completed / total) * 100) : 0;
        
        const statTotal = document.getElementById('statTotal');
        const statCompleted = document.getElementById('statCompleted');
        const statPending = document.getElementById('statPending');
        const statProgress = document.getElementById('statProgress');
        
        if (statTotal) statTotal.textContent = total;
        if (statCompleted) statCompleted.textContent = completed;
        if (statPending) statPending.textContent = pending;
        if (statProgress) statProgress.textContent = percent + '%';
    }

    function saveToLocalStorage() {
        const state = {};
        allCheckboxes.forEach((cb, index) => {
            state[`cb_${index}`] = cb.checked;
        });
        localStorage.setItem('gudang_clean_state', JSON.stringify(state));
    }

    function loadFromLocalStorage() {
        const saved = localStorage.getItem('gudang_clean_state');
        if (!saved) return;
        
        try {
            const state = JSON.parse(saved);
            allCheckboxes.forEach((cb, index) => {
                if (state[`cb_${index}`]) {
                    cb.checked = true;
                    cb.closest('.checklist-item').classList.add('completed');
                }
            });
            
            ['floor', 'rack', 'dock', 'facility'].forEach(updateCardProgress);
            updateOverallProgress();
            updateStats();
        } catch (e) {
            console.error('Error loading checklist state:', e);
        }
    }

    resetAllBtn?.addEventListener('click', () => {
        if (!confirm('Yakin ingin mereset semua checklist?')) return;
        
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

    submitChecklistBtn?.addEventListener('click', () => {
        const total = allCheckboxes.length;
        const completed = document.querySelectorAll('.checklist-card .glass-checkbox:checked').length;
        
        if (completed < total) {
            showNotification(`Selesaikan semua tugas dulu (${completed}/${total})`, 'warning');
            return;
        }
        
        showNotification('Laporan kebersihan berhasil dikirim!', 'success');
    });

    logoutBtn?.addEventListener('click', () => {
        if (confirm('Yakin ingin logout?')) {
            window.location.href = 'index.html';
        }
    });

    // Notification System
    function showNotification(message, type = 'info') {
        const colors = {
            success: { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.3)', icon: '#22c55e' },
            warning: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', icon: '#f59e0b' },
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
                    <path stroke-linecap="round" stroke-linejoin="round" d="${type === 'success' ? 'M5 13l4 4L19 7' : 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'}" />
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

    function shakeButton(btn) {
        btn.animate(
            [
                { transform: 'translateX(0)' },
                { transform: 'translateX(-8px)' },
                { transform: 'translateX(8px)' },
                { transform: 'translateX(-4px)' },
                { transform: 'translateX(4px)' },
                { transform: 'translateX(0)' }
            ],
            { duration: 400, easing: 'ease-in-out' }
        );
    }

    // Inject animation keyframes
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

    // Initialize
    loadFromLocalStorage();
    updateStats();
}
