/**
 * ------------------------------------------------------------------
 * FITUR BACA BERITA (TTS) - BALMON SAMARINDA
 * Posisi: KIRI BAWAH
 * ------------------------------------------------------------------
 */

 (function() {
    'use strict';

    // 1. KONFIGURASI
    const CONFIG = {
        contentSelectors: [
            '#konten-layanan',      
            '.entry-content',       
            '.post-content',        
            'article',              
            'main',                 
            '#main-content',
            '.col-md-8'             
        ],
        themeColor: '#006fb0',      
        stopColor: '#dc3545',       
        lang: 'id-ID'               
    };

    if (!('speechSynthesis' in window)) return;

    // 2. STYLING (POSISI DIUBAH KE KIRI)
    const style = document.createElement('style');
    style.innerHTML = `
        #tts-floating-btn {
            position: fixed;
            bottom: 25px;
            left: 25px;            /* <--- UBAH KE KIRI (LEFT) */
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 20px;
            background-color: ${CONFIG.themeColor};
            color: white;
            border: none;
            border-radius: 50px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            cursor: pointer;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        #tts-floating-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }
        #tts-floating-btn svg {
            width: 20px;
            height: 20px;
            fill: white;
        }
        
        /* Mobile Responsiveness */
        @media (max-width: 600px) {
            #tts-floating-btn {
                bottom: 20px;
                left: 15px;        /* <--- KIRI JUGA DI MOBILE */
                padding: 10px 15px;
                font-size: 12px;
            }
            #tts-floating-btn span {
                display: none; 
            }
        }
    `;
    document.head.appendChild(style);

    // 3. IKON SVG
    const iconSpeaker = `<svg viewBox="0 0 24 24"><path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zm-4 0h-2.5l-5 5h-5v7h5l5 5v-17z"/></svg>`;
    const iconStop = `<svg viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>`;

    // 4. ELEMENT UI
    const btn = document.createElement('button');
    btn.id = 'tts-floating-btn';
    btn.innerHTML = `${iconSpeaker} <span>Baca Halaman</span>`;
    document.body.appendChild(btn);

    // 5. LOGIKA
    let isSpeaking = false;
    let synth = window.speechSynthesis;
    let utterance = null;

    function getMainContent() {
        let contentEl = null;
        for (let selector of CONFIG.contentSelectors) {
            const el = document.querySelector(selector);
            if (el && el.innerText.trim().length > 50) { 
                contentEl = el;
                break;
            }
        }
        if (!contentEl) contentEl = document.body;
        return contentEl.innerText;
    }

    btn.addEventListener('click', function() {
        if (isSpeaking) {
            stopSpeaking();
        } else {
            const textToRead = getMainContent();
            if (!textToRead || textToRead.length < 10) {
                alert("Maaf, tidak ditemukan teks artikel pada halaman ini.");
                return;
            }
            startSpeaking(textToRead);
        }
    });

    function startSpeaking(text) {
        synth.cancel();
        utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = CONFIG.lang;
        
        const voices = synth.getVoices();
        const indoVoice = voices.find(v => v.lang.includes('id') && v.name.includes('Google'));
        if (indoVoice) utterance.voice = indoVoice;

        utterance.onend = function() { stopSpeaking(true); };
        utterance.onerror = function() { stopSpeaking(); };

        synth.speak(utterance);
        
        isSpeaking = true;
        btn.style.backgroundColor = CONFIG.stopColor;
        btn.innerHTML = `${iconStop} <span>Berhenti</span>`;
    }

    function stopSpeaking(finished = false) {
        if (!finished) synth.cancel();
        isSpeaking = false;
        btn.style.backgroundColor = CONFIG.themeColor;
        btn.innerHTML = `${iconSpeaker} <span>Baca Halaman</span>`;
    }

    window.addEventListener('beforeunload', function() {
        synth.cancel();
    });

    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = function() {};
    }

})();