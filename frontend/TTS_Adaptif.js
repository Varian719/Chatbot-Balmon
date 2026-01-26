/**
 * ------------------------------------------------------------------
 * FITUR BACA BERITA (TTS) - GOOGLE CLOUD FIX
 * Endpoint: translate.googleapis.com (Lebih stabil untuk 'gtx')
 * ------------------------------------------------------------------
 */

 (function() {
    'use strict';

    // 1. KONFIGURASI
    const CONFIG = {
        contentSelectors: [
            '#konten-layanan', '.entry-content', '.post-content', 
            'article', 'main', '.col-md-8', '#main-content', 'body'
        ],
        themeColor: '#006fb0',      
        stopColor: '#dc3545',       
        lang: 'id' 
    };

    // 2. STYLING (UI)
    const style = document.createElement('style');
    style.innerHTML = `
        #tts-floating-btn {
            position: fixed; bottom: 25px; left: 25px; z-index: 99999;
            display: flex; align-items: center; gap: 10px; padding: 12px 20px;
            background-color: ${CONFIG.themeColor}; color: white; border: none;
            border-radius: 50px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            cursor: pointer; font-family: sans-serif; font-size: 14px; font-weight: 600;
            transition: transform 0.2s;
        }
        #tts-floating-btn:hover { transform: scale(1.05); }
        #tts-floating-btn svg { width: 20px; height: 20px; fill: white; }
        .tts-loading {
            border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid #fff;
            border-radius: 50%; width: 14px; height: 14px;
            animation: spin 1s linear infinite; display: none;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    `;
    document.head.appendChild(style);

    // 3. TOMBOL UI
    const iconSpeaker = `<svg viewBox="0 0 24 24"><path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zm-4 0h-2.5l-5 5h-5v7h5l5 5v-17z"/></svg>`;
    const iconStop = `<svg viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>`;
    
    const btn = document.createElement('button');
    btn.id = 'tts-floating-btn';
    btn.innerHTML = `${iconSpeaker} <span>Baca Cloud</span> <div class="tts-loading"></div>`;
    document.body.appendChild(btn);

    // 4. LOGIKA PLAYER
    let audioPlayer = new Audio();
    let audioQueue = [];
    let isPlaying = false;
    let currentQueueIndex = 0;

    function getMainContent() {
        let contentEl = null;
        for (let selector of CONFIG.contentSelectors) {
            const el = document.querySelector(selector);
            if (el && el.innerText.trim().length > 50) { 
                contentEl = el; break;
            }
        }
        if (!contentEl) contentEl = document.body;
        // Bersihkan teks: Hapus baris baru berlebih dan spasi ganda
        return contentEl.innerText.replace(/\s+/g, ' ').trim();
    }

    // Chunking text lebih agresif (Max 100 char) agar Google tidak menolak
    function splitTextToChunks(text) {
        // Regex memisah kalimat berdasarkan titik/tanda tanya/seru
        const regex = /[^.!?]+[.!?]+/g;
        const sentences = text.match(regex) || [text];
        const chunks = [];
        let currentChunk = "";

        sentences.forEach(sentence => {
            if (currentChunk.length + sentence.length < 100) {
                currentChunk += sentence + " ";
            } else {
                chunks.push(currentChunk.trim());
                currentChunk = sentence + " ";
            }
        });
        if (currentChunk) chunks.push(currentChunk.trim());
        return chunks;
    }

    btn.addEventListener('click', () => {
        if (isPlaying) stopAudio();
        else {
            const text = getMainContent();
            if (!text || text.length < 5) return alert("Teks tidak ditemukan.");
            
            // UI Loading
            btn.querySelector('.tts-loading').style.display = 'block';
            
            audioQueue = splitTextToChunks(text);
            currentQueueIndex = 0;
            playNextChunk();
        }
    });

    function playNextChunk() {
        if (currentQueueIndex >= audioQueue.length) {
            stopAudio(true); 
            return;
        }

        const textPart = encodeURIComponent(audioQueue[currentQueueIndex]);
        // MENGGUNAKAN ENDPOINT GOOGLEAPIS (CLIENT=GTX) YANG LEBIH STABIL
        const url = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=${CONFIG.lang}&dt=t&q=${textPart}`;

        audioPlayer.src = url;
        audioPlayer.playbackRate = 1.0;
        
        const playPromise = audioPlayer.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // Sukses Play
                btn.querySelector('.tts-loading').style.display = 'none';
                isPlaying = true;
                btn.style.backgroundColor = CONFIG.stopColor;
                btn.innerHTML = `${iconStop} <span>Berhenti</span>`;
            }).catch(error => {
                console.error("Playback error:", error);
                // Jika error, coba skip ke kalimat berikutnya (jangan stop total)
                currentQueueIndex++;
                playNextChunk();
            });
        }
    }

    audioPlayer.onended = () => {
        currentQueueIndex++;
        playNextChunk();
    };

    audioPlayer.onerror = () => {
        console.warn("Gagal memuat chunk audio, mencoba skip...");
        currentQueueIndex++;
        playNextChunk();
    };

    function stopAudio(finished = false) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        audioQueue = [];
        isPlaying = false;
        
        btn.querySelector('.tts-loading').style.display = 'none';
        btn.style.backgroundColor = CONFIG.themeColor;
        btn.innerHTML = `${iconSpeaker} <span>Baca Cloud</span> <div class="tts-loading"></div>`;
    }

    window.onbeforeunload = () => audioPlayer.pause();

})();