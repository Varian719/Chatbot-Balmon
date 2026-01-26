/**
 * ------------------------------------------------------------------
 * FITUR BACA BERITA - VERSI HYBRID (ANTI BISU)
 * Logika: Coba Google Cloud dulu, jika error -> Pakai Suara Lokal (Backup)
 * ------------------------------------------------------------------
 */

 (function() {
    'use strict';

    // 1. KONFIGURASI
    const CONFIG = {
        selectors: [
            '#konten-layanan', '.entry-content', '.post-content', 
            'article', 'main', '.col-md-8', '#main-content', 'body'
        ],
        color: '#006fb0',       
        activeColor: '#dc3545', 
        lang: 'id'
    };

    // 2. STYLE CSS (Tampilan Premium)
    const style = document.createElement('style');
    style.innerHTML = `
        #tts-hybrid-container {
            position: fixed; bottom: 30px; left: 30px; z-index: 999999;
            font-family: sans-serif;
        }
        #tts-btn {
            display: flex; align-items: center; gap: 10px;
            background: ${CONFIG.color}; color: white;
            padding: 12px 20px; border-radius: 50px; border: none;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2); cursor: pointer;
            transition: transform 0.2s;
        }
        #tts-btn:hover { transform: scale(1.05); }
        #tts-btn svg { width: 20px; height: 20px; fill: white; }
        
        .tts-status { font-size: 13px; font-weight: 600; }
        .tts-loading {
            width: 12px; height: 12px; border: 2px solid rgba(255,255,255,0.3);
            border-top: 2px solid white; border-radius: 50%;
            animation: spin 1s linear infinite; display: none;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        /* Notifikasi Error Kecil */
        #tts-toast {
            position: absolute; bottom: 60px; left: 0;
            background: rgba(0,0,0,0.8); color: white;
            padding: 8px 12px; border-radius: 8px; font-size: 12px;
            width: 200px; display: none;
        }
    `;
    document.head.appendChild(style);

    // 3. ELEMENT UI
    const container = document.createElement('div');
    container.id = 'tts-hybrid-container';
    container.innerHTML = `
        <div id="tts-toast"></div>
        <button id="tts-btn">
            <svg viewBox="0 0 24 24"><path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zm-4 0h-2.5l-5 5h-5v7h5l5 5v-17z"/></svg>
            <div class="tts-loading"></div>
            <span class="tts-status">Baca</span>
        </button>
    `;
    document.body.appendChild(container);

    const btn = document.getElementById('tts-btn');
    const statusLabel = container.querySelector('.tts-status');
    const loading = container.querySelector('.tts-loading');
    const toast = document.getElementById('tts-toast');
    const icon = container.querySelector('svg');

    // 4. LOGIC ENGINE
    let audioPlayer = new Audio();
    let synth = window.speechSynthesis;
    let queue = [];
    let index = 0;
    let isPlaying = false;
    let mode = 'CLOUD'; // Mode awal: Cloud

    // Helper: Show Toast
    function showMsg(msg) {
        toast.innerText = msg;
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 3000);
    }

    // A. Ambil Teks
    function getText() {
        let el = null;
        for (let sel of CONFIG.selectors) {
            el = document.querySelector(sel);
            if (el && el.innerText.trim().length > 30) break;
        }
        if (!el) el = document.body;
        // Bersihkan teks
        return el.innerText.replace(/\s+/g, ' ').trim();
    }

    // B. Potong Teks (Wajib < 100 char untuk Cloud)
    function chunkText(text) {
        const regex = /[^.!?]+[.!?]+/g; // Pisah per kalimat
        const raw = text.match(regex) || [text];
        const chunks = [];
        let buf = "";
        raw.forEach(s => {
            if (buf.length + s.length < 90) buf += s + " "; // Batas aman 90 char
            else { chunks.push(buf.trim()); buf = s + " "; }
        });
        if (buf) chunks.push(buf.trim());
        return chunks;
    }

    // C. PLAYER UTAMA
    function playNext() {
        if (index >= queue.length) { stopAll(); return; }

        const textPart = queue[index];
        loading.style.display = 'block';
        icon.style.display = 'none';

        if (mode === 'CLOUD') {
            playCloud(textPart);
        } else {
            playLocal(textPart);
        }
    }

    // C1. METODE CLOUD (Google)
    function playCloud(text) {
        const q = encodeURIComponent(text);
        // URL Magic (client=tw-ob biasanya lebih ampuh dari gtx)
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${q}&tl=${CONFIG.lang}&client=tw-ob`;

        audioPlayer.src = url;
        audioPlayer.playbackRate = 1.0;

        const playPromise = audioPlayer.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // Sukses
                loading.style.display = 'none';
                icon.style.display = 'block';
                statusLabel.innerText = "Membaca...";
            }).catch(error => {
                console.warn("Cloud gagal, switch ke Lokal:", error);
                showMsg("Gagal koneksi Cloud, beralih ke mode Lokal.");
                mode = 'LOCAL'; // Switch mode permanen untuk sesi ini
                playLocal(text); // Retry pakai lokal
            });
        }
    }

    // C2. METODE LOCAL (Browser Bawaan) - Fallback
    function playLocal(text) {
        loading.style.display = 'none';
        icon.style.display = 'block';
        
        // Setup Suara
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = 1.0;

        // Cari suara Google Indo di device jika ada
        const voices = synth.getVoices();
        const indoVoice = voices.find(v => v.lang.includes('id') && v.name.includes('Google')) || voices.find(v => v.lang.includes('id'));
        if (indoVoice) utterance.voice = indoVoice;

        utterance.onend = () => {
            index++;
            playNext();
        };
        
        utterance.onerror = (e) => {
            console.error("Local Error", e);
            index++; // Skip aja kalau error
            playNext();
        };

        statusLabel.innerText = "Mode Lokal...";
        synth.speak(utterance);
    }

    // Handler Event Cloud (Selesai/Error)
    audioPlayer.onended = () => {
        index++;
        playNext();
    };
    audioPlayer.onerror = () => {
        console.warn("Audio Cloud Error (Mungkin 404/403)");
        mode = 'LOCAL'; // Switch ke lokal
        playLocal(queue[index]);
    };

    function stopAll() {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        synth.cancel();
        
        queue = [];
        index = 0;
        isPlaying = false;
        mode = 'CLOUD'; // Reset prioritas ke cloud

        loading.style.display = 'none';
        icon.style.display = 'block';
        statusLabel.innerText = "Baca";
        btn.style.background = CONFIG.color;
    }

    // E. TRIGGER BUTTON
    btn.addEventListener('click', () => {
        if (isPlaying) {
            stopAll();
        } else {
            // Cek file protocol
            if (window.location.protocol === 'file:') {
                alert("PERINGATAN: Fitur Cloud tidak jalan di file://. Harap gunakan Live Server.");
                mode = 'LOCAL'; // Paksa lokal
            }

            const fullText = getText();
            if (!fullText || fullText.length < 5) {
                alert("Teks artikel tidak ditemukan.");
                return;
            }

            queue = chunkText(fullText);
            if (queue.length === 0) return;

            isPlaying = true;
            btn.style.background = CONFIG.activeColor;
            statusLabel.innerText = "Memuat...";
            
            // Fix untuk iOS/Chrome: Harus ada interaksi user
            if (synth.paused) synth.resume(); 
            
            index = 0;
            playNext();
        }
    });
    
    // Fix bug chrome suara tidak muncul (load voices)
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = function() {};
    }

})();