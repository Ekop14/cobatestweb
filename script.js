// ============================================
// UTILITY FUNCTIONS
// ============================================
function showNotification(message, type = 'info') {
    const colors = {
        success: { bg: 'rgba(34, 197, 94, 0.2)', border: 'rgba(34, 197, 94, 0.4)' },
        warning: { bg: 'rgba(245, 158, 11, 0.2)', border: 'rgba(245, 158, 11, 0.4)' },
        error: { bg: 'rgba(239, 68, 68, 0.2)', border: 'rgba(239, 68, 68, 0.4)' },
        info: { bg: 'rgba(59, 130, 246, 0.2)', border: 'rgba(59, 130, 246, 0.4)' }
    };
    const c = colors[type] || colors.info;
    
    const el = document.createElement('div');
    el.className = 'notification';
    el.style.background = c.bg;
    el.style.borderColor = c.border;
    el.textContent = message;
    document.body.appendChild(el);
    
    setTimeout(() => {
        el.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => el.remove(), 300);
    }, 3000);
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
}

function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.add('open');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function updateSidebarUser() {
    if (!window.currentUser) return;
    const nameEl = document.getElementById('sidebarUserName');
    const emailEl = document.getElementById('sidebarUserEmail');
    const avatarEl = document.getElementById('userAvatar');
    
    if (nameEl) nameEl.textContent = window.currentUser.name || 'User';
    if (emailEl) emailEl.textContent = window.currentUser.email || '';
    if (avatarEl) avatarEl.textContent = (window.currentUser.name || 'U').charAt(0).toUpperCase();
}

async function checkAuth() {
    const { data: { session } } = await window.supabase.auth.getSession();
    if (!session) {
        window.location.href = 'index.html';
        return null;
    }
    
    let userName = session.user.user_metadata?.full_name;
    if (!userName) {
        try {
            const { data } = await window.supabase.from('profiles').select('full_name').eq('id', session.user.id).single();
            if (data?.full_name) userName = data.full_name;
        } catch (e) {}
    }
    
    window.currentUser = {
        name: userName || 'User',
        email: session.user.email,
        id: session.user.id
    };
    
    updateSidebarUser();
    return session;
}

// ============================================
// LOGIN PAGE
// ============================================
if (document.getElementById('loginForm')) {
    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('togglePassword');
    const eyeIcon = document.getElementById('eyeIcon');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    
    toggleBtn?.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        eyeIcon.innerHTML = type === 'text' 
            ? '<path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />'
            : '<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />';
    });
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        btnText.textContent = 'Memproses...';
        
        const { error } = await window.supabase.auth.signInWithPassword({
            email: emailInput.value,
            password: passwordInput.value
        });
        
        if (error) {
            showNotification(error.message, 'error');
            submitBtn.disabled = false;
            btnText.textContent = 'Masuk';
        } else {
            showNotification('Login berhasil!', 'success');
            setTimeout(() => window.location.href = 'checklist.html', 1000);
        }
    });
}

// ============================================
// REGISTER PAGE
// ============================================
if (document.getElementById('registerForm')) {
    const form = document.getElementById('registerForm');
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');
    const toggleBtn = document.getElementById('togglePassword');
    const eyeIcon = document.getElementById('eyeIcon');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    
    toggleBtn?.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        confirmInput.type = type;
        eyeIcon.innerHTML = type === 'text' 
            ? '<path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />'
            : '<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />';
    });
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (passwordInput.value !== confirmInput.value) {
            showNotification('Password tidak cocok', 'error');
            return;
        }
        
        submitBtn.disabled = true;
        btnText.textContent = 'Mendaftar...';
        
        const { error } = await window.supabase.auth.signUp({
            email: emailInput.value,
            password: passwordInput.value,
            options: { data: { full_name: fullNameInput.value } }
        });
        
        if (error) {
            showNotification(error.message, 'error');
            submitBtn.disabled = false;
            btnText.textContent = 'Daftar Sekarang';
        } else {
            showNotification('Registrasi berhasil! Silakan login.', 'success');
            setTimeout(() => window.location.href = 'index.html', 2000);
        }
    });
}

// ============================================
// CHECKLIST PAGE
// ============================================
if (document.getElementById('checklistGrid')) {
    (async () => {
        const session = await checkAuth();
        if (!session) return;
        
        const sidebar = document.getElementById('sidebar');
        const menuToggle = document.getElementById('menuToggle');
        const overlay = document.getElementById('sidebarOverlay');
        const logoutBtn = document.getElementById('logoutBtn');
        const categoryBtns = document.querySelectorAll('.category-btn');
        const checklistCards = document.querySelectorAll('.checklist-card');
        const allCheckboxes = document.querySelectorAll('.checklist-card .glass-checkbox');
        const resetBtn = document.getElementById('resetBtn');
        const submitBtn = document.getElementById('submitBtn');
        const searchInput = document.getElementById('searchInput');
        
        // Sidebar toggle
        menuToggle?.addEventListener('click', openSidebar);
        overlay?.addEventListener('click', closeSidebar);
        
        // Logout
        logoutBtn?.addEventListener('click', async () => {
            if (!confirm('Yakin ingin logout?')) return;
            await window.supabase.auth.signOut();
            window.location.href = 'index.html';
        });
        
        // Category filter
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const cat = btn.dataset.category;
                checklistCards.forEach(card => {
                    if (cat === 'all' || card.dataset.category === cat) {
                        card.classList.remove('hidden');
                    } else {
                        card.classList.add('hidden');
                    }
                });
            });
        });
        
        // Search
        searchInput?.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            checklistCards.forEach(card => {
                const items = card.querySelectorAll('.checklist-text');
                let hasMatch = false;
                items.forEach(item => {
                    if (item.textContent.toLowerCase().includes(query)) hasMatch = true;
                });
                card.classList.toggle('hidden', query && !hasMatch);
            });
        });
        
        // Checkbox logic
        function updateProgress() {
            const total = allCheckboxes.length;
            const checked = document.querySelectorAll('.checklist-card .glass-checkbox:checked').length;
            const percent = total ? Math.round((checked / total) * 100) : 0;
            
            const bar = document.getElementById('progressBar');
            const text = document.getElementById('progressText');
            const completed = document.getElementById('completedCount');
            const totalEl = document.getElementById('totalCount');
            const statTotal = document.getElementById('statTotal');
            const statCompleted = document.getElementById('statCompleted');
            const statPending = document.getElementById('statPending');
            const statProgress = document.getElementById('statProgress');
            
            if (bar) bar.style.width = percent + '%';
            if (text) text.textContent = percent + '%';
            if (completed) completed.textContent = checked;
            if (totalEl) totalEl.textContent = total;
            if (statTotal) statTotal.textContent = total;
            if (statCompleted) statCompleted.textContent = checked;
            if (statPending) statPending.textContent = total - checked;
            if (statProgress) statProgress.textContent = percent + '%';
            
            ['floor', 'rack', 'dock', 'facility'].forEach(cat => {
                const card = document.querySelector(`.checklist-card[data-category="${cat}"]`);
                if (card) {
                    const t = card.querySelectorAll('.glass-checkbox').length;
                    const c = card.querySelectorAll('.glass-checkbox:checked').length;
                    const fill = card.querySelector('.card-progress-fill');
                    if (fill) fill.style.width = t ? (c / t * 100) + '%' : '0%';
                }
            });
        }
        
        allCheckboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                cb.closest('.checklist-item').classList.toggle('completed', cb.checked);
                updateProgress();
            });
        });
        
        // Reset
        resetBtn?.addEventListener('click', () => {
            if (!confirm('Reset semua checklist?')) return;
            allCheckboxes.forEach(cb => {
                cb.checked = false;
                cb.closest('.checklist-item').classList.remove('completed');
            });
            updateProgress();
            showNotification('Checklist direset', 'info');
        });
        
        // Submit
        submitBtn?.addEventListener('click', async () => {
            const total = allCheckboxes.length;
            const checked = document.querySelectorAll('.checklist-card .glass-checkbox:checked').length;
            
            if (checked < total) {
                showNotification(`Selesaikan semua tugas (${checked}/${total})`, 'warning');
                return;
            }
            
            submitBtn.disabled = true;
            submitBtn.textContent = 'Mengirim...';
            
            const data = {
                user_name: window.currentUser.name,
                user_email: window.currentUser.email,
                floor_items: Array.from(document.querySelectorAll('[data-card="floor"]')).map(cb => ({ task: cb.nextElementSibling.textContent, checked: cb.checked })),
                rack_items: Array.from(document.querySelectorAll('[data-card="rack"]')).map(cb => ({ task: cb.nextElementSibling.textContent, checked: cb.checked })),
                dock_items: Array.from(document.querySelectorAll('[data-card="dock"]')).map(cb => ({ task: cb.nextElementSibling.textContent, checked: cb.checked })),
                facility_items: Array.from(document.querySelectorAll('[data-card="facility"]')).map(cb => ({ task: cb.nextElementSibling.textContent, checked: cb.checked })),
                total_items: total,
                completed_items: checked,
                progress_percentage: 100,
                status: 'completed'
            };
            
            const { error } = await window.supabase.from('checklist_submissions').insert(data);
            
            if (error) {
                showNotification('Gagal: ' + error.message, 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Kirim Laporan';
            } else {
                showNotification('Laporan terkirim! ✅', 'success');
                setTimeout(() => {
                    allCheckboxes.forEach(cb => {
                        cb.checked = false;
                        cb.closest('.checklist-item').classList.remove('completed');
                    });
                    updateProgress();
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Kirim Laporan';
                }, 1500);
            }
        });
        
        updateProgress();
    })();
}

// ============================================
// LAPORAN PAGE
// ============================================
if (document.getElementById('reportsTableBody')) {
    (async () => {
        const session = await checkAuth();
        if (!session) return;
        
        const sidebar = document.getElementById('sidebar');
        const menuToggle = document.getElementById('menuToggle');
        const overlay = document.getElementById('sidebarOverlay');
        const logoutBtn = document.getElementById('logoutBtn');
        const filterFrom = document.getElementById('filterFrom');
        const filterTo = document.getElementById('filterTo');
        const applyBtn = document.getElementById('applyFilterBtn');
        const pdfBtn = document.getElementById('downloadPdfBtn');
        const excelBtn = document.getElementById('downloadExcelBtn');
        const tableBody = document.getElementById('reportsTableBody');
        
        let filteredData = [];
        
        // Sidebar
        menuToggle?.addEventListener('click', openSidebar);
        overlay?.addEventListener('click', closeSidebar);
        
        // Logout
        logoutBtn?.addEventListener('click', async () => {
            if (!confirm('Yakin logout?')) return;
            await window.supabase.auth.signOut();
            window.location.href = 'index.html';
        });
        
        // Set default dates
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        filterFrom.value = thirtyDaysAgo.toISOString().split('T')[0];
        filterTo.value = today.toISOString().split('T')[0];
        
        async function loadReports() {
            const from = filterFrom.value;
            const to = filterTo.value;
            
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-8"><div class="spinner" style="margin: 0 auto;"></div></td></tr>';
            pdfBtn.disabled = true;
            excelBtn.disabled = true;
            
            const { data, error } = await window.supabase
                .from('checklist_submissions')
                .select('*')
                .gte('created_at', from + 'T00:00:00')
                .lte('created_at', to + 'T23:59:59')
                .order('created_at', { ascending: false });
            
            if (error) {
                tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-red-400 py-8">Error: ${error.message}</td></tr>`;
                return;
            }
            
            filteredData = data || [];
            renderTable(filteredData);
            updateStats(filteredData);
            
            const countText = document.getElementById('reportCountText');
            if (countText) countText.textContent = `${filteredData.length} laporan ditemukan`;
            
            pdfBtn.disabled = filteredData.length === 0;
            excelBtn.disabled = filteredData.length === 0;
        }
        
        function renderTable(data) {
            if (data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-8" style="color: rgba(255,255,255,0.5);">Tidak ada laporan</td></tr>';
                return;
            }
            
            tableBody.innerHTML = data.map(r => {
                const date = new Date(r.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
                const statusClass = r.status === 'completed' ? 'status-completed' : 'status-progress';
                const statusText = r.status === 'completed' ? 'Selesai' : 'Proses';
                const progressColor = r.progress_percentage === 100 ? '#86efac' : r.progress_percentage >= 50 ? '#fcd34d' : '#fca5a5';
                
                return `<tr>
                    <td>${date}</td>
                    <td>${r.user_name || '-'}</td>
                    <td style="text-align: center;">${r.total_items || 0}</td>
                    <td style="text-align: center;">${r.completed_items || 0}</td>
                    <td style="text-align: center; color: ${progressColor}; font-weight: 600;">${r.progress_percentage || 0}%</td>
                    <td style="text-align: center;"><span class="status-badge ${statusClass}">${statusText}</span></td>
                </tr>`;
            }).join('');
        }
        
        function updateStats(data) {
            const total = data.length;
            const completed = data.filter(r => r.status === 'completed').length;
            const avg = total > 0 ? Math.round(data.reduce((s, r) => s + (r.progress_percentage || 0), 0) / total) : 0;
            const users = new Set(data.map(r => r.user_email)).size;
            
            const el1 = document.getElementById('statTotalReports');
            const el2 = document.getElementById('statCompletedReports');
            const el3 = document.getElementById('statAvgProgress');
            const el4 = document.getElementById('statActiveUsers');
            
            if (el1) el1.textContent = total;
            if (el2) el2.textContent = completed;
            if (el3) el3.textContent = avg + '%';
            if (el4) el4.textContent = users;
        }
        
        applyBtn?.addEventListener('click', loadReports);
        
        pdfBtn?.addEventListener('click', () => {
            if (filteredData.length === 0) return;
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.setFontSize(16);
            doc.text('Laporan Kebersihan Gudang', 14, 20);
            doc.setFontSize(10);
            doc.text(`Periode: ${filterFrom.value} - ${filterTo.value}`, 14, 28);
            doc.autoTable({
                startY: 35,
                head: [['Tanggal', 'User', 'Total', 'Selesai', 'Progress', 'Status']],
                body: filteredData.map(r => [
                    new Date(r.created_at).toLocaleDateString('id-ID'),
                    r.user_name,
                    r.total_items,
                    r.completed_items,
                    r.progress_percentage + '%',
                    r.status === 'completed' ? 'Selesai' : 'Proses'
                ]),
                headStyles: { fillColor: [102, 126, 234] }
            });
            doc.save(`Laporan-${filterFrom.value}.pdf`);
            showNotification('PDF diunduh!', 'success');
        });
        
        excelBtn?.addEventListener('click', () => {
            if (filteredData.length === 0) return;
            const data = filteredData.map(r => ({
                'Tanggal': new Date(r.created_at).toLocaleDateString('id-ID'),
                'User': r.user_name,
                'Email': r.user_email,
                'Total': r.total_items,
                'Selesai': r.completed_items,
                'Progress': r.progress_percentage + '%',
                'Status': r.status === 'completed' ? 'Selesai' : 'Proses'
            }));
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(data);
            XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
            XLSX.writeFile(wb, `Laporan-${filterFrom.value}.xlsx`);
            showNotification('Excel diunduh!', 'success');
        });
        
        await loadReports();
    })();
}
