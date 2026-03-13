document.addEventListener('DOMContentLoaded', () => {
    // Konfigurasi API Google Sheets
    const API_KEY = 'AIzaSyBy4hLaBiigdYM5hE6DQfcnPmo6_2pb-cg';
    const SPREADSHEET_ID = '1mNz4Kzz-pi3vRAyoQxnm8pVYO3uPqpyshx_DlPDcdgc';
    
    // --- DAFTAR GID DITULIS MANUAL ---
    const SHEET_GIDS = {
      "2025": 592977247, "2026": 1445083747, "2027": 123005415,
      "2028": 1927547785, "2029": 1354748064, "2030": 1567790831,
      "2031": 1438376619, "2032": 1222971136, "2033": 1111357989,
      "2034": 1304395900, "2035": 393023817
    };
    
    let allData = [];

    // Fungsi pembantu untuk memanggil API Google Sheets dan merapikan datanya
    async function fetchSheetData(sheetName) {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/'${sheetName}'?key=${API_KEY}`;
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            
            const data = await res.json();
            if (!data.values || data.values.length < 2) return [];

            // Aman dari TypeError jika ada sel header kosong
            const headers = data.values[0].map(h => (h ? String(h).trim() : `Col_${Math.random()}`)); 
            const rows = data.values.slice(1);

            return rows.map(row => {
                let obj = { _sheetYear: sheetName };
                headers.forEach((header, index) => {
                    obj[header] = row[index] || '';
                });
                return obj;
            });
        } catch (error) {
            console.warn(`Sheet ${sheetName} gagal dimuat:`, error.message);
            return []; 
        }
    }

    // Ambil data berdasarkan daftar tahun yang ada di objek SHEET_GIDS secara dinamis
    const fetchPromises = Object.keys(SHEET_GIDS).map(year => fetchSheetData(year));

    Promise.all(fetchPromises)
        .then(results => {
            const combinedData = results.flat();
            // Filter baris yang benar-benar kosong (siluman)
            allData = combinedData.filter(row => row['Nama Pemilik'] || row['Client ID'] || row['No Sertifikat']);
            applyFilters();
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            const tbody = document.getElementById('tableBody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="7" class="loading-text" style="color:var(--danger-color);">Gagal memuat data dari server. Silakan muat ulang halaman.</td></tr>';
            }
        });

    // --- SEARCH & FILTER ---
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

            // MENGKEMBALIKAN LOGIKA ASLI: Filter strictly by EXACT search term
            const namaPemilik = String(row['Nama Pemilik'] || '').toLowerCase().trim();
            const noSertifikat = String(row['No Sertifikat'] || '').toLowerCase().trim();

            return namaPemilik === searchTerm || noSertifikat === searchTerm;
        });
        
        renderTable(filteredData);
    }

    // Event Listeners Pencarian
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

    // --- HELPER UNTUK MENGHITUNG STATISTIK (DRY Code) ---
    function updateStats(dataToCount) {
        let counts = { cetakSudah: 0, cetakBelum: 0, ambilSudah: 0, ambilBelum: 0 };

        dataToCount.forEach(row => {
            const statusPermohonanStr = String(row['Status Permohonan'] || '').trim().toLowerCase();
            const statusStr = String(row['Status'] || '').trim().toLowerCase();

            if (statusPermohonanStr === 'telah dicetak') counts.cetakSudah++;
            else counts.cetakBelum++;

            if (statusStr.includes('sudah diambil') || statusStr.includes('sudah diselesaikan') || statusStr.includes('selesai')) {
                counts.ambilSudah++;
            } else counts.ambilBelum++;
        });

        const els = {
            cetakSudah: document.getElementById('countCetakSudah'),
            cetakBelum: document.getElementById('countCetakBelum'),
            ambilSudah: document.getElementById('countAmbilSudah'),
            ambilBelum: document.getElementById('countAmbilBelum')
        };

        if (els.cetakSudah) els.cetakSudah.textContent = counts.cetakSudah;
        if (els.cetakBelum) els.cetakBelum.textContent = counts.cetakBelum;
        if (els.ambilSudah) els.ambilSudah.textContent = counts.ambilSudah;
        if (els.ambilBelum) els.ambilBelum.textContent = counts.ambilBelum;
    }

    // --- RENDER FUNCTIONS ---
    function renderEmptyState() {
        const tbody = document.getElementById('tableBody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="loading-text">Masukkan nomor sertifikat atau nama lengkap...</td></tr>';
        
        updateStats(allData);
    }

    function renderTable(data) {
        const tbody = document.getElementById('tableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="loading-text">Data yang dicari tidak ditemukan.</td></tr>';
            updateStats([]); // Reset angka ke 0 jika data tidak ditemukan
            return;
        }

        data.forEach((row, index) => {
            const tr = document.createElement('tr');
            const statusPermohonanStr = String(row['Status Permohonan'] || '').trim().toLowerCase();
            const statusStr = String(row['Status'] || '').trim().toLowerCase();

            let labelCetak = 'Belum Dicetak', badgeCetak = 'status-merah';
            let labelAmbil = 'Belum Diambil', badgeAmbil = 'status-merah';

            if (statusPermohonanStr === 'telah dicetak') {
                labelCetak = 'Sudah Dicetak'; badgeCetak = 'status-hijau';
            }
            if (statusStr.includes('sudah diambil') || statusStr.includes('sudah diselesaikan') || statusStr.includes('selesai')) {
                labelAmbil = 'Sudah Diambil'; badgeAmbil = 'status-hijau';
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

        updateStats(data);
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
function handleMobileMenuItem(el, page) { window.location.href = page + '.html'; }
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
if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileMenu);

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