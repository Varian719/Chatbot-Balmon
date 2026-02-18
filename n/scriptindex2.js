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
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    fadeSections.forEach(section => { observer.observe(section); });
}

document.addEventListener('DOMContentLoaded', () => { initScrollAnimations(); });

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
    if(typeof initVideoSlider === 'function') initVideoSlider();
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

// FEATURE CAROUSEL
function toggleDropdown(clickedCard) { 
    clickedCard.classList.toggle('active'); 
    const isExpanded = clickedCard.classList.contains('active');
    clickedCard.setAttribute('aria-expanded', isExpanded);
}

// CHAT ANIMATION & LAZY LOAD
function animateChatToggle() {
    const btn = document.getElementById("toggleBtn");
    const box = document.getElementById("chatBox");
    const iframe = document.getElementById("chatFrame");

    if (!iframe.getAttribute('src')) {
        iframe.setAttribute('src', iframe.getAttribute('data-src'));
    }

    if (btn.classList.contains("active")) {
        btn.classList.remove("active"); 
        btn.setAttribute('aria-expanded', 'false');
        box.classList.remove("active"); 
        box.setAttribute('aria-hidden', 'true');
        return;
    }
    if (btn.classList.contains("loading")) return;
    
    btn.classList.add("loading");
    setTimeout(() => {
        btn.classList.remove("loading"); 
        btn.classList.add("active"); 
        btn.setAttribute('aria-expanded', 'true');
        box.classList.add("active");
        box.setAttribute('aria-hidden', 'false');
    }, 400); 
}

// SCROLL EVENTS
let lastScrollY = window.scrollY;
let ticking = false;
function updateScroll() {
    const scrollY = window.scrollY;
    const chatBtn = document.getElementById('toggleBtn');
    const footer = document.getElementById('mainFooter');
    const header = document.getElementById('mainHeader');
    
    if (scrollY > 50) header.classList.add('header-minimal');
    else header.classList.remove('header-minimal');

    if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        if (footerRect.top < windowHeight) {
            chatBtn.classList.add('on-footer');
        } else {
            chatBtn.classList.remove('on-footer');
        }
    }
    ticking = false;
}

window.addEventListener('scroll', function() {
    lastScrollY = window.scrollY;
    if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
    }
}, { passive: true });

function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

// MOBILE MENU
function toggleMobileMenu() {
    const btn = document.getElementById('hamburgerBtn');
    const menu = document.getElementById('mobileNavDropdown');
    const isExpanded = btn.getAttribute('aria-expanded') === 'true';
    
    btn.classList.toggle('active');
    btn.setAttribute('aria-expanded', !isExpanded);
    menu.classList.toggle('active');
}

function closeMobileMenu() {
    const btn = document.getElementById('hamburgerBtn');
    const menu = document.getElementById('mobileNavDropdown');
    
    btn.classList.remove('active');
    btn.setAttribute('aria-expanded', 'false');
    menu.classList.remove('active');
    document.querySelectorAll('.mobile-submenu').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.mobile-menu-item.has-submenu').forEach(i => i.classList.remove('active'));
}

function toggleMobileSubmenu(element) {
    const submenu = element.nextElementSibling;
    element.classList.toggle('active');
    const isExpanded = element.getAttribute('aria-expanded') === 'true';
    element.setAttribute('aria-expanded', !isExpanded);
    
    if (submenu && submenu.classList.contains('mobile-submenu')) {
        submenu.classList.toggle('active');
    }
}

function handleMobileMenuItem(element, action) {
    if (action === 'beranda') window.location.href = 'index.html';
    else if (action === 'kontak') window.location.href = 'kontak.html';
    else if (action === 'publikasi') window.location.href = 'galeri.html';
    else if (action === 'download') window.location.href = 'arsip.html';
    else if (action === 'profil') window.location.href = 'profil.html';
    closeMobileMenu();
}

document.addEventListener('click', function(event) {
    const header = document.getElementById('mainHeader');
    const nav = document.getElementById('mobileNavDropdown');
    if (!header.contains(event.target) && nav.classList.contains('active')) closeMobileMenu();
});

/* =========================================
    LOGIKA VIDEO SLIDER (LAZY LOAD)
   ========================================= */

// Fungsi untuk memutar video saat thumbnail diklik
window.playVideoFromSlider = function(wrapper, event) {
    if (event) event.stopPropagation(); // Mencegah event bubble ke parent (slider)
    const card = wrapper.closest('.video-card');
    const videoId = card.dataset.videoId;
    if (!videoId) return;

    // Jika sudah ada iframe, jangan buat lagi
    if (wrapper.querySelector('iframe')) return;

    const iframe = document.createElement('iframe');
    iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`);
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('allow', 'autoplay; encrypted-media');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.position = 'absolute';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.border = '0';

    wrapper.innerHTML = '';
    wrapper.style.position = 'relative';
    wrapper.style.paddingBottom = '56.25%'; // 16:9 aspect ratio
    wrapper.appendChild(iframe);
};

// Menggunakan "var" agar bisa diakses global jika Firebase gagal
var globalVideoData = [
    { id: "MhM-jKwb92g", title: "Mengenal Spektrum Frekuensi Radio", desc: "Video edukasi singkat." },
    { id: "ScMzIvxBSi4", title: "Prosedur Perizinan ISR Online", desc: "Panduan lengkap Izin Stasiun Radio." }
];

let videoScrollPosition = 0;
let videoCardWidth = 300;

// Fungsi initVideoSlider untuk fallback (jika Firebase gagal)
function initVideoSlider() {
    const track = document.getElementById('videoTrack');
    if (!track) return;
    track.innerHTML = '';

    globalVideoData.forEach(video => {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.dataset.videoId = video.id;

        const thumbUrl = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;

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
}

// Fungsi Slide Video Global
function slideVideo(direction) {
    const track = document.getElementById('videoTrack');
    const firstCard = track.querySelector('.video-card');
    if (firstCard) {
        videoCardWidth = firstCard.offsetWidth + 20;
    }

    const currentDataLength = (window.firebaseVideoData && window.firebaseVideoData.length > 0) ? window.firebaseVideoData.length : globalVideoData.length;
    const maxScroll = (currentDataLength * videoCardWidth) - track.parentElement.offsetWidth;
    
    if (direction === 'next') {
        videoScrollPosition += videoCardWidth;
        if (videoScrollPosition > maxScroll) videoScrollPosition = maxScroll;
        if (maxScroll < 0) videoScrollPosition = 0;
    } else {
        videoScrollPosition -= videoCardWidth;
        if (videoScrollPosition < 0) videoScrollPosition = 0;
    }

    track.style.transform = `translateX(-${videoScrollPosition}px)`;
}

/* SEARCH FUNCTIONALITY */
const pages = [
    { title: "Beranda", url: "index.html", desc: "Halaman utama Balmon Samarinda" },
    { title: "Izin Konsesi", url: "konsesi.html", desc: "Layanan perizinan frekuensi untuk perusahaan/konsesi." },
    { title: "Izin Maritim (Kapal)", url: "maritim.html", desc: "Pengurusan izin stasiun radio kapal dan laut." },
    { title: "Izin Penyiaran FM", url: "fm.html", desc: "Prosedur perizinan untuk stasiun radio FM/Penyiaran." },
    { title: "Galeri Kegiatan", url: "galeri.html", desc: "Dokumentasi foto dan video kegiatan Balmon." },
    { title: "Arsip & Regulasi", url: "arsip.html", desc: "Download dokumen, SOP, dan regulasi terbaru." },
    { title: "Kontak Kami", url: "kontak.html", desc: "Alamat kantor, email, dan nomor pengaduan." }
];

function openSearch() {
    const overlay = document.getElementById('searchOverlay');
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    setTimeout(() => document.getElementById('searchInput').focus(), 300);
}

function closeSearch() {
    const overlay = document.getElementById('searchOverlay');
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    document.getElementById('searchInput').value = '';
    document.getElementById('searchResults').innerHTML = '';
}

function performSearch() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const resultContainer = document.getElementById('searchResults');
    resultContainer.innerHTML = '';

    if (input.length < 2) return;

    const results = pages.filter(page => 
        page.title.toLowerCase().includes(input) || 
        page.desc.toLowerCase().includes(input)
    );

    if (results.length > 0) {
        results.forEach(page => {
            const item = document.createElement('a');
            item.href = page.url;
            item.className = 'search-item';
            item.innerHTML = `<h4>${page.title}</h4><p>${page.desc}</p>`;
            resultContainer.appendChild(item);
        });
    } else {
        resultContainer.innerHTML = '<div style="text-align:center; color:#888;">Tidak ditemukan hasil yang cocok.</div>';
    }
}

document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") closeSearch();
});