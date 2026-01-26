/**
 * ------------------------------------------------------------------
 * TTS BALMON - FINAL VERSION (ResponsiveVoice API)
 * Status: API Key Terpasang (lGwezgDw)
 * Fitur: Suara Cloud Stabil, UI Modern, Auto-Scroll
 * ------------------------------------------------------------------
 */

 (function() {
    'use strict';

    // 1. KONFIGURASI
    const CONFIG = {
        key: 'lGwezgDw', // Key Anda
        selectors: [
            '#konten-layanan', // Prioritas 1
            '.entry-content', 
            '.post-content', 
            'article', 
            '#main-content',
            'main', 
            'body'
        ],
        color: '#006fb0',        // Biru Utama
        activeColor: '#dc3545',  // Merah saat Stop
        voice: "Indonesian Female" // Suara Wanita Indonesia (Paling Natural)
    };

    // 2. INJECT LIBRARY RESPONSIVEVOICE
    // Kita load script-nya secara otomatis agar HTML Anda tetap bersih
    if (typeof responsiveVoice === 'undefined') {
        const script = document.createElement('script');
        script.src = `https://code.responsivevoice.org/responsivevoice.js?key=${CONFIG.key}`;
        script.onload = () => console.log("Voice Cloud Siap Digunakan.");
        document.head.appendChild(script);
    }

    // 3. STYLING CSS (Tampilan Tombol)
    const style = document.createElement('style');
    style.innerHTML = `
        #tts-widget {
            position: fixed; bottom: 30px; left: 30px; z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        #tts-btn {
            display: flex; align-items: center; gap: 10px;
            background: ${CONFIG.color}; color: white;
            padding: 12px 24px; border-radius: 50px; border: none;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2); cursor: pointer;
            font-weight: 600; font-size: 14px;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        #tts-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.3); }
        #tts-btn svg { width: 20px; height: 20px; fill: white; }
        
        /* Animasi Gelombang Suara */
        .wave { display: none; align-items: flex-end; gap: 3px; height: 16px; }
        .bar { width: 3px; background: white; animation: sound 1s infinite ease-in-out; border-radius: 2px; }
        .bar:nth-child(1) { height: 40%; animation-delay: 0s; }
        .bar:nth-child(2) { height: 100%; animation-delay: 0.1s; }
        .bar:nth-child(3) { height: 60%; animation-delay: 0.2s; }
        @keyframes sound { 0%, 100% { height: 30%; } 50% { height: 100%; } }

        /* Responsive HP */
        @media (max-width: 600px) {
            #tts-widget { bottom: 20px; left: 20px; }
            #tts-btn span { display: none; } /* Sembunyikan teks di HP */
            .wave { display: none !important; } /* Sembunyikan wave di HP */
            #tts-btn { padding: 15px; border-radius: 50%; width: 50px; height: 50px; justify-content: center; }
        }
    `;
    document.head.appendChild(style);

    // 4. MEMBUAT TOMBOL UI
    const container = document.createElement('div');
    container.id = 'tts-widget';
    container.innerHTML = `
        <button id="tts-btn">
            <svg id="tts-icon" viewBox="0 0 24 24"><path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zm-4 0h-2.5l-5 5h-5v7h5l5 5v-17z"/></svg>
            <div class="wave"><div class="bar"></div><div class="bar"></div><div class="bar"></div></div>
            <span id="tts-text">Baca</span>
        </button>
    `;
    document.body.appendChild(container);

    // 5. LOGIKA UTAMA
    const btn = document.getElementById('tts-btn');
    const label = document.getElementById('tts-text');
    const icon = document.getElementById('tts-icon');
    const wave = container.querySelector('.wave');
    let isSpeaking = false;

    // Fungsi Mengambil Teks Bersih
    function getArticleText() {
        let el = null;
        for (let sel of CONFIG.selectors) {
            el = document.querySelector(sel);
            if (el && el.innerText.trim().length > 50) break;
        }
        if (!el) return null;
        
        // Bersihkan teks (Hapus URL, Link, dll)
        let text = el.innerText;
        text = text.replace(/https?:\/\/[^\s]+/g, ' '); // Hapus link
        text = text.replace(/\s+/g, ' ').trim();         // Hapus spasi ganda
        return text;
    }

    // Fungsi Update Tampilan Tombol
    function setUI(state) {
        if (state === 'PLAY') {
            isSpeaking = true;
            btn.style.background = CONFIG.activeColor; // Merah
            label.innerText = "Stop";
            icon.style.display = 'none';
            if(window.innerWidth > 600) wave.style.display = 'flex'; // Tampilkan wave di Desktop
        } else {
            isSpeaking = false;
            btn.style.background = CONFIG.color; // Biru
            label.innerText = "Baca";
            icon.style.display = 'block';
            wave.style.display = 'none';
        }
    }

    // Event Klik
    btn.addEventListener('click', () => {
        // Cek apakah library sudah siap
        if (typeof responsiveVoice === 'undefined') {
            alert("Sedang memuat sistem suara... Coba klik lagi dalam 3 detik.");
            return;
        }

        if (isSpeaking) {
            // Jika sedang bicara -> STOP
            responsiveVoice.cancel();
            setUI('STOP');
        } else {
            // Jika sedang diam -> MULAI
            const text = getArticleText();
            if (!text) {
                alert("Maaf, tidak ditemukan teks artikel di halaman ini.");
                return;
            }

            // Mulai Bicara
            responsiveVoice.speak(text, CONFIG.voice, {
                onstart: () => setUI('PLAY'),
                onend: () => setUI('STOP'),
                onerror: (e) => {
                    console.error(e);
                    setUI('STOP');
                    alert("Gagal memutar suara.");
                }
            });
        }
    });

})();