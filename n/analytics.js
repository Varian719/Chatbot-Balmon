// analytics.js
// Mengirim data pengunjung ke Firebase di dalam node statistik_web

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, set, runTransaction } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Konfigurasi Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDUeIg9Zn_xndPXtChO8KufXFp6EMtqBJ0",
    authDomain: "admin-pelayanan-balmon.firebaseapp.com",
    databaseURL: "https://admin-pelayanan-balmon-default-rtdb.firebaseio.com",
    projectId: "admin-pelayanan-balmon",
    appId: "1:1071557110255:web:bff7087da1feacccb7ee1a"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Fungsi untuk membaca cookie
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length);
    }
    return null;
}

// Deteksi perangkat (tanpa library)
function getDeviceInfo() {
    const ua = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua);
    
    let os = 'unknown';
    if (/Windows/i.test(ua)) os = 'Windows';
    else if (/Mac/i.test(ua)) os = 'macOS';
    else if (/Linux/i.test(ua)) os = 'Linux';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/iOS|iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
    
    let browser = 'unknown';
    if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) browser = 'Chrome';
    else if (/Firefox/i.test(ua)) browser = 'Firefox';
    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
    else if (/Edg/i.test(ua)) browser = 'Edge';
    else if (/OPR|Opera/i.test(ua)) browser = 'Opera';
    
    return {
        deviceType: isTablet ? 'tablet' : (isMobile ? 'mobile' : 'desktop'),
        os,
        browser,
        isMobile,
        isTablet,
        isDesktop: !isMobile && !isTablet
    };
}

// Mendapatkan user ID (dari cookie)
function getUserId() {
    return getCookie('user_id') || 'unknown';
}

// Kirim data ke statistik_web
async function sendAnalytics() {
    // Cegah pengiriman ganda dalam satu sesi
    if (sessionStorage.getItem('analytics_sent')) return;

    const userId = getUserId();
    const device = getDeviceInfo();
    const timestamp = Date.now();
    const date = new Date().toISOString();

    const sessionData = {
        userId: userId,
        deviceType: device.deviceType,
        os: device.os,
        browser: device.browser,
        timestamp: timestamp,
        date: date,
        userAgent: navigator.userAgent,
        language: navigator.language,
        screen: `${screen.width}x${screen.height}`,
        referrer: document.referrer || 'direct',
        url: window.location.href
    };

    try {
        // Simpan sesi ke statistik_web/sessions
        const sessionsRef = ref(db, 'statistik_web/sessions');
        const newSessionRef = push(sessionsRef);
        await set(newSessionRef, sessionData);

        // Update counter perangkat (agregasi)
        const deviceCounterRef = ref(db, `statistik_web/perangkat/${device.deviceType}`);
        await runTransaction(deviceCounterRef, (current) => (current || 0) + 1);

        // Tandai sudah terkirim
        sessionStorage.setItem('analytics_sent', 'true');
        console.log('✅ Data session tersimpan di statistik_web');
    } catch (error) {
        console.error('❌ Gagal menyimpan data:', error);
    }
}

// Jalankan setelah halaman dimuat
window.addEventListener('load', () => {
    setTimeout(sendAnalytics, 2000);
});