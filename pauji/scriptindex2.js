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
    fadeSections.forEach(section => observer.observe(section));
}
document.addEventListener('DOMContentLoaded', initScrollAnimations);

// PAGE LOADER
window.addEventListener('load', () => {
    const loader = document.getElementById('pageLoader');
    if (loader) loader.classList.add('hidden');
    setTimeout(() => {
        document.querySelectorAll('.fade-in-section').forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                section.classList.add('is-visible');
            }
        });
    }, 100);
    if (typeof initVideoSlider === 'function') initVideoSlider();
});

window.addEventListener('pageshow', (event) => {
    const loader = document.getElementById('pageLoader');
    if (event.persisted && loader) loader.classList.add('hidden');
});

// Link transition
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
window.toggleDropdown = function(clickedCard) {
    clickedCard.classList.toggle('active');
    const isExpanded = clickedCard.classList.contains('active');
    clickedCard.setAttribute('aria-expanded', isExpanded);
};

// CHAT ANIMATION & LAZY LOAD
window.animateChatToggle = function() {
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
};

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

window.scrollToTop = function() { window.scrollTo({ top: 0, behavior: 'smooth' }); };

// MOBILE MENU
window.toggleMobileMenu = function() {
    document.getElementById('hamburgerBtn').classList.toggle('active');
    document.getElementById('mobileNavDropdown').classList.toggle('active');
};
window.closeMobileMenu = function() {
    document.getElementById('hamburgerBtn').classList.remove('active');
    document.getElementById('mobileNavDropdown').classList.remove('active');
    document.querySelectorAll('.mobile-submenu').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.mobile-menu-item.has-submenu').forEach(i => i.classList.remove('active'));
};
window.toggleMobileSubmenu = function(element) {
    const submenu = element.nextElementSibling;
    element.classList.toggle('active');
    if (submenu && submenu.classList.contains('mobile-submenu')) submenu.classList.toggle('active');
};
window.handleMobileMenuItem = function(element, action) {
    if (action === 'beranda') window.location.href = 'index.html';
    else if (action === 'kontak') window.location.href = 'kontak.html';
    else if (action === 'publikasi') window.location.href = 'galeri.html';
    else if (action === 'download') window.location.href = 'arsip.html';
    window.closeMobileMenu();
};
document.addEventListener('click', function(event) {
    const header = document.getElementById('mainHeader');
    const nav = document.getElementById('mobileNavDropdown');
    if (!header.contains(event.target) && nav.classList.contains('active')) window.closeMobileMenu();
});

/* =========================================
   VIDEO SLIDER LAZY LOAD (FALLBACK)
   ========================================= */
window.playVideoFromSlider = function(wrapper, event) {
    if (event) event.stopPropagation();
    const card = wrapper.closest('.video-card');
    if (!card) return;
    const videoId = card.dataset.videoId;
    if (!videoId) return;
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
    wrapper.style.paddingBottom = '56.25%';
    wrapper.appendChild(iframe);
};

var globalVideoData = [
    { id: "MhM-jKwb92g", title: "Mengenal Spektrum Frekuensi Radio", desc: "Video edukasi singkat." },
    { id: "ScMzIvxBSi4", title: "Prosedur Perizinan ISR Online", desc: "Panduan lengkap Izin Stasiun Radio." }
];

let videoScrollPosition = 0;
let videoCardWidth = 300;

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

window.slideVideo = function(direction) {
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
};

/* SEARCH */
const pages = [
    { title: "Beranda", url: "index.html", desc: "Halaman utama Balmon Samarinda" },
    { title: "Izin Konsesi", url: "konsesi.html", desc: "Layanan perizinan frekuensi untuk perusahaan/konsesi." },
    { title: "Izin Maritim (Kapal)", url: "maritim.html", desc: "Pengurusan izin stasiun radio kapal dan laut." },
    { title: "Izin Penyiaran FM", url: "fm.html", desc: "Prosedur perizinan untuk stasiun radio FM/Penyiaran." },
    { title: "Galeri Kegiatan", url: "galeri.html", desc: "Dokumentasi foto dan video kegiatan Balmon." },
    { title: "Arsip & Regulasi", url: "arsip.html", desc: "Download dokumen, SOP, dan regulasi terbaru." },
    { title: "Kontak Kami", url: "kontak.html", desc: "Alamat kantor, email, dan nomor pengaduan." }
];

window.openSearch = function() {
    document.getElementById('searchOverlay').classList.add('active');
    setTimeout(() => document.getElementById('searchInput').focus(), 300);
};
window.closeSearch = function() {
    document.getElementById('searchOverlay').classList.remove('active');
    document.getElementById('searchInput').value = '';
    document.getElementById('searchResults').innerHTML = '';
};
window.performSearch = function() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const resultContainer = document.getElementById('searchResults');
    resultContainer.innerHTML = '';
    if (input.length < 2) return;

    const results = pages.filter(page =>
        page.title.toLowerCase().includes(input) || page.desc.toLowerCase().includes(input)
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
};
document.addEventListener('keydown', e => { if (e.key === "Escape") window.closeSearch(); });