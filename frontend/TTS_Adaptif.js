/**
 * ------------------------------------------------------------------
 * TTS BALMON - FINAL VERSION (Icon Updated)
 * Status: API Key Terpasang (lGwezgDw)
 * Fitur: Suara Cloud Stabil, UI Modern (Glassmorphism), Ikon Speaker+Gelombang
 * Posisi: KANAN BAWAH
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
        voice: "Indonesian Female" // Suara Wanita Indonesia
    };

    // 2. INJECT LIBRARY RESPONSIVEVOICE
    if (typeof responsiveVoice === 'undefined') {
        const script = document.createElement('script');
        script.src = `https://code.responsivevoice.org/responsivevoice.js?key=${CONFIG.key}`;
        script.onload = () => console.log("Voice Cloud Siap Digunakan.");
        document.head.appendChild(script);
    }

    // 3. STYLING CSS (Tampilan Modern / Glassmorphism)
    const style = document.createElement('style');
    style.innerHTML = `
        #tts-widget {
            position: fixed; 
            bottom: 30px;
            left: 30px; /* Posisi Kiri Bawah */
            z-index: 999999;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        #tts-btn {
            display: flex; 
            align-items: center; 
            gap: 12px;
            
            /* Modern Gradient Blue */
            background: linear-gradient(135deg, #006fb0, #004e7c);
            color: white;
            
            padding: 14px 28px; 
            border-radius: 50px; 
            border: 1px solid rgba(255, 255, 255, 0.2); /* Glass border */
            
            /* Soft Colored Shadow */
            box-shadow: 0 10px 25px -5px rgba(0, 111, 176, 0.5);
            backdrop-filter: blur(5px);
            
            cursor: pointer;
            font-weight: 700; 
            font-size: 15px;
            letter-spacing: 0.5px;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            outline: none;
            overflow: hidden;
            position: relative;
        }

        /* Hover Effect */
        #tts-btn:hover { 
            transform: translateY(-4px) scale(1.02); 
            box-shadow: 0 15px 35px -5px rgba(0, 111, 176, 0.6);
        }

        #tts-btn:active {
            transform: translateY(-1px);
        }

        /* SVG Icon styling */
        #tts-btn svg { 
            width: 24px; /* Ukuran sedikit diperbesar agar pas */
            height: 24px; 
            fill: white; 
            filter: drop-shadow(0 2px 3px rgba(0,0,0,0.2));
        }

        /* --- STATE: STOP / PLAYING (RED) --- */
        #tts-btn.is-playing {
            /* Modern Gradient Red */
            background: linear-gradient(135deg, #dc3545, #b02a37);
            box-shadow: 0 10px 25px -5px rgba(220, 53, 69, 0.6);
            padding-right: 32px; /* Sedikit lebih lebar saat aktif */
            animation: pulse-red 2s infinite;
        }

        @keyframes pulse-red {
            0% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(220, 53, 69, 0); }
            100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
        }

        /* Animasi Gelombang Suara (Wave - Visualizer saat bicara) */
        .wave { display: none; align-items: flex-end; gap: 4px; height: 18px; }
        .bar { width: 4px; background: white; animation: sound 1s infinite ease-in-out; border-radius: 4px; box-shadow: 0 0 5px rgba(255,255,255,0.5); }
        .bar:nth-child(1) { height: 40%; animation-delay: 0s; }
        .bar:nth-child(2) { height: 100%; animation-delay: 0.15s; }
        .bar:nth-child(3) { height: 60%; animation-delay: 0.3s; }
        @keyframes sound { 0%, 100% { height: 30%; opacity: 0.8; } 50% { height: 100%; opacity: 1; } }

        /* --- RESPONSIVE HP (ANDROID) --- */
        @media (max-width: 600px) {
            #tts-widget { 
                bottom: 30px; 
                right: 50px; 
            }
            #tts-btn span { display: none; } /* Sembunyikan teks */
            .wave { display: none !important; }
            
            #tts-btn { 
                padding: 0; 
                width: 56px; 
                height: 56px; 
                justify-content: center;
                border-radius: 50%;
            }
            
            #tts-btn.is-playing::after {
                content: '';
                display: block;
                width: 12px;
                height: 12px;
                background: white;
                border-radius: 2px;
                box-shadow: 0 0 10px rgba(255,255,255,0.8);
            }
            #tts-btn.is-playing svg { display: none; } /* Ganti icon dengan kotak stop di HP */
        }
    `;
    document.head.appendChild(style);

    // 4. MEMBUAT TOMBOL UI (DENGAN IKON BARU)
    const container = document.createElement('div');
    container.id = 'tts-widget';
    // Perhatikan bagian <svg> di bawah ini telah diperbarui jalurnya (path)
    container.innerHTML = `
        <button id="tts-btn">
            <svg id="tts-icon" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
            <div class="wave"><div class="bar"></div><div class="bar"></div><div class="bar"></div></div>
            <span id="tts-text">READ</span>
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
        
        let text = el.innerText;
        text = text.replace(/https?:\/\/[^\s]+/g, ' '); 
        text = text.replace(/\s+/g, ' ').trim(); 
        return text;
    }

    // Fungsi Update Tampilan Tombol
    function setUI(state) {
        if (state === 'PLAY') {
            isSpeaking = true;
            btn.classList.add('is-playing'); // Mengaktifkan style Merah & Animasi
            label.innerText = "Berhenti";
            
            // Di Desktop tampilkan Wave visualizer, sembunyikan Icon speaker statis
            if(window.innerWidth > 600) {
                icon.style.display = 'none';
                wave.style.display = 'flex';
            }
        } else {
            isSpeaking = false;
            btn.classList.remove('is-playing'); // Kembali ke style Biru
            label.innerText = "Dengarkan";
            
            icon.style.display = 'block'; // Tampilkan kembali ikon speaker statis
            wave.style.display = 'none';
        }
    }

    // Event Klik
    btn.addEventListener('click', () => {
        if (typeof responsiveVoice === 'undefined') {
            alert("Sedang memuat sistem suara... Tunggu sebentar.");
            return;
        }

        if (isSpeaking) {
            responsiveVoice.cancel();
            setUI('STOP');
        } else {
            const text = getArticleText();
            if (!text) {
                alert("Tidak ditemukan teks artikel untuk dibaca.");
                return;
            }

            responsiveVoice.speak(text, CONFIG.voice, {
                onstart: () => setUI('PLAY'),
                onend: () => setUI('STOP'),
                onerror: (e) => {
                    console.error(e);
                    setUI('STOP');
                }
            });
        }
    });

})();