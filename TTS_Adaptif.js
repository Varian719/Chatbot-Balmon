/**
 * ------------------------------------------------------------------
 * MODUL AKSESIBILITAS BALMON (ALL-IN-ONE)
 * Fitur: 
 * 1. Text-to-Speech Hybrid (Google Cloud + Fallback Browser)
 * 2. Perbesar Teks (Zoom)
 * 3. Mode Kontras Tinggi
 * ------------------------------------------------------------------
 */

(function() {
    'use strict';

    // --- 1. KONFIGURASI ---
    const CONFIG = {
        // Daftar ID/Class di mana teks utama berada (Prioritas dari kiri ke kanan)
        selectors: [
            '#main-content', 
            '#konten-layanan', 
            '.content-wrapper', 
            '.entry-content', 
            'article', 
            'main', 
            '.container-fluid',
            'body'
        ],
        themeColor: '#006fb0',       // Warna Tombol Utama
        activeColor: '#dc3545',      // Warna saat aktif (Stop)
        lang: 'id'                   // Bahasa
    };

    // --- 2. INJECT CSS STYLE ---
    const style = document.createElement('style');
    style.innerHTML = `
        /* Tombol Mengambang (FAB) */
        #access-fab {
            position: fixed; bottom: 30px; left: 30px; z-index: 999999;
            width: 55px; height: 55px; background: ${CONFIG.themeColor};
            border-radius: 50%; box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            border: 2px solid white; outline: none;
        }
        #access-fab:hover { transform: scale(1.1); }
        #access-fab svg { width: 30px; height: 30px; fill: white; }

        /* Panel Menu */
        #access-panel {
            position: fixed; bottom: 100px; left: 30px; z-index: 999999;
            background: white; padding: 15px; border-radius: 15px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
            display: none; flex-direction: column; gap: 8px; width: 220px;
            animation: slideUp 0.3s ease forwards;
            border: 1px solid #eee;
        }
        @keyframes slideUp { 
            from { opacity: 0; transform: translateY(20px); } 
            to { opacity: 1; transform: translateY(0); } 
        }

        /* Item Menu */
        .access-item {
            display: flex; align-items: center; gap: 12px; padding: 10px 12px;
            border-radius: 10px; cursor: pointer; transition: all 0.2s;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 14px; font-weight: 500; color: #444; 
            background: #f8f9fa; border: 1px solid transparent; width: 100%; text-align: left;
        }
        .access-item:hover { background: #e9ecef; }
        .access-item svg { width: 20px; height: 20px; fill: #555; transition: fill 0.2s; }
        
        /* State Aktif */
        .access-active { 
            background: #e8f0fe !important; 
            color: ${CONFIG.themeColor} !important; 
            border-color: ${CONFIG.themeColor} !important;
            font-weight: 700;
        }
        .access-active svg { fill: ${CONFIG.themeColor} !important; }

        /* Loading Spinner Kecil */
        .tts-loading { 
            width: 14px; height: 14px; border: 2px solid #ccc; 
            border-top: 2px solid ${CONFIG.themeColor}; 
            border-radius: 50%; animation: spin 1s linear infinite; 
            margin-left: auto; display: none; 
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Mode Kontras Tinggi */
        .high-contrast-mode { filter: invert(1) hue-rotate(180deg); }
        .high-contrast-mode img, .high-contrast-mode video, .high-contrast-mode iframe { 
            filter: invert(1) hue-rotate(180deg); /* Balikkan gambar agar normal */
        }
        .high-contrast-mode #access-fab, .high-contrast-mode #access-panel {
            filter: invert(1) hue-rotate(180deg); /* UI Aksesibilitas tetap normal */
        }
    `;
    document.head.appendChild(style);

    // --- 3. CREATE UI ELEMENTS ---
    const container = document.createElement('div');
    container.innerHTML = `
        <button id="access-fab" title="Menu Aksesibilitas" aria-label="Buka Menu Aksesibilitas">
            <svg viewBox="0 0 24 24"><path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/></svg>
        </button>

        <div id="access-panel">
            <div style="font-size:11px; color:#888; margin-bottom:5px; font-weight:bold; letter-spacing:0.5px;">ALAT BANTU</div>
            
            <button class="access-item" id="btn-tts">
                <svg viewBox="0 0 24 24"><path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zm-4 0h-2.5l-5 5h-5v7h5l5 5v-17z"/></svg>
                <span id="label-tts">Baca Halaman</span>
                <div class="tts-loading"></div>
            </button>
            
            <button class="access-item" id="btn-zoom">
                <svg viewBox="0 0 24 24"><path d="M2.53 19.65l1.34.56v-9.03l-2.43 5.86c-.41.99.06 2.08 1.09 2.61zm19.5-3.7L17.07 3.98c-.31-.75-1.04-1.21-1.81-1.23-.26 0-.53.04-.79.15L7.1 5.95c-.75.31-1.21 1.03-1.23 1.8-.01.27.04.54.15.8l4.96 11.97c.31.76 1.05 1.22 1.83 1.23.26 0 .52-.05.77-.15l7.36-3.05c.99-.41 1.45-1.54 1.09-2.6zM7.88 8.75c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-2 11c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm4.5-1.5L15.26 7l3.05 7.36-7.93 3.29z"/></svg>
                <span>Perbesar Teks</span>
            </button>

            <button class="access-item" id="btn-contrast">
                <svg viewBox="0 0 24 24"><path d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zm1-17.93c3.94.49 7 3.85 7 7.93s-3.05 7.44-7 7.93V4.07z"/></svg>
                <span>Kontras Tinggi</span>
            </button>
        </div>
    `;
    document.body.appendChild(container);

    // --- 4. LOGIKA UTAMA (ENGINE) ---
    
    // A. SETUP VARIABEL
    const fab = document.getElementById('access-fab');
    const panel = document.getElementById('access-panel');
    const btnTts = document.getElementById('btn-tts');
    const labelTts = document.getElementById('label-tts');
    const spinner = document.querySelector('.tts-loading');
    
    let isPanelOpen = false;
    let audioPlayer = new Audio(); // Player untuk Google Cloud
    let synth = window.speechSynthesis; // Player untuk Lokal
    let ttsQueue = [];
    let ttsIndex = 0;
    let isPlaying = false;
    let ttsMode = 'CLOUD'; // 'CLOUD' (Google) atau 'LOCAL' (Browser)

    // B. FUNGSI UTILITAS TEXT
    function getTextContent() {
        let el = null;
        for (let sel of CONFIG.selectors) {
            el = document.querySelector(sel);
            if (el && el.innerText.trim().length > 50) break; // Cari yg teksnya panjang
        }
        if (!el) el = document.body;
        // Bersihkan teks dari spasi berlebih
        return el.innerText.replace(/\s+/g, ' ').trim();
    }

    function chunkText(text) {
        // Potong teks agar tidak melebihi batas URL Google TTS (~100 char)
        const regex = /[^.!?]+[.!?]+/g;
        const sentences = text.match(regex) || [text];
        const chunks = [];
        let buffer = "";
        
        sentences.forEach(s => {
            if (buffer.length + s.length < 95) {
                buffer += s + " ";
            } else {
                chunks.push(buffer.trim());
                buffer = s + " ";
            }
        });
        if (buffer) chunks.push(buffer.trim());
        return chunks;
    }

    // C. LOGIKA PLAYER (HYBRID)
    function stopAll() {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        synth.cancel();
        
        isPlaying = false;
        ttsQueue = [];
        ttsIndex = 0;
        ttsMode = 'CLOUD'; // Reset prioritas ke Cloud

        // UI Reset
        spinner.style.display = 'none';
        labelTts.innerText = "Baca Halaman";
        btnTts.classList.remove('access-active');
        fab.style.background = CONFIG.themeColor;
    }

    function playNext() {
        if (ttsIndex >= ttsQueue.length) { 
            stopAll(); 
            return; 
        }

        const textPart = ttsQueue[ttsIndex];
        spinner.style.display = 'block';

        if (ttsMode === 'CLOUD') {
            playCloud(textPart);
        } else {
            playLocal(textPart);
        }
    }

    // C1. ENGINE CLOUD (GOOGLE)
    function playCloud(text) {
        const q = encodeURIComponent(text);
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${q}&tl=${CONFIG.lang}&client=tw-ob`;
        
        audioPlayer.src = url;
        const playPromise = audioPlayer.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                spinner.style.display = 'none'; // Audio buffer loaded
            }).catch(err => {
                console.warn("Cloud Error (Network/Block), Switch to Local:", err);
                ttsMode = 'LOCAL'; // Switch permanen di sesi ini
                playLocal(text);   // Retry dengan lokal
            });
        }
    }

    // Handler Cloud Selesai
    audioPlayer.onended = () => {
        ttsIndex++;
        playNext();
    };
    audioPlayer.onerror = () => {
        ttsMode = 'LOCAL';
        playLocal(ttsQueue[ttsIndex]);
    };

    // C2. ENGINE LOCAL (BROWSER BUILT-IN)
    function playLocal(text) {
        spinner.style.display = 'none';
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = 1.0;

        // Coba cari suara Google Indonesia di device
        const voices = synth.getVoices();
        const idVoice = voices.find(v => v.lang.includes('id') && v.name.includes('Google')) || voices.find(v => v.lang.includes('id'));
        if (idVoice) utterance.voice = idVoice;

        utterance.onend = () => {
            ttsIndex++;
            playNext();
        };

        utterance.onerror = () => {
            // Jika lokal pun error, skip aja
            ttsIndex++;
            playNext();
        };

        synth.speak(utterance);
    }

    // --- 5. EVENT LISTENERS ---

    // A. Toggle Menu FAB
    fab.addEventListener('click', () => {
        isPanelOpen = !isPanelOpen;
        panel.style.display = isPanelOpen ? 'flex' : 'none';
        
        // Ganti Ikon FAB (Menu <-> Silang)
        if (isPanelOpen) {
            fab.innerHTML = '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
            fab.style.background = '#444'; // Warna tombol jadi abu saat buka
        } else {
            fab.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/></svg>';
            if(!isPlaying) fab.style.background = CONFIG.themeColor;
        }
    });

    // B. Tombol Baca Berita
    btnTts.addEventListener('click', () => {
        if (isPlaying) {
            stopAll();
        } else {
            const rawText = getTextContent();
            if (rawText.length < 5) return alert("Halaman ini tidak memiliki cukup teks untuk dibaca.");
            
            ttsQueue = chunkText(rawText);
            
            // UI Update
            isPlaying = true;
            ttsIndex = 0;
            btnTts.classList.add('access-active');
            labelTts.innerText = "Berhenti Membaca";
            fab.style.background = CONFIG.activeColor; // Fab jadi merah saat baca
            
            // Fix iOS Audio Context
            if (synth.paused) synth.resume();
            
            playNext();
        }
    });

    // C. Tombol Zoom Teks
    const btnZoom = document.getElementById('btn-zoom');
    let isZoomed = false;
    btnZoom.addEventListener('click', () => {
        isZoomed = !isZoomed;
        if(isZoomed) {
            document.body.style.zoom = "1.2"; // Zoom 120%
            document.body.style.transformOrigin = "top left"; // Fix layout
            btnZoom.classList.add('access-active');
        } else {
            document.body.style.zoom = "1";
            btnZoom.classList.remove('access-active');
        }
    });

    // D. Tombol Kontras Tinggi
    const btnContrast = document.getElementById('btn-contrast');
    btnContrast.addEventListener('click', () => {
        document.documentElement.classList.toggle('high-contrast-mode');
        btnContrast.classList.toggle('access-active');
    });

    // Fix: Load Voices untuk Chrome
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = function() {};
    }

})();