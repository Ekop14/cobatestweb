// ==========================================
// script.js - VERSI FINAL (Sesuai Skema DB)
// ==========================================

let filteredReports = [];

document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 Script berhasil dimuat");

    // 1. DETEKSI HALAMAN SAAT INI
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    const supabase = window.supabaseClient;
    if (!supabase) {
        console.error("❌ Supabase client tidak ditemukan. Pastikan config.js dimuat sebelum script.js");
        return;
    }

    // 2. CEK SESI LOGIN (Mencegah Infinite Loop)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (!session && currentPage !== 'index.html' && currentPage !== 'register.html') {
            console.log("🔒 Tidak ada sesi, redirect ke index.html");
            window.location.replace('index.html');
            return;
        }
        if (session && (currentPage === 'index.html' || currentPage === 'register.html')) {
            console.log("✅ Sudah login, redirect ke dashboard.html");
            window.location.replace('dashboard.html');
            return;
        }

        // 3. JALANKAN LOGIKA KHUSUS HALAMAN
        if (currentPage === 'laporan.html') initLaporanPage(session);
        else if (currentPage === 'index.html') initLoginPage(session);
        else if (currentPage === 'register.html') initRegisterPage(session);
        else if (currentPage === 'dashboard.html') initDashboardPage(session);
        else if (currentPage === 'checklist.html') initChecklistPage(session);
    });
});

// ==========================================
// FUNGSI INIT HALAMAN CHECKLIST
// ==========================================
function initChecklistPage(session) {
    console.log("📋 Memuat halaman Checklist...");

    // 1. PERBAIKI: Ganti "Memuat tanggal..." dengan tanggal hari ini
    const dateDisplay = document.getElementById('currentDateDisplay');
    if (dateDisplay) {
        const today = new Date().toLocaleDateString('id-ID', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        dateDisplay.textContent = today;
    }

    updateSidebarUser(session.user);

    // 2. Logika Checkbox & Progress Bar
    const checkboxes = document.querySelectorAll('.checklist-checkbox');
    const totalItems = checkboxes.length;

    const totalCountEl = document.getElementById('totalCount');
    const completedCountEl = document.getElementById('completedCount');
    const progressTextEl = document.getElementById('overallProgressText');
    const progressBarEl = document.getElementById('overallProgressBar');

    if (totalCountEl) totalCountEl.textContent = totalItems;

    function updateProgress() {
        const completed = document.querySelectorAll('.checklist-checkbox:checked').length;
        const percentage = totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0;

        if (completedCountEl) completedCountEl.textContent = completed;
        if (progressTextEl) progressTextEl.textContent = percentage + '%';
        if (progressBarEl) progressBarEl.style.width = percentage + '%';
    }

    checkboxes.forEach(cb => cb.addEventListener('change', updateProgress));
    updateProgress();

    // 3. Logika Tombol "Kirim Laporan" (SESUAI SKEMA DB)
    const submitBtn = document.getElementById('submitChecklistBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            const completed = document.querySelectorAll('.checklist-checkbox:checked').length;
            const percentage = totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0;
            const status = percentage === 100 ? 'completed' : 'partial';

            if (!confirm(`Anda yakin ingin mengirim laporan?\nProgress saat ini: ${percentage}%`)) {
                return;
            }

            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px;"></div> Mengirim...';

            // ✅ Kumpulkan data per zona (opsional, untuk JSONB)
            const floorItems = collectZoneItems('floor');
            const rackItems = collectZoneItems('rack');
            const dockItems = collectZoneItems('dock');
            const facilityItems = collectZoneItems('facility');

            // ✅ DATA SESUAI SKEMA 'checklist_submissions'
            const submissionData = {
                user_name: session.user.user_metadata?.full_name || session.user.email,
                user_email: session.user.email,
                total_items: totalItems,
                completed_items: completed,
                progress_percentage: percentage,
                status: status,
                submission_time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                // Opsional: detail per zona (JSONB)
                floor_items: floorItems,
                rack_items: rackItems,
                dock_items: dockItems,
                facility_items: facilityItems
                // Catatan: 'id' dan 'created_at' otomatis diisi Supabase
            };

            try {
                const { error } = await window.supabaseClient
                    .from('checklist_submissions')
                    .insert([submissionData]);

                if (error) throw error;

                alert('✅ Laporan berhasil dikirim ke database!');
                window.location.href = 'dashboard.html';

            } catch (error) {
                console.error("❌ Gagal mengirim laporan:", error);
                alert('❌ Gagal mengirim laporan: ' + error.message);
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }
}

// ==========================================
// HELPER: Kumpulkan item checklist per zona
// ==========================================
function collectZoneItems(zone) {
    const zoneCheckboxes = document.querySelectorAll(`.checklist-checkbox[data-zone="${zone}"]`);
    const items = [];
    zoneCheckboxes.forEach(cb => {
        const label = cb.closest('.checklist-item')?.querySelector('.checklist-text')?.textContent || 'Item';
        items.push({
            label: label,
            checked: cb.checked
        });
    });
    return items;
}

// ==========================================
// FUNGSI INIT HALAMAN DASHBOARD
// ==========================================
async function initDashboardPage(session) {
    console.log("📊 Memuat halaman Dashboard...");
    updateSidebarUser(session.user);

    const welcomeEl = document.getElementById('welcomeUser');
    if (welcomeEl) {
        const name = session.user.user_metadata?.full_name || session.user.email.split('@')[0];
        welcomeEl.textContent = `Selamat Datang, ${name}! 👋`;
    }

    // Load 5 aktivitas terbaru
    const { data, error } = await window.supabaseClient
        .from('checklist_submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (!error && data) {
        const tbody = document.querySelector('#recentActivityTable tbody');
        if (tbody) {
            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center py-6 text-white/50">Belum ada aktivitas checklist</td></tr>';
            } else {
                tbody.innerHTML = data.map(row => {
                    const timeStr = row.submission_time || new Date(row.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                    const dateStr = new Date(row.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

                    return `
                    <tr class="border-b border-white/5 hover:bg-white/5 transition">
                        <td class="px-4 py-3 text-sm">${row.user_name || 'User'}</td>
                        <td class="px-4 py-3 text-sm text-white/60">${dateStr} ${timeStr}</td>
                        <td class="px-4 py-3 text-sm font-semibold ${row.progress_percentage === 100 ? 'text-green-400' : 'text-amber-400'}">${row.progress_percentage}%</td>
                        <td class="px-4 py-3 text-sm">
                            <span class="px-2 py-1 rounded-full text-xs ${row.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}">
                                ${row.status === 'completed' ? 'Selesai' : 'Proses'}
                            </span>
                        </td>
                    </tr>`;
                }).join('');
            }
        }
    }
}

// ==========================================
// HELPER: UPDATE SIDEBAR USER
// ==========================================
function updateSidebarUser(user) {
    const nameEl = document.getElementById('sidebarUserName');
    const emailEl = document.getElementById('sidebarUserEmail');
    const avatarEl = document.getElementById('userAvatar');

    const displayName = user.user_metadata?.full_name || user.email;

    if (nameEl) nameEl.textContent = displayName;
    if (emailEl) emailEl.textContent = user.email;
    if (avatarEl) avatarEl.textContent = displayName.charAt(0).toUpperCase();
}

// ==========================================
// FUNGSI INIT HALAMAN LOGIN
// ==========================================
function initLoginPage(session) {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const submitBtn = document.getElementById('submitBtn');
            const btnText = document.getElementById('btnText');

            submitBtn.disabled = true;
            btnText.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px;"></div> Memproses...';

            const { error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
            if (error) {
                alert("Login gagal: " + error.message);
                submitBtn.disabled = false;
                btnText.textContent = 'Masuk';
            } else {
                window.location.replace('dashboard.html');
            }
        });
    }

    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
        });
    }
}

function initRegisterPage(session) {
    console.log("📝 Memuat halaman Register...");
    // Tambahkan logika form register di sini jika diperlukan
}

// ==========================================
// FUNGSI INIT HALAMAN LAPORAN
// ==========================================
function initLaporanPage(session) {
    updateSidebarUser(session.user);
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const filterFrom = document.getElementById('filterFrom');
    const filterTo = document.getElementById('filterTo');
    if (filterFrom) filterFrom.value = thirtyDaysAgo.toISOString().split('T')[0];
    if (filterTo) filterTo.value = today.toISOString().split('T')[0];

    loadReports();

    const applyFilterBtn = document.getElementById('applyFilterBtn');
    if (applyFilterBtn) applyFilterBtn.addEventListener('click', loadReports);

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (!confirm('Yakin ingin keluar dari akun?')) return;
            await window.supabaseClient.auth.signOut();
            window.location.replace('index.html');
        });
    }
}

async function loadReports() {
    const supabase = window.supabaseClient;
    const filterFrom = document.getElementById('filterFrom');
    const filterTo = document.getElementById('filterTo');
    const from = filterFrom ? filterFrom.value : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const to = filterTo ? filterTo.value : new Date().toISOString().split('T')[0];

    const tableBody = document.getElementById('reportsTableBody');
    if (tableBody) {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-8"><div class="spinner mx-auto"></div><p class="text-white/50 mt-2">Memuat data...</p></td></tr>`;
    }

    try {
        const { data, error } = await supabase
            .from('checklist_submissions')
            .select('*')
            .gte('created_at', from + 'T00:00:00')
            .lte('created_at', to + 'T23:59:59')
            .order('created_at', { ascending: false });

        if (error) throw error;

        filteredReports = data || [];
        renderReports(filteredReports);
        updateReportStats(filteredReports);

    } catch (error) {
        console.error("Error loading reports:", error);
        if (tableBody) tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-red-400 py-8">Gagal memuat data: ${error.message}</td></tr>`;
    }
}

function renderReports(reports) {
    const tableBody = document.getElementById('reportsTableBody');
    if (!tableBody) return;
    if (reports.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-white/50 py-8">Tidak ada laporan pada periode ini</td></tr>`;
        return;
    }

    tableBody.innerHTML = reports.map(r => {
        const date = new Date(r.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
        const time = r.submission_time || new Date(r.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const statusColor = r.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400';
        const progressColor = r.progress_percentage === 100 ? 'text-green-400' : (r.progress_percentage >= 50 ? 'text-amber-400' : 'text-red-400');

        return `<tr>
            <td class="px-4 py-3 text-sm">${date}</td>
            <td class="px-4 py-3 text-sm font-mono text-white/70">${time}</td>
            <td class="px-4 py-3 text-sm">${r.user_name || '-'}</td>
            <td class="px-4 py-3 text-sm text-center">${r.total_items || 0}</td>
            <td class="px-4 py-3 text-sm text-center text-green-400 font-medium">${r.completed_items || 0}</td>
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

    const statTotal = document.getElementById('statTotalReports');
    const statCompleted = document.getElementById('statCompletedReports');
    const statAvg = document.getElementById('statAvgProgress');
    const statUsers = document.getElementById('statActiveUsers');

    if (statTotal) statTotal.textContent = total;
    if (statCompleted) statCompleted.textContent = completed;
    if (statAvg) statAvg.textContent = avg + '%';
    if (statUsers) statUsers.textContent = users;
}
