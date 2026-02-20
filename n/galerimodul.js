
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
        import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

        const firebaseConfig = {
            apiKey: "AIzaSyDUeIg9Zn_xndPXtChO8KufXFp6EMtqBJ0",
            authDomain: "admin-pelayanan-balmon.firebaseapp.com",
            databaseURL: "https://admin-pelayanan-balmon-default-rtdb.firebaseio.com",
            projectId: "admin-pelayanan-balmon",
            appId: "1:1071557110255:web:bff7087da1feacccb7ee1a"
        };

        const app = initializeApp(firebaseConfig);
        const db = getDatabase(app);
        const container = document.getElementById('galleryContainer');
        const galeriRef = ref(db, 'galeri');

        onValue(galeriRef, (snapshot) => {
            if (!snapshot.exists()) {
                container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 50px;">Belum ada konten galeri. Silakan input dari Admin.</div>`;
                return;
            }

            container.innerHTML = ""; 
            const data = snapshot.val();
            
            // --- GANTI JADI INI ---
            // Menggunakan Object.entries agar ID (key) masuk ke dalam data item
            let items = Object.entries(data)
                .map(([key, val]) => ({ key, ...val })) 
                .sort((a, b) => b.timestamp - a.timestamp);
            // ----------------------
            items.forEach(item => {
                // A. Tentukan Warna Badge & Icon
                
                let badgeColor = 'bg-primary';
                let iconClass = 'bi-newspaper'; // Default icon berita
                let cat = (item.category || 'berita').toLowerCase();
                
                // Variabel untuk Lightbox (Popup)
                let typeParam = "'image'"; 
                
                if(cat === 'video') {
                    badgeColor = 'bg-danger';
                    iconClass = 'bi-play-circle';
                    typeParam = "'video'";
                }
                if(cat === 'infografis') {
                    badgeColor = 'bg-warning text-dark';
                    iconClass = 'bi-image';
                }

                // B. Potong Deskripsi
                let desc = item.description || '';
                if(desc.length > 100) desc = desc.substring(0, 100) + '...';

                // C. LOGIKA TOMBOL BACA SELENGKAPNYA (Ini yang penting)
                let tombolBaca = ''; // Default kosong

                // Hanya isi variabel tombol jika kategorinya news/berita
                const id = item.key
                const dateObj = new Date(item.date);
                const dateStr = dateObj.toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'});
                const isVideo = item.category === 'video';
                const typeParam2 = isVideo ? "'video'" : "'image'";
                
                let iconClass2 = isVideo ? 'bi-play-circle-fill' : 'bi-arrows-angle-expand';
                if(item.category === 'news') iconClass2 = 'bi-file-text';
                
                const descText = item.description || ""; 
                   if (item.category === 'news') {
                    tombolBaca = `
                        <a href="news_detail.html?id=${item.key}" class="btn btn-sm btn-outline-primary mt-3 align-self-start">
                            Baca Selengkapnya <i class="bi bi-arrow-right"></i>
                        </a>
                    `;
                }
                const html = `
                    <div class="gallery-item" data-category="${item.category}" data-video-src="${item.videoUrl}">
                        <div class="media-wrapper" onclick="openLightbox(this, ${typeParam})">
                            <img src="${item.imageUrl}" alt="${item.title}" loading="lazy">
                            <div class="overlay">
                                <div class="icon-box">
                                    <i class="bi ${iconClass}"></i>
                                </div>
                            </div>
                            <div class="media-badge badge-${item.category}">
                                ${item.category.toUpperCase()}
                            </div>
                        </div>
                        <div class="item-info">
                            <div class="item-date"><i class="bi bi-calendar-event"></i> ${dateStr}</div>
                            <h3 class="item-title">${item.title}</h3>
                            <p class="item-desc">${descText}</p>
                            ${tombolBaca}
                        </div>
                    </div>
                `;
             
                container.insertAdjacentHTML('beforeend', html);
            });
            
    
            const activeBtn = document.querySelector('.cat-card.active');
            if(activeBtn) {
                const clickAttr = activeBtn.getAttribute('onclick');
                const catMatch = clickAttr.match(/'([^']+)'/);
                if(catMatch && window.filterGallery) {
                    window.filterGallery(catMatch[1], activeBtn);
                }
            }
            
        });
        
        const activateAutoFilter = () => {
            const params = new URLSearchParams(window.location.search);
            const target = params.get('filter');

            if (target) {
                // Cari elemen kartu berdasarkan fungsi onclick-nya
                const targetBtn = document.querySelector(`.cat-card[onclick*="'${target}'"]`);
                
                if (targetBtn) {
                    // Gunakan setTimeout kecil untuk memastikan DOM sudah stabil
                    setTimeout(() => {
                        targetBtn.click();
                        // Scroll otomatis ke area galeri agar user tahu filter bekerja
                        targetBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                }
            }
        };

        // Gunakan MutationObserver untuk mendeteksi kapan konten Firebase selesai dirender
        const galleryGrid = document.getElementById('galleryContainer');
        const observer = new MutationObserver((mutations, obs) => {
            // Jika grid sudah berisi item galeri (bukan teks 'Memuat...')
            if (galleryGrid.querySelector('.gallery-item')) {
                activateAutoFilter();
                obs.disconnect(); // Berhenti mengawasi setelah filter berhasil dijalankan
            }
        });

        observer.observe(galleryGrid, { childList: true, subtree: true });