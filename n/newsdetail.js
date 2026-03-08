import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, get, onValue, push } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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

// Fungsi escape HTML untuk keamanan
function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"]/g, function(match) {
        if (match === '&') return '&amp;';
        if (match === '<') return '&lt;';
        if (match === '>') return '&gt;';
        if (match === '"') return '&quot;';
        return match;
    });
}

async function loadNewsDetail() {
    const newsId = getQueryParam('id'); 
    const errorArea = document.getElementById('error-area');
    const mainContent = document.getElementById('main-content');

    if (!newsId) {
        if (mainContent) mainContent.classList.add('d-none');
        if (errorArea) errorArea.classList.remove('d-none');
        return;
    }

    const newsRef = ref(db, `galeri/${newsId}`); 

    try {
        const snapshot = await get(newsRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            
            // 1. Update Judul & Breadcrumb
            const titleEl = document.getElementById('article-title');
            const breadTitle = document.getElementById('breadcrumb-title');
            if (titleEl) titleEl.innerText = data.title || "Tanpa Judul";
            if (breadTitle) breadTitle.innerText = data.title || "Berita";
            document.title = `${data.title || 'Berita'} | Balmon Samarinda`;

            // 2. Update Tanggal & Kategori
            const dateEl = document.getElementById('article-date');
            const catEl = document.getElementById('article-category');
            if (dateEl) dateEl.innerText = data.date || "-";
            if (catEl) catEl.innerText = data.category || "News";

            // 3. Update Gambar Utama
            const imgContainer = document.getElementById('img-container');
            if (imgContainer && data.imageUrl) {
                imgContainer.innerHTML = `<img src="${escapeHTML(data.imageUrl)}" class="article-featured-img" alt="${escapeHTML(data.title)}">`;
            }

            // 4. Update Isi Konten
            const bodyEl = document.getElementById('article-body');
            if (bodyEl) {
                bodyEl.innerText = data.description || "Tidak ada isi berita.";
            }

            // 5. Muat Sidebar (Publikasi Terbaru)
            loadRecentPosts();

            // 6. Inisialisasi Komentar (per berita)
            initComments(newsId);

        } else {
            if (mainContent) mainContent.classList.add('d-none');
            if (errorArea) errorArea.classList.remove('d-none');
            const debugId = document.getElementById('debug-id-display');
            if (debugId) debugId.innerText = newsId;
        }
    } catch (error) {
        console.error("Gagal mengambil data:", error);
        alert("Terjadi kesalahan koneksi ke database.");
    }
}

// Fungsi untuk mengisi sidebar dengan berita terbaru (kategori news)
async function loadRecentPosts() {
    const recentRef = ref(db, 'galeri');
    const container = document.getElementById('recent-posts-container');
    if (!container) return;

    try {
        const snapshot = await get(recentRef);
        if (snapshot.exists()) {
            const data = snapshot.val();
            // Konversi object ke array, filter kategori news, urutkan berdasarkan timestamp (terbaru)
            let items = Object.entries(data)
                .map(([key, val]) => ({ key, ...val }))
                .filter(item => item.category && item.category.toLowerCase() === 'news')
                .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                .slice(0, 5); // Ambil 5 terbaru

            if (items.length > 0) {
                container.innerHTML = items.map(item => `
                    <div class="recent-post-item">
                        <img src="${escapeHTML(item.imageUrl || '')}" class="recent-post-img" alt="${escapeHTML(item.title)}" onerror="this.src='https://via.placeholder.com/80?text=Error'">
                        <div>
                            <div class="recent-post-title">
                                <a href="news_detail.html?id=${item.key}">${escapeHTML(item.title || 'Tanpa Judul')}</a>
                            </div>
                            <small class="text-muted">${item.date || ''}</small>
                        </div>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<p class="text-muted text-center py-3">Tidak ada berita terbaru.</p>';
            }
        } else {
            container.innerHTML = '<p class="text-muted text-center py-3">Tidak ada berita.</p>';
        }
    } catch (e) { 
        console.error('Gagal memuat sidebar:', e);
        container.innerHTML = '<p class="text-muted text-center py-3">Gagal memuat berita terbaru.</p>';
    }
}

// Fungsi untuk menangani komentar (per berita)
function initComments(newsId) {
    // Path komentar per berita: statistik_web/komentar/{newsId}
    const commentsRef = ref(db, `statistik_web/komentar/${newsId}`);
    const commentsList = document.getElementById('commentsList');
    const submitBtn = document.getElementById('submitCommentBtn');
    const nameInput = document.getElementById('commentName');
    const emailInput = document.getElementById('commentEmail');
    const messageInput = document.getElementById('commentMessage');

    if (!commentsList || !submitBtn || !nameInput || !messageInput) {
        console.warn('Elemen komentar tidak ditemukan di halaman.');
        return;
    }

    // Tampilkan komentar real-time
    onValue(commentsRef, (snapshot) => {
        if (!snapshot.exists()) {
            commentsList.innerHTML = '<div class="text-center text-muted py-4">Belum ada komentar. Jadilah yang pertama!</div>';
            return;
        }

        const data = snapshot.val();
        const comments = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        // Urutkan dari terbaru
        comments.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        let html = '';
        comments.forEach(c => {
            const date = c.timestamp ? new Date(c.timestamp).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            }) : '';
            html += `
                <div class="comment-item">
                    <div class="comment-header">
                        <span class="comment-name">${escapeHTML(c.name || 'Anonim')}</span>
                        <span class="comment-date">${date}</span>
                    </div>
                    ${c.email ? `<div class="comment-email">${escapeHTML(c.email)}</div>` : ''}
                    <div class="comment-body">${escapeHTML(c.message || '')}</div>
                </div>
            `;
        });
        commentsList.innerHTML = html || '<div class="text-center text-muted py-4">Belum ada komentar.</div>';
    }, (error) => {
        console.error('Gagal memuat komentar:', error);
        commentsList.innerHTML = '<div class="text-center text-muted py-4">Gagal memuat komentar.</div>';
    });

    // Kirim komentar baru
    submitBtn.addEventListener('click', (e) => {
        e.preventDefault();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const message = messageInput.value.trim();

        if (!name || !message) {
            alert('Nama dan komentar harus diisi.');
            return;
        }

        const newComment = {
            name: name,
            email: email || '',
            message: message,
            timestamp: Date.now()
        };

        push(ref(db, `statistik_web/komentar/${newsId}`), newComment)
            .then(() => {
                nameInput.value = '';
                emailInput.value = '';
                messageInput.value = '';
            })
            .catch(err => {
                console.error('Gagal menyimpan komentar:', err);
                alert('Terjadi kesalahan. Silakan coba lagi.');
            });
    });
}

// Mulai proses
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
    
    // INIT VIDEO SLIDER (jika ada)
    if (typeof initVideoSlider === 'function') initVideoSlider();
});

window.addEventListener('pageshow', (event) => {
    const loader = document.getElementById('pageLoader');
    if (event.persisted && loader) loader.classList.add('hidden');
});

// Optional: menangani klik link dengan loader (jika tidak ingin menggunakan pendekatan lain)
document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        const target = this.getAttribute('target');
        // Abaikan jika link internal dengan hash, javascript, atau target blank
        if (href && !href.startsWith('#') && !href.startsWith('javascript') && target !== '_blank') {
            e.preventDefault();
            const loader = document.getElementById('pageLoader');
            if (loader) loader.classList.remove('hidden');
            setTimeout(() => { window.location.href = href; }, 300);
        }
    });
});