/* ============================================
   SIDEBAR LOADER - KOMPONEN TERPISAH
   ============================================ */

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
        setupSidebarNavigation(); // <-- Fungsi navigasi yang diperbaiki
        updateSidebarUserInfo();
        setupCategoryFilter();
        
    } catch (error) {
        console.error('Error loading sidebar:', error);
        slot.innerHTML = '<div class="p-6 text-red-400 text-sm">Gagal memuat menu. Periksa koneksi.</div>';
    }
}

// FUNGSI NAVIGASI YANG AMAN (TIDAK MEMBATALKAN DEFAULT BROWSER)
function setupSidebarNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // KITA TIDAK MENGGUNAKAN e.preventDefault()
            // Biarkan browser melakukan navigasi secara normal.
            // Kita hanya bertugas menutup sidebar agar UI rapi.
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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSidebar);
} else {
    loadSidebar();
}
