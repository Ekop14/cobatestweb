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

    // Sidebar Mobile
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

    // Filter Kategori
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

    // Search
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

    // Checkbox Logic
    allCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            checkbox.closest('.checklist-item').classList.toggle('completed', checkbox.checked);
            updateCardProgress(checkbox.dataset.card);
            updateOverallProgress();
            updateStats();
            saveState();
        });
    });

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
        
        document.getElementById('overallProgressBar').style.width = percent + '%';
        document.getElementById('overallProgressText').textContent = percent + '%';
        document.getElementById('completedCount').textContent = checked;
        document.getElementById('totalCount').textContent = total;
    }

    function updateStats() {
        const total = allCheckboxes.length;
        const checked = document.querySelectorAll('.checklist-card .glass-checkbox:checked').length;
        document.getElementById('statTotal').textContent = total;
        document.getElementById('statCompleted').textContent = checked;
        document.getElementById('statPending').textContent = total - checked;
        document.getElementById('statProgress').textContent = (total ? Math.round((checked / total) * 100) : 0) + '%';
    }

    function saveState() {
        const state = {};
        allCheckboxes.forEach((cb, i) => state[`cb_${i}`] = cb.checked);
        localStorage.setItem('gudang_clean_state', JSON.stringify(state));
    }

    function loadState() {
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
    });

    submitChecklistBtn?.addEventListener('click', () => {
        const total = allCheckboxes.length;
        const checked = document.querySelectorAll('.checklist-card .glass-checkbox:checked').length;
        if (checked < total) {
            alert(`Selesaikan semua tugas dulu (${checked}/${total})`);
            return;
        }
        alert('Laporan kebersihan berhasil dikirim! ✅');
    });

    logoutBtn?.addEventListener('click', () => {
        if (confirm('Logout?')) window.location.href = 'index.html';
    });

    loadState();
    updateStats();
}
