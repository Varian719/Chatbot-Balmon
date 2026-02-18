 import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
        import { getDatabase, ref, runTransaction, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

        // --- 1. KONFIGURASI FIREBASE ---
        // CATATAN PENTING: Jika error CORS, buka file ini via Live Server (http://127.0.0.1:5500), jangan double click file html.
        const firebaseConfig = {
            apiKey: "AIzaSyDUeIg9Zn_xndPXtChO8KufXFp6EMtqBJ0",
            authDomain: "admin-pelayanan-balmon.firebaseapp.com",
            databaseURL: "https://admin-pelayanan-balmon-default-rtdb.firebaseio.com",
            projectId: "admin-pelayanan-balmon",
            storageBucket: "admin-pelayanan-balmon.firebasestorage.app",
            messagingSenderId: "1071557110255",
            appId: "1:1071557110255:web:bff7087da1feacccb7ee1a"
        };

        const app = initializeApp(firebaseConfig);
        const db = getDatabase(app);

        // ============================================================
        // BAGIAN A: VISITOR TRACKER
        // ============================================================
        try {
            function runVisitorTracker() {
                if (!sessionStorage.getItem('visited_v2')) {
                    const visitRef = ref(db, 'statistik_web/total_kunjungan');
                    runTransaction(visitRef, (currentCount) => {
                        return (currentCount || 0) + 1;
                    }).then(() => {
                        console.log("✅ Tracker: Data kunjungan diperbarui.");
                        sessionStorage.setItem('visited_v2', 'true');
                    }).catch((err) => console.error("❌ Tracker Error:", err));
                }
            }
            runVisitorTracker();
        } catch (e) {
            console.log("Visitor tracker skipped (local context)");
        }

        // ============================================================
        // BAGIAN B: LOGIKA NEWS CAROUSEL
        // ============================================================
        
        // 1. Variabel Global News
        let newsData = []; 
        let currentNewsIndex = 0;
        let newsInterval;

        // 2. Fungsi Init Carousel News
        function initNewsCarousel() {
            const track = document.getElementById('newsTrack');
            if (!track) return;

            track.innerHTML = ''; 

            if (newsData.length === 0) {
                const titleEl = document.getElementById('newsTitle');
                const descEl = document.getElementById('newsDesc');
                if(titleEl) titleEl.textContent = "Data Kosong";
                if(descEl) descEl.textContent = "Tidak ada berita ditemukan.";
                return;
            }

            // Masukkan gambar
            newsData.forEach(news => {
                const img = document.createElement('img');
                img.src = news.img;
                img.className = 'news-slide-img';
                img.alt = news.title;
                img.style.minWidth = "100%";
                img.style.width = "100%";
                img.style.objectFit = "cover";
                img.onerror = function() {
                    this.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                };
                track.appendChild(img);
            });

            updateNewsDisplay(false); 
            startAutoNews();
        }

        // 3. Fungsi Update Tampilan News
        function updateNewsDisplay(useAnimation = true) {
            const titleEl = document.getElementById('newsTitle');
            const dateEl = document.getElementById('newsDate');
            const descEl = document.getElementById('newsDesc');
            const counterEl = document.getElementById('newsCounter');
            const progressEl = document.getElementById('newsProgress');
            const track = document.getElementById('newsTrack');
            const container = document.querySelector('.news-image-col');

            if (!track || !container || newsData.length === 0) return;

            const containerWidth = container.clientWidth;
            
            track.style.transition = useAnimation ? 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)' : 'none';
            track.style.transform = `translateX(-${currentNewsIndex * containerWidth}px)`;

            titleEl.classList.add('text-fade-out');
            titleEl.classList.remove('text-fade-in');
            descEl.classList.add('text-fade-out');
            descEl.classList.remove('text-fade-in');

            setTimeout(() => {
                const item = newsData[currentNewsIndex];
                if(item) {
                    titleEl.textContent = item.title;
                    dateEl.textContent = item.date;
                    descEl.textContent = item.desc;
                    
                    const idx = currentNewsIndex + 1;
                    const total = newsData.length;
                    counterEl.textContent = `${idx < 10 ? '0'+idx : idx} / ${total < 10 ? '0'+total : total}`;
                }
                
                titleEl.classList.remove('text-fade-out');
                titleEl.classList.add('text-fade-in');
                descEl.classList.remove('text-fade-out');
                descEl.classList.add('text-fade-in');
            }, 300);

            progressEl.classList.remove('active');
            void progressEl.offsetWidth; 
            progressEl.classList.add('active');
        }

        // 4. Navigasi News
        function nextNews() {
            if (newsData.length <= 1) return;
            currentNewsIndex++;
            if (currentNewsIndex >= newsData.length) currentNewsIndex = 0;
            updateNewsDisplay(true);
            startAutoNews();
        }

        function prevNews() {
            if (newsData.length <= 1) return;
            currentNewsIndex--;
            if (currentNewsIndex < 0) currentNewsIndex = newsData.length - 1;
            updateNewsDisplay(true);
            startAutoNews();
        }

        function startAutoNews() {
            clearInterval(newsInterval);
            if (newsData.length > 1) {
                newsInterval = setInterval(() => { nextNews(); }, 5000);
            }
        }

        window.addEventListener('resize', () => {
            if (newsData.length > 0) updateNewsDisplay(false);
        });

        // Expose News Functions
        window.nextNews = nextNews;
        window.prevNews = prevNews;


        // ============================================================
        // BAGIAN C: LOGIKA VIDEO SLIDER (FIREBASE INTEGRATED)
        // ============================================================
        
        let dbVideoData = []; 
        
        // Helper: Ekstrak YouTube ID dari URL (Link panjang/pendek)
        function getYoutubeId(url) {
            if (!url) return null;
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = url.match(regExp);
            return (match && match[2].length === 11) ? match[2] : null;
        }

        // 2. Fungsi Init Video Slider (Render Kartu dari DB)
        function initDbVideoSlider() {
            const track = document.getElementById('videoTrack');
            if(!track) return;
            
            track.innerHTML = ''; 

            if (dbVideoData.length === 0) {
                track.innerHTML = '<div style="color:white; padding:20px;">Belum ada video tersedia.</div>';
                return;
            }

            dbVideoData.forEach(video => {
                const card = document.createElement('div');
                card.className = 'video-card';
                const embedUrl = video.id ? `https://www.youtube.com/embed/${video.id}` : '';
                
                card.innerHTML = `
                    <div class="video-card-media">
                         <iframe src="${embedUrl}" loading="lazy" allowfullscreen title="${video.title}"></iframe>
                    </div>
                    <div class="video-card-content">
                        <h3>${video.title}</h3>
                        <p>${video.desc}</p>
                    </div>
                `;
                track.appendChild(card);
            });
            
            // Simpan ke window agar fungsi global slideVideo bisa akses
            window.firebaseVideoData = dbVideoData;
            
            // Reset posisi scroll
            const trackEl = document.getElementById('videoTrack');
            if(trackEl) trackEl.style.transform = `translateX(0px)`;
        }


        // ============================================================
        // BAGIAN D: FETCH DATA DARI FIREBASE (GABUNGAN NEWS & VIDEO)
        // ============================================================
        console.log("Firebase: Menghubungkan...");
        const galleryRef = ref(db, 'galeri'); 

        onValue(galleryRef, (snapshot) => {
            console.log("Firebase: Data diterima.");
            const data = snapshot.val();
            
            if (data) {
                let allItems = Object.keys(data).map(key => ({ id: key, ...data[key] }));

                // 1. PROSES DATA BERITA (NEWS)
                const newsItems = allItems.filter(item => {
                    const cat = String(item.category || item.kategori || '').trim().toLowerCase();
                    return cat === 'news' || cat === 'berita';
                });

                newsItems.sort((a, b) => {
                    const dateA = new Date(a.date || a.tanggal || 0);
                    const dateB = new Date(b.date || b.tanggal || 0);
                    return dateB - dateA;
                });

                newsData = newsItems.map(item => {
                    const rawDate = item.date || item.tanggal || new Date();
                    const dateStr = new Date(rawDate).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'long', year: 'numeric'
                    });

                    return {
                        title: item.title || item.judul || 'Tanpa Judul',
                        date: dateStr,
                        desc: item.description || item.desc || item.content || 'Klik selengkapnya untuk membaca.',
                        img: item.imageUrl || item.url || item.gambar || 'https://via.placeholder.com/800x600?text=No+Image'
                    };
                });
                
                if (newsData.length > 0) initNewsCarousel();
                else {
                    document.getElementById('newsTitle').textContent = "Data Kosong";
                    document.getElementById('newsDesc').textContent = "Tidak ada berita ditemukan.";
                }

                // 2. PROSES DATA VIDEO
                const videoItems = allItems.filter(item => {
                    const cat = String(item.category || item.kategori || '').trim().toLowerCase();
                    return cat === 'video';
                });
                
                dbVideoData = videoItems.map(item => {
                    const rawLink = item.url || item.videoUrl || item.link || '';
                    return {
                        id: getYoutubeId(rawLink), 
                        title: item.title || item.judul || 'Video Balmon',
                        desc: item.description || item.desc || item.deskripsi || 'Video dokumentasi dan edukasi.'
                    };
                });

                console.log(`Firebase: Ditemukan ${dbVideoData.length} video.`);
                
                if(dbVideoData.length > 0) {
                    initDbVideoSlider();
                }

            } else {
                console.log("Firebase: Data Galeri Kosong.");
                document.getElementById('newsTitle').textContent = "Database Kosong";
            }
        }, (err) => {
            console.error("Firebase Error:", err);
            document.getElementById('newsTitle').textContent = "Gagal Koneksi";
            document.getElementById('newsDesc').textContent = "Pastikan Anda membuka file ini menggunakan Server (bukan file://) atau periksa koneksi internet.";
        });
