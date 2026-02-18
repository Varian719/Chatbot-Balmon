import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, runTransaction, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDUeIg9Zn_xndPXtChO8KufXFp6EMtqBJ0",
    authDomain: "admin-pelayanan-balmon.firebaseapp.com",
    databaseURL: "https://admin-pelayanan-balmon-default-rtdb.firebaseio.com",
    projectId: "admin-pelayanan-balmon",
    appId: "1:1071557110255:web:bff7087da1feacccb7ee1a"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ================== VISITOR TRACKER ==================
try {
    if (!sessionStorage.getItem('visited_v2')) {
        const visitRef = ref(db, 'statistik_web/total_kunjungan');
        runTransaction(visitRef, (currentCount) => (currentCount || 0) + 1)
            .then(() => sessionStorage.setItem('visited_v2', 'true'))
            .catch(err => console.error("Tracker Error:", err));
    }
} catch (e) { console.log("Visitor tracker skipped"); }

// ================== NEWS CAROUSEL ==================
let newsData = [];
let currentNewsIndex = 0;
let newsInterval;

function updateNewsDisplay(useAnimation = true) {
    const titleEl = document.getElementById('newsTitle');
    const dateEl = document.getElementById('newsDate');
    const descEl = document.getElementById('newsDesc');
    const counterEl = document.getElementById('newsCounter');
    const progressEl = document.getElementById('newsProgress');
    const track = document.getElementById('newsTrack');
    const container = document.querySelector('.news-image-col');

    if (!track || !container || newsData.length === 0) return;

    // Fallback jika lebar container 0 (misal di mobile)
    let containerWidth = container.clientWidth;
    if (containerWidth === 0) {
        containerWidth = container.offsetWidth || window.innerWidth * 0.9;
    }

    track.style.transition = useAnimation ? 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)' : 'none';
    track.style.transform = `translateX(-${currentNewsIndex * containerWidth}px)`;

    titleEl.classList.add('text-fade-out');
    descEl.classList.add('text-fade-out');

    setTimeout(() => {
        const item = newsData[currentNewsIndex];
        if (item) {
            titleEl.textContent = item.title;
            dateEl.textContent = item.date;
            descEl.textContent = item.desc;
            const idx = currentNewsIndex + 1;
            const total = newsData.length;
            counterEl.textContent = `${idx < 10 ? '0' + idx : idx} / ${total < 10 ? '0' + total : total}`;
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

function initNewsCarousel() {
    const track = document.getElementById('newsTrack');
    if (!track) return;
    track.innerHTML = '';

    if (newsData.length === 0) {
        document.getElementById('newsTitle').textContent = "Data Kosong";
        document.getElementById('newsDesc').textContent = "Tidak ada berita ditemukan.";
        return;
    }

    newsData.forEach(news => {
        const img = document.createElement('img');
        img.src = news.img;
        img.className = 'news-slide-img';
        img.alt = news.title;
        img.style.minWidth = "100%";
        img.style.width = "100%";
        img.style.objectFit = "cover";
        img.onerror = () => img.src = 'https://via.placeholder.com/800x600?text=No+Image';
        track.appendChild(img);
    });

    setTimeout(() => updateNewsDisplay(false), 100);
    startAutoNews();
}

function nextNews() {
    if (newsData.length <= 1) return;
    currentNewsIndex = (currentNewsIndex + 1) % newsData.length;
    updateNewsDisplay(true);
    startAutoNews();
}
function prevNews() {
    if (newsData.length <= 1) return;
    currentNewsIndex = (currentNewsIndex - 1 + newsData.length) % newsData.length;
    updateNewsDisplay(true);
    startAutoNews();
}
function startAutoNews() {
    clearInterval(newsInterval);
    if (newsData.length > 1) newsInterval = setInterval(nextNews, 5000);
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