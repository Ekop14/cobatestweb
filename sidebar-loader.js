/* ============================================
   SIDEBAR LOADER - KOMPONEN TERPISAH
   ============================================ */

// Fungsi navigasi yang DIJAMIN berfungsi di semua HP
function navigateTo(url) {
    // Tutup sidebar di mobile dulu
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar && window.innerWidth < 1024) {
        sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Jika URL sama dengan halaman saat ini, jangan reload
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (currentPage === url) return;
    
    // Navigasi dengan delay kecil agar animasi sidebar selesai
    setTimeout(() => {
        window.location.href = url;
    }, 100);
}

// Load sidebar dari file eksternal
async function loadSidebar() {
    const slot = document.getElementById('sidebar-slot');
    if (!slot) return;
    
    try {
        const response = await fetch('sidebar.html');
        if (!response.ok) throw new Error('Gagal memuat sidebar');
        const html = await response.text();
        slot.innerHTML = html;
        
        // Tandai menu aktif berdasarkan halaman saat ini
        highlightActiveMenu();
        
        // Setup toggle mobile
        setupSidebarToggle();
        
        // Update info user jika sudah login
        updateSidebarUserInfo();
        
        // Setup filter area (jika ada di halaman checklist)
        setupCategoryFilter();
        
    } catch (error) {
        console.error('Error loading sidebar:', error);
        slot.innerHTML = '<div class="p-6 text-red-400">Gagal memuat menu</div>';
    }
}

// Tandai menu yang sedang aktif
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

// Setup toggle sidebar untuk mobile
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

// Update info user di sidebar
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

// Setup filter kategori (untuk halaman checklist)
function setupCategoryFilter() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const checklistCards = document.querySelectorAll('.checklist-card');
    
    if (categoryButtons.length === 0) return;
    
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryButtons.forEach(b => b.classList.remove('active', 'bg-white/10', 'text-white', 'border', 'border-white/10'));
            categoryButtons.forEach(b => b.classList.add('text-white/60'));
            
            btn.classList.add('active', 'bg-white/10', 'text-white', 'border', 'border-white/10');
            btn.classList.remove('text-white/60');
            
            checklistCards.forEach(card => {
                const show = btn.dataset.category === 'all' || card.dataset.category === btn.dataset.category;
                card.classList.toggle('hidden-card', !show);
            });
        });
    });
}

// Fungsi untuk update progress bar di sidebar (dipanggil dari script.js)
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

// Auto-load sidebar saat DOM siap
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSidebar);
} else {
    loadSidebar();
}
