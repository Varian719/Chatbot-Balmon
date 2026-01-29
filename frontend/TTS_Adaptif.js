/**
 * ------------------------------------------------------------------
 * BALMON ACCESSIBILITY SUITE - SEPARATED CONTROLS
 * Fitur: 
 * 1. TTS (ResponsiveVoice)
 * 2. SLIDER 1: Ukuran Teks (Zoom)
 * 3. SLIDER 2: Kecerahan (Brightness) - BARU
 * 4. SLIDER 3: Kontras (Contrast) - BARU
 * 5. Mode Buta Warna
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
        /* FAB BUTTON */
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

        /* PANEL SIDEBAR */
        #access-panel {
            position: fixed; top: 0; left: -340px;
            width: 300px; height: 100vh;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            box-shadow: 5px 0 30px rgba(0,0,0,0.15);
            z-index: 999998;
            transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex; flex-direction: column;
            border-right: 1px solid rgba(255,255,255,0.5);
            overflow-y: auto; font-family: 'Segoe UI', sans-serif;
        }
        #access-panel.is-open { left: 0; }

        /* HEADER */
        .panel-header {
            padding: 20px 25px; background: #f8f9fa; border-bottom: 1px solid #eee;
            display: flex; justify-content: space-between; align-items: center;
        }
        .panel-title { font-weight: 800; color: #333; font-size: 16px; letter-spacing: 0.5px; }
        .btn-reset { 
            font-size: 11px; color: #dc3545; cursor: pointer; font-weight: bold; 
            border: 1px solid #dc3545; padding: 4px 8px; border-radius: 4px; background: transparent; 
        }
        .btn-reset:hover { background: #dc3545; color: white; }

        /* SECTIONS */
        .panel-section { padding: 20px 25px; border-bottom: 1px solid #eee; }
        .section-label { font-size: 12px; font-weight: 700; color: #888; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; }

        /* TTS BOX */
        .tts-box {
            background: linear-gradient(135deg, ${CONFIG.themeColor}, #005a8e);
            color: white; padding: 15px; border-radius: 12px;
            display: flex; align-items: center; gap: 12px; cursor: pointer;
            box-shadow: 0 4px 10px rgba(0, 111, 176, 0.3); transition: all 0.2s;
        }
        .tts-box:hover { transform: translateY(-2px); }
        .tts-box.active { background: linear-gradient(135deg, #dc3545, #b02a37); }
        .tts-icon svg { fill: white; width: 24px; height: 24px; }
        .tts-text { font-weight: 600; font-size: 14px; }
        .wave { display: none; align-items: flex-end; gap: 3px; height: 15px; margin-left: auto; }
        .bar { width: 3px; background: white; animation: sound 1s infinite ease-in-out; }
        .bar:nth-child(1) { height: 40%; animation-delay: 0s; }
        .bar:nth-child(2) { height: 100%; animation-delay: 0.15s; }
        .bar:nth-child(3) { height: 60%; animation-delay: 0.3s; }
        @keyframes sound { 0%, 100% { height: 30%; } 50% { height: 100%; } }

        /* SLIDERS */
        .control-group { margin-bottom: 18px; }
        .control-header { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: #444; margin-bottom: 8px; }
        
        input[type=range] { width: 100%; -webkit-appearance: none; background: transparent; }
        input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none; height: 16px; width: 16px; border-radius: 50%;
            background: ${CONFIG.themeColor}; cursor: pointer; margin-top: -6px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        input[type=range]::-webkit-slider-runnable-track {
            width: 100%; height: 4px; cursor: pointer; background: #e0e0e0; border-radius: 2px;
        }

        /* COLOR BLIND GRID */
        .cb-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .cb-btn {
            padding: 10px; border: 1px solid #ddd; border-radius: 8px; background: #fff;
            text-align: center; font-size: 12px; font-weight: 600; color: #555; cursor: pointer;
            transition: all 0.2s;
        }
        .cb-btn:hover { border-color: ${CONFIG.themeColor}; background: #f0f8ff; }
        .cb-btn.active { background: ${CONFIG.themeColor}; color: white; border-color: ${CONFIG.themeColor}; }

        /* FILTER HELPERS (Specific adjustments) */
        /* Saturasi tambahan untuk Protanopia/Tritanopia */
        html.filter-protan { /* handled in JS logic */ }
    `;
    document.head.appendChild(style);

    // --- 4. TEMPLATE HTML ---
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
                <div class="section-label">Pembaca Layar</div>
                <div class="tts-box" id="btn-tts">
                    <div class="tts-icon">
                        <svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                    </div>
                    <span class="tts-text" id="txt-tts">Putar Suara</span>
                    <div class="wave" id="tts-wave"><div class="bar"></div><div class="bar"></div><div class="bar"></div></div>
                </div>
            </div>

            <div class="panel-section">
                <div class="section-label">Tampilan Visual</div>
                
                <div class="control-group">
                    <div class="control-header">
                        <span>Ukuran Teks</span>
                        <span id="val-zoom">100%</span>
                    </div>
                    <input type="range" id="range-zoom" min="80" max="150" value="100" step="5">
                </div>

                <div class="control-group">
                    <div class="control-header">
                        <span>Kecerahan</span>
                        <span id="val-bright">100%</span>
                    </div>
                    <input type="range" id="range-bright" min="50" max="150" value="100" step="5">
                </div>

                <div class="control-group">
                    <div class="control-header">
                        <span>Kontras</span>
                        <span id="val-contrast">100%</span>
                    </div>
                    <input type="range" id="range-contrast" min="50" max="200" value="100" step="5">
                </div>
            </div>

            <div class="panel-section">
                <div class="section-label">Mode Warna</div>
                <div class="cb-grid">
                    <div class="cb-btn active" data-filter="none">Normal</div>
                    <div class="cb-btn" data-filter="grayscale">Abu-abu</div>
                    <div class="cb-btn" data-filter="invert">Invert</div>
                    <div class="cb-btn" data-filter="protan">Protanopia</div>
                    <div class="cb-btn" data-filter="tritan">Tritanopia</div>
                    <div class="cb-btn" data-filter="sepia">Sepia</div>
                </div>
            </div>
            
            <div style="margin-top:auto; padding:20px; text-align:center; color:#ccc; font-size:10px;">
                Powered by Balmon
            </div>
        </div>
    `;
    document.body.appendChild(container);

    // --- 5. LOGIC JAVASCRIPT ---
    const fab = document.getElementById('access-fab');
    const panel = document.getElementById('access-panel');
    const htmlEl = document.documentElement;

    // A. Panel Toggle
    fab.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.classList.toggle('is-open');
        if(panel.classList.contains('is-open')){
             fab.innerHTML = '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
             fab.style.background = '#333';
        } else {
             fab.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/></svg>';
             fab.style.background = `linear-gradient(135deg, ${CONFIG.themeColor}, #004e7c)`;
        }
    });
    
    document.addEventListener('click', (e) => {
        if (!panel.contains(e.target) && !fab.contains(e.target) && panel.classList.contains('is-open')) {
            panel.classList.remove('is-open');
            fab.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/></svg>';
            fab.style.background = `linear-gradient(135deg, ${CONFIG.themeColor}, #004e7c)`;
        }
    });

    // B. TTS Logic
    const btnTts = document.getElementById('btn-tts');
    const txtTts = document.getElementById('txt-tts');
    const wave = document.getElementById('tts-wave');
    let isSpeaking = false;

    function getArticleText() {
        let el = null;
        for (let sel of CONFIG.selectors) {
            el = document.querySelector(sel);
            if (el && el.innerText.trim().length > 50) break;
        }
        return el ? el.innerText.replace(/\s+/g, ' ').trim() : null;
    }

    btnTts.addEventListener('click', () => {
        if (typeof responsiveVoice === 'undefined') return alert("Memuat suara...");
        if (isSpeaking) {
            responsiveVoice.cancel();
            isSpeaking = false;
            btnTts.classList.remove('active');
            txtTts.innerText = "Putar Suara";
            wave.style.display = 'none';
        } else {
            const text = getArticleText();
            if (!text) return alert("Tidak ada teks artikel.");
            responsiveVoice.speak(text, CONFIG.voiceName, {
                onstart: () => {
                    isSpeaking = true;
                    btnTts.classList.add('active');
                    txtTts.innerText = "Berhenti";
                    wave.style.display = 'flex';
                },
                onend: () => {
                    isSpeaking = false;
                    btnTts.classList.remove('active');
                    txtTts.innerText = "Putar Suara";
                    wave.style.display = 'none';
                }
            });
        }
    });

    // C. VISUAL FILTERS LOGIC (CORE ENGINE)
    const rangeZoom = document.getElementById('range-zoom');
    const valZoom = document.getElementById('val-zoom');
    
    const rangeBright = document.getElementById('range-bright');
    const valBright = document.getElementById('val-bright');
    
    const rangeContrast = document.getElementById('range-contrast');
    const valContrast = document.getElementById('val-contrast');
    
    const cbButtons = document.querySelectorAll('.cb-btn');
    let currentMode = 'none';

    // 1. Zoom Listener
    rangeZoom.addEventListener('input', (e) => {
        const val = e.target.value;
        valZoom.innerText = val + "%";
        document.body.style.zoom = val + "%";
    });

    // 2. Brightness Listener
    rangeBright.addEventListener('input', (e) => {
        valBright.innerText = e.target.value + "%";
        updateAllFilters();
    });

    // 3. Contrast Listener
    rangeContrast.addEventListener('input', (e) => {
        valContrast.innerText = e.target.value + "%";
        updateAllFilters();
    });

    // 4. Color Blind Mode Listener
    cbButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            cbButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.filter;
            updateAllFilters();
        });
    });

    // --- MASTER FILTER FUNCTION ---
    // Menggabungkan slider Brightness, Contrast, dan Mode Warna menjadi satu
    function updateAllFilters() {
        const b = rangeBright.value;    // Default 100
        const c = rangeContrast.value;  // Default 100
        
        let filterString = `brightness(${b}%) contrast(${c}%) `;

        // Tambahkan logic mode warna
        switch(currentMode) {
            case 'grayscale': filterString += 'grayscale(100%)'; break;
            case 'invert': filterString += 'invert(100%)'; break;
            case 'sepia': filterString += 'sepia(100%)'; break;
            case 'protan': filterString += 'contrast(110%) saturate(130%)'; break; // Helper Protanopia
            case 'tritan': filterString += 'contrast(110%) saturate(80%) sepia(10%)'; break; // Helper Tritanopia
        }

        // Terapkan ke HTML tag agar semua kena efek
        htmlEl.style.filter = filterString;
    }

    // D. RESET LOGIC
    document.getElementById('btn-reset').addEventListener('click', () => {
        // Reset Zoom
        rangeZoom.value = 100; valZoom.innerText = "100%";
        document.body.style.zoom = "100%";

        // Reset Brightness & Contrast
        rangeBright.value = 100; valBright.innerText = "100%";
        rangeContrast.value = 100; valContrast.innerText = "100%";

        // Reset Mode Warna
        currentMode = 'none';
        cbButtons.forEach(b => b.classList.remove('active'));
        document.querySelector('.cb-btn[data-filter="none"]').classList.add('active');

        // Apply Reset
        updateAllFilters();

        // Stop TTS
        if(isSpeaking) {
            responsiveVoice.cancel();
            isSpeaking = false;
            btnTts.classList.remove('active');
            txtTts.innerText = "Putar Suara";
            wave.style.display = 'none';
        }
    });

})();