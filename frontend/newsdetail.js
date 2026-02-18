 import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
    import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

    // 1. Konfigurasi Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyDUeIg9Zn_xndPXtChO8KufXFp6EMtqBJ0",
        authDomain: "admin-pelayanan-balmon.firebaseapp.com",
        projectId: "admin-pelayanan-balmon",
        storageBucket: "admin-pelayanan-balmon.firebasestorage.app",
        messagingSenderId: "1071557110255",
        appId: "1:1071557110255:web:bff7087da1feacccb7ee1a"
    };

    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);

    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    async function loadNewsDetail() {
        const newsId = getQueryParam('id'); 
        const errorArea = document.getElementById('error-area');
        const mainContent = document.getElementById('main-content');

        if (!newsId) {
            mainContent.classList.add('d-none');
            errorArea.classList.remove('d-none');
            return;
        }

        // Jalur database: Pastikan menggunakan 'galeri/'
        const newsRef = ref(db, `galeri/${newsId}`); 

        try {
            const snapshot = await get(newsRef);

            if (snapshot.exists()) {
                const data = snapshot.val();
                
                // --- UPDATE HTML (Menyesuaikan dengan ID di HTML Anda) ---
                
                // 1. Update Judul & Breadcrumb
                document.getElementById('article-title').innerText = data.title || "Tanpa Judul";
                document.getElementById('breadcrumb-title').innerText = data.title || "Berita";
                document.title = `${data.title} | Balmon Samarinda`;

                // 2. Update Tanggal & Kategori
                document.getElementById('article-date').innerText = data.date || "-";
                document.getElementById('article-category').innerText = data.category || "News";

                // 3. Update Gambar Utama
                const imgContainer = document.getElementById('img-container');
                if (data.imageUrl) {
                    imgContainer.innerHTML = `<img src="${data.imageUrl}" class="article-featured-img" alt="${data.title}">`;
                }

                // 4. Update Isi Konten
                const bodyEl = document.getElementById('article-body');
                if (bodyEl) {
                    // Karena css Anda punya white-space: pre-wrap, \n otomatis jadi baris baru
                    bodyEl.innerText = data.description || "Tidak ada isi berita.";
                }

                // 5. Muat Sidebar (Publikasi Terbaru)
                loadRecentPosts();

            } else {
                mainContent.classList.add('d-none');
                errorArea.classList.remove('d-none');
                document.getElementById('debug-id-display').innerText = newsId;
            }
        } catch (error) {
            console.error("Gagal mengambil data:", error);
            alert("Terjadi kesalahan koneksi ke database.");
        }
    }

    // Fungsi tambahan untuk mengisi sidebar agar tidak kosong
    async function loadRecentPosts() {
        const recentRef = ref(db, 'galeri');
        try {
            const snapshot = await get(recentRef);
            if (snapshot.exists()) {
                const data = snapshot.val();
                let items = Object.entries(data)
                    .map(([key, val]) => ({ key, ...val }))
                    .filter(item => item.category === 'news') // Hanya ambil kategori news
                    .slice(0, 5); // Ambil 5 terbaru

                const container = document.getElementById('recent-posts-container');
                container.innerHTML = items.map(item => `
                    <div class="recent-post-item">
                        <img src="${item.imageUrl}" class="recent-post-img">
                        <div>
                            <div class="recent-post-title">
                                <a href="news_detail.html?id=${item.key}">${item.title}</a>
                            </div>
                            <small class="text-muted">${item.date || ''}</small>
                        </div>
                    </div>
                `).join('');
            }
        } catch (e) { console.error(e); }
    }

    loadNewsDetail();
    
        // ===========================================
        // FUNGSI ANIMASI FADE-IN PADA SCROLL
        // ===========================================
        function initScrollAnimations() {
            const fadeSections = document.querySelectorAll('.fade-in-section');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    }
                });
            }, { 
                threshold: 0.1, 
                rootMargin: '0px 0px -50px 0px' 
            });
            
            fadeSections.forEach(section => {
                observer.observe(section);
            });
        }
        
        document.addEventListener('DOMContentLoaded', () => {
            initScrollAnimations();
        });
        
        // PAGE LOADER LOGIC OPTIMIZED
        window.addEventListener('load', () => {
            const loader = document.getElementById('pageLoader');
            if(loader) loader.classList.add('hidden');
            
            setTimeout(() => {
                const visibleSections = document.querySelectorAll('.fade-in-section');
                visibleSections.forEach(section => {
                    const rect = section.getBoundingClientRect();
                    if (rect.top < window.innerHeight && rect.bottom > 0) {
                        section.classList.add('is-visible');
                    }
                });
            }, 100);
            
            // INIT VIDEO SLIDER
            initVideoSlider();
        });
        
        window.addEventListener('pageshow', (event) => {
            const loader = document.getElementById('pageLoader');
            if (event.persisted && loader) loader.classList.add('hidden');
        });
        
        document.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                const target = this.getAttribute('target');
                if (href && !href.startsWith('#') && !href.startsWith('javascript') && target !== '_blank') {
                    e.preventDefault();
                    const loader = document.getElementById('pageLoader');
                    loader.classList.remove('hidden');
                    setTimeout(() => { window.location.href = href; }, 300);
                }
            });
        });
