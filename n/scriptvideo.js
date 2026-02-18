// ============================================================
// BAGIAN C: LOGIKA VIDEO SLIDER (FIREBASE INTEGRATED) - LAZY LOAD
// ============================================================

let dbVideoData = [];

// Helper: Ekstrak YouTube ID dari URL (sudah ada, pastikan tetap dipertahankan)
function getYoutubeId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Fungsi untuk memutar video saat thumbnail diklik
window.playVideoFromSlider = function(wrapper) {
    const card = wrapper.closest('.video-card');
    const videoId = card.dataset.videoId;
    if (!videoId) return;

    // Buat iframe YouTube
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

    // Kosongkan wrapper dan masukkan iframe
    wrapper.innerHTML = '';
    wrapper.style.position = 'relative';
    wrapper.style.paddingBottom = '56.25%'; // aspek rasio 16:9
    wrapper.appendChild(iframe);
};

// Fungsi Init Video Slider dengan Thumbnail
function initDbVideoSlider() {
    const track = document.getElementById('videoTrack');
    if (!track) return;

    track.innerHTML = '';

    if (dbVideoData.length === 0) {
        track.innerHTML = '<div style="color:white; padding:20px;">Belum ada video tersedia.</div>';
        return;
    }

    dbVideoData.forEach(video => {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.dataset.videoId = video.id; // simpan ID untuk dipakai nanti

        // Buat thumbnail YouTube
        const thumbUrl = video.id ? `https://img.youtube.com/vi/${video.id}/hqdefault.jpg` : '';

        card.innerHTML = `
            <div class="video-thumbnail-wrapper" onclick="playVideoFromSlider(this)">
                <img src="${thumbUrl}" alt="${video.title}" loading="lazy" style="width:100%; height:100%; object-fit:cover; position:absolute; top:0; left:0;">
                <div class="play-button-overlay" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); z-index:2; transition:transform 0.3s;">
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

    // Simpan ke window agar fungsi global slideVideo bisa akses
    window.firebaseVideoData = dbVideoData;

    // Reset posisi scroll
    const trackEl = document.getElementById('videoTrack');
    if (trackEl) trackEl.style.transform = `translateX(0px)`;
}