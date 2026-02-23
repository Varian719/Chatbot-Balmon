import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getDatabase, 
    ref, 
    onValue, 
    push, 
    serverTimestamp,
    set 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

console.log('🔥 Firebase module dimuat');

const firebaseConfig = {
    apiKey: "AIzaSyDUeIg9Zn_xndPXtChO8KufXFp6EMtqBJ0",
    authDomain: "admin-pelayanan-balmon.firebaseapp.com",
    databaseURL: "https://admin-pelayanan-balmon-default-rtdb.firebaseio.com",
    projectId: "admin-pelayanan-balmon",
    appId: "1:1071557110255:web:bff7087da1feacccb7ee1a"
};

let app;
try {
    app = initializeApp(firebaseConfig);
    console.log('✅ Firebase berhasil diinisialisasi');
} catch (error) {
    console.error('❌ Gagal inisialisasi Firebase:', error);
}
const db = getDatabase(app);

// ==================== FUNGSI UTILITAS ====================
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>"]/g, function(match) {
        if (match === '&') return '&amp;';
        if (match === '<') return '&lt;';
        if (match === '>') return '&gt;';
        if (match === '"') return '&quot;';
        return match;
    });
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ==================== BAGIAN GALERI ====================
const container = document.getElementById('galleryContainer');
if (!container) console.warn('⚠️ Elemen #galleryContainer tidak ditemukan');
const galeriRef = ref(db, 'galeri');

onValue(galeriRef, (snapshot) => {
    console.log('📸 Data galeri diterima');
    if (!snapshot.exists()) {
        if(container) container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 50px;">Belum ada konten galeri. Silakan input dari Admin.</div>`;
        return;
    }

    if(container) container.innerHTML = ""; 
    const data = snapshot.val();
    
    let items = Object.entries(data)
        .map(([key, val]) => ({ key, ...val })) 
        .sort((a, b) => b.timestamp - a.timestamp);
    
    items.forEach(item => {
        let iconClass = 'bi-newspaper';
        let cat = (item.category || 'berita').toLowerCase();
        let typeParam = "'image'"; 
        
        if(cat === 'video') {
            iconClass = 'bi-play-circle';
            typeParam = "'video'";
        }
        if(cat === 'infografis') {
            iconClass = 'bi-image';
        }

        const dateObj = new Date(item.date);
        const dateStr = dateObj.toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'});
        
        // Mencegah XSS pada data dari database
        const safeTitle = escapeHTML(item.title);
        const safeDesc = escapeHTML(item.description || ""); 
        
        let tombolBaca = '';
        if (cat === 'news' || cat === 'berita') {
            tombolBaca = `
                <a href="news_detail.html?id=${item.key}" class="btn btn-sm btn-outline-primary mt-3 align-self-start">
                    Baca Selengkapnya <i class="bi bi-arrow-right"></i>
                </a>
            `;
        }
        
        const subcategoryAttr = cat === 'foto' ? ` data-subcategory="${item.subcategory || ''}"` : '';
        
        const html = `
            <div class="gallery-item" data-category="${cat}"${subcategoryAttr} data-video-src="${item.videoUrl || ''}">
                <div class="media-wrapper" onclick="openLightbox(this, ${typeParam})">
                    <img src="${item.imageUrl}" alt="${safeTitle}" loading="lazy">
                    <div class="overlay">
                        <div class="icon-box">
                            <i class="bi ${iconClass}"></i>
                        </div>
                    </div>
                    <div class="media-badge badge-${cat}">
                        ${cat.toUpperCase()}
                    </div>
                </div>
                <div class="item-info">
                    <div class="item-date"><i class="bi bi-calendar-event"></i> ${dateStr}</div>
                    <h3 class="item-title">${safeTitle}</h3>
                    <p class="item-desc">${safeDesc}</p>
                    ${tombolBaca}
                </div>
            </div>
        `;
     
        if(container) container.insertAdjacentHTML('beforeend', html);
    });
    
    const activeBtn = document.querySelector('.cat-card.active');
    if(activeBtn && activeBtn.getAttribute('onclick')) {
        const clickAttr = activeBtn.getAttribute('onclick');
        const catMatch = clickAttr.match(/'([^']+)'/);
        if(catMatch && window.filterGallery) {
            window.filterGallery(catMatch[1], activeBtn);
        }
    }
}, (error) => {
    console.error('❌ Gagal membaca galeri:', error);
});

const activateAutoFilter = () => {
    const params = new URLSearchParams(window.location.search);
    const target = params.get('filter');

    if (target) {
        const targetBtn = document.querySelector(`.cat-card[onclick*="'${target}'"]`);
        if (targetBtn) {
            setTimeout(() => {
                targetBtn.click();
                targetBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }
};

if(container) {
    const observer = new MutationObserver((mutations, obs) => {
        if (container.querySelector('.gallery-item')) {
            activateAutoFilter();
            obs.disconnect();
        }
    });
    observer.observe(container, { childList: true, subtree: true });
}

// ==================== BAGIAN KOMENTAR ====================
const komentarRef = ref(db, 'statistik_web/komentar');
console.log('📍 Referensi komentar:', komentarRef.toString());

// Fungsi memuat komentar
function loadComments() {
    console.log('📝 loadComments() dipanggil');
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) {
        console.warn('⚠️ Elemen #commentsList tidak ditemukan di DOM');
        return;
    }

    onValue(komentarRef, (snapshot) => {
        if (!snapshot.exists()) {
            commentsList.innerHTML = '<div class="empty-comments">Belum ada komentar. Jadilah yang pertama!</div>';
            return;
        }

        const comments = [];
        snapshot.forEach((childSnapshot) => {
            comments.push({ key: childSnapshot.key, ...childSnapshot.val() });
        });

        comments.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        let html = '';
        comments.forEach(comment => {
            // Tangani timestamp null (latency compensation dari Firebase)
            const timeVal = comment.timestamp ? comment.timestamp : Date.now(); 
            const date = new Date(timeVal);
            
            const formattedDate = date.toLocaleDateString('id-ID', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            html += `
                <div class="comment-item">
                    <div class="comment-header">
                        <span class="comment-name">${escapeHTML(comment.name)}</span>
                        <span class="comment-date">${formattedDate}</span>
                    </div>
                    <p class="comment-message">${escapeHTML(comment.message)}</p>
                </div>
            `;
        });

        commentsList.innerHTML = html;
    }, (error) => {
        console.error('❌ Error loading comments:', error);
    });
}

// Fungsi submit komentar
function submitComment(event) {
    if (event) event.preventDefault();
    
    console.log('📤 Memproses submit komentar...');
    const nameInput = document.getElementById('commentName');
    const emailInput = document.getElementById('commentEmail');
    const messageInput = document.getElementById('commentMessage');

    if (!nameInput || !messageInput) {
        alert('Elemen form tidak ditemukan.');
        return;
    }

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    if (!name) {
        alert('Nama harus diisi.');
        return;
    }
    if (!message) {
        alert('Komentar harus diisi.');
        return;
    }
    if (email && !validateEmail(email)) {
        alert('Format email tidak valid.');
        return;
    }

    const newCommentRef = push(komentarRef);
    const commentData = {
        name: name,
        email: email || '',
        message: message,
        timestamp: serverTimestamp()
    };

    console.log('⏳ Menyimpan ke Firebase...');

    // PERBAIKAN KRITIS: Menggunakan fungsi set() dari modular SDK, bukan metode objek
    set(newCommentRef, commentData)
        .then(() => {
            console.log('✅ Komentar berhasil disimpan');
            nameInput.value = '';
            emailInput.value = '';
            messageInput.value = '';
            alert('✅ Komentar berhasil dikirim! Terima kasih.');
        })
        .catch((error) => {
            console.error('❌ Gagal menyimpan komentar:', error);
            alert('❌ Gagal mengirim komentar: ' + error.message);
        });
}

// Pasang event listener setelah DOM siap
function initCommentButton() {
    const submitBtn = document.getElementById('submitCommentBtn');
    if (submitBtn) {
        submitBtn.removeAttribute('onclick');
        submitBtn.addEventListener('click', submitComment);
        console.log('✅ Event listener tombol komentar dipasang');
    } else {
        console.warn('⚠️ Tombol #submitCommentBtn tidak ditemukan.');
    }
}

// Panggil inisialisasi setelah DOM siap
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        loadComments();
        initCommentButton();
    });
} else {
    loadComments();
    initCommentButton();
}