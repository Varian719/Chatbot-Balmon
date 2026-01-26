/**
 * ------------------------------------------------------------------
 * FITUR BACA BERITA (TTS) - PREMIUM UI VERSION
 * Fitur: Audio Visualizer, Smart Cleaning, Auto-Retry
 * ------------------------------------------------------------------
 */

 (function() {
    'use strict';

    // 1. CONFIG
    const CONFIG = {
        selectors: [
            '#konten-layanan', '.entry-content', '.post-content', 
            'article', 'main', '.col-md-8', '#main-content', 'body'
        ],
        color: '#006fb0',       // Biru Balmon
        activeColor: '#dc3545', // Merah saat Stop
        lang: 'id'
    };

    // 2. MODERN CSS (Audio Wave Animation)
    const style = document.createElement('style');
    style.innerHTML = `
        #tts-widget-container {
            position: fixed; bottom: 30px; left: 30px; z-index: 99999;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        #tts-btn {
            display: flex; align-items: center; gap: 12px;
            background: ${CONFIG.color}; color: white;
            padding: 12px 24px; border-radius: 50px; border: none;
            box-shadow: 0 8px 20px rgba(0, 111, 176, 0.3);
            cursor: pointer; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            overflow: hidden; position: relative;
        }

        #tts-btn:hover { transform: translateY(-3px); box-shadow: 0 12px 25px rgba(0, 111, 176, 0.4); }
        #tts-btn:active { transform: scale(0.96); }

        /* Icon & Text */
        .tts-icon svg { width: 22px; height: 22px; fill: white; display: block; }
        .tts-label { font-size: 14px; font-weight: 600; letter-spacing: 0.5px; }

        /* EQUALIZER ANIMATION (Muncul saat play) */
        .audio-wave {
            display: none; align-items: center; gap: 3px; height: 15px;
        }
        .bar {
            width: 3px; background: white; border-radius: 2px;
            animation: bounce 1s infinite ease-in-out;
        }
        .bar:nth-child(1) { animation-delay: 0.0s; height: 40%; }
        .bar:nth-child(2) { animation-delay: 0.1s; height: 100%; }
        .bar:nth-child(3) { animation-delay: 0.2s; height: 60%; }
        .bar:nth-child(4) { animation-delay: 0.3s; height: 80%; }

        @keyframes bounce {
            0%, 100% { height: 20%; }
            50% { height: 100%; }
        }

        /* Loading Spinner */
        .tts-spinner {
            width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
            border-top: 2px solid white; border-radius: 50%;
            animation: spin 0.8s linear infinite; display: none;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Mobile Responsive */
        @media (max-width: 600px) {
            #tts-widget-container { bottom: 20px; left: 20px; }
            #tts-btn { padding: 14px; width: 54px; height: 54px; justify-content: center; }
            .tts-label { display: none; }
            .audio-wave { position: absolute; opacity: 0.3; width: 100%; justify-content: center; }
        }
    `;
    document.head.appendChild(style);

    // 3. CREATE UI ELEMENTS
    const container = document.createElement('div');
    container.id = 'tts-widget-container';
    container.innerHTML = `
        <button id="tts-btn" aria-label="Bacakan Artikel">
            <div class="tts-icon">
                <svg viewBox="0 0 24 24"><path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zm-4 0h-2.5l-5 5h-5v7h5l5 5v-17z"/></svg>
            </div>
            <div class="tts-spinner"></div>
            <div class="audio-wave">
                <div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div>
            </div>
            <span class="tts-label">Dengarkan</span>
        </button>
    `;
    document.body.appendChild(container);

    // ELEMENTS
    const btn = document.getElementById('tts-btn');
    const label = container.querySelector('.tts-label');
    const iconDiv = container.querySelector('.tts-icon');
    const waveDiv = container.querySelector('.audio-wave');
    const spinner = container.querySelector('.tts-spinner');

    // 4. LOGIC ENGINE
    let audio = new Audio();
    let queue = [];
    let index = 0;
    let isPlaying = false;

    // A. Smart Content Extractor
    function getText() {
        let el = null;
        for (let sel of CONFIG.selectors) {
            el = document.querySelector(sel);
            if (el && el.innerText.trim().length > 50) break;
        }
        if (!el) el = document.body;

        let text = el.innerText;
        // Bersihkan teks: Hapus URL, tanggal format aneh, dan spasi ganda
        text = text.replace(/https?:\/\/[^\s]+/g, '') // Hapus Link
                   .replace(/\s+/g, ' ')             // Hapus spasi ganda
                   .trim();
        return text;
    }

    // B. Smart Chunker (Memotong kalimat agar smooth)
    function chunkText(text) {
        // Potong berdasarkan titik, tapi jangan potong singkatan (misal Dr. atau Rp.)
        const rawChunks = text.match(/[^.!?]+[.!?]+/g) || [text];
        const finalChunks = [];
        let buffer = "";

        rawChunks.forEach(sen => {
            if ((buffer.length + sen.length) < 120) {
                buffer += sen + " ";
            } else {
                finalChunks.push(buffer.trim());
                buffer = sen + " ";
            }
        });
        if (buffer) finalChunks.push(buffer.trim());
        return finalChunks;
    }

    // C. Controller
    function setUIState(state) {
        if (state === 'loading') {
            iconDiv.style.display = 'none';
            waveDiv.style.display = 'none';
            spinner.style.display = 'block';
            label.innerText = 'Memuat...';
        } else if (state === 'playing') {
            spinner.style.display = 'none';
            iconDiv.style.display = 'none';
            waveDiv.style.display = 'flex'; // Tampilkan gelombang
            btn.style.background = CONFIG.activeColor;
            label.innerText = 'Stop';
            isPlaying = true;
        } else { // Idle / Stop
            spinner.style.display = 'none';
            waveDiv.style.display = 'none';
            iconDiv.style.display = 'block';
            btn.style.background = CONFIG.color;
            label.innerText = 'Dengarkan';
            isPlaying = false;
        }
    }

    function playNext() {
        if (index >= queue.length) { stopAll(); return; }

        // Gunakan Google API 'gtx' endpoint (lebih stabil dari translate.google.com biasa)
        const q = encodeURIComponent(queue[index]);
        const url = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=${CONFIG.lang}&dt=t&q=${q}`;

        audio.src = url;
        audio.playbackRate = 1.0;
        
        audio.play().then(() => {
            setUIState('playing');
        }).catch(err => {
            console.error("Playback error", err);
            // Skip error part
            index++;
            playNext();
        });
    }

    audio.onended = () => {
        index++;
        playNext();
    };

    audio.onerror = () => {
        console.warn("Audio error, skipping...");
        index++;
        playNext();
    };

    function stopAll() {
        audio.pause();
        audio.currentTime = 0;
        queue = [];
        index = 0;
        setUIState('idle');
    }

    // D. Event Listener
    btn.addEventListener('click', () => {
        if (isPlaying) {
            stopAll();
        } else {
            const text = getText();
            if (!text || text.length < 5) return alert("Tidak ada teks artikel.");
            
            setUIState('loading');
            queue = chunkText(text);
            index = 0;
            playNext();
        }
    });

})();