// ==========================================
// SCRIPT UTAMA HALAMAN LAPORAN (SUPABASE CONNECTED)
// ==========================================

let filteredReports = []; // Variabel global untuk menyimpan data yang difilter

document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 Script laporan berhasil dimuat");
    
    // Jika Anda menggunakan script.js terpusat, panggil initLaporanPage()
    // Jika file ini terpisah, jalankan logika di bawah:
    initLaporanPage();
});

function initLaporanPage() {
    const supabase = window.supabaseClient;
    if (!supabase) {
        console.error("Supabase client tidak ditemukan. Pastikan config.js dimuat.");
        return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (!session) { 
            window.location.replace('index.html'); 
            return; 
        }

        // 1. Setup User Info
        let userName = session.user.user_metadata?.full_name || session.user.email || 'User';
        window.currentUser = { name: userName, email: session.user.email };
        
        const userDisplay = document.getElementById('currentUserDisplay');
        if (userDisplay) userDisplay.textContent = userName;
        
        const userPicInput = document.getElementById('inputPIC');
        if (userPicInput) userPicInput.value = userName;

        // 2. Setup Default Date Filter (30 hari terakhir)
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        const filterFrom = document.getElementById('filterFrom');
        const filterTo = document.getElementById('filterTo');
        if (filterFrom) filterFrom.value = thirtyDaysAgo.toISOString().split('T')[0];
        if (filterTo) filterTo.value = today.toISOString().split('T')[0];

        // 3. Load Data
        await loadReports();

        // 4. Setup Event Listeners
        const applyFilterBtn = document.getElementById('applyFilterBtn');
        if (applyFilterBtn) {
            applyFilterBtn.addEventListener('click', loadReports);
        }

        const downloadPdfBtn = document.getElementById('downloadPdfBtn');
        if (downloadPdfBtn) {
            downloadPdfBtn.addEventListener('click', downloadPDF);
        }

        const downloadExcelBtn = document.getElementById('downloadExcelBtn');
        if (downloadExcelBtn) {
            downloadExcelBtn.addEventListener('click', downloadExcel);
        }

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                if (!confirm('Yakin ingin keluar dari akun?')) return;
                await supabase.auth.signOut();
                window.location.replace('index.html');
            });
        }
    });
}

async function loadReports() {
    const supabase = window.supabaseClient;
    const filterFrom = document.getElementById('filterFrom');
    const filterTo = document.getElementById('filterTo');
    
    const from = filterFrom ? filterFrom.value : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const to = filterTo ? filterTo.value : new Date().toISOString().split('T')[0];
    
    const tableBody = document.getElementById('reportsTableBody');
    const pdfBtn = document.getElementById('downloadPdfBtn');
    const excelBtn = document.getElementById('downloadExcelBtn');
    const countText = document.getElementById('reportCountText');

    // Tampilkan loading state
    if (tableBody) {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-8"><div class="spinner mx-auto"></div><p class="text-white/50 mt-2">Memuat data dari database...</p></td></tr>`;
    }
    if (pdfBtn) pdfBtn.disabled = true;
    if (excelBtn) excelBtn.disabled = true;

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
        
        if (countText) countText.textContent = `Menampilkan ${filteredReports.length} laporan`;
        if (pdfBtn) pdfBtn.disabled = filteredReports.length === 0;
        if (excelBtn) excelBtn.disabled = filteredReports.length === 0;
        
    } catch (error) {
        console.error("Error loading reports:", error);
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-red-400 py-8">Gagal memuat data: ${error.message}</td></tr>`;
        }
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

function downloadPDF() {
    if (filteredReports.length === 0) return;
    
    // Cek apakah library jsPDF sudah dimuat
    if (typeof window.jspdf === 'undefined') {
        alert('Library PDF belum dimuat. Pastikan script jsPDF ada di HTML.');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const filterFrom = document.getElementById('filterFrom');
    const filterTo = document.getElementById('filterTo');
    const from = filterFrom ? filterFrom.value : 'Awal';
    const to = filterTo ? filterTo.value : 'Akhir';
    
    doc.setFontSize(18); 
    doc.text('Laporan Kebersihan Gudang', 14, 20);
    doc.setFontSize(10); 
    doc.text(`Periode: ${from} s/d ${to}`, 14, 28);
    
    // Pastikan plugin autoTable tersedia
    if (typeof doc.autoTable !== 'function') {
        alert('Plugin jsPDF-AutoTable belum dimuat.');
        return;
    }

    doc.autoTable({
        startY: 35,
        head: [['Tanggal', 'Jam', 'User', 'Total', 'Selesai', 'Progress', 'Status']],
        body: filteredReports.map(r => [
            new Date(r.created_at).toLocaleDateString('id-ID'), 
            r.submission_time || new Date(r.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            r.user_name || '-', 
            r.total_items || 0, 
            r.completed_items || 0, 
            (r.progress_percentage || 0) + '%', 
            r.status === 'completed' ? 'Selesai' : 'Proses'
        ]),
        theme: 'grid',
        headStyles: { fillColor: [102, 126, 234] }
    });
    
    doc.save(`Laporan-Kebersihan-${from}-to-${to}.pdf`);
    showNotification('PDF berhasil diunduh! ✅', 'success');
}

function downloadExcel() {
    if (filteredReports.length === 0) return;
    
    // Cek apakah library XLSX sudah dimuat
    if (typeof window.XLSX === 'undefined') {
        alert('Library Excel belum dimuat. Pastikan script SheetJS ada di HTML.');
        return;
    }
    
    const filterFrom = document.getElementById('filterFrom');
    const filterTo = document.getElementById('filterTo');
    const from = filterFrom ? filterFrom.value : 'Awal';
    const to = filterTo ? filterTo.value : 'Akhir';
    
    const data = filteredReports.map(r => ({
        'Tanggal': new Date(r.created_at).toLocaleDateString('id-ID'),
        'Jam': r.submission_time || new Date(r.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        'User': r.user_name || '-',
        'Total Item': r.total_items || 0,
        'Selesai': r.completed_items || 0,
        'Progress': (r.progress_percentage || 0) + '%',
        'Status': r.status === 'completed' ? 'Selesai' : 'Proses'
    }));
    
    const wb = window.XLSX.utils.book_new();
    const ws = window.XLSX.utils.json_to_sheet(data);
    window.XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
    window.XLSX.writeFile(wb, `Laporan-Kebersihan-${from}-to-${to}.xlsx`);
    showNotification('Excel berhasil diunduh! ✅', 'success');
}

// Fallback untuk showNotification jika fungsi ini belum ada di file ini
if (typeof showNotification !== 'function') {
    function showNotification(message, type = 'info') {
        alert(message); // Fallback sederhana jika notifikasi custom belum tersedia
    }
}
