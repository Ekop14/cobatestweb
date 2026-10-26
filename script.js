document.addEventListener('DOMContentLoaded', () => {
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');
    const loginForm = document.getElementById('loginForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnArrow = document.getElementById('btnArrow');

    // ============================================
    // Toggle Show/Hide Password
    // ============================================
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        if (type === 'text') {
            // Ikon mata tertutup
            eyeIcon.innerHTML = `
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            `;
        } else {
            // Ikon mata terbuka
            eyeIcon.innerHTML = `
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            `;
        }
    });

    // ============================================
    // Form Submission dengan Loading State
    // ============================================
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = passwordInput.value;

        // Validasi
        if (!email || !password) {
            shakeButton();
            return;
        }

        if (password.length < 6) {
            alert('Password minimal 6 karakter');
            passwordInput.focus();
            return;
        }

        // Loading State
        submitBtn.disabled = true;
        btnText.innerText = 'Signing in...';
        btnArrow.style.display = 'none';
        
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        submitBtn.appendChild(spinner);

        // Simulasi proses login (ganti dengan API call asli)
        setTimeout(() => {
            submitBtn.removeChild(spinner);
            btnText.innerText = 'Sign In';
            btnArrow.style.display = 'block';
            submitBtn.disabled = false;

            // Success feedback
            showSuccess();
            
            console.log('Login Data:', { email, password });
            // loginForm.reset(); // Uncomment jika ingin reset form
        }, 1800);
    });

    // ============================================
    // Efek Shake saat Error
    // ============================================
    function shakeButton() {
        submitBtn.animate(
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

    // ============================================
    // Success Feedback (Custom Notification)
    // ============================================
    function showSuccess() {
        const notification = document.createElement('div');
        notification.className = 'fixed top-6 right-6 z-50 px-6 py-4 rounded-xl text-white font-medium';
        notification.style.cssText = `
            background: rgba(34, 197, 94, 0.15);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(34, 197, 94, 0.3);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        `;
        notification.innerHTML = `
            <div class="flex items-center gap-3">
                <svg class="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Login successful!</span>
            </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.4s ease forwards';
            setTimeout(() => notification.remove(), 400);
        }, 3000);
    }

    // Inject animation keyframes untuk notifikasi
    const style = document.createElement('style');
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
});
/* ============================================
   CHECKLIST PAGE LOGIC
   ============================================ */

// Jalankan hanya jika elemen checklist ada (halaman checklist.html)
if (document.getElementById('checklistGrid')) {
    initChecklistPage();
}

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

    // ============================================
    // Sidebar Toggle (Mobile)
    // ============================================
    sidebarToggle?.addEventListener('click', () => {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('active');
});

sidebarOverlay?.addEventListener('click', () => {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
});

// Tutup sidebar saat klik tombol di dalam sidebar (mobile)
const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
    item.addEventListener('click', () => {
        if (window.innerWidth < 1024) {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('active');
        }
    });
});

    // ============================================
    // Category Filter
    // ============================================
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

    // ============================================
    // Search Filter
    // ============================================
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

    // ============================================
    // Checkbox Handler dengan Progress Update
    // ============================================
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

    // ============================================
    // Update Progress per Card
    // ============================================
    function updateCardProgress(category) {
        const card = document.querySelector(`.checklist-card[data-category="${category}"]`);
        if (!card) return;
        
        const checkboxes = card.querySelectorAll('.glass-checkbox');
        const checked = card.querySelectorAll('.glass-checkbox:checked');
        const percent = checkboxes.length ? (checked.length / checkboxes.length) * 100 : 0;
        
        const progressBar = card.querySelector('.card-progress-fill');
        if (progressBar) {
            progressBar.style.width = percent + '%';
        }
    }

    // ============================================
    // Update Overall Progress
    // ============================================
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

    // ============================================
    // Update Stats Cards
    // ============================================
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

    // ============================================
    // LocalStorage - Simpan State Checklist
    // ============================================
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
            
           // Update semua progress
['floor', 'rack', 'dock', 'facility'].forEach(updateCardProgress);
            updateOverallProgress();
            updateStats();
        } catch (e) {
            console.error('Error loading checklist state:', e);
        }
    }

    // ============================================
    // Reset All
    // ============================================
    resetAllBtn?.addEventListener('click', () => {
        if (!confirm('Are you sure you want to reset all checklist items?')) return;
        
        allCheckboxes.forEach(cb => {
            cb.checked = false;
            cb.closest('.checklist-item').classList.remove('completed');
        });
        
        ['floor', 'rack', 'dock', 'facility'].forEach(updateCardProgress);
        updateOverallProgress();
        updateStats();
       localStorage.removeItem('gudang_clean_state');
        
        showNotification('Checklist has been reset', 'info');
    });

    // ============================================
    // Submit Checklist
    // ============================================
    submitChecklistBtn?.addEventListener('click', () => {
        const total = allCheckboxes.length;
        const completed = document.querySelectorAll('.checklist-card .glass-checkbox:checked').length;
        
        if (completed < total) {
            showNotification(`Please complete all tasks (${completed}/${total})`, 'warning');
            return;
        }
        
        showNotification('Checklist submitted successfully!', 'success');
    });

    // ============================================
    // Logout
    // ============================================
    logoutBtn?.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            window.location.href = 'index.html';
        }
    });

    // ============================================
    // Notification System
    // ============================================
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

    // ============================================
    // Initialize on Load
    // ============================================
    loadFromLocalStorage();
    updateStats();
}

