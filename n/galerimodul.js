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
        
        const descText = item.description || ""; 
        
        let tombolBaca = '';
        if (cat === 'news') {
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
                    <img src="${item.imageUrl}" alt="${item.title}" loading="lazy">
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
                    <h3 class="item-title">${item.title}</h3>
                    <p class="item-desc">${descText}</p>
                    ${tombolBaca}
                </div>
            </div>
        `;
     
        container.insertAdjacentHTML('beforeend', html);
    });
    
    const activeBtn = document.querySelector('.cat-card.active');
    if(activeBtn && activeBtn.getAttribute('onclick')) {
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
        const targetBtn = document.querySelector(`.cat-card[onclick*="'${target}'"]`);
        if (targetBtn) {
            setTimeout(() => {
                targetBtn.click();
                targetBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }
};

const galleryGrid = document.getElementById('galleryContainer');
const observer = new MutationObserver((mutations, obs) => {
    if (galleryGrid.querySelector('.gallery-item')) {
        activateAutoFilter();
        obs.disconnect();
    }
});
observer.observe(galleryGrid, { childList: true, subtree: true });