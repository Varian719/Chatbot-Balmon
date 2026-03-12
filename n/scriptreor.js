
        document.addEventListener('DOMContentLoaded', () => {
            // 1. MASUKKAN SPREADSHEET ID ANDA
            const SPREADSHEET_ID = '1mNz4Kzz-pi3vRAyoQxnm8pVYO3uPqpyshx_DlPDcdgc'; 
            
            // 2. MASUKKAN API KEY YANG BARU SAJA ANDA BUAT
            const API_KEY = 'AIzaSyBy4hLaBiigdYM5hE6DQfcnPmo6_2pb-cg'; 

            // Endpoint Google Sheets API (mengambil dari kolom A sampai Z)
            const apiUrl2025 = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/2025!A:Z?key=${API_KEY}`;
            const apiUrl2026 = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/2026!A:Z?key=${API_KEY}`;
            
            let allData = [];

            // Fungsi pengubah format Google Sheets menjadi Array of Objects
            function formatGoogleSheetsData(data, year) {
                if (!data.values || data.values.length < 2) return [];
                
                const headers = data.values[0]; 
                const rows = data.values.slice(1); 
                
                return rows.map(row => {
                    let obj = { _sheetYear: year };
                    headers.forEach((header, index) => {
                        obj[header] = row[index] !== undefined ? row[index] : '';
                    });
                    return obj;
                });
            }

            // Fetch data dari API untuk kedua sheet secara bersamaan
            Promise.all([
                fetch(apiUrl2025)
                    .then(res => {
                        if (!res.ok) throw new Error('Gagal memuat 2025');
                        return res.json();
                    })
                    .then(data => formatGoogleSheetsData(data, '2025'))
                    .catch(err => {
                        console.error('Error fetching 2025:', err);
                        return [];
                    }),
                    
                fetch(apiUrl2026)
                    .then(res => {
                        if (!res.ok) throw new Error('Gagal memuat 2026');
                        return res.json();
                    })
                    .then(data => formatGoogleSheetsData(data, '2026'))
                    .catch(err => {
                        console.error('Error fetching 2026:', err);
                        return [];
                    })
            ])
            .then(([data2025, data2026]) => {
                const combinedData = [...data2025, ...data2026];

                // Filter data yang benar-benar kosong
                allData = combinedData.filter(row => row['Nama Pemilik'] || row['Client ID'] || row['No Sertifikat']);
                
                renderTable(allData);
            })
            .catch(error => {
                console.error('Error pada proses utama:', error);
                document.getElementById('tableBody').innerHTML = '<tr><td colspan="6" class="loading-text" style="color:var(--danger-color);">Gagal memuat data. Silakan coba lagi nanti.</td></tr>';
            });

            // =========================================================================
            // FUNGSI PENCARIAN & RENDER TABEL (TIDAK ADA YANG BERUBAH)
            // =========================================================================
            function applyFilters() {
                const searchTerm = document.getElementById('searchInputData').value.toLowerCase().trim();
                const yearFilter = document.getElementById('yearFilter').value;

                const filteredData = allData.filter(row => {
                    if (yearFilter !== 'semua' && row._sheetYear !== yearFilter) return false;
                    if (searchTerm) {
                        return Object.values(row).some(value =>
                            String(value).toLowerCase().includes(searchTerm)
                        ) || (row._sheetYear && row._sheetYear.includes(searchTerm));
                    }
                    return true;
                });
                renderTable(filteredData);
            }

            document.getElementById('searchInputData').addEventListener('input', applyFilters);
            document.getElementById('yearFilter').addEventListener('change', applyFilters);

            function renderTable(data) {
                const tbody = document.getElementById('tableBody');
                tbody.innerHTML = '';

                if (data.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="6" class="loading-text">Data yang dicari tidak ditemukan.</td></tr>';
                    ['countHijau', 'countKuning', 'countMerah'].forEach(id => {
                        const el = document.getElementById(id);
                        if (el) el.textContent = 0;
                    });
                    return;
                }

                let countHijau = 0, countKuning = 0, countMerah = 0;

                data.forEach((row, index) => {
                    const tr = document.createElement('tr');
                    let statusLabel = '', badgeClass = '';

                    const statusPermohonanStr = (row['Status Permohonan'] || '').trim().toLowerCase();
                    const statusStr = (row['Status'] || '').trim().toLowerCase();

                    if (statusPermohonanStr === 'telah dicetak') {
                        if (statusStr.includes('sudah diambil') || statusStr.includes('sudah diselesaikan') || statusStr.includes('selesai')) {
                            statusLabel = 'Telah Dicetak dan Sudah Pengambilan'; badgeClass = 'status-hijau'; countHijau++;
                        } else {
                            statusLabel = 'Telah Dicetak dan Masih Tersedia'; badgeClass = 'status-kuning'; countKuning++;
                        }
                    } else {
                        statusLabel = 'Belum Terbit'; badgeClass = 'status-merah'; countMerah++;
                    }

                    tr.innerHTML = `
                        <td>${row['No'] || (index + 1)}</td>
                        <td>${row['Client ID'] || '-'}</td>
                        <td>${row['No Sertifikat'] || '-'}</td>
                        <td style="font-weight: 500;">${row['Nama Pemilik'] || '-'}</td>
                        <td>${row['Jenis Permohonan'] || '-'}</td>
                        <td><span class="status-badge ${badgeClass}">${statusLabel}</span></td>
                    `;
                    tbody.appendChild(tr);
                });

                const hijauEl = document.getElementById('countHijau');
                const kuningEl = document.getElementById('countKuning');
                const merahEl = document.getElementById('countMerah');
                if (hijauEl) hijauEl.textContent = countHijau;
                if (kuningEl) kuningEl.textContent = countKuning;
                if (merahEl) merahEl.textContent = countMerah;
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
            document.getElementById('mobileNavDropdown').classList.toggle('active');
            document.getElementById('mobileNavOverlay').classList.toggle('active');
        }
        function closeMobileMenu() {
            document.getElementById('mobileNavDropdown').classList.remove('active');
            document.getElementById('mobileNavOverlay').classList.remove('active');
        }
        function toggleMobileSubmenu(el) {
            el.classList.toggle('active');
            const nextEl = el.nextElementSibling;
            if (nextEl && nextEl.classList.contains('mobile-submenu')) {
                nextEl.classList.toggle('active');
            }
        }
        if (document.getElementById('mobileNavOverlay')) {
            document.getElementById('mobileNavOverlay').addEventListener('click', closeMobileMenu);
        }
        function openSearch() { document.getElementById('searchOverlay').classList.add('active'); }
        function closeSearch() { document.getElementById('searchOverlay').classList.remove('active'); }

        // HEADER SCROLL (Meniru konsesi.html)
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

        // CHAT TOGGLE (TOMBOL MELAYANG)
        function animateChatToggle() {
            const btn = document.getElementById("toggleBtn");
            const box = document.getElementById("chatBox");
            const iframe = document.getElementById("chatFrame");

            if (!iframe.getAttribute('src')) {
                iframe.setAttribute('src', iframe.getAttribute('data-src'));
            }

            if (btn.classList.contains("active")) {
                btn.classList.remove("active");
                box.classList.remove("active");
                return;
            }
            btn.classList.add("active");
            box.classList.add("active");
        }