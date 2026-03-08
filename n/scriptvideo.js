import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, runTransaction, onValue, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDUeIg9Zn_xndPXtChO8KufXFp6EMtqBJ0",
    authDomain: "admin-pelayanan-balmon.firebaseapp.com",
    databaseURL: "https://admin-pelayanan-balmon-default-rtdb.firebaseio.com",
    projectId: "admin-pelayanan-balmon",
    appId: "1:1071557110255:web:bff7087da1feacccb7ee1a"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ================== VISITOR TRACKER BULANAN (STABIL) ==================
try {
    if (!sessionStorage.getItem('visited_v2')) {
        const now = new Date();
        const yearMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
        const monthlyRef = ref(db, `statistik_web/kunjungan_bulanan/${yearMonth}`);

        // Coba dengan transaksi dulu
        runTransaction(monthlyRef, (currentCount) => (currentCount || 0) + 1)
            .then(() => {
                sessionStorage.setItem('visited_v2', 'true');
                console.log("✅ Tracker: Kunjungan bulan " + yearMonth + " diperbarui.");
            })
            .catch((err) => {
                console.warn("⚠️ Transaksi gagal, mencoba fallback...", err);
                // Fallback: baca nilai saat ini lalu tambah
                onValue(monthlyRef, (snap) => {
                    const current = snap.val() || 0;
                    set(monthlyRef, current + 1)
                        .then(() => {
                            sessionStorage.setItem('visited_v2', 'true');
                            console.log("✅ Tracker (fallback): Kunjungan bulan " + yearMonth + " diperbarui.");
                        })
                        .catch(setErr => {
                            console.error("❌ Tracker fallback error:", setErr);
                        });
                }, { onlyOnce: true });
            });
    } else {
        console.log("⏩ Tracker: Sesi sudah dihitung sebelumnya.");
    }
} catch (e) {
    console.log("Visitor tracker exception:", e);
}

// ================== NEWS CAROUSEL ==================
let newsData = [];
let currentNewsIndex = 0;
let newsInterval;

function updateNewsDisplay(useAnimation = true) {
    const track = document.getElementById('newsTrack');
    const container = document.querySelector('.news-track-wrapper');

    if (!track || !container || newsData.length === 0) return;

    // Matikan transform di mobile agar bisa scroll manual
    if (window.innerWidth <= 900) {
        track.style.transform = 'none';
        track.style.transition = 'none';
        return;
    }

    const cards = track.querySelectorAll('.news-card-compact');
    if (cards.length === 0) return;

    const cardWidth = cards[0].offsetWidth;
    const gap = 30;

    // Hitung berapa kartu yang benar-benar muat di kontainer
    const visibleCards = Math.floor(container.offsetWidth / (cardWidth + gap / 2)) || 1;

    // Pastikan index tidak melampaui batas akhir yang masuk akal
    const maxIndex = Math.max(0, newsData.length - visibleCards);
    if (currentNewsIndex > maxIndex) {
        currentNewsIndex = maxIndex;
    }

    const scrollAmount = currentNewsIndex * (cardWidth + gap);

    track.style.transition = useAnimation ? 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)' : 'none';
    track.style.transform = `translateX(-${scrollAmount}px)`;
}

function initNewsCarousel() {
    const track = document.getElementById('newsTrack');
    if (!track) return;
    track.innerHTML = '';

    if (newsData.length === 0) {
        track.innerHTML = '<div style="color:#64748b; padding:40px;">Tidak ada berita ditemukan.</div>';
        return;
    }

    newsData.forEach((news, index) => {
        const card = document.createElement('div');
        card.className = 'news-card-compact';

        card.innerHTML = `
            <div class="news-card-img-box">
                <img src="${news.img}" alt="${news.title}" onerror="this.src='https://via.placeholder.com/400x250?text=No+Image'">
                <div class="news-badge-black">NEWS</div>
            </div>
            <div class="news-card-date-compact">${news.date}</div>
            <h3 class="news-card-title-compact">${news.title}</h3>
            <p class="news-card-desc-compact">${news.desc}</p>
        `;

        card.onclick = () => {
            window.location.href = `news_detail.html?id=${news.id}`;
        };

        track.appendChild(card);
    });

    // Reset index 
    if (currentNewsIndex >= newsData.length) currentNewsIndex = 0;

    setTimeout(() => updateNewsDisplay(false), 100);
}

function nextNews() {
    if (newsData.length <= 1) return;
    const track = document.getElementById('newsTrack');
    const container = document.querySelector('.news-track-wrapper');
    const cards = track ? track.querySelectorAll('.news-card-compact') : [];
    if (!container || cards.length === 0) return;

    const cardWidth = cards[0].offsetWidth;
    const gap = 30;
    const visibleCards = Math.floor(container.offsetWidth / (cardWidth + gap / 2)) || 1;
    const maxIndex = Math.max(0, newsData.length - visibleCards);

    if (currentNewsIndex < maxIndex) {
        currentNewsIndex++;
    } else {
        currentNewsIndex = 0; // Loop back
    }
    updateNewsDisplay(true);
}

function prevNews() {
    if (newsData.length <= 1) return;
    const track = document.getElementById('newsTrack');
    const container = document.querySelector('.news-track-wrapper');
    const cards = track ? track.querySelectorAll('.news-card-compact') : [];
    if (!container || cards.length === 0) return;

    if (currentNewsIndex > 0) {
        currentNewsIndex--;
    } else {
        const cardWidth = cards[0].offsetWidth;
        const gap = 30;
        const visibleCards = Math.floor(container.offsetWidth / (cardWidth + gap / 2)) || 1;
        currentNewsIndex = Math.max(0, newsData.length - visibleCards);
    }
    updateNewsDisplay(true);
}

function startAutoNews() {
    clearInterval(newsInterval);
    if (newsData.length > 1) {
        newsInterval = setInterval(() => { nextNews(); }, 5000);
    }
}

window.nextNews = nextNews;
window.prevNews = prevNews;

window.addEventListener('resize', () => {
    if (newsData.length > 0) updateNewsDisplay(false);
});

// ================== VIDEO SLIDER (LAZY LOAD) ==================
function getYoutubeId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function initDbVideoSlider(videoData) {
    const track = document.getElementById('videoTrack');
    if (!track) return;
    track.innerHTML = '';

    if (videoData.length === 0) {
        track.innerHTML = '<div style="color:white; padding:20px;">Belum ada video tersedia.</div>';
        return;
    }

    videoData.forEach(video => {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.dataset.videoId = video.id;

        const thumbUrl = video.id ? `https://img.youtube.com/vi/${video.id}/hqdefault.jpg` : '';

        card.innerHTML = `
            <div class="video-thumbnail-wrapper" onclick="playVideoFromSlider(this, event)">
                <img src="${thumbUrl}" alt="${video.title}" loading="lazy" style="width:100%; height:100%; object-fit:cover; position:absolute; top:0; left:0;">
                <div class="play-button-overlay">
                    <svg viewBox="0 0 24 24" width="48" height="48">
                        <circle cx="12" cy="12" r="10" fill="rgba(0,0,0,0.7)"/>
                        <polygon points="10,8 16,12 10,16" fill="white"/>
                    </svg>
                </div>
            </div>
            <div class="video-card-content">
                <h3>${video.title}</h3>
                <p>${video.desc}</p>
            </div>
        `;
        track.appendChild(card);
    });

    window.firebaseVideoData = videoData;
    const trackEl = document.getElementById('videoTrack');
    if (trackEl) trackEl.style.transform = 'translateX(0px)';
}

// ------------------- LOGIKA NAVIGASI VIDEO DITAMBAHKAN DI SINI -------------------
let currentVideoIndex = 0;

function updateVideoDisplay(useAnimation = true) {
    const track = document.getElementById('videoTrack');
    const container = track ? track.parentElement : null; // Membutuhkan wrapper sebagai batas

    if (!track || !container || !window.firebaseVideoData || window.firebaseVideoData.length === 0) return;

    if (window.innerWidth <= 900) {
        track.style.transform = 'none';
        track.style.transition = 'none';
        return;
    }

    const cards = track.querySelectorAll('.video-card');
    if (cards.length === 0) return;

    const cardWidth = cards[0].offsetWidth;
    const gap = 20; // Silakan sesuaikan dengan gap (margin) yang ada di CSS .video-card Anda (misalnya 20 atau 30)

    const visibleCards = Math.floor(container.offsetWidth / (cardWidth + gap / 2)) || 1;
    const maxIndex = Math.max(0, window.firebaseVideoData.length - visibleCards);

    if (currentVideoIndex > maxIndex) {
        currentVideoIndex = maxIndex;
    }

    const scrollAmount = currentVideoIndex * (cardWidth + gap);

    track.style.transition = useAnimation ? 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)' : 'none';
    track.style.transform = `translateX(-${scrollAmount}px)`;
}

function nextVideo() {
    const track = document.getElementById('videoTrack');
    const container = track ? track.parentElement : null;
    const cards = track ? track.querySelectorAll('.video-card') : [];

    if (!container || cards.length === 0 || !window.firebaseVideoData) return;

    const cardWidth = cards[0].offsetWidth;
    const gap = 20;
    const visibleCards = Math.floor(container.offsetWidth / (cardWidth + gap / 2)) || 1;
    const maxIndex = Math.max(0, window.firebaseVideoData.length - visibleCards);

    if (currentVideoIndex < maxIndex) {
        currentVideoIndex++;
    } else {
        currentVideoIndex = 0; // Loop kembali ke video pertama
    }
    updateVideoDisplay(true);
}

function prevVideo() {
    const track = document.getElementById('videoTrack');
    const container = track ? track.parentElement : null;
    const cards = track ? track.querySelectorAll('.video-card') : [];

    if (!container || cards.length === 0 || !window.firebaseVideoData) return;

    if (currentVideoIndex > 0) {
        currentVideoIndex--;
    } else {
        const cardWidth = cards[0].offsetWidth;
        const gap = 20;
        const visibleCards = Math.floor(container.offsetWidth / (cardWidth + gap / 2)) || 1;
        currentVideoIndex = Math.max(0, window.firebaseVideoData.length - visibleCards);
    }
    updateVideoDisplay(true);
}

function playVideoFromSlider(element, event) {
    event.preventDefault();
    const videoId = element.parentElement.dataset.videoId;

    if (videoId) {
        // Secara default kode ini akan membuka video di tab baru.
        // Jika Anda memiliki elemen pop-up Modal iframe di index.html, Anda bisa mengganti baris di bawah ini.
        window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
    }
}

// Ekspos semua fungsi video ke window (Wajib agar tombol HTML berfungsi)
window.nextVideo = nextVideo;
window.prevVideo = prevVideo;
window.playVideoFromSlider = playVideoFromSlider;

// Handle resize ulang untuk video agar tidak bug jika ukuran browser diubah
window.addEventListener('resize', () => {
    if (window.firebaseVideoData && window.firebaseVideoData.length > 0) {
        updateVideoDisplay(false);
    }
});


// ================== FETCH DATA ==================
const galleryRef = ref(db, 'galeri');
onValue(galleryRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
        document.getElementById('newsTitle').textContent = "Database Kosong";
        return;
    }

    let allItems = Object.keys(data).map(key => ({ id: key, ...data[key] }));

    // Berita
    const newsItems = allItems.filter(item => {
        const cat = String(item.category || '').toLowerCase().trim();
        return cat === 'news' || cat === 'berita';
    }).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    newsData = newsItems.map(item => ({
        id: item.id,
        title: item.title || 'Tanpa Judul',
        date: new Date(item.date || new Date()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        desc: item.description || item.desc || 'Klik selengkapnya.',
        img: item.imageUrl || 'https://via.placeholder.com/800x600'
    }));

    if (newsData.length > 0) initNewsCarousel();
    else {
        document.getElementById('newsTitle').textContent = "Tidak ada berita";
        document.getElementById('newsDesc').textContent = "";
    }

    // Video
    const videoItems = allItems.filter(item => {
        const cat = String(item.category || '').toLowerCase().trim();
        return cat === 'video';
    });

    const videoData = videoItems.map(item => ({
        id: getYoutubeId(item.url || item.videoUrl || ''),
        title: item.title || 'Video Balmon',
        desc: item.description || item.desc || 'Video dokumentasi.'
    })).filter(v => v.id);

    if (videoData.length > 0) initDbVideoSlider(videoData);
}, (err) => {
    console.error("Firebase Error:", err);
    document.getElementById('newsTitle').textContent = "Gagal Koneksi";
});