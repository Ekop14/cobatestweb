// ==========================================
// SCRIPT UTAMA HALAMAN LAPORAN
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 Script laporan.html berhasil dimuat");
    
    initSidebar();
    checkUserSession();
    loadReportData(); // Memuat data ke tabel
    setupEventListeners();
});

// --- 1. SIDEBAR LOGIC (AMAN) ---
function initSidebar() {
    const toggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (toggle && sidebar && overlay) {
        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
        });

        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }
}

// --- 2. USER SESSION LOGIC (AMAN - FIX ERROR LINE 1072) ---
function checkUserSession() {
    const userDisplay = document.getElementById('currentUserDisplay');
    const userPicInput = document.getElementById('inputPIC');
    const logoutBtn = document.getElementById('logoutBtn');

    // Ambil data user dari localStorage (atau sesuaikan dengan session Supabase)
    const user = JSON.parse(localStorage.getItem('user_session') || '{"name":"Admin Gudang", "email":"admin@gudang.com"}');
    const userName = user.name || user.email || 'Guest';

    // Hanya ubah jika elemen tersebut benar-benar ada di halaman ini
    if (userDisplay) {
        userDisplay.textContent = userName;
    }
    
    if (userPicInput) {
        userPicInput.value = userName;
    }

    // Setup tombol logout secara aman
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('user_session');
            window.location.href = 'index.html'; // Ganti dengan halaman login kamu
        });
    }
}

// --- 3. LOAD DATA LAPORAN (SIMULASI / SUPABASE) ---
function loadReportData() {
    const tableBody = document.getElementById('reportsTableBody');
    const countText = document.getElementById('reportCountText');
    
    // Update Stats Cards (Aman)
    const statTotal = document.getElementById('statTotalReports');
    const statCompleted = document.getElementById('statCompletedReports');
    const statAvg = document.getElementById('statAvgProgress');
    const statUsers = document.getElementById('statActiveUsers');

    // --- CONTOH DATA (Ganti bagian ini dengan fetch dari Supabase nanti) ---
    const mockReports = [
        { date: '2024-10-25', time: '08:00 AM', user: 'Budi Santoso', total: 10, done: 10, progress: 100, status: 'Selesai' },
        { date: '2024-10-25', time: '01:00 PM', user: 'Budi Santoso', total: 10, done: 8, progress: 80, status: 'Proses' },
        { date: '2024-10-26', time: '08:00 AM', user: 'Siti Aminah', total: 10, done: 10, progress: 100, status: 'Selesai' }
    ];
    // -----------------------------------------------------------------------

    if (statTotal) statTotal.textContent = mockReports.length;
    if (statCompleted) statCompleted.textContent = mockReports.filter(r => r.progress === 100).length;
    if (statAvg) statAvg.textContent = Math.round(mockReports.reduce((acc, curr) => acc + curr.progress, 0) / mockReports.length) + '%';
    if (statUsers) statUsers.textContent = '1'; // Bisa dihitung unik dari data
    
    if (countText) countText.textContent = `Menampilkan ${mockReports.length} data laporan`;

    // Render Tabel
    if (tableBody) {
        tableBody.innerHTML = ''; // Kosongkan loading spinner
        
        if (mockReports.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-white/50">Belum ada data laporan.</td></tr>`;
            return;
        }

        mockReports.forEach(report => {
            const statusColor = report.progress === 100 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-amber-500/20 text-amber-400';
            
            const statusText = report.progress === 100 ? 'Selesai' : 'Proses';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-4 py-3">${report.date}</td>
                <td class="px-4 py-3 text-white/70">${report.time}</td>
                <td class="px-4 py-3">${report.user}</td>
                <td class="px-4 py-3 text-center">${report.total}</td>
                <td class="px-4 py-3 text-center text-green-400 font-medium">${report.done}</td>
                <td class="px-4 py-3 text-center">
                    <span class="px-2 py-1 rounded-full text-xs font-semibold ${statusColor}">${report.progress}%</span>
                </td>
                <td class="px-4 py-3 text-center">
                    <span class="px-2 py-1 rounded-full text-xs font-semibold ${statusColor}">${statusText}</span>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Aktifkan tombol export jika ada data
        const pdfBtn = document.getElementById('downloadPdfBtn');
        const excelBtn = document.getElementById('downloadExcelBtn');
        if (pdfBtn) pdfBtn.disabled = false;
        if (excelBtn) excelBtn.disabled = false;
    }
}

// --- 4. EVENT LISTENERS (AMAN - FIX ERROR LINE 1103) ---
function setupEventListeners() {
    // Filter Button
    const applyFilterBtn = document.getElementById('applyFilterBtn');
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', () => {
            const from = document.getElementById('filterFrom')?.value;
            const to = document.getElementById('filterTo')?.value;
            console.log(`Filter diterapkan: ${from} s/d ${to}`);
            // Panggil fungsi loadReportData() dengan parameter filter di sini nanti
            alert(`Filter diterapkan untuk tanggal ${from || 'Awal'} sampai ${to || 'Akhir'}`);
        });
    }

    // Download PDF Button
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', () => {
            alert('Fitur Export PDF akan segera diproses!');
            // Logika jsPDF di sini
        });
    }

    // Download Excel Button
    const downloadExcelBtn = document.getElementById('downloadExcelBtn');
    if (downloadExcelBtn) {
        downloadExcelBtn.addEventListener('click', () => {
            alert('Fitur Export Excel akan segera diproses!');
            // Logika SheetJS (xlsx) di sini
        });
    }
}
