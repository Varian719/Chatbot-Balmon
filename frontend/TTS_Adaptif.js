/**
 * ------------------------------------------------------------------
 * BALMON ACCESSIBILITY SUITE - ULTIMATE PRO + HOVER SPEAK
 * Fitur: 
 * 1. TTS Full Article (Baca Artikel Utama)
 * 2. TTS Cursor Mode (Baca elemen yang ditunjuk mouse) - BARU
 * 3. Visual Slider (Zoom, Brightness, Contrast)
 * 4. Highlight Mode (Sorot Link & Judul)
 * 5. Extended Color Blind Modes
 * ------------------------------------------------------------------
 */

 (function() {
    'use strict';

    // --- 1. KONFIGURASI ---
    const CONFIG = {
        apiKey: 'lGwezgDw', // Key ResponsiveVoice Anda
        voiceName: "Indonesian Female",
        themeColor: '#006fb0',
        selectors: [
            '#konten-layanan', '.entry-content', '.post-content', 
            'article', '#main-content', 'main', 'body'
        ]
    };

    // --- 2. INJECT LIBRARY TTS ---
    if (typeof responsiveVoice === 'undefined') {
        const script = document.createElement('script');
        script.src = `https://code.responsivevoice.org/responsivevoice.js?key=${CONFIG.apiKey}`;
        document.head.appendChild(script);
    }

    // --- 3. CSS STYLING ---
    const style = document.createElement('style');
    style.innerHTML = `
        /* --- 1. FAB BUTTON --- */
        #access-fab {
            position: fixed; bottom: 30px; left: 30px; z-index: 999999;
            width: 55px; height: 55px;
            background: linear-gradient(135deg, ${CONFIG.themeColor}, #004e7c);
            border-radius: 50%;
            box-shadow: 0 4px 15px rgba(0, 111, 176, 0.4);
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; border: 2px solid rgba(255,255,255,0.3);
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            outline: none;
        }
        #access-fab:hover { transform: scale(1.1) rotate(15deg); }
        #access-fab svg { width: 28px; height: 28px; fill: white; }

        /* --- 2. PANEL SIDEBAR --- */
        #access-panel {
            position: fixed; top: 0; left: -360px;
            width: 320px; height: 100vh;
            background: rgba(255, 255, 255, 0.96);
            backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);
            box-shadow: 5px 0 30px rgba(0,0,0,0.15);
            z-index: 999998;
            transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex; flex-direction: column;
            border-right: 1px solid rgba(255,255,255,0.5);
            overflow-y: auto; font-family: 'Segoe UI', sans-serif;
        }
        #access-panel.is-open { left: 0; }

        /* HEADER & SECTION */
        .panel-header {
            padding: 18px 20px; background: #f8f9fa; border-bottom: 1px solid #eee;
            display: flex; justify-content: space-between; align-items: center;
        }
        .panel-title { font-weight: 800; color: #333; font-size: 15px; letter-spacing: 0.5px; }
        .btn-reset { 
            font-size: 10px; color: #dc3545; cursor: pointer; font-weight: bold; 
            border: 1px solid #dc3545; padding: 4px 8px; border-radius: 4px; background: transparent; 
        }
        .btn-reset:hover { background: #dc3545; color: white; }
        .panel-section { padding: 15px 20px; border-bottom: 1px solid #eee; }
        .section-label { font-size: 11px; font-weight: 700; color: #888; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }

        /* --- 3. WIDGETS --- */
        
        /* TOMBOL TOGGLE (Kotak) */
        .access-toggle-btn {
            display: flex; align-items: center; justify-content: space-between;
            background: #fff; border: 1px solid #ddd; padding: 10px 12px; border-radius: 8px; cursor: pointer;
            margin-bottom: 8px; transition: all 0.2s;
        }
        .access-toggle-btn:hover { border-color: ${CONFIG.themeColor}; background: #fdfdfd; }
        
        /* State Active untuk Toggle */
        .access-toggle-btn.active { background: #e3f2fd; border-color: ${CONFIG.themeColor}; }
        .access-toggle-btn.active .toggle-icon { fill: ${CONFIG.themeColor}; }
        .toggle-icon { width: 20px; height: 20px; fill: #555; }
        .toggle-text { font-size: 13px; font-weight: 600; color: #333; flex-grow: 1; margin-left: 10px; }
        .toggle-status { width: 10px; height: 10px; border-radius: 50%; background: #ccc; }
        .access-toggle-btn.active .toggle-status { background: ${CONFIG.themeColor}; box-shadow: 0 0 5px ${CONFIG.themeColor}; }

        /* Khusus Tombol Play Artikel (Merah jika aktif) */
        #btn-tts.active { background: #fee2e2; border-color: #dc3545; }
        #btn-tts.active .toggle-status { background: #dc3545; box-shadow: 0 0 5px #dc3545; }
        #btn-tts.active .toggle-icon { fill: #dc3545; }

        /* Wave Animation Kecil */
        .wave { display: none; align-items: flex-end; gap: 2px; height: 12px; }
        .bar { width: 3px; background: #dc3545; animation: sound 1s infinite ease-in-out; }
        .bar:nth-child(2) { animation-delay: 0.1s; } .bar:nth-child(3) { animation-delay: 0.2s; }
        @keyframes sound { 0%, 100% { height: 30%; } 50% { height: 100%; } }

        /* SLIDERS */
        .control-group { margin-bottom: 12px; }
        .control-header { display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; color: #555; margin-bottom: 5px; }
        input[type=range] { width: 100%; -webkit-appearance: none; background: transparent; }
        input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none; height: 14px; width: 14px; border-radius: 50%;
            background: ${CONFIG.themeColor}; cursor: pointer; margin-top: -5px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        input[type=range]::-webkit-slider-runnable-track {
            width: 100%; height: 4px; cursor: pointer; background: #e0e0e0; border-radius: 2px;
        }

        /* COLOR BLIND GRID */
        .cb-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .cb-btn {
            padding: 8px; border: 1px solid #ddd; border-radius: 6px; background: #fff;
            text-align: center; font-size: 11px; font-weight: 600; color: #555; cursor: pointer;
            transition: all 0.2s;
        }
        .cb-btn:hover { border-color: ${CONFIG.themeColor}; background: #f0f8ff; }
        .cb-btn.active { background: ${CONFIG.themeColor}; color: white; border-color: ${CONFIG.themeColor}; }

        /* --- 4. CSS CLASSES FOR MODES --- */
        
        /* Highlight Mode */
        body.acc-highlight a {
            background-color: #ffeb3b !important; color: #000 !important;
            text-decoration: underline !important; box-shadow: 0 0 0 2px #ffeb3b !important;
        }
        body.acc-highlight h1, body.acc-highlight h2, body.acc-highlight h3 {
            border-left: 5px solid ${CONFIG.themeColor}; padding-left: 10px; background: rgba(0,0,0,0.05);
        }

        /* Hover Speak Visual Cue */
        .speaking-hover {
            outline: 2px solid #f39c12 !important;
            background-color: rgba(243, 156, 18, 0.1) !important;
            cursor: help !important;
        }
    `;
    document.head.appendChild(style);

    // --- 5. HTML STRUCTURE ---
    const container = document.createElement('div');
    container.innerHTML = `
        <button id="access-fab" title="Menu Aksesibilitas">
            <svg viewBox="0 0 24 24"><path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/></svg>
        </button>

        <div id="access-panel">
            <div class="panel-header">
                <span class="panel-title">AKSESIBILITAS</span>
                <button class="btn-reset" id="btn-reset">RESET</button>
            </div>

            <div class="panel-section">
                <div class="section-label">Bantuan Suara</div>
                
                <div class="access-toggle-btn" id="btn-tts">
                    <svg class="toggle-icon" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                    <div class="toggle-text">
                        <span id="txt-tts">Baca Artikel</span>
                        <div class="wave" id="tts-wave"><div class="bar"></div><div class="bar"></div><div class="bar"></div></div>
                    </div>
                    <div class="toggle-status"></div>
                </div>

                <div class="access-toggle-btn" id="btn-cursor">
                    <svg class="toggle-icon" viewBox="0 0 24 24"><path d="M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.03-.24-.03-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z"/></svg>
                    <span class="toggle-text">Suara Kursor</span>
                    <div class="toggle-status"></div>
                </div>
            </div>

            <div class="panel-section">
                <div class="section-label">Alat Bantu Visual</div>
                
                <div class="access-toggle-btn" id="btn-highlight">
                    <svg class="toggle-icon" viewBox="0 0 24 24"><path d="M3 5h2v14H3zm16 0h2v14h-2zm-8 6l-4 4h8l-4-4zm-4-4h8v2H7z"/></svg>
                    <span class="toggle-text">Sorot Link & Judul</span>
                    <div class="toggle-status"></div>
                </div>
                
                <div style="height:10px;"></div>

                <div class="control-group">
                    <div class="control-header"><span>Ukuran Teks</span><span id="val-zoom">100%</span></div>
                    <input type="range" id="range-zoom" min="80" max="150" value="100" step="5">
                </div>
                <div class="control-group">
                    <div class="control-header"><span>Kecerahan</span><span id="val-bright">100%</span></div>
                    <input type="range" id="range-bright" min="50" max="150" value="100" step="5">
                </div>
                <div class="control-group">
                    <div class="control-header"><span>Kontras</span><span id="val-contrast">100%</span></div>
                    <input type="range" id="range-contrast" min="50" max="200" value="100" step="5">
                </div>
            </div>

            <div class="panel-section">
                <div class="section-label">Filter Buta Warna</div>
                <div class="cb-grid">
                    <div class="cb-btn active" data-filter="none">Normal</div>
                    <div class="cb-btn" data-filter="achromatopsia">Achromatopsia</div>
                    <div class="cb-btn" data-filter="protanopia">Protanopia</div>
                    <div class="cb-btn" data-filter="deuteranopia">Deuteranopia</div>
                    <div class="cb-btn" data-filter="tritanopia">Tritanopia</div>
                    <div class="cb-btn" data-filter="invert">Invert</div>
                    <div class="cb-btn" data-filter="sepia">Low Light</div>
                    <div class="cb-btn" data-filter="contrast">High Contrast</div>
                </div>
            </div>
            
            <div style="margin-top:auto; padding:15px; text-align:center; color:#ccc; font-size:10px;">
                Balmon Accessibility
            </div>
        </div>
    `;
    document.body.appendChild(container);

    // --- 6. LOGIC ENGINE ---
    
    // Elements
    const fab = document.getElementById('access-fab');
    const panel = document.getElementById('access-panel');
    const htmlEl = document.documentElement;

    // A. PANEL TOGGLE
    const togglePanel = () => {
        panel.classList.toggle('is-open');
        if(panel.classList.contains('is-open')){
             fab.innerHTML = '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
             fab.style.background = '#333';
        } else {
             fab.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/></svg>';
             fab.style.background = `linear-gradient(135deg, ${CONFIG.themeColor}, #004e7c)`;
        }
    };
    fab.addEventListener('click', (e) => { e.stopPropagation(); togglePanel(); });
    document.addEventListener('click', (e) => {
        if (!panel.contains(e.target) && !fab.contains(e.target) && panel.classList.contains('is-open')) togglePanel();
    });

    // B. TTS LOGIC (BACA ARTIKEL)
    const btnTts = document.getElementById('btn-tts');
    const txtTts = document.getElementById('txt-tts');
    const wave = document.getElementById('tts-wave');
    let isSpeakingArticle = false;

    function getArticleText() {
        let el = null;
        for (let sel of CONFIG.selectors) {
            el = document.querySelector(sel);
            if (el && el.innerText.trim().length > 50) break;
        }
        return el ? el.innerText.replace(/\s+/g, ' ').trim() : null;
    }

    btnTts.addEventListener('click', () => {
        // Matikan cursor mode jika aktif
        if(isCursorMode) { btnCursor.click(); }

        if (typeof responsiveVoice === 'undefined') return alert("Memuat suara...");
        
        if (isSpeakingArticle) {
            responsiveVoice.cancel();
            isSpeakingArticle = false;
            btnTts.classList.remove('active');
            txtTts.innerText = "Baca Artikel";
            wave.style.display = 'none';
        } else {
            const text = getArticleText();
            if (!text) return alert("Tidak ada teks artikel.");
            
            responsiveVoice.speak(text, CONFIG.voiceName, {
                onstart: () => {
                    isSpeakingArticle = true;
                    btnTts.classList.add('active');
                    txtTts.innerText = "Berhenti";
                    wave.style.display = 'flex';
                },
                onend: () => {
                    isSpeakingArticle = false;
                    btnTts.classList.remove('active');
                    txtTts.innerText = "Baca Artikel";
                    wave.style.display = 'none';
                }
            });
        }
    });

    // C. CURSOR HOVER SPEAK LOGIC (BACA KURSOR)
    const btnCursor = document.getElementById('btn-cursor');
    let isCursorMode = false;
    let lastSpeakText = '';

    btnCursor.addEventListener('click', () => {
        // Matikan baca artikel jika aktif
        if(isSpeakingArticle) { btnTts.click(); }

        isCursorMode = !isCursorMode;
        if(isCursorMode) {
            btnCursor.classList.add('active');
            responsiveVoice.speak("Mode kursor aktif. Arahkan ke teks.", CONFIG.voiceName);
        } else {
            btnCursor.classList.remove('active');
            responsiveVoice.cancel();
            // Hapus style hover dari elemen terakhir
            document.querySelectorAll('.speaking-hover').forEach(el => el.classList.remove('speaking-hover'));
        }
    });

    // Event Listener Mouseover untuk Body
    document.body.addEventListener('mouseover', (e) => {
        if (!isCursorMode) return;

        // Daftar tag HTML yang layak dibaca
        const validTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'A', 'LI', 'SPAN', 'BUTTON', 'TD', 'TH', 'BLOCKQUOTE', 'LABEL'];
        let target = e.target;
        
        // Cek apakah elemen valid, punya teks, dan bukan bagian dalam panel ini sendiri (kecuali teks panel)
        // Kita izinkan baca panel agar user tunanetra bisa menavigasi menu ini juga
        if (validTags.includes(target.tagName) && target.innerText.trim().length > 0) {
            
            // Hindari pengulangan cepat di elemen yang sama
            if(lastSpeakText === target.innerText) return;

            // Visual feedback
            document.querySelectorAll('.speaking-hover').forEach(el => el.classList.remove('speaking-hover'));
            target.classList.add('speaking-hover');

            // Speak
            responsiveVoice.cancel(); // Stop suara sebelumnya
            responsiveVoice.speak(target.innerText, CONFIG.voiceName);
            lastSpeakText = target.innerText;
        }
    }, true); // Use capture phase for better performance

    document.body.addEventListener('mouseout', (e) => {
        if(isCursorMode) {
            e.target.classList.remove('speaking-hover');
            lastSpeakText = ''; // Reset agar bisa dibaca ulang jika hover kembali
        }
    });


    // D. HIGHLIGHT MODE LOGIC
    const btnHighlight = document.getElementById('btn-highlight');
    let isHighlight = false;
    btnHighlight.addEventListener('click', () => {
        isHighlight = !isHighlight;
        if(isHighlight) {
            btnHighlight.classList.add('active');
            document.body.classList.add('acc-highlight');
        } else {
            btnHighlight.classList.remove('active');
            document.body.classList.remove('acc-highlight');
        }
    });

    // E. VISUAL SLIDERS & FILTERS
    const rangeZoom = document.getElementById('range-zoom');
    const valZoom = document.getElementById('val-zoom');
    const rangeBright = document.getElementById('range-bright');
    const valBright = document.getElementById('val-bright');
    const rangeContrast = document.getElementById('range-contrast');
    const valContrast = document.getElementById('val-contrast');
    const cbButtons = document.querySelectorAll('.cb-btn');
    let currentMode = 'none';

    rangeZoom.addEventListener('input', (e) => { valZoom.innerText = e.target.value + "%"; document.body.style.zoom = e.target.value + "%"; });
    rangeBright.addEventListener('input', (e) => { valBright.innerText = e.target.value + "%"; updateAllFilters(); });
    rangeContrast.addEventListener('input', (e) => { valContrast.innerText = e.target.value + "%"; updateAllFilters(); });

    cbButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            cbButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.filter;
            updateAllFilters();
        });
    });

    function updateAllFilters() {
        const b = rangeBright.value;
        const c = rangeContrast.value;
        let filters = `brightness(${b}%) contrast(${c}%) `;

        switch(currentMode) {
            case 'achromatopsia': filters += 'grayscale(100%)'; break;
            case 'invert': filters += 'invert(100%)'; break;
            case 'sepia': filters += 'sepia(80%)'; break; 
            case 'protanopia': filters += 'contrast(115%) sepia(20%) hue-rotate(-5deg)'; break; 
            case 'deuteranopia': filters += 'contrast(115%) sepia(15%) hue-rotate(5deg)'; break;
            case 'tritanopia': filters += 'contrast(120%) saturate(80%) sepia(10%)'; break;
            case 'contrast': filters += 'contrast(150%)'; break;
        }
        htmlEl.style.filter = filters;
    }

    // F. RESET ALL
    document.getElementById('btn-reset').addEventListener('click', () => {
        // Reset Sliders
        rangeZoom.value = 100; valZoom.innerText = "100%"; document.body.style.zoom = "100%";
        rangeBright.value = 100; valBright.innerText = "100%";
        rangeContrast.value = 100; valContrast.innerText = "100%";
        
        // Reset Modes
        isHighlight = false; btnHighlight.classList.remove('active'); document.body.classList.remove('acc-highlight');
        
        // Reset Cursor Mode
        isCursorMode = false; btnCursor.classList.remove('active'); document.querySelectorAll('.speaking-hover').forEach(el => el.classList.remove('speaking-hover'));
        
        // Reset Color
        currentMode = 'none'; cbButtons.forEach(b => b.classList.remove('active')); document.querySelector('.cb-btn[data-filter="none"]').classList.add('active');
        
        // Apply & Stop Sound
        updateAllFilters();
        if(isSpeakingArticle || responsiveVoice.isPlaying()) {
            responsiveVoice.cancel();
            isSpeakingArticle = false;
            btnTts.classList.remove('active');
            txtTts.innerText = "Baca Artikel";
            wave.style.display = 'none';
        }
    });

})();