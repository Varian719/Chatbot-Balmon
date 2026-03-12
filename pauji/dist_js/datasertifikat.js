document.addEventListener('DOMContentLoaded', () => {
    const apiUrl2025 = 'https://sheetdb.io/api/v1/ml164syp68tzk?sheet=2025';
    const apiUrl2026 = 'https://sheetdb.io/api/v1/ml164syp68tzk?sheet=2026';
    let allData = [];

    // Fetch data from API for both sheets
    Promise.all([
        fetch(apiUrl2025).then(res => res.json()).then(data => data.map(r => ({ ...r, _sheetYear: '2025' }))).catch(() => []),
        fetch(apiUrl2026).then(res => res.json()).then(data => data.map(r => ({ ...r, _sheetYear: '2026' }))).catch(() => [])
    ])
        .then(([data2025, data2026]) => {
            const d1 = Array.isArray(data2025) ? data2025 : [];
            const d2 = Array.isArray(data2026) ? data2026 : [];

            const combinedData = [...d1, ...d2];

            // Filter out truly empty rows
            allData = combinedData.filter(row => row['Nama Pemilik'] || row['Client ID'] || row['No Sertifikat']);
            applyFilters();
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            document.getElementById('tableBody').innerHTML = '<tr><td colspan="6" class="loading-text" style="color:var(--danger-color);">Gagal memuat data. Silakan coba lagi nanti.</td></tr>';
        });

    // Search and Filter functionality
    function applyFilters() {
        const searchInputBox = document.getElementById('searchInputData');
        const searchTerm = searchInputBox ? searchInputBox.value.toLowerCase().trim() : '';
        const yearFilterEl = document.getElementById('yearFilter');
        const yearFilter = yearFilterEl ? yearFilterEl.value : 'semua';

        if (!searchTerm) {
            renderEmptyState();
            return;
        }

        const filteredData = allData.filter(row => {
            // Filter by year
            if (yearFilter !== 'semua' && row._sheetYear !== yearFilter) {
                return false;
            }

            // Filter strictly by EXACT search term
            const namaPemilik = String(row['Nama Pemilik'] || '').toLowerCase().trim();
            const noSertifikat = String(row['No Sertifikat'] || '').toLowerCase().trim();

            return namaPemilik === searchTerm || noSertifikat === searchTerm;
        });
        renderTable(filteredData);
    }

    const searchInputEl = document.getElementById('searchInputData');
    if (searchInputEl) {
        searchInputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                applyFilters();
            }
        });
    }
    const yearFilterEl = document.getElementById('yearFilter');
    if (yearFilterEl) {
        yearFilterEl.addEventListener('change', applyFilters);
    }

    function renderEmptyState() {
        const tbody = document.getElementById('tableBody');
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="7" class="loading-text">Masukkan nomor sertifikat atau nama lengkap</td></tr>';

        let countCetakSudah = 0;
        let countCetakBelum = 0;
        let countAmbilSudah = 0;
        let countAmbilBelum = 0;

        allData.forEach((row) => {
            const statusPermohonanStr = (row['Status Permohonan'] || '').trim().toLowerCase();
            const statusStr = (row['Status'] || '').trim().toLowerCase();

            // Status Pencetakan
            if (statusPermohonanStr === 'telah dicetak') {
                countCetakSudah++;
            } else {
                countCetakBelum++;
            }

            // Status Pengambilan
            if (statusStr.includes('sudah diambil') || statusStr.includes('sudah diselesaikan') || statusStr.includes('selesai')) {
                countAmbilSudah++;
            } else {
                countAmbilBelum++;
            }
        });

        const cetakSudahEl = document.getElementById('countCetakSudah');
        const cetakBelumEl = document.getElementById('countCetakBelum');
        const ambilSudahEl = document.getElementById('countAmbilSudah');
        const ambilBelumEl = document.getElementById('countAmbilBelum');

        if (cetakSudahEl) cetakSudahEl.textContent = countCetakSudah;
        if (cetakBelumEl) cetakBelumEl.textContent = countCetakBelum;
        if (ambilSudahEl) ambilSudahEl.textContent = countAmbilSudah;
        if (ambilBelumEl) ambilBelumEl.textContent = countAmbilBelum;
    }

    function renderTable(data) {
        const tbody = document.getElementById('tableBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="loading-text">Data yang dicari tidak ditemukan.</td></tr>';

            const cetakSudahEl = document.getElementById('countCetakSudah');
            const cetakBelumEl = document.getElementById('countCetakBelum');
            const ambilSudahEl = document.getElementById('countAmbilSudah');
            const ambilBelumEl = document.getElementById('countAmbilBelum');

            if (cetakSudahEl) cetakSudahEl.textContent = 0;
            if (cetakBelumEl) cetakBelumEl.textContent = 0;
            if (ambilSudahEl) ambilSudahEl.textContent = 0;
            if (ambilBelumEl) ambilBelumEl.textContent = 0;

            return;
        }

        let countCetakSudah = 0;
        let countCetakBelum = 0;
        let countAmbilSudah = 0;
        let countAmbilBelum = 0;

        data.forEach((row, index) => {
            const tr = document.createElement('tr');

            const statusPermohonanStr = (row['Status Permohonan'] || '').trim().toLowerCase();
            const statusStr = (row['Status'] || '').trim().toLowerCase();

            let labelCetak = 'Belum Dicetak';
            let badgeCetak = 'status-merah';
            let labelAmbil = 'Belum Diambil';
            let badgeAmbil = 'status-merah';

            if (statusPermohonanStr === 'telah dicetak') {
                labelCetak = 'Sudah Dicetak';
                badgeCetak = 'status-hijau';
                countCetakSudah++;
            } else {
                countCetakBelum++;
            }

            if (statusStr.includes('sudah diambil') || statusStr.includes('sudah diselesaikan') || statusStr.includes('selesai')) {
                labelAmbil = 'Sudah Diambil';
                badgeAmbil = 'status-hijau';
                countAmbilSudah++;
            } else {
                countAmbilBelum++;
            }

            tr.innerHTML = `
                <td>${row['No'] || (index + 1)}</td>
                <td>${row['Client ID'] || '-'}</td>
                <td>${row['No Sertifikat'] || '-'}</td>
                <td style="font-weight: 500;">${row['Nama Pemilik'] || '-'}</td>
                <td>${row['Jenis Permohonan'] || '-'}</td>
                <td><span class="status-badge ${badgeCetak}">${labelCetak}</span></td>
                <td><span class="status-badge ${badgeAmbil}">${labelAmbil}</span></td>
            `;
            tbody.appendChild(tr);
        });

        const cetakSudahEl = document.getElementById('countCetakSudah');
        const cetakBelumEl = document.getElementById('countCetakBelum');
        const ambilSudahEl = document.getElementById('countAmbilSudah');
        const ambilBelumEl = document.getElementById('countAmbilBelum');

        if (cetakSudahEl) cetakSudahEl.textContent = countCetakSudah;
        if (cetakBelumEl) cetakBelumEl.textContent = countCetakBelum;
        if (ambilSudahEl) ambilSudahEl.textContent = countAmbilSudah;
        if (ambilBelumEl) ambilBelumEl.textContent = countAmbilBelum;
    }
});

// Hide loader after a moment, since API will load
window.addEventListener('load', function () {
    setTimeout(function () {
        var loader = document.getElementById('pageLoader');
        if (loader) {
            loader.style.transition = 'opacity 0.5s ease';
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 500);
        }
    }, 500);
});

// Handle navigation helpers for simple pages without large script setup
function handleMobileMenuItem(el, page) {
    window.location.href = page + '.html';
}
function toggleMobileMenu() {
    const dropdown = document.getElementById('mobileNavDropdown');
    const overlay = document.getElementById('mobileNavOverlay');
    if (dropdown) dropdown.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
}
function closeMobileMenu() {
    const dropdown = document.getElementById('mobileNavDropdown');
    const overlay = document.getElementById('mobileNavOverlay');
    if (dropdown) dropdown.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}
function toggleMobileSubmenu(el) {
    el.classList.toggle('active');
    const nextEl = el.nextElementSibling;
    if (nextEl && nextEl.classList.contains('mobile-submenu')) {
        nextEl.classList.toggle('active');
    }
}
const mobileOverlay = document.getElementById('mobileNavOverlay');
if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMobileMenu);
}
function openSearch() {
    const overlay = document.getElementById('searchOverlay');
    if (overlay) overlay.classList.add('active');
}
function closeSearch() {
    const overlay = document.getElementById('searchOverlay');
    if (overlay) overlay.classList.remove('active');
}

// HEADER SCROLL
let tickingHeader = false;
function updateHeaderScroll() {
    const scrollY = window.scrollY;
    const header = document.getElementById('mainHeader');
    const chatBtn = document.getElementById('toggleBtn');
    const footer = document.getElementById('mainFooter');

    if (header) {
        if (scrollY > 50) header.classList.add('header-minimal');
        else header.classList.remove('header-minimal');
    }
    if (footer && chatBtn) {
        const footerRect = footer.getBoundingClientRect();
        if (footerRect.top < window.innerHeight) chatBtn.classList.add('on-footer');
        else chatBtn.classList.remove('on-footer');
    }
    tickingHeader = false;
}
window.addEventListener('scroll', function () {
    if (!tickingHeader) {
        window.requestAnimationFrame(updateHeaderScroll);
        tickingHeader = true;
    }
}, { passive: true });

// CHAT TOGGLE
function animateChatToggle() {
    const btn = document.getElementById("toggleBtn");
    const box = document.getElementById("chatBox");
    const iframe = document.getElementById("chatFrame");

    if (iframe && !iframe.getAttribute('src')) {
        iframe.setAttribute('src', iframe.getAttribute('data-src'));
    }

    if (btn && box) {
        if (btn.classList.contains("active")) {
            btn.classList.remove("active");
            box.classList.remove("active");
            return;
        }
        btn.classList.add("active");
        box.classList.add("active");
    }
}
