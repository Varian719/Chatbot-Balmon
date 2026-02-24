/**
 * MODULE PENCARIAN (MODULAR)
 * Berisi database halaman dan logika pencarian
 */

// 1. DATABASE HALAMAN (Tambah data baru di sini)
const pages = [
    { title: "Chatbot Layanan", url: "chatbot-balmon.html", desc: "Tanya jawab otomatis seputar layanan Balmon." },
    { title: "Izin Amatir Radio (IAR)", url: "https://iar-ikrap.postel.go.id/", desc: "Daftar ujian IAR, perpanjangan, dan KRAP." },
    { title: "Izin Stasiun Radio (ISR)", url: "https://isr.postel.go.id/", desc: "Layanan e-Licensing spektrum frekuensi." },
    { title: "Sertifikasi REOR", url: "https://sertifikasi.postel.go.id/", desc: "Ujian negara operator radio (REOR/SROP)." },
    { title: "Berita Terkini", url: "berita.html", desc: "Informasi terbaru seputar kegiatan Balmon." },
    { title: "Hubungi Kami (Kontak)", url: "kontak.html", desc: "Alamat kantor, telepon, dan pengaduan gangguan." },
    { title: "Visi Misi", url: "#", desc: "Visi dan misi Balmon Samarinda." },
    { title: "Struktur Organisasi", url: "#", desc: "Susunan pejabat dan organisasi." }
];

// 2. FUNGSI LOGIKA
function openSearch() {
    const overlay = document.getElementById('searchOverlay');
    const input = document.getElementById('searchInput');
    if (overlay) {
        overlay.classList.add('active');
        // Delay sedikit agar transisi CSS selesai sebelum fokus
        setTimeout(() => {
            if(input) input.focus();
        }, 300);
    }
}

function closeSearch() {
    const overlay = document.getElementById('searchOverlay');
    const input = document.getElementById('searchInput');
    const results = document.getElementById('searchResults');

    if (overlay) overlay.classList.remove('active');
    if (input) input.value = ''; // Bersihkan input
    if (results) results.innerHTML = ''; // Bersihkan hasil
}

function performSearch() {
    const input = document.getElementById('searchInput');
    const resultContainer = document.getElementById('searchResults');
    
    if (!input || !resultContainer) return;

    const query = input.value.toLowerCase();
    resultContainer.innerHTML = ''; // Reset hasil sebelumnya

    // Minimal 2 karakter baru mencari
    if (query.length < 2) return;

    // Filter database
    const filtered = pages.filter(page => 
        page.title.toLowerCase().includes(query) || 
        page.desc.toLowerCase().includes(query)
    );

    // Render Hasil
    if (filtered.length > 0) {
        filtered.forEach(item => {
            const a = document.createElement('a');
            a.className = 'result-item'; // Menggunakan class CSS yang sudah ada di HTML
            a.href = item.url;
            // Highlight kata kunci (Opsional)
            a.innerHTML = `<h4 style="margin:0 0 5px; color:#006fb0;">${item.title}</h4><p style="margin:0; font-size:13px; color:#666;">${item.desc}</p>`;
            a.style.display = "block";
            a.style.padding = "15px";
            a.style.borderBottom = "1px solid #eee";
            a.style.textDecoration = "none";
            
            // Efek hover via JS (opsional jika CSS tidak ter-load)
            a.onmouseover = function() { this.style.background = "#f9f9f9"; this.style.paddingLeft = "20px"; }
            a.onmouseout = function() { this.style.background = "transparent"; this.style.paddingLeft = "15px"; }
            
            resultContainer.appendChild(a);
        });
    } else {
        resultContainer.innerHTML = '<div style="text-align:center; color:#999; padding:20px;">Tidak ditemukan hasil yang cocok.</div>';
    }
}

// 3. EVENT LISTENERS (Inisialisasi)
document.addEventListener('DOMContentLoaded', () => {
    // Expose fungsi ke window agar bisa dipanggil via onlick="..." di HTML
    window.openSearch = openSearch;
    window.closeSearch = closeSearch;
    window.performSearch = performSearch;

    // Event Listener untuk input ketik
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', performSearch);
    }

    // Event Listener tombol ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSearch();
    });
});